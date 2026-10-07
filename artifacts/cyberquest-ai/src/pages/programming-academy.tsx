import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Shell, NeedAuth, Button } from '../App';
import { 
  Code, 
  Terminal, 
  Brain, 
  ChevronRight, 
  FileCode, 
  CheckCircle2, 
  Award, 
  Clock3, 
  Search, 
  BookOpen, 
  Zap, 
  Database, 
  Coffee, 
  Cpu, 
  Globe, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface LanguageTrack {
  id: string;
  name: string;
  desc: string;
  diff: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  coding: number;
  mcqs: number;
  prog: number;
}

const LANGUAGES: LanguageTrack[] = [
  { 
    id: 'python', 
    name: 'Python', 
    desc: 'Learn Python from fundamentals to real-world cybersecurity & backend programming.', 
    diff: 'Beginner', 
    lessons: 20, 
    coding: 22, 
    mcqs: 10, 
    prog: 35 
  },
  { 
    id: 'cpp', 
    name: 'C++', 
    desc: 'Master memory management, pointers, OOP, and high-performance system structures.', 
    diff: 'Intermediate', 
    lessons: 25, 
    coding: 30, 
    mcqs: 10, 
    prog: 15 
  },
  { 
    id: 'javascript', 
    name: 'JavaScript', 
    desc: 'The language of the web. Build interactive fullstack security tools and apps.', 
    diff: 'Beginner', 
    lessons: 21, 
    coding: 25, 
    mcqs: 10, 
    prog: 60 
  },
  { 
    id: 'java', 
    name: 'Java', 
    desc: 'Object-oriented programming, concurrency patterns, and enterprise backend logic.', 
    diff: 'Intermediate', 
    lessons: 19, 
    coding: 20, 
    mcqs: 10, 
    prog: 0 
  },
  { 
    id: 'sql', 
    name: 'SQL & Databases', 
    desc: 'Manage relational databases, write analytical queries, and practice secure data handling.', 
    diff: 'Beginner', 
    lessons: 18, 
    coding: 15, 
    mcqs: 10, 
    prog: 0 
  },
  { 
    id: 'c', 
    name: 'C & Systems Security', 
    desc: 'Low-level buffer handling, memory safety basics, and vulnerability mitigation.', 
    diff: 'Advanced', 
    lessons: 22, 
    coding: 24, 
    mcqs: 10, 
    prog: 0 
  }
];

export default function ProgrammingAcademy() {
  const [activeLang, setActiveLang] = useState<LanguageTrack | null>(null);
  const [tab, setTab] = useState<'lessons' | 'coding' | 'mcq'>('lessons');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [, setLocation] = useLocation();

  // Pick up ?course=python from URL query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get('course');
    if (courseParam) {
      const match = LANGUAGES.find(l => l.id.toLowerCase() === courseParam.toLowerCase());
      if (match) {
        setActiveLang(match);
      }
    }
  }, []);

  // Fetch real lesson records from backend whenever active course changes
  useEffect(() => {
    if (!activeLang) return;
    setLessonsLoading(true);
    fetch(`/api/courses/${activeLang.id}/lessons`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.lessons?.length) {
          setLessons(json.data.lessons);
        } else {
          setLessons([]);
        }
      })
      .catch(err => {
        console.error('Error fetching course lessons:', err);
      })
      .finally(() => {
        setLessonsLoading(false);
      });
  }, [activeLang]);

  // Filter courses based on search, level, and tag
  const filteredCourses = useMemo(() => {
    return LANGUAGES.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.desc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLevel = 
        selectedLevel === 'All' || c.diff === selectedLevel;

      const matchesTag = 
        selectedTag === 'All' || c.id === selectedTag.toLowerCase();

      return matchesSearch && matchesLevel && matchesTag;
    });
  }, [searchQuery, selectedLevel, selectedTag]);

  // Compute dynamic user progress across existing tracks
  const progressStats = useMemo(() => {
    const inProgressCourses = LANGUAGES.filter(c => c.prog > 0);
    const inProgressCount = inProgressCourses.length;
    const avgProgress = inProgressCount > 0 
      ? Math.round(inProgressCourses.reduce((sum, c) => sum + c.prog, 0) / inProgressCount) 
      : 0;
    const totalLessons = LANGUAGES.reduce((sum, c) => sum + c.lessons, 0);
    const completedLessonsEst = Math.round(
      LANGUAGES.reduce((sum, c) => sum + (c.lessons * (c.prog / 100)), 0)
    );

    return {
      inProgressCount,
      avgProgress,
      totalLessons,
      completedLessonsEst,
    };
  }, []);

  // Helper for course icons
  const getCourseIcon = (id: string) => {
    switch (id) {
      case 'python': return <FileCode size={22} />;
      case 'cpp': return <Cpu size={22} />;
      case 'javascript': return <Globe size={22} />;
      case 'java': return <Coffee size={22} />;
      case 'sql': return <Database size={22} />;
      case 'c': return <Terminal size={22} />;
      default: return <Code size={22} />;
    }
  };

  // Helper for level badge class
  const getDiffClass = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'diff-beginner';
      case 'Intermediate': return 'diff-intermediate';
      case 'Advanced': return 'diff-advanced';
      default: return 'diff-beginner';
    }
  };

  // -------------------------------------------------------------------------
  // Render: Active Course Curriculum Track
  // -------------------------------------------------------------------------
  if (activeLang) {
    return (
      <NeedAuth>
        <Shell>
          <div className="curriculum-wrap fade-in">
            <div 
              className="curriculum-breadcrumb" 
              onClick={() => setActiveLang(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveLang(null); }}
            >
              <ArrowLeft size={14} />
              <span>Back to Programming Academy</span>
            </div>
            
            <div className="academy-header-block" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div className="academy-eyebrow">
                    <Sparkles size={12} />
                    <span>LANGUAGE CURRICULUM</span>
                  </div>
                  <h1 className="academy-title">{activeLang.name} Track</h1>
                  <p className="academy-subtitle">{activeLang.desc}</p>
                </div>

                <div style={{ background: 'rgba(12, 23, 29, 0.8)', border: '1px solid #23483e', borderRadius: 10, padding: '12px 18px', textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 11, color: '#7fa39b', marginBottom: 4 }}>TRACK PROGRESS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 100, height: 6, background: '#132329', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${activeLang.prog}%`, height: '100%', background: 'linear-gradient(90deg, #1b634d, #43e2b0)' }} />
                    </div>
                    <span className="mono" style={{ color: '#43e2b0', fontSize: 15, fontWeight: 700 }}>
                      {activeLang.prog}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Curriculum Tabs */}
            <div className="curriculum-tabs-bar">
              {[
                { id: 'lessons' as const, label: 'LESSONS', icon: <BookOpen size={15}/> },
                { id: 'coding' as const, label: 'CODING PRACTICE', icon: <Terminal size={15}/> },
                { id: 'mcq' as const, label: 'ASSESSMENT QUIZ', icon: <Brain size={15}/> }
              ].map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setTab(t.id)}
                  className={`curriculum-tab-btn ${tab === t.id ? 'is-active' : ''}`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: Lessons */}
            {tab === 'lessons' && (
              <div>
                <p style={{ color: '#8aa69f', marginBottom: 20, fontSize: 14 }}>
                  Sequential structured lessons designed to build core concepts and security foundations in {activeLang.name}.
                </p>

                {lessonsLoading ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: '#43e2b0' }}>
                    <div className="skeleton-line" style={{ width: 180, height: 16, margin: '0 auto 12px' }} />
                    <span className="mono" style={{ fontSize: 13 }}>Loading {activeLang.name} curriculum lessons...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(lessons.length > 0 ? lessons : [
                      { id: 1, order: 1, title: `Introduction & Setup for ${activeLang.name}`, duration: 15, type: 'Basics', status: 'COMPLETED' },
                      { id: 2, order: 2, title: 'Variables, Memory & Data Types', duration: 20, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 3, order: 3, title: 'Control Flow & Conditionals', duration: 20, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 4, order: 4, title: 'Functions & Scope Management', duration: 20, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 5, order: 5, title: 'Data Structures & Collections', duration: 25, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 6, order: 6, title: 'Input Validation & Defensive Coding', duration: 25, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 7, order: 7, title: 'Error Handling & Exception Recovery', duration: 20, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 8, order: 8, title: 'File I/O & Serialization Safety', duration: 25, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 9, order: 9, title: 'Object-Oriented Design Patterns', duration: 25, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                      { id: 10, order: 10, title: 'Concurrency & Advanced Architectures', duration: 30, type: 'Hands-on Lab', status: 'NOT_STARTED' },
                    ]).map((lesson) => {
                      const isCompleted = lesson.status === 'COMPLETED';
                      const isInProgress = lesson.status === 'IN_PROGRESS';
                      const targetRoute = `/courses/${activeLang.id}/lessons/${lesson.id}`;

                      return (
                        <div 
                          key={lesson.id} 
                          className="curriculum-item-card"
                          onClick={() => setLocation(targetRoute)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') setLocation(targetRoute); }}
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="mono" style={{ color: '#43e2b0', opacity: 0.65, fontSize: 13, width: 28, textAlign: 'center' }}>
                              {lesson.order.toString().padStart(2, '0')}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: 15, color: '#e5f1ef', fontWeight: 600 }}>
                                {lesson.title}
                              </h4>
                              <span style={{ fontSize: 12, color: '#6d8e87' }}>
                                {lesson.duration} min • {lesson.type}
                              </span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {isCompleted ? (
                              <>
                                <span style={{ color: '#43e2b0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, fontFamily: 'DM Mono' }}>
                                  <CheckCircle2 size={16} /> COMPLETED
                                </span>
                                <Button 
                                  variant="outline" 
                                  size="small" 
                                  onClick={(e?: any) => {
                                    e?.stopPropagation();
                                    setLocation(targetRoute);
                                  }}
                                >
                                  Review Lesson
                                </Button>
                              </>
                            ) : isInProgress ? (
                              <Button 
                                variant="primary" 
                                size="small" 
                                onClick={(e?: any) => {
                                  e?.stopPropagation();
                                  setLocation(targetRoute);
                                }}
                              >
                                Continue Lesson →
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="small" 
                                onClick={(e?: any) => {
                                  e?.stopPropagation();
                                  setLocation(targetRoute);
                                }}
                              >
                                Start Lesson
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Coding Practice */}
            {tab === 'coding' && (
              <div>
                <p style={{ color: '#8aa69f', marginBottom: 20, fontSize: 14 }}>
                  Solve algorithmic exercises and cybersecurity challenges directly inside the isolated Coding Lab sandbox.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { id: 1, title: '01 — Hello World & Stdout Basics', diff: 'Easy', status: 'Completed', xp: 30 },
                    { id: 2, title: '02 — Reverse a String & Buffer Iteration', diff: 'Easy', status: 'Completed', xp: 30 },
                    { id: 3, title: '03 — SQL Injection Signature Checker', diff: 'Medium', status: 'Not Started', xp: 50 },
                    { id: 4, title: '04 — Caesar Cipher Substitution Engine', diff: 'Medium', status: 'Not Started', xp: 75 },
                    { id: 5, title: '05 — Memory Leak & Bounds Overflow Check', diff: 'Hard', status: 'Not Started', xp: 120 },
                  ].map(p => (
                    <div key={p.id} className="curriculum-item-card">
                      <div>
                        <h4 style={{ margin: '0 0 6px', fontSize: 15, color: '#e5f1ef', display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.title}
                          {p.status === 'Completed' && <CheckCircle2 size={15} color="#43e2b0" />}
                        </h4>
                        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#7a9c94', fontFamily: 'DM Mono' }}>
                          <span style={{ color: p.diff === 'Easy' ? '#43e2b0' : p.diff === 'Medium' ? '#dfbd78' : '#e24361' }}>
                            {p.diff.toUpperCase()}
                          </span>
                          <span><Award size={12} style={{ display: 'inline', marginRight: 4 }} /> +{p.xp} XP</span>
                        </div>
                      </div>

                      <Button 
                        variant={p.status === 'Completed' ? 'outline' : 'primary'} 
                        onClick={() => setLocation('/lab')}
                      >
                        {p.status === 'Completed' ? 'Review in Coding Lab' : 'Solve in Coding Lab'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Assessment Quiz */}
            {tab === 'mcq' && (
              <div style={{ 
                background: 'rgba(11, 20, 26, 0.85)', 
                border: '1px solid rgba(54, 106, 91, 0.35)', 
                borderRadius: 12, 
                textAlign: 'center', 
                padding: '60px 24px',
                maxWidth: 620,
                margin: '0 auto' 
              }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: 'rgba(23, 55, 46, 0.8)', border: '1px solid #366a5b', display: 'grid', placeItems: 'center', margin: '0 auto 20px', color: '#43e2b0' }}>
                  <Brain size={32} />
                </div>
                <h3 style={{ fontSize: 22, color: '#e5f1ef', margin: '0 0 10px', fontFamily: 'Space Grotesk' }}>
                  {activeLang.name} Certification Quiz
                </h3>
                <p style={{ color: '#8fa8a2', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6, fontSize: 13.5 }}>
                  Verify your theoretical and defensive coding knowledge through a timed 10-question evaluation assessment.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 28, fontSize: 13, color: '#7ea198', fontFamily: 'DM Mono' }}>
                  <span><Clock3 size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> 10 Minutes</span>
                  <span><Award size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} /> +50 XP</span>
                </div>
                <Button onClick={() => window.location.href = '/challenges'}>
                  <span>Start Assessment Quiz</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            )}
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Main Programming Academy Hub
  // -------------------------------------------------------------------------
  return (
    <NeedAuth>
      <Shell>
        <div className="academy-page-wrap fade-in">
          {/* Page Header */}
          <header className="academy-header-block">
            <div className="academy-eyebrow">
              <Sparkles size={13} />
              <span>CODING & DEVELOPMENT</span>
            </div>
            <h1 className="academy-title">Programming Academy</h1>
            <p className="academy-subtitle">
              Learn programming, solve real-world coding problems, and build practical cybersecurity software.
            </p>
          </header>

          {/* Progress Summary Card (Dynamic from application state) */}
          <div className="academy-summary-banner">
            <div className="academy-summary-top">
              <div className="academy-summary-label">
                <TrendingUp size={14} />
                <span>YOUR PROGRESS OVERVIEW</span>
              </div>
              <div className="academy-summary-metrics">
                <div className="academy-summary-metric-item">
                  <span style={{ color: '#7ba096' }}>In Progress:</span>
                  <span className="academy-summary-metric-val">{progressStats.inProgressCount} Tracks</span>
                </div>
                <div className="academy-summary-metric-item">
                  <span style={{ color: '#7ba096' }}>Average Progress:</span>
                  <span className="academy-summary-metric-val">{progressStats.avgProgress}%</span>
                </div>
              </div>
            </div>
            <div className="academy-summary-track">
              <div 
                className="academy-summary-fill" 
                style={{ width: `${progressStats.avgProgress}%` }} 
              />
            </div>
          </div>

          {/* Search & Filters Controls */}
          <div className="academy-filter-bar">
            {/* Search Input */}
            <div className="academy-search-box">
              <Search size={15} className="academy-search-icon" />
              <input 
                type="text"
                placeholder="Search courses by name or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="academy-search-input"
                aria-label="Search courses"
              />
            </div>

            {/* Level & Tag Filters */}
            <div className="academy-filter-controls">
              <select 
                className="academy-level-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter courses by difficulty level"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <div className="academy-tag-group">
                {['All', 'Python', 'C++', 'JavaScript', 'Java', 'SQL'].map(tag => (
                  <button 
                    key={tag}
                    className={`academy-tag-btn ${selectedTag === tag ? 'is-active' : ''}`}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="academy-section-header">
            <h2 className="academy-section-title">
              <BookOpen size={14} style={{ color: '#43e2b0' }} />
              <span>AVAILABLE COURSES</span>
            </h2>
            <span className="academy-section-count">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'COURSE' : 'COURSES'}
            </span>
          </div>

          {/* 2-Column Responsive Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="academy-course-grid">
              {filteredCourses.map(course => (
                <article 
                  key={course.id} 
                  className="academy-card"
                  onClick={() => setActiveLang(course)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveLang(course); }}
                >
                  <div>
                    {/* Top Row: Icon, Title & Difficulty Badge */}
                    <div className="card-header-row">
                      <div className="card-title-group">
                        <div className="card-icon-badge">
                          {getCourseIcon(course.id)}
                        </div>
                        <h3 className="card-course-name">{course.name}</h3>
                      </div>
                      <span className={`card-diff-badge ${getDiffClass(course.diff)}`}>
                        {course.diff}
                      </span>
                    </div>

                    {/* Course Description */}
                    <p className="card-description-text">{course.desc}</p>

                    <div className="card-divider-line" />

                    {/* 3-Column Statistics Grid */}
                    <div className="card-stats-grid">
                      <div className="card-stat-col">
                        <div className="card-stat-top">
                          <BookOpen size={14} className="card-stat-icon" />
                          <span>{course.lessons}</span>
                        </div>
                        <span className="card-stat-label">Lessons</span>
                      </div>

                      <div className="card-stat-col">
                        <div className="card-stat-top">
                          <Zap size={14} className="card-stat-icon" />
                          <span>{course.coding}</span>
                        </div>
                        <span className="card-stat-label">Challenges</span>
                      </div>

                      <div className="card-stat-col">
                        <div className="card-stat-top">
                          <Brain size={14} className="card-stat-icon" />
                          <span>{course.mcqs}</span>
                        </div>
                        <span className="card-stat-label">Quizzes</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Progress Section */}
                    <div className="card-progress-section">
                      <div className="card-progress-labels">
                        <span className="card-progress-title">Progress</span>
                        <span className={`card-progress-val ${course.prog === 100 ? 'is-complete' : ''}`}>
                          {course.prog === 100 ? 'Complete' : `${course.prog}%`}
                        </span>
                      </div>
                      <div className="card-progress-track">
                        <div 
                          className="card-progress-bar" 
                          style={{ width: `${course.prog}%` }} 
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      className={`card-cta-btn ${course.prog > 0 ? 'is-active-btn' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLang(course);
                      }}
                    >
                      <span>
                        {course.prog === 100 
                          ? 'Review Course' 
                          : course.prog > 0 
                            ? 'Continue Learning' 
                            : 'Start Learning'}
                      </span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              background: 'rgba(10, 18, 23, 0.6)', 
              borderRadius: 12, 
              border: '1px solid rgba(54, 106, 91, 0.25)',
              color: '#7fa199' 
            }}>
              <p style={{ margin: 0, fontSize: 15, fontFamily: 'DM Mono' }}>
                No courses match your filter criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedLevel('All'); setSelectedTag('All'); }}
                style={{
                  marginTop: 14,
                  background: 'none',
                  border: '1px solid #366a5b',
                  color: '#43e2b0',
                  padding: '6px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontFamily: 'DM Mono',
                  fontSize: 12
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </Shell>
    </NeedAuth>
  );
}
