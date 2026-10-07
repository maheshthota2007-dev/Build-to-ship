import { useState, useEffect } from 'react';
import { Shell, NeedAuth, PageHeading, Button } from '../App';
import { 
  ArrowRight, Activity, Zap, ShieldCheck, Code, TrendingUp,
  Play, Trophy, LockKeyhole, ChevronRight, Target, Calendar
} from 'lucide-react';
import { Link } from 'wouter';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useGetProgress } from '@workspace/api-client-react';
import { getGetProgressQueryKey } from '@workspace/api-client-react';

const WEEKLY_DATA = [
  { name: 'Mon', learning: 2, coding: 1, missions: 1.5 },
  { name: 'Tue', learning: 1, coding: 2, missions: 2 },
  { name: 'Wed', learning: 3, coding: 1.5, missions: 0 },
  { name: 'Thu', learning: 0.5, coding: 3, missions: 1 },
  { name: 'Fri', learning: 2, coding: 2, missions: 2.5 },
  { name: 'Sat', learning: 1, coding: 3, missions: 3 },
  { name: 'Sun', learning: 1.5, coding: 1.5, missions: 2 },
];

export default function Dashboard() {
  const progress = useGetProgress();
  const p = progress.data?.data;
  
  if (progress.isLoading) {
    return (
      <NeedAuth>
        <Shell>
          <div className="content-wrap fade-in">
            <div className="loading-state">
              <div className="skeleton-line w-32"/>
              <div className="skeleton-line w-64"/>
              <span className="mono">Loading your command center</span>
            </div>
          </div>
        </Shell>
      </NeedAuth>
    );
  }

  // Fallback data if API fails or is missing
  const level = p?.level || 7;
  const xp = p?.xp || 3420;
  const streak = p?.streak || 7;
  const missionsCompleted = p?.missionsCompleted || 24;

  return (
    <NeedAuth>
      <Shell>
        <div className="content-wrap fade-in" style={{ maxWidth: '100%', padding: '32px' }}>
          
          {/* 1. Top Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h1 className="display" style={{ margin: '0 0 8px', fontSize: 28, color: '#ffffff', fontWeight: 'bold' }}>Good to see you back, Mahesh 👋</h1>
              <p style={{ color: '#89999e', margin: '0 0 10px', fontSize: 15 }}>Your cybersecurity journey continues. Keep learning, coding, and defending.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15, fontSize: 12 }}>
                <span style={{ color: '#43e2b0', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="status-dot" style={{ background: '#43e2b0' }}/> System Operational
                </span>
                <span style={{ color: '#89999e' }}>Last activity: Today</span>
              </div>
            </div>
            <div>
              <Button onClick={() => window.location.href='/learn'}>Continue Learning <ArrowRight size={15} style={{ display: 'inline', marginLeft: 5 }}/></Button>
            </div>
          </div>

          {/* 2. Quick Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 32 }}>
            <StatCard icon={<Zap size={20} color="#dfbd78"/>} title="XP Earned" value="1,240 XP" sub="+180 this week" subColor="#43e2b0" />
            <StatCard icon={<ShieldCheck size={20} color="#43e2b0"/>} title="Missions Completed" value={missionsCompleted.toString()} sub="6 this week" subColor="#43e2b0" />
            <StatCard icon={<Code size={20} color="#89999e"/>} title="Coding Challenges" value="18" sub="72% completion" subColor="#dfbd78" />
            <StatCard icon={<TrendingUp size={20} color="#e24361"/>} title="Current Streak" value={`${streak} Days`} sub="Personal best: 12 days" subColor="#89999e" />
          </div>

          {/* 3. Main Progress Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 32 }}>
            <div className="panel" style={{ background: 'linear-gradient(135deg, rgba(10,25,34,1) 0%, rgba(26,60,74,0.4) 100%)', border: '1px solid #1a3c4a', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <span className="eyebrow" style={{ color: '#89999e' }}>OPERATOR RANK</span>
                <span className="mono muted" style={{ color: '#89999e' }}>LEVEL {level}</span>
              </div>
              <h2 className="display" style={{ margin: '0 0 15px', color: '#dce5e8', fontSize: 24 }}>LEVEL {level} — CYBER EXPLORER</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#43e2b0', fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>
                <span>{xp.toLocaleString()} / 5,000 XP</span>
                <span style={{ color: '#89999e', fontWeight: 'normal' }}>68%</span>
              </div>
              <div className="progress-track" style={{ height: 12, marginBottom: 15 }}><i style={{width: '68%'}}/></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#89999e', marginBottom: 20 }}>
                <span>Next Rank: <strong style={{ color: '#dce5e8' }}>Cyber Guardian</strong></span>
                <span>1,580 XP remaining</span>
              </div>
              <Link href="/progress" className="text-link">View Progress <ArrowRight size={14}/></Link>
            </div>

            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: '#89999e', marginBottom: 15 }}>SKILL PROFICIENCY</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <SkillBar name="Python" score={82} />
                <SkillBar name="C++" score={74} />
                <SkillBar name="JavaScript" score={68} />
                <SkillBar name="SQL" score={72} />
                <SkillBar name="Cybersecurity" score={79} />
                <SkillBar name="Networking" score={61} />
              </div>
              <div style={{ marginTop: 15 }}>
                <Link href="/progress" className="text-link">View Skill Analytics <ArrowRight size={14}/></Link>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* 4. Daily Cyber Challenge */}
            <div className="panel" style={{ border: '1px solid #e24361', background: 'rgba(226, 67, 97, 0.05)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <span className="eyebrow" style={{ color: '#e24361', display: 'flex', alignItems: 'center', gap: 5 }}><Flame size={14} color="#e24361"/> DAILY CYBER CHALLENGE</span>
              </div>
              <h3 style={{ margin: '0 0 10px', color: '#dce5e8', fontSize: 18 }}>Can you identify the suspicious email?</h3>
              <p style={{ color: '#89999e', fontSize: 14, margin: '0 0 15px', lineHeight: 1.5 }}>
                "A targeted phishing attack bypassed the spam filter. Analyze the email headers, sender information, links, and suspicious indicators."
              </p>
              <div style={{ display: 'flex', gap: 15, fontSize: 12, color: '#89999e', marginBottom: 20, flexWrap: 'wrap' }}>
                <span>Difficulty: <strong style={{ color: '#dfbd78' }}>Intermediate</strong></span>
                <span>Time: <strong>5 Minutes</strong></span>
                <span>Reward: <strong style={{ color: '#43e2b0' }}>+50 XP</strong></span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <Button variant="primary" style={{ width: '100%', marginBottom: 10, background: '#e24361', borderColor: '#e24361', color: '#fff' }} onClick={() => window.location.href='/challenges'}>Start Challenge <ArrowRight size={15} style={{ display: 'inline', marginLeft: 5 }}/></Button>
                <div style={{ textAlign: 'center', fontSize: 11, color: '#89999e', fontFamily: 'monospace' }}>Challenge expires in 08:42:15</div>
              </div>
            </div>

            {/* 5. Continue Learning */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="eyebrow" style={{ color: '#89999e', marginBottom: 15 }}>CONTINUE LEARNING</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CourseCard title="Network Security Fundamentals" prog={72} lessons="8/12" diff="Intermediate" />
                <CourseCard title="Python for Cybersecurity" prog={45} lessons="5/11" diff="Beginner" />
                <CourseCard title="Web Application Security" prog={28} lessons="3/10" diff="Advanced" />
              </div>
            </div>

            {/* 6. Recent Activity & 7. Recommended */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="panel">
                <span className="eyebrow" style={{ color: '#89999e', marginBottom: 15 }}>RECENT ACTIVITY</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ActivityItem text="Completed Python challenge" xp={50} />
                  <ActivityItem text="Completed Network Security lesson" xp={100} />
                  <ActivityItem text="Earned Cyber Explorer badge" xp={0} isBadge />
                  <ActivityItem text="Completed SQL challenge" xp={75} />
                </div>
              </div>
              
              <div className="panel" style={{ border: '1px solid #dfbd78', background: 'rgba(223, 189, 120, 0.05)' }}>
                <span className="eyebrow" style={{ color: '#dfbd78', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}><Target size={14}/> AI RECOMMENDATION</span>
                <p style={{ color: '#dce5e8', fontSize: 13, margin: '0 0 15px', fontStyle: 'italic' }}>
                  "Based on your current skills, you should focus on Networking and Cryptography next."
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 15 }}>
                  <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#dce5e8' }}>Networking Fundamentals</span> <span style={{ color: '#43e2b0' }}>Recommended</span></div>
                  <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#dce5e8' }}>Cryptography Basics</span> <span style={{ color: '#43e2b0' }}>Recommended</span></div>
                  <div style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#dce5e8' }}>Packet Analysis Challenge</span> <span style={{ color: '#dfbd78' }}>New Mission</span></div>
                </div>
                <Button variant="outline" size="small" style={{ width: '100%', borderColor: '#dfbd78', color: '#dfbd78' }}>View Recommendations <ArrowRight size={14}/></Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32 }}>
            {/* 8. Achievements */}
            <div className="panel">
              <span className="eyebrow" style={{ color: '#89999e', marginBottom: 15 }}>ACHIEVEMENTS</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15 }}>
                <AchievementBadge icon={<Trophy size={18}/>} title="First Mission" />
                <AchievementBadge icon={<Flame size={18} color="#e24361"/>} title="7 Day Streak" />
                <AchievementBadge icon={<Code size={18}/>} title="Code Runner" />
                <AchievementBadge icon={<ShieldCheck size={18}/>} title="Cyber Defender" />
                <AchievementBadge icon={<LockKeyhole size={18}/>} title="Security Specialist" />
                <AchievementBadge icon={<Target size={18}/>} title="Sharp Shooter" locked />
                <AchievementBadge icon={<Zap size={18}/>} title="Fast Solver" locked />
              </div>
            </div>

            {/* 9. Weekly Activity Graph */}
            <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <span className="eyebrow" style={{ color: '#89999e' }}>WEEKLY ACTIVITY</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, color: '#dce5e8', fontWeight: 'bold' }}>21.5 hours this week</div>
                  <div style={{ fontSize: 11, color: '#43e2b0' }}>+18% compared with last week</div>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={WEEKLY_DATA} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a3c4a" vertical={false} />
                    <XAxis dataKey="name" stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <YAxis stroke="#1a3c4a" tick={{ fill: '#89999e', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0a1922', border: '1px solid #1a3c4a' }} itemStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="learning" name="Learning" stroke="#43e2b0" strokeWidth={2} dot={{ r: 3, fill: '#0a1922', stroke: '#43e2b0', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="coding" name="Coding" stroke="#dfbd78" strokeWidth={2} dot={{ r: 3, fill: '#0a1922', stroke: '#dfbd78', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="missions" name="Cyber Missions" stroke="#e24361" strokeWidth={2} dot={{ r: 3, fill: '#0a1922', stroke: '#e24361', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 10. Upcoming Events Widget */}
          <div className="panel" style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span className="eyebrow" style={{ color: '#43e2b0', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                <Calendar size={14} color="#43e2b0" /> UPCOMING CYBER EVENTS
              </span>
              <Link href="/events" className="text-link" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                View All Events <ArrowRight size={13} />
              </Link>
            </div>
            <DashboardEventsWidget />
          </div>
          
        </div>
      </Shell>
    </NeedAuth>
  );
}

function DashboardEventsWidget() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events?timeFilter=upcoming')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data?.events) {
          setEvents(res.data.events.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ fontSize: 12, color: '#89999e', padding: '10px 0' }}>Loading scheduled activities...</div>;
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: '12px 0', color: '#89999e', fontSize: 13 }}>
        No upcoming events scheduled right now.{' '}
        <Link href="/events" className="text-link">Explore events directory &rarr;</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
      {events.map((ev) => {
        const start = new Date(ev.startAt);
        const dateStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const timeStr = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        const icon = ev.type === 'LAB' ? '🧪' : ev.type === 'CTF' ? '🚩' : ev.type === 'WORKSHOP' ? '🎓' : '⚡';

        return (
          <div
            key={ev.id}
            style={{
              background: '#0a1922',
              border: '1px solid #1a3c4a',
              borderRadius: 10,
              padding: '14px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ color: '#dce5e8', fontWeight: 600, fontSize: 13.5 }}>{ev.title}</span>
              </div>
              <div style={{ fontSize: 12, color: '#89999e' }}>
                {dateStr} • {timeStr} • <span style={{ color: '#43e2b0' }}>{ev.difficulty}</span>
              </div>
            </div>

            <Link href="/events" className="text-link" style={{ fontSize: 12, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 3 }}>
              View <ArrowRight size={12} />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ icon, title, value, sub, subColor }: any) {
  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 226, 176, 0.1)'}} onMouseLeave={(e) => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ color: '#b0c4c9', fontSize: 14, fontWeight: 'bold', letterSpacing: '0.02em' }}>{title}</div>
        <div style={{ background: 'rgba(10,25,34,0.5)', padding: 8, borderRadius: 6 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 13, color: subColor, marginTop: 'auto', fontWeight: '500' }}>{sub}</div>
    </div>
  );
}

function SkillBar({ name, score }: { name: string, score: number }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: '#dce5e8' }}>{name}</span>
        <span style={{ color: '#43e2b0', fontWeight: 'bold' }}>{score}%</span>
      </div>
      <div className="progress-track" style={{ height: 6 }}><i style={{width: `${score}%`}}/></div>
    </div>
  );
}

