import { useState, useEffect, useRef } from 'react';
import { FaBook, FaPlay, FaCode, FaArrowRight, FaYoutube, FaLaptopCode, FaGraduationCap, FaCheckCircle, FaRocket, FaTrophy, FaSeedling, FaLightbulb, FaCogs, FaCloudUploadAlt, FaPencilAlt, FaFlask } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { courseAPI } from '../services/api';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCourses = async () => {
      try {
        const { data } = await courseAPI.getAll(controller.signal);
        setCourses(data);
      } catch (error) {
        if (error.name === 'CanceledError') return;
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
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

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
          Master Web Development,<br />
          <span className="text-indigo-500">Step by Step</span>
        </h1>
        <p className="text-slate-500 text-lg md:text-xl mt-4 max-w-2xl leading-relaxed">
          Videos, presentations, practice questions, and coding challenges — everything you need to become a full-stack developer.
        </p>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2.5 bg-indigo-500 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-base"
          >
            <FaPlay className="text-sm" />
            Start Learning
          </Link>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2.5 bg-white text-slate-700 px-8 py-3.5 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-base border border-slate-200 shadow-sm"
          >
            <FaCode className="text-base" />
            Code Playground
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: FaYoutube, title: 'Video Tutorials', desc: 'Detailed video explanations for every topic with hands-on demonstrations' },
          { icon: FaLaptopCode, title: 'Practice & Code', desc: 'Hands-on practice questions and real coding challenges to build skills' },
          { icon: FaGraduationCap, title: 'Structured Path', desc: 'Clear learning path from beginner to advanced with guided progression' },
        ].map((f) => (
          <div key={f.title} className="group bg-white rounded-2xl p-7 shadow-md shadow-slate-200/60 ring-1 ring-slate-100 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors duration-300">
              <f.icon className="text-indigo-500 text-xl group-hover:text-indigo-600 transition-colors duration-300" />
            </div>
            <h3 className="font-bold text-slate-900 text-xl mb-2">{f.title}</h3>
            <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Learning Path - Timeline */}
      <div className="bg-white rounded-2xl p-7 md:p-8 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Your Learning Journey</h2>
            <p className="text-slate-500 text-base mt-1">From zero to Full Stack Developer</p>
          </div>
          <Link to="/courses" className="inline-flex items-center gap-2 text-indigo-500 text-base font-semibold hover:text-indigo-600 transition-colors">
            View all <FaArrowRight className="text-sm" />
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
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
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
                      <p className={`text-sm font-bold mt-3 transition-colors duration-300 ${
                        isActive
                          ? isGoal ? 'text-amber-600' : isStart ? 'text-emerald-600' : 'text-indigo-600'
                          : isPast ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 transition-colors duration-300 ${
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

      {/* Playground CTA */}
      <div className="bg-white rounded-2xl p-7 md:p-8 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center">
              <FaCode className="text-indigo-500 text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xl">Code Playground</h3>
              <p className="text-slate-500 text-base mt-0.5">Practice HTML, CSS, JavaScript, Python & SQL in your browser</p>
            </div>
          </div>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2.5 bg-indigo-500 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-base whitespace-nowrap"
          >
            <FaCode />
            Open Playground
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
