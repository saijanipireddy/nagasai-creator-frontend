import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import {
  FaLightbulb, FaPlay, FaRedo, FaTimes, FaChevronDown, FaChevronUp,
  FaCheck, FaCopy, FaImage, FaExpand, FaLink, FaHtml5, FaCss3Alt, FaJs,
  FaPython, FaDatabase, FaDownload, FaSun, FaMoon, FaCompress, FaCode, FaTerminal, FaFileAlt
} from 'react-icons/fa';
import { BACKEND_URL, getFileUrl, scoreAPI } from '../../services/api';

// Language configurations
const LANGUAGE_CONFIG = {
  html: { name: 'HTML', icon: FaHtml5, color: '#e34c26', type: 'web' },
  css: { name: 'CSS', icon: FaCss3Alt, color: '#264de4', type: 'web' },
  javascript: { name: 'JavaScript', icon: FaJs, color: '#f7df1e', type: 'web' },
  python: { name: 'Python', icon: FaPython, color: '#3776ab', type: 'piston', pistonLang: 'python', pistonVersion: '3.10.0' },
  java: { name: 'Java', icon: FaCode, color: '#007396', type: 'piston', pistonLang: 'java', pistonVersion: '15.0.2' },
  cpp: { name: 'C++', icon: FaCode, color: '#00599C', type: 'piston', pistonLang: 'c++', pistonVersion: '10.2.0' },
  c: { name: 'C', icon: FaCode, color: '#A8B9CC', type: 'piston', pistonLang: 'c', pistonVersion: '10.2.0' },
  typescript: { name: 'TypeScript', icon: FaCode, color: '#3178c6', type: 'piston', pistonLang: 'typescript', pistonVersion: '5.0.3' },
  sql: { name: 'SQL', icon: FaDatabase, color: '#00758f', type: 'none' },
  php: { name: 'PHP', icon: FaCode, color: '#777BB4', type: 'piston', pistonLang: 'php', pistonVersion: '8.2.3' },
  ruby: { name: 'Ruby', icon: FaCode, color: '#CC342D', type: 'piston', pistonLang: 'ruby', pistonVersion: '3.0.1' },
  go: { name: 'Go', icon: FaCode, color: '#00ADD8', type: 'piston', pistonLang: 'go', pistonVersion: '1.16.2' },
  rust: { name: 'Rust', icon: FaCode, color: '#000000', type: 'piston', pistonLang: 'rust', pistonVersion: '1.68.2' },
  kotlin: { name: 'Kotlin', icon: FaCode, color: '#7F52FF', type: 'piston', pistonLang: 'kotlin', pistonVersion: '1.8.20' },
  swift: { name: 'Swift', icon: FaCode, color: '#FA7343', type: 'piston', pistonLang: 'swift', pistonVersion: '5.3.3' }
};

// Default HTML template
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>

  </head>
  <body>

  </body>
