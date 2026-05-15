import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import Split from 'react-split';

// Lazy-load Monaco Editor (~4MB) — only loaded when CodingPlayground renders
const LazyEditor = lazy(() => import('@monaco-editor/react'));
const Editor = (props) => (
  <Suspense fallback={<div className="flex items-center justify-center h-full bg-[#1e1e1e] text-gray-400 text-sm">Loading editor...</div>}>
    <LazyEditor {...props} />
  </Suspense>
);
import {
  FaLightbulb, FaPlay, FaRedo, FaTimes, FaChevronDown, FaChevronUp,
  FaCheck, FaCopy, FaImage, FaExpand, FaLink, FaHtml5, FaCss3Alt, FaJs,
  FaPython, FaDatabase, FaDownload, FaSun, FaMoon, FaCompress, FaCode, FaTerminal, FaFileAlt,
  FaChevronLeft, FaHistory, FaCloudUploadAlt, FaCircle, FaListUl, FaPlus, FaBookOpen
} from 'react-icons/fa';
import api, { BACKEND_URL, getFileUrl } from '../../services/api';

// Language configurations
const LANGUAGE_CONFIG = {
  web: { name: 'Web', icon: FaHtml5, color: '#e34c26', type: 'web' },
  html: { name: 'HTML', icon: FaHtml5, color: '#e34c26', type: 'web' },  // legacy alias
  css: { name: 'CSS', icon: FaCss3Alt, color: '#264de4', type: 'web' },  // legacy alias
  javascript: { name: 'JavaScript', icon: FaJs, color: '#f7df1e', type: 'piston', pistonLang: 'javascript', pistonVersion: '18.15.0' },
  python: { name: 'Python', icon: FaPython, color: '#3776ab', type: 'pyodide' },
  java: { name: 'Java', icon: FaCode, color: '#007396', type: 'piston', pistonLang: 'java', pistonVersion: '15.0.2' },
  cpp: { name: 'C++', icon: FaCode, color: '#00599C', type: 'piston', pistonLang: 'c++', pistonVersion: '10.2.0' },
  c: { name: 'C', icon: FaCode, color: '#A8B9CC', type: 'piston', pistonLang: 'c', pistonVersion: '10.2.0' },
  typescript: { name: 'TypeScript', icon: FaCode, color: '#3178c6', type: 'piston', pistonLang: 'typescript', pistonVersion: '5.0.3' },
  sql: { name: 'SQL', icon: FaDatabase, color: '#00758f', type: 'sqljs' },
  php: { name: 'PHP', icon: FaCode, color: '#777BB4', type: 'piston', pistonLang: 'php', pistonVersion: '8.2.3' },
  ruby: { name: 'Ruby', icon: FaCode, color: '#CC342D', type: 'piston', pistonLang: 'ruby', pistonVersion: '3.0.1' },
  go: { name: 'Go', icon: FaCode, color: '#00ADD8', type: 'piston', pistonLang: 'go', pistonVersion: '1.16.2' },
  rust: { name: 'Rust', icon: FaCode, color: '#000000', type: 'piston', pistonLang: 'rust', pistonVersion: '1.68.2' },
  kotlin: { name: 'Kotlin', icon: FaCode, color: '#7F52FF', type: 'piston', pistonLang: 'kotlin', pistonVersion: '1.8.20' },
  swift: { name: 'Swift', icon: FaCode, color: '#FA7343', type: 'piston', pistonLang: 'swift', pistonVersion: '5.3.3' },
  react: { name: 'React', icon: FaCode, color: '#61DAFB', type: 'stackblitz', embedUrl: 'https://stackblitz.com/edit/react-331knmhr?embed=1&file=src/App.js&theme=dark&hideNavigation=1' },
  angular: { name: 'Angular', icon: FaCode, color: '#DD0031', type: 'stackblitz', embedUrl: 'https://stackblitz.com/edit/angular-live-compiler?embed=1&file=src/app/app.component.ts&theme=dark&hideNavigation=1' }
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

const CodingPlayground = ({ codingPractice, topicId, onClose, onComplete, readOnly = false }) => {
  // Determine language and type
  const language = codingPractice?.language || 'javascript';
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.javascript;
  const isWebPlayground = ['html', 'css', 'web'].includes(language);
  const isStackBlitz = langConfig.type === 'stackblitz';

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
  const [activePanel, setActivePanel] = useState('editor'); // 'problem', 'editor', 'output' for mobile
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'pass' | 'fail'
  const [submitting, setSubmitting] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [testResults, setTestResults] = useState(null); // For web: array of 'PASS'/'FAIL:...'
  const [submitDetails, setSubmitDetails] = useState(null); // Server response details
  const [previousSubmission, setPreviousSubmission] = useState(null); // Loaded from DB
  const [loadingSubmission, setLoadingSubmission] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'hints' | 'submissions'
  const [bottomTab, setBottomTab] = useState('testcase'); // 'testcase' | 'result' | 'console'
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const alreadySolved = previousSubmission?.passed === true;

  const iframeRef = useRef(null);
  const testResultsRef = useRef(null);
  const pyodideRef = useRef(null);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);

  // Load Pyodide for Python execution in browser
  const loadPyodide = useCallback(async () => {
    if (pyodideRef.current || pyodideLoading) return;
    setPyodideLoading(true);
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
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
        stdout: (text) => { },
        stderr: (text) => { }
      });

      // Redirect all stdio to StringIO immediately to prevent I/O errors
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdin = StringIO()
sys.stdout = StringIO()
sys.stderr = StringIO()
      `);

      setPyodideReady(true);
    } catch (error) {
      // Pyodide load failed — user will see loading state
    } finally {
      setPyodideLoading(false);
    }
  }, [pyodideLoading]);

  // SQL.js state and refs
  const sqlDbRef = useRef(null);
  const [sqlReady, setSqlReady] = useState(false);
  const [sqlLoading, setSqlLoading] = useState(false);

  // Load SQL.js for SQL execution in browser
  const loadSqlJs = useCallback(async () => {
    if (sqlDbRef.current || sqlLoading) return;
    setSqlLoading(true);
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
    } catch (error) {
      // SQL.js load failed — user will see loading state
    } finally {
      setSqlLoading(false);
    }
  }, [sqlLoading]);

  // Auto-load Pyodide or SQL.js based on language
  useEffect(() => {
    if (langConfig.type === 'pyodide' && !pyodideReady && !pyodideLoading) {
      loadPyodide();
    }
    if (langConfig.type === 'sqljs' && !sqlReady && !sqlLoading) {
      loadSqlJs();
    }
  }, [langConfig.type, pyodideReady, pyodideLoading, loadPyodide, sqlReady, sqlLoading, loadSqlJs]);

  // Execute Python code in browser via Pyodide, returns { success, output }
  const runPyodideCode = useCallback(async (sourceCode, stdin = '') => {
    if (!pyodideRef.current) {
      return { success: false, output: 'Python environment not ready. Please wait...' };
    }
    try {
      pyodideRef.current.runPython(`
import sys
import builtins
from io import StringIO
sys.stdin = StringIO(${JSON.stringify((stdin || '') + '\n')})
sys.stdout = StringIO()
sys.stderr = StringIO()
def _custom_input(prompt=""):
    line = sys.stdin.readline().rstrip('\\n')
    return line
builtins.input = _custom_input
      `);

      await pyodideRef.current.runPythonAsync(sourceCode);
      const stdout = pyodideRef.current.runPython('sys.stdout.getvalue()');
      const stderr = pyodideRef.current.runPython('sys.stderr.getvalue()');

      if (stderr && !stdout) return { success: false, output: stderr };
      return { success: true, output: stdout || '' };
    } catch (error) {
      return { success: false, output: `Error: ${error.message}` };
    }
  }, []);

  // Execute SQL code in browser via SQL.js, returns { success, output }
  // setupSql = optional SQL to run first (CREATE TABLE, INSERT, etc.) before the actual query
  const runSqlCode = useCallback((sourceCode, setupSql = '') => {
    if (!sqlDbRef.current) {
      return { success: false, output: 'SQL environment not ready. Please wait...' };
    }
    try {
      // Create a fresh database for each run to avoid state leakage between test cases
      const SQL = sqlDbRef.current.constructor;
      const db = new SQL();

      // Run setup SQL first (create tables, insert data, etc.)
      if (setupSql && setupSql.trim()) {
        db.run(setupSql);
      }

      // Run student's SQL
      const statements = sourceCode.split(';').filter(s => s.trim());
      const outputParts = [];

      for (const statement of statements) {
        if (!statement.trim()) continue;
        const result = db.exec(statement);
        if (result.length > 0) {
          // Format result as table-like output
          const columns = result[0].columns;
          const rows = result[0].values;
          outputParts.push(columns.join('|'));
          for (const row of rows) {
            outputParts.push(row.map(v => v === null ? 'NULL' : String(v)).join('|'));
          }
        }
      }

      db.close();
      return { success: true, output: outputParts.join('\n') };
    } catch (error) {
      return { success: false, output: `SQL Error: ${error.message}` };
    }
  }, []);

  // Load previous submission from backend
  useEffect(() => {
    if (!topicId) { setLoadingSubmission(false); return; }
    const controller = new AbortController();
    setLoadingSubmission(true);
    api.get(`/scores/coding-submission/${topicId}`, { signal: controller.signal })
      .then(({ data }) => {
        if (data.submission) setPreviousSubmission(data.submission);
      })
      .catch(() => {})
      .finally(() => setLoadingSubmission(false));
    return () => controller.abort();
  }, [topicId]);

  // Initialize code from previous submission or starter code
  useEffect(() => {
    if (loadingSubmission) return;

    // Use previous submission code if available, otherwise starter code
    const savedCode = previousSubmission?.code || '';
    const starterCode = codingPractice?.starterCode || '';
    const initialCode = savedCode || starterCode;

    if (isWebPlayground) {
      // Try to parse code that has <!-- HTML --> / /* CSS */ / // JS markers (old submit format)
      if (initialCode.includes('<!-- HTML -->') && initialCode.includes('/* CSS */')) {
        const parts = initialCode.split(/\/\*\s*CSS\s*\*\//);
        let htmlPart = (parts[0] || '').replace('<!-- HTML -->', '').trim();
        const rest = parts[1] || '';
        const jsSplit = rest.split(/\/\/\s*JS/);
        let cssPart = (jsSplit[0] || '').trim();
        let jsPart = (jsSplit[1] || '').trim();

        if (!htmlPart || !htmlPart.includes('<')) htmlPart = DEFAULT_HTML;
        setHtml(htmlPart);
        setCss(cssPart);
        setWebJs(jsPart);
      } else if (initialCode.includes('<style>') || initialCode.includes('<style ') || initialCode.includes('<script>') || initialCode.includes('<script ')) {
        // Parse <style> and <script> tags
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
        if (!extractedHtml || !extractedHtml.includes('<')) {
          extractedHtml = DEFAULT_HTML;
        }

        setHtml(extractedHtml);
        setCss(extractedCss);
        setWebJs(extractedJs);
      } else {
        // Plain code — put in HTML
        setHtml(initialCode || DEFAULT_HTML);
        setCss('');
        setWebJs('');
      }
      setActiveWebTab('html');
    } else {
      setCode(initialCode);
    }

    // Don't restore previous output - it contains all test case results joined together.
    // Student can click "Run" to see fresh output for their restored code.
    setOutput('');

    setWebPreview('');
    setConsoleOutput([]);
    setShowHints(false);
    setCurrentHintIndex(0);
    setShowResults(false);
    testResultsRef.current = null;
  }, [codingPractice, isWebPlayground, language, loadingSubmission, previousSubmission]);

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
        window.testResults = window.testResults || [];
        ${codingPractice.testScript}
        // Auto-send results back to parent
        // Supports both window.testResults pattern and explicit console.log pattern
        if (window.testResults && window.testResults.length > 0) {
          console.log('TEST_RESULTS:' + JSON.stringify(window.testResults));
        }
      } catch(e) {
        console.log('TEST_RESULTS:' + JSON.stringify(['FAIL: Test script error: ' + e.message]));
      }
    }, 500);
    ` : ''}
  <\/script>
