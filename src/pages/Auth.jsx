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
    <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
      style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite' }}
    />
    <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] rounded-full opacity-15"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }}
    />
    <div className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full opacity-10"
      style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }}
    />
    <div className="absolute inset-0 opacity-[0.03]"
      style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
    />
  </div>
);

/* ─────────── Form Left Panel (shared branding side) ─────────── */
const FormLeftPanel = ({ isLogin }) => (
  <div className="hidden lg:flex lg:w-1/2 relative overflow-y-auto scrollbar-hidden flex-col px-16 py-16"
    style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 40%, #c7d2fe 100%)' }}
  >
    {/* Background blobs - sticky so they stay visible while scrolling */}
    <div className="sticky top-0 left-0 w-0 h-0 overflow-visible pointer-events-none">
      <div className="absolute top-[25vh] -left-20 w-[400px] h-[400px] rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)', animation: 'blobFloat 8s ease-in-out infinite' }}
      />
      <div className="absolute top-[50vh] left-[calc(100%+16rem)] w-[350px] h-[350px] rounded-full opacity-25 -translate-x-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)', animation: 'blobFloat 10s ease-in-out infinite reverse' }}
      />
      <div className="absolute top-[65vh] left-[33%] w-[250px] h-[250px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', animation: 'blobFloat 12s ease-in-out infinite' }}
      />
    </div>

    <div className="relative z-10 max-w-lg my-auto">
      {/* Heading */}
      <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-5">
        {isLogin ? (
          <>Welcome back to your <span className="bg-gradient-to-r from-dark-accent to-indigo-400 bg-clip-text text-transparent">learning journey</span></>
        ) : (
          <>Start your path to <span className="bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent">becoming a developer</span></>
        )}
      </h1>
      <p className="text-indigo-900/60 text-lg leading-relaxed mb-10">
        {isLogin
          ? 'Pick up right where you left off. Your courses, progress, and code playground are waiting for you.'
          : 'Join thousands of learners. Get free access to video tutorials, structured courses, and an interactive code playground.'
        }
      </p>

      {/* Feature cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { icon: FaPlay, title: 'Video Lessons', desc: 'Learn with detailed video tutorials', color: 'rgba(239,68,68,0.12)', iconColor: '#ef4444', glow: 'rgba(239,68,68,0.2)' },
          { icon: FaCode, title: 'Code Playground', desc: 'Write & run code in browser', color: 'rgba(34,197,94,0.12)', iconColor: '#22c55e', glow: 'rgba(34,197,94,0.2)' },
          { icon: FaBook, title: 'Structured Path', desc: 'Beginner to advanced courses', color: 'rgba(59,130,246,0.12)', iconColor: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
          { icon: FaStar, title: '100% Free', desc: 'No hidden charges ever', color: 'rgba(245,158,11,0.12)', iconColor: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
        ].map((item, i) => (
          <div
            key={i}
            className="group relative flex flex-col gap-3 p-5 rounded-2xl border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle, ${item.glow}, transparent 70%)` }}
            />
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative z-10"
              style={{ backgroundColor: item.color, boxShadow: `0 4px 16px ${item.glow}` }}
            >
              <item.icon className="text-lg" style={{ color: item.iconColor }} />
            </div>
            <div className="relative z-10">
              <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">{item.title}</h4>
              <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial / trust */}
      <div className="flex items-center gap-5 px-6 py-5 rounded-2xl bg-indigo-50/50 border border-indigo-200">
        <div className="flex -space-x-2.5">
          {['#e94560', '#8b5cf6', '#3b82f6', '#22c55e'].map((bg, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white flex items-center justify-center text-white text-xs font-bold" style={{ background: bg }}>
              {['A', 'K', 'R', 'S'][i]}
            </div>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-xs" />)}
          </div>
          <p className="text-indigo-900/70 text-sm">Trusted by <span className="text-indigo-900 font-bold">500+</span> learners</p>
        </div>
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
    <div className="w-full max-w-[440px] mx-auto animate-content-fade-in">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-8 transition-colors group">
        <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 p-8 sm:p-10"
        style={{ background: 'white', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-500 text-sm">Welcome back! Enter your details below.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-[15px] placeholder-gray-400 focus:outline-none focus:border-dark-accent focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-[15px] placeholder-gray-400 focus:outline-none focus:border-dark-accent focus:bg-white transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white text-[15px] font-bold rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full loader-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Switch */}
        <p className="text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-dark-accent font-bold hover:underline transition-colors">
            Sign Up
          </button>
        </p>
      </div>

      {/* Bottom trust text */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => <FaStar key={i} className="text-amber-400 text-[10px]" />)}
        </div>
        <span className="text-gray-400 text-xs">Trusted by 500+ learners</span>
      </div>
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
    <div className="w-full max-w-[440px] mx-auto animate-content-fade-in">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium mb-8 transition-colors group">
        <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 p-8 sm:p-10"
        style={{ background: 'white', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm">Join for free and start learning today.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3.5 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-[15px] placeholder-gray-400 focus:outline-none focus:border-dark-accent focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-[15px] placeholder-gray-400 focus:outline-none focus:border-dark-accent focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-[15px] placeholder-gray-400 focus:outline-none focus:border-dark-accent focus:bg-white transition-all"
            />
            <p className="text-gray-400 text-xs mt-2">Must be at least 6 characters</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-white text-[15px] font-bold rounded-xl transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 mt-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full loader-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-7">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs font-medium">OR</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Switch */}
        <p className="text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-dark-accent font-bold hover:underline transition-colors">
            Sign In
          </button>
        </p>
      </div>

      {/* Bottom features */}
      <div className="flex items-center justify-center gap-5 mt-6">
        {[
          { icon: FaPlay, text: 'Video Lessons' },
          { icon: FaCode, text: 'Code Playground' },
          { icon: FaStar, text: '100% Free' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <item.icon className="text-gray-400 text-[10px]" />
            <span className="text-gray-500 text-xs">{item.text}</span>
          </div>
        ))}
      </div>
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

  // Lock body scroll on login/register, allow on landing
  useEffect(() => {
    if (view === 'login' || view === 'register') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return () => { document.body.style.overflow = ''; };
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
      <div className="h-screen overflow-hidden bg-dark-bg text-dark-text flex">
        {/* Left Panel - Branding (desktop) */}
        <FormLeftPanel isLogin={view === 'login'} />

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 relative flex flex-col px-6 sm:px-10 lg:px-16 py-12 overflow-y-auto scrollbar-hidden">
          {/* Mobile background blobs */}
          <div className="lg:hidden">
            <AnimatedBackground />
          </div>
          <div className="relative z-10 w-full my-auto">
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
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200"
        style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between h-[76px] px-6 sm:px-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-dark-accent to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-lg">N</span>
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              Naga sai J
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-10">
            <a href="#features" className="text-base font-bold text-gray-700 hover:text-gray-900 transition-colors">Features</a>
            <a href="#stats" className="text-base font-bold text-gray-700 hover:text-gray-900 transition-colors">About</a>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-5">
            <button
              onClick={showLogin}
              className="hidden sm:block text-base font-bold text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={showRegister}
              className="px-6 py-3 text-base font-bold text-white rounded-lg transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 sm:pt-36">
        <AnimatedBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border border-dark-accent/30 bg-dark-accent/10 mb-10 transition-all duration-700 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <FaRocket className="text-dark-accent text-xs" />
            <span className="text-sm text-dark-accent font-medium">Start your coding journey today</span>
          </div>

          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] mb-6 transition-all duration-700 delay-100 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            Master Web Development{' '}
            <span className="bg-gradient-to-r from-dark-accent via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
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
              style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 8px 30px rgba(79, 70, 229, 0.35)' }}
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
            className={`grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-6 max-w-4xl mx-auto transition-all duration-700 delay-[400ms] ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            {stats.map((s, i) => {
              const colors = [
                { gradient: 'from-rose-500 to-pink-600', glow: 'rgba(233,69,96,0.25)', bg: 'rgba(233,69,96,0.12)' },
                { gradient: 'from-blue-500 to-cyan-500', glow: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.12)' },
                { gradient: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.25)', bg: 'rgba(139,92,246,0.12)' },
                { gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.12)' },
              ];
              const c = colors[i];
              return (
                <div
                  key={i}
                  className="group relative flex flex-col items-center gap-3 py-8 px-5 rounded-2xl bg-white border border-gray-200 hover:border-indigo-300 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden cursor-default"
                  style={{ boxShadow: `0 4px 24px ${c.glow}` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${c.bg}, transparent 70%)` }}
                  />
                  <div className={`relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${c.glow}` }}
                  >
                    <s.icon className="text-white text-xl" />
                  </div>
                  <span className="relative z-10 text-4xl sm:text-5xl font-extrabold bg-gradient-to-b from-gray-900 to-gray-900/70 bg-clip-text text-transparent">
                    {s.value}
                  </span>
                  <span className="relative z-10 text-dark-muted text-sm font-medium tracking-wide uppercase">
                    {s.label}
                  </span>
                </div>
              );
            })}
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
      <section id="features" className="py-28 sm:py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/50 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-300 bg-indigo-50 mb-6">
              <FaStar className="text-dark-accent text-xs" />
              <span className="text-sm text-dark-accent font-semibold tracking-wide uppercase">Why choose us</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-3 mb-5 leading-tight">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-dark-accent via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                learn coding
              </span>
            </h2>
            <p className="text-dark-muted text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              A complete platform designed to take you from zero to job-ready developer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="group relative p-8 sm:p-10 rounded-3xl bg-white border border-gray-200 hover:border-indigo-300 shadow-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                style={{ boxShadow: `0 4px 30px ${f.bg}` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 20% 30%, ${f.bg}, transparent 55%)` }}
                />
                {/* Corner accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${f.color}, transparent 70%)` }}
                />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: f.bg, boxShadow: `0 8px 24px ${f.bg}` }}
                  >
                    <f.icon className="text-2xl" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-bold text-xl sm:text-2xl mb-3 text-dark-text">{f.title}</h3>
                  <p className="text-dark-muted text-base sm:text-lg leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA Section ───── */}
      <section className="py-28 sm:py-32 px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden border border-indigo-200"
            style={{ background: 'linear-gradient(135deg, rgba(238,242,255,0.95), rgba(224,231,255,0.95), rgba(199,210,254,0.7))' }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center px-8 py-20 sm:px-16 sm:py-24">
              <div className="w-20 h-20 bg-gradient-to-br from-dark-accent to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl"
                style={{ boxShadow: '0 0 50px rgba(79, 70, 229, 0.3)' }}
              >
                <FaRocket className="text-white text-3xl" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-5 leading-tight">Ready to start learning?</h2>
              <p className="text-dark-muted text-lg sm:text-xl mb-10 max-w-lg mx-auto leading-relaxed">
                Join now and get free access to all courses, video tutorials, and the interactive code playground.
              </p>
              <button
                onClick={showLogin}
                className="group inline-flex items-center gap-3 px-10 py-5 text-white font-bold rounded-2xl text-lg transition-all hover:scale-[1.03] hover:shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)', boxShadow: '0 10px 40px rgba(79, 70, 229, 0.35)' }}
              >
                <FaUsers className="text-xl" />
                Get Started Free
                <FaArrowRight className="text-sm group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="relative border-t border-gray-200 overflow-hidden">
        {/* Background glow */}
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.5), transparent 70%)' }}
        />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] rounded-full opacity-[0.04] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)' }}
        />

        <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 relative z-10">
          {/* Top section: 3-column layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-10 mb-16">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-dark-accent to-indigo-500 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ boxShadow: '0 0 24px rgba(79, 70, 229, 0.3)' }}
                >
                  <span className="text-white font-extrabold text-xl">N</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900">
                    Naga sai J
                  </h3>
                  <p className="text-xs text-dark-muted tracking-wider uppercase font-medium">Learning Platform</p>
                </div>
              </div>
              <p className="text-dark-muted text-base leading-relaxed max-w-xs">
                A free platform to master web development with video tutorials, code playgrounds, and structured courses.
              </p>
            </div>

            {/* Quick Links column */}
            <div>
              <h4 className="text-base font-extrabold text-gray-900 uppercase tracking-wider mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#features" className="text-base font-medium text-dark-muted hover:text-dark-accent transition-colors flex items-center gap-2.5 group">
                    <FaChevronRight className="text-[10px] text-dark-muted/40 group-hover:text-dark-accent group-hover:translate-x-0.5 transition-all" />
                    Features
                  </a>
                </li>
                <li>
                  <a href="#stats" className="text-base font-medium text-dark-muted hover:text-dark-accent transition-colors flex items-center gap-2.5 group">
                    <FaChevronRight className="text-[10px] text-dark-muted/40 group-hover:text-dark-accent group-hover:translate-x-0.5 transition-all" />
                    About
                  </a>
                </li>
                <li>
                  <button onClick={showLogin} className="text-base font-medium text-dark-muted hover:text-dark-accent transition-colors flex items-center gap-2.5 group">
                    <FaChevronRight className="text-[10px] text-dark-muted/40 group-hover:text-dark-accent group-hover:translate-x-0.5 transition-all" />
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={showRegister} className="text-base font-medium text-dark-muted hover:text-dark-accent transition-colors flex items-center gap-2.5 group">
                    <FaChevronRight className="text-[10px] text-dark-muted/40 group-hover:text-dark-accent group-hover:translate-x-0.5 transition-all" />
                    Register
                  </button>
                </li>
              </ul>
            </div>

            {/* Connect column */}
            <div>
              <h4 className="text-base font-extrabold text-gray-900 uppercase tracking-wider mb-6">Connect</h4>
              <div className="flex flex-col gap-4">
                <a href="https://github.com" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3.5 text-base font-medium text-dark-muted hover:text-dark-text transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-gray-300 group-hover:bg-gray-100 transition-all">
                    <FaGithub className="text-lg" />
                  </div>
                  GitHub
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                  className="flex items-center gap-3.5 text-base font-medium text-dark-muted hover:text-blue-400 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-blue-400/30 group-hover:bg-blue-400/10 transition-all">
                    <FaLinkedin className="text-lg" />
                  </div>
                  LinkedIn
                </a>
                <a href="mailto:hello@example.com"
                  className="flex items-center gap-3.5 text-base font-medium text-dark-muted hover:text-purple-400 transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-purple-400/30 group-hover:bg-purple-400/10 transition-all">
                    <FaEnvelope className="text-lg" />
                  </div>
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-base text-dark-muted font-medium">
              &copy; {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-dark-accent to-indigo-400 bg-clip-text text-transparent">Naga sai J</span>. All rights reserved.
            </p>
            <p className="text-sm text-dark-muted/60 flex items-center gap-2 font-medium">
              Made with <FaHeart className="text-dark-accent text-xs" /> for learners everywhere
            </p>
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
