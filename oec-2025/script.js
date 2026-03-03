const canvas = document.getElementById('mockupCanvas');
const ctx = canvas.getContext('2d');
const video = document.getElementById('demoVideo');

let width, height;

function init() {
    // 720p HD internal resolution
    canvas.width = 1280;
    canvas.height = 720;
    width = canvas.width;
    height = canvas.height;
    
    // Ensure the video plays
    video.play().catch(e => console.log("Video waiting for interaction or file missing.", e));
    
    requestAnimationFrame(animate);
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // 1. Solid Pastel Background (Peach)
    ctx.fillStyle = '#cbf8cd';
    ctx.fillRect(0, 0, width, height);

    // Layout Math
    const videoW = 960;
    const videoH = 540; // Exactly 16:9
    const topBarH = 36;
    const urlBarH = 48;
    const headerH = topBarH + urlBarH;
    
    const windowW = videoW;
    const windowH = videoH + headerH;
    
    const startX = (width - windowW) / 2;
    const startY = (height - windowH) / 2;

    ctx.save();

    // 2. Browser Window Drop Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;

    // 3. Create the rounded window shape and clip it
    ctx.beginPath();
    ctx.roundRect(startX, startY, windowW, windowH, 12);
    ctx.fill(); // Fill to apply shadow
    ctx.shadowColor = 'transparent'; // Turn off shadow for contents
    ctx.clip(); // Everything drawn next stays inside the rounded corners

    // 4. White Top Bar (macOS style)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX, startY, windowW, topBarH);

    // Traffic Lights
    const colors = ['#ff5f56', '#ffbd2e', '#27c93f'];
    colors.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(startX + 24 + (i * 20), startY + (topBarH / 2), 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // Window Title
    ctx.fillStyle = '#4b5563';
    ctx.font = "600 14px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Google Chrome", startX + windowW / 2, startY + (topBarH / 2));

    // 5. Dark Mode URL Bar area
    const urlBarY = startY + topBarH;
    ctx.fillStyle = '#202124'; // Chrome dark theme background
    ctx.fillRect(startX, urlBarY, windowW, urlBarH);

    // URL Input Box
    ctx.fillStyle = '#323639'; // Chrome dark theme input box
    ctx.beginPath();
    ctx.roundRect(startX + 120, urlBarY + 8, windowW - 140, 32, 16);
    ctx.fill();

    // URL Text
    ctx.fillStyle = '#9ca3af';
    ctx.font = "400 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("http://localhost:3000", startX + 140, urlBarY + 24);

    // 6. Draw the Demo Video
    const videoY = urlBarY + urlBarH;
    
    // Fallback screen color if video hasn't loaded yet
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(startX, videoY, videoW, videoH);

    // Paint the actual `<video>` onto the canvas
    if (video.readyState >= 2) {
        ctx.drawImage(video, startX, videoY, videoW, videoH);
    }

    ctx.restore(); // Remove clipping mask

    requestAnimationFrame(animate);
}

init();