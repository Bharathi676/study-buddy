import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/AppLayout';
import AuthScreen from './components/AuthScreen';
import ProfileSetup from './components/ProfileSetup';
import HomeScreen from './components/HomeScreen';
import QuizSetup from './components/QuizSetup';
import QuizScreen from './components/QuizScreen';
import ScoreCard from './components/ScoreCard';
import AskBuddy from './components/AskBuddy';
import MascotBuddy from './components/MascotBuddy';

function MainApp() {
  const { currentUser, userProfile, loading } = useAuth();

  // Navigation states: 'home' | 'quiz' | 'quiz-active' | 'score' | 'chat' | 'profile'
  const [activeScreen, setActiveScreen] = useState('home');

  // Quiz active & summary state
  const [currentQuizData, setCurrentQuizData] = useState(null);
  const [quizSummary, setQuizSummary] = useState(null);

  // Chat preloaded prompt (e.g., when clicking "Ask Buddy about my mistakes")
  const [chatInitialPrompt, setChatInitialPrompt] = useState('');
  const [chatInitialContext, setChatInitialContext] = useState(null);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <MascotBuddy state="thinking" size="xl" />
        <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          Warming up Study Buddy...
        </div>
      </div>
    );
  }

  // 1. Not logged in -> Auth Screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // 2. Logged in, but profile not yet set up (first time only)
  if (!userProfile || !userProfile.completedProfile) {
    return (
      <ProfileSetup
        onFinished={() => {
          setActiveScreen('home');
        }}
      />
    );
  }

  // Handlers for Quiz flow
  const handleStartQuiz = (quizData) => {
    setCurrentQuizData(quizData);
    setActiveScreen('quiz-active');
  };

  const handleCompleteQuiz = (summary) => {
    setQuizSummary(summary);
    setActiveScreen('score');
  };

  const handleEndEarly = (summary) => {
    setQuizSummary(summary);
    setActiveScreen('score');
  };

  const handleRetryQuiz = () => {
    if (currentQuizData) {
      setActiveScreen('quiz-active');
    } else {
      setActiveScreen('quiz');
    }
  };

  const handleNewQuiz = () => {
    setCurrentQuizData(null);
    setQuizSummary(null);
    setActiveScreen('quiz');
  };

  const handleAskAboutMistakes = (wrongQuestions, topic) => {
    const questionsSummary = wrongQuestions
      .map(
        (q, i) =>
          `Question ${i + 1}: "${q.question}"\n- I chose: "${q.options[q.selectedIndex]}" (Why it was wrong: ${q.wrongExplanation})\n- Correct answer: "${q.options[q.correctIndex]}" (${q.explanation})`
      )
      .join('\n\n');

    const prompt = `Hi Buddy! I just finished a quiz on "${topic}" and got these questions wrong:\n\n${questionsSummary}\n\nCould you please coach me through these mistakes, explain why the right answers are correct, and give me a memorable mental model to never get them wrong again?`;

    setChatInitialPrompt(prompt);
    setChatInitialContext(wrongQuestions);
    setActiveScreen('chat');
  };

  const handleFinishScoreCard = () => {
    setQuizSummary(null);
    setCurrentQuizData(null);
    setActiveScreen('home');
  };

  // Render content according to activeScreen
  const renderContent = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <HomeScreen
            onSelectMode={(mode) => {
              if (mode === 'quiz') setActiveScreen('quiz');
              else if (mode === 'chat') {
                setChatInitialPrompt('');
                setActiveScreen('chat');
              }
            }}
            onEditProfile={() => setActiveScreen('profile')}
          />
        );

      case 'quiz':
        return (
          <QuizSetup
            onStartQuiz={handleStartQuiz}
            onCancel={() => setActiveScreen('home')}
          />
        );

      case 'quiz-active':
        return currentQuizData ? (
          <QuizScreen
            quizData={currentQuizData}
            onCompleteQuiz={handleCompleteQuiz}
            onEndEarly={handleEndEarly}
          />
        ) : (
          <QuizSetup onStartQuiz={handleStartQuiz} onCancel={() => setActiveScreen('home')} />
        );

      case 'score':
        return quizSummary ? (
          <ScoreCard
            summary={quizSummary}
            onRetryQuiz={handleRetryQuiz}
            onNewQuiz={handleNewQuiz}
            onAskAboutMistakes={handleAskAboutMistakes}
            onFinish={handleFinishScoreCard}
          />
        ) : (
          <HomeScreen
            onSelectMode={(mode) => setActiveScreen(mode === 'quiz' ? 'quiz' : 'chat')}
            onEditProfile={() => setActiveScreen('profile')}
          />
        );

      case 'chat':
        return (
          <AskBuddy
            initialPrompt={chatInitialPrompt}
            initialContext={chatInitialContext}
          />
        );

      case 'profile':
        return (
          <ProfileSetup
            isEditing={true}
            onFinished={() => setActiveScreen('home')}
          />
        );

      default:
        return <HomeScreen onSelectMode={() => setActiveScreen('quiz')} onEditProfile={() => setActiveScreen('profile')} />;
    }
  };

  return (
    <AppLayout
      activeScreen={activeScreen}
      setActiveScreen={(screen) => {
        if (screen === 'chat') {
          setChatInitialPrompt('');
        }
        setActiveScreen(screen);
      }}
    >
      {renderContent()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