function CourseCard({ title, prog, lessons, diff }: any) {
  return (
    <div style={{ background: '#0a1922', border: '1px solid #1a3c4a', borderRadius: 6, padding: 12 }}>
      <h4 style={{ margin: '0 0 8px', color: '#dce5e8', fontSize: 14 }}>{title}</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#89999e', marginBottom: 6 }}>
        <span>{lessons} lessons · {diff}</span>
        <span style={{ color: '#dfbd78' }}>{prog}%</span>
      </div>
      <div className="progress-track" style={{ height: 4, marginBottom: 10 }}><i style={{width: `${prog}%`, background: '#dfbd78'}}/></div>
      <Link href="/learn" className="text-link" style={{ fontSize: 12 }}>Continue <ArrowRight size={12}/></Link>
    </div>
  );
}

function ActivityItem({ text, xp, isBadge = false }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ color: isBadge ? '#dfbd78' : '#43e2b0', marginTop: 2 }}>✓</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#dce5e8', fontSize: 13 }}>{text} {xp > 0 && <span style={{ color: '#43e2b0' }}>— +{xp} XP</span>}</div>
      </div>
    </div>
  );
}

function AchievementBadge({ icon, title, locked = false }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: locked ? 'transparent' : 'rgba(67, 226, 176, 0.05)', border: `1px solid ${locked ? '#1a3c4a' : '#43e2b0'}`, borderRadius: 20, opacity: locked ? 0.5 : 1 }}>
      <div style={{ color: locked ? '#89999e' : '#43e2b0' }}>{icon}</div>
      <span style={{ color: locked ? '#89999e' : '#dce5e8', fontSize: 12, fontWeight: 'bold' }}>{title}</span>
    </div>
  );
}

// Temporary icon to avoid import issues
function Flame(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke={props.color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
}
