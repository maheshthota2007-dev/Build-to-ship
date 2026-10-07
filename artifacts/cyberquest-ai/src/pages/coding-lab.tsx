import { useState, useRef, useEffect, useCallback } from 'react';
import { Shell, NeedAuth } from '../App';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  RotateCcw, 
  Save, 
  Check, 
  X, 
  Terminal, 
  Sparkles, 
  Bug, 
  FileCode, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  Lightbulb, 
  Copy, 
  Code2, 
  Trash2,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  expected: string;
  matchType?: 'exact' | 'contains';
}

interface Challenge {
  id: string;
  title: string;
  diff: string;
  category: string;
  description: string;
  task: string;
  requirements: string[];
  hint: string;
  starters: Record<string, string>;
  testCases: TestCase[];
}

const CHALLENGES: Challenge[] = [
  {
    id: 'sandbox',
    title: 'Sandbox Environment',
    diff: 'Easy / Beginner',
    category: 'FREE PLAY',
    description: 'Welcome to the CyberQuest Coding Lab. Write and execute code in a secure isolated environment.',
    task: 'Write a Python program that prints:\n\nHello, CyberQuest!',
    requirements: [
      'Use a main() function',
      'Print the required output',
      'Run the program successfully'
    ],
    hint: 'Use print() to display the message to standard output.',
    testCases: [
      {
        id: 't1',
        name: 'Print Hello, CyberQuest!',
        expected: 'Hello, CyberQuest!',
        matchType: 'contains'
      }
    ],
    starters: {
      python: `def main():\n    print("Hello, CyberQuest!")\n\nif __name__ == "__main__":\n    main()`,
      javascript: `function main() {\n    console.log("Hello, CyberQuest!");\n}\n\nmain();`,
      'c++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CyberQuest!" << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CyberQuest!");\n    }\n}`,
      c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, CyberQuest!\\n");\n    return 0;\n}`,
      sql: `SELECT 'Hello, CyberQuest!' AS message;`
    }
  },
  {
    id: 'string_reverse',
    title: 'Reverse a String',
    diff: 'Easy',
    category: 'STRINGS & MEMORY',
    description: 'Implement string reversal to understand buffer indexing and memory traversal fundamentals.',
    task: "Write a function reverse_str(s) and test it with 'cyberquest' to output 'tseuqrybec'.",
    requirements: [
      'Define a reverse_str(s) function',
      'Reverse the input characters',
      'Print the reversed string'
    ],
    hint: 'In Python, slice notation s[::-1] or a backward iteration loop works cleanly.',
    testCases: [
      {
        id: 't1',
        name: "Reverse 'cyberquest'",
        expected: 'tseuqrybec',
        matchType: 'contains'
      }
    ],
    starters: {
      python: `def reverse_str(s: str) -> str:\n    # Implement reversal logic\n    return s[::-1]\n\ndef main():\n    payload = "cyberquest"\n    print(reverse_str(payload))\n\nif __name__ == "__main__":\n    main()`,
      javascript: `function reverseStr(str) {\n    return str.split('').reverse().join('');\n}\n\nfunction main() {\n    console.log(reverseStr("cyberquest"));\n}\n\nmain();`,
      'c++': `#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s = "cyberquest";\n    reverse(s.begin(), s.end());\n    cout << s << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static void main(String[] args) {\n        String s = "cyberquest";\n        System.out.println(new StringBuilder(s).reverse().toString());\n    }\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char s[] = "cyberquest";\n    int len = strlen(s);\n    for(int i = len - 1; i >= 0; i--) putchar(s[i]);\n    putchar('\\n');\n    return 0;\n}`,
      sql: `SELECT 'tseuqrybec' AS reversed;`
    }
  },
  {
    id: 'sqli_detector',
    title: 'SQL Injection Detector',
    diff: 'Medium',
    category: 'SECURE CODING',
    description: 'Build an input validation check that detects classic SQL injection patterns such as OR tautologies and UNION operators.',
    task: "Write a detector function is_sqli(payload). If the payload contains ' OR ', 'UNION SELECT', or '--', print 'VULNERABLE: True', otherwise 'VULNERABLE: False'.",
    requirements: [
      'Inspect payload case-insensitively',
      'Check for common SQLi signatures',
      'Print formatted verdict'
    ],
    hint: "Use upper() on the input string to match keywords regardless of casing.",
    testCases: [
      {
        id: 't1',
        name: 'Detect SQLi payload',
        expected: 'VULNERABLE: True',
        matchType: 'contains'
      }
    ],
    starters: {
      python: `def is_sqli(payload: str) -> bool:\n    signatures = ["' OR ", "UNION SELECT", "--", ";--"]\n    upper_payload = payload.upper()\n    return any(sig.upper() in upper_payload for sig in signatures)\n\ndef main():\n    test_input = "admin' OR '1'='1"\n    detected = is_sqli(test_input)\n    print(f"VULNERABLE: {detected}")\n\nif __name__ == "__main__":\n    main()`,
      javascript: `function isSqli(payload) {\n    const sigs = ["' OR ", "UNION SELECT", "--", ";--"];\n    const up = payload.toUpperCase();\n    return sigs.some(s => up.includes(s.toUpperCase()));\n}\n\nfunction main() {\n    const test = "admin' OR '1'='1";\n    console.log("VULNERABLE: " + isSqli(test));\n}\n\nmain();`,
      'c++': `#include <iostream>\n#include <string>\nusing namespace std;\n\nbool is_sqli(const string& s) {\n    return s.find("' OR ") != string::npos || s.find("--") != string::npos;\n}\n\nint main() {\n    string test = "admin' OR '1'='1";\n    cout << "VULNERABLE: " << (is_sqli(test) ? "True" : "False") << endl;\n    return 0;\n}`,
      java: `public class Main {\n    public static void main(String[] args) {\n        String test = "admin' OR '1'='1";\n        boolean isSqli = test.toUpperCase().contains("' OR ");\n        System.out.println("VULNERABLE: " + (isSqli ? "True" : "False"));\n    }\n}`,
      c: `#include <stdio.h>\n#include <string.h>\n\nint main() {\n    char test[] = "admin' OR '1'='1";\n    int isSqli = strstr(test, "' OR ") != NULL;\n    printf("VULNERABLE: %s\\n", isSqli ? "True" : "False");\n    return 0;\n}`,
      sql: `SELECT 'VULNERABLE: True' AS analysis;`
    }
  }
];

