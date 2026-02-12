import { useState, useEffect } from 'react';
import { FaArrowLeft, FaCheck, FaTimes, FaMinus, FaFilter } from 'react-icons/fa';
import { scoreAPI } from '../../services/api';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'wrong', label: 'Wrong' },
  { key: 'correct', label: 'Correct' },
  { key: 'unanswered', label: 'Skipped' },
];

const ReviewMistakes = ({ attemptId, onBack }) => {
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await scoreAPI.getPracticeAttemptDetail(attemptId);
        setAttempt(res.data);
      } catch (err) {
        console.error('Failed to fetch attempt detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-dark-muted text-base font-medium">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="h-full flex items-center justify-center text-dark-muted">
        <div className="text-center">
          <p className="text-xl font-bold">Attempt not found</p>
          <button onClick={onBack} className="mt-5 px-6 py-3 bg-dark-secondary rounded-xl text-base font-semibold hover:bg-dark-secondary/80 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const answers = attempt.answers || [];

  const getStatus = (a) => {
    if (a.selectedOption === -1 || a.selectedOption === undefined || a.selectedOption === null) return 'unanswered';
    if (a.selectedOption === a.correctOption) return 'correct';
    return 'wrong';
  };

  const filteredAnswers = filter === 'all'
    ? answers
    : answers.filter(a => getStatus(a) === filter);

  const counts = {
    all: answers.length,
    correct: answers.filter(a => getStatus(a) === 'correct').length,
    wrong: answers.filter(a => getStatus(a) === 'wrong').length,
    unanswered: answers.filter(a => getStatus(a) === 'unanswered').length,
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="h-full flex flex-col">
      {/* Sticky header */}
      <div className="shrink-0 bg-dark-card border-b border-dark-secondary/30">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          {/* Title row */}
          <div className="flex items-center gap-4 py-5">
            <button
              onClick={onBack}
              className="p-3 hover:bg-dark-secondary/30 rounded-xl transition-colors text-dark-muted hover:text-white"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-white">Review Answers</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-dark-muted text-base font-medium">Attempt #{attempt.attemptNumber}</span>
                <span className="text-dark-secondary text-lg">|</span>
                <span className="text-base font-bold text-white">{attempt.score}/{attempt.total}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  attempt.passed ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {Math.round(attempt.percentage)}%
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
            {FILTERS.map(f => {
              const isActive = filter === f.key;
              const count = counts[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`shrink-0 flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-base font-semibold transition-all ${
                    isActive
                      ? 'bg-dark-accent text-white shadow-lg shadow-dark-accent/20'
                      : 'bg-dark-bg text-dark-muted hover:text-white hover:bg-dark-secondary/25'
                  }`}
                >
                  {f.label}
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                    isActive ? 'bg-white/20' : 'bg-dark-secondary/40'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-5 md:p-8">
          {filteredAnswers.length === 0 ? (
            <div className="text-center py-20 bg-dark-card rounded-3xl border border-dark-secondary/30">
              <FaFilter className="text-4xl text-dark-muted mx-auto mb-4 opacity-40" />
              <p className="text-dark-muted text-xl font-bold">No {filter} questions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAnswers.map((a) => {
                const status = getStatus(a);

                const statusConfig = {
                  correct: {
                    bg: 'from-green-500/8',
                    border: 'border-green-500/25',
                    icon: <FaCheck className="text-base" />,
                    iconBg: 'bg-green-500/15 text-green-400',
                    label: 'Correct',
                    labelBg: 'bg-green-500/12 text-green-400 ring-1 ring-green-500/20',
                  },
                  wrong: {
                    bg: 'from-red-500/8',
                    border: 'border-red-500/25',
                    icon: <FaTimes className="text-base" />,
                    iconBg: 'bg-red-500/15 text-red-400',
                    label: 'Incorrect',
                    labelBg: 'bg-red-500/12 text-red-400 ring-1 ring-red-500/20',
                  },
                  unanswered: {
                    bg: 'from-yellow-500/8',
                    border: 'border-yellow-500/25',
                    icon: <FaMinus className="text-base" />,
                    iconBg: 'bg-yellow-500/15 text-yellow-400',
                    label: 'Skipped',
                    labelBg: 'bg-yellow-500/12 text-yellow-400 ring-1 ring-yellow-500/20',
                  },
                };
                const cfg = statusConfig[status];

                return (
                  <div key={a.questionIndex} className={`bg-gradient-to-b ${cfg.bg} to-dark-card rounded-2xl border ${cfg.border} overflow-hidden shadow-lg shadow-black/10`}>
                    {/* Question header */}
                    <div className="px-6 md:px-8 pt-7 pb-5">
                      <div className="flex items-start gap-4">
                        <span className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                          {cfg.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-dark-muted text-base font-bold">Q{a.questionIndex + 1}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${cfg.labelBg}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-white leading-relaxed text-lg font-medium">{a.question}</p>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="px-6 md:px-8 pb-7">
                      <div className="space-y-3">
                        {a.options?.map((opt, i) => {
                          const isCorrect = i === a.correctOption;
                          const isSelected = i === a.selectedOption;
                          const isWrongSelection = isSelected && !isCorrect;

                          let optionClasses = 'bg-dark-bg/50 border-dark-secondary/20 text-dark-text';
                          let letterClasses = 'bg-dark-secondary/25 text-dark-muted';
                          let trailingIcon = null;

                          if (isCorrect) {
                            optionClasses = 'bg-green-500/10 border-green-500/30 text-green-200';
                            letterClasses = 'bg-green-500/20 text-green-400';
                            trailingIcon = (
                              <div className="flex items-center gap-2 text-green-400 shrink-0">
                                <FaCheck className="text-sm" />
                                <span className="text-sm font-bold hidden sm:inline">Correct</span>
                              </div>
                            );
                          } else if (isWrongSelection) {
                            optionClasses = 'bg-red-500/10 border-red-500/30 text-red-200';
                            letterClasses = 'bg-red-500/20 text-red-400';
                            trailingIcon = (
                              <div className="flex items-center gap-2 text-red-400 shrink-0">
                                <FaTimes className="text-sm" />
                                <span className="text-sm font-bold hidden sm:inline">Your answer</span>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${optionClasses}`}
                            >
                              <span className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${letterClasses}`}>
                                {optionLetters[i]}
                              </span>
                              <span className="flex-1 text-base leading-relaxed font-medium">{opt}</span>
                              {trailingIcon}
                            </div>
                          );
                        })}
                      </div>

                      {status === 'unanswered' && (
                        <div className="mt-4 flex items-center gap-2.5 px-2">
                          <div className="w-2 h-2 bg-yellow-400/60 rounded-full" />
                          <p className="text-yellow-400/70 text-sm font-medium">You didn't select an answer for this question</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewMistakes;
