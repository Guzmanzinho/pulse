/* Portuguese (PT) relative time formatter. */
export function formatRelative(when) {
  const t = typeof when === 'number' ? when : new Date(when).getTime();
  const diff = Date.now() - t;
  const s = Math.round(diff / 1000);
  if (s < 30) return 'agora';
  if (s < 60) return `${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d < 7)  return `${d} d`;
  const w = Math.round(d / 7);
  if (w < 5)  return `${w} sem`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo} mes${mo === 1 ? '' : 'es'}`;
  const y = Math.round(d / 365);
  return `${y} ano${y === 1 ? '' : 's'}`;
}

const DT = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const DTT = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export function formatDate(when)     { return DT.format(typeof when === 'number' ? new Date(when) : new Date(when)); }
export function formatDateTime(when) { return DTT.format(typeof when === 'number' ? new Date(when) : new Date(when)); }
