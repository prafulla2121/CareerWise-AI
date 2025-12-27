# Career 360: AI-Powered Career Guidance Platform

Career 360 is a comprehensive, full-stack web application designed to provide users with a holistic view of their professional journey. It leverages the power of Google's Gemini generative AI to offer personalized career guidance, resume analysis, and automated resume building.

![Career 360 Dashboard](https://images.unsplash.com/photo-1675334758735-5f989ff8237f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzYyNTM4NjE0fDA&ixlib=rb-4.1.0&q=80&w=1080)

---

## ✨ Key Features

- **AI Career Chat**: An interactive chatbot powered by Gemini that provides personalized career advice and answers user questions in real-time.
- **AI Resume Analysis**: Upload a resume (PDF/DOCX) to get an instant Applicant Tracking System (ATS) score, rule-based feedback on missing sections, and a list of identified skills.
- **Career Assessment Test**: A multi-dimensional test covering aptitude, personality, and interests to help users discover career paths that align with their profiles.
- **AI Resume Builder**: A form-based tool that takes user input (experience, education, skills, projects) and uses AI to generate a professional, modern, two-column resume in HTML format.
- **Personalized Dashboard**: A central hub that visualizes a user's profile strength, latest ATS score, assessment results, and skills distribution.
- **Comprehensive AI Report**: Generates a detailed career report by synthesizing insights from the assessment test, resume analysis, and chat history.
- **Secure Authentication**: Supports sign-in with Email/Password, Google, and as a Guest, all managed by Firebase Authentication.

---

## 🚀 Technology Stack

This project is built on a modern, serverless, JavaScript-centric technology stack.

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN/UI](https://ui.shadcn.com/) for a component-based design system.
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) for building production-ready AI flows.
- **Generative Model**: [Google Gemini](https://deepmind.google/technologies/gemini/)
- **Backend & Database**: [Firebase](https://firebase.google.com/)
  - **Authentication**: Manages user sign-up, login, and sessions.
  - **Firestore**: A NoSQL database for storing all user data, including profiles, test results, and analysis reports.
- **Schema Validation**: [Zod](https://zod.dev/) for type-safe data validation in AI flows.
- **Forms**: [React Hook Form](https://react-hook-form.com/) for manageable and performant forms.

---

## 📂 Project Structure

The codebase is organized within the `src/` directory, following Next.js App Router conventions.

```
/src
├── app/                  # Next.js App Router: pages and layouts
│   ├── (auth)/           # Auth-related pages (Login, Signup)
│   ├── (main)/           # Main application pages (Dashboard, Chat, etc.)
│   ├── globals.css       # Global styles and Tailwind directives
│   └── layout.tsx        # Root layout of the application
├── ai/                   # Genkit AI flows and configuration
│   ├── flows/            # Individual AI features (resume analysis, chat, etc.)
│   └── genkit.ts         # Global Genkit setup
├── components/           # Reusable React components
│   ├── dashboard/        # Components specific to the dashboard
│   ├── layout/           # Components for the main app layout (Header, Sidebar)
│   └── ui/               # ShadCN/UI components (Button, Card, etc.)
├── firebase/             # Firebase configuration, custom hooks, and helpers
└── lib/                  # Utility functions and shared libraries
```

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/career-360.git
   cd career-360
   ```

2. **Install NPM packages:**
   ```sh
   npm install
   ```

3. **Set up Firebase:**
   - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - In your project settings, add a new web app.
   - Copy the `firebaseConfig` object provided.
   - Paste the configuration into `src/firebase/config.ts`.
   - In your Firebase project, go to **Authentication** and enable the "Google" and "Email/Password" sign-in methods.
   - Go to **Firestore Database**, create a database in production mode, and set up the security rules by copying the content from the `firestore.rules` file in this project.

4. **Set up Google AI API Key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey) to get your API key.
   - Create a `.env` file in the root of the project and add your API key:
     ```
     GEMINI_API_KEY=your_google_ai_api_key
     ```

5. **Run the development server:**
   ```sh
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
