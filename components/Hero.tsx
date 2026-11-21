// An empty park bench under a single lamp, drawn in SVG so it is crisp at every size,
// loads instantly, and carries no image weight. Decorative: the heading carries the meaning.

const stars: [number, number, number][] = [
  [120, 90, 1.2], [260, 160, 0.9], [410, 70, 1.1], [520, 210, 0.8], [650, 120, 1.3],
  [780, 60, 0.9], [880, 180, 1], [990, 95, 1.2], [1090, 150, 0.8], [1190, 70, 1],
  [1280, 190, 1.1], [1370, 110, 0.9], [1460, 60, 1.3], [1540, 170, 0.9], [190, 250, 0.8],
  [340, 290, 1], [720, 280, 0.8], [940, 300, 0.9], [60, 180, 1], [1050, 40, 0.8],
];

export default function Hero() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#090b0d" />
          <stop offset="0.6" stopColor="#12161b" />
          <stop offset="1" stopColor="#1b2128" />
        </linearGradient>
        <radialGradient id="lampGlow" cx="1520" cy="262" r="620" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e5a850" stopOpacity="0.5" />
          <stop offset="0.25" stopColor="#e5a850" stopOpacity="0.2" />
          <stop offset="0.6" stopColor="#e5a850" stopOpacity="0.05" />
          <stop offset="1" stopColor="#e5a850" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e5a850" stopOpacity="0.32" />
          <stop offset="1" stopColor="#e5a850" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14181d" />
          <stop offset="1" stopColor="#0b0d10" />
        </linearGradient>
        <linearGradient id="mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3038" stopOpacity="0" />
          <stop offset="0.5" stopColor="#2a3038" stopOpacity="0.35" />
          <stop offset="1" stopColor="#2a3038" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#111316" stopOpacity="0.82" />
          <stop offset="0.55" stopColor="#111316" stopOpacity="0.3" />
          <stop offset="1" stopColor="#111316" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1600" height="900" fill="url(#sky)" />

      {stars.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#aeb8c4" opacity="0.45" />
      ))}

      {/* far tree line */}
      <path
        d="M0 560 C60 520 90 470 140 500 C190 420 240 440 270 500 C330 440 380 430 430 500 C480 470 520 440 560 490 C620 430 690 450 720 510 C780 470 840 450 880 505 C940 450 1000 470 1030 520 C1090 480 1150 470 1190 530 L1190 740 L0 740 Z"
        fill="#0d1014"
      />
      {/* nearer tree masses, left side */}
      <path
        d="M0 470 C50 400 120 380 170 430 C210 360 300 340 340 420 C400 380 450 420 470 480 C510 450 560 470 580 520 L580 760 L0 760 Z"
        fill="#0a0c0f"
      />

      <rect x="0" y="560" width="1600" height="120" fill="url(#mist)" />

      {/* ground */}
      <rect x="0" y="722" width="1600" height="178" fill="url(#ground)" />

      {/* lamp */}
      <g className="lamp-glow">
        <rect x="0" y="0" width="1600" height="900" fill="url(#lampGlow)" />
      </g>
      <ellipse cx="1390" cy="734" rx="470" ry="46" fill="url(#pool)" />

      <rect x="1516" y="262" width="8" height="468" fill="#0b0d10" />
      <rect x="1510" y="724" width="20" height="10" fill="#0b0d10" />
      <path d="M1496 262 L1544 262 L1536 238 Q1520 226 1504 238 Z" fill="#0b0d10" />
      <ellipse cx="1520" cy="266" rx="22" ry="7" fill="#f0bd6b" opacity="0.95" />
      <ellipse cx="1520" cy="266" rx="40" ry="14" fill="#e5a850" opacity="0.25" />

      {/* the bench, empty */}
      <g>
        <ellipse cx="1300" cy="728" rx="170" ry="9" fill="#050607" opacity="0.7" />
        {/* legs */}
        <rect x="1178" y="668" width="10" height="58" fill="#0d1014" />
        <rect x="1412" y="668" width="10" height="58" fill="#0d1014" />
        <rect x="1176" y="664" width="14" height="6" fill="#0d1014" />
        <rect x="1410" y="664" width="14" height="6" fill="#0d1014" />
        {/* backrest */}
        <rect x="1166" y="584" width="268" height="14" rx="2" fill="#12161b" />
        <rect x="1166" y="608" width="268" height="14" rx="2" fill="#12161b" />
        <rect x="1166" y="582" width="9" height="86" fill="#0d1014" />
        <rect x="1425" y="582" width="9" height="86" fill="#0d1014" />
        {/* seat */}
        <rect x="1150" y="646" width="300" height="16" rx="2" fill="#161b21" />
        {/* lamp-facing rim light */}
        <path d="M1150 646 L1450 646" stroke="#e5a850" strokeOpacity="0.55" strokeWidth="1.5" />
        <path d="M1166 584 L1434 584" stroke="#e5a850" strokeOpacity="0.4" strokeWidth="1.2" />
        <path d="M1166 608 L1434 608" stroke="#e5a850" strokeOpacity="0.3" strokeWidth="1.2" />
      </g>

      {/* soft fall of leaves near the bench */}
      <g fill="#1c2229" opacity="0.9">
        <ellipse cx="1120" cy="742" rx="9" ry="3" transform="rotate(-18 1120 742)" />
        <ellipse cx="1478" cy="750" rx="8" ry="3" transform="rotate(14 1478 750)" />
        <ellipse cx="1050" cy="760" rx="7" ry="2.6" transform="rotate(8 1050 760)" />
      </g>

      {/* keeps the headline readable on wide screens */}
      <rect width="1600" height="900" fill="url(#scrim)" />
    </svg>
  );
}

export function BookCoverArt() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/book-cover.jpg"
      width={512}
      height={800}
      alt="Book cover: Not Alone at Midnight. Rain on a window at night, with street lamps glowing in the distance."
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
