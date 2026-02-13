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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-extrabold text-gray-900">{Math.round(percentage)}%</span>
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
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-gray-500 text-base font-medium">Loading results...</p>
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
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{topic.title}</h2>
            <p className="text-gray-500 text-base mt-1 font-medium">Practice Results</p>
          </div>
        </div>

        {/* Best Score Banner */}
        {bestPercentage > 0 && (
          <div className={`rounded-2xl mb-8 border p-7 ${
            bestPercentage >= 80
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                bestPercentage >= 80 ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                <FaTrophy className={`text-2xl ${bestPercentage >= 80 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-extrabold text-2xl">Best Score: {Math.round(bestPercentage)}%</p>
                <p className="text-gray-500 text-base mt-1 font-medium">
                  {bestPercentage >= 80 ? 'Excellent! You\'ve passed this quiz.' : 'Keep practicing to reach the 80% pass mark.'}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-base">
                <div className="text-center">
                  <p className="text-gray-900 font-extrabold text-2xl">{totalAttempts}</p>
                  <p className="text-gray-400 text-sm font-medium">Attempts</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-green-500 font-extrabold text-2xl">{passedAttempts}</p>
                  <p className="text-gray-400 text-sm font-medium">Passed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Practice Again */}
        <button
          onClick={onPracticeAgain}
          className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] mb-8"
        >
          <FaRedo className="group-hover:-rotate-180 transition-transform duration-500" />
          Practice Again
        </button>

        {/* Section title */}
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">All Attempts</h3>
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400 font-semibold bg-gray-100 px-3 py-1 rounded-lg">{totalAttempts} total</span>
        </div>

        {/* Attempt Cards */}
        {attempts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <FaTrophy className="text-3xl text-gray-300" />
            </div>
            <p className="text-gray-500 text-xl font-bold">No attempts yet</p>
            <p className="text-gray-400 text-base mt-2 font-medium">Start practicing to see your results here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {attempts.map((attempt, index) => {
              const wrongCount = attempt.total - attempt.score;
              const isLatest = index === 0;

              return (
                <div
                  key={attempt.id}
                  className={`group bg-white rounded-2xl border transition-all duration-200 hover:shadow-md hover:shadow-gray-200/50 ${
                    isLatest ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gray-900 text-lg font-bold">Attempt #{attempt.attemptNumber}</span>
                          {isLatest && (
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100">Latest</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                          {formatDate(attempt.createdAt)} at {formatTime(attempt.createdAt)}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold mt-3 ${
                          attempt.passed
                            ? 'bg-green-50 text-green-600 border border-green-100'
                            : 'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {attempt.passed ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </div>
                      </div>
                      <CircularGauge percentage={attempt.percentage} />
                    </div>

                    {/* Breakdown */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 border border-green-100">
                        <FaCheck className="text-green-500 text-xs" />
                        <span className="text-green-600 text-sm font-bold">{attempt.score}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 border border-red-100">
                        <FaTimes className="text-red-500 text-xs" />
                        <span className="text-red-600 text-sm font-bold">{wrongCount}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
                        <FaClock className="text-gray-400 text-xs" />
                        <span className="text-gray-600 text-sm font-bold">{formatDuration(attempt.timeTakenSeconds)}</span>
                      </div>
                    </div>

                    {/* Review */}
                    <button
                      onClick={() => onReview(attempt.id)}
                      className="group/btn w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-base font-semibold transition-colors border border-gray-200"
                    >
                      <span className="flex items-center gap-2.5 text-gray-700">
                        <FaEye className="text-gray-400" />
                        Review Answers
                      </span>
                      <FaChevronRight className="text-gray-400 group-hover/btn:translate-x-1 transition-transform" />
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
