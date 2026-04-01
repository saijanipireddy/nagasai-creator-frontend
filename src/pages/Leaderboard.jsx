import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI, leaderboardAPI } from '../services/api';

const Leaderboard = () => {
  const { student } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch batches on mount
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

  // Fetch leaderboard when batch changes
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
      <div className="space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl h-16 shadow-md shadow-slate-200/60" />
        <div className="bg-white rounded-2xl h-96 shadow-md shadow-slate-200/60" />
      </div>
    );
  }

  // Top 3 for podium
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = top3.length === 3 ? ['h-28', 'h-36', 'h-24'] : ['h-36'];
  const podiumLabels = top3.length === 3 ? ['2nd', '1st', '3rd'] : ['1st'];
  const podiumColors = top3.length === 3
    ? ['from-slate-300 to-slate-400', 'from-amber-400 to-amber-500', 'from-orange-300 to-orange-400']
    : ['from-amber-400 to-amber-500'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <FaTrophy className="text-lg sm:text-xl text-amber-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Leaderboard</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">See where you stand among your peers</p>
            </div>
          </div>
          {batches.length > 0 && (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="text-sm border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 font-medium"
            >
              {batches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
              <option value="">All Students</option>
            </select>
          )}
        </div>
      </div>

      {/* Podium (top 3) */}
      {top3.length > 0 && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4 sm:p-6 md:p-8">
          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 mb-2">
            {podiumOrder.map((entry, i) => {
              if (!entry) return null;
              const isMe = entry._id === student?._id;
              return (
                <div key={entry._id} className="flex flex-col items-center">
                  {/* Avatar */}
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl font-extrabold mb-1.5 sm:mb-2 ${
                    isMe ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {entry.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <p className={`text-xs sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-[100px] ${isMe ? 'text-slate-900' : 'text-slate-700'}`}>
                    {entry.name}{isMe ? ' (You)' : ''}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{entry.totalPoints?.toLocaleString() || 0} pts</p>
                  {/* Podium bar */}
                  <div className={`w-16 sm:w-20 md:w-24 ${podiumHeights[i]} bg-gradient-to-t ${podiumColors[i]} rounded-t-xl mt-2 sm:mt-3 flex items-start justify-center pt-2 sm:pt-3`}>
                    <span className="text-white text-xs sm:text-sm font-bold">{podiumLabels[i]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full rankings table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-3 sm:p-6 md:p-7">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="text-left pb-3 pl-2 font-semibold w-16">Rank</th>
                  <th className="text-left pb-3 font-semibold">Student</th>
                  <th className="text-right pb-3 font-semibold hidden sm:table-cell">Practice</th>
                  <th className="text-right pb-3 font-semibold hidden sm:table-cell">Coding</th>
                  <th className="text-right pb-3 pr-2 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const isMe = entry._id === student?._id;
                  return (
                    <tr
                      key={entry._id}
                      className={`border-t border-slate-50 transition-colors ${isMe ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="py-3.5 pl-2">
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
                      <td className="py-3.5">
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
                      <td className="py-3.5 text-right hidden sm:table-cell">
                        <span className="text-sm text-slate-500">{entry.practicePoints?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3.5 text-right hidden sm:table-cell">
                        <span className="text-sm text-slate-500">{entry.codingPoints?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
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
        ) : (
          <div className="text-center py-12">
            <FaMedal className="text-3xl text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No rankings yet</p>
            <p className="text-sm text-slate-400 mt-1">Complete quizzes and coding challenges to earn points</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
