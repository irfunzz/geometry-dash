const fs = require('fs');
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
svg += ` <circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${r.toFixed(2)}" fill="#9ad0ff" opacity="0.6" />\n`;
}


svg += ` </g>\n`;


// ground
svg += ` <rect x="0" y="${groundY}" width="${width}" height="${height - groundY}" class="ground" />\n`;


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
