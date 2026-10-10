import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MascotBuddy from './MascotBuddy';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function ProfileSetup({ isEditing = false, onFinished }) {
  const { userProfile, saveProfile, currentUser } = useAuth();

  const [level, setLevel] = useState(userProfile?.level || 'College');
  // School fields
  const [schoolClass, setSchoolClass] = useState(userProfile?.schoolClass || '10');
  const [subject, setSubject] = useState(userProfile?.subject || 'Science & Mathematics');
  // College fields
  const [collegeCourse, setCollegeCourse] = useState(userProfile?.collegeCourse || 'Computer Science');
  const [collegeYear, setCollegeYear] = useState(userProfile?.collegeYear || '2nd Year');
  // Professional fields
  const [profession, setProfession] = useState(userProfile?.profession || 'Software Engineer');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (level === 'School' && (!schoolClass || !subject.trim())) {
      setError('Please choose your class and subject.');
      return;
    }
    if (level === 'College' && (!collegeCourse.trim() || !collegeYear)) {
      setError('Please specify your course and year.');
      return;
    }
    if (level === 'Professional' && !profession.trim()) {
      setError('Please enter your profession or field.');
      return;
    }

    try {
      setSaving(true);
      const profileData = {
        level,
        ...(level === 'School' ? { schoolClass, subject: subject.trim() } : {}),
        ...(level === 'College' ? { collegeCourse: collegeCourse.trim(), collegeYear } : {}),
        ...(level === 'Professional' ? { profession: profession.trim() } : {}),
      };

      await saveProfile(profileData);
      if (onFinished) {
        onFinished();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.12), transparent 60%)',
      }}
    >
      <div
        className="card-glass"
        style={{
          width: '100%',
          maxWidth: '580px',
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <MascotBuddy state="thinking" size="md" showSpeech speechText="Let's tailor your experience!" />
          <h2
            style={{
              fontSize: '1.85rem',
              fontWeight: '800',
              marginTop: '16px',
              marginBottom: '6px',
            }}
          >
            {isEditing ? 'Update Your Learning Profile' : 'Welcome to Study Buddy!'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Tell Buddy about your current level so quizzes and AI explanations match your exact needs.
          </p>
        </div>

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

        <form onSubmit={handleSubmit}>
          {/* Step 1: Choose Educational Level */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ marginBottom: '12px', fontSize: '0.95rem' }}>
              Choose your current level:
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
              }}
            >
              {/* Level 1: School */}
              <button
                type="button"
                onClick={() => setLevel('School')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '18px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: level === 'School' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: level === 'School' ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <BookOpen size={22} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>School</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Classes 6 to 12
                </span>
                {level === 'School' && (
                  <CheckCircle2
                    size={18}
                    style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--primary)' }}
                  />
                )}
              </button>

              {/* Level 2: College */}
              <button
                type="button"
                onClick={() => setLevel('College')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '18px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: level === 'College' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: level === 'College' ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <GraduationCap size={22} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>College</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Undergrad & Higher
                </span>
                {level === 'College' && (
                  <CheckCircle2
                    size={18}
                    style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--primary)' }}
                  />
                )}
              </button>

              {/* Level 3: Professional */}
              <button
                type="button"
                onClick={() => setLevel('Professional')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '18px 12px',
                  borderRadius: 'var(--radius-lg)',
                  border: level === 'Professional' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                  background: level === 'Professional' ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-input)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <Briefcase size={22} />
                </div>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>Professional</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Working & Upskilling
                </span>
                {level === 'Professional' && (
                  <CheckCircle2
                    size={18}
                    style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--primary)' }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Conditional Sub-fields */}
          <div
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px',
            }}
          >
            {level === 'School' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="school-class">Select Class / Grade (6 to 12)</label>
                  <select
                    id="school-class"
                    className="form-input"
                    value={schoolClass}
                    onChange={(e) => setSchoolClass(e.target.value)}
                  >
                    {[6, 7, 8, 9, 10, 11, 12].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="school-subject">Primary Subject of Focus</label>
                  <input
                    id="school-subject"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Science, Mathematics, History, Physics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </div>
            )}

            {level === 'College' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="college-course">Course / Degree / Major</label>
                  <input
                    id="college-course"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science, Medicine, Mechanical Eng, Economics"
                    value={collegeCourse}
                    onChange={(e) => setCollegeCourse(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label" htmlFor="college-year">Academic Year</label>
                  <select
                    id="college-year"
                    className="form-input"
                    value={collegeYear}
                    onChange={(e) => setCollegeYear(e.target.value)}
                  >
                    <option value="1st Year">1st Year / Freshman</option>
                    <option value="2nd Year">2nd Year / Sophomore</option>
                    <option value="3rd Year">3rd Year / Junior</option>
                    <option value="4th Year">4th Year / Senior</option>
                    <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                    <option value="PhD / Doctorate">PhD / Doctorate</option>
                  </select>
                </div>
              </div>
            )}

            {level === 'Professional' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="user-profession">Profession / Domain</label>
                  <input
                    id="user-profession"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Nurse, Software Engineer, Accountant, Data Analyst"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    💡 Gemini will create industry-grade questions reflecting real scenarios for this role.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {isEditing && (
              <button
                type="button"
                onClick={onFinished}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={{ flex: 2 }}
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Start Learning with Buddy'}
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
