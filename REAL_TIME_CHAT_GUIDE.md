# Real-Time Doctor-Patient Chat System

## Overview

This application now includes a fully functional real-time chat system using Firebase Firestore, allowing patients to chat with doctors in real-time.

## 🎯 Features

### Patient Side
- **AI Doctor Chat**: Instant responses powered by Gemini AI
- **Real Doctor Chat**: Real-time messaging with actual doctors
- Switch seamlessly between AI and human doctor
- Message history persists in Firebase
- Real-time message updates
- Typing indicators and timestamps

### Doctor Side
- **Message Center**: View all patient conversations
- **Real-time Updates**: Messages appear instantly
- **Conversation Management**: 
  - Filter by status (all/waiting/active)
  - Search conversations
  - Assign doctors automatically
  - Close conversations when done
- **Patient Information**: View patient details in chat

## 🏗️ Architecture

### Firebase Collections

```
conversations/
  {conversationId}/
    - patientId: string
    - patientName: string
    - patientEmail: string
    - doctorId: string | null
    - doctorName: string | null
    - status: 'waiting' | 'active' | 'closed'
    - lastMessage: string
    - lastMessageAt: timestamp
    - createdAt: timestamp
    
    messages/
      {messageId}/
        - senderId: string
        - senderType: 'patient' | 'doctor'
        - senderName: string
        - text: string
        - timestamp: timestamp
        - read: boolean
```

## 📁 Key Files

### Firebase Services
- `lib/firebase/chat.ts` - Core chat functionality
  - `createOrGetConversation()` - Initialize chat
  - `sendMessage()` - Send messages
  - `subscribeToMessages()` - Real-time message listener
  - `subscribeToDoctorConversations()` - Doctor conversation list
  - `assignDoctorToConversation()` - Assign doctor to patient
  - `closeConversation()` - End chat session

### Components
- `components/patient/chat.tsx` - Patient chat interface
- `components/doctor/messages.tsx` - Doctor message center

### API Routes
- `app/api/ai/chat/route.ts` - AI doctor responses
- `app/api/chat/conversations/route.ts` - Conversation management

## 🚀 How It Works

### Patient Flow
1. Patient opens chat and selects "Chat with Doctor"
2. System creates or retrieves existing conversation
3. Patient types message and hits send
4. Message is saved to Firestore
5. Real-time listener updates UI instantly
6. Doctor receives notification and can respond

### Doctor Flow
1. Doctor opens Message Center
2. All conversations load automatically
3. Doctor selects a conversation (auto-assigned if waiting)
4. Real-time messages appear as they arrive
5. Doctor responds to patient
6. Patient sees response immediately

## 🔐 Security

### Firestore Rules
```javascript
// Conversations - authenticated users only
match /conversations/{conversationId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null;
  allow update: if request.auth != null;
  
  // Messages subcollection
  match /messages/{messageId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null;
    allow update: if request.auth != null;
  }
}
```

**Production Note**: Implement stricter rules to ensure:
- Patients can only read their own conversations
- Doctors can only read assigned conversations
- Users can only send messages as themselves

## 💡 Usage Examples

### Initialize Patient Chat
```typescript
import { createOrGetConversation, sendMessage, subscribeToMessages } from '@/lib/firebase/chat'

// Create conversation
const conversationId = await createOrGetConversation(
  userId,
  userName,
  userEmail
)

// Listen to messages
const unsubscribe = subscribeToMessages(conversationId, (messages) => {
  console.log('New messages:', messages)
})

// Send message
await sendMessage(
  conversationId,
  userId,
  'patient',
  userName,
  'Hello doctor!'
)
```

### Doctor Message Center
```typescript
import { subscribeToDoctorConversations, assignDoctorToConversation } from '@/lib/firebase/chat'

// Listen to all conversations
const unsubscribe = subscribeToDoctorConversations(doctorId, (conversations) => {
  console.log('Conversations:', conversations)
})

// Assign doctor to conversation
await assignDoctorToConversation(
  conversationId,
  doctorId,
  doctorName,
  doctorEmail
)
```

## 🔧 Configuration

### Prerequisites
1. Firebase project set up
2. Firestore enabled
3. Firebase config in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   ```

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 📊 Status Indicators

- **Waiting** 🔴 - Patient has started chat, waiting for doctor assignment
- **Active** 🟢 - Doctor assigned and conversation ongoing
- **Closed** ⚪ - Conversation completed

## 🎨 UI Features

### Patient Chat
- Clean, modern interface
- Message bubbles with timestamps
- AI vs. Doctor mode toggle
- Auto-scroll to latest message
- Disabled send button when loading

### Doctor Messages
- Split-pane layout
- Conversation list with search and filters
- Patient information display
- Message read receipts
- Close conversation button

## 🐛 Troubleshooting

### Messages Not Appearing
1. Check Firebase console for errors
2. Verify Firestore rules are deployed
3. Check browser console for errors
4. Ensure user is authenticated

### Real-time Updates Not Working
1. Verify Firebase config is correct
2. Check network tab for WebSocket connections
3. Ensure Firestore is enabled in Firebase console

### Permission Denied Errors
1. Deploy updated Firestore rules
2. Verify user authentication
3. Check user has proper permissions

## 🚀 Future Enhancements

- [ ] File/image sharing
- [ ] Video call integration
- [ ] Push notifications
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Unread message counts
- [ ] Doctor availability status
- [ ] Automated responses/chatbots
- [ ] Message search within conversation
- [ ] Export conversation history

## 📝 Notes

- Messages are stored permanently in Firestore
- Real-time updates use Firestore's onSnapshot
- Conversation assignment is automatic when doctor opens chat
- Both AI and human doctor chats are available
- System gracefully handles offline scenarios

## 🎓 Testing

### Test Patient Chat
1. Sign in as patient
2. Go to chat tab
3. Switch to "Chat with Doctor"
4. Send a message
5. Verify message appears

### Test Doctor Response
1. Sign in as doctor (separate browser/incognito)
2. Go to Message Center
3. Select patient conversation
4. Send response
5. Verify patient sees response instantly

## ✅ Implementation Complete

✅ Firebase chat service created
✅ Patient chat component updated
✅ Doctor message center implemented
✅ Real-time messaging working
✅ Conversation management functional
✅ Firestore security rules updated

