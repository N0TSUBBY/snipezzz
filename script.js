// --- 1. ENTRY SCREEN & MUSIC LOGIC ---
function startMusic() {
    const overlay = document.getElementById('play-overlay');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');

    // Set volume (0.1 is 10%, 1.0 is 100%)
    bgMusic.volume = 0.4; 
    bgMusic.play().catch(e => console.log("Audio play blocked by browser:", e));

    // Fade out overlay
    overlay.style.opacity = '0';

    // Fade in main profile
    mainContent.classList.add('visible');

    // Remove overlay from DOM after fade
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 800);
}

// --- 2. SMOOTH SNOWFLAKE LOGIC ---
const canvas = document.getElementById('snowflakes');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Create 75 snowflakes with random starting positions
let flakes = Array.from({ length: 75 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.5 + 0.5, // Size
    d: Math.random() * 1          // Density (affects speed)
}));

function drawFlakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();

    flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);

        // Move snow down and slightly side-to-side
        f.y += Math.cos(f.d) + 1 + f.r / 2;
        f.x += Math.sin(f.d) * 0.5; 

        // If flake hits the bottom, reset it to the top
        if (f.y > canvas.height) {
            f.y = -10;
            f.x = Math.random() * canvas.width;
        }
    });

    ctx.fill();
    requestAnimationFrame(drawFlakes);
}
drawFlakes();
