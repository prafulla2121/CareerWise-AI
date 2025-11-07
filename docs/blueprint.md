# **App Name**: CareerWise AI

## Core Features:

- AI Career Chat: Gemini-powered chatbot for career guidance with chat history stored in Firestore, enabling context-aware conversations using a tool to enhance guidance with information retrieval.
- Resume Analysis: Upload a resume (PDF/DOCX) to parse and evaluate it using Gemini API, identifying skills and providing an ATS score, stored in Firestore.
- Career Prediction: Career assessment based on a 30-question MCQ, with Firestore for storing scores and Cloud Functions for generating category analytics and career recommendations.
- Resume Builder: Auto-generate resumes from extracted user data using AI, providing templates and suggestions.
- User Progress Dashboard: Dashboard displaying user's test results, resume analysis, and chat history.
- Firebase Admin Controls: Admin panel in Firebase Studio to manage users, chat messages, and system settings (e.g., banned words) stored in Firestore.
- Report Generation: Generate a career report combining test scores, resume analysis, and chat insights, offering personalized guidance.

## Style Guidelines:

- Primary color: Gradient Neon Blue (#4C52FF), evoking a futuristic AI feel. 
- Secondary color: Cyan (#00D2FF), used for highlighting interactive elements.
- Background color: Dark gray (#0D0E12), providing contrast for the UI elements.
- Body and headline font: 'Inter', sans-serif, for a clean, modern, and neutral aesthetic.
- Code font: 'Source Code Pro', monospace, to display code snippets or configurations, as needed.
- Lucide icons for a consistent and modern look.
- Framer Motion animations for a smooth and engaging user experience, including AI typing effects and shimmer loading states.