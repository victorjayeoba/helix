# HELIX - Agentic AI-Powered Medical Records

**Fast documentation. Smarter scheduling. Complete patient care.**

HELIX is an intelligent Electronic Medical Records (EMR) system designed specifically for African clinics, powered by agentic AI to streamline medical workflows, enhance patient care, and reduce administrative burden.

## 🤖 About the Agent

HELIX features an **agentic AI assistant** that acts as an intelligent clinical assistant embedded directly in the EMR system. The agent understands natural language requests from doctors and automatically performs complex actions to retrieve and process medical data.

### Agent Capabilities

The HELIX agent can:

- **📋 Fetch Patient Encounters**: Retrieve complete patient encounter history with clinical notes, vitals, diagnoses, and treatment plans
- **📅 Fetch Patient Appointments**: Access appointment schedules and details for specific patients
- **📊 Fetch Today's Schedule**: Retrieve all appointments scheduled for the current day across all patients
- **✍️ Create/Modify Records**: Use AI to create or modify appointments and encounters through natural language instructions
- **🧠 Intelligent Summarization**: Provide concise, clinician-friendly summaries of patient data, prioritizing encounter details over appointments when summarizing clinical findings

### How the Agent Works

The agent uses a **two-stage planning and execution architecture**:

1. **Planning Stage**: The agent analyzes the doctor's natural language request and determines which action(s) to take using a structured planning system powered by Google's Gemini AI model.

2. **Execution Stage**: The agent executes the planned action(s), retrieves relevant data from the EMR system, and then provides a comprehensive summary tailored for clinical use.

The agent is built using:
- **LangChain**: For orchestrating AI workflows and tool calling
- **Google Gemini 2.5 Flash**: As the underlying AI model for planning and summarization
- **Structured Output Parsing**: Ensures reliable, consistent responses from the AI

### Example Agent Interactions

**Doctor**: *"Show me the last appointment for patient ID 123"*

**Agent Response**: 
- Plans to fetch patient appointments
- Retrieves the most recent appointment data
- Provides a summary with date, time, reason, vitals, and treatment notes

**Doctor**: *"What's on my schedule today?"*

**Agent Response**:
- Plans to fetch today's schedule
- Retrieves all appointments for the current day
- Summarizes the schedule with patient names, times, and appointment reasons

## 🚀 Features

### For Doctors
- **Multi-Tab Workspace**: Excel-like tabbed interface for managing multiple patients and views simultaneously
- **Intelligent Calendar**: Day, Week, and Month views with appointment indicators and smart stacking
- **Patient Management**: Comprehensive patient profiles with appointment history and medical records
- **AI-Powered Assistant**: Natural language interface for querying patient data and managing records
- **Real-Time Scheduling**: View and manage appointments with visual indicators and detailed hover cards

### For Patients
- **Profile Management**: Complete health profile with vitals, allergies, and conditions
- **Appointment Booking**: AI-powered appointment scheduling with natural language
- **AI Chat Support**: Interactive chat with AI assistant for health questions and guidance
- **Appointment History**: View past and upcoming appointments in grid or list format

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with React 19
- **Authentication**: Firebase Auth with Firestore
- **State Management**: Zustand for efficient API data caching
- **AI/ML**: 
  - LangChain for agent orchestration
  - Google Gemini 2.5 Flash for natural language processing
- **UI Components**: Radix UI with Tailwind CSS
- **Calendar**: react-day-picker for date selection
- **API Integration**: RESTful APIs with Next.js API routes for CORS handling

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Google Generative AI (for Agent)
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # External API
   API_KEY=your_external_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
helix/
├── app/
│   ├── (doctor)/          # Doctor dashboard routes
│   │   └── dashboard/      # Main doctor dashboard
│   ├── (patient)/          # Patient routes
│   ├── api/
│   │   ├── assistant/      # AI agent endpoint
│   │   ├── appointments/   # Appointment management
│   │   ├── patients/       # Patient data endpoints
│   │   └── ai/             # AI chat endpoints
│   └── page.tsx            # Landing page
├── components/
│   ├── doctor/             # Doctor dashboard components
│   ├── patient/            # Patient-facing components
│   ├── landing/             # Landing page components
│   └── auth/               # Authentication components
├── contexts/               # React contexts (Auth, Tabs)
├── stores/                 # Zustand stores (Appointments, Patients, Calendar)
├── lib/
│   ├── firebase/           # Firebase configuration
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## 🔐 Authentication

HELIX supports two user types:
- **Doctors**: Full access to dashboard, patient management, and AI assistant
- **Patients**: Access to profile, appointments, and AI chat

Authentication is handled through Firebase Auth with user data stored in Firestore.

## 📡 API Integration

The system integrates with external medical APIs for:
- Appointment management
- Patient records
- Encounter history
- AI-powered EMR operations

API requests are proxied through Next.js API routes to handle CORS and authentication.

## 🎯 Key Components

### AI Agent (`/api/assistant`)
The core agent endpoint that processes natural language requests and returns structured medical data summaries.

### Doctor Dashboard
- **Navigation**: Tabbed interface for Calendar, Finder, and Messages
- **Sidebar**: Calendar view with appointment indicators and patient filtering
- **Schedule**: Interactive calendar with Day/Week/Month views
- **Patient Profiles**: Comprehensive patient information in dedicated tabs

### Patient Portal
- **Profile Management**: Health information and medical history
- **Appointment Booking**: AI-assisted scheduling
- **AI Chat**: Interactive health assistant

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or support, please contact the development team.

## 📞 Support

For demo requests, visit the [demo video](https://www.youtube.com/watch?v=zYk63ZEa52Y).

---

**Built with ❤️ for African healthcare providers**

