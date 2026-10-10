import React from 'react';

/**
 * MascotBuddy: Friendly AI Mascot for Study Buddy
 * States: 'idle' | 'thinking' | 'celebrating' | 'oops' | 'happy'
 * Sizes: 'sm' (36px) | 'md' (56px) | 'lg' (90px) | 'xl' (130px)
 */
export default function MascotBuddy({
  state = 'idle',
  size = 'md',
  className = '',
  showSpeech = false,
  speechText = '',
}) {
  const sizeMap = {
    sm: { width: 40, height: 40 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
    xl: { width: 130, height: 130 },
  };

  const dim = sizeMap[size] || sizeMap.md;

  const getAnimationClass = () => {
    switch (state) {
      case 'thinking':
        return 'anim-glow';
      case 'celebrating':
      case 'happy':
        return 'anim-bounce';
      case 'idle':
      default:
        return 'anim-float';
    }
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
      className={className}
      aria-label={`Study Buddy mascot (${state})`}
    >
      {showSpeech && speechText && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            marginBottom: '8px',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '6px 12px',
            fontSize: '0.85rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {speechText}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--bg-surface)',
            }}
          />
        </div>
      )}

      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={getAnimationClass()}
        style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 16px rgba(124, 58, 237, 0.2))' }}
      >
        <defs>
          {/* Bulb/Brain gradients */}
          <linearGradient id="bulbGradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="45%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          <linearGradient id="glowWarm" x1="40" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <linearGradient id="baseMetal" x1="45" y1="88" x2="75" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          <radialGradient id="auraGlow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={state === 'thinking' ? '#fbbf24' : '#a78bfa'} stopOpacity="0.45" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Aura Glow */}
        <circle cx="60" cy="50" r="48" fill="url(#auraGlow)" />

        {/* Thought Sparks for Thinking state */}
        {state === 'thinking' && (
          <g className="anim-float">
            <circle cx="20" cy="24" r="4" fill="#fbbf24" opacity="0.8" />
            <circle cx="98" cy="22" r="5" fill="#06b6d4" opacity="0.9" />
            <circle cx="88" cy="8" r="3" fill="#f59e0b" opacity="0.75" />
            <path
              d="M102 36L105 40L102 44L99 40Z"
              fill="#fbbf24"
              opacity="0.9"
            />
          </g>
        )}

        {/* Main Bulb / Brain Body */}
        <path
          d="M60 14C37.9 14 20 31.9 20 54C20 67.5 27 77.5 36 86C42 91.5 44 94 45 98H75C76 94 78 91.5 84 86C93 77.5 100 67.5 100 54C100 31.9 82.1 14 60 14Z"
          fill="url(#bulbGradient)"
        />

        {/* Brain lobe highlight curves */}
        <path
          d="M42 34C48 26 72 26 78 34C82 40 80 50 72 50C66 50 63 42 57 42C51 42 48 50 42 50C34 50 34 38 42 34Z"
          fill="white"
          opacity="0.22"
        />

        {/* Bulb Base / Neck */}
        <rect x="46" y="98" width="28" height="6" rx="3" fill="url(#baseMetal)" />
        <rect x="49" y="105" width="22" height="5" rx="2.5" fill="url(#baseMetal)" />
        <rect x="53" y="111" width="14" height="4" rx="2" fill="#64748b" />

        {/* Face Elements */}
        {state === 'celebrating' || state === 'happy' ? (
          // Celebrating: Star / Curved happy eyes & big joyful smile
          <g>
            <path
              d="M38 52C40 47 48 47 50 52"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M70 52C72 47 80 47 82 52"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Joyful open mouth */}
            <path
              d="M48 62C48 62 60 74 72 62"
              fill="#fb7185"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Rosy cheeks */}
            <circle cx="34" cy="58" r="5" fill="#f43f5e" opacity="0.4" />
            <circle cx="86" cy="58" r="5" fill="#f43f5e" opacity="0.4" />
          </g>
        ) : state === 'thinking' ? (
          // Thinking: Eyes looking up & pondering mouth
          <g>
            {/* Left Eye looking up */}
            <circle cx="44" cy="50" r="7" fill="white" />
            <circle cx="46" cy="47" r="3.5" fill="#1e1b4b" />
            <circle cx="47" cy="46" r="1.5" fill="white" />

            {/* Right Eye looking up */}
            <circle cx="76" cy="50" r="7" fill="white" />
            <circle cx="78" cy="47" r="3.5" fill="#1e1b4b" />
            <circle cx="79" cy="46" r="1.5" fill="white" />

            {/* Inquisitive / Wavy mouth */}
            <path
              d="M54 66C57 63 63 68 66 65"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Lightbulb glowing filament inside head */}
            <path
              d="M52 38L60 28L68 38"
              stroke="url(#glowWarm)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : state === 'oops' ? (
          // Oops: Encouraging, supportive look
          <g>
            <circle cx="44" cy="52" r="6" fill="white" />
            <circle cx="44" cy="52" r="3" fill="#1e1b4b" />
            <path
              d="M72 49L82 55"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Encouraging slight smile */}
            <path
              d="M52 65C56 68 64 68 68 65"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        ) : (
          // Idle state: Big shiny eyes, gentle cute smile
          <g>
            {/* Left Eye */}
            <circle cx="44" cy="52" r="7" fill="white" />
            <circle cx="44" cy="52" r="4" fill="#0f172a" />
            <circle cx="42" cy="50" r="1.8" fill="white" />

            {/* Right Eye */}
            <circle cx="76" cy="52" r="7" fill="white" />
            <circle cx="76" cy="52" r="4" fill="#0f172a" />
            <circle cx="74" cy="50" r="1.8" fill="white" />

            {/* Warm smile */}
            <path
              d="M52 64C56 69 64 69 68 64"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Rosy blush */}
            <circle cx="34" cy="60" r="4" fill="#f43f5e" opacity="0.3" />
            <circle cx="86" cy="60" r="4" fill="#f43f5e" opacity="0.3" />
          </g>
        )}
      </svg>
    </div>
  );
}
