import { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaMedal, FaCode, FaClipboardList, FaFire, FaStar } from 'react-icons/fa';
import { scoreAPI } from '../services/api';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const podiumConfig = {
  1: {
    medal: <FaCrown className="text-lg" />,
    avatarBg: 'from-yellow-400 to-yellow-600',
    avatarRing: 'ring-yellow-400/50',
    accentText: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/20',
    glowColor: 'bg-yellow-400',
    barColor: 'from-yellow-500 to-yellow-400',
    label: '1st',
    iconColor: 'text-yellow-400',
  },
  2: {
    medal: <FaMedal className="text-lg" />,
    avatarBg: 'from-gray-300 to-gray-500',
    avatarRing: 'ring-gray-400/40',
    accentText: 'text-gray-300',
    badgeBg: 'bg-gray-400/15 text-gray-300 ring-1 ring-gray-400/20',
    glowColor: 'bg-gray-300',
    barColor: 'from-gray-400 to-gray-300',
    label: '2nd',
    iconColor: 'text-gray-300',
  },
  3: {
    medal: <FaMedal className="text-lg" />,
    avatarBg: 'from-amber-500 to-amber-700',
    avatarRing: 'ring-amber-500/40',
    accentText: 'text-amber-500',
    badgeBg: 'bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/20',
    glowColor: 'bg-amber-500',
    barColor: 'from-amber-600 to-amber-400',
    label: '3rd',
    iconColor: 'text-amber-500',
  },
};

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await scoreAPI.getLeaderboard();
      setLeaderboard(data.leaderboard || []);
      setMyRank(data.myRank);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 bg-dark-card rounded-lg animate-pulse w-52" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-56 bg-dark-card rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="bg-dark-card rounded-2xl overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-dark-secondary/10">
              <div className="w-8 h-5 bg-dark-secondary/30 rounded animate-pulse" />
              <div className="w-10 h-10 bg-dark-secondary/30 rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-dark-secondary/30 rounded animate-pulse" />
              <div className="w-32 h-3 bg-dark-secondary/30 rounded animate-pulse hidden md:block" />
              <div className="w-16 h-5 bg-dark-secondary/30 rounded animate-pulse" />
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
    if (!entry) return <div className="flex-1 min-h-[200px] bg-dark-card/30 rounded-2xl border border-dark-secondary/10 border-dashed flex items-center justify-center text-dark-muted text-sm">--</div>;
    const cfg = podiumConfig[rank];
    const isFirst = rank === 1;

    return (
      <div className={`relative flex-1 rounded-2xl border ${cfg.badgeBg.includes('yellow') ? 'border-yellow-500/25' : cfg.badgeBg.includes('gray') ? 'border-gray-400/20' : 'border-amber-500/20'} bg-dark-card overflow-hidden group hover:scale-[1.02] transition-transform`}>
        {/* Top accent bar */}
        <div className={`h-1 bg-gradient-to-r ${cfg.barColor}`} />

        {/* Glow */}
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[80px] opacity-10 ${cfg.glowColor}`} />

        <div className="relative px-4 md:px-6 pt-6 pb-5 flex flex-col items-center text-center">
          {/* Medal */}
          <div className={`mb-3 ${cfg.iconColor}`}>{cfg.medal}</div>

          {/* Avatar */}
          <div className={`${isFirst ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'} rounded-full bg-gradient-to-br ${cfg.avatarBg} flex items-center justify-center text-white font-extrabold ring-4 ${cfg.avatarRing} shadow-xl mb-4`}>
            {getInitials(entry.studentName)}
          </div>

          {/* Name */}
          <p className={`${isFirst ? 'text-lg' : 'text-base'} font-bold text-white truncate w-full mb-0.5`}>{entry.studentName}</p>
          {entry.isCurrentUser && (
            <span className="text-[10px] font-bold text-dark-accent bg-dark-accent/15 px-2 py-0.5 rounded-full">YOU</span>
          )}

          {/* Points */}
          <div className="mt-3">
            <p className={`${isFirst ? 'text-3xl' : 'text-2xl'} font-extrabold ${cfg.accentText} leading-none`}>{entry.totalPoints}</p>
            <p className="text-dark-muted text-xs font-semibold mt-1">points</p>
          </div>

          {/* Breakdown pills */}
          <div className="flex items-center gap-2 mt-4 w-full justify-center">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
              <FaClipboardList className="text-[9px]" /> {entry.practicePoints}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg">
              <FaCode className="text-[9px]" /> {entry.codingPoints}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <FaTrophy className="text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-dark-muted text-sm mt-1">Top performers across all courses</p>
        </div>

        {/* Your rank badge */}
        {myRank && (
          <div className="shrink-0 flex items-center gap-3 bg-dark-card rounded-xl border border-dark-accent/20 px-4 py-2.5">
            <FaStar className="text-dark-accent" />
            <div>
              <p className="text-[10px] text-dark-muted font-bold uppercase tracking-widest leading-none">Your Rank</p>
              <p className="text-xl font-extrabold text-dark-accent leading-tight">#{myRank}</p>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Cards */}
      {(first || second || third) && (
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          <PodiumCard entry={second} rank={2} />
          <PodiumCard entry={first} rank={1} />
          <PodiumCard entry={third} rank={3} />
        </div>
      )}

      {/* Full Width Rankings Table */}
      {leaderboard.length > 0 ? (
        <div className="bg-dark-card rounded-2xl border border-dark-secondary/30 overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center gap-2 px-4 md:px-6 py-3 bg-dark-bg/50 border-b border-dark-secondary/20 sticky top-0 z-10">
            <div className="w-16 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Rank</div>
            <div className="flex-1 text-[11px] font-bold text-dark-muted uppercase tracking-widest">Learner</div>
            <div className="w-[200px] text-[11px] font-bold text-dark-muted uppercase tracking-widest hidden lg:block">Score</div>
            <div className="w-20 text-center text-[11px] font-bold text-dark-muted uppercase tracking-widest hidden md:block">Practice</div>
            <div className="w-20 text-center text-[11px] font-bold text-dark-muted uppercase tracking-widest hidden md:block">Coding</div>
            <div className="w-28 text-right text-[11px] font-bold text-dark-muted uppercase tracking-widest">Total</div>
          </div>

          {/* All Rows */}
          {leaderboard.map((entry, idx) => {
            const isTop3 = entry.rank <= 3;
            const cfg = isTop3 ? podiumConfig[entry.rank] : null;
            const barPercent = maxPoints > 0 ? (entry.totalPoints / maxPoints) * 100 : 0;

            return (
              <div
                key={entry.studentId}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 border-b border-dark-secondary/8 last:border-0 transition-all group
                  ${entry.isCurrentUser
                    ? 'bg-dark-accent/8 border-l-[3px] border-l-dark-accent'
                    : isTop3
                    ? 'bg-dark-bg/10'
                    : idx % 2 === 0 ? '' : 'bg-dark-bg/15'
                  } hover:bg-dark-secondary/12`}
              >
                {/* Rank */}
                <div className="w-16 flex items-center">
                  {isTop3 ? (
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold ${cfg.badgeBg}`}>
                      {entry.rank}
                    </div>
                  ) : (
                    <span className={`text-base font-bold pl-2 ${entry.isCurrentUser ? 'text-dark-accent' : 'text-dark-muted/70'}`}>
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar + Name */}
                <div className="flex-1 flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                    ${isTop3
                      ? `bg-gradient-to-br ${cfg.avatarBg} text-white ring-2 ${cfg.avatarRing}`
                      : entry.isCurrentUser
                      ? 'bg-dark-accent/15 text-dark-accent ring-2 ring-dark-accent/15'
                      : 'bg-dark-secondary/25 text-dark-muted'
                    }`}>
                    {getInitials(entry.studentName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[15px] font-semibold truncate
                        ${isTop3 ? 'text-white' : entry.isCurrentUser ? 'text-dark-accent' : 'text-white'}`}>
                        {entry.studentName}
                      </p>
                      {entry.isCurrentUser && (
                        <span className="shrink-0 text-[10px] font-extrabold text-dark-accent bg-dark-accent/12 px-2 py-0.5 rounded-md">YOU</span>
                      )}
                      {isTop3 && (
                        <span className={`shrink-0 ${cfg.iconColor} text-sm`}>{cfg.medal}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score bar (visual) */}
                <div className="w-[200px] hidden lg:flex items-center gap-3">
                  <div className="flex-1 h-2 bg-dark-secondary/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isTop3 ? `bg-gradient-to-r ${cfg.barColor}` : entry.isCurrentUser ? 'bg-dark-accent' : 'bg-dark-secondary/60'}`}
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>

                {/* Practice */}
                <div className="w-20 text-center hidden md:block">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400">
                    {entry.practicePoints}
                  </span>
                </div>

                {/* Coding */}
                <div className="w-20 text-center hidden md:block">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-400">
                    {entry.codingPoints}
                  </span>
                </div>

                {/* Total */}
                <div className="w-28 text-right">
                  <span className={`text-lg font-extrabold ${isTop3 ? cfg.accentText : entry.isCurrentUser ? 'text-dark-accent' : 'text-white'}`}>
                    {entry.totalPoints}
                  </span>
                  <span className="text-dark-muted text-[10px] ml-1 font-semibold">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-dark-card rounded-2xl border border-dark-secondary/30 p-16 text-center">
          <div className="w-20 h-20 bg-dark-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <FaTrophy className="text-4xl text-dark-muted opacity-30" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No scores yet</h3>
          <p className="text-dark-muted text-base max-w-sm mx-auto">Complete practice quizzes and coding challenges to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
