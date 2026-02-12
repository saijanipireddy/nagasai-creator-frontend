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
        <div className="bg-dark-card rounded-3xl border border-dark-secondary/30 overflow-hidden shadow-2xl shadow-black/30">
          {/* Header gradient banner */}
          <div className="relative px-8 md:px-12 pt-14 pb-12 bg-gradient-to-br from-dark-accent/25 via-dark-accent/10 to-dark-card overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-dark-accent/8 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-dark-accent/5 rounded-full translate-y-1/2 -translate-x-1/3 blur-xl" />
            <div className="absolute top-8 left-12 w-3 h-3 bg-dark-accent/30 rounded-full" />
            <div className="absolute top-20 right-20 w-2 h-2 bg-dark-accent/20 rounded-full" />

            <div className="relative text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-dark-accent to-dark-accent/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-dark-accent/25 ring-4 ring-dark-accent/10">
                <FaClipboardList className="text-4xl text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">{topic.title}</h2>
              <p className="text-dark-muted text-lg font-medium">Multiple Choice Quiz</p>
            </div>
          </div>

          <div className="px-8 md:px-12 pb-10">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 -mt-8 mb-8">
              <div className="bg-dark-bg/90 backdrop-blur-md rounded-2xl p-5 text-center border border-dark-secondary/25 shadow-lg shadow-black/10">
                <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaClipboardList className="text-blue-400 text-lg" />
                </div>
                <p className="text-3xl font-extrabold text-white">{questionCount}</p>
                <p className="text-sm text-dark-muted mt-1 font-medium">Questions</p>
              </div>
              <div className="bg-dark-bg/90 backdrop-blur-md rounded-2xl p-5 text-center border border-dark-secondary/25 shadow-lg shadow-black/10">
                <div className="w-12 h-12 bg-purple-500/15 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FaHistory className="text-purple-400 text-lg" />
                </div>
                <p className="text-3xl font-extrabold text-white">{loading ? '-' : attemptCount}</p>
                <p className="text-sm text-dark-muted mt-1 font-medium">Attempts</p>
              </div>
              <div className="bg-dark-bg/90 backdrop-blur-md rounded-2xl p-5 text-center border border-dark-secondary/25 shadow-lg shadow-black/10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${hasPassed ? 'bg-green-500/15' : 'bg-dark-secondary/20'}`}>
                  <FaTrophy className={`text-lg ${hasPassed ? 'text-green-400' : 'text-dark-muted'}`} />
                </div>
                <p className={`text-3xl font-extrabold ${hasPassed ? 'text-green-400' : bestScore > 0 ? 'text-yellow-400' : 'text-dark-muted'}`}>
                  {loading ? '-' : bestScore > 0 ? `${Math.round(bestScore)}%` : '--'}
                </p>
                <p className="text-sm text-dark-muted mt-1 font-medium">Best Score</p>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-dark-bg/50 rounded-2xl p-6 md:p-7 mb-8 border border-dark-secondary/20">
              <p className="text-sm font-bold text-dark-muted uppercase tracking-widest mb-5">How it works</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dark-accent/15 rounded-xl flex items-center justify-center shrink-0">
                    <FaBolt className="text-dark-accent" />
                  </div>
                  <p className="text-base text-dark-text font-medium">One question at a time with a running timer</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dark-accent/15 rounded-xl flex items-center justify-center shrink-0">
                    <FaCheckCircle className="text-dark-accent" />
                  </div>
                  <p className="text-base text-dark-text font-medium">Score <span className="text-green-400 font-bold">80%</span> or above to pass the quiz</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-dark-accent/15 rounded-xl flex items-center justify-center shrink-0">
                    <FaEye className="text-dark-accent" />
                  </div>
                  <p className="text-base text-dark-text font-medium">Review your mistakes after each attempt</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <button
                onClick={onStartQuiz}
                className="group w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-dark-accent to-dark-accent/70 hover:from-dark-accent/90 hover:to-dark-accent/60 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-dark-accent/25 hover:shadow-dark-accent/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                <FaPlay className="text-base group-hover:scale-110 transition-transform" />
                {attemptCount > 0 ? 'Practice Again' : 'Start Practice'}
              </button>

              {attemptCount > 0 && (
                <button
                  onClick={onViewResults}
                  className="group w-full flex items-center justify-between px-8 py-4.5 bg-dark-bg hover:bg-dark-secondary/30 text-dark-text rounded-2xl text-base font-semibold transition-all border border-dark-secondary/30 hover:border-dark-secondary/50"
                >
                  <span className="flex items-center gap-3">
                    <FaHistory className="text-base text-dark-muted" />
                    View Past Results
                  </span>
                  <span className="flex items-center gap-2 text-dark-muted">
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
