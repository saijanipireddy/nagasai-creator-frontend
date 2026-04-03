import { useState, useEffect } from 'react';
import { FaPlay, FaFileAlt, FaQuestion, FaChevronDown, FaLaptopCode, FaArrowLeft, FaCheck, FaTimes, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const subItems = [
  { id: 'video', label: 'Video Lesson', icon: FaPlay, color: 'bg-blue-500', lightColor: 'bg-blue-500/10', textColor: 'text-blue-400', activeBg: 'bg-blue-500', activeShadow: 'shadow-blue-500/30' },
  { id: 'ppt', label: 'PPT / PDF', icon: FaFileAlt, color: 'bg-orange-500', lightColor: 'bg-orange-500/10', textColor: 'text-orange-400', activeBg: 'bg-orange-500', activeShadow: 'shadow-orange-500/30' },
  { id: 'practice', label: 'Practice Quiz', icon: FaQuestion, color: 'bg-purple-500', lightColor: 'bg-purple-500/10', textColor: 'text-purple-400', activeBg: 'bg-purple-500', activeShadow: 'shadow-purple-500/30' },
  { id: 'codingPractice', label: 'Code Practice', icon: FaLaptopCode, color: 'bg-emerald-500', lightColor: 'bg-emerald-500/10', textColor: 'text-emerald-400', activeBg: 'bg-emerald-500', activeShadow: 'shadow-emerald-500/30' },
];

const TopicSidebar = ({
  topics, selectedTopic, onSelectTopic, courseName,
  activeTab, onTabChange, completions = {}, onClose, schedule = {}
}) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  useEffect(() => {
    if (selectedTopic) setExpandedTopicId(selectedTopic._id || selectedTopic.id);
  }, [selectedTopic]);

  // Check if a topic is locked based on schedule
  const isTopicLocked = (topicId) => {
    const entry = schedule[topicId];
    if (!entry) return false; // No schedule = accessible
    return !entry.isAccessible;
  };

  const getUnlockDate = (topicId) => {
    const entry = schedule[topicId];
    return entry?.unlockDate || null;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleTopicClick = (topic) => {
    const topicId = topic._id || topic.id;
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
    } else {
      setExpandedTopicId(topicId);
      const selectedId = selectedTopic?._id || selectedTopic?.id;
      if (selectedId !== topicId) {
        onSelectTopic(topic);
        onTabChange('video');
      }
    }
  };

  const handleSubItemClick = (topic, tabId) => {
    const selectedId = selectedTopic?._id || selectedTopic?.id;
    const topicId = topic._id || topic.id;
    if (selectedId !== topicId) onSelectTopic(topic);
    onTabChange(tabId);
  };

  const completedCount = topics.filter((t) => {
    const topicId = t._id || t.id;
    return completions[topicId] && completions[topicId].length > 0;
  }).length;

  const progressPercent = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <div className="w-[80vw] max-w-[320px] sm:w-[300px] lg:w-[290px] xl:w-[310px] bg-[#0c1017] h-full overflow-hidden flex flex-col border-r border-slate-800/60">

      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-medium transition-colors group"
          >
            <FaArrowLeft className="text-[10px] group-hover:-translate-x-1 transition-transform duration-200" />
            All Courses
          </Link>
          {/* Close button - mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 -mr-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        <h2 className="text-sm font-bold text-white leading-snug line-clamp-2">
          {courseName}
        </h2>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-medium">{completedCount}/{topics.length} topics</span>
            <span className="text-[10px] text-slate-500 font-medium">{progressPercent}%</span>
          </div>
          {topics.length > 0 && (
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-slate-800/80 mx-4" />

      {/* Section Label */}
      <div className="px-4 pt-3 pb-1.5">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
          Course Content
        </span>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto px-2.5 sm:px-3 pb-3 custom-scrollbar">
        {topics.map((topic, index) => {
          const topicId = topic._id || topic.id;
          const selectedId = selectedTopic?._id || selectedTopic?.id;
          const isSelected = selectedId === topicId;
          const isExpanded = expandedTopicId === topicId;
          const topicCompletions = completions[topicId] || [];
          const hasAnyCompletion = topicCompletions.length > 0;
          const locked = isTopicLocked(topicId);
          const unlockDate = getUnlockDate(topicId);

          // Filter sub-items that have content for this topic
          const availableItems = subItems.filter((item) => {
            if (item.id === 'video') return !!topic.videoUrl;
            if (item.id === 'ppt') return !!topic.pdfUrl;
            if (item.id === 'practice') return topic.practice?.length > 0 || topic.practiceCount > 0;
            if (item.id === 'codingPractice') return !!topic.codingPractice?.title || !!topic.codingPracticeTitle;
            return false;
          });

          return (
            <div key={topicId} className="mb-0.5">
              {/* Topic Row */}
              <button
                onClick={() => handleTopicClick(topic)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-3 rounded-xl text-left transition-all duration-200 group active:scale-[0.98]
                  ${isSelected
                    ? 'bg-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'hover:bg-slate-800/50'
                  }`}
              >
                {/* Number / Check */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-200
                  ${hasAnyCompletion
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : isSelected
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                      : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                  }`}
                >
                  {hasAnyCompletion ? <FaCheck className="text-[9px]" /> : index + 1}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className={`block text-xs font-semibold leading-snug transition-colors
                    ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}
                  >
                    {topic.title}
                  </span>
                  {locked && unlockDate && unlockDate < '2099' ? (
                    <span className="text-[9px] text-yellow-500/80 font-medium">Unlocks {formatDate(unlockDate)}</span>
                  ) : locked ? (
                    <span className="text-[9px] text-yellow-500/80 font-medium">Locked</span>
                  ) : hasAnyCompletion ? (
                    <span className="text-[9px] text-emerald-500 font-medium">{topicCompletions.length}/{availableItems.length} done</span>
                  ) : null}
                </div>

                {/* Chevron */}
                <FaChevronDown
                  className={`text-[10px] text-slate-600 flex-shrink-0 transition-transform duration-300 ease-out
                    ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>

              {/* Expanded Sub-Items with vertical timeline */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out
                  ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="py-1 pl-7 pr-1.5 sm:pr-2">
                  {availableItems.map((item, itemIdx) => {
                    const isActiveTab = activeTab === item.id && isSelected;
                    const isItemComplete = !locked && topicCompletions.includes(item.id);
                    const isLastItem = itemIdx === availableItems.length - 1;
                    const IconComponent = item.icon;

                    return (
                      <div key={item.id} className="relative">
                        {/* Vertical line connecting to next item */}
                        {!isLastItem && (
                          <div className={`absolute left-[9px] top-[32px] w-0.5 h-[calc(100%-12px)] ${
                            isItemComplete ? 'bg-emerald-500/50' : 'bg-slate-700/50'
                          }`} />
                        )}

                        <button
                          onClick={() => handleSubItemClick(topic, item.id)}
                          className={`w-full flex items-center gap-2 py-1.5 text-left transition-all duration-200 relative active:scale-[0.98]
                            ${isActiveTab
                              ? 'text-white'
                              : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          {/* Circle indicator (left side) */}
                          <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                            isItemComplete
                              ? 'bg-emerald-500'
                              : isActiveTab
                                ? 'bg-indigo-500 ring-2 ring-indigo-500/30'
                                : 'border-2 border-slate-600 bg-transparent'
                          }`}>
                            {isItemComplete && <FaCheck className="text-[6px] text-white" />}
                            {!isItemComplete && isActiveTab && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          {/* Icon + Label */}
                          <div className={`flex items-center gap-2 flex-1 px-2.5 py-2 rounded-lg transition-all duration-200 ${
                            isActiveTab
                              ? `${item.activeBg} shadow-md ${item.activeShadow}`
                              : 'hover:bg-slate-800/60'
                          }`}>
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                              isActiveTab ? 'bg-white/20' : item.lightColor
                            }`}>
                              <IconComponent className={`text-[10px] ${
                                isActiveTab ? 'text-white' : item.textColor
                              }`} />
                            </div>
                            <span className="flex-1 text-xs font-medium">{item.label}</span>
                            {locked && (
                              <FaLock className="text-[7px] text-slate-500" />
                            )}
                            {!locked && isItemComplete && !isActiveTab && (
                              <span className="text-[8px] text-emerald-500 font-semibold">Done</span>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${completedCount === topics.length && topics.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
          <span className="text-xs text-slate-500 font-medium">
            {completedCount === topics.length && topics.length > 0
              ? 'Course Complete!'
              : `${completedCount}/${topics.length} Completed`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopicSidebar;
