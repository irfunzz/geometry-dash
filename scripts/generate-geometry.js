const fs = require('fs');

const width = 900;
const height = 260;
const groundY = 210;
const playerX = 120;
const playerSize = 28;

// timeline settings
const totalDuration = 20; // seconds of animation loop

// obstacles config: each obstacle has a spawnTime (s) and speed (duration to cross screen)
const obstacleCount = 8;
const obstacles = [];
for (let i = 0; i < obstacleCount; i++) {
  const spawn = 1 + i * 2; // spawn every 2s with offset
  const dur = 6 + Math.random() * 2; // how long it takes to travel across
  obstacles.push({ id: i, spawn, dur });
}

// choose some obstacles to be 'hit' (will disappear when player collides)
const hitIndices = [2, 5]; // indexes of obstacles that will be "hit" for demo

// player jump schedule: array of times when player jumps (in seconds)
const jumpTimes = [0.7, 3.2, 5.8, 8.3, 10.9, 13.4, 15.9];

function makeObstacleSVG(o) {
  const w = 20;
  const h = 24;
  // determine obstacle initial X and travel from width+h to -w
  const fromX = width + 40;
  const toX = -60;
  const travel = Math.abs(fromX - toX);
  const begin = `${o.spawn}s`;
  const dur = `${o.dur}s`;

  // compute collision time roughly when obstacle reaches playerX
  const timeToReachPlayer = (fromX - playerX) / travel * o.dur;
  const collisionTime = o.spawn + timeToReachPlayer;

  // if this obstacle is designated to be hit, schedule an opacity fade at collisionTime
  const willBeHit = hitIndices.includes(o.id);

  // respawn: after disappearing, set it to reappear after 3s
  const respawnDelay = 3; // seconds after disappearance

  const svg = `
  <g id="obs-${o.id}" transform="translate(0,0)">
    <rect x="0" y="${groundY - h}" width="${w}" height="${h}" fill="#ff4757" rx="3" ry="3">
      <animateTransform attributeName="transform" type="translate"
        from="${fromX} 0" to="${toX} 0" dur="${dur}" begin="${begin}" repeatCount="indefinite" />
    </rect>
    ${willBeHit ? `
    <!-- fade out at collision -->
    <animate attributeName="opacity" from="1" to="0" begin="${collisionTime}s" dur="0.15s" fill="freeze" />
    <!-- respawn later by resetting opacity back to 1 -->
    <animate attributeName="opacity" from="0" to="1" begin="${collisionTime + respawnDelay}s" dur="0.01s" fill="freeze" />
    ` : ''}
  </g>
  `;
  return svg;
}

function makePlayerSVG() {
  // player is a square that 'jumps' at scheduled jumpTimes
  // we'll generate multiple <animateTransform> elements that begin at each jump time
  let anims = '';
  jumpTimes.forEach((t) => {
    // jump arc via translateY animation (up then down)
    anims += `
    <animateTransform attributeName="transform" attributeType="XML" type="translate"
      values="0 0; 0 -80; 0 0" keyTimes="0;0.5;1" dur="0.7s" begin="${t}s" fill="freeze" />`;
  });

  const svg = `
  <g id="player" transform="translate(${playerX}, ${groundY - playerSize})">
    <rect width="${playerSize}" height="${playerSize}" rx="4" ry="4" fill="#00e676" />
    ${anims}
  </g>
  `;
  return svg;
}

// build svg parts
let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .bg { fill: #0b1020; }
      .ground { fill: #111827; }
    </style>
  </defs>

  <!-- background -->
  <rect width="100%" height="100%" class="bg" />

  <!-- parallax stars (simple) -->
  <g id="stars">
`;

// small static stars
for (let i = 0; i < 30; i++) {
  const sx = Math.random() * width;
  const sy = Math.random() * (groundY - 40);
  const r = Math.random() * 1.5 + 0.2;
  svg += `    <circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${r.toFixed(2)}" fill="#9ad0ff" opacity="0.6" />\n`;
}

svg += `  </g>\n`;

// ground
svg += `  <rect x="0" y="${groundY}" width="${width}" height="${height - groundY}" class="ground" />\n`;

// player
svg += makePlayerSVG();

// obstacles
obstacles.forEach((o) => {
  svg += makeObstacleSVG(o);
});

// overlay text / score (fake increasing via animate)
svg += `
  <g transform="translate(${width - 180}, 20)">
    <text x="0" y="0" font-family="monospace" font-size="18" fill="#e6f7ff">SCORE</text>
    <text x="0" y="24" font-family="monospace" font-size="20" fill="#fff">
      <tspan id="score">0</tspan>
      <animate id="inc" attributeName="textContent" from="0" to="999" dur="${totalDuration}s" begin="0s" repeatCount="indefinite" />
    </text>
  </g>
`;

svg += `\n</svg>`;

// ensure dist exists
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/geometry-dash.svg', svg);
console.log('✅ geometry-dash.svg generated in dist/ (duration', totalDuration, 's)');
