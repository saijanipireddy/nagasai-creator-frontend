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
          <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-gray-500 text-base font-medium">Loading review...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-xl font-bold">Attempt not found</p>
          <button onClick={onBack} className="mt-5 px-6 py-3 bg-gray-100 rounded-xl text-base font-semibold hover:bg-gray-200 transition-colors">
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
      <div className="shrink-0 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-4 py-5">
            <button
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900">Review Answers</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500 text-base font-medium">Attempt #{attempt.attemptNumber}</span>
                <span className="text-gray-300 text-lg">|</span>
                <span className="text-base font-bold text-gray-900">{attempt.score}/{attempt.total}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                  attempt.passed ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
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
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {f.label}
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                    isActive ? 'bg-white/20' : 'bg-gray-200/60'
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
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto p-5 md:p-8">
          {filteredAnswers.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
              <FaFilter className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-bold">No {filter} questions</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAnswers.map((a) => {
                const status = getStatus(a);

                const statusConfig = {
                  correct: {
                    bg: 'from-green-50',
                    border: 'border-green-200',
                    icon: <FaCheck className="text-base" />,
                    iconBg: 'bg-green-100 text-green-500',
                    label: 'Correct',
                    labelBg: 'bg-green-50 text-green-600 ring-1 ring-green-200',
                  },
                  wrong: {
                    bg: 'from-red-50',
                    border: 'border-red-200',
                    icon: <FaTimes className="text-base" />,
                    iconBg: 'bg-red-100 text-red-500',
                    label: 'Incorrect',
                    labelBg: 'bg-red-50 text-red-600 ring-1 ring-red-200',
                  },
                  unanswered: {
                    bg: 'from-yellow-50',
                    border: 'border-yellow-200',
                    icon: <FaMinus className="text-base" />,
                    iconBg: 'bg-yellow-100 text-yellow-500',
                    label: 'Skipped',
                    labelBg: 'bg-yellow-50 text-yellow-600 ring-1 ring-yellow-200',
                  },
                };
                const cfg = statusConfig[status];

                return (
                  <div key={a.questionIndex} className={`bg-gradient-to-b ${cfg.bg} to-white rounded-2xl border ${cfg.border} overflow-hidden shadow-sm`}>
                    {/* Question header */}
                    <div className="px-6 md:px-8 pt-7 pb-5">
                      <div className="flex items-start gap-4">
                        <span className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
                          {cfg.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-gray-500 text-base font-bold">Q{a.questionIndex + 1}</span>
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${cfg.labelBg}`}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className="text-gray-900 leading-relaxed text-lg font-medium">{a.question}</p>
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

                          let optionClasses = 'bg-gray-50 border-gray-200 text-gray-700';
                          let letterClasses = 'bg-gray-100 text-gray-500';
                          let trailingIcon = null;

                          if (isCorrect) {
                            optionClasses = 'bg-green-50 border-green-200 text-green-800';
                            letterClasses = 'bg-green-100 text-green-600';
                            trailingIcon = (
                              <div className="flex items-center gap-2 text-green-500 shrink-0">
                                <FaCheck className="text-sm" />
                                <span className="text-sm font-bold hidden sm:inline">Correct</span>
                              </div>
                            );
                          } else if (isWrongSelection) {
                            optionClasses = 'bg-red-50 border-red-200 text-red-800';
                            letterClasses = 'bg-red-100 text-red-600';
                            trailingIcon = (
                              <div className="flex items-center gap-2 text-red-500 shrink-0">
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
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <p className="text-yellow-600 text-sm font-medium">You didn't select an answer for this question</p>
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
