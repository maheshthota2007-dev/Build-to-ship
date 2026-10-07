import { useEffect, useState, useTransition } from 'react';
import { useLocation, useParams, Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Shell, NeedAuth, Button } from '../App';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Code,
  Flame,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Terminal,
  Bot,
  Layers,
  Shield,
  HelpCircle
} from 'lucide-react';

interface LessonData {
  id: number;
  courseId: string;
  slug: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  type: string;
  objectives: string[];
  content: string;
  starterCode?: string;
  solutionCode?: string;
  xpReward: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  course: {
    id: string;
    name: string;
    category?: string;
    description?: string;
  };
  previousLesson: { id: number; slug: string; order: number; title: string } | null;
  nextLesson: { id: number; slug: string; order: number; title: string } | null;
}

export default function LessonView() {
  const params = useParams<{ courseId?: string; lessonId?: string }>();
  const [, setLocation] = useLocation();

  const courseIdParam = params.courseId || 'python';
  const lessonIdParam = params.lessonId || '1';

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completedCelebration, setCompletedCelebration] = useState(false);
  const [awardedXp, setAwardedXp] = useState(0);

  // Fetch lesson data
  const fetchLesson = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lessons/${lessonIdParam}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Lesson could not be found.');
        } else {
          setError(`Unable to load lesson (HTTP ${res.status}).`);
        }
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setLesson(json.data);
        setCode(json.data.starterCode || '');
        setOutput('');
        setCompletedCelebration(false);

        // If not started, mark in progress
        if (json.data.status === 'NOT_STARTED') {
          fetch(`/api/lessons/${json.data.id}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          }).catch(() => {});
        }
      } else {
        setError('Invalid lesson data received from server.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error while retrieving lesson.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [lessonIdParam]);

  // Handle Mark Complete
  const handleMarkComplete = async () => {
    if (!lesson) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${lesson.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setLesson(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
        setAwardedXp(data.data?.xpAwarded ?? 50);
        setCompletedCelebration(true);
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    } finally {
      setCompleting(false);
    }
  };

  // Run local code in sandbox simulation
  const handleRunCode = () => {
    setRunning(true);
    setOutput('Compiling and executing code in isolated sandbox...');
    setTimeout(() => {
      setRunning(false);
      setOutput(`[CYBERQUEST PYTHON RUNTIME - SUCCESS]\nExecution time: 42ms | Memory: 3.8MB\n----------------------------------------\nCYBERQUEST PYTHON ENVIRONMENT READY\nPlatform: virtual_sandbox_linux_x86_64\nTarget Analysis: SECURE\n>>> Execution finished with exit code 0.`);
    }, 700);
  };

  // Navigate to AI Tutor with context
  const handleAskAi = () => {
    if (!lesson) return;
    const prompt = encodeURIComponent(`I'm studying the lesson "${lesson.title}" in the ${lesson.course.name} course. Can you explain the core concepts and give me a practical defensive security example?`);
    setLocation(`/mentor?prompt=${prompt}`);
  };

  // Navigation handlers
  const handlePrev = () => {
    if (lesson?.previousLesson) {
      setLocation(`/courses/${courseIdParam}/lessons/${lesson.previousLesson.id}`);
    }
  };

  const handleNext = () => {
    if (lesson?.nextLesson) {
      setLocation(`/courses/${courseIdParam}/lessons/${lesson.nextLesson.id}`);
    } else {
      // Completed all lessons in course!
      setLocation(`/programming?course=${courseIdParam}`);
    }
  };

  const handleBackToCourse = () => {
    setLocation(`/programming?course=${courseIdParam}`);
  };

  if (loading) {
    return (
      <NeedAuth>
        <Shell>
          <div className="lesson-view-container">
            <div className="lesson-loading-state">
              <div className="skeleton-line" style={{ width: 120, height: 16, margin: '0 auto 16px' }} />
              <div className="skeleton-line" style={{ width: 340, height: 28, margin: '0 auto 24px' }} />
              <p className="mono" style={{ color: '#43e2b0', fontSize: 14 }}>
                Loading secure lesson workspace...
              </p>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  if (error || !lesson) {
    return (
      <NeedAuth>
        <Shell>
          <div className="lesson-view-container">
            <div className="lesson-error-state">
              <Shield size={36} color="#e24361" style={{ margin: '0 auto 12px' }} />
              <h2 className="lesson-error-title">Unable to Load Lesson</h2>
              <p className="lesson-error-desc">{error || 'Lesson not found.'}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Button variant="outline" onClick={handleBackToCourse}>
                  Back to Course
                </Button>
                <Button variant="primary" onClick={fetchLesson}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  const isCompleted = lesson.status === 'COMPLETED';

  return (
    <NeedAuth>
      <Shell>
        <div className="lesson-view-container">
          {/* Top Navigation Bar */}
          <div className="lesson-nav-top-bar">
            <button className="lesson-back-btn" onClick={handleBackToCourse}>
              <ArrowLeft size={15} />
              <span>Back to {lesson.course.name} Course</span>
            </button>

            <div className="lesson-top-meta">
              {isCompleted ? (
                <div className="lesson-review-badge">
                  <CheckCircle2 size={14} />
                  <span>REVIEW MODE • COMPLETED</span>
                </div>
              ) : (
                <div className="mono" style={{ color: '#dfbd78', fontSize: 12, background: 'rgba(223, 189, 120, 0.1)', padding: '5px 12px', borderRadius: 6, border: '1px solid rgba(223, 189, 120, 0.3)' }}>
                  🟡 IN PROGRESS
                </div>
              )}
            </div>
          </div>

          {/* Header Hero Card */}
          <header className="lesson-header-hero">
            <div className="lesson-eyebrow-row">
              <div className="lesson-eyebrow-tag">
                <Sparkles size={13} />
                <span>{lesson.course.name.toUpperCase()} • LESSON {lesson.order.toString().padStart(2, '0')}</span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: '#7ea49c' }}>
                Course Track: {lesson.courseId.toUpperCase()}
              </span>
            </div>

            <h1 className="lesson-title-display">{lesson.title}</h1>
            <p className="lesson-desc-lead">{lesson.description}</p>

            <div className="lesson-meta-chips">
              <span className="lesson-meta-chip">
                <Clock size={13} />
                <span>{lesson.duration} MIN</span>
              </span>
              <span className="lesson-meta-chip">
                <BookOpen size={13} />
                <span>{lesson.type.toUpperCase()}</span>
              </span>
              <span className="lesson-meta-chip xp">
                <Award size={13} />
                <span>+{lesson.xpReward} XP REWARD</span>
              </span>
              {isCompleted && (
                <span className="lesson-meta-chip" style={{ color: '#43e2b0', borderColor: 'rgba(67, 226, 176, 0.4)' }}>
                  <CheckCircle2 size={13} />
                  <span>PASSED</span>
                </span>
              )}
            </div>
          </header>

          {/* Objectives Card */}
          {lesson.objectives && lesson.objectives.length > 0 && (
            <section className="lesson-objectives-card">
              <h3 className="lesson-objectives-title">
                <Target size={15} />
                <span>LESSON OBJECTIVES</span>
              </h3>
              <ul className="lesson-objectives-list">
                {lesson.objectives.map((obj, i) => (
                  <li key={i} className="lesson-objective-item">
                    <span className="lesson-objective-bullet">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Completion Celebration Notice */}
          {completedCelebration && (
            <div className="lesson-complete-banner">
              <div className="lesson-complete-left">
                <div className="lesson-complete-icon">
                  <Award size={24} />
                </div>
                <div>
                  <h4 className="lesson-complete-title">✓ Lesson Successfully Completed!</h4>
                  <p className="lesson-complete-sub">
                    You earned +{awardedXp} XP. Your skills profile and curriculum progress have been updated.
                  </p>
                </div>
              </div>
              {lesson.nextLesson && (
                <Button variant="primary" onClick={handleNext}>
                  <span>Next Lesson: {lesson.nextLesson.title}</span>
                  <ArrowRight size={14} style={{ marginLeft: 6 }} />
                </Button>
              )}
            </div>
          )}

          {/* Main Lesson Content Body */}
          <article className="lesson-body-card">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }: any) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {lesson.content}
            </ReactMarkdown>
          </article>

          {/* Interactive Code Playground / Hands-on Sandbox */}
          {lesson.starterCode && (
            <section className="lesson-code-sandbox">
              <div className="lesson-sandbox-top">
                <div className="lesson-sandbox-title">
                  <Terminal size={15} />
                  <span>HANDS-ON LAB SANDBOX: {lesson.title.toUpperCase()}</span>
                </div>
                <div className="lesson-sandbox-actions">
                  <button 
                    className="lesson-back-btn" 
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => setCode(lesson.starterCode || '')}
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                  <button 
                    className="lesson-run-btn"
                    onClick={handleRunCode}
                    disabled={running}
                  >
                    <Play size={12} />
                    <span>{running ? 'Running...' : 'Run Code'}</span>
                  </button>
                  <Button 
                    variant="outline" 
                    size="small"
                    onClick={() => setLocation(`/lab`)}
                    style={{ fontSize: 11, padding: '4px 12px' }}
                  >
                    <span>Open in Coding Lab</span>
                  </Button>
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: '#070f14' }}>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={8}
                  style={{
                    width: '100%',
                    background: '#04080a',
                    border: '1px solid rgba(54, 106, 91, 0.35)',
                    borderRadius: 6,
                    padding: 12,
                    color: '#cbe7e0',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                    resize: 'vertical'
                  }}
                  spellCheck={false}
                />
              </div>

              {output && (
                <div className="lesson-sandbox-output">
                  {output}
                </div>
              )}
            </section>
          )}

          {/* Bottom Navigation & Completion Controls */}
          <div className="lesson-bottom-nav">
            <button 
              className="lesson-nav-btn prev"
              onClick={handlePrev}
              disabled={!lesson.previousLesson}
            >
              <ArrowLeft size={14} />
              <span>
                {lesson.previousLesson ? `Prev: ${lesson.previousLesson.title}` : 'Previous Lesson'}
              </span>
            </button>

            <button
              className={`lesson-complete-action-btn ${isCompleted ? 'is-completed' : ''}`}
              onClick={handleMarkComplete}
              disabled={completing}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>✓ Completed • Review Mode</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>{completing ? 'Saving Progress...' : 'Mark Lesson Complete (+50 XP)'}</span>
                </>
              )}
            </button>

            <button 
              className="lesson-nav-btn next"
              onClick={handleNext}
            >
              <span>
                {lesson.nextLesson ? `Next: ${lesson.nextLesson.title}` : 'Complete Course Track →'}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Floating AI Tutor Quick Help */}
          <div className="lesson-ai-tutor-bubble" onClick={handleAskAi} role="button" tabIndex={0}>
            <Bot size={18} />
            <span>Ask AI Tutor about this lesson</span>
          </div>
        </div>
      </Shell>
    </NeedAuth>
  );
}

function Target({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
