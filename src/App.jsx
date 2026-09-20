import { useEffect, useState } from 'react';
import {
  ChevronDown,
  Check,
  Home,
  MessageCircle,
  Palette,
  Radio,
  Settings,
  Sparkles,
} from 'lucide-react';

const DISCORD_USER_ID = '1521175667839078514';
const sectionIds = ['home', 'discord', 'settings'];

const socials = [
  { label: 'TikTok', icon: 'fa-brands fa-tiktok', className: 'tiktok', href: 'https://www.tiktok.com/@..subby?_r=1&_t=ZN-94yG5ioFKYY' },
  { label: 'Spotify', icon: 'fa-brands fa-spotify', className: 'spotify', href: 'https://open.spotify.com/user/31kt54uvdogmjo47ykh75fh73gfq?si=VinO44fAS9ahmssDKrVsvw' },
  { label: 'GitHub', icon: 'fa-brands fa-github', className: 'github', href: 'https://github.com/N0TSUBBY' },
  { label: 'Snapchat', icon: 'fa-brands fa-snapchat', className: 'snapchat', href: 'https://snapchat.com/t/KNBmiz3x' },
];

const themes = {
  default: { label: 'Midnight', description: 'navy blue on deep night', mood: 'quiet / focused', className: 'midnight' },
  blue: { label: 'Ocean', description: 'cool blue and quiet', mood: 'clear / calm', className: 'ocean' },
  pink: { label: 'Blossom', description: 'a little warmer', mood: 'soft / bright', className: 'blossom' },
};

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [visibleSections, setVisibleSections] = useState(() => new Set(['home']));
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'default');
  const [entered, setEntered] = useState(() => localStorage.getItem('entered') === 'true');

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(`${id}-section`));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id.replace('-section', ''));
      setVisibleSections((current) => {
        const next = new Set(current);
        entries.forEach((entry) => {
          const id = entry.target.id.replace('-section', '');
          if (entry.isIntersecting) next.add(id);
          else next.delete(id);
        });
        return next;
      });
    }, { rootMargin: '-10% 0px -30% 0px', threshold: [0.15, 0.35, 0.6] });
    sections.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = sectionIds.map((id) => document.getElementById(`${id}-section`));
    let frame = 0;
    const updateScrollProgress = () => {
      frame = 0;
      const viewportCenter = window.innerHeight * 0.5;
      const fadeDistance = Math.max(window.innerHeight * 0.72, 360);
      sections.forEach((section) => {
        if (!section) return;
        const bounds = section.getBoundingClientRect();
        const sectionCenter = bounds.top + bounds.height / 2;
        const raw = 1 - Math.abs(sectionCenter - viewportCenter) / fadeDistance;
        const eased = Math.max(0, Math.min(1, raw));
        const smooth = eased * eased * (3 - 2 * eased);
        const direction = sectionCenter > viewportCenter ? 1 : -1;
        section.style.setProperty('--section-opacity', smooth.toFixed(3));
        section.style.setProperty('--section-offset', `${((1 - smooth) * 32 * direction).toFixed(1)}px`);
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollProgress);
    };
    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToSection = (id) => document.getElementById(`${id}-section`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const enter = () => { localStorage.setItem('entered', 'true'); setEntered(true); };

  return <main className="site"><div className="snow" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><nav className="tabs" aria-label="Site navigation"> <Tab active={activeSection === 'home'} label="Home" onClick={() => scrollToSection('home')}><Home size={20} /></Tab><Tab active={activeSection === 'discord'} label="Discord" onClick={() => scrollToSection('discord')}><MessageCircle size={20} /></Tab><Tab active={activeSection === 'settings'} label="Settings" onClick={() => scrollToSection('settings')}><Settings size={20} /></Tab></nav><div className="section-stack"><section id="home-section" className={`card section-card ${visibleSections.has('home') ? 'is-visible' : ''}`}><HomePage /></section><ScrollHint upTarget="home" downTarget="discord" activeSection={activeSection} onNavigate={scrollToSection} /><section id="discord-section" className={`card section-card ${visibleSections.has('discord') ? 'is-visible' : ''}`}><DiscordPage /></section><ScrollHint upTarget="discord" downTarget="settings" activeSection={activeSection} onNavigate={scrollToSection} /><section id="settings-section" className={`card section-card ${visibleSections.has('settings') ? 'is-visible' : ''}`}><SettingsPage theme={theme} setTheme={setTheme} /></section></div><p className="bottom-mark" aria-label="Subhan">سبحان</p>{!entered && <EntryOverlay onEnter={enter} />}</main>;
}

function Tab({ active, label, onClick, children }) { return <button className={`tab ${active ? 'active' : ''}`} onClick={onClick} aria-label={label} title={label}>{children}</button>; }
function ScrollHint({ upTarget, downTarget, activeSection, onNavigate }) { const goingUp = activeSection === downTarget; const target = goingUp ? upTarget : downTarget; return <button className={`scroll-hint ${goingUp ? 'points-up' : 'points-down'}`} onClick={() => onNavigate(target)} aria-label={`Scroll to ${target}`}><span /><span className="scroll-arrow"><ChevronDown size={17} /></span><span /></button>; }

function HomePage() {
  return <div className="page home-page"><ProfileHeader label="snipezzz" /><div className="socials">{socials.map(({ label, icon, className, href }) => <a className={className} key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}><i className={icon} /></a>)}</div><p className="footer-note"><Sparkles size={13} /> small links for friends</p></div>;
}

