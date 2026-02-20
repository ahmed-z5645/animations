const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('editor-container');
const codeElement = document.getElementById('typing-text');

let canvasW, canvasH;
const textToType = "import gpunum";
let charIndex = 0;

function resize() {
    canvasW = canvas.width = window.innerWidth;
    canvasH = canvas.height = window.innerHeight;
}
window.onresize = resize;
resize();

// --- 1. TYPING ---
function typeEffect() {
    if (charIndex < textToType.length) {
        codeElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeEffect, 80);
    } else {
        setTimeout(startTransition, 1000);
    }
}

function startTransition() {
    container.classList.add('move-left');
    setTimeout(initDots, 500);
}

// --- 2. DOTS AND MERGE LOGIC ---
let lines = [];
let state = "growing"; // states: growing, merging

function initDots() {
    const centerY = canvasH / 2;
    const spacing = 60;
    // We start with 5 positions
    for (let i = -2; i <= 2; i++) {
        lines.push({
            y: centerY + (i * spacing),
            xStart: canvasW * 0.4,
            xEnd: canvasW * 0.4, // Start as dots (0 length)
            active: true
        });
    }
    animate();
}

function animate() {
    ctx.clearRect(0, 0, canvasW, canvasH);
    const targetLength = canvasW * 0.4;
    let allGrown = true;

    // Draw the lines
    lines.forEach((line, i) => {
        if (!line.active) return;

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = i === 2 ? '#2dd4bf' : '#1e293b'; // Center line is teal

        // Growth phase
        if (line.xEnd < (line.xStart + targetLength)) {
            line.xEnd += 8;
            allGrown = false;
        }

        ctx.moveTo(line.xStart, line.y);
        ctx.lineTo(line.xEnd, line.y);
        ctx.stroke();

        // Draw the "Circle" at the start
        ctx.beginPath();
        ctx.arc(line.xStart, line.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
    });

    if (allGrown && state === "growing") {
        state = "merging";
        setTimeout(mergeOuterLines, 800);
    }

    requestAnimationFrame(animate);
}

// --- 3. RECURSIVE STRAIGHT MERGE ---
function mergeOuterLines() {
    // Stage 1: Move outermost (0 and 4) to their neighbors (1 and 3)
    let targets = [
        { subject: 0, target: 1 },
        { subject: 4, target: 3 }
    ];

    performStepMerge(targets, () => {
        // Stage 2: Move new outermost (1 and 3) to center (2)
        let finalTargets = [
            { subject: 1, target: 2 },
            { subject: 3, target: 2 }
        ];
        setTimeout(() => performStepMerge(finalTargets), 600);
    });
}

function performStepMerge(pairs, callback) {
    let completed = 0;
    const step = () => {
        let moving = false;
        pairs.forEach(pair => {
            const sub = lines[pair.subject];
            const tar = lines[pair.target];
            
            if (Math.abs(sub.y - tar.y) > 2) {
                sub.y += (tar.y - sub.y) * 0.15; // Straight vertical movement
                moving = true;
            } else {
                sub.active = false; // "Merged"
            }
        });

        if (moving) {
            requestAnimationFrame(step);
        } else if (callback) {
            callback();
        }
    };
    step();
}

typeEffect();