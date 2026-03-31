import { FaTrophy } from 'react-icons/fa';

const FireIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 23C7.03 23 3 18.97 3 14C3 10.13 6.5 5.24 12 1C17.5 5.24 21 10.13 21 14C21 18.97 16.97 23 12 23ZM12 4.5C8 7.86 6 11.5 6 14C6 17.31 8.69 20 12 20C15.31 20 18 17.31 18 14C18 11.5 16 7.86 12 4.5Z" fill="#F97316"/>
    <path d="M12 20C8.69 20 6 17.31 6 14C6 11.5 8 7.86 12 4.5C16 7.86 18 11.5 18 14C18 17.31 15.31 20 12 20Z" fill="#FB923C"/>
    <path d="M12 17C10.34 17 9 15.66 9 14C9 12 10.5 9.5 12 8C13.5 9.5 15 12 15 14C15 15.66 13.66 17 12 17Z" fill="#FCD34D"/>
  </svg>
);

const StreakCard = ({ streak, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-5">
        <div className="h-4 bg-slate-100 rounded animate-pulse w-36 mb-1" />
        <div className="h-3 bg-slate-100 rounded animate-pulse w-48 mb-4" />
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col items-center py-2">
            <div className="h-3 bg-slate-100 rounded animate-pulse w-20 mb-2" />
            <div className="h-8 bg-slate-100 rounded animate-pulse w-16 mb-2" />
            <div className="h-3 bg-slate-100 rounded animate-pulse w-16" />
          </div>
          <div className="w-px bg-slate-100" />
          <div className="flex-1 flex flex-col items-center py-2">
            <div className="h-3 bg-slate-100 rounded animate-pulse w-24 mb-2" />
            <div className="h-8 bg-slate-100 rounded animate-pulse w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (!streak) return null;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-5">
      <h3 className="text-base font-bold text-slate-900 mb-0.5">Learning Consistency</h3>
      <p className="text-xs text-slate-400 mb-4">Track your learning progress and consistency.</p>

      <div className="flex">
        {/* Current Streak */}
        <div className="flex-1 flex flex-col items-center py-2">
          <p className="text-xs font-medium text-slate-500 mb-2">Current Streak</p>
          <div className="flex items-center gap-2 mb-2">
            <FireIcon />
            <span className="text-2xl font-extrabold text-slate-900">{streak.currentStreak}</span>
          </div>
          <p className="text-xs text-slate-400">My Best: {streak.bestStreak}</p>
        </div>

        {/* Divider */}
        <div className="w-px bg-slate-200 mx-3" />

        {/* Consistency Score */}
        <div className="flex-1 flex flex-col items-center py-2">
          <p className="text-xs font-medium text-slate-500 mb-2">Consistency Score</p>
          <div className="flex items-center gap-2">
            <FaTrophy className="text-indigo-500 text-xl" />
            <span className="text-2xl font-extrabold text-slate-900">{streak.consistencyScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCard;
