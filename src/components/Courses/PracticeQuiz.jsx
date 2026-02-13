import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaClock, FaFlag, FaTimes, FaChevronRight, FaPaperPlane, FaMinus } from 'react-icons/fa';
import { scoreAPI } from '../../services/api';

const PracticeQuiz = ({ topic, onComplete, onBack }) => {
  const questions = topic.practice || [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex) => {
    if (result) return;
    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const toggleFlag = () => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });
  };

  const goTo = (idx) => {
    if (idx >= 0 && idx < totalQuestions) setCurrentIndex(idx);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const handleSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    clearInterval(timerRef.current);

    const answersArray = questions.map((q, idx) => ({
      questionIndex: idx,
      question: q.question,
      options: q.options,
      selectedOption: answers[idx] !== undefined ? answers[idx] : -1,
      correctOption: q.answer,
    }));

    try {
      const res = await scoreAPI.submitPracticeAttempt({
        topicId: topic._id,
        answers: answersArray,
        timeTakenSeconds: elapsedSeconds,
      });
      setResult(res.data);
    } catch (err) {
      console.error('Failed to submit attempt:', err);
      const correct = answersArray.filter(a => a.selectedOption === a.correctOption).length;
      setResult({
        score: correct,
        total: totalQuestions,
        percentage: Math.round((correct / totalQuestions) * 100),
        passed: Math.round((correct / totalQuestions) * 100) >= 80,
        timeTakenSeconds: elapsedSeconds,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  /* ── Result Screen ──────────────────────────────────────── */
  if (result) {
    const wrongCount = Object.keys(answers).filter(i => answers[i] !== questions[i]?.answer).length;
    const skippedCount = totalQuestions - Object.keys(answers).length;
    const scoreColor = result.passed ? '#22c55e' : '#ef4444';
    const circumference = 2 * Math.PI * 58;
    const offset = circumference - (result.percentage / 100) * circumference;

    return (
      <div className="h-full overflow-y-auto p-4 md:p-8 pt-8 md:pt-12">
        <div className="w-full max-w-lg mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className={`px-8 md:px-10 pt-12 pb-8 text-center ${result.passed ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-gradient-to-b from-red-50 to-white'}`}>
              <div className="relative w-44 h-44 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle
                    cx="64" cy="64" r="58" fill="none"
                    stroke={scoreColor} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-gray-900 leading-none">{Math.round(result.percentage)}</span>
                  <span className="text-gray-400 text-base mt-1 font-medium">percent</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full text-base font-bold tracking-wide ${
                result.passed ? 'bg-green-100 text-green-600 ring-1 ring-green-200' : 'bg-red-100 text-red-600 ring-1 ring-red-200'
              }`}>
                {result.passed ? <FaCheck /> : <FaTimes />}
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>

            <div className="px-8 md:px-10 pb-10">
              <div className="text-center mb-8">
                <p className="text-gray-900 text-xl font-bold">{result.score} out of {result.total} correct</p>
                <p className="text-gray-400 text-base mt-2 flex items-center justify-center gap-2">
                  <FaClock /> {formatTime(result.timeTakenSeconds || elapsedSeconds)}
                </p>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-3 gap-3 mb-10">
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FaCheck className="text-green-500 text-sm" />
                  </div>
                  <p className="text-green-600 text-2xl font-extrabold">{result.score}</p>
                  <p className="text-xs text-green-500 mt-1 font-medium">Correct</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FaTimes className="text-red-500 text-sm" />
                  </div>
                  <p className="text-red-600 text-2xl font-extrabold">{wrongCount}</p>
                  <p className="text-xs text-red-500 mt-1 font-medium">Wrong</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                  <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <FaMinus className="text-yellow-500 text-sm" />
                  </div>
                  <p className="text-yellow-600 text-2xl font-extrabold">{skippedCount}</p>
                  <p className="text-xs text-yellow-500 mt-1 font-medium">Skipped</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => onComplete(result)}
                  className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
                >
                  View All Results
                  <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onBack}
                  className="w-full px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-base font-semibold transition-colors border border-gray-200"
                >
                  Back to Topic
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Quiz Screen ────────────────────────────────────────── */
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 bg-white border-b border-gray-200">
        <button onClick={onBack} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline">Exit</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-gray-400 text-sm font-medium truncate max-w-[150px]">{topic.title}</span>
          <span className="text-sm"><span className="text-indigo-600 font-bold">{currentIndex + 1}</span><span className="text-gray-400">/{totalQuestions}</span></span>
          <span className="flex items-center gap-1.5 text-sm text-gray-700 font-medium tabular-nums bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            <FaClock className="text-xs text-gray-400" />
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <span className="shrink-0 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold border border-indigo-100">
              Question {currentIndex + 1}
            </span>
            {flagged.has(currentIndex) && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-xs font-semibold border border-yellow-100">
                <FaFlag className="text-[10px]" /> Flagged
              </span>
            )}
          </div>

          <p className="text-gray-900 text-lg md:text-xl leading-relaxed font-medium mb-6">{currentQ.question}</p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt, i) => {
              const isSelected = answers[currentIndex] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectOption(i)}
                  className={`group w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {optionLetters[i]}
                  </span>
                  <span className={`text-base leading-relaxed font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>{opt}</span>
                  {isSelected && (
                    <FaCheck className="ml-auto text-indigo-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="shrink-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="shrink-0 p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-gray-200"
          >
            <FaArrowLeft className="text-xs" />
          </button>

          <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = flagged.has(idx);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`shrink-0 w-8 h-8 rounded-lg text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : isFlagged
                      ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                      : isAnswered
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={toggleFlag}
            className={`shrink-0 p-2.5 rounded-lg transition-all ${
              flagged.has(currentIndex)
                ? 'bg-yellow-50 text-yellow-500 border border-yellow-200'
                : 'bg-gray-50 text-gray-400 hover:text-yellow-500 border border-gray-200'
            }`}
          >
            <FaFlag className="text-xs" />
          </button>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === totalQuestions - 1}
            className="shrink-0 p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-gray-200"
          >
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 overflow-hidden shadow-xl">
            <div className="px-8 pt-8 pb-5">
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Submit Quiz?</h3>
              <p className="text-gray-500 text-base">Review your progress before submitting.</p>
            </div>

            <div className="px-8 pb-5">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-base text-gray-600 font-medium">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    Answered
                  </span>
                  <span className="text-green-600 font-extrabold text-lg">{answeredCount} / {totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-base text-gray-600 font-medium">
                    <div className="w-3 h-3 bg-gray-300 rounded-full" />
                    Unanswered
                  </span>
                  <span className={`font-extrabold text-lg ${unansweredCount > 0 ? 'text-yellow-500' : 'text-gray-300'}`}>
                    {unansweredCount}
                  </span>
                </div>
                {flagged.size > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 text-base text-gray-600 font-medium">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      Flagged
                    </span>
                    <span className="text-yellow-500 font-extrabold text-lg">{flagged.size}</span>
                  </div>
                )}
              </div>

              {unansweredCount > 0 && (
                <div className="mt-4 flex items-start gap-2.5 px-1">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 shrink-0" />
                  <p className="text-yellow-600 text-sm leading-relaxed font-medium">
                    {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''} will be marked as incorrect.
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-base font-bold transition-colors border border-gray-200"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-bold transition-colors shadow-lg shadow-indigo-600/25"
              >
                <FaPaperPlane />
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xl">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-900 font-bold text-xl">Submitting...</p>
            <p className="text-gray-400 text-base mt-2">Calculating your score</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz;
