import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MascotBuddy from './MascotBuddy';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Sparkles,
  RotateCcw,
  User,
  Copy,
  Check,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export default function AskBuddy({ initialPrompt = '', initialContext = null }) {
  const { userProfile } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm **Study Buddy**, your personal AI study partner! 🎓✨\n\nI'm ready to answer any question on any topic—tailored specifically to your **${
        userProfile?.level === 'School'
          ? `Class ${userProfile.schoolClass || '10'} (${userProfile.subject || 'School'})`
          : userProfile?.level === 'College'
          ? `${userProfile.collegeCourse || 'College Studies'}`
          : userProfile?.level === 'Professional'
          ? `${userProfile.profession || 'Professional Career'}`
          : 'learning journey'
      }**.\n\nAsk me anything, ask for step-by-step explanations, or practice problems!`,
    },
  ]);

  const [input, setInput] = useState(initialPrompt || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // If initialPrompt / mistakes context was passed, automatically submit it!
  const hasTriggeredInitial = useRef(false);
  useEffect(() => {
    if (initialPrompt && !hasTriggeredInitial.current) {
      hasTriggeredInitial.current = true;
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const getSuggestedPrompts = () => {
    if (userProfile?.level === 'School') {
      return [
        'Explain photosynthesis like I am 10 years old with a fun story 🌱',
        'How does gravity work on the moon vs earth? 🌕',
        'Help me solve a quadratic equation step by step 📐',
        'Why did World War I start? Give a simple timeline 📜',
      ];
    } else if (userProfile?.level === 'Professional') {
      const prof = (userProfile.profession || '').toLowerCase();
      if (prof.includes('nurse') || prof.includes('medic')) {
        return [
          'What are the critical nursing interventions for septic shock? 🩺',
          'Break down electrolyte imbalances and ECG rhythms ⚡',
          'Explain pharmacokinetics vs pharmacodynamics with clinical examples 💊',
        ];
      }
      return [
        'Compare microservices vs modular monolith: latency, state, and cost trade-offs ⚙️',
        'Explain database indexing (B-Tree vs Hash) and composite index ordering 🗄️',
        'How to design an idempotent payment processing workflow? 💳',
        'Explain OAuth 2.0 PKCE flow with a clear sequence diagram 🔐',
      ];
    }
    // College
    return [
      'Derive and explain Gradient Descent with mathematical intuition 📊',
      'Explain Dynamic Programming vs Greedy approaches with an example 💻',
      'What is Keynesian vs Classical economics in simple terms? 📈',
      'Explain the Heisenberg Uncertainty Principle and its physical meaning ⚛️',
    ];
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || isStreaming) return;

    const userMessage = { role: 'user', content: text };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsStreaming(true);

    // Placeholder assistant message to stream into
    const assistantIndex = newHistory.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          userProfile,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to connect to Ask Buddy streaming service.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunk = decoder.decode(value, { stream: true });
        const lines = rawChunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.chunk) {
                accumulated += data.chunk;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[assistantIndex] = {
                    role: 'assistant',
                    content: accumulated,
                  };
                  return updated;
                });
              } else if (data.error) {
                accumulated += `\n\n⚠️ *${data.error}*`;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[assistantIndex] = {
                    role: 'assistant',
                    content: accumulated,
                  };
                  return updated;
                });
              }
            } catch (e) {
              // Ignore non-json chunks
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIndex] = {
          role: 'assistant',
          content: `⚠️ Sorry, Study Buddy could not complete this request: ${err.message}. Please check your connection or backend server.`,
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Chat session reset! What would you like to explore next? 💡`,
      },
    ]);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxHeight: '860px',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Chat Header */}
      <div
        className="card-glass"
        style={{
          padding: '14px 20px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MascotBuddy state={isStreaming ? 'thinking' : 'idle'} size="sm" />
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Ask Buddy (ChatGPT Mode)
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Adaptive Tutor &bull;{' '}
              {userProfile?.level === 'School'
                ? `School (Class ${userProfile.schoolClass || '10'})`
                : userProfile?.level === 'Professional'
                ? `Professional (${userProfile.profession || 'Specialist'})`
                : `College (${userProfile?.collegeCourse || 'Course'})`}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="btn-outline"
          style={{ minHeight: '34px', padding: '4px 12px', fontSize: '0.82rem' }}
          title="Clear chat and start fresh"
        >
          <RotateCcw size={14} />
          New Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="card-glass"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '14px',
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              {/* Avatar */}
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {isUser ? (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                    }}
                  >
                    <User size={18} />
                  </div>
                ) : (
                  <MascotBuddy
                    state={isStreaming && idx === messages.length - 1 ? 'thinking' : 'happy'}
                    size="sm"
                  />
                )}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  background: isUser ? 'var(--primary)' : 'var(--bg-input)',
                  color: isUser ? '#ffffff' : 'var(--text-main)',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  lineHeight: '1.6',
                }}
              >
                {isUser ? (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontWeight: '500' }}>{msg.content}</p>
                ) : (
                  <div className="markdown-body" style={{ fontSize: '0.96rem' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>

                    {/* Copy message button */}
                    {msg.content && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            padding: '2px 6px',
                          }}
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check size={13} color="var(--success)" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Streaming Thinking Indicator */}
        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px' }}>
            <MascotBuddy state="thinking" size="sm" />
            <div
              style={{
                background: 'var(--bg-input)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Buddy is thinking</span>
              <span style={{ animation: 'thinkingDots 1.2s infinite' }}>...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips (Only shown when not streaming and short conversation) */}
      {!isStreaming && messages.length <= 3 && (
        <div style={{ marginBottom: '10px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {getSuggestedPrompts().map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="btn-outline"
                style={{
                  fontSize: '0.8rem',
                  minHeight: '34px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  whiteSpace: 'nowrap',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          placeholder={`Ask Buddy any question (e.g. "Explain how async/await works")...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          style={{
            flex: 1,
            minHeight: '50px',
            fontSize: '1rem',
            padding: '12px 18px',
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className="btn-primary"
          style={{
            minHeight: '50px',
            minWidth: '50px',
            padding: '0 20px',
          }}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
