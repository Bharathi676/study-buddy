import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import MascotBuddy from './MascotBuddy';
import {
  Award,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  RotateCcw,
  PlusCircle,
  MessageSquare,
  Home,
  LogOut,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ScoreCard({
  summary,
  onRetryQuiz,
  onNewQuiz,
  onAskAboutMistakes,
  onFinish,
}) {
  const { logout } = useAuth();

  const {
    topic,
    difficulty,
    totalQuestions = 0,
    score = 0,
    results = [],
    elapsedSeconds = 0,
    endedEarly = false,
  } = summary;

  const answeredCount = results.length;
  const correctCount = score;
  const wrongCount = results.filter((r) => !r.isCorrect).length;
  const skippedCount = Math.max(0, totalQuestions - answeredCount);

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const [expandedIndex, setExpandedIndex] = useState(null);

  // Trigger celebratory confetti on high scores
  useEffect(() => {
    if (percentage >= 70) {
      const end = Date.now() + 1200;
      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981'],
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [percentage]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 90) {
      return {
        title: 'Outstanding Mastery! 🌟',
        desc: 'You have completely conquered this topic. Top-tier conceptual comprehension!',
        state: 'celebrating',
        color: 'var(--success)',
      };
    }
    if (percentage >= 70) {
      return {
        title: 'Great Job! 🚀',
        desc: 'Strong foundation and accurate problem solving. You are well ahead of the curve!',
        state: 'happy',
        color: 'var(--teal)',
      };
    }
    if (percentage >= 50) {
      return {
        title: 'Good Effort! 🌱',
        desc: 'You have got the fundamentals down. Reviewing your missteps will solidify the rest!',
        state: 'idle',
        color: 'var(--orange)',
      };
    }
    return {
      title: 'Keep Growing! 💡',
      desc: "Mistakes are the very best way to learn! Ask Buddy to break down where things went wrong.",
      state: 'oops',
      color: 'var(--primary)',
    };
  };

  const perf = getPerformanceMessage();
  const wrongResults = results.filter((r) => !r.isCorrect);

  // SVG Score Ring constants
  const strokeWidth = 10;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Main Score Overview Card */}
      <div
        className="card-glass"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <MascotBuddy state={perf.state} size="lg" />
        </div>

        <h2
          style={{
            fontSize: '2.1rem',
            fontWeight: '800',
            marginBottom: '6px',
            color: perf.color,
          }}
        >
          {perf.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 28px auto' }}>
          {perf.desc}
        </p>

        {/* Big Animated Score Ring */}
        <div
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            margin: '0 auto 28px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="var(--bg-input)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Animated Score Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={perf.color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              style={{
                transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />
          </svg>

          {/* Centered Score Text */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '2.3rem', fontWeight: '800', lineHeight: '1', color: 'var(--text-main)' }}>
              {percentage}%
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)', marginTop: '4px' }}>
              {correctCount} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            maxWidth: '640px',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--success)', fontWeight: '700', fontSize: '0.85rem' }}>
              <CheckCircle size={16} /> Correct
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: 'var(--success)' }}>
              {correctCount}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--danger)', fontWeight: '700', fontSize: '0.85rem' }}>
              <XCircle size={16} /> Wrong
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: 'var(--danger)' }}>
              {wrongCount}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>
              <MinusCircle size={16} /> Skipped
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>
              {skippedCount}
            </div>
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem' }}>
              <Clock size={16} /> Time
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '4px', color: 'var(--text-main)' }}>
              {formatTime(elapsedSeconds)}
            </div>
          </div>
        </div>

        {/* Question Results Chart: Green / Red / Gray Dots */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Results by Question ({totalQuestions} Total)
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {Array.from({ length: totalQuestions }).map((_, idx) => {
              const res = results[idx];
              let dotBg = 'var(--border-strong)'; // skipped
              let dotColor = '#fff';
              let label = `Q${idx + 1}: Skipped`;

              if (res) {
                if (res.isCorrect) {
                  dotBg = 'var(--success)';
                  label = `Q${idx + 1}: Correct`;
                } else {
                  dotBg = 'var(--danger)';
                  label = `Q${idx + 1}: Incorrect`;
                }
              }

              return (
                <div
                  key={idx}
                  title={label}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: dotBg,
                    color: dotColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'default',
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Section: Wrong Questions with Correct Answers */}
      {wrongResults.length > 0 && (
        <div className="card-glass" style={{ padding: '28px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>
                Review Your Mistakes ({wrongResults.length})
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Inspect what went wrong and study the verified explanations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {wrongResults.map((item, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-input)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <XCircle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {item.question}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  {isExpanded && (
                    <div
                      style={{
                        padding: '16px 18px',
                        borderTop: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      {/* You Answered */}
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--danger-bg)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--danger)' }}>
                          ❌ Your Choice: Option {String.fromCharCode(65 + item.selectedIndex)} (
                          {item.options[item.selectedIndex]})
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>
                          {item.wrongExplanation || 'Does not fit the question parameters.'}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--success-bg)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                        }}
                      >
                        <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--success)' }}>
                          ✅ Correct Answer: Option {String.fromCharCode(65 + item.correctIndex)} (
                          {item.options[item.correctIndex]})
                        </div>
                        <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: '4px' }}>
                          {item.explanation}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons as per requirement:
          "Retry same quiz", "New quiz", "Ask Buddy about my mistakes", "Finish", plus "Log out" */}
      <div
        className="card-glass"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {/* Ask Buddy about mistakes */}
          {wrongResults.length > 0 && (
            <button
              type="button"
              onClick={() => onAskAboutMistakes(wrongResults, topic)}
              className="btn-primary"
              style={{
                background: 'var(--gradient-teal)',
                boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              }}
            >
              <MessageSquare size={18} />
              Ask Buddy About Mistakes
            </button>
          )}

          {/* Retry Same Quiz */}
          <button
            type="button"
            onClick={onRetryQuiz}
            className="btn-secondary"
          >
            <RotateCcw size={18} />
            Retry Same Quiz
          </button>

          {/* New Quiz */}
          <button
            type="button"
            onClick={onNewQuiz}
            className="btn-secondary"
          >
            <PlusCircle size={18} />
            New Quiz
          </button>

          {/* Finish & return home */}
          <button
            type="button"
            onClick={onFinish}
            className="btn-primary"
          >
            <Home size={18} />
            Finish & Return Home
          </button>
        </div>

        {/* Secondary Log out link */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <LogOut size={14} />
            Log Out of Study Buddy
          </button>
        </div>
      </div>
    </div>
  );
}
