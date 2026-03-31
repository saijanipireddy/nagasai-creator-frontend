import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaEnvelope, FaBook, FaTrophy, FaChartLine, FaCode, FaCheckCircle,
  FaStar, FaArrowRight, FaSignOutAlt, FaFire, FaMedal, FaBolt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI, leaderboardAPI } from '../services/api';
import api from '../services/api';

const Profile = () => {
  const { student, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  // Load initial data
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

        // Set first batch as default for leaderboard
        const firstBatch = coursesRes.batches?.[0];
        if (firstBatch) {
          setSelectedBatchId(firstBatch._id);
        }
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  // Fetch leaderboard when batch selection changes
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
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl h-36 shadow-md shadow-slate-200/60" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-white rounded-2xl h-28 shadow-md shadow-slate-200/60" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl h-72 shadow-md shadow-slate-200/60" />
          <div className="bg-white rounded-2xl h-72 shadow-md shadow-slate-200/60" />
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

  const myRank = leaderboard.findIndex(entry => entry._id === student?._id) + 1;

  const getLevel = (points) => {
    if (points >= 5000) return { name: 'Legend', color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600', icon: FaTrophy, tier: 5 };
    if (points >= 2000) return { name: 'Expert', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600', icon: FaStar, tier: 4 };
    if (points >= 1000) return { name: 'Advanced', color: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: FaFire, tier: 3 };
    if (points >= 300) return { name: 'Intermediate', color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: FaBolt, tier: 2 };
    return { name: 'Beginner', color: 'from-slate-400 to-slate-500', bg: 'bg-slate-50', text: 'text-slate-600', icon: FaMedal, tier: 1 };
  };

  const level = getLevel(totalPoints);
  const LevelIcon = level.icon;
  const progressPercent = totalPoints > 0 ? Math.min((totalPoints % 1000) / 10, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Profile Card - Clean, no banner */}
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-slate-900 flex items-center justify-center">
              <span className="text-white font-extrabold text-3xl md:text-4xl">
                {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className={`absolute -bottom-1.5 -right-1.5 bg-gradient-to-br ${level.color} rounded-md px-2 py-0.5 shadow-md flex items-center gap-1 ring-2 ring-white`}>
              <LevelIcon className="text-white text-[9px]" />
              <span className="text-white text-[10px] font-bold">{level.name}</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 truncate">
              {student?.name || 'Student'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
              <span className="text-slate-500 flex items-center gap-1.5 text-sm">
                <FaEnvelope className="text-xs text-slate-400" />
                {student?.email}
              </span>
              {myRank > 0 && (
                <span className="text-slate-500 flex items-center gap-1.5 text-sm">
                  <FaMedal className="text-xs text-amber-500" />
                  Rank #{myRank}
                </span>
              )}
              <span className="text-slate-500 flex items-center gap-1.5 text-sm">
                <FaTrophy className="text-xs text-amber-500" />
                {totalPoints.toLocaleString()} points
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 border border-slate-200 hover:border-red-200"
          >
            <FaSignOutAlt className="text-sm" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: FaBook, value: courses.length, label: 'Enrolled Courses', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500', accent: 'border-l-indigo-500' },
          { icon: FaCheckCircle, value: topicsCompleted, label: 'Topics Completed', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', accent: 'border-l-emerald-500' },
          { icon: FaChartLine, value: practiceCount, label: 'Quizzes Passed', iconBg: 'bg-violet-50', iconColor: 'text-violet-500', accent: 'border-l-violet-500' },
          { icon: FaCode, value: codingCount, label: 'Coding Solved', iconBg: 'bg-amber-50', iconColor: 'text-amber-500', accent: 'border-l-amber-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-5 border-l-[3px] ${stat.accent} hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`}
          >
            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`${stat.iconColor} text-base`} />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Courses + Points */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-6 md:p-7">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">My Courses</h2>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-indigo-500 text-sm font-semibold hover:text-indigo-600 transition-colors">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-2.5">
              {courses.map((course) => (
                <Link
                  key={course._id}
                  to={`/course/${course._id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${course.color}15` }}>
                    <FaBook className="text-base" style={{ color: course.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors truncate">{course.name}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{course.totalTopics || 0} topics</p>
                  </div>
                  <FaArrowRight className="text-xs text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FaBook className="text-xl text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">No courses enrolled yet</p>
              <p className="text-sm text-slate-400 mt-1">Contact your admin to get enrolled</p>
            </div>
          )}
        </div>

        {/* Points Breakdown */}
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-6 md:p-7">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Points Breakdown</h2>

          {/* Total points ring */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#334155"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 3.14} 314`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-slate-900">{totalPoints.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Points</span>
              </div>
            </div>
          </div>

          {/* Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-700" /> Practice
                </span>
                <span className="text-sm font-bold text-slate-900">{practicePoints}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-700 rounded-full transition-all duration-700"
                  style={{ width: `${totalPoints > 0 ? (practicePoints / totalPoints) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Coding
                </span>
                <span className="text-sm font-bold text-slate-900">{codingPoints}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${totalPoints > 0 ? (codingPoints / totalPoints) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Level card */}
          <div className={`mt-6 p-3.5 rounded-xl ${level.bg} border border-slate-100`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center`}>
                <LevelIcon className="text-white text-xs" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-bold ${level.text}`}>{level.name}</p>
                <p className="text-xs text-slate-500">
                  {level.tier < 5
                    ? `${[300, 1000, 2000, 5000][level.tier - 1] - totalPoints} pts to next level`
                    : 'Max level reached'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {(leaderboard.length > 0 || batches.length > 0) && (
        <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-6 md:p-7">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Leaderboard</h2>
            {batches.length > 0 && (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
                <option value="">All Students</option>
              </select>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 pl-2 font-semibold w-16">Rank</th>
                  <th className="text-left pb-3 font-semibold">Student</th>
                  <th className="text-right pb-3 pr-2 font-semibold">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.slice(0, 10).map((entry, index) => {
                  const isMe = entry._id === student?._id;
                  return (
                    <tr
                      key={entry._id}
                      className={`border-t border-slate-50 transition-colors ${isMe ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="py-3 pl-2">
                        {index < 3 ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            index === 0 ? 'bg-amber-100 text-amber-600' :
                            index === 1 ? 'bg-slate-100 text-slate-500' :
                            'bg-orange-50 text-orange-500'
                          }`}>
                            {index + 1}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium pl-2">{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isMe ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {entry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className={`text-sm font-medium ${isMe ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                            {entry.name}{isMe && <span className="text-slate-400 text-xs ml-1.5">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`text-sm font-bold ${isMe ? 'text-slate-900' : 'text-slate-600'}`}>
                          {entry.totalPoints?.toLocaleString() || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
