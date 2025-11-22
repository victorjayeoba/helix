import { NextResponse } from 'next/server'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { createNotification } from '@/lib/firebase/notifications'

/**
 * Webhook handler for PharmaVigillance API events
 * Receives DrugInteraction events and processes them
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate webhook payload
    if (!body.event) {
      return NextResponse.json(
        { error: 'Missing event field in webhook payload' },
        { status: 400 }
      )
    }

    // Handle DrugInteraction events
    if (body.event === 'DrugInteraction') {
      const {
        severity,
        details,
        resource,
        resource_id,
        destination_url
      } = body

      console.log('🔔 DrugInteraction Webhook Received:', {
        severity,
        details,
        resource,
        resource_id,
        destination_url
      })

      // Create notifications for all doctors
      try {
        if (!db) {
          console.error('❌ Firestore not initialized')
        } else {
          // Get all doctors from Firestore (users collection)
          const usersRef = collection(db, 'users')
          const doctorsQuery = query(usersRef, where('userType', '==', 'doctor'))
          const doctorsSnapshot = await getDocs(doctorsQuery)
          
          if (doctorsSnapshot.empty) {
            console.warn('⚠️ No doctors found in Firestore')
          }

          const severityText = severity || 'Unknown'
          const detailsText = details || 'No additional details available'
          const resourceText = resource || 'Unknown resource'
          
          // Create notification for each doctor
          const notificationPromises = doctorsSnapshot.docs.map(async (doc) => {
            const doctorId = doc.id
            const doctorData = doc.data()
            const doctorName = doctorData.displayName || doctorData.email || 'Doctor'

            await createNotification({
              userId: doctorId,
              type: 'drug-interaction',
              title: `⚠️ Drug Interaction Alert - ${severityText} Severity`,
              message: `Drug interaction detected in ${resourceText} (ID: ${resource_id}). ${detailsText}`,
              read: false,
              metadata: {
                severity,
                details,
                resource,
                resource_id,
                destination_url,
                timestamp: new Date().toISOString()
              }
            })

            console.log(`✅ Notification created for doctor: ${doctorName} (${doctorId})`)
          })

          await Promise.all(notificationPromises)
          console.log(`✅ Created ${doctorsSnapshot.docs.length} drug interaction notifications`)
        }
      } catch (notificationError: any) {
        console.error('❌ Error creating notifications:', notificationError)
        // Don't fail the webhook if notification creation fails
      }

      return NextResponse.json(
        {
          success: true,
          message: 'DrugInteraction event processed',
          event: {
            severity,
            details,
            resource,
            resource_id
          }
        },
        { status: 200 }
      )
    }

    // Handle unknown events
    console.log('⚠️ Unknown webhook event:', body.event)
    return NextResponse.json(
      {
        success: true,
        message: `Event ${body.event} received but not processed`
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

// Allow GET for webhook verification (some services ping the endpoint)
export async function GET() {
  return NextResponse.json(
    { message: 'PharmaVigillance webhook endpoint is active' },
    { status: 200 }
  )
}

