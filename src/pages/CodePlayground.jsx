import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import {
  FaPlay, FaHtml5, FaCss3Alt, FaJs, FaPython, FaDatabase,
  FaDownload, FaRedo, FaSun, FaMoon, FaExpand, FaCompress,
  FaCode, FaTerminal, FaTable, FaKeyboard
} from 'react-icons/fa';

// Language configurations
const LANGUAGES = {
  web: {
    name: 'Web',
    icon: FaHtml5,
    color: '#e34c26',
    description: 'HTML, CSS & JavaScript'
  },
  python: {
    name: 'Python',
    icon: FaPython,
    color: '#3776ab',
    description: 'Python 3 with Pyodide'
  },
  sql: {
    name: 'SQL',
    icon: FaDatabase,
    color: '#00758f',
    description: 'SQLite in browser'
  },
  javascript: {
    name: 'JavaScript',
    icon: FaJs,
    color: '#f7df1e',
    description: 'Node.js style JS'
  }
};

// Default code templates - minimal starter code
const DEFAULT_CODE = {
  web: {
    html: `<!DOCTYPE html>
<html>
  <head>

  </head>
  <body>

  </body>
</html>`,
    css: ``,
    js: ``
  },
  python: ``,
  sql: ``,
  javascript: ``
};

const CodePlayground = () => {
  // State for current language
  const [activeLanguage, setActiveLanguage] = useState(() => {
    return localStorage.getItem('code-lang') || 'web';
  });

  // Web editor states
  const [html, setHtml] = useState(() => localStorage.getItem('code-html') || DEFAULT_CODE.web.html);
  const [css, setCss] = useState(() => localStorage.getItem('code-css') || DEFAULT_CODE.web.css);
  const [webJs, setWebJs] = useState(() => localStorage.getItem('code-webjs') || DEFAULT_CODE.web.js);
  const [activeWebTab, setActiveWebTab] = useState('html');

  // Other language states
  const [pythonCode, setPythonCode] = useState(() => localStorage.getItem('code-python') || DEFAULT_CODE.python);
  const [sqlCode, setSqlCode] = useState(() => localStorage.getItem('code-sql') || DEFAULT_CODE.sql);
  const [jsCode, setJsCode] = useState(() => localStorage.getItem('code-js') || DEFAULT_CODE.javascript);

  // Output states
  const [pythonOutput, setPythonOutput] = useState('');
  const [jsOutput, setJsOutput] = useState('');
  const [sqlResults, setSqlResults] = useState([]);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [webPreview, setWebPreview] = useState(''); // Only updates on Run

  // Input states for Python/JS
  const [pythonInput, setPythonInput] = useState('');
  const [jsInput, setJsInput] = useState('');

  // UI states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [sqlReady, setSqlReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobilePanel, setMobilePanel] = useState('editor'); // 'editor' or 'output'

  // Refs
  const pyodideRef = useRef(null);
  const sqlDbRef = useRef(null);
  const iframeRef = useRef(null);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('code-lang', activeLanguage);
  }, [activeLanguage]);

  useEffect(() => {
    localStorage.setItem('code-html', html);
    localStorage.setItem('code-css', css);
    localStorage.setItem('code-webjs', webJs);
  }, [html, css, webJs]);

  useEffect(() => {
    localStorage.setItem('code-python', pythonCode);
  }, [pythonCode]);

  useEffect(() => {
    localStorage.setItem('code-sql', sqlCode);
  }, [sqlCode]);

  useEffect(() => {
    localStorage.setItem('code-js', jsCode);
  }, [jsCode]);

  // Load Pyodide
  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current) return;

    setLoadingMessage('Loading Python environment...');
    try {
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      pyodideRef.current = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });

      setPyodideReady(true);
      setLoadingMessage('');
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      setLoadingMessage('Failed to load Python environment');
    }
  }, []);

  // Load SQL.js
  const loadSqlJs = useCallback(async () => {
    if (sqlDbRef.current) return;

    setLoadingMessage('Loading SQL environment...');
    try {
      if (!window.initSqlJs) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const SQL = await window.initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      });

      sqlDbRef.current = new SQL.Database();
      setSqlReady(true);
      setLoadingMessage('');
    } catch (error) {
      console.error('Failed to load SQL.js:', error);
      setLoadingMessage('Failed to load SQL environment');
    }
  }, []);

  // Load environments when language changes
  useEffect(() => {
    if (activeLanguage === 'python' && !pyodideReady) {
      loadPyodide();
    } else if (activeLanguage === 'sql' && !sqlReady) {
      loadSqlJs();
    }
  }, [activeLanguage, pyodideReady, sqlReady, loadPyodide, loadSqlJs]);

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

  // Run Python code
  const runPython = async () => {
    if (!pyodideRef.current) {
      setPythonOutput('Python environment not ready. Please wait...');
      return;
    }

    setIsRunning(true);
    setPythonOutput('');

    try {
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      if (pythonInput) {
        pyodideRef.current.runPython(`
import builtins
_input_values = ${JSON.stringify(pythonInput.split('\n'))}
_input_index = 0
def _custom_input(prompt=""):
    global _input_index
    if _input_index < len(_input_values):
        val = _input_values[_input_index]
        _input_index += 1
        print(prompt + val)
        return val
    return ""
builtins.input = _custom_input
        `);
      }

      await pyodideRef.current.runPythonAsync(pythonCode);

      const stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      const stderr = pyodideRef.current.runPython('sys.stderr.getvalue()');

      setPythonOutput(stdout + (stderr ? '\n[Error]\n' + stderr : ''));
    } catch (error) {
      setPythonOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Run SQL code
  const runSQL = () => {
    if (!sqlDbRef.current) {
      setSqlResults([{ error: 'SQL environment not ready. Please wait...' }]);
      return;
    }

    setIsRunning(true);
    setSqlResults([]);

    try {
      const statements = sqlCode.split(';').filter(s => s.trim());
      const results = [];

      for (const statement of statements) {
        if (!statement.trim()) continue;

        try {
          const result = sqlDbRef.current.exec(statement);
          if (result.length > 0) {
            results.push({
              columns: result[0].columns,
              values: result[0].values,
              statement: statement.trim().substring(0, 50) + '...'
            });
          } else {
            results.push({
              message: `Query executed: ${statement.trim().substring(0, 30)}...`,
              statement: statement.trim()
            });
          }
        } catch (e) {
          results.push({
            error: e.message,
            statement: statement.trim()
          });
        }
      }

      setSqlResults(results);
    } catch (error) {
      setSqlResults([{ error: error.message }]);
    } finally {
      setIsRunning(false);
    }
  };

  // Run JavaScript code
  const runJavaScript = () => {
    setIsRunning(true);
    setJsOutput('');

    const outputs = [];
    const originalConsole = { ...console };

    console.log = (...args) => outputs.push(args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
    console.error = (...args) => outputs.push('[Error] ' + args.join(' '));
    console.warn = (...args) => outputs.push('[Warn] ' + args.join(' '));

    try {
      let code = jsCode;
      if (jsInput) {
        const inputs = jsInput.split('\n');
        code = `
const _inputs = ${JSON.stringify(inputs)};
let _inputIndex = 0;
const prompt = (msg) => {
  const val = _inputs[_inputIndex++] || '';
  console.log(msg + val);
  return val;
};
${jsCode}`;
      }

      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const fn = new AsyncFunction(code);

      Promise.resolve(fn()).then(() => {
        setJsOutput(outputs.join('\n'));
      }).catch(error => {
        outputs.push(`[Error] ${error.message}`);
        setJsOutput(outputs.join('\n'));
      }).finally(() => {
        Object.assign(console, originalConsole);
        setIsRunning(false);
      });
    } catch (error) {
      outputs.push(`[Syntax Error] ${error.message}`);
      setJsOutput(outputs.join('\n'));
      Object.assign(console, originalConsole);
      setIsRunning(false);
    }
  };

  // Run code based on language
  const runCode = () => {
    if (activeLanguage === 'web') {
      setConsoleOutput([]);
      setWebPreview(getWebPreview()); // Update preview only on Run
    } else if (activeLanguage === 'python') {
      runPython();
    } else if (activeLanguage === 'sql') {
      runSQL();
    } else if (activeLanguage === 'javascript') {
      runJavaScript();
    }
  };

  // Reset code
  const resetCode = () => {
    if (!window.confirm('Reset code to default? This cannot be undone.')) return;

    if (activeLanguage === 'web') {
      setHtml(DEFAULT_CODE.web.html);
      setCss(DEFAULT_CODE.web.css);
      setWebJs(DEFAULT_CODE.web.js);
      setConsoleOutput([]);
      setWebPreview('');
    } else if (activeLanguage === 'python') {
      setPythonCode(DEFAULT_CODE.python);
      setPythonOutput('');
      setPythonInput('');
    } else if (activeLanguage === 'sql') {
      setSqlCode(DEFAULT_CODE.sql);
      setSqlResults([]);
      if (sqlDbRef.current) {
        sqlDbRef.current.close();
        sqlDbRef.current = null;
        setSqlReady(false);
        loadSqlJs();
      }
    } else if (activeLanguage === 'javascript') {
      setJsCode(DEFAULT_CODE.javascript);
      setJsOutput('');
      setJsInput('');
    }
  };

  // Download code
  const downloadCode = () => {
    let content, filename, type;

    if (activeLanguage === 'web') {
      content = getWebPreview();
      filename = 'playground.html';
      type = 'text/html';
    } else if (activeLanguage === 'python') {
      content = pythonCode;
      filename = 'playground.py';
      type = 'text/x-python';
    } else if (activeLanguage === 'sql') {
      content = sqlCode;
      filename = 'playground.sql';
      type = 'text/sql';
    } else {
      content = jsCode;
      filename = 'playground.js';
      type = 'text/javascript';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Monaco editor options
  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    padding: { top: 10 }
  };

  // Get current editor value and setter based on language
  const getCurrentCode = () => {
    if (activeLanguage === 'web') {
      if (activeWebTab === 'html') return html;
      if (activeWebTab === 'css') return css;
      return webJs;
    }
    if (activeLanguage === 'python') return pythonCode;
    if (activeLanguage === 'sql') return sqlCode;
    return jsCode;
  };

  const setCurrentCode = (value) => {
    if (activeLanguage === 'web') {
      if (activeWebTab === 'html') setHtml(value);
      else if (activeWebTab === 'css') setCss(value);
      else setWebJs(value);
    } else if (activeLanguage === 'python') {
      setPythonCode(value);
    } else if (activeLanguage === 'sql') {
      setSqlCode(value);
    } else {
      setJsCode(value);
    }
  };

  const getEditorLanguage = () => {
    if (activeLanguage === 'web') {
      if (activeWebTab === 'html') return 'html';
      if (activeWebTab === 'css') return 'css';
      return 'javascript';
    }
    if (activeLanguage === 'python') return 'python';
    if (activeLanguage === 'sql') return 'sql';
    return 'javascript';
  };

  const theme = isDarkMode ? 'vs-dark' : 'light';
  const hasInput = activeLanguage === 'python' || activeLanguage === 'javascript';
  const hasConsole = activeLanguage === 'web' && consoleOutput.length > 0;

  // Calculate height: 100vh - navbar(4rem) - padding(1.5rem top + 1.5rem bottom on md)
  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[9999]'
    : 'h-[calc(100vh-4rem-3rem)] min-h-[500px] -m-4 md:-m-6';

  return (
    <div className={`flex flex-col ${containerClass} ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-100'}`}>
      {/* Header - Desktop */}
      <div className={`hidden md:flex items-center justify-end gap-2 p-2 border-b shrink-0 ${isDarkMode ? 'bg-dark-card border-dark-secondary' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          {loadingMessage && (
            <span className="text-xs text-dark-accent animate-pulse">{loadingMessage}</span>
          )}

          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer focus:outline-none
              ${isDarkMode ? 'bg-dark-secondary text-white' : 'bg-gray-100 text-gray-800'}`}
          >
            <option value="web">Web</option>
            <option value="python">Python</option>
            <option value="sql">SQL</option>
            <option value="javascript">JavaScript</option>
          </select>

          <button
            onClick={runCode}
            disabled={isRunning || (activeLanguage === 'python' && !pyodideReady) || (activeLanguage === 'sql' && !sqlReady)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors
              ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            <FaPlay className={`text-xs ${isRunning ? 'animate-pulse' : ''}`} />
            <span className="text-sm">{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button onClick={resetCode} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`} title="Reset Code">
            <FaRedo className="text-sm" />
          </button>

          <button onClick={downloadCode} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`} title="Download">
            <FaDownload className="text-sm" />
          </button>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`} title="Toggle Theme">
            {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>

          <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-secondary text-dark-muted' : 'hover:bg-gray-200 text-gray-600'}`} title="Toggle Fullscreen">
            {isFullscreen ? <FaCompress className="text-sm" /> : <FaExpand className="text-sm" />}
          </button>
        </div>
      </div>

      {/* Header - Mobile */}
      <div className={`md:hidden flex items-center justify-between px-2 py-2 border-b shrink-0 ${isDarkMode ? 'bg-dark-card border-dark-secondary' : 'bg-white border-gray-200'}`}>
        <select
          value={activeLanguage}
          onChange={(e) => setActiveLanguage(e.target.value)}
          className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer focus:outline-none
            ${isDarkMode ? 'bg-dark-secondary text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          <option value="web">Web</option>
          <option value="python">Python</option>
          <option value="sql">SQL</option>
          <option value="javascript">JS</option>
        </select>

        <div className="flex items-center gap-1">
          {loadingMessage && (
            <span className="text-[10px] text-dark-accent animate-pulse mr-1">{loadingMessage.split(' ')[0]}...</span>
          )}

          <button
            onClick={runCode}
            disabled={isRunning || (activeLanguage === 'python' && !pyodideReady) || (activeLanguage === 'sql' && !sqlReady)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs
              ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white`}
          >
            <FaPlay className={`text-[10px] ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? '...' : 'Run'}
          </button>

          <button onClick={resetCode} className={`p-1.5 rounded-lg ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
            <FaRedo className="text-xs" />
          </button>

          <button onClick={downloadCode} className={`p-1.5 rounded-lg ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
            <FaDownload className="text-xs" />
          </button>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-1.5 rounded-lg ${isDarkMode ? 'text-dark-muted' : 'text-gray-600'}`}>
            {isDarkMode ? <FaSun className="text-xs" /> : <FaMoon className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className={`md:hidden flex border-b shrink-0 ${isDarkMode ? 'bg-dark-card border-dark-secondary' : 'bg-white border-gray-200'}`}>
        <button
          onClick={() => setMobilePanel('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors relative
            ${mobilePanel === 'editor' ? isDarkMode ? 'text-dark-accent' : 'text-blue-600' : isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}
        >
          <FaCode />
          Editor
          {mobilePanel === 'editor' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-dark-accent' : 'bg-blue-600'}`} />}
        </button>
        <button
          onClick={() => setMobilePanel('output')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors relative
            ${mobilePanel === 'output' ? isDarkMode ? 'text-dark-accent' : 'text-blue-600' : isDarkMode ? 'text-dark-muted' : 'text-gray-500'}`}
        >
          <FaTerminal />
          Output
          {mobilePanel === 'output' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDarkMode ? 'bg-dark-accent' : 'bg-blue-600'}`} />}
        </button>
      </div>

      {/* Main Content - Desktop (Split Layout) */}
      <div className="hidden md:block flex-1 min-h-0">
        <Split
          className="split-horizontal h-full"
          sizes={[50, 50]}
          minSize={150}
          gutterSize={6}
          direction="horizontal"
          style={{ display: 'flex', height: '100%' }}
        >
          {/* Left Panel - Editor + Input (Vertical Split) */}
          <div className="h-full min-w-0">
            {hasInput ? (
              <Split
                className="split-vertical h-full"
                sizes={[75, 25]}
                minSize={50}
                gutterSize={6}
                direction="vertical"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Editor */}
                <div className={`min-h-0 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                  {/* Editor header for non-web */}
                  {activeLanguage !== 'web' && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                      <FaCode className={`text-sm ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                        {LANGUAGES[activeLanguage].name} Editor
                      </span>
                    </div>
                  )}

                  {/* Web tabs */}
                  {activeLanguage === 'web' && (
                    <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                      {[
                        { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                        { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                        { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveWebTab(tab.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors relative
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

                  {/* Monaco Editor */}
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={getEditorLanguage()}
                      value={getCurrentCode()}
                      onChange={(value) => setCurrentCode(value || '')}
                      theme={theme}
                      options={editorOptions}
                    />
                  </div>
                </div>

                {/* Input Panel */}
                <div className={`min-h-0 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'bg-dark-secondary/50 border-dark-secondary' : 'bg-gray-50 border-gray-200'}`}>
                    <FaTerminal className={`text-xs ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      Input (one value per line)
                    </span>
                  </div>
                  <textarea
                    value={activeLanguage === 'python' ? pythonInput : jsInput}
                    onChange={(e) => activeLanguage === 'python' ? setPythonInput(e.target.value) : setJsInput(e.target.value)}
                    placeholder="Enter input values here..."
                    className={`flex-1 w-full p-2 text-sm font-mono resize-none focus:outline-none
                      ${isDarkMode ? 'bg-dark-bg text-white placeholder-dark-muted' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </Split>
            ) : (
              /* Editor only (no input for web/sql) */
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                {/* Web tabs */}
                {activeLanguage === 'web' && (
                  <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                    {[
                      { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                      { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                      { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveWebTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors relative
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

                {/* SQL header */}
                {activeLanguage === 'sql' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                    <FaDatabase className={`text-sm ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                      SQL Editor
                    </span>
                  </div>
                )}

                {/* Monaco Editor */}
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={getEditorLanguage()}
                    value={getCurrentCode()}
                    onChange={(value) => setCurrentCode(value || '')}
                    theme={theme}
                    options={editorOptions}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Output (with optional console for web) */}
          <div className="h-full min-w-0">
            {hasConsole ? (
              <Split
                className="split-vertical h-full"
                sizes={[70, 30]}
                minSize={50}
                gutterSize={6}
                direction="vertical"
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                {/* Preview */}
                <div className={`min-h-0 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Preview</span>
                  </div>
                  <div className="flex-1 min-h-0 bg-white">
                    {webPreview ? (
                      <iframe
                        ref={iframeRef}
                        srcDoc={webPreview}
                        className="w-full h-full border-none"
                        title="Preview"
                        sandbox="allow-scripts allow-modals"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        Click "Run" to see preview
                      </div>
                    )}
                  </div>
                </div>

                {/* Console */}
                <div className={`min-h-0 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'bg-dark-secondary/50 border-dark-secondary' : 'bg-gray-50 border-gray-200'}`}>
                    <FaTerminal className={`text-xs ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Console</span>
                  </div>
                  <div className={`flex-1 overflow-auto p-2 ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-100'}`}>
                    {consoleOutput.map((log, i) => (
                      <div
                        key={i}
                        className={`text-xs font-mono py-0.5 ${
                          log.level === 'error' ? 'text-red-500' :
                          log.level === 'warn' ? 'text-yellow-500' :
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              </Split>
            ) : (
              /* Output only */
              <div className={`h-full flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
                {/* Output header */}
                <div className={`flex items-center gap-2 px-3 py-1.5 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                  {activeLanguage === 'web' ? (
                    <>
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Preview</span>
                    </>
                  ) : activeLanguage === 'sql' ? (
                    <>
                      <FaTable className={`text-sm ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Results</span>
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
                  {/* Web Preview */}
                  {activeLanguage === 'web' && (
                    <div className="h-full bg-white">
                      {webPreview ? (
                        <iframe
                          ref={iframeRef}
                          srcDoc={webPreview}
                          className="w-full h-full border-none"
                          title="Preview"
                          sandbox="allow-scripts allow-modals"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400">
                          Click "Run" to see preview
                        </div>
                      )}
                    </div>
                  )}

                  {/* Python Output */}
                  {activeLanguage === 'python' && (
                    <div className={`h-full p-3 font-mono text-sm whitespace-pre-wrap ${isDarkMode ? 'bg-dark-bg text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                      {!pyodideReady ? (
                        <div className="flex items-center gap-2 text-dark-accent">
                          <div className="w-4 h-4 border-2 border-dark-accent border-t-transparent rounded-full animate-spin"></div>
                          Loading Python environment...
                        </div>
                      ) : pythonOutput ? (
                        pythonOutput
                      ) : (
                        <span className={isDarkMode ? 'text-dark-muted' : 'text-gray-400'}>
                          Click "Run" to execute Python code
                        </span>
                      )}
                    </div>
                  )}

                  {/* SQL Results */}
                  {activeLanguage === 'sql' && (
                    <div className={`h-full overflow-auto ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                      {!sqlReady ? (
                        <div className="flex items-center gap-2 p-3 text-dark-accent">
                          <div className="w-4 h-4 border-2 border-dark-accent border-t-transparent rounded-full animate-spin"></div>
                          Loading SQL environment...
                        </div>
                      ) : sqlResults.length === 0 ? (
                        <div className={`p-3 ${isDarkMode ? 'text-dark-muted' : 'text-gray-400'}`}>
                          Click "Run" to execute SQL queries
                        </div>
                      ) : (
                        <div className="p-3 space-y-3">
                          {sqlResults.map((result, i) => (
                            <div key={i} className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                              {result.error ? (
                                <div className="p-2 bg-red-500/10 text-red-500 text-sm">
                                  Error: {result.error}
                                </div>
                              ) : result.message ? (
                                <div className={`p-2 text-sm ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                  {result.message}
                                </div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className={isDarkMode ? 'bg-dark-secondary' : 'bg-gray-100'}>
                                        {result.columns.map((col, j) => (
                                          <th key={j} className={`px-2 py-1.5 text-left font-medium text-xs ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.values.map((row, j) => (
                                        <tr key={j} className={`border-t ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                                          {row.map((cell, k) => (
                                            <td key={k} className={`px-2 py-1.5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                              {cell === null ? <span className="text-dark-muted italic">NULL</span> : String(cell)}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className={`px-2 py-1 text-xs ${isDarkMode ? 'bg-dark-secondary/50 text-dark-muted' : 'bg-gray-50 text-gray-500'}`}>
                                    {result.values.length} row{result.values.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* JavaScript Output */}
                  {activeLanguage === 'javascript' && (
                    <div className={`h-full p-3 font-mono text-sm whitespace-pre-wrap ${isDarkMode ? 'bg-dark-bg text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                      {jsOutput ? (
                        jsOutput
                      ) : (
                        <span className={isDarkMode ? 'text-dark-muted' : 'text-gray-400'}>
                          Click "Run" to execute JavaScript code
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Split>
      </div>

      {/* Main Content - Mobile */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col">
        {/* Mobile Editor Panel */}
        {mobilePanel === 'editor' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
            {/* Web tabs for mobile */}
            {activeLanguage === 'web' && (
              <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                {[
                  { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                  { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                  { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWebTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 transition-colors relative text-xs
                      ${activeWebTab === tab.id ? isDarkMode ? 'bg-dark-secondary' : 'bg-gray-100' : ''}`}
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

            {/* Language header for non-web */}
            {activeLanguage !== 'web' && (
              <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                {activeLanguage === 'python' && <FaPython className="text-sm" style={{ color: '#3776ab' }} />}
                {activeLanguage === 'sql' && <FaDatabase className="text-sm" style={{ color: '#00758f' }} />}
                {activeLanguage === 'javascript' && <FaJs className="text-sm" style={{ color: '#f7df1e' }} />}
                <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                  {LANGUAGES[activeLanguage].name} Editor
                </span>
              </div>
            )}

            {/* Monaco Editor - Mobile */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={getEditorLanguage()}
                value={getCurrentCode()}
                onChange={(value) => setCurrentCode(value || '')}
                theme={theme}
                options={{ ...editorOptions, fontSize: 13 }}
              />
            </div>

            {/* Input section for Python/JS on mobile */}
            {hasInput && (
              <div className={`border-t shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-dark-secondary/50' : 'bg-gray-50'}`}>
                  <FaKeyboard className={`text-xs ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                  <span className="text-xs font-medium">Input</span>
                </div>
                <textarea
                  value={activeLanguage === 'python' ? pythonInput : jsInput}
                  onChange={(e) => activeLanguage === 'python' ? setPythonInput(e.target.value) : setJsInput(e.target.value)}
                  placeholder="Enter input values (one per line)..."
                  rows={3}
                  className={`w-full p-2 text-xs font-mono resize-none focus:outline-none
                    ${isDarkMode ? 'bg-dark-bg text-white placeholder-dark-muted' : 'bg-white text-gray-800 placeholder-gray-400'}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Mobile Output Panel */}
        {mobilePanel === 'output' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-dark-card' : 'bg-white'}`}>
            {/* Output header */}
            <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
              {activeLanguage === 'web' ? (
                <>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Preview</span>
                </>
              ) : activeLanguage === 'sql' ? (
                <>
                  <FaTable className={`text-xs ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Results</span>
                </>
              ) : (
                <>
                  <FaTerminal className={`text-xs ${isDarkMode ? 'text-dark-accent' : 'text-blue-500'}`} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Output</span>
                </>
              )}
            </div>

            {/* Output content */}
            <div className="flex-1 min-h-0 overflow-auto">
              {/* Web Preview */}
              {activeLanguage === 'web' && (
                <div className="h-full bg-white">
                  {webPreview ? (
                    <iframe
                      ref={iframeRef}
                      srcDoc={webPreview}
                      className="w-full h-full border-none"
                      title="Preview"
                      sandbox="allow-scripts allow-modals"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                      Click "Run" to see preview
                    </div>
                  )}
                </div>
              )}

              {/* Python Output */}
              {activeLanguage === 'python' && (
                <div className={`h-full p-3 font-mono text-xs whitespace-pre-wrap ${isDarkMode ? 'bg-dark-bg text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                  {!pyodideReady ? (
                    <div className="flex items-center gap-2 text-dark-accent">
                      <div className="w-3 h-3 border-2 border-dark-accent border-t-transparent rounded-full animate-spin"></div>
                      Loading Python...
                    </div>
                  ) : pythonOutput ? pythonOutput : (
                    <span className={isDarkMode ? 'text-dark-muted' : 'text-gray-400'}>Click "Run" to execute</span>
                  )}
                </div>
              )}

              {/* SQL Results */}
              {activeLanguage === 'sql' && (
                <div className={`h-full overflow-auto ${isDarkMode ? 'bg-dark-bg' : 'bg-gray-50'}`}>
                  {!sqlReady ? (
                    <div className="flex items-center gap-2 p-3 text-dark-accent text-xs">
                      <div className="w-3 h-3 border-2 border-dark-accent border-t-transparent rounded-full animate-spin"></div>
                      Loading SQL...
                    </div>
                  ) : sqlResults.length === 0 ? (
                    <div className={`p-3 text-xs ${isDarkMode ? 'text-dark-muted' : 'text-gray-400'}`}>
                      Click "Run" to execute
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {sqlResults.map((result, i) => (
                        <div key={i} className={`rounded-lg overflow-hidden border ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                          {result.error ? (
                            <div className="p-2 bg-red-500/10 text-red-500 text-xs">Error: {result.error}</div>
                          ) : result.message ? (
                            <div className={`p-2 text-xs ${isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                              {result.message}
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className={isDarkMode ? 'bg-dark-secondary' : 'bg-gray-100'}>
                                    {result.columns.map((col, j) => (
                                      <th key={j} className={`px-2 py-1 text-left font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{col}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {result.values.slice(0, 50).map((row, j) => (
                                    <tr key={j} className={`border-t ${isDarkMode ? 'border-dark-secondary' : 'border-gray-200'}`}>
                                      {row.map((cell, k) => (
                                        <td key={k} className={`px-2 py-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                          {cell === null ? <span className="text-dark-muted italic">NULL</span> : String(cell)}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className={`px-2 py-1 text-[10px] ${isDarkMode ? 'bg-dark-secondary/50 text-dark-muted' : 'bg-gray-50 text-gray-500'}`}>
                                {result.values.length} row{result.values.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* JavaScript Output */}
              {activeLanguage === 'javascript' && (
                <div className={`h-full p-3 font-mono text-xs whitespace-pre-wrap ${isDarkMode ? 'bg-dark-bg text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                  {jsOutput ? jsOutput : (
                    <span className={isDarkMode ? 'text-dark-muted' : 'text-gray-400'}>Click "Run" to execute</span>
                  )}
                </div>
              )}
            </div>

            {/* Console for web on mobile */}
            {activeLanguage === 'web' && consoleOutput.length > 0 && (
              <div className={`max-h-28 border-t overflow-auto ${isDarkMode ? 'bg-dark-bg border-dark-secondary' : 'bg-gray-100 border-gray-200'}`}>
                <div className={`sticky top-0 flex items-center gap-2 px-2 py-1 ${isDarkMode ? 'bg-dark-secondary/80' : 'bg-gray-200'}`}>
                  <FaTerminal className="text-[10px] text-dark-accent" />
                  <span className="text-[10px] font-medium">Console</span>
                </div>
                <div className="p-2">
                  {consoleOutput.map((log, i) => (
                    <div key={i} className={`text-[11px] font-mono py-0.5 ${log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-yellow-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePlayground;