function ProfileHeader({ label, children, image = '/pfp.jpg', imageAlt = 'snipezzz', status = 'online' }) {
  return <header className="profile-header"><div className="avatar-wrap"><img src={image} alt={imageAlt} className="avatar" /><span className={`online ${status}`} /></div><h1>{label}<span>.</span></h1>{children || <p className="quote">O people of mankind, time is short, life is not long. Spend it wisely</p>}</header>;
}

function DiscordPage() {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`).then((response) => response.json()).then((json) => json.success ? setData(json.data) : setFailed(true)).catch(() => setFailed(true)); }, []);
  const user = data?.discord_user;
  const status = data?.discord_status || 'offline';
  const avatar = user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256` : '/pfp.jpg';
  const statusText = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' }[status];
  const activity = data?.activities?.find((item) => item.type !== 4);
  const customStatus = data?.activities?.find((item) => item.type === 4)?.state;
  return <div className="page discord-page"><div className="section-title"><span>LIVE / DISCORD</span><small>02</small></div><ProfileHeader label={user?.global_name || 'snipezzz'} image={avatar} imageAlt="Discord profile" status={status}><p className={`discord-status ${status}`}><span />{statusText}</p></ProfileHeader><div className="discord-status-line"><MessageCircle size={17} /><span>{customStatus || (failed ? 'Could not load live status right now.' : 'probably doing something')}</span></div>{activity ? <div className="presence"><div className="presence-art"><Radio size={20} /></div><div><small>{activity.type === 2 ? 'Listening to' : 'Currently'}</small><strong>{activity.name}</strong><span>{activity.details || activity.state || ''}</span></div><i className="presence-live" /></div> : <div className="quiet-presence"><span>✦</span> quiet right now</div>}<p className="footer-note"><Check size={13} /> live presence from Discord</p></div>;
}

function SettingsPage({ theme, setTheme }) {
  return <div className="page settings-page"><div className="section-title"><span>PERSONALISE / THEMES</span><small>03</small></div><header className="settings-header"><div className="settings-symbol"><Palette size={24} /></div><h1>Make it yours</h1><p>Pick a mood for the little room.</p></header><div className="theme-buttons">{Object.entries(themes).map(([key, item]) => <button key={key} className={`theme-btn ${theme === key ? 'selected' : ''}`} onClick={() => setTheme(key)}><span className={`theme-preview ${item.className}`}><i /><b /></span><span className="theme-copy"><strong>{item.label}</strong><small>{item.description}</small><em>{item.mood}</em></span>{theme === key && <Check size={17} />}</button>)}</div><p className="footer-note"><Palette size={13} /> theme saved on this device</p></div>;
}
function EntryOverlay({ onEnter }) { return <div className="entry"><div className="entry-box"><div className="entry-avatar"><img src="/pfp.jpg" alt="" /></div><p>click anywhere to enter</p><button onClick={onEnter}>enter <Sparkles size={15} /></button></div></div>; }

export default App;
