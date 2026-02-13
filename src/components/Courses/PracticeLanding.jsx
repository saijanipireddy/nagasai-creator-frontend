import { useState, useEffect } from 'react';
import { FaPlay, FaHistory, FaTrophy, FaClipboardList, FaChevronRight, FaBolt, FaCheckCircle, FaEye } from 'react-icons/fa';
import { scoreAPI } from '../../services/api';

const PracticeLanding = ({ topic, onStartQuiz, onViewResults }) => {
  const [bestScore, setBestScore] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await scoreAPI.getPracticeAttempts(topic._id);
        const data = res.data;
        setBestScore(data.bestPercentage || 0);
        setAttemptCount(data.attempts?.length || 0);
      } catch {
        // No attempts yet
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, [topic._id]);

  const questionCount = topic.practice?.length || 0;
  const hasPassed = bestScore >= 80;

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 pt-6 md:pt-10">
      <div className="w-full max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-8 md:px-12 pt-12 pb-8 text-center">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-600/20">
              <FaClipboardList className="text-3xl text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">{topic.title}</h2>
            <p className="text-gray-500 text-lg font-medium">Multiple Choice Quiz</p>
          </div>

          <div className="px-8 md:px-12 pb-10">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* Questions */}
              <div className="bg-white rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <FaClipboardList className="text-blue-500 text-base" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{questionCount}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">Questions</p>
              </div>

              {/* Attempts */}
              <div className="bg-white rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-100">
                  <FaHistory className="text-purple-500 text-base" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{loading ? '-' : attemptCount}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">Attempts</p>
              </div>

              {/* Best Score */}
              <div className="bg-white rounded-xl p-5 text-center border border-gray-200 shadow-sm">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 border ${hasPassed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                  <FaTrophy className={`text-base ${hasPassed ? 'text-green-500' : 'text-gray-400'}`} />
                </div>
                <p className={`text-3xl font-extrabold ${hasPassed ? 'text-green-500' : bestScore > 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
                  {loading ? '-' : bestScore > 0 ? `${Math.round(bestScore)}%` : '--'}
                </p>
                <p className="text-sm text-gray-500 mt-1 font-medium">Best Score</p>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-gray-50 rounded-xl p-6 md:p-7 mb-8 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">How it works</p>
              <div className="space-y-4">
                {[
                  { icon: FaBolt, text: <>One question at a time with a running timer</> },
                  { icon: FaCheckCircle, text: <>Score <span className="text-green-500 font-bold">80%</span> or above to pass the quiz</> },
                  { icon: FaEye, text: <>Review your mistakes after each attempt</> },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
                      <Icon className="text-indigo-500 text-sm" />
                    </div>
                    <p className="text-base text-gray-700 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                onClick={onStartQuiz}
                className="group w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.99]"
              >
                <FaPlay className="text-sm group-hover:scale-110 transition-transform" />
                {attemptCount > 0 ? 'Practice Again' : 'Start Practice'}
              </button>

              {attemptCount > 0 && (
                <button
                  onClick={onViewResults}
                  className="group w-full flex items-center justify-between px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl text-base font-semibold transition-all border border-gray-200 hover:border-gray-300"
                >
                  <span className="flex items-center gap-3">
                    <FaHistory className="text-base text-gray-400" />
                    View Past Results
                  </span>
                  <span className="flex items-center gap-2 text-gray-400">
                    {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                    <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLanding;
