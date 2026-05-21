/* PIcon — Single-file icon set, mirrors the design-system handoff icon set.
 * Use: <PIcon name="home" size={20} /> */
const stroke = (sw = 1.8) => ({ stroke: 'currentColor', strokeWidth: sw, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' });
const fill = { fill: 'currentColor' };

const PATHS = {
  home:    (s) => (<><path d="M3 11.5 12 4l9 7.5" {...stroke(s)} /><path d="M5 10v9.5h5.5V14h3v5.5H19V10" {...stroke(s)} /></>),
  user:    (s) => (<><circle cx="12" cy="8" r="3.5" {...stroke(s)} /><path d="M5 20c1.5-3.5 4.4-5 7-5s5.5 1.5 7 5" {...stroke(s)} /></>),
  users:   (s) => (<><circle cx="9" cy="9" r="3.2" {...stroke(s)} /><circle cx="17" cy="10.5" r="2.6" {...stroke(s)} /><path d="M3 19c1.2-3 3.6-4.3 6-4.3s4.8 1.3 6 4.3" {...stroke(s)} /><path d="M21 18.5c-.6-2-2.2-3-4-3.3" {...stroke(s)} /></>),
  shield:  (s) => (<><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6l8-3z" {...stroke(s)} /><path d="M9 12l2.2 2.2L15 10.4" {...stroke(s)} /></>),
  settings:(s) => (<><circle cx="12" cy="12" r="3" {...stroke(s)} /><path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" {...stroke(s)} /></>),
  search:  (s) => (<><circle cx="11" cy="11" r="6.2" {...stroke(s)} /><path d="m20 20-4.2-4.2" {...stroke(s)} /></>),
  bell:    (s) => (<><path d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4L6 16z" {...stroke(s)} /><path d="M10 19a2 2 0 0 0 4 0" {...stroke(s)} /></>),
  heart:   (s, filled) => filled
    ? <path d="M12 20s-7-4.4-9.3-9c-1.5-3 .7-7 4.3-7 2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.6 0 5.8 4 4.3 7C19 15.6 12 20 12 20z" {...fill} />
    : <path d="M12 20s-7-4.4-9.3-9c-1.5-3 .7-7 4.3-7 2 0 3.6 1.2 5 3 1.4-1.8 3-3 5-3 3.6 0 5.8 4 4.3 7C19 15.6 12 20 12 20z" {...stroke(s)} />,
  comment: (s) => (<path d="M5 6h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" {...stroke(s)} />),
  repost:  (s) => (<><path d="M5 9V7a2 2 0 0 1 2-2h10l-2-2m2 2 2 2" {...stroke(s)} /><path d="M19 15v2a2 2 0 0 1-2 2H7l2 2m-2-2-2-2" {...stroke(s)} /></>),
  share:   (s) => (<><path d="M12 4v11" {...stroke(s)} /><path d="m8 8 4-4 4 4" {...stroke(s)} /><path d="M5 14v5h14v-5" {...stroke(s)} /></>),
  image:   (s) => (<><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" {...stroke(s)} /><circle cx="9" cy="10" r="1.5" {...stroke(s)} /><path d="m5 17 4-4 4 4 3-3 3 3" {...stroke(s)} /></>),
  sun:     (s) => (<><circle cx="12" cy="12" r="4" {...stroke(s)} /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" {...stroke(s)} /></>),
  moon:    (s) => (<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...stroke(s)} />),
  plus:    (s) => (<><path d="M12 5v14M5 12h14" {...stroke(s)} /></>),
  close:   (s) => (<><path d="m6 6 12 12M18 6 6 18" {...stroke(s)} /></>),
  check:   (s) => (<path d="m5 12 4.5 4.5L19 7" {...stroke(s)} />),
  mail:    (s) => (<><rect x="3.5" y="5.5" width="17" height="13" rx="2.5" {...stroke(s)} /><path d="m4 7 8 6 8-6" {...stroke(s)} /></>),
  lock:    (s) => (<><rect x="5.5" y="11" width="13" height="9" rx="2" {...stroke(s)} /><path d="M8 11V8a4 4 0 0 1 8 0v3" {...stroke(s)} /></>),
  eye:     (s) => (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" {...stroke(s)} /><circle cx="12" cy="12" r="2.5" {...stroke(s)} /></>),
  eyeOff:  (s) => (<><path d="m4 4 16 16" {...stroke(s)} /><path d="M9.5 5.5c.8-.3 1.6-.5 2.5-.5 6.5 0 10 7 10 7s-1.1 2.1-3 4M14 14a2.5 2.5 0 0 1-3.5-3.5M6 7c-2.4 1.8-4 5-4 5s3.5 7 10 7c1.6 0 3-.4 4.2-1" {...stroke(s)} /></>),
  chevronDown:  (s) => (<path d="m7 10 5 5 5-5" {...stroke(s)} />),
  chevronRight: (s) => (<path d="m10 7 5 5-5 5" {...stroke(s)} />),
  chevronLeft:  (s) => (<path d="m14 7-5 5 5 5" {...stroke(s)} />),
  arrowRight:   (s) => (<><path d="M5 12h14" {...stroke(s)} /><path d="m14 6 6 6-6 6" {...stroke(s)} /></>),
  arrowUp:      (s) => (<><path d="M12 19V5" {...stroke(s)} /><path d="m6 11 6-6 6 6" {...stroke(s)} /></>),
  play:    (s) => (<path d="M8 5v14l11-7z" {...stroke(s)} />),
  dots:    () => (<><circle cx="6"  cy="12" r="1.4" {...fill} /><circle cx="12" cy="12" r="1.4" {...fill} /><circle cx="18" cy="12" r="1.4" {...fill} /></>),
  cap:     (s) => (<><path d="m3 9 9-4 9 4-9 4-9-4z" {...stroke(s)} /><path d="M7 11v4c0 1.5 2.5 2.5 5 2.5s5-1 5-2.5v-4" {...stroke(s)} /></>),
  pencil:  (s) => (<path d="M4 20h4l10-10-4-4L4 16v4z" {...stroke(s)} />),
  trash:   (s) => (<path d="M5 7h14M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" {...stroke(s)} />),
  upload:  (s) => (<><path d="M12 16V4" {...stroke(s)} /><path d="m7 9 5-5 5 5" {...stroke(s)} /><path d="M5 16v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" {...stroke(s)} /></>),
  book:    (s) => (<><path d="M6 4h11a2 2 0 0 1 2 2v13H8a2 2 0 0 1-2-2V4z" {...stroke(s)} /><path d="M6 17a2 2 0 0 1 2-2h11" {...stroke(s)} /></>),
  chart:   (s) => (<><path d="M4 19V5M4 19h16" {...stroke(s)} /><rect x="7" y="11" width="3" height="6" {...stroke(s)} /><rect x="12" y="8" width="3" height="9" {...stroke(s)} /><rect x="17" y="13" width="3" height="4" {...stroke(s)} /></>),
  flag:    (s) => (<><path d="M5 4v17" {...stroke(s)} /><path d="M5 4h11l-2 4 2 4H5" {...stroke(s)} /></>),
  calendar:(s) => (<><rect x="4" y="5" width="16" height="15" rx="2" {...stroke(s)} /><path d="M4 9h16M9 3v4M15 3v4" {...stroke(s)} /></>),
  file:    (s) => (<><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" {...stroke(s)} /><path d="M14 3v4h4" {...stroke(s)} /></>),
  info:    (s) => (<><circle cx="12" cy="12" r="9" {...stroke(s)} /><path d="M12 11v6M12 8v.5" {...stroke(s)} /></>),
  alert:   (s) => (<><path d="M12 3l10 17H2L12 3z" {...stroke(s)} /><path d="M12 10v5M12 17v.5" {...stroke(s)} /></>),
  verified:(s) => (<><path d="M12 3l2.5 1.4 3-.3 1.2 2.6 2.3 1.8-.8 2.9.8 2.9-2.3 1.8-1.2 2.6-3-.3L12 19l-2.5-1.4-3 .3-1.2-2.6L3 13.5l.8-2.9L3 7.7l2.3-1.8 1.2-2.6 3 .3L12 3z" {...stroke(s)} /><path d="m8.5 12 2.5 2.5L16 9.5" {...stroke(s)} /></>),
  logout:  (s) => (<><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" {...stroke(s)} /><path d="m16 8 4 4-4 4" {...stroke(s)} /><path d="M20 12H9" {...stroke(s)} /></>),
};

export function PIcon({ name, size = 20, filled = false, strokeWidth = 1.8, className, style, color, ...rest }) {
  const draw = PATHS[name] || PATHS.info;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`picon ${className || ''}`}
      style={{ display: 'inline-block', color, flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {draw(strokeWidth, filled)}
    </svg>
  );
}