</body>
</html>`;
  }, [html, css, webJs, codingPractice?.testScript]);

  // Execute code via backend proxy (avoids CORS issues in production)
  const executePistonCode = async (sourceCode, lang, version) => {
    try {
      const response = await api.post('/scores/run-code', {
        language: lang,
        version: version,
        files: [{ content: sourceCode }]
      });

      const data = response.data;

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
    } else if (langConfig.type === 'pyodide') {
      const result = await runPyodideCode(code);
      setOutput(result.output);
    } else if (langConfig.type === 'sqljs') {
      const setupSql = codingPractice?.setupSql || codingPractice?.setup_sql || '';
      const result = runSqlCode(code, setupSql);
      setOutput(result.output);
    } else if (langConfig.type === 'piston') {
      const result = await executePistonCode(code, langConfig.pistonLang, langConfig.pistonVersion);
      setOutput(result.output);
    } else {
      setOutput('Code execution not supported for this language yet.');
    }

    setIsRunning(false);
    setHasRun(true);
  };

  // Submit to backend (fire-and-forget, don't block UI)
  const submitToBackend = (codeStr, testResultsArr) => {
    api.post('/scores/coding-submit', {
      topicId,
      code: codeStr,
      language: language,
      testResults: testResultsArr,
    }).catch(() => {}); // silent fail - local results already shown
  };

  // Run, evaluate locally, then submit to backend
  const handleSubmitCode = async () => {
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

        // Wait for test results from iframe (max 5 seconds)
        // Check both postMessage results AND direct iframe access
        await new Promise((resolve) => {
          let elapsed = 0;
          const interval = setInterval(() => {
            elapsed += 200;
            // Try reading directly from iframe as fallback
            if (!testResultsRef.current && iframeRef.current) {
              try {
                const iframeResults = iframeRef.current.contentWindow?.testResults;
                if (iframeResults && Array.isArray(iframeResults) && iframeResults.length > 0) {
                  testResultsRef.current = iframeResults;
                  setTestResults(iframeResults);
                }
              } catch (e) { /* cross-origin - ignore */ }
            }
            if (testResultsRef.current || elapsed >= 5000) {
              clearInterval(interval);
              resolve();
            }
          }, 200);
        });

        // Evaluate results locally from test script
        const results = testResultsRef.current || [];
        const passed = results.length > 0 && results.every(r => r === 'PASS' || r.startsWith?.('PASS'));
        setSubmitStatus(passed ? 'pass' : 'fail');
        // Mark as complete on any submission (for calendar/streak tracking)
        onComplete?.();
        setSubmitDetails(results);
        submitToBackend(isWebPlayground ? `${html}\n<style>\n${css}\n</style>\n<script>\n${webJs}\n</script>` : code, results);
      } else if (isWebPlayground) {
        // Web without testScript: just run to show preview
        setConsoleOutput([]);
        setWebPreview(getWebPreview());
        setHasRun(true);
        setSubmitStatus('pass');
        onComplete?.();
        setSubmitDetails([]);
        submitToBackend(`${html}\n<style>\n${css}\n</style>\n<script>\n${webJs}\n</script>`, ['PASS']);
      } else if (langConfig.type === 'sqljs') {
        // SQL: run test cases in browser via SQL.js, then save to backend
        const testCases = codingPractice?.testCases || codingPractice?.test_cases || [];
        const setupSql = codingPractice?.setupSql || codingPractice?.setup_sql || '';
        const results = [];

        if (testCases.length > 0) {
          for (const tc of testCases) {
            const tcSetup = tc.setupSql || tc.setup_sql || setupSql;
            const result = runSqlCode(code, tcSetup);
            const expected = (tc.expectedOutput || tc.expected_output || '').trim();
            const actual = (result.output || '').trim();
            results.push({
              input: tc.input || tcSetup || '',
              expected,
              actual,
              passed: actual === expected,
            });
          }
        } else {
          const result = runSqlCode(code, setupSql);
          const expected = (codingPractice?.expectedOutput || codingPractice?.expected_output || '').trim();
          const actual = (result.output || '').trim();
          results.push({ expected, actual, passed: actual === expected });
        }

        const passedCount = results.filter(r => r.passed).length;
        const allPassed = passedCount === results.length;
        setOutput(results.map(r => r.actual).join('\n'));
        setHasRun(true);
        setSubmitStatus(allPassed ? 'pass' : 'fail');
        onComplete?.();
        setSubmitDetails(results);
        submitToBackend(code, results.map(r => r.passed ? 'PASS' : `FAIL: expected "${r.expected}" got "${r.actual}"`));
      } else if (langConfig.type === 'pyodide') {
        // Python: run test cases in browser via Pyodide, then save to backend
        const testCases = codingPractice?.testCases || codingPractice?.test_cases || [];
        const results = [];

        if (testCases.length > 0) {
          for (const tc of testCases) {
            const result = await runPyodideCode(code, tc.input || '');
            const expected = (tc.expectedOutput || tc.expected_output || '').trim();
            const actual = (result.output || '').trim();
            results.push({
              input: tc.input || '',
              expected,
              actual,
              passed: actual === expected,
            });
          }
        } else {
          // Fallback: single expected output comparison
          const result = await runPyodideCode(code);
          const expected = (codingPractice?.expectedOutput || codingPractice?.expected_output || '').trim();
          const actual = (result.output || '').trim();
          results.push({ expected, actual, passed: actual === expected });
        }

        const passedCount = results.filter(r => r.passed).length;
        const allPassed = passedCount === results.length;
        setOutput(results.map(r => r.actual).join('\n'));
        setHasRun(true);
        setSubmitStatus(allPassed ? 'pass' : 'fail');
        onComplete?.();
        setSubmitDetails(results);

        // Save result to backend
        submitToBackend(code, results.map(r => r.passed ? 'PASS' : `FAIL: expected "${r.expected}" got "${r.actual}"`));
      } else if (langConfig.type === 'piston') {
        // Non-web: submit to backend for server-side test case evaluation
        try {
          const res = await api.post('/scores/coding-submit', {
            topicId,
            code,
            language,
            testResults: [],
          });
          const data = res.data;
          const passed = data.passed;
          setOutput(data.results?.map(r => r.actual).join('\n') || '');
          setHasRun(true);
          setSubmitStatus(passed ? 'pass' : 'fail');
          onComplete?.();
          setSubmitDetails(data.results || []);
        } catch {
          // Fallback: run locally if backend fails
          const result = await executePistonCode(code, langConfig.pistonLang, langConfig.pistonVersion);
          setOutput(result.output);
          setHasRun(true);
          setSubmitStatus(result.success ? 'pass' : 'fail');
          setSubmitDetails([]);
        }
      }

      setShowResults(true);
    } catch (err) {
      // code execution failed
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
      setBottomTab('result');
    } else {
      handleSubmitCode().then(() => setBottomTab('result'));
    }
  };

  // Run code and switch to console / result view
  const handleRunCode = async () => {
    await runCode();
    setBottomTab(isWebPlayground ? 'console' : 'result');
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
    padding: { top: 10 },
    readOnly,
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

  // ── StackBlitz Playground (React / Angular) ──
  if (isStackBlitz) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0f0f0f]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a2e] border-b border-[#0f3460] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[#0f3460] text-[#a0a0a0] hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
            <h1 className="text-lg font-bold text-white">{codingPractice.title}</h1>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ backgroundColor: `${langConfig.color}20`, color: langConfig.color }}>
              {langConfig.name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0">
          {/* Problem panel (collapsible) */}
          {showProblem && (
            <div className="w-full sm:w-[350px] shrink-0 bg-[#1a1a2e] border-r border-[#0f3460] flex flex-col overflow-hidden max-h-[40vh] sm:max-h-none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0f3460]">
                <h2 className="text-sm font-semibold text-[#e94560]">Problem Description</h2>
                <button
                  onClick={() => setShowProblem(false)}
                  className="p-1.5 rounded-lg hover:bg-[#0f3460] text-[#a0a0a0] hover:text-white transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                  {renderDescription(codingPractice.description)}
                </div>

                {codingPractice.referenceImage && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold mb-3 text-blue-400 flex items-center gap-2">
                      <FaImage className="text-xs" /> Reference
                    </h3>
                    <img
                      src={getFileUrl(codingPractice.referenceImage)}
                      alt="Reference"
                      className="w-full rounded-lg border border-[#0f3460]"
                    />
                  </div>
                )}

                {codingPractice.hints && codingPractice.hints.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-yellow-500 font-medium text-sm mb-2"
                    >
                      <FaLightbulb /> Hints ({codingPractice.hints.length})
                      {showHints ? <FaChevronDown className="text-xs" /> : <FaChevronUp className="text-xs" />}
                    </button>
                    {showHints && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-yellow-500 text-xs font-medium">
                            Hint {currentHintIndex + 1} of {codingPractice.hints.length}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setCurrentHintIndex(prev => Math.max(0, prev - 1))}
                              disabled={currentHintIndex === 0}
                              className="px-2 py-1 text-xs rounded bg-[#0f3460] disabled:opacity-50"
                            >Prev</button>
                            <button
                              onClick={() => setCurrentHintIndex(prev => Math.min(codingPractice.hints.length - 1, prev + 1))}
                              disabled={currentHintIndex >= codingPractice.hints.length - 1}
                              className="px-2 py-1 text-xs rounded bg-[#0f3460] disabled:opacity-50"
                            >Next</button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300">{codingPractice.hints[currentHintIndex]}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* StackBlitz iframe */}
          <div className="flex-1 min-w-0 relative overflow-hidden">
            {!showProblem && (
              <button
                onClick={() => setShowProblem(true)}
                className="absolute top-3 left-3 z-10 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#e94560] text-white hover:bg-[#e94560]/80 transition-colors shadow-lg"
              >
                Show Problem
              </button>
            )}
            <iframe
              src={langConfig.embedUrl}
              className="w-full border-none absolute inset-0"
              style={{ height: 'calc(100% + 40px)' }}
              title={`${langConfig.name} Playground`}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      {/* LeetCode-style Top Bar */}
      <header className={`h-12 flex items-center justify-between px-3 sm:px-4 border-b shrink-0 ${isDarkMode ? 'bg-[#262626] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
        {/* Left: Back + Title + Difficulty */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onClose}
            title="Back"
            className={`p-1.5 rounded-md transition-colors flex items-center gap-1 ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <FaChevronLeft className="text-xs" />
            <span className="hidden sm:inline text-xs font-medium">Problem List</span>
          </button>
          <div className={`hidden sm:block w-px h-5 ${isDarkMode ? 'bg-[#3e3e3e]' : 'bg-gray-300'}`} />
          <h1 className={`text-sm font-semibold truncate ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {codingPractice.title}
          </h1>
          <span
            className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize shrink-0"
            style={{
              color: codingPractice?.difficulty === 'hard' ? '#ff375f' : codingPractice?.difficulty === 'medium' ? '#ffb800' : '#00b8a3',
              backgroundColor: codingPractice?.difficulty === 'hard' ? 'rgba(255, 55, 95, 0.1)' : codingPractice?.difficulty === 'medium' ? 'rgba(255, 184, 0, 0.1)' : 'rgba(0, 184, 163, 0.1)',
            }}
          >
            {codingPractice?.difficulty || 'easy'}
          </span>
          <span className={`hidden md:inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${isDarkMode ? 'bg-[#3e3e3e] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
            {isWebPlayground ? 'Web' : langConfig.name}
          </span>
        </div>

        {/* Center: Run + Submit (LeetCode signature buttons) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRunCode}
            disabled={isRunning || (langConfig.type === 'pyodide' && !pyodideReady) || (langConfig.type === 'sqljs' && !sqlReady)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'bg-[#3e3e3e] hover:bg-[#4a4a4a] text-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
          >
            <FaPlay className={`text-[10px] ${isRunning ? 'animate-pulse' : ''}`} />
            <span>{isRunning ? 'Running' : langConfig.type === 'pyodide' && !pyodideReady ? 'Loading' : langConfig.type === 'sqljs' && !sqlReady ? 'Loading' : 'Run'}</span>
          </button>

          {topicId && !readOnly && (
            alreadySolved && !submitStatus ? (
              <span className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md bg-[#00b8a3] text-white text-xs sm:text-sm font-semibold cursor-default">
                <FaCheck className="text-[10px]" />
                <span>Solved</span>
              </span>
            ) : (
              <button
                onClick={handleSubmitOrShowResults}
                disabled={submitting}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                  submitStatus === 'pass' ? 'bg-[#00b8a3] hover:bg-[#00a18d]' :
                  submitStatus === 'fail' ? 'bg-[#ff8d00] hover:bg-[#e67d00]' :
                  'bg-[#00b8a3] hover:bg-[#00a18d]'
                }`}
              >
                {submitStatus === 'pass' ? <><FaCheck className="text-[10px]" /><span>Accepted</span></> :
                 submitStatus === 'fail' ? <><FaTimes className="text-[10px]" /><span>Results</span></> :
                 submitting ? <span>Submitting...</span> : <><FaCloudUploadAlt className="text-[11px]" /><span>Submit</span></>}
              </button>
            )
          )}
        </div>

        {/* Right: Utility buttons */}
        <div className="flex items-center gap-1 flex-1 justify-end">
          <button
            onClick={resetCode}
            title="Reset Code"
            className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-400 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
          >
            <FaRedo className="text-xs" />
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy Code"
            className={`p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-400 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
          >
            {copied ? <FaCheck className="text-xs text-[#00b8a3]" /> : <FaCopy className="text-xs" />}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Theme"
            className={`hidden sm:inline-flex p-1.5 rounded-md transition-colors ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-400 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-800'}`}
          >
            {isDarkMode ? <FaSun className="text-xs" /> : <FaMoon className="text-xs" />}
          </button>
        </div>
      </header>

      {/* Mobile Section Tabs (shows only on mobile under top bar) */}
      <div className={`md:hidden flex border-b shrink-0 ${isDarkMode ? 'bg-[#262626] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
        {[
          { id: 'problem', label: 'Description', icon: FaFileAlt },
          { id: 'editor', label: 'Code', icon: FaCode },
          { id: 'output', label: 'Result', icon: FaTerminal }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors relative active:scale-95 ${
              activePanel === tab.id
                ? isDarkMode ? 'text-[#00b8a3]' : 'text-[#00b8a3]'
                : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <tab.icon className="text-xs" />
            {tab.label}
            {activePanel === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b8a3]" />
            )}
          </button>
        ))}
      </div>

      {/* Main Content - Desktop (LeetCode two-pane layout) */}
      <div className="hidden md:block flex-1 min-h-0">
        <Split
          className="split-horizontal h-full"
          sizes={[45, 55]}
          minSize={[280, 400]}
          gutterSize={6}
          direction="horizontal"
          style={{ display: 'flex', height: '100%' }}
        >
          {/* LEFT PANE — Problem (with tabs) */}
          <div className={`h-full flex flex-col overflow-hidden rounded-md ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
            {/* Left Tabs Bar */}
            <div className={`flex items-center gap-1 px-2 border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e] bg-[#262626]' : 'border-gray-200 bg-white'}`}>
              {[
                { id: 'description', label: 'Description', icon: FaFileAlt, color: '#00b8a3' },
                { id: 'hints', label: 'Hints', icon: FaLightbulb, color: '#ffb800', count: codingPractice.hints?.length },
                { id: 'submissions', label: 'Submissions', icon: FaHistory, color: '#7c8ed3' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                    leftTab === tab.id
                      ? `${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-[#00b8a3]`
                      : `${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800'} border-transparent`
                  }`}
                >
                  <tab.icon className="text-[11px]" style={{ color: leftTab === tab.id ? tab.color : undefined }} />
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDarkMode ? 'bg-[#3e3e3e] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Left Tab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Description Tab */}
              {leftTab === 'description' && (
                <div className="p-5">
                  {/* Title block */}
                  <div className="mb-4">
                    <h2 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {codingPractice.title}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
                        style={{
                          color: codingPractice?.difficulty === 'hard' ? '#ff375f' : codingPractice?.difficulty === 'medium' ? '#ffb800' : '#00b8a3',
                          backgroundColor: codingPractice?.difficulty === 'hard' ? 'rgba(255, 55, 95, 0.1)' : codingPractice?.difficulty === 'medium' ? 'rgba(255, 184, 0, 0.1)' : 'rgba(0, 184, 163, 0.1)',
                        }}
                      >
                        {codingPractice?.difficulty || 'easy'}
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${isDarkMode ? 'bg-[#3e3e3e] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {isWebPlayground ? 'Web' : langConfig.name}
                      </span>
                      {codingPractice?.maxScore && (
                        <span className={`text-[11px] flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FaCircle className="text-[6px]" />
                          {codingPractice.maxScore} points
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`h-px mb-4 ${isDarkMode ? 'bg-[#3e3e3e]' : 'bg-gray-200'}`} />

                  {/* Description text */}
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {renderDescription(codingPractice.description)}
                  </div>

                  {/* Image Links */}
                  {codingPractice.imageLinks && codingPractice.imageLinks.length > 0 && (
                    <div className="mt-6">
                      <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaLink className="text-[11px]" /> Image Links
                      </h3>
                      <div className="space-y-1.5">
                        {codingPractice.imageLinks.map((link, index) => (
                          <div key={index} className={`flex items-center gap-2 p-2 rounded border ${isDarkMode ? 'bg-[#1a1a1a] border-[#3e3e3e]' : 'bg-gray-50 border-gray-200'}`}>
                            <span className={`text-[11px] font-medium min-w-[70px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{link.label || `Link ${index + 1}`}:</span>
                            <input type="text" value={link.url} readOnly className={`flex-1 bg-transparent text-[11px] font-mono outline-none truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <button
                              onClick={() => copyImageLink(link.url, index)}
                              className={`px-2 py-1 text-[10px] rounded transition-colors ${copiedLink === index ? 'bg-[#00b8a3] text-white' : isDarkMode ? 'bg-[#3e3e3e] hover:bg-[#4a4a4a] text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
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
                      <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <FaImage className="text-[11px]" /> Reference Image
                      </h3>
                      <div
                        className={`relative group rounded overflow-hidden cursor-pointer transition-colors border ${isDarkMode ? 'border-[#3e3e3e] hover:border-[#00b8a3]' : 'border-gray-200 hover:border-[#00b8a3]'}`}
                        onClick={() => setImageExpanded(true)}
                      >
                        <img
                          src={getFileUrl(codingPractice.referenceImage)}
                          alt="Reference UI"
                          className="w-full max-h-[280px] object-contain bg-white"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setImageExpanded(true); }}
                          className="absolute top-2 right-2 p-2 bg-black/70 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                        >
                          <FaExpand className="text-xs" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Examples (test cases as examples) */}
                  {(codingPractice.testCases || codingPractice.test_cases || []).slice(0, 3).map((tc, i) => {
                    const input = tc.input || tc.setupSql || tc.setup_sql || '';
                    const expected = tc.expectedOutput || tc.expected_output || '';
                    if (!input && !expected) return null;
                    return (
                      <div key={i} className="mt-5">
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Example {i + 1}:
                        </h3>
                        <div className={`p-3 rounded-md font-mono text-xs ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                          {input && (
                            <div className="mb-2">
                              <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Input: </span>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{input}</span>
                            </div>
                          )}
                          {expected && (
                            <div>
                              <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Output: </span>
                              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{expected}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Expected Output (if no test cases) */}
                  {codingPractice.expectedOutput && !(codingPractice.testCases || codingPractice.test_cases || []).length && (
                    <div className="mt-5">
                      <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Expected Output:
                      </h3>
                      <pre className={`p-3 rounded-md text-xs overflow-x-auto font-mono ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                        {codingPractice.expectedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Hints Tab */}
              {leftTab === 'hints' && (
                <div className="p-5">
                  {codingPractice.hints && codingPractice.hints.length > 0 ? (
                    <div className="space-y-3">
                      {codingPractice.hints.map((hint, i) => (
                        <div key={i} className={`rounded-md border p-3 ${isDarkMode ? 'bg-[#1a1a1a] border-[#3e3e3e]' : 'bg-yellow-50 border-yellow-200'}`}>
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                              <FaLightbulb className="text-yellow-500 text-[11px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                                Hint {i + 1}
                              </p>
                              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {hint}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <FaLightbulb className="text-3xl mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hints available for this problem</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submissions Tab */}
              {leftTab === 'submissions' && (
                <div className="p-5">
                  {previousSubmission ? (
                    <div className={`rounded-md border ${isDarkMode ? 'bg-[#1a1a1a] border-[#3e3e3e]' : 'bg-white border-gray-200'}`}>
                      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          {previousSubmission.passed ? (
                            <>
                              <div className="w-2 h-2 rounded-full bg-[#00b8a3]" />
                              <span className="text-sm font-bold text-[#00b8a3]">Accepted</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 rounded-full bg-[#ff375f]" />
                              <span className="text-sm font-bold text-[#ff375f]">Wrong Answer</span>
                            </>
                          )}
                        </div>
                        <span className={`text-[11px] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {previousSubmission.summary?.passedTests ?? 0}/{previousSubmission.summary?.totalTests ?? 0} testcases
                        </span>
                      </div>
                      <div className="p-4">
                        <div className={`text-[11px] uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Submitted Code</div>
                        <pre className={`p-3 rounded text-xs font-mono overflow-x-auto max-h-[300px] overflow-y-auto ${isDarkMode ? 'bg-[#0f0f0f] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                          {previousSubmission.code || '— no code —'}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      <FaHistory className="text-3xl mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No submissions yet</p>
                      <p className="text-xs mt-1 opacity-70">Submit your code to see your history</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE — Editor + Tests (Vertical split) */}
          <div className="h-full min-w-0">
            <Split
              className="split-vertical h-full"
              sizes={[60, 40]}
              minSize={[200, 120]}
              gutterSize={6}
              direction="vertical"
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              {/* TOP: Editor */}
              <div className={`flex flex-col overflow-hidden rounded-md ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
                {/* Editor header */}
                <div className={`flex items-center justify-between px-3 py-2 border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <FaCode className="text-[11px] text-[#00b8a3]" />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Code</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-[#3e3e3e] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                      {isWebPlayground ? 'Web' : langConfig.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={resetCode}
                      title="Reset Code"
                      className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-[#3e3e3e] text-gray-400 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      <FaRedo className="text-[10px]" />
                    </button>
                  </div>
                </div>

                {/* Web Tabs (HTML/CSS/JS) */}
                {isWebPlayground && (
                  <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e] bg-[#262626]' : 'border-gray-200 bg-white'}`}>
                    {[
                      { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                      { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                      { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveWebTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border-r transition-colors ${
                          activeWebTab === tab.id
                            ? `${isDarkMode ? 'bg-[#1a1a1a] text-gray-100 border-b-2 border-b-[#00b8a3]' : 'bg-gray-50 text-gray-900 border-b-2 border-b-[#00b8a3]'}`
                            : `${isDarkMode ? 'text-gray-400 hover:bg-[#3e3e3e] border-[#3e3e3e]' : 'text-gray-500 hover:bg-gray-50 border-gray-200'}`
                        }`}
                      >
                        <tab.icon style={{ color: tab.color }} className="text-xs" />
                        {tab.label}
                      </button>
                    ))}
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

              {/* BOTTOM: Test Cases / Result / Console / Preview */}
              <div className={`flex flex-col overflow-hidden rounded-md ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
                {/* Bottom Tabs Bar */}
                <div className={`flex items-center gap-1 px-2 border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}>
                  {(() => {
                    const tabs = [
                      { id: 'testcase', label: 'Testcase', icon: FaListUl },
                      { id: 'result', label: 'Test Result', icon: FaCheck, badge: submitStatus },
                    ];
                    if (isWebPlayground) {
                      tabs.push({ id: 'preview', label: 'Preview', icon: FaImage });
                    }
                    tabs.push({ id: 'console', label: 'Console', icon: FaTerminal });
                    return tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setBottomTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
                          bottomTab === tab.id
                            ? `${isDarkMode ? 'text-gray-100' : 'text-gray-900'} border-[#00b8a3]`
                            : `${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-500 hover:text-gray-800'} border-transparent`
                        }`}
                      >
                        <tab.icon className="text-[11px]" />
                        <span>{tab.label}</span>
                        {tab.badge === 'pass' && <FaCheck className="text-[10px] text-[#00b8a3]" />}
                        {tab.badge === 'fail' && <FaTimes className="text-[10px] text-[#ff375f]" />}
                      </button>
                    ));
                  })()}
                </div>

                {/* Tab content */}
                <div className="flex-1 min-h-0 overflow-auto">
                  {/* Testcase Tab */}
                  {bottomTab === 'testcase' && (
                    <div className="p-4">
                      {(() => {
                        const cases = codingPractice.testCases || codingPractice.test_cases || [];
                        if (cases.length === 0) {
                          return (
                            <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              <FaListUl className="text-2xl mx-auto mb-2 opacity-30" />
                              <p className="text-xs">No test cases configured for this problem.</p>
                              {codingPractice.expectedOutput && (
                                <div className="mt-4 text-left">
                                  <div className={`text-[11px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expected Output:</div>
                                  <pre className={`p-2 rounded text-xs font-mono ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                    {codingPractice.expectedOutput}
                                  </pre>
                                </div>
                              )}
                            </div>
                          );
                        }
                        const safeIdx = Math.min(activeTestCaseIndex, cases.length - 1);
                        const tc = cases[safeIdx];
                        const tcInput = tc.input || tc.setupSql || tc.setup_sql || '';
                        const tcExpected = tc.expectedOutput || tc.expected_output || '';
                        return (
                          <div>
                            {/* Case pills */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {cases.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveTestCaseIndex(i)}
                                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                    safeIdx === i
                                      ? `${isDarkMode ? 'bg-[#3e3e3e] text-gray-100' : 'bg-gray-200 text-gray-900'}`
                                      : `${isDarkMode ? 'bg-[#1a1a1a] text-gray-400 hover:bg-[#3e3e3e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`
                                  }`}
                                >
                                  Case {i + 1}
                                </button>
                              ))}
                            </div>

                            {/* Case detail */}
                            <div className="space-y-3">
                              {tcInput && (
                                <div>
                                  <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Input</div>
                                  <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                    {tcInput}
                                  </pre>
                                </div>
                              )}
                              {tcExpected && (
                                <div>
                                  <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expected Output</div>
                                  <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                                    {tcExpected}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Test Result Tab */}
                  {bottomTab === 'result' && (
                    <div className="p-4">
                      {!hasRun && !submitStatus && (
                        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          <FaPlay className="text-2xl mx-auto mb-2 opacity-30" />
                          <p className="text-xs">Click <span className="font-semibold">Run</span> to test your code or <span className="font-semibold">Submit</span> for evaluation</p>
                        </div>
                      )}

                      {/* Status banner */}
                      {submitStatus && (
                        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
                          submitStatus === 'pass'
                            ? isDarkMode ? 'bg-[#00b8a3]/10 border border-[#00b8a3]/30' : 'bg-green-50 border border-green-200'
                            : isDarkMode ? 'bg-[#ff375f]/10 border border-[#ff375f]/30' : 'bg-red-50 border border-red-200'
                        }`}>
                          {submitStatus === 'pass' ? (
                            <>
                              <FaCheck className="text-[#00b8a3]" />
                              <span className="text-sm font-bold text-[#00b8a3]">Accepted</span>
                            </>
                          ) : (
                            <>
                              <FaTimes className="text-[#ff375f]" />
                              <span className="text-sm font-bold text-[#ff375f]">Wrong Answer</span>
                            </>
                          )}
                          {submitDetails && submitDetails.length > 0 && (
                            <span className={`ml-auto text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {submitDetails.filter(d => d.passed || d === 'PASS').length}/{submitDetails.length} testcases passed
                            </span>
                          )}
                        </div>
                      )}

                      {/* Non-web case-by-case details */}
                      {!isWebPlayground && submitDetails && submitDetails.length > 0 && !submitDetails[0]?.visual && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {submitDetails.map((tc, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveTestCaseIndex(i)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                  activeTestCaseIndex === i
                                    ? `${isDarkMode ? 'bg-[#3e3e3e] text-gray-100' : 'bg-gray-200 text-gray-900'}`
                                    : `${isDarkMode ? 'bg-[#1a1a1a] text-gray-400 hover:bg-[#3e3e3e]' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${tc.passed ? 'bg-[#00b8a3]' : 'bg-[#ff375f]'}`} />
                                Case {i + 1}
                              </button>
                            ))}
                          </div>
                          {(() => {
                            const idx = Math.min(activeTestCaseIndex, submitDetails.length - 1);
                            const tc = submitDetails[idx];
                            return (
                              <div className="space-y-3">
                                {tc.input && (
                                  <div>
                                    <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Input</div>
                                    <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{tc.input}</pre>
                                  </div>
                                )}
                                <div>
                                  <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expected Output</div>
                                  <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{tc.expected}</pre>
                                </div>
                                <div>
                                  <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Your Output</div>
                                  <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${
                                    tc.passed
                                      ? isDarkMode ? 'bg-[#00b8a3]/10 text-[#00b8a3]' : 'bg-green-50 text-green-700'
                                      : isDarkMode ? 'bg-[#ff375f]/10 text-[#ff375f]' : 'bg-red-50 text-red-700'
                                  }`}>{tc.actual || '(empty)'}</pre>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Web test results */}
                      {isWebPlayground && testResults && testResults.length > 0 && (
                        <div className="space-y-2">
                          {testResults.map((result, i) => {
                            const isPassed = result === 'PASS';
                            return (
                              <div key={i} className={`flex items-center gap-2 p-2 rounded-md ${
                                isPassed
                                  ? isDarkMode ? 'bg-[#00b8a3]/10' : 'bg-green-50'
                                  : isDarkMode ? 'bg-[#ff375f]/10' : 'bg-red-50'
                              }`}>
                                {isPassed
                                  ? <FaCheck className="text-[#00b8a3] text-xs" />
                                  : <FaTimes className="text-[#ff375f] text-xs" />}
                                <span className={`text-xs font-medium ${isPassed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>
                                  Test {i + 1}
                                </span>
                                {!isPassed && (
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {String(result).replace('FAIL:', '').trim()}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Plain stdout (run, no submit) */}
                      {!submitStatus && hasRun && !isWebPlayground && (
                        <div>
                          <div className={`text-[11px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Output</div>
                          <pre className={`p-3 rounded-md text-xs font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                            {output || '(no output)'}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Tab (web only) */}
                  {bottomTab === 'preview' && isWebPlayground && (
                    <div className="h-full bg-white">
                      {webPreview ? (
                        <iframe ref={iframeRef} srcDoc={webPreview} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-modals allow-same-origin" />
                      ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                          Click <span className="mx-1 font-semibold">Run</span> to see preview
                        </div>
                      )}
                    </div>
                  )}

                  {/* Console Tab */}
                  {bottomTab === 'console' && (
                    <div className={`h-full p-3 font-mono text-xs ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                      {isWebPlayground ? (
                        consoleOutput.length > 0 ? (
                          consoleOutput.map((log, i) => (
                            <div key={i} className={`py-0.5 whitespace-pre-wrap ${log.level === 'error' ? 'text-[#ff375f]' : log.level === 'warn' ? 'text-yellow-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {log.message}
                            </div>
                          ))
                        ) : (
                          <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Console output will appear here after Run.</div>
                        )
                      ) : (
                        <div className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {output || <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Click Run to execute code.</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Split>
          </div>
        </Split>
      </div>

      {/* Main Content - Mobile (LeetCode style) */}
      <div className="md:hidden flex-1 min-h-0 flex flex-col">
        {/* Problem Panel - Mobile */}
        {activePanel === 'problem' && (
          <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
            <div className="p-4">
              {/* Title block */}
              <h2 className={`text-base font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                {codingPractice.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold capitalize"
                  style={{
                    color: codingPractice?.difficulty === 'hard' ? '#ff375f' : codingPractice?.difficulty === 'medium' ? '#ffb800' : '#00b8a3',
                    backgroundColor: codingPractice?.difficulty === 'hard' ? 'rgba(255, 55, 95, 0.1)' : codingPractice?.difficulty === 'medium' ? 'rgba(255, 184, 0, 0.1)' : 'rgba(0, 184, 163, 0.1)',
                  }}
                >
                  {codingPractice?.difficulty || 'easy'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${isDarkMode ? 'bg-[#3e3e3e] text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {isWebPlayground ? 'Web' : langConfig.name}
                </span>
              </div>

              <div className={`h-px mb-3 ${isDarkMode ? 'bg-[#3e3e3e]' : 'bg-gray-200'}`} />

              <div className={`text-xs leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {renderDescription(codingPractice.description)}
              </div>

              {codingPractice.referenceImage && (
                <div className="mt-4">
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaImage className="text-[10px]" /> Reference
                  </h3>
                  <img
                    src={getFileUrl(codingPractice.referenceImage)}
                    alt="Reference UI"
                    className={`w-full rounded border ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}
                    onClick={() => setImageExpanded(true)}
                  />
                </div>
              )}

              {/* Examples (test cases) */}
              {(codingPractice.testCases || codingPractice.test_cases || []).slice(0, 3).map((tc, i) => {
                const input = tc.input || tc.setupSql || tc.setup_sql || '';
                const expected = tc.expectedOutput || tc.expected_output || '';
                if (!input && !expected) return null;
                return (
                  <div key={i} className="mt-4">
                    <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Example {i + 1}:
                    </h3>
                    <div className={`p-2.5 rounded font-mono text-[11px] ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                      {input && <div className="mb-1"><span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Input: </span><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{input}</span></div>}
                      {expected && <div><span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Output: </span><span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{expected}</span></div>}
                    </div>
                  </div>
                );
              })}

              {codingPractice.expectedOutput && !(codingPractice.testCases || codingPractice.test_cases || []).length && (
                <div className="mt-4">
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expected Output</h3>
                  <pre className={`p-2.5 rounded text-[11px] overflow-x-auto font-mono ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                    {codingPractice.expectedOutput}
                  </pre>
                </div>
              )}

              {codingPractice.hints && codingPractice.hints.length > 0 && (
                <div className="mt-5">
                  <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2 text-yellow-500`}>
                    <FaLightbulb className="text-[10px]" /> Hints ({codingPractice.hints.length})
                  </h3>
                  <div className="space-y-2">
                    {codingPractice.hints.map((hint, i) => (
                      <div key={i} className={`rounded p-2.5 border ${isDarkMode ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                        <p className={`text-[10px] font-bold uppercase mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Hint {i + 1}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Editor Panel - Mobile */}
        {activePanel === 'editor' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
            {isWebPlayground && (
              <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}>
                {[
                  { id: 'html', label: 'HTML', icon: FaHtml5, color: '#e34c26' },
                  { id: 'css', label: 'CSS', icon: FaCss3Alt, color: '#264de4' },
                  { id: 'js', label: 'JS', icon: FaJs, color: '#f7df1e' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveWebTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 transition-colors relative text-[11px] font-medium
                      ${activeWebTab === tab.id
                        ? isDarkMode ? 'bg-[#1a1a1a] text-gray-100' : 'bg-gray-50 text-gray-900'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    <tab.icon style={{ color: tab.color }} className="text-xs" />
                    {tab.label}
                    {activeWebTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b8a3]" />
                    )}
                  </button>
                ))}
              </div>
            )}
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

        {/* Output / Result Panel - Mobile */}
        {activePanel === 'output' && (
          <div className={`flex-1 flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#262626]' : 'bg-white'}`}>
            {/* Sub-tabs for mobile output */}
            <div className={`flex border-b shrink-0 ${isDarkMode ? 'border-[#3e3e3e]' : 'border-gray-200'}`}>
              {(() => {
                const tabs = [
                  { id: 'testcase', label: 'Testcase', icon: FaListUl },
                  { id: 'result', label: 'Result', icon: FaCheck },
                ];
                if (isWebPlayground) tabs.push({ id: 'preview', label: 'Preview', icon: FaImage });
                tabs.push({ id: 'console', label: 'Console', icon: FaTerminal });
                return tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setBottomTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors relative ${
                      bottomTab === tab.id
                        ? `${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`
                        : `${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`
                    }`}
                  >
                    <tab.icon className="text-[10px]" />
                    {tab.label}
                    {bottomTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00b8a3]" />}
                  </button>
                ));
              })()}
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              {/* Testcase tab */}
              {bottomTab === 'testcase' && (
                <div className="p-3">
                  {(() => {
                    const cases = codingPractice.testCases || codingPractice.test_cases || [];
                    if (cases.length === 0) {
                      return <div className={`text-center py-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No test cases.</div>;
                    }
                    const safeIdx = Math.min(activeTestCaseIndex, cases.length - 1);
                    const tc = cases[safeIdx];
                    return (
                      <>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          {cases.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveTestCaseIndex(i)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium ${safeIdx === i ? (isDarkMode ? 'bg-[#3e3e3e] text-gray-100' : 'bg-gray-200 text-gray-900') : (isDarkMode ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-50 text-gray-500')}`}
                            >
                              Case {i + 1}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {(tc.input || tc.setupSql || tc.setup_sql) && (
                            <div>
                              <div className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Input</div>
                              <pre className={`p-2 rounded text-[11px] font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{tc.input || tc.setupSql || tc.setup_sql}</pre>
                            </div>
                          )}
                          {(tc.expectedOutput || tc.expected_output) && (
                            <div>
                              <div className={`text-[10px] uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expected</div>
                              <pre className={`p-2 rounded text-[11px] font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{tc.expectedOutput || tc.expected_output}</pre>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Result tab */}
              {bottomTab === 'result' && (
                <div className="p-3">
                  {!hasRun && !submitStatus && (
                    <div className={`text-center py-6 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      Run or Submit your code to see results.
                    </div>
                  )}
                  {submitStatus && (
                    <div className={`mb-3 p-2.5 rounded flex items-center gap-2 text-xs font-bold ${
                      submitStatus === 'pass'
                        ? isDarkMode ? 'bg-[#00b8a3]/10 text-[#00b8a3]' : 'bg-green-50 text-green-700'
                        : isDarkMode ? 'bg-[#ff375f]/10 text-[#ff375f]' : 'bg-red-50 text-red-700'
                    }`}>
                      {submitStatus === 'pass' ? <><FaCheck /> Accepted</> : <><FaTimes /> Wrong Answer</>}
                    </div>
                  )}
                  {!isWebPlayground && submitDetails && submitDetails.length > 0 && !submitDetails[0]?.visual && (
                    <div className="space-y-2">
                      {submitDetails.map((tc, i) => (
                        <div key={i} className={`p-2.5 rounded border ${tc.passed ? (isDarkMode ? 'bg-[#00b8a3]/5 border-[#00b8a3]/20' : 'bg-green-50 border-green-200') : (isDarkMode ? 'bg-[#ff375f]/5 border-[#ff375f]/20' : 'bg-red-50 border-red-200')}`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {tc.passed ? <FaCheck className="text-[#00b8a3] text-[10px]" /> : <FaTimes className="text-[#ff375f] text-[10px]" />}
                            <span className={`text-[11px] font-bold ${tc.passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}`}>Case {i + 1}</span>
                          </div>
                          {tc.input && <div className="text-[10px]"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Input: </span><code className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{tc.input}</code></div>}
                          <div className="text-[10px]"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Expected: </span><code className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{tc.expected}</code></div>
                          <div className="text-[10px]"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Got: </span><code className={tc.passed ? 'text-[#00b8a3]' : 'text-[#ff375f]'}>{tc.actual}</code></div>
                        </div>
                      ))}
                    </div>
                  )}
                  {isWebPlayground && testResults && testResults.length > 0 && (
                    <div className="space-y-1.5">
                      {testResults.map((r, i) => {
                        const ok = r === 'PASS';
                        return (
                          <div key={i} className={`p-2 rounded flex items-center gap-1.5 text-[11px] ${ok ? (isDarkMode ? 'bg-[#00b8a3]/10 text-[#00b8a3]' : 'bg-green-50 text-green-700') : (isDarkMode ? 'bg-[#ff375f]/10 text-[#ff375f]' : 'bg-red-50 text-red-700')}`}>
                            {ok ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                            <span className="font-bold">Test {i + 1}</span>
                            {!ok && <span className="text-[10px]">{String(r).replace('FAIL:', '').trim()}</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!submitStatus && hasRun && !isWebPlayground && (
                    <pre className={`p-2.5 rounded text-[11px] font-mono whitespace-pre-wrap ${isDarkMode ? 'bg-[#1a1a1a] text-gray-300' : 'bg-gray-50 text-gray-700'}`}>{output || '(no output)'}</pre>
                  )}
                </div>
              )}

              {/* Preview tab */}
              {bottomTab === 'preview' && isWebPlayground && (
                <div className="h-full bg-white">
                  {webPreview ? (
                    <iframe ref={iframeRef} srcDoc={webPreview} className="w-full h-full border-none" title="Preview" sandbox="allow-scripts allow-modals allow-same-origin" />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 text-gray-400 text-xs">Click Run to see preview</div>
                  )}
                </div>
              )}

              {/* Console tab */}
              {bottomTab === 'console' && (
                <div className={`h-full p-2.5 font-mono text-[11px] ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}>
                  {isWebPlayground ? (
                    consoleOutput.length > 0 ? consoleOutput.map((log, i) => (
                      <div key={i} className={`py-0.5 whitespace-pre-wrap ${log.level === 'error' ? 'text-[#ff375f]' : log.level === 'warn' ? 'text-yellow-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {log.message}
                      </div>
                    )) : <div className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Console will appear here.</div>
                  ) : (
                    <div className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{output || <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Click Run to execute.</span>}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results Panel Overlay */}
      {showResults && submitStatus && (
        <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className={`w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1a1a2e] border-[#0f3460]' : 'bg-white border-gray-200'}`}>
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

              {/* Title & Score Summary */}
              {(() => {
                const details = submitDetails || [];
                let totalTests, passedTests;

                if (isWebPlayground && testResults && testResults.length > 0) {
                  // Web: testResults is array of 'PASS' / 'FAIL:...' strings
                  totalTests = testResults.length;
                  passedTests = testResults.filter(r => r === 'PASS').length;
                } else if (isWebPlayground && details[0] && details[0].total !== undefined) {
                  totalTests = details[0].total;
                  passedTests = details[0].passed;
                } else if (!isWebPlayground && details.length > 0 && !details[0]?.visual) {
                  totalTests = details.length;
                  passedTests = details.filter(d => d.passed).length;
                } else {
                  totalTests = submitStatus === 'pass' ? 1 : 0;
                  passedTests = submitStatus === 'pass' ? 1 : 0;
                }

                const scorePercent = totalTests > 0
                  ? Math.round((passedTests / totalTests) * 100)
                  : (submitStatus === 'pass' ? 100 : 0);
                const allPassed = totalTests > 0 && passedTests === totalTests;

                return (
                  <>
                    <h3 className={`text-2xl font-extrabold ${allPassed ? 'text-green-400' : 'text-red-400'}`}>
                      {allPassed ? 'All Tests Passed!' : `${passedTests}/${totalTests} Tests Passed`}
                    </h3>
                    <p className={`mt-2 text-base ${isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}`}>
                      {allPassed ? 'Great job! All tests passed successfully.' : `${totalTests - passedTests} test${totalTests - passedTests > 1 ? 's' : ''} failed. Check the details below.`}
                    </p>

                    {totalTests > 0 && (
                      <div className="mt-4 px-4">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className={isDarkMode ? 'text-[#a0a0a0]' : 'text-gray-500'}>Score</span>
                          <span className={`font-bold ${allPassed ? 'text-green-400' : scorePercent >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                            {scorePercent}%
                          </span>
                        </div>
                        <div className={`h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#0f3460]/30' : 'bg-gray-200'}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${allPassed ? 'bg-green-500' : scorePercent >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
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
