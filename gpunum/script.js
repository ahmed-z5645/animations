const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('editor-container');
const codeElement = document.getElementById('typing-text');

let canvasW, canvasH;
const textToType = "import gpunum";
let charIndex = 0;

// Set up Canvas dimensions
function resize() {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

// --- STEP 1: TYPING EFFECT ---
function typeEffect() {
    if (charIndex < textToType.length) {
        codeElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, 80); 
    } else {
        // Wait a second after typing before moving the text
        setTimeout(() => {
            container.classList.add('move-left');
            // Wait for the slide to progress before starting lines
            setTimeout(initAnimation, 400); 
        }, 800);
    }
}

// --- STEP 2: LINE INITIALIZATION ---
let lines = [];
let animationActive = false;

function initAnimation() {
    const centerY = canvasH / 2;
    const spacing = 110;
    // Start lines at 30% width to stay clear of the tucked text
    const startX = canvasW * 0.30; 

    for (let i = -2; i <= 2; i++) {
        lines.push({
            originY: centerY + (i * spacing),
            currentY: centerY + (i * spacing),
            x: startX,
            headX: startX,
            indent: Math.abs(i) * 110, // Staggering for the pyramid look
            color: i === 0 ? '#7c3aed' : '#cbd5e1', // Purple center, Light Gray neighbors
            isMain: i === 0
        });
    }

    // Sort so the Purple line (isMain) is drawn LAST (appears on top)
    lines.sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? 1 : -1));

    animationActive = true;
    animate();
}

// --- STEP 3: CORE ANIMATION LOOP ---
function animate() {
    if (!animationActive) return;
    ctx.clearRect(0, 0, canvasW, canvasH);
    
    const centerY = canvasH / 2;
    // Trigger the 45-degree turn 60% across the screen
    const diagonalTrigger = canvasW * 0.60; 
    const lineStartX = canvasW * 0.30;

    lines.forEach((line) => {
        ctx.beginPath();
        ctx.lineWidth = 10; 
        ctx.lineCap = 'round';
        ctx.strokeStyle = line.color;

        // Draw path from start
        ctx.moveTo(lineStartX, line.originY);

        let straightEnd = diagonalTrigger + line.indent;
        
        if (line.headX < straightEnd) {
            // Still in the straight parallel phase
            ctx.lineTo(line.headX, line.originY);
        } else {
            // 45-degree snap phase
            ctx.lineTo(straightEnd, line.originY);
            
            let distPastTrigger = line.headX - straightEnd;
            let targetYDist = centerY - line.originY;
            
            // Y moves at the same pace as X to maintain a 45-degree angle
            let yOffset = Math.sign(targetYDist) * distPastTrigger;
            
            // Check if we've hit the center convergence line
            if (Math.abs(yOffset) >= Math.abs(targetYDist)) {
                // Flatten back out to a straight line
                ctx.lineTo(straightEnd + Math.abs(targetYDist), centerY);
                ctx.lineTo(line.headX, centerY);
                line.currentY = centerY;
            } else {
                // Moving diagonally
                ctx.lineTo(line.headX, line.originY + yOffset);
                line.currentY = line.originY + yOffset;
            }
        }
        ctx.stroke();

        // DRAW THE HEAD CIRCLE
        ctx.beginPath();
        ctx.arc(line.headX, line.currentY, 14, 0, Math.PI * 2);
        ctx.fillStyle = line.color;
        ctx.fill();

        // Increment position (Slower for a cinematic feel)
        if (line.headX < canvasW * 0.95) {
            line.headX += 6; 
        }
    });

    requestAnimationFrame(animate);
}

// Kick off the sequence
typeEffect();

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.key === 'r') {
        // Reset Text
        charIndex = 0;
        codeElement.textContent = "";
        container.classList.remove('move-left');
        
        // Reset Lines
        animationActive = false;
        lines = [];
        
        // Restart Sequence
        typeEffect();
    }
});