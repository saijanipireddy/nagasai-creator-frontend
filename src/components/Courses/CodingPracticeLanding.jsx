import { useState, useEffect } from 'react';
import { FaPlay, FaRedo, FaEye, FaCode, FaCheck } from 'react-icons/fa';
import api from '../../services/api';

const DIFFICULTY_CONFIG = {
  easy: { label: 'Easy' },
  medium: { label: 'Medium' },
  hard: { label: 'Hard' },
};

const CodingPracticeLanding = ({ topic, codingPractice, onStartCoding }) => {
  const topicId = topic._id || topic.id;
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const difficulty = DIFFICULTY_CONFIG[codingPractice?.difficulty] || DIFFICULTY_CONFIG.easy;
  const maxScore = codingPractice?.maxScore || 100;
  const testCasesCount = codingPractice?.testCases?.length || 0;
  const title = codingPractice?.title || 'Coding Practice';
  const language = codingPractice?.language || 'javascript';

  useEffect(() => {
    if (!topicId) { setLoading(false); return; }
    const controller = new AbortController();
    api.get(`/scores/coding-submission/${topicId}`, { signal: controller.signal })
      .then(({ data }) => {
        if (data.submission) setSubmission(data.submission);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [topicId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  const isSolved = submission?.passed === true;
  const hasAttempted = !!submission;
  const testsPassed = isSolved ? testCasesCount : 0;
  const totalTests = testCasesCount;
  const earnedScore = isSolved ? maxScore : 0;
  const scorePercent = maxScore > 0 ? (earnedScore / maxScore) * 100 : 0;
  const testPercent = totalTests > 0 ? (testsPassed / totalTests) * 100 : 0;

  return (
    <div className="h-full overflow-y-auto bg-white p-3 sm:p-5">
      <div className="w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-sm font-bold text-gray-900">{topic.title}</h2>
          <span className="text-gray-300">&gt;</span>
          <span className="text-sm text-gray-500 font-medium">Coding Practice - 1</span>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block rounded-xl border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="grid grid-cols-[2.2fr_0.9fr_0.9fr_1.1fr_1.2fr_1.2fr_0.9fr_auto] items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
            {['Question', 'XP', 'Difficulty', 'Testcases Passed', 'Score', 'Latest Score', 'Status', ''].map((h, i) => (
              <span key={i} className={`text-[11px] font-semibold text-black uppercase tracking-wider ${i > 0 && i < 7 ? 'text-center' : ''} ${i === 7 ? 'w-10' : ''}`}>
                {h}
              </span>
            ))}
          </div>

          {/* Data row */}
          <div className="grid grid-cols-[2.2fr_0.9fr_0.9fr_1.1fr_1.2fr_1.2fr_0.9fr_auto] items-center gap-3 px-6 py-5 bg-white">

            {/* Question */}
            <div className="flex items-center gap-3">
            
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{title}</p>
                {/* <span className="inline-block mt-1 text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase tracking-wider">
                  {language}
                </span> */}
              </div>
            </div>

            {/* XP */}
            <div className="text-center">
              <p className="text-base font-bold text-violet-600 tabular-nums">
                {hasAttempted ? earnedScore : maxScore}
                <span className="text-[11px] font-normal text-black">/{maxScore}</span>
              </p>
              <div className="h-1 bg-gray-100 rounded-full mt-2 mx-auto w-12 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{ width: hasAttempted ? `${scorePercent}%` : '0%' }}
                />
              </div>
            </div>

            {/* Difficulty */}
            <div className="text-center">
              <span className="text-[11px] font-semibold  text-gray-700 px-3 py-1 rounded-full border border-gray-200 bg-gray-50">
                {difficulty.label}
              </span>
            </div>

            {/* Testcases Passed */}
            <div className="text-center">
              {hasAttempted ? (
                <>
                  <p className="text-base font-bold text-violet-600 tabular-nums">
                    {testsPassed}
                    <span className="text-[11px] font-normal text-black">/{totalTests}</span>
                  </p>
                  {totalTests > 0 && (
                    <div className="h-1 bg-gray-100 rounded-full mt-2 mx-auto w-12 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gray-900 transition-all duration-500"
                        style={{ width: `${testPercent}%` }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-300">--</span>
              )}
            </div>

            {/* Score */}
            <div className="text-center">
              {hasAttempted ? (
                <>
                 
                  <p className="text-lg font-bold text-violet-600 tabular-nums leading-tight mt-0.5">
                    {earnedScore}<span className="text-xs font-normal text-black">/{maxScore}</span>
                  </p>
                </>
              ) : (
                <span className="text-sm text-gray-300">--</span>
              )}
            </div>

            {/* Latest Score */}
            <div className="text-center">
              {hasAttempted ? (
                <>

                  <p className="text-lg font-bold text-violet-600 tabular-nums leading-tight mt-0.5">
                    {earnedScore}<span className="text-xs font-normal text-black">/{maxScore}</span>
                  </p>
                </>
              ) : (
                <span className="text-sm text-gray-300">--</span>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              {isSolved ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                  <FaCheck className="text-[8px]" />
                  Solved
                </span>
              ) : hasAttempted ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  Retry
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  Todo
                </span>
              )}
            </div>

            {/* Action */}
            <button
              onClick={() => onStartCoding(isSolved)}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-900 text-white transition-all duration-150 hover:bg-gray-800 hover:scale-105 active:scale-95"
              title={isSolved ? 'View Solution' : hasAttempted ? 'Try Again' : 'Start Coding'}
            >
              {isSolved ? <FaEye className="text-xs" /> : hasAttempted ? <FaRedo className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile Card ── */}
        <div className="md:hidden rounded-xl border border-gray-200 overflow-hidden bg-white">

          {/* Header */}
          <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
              <FaCode className="text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-bold uppercase">{language}</span>
                <span className="text-[9px] px-2 py-0.5 border border-gray-200 text-gray-600 rounded font-bold">{difficulty.label}</span>
              </div>
            </div>
            {isSolved && (
              <span className="text-[10px] px-2.5 py-1 bg-gray-900 text-white rounded-full font-bold shrink-0">Solved</span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="py-4 text-center">
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {hasAttempted ? earnedScore : maxScore}<span className="text-[10px] font-normal text-gray-300">/{maxScore}</span>
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">XP</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {hasAttempted ? testsPassed : '-'}<span className="text-[10px] font-normal text-gray-300">/{totalTests}</span>
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">Tests</p>
            </div>
            <div className="py-4 text-center">
              <p className="text-lg font-bold text-gray-900 tabular-nums">
                {hasAttempted ? earnedScore : '-'}<span className="text-[10px] font-normal text-gray-300">/{maxScore}</span>
              </p>
              <p className="text-[10px] text-gray-400 font-semibold mt-1 uppercase tracking-wider">Score</p>
            </div>
          </div>

          {/* Action */}
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={() => onStartCoding(isSolved)}
              className="w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 bg-gray-900 text-white transition-all active:scale-[0.97] hover:bg-gray-800"
            >
              {isSolved ? <><FaEye className="text-[10px]" /> View Solution</> : hasAttempted ? <><FaRedo className="text-[10px]" /> Try Again</> : <><FaPlay className="text-[10px]" /> Start Coding</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CodingPracticeLanding;
