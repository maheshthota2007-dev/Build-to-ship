import { useState } from 'react';
import { Shell, NeedAuth, PageHeading, Button, Notice } from '../App';
import { Award, Shield, Code, ChevronRight, LockKeyhole, Search, CheckCircle2, Download, FileCheck, Trophy, Zap } from 'lucide-react';

const COMPLETED_CERTS = [
  { 
    id: 'CQ-CYB-2026-001', 
    title: 'Cybersecurity Fundamentals', 
    cat: 'Cybersecurity', 
    level: 'Beginner', 
    score: '92%', 
    xp: 500, 
    date: 'October 7, 2026',
    skills: ['Network Security', 'Security Fundamentals', 'Threat Detection'] 
  },
  { 
    id: 'CQ-PY-2026-002', 
    title: 'Python Programming', 
    cat: 'Programming', 
    level: 'Intermediate', 
    score: '88%', 
    xp: 450, 
    date: 'October 2, 2026',
    skills: ['Python', 'Algorithms', 'Data Structures'] 
  },
  { 
    id: 'CQ-WEB-2026-003', 
    title: 'Web Security Specialist', 
    cat: 'Web Security', 
    level: 'Advanced', 
    score: '95%', 
    xp: 750, 
    date: 'September 28, 2026',
    skills: ['XSS', 'SQL Security', 'Authentication', 'Secure Coding'] 
  }
];

const PROGRESS_CERTS = [
  { title: 'Ethical Hacking', prog: 72, xp: 800, level: 'Advanced', skills: ['Pen Testing', 'Reconnaissance', 'Exploitation'] },
  { title: 'Network Security', prog: 48, xp: 600, level: 'Intermediate', skills: ['Packet Analysis', 'Firewalls', 'VPNs'] },
  { title: 'Advanced Cryptography', prog: 35, xp: 900, level: 'Advanced', skills: ['Encryption', 'Hashing', 'PKI'] },
];

const LOCKED_CERTS = [
  { title: 'Cyber Defense Specialist', prereq: 'Complete Cybersecurity Fundamentals & Network Security' },
  { title: 'Penetration Testing Expert', prereq: 'Complete Ethical Hacking & Web Security Specialist' },
  { title: 'Digital Forensics Specialist', prereq: 'Complete Cybersecurity Fundamentals & File Analysis' },
];

