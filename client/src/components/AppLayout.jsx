import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MascotBuddy from './MascotBuddy';
import {
  Home,
  Layers,
  MessageSquare,
  User,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export default function AppLayout({
  activeScreen,
  setActiveScreen,
  children,
}) {
  const { currentUser, userProfile, logout, isFirebaseConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quiz', label: 'Take a Quiz', icon: Layers },
    { id: 'chat', label: 'Ask Buddy', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const handleNavClick = (screenId) => {
    setActiveScreen(screenId);
    setMobileMenuOpen(false);
  };

  const getLevelBadgeText = () => {
    if (!userProfile) return 'Learner';
    if (userProfile.level === 'School') return `Class ${userProfile.schoolClass || '10'}`;
    if (userProfile.level === 'College') return `${userProfile.collegeCourse || 'College'}`;
    if (userProfile.level === 'Professional') return `${userProfile.profession || 'Pro'}`;
    return userProfile.level;
  };

  return (
    <div className="app-container">
      {/* Mobile Top Bar */}
      <header className="app-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              padding: '6px',
            }}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            onClick={() => setActiveScreen('home')}
          >
            <MascotBuddy state="happy" size="sm" />
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: '800',
                fontSize: '1.15rem',
                background: 'var(--gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Study Buddy
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
            }}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop Persistent, Mobile Drawer) */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Logo & Mascot */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            onClick={() => handleNavClick('home')}
          >
            <MascotBuddy state="idle" size="sm" />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  lineHeight: '1.1',
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Study Buddy
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AI Learning Partner
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: mobileMenuOpen ? 'flex' : 'none',
              background: 'none',
              border: 'none',
              color: 'var(--text-main)',
              cursor: 'pointer',
              padding: '4px',
            }}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Mini Banner */}
        <div
          style={{
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.95rem',
              flexShrink: 0,
            }}
          >
            {currentUser?.displayName ? currentUser.displayName[0].toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: '700',
                fontSize: '0.9rem',
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser?.displayName || 'Learner'}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary)',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {getLevelBadgeText()}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeScreen === item.id ||
              (item.id === 'quiz' && ['quiz', 'quiz-active', 'score'].includes(activeScreen));

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  minHeight: '44px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div
          style={{
            paddingTop: '18px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'var(--bg-input)',
              color: 'var(--text-main)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Log out */}
          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minHeight: '44px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--danger)',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="app-main">
        <div className="app-content">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar (min 44px tap targets) */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeScreen === item.id ||
            (item.id === 'quiz' && ['quiz', 'quiz-active', 'score'].includes(activeScreen));

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveScreen(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              aria-label={item.label}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
