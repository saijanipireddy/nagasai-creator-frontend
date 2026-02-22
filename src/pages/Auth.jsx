import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  FaArrowRight, FaArrowLeft, FaPlay, FaCode, FaBook,
  FaGraduationCap, FaRocket, FaHtml5, FaCss3Alt, FaJs,
  FaPython, FaReact, FaNodeJs, FaDatabase, FaLaptopCode,
  FaChartLine, FaCheckCircle, FaTrophy, FaTerminal,
  FaEnvelope, FaLock, FaUser
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/* ─────────── DATA ─────────── */
const SNIPPETS = [
  {
    tab: 'index.html', lang: 'html',
    code: '<div class="app">\n  <header>\n    <h1>My Portfolio</h1>\n    <nav>\n      <a href="#about">About</a>\n      <a href="#work">Work</a>\n    </nav>\n  </header>\n  <main>\n    <p>Hello, World!</p>\n  </main>\n</div>',
  },
  {
    tab: 'app.js', lang: 'js',
    code: 'const fetchData = async (url) => {\n  const res = await fetch(url);\n  const data = await res.json();\n  return data;\n}\n\nconst users = await fetchData(\n  "/api/users"\n);\nconsole.log(users);\n// [{ name: "Naga" }, ...]',
  },
  {
    tab: 'terminal', lang: 'term',
    code: '$ npm create vite@latest my-app\n✓ Project created\n$ cd my-app && npm install\nadded 142 packages in 4s\n$ npm run dev\n  VITE v5.0  ready in 200ms\n  ➜ Local: http://localhost:5173\n$ npm run build\n✓ Built in 1.2s\n$ vercel deploy --prod\n✓ Live → my-app.vercel.app',
  },
];

const TECHNOLOGIES = [
  { icon: FaHtml5, name: 'HTML5', color: '#e34f26', bg: '#fef2f2', glow: 'rgba(227,79,38,0.15)' },
  { icon: FaCss3Alt, name: 'CSS3', color: '#264de4', bg: '#eff6ff', glow: 'rgba(38,77,228,0.15)' },
  { icon: FaJs, name: 'JavaScript', color: '#f0db4f', bg: '#fefce8', glow: 'rgba(240,219,79,0.2)' },
  { icon: FaPython, name: 'Python', color: '#3776ab', bg: '#eff6ff', glow: 'rgba(55,118,171,0.15)' },
  { icon: FaDatabase, name: 'SQL', color: '#336791', bg: '#f0f9ff', glow: 'rgba(51,103,145,0.15)' },
  { icon: FaReact, name: 'React', color: '#61dafb', bg: '#ecfeff', glow: 'rgba(97,218,251,0.2)' },
  { icon: FaNodeJs, name: 'Node.js', color: '#339933', bg: '#f0fdf4', glow: 'rgba(51,153,51,0.15)' },
];

const FEATURES = [
  {
    icon: FaPlay, title: 'Video Tutorials',
    desc: 'HD video lessons covering every concept — from HTML basics to full-stack deployment.',
    color: '#ef4444', bg: '#fef2f2',
  },
  {
    icon: FaCode, title: 'Code Playground',
    desc: 'Write and run HTML, CSS, JS, Python & SQL right in your browser. No setup required.',
    color: '#4f46e5', bg: '#eef2ff',
  },
  {
    icon: FaBook, title: 'Practice Questions',
    desc: 'Hundreds of curated problems to sharpen your skills and deepen your understanding.',
    color: '#f59e0b', bg: '#fffbeb',
  },
  {
    icon: FaTrophy, title: 'Leaderboard',
    desc: 'Compete with peers, earn points for every challenge solved, and climb the rankings.',
    color: '#10b981', bg: '#ecfdf5',
  },
];

const JOURNEY = [
  { title: 'Watch & Learn', desc: 'Follow structured HD video courses covering every concept — from your first HTML tag to building full-stack applications.', icon: FaPlay, label: 'Step 1', accent: '#ef4444', accentBg: '#fef2f2', accentGlow: 'rgba(239,68,68,0.12)' },
  { title: 'Practice & Code', desc: 'Write and run HTML, CSS, JavaScript, Python & SQL directly in the browser. Instant feedback, zero setup.', icon: FaLaptopCode, label: 'Step 2', accent: '#4f46e5', accentBg: '#eef2ff', accentGlow: 'rgba(79,70,229,0.12)' },
  { title: 'Build & Ship', desc: 'Solve real-world challenges, build projects, climb the leaderboard, and deploy your work to the web.', icon: FaRocket, label: 'Step 3', accent: '#10b981', accentBg: '#ecfdf5', accentGlow: 'rgba(16,185,129,0.12)' },
];

const HERO_WORDS = ['Build Real Projects', 'Write Clean Code', 'Deploy to Production'];

/* ─────────── HOOKS ─────────── */
const useInView = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ─────────── SYNTAX HIGHLIGHTING ─────────── */
const TOKEN_RE = /(<\/?[a-z][\w-]*|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|\b(?:const|let|var|function|return|if|else|for|class|import|export|from|async|await|console|log|new|this)\b|\b\d+(?:\.\d+)?(?:px|rem|em|%)?\b)/gi;

