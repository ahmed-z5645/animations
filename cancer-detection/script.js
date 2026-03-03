const canvas = document.getElementById('bioCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Cluster data for multiple GFP yields
const gfpCluster = [
    { dx: -45, dy: 5, s: 0.9, phase: 0 },
    { dx: -15, dy: -20, s: 1.1, phase: 1 },
    { dx: 25, dy: -5, s: 0.85, phase: 2 },
    { dx: 50, dy: 15, s: 1.0, phase: 3 },
    { dx: 5, dy: 20, s: 0.8, phase: 4 }
];

function init() {
    // 720p HD internal resolution (16:9)
    canvas.width = 1280;
    canvas.height = 720;
    width = canvas.width;
    height = canvas.height;
    
    // Background cytoplasm
    for(let i=0; i<80; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            speed: Math.random() * 0.4 + 0.1
        });
    }
    requestAnimationFrame(animate);
}

function lerp(start, end, t) { return start * (1 - t) + end * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

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
    const dnaY = 600; // Adjusted for 720p height
    const amplitude = 35;
    const frequency = 0.015;
    const phaseShift = time / 800;

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

        // Glow region centered at x=640
        ctx.fillStyle = isTranscribing && x > 500 && x < 780 ? '#7dd3fc' : '#475569';
        ctx.beginPath(); ctx.arc(x, y1, 5, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = isTranscribing && x > 500 && x < 780 ? '#38bdf8' : '#334155';
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

function drawMathOverlay(eq1Opacity, eq2Opacity) {
    ctx.textAlign = "center";
    ctx.shadowBlur = 0;
    
    if (eq1Opacity > 0) {
        ctx.fillStyle = `rgba(148, 163, 184, ${eq1Opacity})`;
        ctx.font = "italic 400 24px 'Inter', sans-serif";
        ctx.fillText("Rate = k_complexation × [Gal4DBD] × [VP16]", width / 2, 80);
    }
    
    if (eq2Opacity > 0) {
        ctx.fillStyle = `rgba(56, 189, 248, ${eq2Opacity})`; 
        ctx.font = "italic 400 24px 'Inter', sans-serif";
        ctx.fillText("Rate_transcription = k_trsc × ([Reg]/K)^H / (1 + ([Reg]/K)^H)", width / 2, 680);
    }
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    drawCytoplasm(time);

    const loopDuration = 6000; 
    const t = (time % loopDuration) / loopDuration;
    
    let galX, galY, vpX, vpY;
    let gfpScale = 0, gfpOpacity = 0;
    let isTranscribing = false;
    let eq1Opacity = 0, eq2Opacity = 0;

    // Center X is 640
    // 1. Complexation
    if (t < 0.25) {
        const p = easeInOut(t / 0.25);
        galX = lerp(300, 605, p); galY = lerp(150, 250, p);
        vpX = lerp(980, 675, p);  vpY = lerp(150, 250, p);
        eq1Opacity = Math.sin(p * Math.PI); 
    } 
    // 2. Descend to DNA
    else if (t < 0.5) {
        const p = easeInOut((t - 0.25) / 0.25);
        galX = 605; vpX = 675;
        galY = lerp(250, 550, p); vpY = lerp(250, 550, p);
    } 
    // 3. Docking & Expression
    else if (t < 0.75) {
        const p = (t - 0.5) / 0.25;
        galX = 605; vpX = 675;
        galY = 550; vpY = 550;
        
        isTranscribing = true;
        gfpScale = easeInOut(p);
        gfpOpacity = 1;
        eq2Opacity = Math.sin(p * Math.PI); 
    } 
    // 4. Release Multiple GFPs & Reset
    else {
        const p = easeInOut((t - 0.75) / 0.25);
        
        galX = lerp(605, 300, p); galY = lerp(550, 150, p);
        vpX = lerp(675, 980, p);  vpY = lerp(550, 150, p);
        
        gfpScale = 1;
        gfpOpacity = 1 - p; 
    }

    drawDNA(time, isTranscribing);
    drawMathOverlay(eq1Opacity, eq2Opacity);

    // Draw GAL4-DBD & VP16
    drawProtein(galX, galY, 35, 'rgba(56, 189, 248, 0.9)', time, 0);
    drawProtein(vpX, vpY, 35, 'rgba(192, 132, 252, 0.9)', time, Math.PI);

    // Draw the burst of GFP Proteins
    if (gfpScale > 0) {
        ctx.save();
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 25;
        ctx.globalAlpha = gfpOpacity;
        
        gfpCluster.forEach(gfp => {
            let currentX, currentY;
            if (t < 0.75) {
                // Growing at the docking site
                currentX = 640 + (gfp.dx * gfpScale);
                currentY = 530 + (gfp.dy * gfpScale);
            } else {
                // Floating away upwards
                const floatP = easeInOut((t - 0.75) / 0.25);
                currentX = 640 + gfp.dx + Math.sin(floatP * Math.PI * 4 + gfp.phase) * 30;
                currentY = 530 + gfp.dy - (floatP * 400 * gfp.s);
            }
            
            drawProtein(currentX, currentY, 18 * gfpScale * gfp.s, '#22c55e', time, gfp.phase * 50);
        });
        
        ctx.restore();
    }

    requestAnimationFrame(animate);
}

init();