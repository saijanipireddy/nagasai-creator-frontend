import { useState, useEffect, useRef } from 'react';
import { FaBook, FaPlay, FaCode, FaArrowRight, FaCheckCircle, FaTrophy, FaSeedling, FaLightbulb, FaCogs, FaCloudUploadAlt, FaPencilAlt, FaChartLine, FaLaptopCode } from 'react-icons/fa';
import CourseCard from '../components/Courses/CourseCard';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Dashboard = () => {
  const { student } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const [coursesRes, progressRes] = await Promise.all([
          enrollmentAPI.getMyCourses(controller.signal),
          api.get('/scores/my-progress', { signal: controller.signal }).catch(() => null),
        ]);
        setCourses(coursesRes.data || []);
        if (progressRes?.data) setProgress(progressRes.data);
      } catch (error) {
        if (error.name === 'CanceledError') return;
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const totalSteps = 7;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleStepHover = (index) => {
    clearInterval(intervalRef.current);
    setActiveStep(index);
  };

  const handleStepLeave = () => {
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % totalSteps);
    }, 3000);
  };

  const stats = progress?.stats || {};
  const topicsCompleted = stats.topicsCompleted || 0;
  const practiceCount = progress?.practiceScores?.length || 0;
  const codingCount = progress?.codingSubmissions?.filter(c => c.passed)?.length || 0;

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem-2.5rem)] -mb-5 md:-mb-6 md:h-[calc(100vh-5rem-3rem)]">
      {/* Main Content - independent scroll */}
      <div className="flex-1 min-w-0 overflow-y-auto scrollbar-hidden space-y-6">

      {/* Hero */}
      <div className="bg-white rounded-2xl p-6 md:p-7 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
          {getGreeting()}, {student?.name?.split(' ').slice(0, 2).join(' ') || 'Student'} <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite] origin-[70%_70%]">&#128075;</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-3 max-w-2xl leading-relaxed">
          Pick up where you left off, track your progress, and keep building your skills every day.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 bg-indigo-500 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-sm"
          >
            <FaPlay className="text-xs" />
            Start Learning
          </Link>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2 bg-white text-slate-700 px-6 py-2.5 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm border border-slate-200 shadow-sm"
          >
            <FaCode className="text-sm" />
            Code Playground
          </Link>
        </div>
      </div>

      {/* Progress Overview */}
      {(() => {
        const totalTopics = courses.reduce((sum, c) => sum + (c.totalTopics || 0), 0);
        const completedTopicsCount = courses.reduce((sum, c) => sum + (c.completedTopics || 0), 0);
        const courseProgress = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

        const totalPractice = progress?.practiceScores?.length || 0;
        const avgPractice = totalPractice > 0
          ? Math.round(progress.practiceScores.reduce((s, p) => s + p.percentage, 0) / totalPractice)
          : 0;

        const totalCoding = progress?.codingSubmissions?.length || 0;
        const passedCoding = progress?.codingSubmissions?.filter(c => c.passed)?.length || 0;
        const codingPercent = totalCoding > 0 ? Math.round((passedCoding / totalCoding) * 100) : 0;

        const cards = [
          { label: 'Courses', value: `${completedTopicsCount}/${totalTopics}`, sublabel: 'Topics completed', percent: courseProgress, color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', iconBg: 'bg-indigo-100', icon: FaBook, delay: '0s' },
          { label: 'Practice', value: `${avgPractice}%`, sublabel: `${totalPractice} quizzes taken`, percent: avgPractice, color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', icon: FaChartLine, delay: '0.1s' },
          { label: 'Coding', value: `${passedCoding}/${totalCoding}`, sublabel: 'Challenges solved', percent: codingPercent, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', iconBg: 'bg-amber-100', icon: FaLaptopCode, delay: '0.2s' },
        ];

        const r = 42;
        const circ = 2 * Math.PI * r;

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((card) => {
              const Icon = card.icon;
              const dash = (card.percent / 100) * circ;
              return (
                <div
                  key={card.label}
                  className="group bg-white rounded-2xl p-5 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 hover:shadow-xl hover:shadow-slate-200/80 hover:-translate-y-1 transition-all duration-300"
                  style={{ animation: `cardSlideUp 0.5s ease-out ${card.delay} both` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-7 h-7 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                          <Icon className="text-xs" style={{ color: card.color }} />
                        </div>
                        <h3 className="text-xs font-bold text-slate-700">{card.label}</h3>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{loading ? '...' : card.sublabel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Circular ring */}
                    <div className="relative w-[4.5rem] h-[4.5rem] flex-shrink-0" style={{ '--glow-color': `${card.color}40` }}>
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r={r} fill="none"
                          stroke={`url(#grad-${card.label})`}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${dash} ${circ}`}
                          style={{ animation: loading ? 'none' : `ringFill 1.2s ease-out ${card.delay} both` }}
                          className="group-hover:animate-[pulseGlow_2s_ease-in-out_infinite]"
                        />
                        <defs>
                          <linearGradient id={`grad-${card.label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={card.color} />
                            <stop offset="100%" stopColor={card.color} stopOpacity="0.6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{ animation: loading ? 'none' : `countUp 0.6s ease-out ${card.delay} both` }}
                      >
                        <span className="text-sm font-extrabold text-slate-900">{loading ? '–' : card.value}</span>
                      </div>
                    </div>

                    {/* Progress bar + percent */}
                    <div className="flex-1">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-2xl font-extrabold text-slate-900" style={{ animation: loading ? 'none' : `countUp 0.8s ease-out ${card.delay} both` }}>
                          {loading ? '–' : `${card.percent}%`}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${card.gradient}`}
                          style={{
                            width: loading ? '0%' : `${card.percent}%`,
                            transition: `width 1.2s ease-out`,
                            transitionDelay: card.delay,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">Progress</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* My Courses */}
      <div className="bg-white rounded-2xl p-5 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">My Courses</h2>
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-indigo-500 text-xs font-semibold hover:text-indigo-600 transition-colors">
            View all <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 animate-pulse">
                <div className="w-9 h-9 rounded-xl bg-slate-200" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-28 mb-2" />
                  <div className="h-1.5 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="space-y-2.5">
            {courses.map((course) => {
              const prog = course.progress || 0;
              const isComplete = prog === 100 && course.totalTopics > 0;
              return (
                <Link
                  key={course._id}
                  to={`/course/${course._id}`}
                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all duration-200"
                >
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${course.color || '#6366f1'}15` }}
                  >
                    {isComplete ? (
                      <FaCheckCircle className="text-sm text-emerald-500" />
                    ) : (
                      <FaBook className="text-sm" style={{ color: course.color || '#6366f1' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-slate-800 group-hover:text-slate-900 truncate text-xs">{course.name}</p>
                      <span className="text-[11px] text-slate-400 font-medium ml-2 flex-shrink-0">
                        {course.completedTopics || 0}/{course.totalTopics || 0}
                      </span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${prog}%` }}
                      />
                    </div>
                  </div>
                  <FaArrowRight className="text-[10px] text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FaBook className="text-base text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No courses enrolled yet</p>
            <p className="text-xs text-slate-400 mt-1">Contact your admin to get enrolled</p>
          </div>
        )}
      </div>

      {/* Learning Path - Timeline */}
      <div className="bg-white rounded-2xl p-5 md:p-6 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Learning Journey</h2>
            <p className="text-slate-500 text-xs mt-1">From zero to Full Stack Developer</p>
          </div>
          <Link to="/courses" className="inline-flex items-center gap-1.5 text-indigo-500 text-xs font-semibold hover:text-indigo-600 transition-colors">
            View all <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {(() => {
          const steps = [
            { label: 'Start', desc: 'Begin your journey', icon: FaSeedling },
            { label: 'Learn', desc: 'Understand concepts', icon: FaLightbulb },
            { label: 'Practice', desc: 'Hands-on coding', icon: FaPencilAlt },
            { label: 'Build', desc: 'Create projects', icon: FaCogs },
            { label: 'Implement', desc: 'Real-world apps', icon: FaCode },
            { label: 'Deploy', desc: 'Ship to production', icon: FaCloudUploadAlt },
            { label: 'Goal', desc: 'Full Stack Developer', icon: FaTrophy },
          ];
          return (
            <div className="relative overflow-x-auto scrollbar-hidden pb-2">
              {/* Background line */}
              <div className="absolute top-6 left-8 right-8 h-0.5 bg-slate-100 z-0" />
              {/* Animated fill line */}
              <div
                className="absolute top-6 left-8 h-0.5 bg-indigo-500 z-[1] transition-all duration-700 ease-in-out"
                style={{ width: `${(activeStep / (steps.length - 1)) * 88}%` }}
              />

              <div className="relative z-10 grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
                {steps.map((step, index) => {
                  const isActive = index === activeStep;
                  const isPast = index < activeStep;
                  const isGoal = index === steps.length - 1;
                  const isStart = index === 0;
                  const StepIcon = step.icon;
                  return (
                    <div
                      key={step.label}
                      className="flex flex-col items-center cursor-pointer"
                      onMouseEnter={() => handleStepHover(index)}
                      onMouseLeave={handleStepLeave}
                    >
                      {/* Node */}
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isActive
                          ? isGoal
                            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-110'
                            : isStart
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                              : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-110'
                          : isPast
                            ? 'bg-emerald-500 text-white'
                            : isGoal
                              ? 'bg-white text-amber-300 border-2 border-dashed border-amber-200'
                              : 'bg-white text-slate-400 border-2 border-slate-200'
                      }`}>
                        {isPast && !isStart ? (
                          <FaCheckCircle className="text-base" />
                        ) : (
                          <StepIcon className="text-base" />
                        )}
                        {isActive && (
                          <span className={`absolute inset-0 rounded-full border-2 animate-ping opacity-25 ${
                            isGoal ? 'border-amber-400' : isStart ? 'border-emerald-400' : 'border-indigo-400'
                          }`} />
                        )}
                      </div>

                      {/* Label */}
                      <p className={`text-xs font-bold mt-2 transition-colors duration-300 ${
                        isActive
                          ? isGoal ? 'text-amber-600' : isStart ? 'text-emerald-600' : 'text-indigo-600'
                          : isPast ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 transition-colors duration-300 ${
                        isActive
                          ? isGoal ? 'text-amber-400' : isStart ? 'text-emerald-400' : 'text-indigo-400'
                          : isPast ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      </div>

      {/* Right Sidebar - independent scroll */}
      <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0 overflow-y-auto scrollbar-hidden">
        <DashboardSidebar />
      </div>
    </div>
  );
};

export default Dashboard;
