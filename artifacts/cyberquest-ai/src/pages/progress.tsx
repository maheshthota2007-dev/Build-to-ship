import { useState } from 'react';
import { Shell, NeedAuth, PageHeading, Button } from '../App';
import { Shield, Code, ChevronRight, Award, TrendingUp, Trophy, Zap, AlertCircle, BrainCircuit } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

const RADAR_DATA = [
  { subject: 'Programming', A: 82, fullMark: 100 },
  { subject: 'Cybersecurity', A: 74, fullMark: 100 },
  { subject: 'Networking', A: 69, fullMark: 100 },
  { subject: 'Cryptography', A: 61, fullMark: 100 },
  { subject: 'Web Security', A: 78, fullMark: 100 },
  { subject: 'Algorithms', A: 85, fullMark: 100 },
  { subject: 'Databases', A: 72, fullMark: 100 },
  { subject: 'Problem Solving', A: 81, fullMark: 100 },
];

const SKILL_LEVELS = [
  { name: 'Python', score: 88 },
  { name: 'C++', score: 82 },
  { name: 'Cybersecurity', score: 76 },
  { name: 'SQL', score: 72 },
  { name: 'Java', score: 70 },
  { name: 'JavaScript', score: 65 },
  { name: 'Networking', score: 60 },
  { name: 'Cryptography', score: 55 },
];

const GROWTH_DATA = [
  { name: 'May', Programming: 58, Cybersecurity: 45 },
  { name: 'June', Programming: 63, Cybersecurity: 51 },
  { name: 'July', Programming: 67, Cybersecurity: 58 },
  { name: 'Aug', Programming: 72, Cybersecurity: 63 },
  { name: 'Sep', Programming: 78, Cybersecurity: 69 },
  { name: 'Oct', Programming: 82, Cybersecurity: 74 },
];

const PIE_DATA = [
  { name: 'Programming', value: 35 },
  { name: 'Cybersecurity', value: 30 },
  { name: 'Networking', value: 15 },
  { name: 'Algorithms', value: 10 },
  { name: 'Cryptography', value: 10 },
];
const PIE_COLORS = ['#43e2b0', '#1a3c4a', '#dfbd78', '#e24361', '#89999e'];

const WEEKLY_DATA = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 3 },
  { name: 'Wed', hours: 1.5 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 2 },
  { name: 'Sat', hours: 5 },
  { name: 'Sun', hours: 3.5 },
];

