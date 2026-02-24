/**
 * Inline SVG icons — replaces all emoji usage across the app.
 * High-quality, polished inline SVGs with consistent design language.
 * Uses duotone/filled style for richer visual appearance.
 */

/* ───────────────────────── Brand Logos ───────────────────────── */

// Felicity logo — geometric "F" inside a rounded shield / squircle
export const FelicityLogo = ({ size = 28, className = '' }) => {
  const id = `felGrad_${size}`;
  const id2 = `felShine_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Felicity logo">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <radialGradient id={id2} cx="0.3" cy="0.2" r="0.8">
          <stop stopColor="#c7d2fe" stopOpacity="0.45" />
          <stop offset="1" stopColor="#c7d2fe" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Squircle background */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id})`} />
      {/* Subtle shine */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${id2})`} />
      {/* Stylised F letterform */}
      <path d="M20 16h24v6H28v6h13v6H28v14h-8V16z" fill="#fff" />
      {/* Spark accent — small diamond */}
      <path d="M46 14l2 4 2-4-2-4z" fill="#fbbf24" />
      <path d="M50 18l1.5 3 1.5-3-1.5-3z" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
};

// IIIT-H Banyan Tree — detailed silhouette with aerial roots and foliage
export const BanyanTree = ({ size = 40, className = '' }) => {
  const gid = `treeGrad_${size}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="IIIT Hyderabad">
      <defs>
        <linearGradient id={gid} x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      {/* Main canopy */}
      <ellipse cx="32" cy="20" rx="22" ry="14" fill={`url(#${gid})`} opacity="0.85" />
      {/* Inner foliage highlights */}
      <ellipse cx="26" cy="18" rx="10" ry="8" fill="#c4b5fd" opacity="0.35" />
      <ellipse cx="40" cy="17" rx="8" ry="7" fill="#c4b5fd" opacity="0.25" />
      <ellipse cx="32" cy="22" rx="6" ry="5" fill="#c4b5fd" opacity="0.2" />
      {/* Main trunk */}
      <path d="M29 30h6v22h-6z" fill="#7c3aed" />
      {/* Aerial roots */}
      <path d="M18 28c1 6 2 14 3 24h3c-1-10-2-18-3-23z" fill="#7c3aed" opacity="0.7" />
      <path d="M43 27c0 6 1 15 2 25h3c-1-10-2-19-3-24z" fill="#7c3aed" opacity="0.7" />
      <path d="M22 30c1 4 1 10 1.5 16h2.5c-.5-6-1-12-1.5-15z" fill="#7c3aed" opacity="0.5" />
      <path d="M39 30c0 4 .5 10 1 16h2.5c-.5-6-.5-12-1-15z" fill="#7c3aed" opacity="0.5" />
      {/* Ground line */}
      <path d="M10 56h44" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
};

/* ───────────────────────── UI Icons (duotone) ───────────────────────── */

// Shopping bag — Merchandise badge (duotone filled)
export const ShoppingBagIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <path d="M3.5 6.5L5.5 2.5h13l2 4v15a1.5 1.5 0 01-1.5 1.5H5a1.5 1.5 0 01-1.5-1.5v-15z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="3.5" y1="6.5" x2="20.5" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Clipboard / event — Event badge (duotone filled)
export const ClipboardIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <rect x="4" y="4" width="16" height="18" rx="2" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <rect x="8" y="2" width="8" height="4" rx="1.5" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Pin — pinned messages (filled pushpin)
export const PinIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <path d="M16 3H8a1 1 0 00-1 1v1l1.5 1.5V10l-3 3.5V15h5v6l1 1 1-1v-6h5v-1.5L14.5 10V6.5L16 5V4a1 1 0 00-1-1z" fill="currentColor" opacity="0.85" />
  </svg>
);

// Ticket — filled ticket stub with perforation
export const TicketIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2.5a1.5 1.5 0 100 3V17a2 2 0 01-2 2H5a2 2 0 01-2-2v-4.5a1.5 1.5 0 100-3V7z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" />
    <line x1="9" y1="5" x2="9" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0 3" />
    <line x1="9" y1="10" x2="9" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0 3" />
    <line x1="9" y1="16" x2="9" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0 3" />
  </svg>
);

// Check circle — success / confirmed (filled green)
export const CheckCircleIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.15" stroke="#22c55e" strokeWidth="1.5" />
    <path d="M8 12.5l2.5 2.5L16 9" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Hourglass — pending (filled amber)
export const HourglassIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <path d="M6.5 2h11v4.5c0 2.5-2 4.5-3.5 5.5 1.5 1 3.5 3 3.5 5.5V22h-11v-4.5c0-2.5 2-4.5 3.5-5.5C8.5 11 6.5 9 6.5 6.5V2z" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9.5 5h5l-2.5 4L9.5 5z" fill="#f59e0b" opacity="0.5" />
    <line x1="6.5" y1="2" x2="17.5" y2="2" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <line x1="6.5" y1="22" x2="17.5" y2="22" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// Lightbulb — hint / suggestion (duotone)
export const LightbulbIcon = ({ size = 14, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
    <path d="M12 2a7 7 0 00-4.5 12.35c.65.55 1 1.2 1.1 1.95l.15 1.2h6.5l.15-1.2c.1-.75.45-1.4 1.1-1.95A7 7 0 0012 2z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 18h6v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
    <line x1="12" y1="7" x2="12" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="10" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
