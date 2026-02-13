import { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaMedal, FaCode, FaClipboardList, FaStar } from 'react-icons/fa';
import { scoreAPI } from '../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const rankStyles = {
  1: {
    gradient: 'from-yellow-400 to-amber-500',
    ring: 'ring-yellow-400/40',
    text: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
    bar: 'from-yellow-400 to-amber-400',
    icon: <FaCrown className="text-yellow-500" />,
  },
  2: {
    gradient: 'from-gray-300 to-gray-400',
    ring: 'ring-gray-300/40',
    text: 'text-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
    bar: 'from-gray-300 to-gray-400',
    icon: <FaMedal className="text-gray-400" />,
  },
  3: {
    gradient: 'from-amber-500 to-orange-500',
    ring: 'ring-amber-400/40',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'from-amber-400 to-orange-400',
    icon: <FaMedal className="text-amber-500" />,
  },
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLeaderboard = async () => {
      try {
        const { data } = await scoreAPI.getLeaderboard(controller.signal);
        setLeaderboard(data.leaderboard || []);
        setMyRank(data.myRank);
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-56" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-60 bg-white rounded-2xl animate-pulse border border-gray-100" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-gray-50">
              <div className="w-8 h-5 bg-gray-100 rounded animate-pulse" />
              <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
              <div className="w-20 h-5 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const first = leaderboard.find(e => e.rank === 1);
  const second = leaderboard.find(e => e.rank === 2);
  const third = leaderboard.find(e => e.rank === 3);
  const maxPoints = leaderboard.length > 0 ? leaderboard[0].totalPoints : 1;

  const PodiumCard = ({ entry, rank }) => {
    if (!entry) {
      return (
        <div className="flex-1 min-h-[220px] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-base font-medium">
          --
        </div>
      );
    }

    const s = rankStyles[rank];
    const isFirst = rank === 1;

    return (
      <div className={`relative flex-1 rounded-2xl border ${s.border} bg-white overflow-hidden group hover:shadow-lg hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300`}>
        {/* Top accent */}
        <div className={`h-1.5 bg-gradient-to-r ${s.bar}`} />

        <div className="relative px-5 pt-7 pb-6 flex flex-col items-center text-center">
          {/* Rank badge */}
          <div className={`${s.badge} w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold mb-4`}>
            {rank}
          </div>

          {/* Avatar */}
          <div className={`${isFirst ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'} rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white font-extrabold ring-4 ${s.ring} shadow-lg mb-3`}>
            {getInitials(entry.studentName)}
          </div>

          {/* Medal icon */}
          <div className="mb-2">{s.icon}</div>

          {/* Name */}
          <p className={`${isFirst ? 'text-lg' : 'text-base'} font-bold text-gray-900 truncate w-full`}>{entry.studentName}</p>
          {entry.isCurrentUser && (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mt-1 border border-indigo-100">YOU</span>
          )}

          {/* Points */}
          <div className="mt-4">
            <p className={`${isFirst ? 'text-3xl' : 'text-2xl'} font-extrabold ${s.text} leading-none`}>{entry.totalPoints}</p>
            <p className="text-gray-400 text-xs font-semibold mt-1 uppercase tracking-wider">points</p>
          </div>

          {/* Breakdown */}
          <div className="flex items-center gap-2 mt-4">
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <FaClipboardList className="text-[10px]" /> {entry.practicePoints}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
              <FaCode className="text-[10px]" /> {entry.codingPoints}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200">
              <FaTrophy className="text-yellow-500 text-lg" />
            </div>
            Leaderboard
          </h1>
          <p className="text-gray-500 text-base mt-2 ml-[52px]">Top performers across all courses</p>
        </div>

        {myRank && (
          <div className="shrink-0 flex items-center gap-3 bg-indigo-50 rounded-xl border border-indigo-100 px-5 py-3">
            <FaStar className="text-indigo-500 text-lg" />
            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-none">Your Rank</p>
              <p className="text-2xl font-extrabold text-indigo-600 leading-tight">#{myRank}</p>
            </div>
          </div>
        )}
      </div>

      {/* Podium — Top 3 */}
      {(first || second || third) && (
        <div className="grid grid-cols-3 gap-4 md:gap-5">
          <PodiumCard entry={second} rank={2} />
          <PodiumCard entry={first} rank={1} />
          <PodiumCard entry={third} rank={3} />
        </div>
      )}

      {/* Rankings Table */}
      {leaderboard.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-5 md:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="w-16 text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</div>
            <div className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-widest">Learner</div>
            <div className="w-[180px] text-xs font-bold text-gray-400 uppercase tracking-widest hidden lg:block">Progress</div>
            <div className="w-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">Practice</div>
            <div className="w-20 text-center text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">Coding</div>
            <div className="w-28 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Total</div>
          </div>

          {/* Rows */}
          {leaderboard.map((entry, idx) => {
            const isTop3 = entry.rank <= 3;
            const s = isTop3 ? rankStyles[entry.rank] : null;
            const barPercent = maxPoints > 0 ? (entry.totalPoints / maxPoints) * 100 : 0;

            return (
              <div
                key={entry.studentId}
                className={`flex items-center gap-2 px-5 md:px-6 py-4 border-b border-gray-100 last:border-0 transition-colors
                  ${entry.isCurrentUser
                    ? 'bg-indigo-50/60 border-l-[3px] border-l-indigo-500'
                    : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } hover:bg-gray-50`}
              >
                {/* Rank */}
                <div className="w-16 flex items-center">
                  {isTop3 ? (
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold ${s.badge}`}>
                      {entry.rank}
                    </div>
                  ) : (
                    <span className={`text-base font-bold pl-2 ${entry.isCurrentUser ? 'text-indigo-600' : 'text-gray-400'}`}>
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${isTop3
                      ? `bg-gradient-to-br ${s.gradient} text-white ring-2 ${s.ring}`
                      : entry.isCurrentUser
                      ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-200'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                    {getInitials(entry.studentName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-base font-semibold truncate ${entry.isCurrentUser ? 'text-indigo-600' : 'text-gray-900'}`}>
                        {entry.studentName}
                      </p>
                      {entry.isCurrentUser && (
                        <span className="shrink-0 text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md border border-indigo-200">YOU</span>
                      )}
                      {isTop3 && (
                        <span className="shrink-0">{s.icon}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-[180px] hidden lg:flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isTop3 ? `bg-gradient-to-r ${s.bar}` : entry.isCurrentUser ? 'bg-indigo-500' : 'bg-gray-300'}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>

                {/* Practice */}
                <div className="w-20 text-center hidden md:block">
                  <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {entry.practicePoints}
                  </span>
                </div>

                {/* Coding */}
                <div className="w-20 text-center hidden md:block">
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                    {entry.codingPoints}
                  </span>
                </div>

                {/* Total */}
                <div className="w-28 text-right">
                  <span className={`text-xl font-extrabold ${isTop3 ? s.text : entry.isCurrentUser ? 'text-indigo-600' : 'text-gray-900'}`}>
                    {entry.totalPoints}
                  </span>
                  <span className="text-gray-400 text-xs ml-1 font-semibold">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-yellow-200">
            <FaTrophy className="text-4xl text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No scores yet</h3>
          <p className="text-gray-500 text-base max-w-sm mx-auto">Complete practice quizzes and coding challenges to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