export default function Certificates() {
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleVerify = () => {
    if (!verifyId.trim()) return;
    
    // Simulate verification
    if (verifyId === 'CQ-CYB-2026-001' || verifyId === 'CQ-PY-2026-002' || verifyId === 'CQ-WEB-2026-003') {
      const cert = COMPLETED_CERTS.find(c => c.id === verifyId);
      setVerifyResult({
        status: 'verified',
        cert
      });
    } else {
      setVerifyResult({ status: 'not_found' });
    }
  };

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in">
          <PageHeading 
            eyebrow="ACADEMIC CREDENTIALS"
            title="My Certifications"
            subtitle="Earn, verify, and showcase your cybersecurity and programming achievements."
          />
          
          <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
            <div style={{ flex: 1, display: 'flex', gap: 10, background: '#0a1922', padding: 20, borderRadius: 8, border: '1px solid #1a3c4a' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#43e2b0', fontSize: 32 }}>6</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>EARNED</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dfbd78', fontSize: 32 }}>3</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>IN PROGRESS</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dce5e8', fontSize: 32 }}>3,420</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>TOTAL XP</span>
              </div>
              <div style={{ width: 1, background: '#1a3c4a' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="display" style={{ color: '#dce5e8', fontSize: 32 }}>87%</span>
                <span className="mono" style={{ color: '#89999e', fontSize: 11 }}>AVG SCORE</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 40 }}>
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Award size={24} color="#43e2b0"/> Completed Certifications
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {COMPLETED_CERTS.map(c => (
                  <div key={c.id} className="panel" style={{ position: 'relative', overflow: 'hidden', border: '1px solid #43e2b0', background: 'linear-gradient(90deg, rgba(10,25,34,1) 0%, rgba(67,226,176,0.05) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px', color: '#43e2b0', fontSize: 20 }}>{c.title}</h4>
                        <div style={{ color: '#89999e', fontSize: 12, marginBottom: 10 }}>
                          Category: <span style={{ color: '#dce5e8' }}>{c.cat}</span> | Level: <span style={{ color: '#dce5e8' }}>{c.level}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#43e2b0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <CheckCircle2 size={16} /> Completed
                        </div>
                        <div style={{ color: '#89999e', fontSize: 12, marginTop: 5 }}>Score: <strong style={{ color: '#dce5e8' }}>{c.score}</strong></div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 15, fontSize: 13, color: '#89999e', marginBottom: 15 }}>
                      <span>XP: <strong style={{ color: '#43e2b0' }}>+{c.xp}</strong></span>
                      <span>Date: <strong style={{ color: '#dce5e8' }}>{c.date}</strong></span>
                      <span>ID: <strong className="mono" style={{ color: '#dce5e8' }}>{c.id}</strong></span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      <span style={{ fontSize: 12, color: '#89999e', alignSelf: 'center', marginRight: 5 }}>Skills:</span>
                      {c.skills.map(s => <span key={s} className="tag" style={{ background: '#050a0f', color: '#dce5e8', fontSize: 11 }}>{s}</span>)}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <Button variant="primary" style={{ padding: '8px 16px', fontSize: 13 }}><Award size={14} style={{ display: 'inline', marginRight: 6 }}/> View Certificate</Button>
                      <Button variant="outline" style={{ padding: '8px 16px', fontSize: 13 }}><Download size={14} style={{ display: 'inline', marginRight: 6 }}/> Download</Button>
                    </div>
                    
                    <div style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05, transform: 'rotate(-15deg)', pointerEvents: 'none' }}>
                      <Award size={150} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
              <div>
                <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 20 }}>Certificate Verification</h3>
                <div className="panel" style={{ background: '#0a1922' }}>
                  <p style={{ color: '#89999e', fontSize: 13, marginBottom: 15 }}>Enter a Certificate ID below to verify its authenticity and view the credential details.</p>
                  <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#89999e' }} />
                      <input 
                        type="text" 
                        value={verifyId}
                        onChange={(e) => setVerifyId(e.target.value)}
                        placeholder="e.g. CQ-CYB-2026-001" 
                        className="mono"
                        style={{ width: '100%', padding: '10px 10px 10px 35px', background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 4, color: '#dce5e8', outline: 'none', fontSize: 13 }} 
                      />
                    </div>
                    <Button variant="primary" onClick={handleVerify}><FileCheck size={14} style={{ display: 'inline', marginRight: 5 }}/> Verify</Button>
                  </div>

                  {verifyResult && verifyResult.status === 'verified' && (
                    <div style={{ background: 'rgba(67, 226, 176, 0.05)', border: '1px solid #43e2b0', padding: 15, borderRadius: 4 }}>
                      <div style={{ color: '#43e2b0', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                        <CheckCircle2 size={16} /> Certificate Verified
                      </div>
                      <div style={{ fontSize: 13, color: '#89999e', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <div>Student Name: <strong style={{ color: '#dce5e8' }}>John Doe</strong></div>
                        <div>Certification: <strong style={{ color: '#dce5e8' }}>{verifyResult.cert.title}</strong></div>
                        <div>Score: <strong style={{ color: '#dce5e8' }}>{verifyResult.cert.score}</strong></div>
                        <div>Issue Date: <strong style={{ color: '#dce5e8' }}>{verifyResult.cert.date}</strong></div>
                        <div>Certificate ID: <strong className="mono" style={{ color: '#dce5e8' }}>{verifyResult.cert.id}</strong></div>
                      </div>
                    </div>
                  )}

                  {verifyResult && verifyResult.status === 'not_found' && (
                    <div style={{ background: 'rgba(226, 67, 97, 0.05)', border: '1px solid #e24361', padding: 15, borderRadius: 4, color: '#e24361', fontSize: 13 }}>
                      Certificate ID not found. Please verify the ID and try again.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 20 }}>Achievement Summary</h3>
                <div className="panel" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 15 }}>
                  <Achievement icon={<Trophy size={16}/>} title="First Certification" />
                  <Achievement icon={<Shield size={16}/>} title="Cyber Defender" />
                  <Achievement icon={<Code size={16}/>} title="Programming Expert" />
                  <Achievement icon={<LockKeyhole size={16}/>} title="Security Specialist" />
                  <Achievement icon={<Zap size={16}/>} title="Certification Streak" />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 40 }}>
            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>In Progress</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {PROGRESS_CERTS.map(p => (
                  <div key={p.title} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#dce5e8', fontSize: 16 }}>{p.title}</h4>
                      <span style={{ color: '#dfbd78', fontWeight: 'bold' }}>{p.prog}%</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#89999e', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Level: <strong style={{ color: '#dce5e8' }}>{p.level}</strong></span>
                      <span>Reward: <strong style={{ color: '#43e2b0' }}>+{p.xp} XP</strong></span>
                    </div>
                    <div className="progress-track" style={{ height: 6 }}><i style={{width: `${p.prog}%`, background: '#dfbd78'}}/></div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {p.skills.map(s => <span key={s} className="tag" style={{ background: '#050a0f', color: '#89999e', fontSize: 10 }}>{s}</span>)}
                    </div>
                    <Button variant="outline" size="small" style={{ alignSelf: 'flex-start' }}>Continue Learning <ChevronRight size={14}/></Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 18 }}>Locked Certifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {LOCKED_CERTS.map(l => (
                  <div key={l.title} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 15, background: 'rgba(10, 25, 34, 0.5)', opacity: 0.8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#050a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#89999e' }}>
                      <LockKeyhole size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 5px', color: '#89999e', fontSize: 15 }}>{l.title}</h4>
                      <div style={{ fontSize: 12, color: '#e24361' }}>Prerequisite: {l.prereq}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </Shell>
    </NeedAuth>
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