const colorize = (text) => {
  if (!text) return null;
  return text.split(TOKEN_RE).filter(Boolean).map((tok, i) => {
    if (/^<\/?[a-z]/i.test(tok)) return <span key={i} className="tok-tag">{tok}</span>;
    if (/^["'`]/.test(tok)) return <span key={i} className="tok-str">{tok}</span>;
    if (/^\/\//.test(tok)) return <span key={i} className="tok-cmt">{tok}</span>;
    if (/^(const|let|var|function|return|if|else|for|class|import|export|from|async|await|console|log|new|this)$/i.test(tok))
      return <span key={i} className="tok-kw">{tok}</span>;
    if (/^\d/.test(tok)) return <span key={i} className="tok-num">{tok}</span>;
    return <span key={i} className="tok-def">{tok}</span>;
  });
};

const colorizeTerminal = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let cls = 'tok-def';
    if (line.startsWith('$')) cls = 'tok-cmd';
    else if (line.startsWith('✓')) cls = 'tok-ok';
    else if (line.includes('➜') || line.includes('→')) cls = 'tok-link';
    else if (line.includes('ready') || line.includes('VITE')) cls = 'tok-str';
    return <div key={i} className={cls}>{line}</div>;
  });
};

/* ─────────── LIVE TERMINAL ─────────── */
const LiveTerminal = () => {
  const [sIdx, setSIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const snippet = SNIPPETS[sIdx];
  const isTerm = snippet.lang === 'term';
  const visible = snippet.code.slice(0, charIdx);

  useEffect(() => {
    if (charIdx < snippet.code.length) {
      const ch = snippet.code[charIdx];
      const speed = ch === '\n' ? 120 : 24 + Math.random() * 18;
      const t = setTimeout(() => setCharIdx(c => c + 1), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setSIdx(i => (i + 1) % SNIPPETS.length); setCharIdx(0); }, 2200);
    return () => clearTimeout(t);
  }, [charIdx, snippet]);

  return (
    <div className="terminal-wrap">
      {/* Title bar */}
      <div className="terminal-bar">
        <div className="flex gap-[6px]">
          <span className="terminal-dot" style={{ background: '#ff5f57' }} />
          <span className="terminal-dot" style={{ background: '#febc2e' }} />
          <span className="terminal-dot" style={{ background: '#28c840' }} />
        </div>
        <div className="flex gap-[2px] ml-4">
          {SNIPPETS.map((s, i) => (
            <button key={i} onClick={() => { setSIdx(i); setCharIdx(0); }}
              className={`terminal-tab ${i === sIdx ? 'active' : ''}`}>
              {s.lang === 'term' ? <FaTerminal className="text-[9px]" /> : null}
              {s.tab}
            </button>
          ))}
        </div>
      </div>

      {/* Code area */}
      <div className="terminal-body">
        {isTerm ? colorizeTerminal(visible) : (
          <div className="flex">
            <div className="terminal-lines">
              {visible.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <pre className="terminal-code">
              {colorize(visible)}
              <span className="terminal-cursor" />
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────── HOW-IT-WORKS VISUALS ─────────── */
const VideoPlayerVisual = ({ active }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) { setProgress(0); return; }
    const t = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.5), 40);
    return () => clearInterval(t);
  }, [active]);

  return (
    <div className="hw-visual-wrap hw-video-only">
      <div className="hw-video-screen-full">
        <div className="hw-video-play"><FaPlay className="text-white text-2xl ml-1" /></div>
        <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <p className="text-white text-sm font-bold mb-3 drop-shadow">Intro to JavaScript — Functions & Scope</p>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-white/60 text-[11px] font-medium">{Math.floor(progress / 100 * 12)}:{String(Math.floor(progress / 100 * 34)).padStart(2, '0')}</span>
            <span className="text-white/60 text-[11px] font-medium">12:34</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CODE_TEXT = `const greet = (name) => {
  return \`Hello, \${name}!\`;
}

const sum = (a, b) => a + b;

console.log(greet("World"));
console.log(sum(10, 20));`;

const CODE_OUTPUT = ['> Hello, World!', '> 30', '', '✓ 2/2 tests passed'];

const CodeEditorVisual = ({ active }) => {
  const [charIdx, setCharIdx] = useState(0);
  const [showOutput, setShowOutput] = useState(false);
  const visible = CODE_TEXT.slice(0, charIdx);

  useEffect(() => {
    if (!active) { setCharIdx(0); setShowOutput(false); return; }
    if (charIdx < CODE_TEXT.length) {
      const ch = CODE_TEXT[charIdx];
      const speed = ch === '\n' ? 100 : 22 + Math.random() * 18;
      const t = setTimeout(() => setCharIdx(c => c + 1), speed);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setShowOutput(true), 600);
    return () => clearTimeout(t);
  }, [active, charIdx]);

  return (
    <div className="hw-visual-wrap" style={{ background: '#0d1117' }}>
      {/* Editor toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-md">app.js</span>
        <span className="text-[11px] text-slate-600">index.html</span>
        <span className="text-[11px] text-slate-600">style.css</span>
      </div>
      {/* Code */}
      <div className="flex p-4 flex-1">
        <div className="select-none pr-4 text-right text-slate-700 text-xs leading-[1.8] border-r border-white/[0.04] mr-4" style={{ minWidth: 24 }}>
          {visible.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <pre className="flex-1 text-[13px] leading-[1.8] whitespace-pre-wrap" style={{ color: '#abb2bf' }}>
          {colorize(visible)}
          <span className="terminal-cursor" />
        </pre>
      </div>
      {/* Output panel */}
      <div className={`border-t border-white/[0.05] px-4 py-3 transition-all duration-500 ${showOutput ? 'opacity-100' : 'opacity-0'}`}>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output</span>
        <div className="mt-2 space-y-0.5">
          {CODE_OUTPUT.map((line, i) => (
            <div key={i} className={`text-xs font-medium ${line.includes('✓') ? 'text-emerald-400' : line.startsWith('>') ? 'text-sky-400' : ''}`}
              style={{ color: !line.includes('✓') && !line.startsWith('>') ? '#636e7b' : undefined }}>{line}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DEPLOY_LINES = [
  { text: '$ npm run build', delay: 0 },
  { text: '  Compiling modules...', delay: 400 },
  { text: '✓ Compiled successfully in 1.2s', delay: 900, color: '#4ade80' },
  { text: '', delay: 1100 },
  { text: '$ vercel deploy --prod', delay: 1300 },
  { text: '  Uploading build output...', delay: 1700 },
  { text: '  Deploying to production...', delay: 2200 },
  { text: '✓ Deployed to my-portfolio.vercel.app', delay: 2800, color: '#4ade80' },
  { text: '', delay: 3000 },
  { text: '🏆 Leaderboard updated: Rank #3 (+120 pts)', delay: 3300, color: '#818cf8' },
];

const DeployVisual = ({ active }) => {
  const [visibleLines, setVisibleLines] = useState(0);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (!active) { setVisibleLines(0); setBarWidth(0); return; }
    const timers = DEPLOY_LINES.map((line, i) =>
      setTimeout(() => { setVisibleLines(i + 1); setBarWidth(((i + 1) / DEPLOY_LINES.length) * 100); }, line.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="hw-visual-wrap" style={{ background: '#0d1117' }}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]">
        <FaTerminal className="text-[10px] text-slate-500" />
        <span className="text-[11px] font-semibold text-slate-400">Terminal — deploy</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-24 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${barWidth}%` }} />
          </div>
          <span className="text-[10px] text-slate-600 font-bold">{Math.round(barWidth)}%</span>
        </div>
      </div>
      <div className="p-4 font-mono text-[13px] leading-[1.9] flex-1">
        {DEPLOY_LINES.slice(0, visibleLines).map((line, i) => (
          <div key={i} style={{ color: line.color || (line.text.startsWith('$') ? '#e5e7eb' : '#636e7b') }}
            className="animate-content-fade-in">{line.text || '\u00A0'}</div>
        ))}
        {visibleLines < DEPLOY_LINES.length && visibleLines > 0 && (
          <span className="terminal-cursor" />
        )}
      </div>
    </div>
  );
};

const HW_VISUALS = [VideoPlayerVisual, CodeEditorVisual, DeployVisual];

/* ─────────── MARQUEE ─────────── */
const Marquee = ({ items, reverse = false, speed = 12 }) => {
  const doubled = useMemo(() => [...items, ...items], [items]);
  return (
    <div className="marquee-row overflow-hidden py-2">
      <div className="marquee-track flex gap-4"
        style={{ animation: `${reverse ? 'marqueeR' : 'marqueeL'} ${speed}s linear infinite`, width: 'max-content' }}>
        {doubled.map((t, i) => (
          <div key={i} className="tech-pill" style={{ background: t.bg }}>
            <t.icon className="text-xl" style={{ color: t.color }} />
            <span className="text-sm font-bold text-slate-800">{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────── FORM PRIMITIVES ─────────── */
const Input = ({ label, icon: Icon, hint, ...props }) => (
  <div>
    <label className="block text-[12px] font-bold text-slate-600 mb-2 tracking-wide">{label}</label>
    <div className="auth-input-wrap">
      {Icon && <Icon className="auth-input-icon" />}
      <input {...props}
        className={`auth-input ${Icon ? 'auth-input-has-icon' : ''}`} />
    </div>
    {hint && <p className="text-slate-400 text-[11px] mt-1.5 font-medium">{hint}</p>}
  </div>
);

const ErrorMsg = ({ error }) => {
  if (!error) return null;
  const warm = error.includes('starting up');
  return (
    <div className={`px-4 py-3.5 rounded-xl mb-5 text-[13px] font-semibold text-center animate-content-fade-in ${
      warm ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-600'
    }`}>{error}</div>
  );
};


/* ─────────── LOGIN ─────────── */
const LoginForm = ({ onSwitch, onBack }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault(); setError('');
    try { await login(email, password); }
    catch (err) {
      if (!err.response) {
        setError(err.code === 'ECONNABORTED' || err.message?.includes('timeout')
          ? 'Server is starting up. Please wait a moment and try again.'
          : 'Unable to connect to server. Check your internet and try again.');
      } else setError(err.response.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-page-wrap animate-content-fade-in">
      {/* Background dots */}
      <div className="auth-bg-dots" />

      <div className="auth-card">
        {/* Back button */}
        <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-slate-800 text-[13px] font-medium mb-10 transition-colors">
          <FaArrowLeft className="text-[9px] group-hover:-translate-x-1 transition-transform" /> Back to home
        </button>

        {/* Logo + heading */}
        <div className="text-center mb-9">
          <div className="flex justify-center mb-5">
            <div className="logo-mark"><span>N</span></div>
          </div>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight mb-1.5">Welcome back</h1>
          <p className="text-slate-500 text-[15px] font-medium">Sign in to continue your learning journey</p>
        </div>

        <ErrorMsg error={error} />

        <form onSubmit={handle} className="space-y-5">
          <Input label="Email Address" icon={FaEnvelope} type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required />
          <Input label="Password" icon={FaLock} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(''); }} placeholder="Enter your password" required />
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="loader" />Signing in…</span> : 'Sign In'}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-slate-500 text-[14px] font-medium mt-8">
          Don't have an account?{' '}<button onClick={onSwitch} className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">Create one</button>
        </p>
      </div>
    </div>
  );
};

/* ─────────── REGISTER ─────────── */
const RegisterForm = ({ onSwitch, onBack }) => {
  const { register, loading } = useAuth();
  const [fd, setFd] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (e) => { setFd(p => ({ ...p, [e.target.name]: e.target.value })); setError(''); };

  const handle = async (e) => {
    e.preventDefault(); setError('');
    if (!fd.name.trim()) return setError('Name is required');
    if (fd.password.length < 6) return setError('Password must be at least 6 characters');
    try { await register(fd.name, fd.email, fd.password); }
    catch (err) {
      if (!err.response) {
        setError(err.code === 'ECONNABORTED' || err.message?.includes('timeout')
          ? 'Server is starting up. Please wait a moment and try again.'
          : 'Unable to connect to server. Check your internet and try again.');
      } else setError(err.response.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="auth-page-wrap animate-content-fade-in">
      {/* Background dots */}
      <div className="auth-bg-dots" />

      <div className="auth-card">
        {/* Back button */}
        <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-slate-800 text-[13px] font-medium mb-10 transition-colors">
          <FaArrowLeft className="text-[9px] group-hover:-translate-x-1 transition-transform" /> Back to home
        </button>

        {/* Logo + heading */}
        <div className="text-center mb-9">
          <div className="flex justify-center mb-5">
            <div className="logo-mark"><span>N</span></div>
          </div>
          <h1 className="text-[28px] font-extrabold text-black tracking-tight mb-1.5">Create your account</h1>
          <p className="text-slate-500 text-[15px] font-medium">Start your coding journey for free</p>
        </div>

        <ErrorMsg error={error} />

        <form onSubmit={handle} className="space-y-5">
          <Input label="Full Name" icon={FaUser} type="text" name="name" value={fd.name} onChange={set} placeholder="Your full name" required />
          <Input label="Email Address" icon={FaEnvelope} type="email" name="email" value={fd.email} onChange={set} placeholder="you@example.com" required />
          <Input label="Password" icon={FaLock} type="password" name="password" value={fd.password} onChange={set} placeholder="Min. 6 characters" hint="Must be at least 6 characters" required />
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? <span className="flex items-center justify-center gap-2"><span className="loader" />Creating account…</span> : 'Create Account'}
          </button>
        </form>

        {/* Switch */}
        <p className="text-center text-slate-500 text-[14px] font-medium mt-8">
          Already have an account?{' '}<button onClick={onSwitch} className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">Sign in</button>
        </p>
      </div>
    </div>
  );
};

/* ═════════════════════════════════════════════════════
   MAIN AUTH
   ═════════════════════════════════════════════════════ */
const Auth = () => {
  const { user } = useAuth();
  const [view, setView] = useState('landing');
  const [heroReady, setHeroReady] = useState(false);
  const [wordIdx, setWordIdx] = useState(0);

  const [techRef, techVis] = useInView();
  const [featRef, featVis] = useInView();
  const [journeyRef, journeyVis] = useInView();
  const [ctaRef, ctaVis] = useInView();

  const [pipeStep, setPipeStep] = useState(0);

  useEffect(() => { const t = setTimeout(() => setHeroReady(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => { const t = setInterval(() => setWordIdx(i => (i + 1) % HERO_WORDS.length), 3000); return () => clearInterval(t); }, []);

  // Pipeline auto-cycle: step 0→1→2→0…
  useEffect(() => {
    if (!journeyVis) return;
    const t = setInterval(() => setPipeStep(s => (s + 1) % JOURNEY.length), 2500);
    return () => clearInterval(t);
  }, [journeyVis]);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goLogin = useCallback(() => setView('login'), []);
  const goRegister = useCallback(() => setView('register'), []);
  const goLanding = useCallback(() => { setView('landing'); setHeroReady(false); setTimeout(() => setHeroReady(true), 50); }, []);

  if (user) return <Navigate to="/" replace />;

  /* ─── Auth Forms ─── */
  if (view === 'login' || view === 'register') {
    return (
      <>
        {view === 'login'
          ? <LoginForm onSwitch={goRegister} onBack={goLanding} />
          : <RegisterForm onSwitch={goLogin} onBack={goLanding} />}
        <style>{CSS}</style>
      </>
    );
  }

  /* ─── Landing ─── */
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <style>{CSS}</style>

      {/* ───── NAV ───── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 nav-bar transition-all duration-300 ${scrolled ? 'nav-scrolled' : 'nav-top'}`}>
        <div className="flex items-center justify-between h-[72px] px-6 sm:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-3 cursor-default">
            <div className="logo-mark sm-mark"><span>N</span></div>
            <div className="flex flex-col leading-tight">
              <span className="text-black font-extrabold text-[17px] tracking-tight">Naga Sai</span>
              <span className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase hidden sm:block">Learning Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={goLogin}
              className="px-5 py-2.5 text-slate-800 text-sm font-bold rounded-xl hover:bg-slate-100 transition-all hidden sm:block">
              Sign In
            </button>
            <button onClick={goRegister} className="btn-primary text-sm px-6 py-2.5">
              Get Started <FaArrowRight className="ml-1.5 text-[10px]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Nav spacer */}
      <div className="h-[72px]" />

      {/* ───── HERO ───── */}
      <section className="relative pt-16 sm:pt-24 pb-24 sm:pb-32 px-6">
        {/* Background decoration */}
        <div className="hero-bg-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-14 lg:gap-20">
          {/* Left content */}
          <div className={`lg:w-[52%] text-center lg:text-left space-y-7 hero-enter ${heroReady ? 'visible' : ''}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100">
              <span className="live-dot" />
              <span className="text-indigo-700 text-xs font-bold tracking-wide">Free Learning Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold leading-[1.08] tracking-tight">
              <span className="text-black">Learn to Code.</span>
              <br />
              <span className="hero-rotating" style={{ height: '1.2em' }}>
                <span className="hero-rotating-inner" style={{ transform: `translateY(-${wordIdx * (100 / HERO_WORDS.length)}%)` }}>
                  {HERO_WORDS.map((w, i) => (
                    <span key={i} className="hero-word">{w}</span>
                  ))}
                </span>
              </span>
            </h1>

            {/* Sub */}
            <p className="text-slate-800 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              Master full-stack web development with structured courses,
              HD video tutorials, a built-in code editor, and hands-on challenges.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <button onClick={goRegister} className="btn-primary group px-7 py-3.5 text-[15px]">
                Start Learning Free
                <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={goLogin}
                className="px-7 py-3.5 text-slate-900 text-[15px] font-semibold rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all">
                Sign In
              </button>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 pt-2">
              {['7+ Technologies', 'Browser Code Editor', 'Practice & Compete'].map((t, i) => (
                <span key={i} className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                  <FaCheckCircle className="text-emerald-500 text-[11px]" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right terminal */}
          <div className={`w-full lg:w-[48%] hero-enter hero-enter-right ${heroReady ? 'visible' : ''}`}>
            <div className="terminal-glow-wrap">
              <div className="terminal-glow" />
              <LiveTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ───── TECH MARQUEE ───── */}
      <section ref={techRef} className="py-20 sm:py-24 bg-slate-50/60 border-y border-slate-100 overflow-hidden">
        <div className={`text-center mb-12 px-6 section-enter ${techVis ? 'visible' : ''}`}>
          <span className="section-badge"><FaGraduationCap className="text-[10px] text-indigo-500" /> What You'll Learn</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black mt-5 mb-3">
            Technologies You'll <span className="gradient-text">Master</span>
          </h2>
          <p className="text-slate-700 text-base font-medium max-w-lg mx-auto">From your first HTML tag to deploying full-stack applications.</p>
        </div>
        <div className={`space-y-3 section-enter ${techVis ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
          <Marquee items={TECHNOLOGIES} speed={10} />
          <Marquee items={[...TECHNOLOGIES].reverse()} reverse speed={12} />
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section ref={featRef} className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-14 section-enter ${featVis ? 'visible' : ''}`}>
            <span className="section-badge"><FaCode className="text-[10px] text-indigo-500" /> Platform Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black mt-5 mb-3">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-slate-700 text-base font-medium max-w-lg mx-auto">All the tools a developer needs, built into one clean platform.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i}
                className={`feature-card section-enter ${featVis ? 'visible' : ''}`}
                style={{ transitionDelay: featVis ? `${150 + i * 100}ms` : '0ms' }}>
                <div className="feature-icon" style={{ background: f.bg }}>
                  <f.icon style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-1">{f.title}</h3>
                  <p className="text-slate-700 text-sm leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section ref={journeyRef} className="py-24 sm:py-32 px-6 border-y border-slate-100 overflow-hidden" style={{ background: '#fafbff' }}>
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 section-enter ${journeyVis ? 'visible' : ''}`}>
            <span className="section-badge"><FaRocket className="text-[10px] text-indigo-500" /> How It Works</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-black mt-5 mb-3">
              Three Steps to <span className="gradient-text">Get Started</span>
            </h2>
            <p className="text-slate-700 text-base font-medium max-w-lg mx-auto">A simple, structured path from beginner to confident developer.</p>
          </div>

          <div className={`section-enter ${journeyVis ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-8">

              {/* Left — step selector tabs */}
              <div className="lg:w-[40%] flex flex-col gap-4">
                {JOURNEY.map((s, i) => {
                  const active = i === pipeStep;
                  return (
                    <button key={i} onClick={() => setPipeStep(i)}
                      className={`hw-tab ${active ? 'hw-tab-active' : ''}`}
                      style={active ? { borderColor: s.accent + '30' } : {}}>
                      {/* Accent bar */}
                      <div className="hw-tab-bar" style={{ background: s.accent, transform: active ? 'scaleY(1)' : 'scaleY(0)' }} />

                      {/* Icon circle */}
                      <div className="hw-tab-icon" style={{
                        background: active ? s.accentBg : '#f8fafc',
                        boxShadow: active ? `0 0 0 4px ${s.accentGlow}, 0 4px 12px ${s.accentGlow}` : 'none'
                      }}>
                        <s.icon className="text-base transition-colors duration-300" style={{ color: active ? s.accent : '#94a3b8' }} />
                      </div>

                      <div className="flex-1 text-left">
                        {/* Label */}
                        <span className="hw-tab-label" style={{ color: active ? s.accent : '#94a3b8' }}>{s.label}</span>
                        {/* Title */}
                        <h3 className={`text-[17px] font-extrabold tracking-tight transition-colors duration-300 ${active ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</h3>
                        {/* Description */}
                        <div className={`hw-tab-desc ${active ? 'hw-tab-desc-open' : ''}`}>
                          <p className="text-[13.5px] leading-[1.65] font-medium text-slate-600">{s.desc}</p>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className={`hw-tab-arrow ${active ? 'hw-tab-arrow-active' : ''}`}>
                        <FaArrowRight className="text-[10px]" style={{ color: active ? s.accent : '#cbd5e1' }} />
                      </div>
                    </button>
                  );
                })}

                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-4 px-2">
                  <div className="flex gap-2 flex-1">
                    {JOURNEY.map((s, i) => (
                      <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{
                          width: i < pipeStep ? '100%' : i === pipeStep ? '100%' : '0%',
                          background: s.accent,
                          opacity: i <= pipeStep ? 1 : 0
                        }} />
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">{pipeStep + 1}/{JOURNEY.length}</span>
                </div>
              </div>

              {/* Right — live visual */}
              <div className="lg:w-[60%] hw-right-col">
                {HW_VISUALS.map((Visual, i) => (
                  <div key={i}
                    className={`hw-preview ${i === pipeStep ? 'hw-preview-active' : ''}`}>
                    <div className="hw-preview-glow" />
                    <div className="hw-visual-fill relative z-10">
                      <Visual active={i === pipeStep} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section ref={ctaRef} className="py-24 sm:py-32 px-6">
        <div className={`max-w-2xl mx-auto text-center section-enter ${ctaVis ? 'visible' : ''}`}>
          <div className="cta-icon-wrap">
            <FaRocket className="text-2xl text-indigo-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-black mb-4 mt-7">
            Ready to start your journey?
          </h2>
          <p className="text-slate-700 text-lg font-medium mb-8 max-w-md mx-auto leading-relaxed">
            Join for free and get instant access to all courses, tutorials, the code playground, and practice challenges.
          </p>
          <button onClick={goRegister} className="btn-primary group px-8 py-4 text-[15px]">
            Get Started Free
            <FaArrowRight className="ml-2 text-xs group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="footer-main">
        {/* Top gradient line */}
        <div className="footer-gradient-line" />

        <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">
          {/* Upper section */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-8 mb-14">
            {/* Brand column */}
            <div className="md:w-[40%]">
              <div className="flex items-center gap-3 mb-5">
                <div className="logo-mark"><span>N</span></div>
                <div className="flex flex-col leading-tight">
                  <span className="text-black font-extrabold text-lg tracking-tight">Naga Sai</span>
                  <span className="text-slate-500 text-[10px] font-semibold tracking-widest uppercase">Learning Platform</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium max-w-xs">
                Master full-stack web development with structured courses, video tutorials, and hands-on coding challenges.
              </p>
              {/* Tech icons row */}
              <div className="flex items-center gap-3 mt-6">
                {TECHNOLOGIES.slice(0, 5).map((t, i) => (
                  <div key={i} className="footer-tech-icon" style={{ '--tech-color': t.color }}>
                    <t.icon className="text-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="footer-col-title">Platform</h4>
                <ul className="footer-links">
                  <li><span>Video Courses</span></li>
                  <li><span>Code Playground</span></li>
                  <li><span>Practice Questions</span></li>
                  <li><span>Leaderboard</span></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Technologies</h4>
                <ul className="footer-links">
                  <li><span>HTML & CSS</span></li>
                  <li><span>JavaScript</span></li>
                  <li><span>React & Node.js</span></li>
                  <li><span>Python & SQL</span></li>
                </ul>
              </div>
              <div>
                <h4 className="footer-col-title">Get Started</h4>
                <ul className="footer-links">
                  <li><button onClick={goRegister} className="footer-link-btn">Create Account</button></li>
                  <li><button onClick={goLogin} className="footer-link-btn">Sign In</button></li>
                </ul>
                {/* CTA mini */}
                <button onClick={goRegister} className="footer-cta">
                  Start Free <FaArrowRight className="text-[9px] ml-1.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-7">
            <p className="text-slate-400 text-xs font-medium">
              &copy; {new Date().getFullYear()} Naga Sai. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="footer-badge">
                <span className="footer-badge-dot" />
                Free & Open Platform
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ═════════════════ ALL CSS ═════════════════ */
const CSS = `
  /* ── Tokens ── */
  .tok-tag  { color: #e06c75; }
  .tok-str  { color: #98c379; }
  .tok-kw   { color: #c678dd; }
  .tok-cmt  { color: #5c6370; font-style: italic; }
  .tok-num  { color: #d19a66; }
  .tok-def  { color: #abb2bf; }
  .tok-cmd  { color: #e5e7eb; }
  .tok-ok   { color: #4ade80; }
  .tok-link { color: #60a5fa; }

  /* ── Terminal ── */
  .terminal-wrap {
    background: #0d1117;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 25px 60px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
    position: relative;
    z-index: 1;
  }
  .terminal-bar {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
  }
  .terminal-dot { width: 10px; height: 10px; border-radius: 50%; }
  .terminal-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 4px 12px; font-size: 11px; font-weight: 500;
    border-radius: 6px; color: #636e7b; transition: all 0.2s;
    border: none; background: none; cursor: pointer;
  }
  .terminal-tab.active { background: rgba(255,255,255,0.08); color: #d1d5db; }
  .terminal-tab:hover:not(.active) { color: #9ca3af; }
  .terminal-body {
    padding: 20px; min-height: 320px;
    font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
    font-size: 13px; line-height: 1.85;
  }
  .terminal-lines {
    user-select: none; padding-right: 16px; text-align: right;
    color: #3b4252; border-right: 1px solid rgba(255,255,255,0.04);
    margin-right: 16px; min-width: 28px;
  }
  .terminal-code { flex: 1; white-space: pre-wrap; }
  .terminal-cursor {
    display: inline-block; width: 2px; height: 15px;
    background: #818cf8; margin-left: 1px; vertical-align: middle;
    animation: blink 1s step-end infinite;
  }
  .terminal-glow-wrap { position: relative; }
  .terminal-glow {
    position: absolute; inset: -20px; z-index: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1), rgba(236,72,153,0.08));
    border-radius: 28px; filter: blur(30px);
    animation: termPulse 5s ease-in-out infinite;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 12px 28px; color: #fff; font-weight: 600; border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
    border: none; cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-primary:hover {
    filter: brightness(1.1);
    box-shadow: 0 8px 28px rgba(79,70,229,0.35);
    transform: translateY(-1px);
  }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { opacity: 0.5; pointer-events: none; }

  /* ── Logo ── */
  .logo-mark {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 12px rgba(79,70,229,0.25);
  }
  .logo-mark span { color: #fff; font-weight: 800; font-size: 18px; }
  .sm-mark { width: 36px; height: 36px; border-radius: 10px; }
  .sm-mark span { font-size: 16px; }
  .xs-mark { width: 24px; height: 24px; border-radius: 6px; }
  .xs-mark span { font-size: 10px; }

  /* ── Navbar ── */
  .nav-bar {
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }
  .nav-top {
    background: rgba(255,255,255,0.6);
    border-bottom: 1px solid transparent;
    box-shadow: none;
  }
  .nav-scrolled {
    background: rgba(255,255,255,0.92);
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03);
  }

  /* ── Auth pages ── */
  .auth-page-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: #fff; position: relative; overflow: hidden;
  }
  .auth-bg-dots {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 28px 28px; opacity: 0.5;
  }
  .auth-card {
    position: relative; z-index: 1;
    width: 100%; max-width: 460px;
    background: #fff; border-radius: 24px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 20px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03);
    padding: 40px 44px;
  }
  @media (max-width: 520px) { .auth-card { padding: 32px 24px; border-radius: 20px; } }

  /* Inputs */
  .auth-input-wrap { position: relative; }
  .auth-input-icon {
    position: absolute; left: 15px; top: 50%; transform: translateY(-50%);
    font-size: 13px; color: #cbd5e1;
    pointer-events: none; transition: color 0.2s;
  }
  .auth-input {
    width: 100%; padding: 14px 16px; border-radius: 12px;
    background: #fff; border: 1.5px solid #e2e8f0;
    color: #0f172a; font-size: 14px; font-weight: 500;
    transition: all 0.2s; outline: none;
  }
  .auth-input-has-icon { padding-left: 44px; }
  .auth-input::placeholder { color: #94a3b8; font-weight: 400; }
  .auth-input:hover { border-color: #cbd5e1; }
  .auth-input:focus {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .auth-input-wrap:focus-within .auth-input-icon { color: #6366f1; }

  /* Submit */
  .auth-submit-btn {
    display: flex; align-items: center; justify-content: center;
    width: 100%; padding: 14px 28px; border: none; border-radius: 12px;
    color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
    background: linear-gradient(135deg, #4f46e5, #6d28d9);
    box-shadow: 0 4px 16px rgba(79,70,229,0.25);
    transition: all 0.2s; margin-top: 4px;
  }
  .auth-submit-btn:hover {
    box-shadow: 0 8px 28px rgba(79,70,229,0.3);
    transform: translateY(-1px);
  }
  .auth-submit-btn:active { transform: scale(0.98); }
  .auth-submit-btn:disabled { opacity: 0.5; pointer-events: none; }


  .loader {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  /* ── Hero ── */
  .hero-bg-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
    background-size: 32px 32px; opacity: 0.4;
  }
  .hero-glow {
    position: absolute; border-radius: 50%; pointer-events: none;
    filter: blur(80px); opacity: 0.07;
  }
  .hero-glow-1 {
    width: 500px; height: 500px; top: -100px; right: -100px;
    background: #4f46e5;
    animation: floatOrb 10s ease-in-out infinite;
  }
  .hero-glow-2 {
    width: 400px; height: 400px; bottom: -50px; left: -80px;
    background: #ec4899;
    animation: floatOrb 12s ease-in-out infinite reverse;
  }
  .hero-enter {
    opacity: 0; transform: translateY(24px);
    transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1);
  }
  .hero-enter-right { transform: translateX(30px) translateY(0); }
  .hero-enter.visible { opacity: 1; transform: none; }
  .hero-enter-right.visible { opacity: 1; transform: none; transition-delay: 0.15s; }

  .hero-rotating {
    position: relative; display: inline-block; overflow: hidden;
    vertical-align: bottom; white-space: nowrap;
  }
  .hero-rotating-inner {
    display: inline-flex; flex-direction: column;
    transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
  }
  .hero-word {
    display: block; line-height: 1.2;
    background: linear-gradient(135deg, #4f46e5, #9333ea, #ec4899);
    background-size: 200% auto;
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmerGrad 4s ease-in-out infinite;
  }

  .live-dot {
    position: relative; width: 8px; height: 8px;
  }
  .live-dot::before {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: #10b981;
  }
  .live-dot::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: #10b981; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
  }

  /* ── Sections ── */
  .section-enter {
    opacity: 0; transform: translateY(20px);
    transition: opacity 0.7s ease-out, transform 0.7s ease-out;
  }
  .section-enter.visible { opacity: 1; transform: none; }

  .section-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 100px;
    background: #eef2ff; border: 1px solid #e0e7ff;
    font-size: 11px; font-weight: 700; color: #4338ca;
    text-transform: uppercase; letter-spacing: 0.08em;
  }

  .gradient-text {
    background: linear-gradient(135deg, #4f46e5, #9333ea);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* ── Tech pills ── */
  .tech-pill {
    flex-shrink: 0; display: flex; align-items: center; gap: 10px;
    padding: 12px 20px; border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: all 0.3s;
  }
  .tech-pill:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
  .marquee-row:hover .marquee-track { animation-play-state: paused; }

  /* ── Feature cards ── */
  .feature-card {
    display: flex; align-items: flex-start; gap: 16px;
    padding: 28px; border-radius: 16px; background: #fff;
    border: 1px solid #f1f5f9;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    transition: all 0.3s;
  }
  .feature-card:hover {
    border-color: #e2e8f0;
    box-shadow: 0 8px 30px -8px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }
  .feature-icon {
    flex-shrink: 0; width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  /* ── How It Works ── */
  .hw-tab {
    position: relative; display: flex; align-items: flex-start; gap: 16px;
    padding: 22px 24px 22px 28px; border-radius: 16px;
    border: 1.5px solid transparent;
    background: transparent; cursor: pointer; text-align: left;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .hw-tab:hover { background: rgba(255,255,255,0.6); }
  .hw-tab-active {
    background: #fff !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03);
  }
  .hw-tab-bar {
    position: absolute; left: 0; top: 16px; bottom: 16px; width: 3.5px;
    border-radius: 4px;
    transform-origin: center; transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .hw-tab-icon {
    flex-shrink: 0; width: 46px; height: 46px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
    margin-top: 2px;
  }
  .hw-tab-label {
    display: block; font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin-bottom: 4px; transition: color 0.3s;
  }
  .hw-tab-desc {
    max-height: 0; opacity: 0; overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, margin 0.4s ease;
    margin-top: 0;
  }
  .hw-tab-desc-open {
    max-height: 80px; opacity: 1; margin-top: 6px;
  }
  .hw-tab-arrow {
    flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: #f8fafc; margin-top: 8px;
    transition: all 0.3s; opacity: 0; transform: translateX(-4px);
  }
  .hw-tab-arrow-active {
    opacity: 1; transform: translateX(0);
  }

  /* Right column */
  .hw-right-col {
    position: relative; display: grid; grid-template: 1fr / 1fr;
  }

  /* Preview */
  .hw-preview {
    grid-area: 1 / 1;
    opacity: 0; transform: translateY(12px) scale(0.97);
    transition: all 0.5s cubic-bezier(0.16,1,0.3,1);
    pointer-events: none;
    display: flex; flex-direction: column;
  }
  .hw-preview-active {
    opacity: 1; transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .hw-preview-glow {
    position: absolute; inset: -16px; z-index: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06));
    border-radius: 28px; filter: blur(24px);
  }
  .hw-visual-fill {
    height: 100%; display: flex; flex-direction: column;
  }
  .hw-visual-wrap {
    border-radius: 16px; overflow: hidden;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 24px 60px -12px rgba(0,0,0,0.12);
    background: #fff;
    height: 100%; display: flex; flex-direction: column;
  }

  /* Video player */
  .hw-video-only { background: #000; flex: 1; display: flex; flex-direction: column; }
  .hw-video-screen-full {
    position: relative; flex: 1;
    background: linear-gradient(135deg, #1e1b4b, #312e81, #1e1b4b);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; min-height: 280px;
  }
  .hw-video-screen-full::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%);
  }
  .hw-video-play {
    width: 52px; height: 52px; border-radius: 50%;
    background: rgba(255,255,255,0.15); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,0.3);
    animation: playPulse 2s ease-in-out infinite;
    position: relative; z-index: 1;
  }
  @keyframes playPulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
    50% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(255,255,255,0); }
  }

  /* ── CTA icon ── */
  .cta-icon-wrap {
    width: 64px; height: 64px; border-radius: 20px;
    background: #eef2ff; border: 1px solid #e0e7ff;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto;
  }

  /* ── Footer ── */
  .footer-main {
    background: #fff; position: relative; overflow: hidden;
  }
  .footer-gradient-line {
    height: 3px;
    background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899, #f59e0b, #10b981, #4f46e5);
    background-size: 200% auto;
    animation: shimmerGrad 4s linear infinite;
  }
  .footer-col-title {
    font-size: 11px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.12em; color: #64748b; margin-bottom: 16px;
  }
  .footer-links {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 10px;
  }
  .footer-links span, .footer-link-btn {
    font-size: 13.5px; font-weight: 500; color: #475569;
    cursor: default; transition: color 0.2s;
    background: none; border: none; padding: 0; text-align: left;
  }
  .footer-links span:hover, .footer-link-btn:hover { color: #0f172a; }
  .footer-link-btn { cursor: pointer; }
  .footer-tech-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #f8fafc;
    display: flex; align-items: center; justify-content: center;
    color: var(--tech-color);
    border: 1px solid #e2e8f0;
    transition: all 0.3s;
  }
  .footer-tech-icon:hover {
    background: #f1f5f9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  }
  .footer-cta {
    display: inline-flex; align-items: center;
    margin-top: 20px; padding: 9px 18px; border-radius: 10px;
    font-size: 12px; font-weight: 700; color: #fff;
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    border: none; cursor: pointer;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
    transition: all 0.2s;
  }
  .footer-cta:hover {
    filter: brightness(1.15);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(79,70,229,0.4);
  }
  .footer-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  }
  .footer-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 14px; border-radius: 100px;
    background: #ecfdf5; border: 1px solid #d1fae5;
    font-size: 11px; font-weight: 700; color: #059669;
  }
  .footer-badge-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #10b981;
    animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
  }

  /* ── Keyframes ── */
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes ping { 75%,100% { transform: scale(2.5); opacity: 0; } }
  @keyframes shimmerGrad {
    0%,100% { background-position: 0% center; }
    50% { background-position: 100% center; }
  }
  @keyframes termPulse {
    0%,100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.01); }
  }
  @keyframes floatOrb {
    0%,100% { transform: translate(0,0); }
    33% { transform: translate(20px,-15px); }
    66% { transform: translate(-15px,10px); }
  }
  @keyframes marqueeL { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
  @keyframes marqueeR { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
`;

export default Auth;
