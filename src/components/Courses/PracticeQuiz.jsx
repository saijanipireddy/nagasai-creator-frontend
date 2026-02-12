import { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck, FaClock, FaFlag, FaTimes, FaChevronRight, FaPaperPlane, FaRedo, FaMinus } from 'react-icons/fa';
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

  // Timer
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
  const progressPercent = (answeredCount / totalQuestions) * 100;

  // Result screen
  if (result) {
    const wrongCount = Object.keys(answers).filter(i => answers[i] !== questions[i]?.answer).length;
    const skippedCount = totalQuestions - Object.keys(answers).length;
    const scoreColor = result.passed ? '#22c55e' : '#ef4444';
    const circumference = 2 * Math.PI * 58;
    const offset = circumference - (result.percentage / 100) * circumference;

    return (
      <div className="h-full flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg">
          <div className="bg-dark-card rounded-3xl border border-dark-secondary/30 overflow-hidden shadow-2xl shadow-black/30">
            {/* Result header */}
            <div className={`px-8 md:px-10 pt-12 pb-8 text-center ${result.passed ? 'bg-gradient-to-b from-green-500/15 via-green-500/5 to-transparent' : 'bg-gradient-to-b from-red-500/15 via-red-500/5 to-transparent'}`}>
              {/* Score circle */}
              <div className="relative w-44 h-44 mx-auto mb-8">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                  <circle cx="64" cy="64" r="58" fill="none" stroke="#0f3460" strokeWidth="6" opacity="0.3" />
                  <circle
                    cx="64" cy="64" r="58" fill="none"
                    stroke={scoreColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-white leading-none">{Math.round(result.percentage)}</span>
                  <span className="text-dark-muted text-base mt-1 font-medium">percent</span>
                </div>
              </div>

              {/* Pass/Fail badge */}
              <div className={`inline-flex items-center gap-2.5 px-7 py-2.5 rounded-full text-base font-bold tracking-wide ${
                result.passed ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30' : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
              }`}>
                {result.passed ? <FaCheck /> : <FaTimes />}
                {result.passed ? 'PASSED' : 'FAILED'}
              </div>
            </div>

            <div className="px-8 md:px-10 pb-10">
              {/* Score text */}
              <div className="text-center mb-8">
                <p className="text-white text-xl font-bold">
                  {result.score} out of {result.total} correct
                </p>
                <p className="text-dark-muted text-base mt-2 flex items-center justify-center gap-2">
                  <FaClock />
                  {formatTime(result.timeTakenSeconds || elapsedSeconds)}
                </p>
              </div>

              {/* Breakdown cards */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <div className="bg-green-500/10 rounded-2xl p-5 text-center border border-green-500/20">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaCheck className="text-green-400 text-base" />
                  </div>
                  <p className="text-green-400 text-3xl font-extrabold">{result.score}</p>
                  <p className="text-sm text-green-400/70 mt-1 font-medium">Correct</p>
                </div>
                <div className="bg-red-500/10 rounded-2xl p-5 text-center border border-red-500/20">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaTimes className="text-red-400 text-base" />
                  </div>
                  <p className="text-red-400 text-3xl font-extrabold">{wrongCount}</p>
                  <p className="text-sm text-red-400/70 mt-1 font-medium">Wrong</p>
                </div>
                <div className="bg-yellow-500/10 rounded-2xl p-5 text-center border border-yellow-500/20">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FaMinus className="text-yellow-400 text-base" />
                  </div>
                  <p className="text-yellow-400 text-3xl font-extrabold">{skippedCount}</p>
                  <p className="text-sm text-yellow-400/70 mt-1 font-medium">Skipped</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => onComplete(result)}
                  className="group w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-gradient-to-r from-dark-accent to-dark-accent/70 hover:from-dark-accent/90 hover:to-dark-accent/60 text-white rounded-2xl text-lg font-bold transition-all shadow-xl shadow-dark-accent/25 hover:scale-[1.01] active:scale-[0.99]"
                >
                  View All Results
                  <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onBack}
                  className="w-full px-8 py-4 bg-dark-bg hover:bg-dark-secondary/30 text-dark-text rounded-2xl text-base font-semibold transition-colors border border-dark-secondary/30"
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

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Top Bar - single compact row */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-2 bg-dark-card border-b border-dark-secondary/30">
        <button onClick={onBack} className="flex items-center gap-1.5 text-dark-muted hover:text-white transition-colors text-sm">
          <FaArrowLeft className="text-xs" />
          <span className="hidden sm:inline font-medium">Exit</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-dark-muted text-sm font-medium truncate max-w-[150px]">{topic.title}</span>
          <span className="text-sm"><span className="text-dark-accent font-bold">{currentIndex + 1}</span><span className="text-dark-muted">/{totalQuestions}</span></span>
          <span className="flex items-center gap-1.5 text-sm text-white font-medium tabular-nums">
            <FaClock className="text-xs text-dark-muted" />
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          disabled={submitting}
          className="px-4 py-1.5 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
        >
          Submit
        </button>
      </div>

      {/* Question Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-5 pb-4">
        <div className="max-w-2xl mx-auto">
          {/* Question number badge */}
          <div className="flex items-center gap-3 mb-4">
            <span className="shrink-0 px-3.5 py-1 bg-dark-accent/15 text-dark-accent rounded-lg text-sm font-bold">
              Question {currentIndex + 1}
            </span>
            {flagged.has(currentIndex) && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/15 text-yellow-400 rounded-lg text-xs font-semibold">
                <FaFlag className="text-[10px]" /> Flagged
              </span>
            )}
          </div>

          {/* Question text */}
          <p className="text-white text-lg md:text-xl leading-relaxed font-medium mb-6">{currentQ.question}</p>

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
                      ? 'border-dark-accent bg-dark-accent/10 shadow-md shadow-dark-accent/10'
                      : 'border-dark-secondary/30 bg-dark-card hover:border-dark-secondary/60 hover:bg-dark-card/80'
                  }`}
                >
                  <span className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-dark-accent text-white shadow-md shadow-dark-accent/30'
                      : 'bg-dark-secondary/30 text-dark-muted group-hover:bg-dark-secondary/50'
                  }`}>
                    {optionLetters[i]}
                  </span>
                  <span className={`text-base leading-relaxed font-medium ${isSelected ? 'text-white' : 'text-dark-text'}`}>{opt}</span>
                  {isSelected && (
                    <FaCheck className="ml-auto text-dark-accent shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation - compact single section */}
      <div className="shrink-0 bg-dark-card border-t border-dark-secondary/30 px-4 md:px-6 py-2">
        {/* Nav row: Prev + pills + Flag + Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="shrink-0 p-2 bg-dark-bg hover:bg-dark-secondary/30 text-white rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-dark-secondary/30"
          >
            <FaArrowLeft className="text-xs" />
          </button>

          {/* Question pills - scrollable middle */}
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-hide py-0.5">
            {questions.map((_, idx) => {
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = flagged.has(idx);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`shrink-0 w-8 h-8 rounded-md text-[11px] font-bold transition-all ${
                    isCurrent
                      ? 'bg-dark-accent text-white shadow-sm shadow-dark-accent/30'
                      : isFlagged
                      ? 'bg-yellow-500/15 text-yellow-400'
                      : isAnswered
                      ? 'bg-green-500/15 text-green-400'
                      : 'bg-dark-bg text-dark-muted hover:bg-dark-secondary/30'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={toggleFlag}
            className={`shrink-0 p-2 rounded-lg transition-all ${
              flagged.has(currentIndex)
                ? 'bg-yellow-500/15 text-yellow-400'
                : 'bg-dark-bg text-dark-muted hover:text-yellow-400 border border-dark-secondary/30'
            }`}
          >
            <FaFlag className="text-xs" />
          </button>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === totalQuestions - 1}
            className="shrink-0 p-2 bg-dark-bg hover:bg-dark-secondary/30 text-white rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed border border-dark-secondary/30"
          >
            <FaArrowRight className="text-xs" />
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-card rounded-3xl w-full max-w-md border border-dark-secondary/30 overflow-hidden shadow-2xl shadow-black/40">
            <div className="px-8 pt-8 pb-5">
              <h3 className="text-2xl font-extrabold text-white mb-2">Submit Quiz?</h3>
              <p className="text-dark-muted text-base">Review your progress before submitting.</p>
            </div>

            <div className="px-8 pb-5">
              <div className="bg-dark-bg rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-base text-dark-muted font-medium">
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    Answered
                  </span>
                  <span className="text-green-400 font-extrabold text-lg">{answeredCount} / {totalQuestions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-base text-dark-muted font-medium">
                    <div className="w-3 h-3 bg-dark-muted/50 rounded-full" />
                    Unanswered
                  </span>
                  <span className={`font-extrabold text-lg ${unansweredCount > 0 ? 'text-yellow-400' : 'text-dark-muted'}`}>
                    {unansweredCount}
                  </span>
                </div>
                {flagged.size > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3 text-base text-dark-muted font-medium">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                      Flagged
                    </span>
                    <span className="text-yellow-400 font-extrabold text-lg">{flagged.size}</span>
                  </div>
                )}
              </div>

              {unansweredCount > 0 && (
                <div className="mt-4 flex items-start gap-2.5 px-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 shrink-0" />
                  <p className="text-yellow-400/80 text-sm leading-relaxed font-medium">
                    {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''} will be marked as incorrect.
                  </p>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-5 py-3.5 bg-dark-bg hover:bg-dark-secondary/30 text-white rounded-xl text-base font-bold transition-colors border border-dark-secondary/30"
              >
                Go Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 bg-dark-accent hover:bg-dark-accent/80 text-white rounded-xl text-base font-bold transition-colors shadow-lg shadow-dark-accent/25"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card rounded-3xl p-12 text-center border border-dark-secondary/30 shadow-2xl">
            <div className="w-16 h-16 border-4 border-dark-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white font-bold text-xl">Submitting...</p>
            <p className="text-dark-muted text-base mt-2">Calculating your score</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeQuiz;
