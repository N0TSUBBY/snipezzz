const overlay = document.getElementById('play-overlay');
const audio = document.getElementById('profile-audio');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startMusic() {
    overlay.classList.add('is-hidden');
    document.querySelector('.site-header').classList.add('visible');
    document.querySelector('.profile-card').classList.add('visible');
    audio.volume = 0.35;
    audio.play().catch(() => {});
    localStorage.setItem('entered', 'true');
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('entered') === 'true') {
        overlay.classList.add('is-hidden');
        document.querySelector('.site-header').classList.add('visible');
        document.querySelector('.profile-card').classList.add('visible');
    }

    if (!reducedMotion) {
        document.querySelectorAll('.magnetic').forEach(element => {
            element.addEventListener('pointermove', event => {
                const bounds = element.getBoundingClientRect();
                const x = (event.clientX - bounds.left) / bounds.width - 0.5;
                const y = (event.clientY - bounds.top) / bounds.height - 0.5;
                element.style.transform = `perspective(500px) rotateX(${y * -5}deg) rotateY(${x * 5}deg) translateZ(5px)`;
            });
            element.addEventListener('pointerleave', () => {
                element.style.transform = '';
            });
        });
    }
});

document.addEventListener('pointermove', event => {
    if (reducedMotion) return;
    document.querySelector('.cursor-glow').style.left = `${event.clientX}px`;
    document.querySelector('.cursor-glow').style.top = `${event.clientY}px`;
});
