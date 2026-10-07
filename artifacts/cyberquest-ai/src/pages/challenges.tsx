import { useState } from 'react';
import { Shell, NeedAuth, PageHeading, Button, Notice } from '../App';
import { Code, Shield, Search, Terminal, ChevronRight, CheckCircle2, Award, Flag, Flame, TrendingUp, Trophy } from 'lucide-react';

const PROG_LANGS = [
  { id: 'cpp', name: 'C++', challenges: 10, prog: 4, desc: 'Beginner → Advanced' },
  { id: 'python', name: 'Python', challenges: 10, prog: 6, desc: 'Beginner → Advanced' },
  { id: 'java', name: 'Java', challenges: 8, prog: 3, desc: 'Beginner → Advanced' },
  { id: 'javascript', name: 'JavaScript', challenges: 8, prog: 2, desc: 'Beginner → Advanced' },
  { id: 'sql', name: 'SQL', challenges: 7, prog: 4, desc: 'Beginner → Advanced' },
];

const PROG_CHALLENGES = [
  { id: 'p1', title: '01 — Reverse a String', lang: 'C++', diff: 'Easy', xp: 50, topic: 'Strings', status: 'Completed' },
  { id: 'p2', title: '02 — Find Duplicate Elements', lang: 'Python', diff: 'Easy', xp: 50, topic: 'Arrays', status: 'In Progress' },
  { id: 'p3', title: '03 — Binary Search', lang: 'Java', diff: 'Medium', xp: 100, topic: 'Algorithms', status: 'Not Started' },
  { id: 'p4', title: '04 — SQL Injection Detection', lang: 'SQL', diff: 'Hard', xp: 200, topic: 'Secure Coding', status: 'Not Started' },
];

const CYBER_CATEGORIES = [
  { id: 'web', name: 'Web Security', items: ['SQL Injection', 'XSS Detection', 'Authentication Bypass', 'CSRF'] },
  { id: 'crypto', name: 'Cryptography', items: ['Caesar Cipher', 'Base64 Analysis', 'Hash Identification', 'Encryption Basics'] },
  { id: 'net', name: 'Networking', items: ['Port Identification', 'HTTP Analysis', 'DNS Investigation', 'Packet Analysis'] },
  { id: 'sec', name: 'Secure Coding', items: ['Input Validation', 'Password Security', 'Buffer Overflow Concepts', 'Secure API Design'] },
  { id: 'dfir', name: 'Digital Forensics', items: ['Log Analysis', 'File Metadata', 'Suspicious Activity Detection', 'Incident Investigation'] },
];

const CYBER_CHALLENGES = [
  { id: 'c1', title: 'SQL Injection Basics', cat: 'Web Security', diff: 'Beginner', xp: 100, time: '10 min', status: 'Completed' },
  { id: 'c2', title: 'Analyze Suspicious Login Logs', cat: 'Digital Forensics', diff: 'Intermediate', xp: 150, time: '15 min', status: 'Not Started' },
  { id: 'c3', title: 'Identify a Malicious HTTP Request', cat: 'Networking', diff: 'Advanced', xp: 250, time: '20 min', status: 'Not Started' },
];