</html>`;

// Function to render description with highlight support
const renderDescription = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|==.*?==|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    } else if (part.startsWith('==') && part.endsWith('==')) {
      return <mark key={index} className="bg-yellow-500/30 text-yellow-300 px-1 rounded">{part.slice(2, -2)}</mark>;
    } else if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="bg-[#0f3460] px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const CodingPlayground = ({ codingPractice, topicId, onClose, onComplete }) => {
  // Determine language and type
  const language = codingPractice?.language || 'javascript';
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.javascript;
  const isWebPlayground = ['html', 'css', 'javascript'].includes(language);

  // Web editor states
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState('');
  const [webJs, setWebJs] = useState('');
  const [activeWebTab, setActiveWebTab] = useState('html');

  // Single editor state (for non-web languages)
  const [code, setCode] = useState('');

  // Output states
  const [output, setOutput] = useState('');
  const [webPreview, setWebPreview] = useState('');
  const [consoleOutput, setConsoleOutput] = useState([]);

  // UI states
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [imageExpanded, setImageExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProblem, setShowProblem] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activePanel, setActivePanel] = useState('editor'); // 'problem', 'editor', 'output' for mobile
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'pass' | 'fail'
  const [submitting, setSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testResults, setTestResults] = useState(null); // For web: array of 'PASS'/'FAIL:...'
  const [submitDetails, setSubmitDetails] = useState(null); // Server response details
  const [previousSubmission, setPreviousSubmission] = useState(null); // Loaded from DB
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const iframeRef = useRef(null);
  const testResultsRef = useRef(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch existing submission on mount
  useEffect(() => {
    if (!topicId) {
      setLoadingSubmission(false);
      return;
    }
    const fetchSubmission = async () => {
      try {
        const { data } = await scoreAPI.getCodingSubmission(topicId);
        if (data.submission) {
          setPreviousSubmission(data.submission);
          setSubmitStatus(data.submission.passed ? 'pass' : 'fail');
        }
      } catch {
        // No previous submission
      } finally {
        setLoadingSubmission(false);
      }
    };
    fetchSubmission();
  }, [topicId]);

  // Initialize code from previous submission or starter code
  useEffect(() => {
    if (loadingSubmission) return;

    // Use previous submission code if available, otherwise starter code
    const savedCode = previousSubmission?.code || '';
    const starterCode = codingPractice?.starterCode || '';
    const initialCode = savedCode || starterCode;

    if (isWebPlayground) {
      if (initialCode.includes('<style>') || initialCode.includes('<script>')) {
        let extractedHtml = initialCode;
        let extractedCss = '';
        let extractedJs = '';

        const styleMatch = initialCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) {
          extractedCss = styleMatch[1].trim();
          extractedHtml = extractedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        }

        const scriptMatch = initialCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
          extractedJs = scriptMatch[1].trim();
          extractedHtml = extractedHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        }

        extractedHtml = extractedHtml.trim();
        if (!extractedHtml.includes('<!DOCTYPE')) {
          extractedHtml = DEFAULT_HTML;
        }

        setHtml(extractedHtml);
        setCss(extractedCss);
        setWebJs(extractedJs);
      } else {
        if (language === 'html') {
          setHtml(initialCode || DEFAULT_HTML);
          setCss('');
          setWebJs('');
        } else if (language === 'css') {
          setHtml(DEFAULT_HTML);
          setCss(initialCode || '');
          setWebJs('');
        } else {
          setHtml(DEFAULT_HTML);
          setCss('');
          setWebJs(initialCode || '');
        }
      }
      setActiveWebTab(language === 'css' ? 'css' : language === 'javascript' ? 'js' : 'html');
    } else {
      setCode(initialCode);
    }

    // If previous submission exists, pre-fill output
    if (previousSubmission?.output) {
      setOutput(previousSubmission.output);
    } else {
      setOutput('');
    }

    setWebPreview('');
    setConsoleOutput([]);
    setShowHints(false);
    setCurrentHintIndex(0);
    setShowResults(false);
    testResultsRef.current = null;
  }, [codingPractice, isWebPlayground, language, loadingSubmission]);

  // Handle console messages from iframe (including test results)
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'console') {
        const msg = event.data.args.join(' ');
        // Intercept TEST_RESULTS from testScript
        if (msg.startsWith('TEST_RESULTS:')) {
          try {
            const results = JSON.parse(msg.slice('TEST_RESULTS:'.length));
            setTestResults(results);
            testResultsRef.current = results;
          } catch (e) { /* ignore parse errors */ }
          return; // Don't show test results in console
        }
        setConsoleOutput(prev => [...prev, {
          level: event.data.level,
          message: msg
        }]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Generate web preview
  const getWebPreview = useCallback(() => {
    let bodyContent = html;
    if (html.includes('<body>')) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      bodyContent = bodyMatch ? bodyMatch[1] : html;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
  ${bodyContent}
  <script>
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    console.log = (...args) => {
      window.parent.postMessage({ type: 'console', level: 'log', args: args.map(String) }, '*');
      originalLog.apply(console, args);
    };
    console.error = (...args) => {
      window.parent.postMessage({ type: 'console', level: 'error', args: args.map(String) }, '*');
      originalError.apply(console, args);
    };
    console.warn = (...args) => {
      window.parent.postMessage({ type: 'console', level: 'warn', args: args.map(String) }, '*');
      originalWarn.apply(console, args);
    };
    try {
      ${webJs}
    } catch (e) {
      console.error('Error:', e.message);
    }
    // Run test script if provided (after a small delay for DOM to settle)
    ${codingPractice?.testScript ? `
    setTimeout(() => {
      try {
        ${codingPractice.testScript}
      } catch(e) {
        console.log('TEST_RESULTS:' + JSON.stringify(['FAIL: Test script error: ' + e.message]));
      }
    }, 500);
    ` : ''}
  <\/script>
</body>
</html>`;
  }, [html, css, webJs, codingPractice?.testScript]);

  // Execute code using Piston API
  const executePistonCode = async (sourceCode, lang, version) => {
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          version: version,
          files: [{ content: sourceCode }]
        })
      });

      if (!response.ok) throw new Error('Failed to execute code');
      const data = await response.json();

      if (data.run) {
        const output = data.run.output || data.run.stdout || '';
        const error = data.run.stderr || '';
        if (error && !output) return { success: false, output: error };
        return { success: true, output: output || error || 'Code executed successfully (no output)' };
      }
      return { success: false, output: 'No output received' };
    } catch (error) {
      return { success: false, output: `Execution Error: ${error.message}` };
    }
  };

  // Run code
  const runCode = async () => {
    setIsRunning(true);

    if (isWebPlayground) {
      setConsoleOutput([]);
      setTestResults(null);
      setWebPreview(getWebPreview());
    } else if (langConfig.type === 'piston') {
      const result = await executePistonCode(code, langConfig.pistonLang, langConfig.pistonVersion);
      setOutput(result.output);
    } else {
      setOutput('Code execution not supported for this language yet.');
    }

    setIsRunning(false);
    setHasRun(true);
  };

  // Submit coding challenge (server-side validated)
  const handleSubmitCode = async () => {
    if (!topicId) return;
    setSubmitting(true);
    setSubmitDetails(null);
    setShowResults(false);

    try {
      // For web challenges with testScript: auto-run to get test results
      if (isWebPlayground && codingPractice?.testScript) {
        testResultsRef.current = null;
        setConsoleOutput([]);
        setTestResults(null);
        setWebPreview(getWebPreview());
        setHasRun(true);

        // Wait for test results from iframe (max 3 seconds)
        await new Promise((resolve) => {
          let elapsed = 0;
          const interval = setInterval(() => {
            elapsed += 100;
            if (testResultsRef.current || elapsed >= 3000) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      } else if (isWebPlayground && !hasRun) {
        // Web without testScript: just run to show preview
        setConsoleOutput([]);
        setWebPreview(getWebPreview());
        setHasRun(true);
      }

      const payload = {
        topicId,
        code: isWebPlayground ? `<!-- HTML -->\n${html}\n\n<style>\n${css}\n</style>\n\n<script>\n${webJs}\n</script>` : code,
        language,
      };

      // Include test results if available
      if (isWebPlayground && (testResultsRef.current || testResults)) {
        payload.testResults = testResultsRef.current || testResults;
      }

      const { data } = await scoreAPI.submitCodingChallenge(payload);
      const passed = data.passed;

      setSubmitStatus(passed ? 'pass' : 'fail');
      setSubmitDetails(data.results || []);
      setShowResults(true);

      if (passed && onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Failed to submit coding challenge:', err);
      setSubmitStatus('fail');
      setShowResults(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Show results panel if already submitted, otherwise submit
  const handleSubmitOrShowResults = () => {
    if (submitStatus && submitDetails) {
      setShowResults(true);
    } else {
      handleSubmitCode();
    }
  };

  // Reset code
  const resetCode = () => {
    const starterCode = codingPractice?.starterCode || '';

    if (isWebPlayground) {
      if (starterCode.includes('<style>') || starterCode.includes('<script>')) {
        let extractedHtml = starterCode;
        let extractedCss = '';
        let extractedJs = '';

        const styleMatch = starterCode.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) {
          extractedCss = styleMatch[1].trim();
          extractedHtml = extractedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
        }

        const scriptMatch = starterCode.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
          extractedJs = scriptMatch[1].trim();
          extractedHtml = extractedHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        }

        extractedHtml = extractedHtml.trim();
        if (!extractedHtml.includes('<!DOCTYPE')) extractedHtml = DEFAULT_HTML;

        setHtml(extractedHtml);
        setCss(extractedCss);
        setWebJs(extractedJs);
      } else {
        if (language === 'html') {
          setHtml(starterCode || DEFAULT_HTML);
          setCss('');
          setWebJs('');
        } else if (language === 'css') {
          setHtml(DEFAULT_HTML);
          setCss(starterCode || '');
          setWebJs('');
        } else {
          setHtml(DEFAULT_HTML);
          setCss('');
          setWebJs(starterCode || '');
        }
      }
      setWebPreview('');
      setConsoleOutput([]);
    } else {
      setCode(starterCode);
      setOutput('');
    }
    setSubmitStatus(null);
    setSubmitDetails(null);
    setTestResults(null);
    setShowResults(false);
    testResultsRef.current = null;
    setHasRun(false);
  };

  // Copy code
  const handleCopyCode = () => {
    if (isWebPlayground) {
      const combinedCode = `<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JavaScript\n${webJs}`;
      navigator.clipboard.writeText(combinedCode);
    } else {
      navigator.clipboard.writeText(code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyImageLink = (url, index) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(index);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Monaco editor options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    padding: { top: 10 }
  };

  // Get current code and setter for web tabs
  const getCurrentCode = () => {
    if (activeWebTab === 'html') return html;
    if (activeWebTab === 'css') return css;
    return webJs;
  };

  const setCurrentCode = (value) => {
    if (activeWebTab === 'html') setHtml(value);
    else if (activeWebTab === 'css') setCss(value);
    else setWebJs(value);
  };

  const getEditorLanguage = () => {
    if (isWebPlayground) {
      if (activeWebTab === 'html') return 'html';
      if (activeWebTab === 'css') return 'css';
      return 'javascript';
    }
    if (language === 'cpp' || language === 'c') return 'cpp';
    return language;
  };

  const theme = isDarkMode ? 'vs-dark' : 'light';
  const hasConsole = isWebPlayground && consoleOutput.length > 0;

  if (loadingSubmission) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#e94560] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!codingPractice?.title) {
    return (
      <div className="fixed inset-0 bg-[#0f0f0f] z-50 flex items-center justify-center">
        <div className="text-center text-[#a0a0a0]">
          <p className="text-xl mb-4">No coding practice available</p>
          <button onClick={onClose} className="px-4 py-2 bg-[#e94560] rounded-lg hover:bg-[#e94560]/80">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'}`}>
      {/* Header - Desktop */}
      <div className={`hidden md:flex items-center justify-between px-4 py-2 border-b shrink-0 ${isDarkMode ? 'bg-[#1a1a2e] border-[#0f3460]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0] hover:text-white' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <FaTimes />
          </button>
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{codingPractice.title}</h1>
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">
            {isWebPlayground ? 'Web' : langConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProblem(!showProblem)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${showProblem ? 'bg-[#e94560] text-white' : isDarkMode ? 'bg-[#0f3460] text-[#a0a0a0]' : 'bg-gray-200 text-gray-600'}`}
          >
            {showProblem ? 'Hide Problem' : 'Show Problem'}
          </button>

          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            <FaPlay className={`text-xs ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="text-sm font-medium">{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          {topicId && (
            <button
              onClick={handleSubmitOrShowResults}
              disabled={submitting}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors text-white text-sm font-medium ${
                submitStatus === 'pass' ? 'bg-green-600 hover:bg-green-700' :
                submitStatus === 'fail' ? 'bg-orange-500 hover:bg-orange-600' :
                submitting ? 'bg-gray-500 cursor-not-allowed' :
                'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {submitStatus === 'pass' ? <><FaCheck className="text-xs" /> Passed</> :
               submitStatus === 'fail' ? <><FaTimes className="text-xs" /> Results</> :
               submitting ? 'Submitting...' : 'Submit'}
            </button>
          )}

          <button
            onClick={resetCode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Reset Code"
          >
            <FaRedo className="text-sm" />
          </button>

          <button
            onClick={handleCopyCode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Copy Code"
          >
            {copied ? <FaCheck className="text-sm text-green-500" /> : <FaCopy className="text-sm" />}
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className={`md:hidden flex items-center justify-between px-3 py-2 border-b shrink-0 ${isDarkMode ? 'bg-[#1a1a2e] border-[#0f3460]' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <FaTimes className="text-sm" />
          </button>
          <h1 className={`text-sm font-bold truncate max-w-[120px] ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{codingPractice.title}</h1>
          <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] rounded font-medium">
            {isWebPlayground ? 'Web' : langConfig.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            <FaPlay className={`text-[10px] ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? '...' : 'Run'}
          </button>

          {topicId && (
            <button
              onClick={handleSubmitOrShowResults}
              disabled={submitting}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs text-white ${
                submitStatus === 'pass' ? 'bg-green-600' :
                submitStatus === 'fail' ? 'bg-orange-500' :
                submitting ? 'bg-gray-500' :
                'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {submitStatus === 'pass' ? 'Passed' :
               submitStatus === 'fail' ? 'Results' :
               submitting ? '...' : 'Submit'}
            </button>
          )}

          <button
            onClick={resetCode}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            <FaRedo className="text-xs" />
          </button>

          <button
            onClick={handleCopyCode}
            className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-[#0f3460] text-[#a0a0a0]' : 'hover:bg-gray-200 text-gray-600'}`}
          >
            {copied ? <FaCheck className="text-xs text-green-500" /> : <FaCopy className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className={`md:hidden flex border-b shrink-0 ${isDarkMode ? 'bg-[#1a1a2e] border-[#0f3460]' : 'bg-white border-gray-200'}`}>
        {[
          { id: 'problem', label: 'Problem', icon: FaFileAlt },
          { id: 'editor', label: 'Editor', icon: FaCode },
          { id: 'output', label: 'Output', icon: FaTerminal }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors relative
              ${activePanel === tab.id
                ? isDarkMode ? 'text-[#e94560]' : 'text-blue-600'
                : isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
            {activePanel === tab.id && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-[#e94560]' : 'bg-blue-600'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Main Content - Desktop */}
      <div className="hidden md:block flex-1 min-h-0">
        <Split
          className="split-horizontal h-full"
          sizes={showProblem ? [30, 70] : [0, 100]}
          minSize={showProblem ? [250, 400] : [0, 400]}
          gutterSize={showProblem ? 6 : 0}
          direction="horizontal"
          style={{ display: 'flex', height: '100%' }}
        >
          {/* Left Panel - Problem Description */}
          <div className={`h-full overflow-hidden flex flex-col ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'} ${!showProblem ? 'hidden' : ''}`}>
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-[#e94560]' : 'text-blue-600'}`}>Problem Description</h2>
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {renderDescription(codingPractice.description)}
              </div>

              {/* Image Links */}
              {codingPractice.imageLinks && codingPractice.imageLinks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-3 text-cyan-400 flex items-center gap-2">
                    <FaLink className="text-sm" /> Image Links
                  </h3>
                  <div className="space-y-2">
                    {codingPractice.imageLinks.map((link, index) => (
                      <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${isDarkMode ? 'bg-[#0f0f0f] border-[#0f3460]' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-cyan-400 text-xs font-medium min-w-[80px]">{link.label || `Link ${index + 1}`}:</span>
                        <input type="text" value={link.url} readOnly className="flex-1 bg-transparent text-xs font-mono text-gray-400 outline-none truncate" />
                        <button
                          onClick={() => copyImageLink(link.url, index)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${copiedLink === index ? 'bg-green-500 text-white' : isDarkMode ? 'bg-[#0f3460] hover:bg-[#0f3460]/80 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
                        >
                          {copiedLink === index ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Image */}
              {codingPractice.referenceImage && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-3 text-blue-400 flex items-center gap-2">
                    <FaImage className="text-sm" /> Reference Image
                  </h3>
                  <div
                    className={`relative group rounded-lg p-3 cursor-pointer transition-colors ${isDarkMode ? 'bg-[#0f0f0f] hover:bg-[#0f3460]/50' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => setImageExpanded(true)}
                    style={{ height: '280px' }}
                  >
                    <img
                      src={getFileUrl(codingPractice.referenceImage)}
                      alt="Reference UI"
                      className="rounded-lg border-2 border-[#0f3460] hover:border-blue-400 transition-colors"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImageExpanded(true); }}
                      className="absolute top-5 right-5 p-2 bg-[#1a1a2e]/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#0f3460]"
                    >
                      <FaExpand className="text-sm" />
                    </button>
                  </div>
                  <p className="text-xs text-[#a0a0a0] mt-2 text-center">Click image to enlarge</p>
                </div>
              )}

              {/* Expected Output */}
              {codingPractice.expectedOutput && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-2 text-green-400 flex items-center gap-2">
                    <FaCheck className="text-sm" /> Expected Output
                  </h3>
                  <pre className={`p-3 rounded-lg text-sm overflow-x-auto font-mono border ${isDarkMode ? 'bg-[#0f0f0f] text-gray-300 border-[#0f3460]' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {codingPractice.expectedOutput}
                  </pre>
                </div>
              )}
            </div>

            {/* Hints */}
            {codingPractice.hints && codingPractice.hints.length > 0 && (
              <div className={`border-t ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`w-full flex items-center justify-between p-3 transition-colors ${isDarkMode ? 'hover:bg-[#0f3460]/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                    <FaLightbulb /> Hints ({codingPractice.hints.length})
                  </span>
                  {showHints ? <FaChevronDown /> : <FaChevronUp />}
                </button>
                {showHints && (
                  <div className={`p-3 ${isDarkMode ? 'bg-[#0f0f0f]/50' : 'bg-gray-50'}`}>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-500 text-xs font-medium">
                          Hint {currentHintIndex + 1} of {codingPractice.hints.length}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentHintIndex === 0}
                            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${isDarkMode ? 'bg-[#0f3460]' : 'bg-gray-200'}`}
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setCurrentHintIndex(prev => Math.min(codingPractice.hints.length - 1, prev + 1))}
                            disabled={currentHintIndex >= codingPractice.hints.length - 1}
                            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${isDarkMode ? 'bg-[#0f3460]' : 'bg-gray-200'}`}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {codingPractice.hints[currentHintIndex]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Editor & Output (Side by Side) */}
          <div className="h-full min-w-0">
            <Split
              className="split-horizontal h-full"
              sizes={[50, 50]}
              minSize={200}
              gutterSize={6}
              direction="horizontal"
              style={{ display: 'flex', height: '100%' }}
            >
              {/* Editor Panel */}
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
                {/* Web Tabs */}
                {isWebPlayground && (
                  <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                    {[
                      { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                      { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                      { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveWebTab(tab.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 transition-colors relative
                          ${activeWebTab === tab.id
                            ? isDarkMode ? 'bg-[#0f3460]' : 'bg-gray-100'
                            : isDarkMode ? 'hover:bg-[#0f3460]/50' : 'hover:bg-gray-50'}`}
                      >
                        <tab.icon style={{ color: tab.color }} className="text-sm" />
                        <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{tab.label}</span>
                        {activeWebTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: tab.color }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Non-web header */}
                {!isWebPlayground && (
                  <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                    <FaCode className={`text-sm`} style={{ color: langConfig.color }} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      {langConfig.name} Editor
                    </span>
                  </div>
                )}

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={getEditorLanguage()}
                    value={isWebPlayground ? getCurrentCode() : code}
                    onChange={(value) => isWebPlayground ? setCurrentCode(value || '') : setCode(value || '')}
                    theme={theme}
                    options={editorOptions}
                  />
                </div>
              </div>

              {/* Output/Preview Panel */}
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
                {/* Output header */}
                <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                  {isWebPlayground ? (
                    <>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Preview</span>
                    </>
                  ) : (
                    <>
                      <FaTerminal className={`text-sm ${isDarkMode ? 'text-[#e94560]' : 'text-blue-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Output</span>
                    </>
                  )}
                </div>

                {/* Output content */}
                <div className="flex-1 min-h-0 overflow-auto">
                  {isWebPlayground ? (
                    hasConsole ? (
                      <Split
                        className="split-vertical h-full"
                        sizes={[75, 25]}
                        minSize={50}
                        gutterSize={4}
                        direction="vertical"
                        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                      >
                        <div className="min-h-0 bg-white">
                          {webPreview ? (
                            <iframe ref={iframeRef} srcDoc={webPreview} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-modals" />
                          ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                              Click "Run" to see preview
                            </div>
                          )}
                        </div>
                        <div className={`min-h-0 flex flex-col ${isDarkMode ? 'bg-[#0f0f0f]' : 'bg-gray-100'}`}>
                          <div className={`flex items-center gap-2 px-2 py-1 border-b ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                            <FaTerminal className="text-xs text-[#e94560]" />
                            <span className="text-xs font-medium">Console</span>
                          </div>
                          <div className="flex-1 overflow-auto p-2">
                            {consoleOutput.map((log, i) => (
                              <div key={i} className={`text-xs font-mono py-0.5 ${log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-yellow-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {log.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Split>
                    ) : (
                      <div className="h-full bg-white">
                        {webPreview ? (
                          <iframe ref={iframeRef} srcDoc={webPreview} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-modals" />
                        ) : (
                          <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                            Click "Run" to see preview
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className={`h-full p-3 font-mono text-sm whitespace-pre-wrap ${isDarkMode ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                      {output || <span className={isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-400'}>Click "Run" to execute code</span>}
                    </div>
                  )}
                </div>
              </div>
            </Split>
          </div>
        </Split>
      </div>

      {/* Main Content - Mobile */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col">
        {/* Problem Panel - Mobile */}
        {activePanel === 'problem' && (
          <div className={`flex-1 overflow-y-auto p-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
            <h2 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-[#e94560]' : 'text-blue-600'}`}>Problem Description</h2>
            <div className={`text-xs leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {renderDescription(codingPractice.description)}
            </div>

            {/* Reference Image - Mobile */}
            {codingPractice.referenceImage && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2 text-blue-400 flex items-center gap-2">
                  <FaImage className="text-xs" /> Reference
                </h3>
                <img
                  src={getFileUrl(codingPractice.referenceImage)}
                  alt="Reference UI"
                  className="w-full rounded-lg border border-[#0f3460]"
                  onClick={() => setImageExpanded(true)}
                />
              </div>
            )}

            {/* Expected Output - Mobile */}
            {codingPractice.expectedOutput && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-2 text-green-400">Expected Output</h3>
                <pre className={`p-2 rounded-lg text-xs overflow-x-auto font-mono ${isDarkMode ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                  {codingPractice.expectedOutput}
                </pre>
              </div>
            )}

            {/* Hints - Mobile */}
            {codingPractice.hints && codingPractice.hints.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-yellow-500 font-medium text-sm"
                >
                  <FaLightbulb /> Hints ({codingPractice.hints.length})
                </button>
                {showHints && (
                  <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {codingPractice.hints[currentHintIndex]}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentHintIndex === 0}
                        className="px-2 py-1 text-xs rounded bg-[#0f3460] disabled:opacity-50"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentHintIndex(prev => Math.min(codingPractice.hints.length - 1, prev + 1))}
                        disabled={currentHintIndex >= codingPractice.hints.length - 1}
                        className="px-2 py-1 text-xs rounded bg-[#0f3460] disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Editor Panel - Mobile */}
        {activePanel === 'editor' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
            {/* Web Tabs - Mobile */}
            {isWebPlayground && (
              <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-[#0f3460]' : 'border-gray-200'}`}>
                {[
                  { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                  { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                  { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWebTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 transition-colors relative text-xs
                      ${activeWebTab === tab.id
                        ? isDarkMode ? 'bg-[#0f3460]' : 'bg-gray-100'
                        : ''}`}
                  >
                    <tab.icon style={{ color: tab.color }} className="text-sm" />
                    {tab.label}
                    {activeWebTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: tab.color }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Monaco Editor - Mobile */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={getEditorLanguage()}
                value={isWebPlayground ? getCurrentCode() : code}
                onChange={(value) => isWebPlayground ? setCurrentCode(value || '') : setCode(value || '')}
                theme={theme}
                options={{ ...editorOptions, fontSize: 12 }}
              />
            </div>
          </div>
        )}

        {/* Output Panel - Mobile */}
        {activePanel === 'output' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-white'}`}>
            <div className="flex-1 min-h-0 overflow-auto">
              {isWebPlayground ? (
                <div className="h-full bg-white">
                  {webPreview ? (
                    <iframe ref={iframeRef} srcDoc={webPreview} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-modals" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                      Click "Run" to see preview
                    </div>
                  )}
                </div>
              ) : (
                <div className={`h-full p-3 font-mono text-xs whitespace-pre-wrap ${isDarkMode ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                  {output || <span className={isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-400'}>Click "Run" to execute code</span>}
                </div>
              )}
            </div>
            {/* Console for mobile */}
            {isWebPlayground && consoleOutput.length > 0 && (
              <div className={`max-h-32 overflow-auto border-t ${isDarkMode ? 'bg-[#0f0f0f] border-[#0f3460]' : 'bg-gray-100 border-gray-200'}`}>
                <div className="p-2">
                  {consoleOutput.map((log, i) => (
                    <div key={i} className={`text-xs font-mono py-0.5 ${log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-yellow-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Panel Overlay */}
      {showResults && submitStatus && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1a1a2e] border-[#0f3460]' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 text-center">
              {/* Status Icon */}
              <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
                submitStatus === 'pass'
                  ? 'bg-green-500/20 ring-4 ring-green-500/10'
                  : 'bg-red-500/20 ring-4 ring-red-500/10'
              }`}>
                {submitStatus === 'pass'
                  ? <FaCheck className="text-3xl text-green-400" />
                  : <FaTimes className="text-3xl text-red-400" />}
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-extrabold ${submitStatus === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                {submitStatus === 'pass' ? 'All Tests Passed!' : 'Tests Failed'}
              </h3>

              {/* Score Summary */}
              {(() => {
                const details = submitDetails || [];
                let totalTests, passedTests;

                if (isWebPlayground && details[0] && details[0].total !== undefined) {
                  totalTests = details[0].total;
                  passedTests = details[0].passed;
                } else if (!isWebPlayground && details.length > 0) {
                  totalTests = details.length;
                  passedTests = details.filter(d => d.passed).length;
                } else {
                  totalTests = submitStatus === 'pass' ? 1 : 0;
                  passedTests = submitStatus === 'pass' ? 1 : 0;
                }

                const scorePercent = totalTests > 0
                  ? Math.round((passedTests / totalTests) * 100)
                  : (submitStatus === 'pass' ? 100 : 0);

                return (
                  <>
                    <p className={`mt-2 text-base ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                      {totalTests > 0 ? `${passedTests}/${totalTests} tests passed` : 'Submission recorded'}
                    </p>

                    {totalTests > 0 && (
                      <div className="mt-4 px-4">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className={isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}>Score</span>
                          <span className={`font-bold ${submitStatus === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                            {scorePercent}%
                          </span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#0f3460]/30' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${submitStatus === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Test Details */}
            <div className="px-6 pb-2">
              {/* Non-web test cases */}
              {!isWebPlayground && submitDetails && submitDetails.length > 0 && !submitDetails[0]?.visual && (
                <div className="space-y-3 mb-4">
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                    Test Cases
                  </h4>
                  {submitDetails.map((tc, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${
                      tc.passed
                        ? isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                        : isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {tc.passed
                          ? <FaCheck className="text-green-400 text-sm" />
                          : <FaTimes className="text-red-400 text-sm" />}
                        <span className={`font-bold text-sm ${tc.passed ? 'text-green-400' : 'text-red-400'}`}>
                          Test Case {i + 1}
                        </span>
                      </div>
                      {tc.input && (
                        <div className="mb-1">
                          <span className={`text-xs ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>Input: </span>
                          <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#0f3460]/40 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                            {tc.input}
                          </code>
                        </div>
                      )}
                      <div className="mb-1">
                        <span className={`text-xs ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>Expected: </span>
                        <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${isDarkMode ? 'bg-[#0f3460]/40 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                          {tc.expected}
                        </code>
                      </div>
                      <div>
                        <span className={`text-xs ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>Output: </span>
                        <code className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          tc.passed
                            ? isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700'
                            : isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {tc.actual}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Web test results */}
              {isWebPlayground && testResults && testResults.length > 0 && (
                <div className="space-y-3 mb-4">
                  <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                    Test Results
                  </h4>
                  {testResults.map((result, i) => {
                    const isPassed = result === 'PASS';
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${
                        isPassed
                          ? isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'
                          : isDarkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isPassed
                            ? <FaCheck className="text-green-400 text-sm" />
                            : <FaTimes className="text-red-400 text-sm" />}
                          <span className={`font-bold text-sm ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
                            Test {i + 1}
                          </span>
                          {!isPassed && (
                            <span className="text-xs text-red-400/70 ml-1">
                              {result.replace('FAIL:', '').trim()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Visual completion (no tests) */}
              {isWebPlayground && (!testResults || testResults.length === 0) && submitStatus === 'pass' && (
                <div className={`rounded-xl border p-4 mb-4 ${isDarkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-400" />
                    <span className="text-green-400 font-medium text-sm">Code submitted successfully!</span>
                  </div>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                    No automated tests configured for this challenge.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className={`px-6 py-5 border-t ${isDarkMode ? 'border-[#0f3460]/20' : 'border-gray-200'}`}>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowResults(false);
                    if (submitStatus === 'fail') {
                      setSubmitStatus(null);
                      setSubmitDetails(null);
                    }
                  }}
                  className={`flex-1 py-3 rounded-xl font-bold text-base transition-colors ${
                    isDarkMode
                      ? 'bg-[#0f3460] text-white hover:bg-[#0f3460]/80'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {submitStatus === 'fail' ? 'Try Again' : 'Back to Editor'}
                </button>
                {submitStatus === 'pass' && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-green-500 rounded-xl text-white font-bold text-base hover:bg-green-600 transition-colors"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {imageExpanded && codingPractice.referenceImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setImageExpanded(false)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={getFileUrl(codingPractice.referenceImage)}
              alt="Reference UI - Expanded"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setImageExpanded(false)} className="absolute top-4 right-4 p-3 bg-[#1a1a2e] rounded-full hover:bg-[#0f3460] transition-colors">
              <FaTimes className="text-xl" />
            </button>
            <p className="text-center text-[#a0a0a0] mt-4">Click outside or press X to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingPlayground;
