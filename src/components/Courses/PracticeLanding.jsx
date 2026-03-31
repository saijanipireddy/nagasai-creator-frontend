import { useState, useEffect } from 'react';
import { FaPlay, FaClipboardList, FaBolt, FaCheckCircle, FaEye, FaClock, FaTrophy, FaRedo } from 'react-icons/fa';
import { practiceAPI } from '../../services/api';

const PracticeLanding = ({ topic, onStartQuiz }) => {
  const questionCount = topic.practice?.length || 0;
  const topicId = topic._id || topic.id;
  const [attempts, setAttempts] = useState([]);
  const [bestPercentage, setBestPercentage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) { setLoading(false); return; }
    const controller = new AbortController();
    practiceAPI.getAttempts(topicId, controller.signal)
      .then(({ data }) => {
        setAttempts(data.attempts || []);
        if (data.bestPercentage !== undefined && data.bestPercentage !== null) {
          setBestPercentage(data.bestPercentage);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [topicId]);

  const formatTime = (s) => {
    if (!s) return '--:--';
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  const hasPassed = attempts.some((a) => a.passed);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
              <FaClipboardList className="text-2xl text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{topic.title}</h2>
            <p className="text-slate-500 text-sm font-medium">Multiple Choice Quiz</p>
          </div>

          <div className="px-8 pb-8">
            {/* Stats row */}
            <div className="flex justify-center gap-4 mb-6">
              <div className="bg-slate-50 rounded-2xl px-6 py-4 text-center flex-1">
                <p className="text-2xl font-bold text-slate-900">{questionCount}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Questions</p>
              </div>
              {bestPercentage !== null && (
                <div className={`rounded-2xl px-6 py-4 text-center flex-1 ${hasPassed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <p className={`text-2xl font-bold ${hasPassed ? 'text-emerald-600' : 'text-slate-900'}`}>{bestPercentage}%</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Best Score</p>
                </div>
              )}
              {attempts.length > 0 && (
                <div className="bg-slate-50 rounded-2xl px-6 py-4 text-center flex-1">
                  <p className="text-2xl font-bold text-slate-900">{attempts.length}</p>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Attempts</p>
                </div>
              )}
            </div>

            {/* Past attempts */}
            {attempts.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Attempts</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {attempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        attempt.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        #{attempt.attemptNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${attempt.passed ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {attempt.percentage}%
                          </span>
                          <span className="text-xs text-slate-400">
                            {attempt.score}/{attempt.total} correct
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[10px]" />
                          {formatTime(attempt.timeTakenSeconds)}
                        </span>
                        {attempt.passed ? (
                          <FaCheckCircle className="text-emerald-500 text-sm" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works (only show on first attempt) */}
            {attempts.length === 0 && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How it works</p>
                <div className="space-y-4">
                  {[
                    { icon: FaBolt, text: 'One question at a time with a running timer', color: 'text-amber-500' },
                    { icon: FaCheckCircle, text: 'Score 80% or above to pass the quiz', color: 'text-emerald-500' },
                    { icon: FaEye, text: 'Review your mistakes after each attempt', color: 'text-indigo-500' },
                  ].map(({ icon: Icon, text, color }, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon className={`text-sm ${color}`} />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={onStartQuiz}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {attempts.length > 0 ? (
                <><FaRedo className="text-sm" /> Try Again</>
              ) : (
                <><FaPlay className="text-sm" /> Start Practice</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLanding;