export default function Challenges() {
  const [tab, setTab] = useState('programming');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeChallenge, setActiveChallenge] = useState<any>(null);

  if (activeChallenge) {
    const isProg = activeChallenge.lang !== undefined;
    return (
      <NeedAuth>
        <Shell>
          <div className="content-wrap fade-in">
            <div className="breadcrumb" style={{ cursor: 'pointer', color: '#89999e', marginBottom: 20 }} onClick={() => setActiveChallenge(null)}>
              ← Back to Challenge Center
            </div>
            
            <PageHeading 
              eyebrow={isProg ? "PROGRAMMING CHALLENGE" : "CYBERSECURITY MISSION"}
              title={activeChallenge.title}
              subtitle="Demonstrate your expertise in a secure, sandboxed environment."
              right={
                <div style={{ textAlign: 'right', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <Button variant="outline" onClick={() => window.location.href='/lab'}><Terminal size={14} style={{ display: 'inline', marginRight: 5 }}/> Open in Coding Lab</Button>
                </div>
              }
            />

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <span className="tag" style={{ background: 'rgba(67, 226, 176, 0.1)', color: '#43e2b0' }}>{isProg ? activeLangColor(activeChallenge.lang) : activeChallenge.cat}</span>
                      <span className="tag" style={{ border: `1px solid ${diffColor(activeChallenge.diff)}`, color: diffColor(activeChallenge.diff) }}>{diffEmoji(activeChallenge.diff)} {activeChallenge.diff}</span>
                    </div>
                    <span style={{ color: '#43e2b0', fontWeight: 'bold' }}>+{activeChallenge.xp} XP</span>
                  </div>

                  <h3 style={{ margin: '0 0 15px', color: '#43e2b0', fontSize: 14 }}>PROBLEM STATEMENT</h3>
                  <p style={{ color: '#dce5e8', lineHeight: 1.6 }}>{isProg ? 'Write a function that meets the functional requirements described below. Ensure your code handles edge cases properly.' : 'Analyze the provided logs or evidence to answer the security questions. Use your forensic knowledge to determine the attack vector.'}</p>
                  
                  <h3 style={{ margin: '20px 0 15px', color: '#43e2b0', fontSize: 14 }}>LEARNING OBJECTIVE</h3>
                  <p style={{ color: '#dce5e8', lineHeight: 1.6 }}>{isProg ? 'Master ' + activeChallenge.topic + ' manipulation in ' + activeChallenge.lang + '.' : 'Understand and detect ' + activeChallenge.cat + ' vulnerabilities in the wild.'}</p>
                </div>

                <div className="panel" style={{ background: '#050a0f', padding: 0 }}>
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid #1a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a1922' }}>
                    <div style={{ display: 'flex', gap: 15 }}>
                      <span style={{ color: '#43e2b0', fontSize: 12, fontWeight: 'bold', fontFamily: 'monospace' }}>SOLUTION EDITOR</span>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ background: '#12181d', padding: 15, border: '1px solid #1a3c4a', borderRadius: 4, fontFamily: 'monospace', color: '#89999e', minHeight: 200 }}>
                      // Your solution here...<br/>
                      {isProg ? (
                        <>
                          <br/>
                          function solve() {'{'}<br/>
                          &nbsp;&nbsp;// Write code here<br/>
                          {'}'}
                        </>
                      ) : (
                        <>
                          [Evidence loaded from secure sandbox]<br/>
                          Enter your analysis or flag below.
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '15px 20px', borderTop: '1px solid #1a3c4a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a1922' }}>
                    <div style={{ fontSize: 12, color: '#89999e' }}>TEST CASES: 0/3 PASSED</div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {isProg && <Button variant="outline" size="small">Run Tests</Button>}
                      <Button size="small">Submit Solution</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {isProg && (
                  <div className="panel">
                    <h3 style={{ margin: '0 0 15px', color: '#89999e', fontSize: 12 }}>EXAMPLE I/O</h3>
                    <div style={{ background: '#050a0f', padding: 10, borderRadius: 4, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: '#89999e', display: 'block', marginBottom: 5 }}>INPUT</span>
                      <code style={{ color: '#dce5e8' }}>"hello world"</code>
                    </div>
                    <div style={{ background: '#050a0f', padding: 10, borderRadius: 4 }}>
                      <span style={{ fontSize: 11, color: '#89999e', display: 'block', marginBottom: 5 }}>OUTPUT</span>
                      <code style={{ color: '#43e2b0' }}>"dlrow olleh"</code>
                    </div>
                  </div>
                )}
                <div className="panel">
                  <h3 style={{ margin: '0 0 15px', color: '#89999e', fontSize: 12 }}>YOUR PROGRESS</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(67, 226, 176, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#43e2b0' }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div style={{ color: '#dce5e8', fontWeight: 'bold' }}>1,240 XP</div>
                      <div style={{ color: '#89999e', fontSize: 12 }}>Level 4 Explorer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  const progFiltered = PROG_CHALLENGES.filter(c => 
    (filter === 'All' || c.diff === filter || filter === 'Programming' || (filter === 'Completed' && c.status === 'Completed')) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const cyberFiltered = CYBER_CHALLENGES.filter(c => 
    (filter === 'All' || c.diff === filter || filter === 'Cybersecurity' || (filter === 'Completed' && c.status === 'Completed')) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in">
          <PageHeading 
            eyebrow="CODING & CYBER CHALLENGES"
            title="Challenge Center"
            subtitle="Sharpen your programming skills. Master cybersecurity. Complete challenges and earn XP."
          />
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            <div style={{ flex: 3, display: 'flex', gap: 10, background: '#0a1922', padding: 15, borderRadius: 8, border: '1px solid #1a3c4a' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dce5e8', fontSize: 24 }}>12</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>COMPLETED</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#89999e', fontSize: 24 }}>50</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>TOTAL</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#43e2b0', fontSize: 24 }}>1,240</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>XP EARNED</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dfbd78', fontSize: 24, display: 'flex', alignItems: 'center', gap: 5 }}><Flame size={20}/> 5</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>DAY STREAK</span>
              </div>
            </div>
            
            <div className="panel" style={{ flex: 2, padding: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: '#89999e', fontWeight: 'bold' }}>LEVEL 4 — CYBER EXPLORER</span>
                <span style={{ fontSize: 12, color: '#43e2b0' }}>1,240 / 1,500 XP</span>
              </div>
              <div className="progress-track" style={{ height: 8 }}><i style={{width: '82%'}}/></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                <Badge icon={<Trophy size={12}/>} label="First Blood" active />
                <Badge icon={<Terminal size={12}/>} label="Code Runner" />
                <Badge icon={<Shield size={12}/>} label="Cyber Defender" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, borderBottom: '1px solid #1a3c4a', marginBottom: 20 }}>
            <button 
              onClick={() => setTab('programming')}
              style={{ background: 'none', border: 'none', padding: '15px 0', color: tab === 'programming' ? '#43e2b0' : '#89999e', borderBottom: tab === 'programming' ? '2px solid #43e2b0' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 'bold' }}
            >
              <Code size={16}/> Programming
            </button>
            <button 
              onClick={() => setTab('cyber')}
              style={{ background: 'none', border: 'none', padding: '15px 0', color: tab === 'cyber' ? '#43e2b0' : '#89999e', borderBottom: tab === 'cyber' ? '2px solid #43e2b0' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 'bold' }}
            >
              <Shield size={16}/> Cybersecurity
            </button>
          </div>

          <div style={{ display: 'flex', gap: 15, marginBottom: 25, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
              <Search size={16} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#89999e' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search challenges..." style={{ width: '100%', padding: '10px 15px 10px 40px', background: '#0a1922', border: '1px solid #1a3c4a', borderRadius: 20, color: '#dce5e8', outline: 'none' }} />
            </div>
            {['All', 'Easy', 'Medium', 'Hard', 'Completed', 'Not Completed'].map(f => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`tag ${f === filter ? 'selected' : ''}`} 
                style={{ background: f === filter ? '#1a3c4a' : 'transparent', border: '1px solid #1a3c4a', color: f === filter ? '#43e2b0' : '#89999e', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>

          {tab === 'programming' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15, marginBottom: 30 }}>
                {PROG_LANGS.map(l => (
                  <div key={l.id} className="panel" style={{ padding: 15 }}>
                    <h4 style={{ margin: '0 0 5px', color: '#dce5e8' }}>{l.name}</h4>
                    <div style={{ fontSize: 12, color: '#89999e', marginBottom: 15 }}>{l.challenges} Challenges<br/>{l.desc}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#43e2b0', marginBottom: 5 }}>
                      <span>Progress</span>
                      <span>{l.prog}/{l.challenges}</span>
                    </div>
                    <div className="progress-track" style={{ height: 4, marginBottom: 15 }}><i style={{width: `${(l.prog/l.challenges)*100}%`}}/></div>
                    <Button variant="outline" size="small" style={{ width: '100%' }}>Start Challenge</Button>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 18, color: '#dce5e8', marginBottom: 20 }}>Programming Challenge Examples</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {progFiltered.map(p => (
                  <div key={p.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveChallenge(p)}>
                    <div>
                      <h4 style={{ margin: '0 0 10px', color: '#dce5e8', fontSize: 16 }}>{p.title}</h4>
                      <div style={{ display: 'flex', gap: 15, fontSize: 12 }}>
                        <span style={{ color: '#89999e' }}>Language: <span style={{ color: '#dce5e8' }}>{p.lang}</span></span>
                        <span style={{ color: diffColor(p.diff) }}>Difficulty: {p.diff}</span>
                        <span style={{ color: '#43e2b0' }}>XP: +{p.xp}</span>
                        <span style={{ color: '#89999e' }}>Topic: <span style={{ color: '#dce5e8' }}>{p.topic}</span></span>
                      </div>
                    </div>
                    <Button variant={p.status === 'Completed' ? 'quiet' : 'primary'}>{p.status === 'Completed' ? 'Review' : 'Solve'}</Button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'cyber' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 15, marginBottom: 30 }}>
                {CYBER_CATEGORIES.map(c => (
                  <div key={c.id} className="panel" style={{ padding: 15 }}>
                    <h4 style={{ margin: '0 0 15px', color: '#43e2b0' }}>{c.name}</h4>
                    <ul style={{ margin: 0, paddingLeft: 15, color: '#89999e', fontSize: 13, lineHeight: 1.8 }}>
                      {c.items.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 18, color: '#dce5e8', marginBottom: 20 }}>Cybersecurity Challenge Cards</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {cyberFiltered.map(c => (
                  <div key={c.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setActiveChallenge(c)}>
                    <div>
                      <h4 style={{ margin: '0 0 10px', color: '#dce5e8', fontSize: 16 }}>{c.title}</h4>
                      <div style={{ display: 'flex', gap: 15, fontSize: 12 }}>
                        <span style={{ color: '#89999e' }}>Category: <span style={{ color: '#dce5e8' }}>{c.cat}</span></span>
                        <span style={{ color: diffColor(c.diff) }}>Difficulty: {diffEmoji(c.diff)} {c.diff}</span>
                        <span style={{ color: '#43e2b0' }}>XP: +{c.xp}</span>
                        <span style={{ color: '#89999e' }}>Est. Time: <span style={{ color: '#dce5e8' }}>{c.time}</span></span>
                      </div>
                    </div>
                    <Button variant={c.status === 'Completed' ? 'quiet' : 'primary'}>{c.status === 'Completed' ? 'Review' : 'Start Mission'}</Button>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </Shell>
    </NeedAuth>
  );
}

function Badge({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: active ? 'rgba(67, 226, 176, 0.1)' : '#050a0f', border: `1px solid ${active ? '#43e2b0' : '#1a3c4a'}`, borderRadius: 4, color: active ? '#43e2b0' : '#89999e', fontSize: 10, fontWeight: 'bold' }}>
      {icon} {label}
    </div>
  );
}

function diffColor(diff: string) {
  if (diff === 'Easy' || diff === 'Beginner') return '#43e2b0';
  if (diff === 'Medium' || diff === 'Intermediate') return '#dfbd78';
  return '#e24361';
}

function diffEmoji(diff: string) {
  if (diff === 'Easy' || diff === 'Beginner') return '🟢';
  if (diff === 'Medium' || diff === 'Intermediate') return '🟡';
  return '🔴';
}

function activeLangColor(lang: string) {
  return lang || 'General';
}
