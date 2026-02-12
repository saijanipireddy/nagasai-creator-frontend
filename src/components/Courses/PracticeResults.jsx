import { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaRedo, FaEye, FaTrophy, FaChevronRight, FaMinus } from 'react-icons/fa';
import { scoreAPI } from '../../services/api';

const CircularGauge = ({ percentage, size = 88, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 80 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#0f3460" strokeWidth={strokeWidth} opacity="0.3"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-extrabold text-white">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (seconds) => {
  if (!seconds) return '--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const PracticeResults = ({ topic, onBack, onReview, onPracticeAgain }) => {
  const [attempts, setAttempts] = useState([]);
  const [bestPercentage, setBestPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await scoreAPI.getPracticeAttempts(topic._id);
        setAttempts(res.data.attempts || []);
        setBestPercentage(res.data.bestPercentage || 0);
      } catch (err) {
        console.error('Failed to fetch attempts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [topic._id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-dark-muted text-base font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 hover:bg-dark-secondary/30 rounded-xl transition-colors text-dark-muted hover:text-white"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">{topic.title}</h2>
            <p className="text-dark-muted text-base mt-1 font-medium">Practice Results</p>
          </div>
        </div>

        {/* Best Score Banner */}
        {bestPercentage > 0 && (
          <div className={`relative overflow-hidden rounded-2xl mb-8 border ${
            bestPercentage >= 80
              ? 'bg-gradient-to-r from-green-500/15 via-green-500/5 to-transparent border-green-500/25'
              : 'bg-gradient-to-r from-yellow-500/15 via-yellow-500/5 to-transparent border-yellow-500/25'
          }`}>
            {/* Subtle glow */}
            <div className={`absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20 ${bestPercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <div className="relative flex items-center gap-6 p-7">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                bestPercentage >= 80 ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                <FaTrophy className={`text-3xl ${bestPercentage >= 80 ? 'text-green-400' : 'text-yellow-400'}`} />
              </div>
              <div className="flex-1">
                <p className="text-white font-extrabold text-2xl">Best Score: {Math.round(bestPercentage)}%</p>
                <p className="text-dark-muted text-base mt-1 font-medium">
                  {bestPercentage >= 80 ? 'Excellent! You\'ve passed this quiz.' : 'Keep practicing to reach the 80% pass mark.'}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-base">
                <div className="text-center">
                  <p className="text-white font-extrabold text-2xl">{totalAttempts}</p>
                  <p className="text-dark-muted text-sm font-medium">Attempts</p>
                </div>
                <div className="w-px h-10 bg-dark-secondary/30" />
                <div className="text-center">
                  <p className="text-green-400 font-extrabold text-2xl">{passedAttempts}</p>
                  <p className="text-dark-muted text-sm font-medium">Passed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Practice Again Button */}
        <button
          onClick={onPracticeAgain}
          className="group w-full flex items-center justify-center gap-3 px-6 py-4.5 bg-gradient-to-r from-dark-accent to-dark-accent/70 hover:from-dark-accent/90 hover:to-dark-accent/60 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-dark-accent/25 hover:scale-[1.01] active:scale-[0.99] mb-8"
        >
          <FaRedo className="group-hover:-rotate-180 transition-transform duration-500" />
          Practice Again
        </button>

        {/* Section title */}
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-base font-bold text-dark-muted uppercase tracking-wider">All Attempts</h3>
          <div className="flex-1 h-px bg-dark-secondary/25" />
          <span className="text-sm text-dark-muted font-semibold bg-dark-secondary/20 px-3 py-1 rounded-lg">{totalAttempts} total</span>
        </div>

        {/* Attempt Cards */}
        {attempts.length === 0 ? (
          <div className="text-center py-20 bg-dark-card rounded-3xl border border-dark-secondary/30">
            <div className="w-20 h-20 bg-dark-secondary/15 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <FaTrophy className="text-3xl text-dark-muted" />
            </div>
            <p className="text-dark-muted text-xl font-bold">No attempts yet</p>
            <p className="text-dark-muted/60 text-base mt-2 font-medium">Start practicing to see your results here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {attempts.map((attempt, index) => {
              const wrongCount = attempt.total - attempt.score;
              const isLatest = index === 0;

              return (
                <div
                  key={attempt.id}
                  className={`group bg-dark-card rounded-2xl border transition-all duration-200 hover:shadow-xl hover:shadow-black/20 ${
                    isLatest ? 'border-dark-accent/30 ring-1 ring-dark-accent/10' : 'border-dark-secondary/30 hover:border-dark-secondary/50'
                  }`}
                >
                  <div className="p-6">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-white text-lg font-bold">Attempt #{attempt.attemptNumber}</span>
                          {isLatest && (
                            <span className="px-2.5 py-1 bg-dark-accent/15 text-dark-accent rounded-lg text-xs font-bold uppercase tracking-wide">Latest</span>
                          )}
                        </div>
                        <p className="text-dark-muted text-sm font-medium">
                          {formatDate(attempt.createdAt)} at {formatTime(attempt.createdAt)}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold mt-3 ${
                          attempt.passed
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}>
                          {attempt.passed ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </div>
                      </div>
                      <CircularGauge percentage={attempt.percentage} />
                    </div>

                    {/* Breakdown */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 rounded-xl px-3 py-2.5 border border-green-500/15">
                        <FaCheck className="text-green-400 text-xs" />
                        <span className="text-green-400 text-sm font-bold">{attempt.score}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 rounded-xl px-3 py-2.5 border border-red-500/15">
                        <FaTimes className="text-red-400 text-xs" />
                        <span className="text-red-400 text-sm font-bold">{wrongCount}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 bg-dark-bg rounded-xl px-3 py-2.5 border border-dark-secondary/20">
                        <FaClock className="text-dark-muted text-xs" />
                        <span className="text-dark-muted text-sm font-bold">{formatDuration(attempt.timeTakenSeconds)}</span>
                      </div>
                    </div>

                    {/* Review button */}
                    <button
                      onClick={() => onReview(attempt.id)}
                      className="group/btn w-full flex items-center justify-between px-5 py-3.5 bg-dark-bg hover:bg-dark-secondary/25 rounded-xl text-base font-semibold transition-colors border border-dark-secondary/20"
                    >
                      <span className="flex items-center gap-2.5 text-dark-text">
                        <FaEye className="text-dark-muted" />
                        Review Answers
                      </span>
                      <FaChevronRight className="text-dark-muted group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeResults;
