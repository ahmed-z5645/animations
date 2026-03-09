const canvas = document.getElementById('smsUiCanvas');
const ctx = canvas.getContext('2d');

let width, height;

function init() {
    canvas.width = 1280;
    canvas.height = 720;
    width = canvas.width;
    height = canvas.height;
    requestAnimationFrame(animate);
}

function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawPhoneBezel(cx, cy, phoneW, phoneH) {
    // Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    // Outer Frame
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - phoneW/2, cy - phoneH/2, phoneW, phoneH, 40);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';

    // Screen Border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - phoneW/2, cy - phoneH/2, phoneW, phoneH, 40);
    ctx.stroke();

    // Dynamic Island / Notch
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.roundRect(cx - 50, cy - phoneH/2 + 15, 100, 30, 15);
    ctx.fill();
}

function drawStatusBar(cx, topY, hasWifi) {
    ctx.fillStyle = '#000000';
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    // Shifted time slightly further left to balance
    ctx.fillText("10:14", cx - 135, topY + 35);

    // Battery (Shifted further right to clear space)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(cx + 115, topY + 23, 22, 11);
    ctx.fillRect(cx + 117, topY + 25, 14, 7);
    ctx.fillRect(cx + 138, topY + 26, 2, 5);

    // Signal / Wi-Fi
    ctx.textAlign = "right";
    if (hasWifi) {
        ctx.fillText("Wi-Fi", cx + 105, topY + 35);
    } else {
        ctx.fillStyle = '#ef4444'; 
        // Shortened to just "SOS" so it doesn't hit the notch
        ctx.fillText("SOS", cx + 105, topY + 35);
    }
}

function drawHeader(cx, topY) {
    // Contact Avatar
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath(); ctx.arc(cx, topY + 80, 24, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#9ca3af';
    ctx.font = "600 20px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("R", cx, topY + 87);

    // Contact Name
    ctx.fillStyle = '#000000';
    ctx.font = "600 14px -apple-system, sans-serif";
    ctx.fillText("Rescue Node >", cx, topY + 125);
    
    // Divider
    ctx.strokeStyle = '#f3f4f6';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - 150, topY + 145); ctx.lineTo(cx + 150, topY + 145); ctx.stroke();
}

function drawBubble(cx, y, textLines, isSender, progress) {
    if (progress <= 0) return;
    
    const scale = Math.min(easeOutBack(progress), 1);
    const yOffset = (1 - scale) * 20;
    
    ctx.save();
    ctx.translate(cx, y + yOffset);
    ctx.scale(scale, scale);
    ctx.globalAlpha = Math.min(progress * 3, 1);

    const bubbleW = 220;
    const bubbleH = 30 + (textLines.length * 20);
    const startX = isSender ? 130 - bubbleW : -130;
    
    // Green for SMS Sender, Gray for Receiver
    ctx.fillStyle = isSender ? '#34C759' : '#E9E9EB';
    
    // Draw Bubble
    ctx.beginPath();
    ctx.roundRect(startX, 0, bubbleW, bubbleH, 18);
    ctx.fill();

    // Draw little tail
    ctx.beginPath();
    if (isSender) {
        ctx.moveTo(startX + bubbleW - 20, bubbleH);
        ctx.quadraticCurveTo(startX + bubbleW + 5, bubbleH, startX + bubbleW + 5, bubbleH + 10);
        ctx.quadraticCurveTo(startX + bubbleW - 5, bubbleH, startX + bubbleW - 15, bubbleH - 5);
    } else {
        ctx.moveTo(startX + 20, bubbleH);
        ctx.quadraticCurveTo(startX - 5, bubbleH, startX - 5, bubbleH + 10);
        ctx.quadraticCurveTo(startX + 5, bubbleH, startX + 15, bubbleH - 5);
    }
    ctx.fill();

    // Text
    ctx.fillStyle = isSender ? '#ffffff' : '#000000';
    ctx.font = "400 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "left";
    textLines.forEach((line, i) => {
        ctx.fillText(line, startX + 16, 24 + (i * 20));
    });

    ctx.restore();
}

function drawTypingIndicator(cx, y, time) {
    const startX = -130;
    ctx.fillStyle = '#E9E9EB';
    ctx.beginPath(); ctx.roundRect(startX, y, 70, 36, 18); ctx.fill();
    
    // Tail
    ctx.beginPath(); ctx.moveTo(startX + 20, y+36); ctx.quadraticCurveTo(startX - 5, y+36, startX - 5, y+46); ctx.quadraticCurveTo(startX + 5, y+36, startX + 15, y+31); ctx.fill();

    // Bouncing dots
    ctx.fillStyle = '#9ca3af';
    for (let i = 0; i < 3; i++) {
        const bounce = Math.sin((time / 150) + (i * 1)) * 3;
        ctx.beginPath(); ctx.arc(startX + 20 + (i * 15), y + 18 + bounce, 4, 0, Math.PI*2); ctx.fill();
    }
}

function animate(time) {
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const phoneW = 320;
    const phoneH = 640;
    const topY = cy - phoneH/2;

    const hoverY = Math.sin(time / 1000) * 10;

    ctx.save();
    ctx.translate(0, hoverY);

    drawPhoneBezel(cx, cy, phoneW, phoneH);

    // Timeline Logic (6 Second Loop)
    const loopDuration = 6000;
    const t = (time % loopDuration) / loopDuration;

    // 1. Wi-Fi drops out at t = 0.1
    const hasWifi = t < 0.1;
    drawStatusBar(cx, topY, hasWifi);
    drawHeader(cx, topY);

    // 2. Sent Message (t = 0.25)
    let msg1Progress = t > 0.25 ? (t - 0.25) / 0.1 : 0;
    drawBubble(cx, topY + 170, ["[SOS_PAYLOAD]", "LOC: 43.25N, -79.87W", "STAT: Stranded/Safe"], true, msg1Progress);

    // "Sent as Text Message" subtext
    if (t > 0.45) {
        ctx.fillStyle = '#9ca3af';
        ctx.font = "500 12px -apple-system, sans-serif";
        ctx.textAlign = "right";
        ctx.globalAlpha = Math.min((t - 0.45) * 10, 1);
        ctx.fillText("Sent as Text Message", cx + 130, topY + 285);
        ctx.globalAlpha = 1;
    }

    // 3. Typing Indicator (t = 0.5 to 0.7)
    if (t > 0.5 && t < 0.7) {
        drawTypingIndicator(cx, topY + 300, time);
    }

    // 4. Reply Received (t = 0.7)
    let msg2Progress = t > 0.7 ? (t - 0.7) / 0.1 : 0;
    drawBubble(cx, topY + 300, ["Packet received.", "Rescue dispatched to", "your coordinates."], false, msg2Progress);

    // Home Indicator Bar
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.roundRect(cx - 40, topY + phoneH - 20, 80, 5, 3); ctx.fill();

    ctx.restore();

    requestAnimationFrame(animate);
}

init();