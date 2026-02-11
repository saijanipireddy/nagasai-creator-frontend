import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FaPlay, FaFileAlt, FaQuestion, FaCheck, FaBars, FaBook, FaLaptopCode,
  FaDownload, FaExpand, FaCompress, FaExternalLinkAlt
} from 'react-icons/fa';
import TopicSidebar from '../components/Courses/TopicSidebar';
import CodingPlayground from '../components/Courses/CodingPlayground';
import { courseAPI, scoreAPI, BACKEND_URL } from '../services/api';
import {
  CourseTopicsSkeleton,
  VideoPlayerSkeleton,
  PDFViewerSkeleton,
  PracticeSkeleton,
  CodingPlaygroundSkeleton
} from '../components/Loaders/Skeleton';

// Helper function to convert YouTube URL to embed format
const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';

  // Already an embed URL
  if (url.includes('/embed/')) {
    return url;
  }

  let videoId = '';

  // Handle youtube.com/watch?v=VIDEO_ID
  if (url.includes('watch?v=')) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    videoId = urlParams.get('v');
  }
  // Handle youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
  }
  // Handle youtube.com/v/VIDEO_ID
  else if (url.includes('/v/')) {
    videoId = url.split('/v/')[1]?.split('?')[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url;
};

const CourseTopics = () => {
  const { courseId } = useParams();
  const { setSidebarCollapsed } = useOutletContext();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCodingPlayground, setShowCodingPlayground] = useState(false);
  const [practiceScore, setPracticeScore] = useState(null);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [completions, setCompletions] = useState({});

  // Content loading states for tab switching
  const [contentLoading, setContentLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // PDF Viewer states
  const [pdfFullscreen, setPdfFullscreen] = useState(false);

  // Auto-collapse main sidebar when entering course view
  useEffect(() => {
    setSidebarCollapsed(true);

    // Expand sidebar when leaving this page
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, topicsRes, completionsRes] = await Promise.all([
        courseAPI.getById(courseId),
        courseAPI.getTopics(courseId),
        scoreAPI.getCompletions(courseId).catch(() => ({ data: { completions: {} } }))
      ]);
      setCourse(courseRes.data);
      setTopics(topicsRes.data);
      setCompletions(completionsRes.data.completions || {});
      if (topicsRes.data.length > 0) {
        setSelectedTopic(topicsRes.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTopic) {
      setSelectedAnswers({});
      setShowResults(false);
      setPracticeScore(null);
      setScoreSaved(false);
      setShowCodingPlayground(false);
      setPdfFullscreen(false);
      // Reset content loading states when topic changes
      setVideoLoaded(false);
      setPdfLoaded(false);
      setContentLoading(true);
      // Simulate a brief loading state for smooth transition
      const timer = setTimeout(() => setContentLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTopic]);

  // Handle coding practice tab - show full screen playground
  useEffect(() => {
    if (activeTab === 'codingPractice' && selectedTopic?.codingPractice?.title) {
      setShowCodingPlayground(true);
    } else {
      setShowCodingPlayground(false);
    }
  }, [activeTab, selectedTopic]);

  const handleCloseCodingPlayground = () => {
    setShowCodingPlayground(false);
    setActiveTab('video'); // Switch back to video tab
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const checkAnswers = async () => {
    setShowResults(true);

    const questions = selectedTopic.practice;
    const correctCount = questions.reduce((count, q, idx) => {
      return count + (selectedAnswers[idx] === q.answer ? 1 : 0);
    }, 0);
    const total = questions.length;
    const percentage = Math.round((correctCount / total) * 100);

    setPracticeScore({ score: correctCount, total, percentage });

    try {
      await scoreAPI.submitPractice({
        topicId: selectedTopic._id,
        score: correctCount,
        total,
      });
      setScoreSaved(true);
      // Auto-mark practice as complete
      handleMarkComplete(selectedTopic._id, 'practice');
    } catch (err) {
      console.error('Failed to save practice score:', err);
    }
  };

  const handleMarkComplete = async (topicId, itemType) => {
    // Optimistic update
    setCompletions(prev => {
      const existing = prev[topicId] || [];
      if (existing.includes(itemType)) return prev;
      return { ...prev, [topicId]: [...existing, itemType] };
    });

    try {
      await scoreAPI.markComplete({ topicId, itemType });
    } catch (err) {
      console.error('Failed to mark complete:', err);
      // Revert on failure
      setCompletions(prev => {
        const existing = prev[topicId] || [];
        return { ...prev, [topicId]: existing.filter(t => t !== itemType) };
      });
    }
  };

  if (loading) {
    return <CourseTopicsSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <FaBook className="text-6xl text-dark-muted mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Course not found</h2>
          <Link to="/courses" className="text-dark-accent hover:underline">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  // Render coding playground as full-screen overlay
  if (showCodingPlayground && selectedTopic?.codingPractice) {
    return (
      <CodingPlayground
        codingPractice={selectedTopic.codingPractice}
        topicId={selectedTopic._id}
        onClose={handleCloseCodingPlayground}
        onComplete={() => handleMarkComplete(selectedTopic._id, 'codingPractice')}
      />
    );
  }

  return (
    <div className="-m-4 md:-m-6">
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-dark-accent rounded-full flex items-center justify-center shadow-lg shadow-dark-accent/30"
        >
          <FaBars />
        </button>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Topics Sidebar - Hidden on mobile, visible on desktop */}
        <div
          className={`
            fixed top-16 left-0 z-50 h-[calc(100vh-4rem)]
            lg:static lg:z-auto lg:h-auto
            transition-transform duration-300
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:block
          `}
        >
          <TopicSidebar
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={(topic) => {
              setSelectedTopic(topic);
              setSidebarOpen(false);
            }}
            courseName={course.name}
            courseColor={course.color}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            completions={completions}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {selectedTopic ? (
          <div className="h-full">
            {/* Video Content */}
            {activeTab === 'video' && (
              <div className="h-[calc(100vh-5rem)] flex flex-col">
                {contentLoading ? (
                  <VideoPlayerSkeleton />
                ) : selectedTopic.videoUrl ? (
                  <>
                    <div className="relative w-full flex-1 min-h-0">
                      {!videoLoaded && <VideoPlayerSkeleton />}
                      <iframe
                        src={getYouTubeEmbedUrl(selectedTopic.videoUrl)}
                        className={`w-full h-full rounded-lg transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedTopic.title}
                        onLoad={() => setVideoLoaded(true)}
                      />
                    </div>
                    {/* Mark as Complete button */}
                    <div className="flex justify-end py-3 px-1 shrink-0">
                      <button
                        onClick={() => handleMarkComplete(selectedTopic._id, 'video')}
                        disabled={completions[selectedTopic._id]?.includes('video')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          completions[selectedTopic._id]?.includes('video')
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                            : 'bg-dark-accent hover:bg-dark-accent/80 text-white'
                        }`}
                      >
                        <FaCheck className="text-xs" />
                        {completions[selectedTopic._id]?.includes('video') ? 'Completed' : 'Mark as Complete'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-card rounded-lg">
                    <div className="text-center">
                      <FaPlay className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Video coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PPT/PDF Content */}
            {activeTab === 'ppt' && (
              <div className={`${pdfFullscreen ? 'fixed inset-0 z-50 bg-dark-bg p-0' : 'h-[calc(100vh-5rem)]'} flex flex-col`}>
                {contentLoading ? (
                  <PDFViewerSkeleton />
                ) : selectedTopic.pdfUrl ? (
                  <>
                    {/* PDF Toolbar */}
                    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 py-2 gap-2 bg-dark-card border-b border-dark-secondary shrink-0 ${pdfFullscreen ? '' : 'rounded-t-lg'}`}>
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-red-500 text-lg" />
                        <div>
                          <span className="text-sm font-medium text-white">{selectedTopic.title}</span>
                          <span className="text-xs text-dark-muted ml-2 px-2 py-0.5 bg-dark-secondary rounded">PDF</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Open in New Tab */}
                        <a
                          href={`${BACKEND_URL}${selectedTopic.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium"
                          title="Open in New Tab"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          <span className="hidden xs:inline">Open</span>
                        </a>

                        {/* Download */}
                        <a
                          href={`${BACKEND_URL}${selectedTopic.pdfUrl}`}
                          download={`${selectedTopic.title}.pdf`}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm font-medium"
                          title="Download PDF"
                        >
                          <FaDownload className="text-xs" />
                          <span className="hidden xs:inline">Download</span>
                        </a>

                        {/* Fullscreen Toggle - Hidden on mobile */}
                        <button
                          onClick={() => setPdfFullscreen(!pdfFullscreen)}
                          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            pdfFullscreen
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-dark-secondary hover:bg-dark-secondary/80 text-white'
                          }`}
                          title={pdfFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                          {pdfFullscreen ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
                          {pdfFullscreen ? 'Exit' : 'Fullscreen'}
                        </button>
                      </div>
                    </div>

                    {/* PDF Viewer - Desktop: embed, Mobile: iframe with Google Docs viewer */}
                    <div className={`flex-1 relative ${pdfFullscreen ? '' : 'rounded-b-lg overflow-hidden'}`}>
                      {!pdfLoaded && (
                        <div className="absolute inset-0 z-10">
                          <PDFViewerSkeleton />
                        </div>
                      )}
                      {/* Desktop PDF viewer */}
                      <iframe
                        src={`${BACKEND_URL}${selectedTopic.pdfUrl}`}
                        className={`w-full h-full hidden sm:block transition-opacity duration-300 ${pdfLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{
                          height: pdfFullscreen ? 'calc(100vh - 52px)' : '100%',
                          minHeight: pdfFullscreen ? 'calc(100vh - 52px)' : 'calc(100vh - 8rem)'
                        }}
                        title={selectedTopic.title}
                        onLoad={() => setPdfLoaded(true)}
                      />

                      {/* Mobile PDF viewer - Google Docs viewer as fallback */}
                      <div className="sm:hidden h-full flex flex-col">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(`${BACKEND_URL}${selectedTopic.pdfUrl}`)}&embedded=true`}
                          className="w-full flex-1"
                          style={{ minHeight: 'calc(100vh - 12rem)' }}
                          title={selectedTopic.title}
                          onLoad={() => setPdfLoaded(true)}
                        />
                        <div className="p-4 bg-dark-card border-t border-dark-secondary text-center">
                          <p className="text-dark-muted text-sm mb-3">Having trouble viewing? Open the PDF directly:</p>
                          <a
                            href={`${BACKEND_URL}${selectedTopic.pdfUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-accent hover:bg-dark-accent/80 rounded-lg transition-colors text-white font-medium"
                          >
                            <FaExternalLinkAlt />
                            Open PDF
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Hint text - Desktop only */}
                    {!pdfFullscreen && (
                      <div className="hidden sm:block text-center py-2 text-xs text-dark-muted bg-dark-card rounded-b-lg border-t border-dark-secondary">
                        Use the PDF toolbar to zoom, navigate pages, and search.
                      </div>
                    )}

                    {/* Mark as Complete button */}
                    {!pdfFullscreen && (
                      <div className="flex justify-end py-3 px-1 shrink-0">
                        <button
                          onClick={() => handleMarkComplete(selectedTopic._id, 'ppt')}
                          disabled={completions[selectedTopic._id]?.includes('ppt')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            completions[selectedTopic._id]?.includes('ppt')
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                              : 'bg-dark-accent hover:bg-dark-accent/80 text-white'
                          }`}
                        >
                          <FaCheck className="text-xs" />
                          {completions[selectedTopic._id]?.includes('ppt') ? 'Completed' : 'Mark as Complete'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-card rounded-lg">
                    <div className="text-center">
                      <FaFileAlt className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">PDF coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Practice Content */}
            {activeTab === 'practice' && (
              <div className="h-[calc(100vh-5rem)] overflow-y-auto">
                {contentLoading ? (
                  <PracticeSkeleton />
                ) : selectedTopic.practice && selectedTopic.practice.length > 0 ? (
                  <div className="space-y-4 p-4 bg-dark-card rounded-lg">
                    {selectedTopic.practice.map((q, idx) => (
                      <div key={idx} className="p-4 bg-dark-bg rounded-lg">
                        <p className="font-medium mb-4">
                          <span className="text-dark-accent mr-2">Q{idx + 1}.</span>
                          {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options?.map((opt, i) => {
                            const isSelected = selectedAnswers[idx] === i;
                            const isCorrect = q.answer === i;
                            const showCorrect = showResults && isCorrect;
                            const showWrong = showResults && isSelected && !isCorrect;

                            return (
                              <label
                                key={i}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                                  ${showCorrect ? 'bg-green-500/20 border border-green-500' :
                                    showWrong ? 'bg-red-500/20 border border-red-500' :
                                    isSelected ? 'bg-dark-accent/20 border border-dark-accent' :
                                    'hover:bg-dark-secondary border border-transparent'}`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${idx}`}
                                  checked={isSelected}
                                  onChange={() => handleAnswerSelect(idx, i)}
                                  className="accent-dark-accent"
                                  disabled={showResults}
                                />
                                <span className={showCorrect ? 'text-green-500' : showWrong ? 'text-red-500' : ''}>
                                  {opt}
                                </span>
                                {showCorrect && <FaCheck className="ml-auto text-green-500" />}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Score Summary Banner */}
                    {practiceScore && showResults && (
                      <div className={`flex items-center justify-between p-4 rounded-lg border ${
                        practiceScore.percentage >= 70
                          ? 'bg-green-500/10 border-green-500/30'
                          : practiceScore.percentage >= 40
                          ? 'bg-yellow-500/10 border-yellow-500/30'
                          : 'bg-red-500/10 border-red-500/30'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold ${
                            practiceScore.percentage >= 70 ? 'text-green-500' :
                            practiceScore.percentage >= 40 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {practiceScore.score}/{practiceScore.total}
                          </div>
                          <div>
                            <p className="font-medium">Score: {practiceScore.percentage}%</p>
                            <p className="text-dark-muted text-sm">
                              {practiceScore.percentage >= 70 ? 'Great job!' :
                               practiceScore.percentage >= 40 ? 'Good effort, keep practicing!' : 'Keep trying, you can do better!'}
                            </p>
                          </div>
                        </div>
                        {scoreSaved && (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <FaCheck className="text-xs" /> Score saved
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                      {showResults ? (
                        <button
                          onClick={() => { setSelectedAnswers({}); setShowResults(false); setPracticeScore(null); setScoreSaved(false); }}
                          className="px-6 py-2 bg-dark-secondary rounded-lg hover:bg-dark-secondary/80 transition-colors"
                        >
                          Try Again
                        </button>
                      ) : (
                        <button
                          onClick={checkAnswers}
                          className="px-6 py-2 bg-dark-accent rounded-lg hover:bg-dark-accent/80 transition-colors"
                          disabled={Object.keys(selectedAnswers).length !== selectedTopic.practice.length}
                        >
                          Check Answers
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-card rounded-lg">
                    <div className="text-center">
                      <FaQuestion className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Practice questions coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coding Practice Content - Fallback when no content */}
            {activeTab === 'codingPractice' && !selectedTopic.codingPractice?.title && (
              <div className="h-[calc(100vh-5rem)] overflow-y-auto">
                {contentLoading ? (
                  <CodingPlaygroundSkeleton />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-card rounded-lg">
                  <div className="text-center">
                    <FaLaptopCode className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Coding practice coming soon</p>
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-dark-muted">
            <div className="text-center">
              <FaBook className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a topic to start learning</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default CourseTopics;
