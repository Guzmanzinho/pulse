const PALETTES = [
  ['#FFD49A', '#F18A3D'], ['#C8E3FF', '#3D7EF1'], ['#D9CCFF', '#7C5AE6'],
  ['#FFC9D9', '#E0467C'], ['#C8F5DA', '#1F9D58'], ['#FFE2B3', '#C7831C'],
  ['#CFE9FF', '#1F6FE5'], ['#E4D6FF', '#6A4DD8'], ['#FFD0CC', '#D14034'],
];

function hash(s) {
  let h = 0;
  for (const c of s || '') h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}
function initials(name) {
  const parts = (name || '?').trim().split(/\s+/);
  return ((parts[0]?.[0] || '?') + (parts[1]?.[0] || '')).toUpperCase();
}

export function Avatar({ name = '?', size = 40, status, paletteIndex, ring, style, onClick }) {
  const idx = paletteIndex ?? (hash(name) % PALETTES.length);
  const [c1, c2] = PALETTES[idx];
  return (
    <div
      className="avatar"
      onClick={onClick}
      style={{
        width: size, height: size, fontSize: Math.round(size * 0.4),
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: ring ? `0 0 0 3px ${ring}` : undefined,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      aria-label={name}
    >
      {initials(name)}
      {status && (
        <span
          className="avatar__status"
          style={{
            width: Math.max(8, size * 0.22),
            height: Math.max(8, size * 0.22),
            background: status === 'online' ? '#22C55E' : '#94A3B8',
          }}
        />
      )}
    </div>
  );
}
