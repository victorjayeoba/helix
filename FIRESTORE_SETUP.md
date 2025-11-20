# Firestore Security Rules Setup

## Quick Setup (Development Mode)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **helix-9fce1**
3. Go to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab
5. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // For development - allow authenticated users to read/write (REMOVE IN PRODUCTION)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **Publish**

## Production Rules (More Secure)

For production, use these more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collections as needed with proper permissions
  }
}
```

## Important Notes

- The rules file `firestore.rules` in the project root is for reference
- You need to deploy these rules through Firebase Console or Firebase CLI
- For now, the app will continue to work even if user data can't be fetched (it will just show as null)

