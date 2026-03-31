import { FaTrophy, FaMedal } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RankWidget = ({ rankData, isLoading }) => {
  const { student } = useAuth();

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
        <div className="h-3 bg-slate-100 rounded animate-pulse w-20 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded animate-pulse flex-1" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rankData) return null;

  const { myRank, topStudents } = rankData;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <FaTrophy className="text-amber-500 text-xs" />
          <h3 className="text-xs font-bold text-slate-900">Leaderboard</h3>
        </div>
        <Link to="/leaderboard" className="text-[10px] text-indigo-500 font-semibold hover:text-indigo-600 transition-colors">
          View all
        </Link>
      </div>

      {topStudents && topStudents.length > 0 ? (
        <div className="space-y-1.5">
          {topStudents.map((entry) => {
            const isMe = entry._id === student?._id;
            return (
              <div
                key={entry._id}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${isMe ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
              >
                {/* Rank badge */}
                {entry.rank <= 3 ? (
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${
                    entry.rank === 1 ? 'bg-amber-100 text-amber-600' :
                    entry.rank === 2 ? 'bg-slate-100 text-slate-500' :
                    'bg-orange-50 text-orange-500'
                  }`}>
                    {entry.rank}
                  </span>
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center text-[10px] text-slate-400 font-medium">
                    {entry.rank}
                  </span>
                )}

                {/* Avatar */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold ${
                  isMe ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {entry.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Name */}
                <span className={`text-xs flex-1 truncate ${isMe ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                  {entry.name}{isMe ? ' (You)' : ''}
                </span>

                {/* Points */}
                <span className={`text-[10px] font-bold ${isMe ? 'text-slate-900' : 'text-slate-400'}`}>
                  {entry.totalPoints?.toLocaleString() || 0}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <FaMedal className="text-base text-slate-200 mx-auto mb-1.5" />
          <p className="text-[10px] text-slate-400">No rankings yet</p>
        </div>
      )}

      {/* My rank if not in top list */}
      {myRank && !topStudents?.find(s => s.isCurrentUser) && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center">
            Your Rank: <span className="font-bold text-slate-700">#{myRank}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default RankWidget;
