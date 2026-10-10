import React, { useState, useEffect, useRef } from 'react';
import MascotBuddy from './MascotBuddy';
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  LogOut,
  AlertTriangle,
  Award,
  Sparkles,
} from 'lucide-react';

export default function QuizScreen({
  quizData,
  onCompleteQuiz,
  onEndEarly,
}) {
  const { topic, difficulty, questions = [] } = quizData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 0, 1, 2, 3
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // array of answer records
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQ = questions[currentIndex] || {};
  const totalQuestions = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcut listeners (keys 1-4 or A-D, Enter for Next)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showEndConfirm) return;

      if (!hasAnswered) {
        if (['1', 'a', 'A'].includes(e.key)) handleSelect(0);
        else if (['2', 'b', 'B'].includes(e.key)) handleSelect(1);
        else if (['3', 'c', 'C'].includes(e.key)) handleSelect(2);
        else if (['4', 'd', 'D'].includes(e.key)) handleSelect(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnswered, currentIndex, showEndConfirm]);

  const handleSelect = (idx) => {
    if (hasAnswered) return;

    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const wrongExplanation =
      !isCorrect && currentQ.wrongExplanations
        ? currentQ.wrongExplanations[idx] || 'This choice does not satisfy the criteria for this problem.'
        : '';

    const record = {
      id: currentQ.id || currentIndex + 1,
      question: currentQ.question,
      options: currentQ.options,
      correctIndex: currentQ.correctIndex,
      selectedIndex: idx,
      isCorrect,
      explanation: currentQ.shortExplanation,
      wrongExplanation,
    };

    setResults((prev) => [...prev, record]);
  };

  const handleNext = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      // Completed all questions
      onCompleteQuiz({
        topic,
        difficulty,
        totalQuestions,
        answeredCount: totalQuestions,
        score: score,
        results: results,
        elapsedSeconds,
      });
    }
  };

  const handleConfirmEndEarly = () => {
    setShowEndConfirm(false);
    onEndEarly({
      topic,
      difficulty,
      totalQuestions,
      answeredCount: results.length,
      score: score,
      results: results,
      elapsedSeconds,
      endedEarly: true,
    });
  };

  const isCurrentCorrect = hasAnswered && selectedOption === currentQ.correctIndex;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%' }}>
      {/* Top Header Bar: Progress, Timer, Live Score, End Quiz Button */}
      <div
        className="card-glass"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              TOPIC
            </div>
            <div style={{ fontWeight: '700', fontSize: '0.98rem', color: 'var(--text-main)' }}>
              {topic}
            </div>
          </div>
          <span
            className="badge-glow"
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
            }}
          >
            {difficulty}
          </span>
        </div>

        {/* Live Metrics: Score & Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: '700',
              color: 'var(--primary)',
              background: 'rgba(124, 58, 237, 0.08)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Award size={16} />
            Score: {score}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
            }}
          >
            <Clock size={16} />
            {formatTime(elapsedSeconds)}
          </div>

          {/* End Quiz Button */}
          <button
            type="button"
            onClick={() => setShowEndConfirm(true)}
            className="btn-outline"
            style={{
              minHeight: '36px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              color: 'var(--danger)',
              borderColor: 'var(--danger-light)',
            }}
            aria-label="End quiz early"
          >
            <LogOut size={14} />
            End Quiz
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--text-muted)',
            marginBottom: '6px',
          }}
        >
          <span>
            Question <strong>{currentIndex + 1}</strong> of <strong>{totalQuestions}</strong>
          </span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div
          style={{
            height: '8px',
            width: '100%',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'var(--gradient-brand)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.3s ease-out',
            }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div
        className="card-glass"
        style={{
          padding: '32px 28px',
          marginBottom: '20px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1rem',
              flexShrink: 0,
            }}
          >
            Q{currentIndex + 1}
          </div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              lineHeight: '1.4',
              color: 'var(--text-main)',
            }}
          >
            {currentQ.question}
          </h3>
        </div>

        {/* 4 MCQ Option Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQ.options?.map((optionText, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === idx;
            const isCorrectOption = idx === currentQ.correctIndex;

            let btnBg = 'var(--bg-input)';
            let btnBorder = 'var(--border-subtle)';
            let badgeBg = 'var(--bg-surface)';
            let badgeColor = 'var(--text-muted)';

            if (hasAnswered) {
              if (isSelected) {
                if (isCorrectOption) {
                  btnBg = 'var(--success-bg)';
                  btnBorder = 'var(--success)';
                  badgeBg = 'var(--success)';
                  badgeColor = '#ffffff';
                } else {
                  btnBg = 'var(--danger-bg)';
                  btnBorder = 'var(--danger)';
                  badgeBg = 'var(--danger)';
                  badgeColor = '#ffffff';
                }
              } else if (isCorrectOption) {
                btnBg = 'var(--success-bg)';
                btnBorder = 'var(--success)';
                badgeBg = 'var(--success)';
                badgeColor = '#ffffff';
              }
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                disabled={hasAnswered}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: '52px', /* Touch accessibility */
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: `1.5px solid ${btnBorder}`,
                  background: btnBg,
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  fontSize: '0.98rem',
                  fontWeight: isSelected ? '700' : '500',
                  cursor: hasAnswered ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Option Letter Tag */}
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: badgeBg,
                    color: badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    marginRight: '14px',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  {letter}
                </span>

                <span style={{ flex: 1, lineHeight: '1.4' }}>{optionText}</span>

                {/* Status Indicator Icon */}
                {hasAnswered && isSelected && isCorrectOption && (
                  <CheckCircle size={22} color="var(--success)" style={{ marginLeft: '12px' }} />
                )}
                {hasAnswered && isSelected && !isCorrectOption && (
                  <XCircle size={22} color="var(--danger)" style={{ marginLeft: '12px' }} />
                )}
                {hasAnswered && !isSelected && isCorrectOption && (
                  <CheckCircle size={22} color="var(--success)" style={{ marginLeft: '12px' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Section (Shown after answering) */}
        {hasAnswered && (
          <div
            style={{
              marginTop: '24px',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: isCurrentCorrect ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1px solid ${isCurrentCorrect ? 'var(--success)' : 'var(--danger)'}`,
              animation: 'fadeIn 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <MascotBuddy state={isCurrentCorrect ? 'celebrating' : 'oops'} size="sm" />
              <div style={{ flex: 1 }}>
                {isCurrentCorrect ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        color: 'var(--success)',
                        marginBottom: '6px',
                      }}
                    >
                      <CheckCircle size={20} />
                      Correct! ✅
                    </div>
                    <p style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      {currentQ.shortExplanation || 'Spot on! You nailed this concept.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        color: 'var(--danger)',
                        marginBottom: '6px',
                      }}
                    >
                      <XCircle size={20} />
                      Not quite ❌
                    </div>

                    {/* Step 1: Why chosen answer was wrong */}
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '10px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--danger)' }}>
                        Why Option {String.fromCharCode(65 + selectedOption)} is wrong:
                      </span>
                      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '4px' }}>
                        {(currentQ.wrongExplanations && currentQ.wrongExplanations[selectedOption]) ||
                          'This option is misleading or does not fit the problem premise.'}
                      </p>
                    </div>

                    {/* Step 2: Show correct answer and explanation */}
                    <div
                      style={{
                        background: 'var(--bg-surface)',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--success)' }}>
                        Correct Answer: Option {String.fromCharCode(65 + currentQ.correctIndex)} (
                        {currentQ.options[currentQ.correctIndex]})
                      </span>
                      <p style={{ color: 'var(--text-main)', fontSize: '0.92rem', marginTop: '4px' }}>
                        {currentQ.shortExplanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Button */}
            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary"
                style={{
                  minHeight: '44px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                }}
              >
                {currentIndex + 1 < totalQuestions ? 'Next Question' : 'See Score Card'}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Ending Quiz Early */}
      {showEndConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 100,
          }}
        >
          <div
            className="card-glass"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--warning-bg)',
                color: 'var(--orange)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>
              End Quiz Early?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
              You've answered <strong>{results.length}</strong> of <strong>{totalQuestions}</strong> questions so far.
              Ending now will generate your performance score card for the questions you completed.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowEndConfirm(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Keep Quizzing
              </button>
              <button
                type="button"
                onClick={handleConfirmEndEarly}
                className="btn-danger"
                style={{ flex: 1 }}
              >
                End & View Score
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
