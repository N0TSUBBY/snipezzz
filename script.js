const DISCORD_USER_ID = '1432513562840010762';

// --- SECTION NAVIGATION (no page reload = music never stops) ---
function navigate(section) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('section-' + section);
    if (target) target.style.display = 'block';
    if (section === 'discord') {
        document.getElementById('discord-custom-status').querySelector('.typewriter').classList.add('typewriter');
        fetchDiscordPresence();
    }
}

// --- DISCORD PRESENCE ---
async function fetchDiscordPresence() {
    try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const json = await res.json();
        if (!json.success) return;

        const d = json.data;
        const user = d.discord_user;

        // Avatar
        const pfp = document.getElementById('discord-pfp');
        const avatarExt = user.avatar && user.avatar.startsWith('a_') ? 'gif' : 'png';
        pfp.src = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${avatarExt}?size=256`
            : `https://cdn.discordapp.com/embed/avatars/0.png`;

        // Username
        document.getElementById('discord-username').textContent =
            user.global_name || user.username;

        // Status dot colour
        const colours = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43', offline: '#80848e' };
        document.getElementById('discord-status-dot').style.background =
            colours[d.discord_status] || '#80848e';

        // Status label
        const labels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' };
        document.getElementById('discord-status-text').textContent =
            labels[d.discord_status] || 'Offline';
        // Scale font size based on text length, max 2.2rem (name size)
        const statusEl = document.getElementById('discord-status-text');
        const text = statusEl.textContent;
        const size = Math.min(2.2, 1.0 + text.length * 0.05);
        statusEl.style.fontSize = size + 'rem';

        // Custom status (type 4) — the message you set in Discord
        const customStatus = (d.activities || []).find(a => a.type === 4);
        const customStatusEl = document.getElementById('discord-custom-status');
        const typewriterEl = customStatusEl.querySelector('.typewriter');
        if (customStatus && (customStatus.state || customStatus.emoji?.name)) {
            const stateText = customStatus.state || '';
            const emojiData = customStatus.emoji;
            let emojiHtml = '';
            if (emojiData?.id) {
                const ext = emojiData.animated ? 'gif' : 'png';
                emojiHtml = `<img src="https://cdn.discordapp.com/emojis/${emojiData.id}.${ext}?size=48" alt="${emojiData.name || 'emoji'}" class="discord-custom-emoji"> `;
            } else if (emojiData?.name) {
                emojiHtml = `${emojiData.name} `;
            }
            customStatusEl.style.display = 'block';
            if (stateText) {
                const escaped = stateText
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                typewriterEl.innerHTML = `
                    <span class="status-wrapper">
                        <span class="status-text">${escaped}</span>
                        ${emojiHtml}
                    </span>
                `;
                typewriterEl.classList.add('typewriter');
                typewriterEl.classList.remove('typing-active');
                typewriterEl.style.animation = 'slideUp 0.5s ease-out 0.85s both';
            } else {
                typewriterEl.innerHTML = emojiHtml;
                typewriterEl.classList.remove('typewriter');
                typewriterEl.style.animation = '';
            }
        } else {
            typewriterEl.innerHTML = '';
            customStatusEl.style.display = 'none';
        }

        // Activity / Presence (exclude custom status type 4)
        const activities = (d.activities || []).filter(a => a.type !== 4);
        const presenceEl = document.getElementById('discord-presence');

        if (activities.length > 0) {
            const act = activities[0];
            presenceEl.style.display = 'flex';

            const typeMap = { 0: 'Playing', 1: 'Streaming', 2: 'Listening to', 3: 'Watching', 5: 'Competing in' };
            document.getElementById('presence-type').textContent = typeMap[act.type] || 'Playing';
            document.getElementById('presence-name').textContent = act.name;
            document.getElementById('presence-detail').textContent = act.details || act.state || '';

            const artEl = document.getElementById('presence-art');
            artEl.onerror = () => { artEl.style.display = 'none'; };

            if (d.spotify && act.name === 'Spotify') {
                artEl.src = d.spotify.album_art_url;
                artEl.style.display = 'block';
                document.getElementById('presence-type').textContent = 'Listening to';
                document.getElementById('presence-name').textContent = d.spotify.song;
                document.getElementById('presence-detail').textContent = 'by ' + d.spotify.artist;
            } else if (act.assets?.large_image) {
                let img = act.assets.large_image;
                if (img.startsWith('mp:external/')) {
                    img = 'https://media.discordapp.net/external/' + img.replace('mp:external/', '');
                } else {
                    img = `https://cdn.discordapp.com/app-assets/${act.application_id}/${img}.png`;
                }
                artEl.src = img;
                artEl.style.display = 'block';
            } else if (act.application_id) {
                // Fallback: use the game's app icon
                artEl.src = `https://cdn.discordapp.com/app-icons/${act.application_id}/icon.png`;
                artEl.style.display = 'block';
            } else {
                artEl.style.display = 'none';
            }
        } else {
            presenceEl.style.display = 'none';
        }
    } catch (e) {
        console.log('Failed to fetch Discord presence:', e);
    }
}

// --- ENTRY SCREEN & MUSIC ---
function startMusic() {
    const overlay = document.getElementById('play-overlay');
    const bgMusic = document.getElementById('bg-music');
    const tab = document.getElementById('tab');

    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log("Audio play blocked:", e));

    overlay.style.opacity = '0';
    tab.classList.add('visible');
    document.querySelectorAll('.page-content').forEach(el => el.classList.add('visible'));

    setTimeout(() => { overlay.style.display = 'none'; }, 800);
    localStorage.setItem('entered', 'true');
}