const CYBER_BREAKDOWN = [
  { name: 'Web Security', score: 78, level: 'Advanced' },
  { name: 'Network Security', score: 69, level: 'Intermediate' },
  { name: 'Cryptography', score: 61, level: 'Intermediate' },
  { name: 'Digital Forensics', score: 72, level: 'Advanced' },
  { name: 'Secure Coding', score: 81, level: 'Advanced' },
  { name: 'Incident Response', score: 58, level: 'Beginner' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#0a1922', border: '1px solid #1a3c4a', padding: 10, borderRadius: 4 }}>
        <p style={{ color: '#dce5e8', margin: '0 0 5px' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, margin: 0, fontSize: 12 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProgressDashboard() {
  const [dateFilter, setDateFilter] = useState('30 Days');

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in">
          <PageHeading 
            eyebrow="SKILL ANALYTICS"
            title="Skill Analytics"
            subtitle="Track your technical growth, identify weak areas, and monitor your cybersecurity expertise."
          />
          
          <div style={{ display: 'flex', gap: 10, marginBottom: 25, flexWrap: 'wrap' }}>
            {['7 Days', '30 Days', '3 Months', 'All Time'].map(f => (
              <button 
                key={f} 
                onClick={() => setDateFilter(f)}
                className={`tag ${f === dateFilter ? 'selected' : ''}`} 
                style={{ background: f === dateFilter ? '#1a3c4a' : 'transparent', border: '1px solid #1a3c4a', color: f === dateFilter ? '#43e2b0' : '#89999e', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Top Row: Overall Score & Level Profile */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
            <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 10px', color: '#dce5e8', fontSize: 18 }}>Overall Skill Score</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 48, color: '#43e2b0', fontWeight: 'bold' }}>78</span>
                    <span style={{ color: '#89999e' }}>/ 100</span>
                  </div>
                </div>
                <span className="tag" style={{ background: 'rgba(67, 226, 176, 0.1)', color: '#43e2b0' }}><TrendingUp size={14} style={{ display: 'inline', marginRight: 4 }}/> +12%</span>
              </div>
              <div className="progress-track" style={{ height: 12, margin: '20px 0' }}><i style={{width: '78%'}}/></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, color: '#89999e' }}>
                <span>Programming: <strong style={{ color: '#dce5e8' }}>82%</strong></span>
                <span>Cybersecurity: <strong style={{ color: '#dce5e8' }}>74%</strong></span>
                <span>Problem Solving: <strong style={{ color: '#dce5e8' }}>81%</strong></span>
                <span>Networking: <strong style={{ color: '#dce5e8' }}>69%</strong></span>
              </div>
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(10,25,34,1) 0%, rgba(26,60,74,0.4) 100%)', border: '1px solid #1a3c4a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#050a0f', border: '2px solid #43e2b0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#43e2b0' }}>
                  <Shield size={30} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 5px', color: '#89999e', fontSize: 12 }}>CURRENT LEVEL</h3>
                  <div style={{ color: '#dce5e8', fontSize: 20, fontWeight: 'bold' }}>CYBER EXPLORER — LEVEL 7</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 12 }}>
                <span style={{ color: '#43e2b0', fontWeight: 'bold' }}>3,420 / 5,000 XP</span>
                <span style={{ color: '#89999e' }}>Next: <span style={{ color: '#dce5e8' }}>Cyber Guardian</span></span>
              </div>
              <div className="progress-track" style={{ height: 8 }}><i style={{width: '68%'}}/></div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="panel" style={{ border: '1px solid #dfbd78', background: 'rgba(223, 189, 120, 0.05)', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 15 }}>
              <BrainCircuit size={24} color="#dfbd78" style={{ flexShrink: 0 }} />
              <div>
                <h3 style={{ margin: '0 0 10px', color: '#dfbd78', fontSize: 16 }}>AI Recommendation</h3>
                <p style={{ color: '#dce5e8', lineHeight: 1.6, margin: '0 0 15px' }}>
                  "Your programming skills are strong, but your networking and cryptography scores are below your overall average. Complete <strong>Networking Fundamentals</strong> and <strong>Cryptography Basics</strong> next to improve your cybersecurity profile."
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button variant="outline" style={{ borderColor: '#dfbd78', color: '#dfbd78' }}>Start Recommended Learning</Button>
                  <Button variant="quiet">View Challenges</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 20 }}>
            {/* Radar Chart */}
            <div className="panel" style={{ minHeight: 350, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Technical Skill Proficiency</h3>
              <div style={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                    <PolarGrid stroke="#1a3c4a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#43e2b0', fontSize: 10 }} />
                    <Radar name="Proficiency" dataKey="A" stroke="#43e2b0" fill="#43e2b0" fillOpacity={0.3} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="panel" style={{ minHeight: 350, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Current Skill Levels</h3>
              <div style={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SKILL_LEVELS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" stroke="#1a3c4a" tick={{ fill: '#dce5e8', fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,60,74,0.2)' }} />
                    <Bar dataKey="score" fill="#43e2b0" radius={[0, 4, 4, 0]} barSize={12} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line Chart */}
            <div className="panel" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Skill Growth Over Time</h3>
              <div style={{ flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={GROWTH_DATA} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a3c4a" vertical={false} />
                    <XAxis dataKey="name" stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="Programming" stroke="#43e2b0" strokeWidth={2} dot={{ r: 4, fill: '#0a1922', stroke: '#43e2b0', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Cybersecurity" stroke="#dfbd78" strokeWidth={2} dot={{ r: 4, fill: '#0a1922', stroke: '#dfbd78', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="panel">
                <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Your Strongest Skills</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟢 Python</span><span style={{ color: '#dce5e8' }}>88%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟢 Algorithms</span><span style={{ color: '#dce5e8' }}>85%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟢 C++</span><span style={{ color: '#dce5e8' }}>82%</span></div>
                </div>
              </div>
              <div className="panel">
                <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Skills to Improve</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 Cryptography</span><span style={{ color: '#dce5e8' }}>55%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 Networking</span><span style={{ color: '#dce5e8' }}>60%</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#89999e', fontSize: 13 }}><span>🟠 JavaScript</span><span style={{ color: '#dce5e8' }}>65%</span></div>
                </div>
                <Button variant="outline" size="small" style={{ width: '100%', borderColor: '#dfbd78', color: '#dfbd78' }}>Improve Weak Skills</Button>
              </div>
            </div>
            
            {/* Donut Chart */}
            <div className="panel" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Learning Activity Distribution</h3>
              <div style={{ flex: 1, minHeight: 250, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#dce5e8' }}>42</div>
                  <div style={{ fontSize: 12, color: '#89999e' }}>hrs</div>
                </div>
              </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="panel" style={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: '#dce5e8', fontSize: 16 }}>Weekly Learning Activity</h3>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#dce5e8', fontWeight: 'bold' }}>21.5 Hours</div>
                  <div style={{ fontSize: 11, color: '#43e2b0' }}>+18% from last week</div>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a3c4a" vertical={false} />
                    <XAxis dataKey="name" stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <YAxis stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(26,60,74,0.2)' }} />
                    <Bar dataKey="hours" fill="#1a3c4a" activeBar={{ fill: '#43e2b0' }} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Cybersecurity Breakdown */}
          <div className="panel" style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 20px', color: '#dce5e8', fontSize: 16 }}>Cybersecurity Proficiency</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {CYBER_BREAKDOWN.map(item => (
                <div key={item.name} style={{ background: '#050a0f', border: '1px solid #1a3c4a', borderRadius: 6, padding: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ color: '#dce5e8', fontSize: 14 }}>{item.name}</span>
                    <span style={{ color: '#43e2b0', fontSize: 14, fontWeight: 'bold' }}>{item.score}%</span>
                  </div>
                  <div className="progress-track" style={{ height: 6, marginBottom: 10 }}><i style={{width: `${item.score}%`}}/></div>
                  <div style={{ fontSize: 11, color: '#89999e', textAlign: 'right' }}>Level: <span style={{ color: item.level === 'Advanced' ? '#43e2b0' : item.level === 'Intermediate' ? '#dfbd78' : '#e24361' }}>{item.level}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="panel">
            <h3 style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 16 }}>Recent Achievements</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
              <Achievement icon={<Trophy size={20}/>} title="Python Mastery" desc="Completed 10 Python challenges" />
              <Achievement icon={<Shield size={20}/>} title="Cyber Defender" desc="Completed 15 cybersecurity challenges" />
              <Achievement icon={<Zap size={20}/>} title="7 Day Streak" desc="Practiced for 7 consecutive days" />
              <Achievement icon={<Code size={20}/>} title="Web Security Specialist" desc="Completed all beginner web-security missions" />
            </div>
          </div>
          
        </div>
      </Shell>
    </NeedAuth>
  );
}

function Achievement({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: '#0a1922', padding: 15, borderRadius: 6, border: '1px solid #1a3c4a' }}>
      <div style={{ color: '#43e2b0', background: 'rgba(67, 226, 176, 0.1)', padding: 10, borderRadius: '50%' }}>
        {icon}
      </div>
      <div>
        <div style={{ color: '#dce5e8', fontWeight: 'bold', fontSize: 14, marginBottom: 2 }}>{title}</div>
        <div style={{ color: '#89999e', fontSize: 11 }}>{desc}</div>
      </div>
    </div>
  );
}
