import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MascotBuddy from './MascotBuddy';
import { Sparkles, HelpCircle, Flame, Layers, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export default function QuizSetup({ onStartQuiz, onCancel }) {
  const { userProfile } = useAuth();

  const [topic, setTopic] = useState('');
  const [selectedCount, setSelectedCount] = useState(5);
  const [isCustomCount, setIsCustomCount] = useState(false);
  const [customCountValue, setCustomCountValue] = useState(10);
  const [difficulty, setDifficulty] = useState('Medium');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Tailored suggested topics based on user level and field
  const getSuggestedTopics = () => {
    if (userProfile?.level === 'School') {
      return [
        'Photosynthesis & Plant Biology',
        'Newton’s Laws of Motion',
        'Linear Equations & Algebra',
        'Acids, Bases & Salts',
        'French Revolution & World History',
      ];
    } else if (userProfile?.level === 'Professional') {
      const prof = (userProfile.profession || '').toLowerCase();
      if (prof.includes('nurse') || prof.includes('medic') || prof.includes('doctor')) {
        return [
          'Pharmacology & Dosages',
          'Cardiovascular Triage',
          'Infection Control Protocols',
          'Critical Care Hemodynamics',
        ];
      }
      if (prof.includes('account') || prof.includes('finance')) {
        return [
          'Double-Entry Bookkeeping & GAAP',
          'Corporate Taxation & Deductions',
          'Balance Sheet Variance Analysis',
          'Auditing & Internal Controls',
        ];
      }
      return [
        'System Architecture & Microservices',
        'Data Structures & Concurrency',
        'RESTful API Security & OAuth2',
        'Cloud Infrastructure & CI/CD',
        'Database Indexing & Query Tuning',
      ];
    }
    // College default
    return [
      'Data Structures & Algorithms',
      'Organic Chemistry Mechanisms',
      'Macroeconomics & Monetary Policy',
      'Quantum Mechanics Fundamentals',
      'Linear Algebra & Vector Spaces',
    ];
  };

  const finalCount = isCustomCount
    ? Math.min(Math.max(parseInt(customCountValue, 10) || 5, 1), 30)
    : selectedCount;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a quiz topic.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          questionCount: finalCount,
          difficulty,
          userProfile,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate quiz. Please retry.');
      }

      onStartQuiz({
        topic: topic.trim(),
        difficulty,
        questions: data.questions,
        isFallback: data.isFallback,
        notice: data.notice,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not connect to AI quiz engine. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <MascotBuddy state={loading ? 'thinking' : 'idle'} size="lg" />
        <h2
          style={{
            fontSize: '2.1rem',
            fontWeight: '800',
            marginTop: '16px',
            marginBottom: '6px',
            background: 'var(--gradient-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Customize Your Quiz
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Pick your topic, question count, and difficulty. Buddy will tailor every question to your level!
        </p>

        {/* User level pill */}
        <div style={{ marginTop: '10px' }}>
          <span className="badge-glow">
            🎯 Tailored for:{' '}
            <strong>
              {userProfile?.level === 'School'
                ? `Class ${userProfile.schoolClass || '10'} (${userProfile.subject || 'School'})`
                : userProfile?.level === 'College'
                ? `${userProfile.collegeCourse || 'College'} - ${userProfile.collegeYear || 'Year 1'}`
                : userProfile?.level === 'Professional'
                ? `${userProfile.profession || 'Professional'}`
                : 'All Levels'}
            </strong>
          </span>
        </div>
      </div>

      {loading ? (
        /* Thinking Loading State */
        <div
          className="card-glass"
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <MascotBuddy state="thinking" size="xl" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>
            Buddy is crafting your quiz
            <span
              style={{
                display: 'inline-block',
                marginLeft: '4px',
                animation: 'thinkingDots 1.4s infinite',
              }}
            >
              ...
            </span>
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '440px', fontSize: '0.95rem' }}>
            Generating {finalCount} challenging {difficulty.toLowerCase()} questions on{' '}
            <strong>"{topic}"</strong> with deep conceptual explanations...
          </p>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '12px',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--primary)',
                animation: 'thinkingDots 1.2s infinite 0.1s',
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--teal)',
                animation: 'thinkingDots 1.2s infinite 0.3s',
              }}
            />
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: 'var(--orange)',
                animation: 'thinkingDots 1.2s infinite 0.5s',
              }}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-glass" style={{ padding: '32px' }}>
          {error && (
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid var(--danger-light)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: '0.92rem',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <AlertCircle size={20} />
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          {/* 1. Topic Input */}
          <div style={{ marginBottom: '28px' }}>
            <label className="form-label" htmlFor="quiz-topic" style={{ fontSize: '1rem', marginBottom: '8px' }}>
              1. What topic do you want to master today?
            </label>
            <input
              id="quiz-topic"
              type="text"
              className="form-input"
              placeholder="e.g. World War II, Photosynthesis, Python Async/Await, Microeconomics..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{ fontSize: '1.05rem', padding: '12px 18px', minHeight: '48px' }}
              autoFocus
            />

            {/* Quick Suggestion Chips */}
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                Quick ideas for you:
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {getSuggestedTopics().map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTopic(sug)}
                    className="btn-outline"
                    style={{
                      fontSize: '0.8rem',
                      minHeight: '34px',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      background: topic === sug ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                      borderColor: topic === sug ? 'var(--primary)' : 'var(--border-subtle)',
                      color: topic === sug ? 'var(--primary)' : 'var(--text-main)',
                    }}
                  >
                    ✨ {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Number of MCQs */}
          <div style={{ marginBottom: '28px' }}>
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '8px' }}>
              2. Number of Questions
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setSelectedCount(num);
                    setIsCustomCount(false);
                  }}
                  className="btn-outline"
                  style={{
                    minWidth: '68px',
                    minHeight: '44px',
                    fontWeight: '700',
                    borderRadius: 'var(--radius-md)',
                    background:
                      !isCustomCount && selectedCount === num
                        ? 'var(--primary)'
                        : 'var(--bg-input)',
                    color: !isCustomCount && selectedCount === num ? '#ffffff' : 'var(--text-main)',
                    borderColor:
                      !isCustomCount && selectedCount === num
                        ? 'var(--primary)'
                        : 'var(--border-subtle)',
                  }}
                >
                  {num} MCQs
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomCount(true)}
                className="btn-outline"
                style={{
                  minHeight: '44px',
                  fontWeight: '700',
                  borderRadius: 'var(--radius-md)',
                  background: isCustomCount ? 'var(--primary)' : 'var(--bg-input)',
                  color: isCustomCount ? '#ffffff' : 'var(--text-main)',
                  borderColor: isCustomCount ? 'var(--primary)' : 'var(--border-subtle)',
                }}
              >
                Custom
              </button>

              {isCustomCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customCountValue}
                    onChange={(e) => setCustomCountValue(e.target.value)}
                    className="form-input"
                    style={{ width: '80px', textAlign: 'center', fontWeight: '700' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    (max 30)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 3. Difficulty */}
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '8px' }}>
              3. Difficulty Level
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { name: 'Easy', color: 'var(--success)', desc: 'Foundations & Core Facts' },
                { name: 'Medium', color: 'var(--orange)', desc: 'Application & Analysis' },
                { name: 'Hard', color: 'var(--danger)', desc: 'Nuanced Edge Cases & Rigor' },
              ].map((diff) => (
                <button
                  key={diff.name}
                  type="button"
                  onClick={() => setDifficulty(diff.name)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: difficulty === diff.name ? `2px solid ${diff.color}` : '1px solid var(--border-subtle)',
                    background: difficulty === diff.name ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    style={{
                      fontWeight: '800',
                      fontSize: '1.05rem',
                      color: difficulty === diff.name ? diff.color : 'var(--text-main)',
                    }}
                  >
                    {diff.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {diff.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '14px' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 2, fontSize: '1.05rem', minHeight: '50px' }}
            >
              <Sparkles size={20} />
              Launch Quiz ({finalCount} Questions)
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
