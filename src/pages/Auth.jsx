import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  FaBook, FaCode, FaLaptopCode, FaGraduationCap,
  FaArrowRight, FaRocket, FaYoutube, FaUsers,
  FaPlay, FaStar, FaChevronRight, FaArrowLeft,
  FaGithub, FaLinkedin, FaHeart, FaEnvelope
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: FaYoutube,
    title: 'Video Tutorials',
    desc: 'Learn with detailed video explanations for every topic, from basics to advanced.',
    color: 'rgb(239, 68, 68)',
    bg: 'rgba(239, 68, 68, 0.15)',
  },
  {
    icon: FaLaptopCode,
    title: 'Code Playground',
    desc: 'Write and run HTML, CSS, JavaScript, Python & SQL directly in your browser.',
    color: 'rgb(34, 197, 94)',
    bg: 'rgba(34, 197, 94, 0.15)',
  },
  {
    icon: FaBook,
    title: 'Structured Courses',
    desc: 'Follow a clear learning path from beginner to advanced, step by step.',
    color: 'rgb(59, 130, 246)',
    bg: 'rgba(59, 130, 246, 0.15)',
  },
  {
    icon: FaGraduationCap,
    title: 'Practice & Grow',
    desc: 'Hands-on practice questions and coding challenges to sharpen your skills.',
    color: 'rgb(168, 85, 247)',
    bg: 'rgba(168, 85, 247, 0.15)',
  },
];

const stats = [
  { value: 'Free', label: 'Access', icon: FaStar },
  { value: '50+', label: 'Topics', icon: FaBook },
  { value: '5+', label: 'Languages', icon: FaCode },
  { value: '24/7', label: 'Available', icon: FaRocket },
];

const footerLinks = [
  { label: 'Features', anchor: '#features' },
  { label: 'Courses', anchor: '#stats' },
  { label: 'Playground', anchor: '#features' },
];

/* ─────────── Animated Background (shared) ─────────── */
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
      style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.4) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite' }}
    />
    <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }}
    />
    <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }}
    />
    <div className="absolute inset-0 opacity-[0.03]"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
    />
  </div>
);

/* ─────────── Form Left Panel (shared branding side) ─────────── */
const FormLeftPanel = ({ isLogin }) => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-16">
    {/* Background */}
    <div className="absolute inset-0"
      style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #16213e 50%, #0f3460 100%)' }}
    />
    <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full opacity-40"
      style={{ background: 'radial-gradient(circle, rgba(233,69,96,0.4) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite' }}
    />
    <div className="absolute bottom-1/4 -right-16 w-[350px] h-[350px] rounded-full opacity-25"
      style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }}
    />
    <div className="absolute top-2/3 left-1/3 w-[250px] h-[250px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }}
    />
    <div className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }}
    />

    <div className="relative z-10 max-w-lg">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-gradient-to-br from-dark-accent to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{ boxShadow: '0 0 40px rgba(233, 69, 96, 0.35)' }}
        >
          <span className="text-white font-bold text-2xl">N</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-dark-accent to-purple-400 bg-clip-text text-transparent">
            Naga sai J
          </h2>
          <p className="text-dark-muted text-xs tracking-wider uppercase">Learning Platform</p>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-5">
        {isLogin ? (
          <>Welcome back to your <span className="bg-gradient-to-r from-dark-accent to-purple-400 bg-clip-text text-transparent">learning journey</span></>
        ) : (
          <>Start your path to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">becoming a developer</span></>
        )}
      </h1>
      <p className="text-dark-muted text-lg leading-relaxed mb-10">
        {isLogin
          ? 'Pick up right where you left off. Your courses, progress, and code playground are waiting for you.'
          : 'Join thousands of learners. Get free access to video tutorials, structured courses, and an interactive code playground.'
        }
      </p>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { icon: FaPlay, text: 'Video Lessons' },
          { icon: FaCode, text: 'Code Playground' },
          { icon: FaBook, text: 'Structured Path' },
          { icon: FaStar, text: '100% Free' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5">
            <item.icon className="text-dark-accent text-xs" />
            <span className="text-sm text-dark-muted">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─────────── Login Form ─────────── */
const LoginForm = ({ onSwitch, onBack }) => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-content-fade-in">
      {/* Back link */}
      <button onClick={onBack} className="flex items-center gap-2 text-dark-muted hover:text-dark-text text-sm mb-8 transition-colors group">
        <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to home
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-dark-accent to-purple-600 rounded-xl flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)' }}
        >
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-dark-accent to-purple-400 bg-clip-text text-transparent">
          Naga sai J
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-text mb-2">Sign in</h1>
      <p className="text-dark-muted text-base mb-10">Enter your credentials to access your account</p>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <span className="text-red-400 font-bold text-xs">!</span>
          </div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2.5">Email address</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted/40 text-sm" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-dark-text text-base placeholder-dark-muted/30 focus:outline-none focus:border-dark-accent/50 focus:bg-white/[0.06] focus:shadow-lg focus:shadow-dark-accent/5 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Enter your password"
            required
            className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-dark-text text-base placeholder-dark-muted/30 focus:outline-none focus:border-dark-accent/50 focus:bg-white/[0.06] focus:shadow-lg focus:shadow-dark-accent/5 transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-white text-base font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 mt-2"
          style={{ background: 'linear-gradient(135deg, #e94560, #8b5cf6)', boxShadow: '0 8px 30px rgba(233, 69, 96, 0.3)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full loader-spin" />
              Signing in...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-dark-muted text-xs uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <p className="text-center text-dark-muted">
        Don't have an account?{' '}
        <button onClick={onSwitch} className="text-dark-accent hover:underline font-bold text-base">
          Register now
        </button>
      </p>
    </div>
  );
};

