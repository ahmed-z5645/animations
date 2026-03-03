const canvas = document.getElementById('bioCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function init() {
    canvas.width = 1000;
    canvas.height = 800;
    width = canvas.width;
    height = canvas.height;
    
    // Background cytoplasm
    for(let i=0; i<60; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            speed: Math.random() * 0.4 + 0.1
        });
    }
    requestAnimationFrame(animate);
}

function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function drawCytoplasm(time) {
    ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
    particles.forEach((p, i) => {
        p.y -= p.speed;
        p.x += Math.sin(time / 1000 + i) * 0.3;
        if (p.y < -10) p.y = height + 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawDNA(time, isTranscribing) {
    const dnaY = 650;
    const amplitude = 35;
    const frequency = 0.015;
    const phaseShift = time / 800;

    // The promoter region glows when the complex is docked
    if (isTranscribing) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
    }

    ctx.lineWidth = 3;
    for (let x = -50; x < width + 50; x += 30) {
        const y1 = dnaY + Math.sin(x * frequency + phaseShift) * amplitude;
        const y2 = dnaY + Math.sin(x * frequency + phaseShift + Math.PI) * amplitude;

        ctx.strokeStyle = `rgba(100, 116, 139, 0.4)`;
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2); ctx.stroke();

        ctx.fillStyle = isTranscribing && x > 400 && x < 600 ? '#7dd3fc' : '#475569';
        ctx.beginPath(); ctx.arc(x, y1, 5, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = isTranscribing && x > 400 && x < 600 ? '#38bdf8' : '#334155';
        ctx.beginPath(); ctx.arc(x, y2, 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
}

function drawProtein(x, y, radius, color, time, offset) {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const distortion = Math.sin(angle * 3 + time / 300 + offset) * 6;
        const r = radius + distortion;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        if (angle === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    drawCytoplasm(time);

    // 6-second biological timeline
    const loopDuration = 6000; 
    const t = (time % loopDuration) / loopDuration;
    
    let galX, galY, vpX, vpY, gfpX, gfpY, gfpScale = 0, gfpOpacity = 0;
    let isTranscribing = false;

    // Timeline Math
    if (t < 0.25) {
        // 1. Approach and Complexation
        const p = easeInOut(t / 0.25);
        galX = lerp(200, 465, p); galY = lerp(150, 250, p);
        vpX = lerp(800, 535, p);  vpY = lerp(150, 250, p);
    } else if (t < 0.5) {
        // 2. Descend to DNA
        const p = easeInOut((t - 0.25) / 0.25);
        galX = 465; vpX = 535;
        galY = lerp(250, 600, p); vpY = lerp(250, 600, p);
    } else if (t < 0.75) {
        // 3. Docking & GFP Expression
        const p = (t - 0.5) / 0.25;
        galX = 465; vpX = 535;
        galY = 600; vpY = 600;
        isTranscribing = true;
        
        gfpScale = easeInOut(p);
        gfpOpacity = 1;
        gfpX = 500; gfpY = 600;
    } else {
        // 4. GFP Release & Complex Dissociation
        const p = easeInOut((t - 0.75) / 0.25);
        
        // Complex separates and floats back up to reset loop
        galX = lerp(465, 200, p); galY = lerp(600, 150, p);
        vpX = lerp(535, 800, p);  vpY = lerp(600, 150, p);
        
        // GFP floats away
        gfpScale = 1;
        gfpOpacity = 1 - p; // Fades out as it leaves
        gfpX = 500 + Math.sin(p * Math.PI * 4) * 30; // Wobbles upward
        gfpY = lerp(600, 50, p);
    }

    drawDNA(time, isTranscribing);

    // Draw GAL4-DBD (Cyan)
    drawProtein(galX, galY, 35, 'rgba(56, 189, 248, 0.9)', time, 0);
    
    // Draw VP16 (Purple)
    drawProtein(vpX, vpY, 35, 'rgba(192, 132, 252, 0.9)', time, Math.PI);

    // Draw new GFP (Fluorescent Green) if it exists
    if (gfpScale > 0) {
        ctx.save();
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 40;
        ctx.globalAlpha = gfpOpacity;
        drawProtein(gfpX, gfpY, 28 * gfpScale, '#22c55e', time, 100);
        ctx.restore();
    }

    requestAnimationFrame(animate);
}

init();