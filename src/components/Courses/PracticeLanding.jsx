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
    <div className="h-full overflow-y-auto p-2 sm:p-4 md:p-6 flex items-start justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-5 pt-6 pb-4 text-center">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
              <FaClipboardList className="text-base text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 mb-0.5">{topic.title}</h2>
            <p className="text-slate-500 text-xs font-medium">Multiple Choice Quiz</p>
          </div>

          <div className="px-5 pb-5">
            {/* Stats row */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center flex-1">
                <p className="text-lg font-bold text-slate-900">{questionCount}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Questions</p>
              </div>
              {bestPercentage !== null && (
                <div className={`rounded-xl px-4 py-3 text-center flex-1 ${hasPassed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                  <p className={`text-lg font-bold ${hasPassed ? 'text-emerald-600' : 'text-slate-900'}`}>{bestPercentage}%</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Best Score</p>
                </div>
              )}
              {attempts.length > 0 && (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-center flex-1">
                  <p className="text-lg font-bold text-slate-900">{attempts.length}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Attempts</p>
                </div>
              )}
            </div>

            {/* Past attempts */}
            {attempts.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Attempts</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {attempts.slice(0, 5).map((attempt) => (
                    <div key={attempt.id} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        attempt.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'
                      }`}>
                        #{attempt.attemptNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${attempt.passed ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {attempt.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {attempt.score}/{attempt.total} correct
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[8px]" />
                          {formatTime(attempt.timeTakenSeconds)}
                        </span>
                        {attempt.passed ? (
                          <FaCheckCircle className="text-emerald-500 text-xs" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works (only show on first attempt) */}
            {attempts.length === 0 && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">How it works</p>
                <div className="space-y-3">
                  {[
                    { icon: FaBolt, text: 'One question at a time with a running timer', color: 'text-amber-500' },
                    { icon: FaCheckCircle, text: 'Score 80% or above to pass the quiz', color: 'text-emerald-500' },
                    { icon: FaEye, text: 'Review your mistakes after each attempt', color: 'text-indigo-500' },
                  ].map(({ icon: Icon, text, color }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon className={`text-xs ${color}`} />
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start button */}
            <button
              onClick={onStartQuiz}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              {attempts.length > 0 ? (
                <><FaRedo className="text-[10px]" /> Try Again</>
              ) : (
                <><FaPlay className="text-[10px]" /> Start Practice</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLanding;