/* ─────────── Register Form ─────────── */
const RegisterForm = ({ onSwitch, onBack }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) { setError('Name is required'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await register(formData.name, formData.email, formData.password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-content-fade-in">
      {/* Back link */}
      <button onClick={onBack} className="flex items-center gap-2 text-dark-muted hover:text-dark-text text-sm mb-8 transition-colors group">
        <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back to home
      </button>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center"
          style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
        >
          <span className="text-white font-bold text-lg">N</span>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Naga sai J
        </span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-text mb-2">Create account</h1>
      <p className="text-dark-muted text-base mb-10">Start your free learning journey today</p>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl mb-8 text-sm">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <span className="text-red-400 font-bold text-xs">!</span>
          </div>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2.5">Full Name</label>
          <div className="relative">
            <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted/40 text-sm" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-dark-text text-base placeholder-dark-muted/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-lg focus:shadow-purple-500/5 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2.5">Email address</label>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-muted/40 text-sm" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-dark-text text-base placeholder-dark-muted/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-lg focus:shadow-purple-500/5 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark-text mb-2.5">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Min. 6 characters"
            required
            className="w-full px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 text-dark-text text-base placeholder-dark-muted/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-lg focus:shadow-purple-500/5 transition-all"
          />
          <p className="text-dark-muted/50 text-xs mt-2 ml-1">Must be at least 6 characters</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 text-white text-base font-bold rounded-2xl transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 mt-2"
          style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.3)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full loader-spin" />
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-dark-muted text-xs uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <p className="text-center text-dark-muted">
        Already have an account?{' '}
        <button onClick={onSwitch} className="text-dark-accent hover:underline font-bold text-base">
          Sign in
        </button>
      </p>
    </div>
  );
};

