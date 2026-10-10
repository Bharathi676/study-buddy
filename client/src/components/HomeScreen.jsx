import React from 'react';
import { useAuth } from '../context/AuthContext';
import MascotBuddy from './MascotBuddy';
import {
  Sparkles,
  Layers,
  MessageSquare,
  Award,
  Flame,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function HomeScreen({
  onSelectMode,
  onEditProfile,
}) {
  const { currentUser, userProfile } = useAuth();

  const getLevelDisplay = () => {
    if (!userProfile) return 'Learner';
    if (userProfile.level === 'School') {
      return `Class ${userProfile.schoolClass || '10'} • ${userProfile.subject || 'School'}`;
    }
    if (userProfile.level === 'College') {
      return `${userProfile.collegeCourse || 'Undergrad'} • ${userProfile.collegeYear || 'College'}`;
    }
    if (userProfile.level === 'Professional') {
      return `${userProfile.profession || 'Professional'}`;
    }
    return userProfile.level;
  };

  const getLevelIcon = () => {
    if (userProfile?.level === 'School') return <BookOpen size={16} />;
    if (userProfile?.level === 'College') return <GraduationCap size={16} />;
    return <Briefcase size={16} />;
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', width: '100%' }}>
      {/* Welcome Hero Banner */}
      <div
        className="card-glass"
        style={{
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-glow" style={{ fontSize: '0.82rem' }}>
              {getLevelIcon()}
              {getLevelDisplay()}
            </span>
            <button
              type="button"
              onClick={onEditProfile}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Edit Profile
            </button>
          </div>

          <h2
            style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              lineHeight: '1.2',
              marginBottom: '10px',
            }}
          >
            Welcome back,{' '}
            <span
              style={{
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {currentUser?.displayName || 'Learner'}
            </span>
            ! 👋
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '520px' }}>
            What is your study goal today? Test yourself with an adaptive quiz or ask Buddy anything.
          </p>
        </div>

        {/* Mascot Greeting */}
        <div style={{ flexShrink: 0 }}>
          <MascotBuddy state="happy" size="lg" showSpeech speechText="Ready to learn!" />
        </div>
      </div>

      {/* Two Primary Modes: Take a Quiz vs Ask Buddy */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        {/* Mode A: Take a Quiz */}
        <div
          className="card-glass"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid transparent',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => onSelectMode('quiz')}
        >
          {/* Subtle Top Glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'var(--gradient-primary)',
            }}
          />

          <div>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'var(--gradient-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)',
              }}
            >
              <Layers size={28} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Mode 1
              </span>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
              Take a Quiz 🎯
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Generate custom MCQs on any topic. Get instant feedback on correct and wrong choices tailored to your level.
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <span className="badge-glow" style={{ fontSize: '0.78rem' }}>
                5 to 30 MCQs
              </span>
              <span className="badge-glow" style={{ fontSize: '0.78rem' }}>
                Live Explanations
              </span>
              <span className="badge-glow" style={{ fontSize: '0.78rem' }}>
                Score Ring & Review
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode('quiz');
            }}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>Start a Quiz</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Mode B: Ask Buddy */}
        <div
          className="card-glass"
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '2px solid transparent',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => onSelectMode('chat')}
        >
          {/* Subtle Top Glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'var(--gradient-teal)',
            }}
          />

          <div>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'var(--gradient-teal)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)',
              }}
            >
              <MessageSquare size={28} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  color: 'var(--teal)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Mode 2
              </span>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
              Ask Buddy (Chat) 💬
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: '1.5', marginBottom: '20px' }}>
              ChatGPT-style AI partner. Ask anything, get step-by-step explanations, code examples, or dive deep into difficult concepts.
            </p>

            {/* Feature tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              <span className="badge-glow" style={{ fontSize: '0.78rem', color: 'var(--teal)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                Real-time Streaming
              </span>
              <span className="badge-glow" style={{ fontSize: '0.78rem', color: 'var(--teal)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                Markdown & Code
              </span>
              <span className="badge-glow" style={{ fontSize: '0.78rem', color: 'var(--teal)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                Age & Level Adapted
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMode('chat');
            }}
            style={{
              width: '100%',
              justifyContent: 'space-between',
              background: 'var(--gradient-teal)',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
            }}
          >
            <span>Open Ask Buddy Chat</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick Motivation / Stats Bar */}
      <div
        className="card-glass"
        style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--warning-bg)',
              color: 'var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>3 Days</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Learning Streak</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>86%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Quiz Accuracy</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(124, 58, 237, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--text-main)' }}>12 Quizzes</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed So Far</div>
          </div>
        </div>
      </div>
    </div>
  );
}
