import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaClock, FaFlag, FaTimes, FaChevronRight, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { practiceAPI } from '../../services/api';

const PracticeQuiz = ({ topic, onComplete, onBack, onReview }) => {
  const questions = topic.practice || [];
  const totalQuestions = questions.length;
  const topicId = topic._id || topic.id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const handleSelectOption = (i) => { if (!result) setAnswers(prev => ({ ...prev, [currentIndex]: i })); };
  const toggleFlag = () => { setFlagged(prev => { const n = new Set(prev); n.has(currentIndex) ? n.delete(currentIndex) : n.add(currentIndex); return n; }); };
  const goTo = (idx) => { if (idx >= 0 && idx < totalQuestions) setCurrentIndex(idx); };
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    clearInterval(timerRef.current);
    setSubmitting(true);

    const arr = questions.map((q, idx) => ({
      questionIndex: idx,
      question: q.question,
      options: q.options,
      selectedOption: answers[idx] !== undefined ? answers[idx] : -1,
      correctOption: q.answer,
    }));
    const correct = arr.filter(a => a.selectedOption === a.correctOption).length;
    const pct = Math.round((correct / totalQuestions) * 100);
    const localResult = { score: correct, total: totalQuestions, percentage: pct, passed: pct >= 80, timeTakenSeconds: elapsedSeconds, answers: arr };

    // Submit to backend
    try {
      const { data } = await practiceAPI.submitAttempt({
        topicId,
        answers: arr,
        timeTakenSeconds: elapsedSeconds,
      });
      // Use backend response for authoritative result
      localResult.attemptNumber = data.attemptNumber;
      localResult.percentage = data.percentage;
      localResult.passed = data.passed;
      localResult.score = data.score;
      localResult.total = data.total;
    } catch {
      // If backend fails, still show local result
    }

    setResult(localResult);
    setSubmitting(false);
  };

  const currentQ = questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Submitting screen
  if (submitting) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-3xl text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Submitting your answers...</p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (result) {
    const wrongCount = result.answers.filter(a => a.selectedOption !== -1 && a.selectedOption !== a.correctOption).length;
    const skippedCount = result.answers.filter(a => a.selectedOption === -1).length;
    const circ = 2 * Math.PI * 50;
    const off = circ - (result.percentage / 100) * circ;

    return (
      <div className="h-full overflow-y-auto p-6 md:p-10 flex items-start justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-8 pt-10 pb-6 text-center">
              {/* Circular progress */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="50" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                  <circle cx="55" cy="55" r="50" fill="none"
                    stroke={result.passed ? '#6366f1' : '#94a3b8'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={off}
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{result.percentage}</span>
                  <span className="text-slate-400 text-xs font-medium">percent</span>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                result.passed ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {result.passed ? <FaCheck className="text-xs" /> : <FaTimes className="text-xs" />}
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>

              {result.attemptNumber && (
                <p className="text-slate-400 text-xs mt-2 font-medium">Attempt #{result.attemptNumber}</p>
              )}
            </div>

            <div className="px-8 pb-8">
              {/* Score + Time */}
              <div className="text-center mb-6">
                <p className="text-slate-900 text-base font-bold">{result.score} / {result.total} correct</p>
                <p className="text-slate-400 text-sm mt-1.5 flex items-center justify-center gap-1.5 font-medium">
                  <FaClock className="text-xs" /> {formatTime(result.timeTakenSeconds)}
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-indigo-500 text-2xl font-bold">{result.score}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Correct</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-slate-700 text-2xl font-bold">{wrongCount}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Wrong</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 text-center">
                  <p className="text-slate-400 text-2xl font-bold">{skippedCount}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Skipped</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button onClick={() => onReview(result.answers)}
                  className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20">
                  Review Answers <FaChevronRight className="text-xs" />
                </button>
                <button onClick={onComplete}
                  className="w-full px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                  Practice Again
                </button>
                <button onClick={onBack}
                  className="w-full px-5 py-2.5 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors">
                  Back to Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-xl overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-5 md:px-6 py-3.5 bg-white border-b border-slate-100">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium">
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline">Exit Quiz</span>
        </button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">
            <span className="text-indigo-500">{currentIndex + 1}</span>
            <span className="text-slate-300 mx-0.5">/</span>
            <span className="text-slate-400">{totalQuestions}</span>
          </span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500 tabular-nums bg-slate-50 px-3 py-1.5 rounded-xl font-medium">
            <FaClock className="text-xs text-slate-400" />{formatTime(elapsedSeconds)}
          </span>
        </div>
        <button onClick={() => setShowSubmitModal(true)}
          className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors">
          Submit
        </button>
      </div>

      {/* Question area */}
      <div className="flex-1 overflow-y-auto px-5 md:px-10 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold">Q{currentIndex + 1}</span>
            {flagged.has(currentIndex) && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-xs font-semibold">
                <FaFlag className="text-[10px]" /> Flagged
              </span>
            )}
          </div>
          <p className="text-slate-900 text-lg leading-relaxed font-semibold mb-7">{currentQ.question}</p>
          <div className="space-y-3">
            {currentQ.options?.map((opt, i) => {
              const sel = answers[currentIndex] === i;
              return (
                <button key={i} onClick={() => handleSelectOption(i)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200 ${
                    sel
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white hover:bg-slate-50 text-slate-700 hover:shadow-sm'
                  }`}
                >
                  <span className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
                    sel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>{letters[i]}</span>
                  <span className="text-sm font-medium leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 bg-white border-t border-slate-100 px-5 md:px-6 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}
            className="shrink-0 p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-20">
            <FaArrowLeft className="text-xs text-slate-500" />
          </button>
          <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hidden py-0.5">
            {questions.map((_, idx) => (
              <button key={idx} onClick={() => goTo(idx)}
                className={`shrink-0 w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 ${
                  idx === currentIndex ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : flagged.has(idx) ? 'bg-amber-100 text-amber-600'
                    : answers[idx] !== undefined ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}>{idx + 1}</button>
            ))}
          </div>
          <button onClick={toggleFlag}
            className={`shrink-0 p-2.5 rounded-xl transition-colors ${
              flagged.has(currentIndex) ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}>
            <FaFlag className="text-xs" />
          </button>
          <button onClick={() => goTo(currentIndex + 1)} disabled={currentIndex === totalQuestions - 1}
            className="shrink-0 p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-20">
            <FaArrowRight className="text-xs text-slate-500" />
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-7 pt-7 pb-5">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Submit Quiz?</h3>
              <p className="text-slate-500 text-sm">Review your progress before submitting.</p>
            </div>
            <div className="px-7 pb-5">
              <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Answered</span>
                  <span className="text-indigo-500 font-bold text-base">{answeredCount} / {totalQuestions}</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Unanswered</span>
                  <span className="text-slate-400 font-bold text-base">{unansweredCount}</span>
                </div>
              </div>
              {unansweredCount > 0 && (
                <p className="text-slate-400 text-xs mt-4 font-medium">
                  {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''} will be marked incorrect.
                </p>
              )}
            </div>
            <div className="px-7 pb-7 flex gap-3">
              <button onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-semibold hover:bg-slate-200 transition-colors">
                Go Back
              </button>
              <button onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20">
                <FaPaperPlane className="text-xs" /> Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz;
