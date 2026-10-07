import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import { Shell, NeedAuth, Button } from '../App';
import { 
  Shield, 
  Code, 
  ChevronRight, 
  LockKeyhole, 
  Search, 
  BookOpen, 
  Clock3, 
  TrendingUp, 
  Trophy, 
  FlaskConical, 
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  desc: string;
  diff: 'Beginner' | 'Intermediate' | 'Advanced';
  courses: number;
  lessons: number;
  labs: number;
  hours: number;
  prog: number;
}

interface Category {
  id: 'cyber' | 'prog';
  title: string;
  description: string;
  icon: React.ReactNode;
  subjects: Subject[];
}

const CATEGORIES: Category[] = [
  {
    id: 'cyber',
    title: 'Cybersecurity',
    description: 'Learn how systems, networks, applications, and organizations are defended against cyber threats.',
    icon: <Shield size={22} />,
    subjects: [
      { 
        id: 'cyb-fund', 
        name: 'Cybersecurity Fundamentals', 
        desc: 'Core principles of confidentiality, integrity, availability, threat modeling, and defensive controls.', 
        diff: 'Beginner', 
        courses: 1, 
        lessons: 12, 
        labs: 6, 
        hours: 2, 
        prog: 40 
      },
      { 
        id: 'cyb-net', 
        name: 'Networking & Network Security', 
        desc: 'Protocols, packet analysis, firewalls, segmentation, and perimeter defense strategies.', 
        diff: 'Intermediate', 
        courses: 1, 
        lessons: 10, 
        labs: 5, 
        hours: 4, 
        prog: 0 
      },
      { 
        id: 'cyb-web', 
        name: 'Web Application Security', 
        desc: 'OWASP Top 10 vulnerabilities, input validation, authentication hardening, and API defense.', 
        diff: 'Advanced', 
        courses: 1, 
        lessons: 14, 
        labs: 8, 
        hours: 5, 
        prog: 0 
      },
      { 
        id: 'cyb-hack', 
        name: 'Ethical Hacking Fundamentals', 
        desc: 'Reconnaissance techniques, vulnerability assessment, responsible disclosure, and defense audits.', 
        diff: 'Intermediate', 
        courses: 1, 
        lessons: 10, 
        labs: 6, 
        hours: 3, 
        prog: 0 
      },
    ]
  },
  {
    id: 'prog',
    title: 'Programming',
    description: 'Build strong programming fundamentals, secure coding habits, and practical development skills.',
    icon: <Code size={22} />,
    subjects: [
      { 
        id: 'prg-py', 
        name: 'Python Programming', 
        desc: 'From syntax to automation scripts, network tools, and security auditing modules.', 
        diff: 'Beginner', 
        courses: 12, 
        lessons: 20, 
        labs: 22, 
        hours: 18, 
        prog: 35 
      },
      { 
        id: 'prg-cpp', 
        name: 'C++ Programming', 
        desc: 'Memory pointers, object-oriented architecture, and vulnerability prevention in compiled code.', 
        diff: 'Intermediate', 
        courses: 10, 
        lessons: 25, 
        labs: 30, 
        hours: 20, 
        prog: 15 
      },
      { 
        id: 'prg-js', 
        name: 'JavaScript & Web Engineering', 
        desc: 'Full-stack fundamentals, browser sandbox security, DOM manipulation, and asynchronous APIs.', 
        diff: 'Beginner', 
        courses: 8, 
        lessons: 21, 
        labs: 25, 
        hours: 15, 
        prog: 60 
      },
      { 
        id: 'prg-sec', 
        name: 'Secure Code Architecture', 
        desc: 'Static code analysis, cryptographic implementations, and defensive design patterns.', 
        diff: 'Advanced', 
        courses: 6, 
        lessons: 16, 
        labs: 12, 
        hours: 10, 
        prog: 0 
      },
    ]
  }
];

