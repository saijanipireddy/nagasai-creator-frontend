import { useState, useEffect } from 'react';
import { FaPlay, FaFileAlt, FaQuestion, FaChevronDown, FaLaptopCode, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const subItems = [
  { id: 'video', label: 'Video Lesson', icon: FaPlay, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400', activeBg: 'bg-blue-500', activeShadow: 'shadow-blue-500/30' },
  { id: 'ppt', label: 'PPT / PDF', icon: FaFileAlt, iconBg: 'bg-orange-500/10', iconColor: 'text-orange-400', activeBg: 'bg-orange-500', activeShadow: 'shadow-orange-500/30' },
  { id: 'practice', label: 'Practice Quiz', icon: FaQuestion, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400', activeBg: 'bg-purple-500', activeShadow: 'shadow-purple-500/30' },
  { id: 'codingPractice', label: 'Code Practice', icon: FaLaptopCode, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', activeBg: 'bg-emerald-500', activeShadow: 'shadow-emerald-500/30' },
];

const TopicSidebar = ({
  topics, selectedTopic, onSelectTopic, courseName,
  activeTab, onTabChange
}) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  useEffect(() => {
    if (selectedTopic) setExpandedTopicId(selectedTopic._id || selectedTopic.id);
  }, [selectedTopic]);

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

  return (
    <div className="w-[320px] bg-[#0c1017] h-full overflow-hidden flex flex-col border-r border-slate-800/60">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5">
        <Link
          to="/courses"
          className="inline-flex items-center gap-2.5 text-slate-500 hover:text-white text-sm font-medium mb-5 transition-colors group"
        >
          <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform duration-200" />
          All Courses
        </Link>

        <h2 className="text-lg font-bold text-white leading-snug">
          {courseName}
        </h2>
        <p className="text-xs text-slate-500 mt-1.5">{topics.length} topics</p>
      </div>

      <div className="h-px bg-slate-800/80 mx-6" />

      {/* ── Section Label ── */}
      <div className="px-6 pt-5 pb-2">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
          Course Content
        </span>
      </div>

      {/* ── Topics List ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        {topics.map((topic, index) => {
          const topicId = topic._id || topic.id;
          const selectedId = selectedTopic?._id || selectedTopic?.id;
          const isSelected = selectedId === topicId;
          const isExpanded = expandedTopicId === topicId;

          return (
            <div key={topicId} className="mb-1.5">
              {/* ── Topic Row ── */}
              <button
                onClick={() => handleTopicClick(topic)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left transition-all duration-200 group
                  ${isSelected
                    ? 'bg-indigo-500/10 ring-1 ring-indigo-500/20'
                    : 'hover:bg-slate-800/50'
                  }`}
              >
                {/* Number */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold transition-all duration-200
                  ${isSelected
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-semibold leading-snug transition-colors
                    ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}
                  >
                    {topic.title}
                  </span>
                </div>

                {/* Chevron */}
                <FaChevronDown
                  className={`text-xs text-slate-600 flex-shrink-0 transition-transform duration-300 ease-out
                    ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>

              {/* ── Expanded Sub-Items ── */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out
                  ${isExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="py-2 pl-7 pr-3 space-y-1.5">
                  {subItems.map((item) => {
                    const isActiveTab = activeTab === item.id && isSelected;
                    const IconComponent = item.icon;

                    let hasContent = true;
                    if (item.id === 'video') hasContent = !!topic.videoUrl;
                    if (item.id === 'ppt') hasContent = !!topic.pdfUrl;
                    if (item.id === 'practice') hasContent = topic.practice?.length > 0 || topic.practiceCount > 0;
                    if (item.id === 'codingPractice') hasContent = !!topic.codingPractice?.title || !!topic.codingPracticeTitle;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSubItemClick(topic, item.id)}
                        disabled={!hasContent}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all duration-200
                          ${isActiveTab
                            ? `${item.activeBg} text-white shadow-lg ${item.activeShadow}`
                            : hasContent
                              ? 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                              : 'text-slate-700 cursor-not-allowed'
                          }`}
                      >
                        {/* Colored Icon Box */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                          ${isActiveTab
                            ? 'bg-white/20'
                            : hasContent
                              ? item.iconBg
                              : 'bg-slate-800/30'
                          }`}
                        >
                          <IconComponent className={`text-sm ${
                            isActiveTab ? 'text-white' : hasContent ? item.iconColor : 'text-slate-700'
                          }`} />
                        </div>

                        {/* Label */}
                        <span className="flex-1 text-sm font-medium">{item.label}</span>

                        {/* Soon badge */}
                        {!hasContent && (
                          <span className="text-[11px] text-slate-600 bg-slate-800/50 px-2.5 py-1 rounded-lg font-medium">
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div className="px-6 py-4 border-t border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span className="text-sm text-slate-500 font-medium">
            {topics.length} Topics
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopicSidebar;
