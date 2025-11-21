# 🔑 How to Add Your Gemini API Key

## QUICK SETUP (3 Minutes):

### **Step 1: Create .env.local file**

Since `.env.local` is in `.gitignore`, you need to create it manually:

**Option A - Copy from example:**
```bash
cp .env.example .env.local
```

**Option B - Create manually:**
Create a new file named `.env.local` in the root directory (same level as `package.json`)

### **Step 2: Add your Gemini API Key**

Open `.env.local` and paste this content:

```bash
# Firebase Configuration (Keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBsZBo_l3g_SuK22sAvd1Nlh6j9_Z1AuBs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=helix-9fce1.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=helix-9fce1
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=helix-9fce1.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1006418972324
NEXT_PUBLIC_FIREBASE_APP_ID=1:1006418972324:web:e468e5843a38a828002031

# PASTE YOUR GEMINI KEY HERE (Replace YOUR_KEY_HERE)
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_KEY_HERE
```

### **Step 3: Get Your Gemini API Key**

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key that looks like: `AIza...`
5. Paste it in `.env.local` replacing `YOUR_KEY_HERE`

### **Step 4: Restart**

```bash
# Stop your dev server (Ctrl+C)
# Then restart:
npm run dev
```

---

## ✅ Verify It's Working:

1. Go to http://localhost:3000
2. Sign in as patient
3. Go to **Chat** tab
4. Send a message like "I have a headache"
5. You should get an intelligent AI response!

**Before Key:** Generic demo responses  
**After Key:** Smart, context-aware medical advice ✨

---

## 📁 Where is .env.local?

```
your-project/
├── .env.example          ← Template (I created this)
├── .env.local            ← CREATE THIS (you need to make it)
├── package.json
├── next.config.mjs
└── ...
```

**IMPORTANT:** `.env.local` is NOT in git (it's in `.gitignore` for security)

---

## 🔐 Security Note:

- ✅ Never commit `.env.local` to git
- ✅ Never share your API keys
- ✅ `.env.local` is already in `.gitignore`
- ✅ Use environment variables on deployment platforms

---

## 🚨 If You Don't Add the Key:

The chat still works! It just uses **demo mode** with predefined helpful responses.

- ✅ Healthcare features work
- ✅ Appointments work
- ✅ Profile works
- ⚠️ Chat responses are generic (not Gemini-powered)

---

## 💡 Pro Tips:

### For Development:
```bash
# Your .env.local file
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyC...  # Your actual key
```

### For Production (Vercel/Netlify):
Add the key in the dashboard:
- Vercel: Settings → Environment Variables
- Netlify: Site settings → Environment variables

---

## ✨ That's It!

Once you add the key and restart:
- ✅ AI chat becomes intelligent
- ✅ Context-aware responses
- ✅ Medical knowledge powered by Gemini

**The rest already works perfectly without any keys!** 🎉

---

## Need Help?

Can't find `.env.local`? It doesn't exist yet! You need to create it. Use this command:

```bash
# Windows (PowerShell)
New-Item .env.local -ItemType File

# Mac/Linux
touch .env.local
```

Then paste the content from Step 2 above.

