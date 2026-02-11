import { useState, useEffect } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { scoreAPI } from '../services/api';

const rankColors = {
  1: 'text-yellow-400',
  2: 'text-gray-300',
  3: 'text-amber-600',
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
      <div className="space-y-4">
        <div className="h-8 bg-dark-card rounded-lg animate-pulse w-48" />
        <div className="bg-dark-card rounded-xl border border-dark-secondary p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-dark-secondary last:border-0">
              <div className="w-8 h-8 bg-dark-secondary rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-dark-secondary rounded animate-pulse" />
              <div className="w-20 h-4 bg-dark-secondary rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <FaTrophy className="text-yellow-400" />
          Leaderboard
        </h1>
        <p className="text-dark-muted text-sm mt-1">See how you stack up against other students</p>
      </div>

      {/* My Rank Badge */}
      {myRank && (
        <div className="bg-gradient-to-r from-dark-accent/20 to-purple-600/20 rounded-xl border border-dark-accent/30 p-5 flex items-center justify-between">
          <div>
            <p className="text-dark-muted text-sm">Your Rank</p>
            <p className="text-3xl font-bold text-dark-accent">#{myRank}</p>
          </div>
          <FaMedal className="text-4xl text-dark-accent opacity-50" />
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard.length > 0 ? (
        <div className="bg-dark-card rounded-xl border border-dark-secondary overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 md:px-6 py-3 bg-dark-secondary/50 text-dark-muted text-sm font-medium">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5 md:col-span-4">Student</div>
            <div className="col-span-2 text-right hidden md:block">Practice</div>
            <div className="col-span-2 text-right hidden md:block">Coding</div>
            <div className="col-span-6 md:col-span-3 text-right">Total</div>
          </div>

          {/* Table Rows */}
          {leaderboard.map((entry) => (
            <div
              key={entry.studentId}
              className={`grid grid-cols-12 gap-2 px-4 md:px-6 py-4 border-t border-dark-secondary items-center transition-colors ${
                entry.isCurrentUser ? 'bg-dark-accent/10 border-l-2 border-l-dark-accent' : 'hover:bg-dark-secondary/30'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1">
                {entry.rank <= 3 ? (
                  <span className={`text-lg font-bold ${rankColors[entry.rank]}`}>
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-dark-muted font-medium">#{entry.rank}</span>
                )}
              </div>

              {/* Name */}
              <div className="col-span-5 md:col-span-4">
                <span className={`font-medium ${entry.isCurrentUser ? 'text-dark-accent' : 'text-white'}`}>
                  {entry.studentName}
                </span>
                {entry.isCurrentUser && (
                  <span className="ml-2 text-xs bg-dark-accent/20 text-dark-accent px-2 py-0.5 rounded-full">You</span>
                )}
              </div>

              {/* Practice Points */}
              <div className="col-span-2 text-right hidden md:block">
                <span className="text-blue-400 font-medium">{entry.practicePoints}</span>
              </div>

              {/* Coding Points */}
              <div className="col-span-2 text-right hidden md:block">
                <span className="text-green-400 font-medium">{entry.codingPoints}</span>
              </div>

              {/* Total Points */}
              <div className="col-span-6 md:col-span-3 text-right">
                <span className="text-lg font-bold">{entry.totalPoints}</span>
                <span className="text-dark-muted text-sm ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-dark-card rounded-xl border border-dark-secondary p-12 text-center">
          <FaTrophy className="text-5xl text-dark-muted mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">No scores yet</h3>
          <p className="text-dark-muted text-sm">Complete practice quizzes and coding challenges to appear on the leaderboard!</p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
