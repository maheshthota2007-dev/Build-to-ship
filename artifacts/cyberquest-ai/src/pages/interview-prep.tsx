import { useState } from 'react';
import { Shell, NeedAuth, PageHeading, Button, Notice } from '../App';
import { 
  MessageSquare, Shield, Code, Network, BrainCircuit, UserCheck, 
  ChevronRight, Play, Search, Zap, Trophy, Flame, Target, LockKeyhole, CheckCircle2 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const ROLES = [
  'SOC Analyst', 'Cybersecurity Analyst', 'Security Engineer', 
  'Penetration Tester', 'Network Security Engineer', 
  'Software Developer', 'Python Developer', 'Full Stack Developer'
];

const PREP_AREAS = [
  { id: 'coding', title: 'Coding Interview', icon: <Code size={24}/>, desc: 'Practice programming problems.', topics: ['C++', 'Python', 'Java', 'JavaScript', 'Data Structures', 'Algorithms'], btn: 'Practice Coding' },
  { id: 'cyber', title: 'Cybersecurity Interview', icon: <Shield size={24}/>, desc: 'Prepare for security-related technical questions.', topics: ['Network Security', 'Web Security', 'Cryptography', 'Linux', 'SOC', 'Incident Response'], btn: 'Practice Security' },
  { id: 'net', title: 'Networking', icon: <Network size={24}/>, desc: 'Prepare networking interview questions.', topics: ['TCP/IP', 'DNS', 'HTTP/HTTPS', 'Firewalls', 'VPN', 'OSI Model'], btn: 'Practice Networking' },
  { id: 'tech', title: 'Technical Questions', icon: <BrainCircuit size={24}/>, desc: 'Practice technical interview questions.', topics: ['Programming', 'Cybersecurity', 'Databases', 'Operating Systems', 'Cloud'], btn: 'View Questions' },
  { id: 'hr', title: 'HR Interview', icon: <UserCheck size={24}/>, desc: 'Practice common HR questions.', topics: ['Tell me about yourself', 'What are your strengths?', 'Why should we hire you?', 'Where do you see yourself in 5 years?'], btn: 'Practice HR' },
  { id: 'mock', title: 'AI Mock Interview', icon: <MessageSquare size={24}/>, desc: 'Have an AI interviewer conduct a realistic interview.', topics: ['Full Simulation', 'Real-time Feedback', 'Voice Interaction', 'Role Specific'], btn: 'Start Mock Interview' },
];

const Q_BANK = [
  { id: 1, q: 'What is OOP?', cat: 'Programming', diff: 'Easy' },
  { id: 2, q: 'Difference between stack and heap?', cat: 'Programming', diff: 'Medium' },
  { id: 3, q: 'What is SQL Injection?', cat: 'Cybersecurity', diff: 'Medium' },
  { id: 4, q: 'What is IDS vs IPS?', cat: 'Cybersecurity', diff: 'Easy' },
  { id: 5, q: 'Explain the OSI model.', cat: 'Networking', diff: 'Medium' },
  { id: 6, q: 'What is chmod?', cat: 'Linux', diff: 'Easy' },
  { id: 7, q: 'How do you find a running process?', cat: 'Linux', diff: 'Medium' },
];

const CODING_CHALLENGES = [
  { id: 'c1', title: 'Reverse a String', lang: 'C++', diff: 'Easy', xp: 50 },
  { id: 'c2', title: 'Find Duplicate Elements', lang: 'Python', diff: 'Medium', xp: 100 },
  { id: 'c3', title: 'Binary Search', lang: 'Java', diff: 'Medium', xp: 100 },
];

const PERFORMANCE_DATA = [
  { name: 'Int 1', score: 58 },
  { name: 'Int 2', score: 63 },
  { name: 'Int 3', score: 67 },
  { name: 'Int 4', score: 71 },
  { name: 'Int 5', score: 75 },
  { name: 'Int 6', score: 82 },
];

export default function InterviewPrep() {
  const [role, setRole] = useState(ROLES[0]);
  const [qFilter, setQFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const [mockConfig, setMockConfig] = useState({ type: 'Technical', diff: 'Intermediate', duration: '20 Minutes' });
  const [inMock, setInMock] = useState(false);

  const filteredQs = Q_BANK.filter(q => 
    (qFilter === 'All' || q.cat === qFilter) &&
    q.q.toLowerCase().includes(search.toLowerCase())
  );

  if (inMock) {
    return (
      <NeedAuth>
        <Shell>
          <div className="content-wrap fade-in">
            <div className="breadcrumb" style={{ cursor: 'pointer', color: '#89999e', marginBottom: 20 }} onClick={() => setInMock(false)}>
              ← Back to Interview Dashboard
            </div>
            
            <PageHeading 
              eyebrow="AI INTERVIEW ACTIVE"
              title={`${mockConfig.type} Interview`}
              subtitle={`Simulating a ${mockConfig.duration} interview for the ${role} role at ${mockConfig.diff} difficulty.`}
              right={
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#e24361', fontWeight: 'bold', fontSize: 18, marginBottom: 5 }}>19:59</div>
                  <Button variant="outline" style={{ borderColor: '#e24361', color: '#e24361' }} onClick={() => setInMock(false)}>End Interview</Button>
                </div>
              }
            />

            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="panel" style={{ background: '#0a1922', border: '1px solid #43e2b0' }}>
                  <div style={{ display: 'flex', gap: 15, alignItems: 'flex-start' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#43e2b0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a1922', flexShrink: 0 }}>
                      <BrainCircuit size={24} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 10px', color: '#43e2b0', fontSize: 14 }}>AI INTERVIEWER</h3>
                      <p style={{ color: '#dce5e8', fontSize: 18, lineHeight: 1.6, margin: 0 }}>
                        "Welcome to the interview. Let's start with a foundational question. Can you explain the difference between a stateless and a stateful firewall, and when you would use each?"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="panel" style={{ padding: 0 }}>
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid #1a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050a0f' }}>
                    <span style={{ color: '#89999e', fontSize: 12, fontWeight: 'bold' }}>YOUR RESPONSE</span>
                  </div>
                  <div style={{ padding: 20 }}>
                    <textarea 
                      placeholder="Type your answer here..."
                      style={{ width: '100%', minHeight: 150, background: '#12181d', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', padding: 15, fontFamily: 'inherit', resize: 'vertical' }}
                    />
                  </div>
                  <div style={{ padding: '15px 20px', borderTop: '1px solid #1a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#050a0f' }}>
                    <Button variant="quiet">Skip Question</Button>
                    <Button>Submit Answer & Next <ChevronRight size={14}/></Button>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#89999e', fontSize: 12 }}>INTERVIEW PROGRESS</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#dce5e8', marginBottom: 10 }}>
                    <span>Question 1 of 10</span>
                    <span style={{ color: '#43e2b0' }}>10%</span>
                  </div>
                  <div className="progress-track" style={{ height: 6 }}><i style={{width: '10%'}}/></div>
                </div>

                <div className="notice notice-info" style={{ margin: 0 }}>
                  <strong>Interview Tips</strong><br/>
                  Structure your answer clearly. Provide an example if possible.
                </div>
              </div>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in">
          <PageHeading 
            eyebrow="CAREER DEVELOPMENT"
            title="Interview Prep"
            subtitle="Prepare smarter. Practice technical questions. Master your next cybersecurity and software engineering interview."
          />
          
          {/* Target Role Selector */}
          <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 30, background: 'linear-gradient(90deg, rgba(10,25,34,1) 0%, rgba(67,226,176,0.1) 100%)', border: '1px solid #43e2b0' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px', color: '#dce5e8', fontSize: 16 }}>Choose Your Target Role</h3>
              <select 
                value={role} 
                onChange={e => setRole(e.target.value)}
                style={{ width: '100%', maxWidth: 400, padding: 12, background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', outline: 'none', fontSize: 15 }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Button size="large"><Target size={18} style={{ display: 'inline', marginRight: 8 }}/> Start Interview Preparation</Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 30 }}>
            {/* Readiness Score */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: '#dce5e8', fontSize: 18 }}>Interview Readiness</h3>
                <span className="tag" style={{ background: 'rgba(67, 226, 176, 0.1)', color: '#43e2b0' }}>+8% this month</span>
              </div>
              <div style={{ fontSize: 48, color: '#43e2b0', fontWeight: 'bold', marginBottom: 5 }}>78%</div>
              <div className="progress-track" style={{ height: 10, marginBottom: 20 }}><i style={{width: '78%'}}/></div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#89999e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Technical Knowledge:</span> <strong style={{ color: '#dce5e8' }}>82%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Coding Skills:</span> <strong style={{ color: '#dce5e8' }}>75%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Cybersecurity:</span> <strong style={{ color: '#dce5e8' }}>79%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Communication:</span> <strong style={{ color: '#dce5e8' }}>72%</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Problem Solving:</span> <strong style={{ color: '#dce5e8' }}>84%</strong></div>
              </div>
            </div>

            {/* AI Mock Interview Callout */}
            <div className="panel" style={{ border: '1px solid #43e2b0', background: '#0a1922', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(67, 226, 176, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#43e2b0' }}>
                  <BrainCircuit size={28} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px', color: '#43e2b0', fontSize: 20 }}>AI MOCK INTERVIEW</h3>
                  <p style={{ color: '#89999e', margin: 0, fontSize: 14 }}>Practice with an AI interviewer that asks questions based on your selected role and skill level.</p>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15, marginTop: 'auto', marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#89999e', marginBottom: 5 }}>Interview Type</label>
                  <select value={mockConfig.type} onChange={e => setMockConfig({...mockConfig, type: e.target.value})} style={{ width: '100%', padding: 8, background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', fontSize: 13 }}>
                    <option>Technical</option><option>Cybersecurity</option><option>Coding</option><option>HR</option><option>Full Interview</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#89999e', marginBottom: 5 }}>Difficulty</label>
                  <select value={mockConfig.diff} onChange={e => setMockConfig({...mockConfig, diff: e.target.value})} style={{ width: '100%', padding: 8, background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', fontSize: 13 }}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#89999e', marginBottom: 5 }}>Duration</label>
                  <select value={mockConfig.duration} onChange={e => setMockConfig({...mockConfig, duration: e.target.value})} style={{ width: '100%', padding: 8, background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', fontSize: 13 }}>
                    <option>10 Minutes</option><option>20 Minutes</option><option>30 Minutes</option>
                  </select>
                </div>
              </div>
              
              <Button style={{ width: '100%' }} onClick={() => setInMock(true)}><Play size={16} style={{ display: 'inline', marginRight: 8 }}/> Start AI Interview</Button>
            </div>
          </div>

          {/* Prep Areas */}
          <h3 style={{ fontSize: 20, color: '#dce5e8', marginBottom: 20 }}>Interview Preparation Areas</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 40 }}>
            {PREP_AREAS.map(p => (
              <div key={p.id} className="panel" style={{ display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#43e2b0'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a3c4a'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                  <div style={{ color: '#43e2b0' }}>{p.icon}</div>
                  <h3 style={{ margin: 0, color: '#dce5e8', fontSize: 18 }}>{p.title}</h3>
                </div>
                <p style={{ color: '#89999e', fontSize: 14, margin: '0 0 15px', flex: 1 }}>{p.desc}</p>
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: 11, color: '#89999e' }}>TOPICS</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.topics.slice(0,4).map(t => <span key={t} className="tag" style={{ background: '#050a0f', color: '#89999e', fontSize: 11 }}>{t}</span>)}
                    {p.topics.length > 4 && <span className="tag" style={{ background: '#050a0f', color: '#89999e', fontSize: 11 }}>+{p.topics.length - 4} more</span>}
                  </div>
                </div>
                <Button variant="outline" style={{ width: '100%' }}>{p.btn} <ChevronRight size={14}/></Button>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 40 }}>
            {/* Question Bank */}
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 20 }}>Interview Question Bank</h3>
              <div className="panel">
                <div style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#89999e' }} />
                    <input 
                      type="text" 
                      value={search} onChange={e => setSearch(e.target.value)} 
                      placeholder="Search interview questions..." 
                      style={{ width: '100%', padding: '10px 15px 10px 40px', background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                  {['All', 'Programming', 'Cybersecurity', 'Networking', 'Linux', 'Database', 'Cloud', 'HR'].map(f => (
                    <button 
                      key={f} 
                      onClick={() => setQFilter(f)}
                      className={`tag ${f === qFilter ? 'selected' : ''}`} 
                      style={{ background: f === qFilter ? '#1a3c4a' : 'transparent', border: '1px solid #1a3c4a', color: f === qFilter ? '#43e2b0' : '#89999e', padding: '4px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12 }}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredQs.map(q => (
                    <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 15, background: '#050a0f', borderRadius: 4, border: '1px solid #1a3c4a' }}>
                      <div style={{ color: '#dce5e8', fontSize: 14 }}>{q.q}</div>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11 }}>
                        <span style={{ color: '#89999e' }}>{q.cat}</span>
                        <span style={{ color: q.diff === 'Easy' ? '#43e2b0' : q.diff === 'Medium' ? '#dfbd78' : '#e24361' }}>{q.diff}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* QOTD & Weak Areas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="panel" style={{ border: '1px solid #dfbd78', background: 'rgba(223, 189, 120, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h3 style={{ margin: 0, color: '#dfbd78', fontSize: 14, display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={16}/> Question of the Day</h3>
                  <span className="tag" style={{ background: '#dfbd78', color: '#0a1922', fontWeight: 'bold' }}>+50 XP</span>
                </div>
                <p style={{ color: '#dce5e8', fontSize: 16, margin: '0 0 15px', fontWeight: 'bold' }}>"What is the difference between TCP and UDP?"</p>
                <div style={{ display: 'flex', gap: 15, fontSize: 12, color: '#89999e', marginBottom: 20 }}>
                  <span>Difficulty: <strong style={{ color: '#dfbd78' }}>Medium</strong></span>
                  <span>Category: <strong>Networking</strong></span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="primary" style={{ flex: 1, background: '#dfbd78', color: '#0a1922', borderColor: '#dfbd78' }}>Answer Now</Button>
                  <Button variant="outline" style={{ flex: 1, borderColor: '#dfbd78', color: '#dfbd78' }}>Show Explanation</Button>
                </div>
              </div>

              <div className="panel">
                <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Your Weak Areas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 Networking</span><span style={{ color: '#dce5e8' }}>62%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 Cryptography</span><span style={{ color: '#dce5e8' }}>58%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 Communication</span><span style={{ color: '#dce5e8' }}>67%</span></div>
                </div>
                <div style={{ background: 'rgba(67, 226, 176, 0.05)', padding: 15, borderRadius: 4, borderLeft: '2px solid #43e2b0', marginBottom: 15 }}>
                  <h4 style={{ margin: '0 0 5px', color: '#43e2b0', fontSize: 12 }}>AI RECOMMENDATION</h4>
                  <p style={{ color: '#89999e', margin: 0, fontSize: 13, lineHeight: 1.5 }}>Focus on Networking Fundamentals and Cryptography for the next 7 days. Your coding and problem-solving skills are already strong.</p>
                </div>
                <Button variant="outline" style={{ width: '100%' }}>Start Recommended Practice</Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
            {/* Coding Challenges */}
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>Coding Challenges</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {CODING_CHALLENGES.map(c => (
                  <div key={c.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px', color: '#dce5e8', fontSize: 15 }}>{c.title}</h4>
                      <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#89999e' }}>
                        <span>{c.lang}</span>
                        <span style={{ color: c.diff === 'Easy' ? '#43e2b0' : '#dfbd78' }}>{c.diff}</span>
                        <span style={{ color: '#43e2b0' }}>+{c.xp} XP</span>
                      </div>
                    </div>
                    <Button variant="outline" size="small" onClick={() => window.location.href='/lab'}>Solve Challenge</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Chart */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>Interview Performance</h3>
              <div style={{ flex: 1, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a3c4a" vertical={false} />
                    <XAxis dataKey="name" stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0a1922', border: '1px solid #1a3c4a' }} itemStyle={{ color: '#43e2b0' }} />
                    <Line type="monotone" dataKey="score" stroke="#43e2b0" strokeWidth={2} dot={{ r: 4, fill: '#0a1922', stroke: '#43e2b0', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 40 }}>
            {/* Roadmap */}
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>Interview Roadmap</h3>
              <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <RoadmapStep num={1} title="Fundamentals" desc="Programming + Networking" completed />
                <RoadmapStep num={2} title="Technical Skills" desc="Linux + Databases + Security" completed />
                <RoadmapStep num={3} title="Coding Practice" desc="Algorithms + Data Structures" active />
                <RoadmapStep num={4} title="Mock Interviews" desc="AI Technical + HR Interviews" />
                <RoadmapStep num={5} title="Interview Ready" desc="Pass the final assessment" locked />
              </div>
            </div>

            {/* Achievements */}
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>Achievements</h3>
              <div className="panel" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15 }}>
                <Achievement icon={<Trophy size={16}/>} title="First Mock Interview" />
                <Achievement icon={<Zap size={16}/>} title="5 Interviews Completed" />
                <Achievement icon={<Code size={16}/>} title="Coding Master" />
                <Achievement icon={<Shield size={16}/>} title="Cybersecurity Ready" />
                <Achievement icon={<Target size={16}/>} title="80% Interview Score" />
                <Achievement icon={<Flame size={16}/>} title="7 Day Practice Streak" />
              </div>
            </div>
          </div>

        </div>
      </Shell>
    </NeedAuth>
  );
}

function RoadmapStep({ num, title, desc, completed = false, active = false, locked = false }: any) {
  const color = completed ? '#43e2b0' : active ? '#dfbd78' : '#89999e';
  const icon = completed ? <CheckCircle2 size={16} /> : locked ? <LockKeyhole size={16} /> : <div style={{width: 8, height: 8, borderRadius: '50%', background: color}}/>;
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 15, opacity: locked ? 0.5 : 1 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: completed ? 'rgba(67, 226, 176, 0.1)' : active ? 'rgba(223, 189, 120, 0.1)' : '#050a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color, border: `1px solid ${color}` }}>
          {icon}
        </div>
        {num < 5 && <div style={{ width: 2, height: 30, background: completed ? '#43e2b0' : '#1a3c4a' }} />}
      </div>
      <div>
        <div style={{ color, fontWeight: 'bold', fontSize: 14 }}>STEP {num} — {title}</div>
        <div style={{ color: '#89999e', fontSize: 12 }}>{desc}</div>
      </div>
    </div>
  );
}

function Achievement({ icon, title }: { icon: any, title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ color: '#dfbd78', background: 'rgba(223, 189, 120, 0.1)', padding: 6, borderRadius: '50%' }}>
        {icon}
      </div>
      <div style={{ color: '#dce5e8', fontSize: 14 }}>{title}</div>
    </div>
  );
}
