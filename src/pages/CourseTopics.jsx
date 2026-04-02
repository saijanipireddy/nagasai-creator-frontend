import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FaPlay, FaFileAlt, FaQuestion, FaBars, FaBook, FaLaptopCode, FaCheckCircle,
} from 'react-icons/fa';
import TopicSidebar from '../components/Courses/TopicSidebar';
import CodingPlayground from '../components/Courses/CodingPlayground';
import CodingPracticeLanding from '../components/Courses/CodingPracticeLanding';
import PracticeLanding from '../components/Courses/PracticeLanding';
import PracticeQuiz from '../components/Courses/PracticeQuiz';
import ReviewMistakes from '../components/Courses/ReviewMistakes';
import { courseAPI, topicAPI, enrollmentAPI, completionAPI, BACKEND_URL, getFileUrl } from '../services/api';
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
  const { setSidebarCollapsed, setFullBleed } = useOutletContext();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [fullTopicCache, setFullTopicCache] = useState({});
  const [topicLoading, setTopicLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCodingPlayground, setShowCodingPlayground] = useState(false);
  const [codingSolved, setCodingSolved] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  // Practice state machine: 'landing' | 'quiz' | 'review'
  const [practiceView, setPracticeView] = useState('landing');
  const [reviewAnswers, setReviewAnswers] = useState(null);

  // Completion tracking
  const [completions, setCompletions] = useState({});

  // Content loading states for tab switching
  const [contentLoading, setContentLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);


  // Auto-collapse main sidebar and enable full-bleed mode when entering course view
  useEffect(() => {
    setSidebarCollapsed(true);
    setFullBleed(true);
    return () => {
      setSidebarCollapsed(false);
      setFullBleed(false);
    };
  }, [setSidebarCollapsed, setFullBleed]);

  // Load summary data for sidebar + course info
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setCourse(null);
    setTopics([]);
    setSelectedTopic(null);

    const fetchCourseData = async () => {
      try {
        // Check enrollment access first
        const accessRes = await enrollmentAPI.checkAccess(courseId, controller.signal);
        if (!cancelled && !accessRes.data.hasAccess) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const [courseRes, topicsRes] = await Promise.all([
          courseAPI.getById(courseId, controller.signal),
          courseAPI.getTopicsSummary(courseId, controller.signal),
        ]);
        if (!cancelled) {
          setCourse(courseRes.data);
          setTopics(topicsRes.data);
          if (topicsRes.data.length > 0) {
            setSelectedTopic(topicsRes.data[0]);
          }
          setLoading(false);
        }
      } catch (error) {
        if (cancelled || error.name === 'CanceledError' || error.name === 'AbortError') return;
        setLoading(false);
      }
    };
    fetchCourseData();
    return () => { cancelled = true; controller.abort(); };
  }, [courseId]);

  // Fetch completions for this course
  useEffect(() => {
    if (!courseId) return;
    const controller = new AbortController();
    completionAPI.getCompletions(courseId, controller.signal)
      .then((data) => setCompletions(data || {}))
      .catch(() => {});
    return () => controller.abort();
  }, [courseId]);

  // Auto-mark item as complete when viewing
  const markAsComplete = (topicId, itemType) => {
    if (!topicId || !itemType) return;
    // Skip if already marked
    if (completions[topicId]?.includes(itemType)) return;
    completionAPI.markComplete(topicId, itemType)
      .then(() => {
        setCompletions((prev) => ({
          ...prev,
          [topicId]: [...(prev[topicId] || []), itemType],
        }));
      })
      .catch(() => {});
  };

  // Fetch full topic data on-demand when a topic is selected
  useEffect(() => {
    if (!selectedTopic) return;
    const topicId = selectedTopic._id;

    if (fullTopicCache[topicId]) {
      setSelectedTopic(fullTopicCache[topicId]);
      return;
    }

    if (selectedTopic.practice) return;

    const controller = new AbortController();
    setTopicLoading(true);

    topicAPI.getById(topicId, controller.signal)
      .then(res => {
        const fullData = res.data;
        setFullTopicCache(prev => ({ ...prev, [topicId]: fullData }));
        setSelectedTopic(current => {
          if ((current?._id) === topicId) return fullData;
          return current;
        });
      })
      .catch(err => {
        if (err.name === 'CanceledError') return;
      })
      .finally(() => setTopicLoading(false));

    return () => controller.abort();
  }, [selectedTopic?._id]);

  // Reset view state when a different topic is selected
  const selectedTopicId = selectedTopic?._id;
  useEffect(() => {
    if (selectedTopicId) {
      setShowCodingPlayground(false);
      setPracticeView('landing');
      setReviewAnswers(null);
      setVideoLoaded(false);
      setPdfLoaded(false);
      setContentLoading(true);
      const timer = setTimeout(() => setContentLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTopicId]);

  // Handle coding practice tab — no longer auto-opens playground
  useEffect(() => {
    if (activeTab !== 'codingPractice') {
      setShowCodingPlayground(false);
    }
  }, [activeTab, selectedTopic]);

  const handleCloseCodingPlayground = () => {
    setShowCodingPlayground(false);
    setActiveTab('video');
  };

  if (loading) {
    return <CourseTopicsSkeleton />;
  }

  if (accessDenied) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <FaBook className="text-6xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">You are not enrolled in this course. Contact your admin for access.</p>
          <Link to="/courses" className="text-indigo-500 hover:text-indigo-600 font-medium">Back to My Courses</Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <FaBook className="text-6xl text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Course not found</h2>
          <Link to="/courses" className="text-indigo-600 hover:underline">
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
        onComplete={() => markAsComplete(selectedTopic._id, 'codingPractice')}
        readOnly={codingSolved}
      />
    );
  }

  // Mobile sidebar + FAB rendered via portal into document.body to escape overflow/iframe clipping
  const mobileControls = createPortal(
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Topics Sidebar */}
      <div
        className={`
          fixed top-[60px] sm:top-[72px] left-0 z-[101] h-[calc(100vh-60px)] sm:h-[calc(100vh-72px)] shadow-2xl
          lg:hidden
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
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
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          completions={completions}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Mobile Sidebar Toggle FAB - in portal so iframes can't block it */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-4 z-[99] w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white active:scale-95 transition-transform"
        >
          <FaBars />
        </button>
      )}
    </>,
    document.body
  );

  return (
    <>
      {mobileControls}

    <div className="h-full">
      <div className="flex h-full overflow-hidden">

        {/* Topics Sidebar - Desktop only (static in flow) */}
        <div className="hidden lg:block h-full">
          <TopicSidebar
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={(topic) => {
              setSelectedTopic(topic);
              setSidebarOpen(false);
            }}
            courseName={course.name}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            completions={completions}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-hidden p-1.5 sm:p-2 md:p-3">
        {selectedTopic ? (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Video Content */}
            {activeTab === 'video' && (
              <div className="h-full">
                {contentLoading ? (
                  <VideoPlayerSkeleton />
                ) : selectedTopic.videoUrl ? (
                  <div className="h-full relative rounded-xl overflow-hidden bg-black">
                    {!videoLoaded && <VideoPlayerSkeleton />}
                    <iframe
                      src={getYouTubeEmbedUrl(selectedTopic.videoUrl)}
                      className={`w-full h-full transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={selectedTopic.title}
                      onLoad={() => setVideoLoaded(true)}
                    />
                    {/* Mark as Complete - bottom-right overlay */}
                    <div className="absolute bottom-0 right-0 z-10 p-2 sm:p-3">
                      {completions[selectedTopic._id]?.includes('video') ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 rounded-lg sm:rounded-xl">
                          <FaCheckCircle className="text-white text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-semibold text-white">Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => markAsComplete(selectedTopic._id, 'video')}
                          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 hover:bg-white transition-all group shadow-lg"
                        >
                          <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-slate-400 group-hover:border-indigo-500 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Mark Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white rounded-xl">
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
              <div className="h-full">
                {contentLoading ? (
                  <PDFViewerSkeleton />
                ) : selectedTopic.pdfUrl ? (
                  <div className="h-full relative rounded-lg overflow-hidden bg-white">
                    {!pdfLoaded && (
                      <div className="absolute inset-0 z-10">
                        <PDFViewerSkeleton />
                      </div>
                    )}
                    <iframe
                      src={`${getFileUrl(selectedTopic.pdfUrl)}#toolbar=0&view=FitH`}
                      className={`w-full h-full border-none hidden sm:block transition-opacity duration-300 ${pdfLoaded ? 'opacity-100' : 'opacity-0'}`}
                      style={{ minHeight: '100%' }}
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(selectedTopic.pdfUrl))}&embedded=true`}
                      className="w-full h-full border-none sm:hidden"
                      style={{ minHeight: '100%' }}
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />
                    {/* Mark as Complete - bottom-right overlay */}
                    <div className="absolute bottom-0 right-0 z-10 p-2 sm:p-3">
                      {completions[selectedTopic._id]?.includes('ppt') ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-500 rounded-lg sm:rounded-xl">
                          <FaCheckCircle className="text-white text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-semibold text-white">Completed</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => markAsComplete(selectedTopic._id, 'ppt')}
                          className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20 hover:bg-white transition-all group shadow-lg"
                        >
                          <div className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-slate-400 group-hover:border-indigo-500 transition-colors" />
                          <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">Mark Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white rounded-xl">
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
                      />
                    )}
                    {practiceView === 'quiz' && (
                      <PracticeQuiz
                        topic={selectedTopic}
                        onComplete={() => setPracticeView('quiz')}
                        onBack={() => setPracticeView('landing')}
                        onReview={(answersData) => {
                          setReviewAnswers(answersData);
                          setPracticeView('review');
                          markAsComplete(selectedTopic._id, 'practice');
                        }}
                      />
                    )}
                    {practiceView === 'review' && reviewAnswers && (
                      <ReviewMistakes
                        answers={reviewAnswers}
                        onBack={() => setPracticeView('landing')}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white rounded-lg">
                    <div className="text-center">
                      <FaQuestion className="text-6xl mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Practice questions coming soon</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coding Practice Content - Landing page */}
            {activeTab === 'codingPractice' && selectedTopic.codingPractice?.title && (
              <div className="h-full overflow-y-auto bg-slate-50 rounded-lg">
                {contentLoading || topicLoading ? (
                  <CodingPlaygroundSkeleton />
                ) : (
                  <CodingPracticeLanding
                    topic={selectedTopic}
                    codingPractice={selectedTopic.codingPractice}
                    onStartCoding={(solved) => {
                      setCodingSolved(!!solved);
                      setShowCodingPlayground(true);
                    }}
                  />
                )}
              </div>
            )}

            {/* Coding Practice Content - Fallback when no content */}
            {activeTab === 'codingPractice' && !selectedTopic.codingPractice?.title && (
              <div className="h-full overflow-y-auto">
                {contentLoading || topicLoading ? (
                  <CodingPlaygroundSkeleton />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white rounded-lg">
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
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <FaBook className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a topic to start learning</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
    </>
  );
};

export default CourseTopics;
