const canvas = document.getElementById('syncCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function init() {
    canvas.width = 1000;
    canvas.height = 800;
    width = canvas.width;
    height = canvas.height;
    requestAnimationFrame(animate);
}

function drawModernLaptop(x, y) {
    // 1. Screen Bezel
    ctx.fillStyle = '#1e293b'; 
    ctx.beginPath();
    ctx.roundRect(x - 90, y - 105, 180, 110, 8);
    ctx.fill();

    // 2. Inner Glowing Screen
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x - 85, y - 100, 170, 100, 4);
    ctx.fill();

    // Abstract Sync UI on screen
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 50);
    ctx.lineTo(x + 20, y - 50);
    ctx.moveTo(x - 10, y - 35);
    ctx.lineTo(x + 10, y - 35);
    ctx.stroke();

    // 3. Laptop Base
    ctx.fillStyle = '#cbd5e1'; 
    ctx.beginPath();
    ctx.roundRect(x - 105, y + 5, 210, 14, [2, 2, 8, 8]);
    ctx.fill();

    // Trackpad Indent
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(x - 25, y + 5, 50, 5, [0, 0, 4, 4]);
    ctx.fill();
}

function drawFile(x, y, scale, opacity, lineColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    // Document Body
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(148, 163, 184, 0.3)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(-20, -25, 40, 50, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Folded Corner
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(8, -25);
    ctx.lineTo(20, -13);
    ctx.lineTo(8, -13);
    ctx.closePath();
    ctx.fill();

    // Data Lines
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.roundRect(-10, -5, 20, 4, 2);
    ctx.roundRect(-10, 5, 14, 4, 2);
    ctx.roundRect(-10, 15, 20, 4, 2);
    ctx.fill();

    ctx.restore();
}

// Ease function for buttery smooth acceleration/deceleration
function cubicEaseInOut(p) {
    return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

function renderMovingFile(time, startX, endX, startY, arcHeight, timeOffset, lineColor) {
    const loopDuration = 2400; // 2.4 seconds per individual transfer
    const t = ((time + timeOffset) % loopDuration) / loopDuration;

    // Visible window: file only exists between 10% and 90% of its specific loop
    if (t > 0.1 && t < 0.9) {
        const progress = (t - 0.1) / 0.8;
        const smoothP = cubicEaseInOut(progress);

        const x = startX + (endX - startX) * smoothP;
        const y = startY + Math.sin(smoothP * Math.PI) * arcHeight; 

        // Scale & Fade logic (pop in/out of the laptops)
        let scale = 1.3;
        let opacity = 1;

        if (progress < 0.15) {
            scale = (progress / 0.15) * 1.3;
            opacity = progress / 0.15;
        } else if (progress > 0.85) {
            scale = ((1 - progress) / 0.15) * 1.3;
            opacity = (1 - progress) / 0.15;
        }

        drawFile(x, y, scale, opacity, lineColor);
    }
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    const leftNodeX = width * 0.25;
    const rightNodeX = width * 0.75;
    const nodeY = height / 2 + 30; // Centered vertically

    // Draw the devices
    drawModernLaptop(leftNodeX, nodeY);
    drawModernLaptop(rightNodeX, nodeY);

    const fileStartY = nodeY - 50;

    // File 1: Left to Right (Blue lines)
    // Offset is 0
    renderMovingFile(time, leftNodeX, rightNodeX, fileStartY, -150, 0, '#3b82f6');

    // File 2: Right to Left (Cyan lines)
    // Offset by exactly half the loop duration (1200ms) for perfect symmetry
    renderMovingFile(time, rightNodeX, leftNodeX, fileStartY, -150, 1200, '#06b6d4');

    requestAnimationFrame(animate);
}

init();