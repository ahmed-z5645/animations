const canvas = document.getElementById('mockupCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function init() {
    canvas.width = 1280;
    canvas.height = 720;
    width = canvas.width;
    height = canvas.height;
    requestAnimationFrame(animate);
}

// Helper to draw CV corner brackets
function drawBoundingBox(x, y, size, color) {
    const bracketLen = 20;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    // Top Left
    ctx.beginPath(); ctx.moveTo(x, y + bracketLen); ctx.lineTo(x, y); ctx.lineTo(x + bracketLen, y); ctx.stroke();
    // Top Right
    ctx.beginPath(); ctx.moveTo(x + size - bracketLen, y); ctx.lineTo(x + size, y); ctx.lineTo(x + size, y + bracketLen); ctx.stroke();
    // Bottom Left
    ctx.beginPath(); ctx.moveTo(x, y + size - bracketLen); ctx.lineTo(x, y + size); ctx.lineTo(x + bracketLen, y + size); ctx.stroke();
    // Bottom Right
    ctx.beginPath(); ctx.moveTo(x + size - bracketLen, y + size); ctx.lineTo(x + size, y + size); ctx.lineTo(x + size, y + size - bracketLen); ctx.stroke();
}

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function animate(time) {
    ctx.clearRect(0, 0, width, height);
    
    // Background Grid for a subtle engineering aesthetic
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 2;
    for(let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for(let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    const cx = width / 2;
    const cy = height / 2;
    
    // Glasses Geometry
    const lensW = 320;
    const lensH = 220;
    const bridgeW = 60;
    const leftLensX = cx - (bridgeW / 2) - lensW;
    const rightLensX = cx + (bridgeW / 2);
    const lensY = cy - (lensH / 2);

    // --- LEFT LENS INTERIOR (The CV HUD) ---
    ctx.save();
    // Create clipping mask for the left lens
    ctx.beginPath();
    ctx.roundRect(leftLensX, lensY, lensW, lensH, 40);
    ctx.clip();

    // Darken the left lens slightly to represent the "smart" display
    ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
    ctx.fillRect(leftLensX, lensY, lensW, lensH);

    // Hazard Animation Math (4-second loop)
    const loopDuration = 4000;
    const t = (time % loopDuration) / loopDuration;
    
    // Hazard moves from far left to center of the left lens
    const startX = leftLensX - 100;
    const endX = leftLensX + (lensW / 2);
    
    let hazardX = startX;
    let boxScale = 1.5;
    let isDetected = false;

    if (t < 0.3) {
        // Drifting into view
        hazardX = startX + (endX - startX) * easeInOut(t / 0.3);
    } else if (t < 0.8) {
        // Paused in view, getting detected
        hazardX = endX;
        isDetected = true;
        // Box snaps tight
        const snapP = Math.min((t - 0.3) / 0.1, 1);
        boxScale = 1.5 - (0.5 * easeInOut(snapP));
    } else {
        // Drifting out
        const leaveP = easeInOut((t - 0.8) / 0.2);
        hazardX = endX + (300 * leaveP);
    }

    // Draw Hazard (A blurred shape representing an incoming object)
    ctx.fillStyle = '#cbd5e1';
    ctx.shadowColor = '#94a3b8';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(hazardX, cy, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw CV Tracking
    if (hazardX > leftLensX && hazardX < leftLensX + lensW) {
        const boxSize = 120 * boxScale;
        const boxX = hazardX - (boxSize / 2);
        const boxY = cy - (boxSize / 2);
        
        // Color shifts from scanning Cyan to alert Orange
        const cvColor = isDetected ? '#f97316' : '#0ea5e9';
        
        drawBoundingBox(boxX, boxY, boxSize, cvColor);

        // UI Text above the bounding box
        if (isDetected) {
            ctx.fillStyle = cvColor;
            ctx.font = "600 16px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("HAZARD DETECTED", hazardX, boxY - 15);
            
            // Subtle scanning line over the object
            const scanLineY = boxY + ((time / 10) % boxSize);
            ctx.fillStyle = 'rgba(249, 115, 22, 0.3)';
            ctx.fillRect(boxX, scanLineY, boxSize, 4);
        }
    }
    
    ctx.restore(); // Remove clipping mask

    // --- DRAW THE GLASSES FRAME ---
    ctx.strokeStyle = '#1e293b'; // Slate dark frame
    ctx.lineWidth = 16;
    ctx.lineJoin = 'round';

    // Left Lens Frame
    ctx.beginPath();
    ctx.roundRect(leftLensX, lensY, lensW, lensH, 40);
    ctx.stroke();

    // Right Lens Frame
    ctx.beginPath();
    ctx.roundRect(rightLensX, lensY, lensW, lensH, 40);
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(leftLensX + lensW, cy - 30);
    ctx.quadraticCurveTo(cx, cy - 50, rightLensX, cy - 30);
    ctx.stroke();

    // Arms extending outward (gives a subtle 3D depth)
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(leftLensX, cy - 30); ctx.lineTo(leftLensX - 100, cy - 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rightLensX + lensW, cy - 30); ctx.lineTo(rightLensX + lensW + 100, cy - 60); ctx.stroke();

    requestAnimationFrame(animate);
}

init();