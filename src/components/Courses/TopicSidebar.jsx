import { useState, useEffect } from 'react';
import { FaCheck, FaPlay, FaFileAlt, FaQuestion, FaChevronDown, FaChevronRight, FaLaptopCode } from 'react-icons/fa';

const subItems = [
  { id: 'video', label: 'Video', icon: FaPlay },
  { id: 'ppt', label: 'PPT/PDF', icon: FaFileAlt },
  { id: 'practice', label: 'Practice', icon: FaQuestion },
  { id: 'codingPractice', label: 'Code Practice', icon: FaLaptopCode }
];

const TopicSidebar = ({
  topics,
  selectedTopic,
  onSelectTopic,
  courseName,
  courseColor,
  activeTab,
  onTabChange
}) => {
  // Track which topic is expanded (separate from selected)
  const [expandedTopicId, setExpandedTopicId] = useState(null);

  // Auto-expand selected topic when it changes
  useEffect(() => {
    if (selectedTopic) {
      setExpandedTopicId(selectedTopic._id || selectedTopic.id);
    }
  }, [selectedTopic]);

  const handleTopicClick = (topic) => {
    const topicId = topic._id || topic.id;

    // Toggle expand/collapse
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null); // Collapse if already expanded
    } else {
      setExpandedTopicId(topicId); // Expand this topic
      // Only change selected topic and tab if it's a different topic
      const selectedId = selectedTopic?._id || selectedTopic?.id;
      if (selectedId !== topicId) {
        onSelectTopic(topic);
        onTabChange('video');
      }
    }
  };

  const handleSubItemClick = (topic, tabId) => {
    // Make sure this topic is selected when clicking a sub-item
    const selectedId = selectedTopic?._id || selectedTopic?.id;
    const topicId = topic._id || topic.id;
    if (selectedId !== topicId) {
      onSelectTopic(topic);
    }
    onTabChange(tabId);
  };

  return (
    <div className="w-72 bg-dark-sidebar border-r border-dark-secondary h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      {/* Header - Compact */}
      <div className="px-4 py-3 border-b border-dark-secondary flex items-center justify-between">
        <h2 className="text-base font-bold truncate" style={{ color: courseColor }}>{courseName}</h2>
        <span className="text-dark-muted text-xs ml-2 whitespace-nowrap">{topics.length} topics</span>
      </div>

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {topics.map((topic, index) => {
            const topicId = topic._id || topic.id;
            const selectedId = selectedTopic?._id || selectedTopic?.id;
            const isSelected = selectedId === topicId;
            const isExpanded = expandedTopicId === topicId;

            return (
              <li key={topicId}>
                {/* Topic Header */}
                <button
                  onClick={() => handleTopicClick(topic)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200
                    ${isSelected
                      ? 'bg-dark-accent/20 text-white'
                      : 'hover:bg-dark-secondary text-dark-muted hover:text-white'}`}
                >
                  {/* Status Icon */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium transition-all
                      ${topic.completed
                        ? 'bg-green-500 text-white'
                        : isSelected
                          ? 'bg-dark-accent text-white'
                          : 'bg-dark-secondary text-dark-muted'
                      }`}
                  >
                    {topic.completed ? (
                      <FaCheck className="text-xs" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Topic Title */}
                  <span className="flex-1 truncate text-sm font-medium">{topic.title}</span>

                  {/* Expand/Collapse Icon */}
                  {isExpanded ? (
                    <FaChevronDown className="text-xs text-dark-accent transition-transform duration-200" />
                  ) : (
                    <FaChevronRight className="text-xs transition-transform duration-200" />
                  )}
                </button>

                {/* Sub Items (Video, PPT, Practice, Coding) - Only show when expanded */}
                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-dark-secondary pl-4 animate-fadeIn">
                    {subItems.map((item) => {
                      const isActiveTab = activeTab === item.id && isSelected;
                      const IconComponent = item.icon;

                      // Check if content exists for this item
                      let hasContent = true;
                      if (item.id === 'video') hasContent = !!topic.videoUrl;
                      if (item.id === 'ppt') hasContent = !!topic.pdfUrl;
                      if (item.id === 'practice') hasContent = topic.practice?.length > 0;
                      if (item.id === 'codingPractice') hasContent = !!topic.codingPractice?.title;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSubItemClick(topic, item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-all duration-200
                            ${isActiveTab
                              ? 'bg-dark-accent text-white shadow-md'
                              : hasContent
                                ? 'hover:bg-dark-secondary text-dark-muted hover:text-white'
                                : 'text-dark-muted/50 cursor-default'
                            }`}
                          disabled={!hasContent}
                        >
                          <IconComponent className={`text-sm ${isActiveTab ? 'text-white' : hasContent ? 'text-dark-accent' : 'text-dark-muted/50'}`} />
                          <span>{item.label}</span>
                          {!hasContent && (
                            <span className="ml-auto text-xs text-dark-muted/50">Soon</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
};

export default TopicSidebar;
