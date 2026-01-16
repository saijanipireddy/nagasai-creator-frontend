import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import {
  FaLightbulb, FaPlay, FaRedo, FaTimes, FaChevronDown, FaChevronUp,
  FaCheck, FaCopy, FaImage, FaExpand, FaLink, FaHtml5, FaCss3Alt, FaJs,
  FaPython, FaDatabase, FaDownload, FaSun, FaMoon, FaCompress, FaCode, FaTerminal
} from 'react-icons/fa';

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
      return <code key={index} className="bg-dark-secondary px-1.5 py-0.5 rounded text-pink-400 font-mono text-xs">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const CodingPlayground = ({ codingPractice, onClose }) => {
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

  const iframeRef = useRef(null);

  // Initialize code from starter code
  useEffect(() => {
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
        if (!extractedHtml.includes('<!DOCTYPE')) {
          extractedHtml = DEFAULT_HTML;
        }

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
      setActiveWebTab(language === 'css' ? 'css' : language === 'javascript' ? 'js' : 'html');
    } else {
      setCode(starterCode);
    }

    setOutput('');
    setWebPreview('');
    setConsoleOutput([]);
    setShowHints(false);
    setCurrentHintIndex(0);
  }, [codingPractice, isWebPlayground, language]);

  // Handle console messages from iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'console') {
        setConsoleOutput(prev => [...prev, {
          level: event.data.level,
          message: event.data.args.join(' ')
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
  <\/script>
</body>
</html>`;
  }, [html, css, webJs]);

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
      setWebPreview(getWebPreview());
    } else if (langConfig.type === 'piston') {
      const result = await executePistonCode(code, langConfig.pistonLang, langConfig.pistonVersion);
      setOutput(result.output);
    } else {
      setOutput('Code execution not supported for this language yet.');
    }

    setIsRunning(false);
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

  if (!codingPractice?.title) {
    return (
      <div className="fixed inset-0 bg-dark-bg z-50 flex items-center justify-center">
        <div className="text-center text-dark-muted">
          <p className="text-xl mb-4">No coding practice available</p>
          <button onClick={onClose} className="px-4 py-2 bg-dark-accent rounded-lg hover:bg-dark-accent/80">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b shrink-0 ${isDarkMode ? 'bg-dark-card border-dark-secondary' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted hover:text-white' : 'hover:bg-gray-200 text-gray-600'}`}
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
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${showProblem ? 'bg-dark-accent text-white' : isDarkMode ? 'bg-dark-secondary text-dark-muted' : 'bg-gray-200 text-gray-600'}`}
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

          <button
            onClick={resetCode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Reset Code"
          >
            <FaRedo className="text-sm" />
          </button>

          <button
            onClick={handleCopyCode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Copy Code"
          >
            {copied ? <FaCheck className="text-sm text-green-500" /> : <FaCopy className="text-sm" />}
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <Split
          className="split-horizontal h-full"
          sizes={showProblem ? [30, 70] : [0, 100]}
          minSize={showProblem ? [250, 400] : [0, 400]}
          gutterSize={showProblem ? 6 : 0}
          direction="horizontal"
          style={{ display: 'flex', height: '100%' }}
        >
          {/* Left Panel - Problem Description */}
          <div className={`h-full overflow-hidden flex flex-col ${isDarkMode ? 'bg-dark-card' : 'bg-white'} ${!showProblem ? 'hidden' : ''}`}>
            <div className="flex-1 overflow-y-auto p-4">
              <h2 className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-dark-accent' : 'text-blue-600'}`}>Problem Description</h2>
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
                      <div key={index} className={`flex items-center gap-2 p-2 rounded-lg border ${isDarkMode ? 'bg-dark-bg border-dark-secondary' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-cyan-400 text-xs font-medium min-w-[80px]">{link.label || `Link ${index + 1}`}:</span>
                        <input type="text" value={link.url} readOnly className="flex-1 bg-transparent text-xs font-mono text-gray-400 outline-none truncate" />
                        <button
                          onClick={() => copyImageLink(link.url, index)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${copiedLink === index ? 'bg-green-500 text-white' : isDarkMode ? 'bg-dark-secondary hover:bg-dark-secondary/80 text-gray-300' : 'bg-gray-200 text-gray-600'}`}
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
                    className={`relative group rounded-lg p-3 cursor-pointer transition-colors ${isDarkMode ? 'bg-dark-bg hover:bg-dark-secondary/50' : 'bg-gray-50 hover:bg-gray-100'}`}
                    onClick={() => setImageExpanded(true)}
                    style={{ height: '280px' }}
                  >
                    <img
                      src={`http://localhost:5000${codingPractice.referenceImage}`}
                      alt="Reference UI"
                      className="rounded-lg border-2 border-dark-secondary hover:border-blue-400 transition-colors"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImageExpanded(true); }}
                      className="absolute top-5 right-5 p-2 bg-dark-card/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark-secondary"
                    >
                      <FaExpand className="text-sm" />
                    </button>
                  </div>
                  <p className="text-xs text-dark-muted mt-2 text-center">Click image to enlarge</p>
                </div>
              )}

              {/* Expected Output */}
              {codingPractice.expectedOutput && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-2 text-green-400 flex items-center gap-2">
                    <FaCheck className="text-sm" /> Expected Output
                  </h3>
                  <pre className={`p-3 rounded-lg text-sm overflow-x-auto font-mono border ${isDarkMode ? 'bg-dark-bg text-gray-300 border-dark-secondary' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    {codingPractice.expectedOutput}
                  </pre>
                </div>
              )}
            </div>

            {/* Hints */}
            {codingPractice.hints && codingPractice.hints.length > 0 && (
              <div className={`border-t ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className={`w-full flex items-center justify-between p-3 transition-colors ${isDarkMode ? 'hover:bg-dark-secondary/50' : 'hover:bg-gray-50'}`}
                >
                  <span className="flex items-center gap-2 text-yellow-500 font-medium text-sm">
                    <FaLightbulb /> Hints ({codingPractice.hints.length})
                  </span>
                  {showHints ? <FaChevronDown /> : <FaChevronUp />}
                </button>
                {showHints && (
                  <div className={`p-3 ${isDarkMode ? 'bg-dark-bg/50' : 'bg-gray-50'}`}>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-yellow-500 text-xs font-medium">
                          Hint {currentHintIndex + 1} of {codingPractice.hints.length}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentHintIndex === 0}
                            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${isDarkMode ? 'bg-dark-secondary' : 'bg-gray-200'}`}
                          >
                            Prev
                          </button>
                          <button
                            onClick={() => setCurrentHintIndex(prev => Math.min(codingPractice.hints.length - 1, prev + 1))}
                            disabled={currentHintIndex >= codingPractice.hints.length - 1}
                            className={`px-2 py-1 text-xs rounded disabled:opacity-50 ${isDarkMode ? 'bg-dark-secondary' : 'bg-gray-200'}`}
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
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                {/* Web Tabs */}
                {isWebPlayground && (
                  <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
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
                            ? isDarkMode ? 'bg-dark-secondary' : 'bg-gray-100'
                            : isDarkMode ? 'hover:bg-dark-secondary/50' : 'hover:bg-gray-50'}`}
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
                  <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
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
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                {/* Output header */}
                <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
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
                      <FaTerminal className={`text-sm ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
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
                        <div className={`min-h-0 flex flex-col ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-100'}`}>
                          <div className={`flex items-center gap-2 px-2 py-1 border-b ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                            <FaTerminal className="text-xs text-dark-accent" />
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
                    <div className={`h-full p-3 font-mono text-sm whitespace-pre-wrap ${isDarkMode ? 'bg-dark-bg text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                      {output || <span className={isDarkMode ? 'text-dark-muted' : 'text-gray-400'}>Click "Run" to execute code</span>}
                    </div>
                  )}
                </div>
              </div>
            </Split>
          </div>
        </Split>
      </div>

      {/* Expanded Image Modal */}
      {imageExpanded && codingPractice.referenceImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setImageExpanded(false)}>
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={`http://localhost:5000${codingPractice.referenceImage}`}
              alt="Reference UI - Expanded"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setImageExpanded(false)} className="absolute top-4 right-4 p-3 bg-dark-card rounded-full hover:bg-dark-secondary transition-colors">
              <FaTimes className="text-xl" />
            </button>
            <p className="text-center text-dark-muted mt-4">Click outside or press X to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingPlayground;
