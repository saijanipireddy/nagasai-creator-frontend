import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FaPlay, FaFileAlt, FaQuestion, FaCheck, FaBars, FaBook, FaLaptopCode,
  FaDownload, FaExpand, FaCompress, FaExternalLinkAlt
} from 'react-icons/fa';
import TopicSidebar from '../components/Courses/TopicSidebar';
import CodingPlayground from '../components/Courses/CodingPlayground';
import PracticeLanding from '../components/Courses/PracticeLanding';
import PracticeQuiz from '../components/Courses/PracticeQuiz';
import PracticeResults from '../components/Courses/PracticeResults';
import ReviewMistakes from '../components/Courses/ReviewMistakes';
import { courseAPI, topicAPI, scoreAPI, BACKEND_URL, getFileUrl } from '../services/api';
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
  const [topics, setTopics] = useState([]);           // summary data for sidebar
  const [selectedTopic, setSelectedTopic] = useState(null); // full topic data (or summary until loaded)
  const [fullTopicCache, setFullTopicCache] = useState({}); // cache: { topicId: fullTopicData }
  const [topicLoading, setTopicLoading] = useState(false);  // loading full topic on-demand
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCodingPlayground, setShowCodingPlayground] = useState(false);
  const [completions, setCompletions] = useState({});

  // Practice state machine: 'landing' | 'quiz' | 'results' | 'review'
  const [practiceView, setPracticeView] = useState('landing');
  const [reviewAttemptId, setReviewAttemptId] = useState(null);

  // Content loading states for tab switching
  const [contentLoading, setContentLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  // Fullscreen states
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [videoFullscreen, setVideoFullscreen] = useState(false);

  // Auto-collapse main sidebar when entering course view
  useEffect(() => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  // Phase 1: Load summary data (fast) for sidebar + course info + completions
  useEffect(() => {
    const controller = new AbortController();
    const fetchCourseData = async () => {
      try {
        const [courseRes, topicsRes, completionsRes] = await Promise.all([
          courseAPI.getById(courseId, controller.signal),
          courseAPI.getTopicsSummary(courseId, controller.signal),
          scoreAPI.getCompletions(courseId, controller.signal).catch(() => ({ data: { completions: {} } }))
        ]);
        setCourse(courseRes.data);
        setTopics(topicsRes.data);
        setCompletions(completionsRes.data.completions || {});
        // Auto-select first topic (will trigger on-demand full load)
        if (topicsRes.data.length > 0) {
          setSelectedTopic(topicsRes.data[0]);
        }
      } catch (error) {
        if (error.name === 'CanceledError') return;
        console.error('Failed to fetch course data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
    return () => controller.abort();
  }, [courseId]);

  // Phase 2: Fetch full topic data on-demand when a topic is selected
  useEffect(() => {
    if (!selectedTopic) return;
    const topicId = selectedTopic._id;

    // Already have full data cached
    if (fullTopicCache[topicId]) {
      setSelectedTopic(fullTopicCache[topicId]);
      return;
    }

    // If topic already has practice array, it's already full data
    if (selectedTopic.practice) return;

    const controller = new AbortController();
    setTopicLoading(true);

    topicAPI.getById(topicId, controller.signal)
      .then(res => {
        const fullData = res.data;
        setFullTopicCache(prev => ({ ...prev, [topicId]: fullData }));
        // Only update if still the selected topic
        setSelectedTopic(current => {
          if ((current?._id) === topicId) return fullData;
          return current;
        });
      })
      .catch(err => {
        if (err.name === 'CanceledError') return;
        console.error('Failed to fetch topic details:', err);
      })
      .finally(() => setTopicLoading(false));

    return () => controller.abort();
  }, [selectedTopic?._id]);

  // Reset view state only when a DIFFERENT topic is selected (not when full data replaces summary)
  const selectedTopicId = selectedTopic?._id;
  useEffect(() => {
    if (selectedTopicId) {
      setShowCodingPlayground(false);
      setPdfFullscreen(false);
      setVideoFullscreen(false);
      setPracticeView('landing');
      setReviewAttemptId(null);
      // Reset content loading states when topic changes
      setVideoLoaded(false);
      setPdfLoaded(false);
      setContentLoading(true);
      // Simulate a brief loading state for smooth transition
      const timer = setTimeout(() => setContentLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTopicId]);

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
    <div className="absolute inset-0 z-10">
      <div className="flex h-full overflow-hidden">
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
            lg:static lg:z-auto lg:h-full
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
        <div className="flex-1 h-full overflow-hidden p-2 md:p-4">
        {selectedTopic ? (
          <div className="h-full overflow-hidden">
            {/* Video Content */}
            {activeTab === 'video' && (
              <div className={`${videoFullscreen ? 'fixed inset-0 z-50 bg-dark-bg' : 'h-full'} relative`}>
                {contentLoading ? (
                  <VideoPlayerSkeleton />
                ) : selectedTopic.videoUrl ? (
                  <>
                    {!videoLoaded && <VideoPlayerSkeleton />}
                    <iframe
                      src={getYouTubeEmbedUrl(selectedTopic.videoUrl)}
                      className={`w-full h-full transition-opacity duration-300 ${videoFullscreen ? '' : 'rounded-lg'} ${videoLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedTopic.title}
                      onLoad={() => setVideoLoaded(true)}
                    />
                    {/* Floating controls on top of video */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => handleMarkComplete(selectedTopic._id, 'video')}
                        disabled={completions[selectedTopic._id]?.includes('video')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          completions[selectedTopic._id]?.includes('video')
                            ? 'bg-green-500/80 text-white cursor-default'
                            : 'bg-dark-accent hover:bg-dark-accent/80 text-white'
                        }`}
                      >
                        <FaCheck className="text-xs" />
                        {completions[selectedTopic._id]?.includes('video') ? 'Completed' : 'Mark as Complete'}
                      </button>
                      <button
                        onClick={() => setVideoFullscreen(!videoFullscreen)}
                        className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                        title={videoFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      >
                        {videoFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
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
              <div className={`${pdfFullscreen ? 'fixed inset-0 z-50 bg-dark-bg' : 'h-full'} relative`}>
                {contentLoading ? (
                  <PDFViewerSkeleton />
                ) : selectedTopic.pdfUrl ? (
                  <>
                    {!pdfLoaded && (
                      <div className="absolute inset-0 z-10">
                        <PDFViewerSkeleton />
                      </div>
                    )}
                    {/* Desktop PDF viewer */}
                    <iframe
                      src={getFileUrl(selectedTopic.pdfUrl)}
                      className={`w-full h-full hidden sm:block transition-opacity duration-300 ${pdfLoaded ? 'opacity-100' : 'opacity-0'}`}
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />

                    {/* Mobile PDF viewer */}
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(selectedTopic.pdfUrl))}&embedded=true`}
                      className="w-full h-full sm:hidden"
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />

                    {/* Floating controls on top of PDF */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button
                        onClick={() => handleMarkComplete(selectedTopic._id, 'ppt')}
                        disabled={completions[selectedTopic._id]?.includes('ppt')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          completions[selectedTopic._id]?.includes('ppt')
                            ? 'bg-green-500/80 text-white cursor-default'
                            : 'bg-dark-accent hover:bg-dark-accent/80 text-white'
                        }`}
                      >
                        <FaCheck className="text-xs" />
                        {completions[selectedTopic._id]?.includes('ppt') ? 'Completed' : 'Mark as Complete'}
                      </button>
                      <a
                        href={getFileUrl(selectedTopic.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                        title="Open in New Tab"
                      >
                        <FaExternalLinkAlt className="text-sm" />
                      </a>
                      <a
                        href={getFileUrl(selectedTopic.pdfUrl)}
                        download={`${selectedTopic.title}.pdf`}
                        className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                        title="Download PDF"
                      >
                        <FaDownload className="text-sm" />
                      </a>
                      <button
                        onClick={() => setPdfFullscreen(!pdfFullscreen)}
                        className="p-2.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors"
                        title={pdfFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      >
                        {pdfFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
                      </button>
                    </div>
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

            {/* Practice Content - State Machine */}
            {activeTab === 'practice' && (
              <div className="h-full">
                {contentLoading || topicLoading ? (
                  <PracticeSkeleton />
                ) : selectedTopic.practice && selectedTopic.practice.length > 0 ? (
                  <>
                    {practiceView === 'landing' && (
                      <PracticeLanding
                        topic={selectedTopic}
                        onStartQuiz={() => setPracticeView('quiz')}
                        onViewResults={() => setPracticeView('results')}
                      />
                    )}
                    {practiceView === 'quiz' && (
                      <PracticeQuiz
                        topic={selectedTopic}
                        onComplete={(result) => {
                          handleMarkComplete(selectedTopic._id, 'practice');
                          setPracticeView('results');
                        }}
                        onBack={() => setPracticeView('landing')}
                      />
                    )}
                    {practiceView === 'results' && (
                      <PracticeResults
                        topic={selectedTopic}
                        onBack={() => setPracticeView('landing')}
                        onReview={(attemptId) => {
                          setReviewAttemptId(attemptId);
                          setPracticeView('review');
                        }}
                        onPracticeAgain={() => setPracticeView('quiz')}
                      />
                    )}
                    {practiceView === 'review' && reviewAttemptId && (
                      <ReviewMistakes
                        attemptId={reviewAttemptId}
                        onBack={() => setPracticeView('results')}
                      />
                    )}
                  </>
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
              <div className="h-full overflow-y-auto">
                {contentLoading || topicLoading ? (
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
