const canvas = document.getElementById('proteinCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let alpha = 0;
let targetAlpha = 0;
const numAcids = 36; // Slightly fewer for a cleaner vertical fit
const acids = [];

// Clean biotech palette
const colors = ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'];

function init() {
    canvas.width = 1000;
    canvas.height = 800;
    width = canvas.width;
    height = canvas.height;

    acids.length = 0;
    for (let i = 0; i < numAcids; i++) {
        const spiralRadius = 55;
        const pitch = 18;
        const rotationSpeed = 0.8;

        acids.push({
            // Start State: Centered Horizontal Line
            x1: (width * 0.5) - (numAcids * 10) + (i * 20),
            y1: height / 2,
            
            // End State: Centered Alpha Helix
            x2: (width * 0.5) - (numAcids * 8) + (i * pitch),
            y2: height / 2 + Math.sin(i * rotationSpeed) * spiralRadius,
            z2: Math.cos(i * rotationSpeed) * spiralRadius,
            
            color: colors[i % colors.length],
            size: i % 3 === 0 ? 11 : 7
        });
    }
}

function lerp(a, b, t) { return a + (b - a) * t; }

function draw() {
    ctx.clearRect(0, 0, width, height);
    alpha += (targetAlpha - alpha) * 0.05;

    // 1. Draw thin connecting backbone
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    for (let i = 0; i < numAcids; i++) {
        const x = lerp(acids[i].x1, acids[i].x2, alpha);
        const y = lerp(acids[i].y1, acids[i].y2, alpha);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Draw Amino Acids
    acids.forEach((a) => {
        const x = lerp(a.x1, a.x2, alpha);
        const y = lerp(a.y1, a.y2, alpha);
        const z = lerp(0, a.z2, alpha);
        const scale = (z + 100) / 100;
        const currentSize = a.size * scale;

        ctx.beginPath();
        ctx.arc(x, y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        // 3D Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x - currentSize/3, y - currentSize/3, currentSize/4, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') targetAlpha = (targetAlpha === 0 ? 1 : 0);
});

init();
draw();