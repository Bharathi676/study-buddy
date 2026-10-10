import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MascotBuddy from './MascotBuddy';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, passwordSet] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest, isFirebaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(email, password, name || 'Learner');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err) {
      console.error(err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid email or password. Please try again.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try logging in!';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestQuickStart = async (role) => {
    setError('');
    try {
      setLoading(true);
      await signInAsGuest(role);
    } catch (err) {
      console.error(err);
      setError('Could not start guest session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'radial-gradient(circle at 50% 15%, rgba(124, 58, 237, 0.15), transparent 60%), radial-gradient(circle at 85% 75%, rgba(6, 182, 212, 0.1), transparent 50%)',
      }}
    >
      <div
        className="card-glass"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative Top Accent Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '5px',
            background: 'var(--gradient-brand)',
          }}
        />

        {/* Mascot & Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <MascotBuddy state="happy" size="md" />
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '800',
              marginTop: '12px',
              marginBottom: '4px',
              background: 'var(--gradient-brand)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Study Buddy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Your personal AI study partner & quiz champion 🎓
          </p>

          {/* Connection Status Badge */}
          <div style={{ marginTop: '10px' }}>
            <span
              className="badge-glow"
              style={{
                fontSize: '0.78rem',
                borderColor: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                color: isFirebaseConfigured ? 'var(--success)' : 'var(--orange)',
                background: isFirebaseConfigured ? 'var(--success-bg)' : 'var(--warning-bg)',
              }}
            >
              <ShieldCheck size={13} />
              {isFirebaseConfigured ? 'Firebase Connected' : 'Demo & Local Storage Mode'}
            </span>
          </div>
        </div>

        {/* Tab Switcher (Login vs Sign Up) */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setError(''); }}
            style={{
              flex: 1,
              minHeight: '40px',
              border: 'none',
              background: !isSignUp ? 'var(--bg-surface)' : 'transparent',
              color: !isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: !isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setError(''); }}
            style={{
              flex: 1,
              minHeight: '40px',
              border: 'none',
              background: isSignUp ? 'var(--bg-surface)' : 'transparent',
              color: isSignUp ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: '700',
              fontSize: '0.92rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              boxShadow: isSignUp ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              border: '1px solid var(--danger-light)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.88rem',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div>
              <label className="form-label" htmlFor="user-name">Your Name</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-subtle)' }}
                />
                <input
                  id="user-name"
                  type="text"
                  placeholder="e.g. Alex Smith"
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="user-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-subtle)' }}
              />
              <input
                id="user-email"
                type="email"
                placeholder="you@example.com"
                required
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="user-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-subtle)' }}
              />
              <input
                id="user-password"
                type="password"
                placeholder="••••••••"
                required
                className="form-input"
                style={{ paddingLeft: '42px' }}
                value={password}
                onChange={(e) => passwordSet(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create My Account' : 'Log In to Study Buddy'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '22px 0',
            color: 'var(--text-subtle)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          <span style={{ padding: '0 12px' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Quick Demo Personas */}
        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-strong)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: '700',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}
          >
            <Zap size={14} style={{ color: 'var(--orange)' }} />
            Instant 1-Click Guest Test Personas:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleGuestQuickStart('school')}
              className="btn-outline"
              style={{
                fontSize: '0.78rem',
                minHeight: '38px',
                padding: '6px 4px',
                textAlign: 'center',
              }}
            >
              🎒 School (Gr 10)
            </button>
            <button
              type="button"
              onClick={() => handleGuestQuickStart('college')}
              className="btn-outline"
              style={{
                fontSize: '0.78rem',
                minHeight: '38px',
                padding: '6px 4px',
                textAlign: 'center',
              }}
            >
              🎓 College (CS)
            </button>
            <button
              type="button"
              onClick={() => handleGuestQuickStart('pro')}
              className="btn-outline"
              style={{
                fontSize: '0.78rem',
                minHeight: '38px',
                padding: '6px 4px',
                textAlign: 'center',
              }}
            >
              💼 Professional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