export default function LearningAcademy() {
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cyber' | 'prog'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  // Filter categories and subjects based on query, category filter, and difficulty
  const filteredCategories = useMemo(() => {
    return CATEGORIES
      .filter(cat => selectedCategory === 'all' || cat.id === selectedCategory)
      .map(cat => {
        const filteredSubjects = cat.subjects.filter(sub => {
          const matchesQuery = 
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.desc.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesDiff = 
            selectedDifficulty === 'All' || sub.diff === selectedDifficulty;
          return matchesQuery && matchesDiff;
        });
        return {
          ...cat,
          subjects: filteredSubjects
        };
      })
      .filter(cat => cat.subjects.length > 0);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Difficulty badge styling helper
  const getDiffClass = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'diff-beginner';
      case 'Intermediate': return 'diff-intermediate';
      case 'Advanced': return 'diff-advanced';
      default: return 'diff-beginner';
    }
  };

  // -------------------------------------------------------------------------
  // Render: Active Subject Roadmap View
  // -------------------------------------------------------------------------
  if (selectedSubject) {
    return (
      <NeedAuth>
        <Shell>
          <div className="roadmap-wrap fade-in">
            <div 
              className="roadmap-breadcrumb" 
              onClick={() => setSelectedSubject(null)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setSelectedSubject(null); }}
            >
              <ArrowLeft size={14} />
              <span>Back to Learning Paths</span>
            </div>

            <div className="learning-header-block" style={{ textAlign: 'left', marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div className="learning-eyebrow">
                    <Sparkles size={12} />
                    <span>COURSE ROADMAP</span>
                  </div>
                  <h1 className="learning-title">{selectedSubject.name}</h1>
                  <p className="learning-subtitle" style={{ margin: 0 }}>{selectedSubject.desc}</p>
                </div>

                <div style={{ background: 'rgba(12, 23, 29, 0.85)', border: '1px solid #23483e', borderRadius: 10, padding: '12px 20px', textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 11, color: '#7fa39b', marginBottom: 4 }}>SUBJECT PROGRESS</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 110, height: 6, background: '#132329', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${selectedSubject.prog}%`, height: '100%', background: 'linear-gradient(90deg, #1b634d, #43e2b0)' }} />
                    </div>
                    <span className="mono" style={{ color: '#43e2b0', fontSize: 16, fontWeight: 700 }}>
                      {selectedSubject.prog}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { moduleNum: 1, title: 'Module 1 — Core Foundations & Terminology', lessons: selectedSubject.lessons, labs: Math.ceil(selectedSubject.labs / 2), unlocked: true },
                { moduleNum: 2, title: 'Module 2 — Defensive Controls & Implementation', lessons: selectedSubject.lessons, labs: Math.floor(selectedSubject.labs / 2), unlocked: selectedSubject.prog > 0 },
                { moduleNum: 3, title: 'Module 3 — Hands-On Scenario Audit & Capstone Lab', lessons: selectedSubject.lessons, labs: selectedSubject.labs, unlocked: false },
              ].map((m) => (
                <div key={m.moduleNum} className="roadmap-module-card">
                  <div>
                    <span className="eyebrow" style={{ color: '#6a8c84', fontSize: 11 }}>
                      MODULE {m.moduleNum}
                    </span>
                    <h3 style={{ fontSize: 17, color: '#e5f1ef', margin: '4px 0 8px', fontWeight: 600 }}>
                      {m.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#8aa69f', fontFamily: 'DM Mono' }}>
                      <span><BookOpen size={13} style={{ display: 'inline', marginRight: 5 }}/> {m.lessons} Lessons</span>
                      <span><FlaskConical size={13} style={{ display: 'inline', marginRight: 5 }}/> {m.labs} Labs</span>
                      <span className={`card-diff-pill ${getDiffClass(selectedSubject.diff)}`}>
                        {selectedSubject.diff.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div>
                    {m.unlocked ? (
                      <Button 
                        variant={selectedSubject.prog > 0 && m.moduleNum === 1 ? 'outline' : 'primary'}
                        onClick={() => {
                          const targetCourse = selectedSubject.id === 'prg-py' ? 'python' :
                                               selectedSubject.id === 'prg-cpp' ? 'cpp' :
                                               selectedSubject.id === 'prg-js' ? 'javascript' : 'cybersecurity';
                          setLocation(`/courses/${targetCourse}/lessons/${m.moduleNum}`);
                        }}
                      >
                        {selectedSubject.prog > 0 && m.moduleNum === 1 ? 'Continue Module' : 'Start Module'}
                        <ArrowRight size={14} style={{ marginLeft: 6 }} />
                      </Button>
                    ) : (
                      <Button variant="outline" disabled style={{ opacity: 0.6 }}>
                        <LockKeyhole size={14} style={{ marginRight: 6 }} />
                        <span>Locked</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  // -------------------------------------------------------------------------
  // Render: Main Learning Paths Hub
  // -------------------------------------------------------------------------
  return (
    <NeedAuth>
      <Shell>
        <div className="learning-paths-wrap fade-in">
          {/* Header Block */}
          <header className="learning-header-block">
            <div className="learning-eyebrow">
              <Sparkles size={13} />
              <span>ACADEMY CURRICULUM</span>
            </div>
            <h1 className="learning-title">Learning Paths</h1>
            <p className="learning-subtitle">
              Build your skills from fundamentals to advanced concepts through structured courses, lessons, quizzes, labs, and projects.
            </p>
          </header>

          {/* Search & Filters Section */}
          <div className="learning-search-section">
            {/* Search Input Bar */}
            <div className="learning-search-box">
              <Search size={17} className="learning-search-icon" />
              <input 
                type="text"
                placeholder="Search subjects, courses, lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="learning-search-input"
                aria-label="Search courses and subjects"
              />
              {searchQuery && (
                <button 
                  className="learning-search-clear" 
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="learning-filters-row">
              {/* Category Filters */}
              <button 
                className={`learning-filter-btn ${selectedCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              <button 
                className={`learning-filter-btn ${selectedCategory === 'cyber' ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory('cyber')}
              >
                <Shield size={13} />
                <span>Cybersecurity</span>
              </button>
              <button 
                className={`learning-filter-btn ${selectedCategory === 'prog' ? 'is-active' : ''}`}
                onClick={() => setSelectedCategory('prog')}
              >
                <Code size={13} />
                <span>Programming</span>
              </button>

              <span style={{ color: '#2a443e', margin: '0 4px', display: 'flex', alignItems: 'center' }}>|</span>

              {/* Difficulty Filters */}
              {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(diff => (
                <button 
                  key={diff}
                  className={`learning-filter-btn ${selectedDifficulty === diff ? 'is-active' : ''}`}
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Category Sections */}
          {filteredCategories.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
              {filteredCategories.map(cat => (
                <section key={cat.id} className="learning-category-section">
                  {/* Category Section Header */}
                  <div className="learning-category-header">
                    <div className="learning-category-title-group">
                      <h2 className="learning-category-heading">
                        <span style={{ color: '#43e2b0' }}>{cat.icon}</span>
                        <span>{cat.title}</span>
                      </h2>
                      <p className="learning-category-desc">{cat.description}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {cat.id === 'cyber' && (
                        <Link href="/cybersecurity" className="btn btn-outline compact" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          Open Cyber Range & Labs <ArrowRight size={13} />
                        </Link>
                      )}
                      <span className="learning-category-count">
                        {cat.subjects.length} {cat.subjects.length === 1 ? 'PATH' : 'PATHS'} AVAILABLE
                      </span>
                    </div>
                  </div>

                  {/* Responsive Course Grid (auto-fit 340px) */}
                  <div className="learning-cards-grid">
                    {cat.subjects.map(sub => (
                      <article 
                        key={sub.id} 
                        className="learning-path-card"
                        onClick={() => setSelectedSubject(sub)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') setSelectedSubject(sub); }}
                      >
                        <div>
                          {/* Top Row: Difficulty Pill & Category Icon */}
                          <div className="card-level-row">
                            <span className={`card-diff-pill ${getDiffClass(sub.diff)}`}>
                              {sub.diff.toUpperCase()}
                            </span>
                            <div style={{ color: '#43e2b0', opacity: 0.8 }}>
                              {cat.id === 'cyber' ? <Shield size={16} /> : <Code size={16} />}
                            </div>
                          </div>

                          {/* Subject Title */}
                          <h3 className="card-subject-name">{sub.name}</h3>

                          {/* Subject Description */}
                          <p className="card-subject-desc">{sub.desc}</p>

                          <div className="card-divider-line" />

                          {/* Statistics Row: Lessons, Labs, Duration */}
                          <div className="card-stats-strip">
                            <div className="card-stat-entry">
                              <BookOpen size={13} style={{ color: '#43e2b0' }} />
                              <span><strong>{sub.lessons}</strong> Lessons</span>
                            </div>
                            <div className="card-stat-entry">
                              <FlaskConical size={13} style={{ color: '#43e2b0' }} />
                              <span><strong>{sub.labs}</strong> Labs</span>
                            </div>
                            <div className="card-stat-entry">
                              <Clock3 size={13} style={{ color: '#43e2b0' }} />
                              <span><strong>{sub.hours}</strong> Hours</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {/* Progress Section */}
                          <div className="card-progress-section">
                            <div className="card-progress-labels">
                              <span className="card-progress-title">Progress</span>
                              <span className={`card-progress-val ${sub.prog === 100 ? 'is-complete' : ''}`}>
                                {sub.prog === 100 ? 'Complete' : `${sub.prog}%`}
                              </span>
                            </div>
                            <div className="card-progress-track">
                              <div 
                                className="card-progress-bar" 
                                style={{ width: `${sub.prog}%` }} 
                              />
                            </div>
                          </div>

                          {/* Action Button CTA */}
                          <button 
                            className={`card-cta-btn ${sub.prog > 0 ? 'is-active-btn' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(sub);
                            }}
                          >
                            <span>
                              {sub.prog === 100 
                                ? 'Review Course' 
                                : sub.prog > 0 
                                  ? 'Continue Learning' 
                                  : 'Start Learning'}
                            </span>
                            <ArrowRight size={15} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              background: 'rgba(10, 18, 23, 0.65)', 
              borderRadius: 14, 
              border: '1px solid rgba(54, 106, 91, 0.3)',
              color: '#7fa199' 
            }}>
              <p style={{ margin: 0, fontSize: 15, fontFamily: 'DM Mono' }}>
                No learning paths match your filter criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedDifficulty('All'); }}
                style={{
                  marginTop: 14,
                  background: 'none',
                  border: '1px solid #366a5b',
                  color: '#43e2b0',
                  padding: '7px 18px',
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
