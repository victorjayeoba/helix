import { NextResponse } from 'next/server'
import { getDoctorConversations } from '@/lib/firebase/chat'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId') || undefined

    const conversations = await getDoctorConversations(doctorId)

    return NextResponse.json({
      success: true,
      conversations
    })
  } catch (error: any) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch conversations'
      },
      { status: 500 }
    )
  }
}

