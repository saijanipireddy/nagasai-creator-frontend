import { FaArrowLeft, FaRedo, FaTrophy } from 'react-icons/fa';

const PracticeResults = ({ topic, onBack, onPracticeAgain }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div className="flex-1">
            <h2 className="text-base md:text-lg font-bold text-gray-900">{topic.title}</h2>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">Practice Results</p>
          </div>
        </div>

        {/* Practice Again */}
        <button
          onClick={onPracticeAgain}
          className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 active:scale-[0.99] mb-5"
        >
          <FaRedo className="text-[10px] group-hover:-rotate-180 transition-transform duration-500" />
          Practice Again
        </button>

        <div className="text-center py-14 bg-white rounded-xl border border-gray-200">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gray-100">
            <FaTrophy className="text-xl text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm font-bold">Results are shown in the quiz</p>
          <p className="text-gray-400 text-xs mt-1 font-medium">Practice again to review your answers</p>
        </div>
      </div>
    </div>
  );
};

export default PracticeResults;
