import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaFire, FaBolt, FaCrown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI, leaderboardAPI } from '../services/api';

const rankBadge = (rank) => {
  if (rank === 1) return { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' };
  if (rank === 2) return { bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-200' };
  if (rank === 3) return { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' };
  return null;
};

const PodiumUser = ({ entry, rank, isMe, size, avatarColors }) => (
  <div className="flex flex-col items-center">
    {/* Crown for rank 1 */}
    {rank === 1 && <FaCrown className="text-amber-400 text-lg sm:text-xl mb-1 drop-shadow-sm" />}

    {/* Avatar */}
    <div className="relative">
      <div className={`${size} rounded-full flex items-center justify-center font-bold shadow-lg ring-2 ${avatarColors}`}>
        {entry.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      {/* Rank circle */}
      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-md ${
        rank === 1 ? 'bg-amber-400 text-white' :
        rank === 2 ? 'bg-slate-400 text-white' :
        'bg-orange-400 text-white'
      }`}>
        {rank}
      </div>
    </div>

    {/* Name */}
    <p className={`mt-3 text-xs sm:text-sm font-semibold text-center truncate max-w-[90px] sm:max-w-[110px] ${isMe ? 'text-indigo-600' : 'text-slate-800'}`}>
      {entry.name}{isMe ? ' (You)' : ''}
    </p>

    {/* Points */}
    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
      {entry.totalPoints?.toLocaleString() || 0} pts
    </p>

    {/* Streak & Consistency pills */}
    <div className="flex items-center gap-1.5 mt-1.5">
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full">
        <FaFire className="text-[7px]" />{entry.currentStreak || 0}
      </span>
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">
        <FaBolt className="text-[7px]" />{entry.consistencyScore || 0}
      </span>
    </div>
  </div>
);

const Leaderboard = () => {
  const { student } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    enrollmentAPI.getMyCourses(controller.signal)
      .then((res) => {
        const b = res.batches || [];
        setBatches(b);
        if (b.length > 0) setSelectedBatchId(b[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (loading) return;
    const controller = new AbortController();
    setLeaderboard([]);
    leaderboardAPI.get(selectedBatchId || null, controller.signal)
      .then((res) => setLeaderboard(res.data?.leaderboard || []))
      .catch(() => {});
    return () => controller.abort();
  }, [selectedBatchId, loading]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-2xl h-20 ring-1 ring-slate-100" />
        <div className="bg-white rounded-2xl h-56 ring-1 ring-slate-100" />
        <div className="bg-white rounded-2xl h-96 ring-1 ring-slate-100" />
      </div>
    );
  }

  const top3 = leaderboard.slice(0, 3);
  const myEntry = leaderboard.find((e) => e._id === student?._id);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <FaTrophy className="text-lg text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Leaderboard</h1>
              <p className="text-xs text-slate-400 mt-0.5">See where you stand among your peers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {myEntry && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <FaMedal className="text-xs" />
                <span className="text-xs font-bold">Your Rank: #{myEntry.rank}</span>
              </div>
            )}
            {batches.length > 0 && (
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-medium"
              >
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
                <option value="">All Students</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-8">
          <div className="flex items-end justify-center gap-4 sm:gap-8 md:gap-12">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center">
                <PodiumUser
                  entry={top3[1]}
                  rank={2}
                  isMe={top3[1]._id === student?._id}
                  size="w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl"
                  avatarColors="ring-slate-300 bg-slate-200 text-slate-600"
                />
                <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg mt-3 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-300">2</span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center">
                <PodiumUser
                  entry={top3[0]}
                  rank={1}
                  isMe={top3[0]._id === student?._id}
                  size="w-16 h-16 sm:w-20 sm:h-20 text-xl sm:text-2xl"
                  avatarColors="ring-amber-400 bg-amber-100 text-amber-700"
                />
                <div className="w-20 sm:w-24 h-28 sm:h-32 bg-gradient-to-t from-amber-300 to-amber-100 rounded-t-lg mt-3 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-400/60">1</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center">
                <PodiumUser
                  entry={top3[2]}
                  rank={3}
                  isMe={top3[2]._id === student?._id}
                  size="w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg"
                  avatarColors="ring-orange-300 bg-orange-100 text-orange-600"
                />
                <div className="w-20 sm:w-24 h-16 sm:h-20 bg-gradient-to-t from-orange-200 to-orange-100 rounded-t-lg mt-3 flex items-center justify-center">
                  <span className="text-xl sm:text-2xl font-extrabold text-orange-300/60">3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-[11px] text-slate-400 uppercase tracking-wider font-semibold w-16">Rank</th>
                  <th className="text-left py-3 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Student</th>
                  <th className="text-center py-3 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1"><FaFire className="text-orange-400" />Streak</span>
                  </th>
                  <th className="text-center py-3 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold hidden sm:table-cell">
                    <span className="inline-flex items-center gap-1"><FaBolt className="text-indigo-400" />Consistency</span>
                  </th>
                  <th className="text-right py-3 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold hidden md:table-cell">Practice</th>
                  <th className="text-right py-3 px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold hidden md:table-cell">Coding</th>
                  <th className="text-right py-3 px-4 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const isMe = entry._id === student?._id;
                  const badge = rankBadge(entry.rank);

                  return (
                    <tr
                      key={entry._id}
                      className={`border-b border-slate-50 transition-colors ${
                        isMe ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      <td className="py-3 px-4">
                        {badge ? (
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ring-1 ${badge.bg} ${badge.text} ${badge.ring}`}>
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 font-medium pl-2">{entry.rank}</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isMe ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {entry.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <span className={`text-sm font-medium block truncate ${isMe ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                              {entry.name}
                            </span>
                            {isMe && <span className="text-[10px] text-indigo-500 font-semibold">You</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-orange-600">
                          <FaFire className="text-[9px]" />
                          <span className="text-xs font-bold">{entry.currentStreak || 0}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600">
                          <FaBolt className="text-[9px]" />
                          <span className="text-xs font-bold">{entry.consistencyScore || 0}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right hidden md:table-cell">
                        <span className="text-xs text-slate-500">{entry.practicePoints?.toLocaleString() || 0}</span>
                      </td>

                      <td className="py-3 px-3 text-right hidden md:table-cell">
                        <span className="text-xs text-slate-500">{entry.codingPoints?.toLocaleString() || 0}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className={`text-sm font-bold ${isMe ? 'text-indigo-600' : 'text-slate-800'}`}>
                          {entry.totalPoints?.toLocaleString() || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <FaMedal className="text-xl text-slate-300" />
            </div>
            <p className="text-slate-600 text-sm font-semibold">No rankings yet</p>
            <p className="text-xs text-slate-400 mt-1">Complete quizzes and coding challenges to earn points</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
