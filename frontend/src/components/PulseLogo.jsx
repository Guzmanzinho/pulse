export function PulseLogo({ size = 28, color = 'var(--primary)', wordColor = 'var(--text-hi)', showWord = true }) {
  const w = Math.round(size * 1.15);
  const gap = Math.round(size * 0.28);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, lineHeight: 1 }}>
      <svg width={w} height={size} viewBox="0 0 46 40" fill="none" aria-label="Pulse">
        <path
          d="M2 22 H10 L14 12 L20 32 L26 6 L32 28 L36 22 H44"
          stroke={color}
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWord && (
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: Math.round(size * 0.95),
          letterSpacing: '-0.5px',
          color: wordColor,
        }}>Pulse</span>
      )}
    </span>
  );
}
