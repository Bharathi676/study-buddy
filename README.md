# 🎓 Study Buddy — AI Study Partner & Quiz Champion

> An interactive, responsive AI study partner that quizzes users with instant explanations and answers any academic or professional question like ChatGPT—powered by **Google Gemini** and **Firebase**.

---

## 🌟 Key Features

### 1. 🔐 Firebase Authentication & Profiles
- **Authentication**: Email/Password + Google Sign-In with official Firebase Auth client SDK.
- **Interactive Guest / Preview Mode**: 1-click test personas for rapid local testing without credentials (School Class 10, College CS Undergrad, Senior Software Engineer).
- **Personalized Learning Profiles (Firestore)**:
  - **School**: Pick Class (6 to 12) and subject.
  - **College**: Pick course/major and academic year.
  - **Professional**: Specify industry role (e.g. Nurse, Software Engineer, Accountant).

### 2. 🎯 AI Quiz Generator & Interactive Quiz Engine
- **Custom Quiz Setup**: Type any topic, pick question count (5, 10, 15, 20, or custom up to 30), and choose difficulty (**Easy**, **Medium**, **Hard**).
- **Gemini-Tailored MCQs**: Injects user level and profession into Gemini prompts to generate strict JSON with 4 options, verified answer index, concise rationale, and **why every single wrong option is incorrect**.
- **Live Quiz Flow**:
  - Progress bar and live score counter.
  - Active elapsed timer.
  - When **Correct**: Displays `Correct ✅` with a concise explanation.
  - When **Wrong**: First states `Not quite ❌`, clearly explains **why the selected answer was wrong**, and then highlights the correct answer with full justification.
  - Keyboard accessible (keys `1-4` / `A-D` to choose, `Enter` for next).
  - Always-visible **"End quiz"** button with a confirmation modal; calculates scores for questions answered so far.

### 3. 🏆 Animated Score Card & Mistake Review
- **Animated SVG Score Ring**: Smooth gauge displaying percentage and `X / Total`.
- **Celebratory Confetti**: High scores (≥70%) trigger colorful confetti physics.
- **Metric Breakdown**: Correct, Wrong, Skipped, and Time Taken with an encouraging performance message.
- **Question Result Dot Chart**: Interactive color-coded map (green, red, gray) of all questions.
- **Mistake Review List**: Expandable review showing exactly what was chosen, why it failed, and the right answer.
- **Direct Bridge to Chat**: **"Ask Buddy about my mistakes"** preloads all wrong questions into Ask Buddy for interactive coaching!
- **Options**: "Retry same quiz", "New quiz", "Finish", and "Log out".

### 4. 💬 Ask Buddy (ChatGPT-Style Streaming Tutor)
- **Free-Form Chat**: Ask any academic or technical question across any subject.
- **Persona Adapted**: Explanations adapt automatically (intuitive analogies for school, academic proofs for college, industry architectural trade-offs for professionals).
- **Markdown & Code Support**: Full markdown rendering with lists, tables, blockquotes, code blocks, and 1-click copy.
- **Live Real-time Streaming**: SSE (Server-Sent Events) backend streaming.
- **Safety**: Gentle and polite redirection away from harmful or unsafe queries.

### 5. 🎨 UI & Aesthetics
- **Thinking Theme**: Vibrant gradients (purple `#7c3aed`, teal `#06b6d4`, orange `#f59e0b`), soft glassmorphic cards, and subtle glow.
- **Animated Mascot "Buddy"**: Expressive SVG lightbulb-brain mascot with **idle**, **thinking**, **celebrating**, and **oops** states.
- **Dark & Light Mode**: Persistent theme toggle respecting OS preferences.
- **Fully Responsive**: Mobile-first single column with min 44px tap targets; desktop 2-column layout with fixed navigation sidebar.

---

## 🛠️ Tech Stack & Architecture

