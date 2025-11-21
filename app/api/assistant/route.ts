import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const plannerSchema = z.object({
  action: z.enum([
    'fetch_patient_encounters',
    'fetch_patient_appointments',
    'fetch_today_schedule',
    'ai_emr_create_record'
  ]),
  patient_id: z.number({ coerce: true }),
  limit: z.number({ coerce: true }).optional(),
  payload: z
    .object({
      date: z.string().optional(),
      reason: z.string().optional(),
      summary: z.string().optional(),
      status: z.enum(['active', 'completed']).optional(),
      symptoms: z.string().optional(),
      diagnosis: z.string().optional(),
      note: z.string().optional(),
      follow_up: z.string().optional(),
      medications: z.array(z.string()).optional(),
      vitals: z.record(z.string()).optional(),
      tests: z.array(z.string()).optional(),
      encounter_type: z.string().optional(),
      prompt: z.string().optional()
    })
    .partial()
    .optional(),
  notes: z.string().optional()
})

const plannerParser = StructuredOutputParser.fromZodSchema(plannerSchema)
const formatInstructions = plannerParser.getFormatInstructions()

const plannerPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an EMR planning assistant. Produce ONLY valid JSON that matches this schema:
{format_instructions}

Available actions:
- fetch_patient_encounters: Use this to retrieve patient encounter history.
- fetch_patient_appointments: Use this to retrieve patient appointments.
- fetch_today_schedule: Use this to retrieve every appointment scheduled for today (all patients).
- ai_emr_create_record: Use this to create/modify appointments or encounters via the AI EMR endpoint. Provide the doctor's instructions verbatim in payload.prompt whenever possible so the AI service can parse it. If the doctor specifies structured details (date, vitals, etc.), include them inside the prompt text as well.

If the doctor's request cannot be fulfilled with the actions above, choose the closest option and explain the limitation in the "notes" field.`
  ],
  ['human', '{input}']
])

const summaryPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an AI clinical assistant embedded in an EMR. You will receive a doctor's request and structured EMR data (appointments, encounters, or both).
Provide concise, clinician-friendly answers. Prefer encounter details over appointments when summarizing clinical findings, vitals, or treatment notes.
Always include relevant dates, diagnoses, vitals, medications, tests, and next steps when available. If the data is empty, clearly state that nothing was found.`
  ],
  [
    'human',
    `Context hint:
{context_hint}`
  ],
  [
    'human',
    `Doctor request:
{request}

Source data:
{data}`
  ]
])

function getModel() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable')
  }
  return new ChatGoogleGenerativeAI({
    modelName: 'models/gemini-2.5-flash',
    temperature: 0,
    apiKey
  })
}

async function callInternalApi(path: string, init?: RequestInit) {
  const baseUrl =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000'

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API ${path} failed: ${response.status} ${errorText}`)
  }

  return response.json()
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    if (!message) {
      return NextResponse.json(
        { error: 'Missing doctor message' },
        { status: 400 }
      )
    }

    const model = getModel()
    const plannerChain = plannerPrompt.pipe(model).pipe(plannerParser)
    const summaryChain = summaryPrompt.pipe(model)

    const plan = await plannerChain.invoke({
      input: message,
      format_instructions: formatInstructions
    })

    let retrievedData: unknown = null

    switch (plan.action) {
      case 'fetch_patient_encounters': {
        const limitQuery = plan.limit ? `?limit=${plan.limit}` : ''
        retrievedData = await callInternalApi(
          `/api/patients/${plan.patient_id}/encounters${limitQuery}`
        )
        break
      }
      case 'fetch_patient_appointments': {
        const limit = plan.limit ?? 1
        const limitQuery = `?limit=${limit}`
        const [appointments, encounters] = await Promise.all([
          callInternalApi(`/api/patients/${plan.patient_id}/appointments${limitQuery}`),
          callInternalApi(`/api/patients/${plan.patient_id}/encounters${limitQuery}`)
        ])

        // Prefer encounter information if it exists
        const latestEncounter = encounters?.results?.[0]
        retrievedData = {
          appointments,
          recent_encounters: encounters,
          preferred_context: latestEncounter || appointments?.results?.[0] || null
        }
        break
      }
      case 'fetch_today_schedule': {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const [appointments, encounters] = await Promise.all([
          callInternalApi(`/api/appointments`),
          callInternalApi(`/api/patients/${plan.patient_id}/encounters`)
        ])

        const todayAppointments = (appointments?.results || []).filter((appt: any) => {
          const apptDate = new Date(appt.date)
          return apptDate >= today && apptDate < tomorrow
        })

        retrievedData = {
          schedule_date: today.toISOString().split('T')[0],
          appointments_today: todayAppointments,
          supplemental_encounters: encounters
        }
        break
      }
      case 'ai_emr_create_record': {
        const payload = {
          prompt: buildAiPrompt(message, plan),
          patient: plan.patient_id
        }
        retrievedData = await callInternalApi(`/api/ai-emr`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        break
      }
      default: {
        retrievedData = { message: 'Unsupported action', plan }
      }
    }

    const contextHint = retrievedData && (retrievedData as any).preferred_context
      ? `Use the preferred context below as the primary source of truth for clinical findings:\n${JSON.stringify(
          (retrievedData as any).preferred_context,
          null,
          2
        )}`
      : 'No specific context. Use all provided data.'

    const summary = await summaryChain.invoke({
      context_hint: contextHint,
      request: message,
      data: JSON.stringify(retrievedData, null, 2)
    })

    return NextResponse.json({
      plan,
      data: retrievedData,
      answer: summary?.content ?? summary
    })
  } catch (error: any) {
    console.error('Assistant error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process assistant request' },
      { status: 500 }
    )
  }
}

function buildAiPrompt(originalMessage: string, plan: z.infer<typeof plannerSchema>) {
  const basePrompt =
    plan.payload?.prompt?.trim() ||
    `Create an EMR record for patient ${plan.patient_id} based on this request: ${originalMessage}`

  const structuredDetails: Record<string, unknown> = { ...(plan.payload || {}) }
  delete structuredDetails.prompt
  structuredDetails.patient = plan.patient_id

  const detailEntries = Object.entries(structuredDetails).filter(
    ([, value]) => value !== undefined && value !== null && value !== ''
  )

  if (detailEntries.length === 0) {
    return truncatePrompt(basePrompt)
  }

  const formattedDetails = detailEntries
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${value.join('; ')}`
      }
      if (typeof value === 'object') {
        return `${key}: ${JSON.stringify(value)}`
      }
      return `${key}: ${value}`
    })
    .join('\n')

  const fullPrompt = `${basePrompt}

Important structured details:
${formattedDetails}`

  return truncatePrompt(fullPrompt)
}

function truncatePrompt(input: string, maxLength = 900) {
  if (input.length <= maxLength) {
    return input
  }
  return `${input.slice(0, maxLength - 3)}...`
}


