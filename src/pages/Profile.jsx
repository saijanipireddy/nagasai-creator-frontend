import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope, FaBook, FaTrophy, FaChartLine, FaCode, FaCheckCircle,
  FaStar, FaArrowRight, FaFire, FaMedal, FaBolt, FaCrown, FaGem,
  FaRocket, FaLightbulb, FaAward, FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI, leaderboardAPI } from '../services/api';
import api from '../services/api';

/* ═══════════════════════════════════════════
   REUSABLE CHART COMPONENTS
   ═══════════════════════════════════════════ */

const AnimatedNumber = ({ value, duration = 1200 }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseInt(value) || 0;
    if (num === 0) { setDisplay(0); return; }
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setDisplay(num); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
};


const DonutChart = ({ segments, size = 140, strokeWidth = 16, children }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.percent / 100) * circ;
          const cur = offset;
          offset += dash;
          return (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={`${dash - 2} ${circ - dash + 2}`}
              strokeDashoffset={-cur}
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

const ProgressRing = ({ percent, size = 56, strokeWidth = 4, children }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ - (percent / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6366f1"
          strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
const Profile = () => {
  const { student } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          enrollmentAPI.getMyCourses(controller.signal),
          api.get('/scores/my-progress', { signal: controller.signal }).catch(() => null),
        ]);
        setCourses(coursesRes.data || []);
        setBatches(coursesRes.batches || []);
        if (progressRes?.data) setProgress(progressRes.data);
        const firstBatch = coursesRes.batches?.[0];
        if (firstBatch) setSelectedBatchId(firstBatch._id);
      } catch (error) {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedBatchId && batches.length === 0) return;
    const controller = new AbortController();
    leaderboardAPI.get(selectedBatchId || null, controller.signal)
      .then((res) => setLeaderboard(res.data?.leaderboard || []))
      .catch(() => {});
    return () => controller.abort();
  }, [selectedBatchId, batches.length]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-44 ring-1 ring-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white rounded-2xl h-28 ring-1 ring-slate-200" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl h-72 ring-1 ring-slate-200" />
          <div className="bg-white rounded-2xl h-72 ring-1 ring-slate-200" />
        </div>
      </div>
    );
  }

  const stats = progress?.stats || {};
  const totalPoints = stats.totalPoints || 0;
  const practicePoints = stats.practicePoints || 0;
  const codingPoints = stats.codingPoints || 0;
  const topicsCompleted = stats.topicsCompleted || 0;
  const practiceCount = progress?.practiceScores?.length || 0;
  const codingCount = progress?.codingSubmissions?.filter(c => c.passed)?.length || 0;
  const totalCodingAttempts = progress?.codingSubmissions?.length || 0;
  const myRank = leaderboard.findIndex(entry => entry._id === student?._id) + 1;

  const getLevel = (points) => {
    if (points >= 5000) return { name: 'Legend', icon: FaCrown, tier: 5 };
    if (points >= 2000) return { name: 'Expert', icon: FaGem, tier: 4 };
    if (points >= 1000) return { name: 'Advanced', icon: FaFire, tier: 3 };
    if (points >= 300) return { name: 'Intermediate', icon: FaBolt, tier: 2 };
    return { name: 'Beginner', icon: FaMedal, tier: 1 };
  };

  const level = getLevel(totalPoints);
  const LevelIcon = level.icon;

  const tierThresholds = [0, 300, 1000, 2000, 5000];
  const currentTierStart = tierThresholds[level.tier - 1] || 0;
  const nextTierEnd = level.tier < 5 ? tierThresholds[level.tier] : currentTierStart;
  const tierRange = nextTierEnd - currentTierStart;
  const levelProgress = tierRange > 0 ? Math.min(((totalPoints - currentTierStart) / tierRange) * 100, 100) : 100;

  const totalTopics = courses.reduce((sum, c) => sum + (c.totalTopics || 0), 0);
  const completedTopicsCount = courses.reduce((sum, c) => sum + (c.completedTopics || 0), 0);
  const courseProgress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;
  const avgPractice = practiceCount > 0 ? Math.round(progress.practiceScores.reduce((s, p) => s + p.percentage, 0) / practiceCount) : 0;
  const codingPassRate = totalCodingAttempts > 0 ? Math.round((codingCount / totalCodingAttempts) * 100) : 0;

  const pointsSegments = totalPoints > 0
    ? [
        { percent: (practicePoints / totalPoints) * 100, color: '#818cf8' },
        { percent: (codingPoints / totalPoints) * 100, color: '#34d399' },
      ]
    : [{ percent: 100, color: '#e2e8f0' }];

  const achievements = [
    { icon: FaRocket, label: 'First Steps', desc: 'Complete your first topic', earned: topicsCompleted >= 1 },
    { icon: FaLightbulb, label: 'Quiz Whiz', desc: 'Score 80%+ on a quiz', earned: progress?.practiceScores?.some(p => p.percentage >= 80) },
    { icon: FaCode, label: 'Code Cracker', desc: 'Solve a coding challenge', earned: codingCount >= 1 },
    { icon: FaFire, label: 'On Fire', desc: 'Earn 300+ points', earned: totalPoints >= 300 },
    { icon: FaStar, label: 'High Achiever', desc: 'Complete 10+ topics', earned: topicsCompleted >= 10 },
    { icon: FaGraduationCap, label: 'Scholar', desc: 'Finish a full course', earned: courses.some(c => c.progress === 100 && (c.totalTopics || 0) > 0) },
  ];
  const earnedCount = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ═══ HERO SECTION ═══ */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-slate-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl" />

        <div className="relative z-10 p-5 sm:p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 md:w-[88px] md:h-[88px] rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                  <span className="text-white font-extrabold text-2xl sm:text-3xl md:text-4xl">
                    {student?.name?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 rounded-xl px-2.5 py-1 shadow-lg flex items-center gap-1 ring-2 ring-slate-900">
                  <LevelIcon className="text-white text-[9px]" />
                  <span className="text-white text-[10px] font-bold">{level.name}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white truncate">
                  {student?.name || 'Student'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1 flex items-center gap-1.5 truncate">
                  <FaEnvelope className="text-[10px] shrink-0" /> {student?.email}
                </p>
                <div className="flex items-center gap-2.5 mt-2.5">
                  {myRank > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-bold">
                      <FaMedal className="text-[10px]" /> #{myRank}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 text-xs font-semibold">
                    <FaTrophy className="text-[10px] text-amber-400" /> <AnimatedNumber value={totalPoints} /> pts
                  </span>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="shrink-0 md:ml-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-5 min-w-[200px] sm:min-w-[240px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
                    <LevelIcon className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{level.name}</p>
                    <p className="text-slate-500 text-[10px] font-medium">Level {level.tier} of 5</p>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                    style={{ width: `${levelProgress}%` }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-slate-500">{totalPoints.toLocaleString()} pts</span>
                  <span className="text-[10px] text-slate-500">{level.tier < 5 ? `${nextTierEnd.toLocaleString()} pts` : 'MAX'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FaBook, value: courses.length, label: 'Courses', sub: 'Enrolled', percent: courseProgress },
          { icon: FaCheckCircle, value: completedTopicsCount, label: 'Topics', sub: `of ${totalTopics}`, percent: courseProgress },
          { icon: FaChartLine, value: `${avgPractice}%`, label: 'Quiz Score', sub: `${practiceCount} taken`, percent: avgPractice },
          { icon: FaCode, value: codingCount, label: 'Code Solved', sub: `of ${totalCodingAttempts}`, percent: codingPassRate },
        ].map((stat, i) => (
          <div key={stat.label} className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <stat.icon className="text-sm text-indigo-500" />
              </div>
              <ProgressRing percent={stat.percent} size={40} strokeWidth={3}>
                <span className="text-[7px] font-bold text-slate-500">{stat.percent}%</span>
              </ProgressRing>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-none">
              {typeof stat.value === 'number' ? <AnimatedNumber value={stat.value} /> : stat.value}
            </p>
            <p className="text-xs font-bold text-slate-700 mt-1">{stat.label}</p>
            <p className="text-[10px] text-slate-400 font-medium">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ═══ PERFORMANCE ANALYTICS ═══ */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Performance Analytics</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Your overall learning metrics at a glance</p>
          </div>
        </div>

        {/* Top row: 3 circular rings + donut */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {[
            { label: 'Course Progress', value: `${courseProgress}%`, percent: courseProgress },
            { label: 'Quiz Average', value: `${avgPractice}%`, percent: avgPractice },
            { label: 'Code Pass Rate', value: `${codingPassRate}%`, percent: codingPassRate },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <ProgressRing percent={item.percent} size={80} strokeWidth={6}>
                <span className="text-base font-extrabold text-slate-900">{item.value}</span>
              </ProgressRing>
              <span className="text-[11px] text-slate-500 font-medium mt-2 text-center">{item.label}</span>
            </div>
          ))}

          {/* Points Donut */}
          <div className="flex flex-col items-center">
            <DonutChart segments={pointsSegments} size={80} strokeWidth={8}>
              <span className="text-sm font-extrabold text-slate-900">
                <AnimatedNumber value={totalPoints} />
              </span>
            </DonutChart>
            <span className="text-[11px] text-slate-500 font-medium mt-2">Total Points</span>
          </div>
        </div>

        {/* Points legend */}
        <div className="flex items-center justify-center gap-5 mb-5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#818cf8' }} />
            <span className="text-[11px] text-slate-500 font-medium">Practice ({practicePoints.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#34d399' }} />
            <span className="text-[11px] text-slate-500 font-medium">Coding ({codingPoints.toLocaleString()})</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100 pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {[
              { label: 'Topics Completed', value: completedTopicsCount, max: totalTopics || 1, sub: `of ${totalTopics}`, icon: FaCheckCircle },
              { label: 'Quizzes Taken', value: practiceCount, max: Math.max(practiceCount, 5), sub: 'total', icon: FaChartLine },
              { label: 'Challenges Solved', value: codingCount, max: Math.max(totalCodingAttempts, 1), sub: `of ${totalCodingAttempts}`, icon: FaCode },
              { label: 'Practice Points', value: practicePoints, max: Math.max(totalPoints, 1), sub: 'pts', icon: FaAward },
              { label: 'Coding Points', value: codingPoints, max: Math.max(totalPoints, 1), sub: 'pts', icon: FaAward },
            ].map((bar) => {
              const pct = bar.max > 0 ? Math.round((bar.value / bar.max) * 100) : 0;
              return (
                <div key={bar.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <bar.icon className="text-xs text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-slate-600 truncate">{bar.label}</span>
                      <span className="text-[11px] font-bold text-slate-900 shrink-0 ml-2">{bar.value.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ ACHIEVEMENTS ═══ */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Achievements</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{earnedCount} of {achievements.length} unlocked</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">{earnedCount}/{achievements.length}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.label}
              className={`relative flex flex-col items-center p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                ach.earned
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                  : 'bg-slate-50/50 border-slate-100 opacity-40 grayscale'
              }`}
            >
              {ach.earned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-white">
                  <FaCheckCircle className="text-white text-[6px]" />
                </div>
              )}
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 ${
                ach.earned ? 'bg-indigo-50' : 'bg-slate-100'
              }`}>
                <ach.icon className={`text-base sm:text-lg ${ach.earned ? 'text-indigo-500' : 'text-slate-400'}`} />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-800 text-center leading-tight">{ach.label}</p>
              <p className="text-[8px] sm:text-[9px] text-slate-400 text-center mt-0.5 leading-tight">{ach.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ COURSES + LEADERBOARD ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Courses */}
        <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">My Courses</h2>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-indigo-500 text-xs font-semibold hover:text-indigo-600 transition-colors">
              View all <FaArrowRight className="text-[9px]" />
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-2">
              {courses.map((course) => {
                const prog = course.progress || 0;
                const isComplete = prog === 100 && (course.totalTopics || 0) > 0;
                return (
                  <Link
                    key={course._id}
                    to={`/course/${course._id}`}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all duration-200"
                  >
                    <div className="relative shrink-0">
                      <ProgressRing percent={prog} size={40} strokeWidth={3}>
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                          {isComplete
                            ? <FaCheckCircle className="text-[10px] text-emerald-500" />
                            : <FaBook className="text-[10px] text-indigo-500" />
                          }
                        </div>
                      </ProgressRing>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 group-hover:text-slate-900 truncate text-xs">{course.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {course.completedTopics || 0}/{course.totalTopics || 0} topics
                        </span>
                        <span className={`text-[10px] font-bold ${isComplete ? 'text-emerald-500' : 'text-indigo-500'}`}>{prog}%</span>
                      </div>
                    </div>
                    <FaArrowRight className="text-[9px] text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-lg text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">No courses yet</p>
              <p className="text-xs text-slate-400 mt-1">Contact your admin to get enrolled</p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaTrophy className="text-sm text-amber-500" />
              <h2 className="text-sm font-bold text-slate-900">Rankings</h2>
            </div>
            {batches.length > 0 && (
              <select value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}
                className="text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium max-w-[120px]">
                {batches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
                <option value="">All</option>
              </select>
            )}
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-1">
              {leaderboard.slice(0, 8).map((entry, index) => {
                const isMe = entry._id === student?._id;
                const maxPts = leaderboard[0]?.totalPoints || 1;
                const barPct = Math.round(((entry.totalPoints || 0) / maxPts) * 100);
                return (
                  <div key={entry._id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      isMe ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'hover:bg-slate-50'
                    }`}>
                    <span className={`w-5 text-center text-[10px] font-extrabold shrink-0 ${
                      index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-orange-400' : 'text-slate-300'
                    }`}>
                      {index + 1}
                    </span>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0 ${
                      isMe ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {entry.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold truncate ${isMe ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {entry.name?.split(' ')[0]}{isMe ? ' (You)' : ''}
                        </span>
                        <span className={`text-[10px] font-bold shrink-0 ml-1 ${isMe ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {(entry.totalPoints || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div className={`h-full rounded-full transition-all duration-700 ${isMe ? 'bg-indigo-500' : 'bg-slate-300'}`}
                          style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaMedal className="text-2xl text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400 text-xs font-medium">No rankings yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
