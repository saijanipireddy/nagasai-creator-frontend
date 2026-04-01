import { useState } from 'react';
import { FaArrowLeft, FaCheck, FaTimes } from 'react-icons/fa';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'wrong', label: 'Wrong' },
  { key: 'correct', label: 'Correct' },
  { key: 'unanswered', label: 'Skipped' },
];

const ReviewMistakes = ({ answers, onBack }) => {
  const [filter, setFilter] = useState('all');

  const getStatus = (a) => {
    if (a.selectedOption === -1 || a.selectedOption === undefined || a.selectedOption === null) return 'unanswered';
    return a.selectedOption === a.correctOption ? 'correct' : 'wrong';
  };

  const filteredAnswers = filter === 'all' ? answers : answers.filter(a => getStatus(a) === filter);
  const counts = {
    all: answers.length,
    correct: answers.filter(a => getStatus(a) === 'correct').length,
    wrong: answers.filter(a => getStatus(a) === 'wrong').length,
    unanswered: answers.filter(a => getStatus(a) === 'unanswered').length,
  };
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-slate-100">
        <div className="px-4 md:px-5">
          <div className="flex items-center gap-3 py-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
              <FaArrowLeft className="text-xs" />
            </button>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-slate-900">Review Answers</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-slate-900">{counts.correct}/{counts.all}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                  counts.correct / counts.all >= 0.8 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {Math.round((counts.correct / counts.all) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 pb-3 overflow-x-auto scrollbar-hidden">
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f.label}
                <span className={`text-[10px] ${filter === f.key ? 'text-white/70' : 'text-slate-400'}`}>{counts[f.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 md:p-5">
        {filteredAnswers.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-slate-400 text-xs font-medium">No {filter} questions</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {filteredAnswers.map((a) => {
              const status = getStatus(a);
              return (
                <div key={a.questionIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-3.5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-400">Q{a.questionIndex + 1}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        status === 'correct' ? 'bg-emerald-50 text-emerald-600'
                          : status === 'wrong' ? 'bg-red-50 text-red-500'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {status === 'correct' ? 'Correct' : status === 'wrong' ? 'Incorrect' : 'Skipped'}
                      </span>
                    </div>
                    <p className="text-slate-900 text-xs leading-relaxed font-semibold">{a.question}</p>
                  </div>
                  <div className="px-4 pb-3.5 space-y-1.5">
                    {a.options?.map((opt, i) => {
                      const isCorrect = i === a.correctOption;
                      const isWrongSel = i === a.selectedOption && !isCorrect;
                      let cls = 'bg-slate-50 text-slate-600';
                      let lCls = 'bg-slate-100 text-slate-400';
                      if (isCorrect) { cls = 'bg-emerald-50 text-emerald-700'; lCls = 'bg-emerald-500 text-white'; }
                      else if (isWrongSel) { cls = 'bg-red-50 text-red-600'; lCls = 'bg-red-400 text-white'; }
                      return (
                        <div key={i} className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs ${cls}`}>
                          <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${lCls}`}>
                            {letters[i]}
                          </span>
                          <span className="flex-1 text-xs font-medium">{opt}</span>
                          {isCorrect && <FaCheck className="text-emerald-500 text-xs" />}
                          {isWrongSel && <FaTimes className="text-red-400 text-xs" />}
                        </div>
                      );
                    })}
                    {status === 'unanswered' && (
                      <p className="text-slate-400 text-[10px] mt-1.5 font-medium">No answer selected</p>
                    )}
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

export default ReviewMistakes;
