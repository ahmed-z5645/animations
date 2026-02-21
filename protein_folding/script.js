const canvas = document.getElementById('proteinCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let alpha = 0;
let targetAlpha = 0;
const numAcids = 40;
const acids = [];

// Distinctive "Protein" palette (Purples/Lavenders)
const colors = ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'];

function init() {
    canvas.width = 1000;
    canvas.height = 800;
    width = canvas.width;
    height = canvas.height;

    acids.length = 0;
    for (let i = 0; i < numAcids; i++) {
        // Helix parameters
        const spiralRadius = 55;
        const pitch = 18;
        const rotationSpeed = 0.7;

        acids.push({
            // Start State: Linear segmented line
            x1: (width * 0.1) + (i * 22),
            y1: height / 2,
            
            // End State: Alpha Helix coordinates
            x2: (width * 0.25) + (i * pitch),
            y2: height / 2 + Math.sin(i * rotationSpeed) * spiralRadius,
            z2: Math.cos(i * rotationSpeed) * spiralRadius,
            
            color: colors[i % colors.length],
            size: i % 4 === 0 ? 12 : 8 // Some "side chains" are larger
        });
    }
}

function lerp(a, b, t) { return a + (b - a) * t; }

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Smooth transition progress
    alpha += (targetAlpha - alpha) * 0.06;

    // Draw connecting segments first (to stay behind beads)
    ctx.lineWidth = 4;
    for (let i = 0; i < numAcids - 1; i++) {
        const a1 = acids[i];
        const a2 = acids[i+1];
        
        const x1 = lerp(a1.x1, a1.x2, alpha);
        const y1 = lerp(a1.y1, a1.y2, alpha);
        const x2 = lerp(a2.x1, a2.x2, alpha);
        const y2 = lerp(a2.y1, a2.y2, alpha);

        ctx.beginPath();
        ctx.strokeStyle = '#e2e8f0'; // Subtle backbone line
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    // Draw individual Amino Acids
    acids.forEach((a, i) => {
        const x = lerp(a.x1, a.x2, alpha);
        const y = lerp(a.y1, a.y2, alpha);
        
        // Simple Z-depth illusion
        const z = lerp(0, a.z2, alpha);
        const scale = (z + 100) / 100;
        const currentSize = a.size * scale;

        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        // High-end gloss for 3D feel
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - currentSize/3, y - currentSize/3, currentSize/4, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') targetAlpha = (targetAlpha === 0 ? 1 : 0);
    if (e.key === 'r') targetAlpha = 0;
});

init();
draw();