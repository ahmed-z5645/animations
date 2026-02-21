const canvas = document.getElementById('proteinCanvas');
const ctx = canvas.getContext('2d');

let width, height, currentState = 0, labelOpacity = 0;
let started = false;
const numAcids = 36;
const acids = [];
const colors = ['#1e3a8a', '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
const stateLabels = ["", "α-Helix", "", "β-Sheet"];

function init() {
    canvas.width = 1000;
    canvas.height = 800;
    width = canvas.width;
    height = canvas.height;

    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < numAcids; i++) {
        const xL = centerX - (numAcids * 10) + (i * 20);
        const xH = centerX - (numAcids * 8) + (i * 18);
        const yH = centerY + Math.sin(i * 0.8) * 55;
        const xB = centerX - (numAcids * 10) + (i * 22);
        const yB = centerY + (i % 2 === 0 ? -40 : 40);

        acids.push({
            states: [
                {x: xL, y: centerY, z: 0},
                {x: xH, y: yH, z: Math.cos(i * 0.8) * 55},
                {x: xL, y: centerY, z: 0},
                {x: xB, y: yB, z: 0}
            ],
            currX: xL, currY: centerY, currZ: 0,
            color: colors[i % colors.length],
            size: i % 3 === 0 ? 12 : 8
        });
    }
}

function startAnimation() {
    if (started) return;
    started = true;
    // 1750ms per state * 4 states = 7 second loop
    setInterval(() => {
        currentState = (currentState + 1) % 4;
        labelOpacity = 0;
    }, 1750);
}

function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Backbone
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f1f5f9';
    for (let i = 0; i < numAcids; i++) {
        const a = acids[i];
        const target = a.states[currentState];
        a.currX += (target.x - a.currX) * 0.18; 
        a.currY += (target.y - a.currY) * 0.18;
        a.currZ += (target.z - a.currZ) * 0.18;
        if (i === 0) ctx.moveTo(a.currX, a.currY);
        else ctx.lineTo(a.currX, a.currY);
    }
    ctx.stroke();

    // 2. State Label
    if (started && stateLabels[currentState] !== "") {
        labelOpacity += (1 - labelOpacity) * 0.12;
        ctx.font = "600 28px Inter, sans-serif";
        ctx.fillStyle = `rgba(30, 58, 138, ${labelOpacity})`;
        ctx.textAlign = "center";
        ctx.fillText(stateLabels[currentState], width / 2, height / 2 - 130);
    }

    // 3. Amino Acids
    acids.forEach(a => {
        const scale = (a.currZ + 100) / 100;
        const size = a.size * scale;
        ctx.beginPath();
        ctx.arc(a.currX, a.currY, size, 0, Math.PI * 2);
        ctx.fillStyle = a.color;
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(a.currX - size/3, a.currY - size/3, size/4, 0, Math.PI * 2);
        ctx.fill();
    });

    requestAnimationFrame(draw);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') startAnimation();
});

init();
draw();