import { FaArrowLeft, FaRedo, FaTrophy } from 'react-icons/fa';

const PracticeResults = ({ topic, onBack, onPracticeAgain }) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-5 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-900"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{topic.title}</h2>
            <p className="text-gray-500 text-base mt-1 font-medium">Practice Results</p>
          </div>
        </div>

        {/* Practice Again */}
        <button
          onClick={onPracticeAgain}
          className="group w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg font-bold transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99] mb-8"
        >
          <FaRedo className="group-hover:-rotate-180 transition-transform duration-500" />
          Practice Again
        </button>

        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-gray-100">
            <FaTrophy className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 text-xl font-bold">Results are shown in the quiz</p>
          <p className="text-gray-400 text-base mt-2 font-medium">Practice again to review your answers</p>
        </div>
      </div>
    </div>
  );
};

export default PracticeResults;
