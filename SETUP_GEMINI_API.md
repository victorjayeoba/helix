# 🤖 Setup Gemini AI for Real Responses

## Why You're Seeing Demo Mode

The AI chat is showing:
```
mode: 'demo'
message: "I'm here to help! While I'm currently in demo mode..."
```

This means the `GEMINI_API_KEY` environment variable is not set.

## 🚀 Quick Fix (2 Minutes)

### Step 1: Get Your Gemini API Key

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Create .env.local File

In your project root (where `package.json` is), create a file named `.env.local`:

**Windows PowerShell:**
```powershell
New-Item .env.local -ItemType File
```

**Mac/Linux:**
```bash
touch .env.local
```

### Step 3: Add the API Key

Open `.env.local` and paste this (replace with your actual key):

```bash
# Firebase Configuration (already working)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsZBo_l3g_SuK22sAvd1Nlh6j9_Z1AuBs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=helix-9fce1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=helix-9fce1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=helix-9fce1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1006418972324
NEXT_PUBLIC_FIREBASE_APP_ID=1:1006418972324:web:e468e5843a38a828002031

# Gemini AI for Patient Chat - ADD YOUR KEY HERE
GEMINI_API_KEY=AIza...YOUR_ACTUAL_KEY_HERE

# Gemini AI for Doctor Assistant - USE SAME KEY
GOOGLE_GENERATIVE_AI_API_KEY=AIza...YOUR_ACTUAL_KEY_HERE

# Dorra EMR API (already configured)
EMR_API_KEY=1OCMWBALSS:ZxfDMeshZyERUySeqUlxW82P45aVg6uJnYPaQstuzBM
EMR_API_BASE_URL=https://hackathon-api.aheadafrica.org/v1
```

### Step 4: Restart Development Server

Stop your server (Ctrl+C) and restart:
```bash
npm run dev
```

## ✅ Test It Works

1. Go to http://localhost:3000
2. Sign in as patient
3. Go to Chat tab
4. Send: "What causes headaches?"
5. Open browser console (F12)
6. You should see:
   ```
   ✅ AI Response data: { mode: 'gemini', message: "..." }
   ```
   ✅ **Success!** `mode: 'gemini'` means it's using real AI

## 📊 Before vs After

### ❌ Before (Demo Mode):
```javascript
{
  mode: 'demo',
  message: "I'm here to help! While I'm currently in demo mode..."
}
```
Generic canned responses

### ✅ After (Gemini Mode):
```javascript
{
  mode: 'gemini',
  message: "Headaches can be caused by various factors including..."
}
```
Intelligent, context-aware medical responses

## 🔐 Security

- ✅ `.env.local` is in `.gitignore` (not committed to git)
- ✅ Server-side only (GEMINI_API_KEY has no `NEXT_PUBLIC_` prefix)
- ✅ Never exposed to client
- ✅ Keep your key private

## 🎯 What Uses Each Key

| Key | Used By | Purpose |
|-----|---------|---------|
| `GEMINI_API_KEY` | Patient AI Chat | Health questions from patients |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Doctor AI Assistant | EMR queries for doctors |
| `EMR_API_KEY` | All EMR operations | Dorra API access |

**Tip**: You can use the same Gemini key for both AI features.

## 💡 Where to Get the Key

**Google AI Studio**: https://aistudio.google.com/app/apikey

1. Sign in
2. Click "Create API Key"
3. Choose project (or create new)
4. Copy the key
5. Paste in `.env.local`

## 🚨 Common Issues

### Issue: Still showing demo mode after adding key

**Fix**:
1. Make sure file is named `.env.local` (not `.env.txt` or `.env`)
2. Make sure it's in the root directory (next to `package.json`)
3. Restart your dev server completely
4. Check console for any startup errors

### Issue: Can't create .env.local file

**Windows**:
- Open notepad
- Paste content
- Save As → `.env.local` (with quotes)
- Save type: "All Files"

**Mac/Linux**:
```bash
nano .env.local
# Paste content, Ctrl+X, Y, Enter
```

### Issue: Key not working

1. Check the key is valid: https://aistudio.google.com/app/apikey
2. Make sure there are no spaces around the `=`
3. Key should look like: `AIza...` (starts with AIza)
4. Try regenerating the key

## ✨ That's It!

Once configured, your AI chat will provide intelligent, context-aware responses powered by Google's Gemini AI! 🎉

## 📝 File Structure

```
your-project/
├── .env.local          ← CREATE THIS (add your keys here)
├── .env.example        ← Template (for reference)
├── .gitignore          ← Already has .env.local (safe)
├── package.json
└── ...
```

## 🎓 Free Gemini API

Good news! The Gemini API has a generous free tier:
- ✅ 60 requests per minute
- ✅ Perfect for development
- ✅ No credit card required

Start here: https://aistudio.google.com/app/apikey


