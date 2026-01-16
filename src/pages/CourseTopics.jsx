import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FaPlay, FaFileAlt, FaQuestion, FaCheck, FaBars, FaBook, FaLaptopCode,
  FaDownload, FaExpand, FaCompress, FaExternalLinkAlt
} from 'react-icons/fa';
import TopicSidebar from '../components/Courses/TopicSidebar';
import CodingPlayground from '../components/Courses/CodingPlayground';
import { courseAPI } from '../services/api';

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
      const [courseRes, topicsRes] = await Promise.all([
        courseAPI.getById(courseId),
        courseAPI.getTopics(courseId)
      ]);
      setCourse(courseRes.data);
      setTopics(topicsRes.data);
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
      setShowCodingPlayground(false);
      setPdfFullscreen(false);
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

  const checkAnswers = () => {
    setShowResults(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-dark-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-dark-muted">Loading course...</p>
        </div>
      </div>
    );
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
        onClose={handleCloseCodingPlayground}
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
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4">
        {selectedTopic ? (
          <div className="h-full">
            {/* Video Content */}
            {activeTab === 'video' && (
              <div className="h-[calc(100vh-5rem)]">
                {selectedTopic.videoUrl ? (
                  <iframe
                    src={getYouTubeEmbedUrl(selectedTopic.videoUrl)}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedTopic.title}
                  />
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
                {selectedTopic.pdfUrl ? (
                  <>
                    {/* PDF Toolbar */}
                    <div className={`flex items-center justify-between px-4 py-2 bg-dark-card border-b border-dark-secondary shrink-0 ${pdfFullscreen ? '' : 'rounded-t-lg'}`}>
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-red-500 text-lg" />
                        <div>
                          <span className="text-sm font-medium text-white">{selectedTopic.title}</span>
                          <span className="text-xs text-dark-muted ml-2 px-2 py-0.5 bg-dark-secondary rounded">PDF</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Open in New Tab - For full browser PDF viewer with all controls */}
                        <a
                          href={`http://localhost:5000${selectedTopic.pdfUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white text-sm font-medium"
                          title="Open in New Tab (Full PDF Viewer)"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          Open in New Tab
                        </a>

                        {/* Download */}
                        <a
                          href={`http://localhost:5000${selectedTopic.pdfUrl}`}
                          download={`${selectedTopic.title}.pdf`}
                          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-white text-sm font-medium"
                          title="Download PDF"
                        >
                          <FaDownload className="text-xs" />
                          Download
                        </a>

                        {/* Fullscreen Toggle */}
                        <button
                          onClick={() => setPdfFullscreen(!pdfFullscreen)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            pdfFullscreen
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-dark-secondary hover:bg-dark-secondary/80 text-white'
                          }`}
                          title={pdfFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                          {pdfFullscreen ? <FaCompress className="text-xs" /> : <FaExpand className="text-xs" />}
                          {pdfFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                      </div>
                    </div>

                    {/* PDF Viewer - Using embed for better native browser support */}
                    <div className={`flex-1 ${pdfFullscreen ? '' : 'rounded-b-lg overflow-hidden'}`}>
                      <embed
                        src={`http://localhost:5000${selectedTopic.pdfUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                        type="application/pdf"
                        className="w-full h-full"
                        style={{
                          height: pdfFullscreen ? 'calc(100vh - 52px)' : '100%',
                          minHeight: pdfFullscreen ? 'calc(100vh - 52px)' : 'calc(100vh - 8rem)'
                        }}
                      />
                    </div>

                    {/* Hint text */}
                    {!pdfFullscreen && (
                      <div className="text-center py-2 text-xs text-dark-muted bg-dark-card rounded-b-lg border-t border-dark-secondary">
                        Use the PDF toolbar above to zoom, navigate pages, and search. Click "Open in New Tab" for full browser PDF viewer.
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
                {selectedTopic.practice && selectedTopic.practice.length > 0 ? (
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
                    <div className="flex justify-end gap-4 pt-4">
                      {showResults ? (
                        <button
                          onClick={() => { setSelectedAnswers({}); setShowResults(false); }}
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
                <div className="w-full h-full flex items-center justify-center text-dark-muted bg-dark-card rounded-lg">
                  <div className="text-center">
                    <FaLaptopCode className="text-6xl mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Coding practice coming soon</p>
                  </div>
                </div>
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