/* ═══════════════ Main Auth Page ═══════════════ */
const Auth = () => {
  const { user } = useAuth();
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register'
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top when switching views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const showLogin = () => setView('login');
  const showRegister = () => setView('register');
  const showLanding = () => setView('landing');

  /* ─── Login / Register View ─── */
  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex">
        {/* Left Panel - Branding (desktop) */}
        <FormLeftPanel isLogin={view === 'login'} />

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 overflow-y-auto">
          {/* Mobile background blobs */}
          <div className="lg:hidden">
            <AnimatedBackground />
          </div>
          <div className="relative z-10 w-full">
            {view === 'login'
              ? <LoginForm onSwitch={showRegister} onBack={showLanding} />
              : <RegisterForm onSwitch={showLogin} onBack={showLanding} />
            }
          </div>
        </div>

        <style>{animationStyles}</style>
      </div>
    );
  }

  /* ─── Landing View ─── */
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text overflow-x-hidden">

      {/* ───── Navbar ───── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-dark-accent to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)' }}
            >
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-dark-accent to-purple-400 bg-clip-text text-transparent">
                Naga sai J
              </span>
              <p className="text-[10px] text-dark-muted -mt-0.5 tracking-wider uppercase">Learning Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hidden sm:block text-sm text-dark-muted hover:text-dark-text transition-colors">Features</a>
            <a href="#stats" className="hidden sm:block text-sm text-dark-muted hover:text-dark-text transition-colors">About</a>
            <button
              onClick={showLogin}
              className="relative px-6 py-2.5 text-sm font-semibold text-white rounded-xl overflow-hidden group transition-all"
              style={{ background: 'linear-gradient(135deg, #e94560, #8b5cf6)' }}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2">
                Login <FaChevronRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <AnimatedBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-dark-accent/30 bg-dark-accent/10 mb-8 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <FaRocket className="text-dark-accent text-xs" />
            <span className="text-sm text-dark-accent font-medium">Start your coding journey today</span>
          </div>

          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 transition-all duration-700 delay-100 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            Master Web Development{' '}
            <span className="bg-gradient-to-r from-dark-accent via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Step by Step
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl text-dark-muted max-w-2xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            Video tutorials, interactive playgrounds, practice questions, and structured courses — everything you need to become a full-stack developer.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <button
              onClick={showLogin}
              className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl text-lg shadow-xl transition-all hover:scale-[1.03] hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #e94560, #8b5cf6)', boxShadow: '0 8px 30px rgba(233, 69, 96, 0.35)' }}
            >
              <FaPlay className="text-sm" />
              Get Started Free
              <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 text-dark-text font-medium rounded-2xl text-lg border border-dark-secondary/60 hover:border-dark-accent/40 hover:bg-dark-card/50 transition-all"
            >
              Explore Features
            </a>
          </div>

          <div
            id="stats"
            className={`grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto transition-all duration-700 delay-[400ms] ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-4 px-3 rounded-xl bg-dark-card/60 border border-dark-secondary/30">
                <s.icon className="text-dark-accent text-sm mb-1" />
                <span className="text-2xl font-bold">{s.value}</span>
                <span className="text-dark-muted text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ animation: 'bounce 2s ease-in-out infinite' }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-dark-muted/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-dark-accent/60"
              style={{ animation: 'scrollDot 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ───── Features Section ───── */}
      <section id="features" className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark-card/30 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-dark-accent text-sm font-semibold tracking-wider uppercase">Why choose us</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Everything you need to learn coding</h2>
            <p className="text-dark-muted max-w-xl mx-auto">A complete platform designed to take you from zero to job-ready developer.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-dark-card border border-dark-secondary/40 hover:border-dark-accent/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${f.bg}, transparent 60%)` }}
                />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: f.bg }}
                  >
                    <f.icon className="text-xl" style={{ color: f.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{f.title}</h3>
                    <p className="text-dark-muted text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden border border-dark-secondary/40"
            style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.9), rgba(22,33,62,0.9), rgba(15,52,96,0.6))' }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-dark-accent/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 text-center px-8 py-16 sm:px-16">
              <div className="w-16 h-16 bg-gradient-to-br from-dark-accent to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
                style={{ boxShadow: '0 0 40px rgba(233, 69, 96, 0.3)' }}
              >
                <FaRocket className="text-white text-2xl" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to start learning?</h2>
              <p className="text-dark-muted text-lg mb-8 max-w-lg mx-auto">
                Join now and get free access to all courses, video tutorials, and the interactive code playground.
              </p>
              <button
                onClick={showLogin}
                className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold rounded-2xl text-lg transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg, #e94560, #8b5cf6)', boxShadow: '0 8px 30px rgba(233, 69, 96, 0.35)' }}
              >
                <FaUsers />
                Get Started Free
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-white/5 bg-dark-card/30">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* Left: logo + copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-dark-accent to-purple-600 rounded-lg flex items-center justify-center"
                style={{ boxShadow: '0 0 12px rgba(233, 69, 96, 0.2)' }}
              >
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-sm text-dark-muted">
                &copy; {new Date().getFullYear()} <span className="font-semibold bg-gradient-to-r from-dark-accent to-purple-400 bg-clip-text text-transparent">Naga sai J</span>
              </span>
            </div>

            {/* Center: links */}
            <div className="flex items-center gap-6">
              <a href="#features" className="text-xs text-dark-muted hover:text-dark-text transition-colors">Features</a>
              <a href="#stats" className="text-xs text-dark-muted hover:text-dark-text transition-colors">About</a>
              <button onClick={showLogin} className="text-xs text-dark-muted hover:text-dark-accent transition-colors">Login</button>
            </div>

            {/* Right: socials */}
            <div className="flex items-center gap-2">
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-dark-muted/60 hover:text-dark-text hover:border-white/15 transition-all text-sm"
              >
                <FaGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-dark-muted/60 hover:text-blue-400 hover:border-blue-400/20 transition-all text-sm"
              >
                <FaLinkedin />
              </a>
              <a href="mailto:hello@example.com"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-dark-muted/60 hover:text-purple-400 hover:border-purple-400/20 transition-all text-sm"
              >
                <FaEnvelope />
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{animationStyles}</style>
    </div>
  );
};

/* ─── Shared Animation CSS ─── */
const animationStyles = `
  @keyframes blobFloat {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(8px); }
  }
  @keyframes scrollDot {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(4px); }
  }
`;

export default Auth;
