import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FaPlay, FaFileAlt, FaQuestion, FaBars, FaBook, FaLaptopCode,
} from 'react-icons/fa';
import TopicSidebar from '../components/Courses/TopicSidebar';
import CodingPlayground from '../components/Courses/CodingPlayground';
import PracticeLanding from '../components/Courses/PracticeLanding';
import PracticeQuiz from '../components/Courses/PracticeQuiz';
import ReviewMistakes from '../components/Courses/ReviewMistakes';
import { courseAPI, topicAPI, BACKEND_URL, getFileUrl } from '../services/api';
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
  const [fullTopicCache, setFullTopicCache] = useState({});
  const [topicLoading, setTopicLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCodingPlayground, setShowCodingPlayground] = useState(false);

  // Practice state machine: 'landing' | 'quiz' | 'review'
  const [practiceView, setPracticeView] = useState('landing');
  const [reviewAnswers, setReviewAnswers] = useState(null);

  // Content loading states for tab switching
  const [contentLoading, setContentLoading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);


  // Auto-collapse main sidebar when entering course view
  useEffect(() => {
    setSidebarCollapsed(true);
    return () => setSidebarCollapsed(false);
  }, [setSidebarCollapsed]);

  // Load summary data for sidebar + course info
  useEffect(() => {
    const controller = new AbortController();
    const fetchCourseData = async () => {
      try {
        const [courseRes, topicsRes] = await Promise.all([
          courseAPI.getById(courseId, controller.signal),
          courseAPI.getTopicsSummary(courseId, controller.signal),
        ]);
        setCourse(courseRes.data);
        setTopics(topicsRes.data);
        if (topicsRes.data.length > 0) {
          setSelectedTopic(topicsRes.data[0]);
        }
      } catch (error) {
        if (error.name === 'CanceledError') return;
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
    return () => controller.abort();
  }, [courseId]);

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

  // Handle coding practice tab
  useEffect(() => {
    if (activeTab === 'codingPractice' && selectedTopic?.codingPractice?.title) {
      setShowCodingPlayground(true);
    } else {
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
      />
    );
  }

  return (
    <div className="absolute inset-0 z-10">
      <div className="flex h-full overflow-hidden">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white"
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

        {/* Topics Sidebar */}
        <div
          className={`
            fixed top-20 left-0 z-50 h-[calc(100vh-5rem)] shadow-xl
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
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-hidden p-2 md:p-4">
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
                  <div className="h-full relative rounded-xl overflow-hidden bg-white">
                    {!pdfLoaded && (
                      <div className="absolute inset-0 z-10">
                        <PDFViewerSkeleton />
                      </div>
                    )}
                    <iframe
                      src={`${getFileUrl(selectedTopic.pdfUrl)}#toolbar=0`}
                      className={`w-full h-full hidden sm:block transition-opacity duration-300 ${pdfLoaded ? 'opacity-100' : 'opacity-0'}`}
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(getFileUrl(selectedTopic.pdfUrl))}&embedded=true`}
                      className="w-full h-full sm:hidden"
                      title={selectedTopic.title}
                      onLoad={() => setPdfLoaded(true)}
                    />
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
  );
};

export default CourseTopics;
