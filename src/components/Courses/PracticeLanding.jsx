import { FaPlay, FaClipboardList, FaBolt, FaCheckCircle, FaEye } from 'react-icons/fa';

const PracticeLanding = ({ topic, onStartQuiz }) => {
  const questionCount = topic.practice?.length || 0;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 flex items-start justify-center">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
              <FaClipboardList className="text-2xl text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{topic.title}</h2>
            <p className="text-slate-500 text-sm font-medium">Multiple Choice Quiz</p>
          </div>

          <div className="px-8 pb-8">
            {/* Question count */}
            <div className="flex justify-center mb-6">
              <div className="bg-slate-50 rounded-2xl px-8 py-5 text-center">
                <p className="text-3xl font-bold text-slate-900">{questionCount}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">Questions</p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How it works</p>
              <div className="space-y-4">
                {[
                  { icon: FaBolt, text: 'One question at a time with a running timer', color: 'text-amber-500' },
                  { icon: FaCheckCircle, text: 'Score 80% or above to pass the quiz', color: 'text-emerald-500' },
                  { icon: FaEye, text: 'Review your mistakes after each attempt', color: 'text-indigo-500' },
                ].map(({ icon: Icon, text, color }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className={`text-sm ${color}`} />
                    </div>
                    <p className="text-sm text-slate-600 font-medium">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start button */}
            <button
              onClick={onStartQuiz}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
            >
              <FaPlay className="text-sm" />
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeLanding;
