import { useState } from 'react';
import { Shell, NeedAuth, PageHeading, Button, Notice } from '../App';
import { Folder, Search, Shield, Code, Brain, ChevronRight, Award, Clock3, Play, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'wouter';

const PROJECTS = [
  { id: 1, title: 'Phishing Email Detection System', cat: 'Cybersecurity / AI', diff: 'Intermediate', time: '12h', xp: 500, status: 'Not Started', tech: ['Python', 'NLP'], icon: <Shield size={20}/>, desc: 'Build a system that analyzes email messages and determines whether they are likely to be phishing attempts.' },
  { id: 2, title: 'Security Log Analyzer', cat: 'Cybersecurity', diff: 'Intermediate', time: '8h', xp: 400, status: 'In Progress', tech: ['Python', 'Log Analysis'], icon: <Shield size={20}/>, desc: 'Build a security log analysis application that detects suspicious activity from server or application logs.' },
  { id: 3, title: 'Student Management System', cat: 'Programming', diff: 'Beginner', time: '5h', xp: 200, status: 'Completed', tech: ['Java', 'SQL'], icon: <Code size={20}/>, desc: 'Build a student management application that allows users to manage student records via CRUD operations.' },
  { id: 4, title: 'AI Study Assistant', cat: 'AI / Education', diff: 'Advanced', time: '15h', xp: 800, status: 'Not Started', tech: ['Python', 'LLM API'], icon: <Brain size={20}/>, desc: 'Build an AI-powered study assistant that helps students understand educational content.' },
  { id: 5, title: 'REST API Task Manager', cat: 'Backend Development', diff: 'Intermediate', time: '10h', xp: 450, status: 'Not Started', tech: ['Node.js', 'Express', 'MongoDB'], icon: <Code size={20}/>, desc: 'Build a RESTful API for managing personal tasks with authentication.' },
];

export default function ProjectHub() {
  const [activeProject, setActiveProject] = useState<any>(null);
  const [filter, setFilter] = useState('All');

  if (activeProject) {
    return (
      <NeedAuth>
        <Shell>
          <div className="content-wrap fade-in">
            <div className="breadcrumb" style={{ cursor: 'pointer', color: '#89999e', marginBottom: 20 }} onClick={() => setActiveProject(null)}>
              ← Back to Project Hub
            </div>
            
            <PageHeading 
              eyebrow="PROJECT CHALLENGE"
              title={activeProject.title}
              subtitle="Build this project independently by following the functional requirements."
              right={
                <div style={{ textAlign: 'right', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button variant="outline"><Folder size={14} style={{ display: 'inline', marginRight: 5 }}/> Add to Portfolio</Button>
                  <Button><Play size={14} style={{ display: 'inline', marginRight: 5 }}/> Start Project</Button>
                </div>
              }
            />

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#43e2b0', fontSize: 14 }}>1. PROBLEM STATEMENT</h3>
                  <p style={{ color: '#dce5e8', lineHeight: 1.6 }}>{activeProject.desc}</p>
                </div>

                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#43e2b0', fontSize: 14 }}>2. FUNCTIONAL REQUIREMENTS</h3>
                  <ul style={{ color: '#dce5e8', lineHeight: 1.6, paddingLeft: 20, margin: 0 }}>
                    <li>Accept user input via a secure interface</li>
                    <li>Validate and sanitize all incoming data</li>
                    <li>Process data efficiently without memory leaks</li>
                    <li>Store results securely in a database</li>
                    <li>Provide clear error messages on failure</li>
                  </ul>
                </div>

                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#43e2b0', fontSize: 14 }}>3. DELIVERABLES</h3>
                  <p style={{ color: '#dce5e8', lineHeight: 1.6 }}>You must deliver a complete, runnable source code repository, a README.md file documenting how to set up and run the project, and a 2-minute video demonstrating the working system.</p>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="panel" style={{ background: '#0a1922' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, borderBottom: '1px solid #1a3c4a', paddingBottom: 15 }}>
                    <span style={{ color: '#89999e', fontSize: 13 }}>Difficulty</span>
                    <strong style={{ color: activeProject.diff === 'Beginner' ? '#43e2b0' : activeProject.diff === 'Intermediate' ? '#dfbd78' : '#e24361' }}>{activeProject.diff}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, borderBottom: '1px solid #1a3c4a', paddingBottom: 15 }}>
                    <span style={{ color: '#89999e', fontSize: 13 }}>Time Estimate</span>
                    <strong style={{ color: '#dce5e8' }}>{activeProject.time}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, borderBottom: '1px solid #1a3c4a', paddingBottom: 15 }}>
                    <span style={{ color: '#89999e', fontSize: 13 }}>XP Reward</span>
                    <strong style={{ color: '#43e2b0' }}>+{activeProject.xp} XP</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#89999e', fontSize: 13 }}>Category</span>
                    <strong style={{ color: '#dce5e8' }}>{activeProject.cat}</strong>
                  </div>
                </div>

                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#89999e', fontSize: 12 }}>TECHNOLOGIES</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {activeProject.tech.map((t: string) => (
                      <span key={t} className="tag" style={{ background: 'rgba(67, 226, 176, 0.1)', color: '#43e2b0' }}>{t}</span>
                    ))}
                  </div>
                </div>
                
                <div className="notice notice-info" style={{ margin: 0 }}>
                  <strong>Independent Work Expected</strong><br/>
                  This is a project challenge. No hidden solutions or step-by-step code will be provided. Build it in your own environment!
                </div>
              </div>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  const filtered = filter === 'All' ? PROJECTS : PROJECTS.filter(p => p.cat.includes(filter) || p.diff === filter);

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in">
          <PageHeading 
            eyebrow="PORTFOLIO & APPLICATION"
            title="Project Hub"
            subtitle="Build realistic, portfolio-ready projects based on professional requirements."
          />
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            <div style={{ flex: 2, display: 'flex', gap: 10, background: '#0a1922', padding: 15, borderRadius: 8, border: '1px solid #1a3c4a' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dce5e8', fontSize: 24 }}>1</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>COMPLETED</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#43e2b0', fontSize: 24 }}>1</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>IN PROGRESS</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dfbd78', fontSize: 24 }}>200</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>XP EARNED</span>
              </div>
            </div>
            
            <div style={{ flex: 3, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#89999e' }} />
              <input type="text" placeholder="Search projects by name, skill, or category..." style={{ width: '100%', height: '100%', padding: '15px 15px 15px 45px', background: '#0a1922', border: '1px solid #1a3c4a', borderRadius: 8, color: '#dce5e8', outline: 'none' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 25, flexWrap: 'wrap' }}>
            {['All', 'Cybersecurity', 'Programming', 'AI', 'Beginner', 'Intermediate', 'Advanced'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`tag ${f === filter ? 'selected' : ''}`} 
                style={{ 
                  background: f === filter ? '#1a3c4a' : 'transparent', 
                  border: '1px solid #1a3c4a', 
                  color: f === filter ? '#43e2b0' : '#89999e', 
                  padding: '6px 16px', 
                  borderRadius: 20, 
                  cursor: 'pointer' 
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
            {filtered.map(p => (
              <div key={p.id} className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                  <div>
                    <span className="tag" style={{ background: 'rgba(67, 226, 176, 0.1)', color: '#43e2b0', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 'bold', marginRight: 10 }}>{p.cat.toUpperCase()}</span>
                    <span className="tag" style={{ border: `1px solid ${p.diff === 'Beginner' ? '#43e2b0' : p.diff === 'Intermediate' ? '#dfbd78' : '#e24361'}`, color: p.diff === 'Beginner' ? '#43e2b0' : p.diff === 'Intermediate' ? '#dfbd78' : '#e24361', fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>{p.diff.toUpperCase()}</span>
                  </div>
                  {p.status === 'Completed' ? <CheckCircle2 size={18} color="#43e2b0" /> : p.status === 'In Progress' ? <Activity size={18} color="#dfbd78" /> : null}
                </div>
                
                <h3 style={{ fontSize: 18, color: '#dce5e8', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {p.icon} {p.title}
                </h3>
                <p style={{ fontSize: 14, color: '#89999e', flex: 1, lineHeight: 1.5 }}>{p.desc}</p>
                
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '15px 0' }}>
                  {p.tech.map(t => <span key={t} className="tag" style={{ background: '#0a1922', color: '#89999e', fontSize: 11 }}>{t}</span>)}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 15, borderTop: '1px solid #1a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 15, fontSize: 12, color: '#89999e' }}>
                    <span><Clock3 size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/> {p.time}</span>
                    <span style={{ color: '#43e2b0' }}><Award size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}/> {p.xp} XP</span>
                  </div>
                  <Button variant="outline" size="small" onClick={() => setActiveProject(p)}>View Problem</Button>
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <Folder size={28} />
                <b>No projects found</b>
                <span>Try adjusting your filters or search query.</span>
              </div>
            )}
          </div>
        </div>
      </Shell>
    </NeedAuth>
  );
}
