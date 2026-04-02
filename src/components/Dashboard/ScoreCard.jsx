import { FaBolt, FaMedal, FaFire, FaStar, FaTrophy } from 'react-icons/fa';

const getLevelConfig = (tier) => {
  switch (tier) {
    case 5: return { icon: FaTrophy, color: 'from-amber-400 to-amber-600', bg: 'bg-amber-50 text-amber-700' };
    case 4: return { icon: FaStar, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50 text-purple-700' };
    case 3: return { icon: FaFire, color: 'from-indigo-400 to-indigo-600', bg: 'bg-indigo-50 text-indigo-700' };
    case 2: return { icon: FaBolt, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50 text-emerald-700' };
    default: return { icon: FaMedal, color: 'from-slate-400 to-slate-500', bg: 'bg-slate-50 text-slate-700' };
  }
};

const ScoreCard = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
        <div className="h-3 bg-slate-100 rounded animate-pulse w-20 mb-2.5" />
        <div className="flex items-center justify-between">
          <div className="h-6 bg-slate-100 rounded animate-pulse w-24" />
          <div className="h-5 bg-slate-100 rounded-full animate-pulse w-20" />
        </div>
        <div className="mt-2.5">
          <div className="h-1 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const levelConfig = getLevelConfig(stats.levelTier);
  const LevelIcon = levelConfig.icon;

  const tierThresholds = [0, 300, 1000, 2000, 5000];
  const currentTierStart = tierThresholds[stats.levelTier - 1] || 0;
  const currentTierEnd = stats.nextLevelAt || currentTierStart;
  const tierRange = currentTierEnd - currentTierStart;
  const progressPercent = tierRange > 0
    ? Math.min(((stats.totalPoints - currentTierStart) / tierRange) * 100, 100)
    : 100;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 ring-1 ring-slate-100 p-4">
      <p className="text-xs font-bold text-black mb-1">Your Score</p>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-1.5">
          <FaBolt className="text-amber-500 text-sm" />
          <span className="text-xl font-extrabold text-slate-900">{stats.totalPoints.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-medium">pts</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${levelConfig.bg}`}>
          <LevelIcon className="text-[9px]" />
          {stats.level}
        </div>
      </div>

      {/* Level progress */}

      {stats.nextLevelAt && (
        <div className="mt-3">

          {/* Header */}
          <div className="flex justify-between text-[11px] mb-1">
            <span className="font-semibold text-gray-800">
              {stats.level}
            </span>
            <span className="text-black-600">
              {stats.pointsToNextLevel} pts to next
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 shadow-sm"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(to right, #8C3E2D, #E76F51, #FC8B73)"
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default ScoreCard;