```
study-buddy/
├── client/              # React 19 + Vite Frontend
│   ├── src/
│   │   ├── components/  # MascotBuddy, AuthScreen, ProfileSetup, HomeScreen,
│   │   │                # QuizSetup, QuizScreen, ScoreCard, AskBuddy, AppLayout
│   │   ├── context/     # AuthContext (Firebase + Demo), ThemeContext (Dark/Light)
│   │   ├── firebase.js  # Firebase Auth & Firestore client SDK
│   │   ├── index.css    # Modern CSS design tokens, animations, responsive layout
│   │   └── App.jsx      # Navigation state coordinator
│   └── vite.config.js   # Proxies /api to backend port 5000
│
├── server/              # Express Backend (Zero browser exposure of API keys)
│   ├── server.js        # Gemini API quiz generation & SSE chat streaming
│   └── package.json
│
├── .env.example         # Template with GEMINI_API_KEY and Firebase keys
├── .gitignore           # Ignores .env and node_modules
└── package.json         # Monorepo runner with concurrently
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Configure Environment Variables
From the `study-buddy` project root, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
In PowerShell, use `Copy-Item .env.example .env` instead.

Open the new root `.env` file and replace the Gemini placeholder with your key from [Google AI Studio](https://aistudio.google.com/app/apikey):
```env
# 1. Google Gemini API Key
# Get a free key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_key_here

# Backend port (default 5000)
PORT=5000

# 2. Firebase Configuration (Optional for demo/preview, required for live Firebase Auth & Firestore sync)
# Get from Firebase Console -> Project Settings -> General -> Your apps -> Web app
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

`GEMINI_API_KEY` is used by the backend. Keep it in the project-root `.env` or `server/.env`, never in `client/.env` or frontend code. If both files exist, `server/.env` takes precedence. The `.env` files are ignored by Git; restart the server with `npm run dev` after changing the key.

> 💡 **Built-in Demo Fallback**: If you run without a `GEMINI_API_KEY` or Firebase keys, Study Buddy automatically operates in a full educational demonstration mode with intelligent offline quiz generation, streaming responses, and local guest persistence!

### 3. Run the Development Servers
In the `study-buddy` root directory:
```bash
npm run dev
```

This concurrently starts:
- **Express Backend**: `http://localhost:5000`
- **Vite React Frontend**: `http://localhost:5173`

Open your browser to:
👉 **`http://localhost:5173`**

---

## 🧪 Testing Guide (Phase by Phase)

1. **Phase 1: Auth & Profile**
   - Click one of the 1-click guest personas (e.g., **"School"**, **"College"**, or **"Professional"**) or sign up with email/password.
   - Test changing your profile in **"My Profile"** -> toggle between School (Class 6-12), College, and Professional.

2. **Phase 2: Quiz Setup & Flow**
   - Head to **"Take a Quiz"**.
   - Pick a suggested topic (e.g. *Photosynthesis*, *Data Structures*, or *System Architecture*) or type your own.
   - Choose MCQ count (5, 10, or custom) and difficulty.
   - Answer questions: notice the live score, progress bar, and immediate rationale explaining **why wrong options are wrong**.
   - Test the **"End Quiz"** button to confirm early exit.

3. **Phase 3: Score Card**
   - Watch the animated score ring and celebratory confetti (≥70%).
   - Inspect the results dot chart and expand wrong answers to review explanations.
   - Click **"Ask Buddy about my mistakes"** to transition seamlessly to chat!

4. **Phase 4: Ask Buddy Chat**
   - Ask any academic or technical question.
   - Watch the real-time token streaming and animated Buddy thinking indicator.
   - Click suggested chips or copy responses with the copy button.

5. **Phase 5: UI & Polish**
   - Click the **Dark / Light mode** toggle in the sidebar or mobile menu.
   - Resize the window to mobile width (<860px) to test the responsive mobile header, bottom navigation bar, and tap targets (≥44px).
