import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import {
  FaRobot,
  FaMicrophone,
  FaStop,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaLock,
  FaArrowLeft,
  FaStar,
  FaVolumeUp,
  FaSpinner,
  FaVideo,
  FaExclamationTriangle,
  FaExpand,
  FaEye,
  FaShieldAlt,
} from 'react-icons/fa';

const INTERVIEW_DURATION = 40 * 60; // 40 minutes target duration
const MAX_WARNINGS = 10; // auto-end after this many

const AIInterview = () => {
  const { student } = useAuth();
  const [accessList, setAccessList] = useState([]);
  const [pastInterviews, setPastInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeInterview, setActiveInterview] = useState(null);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    fetchAccess();
  }, []);

  const fetchAccess = async () => {
    try {
      const { data } = await interviewAPI.getMyAccess();
      setAccessList(data.access || []);
      setPastInterviews(data.interviews || []);

      const inProgress = (data.interviews || []).find((i) => i.status === 'in_progress');
      if (inProgress) {
        resumeInterview(inProgress._id);
      }
    } catch {
      // No access
    } finally {
      setLoading(false);
    }
  };

  const resumeInterview = async (interviewId) => {
    try {
      const { data } = await interviewAPI.getInterview(interviewId);
      setActiveInterview({
        id: interviewId,
        skills: data.interview.skills,
        currentQuestion: data.interview.currentQuestion,
        maxQuestions: data.interview.maxQuestions,
        status: data.interview.status,
        report: data.report,
        lastAiMessage: data.interview.conversationHistory?.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '',
      });
    } catch {
      // Failed to resume
    }
  };

  const handleStartInterview = async (accessId) => {
    try {
      setLoading(true);
      const { data } = await interviewAPI.startInterview(accessId);
      setActiveInterview({
        id: data.interview._id,
        skills: data.interview.skills,
        currentQuestion: 0,
        maxQuestions: data.interview.maxQuestions,
        status: 'in_progress',
        report: null,
        lastAiMessage: data.aiMessage,
        initialAudio: data.audioBase64,
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (interviewId) => {
    try {
      const { data } = await interviewAPI.getInterview(interviewId);
      setViewingReport({
        interview: data.interview,
        report: data.report,
      });
    } catch {
      alert('Failed to load report');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (activeInterview) {
    if (activeInterview.status === 'completed' && activeInterview.report) {
      return (
        <ReportView
          report={activeInterview.report}
          skills={activeInterview.skills}
          onBack={() => {
            setActiveInterview(null);
            fetchAccess();
          }}
        />
      );
    }
    return (
      <InterviewRoom
        interview={activeInterview}
        setInterview={setActiveInterview}
        studentName={student?.name || 'Student'}
        onComplete={() => {
          setActiveInterview(null);
          fetchAccess();
        }}
      />
    );
  }

  if (viewingReport) {
    return (
      <ReportView
        report={viewingReport.report}
        skills={viewingReport.interview.skills}
        onBack={() => setViewingReport(null)}
      />
    );
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <FaRobot className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">AI Interview</h1>
            <p className="text-slate-500 text-sm">
              Real voice-based technical interview powered by AI
            </p>
          </div>
        </div>
      </div>

      {/* Available Access */}
      {accessList.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Available Interviews
          </h2>
          {accessList.map((access) => (
            <div
              key={access._id}
              className="bg-white rounded-2xl ring-1 ring-slate-200 p-5 hover:ring-indigo-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {access.skills.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Attempts: {access.attemptsUsed}/{access.maxAttempts}</span>
                    <span>Expires: {new Date(access.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartInterview(access._id)}
                  disabled={access.attemptsUsed >= access.maxAttempts}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <FaMicrophone className="text-xs" /> Start Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <FaLock className="text-slate-400 text-2xl" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Interview Access</h3>
          <p className="text-slate-500 text-sm">
            Your admin hasn't granted you interview access yet. Contact your admin to get started.
          </p>
        </div>
      )}

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Interview History
          </h2>
          {pastInterviews.map((interview) => (
            <div key={interview._id} className="bg-white rounded-2xl ring-1 ring-slate-200 p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                interview.status === 'completed' ? 'bg-green-50' : interview.status === 'in_progress' ? 'bg-yellow-50' : 'bg-slate-100'
              }`}>
                {interview.status === 'completed' ? (
                  <FaCheckCircle className="text-green-500" />
                ) : interview.status === 'in_progress' ? (
                  <FaClock className="text-yellow-500" />
                ) : (
                  <FaTimesCircle className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {interview.skills.map((s) => (
                    <span key={s} className="text-xs text-slate-500">{s}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  {interview.questionsAnswered}/{interview.maxQuestions} questions &bull;{' '}
                  {interview.startedAt ? new Date(interview.startedAt).toLocaleDateString() : 'Not started'}
                </p>
              </div>
              <div className="text-right">
                {interview.report && (
                  <p className="text-lg font-bold text-slate-800">{interview.report.overallScore}/10</p>
                )}
                {interview.status === 'completed' && (
                  <button onClick={() => handleViewReport(interview._id)} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    View Report
                  </button>
                )}
                {interview.status === 'in_progress' && (
                  <button onClick={() => resumeInterview(interview._id)} className="text-xs text-yellow-600 hover:text-yellow-800 font-medium">
                    Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================================================================== */
/*  VOICE INTERVIEW ROOM — Split Panel with Webcam & Proctoring       */
/* ================================================================== */
const InterviewRoom = ({ interview, setInterview, studentName, onComplete }) => {
  const [phase, setPhase] = useState('ai_speaking'); // ai_speaking | listening | recording | processing
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAiText, setCurrentAiText] = useState(interview.lastAiMessage || '');
  const [transcription, setTranscription] = useState('');
  const [lastScore, setLastScore] = useState(null);
  const [lastFeedback, setLastFeedback] = useState('');
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Proctoring state
  const [warnings, setWarnings] = useState([]);
  const [warningCounts, setWarningCounts] = useState({
    tabSwitch: 0,
    fullscreenExit: 0,
    faceNotDetected: 0,
    copyPaste: 0,
  });
  const [webcamReady, setWebcamReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState('');
  const [webcamError, setWebcamError] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const elapsedRef = useRef(null);
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const faceCheckIntervalRef = useRef(null);
  const containerRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const autoEndTriggeredRef = useRef(false);

  // Total warning count
  const totalWarnings = warningCounts.tabSwitch + warningCounts.fullscreenExit + warningCounts.faceNotDetected + warningCounts.copyPaste;

  // ─── Add a proctoring warning ───
  const addWarning = useCallback((type, message) => {
    const timestamp = new Date().toISOString();
    setWarnings((prev) => [...prev, { type, message, timestamp }]);
    setWarningCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    setShowWarningBanner(message);

    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => setShowWarningBanner(''), 4000);
  }, []);

  // ─── Auto-end if too many warnings ───
  useEffect(() => {
    if (totalWarnings >= MAX_WARNINGS && !autoEndTriggeredRef.current) {
      autoEndTriggeredRef.current = true;
      setShowWarningBanner('Interview terminated due to too many violations.');
    }
  }, [totalWarnings]);

  // ─── Session timer ───
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsedTime((p) => p + 1), 1000);
    return () => clearInterval(elapsedRef.current);
  }, []);

  // ─── Initialize webcam ───
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: 'user' },
        });
        webcamStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setWebcamReady(true);

        // Initialize face detector if available
        if ('FaceDetector' in window) {
          try {
            faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
          } catch {
            // FaceDetector not supported in this context
          }
        }
      } catch (err) {
        setWebcamError('Camera access denied. Please allow camera for proctoring.');
      }
    };

    initWebcam();

    return () => {
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ─── Face detection loop ───
  useEffect(() => {
    if (!webcamReady || !faceDetectorRef.current || !videoRef.current) return;

    let consecutiveMisses = 0;

    faceCheckIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;

      try {
        const faces = await faceDetectorRef.current.detect(videoRef.current);

        if (faces.length === 0) {
          consecutiveMisses++;
          if (consecutiveMisses >= 5) {
            setFaceDetected(false);
            addWarning('faceNotDetected', 'Face not detected. Please stay in front of the camera.');
            consecutiveMisses = 0;
          }
        } else if (faces.length > 1) {
          addWarning('faceNotDetected', 'Multiple faces detected. Only the candidate should be visible.');
          consecutiveMisses = 0;
          setFaceDetected(true);
        } else {
          consecutiveMisses = 0;
          setFaceDetected(true);
        }
      } catch {
        // Face detection failed silently
      }
    }, 2000);

    return () => clearInterval(faceCheckIntervalRef.current);
  }, [webcamReady, addWarning]);

  // ─── Request fullscreen on mount ───
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        const el = containerRef.current || document.documentElement;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch {
        // Fullscreen not supported or denied
      }
    };

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(requestFullscreen, 500);
    return () => clearTimeout(timeout);
  }, []);

  // ─── Fullscreen change detection ───
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        addWarning('fullscreenExit', 'Fullscreen exited. Please stay in fullscreen mode.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [addWarning]);

  // ─── Tab switch / visibility detection ───
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning('tabSwitch', 'Tab switch detected. Please stay on the interview tab.');
      }
    };

    const handleBlur = () => {
      addWarning('tabSwitch', 'Window focus lost. Please stay on the interview window.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [addWarning]);

  // ─── Block copy/paste/right-click ───
  useEffect(() => {
    const blockCopy = (e) => {
      e.preventDefault();
      addWarning('copyPaste', 'Copy attempt blocked.');
    };
    const blockPaste = (e) => {
      e.preventDefault();
      addWarning('copyPaste', 'Paste attempt blocked.');
    };
    const blockCut = (e) => {
      e.preventDefault();
      addWarning('copyPaste', 'Cut attempt blocked.');
    };
    const blockContextMenu = (e) => {
      e.preventDefault();
    };
    const blockKeyboard = (e) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+U, F12, Ctrl+Shift+I
      if (
        (e.ctrlKey && ['c', 'v', 'x', 'a', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
      ) {
        e.preventDefault();
        addWarning('copyPaste', 'Keyboard shortcut blocked during interview.');
      }
    };

    document.addEventListener('copy', blockCopy);
    document.addEventListener('paste', blockPaste);
    document.addEventListener('cut', blockCut);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeyboard);
    return () => {
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('paste', blockPaste);
      document.removeEventListener('cut', blockCut);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyboard);
    };
  }, [addWarning]);

  // ─── Play initial TTS audio ───
  useEffect(() => {
    if (interview.initialAudio) {
      playAudio(interview.initialAudio);
    } else {
      setPhase('listening');
    }
  }, []);

  const playAudio = useCallback((base64Audio) => {
    setPhase('ai_speaking');
    try {
      const audioBytes = atob(base64Audio);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      const blob = new Blob([audioArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setPhase('listening');
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setPhase('listening');
      };

      audio.play().catch(() => {
        setPhase('listening');
      });
    } catch {
      setPhase('listening');
    }
  }, []);

  // ─── Build proctoring summary ───
  const getProctoringData = useCallback(() => ({
    warnings,
    tabSwitchCount: warningCounts.tabSwitch,
    fullscreenExitCount: warningCounts.fullscreenExit,
    faceNotDetectedCount: warningCounts.faceNotDetected,
    copyPasteAttempts: warningCounts.copyPaste,
    totalWarnings: warnings.length,
    interviewDuration: elapsedTime,
    autoTerminated: autoEndTriggeredRef.current,
  }), [warnings, warningCounts, elapsedTime]);

  const startRecording = async () => {
    try {
      setError('');
      setTranscription('');

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
      setPhase('recording');
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;

    clearInterval(timerRef.current);
    setIsRecording(false);
    setPhase('processing');

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        if (audioBlob.size < 1000) {
          setError('Recording too short. Please speak your answer clearly.');
          setPhase('listening');
          resolve();
          return;
        }

        try {
          const { data } = await interviewAPI.sendVoice(interview.id, audioBlob, elapsedTime);

          setTranscription(data.transcription || '');
          setLastScore(data.score);
          setLastFeedback(data.feedback || '');
          setCurrentAiText(data.aiMessage);

          setInterview((prev) => ({
            ...prev,
            currentQuestion: data.questionIndex,
            status: data.completed ? 'completed' : 'in_progress',
          }));

          if (data.completed) {
            // Send proctoring data on completion
            try {
              await interviewAPI.sendProctoring(interview.id, getProctoringData());
            } catch {}

            setPhase('ai_speaking');
            if (data.audioBase64) {
              playCompletionAudio(data.audioBase64);
            } else {
              setTimeout(async () => {
                try {
                  const res = await interviewAPI.getInterview(interview.id);
                  if (res.data.report) {
                    setInterview((prev) => ({ ...prev, report: res.data.report }));
                  }
                } catch {}
              }, 3000);
            }
          } else if (data.audioBase64) {
            playAudio(data.audioBase64);
          } else {
            setPhase('listening');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to process your answer. Please try again.');
          setPhase('listening');
        }

        resolve();
      };

      mediaRecorderRef.current.stop();
    });
  };

  const playCompletionAudio = (base64Audio) => {
    try {
      const audioBytes = atob(base64Audio);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }
      const blob = new Blob([audioArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        setTimeout(async () => {
          try {
            const res = await interviewAPI.getInterview(interview.id);
            if (res.data.report) {
              setInterview((prev) => ({ ...prev, report: res.data.report }));
            }
          } catch {}
        }, 3000);
      };

      audio.play().catch(() => {});
    } catch {}
  };

  // Re-enter fullscreen
  const enterFullscreen = async () => {
    try {
      const el = containerRef.current || document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    } catch {}
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(elapsedRef.current);
      clearInterval(faceCheckIntervalRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
      // Exit fullscreen on unmount
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = Math.round((interview.currentQuestion / interview.maxQuestions) * 100);

  // Sound wave bars for AI speaking animation
  const SoundWave = ({ active, color = 'bg-white' }) => (
    <div className="flex items-center gap-[3px] h-8">
      {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full ${color} transition-all duration-150 ${
            active ? 'animate-pulse' : 'opacity-30'
          }`}
          style={{
            height: active ? `${h * 6 + Math.random() * 4}px` : '4px',
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );

  // Interview completed overlay
  if (interview.status === 'completed') {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Interview Complete!</h3>
          <p className="text-slate-500 mb-6">Your performance report is being generated...</p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-4">
            <FaClock className="text-xs" />
            <span>Duration: {formatTime(elapsedTime)}</span>
            <span className="mx-2">|</span>
            <span>{interview.maxQuestions} questions answered</span>
          </div>
          {totalWarnings > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-orange-500 mb-4">
              <FaExclamationTriangle className="text-xs" />
              <span>{totalWarnings} proctoring warning{totalWarnings > 1 ? 's' : ''} recorded</span>
            </div>
          )}
          <button
            onClick={onComplete}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-indigo-500/25"
          >
            View Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-slate-950 z-40 flex flex-col select-none">
      {/* ── Warning Banner ── */}
      {showWarningBanner && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/30 text-sm font-medium">
            <FaExclamationTriangle className="text-xs flex-shrink-0" />
            <span>{showWarningBanner}</span>
          </div>
        </div>
      )}

      {/* ── Auto-end overlay (too many proctoring violations) ── */}
      {autoEndTriggeredRef.current && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <FaExclamationTriangle className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Interview Terminated</h3>
            <p className="text-slate-500 mb-4">
              Too many proctoring violations detected ({totalWarnings}/{MAX_WARNINGS}).
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Your responses up to this point have been saved and will be evaluated.
            </p>
            <button
              onClick={async () => {
                try {
                  await interviewAPI.completeInterview(interview.id, getProctoringData());
                } catch {}
                onComplete();
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium"
            >
              Exit Interview
            </button>
          </div>
        </div>
      )}

      {/* ── Top Navigation Bar ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (!confirm('Are you sure you want to exit? Your interview will be completed and report will be generated with the questions answered so far.')) return;
              try {
                await interviewAPI.completeInterview(interview.id, getProctoringData());
              } catch {}
              onComplete();
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <FaArrowLeft className="text-xs" /> Exit
          </button>
          <div className="hidden sm:block w-px h-5 bg-slate-700" />
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Live Interview</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Session Timer */}
          <div className={`flex items-center gap-1.5 ${elapsedTime >= INTERVIEW_DURATION - 300 ? 'text-amber-400' : 'text-slate-400'}`}>
            <FaClock className="text-[10px]" />
            <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              {interview.currentQuestion + 1}/{interview.maxQuestions}
            </span>
            <div className="w-20 sm:w-28 bg-slate-800 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Warning count badge */}
          {totalWarnings > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 rounded-full">
              <FaExclamationTriangle className="text-[9px] text-red-400" />
              <span className="text-[11px] text-red-400 font-medium">{totalWarnings}</span>
            </div>
          )}

          {/* Proctoring indicators */}
          <div className="hidden sm:flex items-center gap-2">
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
              webcamReady ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <FaVideo className="text-[8px]" />
            </div>
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
              faceDetected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <FaEye className="text-[8px]" />
            </div>
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                title="Re-enter fullscreen"
              >
                <FaExpand className="text-[8px]" />
              </button>
            )}
          </div>

          <div className="hidden sm:flex gap-1">
            {interview.skills.slice(0, 2).map((s) => (
              <span key={s} className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px]">{s}</span>
            ))}
            {interview.skills.length > 2 && (
              <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[10px]">
                +{interview.skills.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Split Panel ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ──────── LEFT: AI Interviewer Panel ──────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Subtle grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* AI Status Label */}
          <div className="mb-6 z-10">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              phase === 'ai_speaking'
                ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/30'
                : phase === 'processing'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30'
                : 'bg-slate-700/50 text-slate-400 ring-1 ring-slate-600/30'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                phase === 'ai_speaking' ? 'bg-indigo-400 animate-pulse' :
                phase === 'processing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`} />
              {phase === 'ai_speaking' && 'Speaking'}
              {phase === 'listening' && 'Waiting for your answer'}
              {phase === 'recording' && 'Listening'}
              {phase === 'processing' && 'Analyzing'}
            </span>
          </div>

          {/* AI Avatar with Glow */}
          <div className="relative mb-8 z-10">
            {/* Outer glow ring */}
            <div className={`absolute -inset-4 rounded-full transition-all duration-700 ${
              phase === 'ai_speaking'
                ? 'bg-indigo-500/20 shadow-[0_0_60px_20px_rgba(99,102,241,0.15)]'
                : phase === 'processing'
                ? 'bg-amber-500/20 shadow-[0_0_60px_20px_rgba(245,158,11,0.15)]'
                : 'bg-transparent'
            }`} />
            {/* Avatar circle */}
            <div className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center transition-all duration-500 ${
              phase === 'ai_speaking'
                ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 shadow-2xl shadow-indigo-500/30'
                : phase === 'processing'
                ? 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30'
                : 'bg-gradient-to-br from-slate-700 to-slate-800 shadow-xl'
            }`}>
              {/* Inner ring */}
              <div className="absolute inset-1 rounded-full border border-white/10" />
              {phase === 'processing' ? (
                <FaSpinner className="text-white text-4xl animate-spin" />
              ) : phase === 'ai_speaking' ? (
                <SoundWave active={true} />
              ) : (
                <FaRobot className="text-white/90 text-4xl" />
              )}
            </div>
          </div>

          {/* AI Name */}
          <h3 className="text-white font-semibold text-lg mb-1 z-10">AI Interviewer</h3>
          <p className="text-slate-500 text-xs mb-6 z-10">Technical Interview Session</p>

          {/* AI Question Bubble */}
          <div className="w-full max-w-lg z-10">
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 ring-1 ring-slate-700/50">
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">{currentAiText}</p>
            </div>
          </div>
        </div>

        {/* ──────── Divider ──────── */}
        <div className="hidden lg:flex w-px bg-slate-800 relative">
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center">
            <span className="text-slate-500 text-[10px] font-bold">VS</span>
          </div>
        </div>
        {/* Mobile divider */}
        <div className="lg:hidden h-px bg-slate-800" />

        {/* ──────── RIGHT: Student Panel with Webcam ──────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-b from-slate-950 to-[#0c0f1a]">

          {/* Webcam Feed (replaces static avatar) */}
          <div className="mb-4 relative">
            <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 transition-all duration-500 ${
              phase === 'recording'
                ? 'ring-red-500 shadow-2xl shadow-red-500/30'
                : phase === 'listening'
                ? 'ring-emerald-500 shadow-xl shadow-emerald-500/20'
                : 'ring-slate-700'
            }`}>
              {webcamReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                  {webcamError ? (
                    <FaTimesCircle className="text-red-400 text-2xl" />
                  ) : (
                    <span className="text-white text-3xl font-bold uppercase">
                      {studentName.charAt(0)}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Face detection indicator on webcam */}
            {webcamReady && (
              <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                faceDetected ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white animate-pulse'
              }`}>
                <FaEye className="text-[8px]" />
                {faceDetected ? 'Face OK' : 'No Face'}
              </div>
            )}

            {/* Recording pulse rings around webcam */}
            {phase === 'recording' && (
              <>
                <div className="absolute -inset-2 rounded-full border-2 border-red-500/30 animate-ping" />
                <div className="absolute -inset-4 rounded-full border border-red-500/15 animate-ping" style={{ animationDelay: '300ms' }} />
              </>
            )}
          </div>

          {/* Webcam error */}
          {webcamError && (
            <p className="text-red-400 text-xs mb-2 text-center">{webcamError}</p>
          )}

          <h3 className="text-white font-semibold text-lg mb-1">{studentName}</h3>
          <p className="text-slate-500 text-xs mb-6">Candidate</p>

          {/* Microphone Controls */}
          <div className="flex flex-col items-center mb-6">
            {phase === 'listening' && (
              <>
                <button
                  onClick={startRecording}
                  className="group w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all active:scale-95"
                >
                  <FaMicrophone className="text-2xl group-hover:scale-110 transition-transform" />
                </button>
                <p className="text-slate-500 text-xs mt-4">Click to start speaking</p>
              </>
            )}

            {phase === 'recording' && (
              <div className="flex flex-col items-center">
                <button
                  onClick={stopRecording}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
                >
                  <FaStop className="text-xl" />
                </button>
                <div className="flex items-center gap-2 mt-5">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono text-red-400">{formatTime(recordingTime)}</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">Click to stop</p>
              </div>
            )}

            {phase === 'processing' && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center">
                  <FaSpinner className="text-xl text-slate-400 animate-spin" />
                </div>
                <p className="text-slate-500 text-xs mt-4">Processing your answer...</p>
              </div>
            )}

            {phase === 'ai_speaking' && (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-slate-800 ring-1 ring-slate-700 flex items-center justify-center">
                  <FaMicrophone className="text-xl text-slate-600" />
                </div>
                <p className="text-slate-500 text-xs mt-4">Wait for the question...</p>
              </div>
            )}
          </div>

          {/* Transcription & Score */}
          {transcription && (
            <div className="w-full max-w-lg">
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 ring-1 ring-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Your Answer</span>
                  {lastScore !== null && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      lastScore >= 7 ? 'bg-green-500/20 text-green-400' :
                      lastScore >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {lastScore}/10
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{transcription}</p>
                {lastFeedback && (
                  <p className="text-slate-500 text-xs mt-2 italic">{lastFeedback}</p>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="w-full max-w-lg mt-4">
              <div className="bg-red-500/10 rounded-xl ring-1 ring-red-500/20 p-3 text-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 backdrop-blur border-t border-slate-800">
        <div className="flex items-center gap-2">
          <FaShieldAlt className={`text-[10px] ${totalWarnings === 0 ? 'text-green-400' : 'text-yellow-400'}`} />
          <span className="text-[11px] text-slate-500">
            Proctored
            {totalWarnings > 0 && (
              <span className="text-yellow-400 ml-1">({totalWarnings} warning{totalWarnings > 1 ? 's' : ''})</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span className="flex items-center gap-1.5">
            <FaMicrophone className="text-[9px]" /> Voice Interview
          </span>
          <span className="w-px h-3 bg-slate-700" />
          <span>Question {interview.currentQuestion + 1} of {interview.maxQuestions}</span>
          <span className="w-px h-3 bg-slate-700" />
          <span className="flex items-center gap-1">
            {interview.skills.slice(0, 3).join(' / ')}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/*  REPORT VIEW                                                       */
/* ================================================================== */
const ReportView = ({ report, skills, onBack }) => {
  if (!report) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 text-sm">
          <FaArrowLeft /> Back
        </button>
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-10 text-center">
          <FaClock className="text-4xl text-slate-400 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 mb-1">Report Generating...</h3>
          <p className="text-sm text-slate-500">Your report is being prepared. Check back in a moment.</p>
        </div>
      </div>
    );
  }

  const scoreColor = report.overallScore >= 7 ? 'text-green-600' : report.overallScore >= 5 ? 'text-yellow-600' : 'text-red-600';

  const recColors = {
    STRONG_HIRE: 'bg-green-100 text-green-700',
    HIRE: 'bg-emerald-100 text-emerald-700',
    MAYBE: 'bg-yellow-100 text-yellow-700',
    NO_HIRE: 'bg-orange-100 text-orange-700',
    STRONG_NO_HIRE: 'bg-red-100 text-red-700',
  };

  const recLabels = {
    STRONG_HIRE: 'Strong Hire',
    HIRE: 'Hire',
    MAYBE: 'Maybe',
    NO_HIRE: 'No Hire',
    STRONG_NO_HIRE: 'Strong No Hire',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm">
        <FaArrowLeft /> Back to Interviews
      </button>

      <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-center">
        <p className={`text-5xl font-bold ${scoreColor}`}>{report.overallScore}</p>
        <p className="text-slate-500 text-sm">/10 Overall Score</p>
        <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-medium ${recColors[report.recommendation] || 'bg-slate-100 text-slate-600'}`}>
          {recLabels[report.recommendation] || report.recommendation}
        </span>
      </div>

      {report.skillScores && Object.keys(report.skillScores).length > 0 && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Skill Scores</h3>
          <div className="space-y-3">
            {Object.entries(report.skillScores).map(([skill, score]) => (
              <div key={skill} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 w-28 truncate">{skill}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(score / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">{score}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {report.strengths?.length > 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
              <FaCheckCircle /> Strengths
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <FaStar className="text-green-500 mt-0.5 text-xs flex-shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {report.weaknesses?.length > 0 && (
          <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <FaTimesCircle /> Areas to Improve
            </h3>
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                  <FaTimesCircle className="text-orange-500 mt-0.5 text-xs flex-shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {report.detailedFeedback && (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3">Detailed Feedback</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{report.detailedFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default AIInterview;