export default function CodingLab() {
  const [selectedChallengeId, setSelectedChallengeId] = useState('sandbox');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(CHALLENGES[0].starters['python']);
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<'output' | 'tests'>('output');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // AI Modals
  const [aiModal, setAiModal] = useState<{
    type: 'explain' | 'debug';
    isOpen: boolean;
    loading: boolean;
    data: any;
    error: string;
  }>({
    type: 'explain',
    isOpen: false,
    loading: false,
    data: null,
    error: '',
  });

  const editorRef = useRef<any>(null);

  const currentChallenge = CHALLENGES.find(c => c.id === selectedChallengeId) || CHALLENGES[0];

  // Helper to load code from local storage or starter
  const getInitialCode = useCallback((challengeId: string, lang: string) => {
    const ch = CHALLENGES.find(c => c.id === challengeId) || CHALLENGES[0];
    const saved = localStorage.getItem(`cyberquest_code_${challengeId}_${lang}`);
    if (saved) return saved;
    return ch.starters[lang] || ch.starters['python'] || '';
  }, []);

  // Update code when challenge or language switches
  const handleChallengeChange = (chId: string) => {
    setSelectedChallengeId(chId);
    const initialCode = getInitialCode(chId, language);
    setCode(initialCode);
    setOutput('');
    setStderr('');
    setExitCode(null);
    setExecutionTime(null);
    setRunStatus('idle');
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const initialCode = getInitialCode(selectedChallengeId, lang);
    setCode(initialCode);
    setOutput('');
    setStderr('');
    setExitCode(null);
    setExecutionTime(null);
    setRunStatus('idle');
  };

  // Reset Code handler
  const handleResetRequest = () => {
    const defaultCode = currentChallenge.starters[language] || '';
    if (code.trim() !== defaultCode.trim()) {
      setShowResetConfirm(true);
    } else {
      executeReset();
    }
  };

  const executeReset = () => {
    const defaultCode = currentChallenge.starters[language] || '';
    setCode(defaultCode);
    localStorage.removeItem(`cyberquest_code_${selectedChallengeId}_${language}`);
    setOutput('');
    setStderr('');
    setExitCode(null);
    setExecutionTime(null);
    setRunStatus('idle');
    setShowResetConfirm(false);
  };

  // Save Code
  const handleSave = async () => {
    localStorage.setItem(`cyberquest_code_${selectedChallengeId}_${language}`, code);
    try {
      await fetch('/api/code/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: selectedChallengeId === 'sandbox' ? 0 : 1,
          language,
          code,
        }),
      });
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2800);
  };

  // Execute Code
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setRunStatus('running');
    setErrorMsg('');
    setOutput('');
    setStderr('');
    setExitCode(null);
    setActiveTab('output');

    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, stdin: '' }),
      });

      const data = await res.json();
      if (!data.success) {
        setRunStatus('error');
        setErrorMsg(data.error || 'Execution failed');
        setStderr(data.details || '');
        setExitCode(1);
      } else {
        setOutput(data.stdout || '');
        setStderr(data.stderr || '');
        setExitCode(data.exitCode ?? 0);
        setExecutionTime(data.executionTime ?? null);

        if (data.exitCode === 0 && !data.stderr) {
          setRunStatus('success');
        } else {
          setRunStatus('error');
        }
      }
    } catch (e: any) {
      setRunStatus('error');
      setErrorMsg(e.message || 'Network error during execution');
    } finally {
      setIsRunning(false);
    }
  };

  // AI Explain
  const handleAiExplain = async () => {
    setAiModal({
      type: 'explain',
      isOpen: true,
      loading: true,
      data: null,
      error: '',
    });

    try {
      const res = await fetch('/api/code/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiModal(prev => ({ ...prev, loading: false, data: data.data }));
      } else {
        setAiModal(prev => ({ ...prev, loading: false, error: data.error || 'Failed to generate explanation' }));
      }
    } catch (err: any) {
      setAiModal(prev => ({ ...prev, loading: false, error: err.message || 'Error communicating with AI mentor' }));
    }
  };

  // AI Debug
  const handleAiDebug = async () => {
    setAiModal({
      type: 'debug',
      isOpen: true,
      loading: true,
      data: null,
      error: '',
    });

    try {
      const errorContext = stderr || errorMsg || output || 'Execution check';
      const res = await fetch('/api/code/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, errorOutput: errorContext }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiModal(prev => ({ ...prev, loading: false, data: data.data }));
      } else {
        setAiModal(prev => ({ ...prev, loading: false, error: data.error || 'Failed to debug code' }));
      }
    } catch (err: any) {
      setAiModal(prev => ({ ...prev, loading: false, error: err.message || 'Error communicating with AI debugger' }));
    }
  };

  // Keyboard shortcut listener for Ctrl+Enter / Cmd+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, isRunning]);

  // Monaco editor mount handler
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    // Bind Ctrl+Enter inside Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRun();
    });
  };

  // Calculate file extension / name
  const getFileName = (lang: string) => {
    switch (lang) {
      case 'python': return 'main.py';
      case 'javascript': return 'main.js';
      case 'c++': return 'main.cpp';
      case 'java': return 'Main.java';
      case 'c': return 'main.c';
      case 'sql': return 'query.sql';
      default: return `main.${lang}`;
    }
  };

  // Evaluate test cases
  const evaluatedTests = currentChallenge.testCases.map((tc) => {
    if (exitCode === null && !output) {
      return { ...tc, status: 'untested' as const, received: '' };
    }
    const cleanOutput = output.trim();
    const passed = tc.matchType === 'contains' 
      ? cleanOutput.includes(tc.expected) 
      : cleanOutput === tc.expected;
    return {
      ...tc,
      status: passed ? ('passed' as const) : ('failed' as const),
      received: cleanOutput || (stderr ? `[Error]: ${stderr.slice(0, 80)}` : '(No output)'),
    };
  });

  const passedCount = evaluatedTests.filter(t => t.status === 'passed').length;
  const totalCount = evaluatedTests.length;

  return (
    <NeedAuth>
      <Shell>
        <div className="coding-lab-page fade-in">
          {/* Top Header Bar */}
          <header className="coding-lab-header">
            <div className="lab-title-area">
              <div className="lab-icon-badge">
                <Code2 size={20} />
              </div>
              <div className="lab-title-info">
                <h1 className="lab-title">CYBERQUEST CODING LAB</h1>
                <div className="lab-subtitle">
                  <span className="lab-status-dot"></span>
                  <span>Practice • Debug • Execute</span>
                </div>
              </div>
            </div>

            <div className="lab-header-controls">
              {/* Language Selector */}
              <div className="lab-select-wrapper">
                <select 
                  className="lab-lang-select"
                  value={language} 
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  aria-label="Select Programming Language"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="c++">C++</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="sql">SQL</option>
                </select>
                <ChevronDown size={14} className="lab-select-chevron" />
              </div>

              {/* Reset Button */}
              <button 
                className="lab-btn-reset" 
                onClick={handleResetRequest}
                title="Reset code to default template"
                aria-label="Reset Code"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>

              {/* Run Button */}
              <button 
                className={`lab-btn-run ${isRunning ? 'is-running' : ''}`}
                onClick={handleRun}
                disabled={isRunning}
                title="Execute code (Ctrl + Enter)"
              >
                {isRunning ? (
                  <>
                    <Clock size={15} className="animate-spin" />
                    <span>Running...</span>
                  </>
                ) : runStatus === 'success' ? (
                  <>
                    <Check size={15} />
                    <span>Run</span>
                  </>
                ) : runStatus === 'error' ? (
                  <>
                    <Play size={15} />
                    <span>Run</span>
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    <span>Run</span>
                  </>
                )}
              </button>
            </div>
          </header>

          {/* Main Workspace (Split Grid) */}
          <div className="coding-lab-workspace">
            {/* LEFT: Challenge & Instructions Panel */}
            <aside className="challenge-panel">
              <div className="challenge-header-bar">
                <div className="challenge-badge-group">
                  <span className="badge-pill-accent">CHALLENGE</span>
                  <span className="badge-pill-diff">{currentChallenge.diff}</span>
                </div>
                <span className="mono" style={{ fontSize: 10, color: '#6a8883' }}>
                  {currentChallenge.category}
                </span>
              </div>

              <div className="challenge-body-scroll">
                {/* Challenge Switcher Dropdown */}
                <div className="challenge-selector-row">
                  <label className="challenge-selector-label">SELECT CHALLENGE</label>
                  <select 
                    className="challenge-select-dropdown"
                    value={selectedChallengeId}
                    onChange={(e) => handleChallengeChange(e.target.value)}
                  >
                    {CHALLENGES.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h2 className="challenge-main-heading">{currentChallenge.title}</h2>
                  <p className="challenge-desc-text" style={{ marginTop: 6 }}>
                    {currentChallenge.description}
                  </p>
                </div>

                {/* TASK */}
                <div className="challenge-section-block">
                  <h3 className="challenge-section-title">
                    <Terminal size={12} />
                    <span>TASK</span>
                  </h3>
                  <p className="challenge-task-content">{currentChallenge.task}</p>
                </div>

                {/* REQUIREMENTS */}
                <div className="challenge-section-block">
                  <h3 className="challenge-section-title">
                    <CheckCircle2 size={12} />
                    <span>REQUIREMENTS</span>
                  </h3>
                  <ul className="challenge-req-list">
                    {currentChallenge.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* HINT */}
                <div className="challenge-hint-box">
                  <Lightbulb size={16} className="challenge-hint-icon" />
                  <div>
                    <strong style={{ color: '#43e2b0', fontSize: 11, display: 'block', marginBottom: 2 }}>
                      HINT
                    </strong>
                    <span>{currentChallenge.hint}</span>
                  </div>
                </div>
              </div>

              {/* Panel Footer: Save Code */}
              <div className="challenge-panel-footer">
                <button className="lab-save-btn" onClick={handleSave} title="Save current code to account">
                  <Save size={14} />
                  <span>Save Code</span>
                </button>
                {savedSuccess && (
                  <span className="lab-save-toast">
                    <Check size={12} /> Saved
                  </span>
                )}
              </div>
            </aside>

            {/* RIGHT: Code Editor + Output Area */}
            <main className="editor-workspace">
              {/* Code Editor Card */}
              <div className="editor-card">
                <div className="editor-toolbar">
                  <div className="editor-file-tab">
                    <FileCode size={13} />
                    <span>{getFileName(language)}</span>
                    <span className="editor-file-dot"></span>
                  </div>

                  <div className="editor-actions-group">
                    <button 
                      className="lab-tool-btn" 
                      onClick={handleAiExplain}
                      title="Get an educational explanation of this code from Gemini"
                      disabled={aiModal.loading}
                    >
                      <Sparkles size={13} style={{ color: '#43e2b0' }} />
                      <span>AI Explain</span>
                    </button>
                    <button 
                      className="lab-tool-btn" 
                      onClick={handleAiDebug}
                      title="Diagnose errors or potential security issues with AI"
                      disabled={aiModal.loading}
                    >
                      <Bug size={13} style={{ color: '#52d3a8' }} />
                      <span>AI Debug</span>
                    </button>
                  </div>
                </div>

                <div className="monaco-editor-shell">
                  <Editor
                    height="100%"
                    language={language === 'c++' ? 'cpp' : language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    onMount={handleEditorMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 22,
                      fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
                      padding: { top: 14, bottom: 14 },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      cursorBlinking: 'smooth',
                      smoothScrolling: true,
                      wordWrap: 'on',
                      tabSize: 4,
                      renderLineHighlight: 'all',
                    }}
                  />
                </div>
              </div>

              {/* Output Panel Card */}
              <div className="output-card">
                <div className="output-header-bar">
                  <div className="output-tabs">
                    <button 
                      className={`output-tab-btn ${activeTab === 'output' ? 'is-active' : ''}`}
                      onClick={() => setActiveTab('output')}
                    >
                      <Terminal size={13} />
                      <span>OUTPUT</span>
                    </button>
                    <button 
                      className={`output-tab-btn ${activeTab === 'tests' ? 'is-active' : ''}`}
                      onClick={() => setActiveTab('tests')}
                    >
                      <CheckCircle2 size={13} />
                      <span>TEST CASES</span>
                      <span className="output-tab-counter">
                        {exitCode === null ? `${totalCount}` : `${passedCount}/${totalCount}`}
                      </span>
                    </button>
                  </div>

                  <div className="output-actions-bar">
                    {executionTime !== null && (
                      <span className="output-meta-time">
                        {executionTime}ms
                      </span>
                    )}
                    {(output || stderr || errorMsg) && (
                      <button 
                        className="output-btn-clear" 
                        onClick={() => { setOutput(''); setStderr(''); setErrorMsg(''); setExitCode(null); }}
                        title="Clear terminal output"
                      >
                        <Trash2 size={12} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab 1: Terminal Output */}
                {activeTab === 'output' && (
                  <div className="output-pane-content">
                    {exitCode !== null && (
                      <div className={`output-status-banner ${exitCode === 0 && !stderr ? 'is-success' : 'is-error'}`}>
                        {exitCode === 0 && !stderr ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Execution completed successfully</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>{errorMsg || `Execution finished with error (code ${exitCode})`}</span>
                          </>
                        )}
                      </div>
                    )}

                    {(output || stderr || isRunning) ? (
                      <>
                        <div className="terminal-cmd-line">
                          $ {language === 'python' ? `python ${getFileName(language)}` : language === 'javascript' ? `node ${getFileName(language)}` : `run ${getFileName(language)}`}
                        </div>
                        {output && <pre className="terminal-stdout">{output}</pre>}
                        {stderr && <pre className="terminal-stderr">{stderr}</pre>}
                      </>
                    ) : (
                      <div className="terminal-placeholder">
                        // Click "Run" or press Ctrl+Enter to execute your code in the secure sandbox.
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Test Cases */}
                {activeTab === 'tests' && (
                  <div className="output-pane-content">
                    <div className="test-cases-pane">
                      <div className="test-summary-strip">
                        <span style={{ color: '#8dbcb0' }}>
                          Challenge: <strong>{currentChallenge.title}</strong>
                        </span>
                        <span style={{ color: passedCount === totalCount && exitCode !== null ? '#43e2b0' : '#89999e' }}>
                          {exitCode === null ? 'Run code to execute test cases' : `${passedCount} of ${totalCount} Passed`}
                        </span>
                      </div>

                      {evaluatedTests.map((t, idx) => (
                        <div 
                          key={t.id} 
                          className={`test-case-item ${t.status === 'passed' ? 'is-passed' : t.status === 'failed' ? 'is-failed' : ''}`}
                        >
                          <div className="test-case-top">
                            <div className="test-case-title">
                              {t.status === 'passed' ? (
                                <CheckCircle2 size={15} style={{ color: '#43e2b0' }} />
                              ) : t.status === 'failed' ? (
                                <XCircle size={15} style={{ color: '#ff6b7e' }} />
                              ) : (
                                <span className="mono" style={{ color: '#5b7871' }}>•</span>
                              )}
                              <span>Test {idx + 1}: {t.name}</span>
                            </div>
                            <span className="badge-pill-accent test-case-status-tag" style={{
                              background: t.status === 'passed' ? 'rgba(67, 226, 176, 0.15)' : t.status === 'failed' ? 'rgba(230, 80, 95, 0.15)' : 'rgba(40, 60, 55, 0.4)',
                              color: t.status === 'passed' ? '#43e2b0' : t.status === 'failed' ? '#ff6b7e' : '#7b9991',
                              borderColor: t.status === 'passed' ? 'rgba(67, 226, 176, 0.4)' : t.status === 'failed' ? 'rgba(230, 80, 95, 0.4)' : '#26423b'
                            }}>
                              {t.status === 'passed' ? 'PASSED' : t.status === 'failed' ? 'FAILED' : 'READY'}
                            </span>
                          </div>

                          <div className="test-case-meta">
                            <div className="test-row">
                              <span className="test-label">Expected:</span>
                              <span className="test-val">{t.expected}</span>
                            </div>
                            {t.status !== 'untested' && (
                              <div className="test-row">
                                <span className="test-label">Received:</span>
                                <span className="test-val" style={{ color: t.status === 'passed' ? '#43e2b0' : '#ff7a88' }}>
                                  {t.received || '(empty)'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* AI Explain & Debug Modal */}
          {aiModal.isOpen && (
            <div className="ai-modal-overlay" onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}>
              <div className="ai-modal-window" onClick={e => e.stopPropagation()}>
                <div className="ai-modal-header">
                  <div className="ai-modal-title-wrap">
                    {aiModal.type === 'explain' ? (
                      <Sparkles size={18} style={{ color: '#43e2b0' }} />
                    ) : (
                      <Bug size={18} style={{ color: '#43e2b0' }} />
                    )}
                    <h2 className="ai-modal-title">
                      {aiModal.type === 'explain' ? 'AI CODE EXPLANATION' : 'AI CODE DEBUGGER'}
                    </h2>
                  </div>
                  <button className="ai-modal-close" onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}>
                    <X size={16} />
                  </button>
                </div>

                <div className="ai-modal-scroll">
                  {aiModal.loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7ba096' }}>
                      <Clock size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#43e2b0' }} />
                      <p style={{ margin: 0, fontFamily: 'DM Mono', fontSize: 13 }}>
                        {aiModal.type === 'explain' 
                          ? 'Analyzing code structure & defensive principles with Gemini...' 
                          : 'Diagnosing execution errors & generating fixes...'}
                      </p>
                    </div>
                  ) : aiModal.error ? (
                    <div style={{ padding: 15, background: 'rgba(60, 20, 26, 0.4)', border: '1px solid #7c222e', borderRadius: 8, color: '#ff7b8a' }}>
                      <strong>AI Assistance Error:</strong> {aiModal.error}
                    </div>
                  ) : aiModal.data && (
                    <>
                      {aiModal.type === 'explain' ? (
                        <>
                          <div className="ai-summary-highlight">
                            {aiModal.data.summary}
                          </div>

                          <div className="ai-card-section">
                            <h3 className="ai-card-title">
                              <Code2 size={13} />
                              <span>HOW IT WORKS</span>
                            </h3>
                            <p style={{ margin: 0, color: '#cfdeda' }}>{aiModal.data.explanation}</p>
                          </div>

                          {aiModal.data.keyPoints?.length > 0 && (
                            <div className="ai-card-section">
                              <h3 className="ai-card-title">
                                <CheckCircle2 size={13} />
                                <span>KEY CONCEPTS</span>
                              </h3>
                              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {aiModal.data.keyPoints.map((pt: string, i: number) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {aiModal.data.securityConsiderations?.length > 0 && (
                            <div className="ai-card-section" style={{ borderColor: 'rgba(67, 226, 176, 0.35)' }}>
                              <h3 className="ai-card-title" style={{ color: '#43e2b0' }}>
                                <ShieldAlert size={13} />
                                <span>CYBERSECURITY & DEFENSIVE NOTES</span>
                              </h3>
                              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {aiModal.data.securityConsiderations.map((sc: string, i: number) => (
                                  <li key={i}>{sc}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="ai-summary-highlight" style={{ borderLeftColor: '#ff7584', background: 'rgba(45, 18, 22, 0.4)' }}>
                            <strong style={{ color: '#ff929e' }}>ISSUE: </strong>
                            <span>{aiModal.data.issue}</span>
                          </div>

                          <div className="ai-card-section">
                            <h3 className="ai-card-title">
                              <Bug size={13} />
                              <span>ANALYSIS & ROOT CAUSE</span>
                            </h3>
                            <p style={{ margin: 0 }}>{aiModal.data.explanation}</p>
                          </div>

                          {aiModal.data.fixedCode && (
                            <div className="ai-card-section">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="ai-card-title">
                                  <Check size={13} />
                                  <span>RECOMMENDED FIX</span>
                                </h3>
                                <button 
                                  className="lab-tool-btn"
                                  onClick={() => {
                                    setCode(aiModal.data.fixedCode);
                                    setAiModal(prev => ({ ...prev, isOpen: false }));
                                  }}
                                  title="Replace current editor content with corrected code"
                                >
                                  Apply to Editor
                                </button>
                              </div>
                              <pre className="ai-code-snippet">{aiModal.data.fixedCode}</pre>
                            </div>
                          )}

                          {aiModal.data.preventionTips?.length > 0 && (
                            <div className="ai-card-section">
                              <h3 className="ai-card-title">
                                <Lightbulb size={13} />
                                <span>PREVENTION TIPS</span>
                              </h3>
                              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                                {aiModal.data.preventionTips.map((tip: string, i: number) => (
                                  <li key={i}>{tip}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="ai-modal-footer">
                  <button className="btn-secondary" onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Confirmation Dialog */}
          {showResetConfirm && (
            <div className="ai-modal-overlay" onClick={() => setShowResetConfirm(false)}>
              <div className="confirm-modal-window" onClick={e => e.stopPropagation()}>
                <h3 className="confirm-modal-title">Reset Code Template?</h3>
                <p className="confirm-modal-text">
                  Your current edits for this challenge will be replaced with the default starter template. This cannot be undone.
                </p>
                <div className="confirm-actions">
                  <button className="btn-secondary" onClick={() => setShowResetConfirm(false)}>
                    Cancel
                  </button>
                  <button className="btn-danger" onClick={executeReset}>
                    Reset Code
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Shell>
    </NeedAuth>
  );
}
