const DISCORD_USER_ID = '1432513562840010762';

// --- SECTION NAVIGATION (no page reload = music never stops) ---
function navigate(section) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    const target = document.getElementById('section-' + section);
    if (target) target.style.display = 'block';
    if (section === 'discord') fetchDiscordPresence();
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
        pfp.src = user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
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

        // Custom status (type 4) — the message you set in Discord
        const customStatus = (d.activities || []).find(a => a.type === 4);
        const customStatusEl = document.getElementById('discord-custom-status');
        if (customStatus && (customStatus.state || customStatus.emoji?.name)) {
            const emoji = customStatus.emoji?.name ? customStatus.emoji.name + ' ' : '';
            customStatusEl.textContent = emoji + (customStatus.state || '');
            customStatusEl.style.display = 'block';
        } else {
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
    sessionStorage.setItem('entered', 'true');
}

window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('entered') === 'true') {
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
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
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