window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    if (localStorage.getItem('entered') === 'true') {
        const overlay = document.getElementById('play-overlay');
        const bgMusic = document.getElementById('bg-music');
        const tab = document.getElementById('tab');

        if (overlay) { overlay.style.transition = 'none'; overlay.style.display = 'none'; }
        if (tab) { tab.style.transition = 'none'; tab.classList.add('visible'); }
        document.querySelectorAll('.page-content').forEach(el => {
            el.style.transition = 'none';
            el.classList.add('visible');
        });

        if (bgMusic) {
            bgMusic.volume = 0.4;
            bgMusic.play().catch(() => {});
        }
    }
});

// --- SNOWFLAKES ---
const canvas = document.getElementById('snowflakes');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let flakes = Array.from({ length: 75 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.5 + 0.5,
    d: Math.random() * 1
}));

function drawFlakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snow-color') || 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();

    flakes.forEach(f => {
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
        f.y += Math.cos(f.d) + 1 + f.r / 2;
        f.x += Math.sin(f.d) * 0.5;
        if (f.y > canvas.height) { f.y = -10; f.x = Math.random() * canvas.width; }
    });

    ctx.fill();
    requestAnimationFrame(drawFlakes);
}
drawFlakes();

// --- THEME SWITCHING ---
const themes = {
    default: {
        bg: 'bg.png',
        glow: 'rgba(255, 255, 255, 0.9)',
        socialBg: 'rgba(255, 255, 255, 0.08)',
        socialBorder: 'rgba(255, 255, 255, 0.15)',
        tabBg: 'rgba(255, 255, 255, 0.1)',
        tabBorder: 'rgba(255, 255, 255, 0.2)',
        presenceBg: 'rgba(255, 255, 255, 0.08)',
        presenceBorder: 'rgba(255, 255, 255, 0.15)',
        themeBtnBg: 'rgba(255, 255, 255, 0.08)',
        themeBtnBorder: 'rgba(255, 255, 255, 0.15)',
        snowColor: 'rgba(255, 255, 255, 0.8)',
        overlayBg: 'rgba(0, 0, 0, 0.95)',
        bodyOverlay: 'rgba(0, 0, 0, 0.65)'
    },
    blue: {
        bg: 'bg-blue.png',
        glow: 'rgba(30, 144, 255, 0.9)',
        socialBg: 'rgba(30, 144, 255, 0.15)',
        socialBorder: 'rgba(30, 144, 255, 0.25)',
        tabBg: 'rgba(30, 144, 255, 0.15)',
        tabBorder: 'rgba(30, 144, 255, 0.25)',
        presenceBg: 'rgba(30, 144, 255, 0.15)',
        presenceBorder: 'rgba(30, 144, 255, 0.25)',
        themeBtnBg: 'rgba(30, 144, 255, 0.15)',
        themeBtnBorder: 'rgba(30, 144, 255, 0.25)',
        snowColor: 'rgba(135, 206, 250, 0.8)',
        overlayBg: 'rgba(0, 20, 40, 0.95)',
        bodyOverlay: 'rgba(0, 0, 0, 0.5)'
    },
    pink: {
        bg: 'bg-pink.png',
        glow: 'rgba(255, 20, 147, 0.9)',
        socialBg: 'rgba(255, 20, 147, 0.15)',
        socialBorder: 'rgba(255, 20, 147, 0.25)',
        tabBg: 'rgba(255, 20, 147, 0.15)',
        tabBorder: 'rgba(255, 20, 147, 0.25)',
        presenceBg: 'rgba(255, 20, 147, 0.15)',
        presenceBorder: 'rgba(255, 20, 147, 0.25)',
        themeBtnBg: 'rgba(255, 20, 147, 0.15)',
        themeBtnBorder: 'rgba(255, 20, 147, 0.25)',
        snowColor: 'rgba(255, 182, 193, 0.8)',
        overlayBg: 'rgba(40, 0, 20, 0.95)',
        bodyOverlay: 'rgba(0, 0, 0, 0.55)'
    }
};

function setTheme(theme) {
    const t = themes[theme];
    document.body.style.backgroundImage = `url('${t.bg}')`;
    document.documentElement.style.setProperty('--glow-color', t.glow);
    document.documentElement.style.setProperty('--social-bg', t.socialBg);
    document.documentElement.style.setProperty('--social-border', t.socialBorder);
    document.documentElement.style.setProperty('--tab-bg', t.tabBg);
    document.documentElement.style.setProperty('--tab-border', t.tabBorder);
    document.documentElement.style.setProperty('--presence-bg', t.presenceBg);
    document.documentElement.style.setProperty('--presence-border', t.presenceBorder);
    document.documentElement.style.setProperty('--theme-btn-bg', t.themeBtnBg);
    document.documentElement.style.setProperty('--theme-btn-border', t.themeBtnBorder);
    document.documentElement.style.setProperty('--snow-color', t.snowColor);
    document.documentElement.style.setProperty('--overlay-bg', t.overlayBg);
    document.documentElement.style.setProperty('--body-overlay', t.bodyOverlay);
    localStorage.setItem('theme', theme);
    
    // Update selected button
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.theme-btn[data-theme="${theme}"]`).classList.add('selected');
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'default';
    setTheme(theme);
}

// Load theme on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    // ... existing code
});
