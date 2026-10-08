import { useEffect, useState, useRef, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Award, BookOpen,
  Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Crosshair,
  ExternalLink, Eye, FileWarning, Flag, LockKeyhole, LogOut, Mail,
  Menu, MessageSquareText, Plus, Radar, Shield, ShieldCheck, Sparkles,
  Target, TrendingUp, Trophy, X,
  Code, Bot, Folder, GraduationCap, LayoutDashboard, Brain, MessageSquare, Terminal, Lightbulb, Play, Send, Search, Cpu,
  Zap, Flame, ArrowUp, ArrowDown, Minus, User,
  Copy, ThumbsUp, ThumbsDown, Minimize2, Maximize2, Paperclip, Trash2, Network, Calendar
} from 'lucide-react';
import {
  Assessment, Difficulty, GetLeaderboardPeriod, useArchiveMission,
  useAskCyberMentor, useCreateMission, useGetCurrentUser, useGetLeaderboard,
  useGetMission, useGetMyProfile, useGetProgress, useListAdminMissions,
  useListMissions, useLogin, useLogout, useRegister, useSubmitMissionAttempt,
  useUpdateMission, useUpdateMyProfile, getGetCurrentUserQueryKey,
  getGetMyProfileQueryKey, getGetProgressQueryKey, getGetMissionQueryKey,
  getGetLeaderboardQueryKey, getListAdminMissionsQueryKey, getListMissionsQueryKey,
} from '@workspace/api-client-react';
import type { Mission, MissionInput } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import CodingLab from '@/pages/coding-lab';
import LearningAcademy from '@/pages/learning-academy';
import CybersecurityAcademy from '@/pages/cybersecurity-academy';
import CyberEventsPage from '@/pages/cyber-events';
import ProgrammingAcademy from '@/pages/programming-academy';
import ProjectHub from '@/pages/project-hub';
import Challenges from '@/pages/challenges';
import ProgressDashboard from '@/pages/progress';
import Certificates from '@/pages/certificates';
import InterviewPrep from '@/pages/interview-prep';
import Dashboard from '@/pages/dashboard';
import LessonView from '@/pages/lesson-view';

const qc = new QueryClient();
const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');
const box = 'panel';
const SESSION_HINT = 'cyberquest-session';
function hasSessionHint() {
  return typeof window !== 'undefined' && window.localStorage.getItem(SESSION_HINT) === '1';
}
const prettyError = (e: unknown) => {
  if (e && typeof e === 'object' && 'error' in e) return String((e as {error:{message?:string}}).error?.message || 'Request could not be completed.');
  return e instanceof Error ? e.message : 'Something went wrong. Please try again.';
};
export function Notice({ children, tone = 'error' }: { children: ReactNode; tone?: 'error'|'success'|'info' }) {
  return <div className={`notice notice-${tone}`} role="status">{children}</div>;
}
export function Loading({ label='Loading secure workspace' }: {label?:string}) {
  return <div className="loading-state"><div className="skeleton-line w-32"/><div className="skeleton-line w-64"/><span className="mono">{label}</span></div>;
}
export function PageHeading({ eyebrow, title, subtitle, right }: {eyebrow:string; title:string; subtitle?:string; right?:ReactNode}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1 className="display">{title}</h1>{subtitle&&<p>{subtitle}</p>}</div>{right&&<div>{right}</div>}</div>;
}
export function Button({ children, onClick, variant='primary', disabled, type='button', className='', ...props }: {children:ReactNode;onClick?:(e?:any)=>void;variant?:'primary'|'quiet'|'outline'|'danger';disabled?:boolean;type?:'button'|'submit';className?:string;[key:string]:any}) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} ${className}`} {...props}>{children}</button>;
}
function Field({label, ...props}: {label:string;[key:string]:any}) {
  return <label className="field"><span>{label}</span><input {...props}/></label>;
}
export function Shell({children}: {children:ReactNode}) {
  const [mobile,setMobile]=useState(false);
  const [loc,setLoc]=useLocation();
  const auth=useGetCurrentUser({query:{queryKey:getGetCurrentUserQueryKey(),enabled:hasSessionHint()}});
  const logout=useLogout({
    request: {
      credentials: 'include',
    },
  });
  const user=auth.data?.data?.user;

  const handleLogout = () => {
    if (logout.isPending) return;
    const finalizeLogout = () => {
      window.localStorage.removeItem(SESSION_HINT);
      qc.clear();
      setLoc('/login');
    };
    try {
      logout.mutate(undefined, {
        onSuccess: finalizeLogout,
        onError: finalizeLogout,
        onSettled: finalizeLogout,
      });
    } catch {
      finalizeLogout();
    }
  };
  const mainLinks=[
    ['/dashboard','Dashboard', <LayoutDashboard size={16}/>],
    ['/events','Cyber Events', <Calendar size={16}/>],
    ['/learn','Learn', <GraduationCap size={16}/>],
    ['/cybersecurity','Cybersecurity', <Shield size={16}/>],
    ['/programming','Programming', <Code size={16}/>],
    ['/','Missions', <Target size={16}/>],
    ['/lab','Coding Lab', <Terminal size={16}/>],
    ['/projects','Projects', <Folder size={16}/>],
  ];
  const secLinks=[
    ['/mentor','AI Tutor', <Bot size={16}/>],
    ['/challenges','Challenges', <Flag size={16}/>],
    ['/leaderboard','Leaderboard', <Trophy size={16}/>],
    ['/progress','Skill Analytics', <TrendingUp size={16}/>],
    ['/certificates','Certifications', <Award size={16}/>],
    ['/interview','Interview Prep', <MessageSquare size={16}/>],
  ];
  return <div className="app-frame">
    {/* Animated Cyber Background */}
    <div className="cyber-bg">
      <div className="cyber-overlay"></div>
      <div className="cyber-grid"></div>
      <div className="cyber-particles"></div>
    </div>
    
    <aside className={cx('sidebar',mobile&&'nav-open')}>
      <div className="sidebar-top">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Shield size={20}/>
            <Cpu size={12} className="brand-ai-icon" />
            <i/>
          </span>
          <span>CYBERQUEST AI<small>LEARN • CODE • DEFEND</small></span>
        </Link>
      </div>
      
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section">ACADEMY</div>
        {mainLinks.map(([href,label,icon])=><Link key={href as string} href={href as string} onClick={()=>setMobile(false)} className={cx('navlink',loc===href&&'nav-active')}><span className="nav-icon-wrapper">{icon}</span> {label}</Link>)}
        <div className="nav-section">CAREER & PROGRESS</div>
        {secLinks.map(([href,label,icon])=><Link key={href as string} href={href as string} onClick={()=>setMobile(false)} className={cx('navlink',loc===href&&'nav-active')}><span className="nav-icon-wrapper">{icon}</span> {label}</Link>)}
      </nav>
      
      <div className="bottom-actions">
        {user ? (
          <div className="sidebar-profile">
            <div className="sidebar-profile-info">
              <span className="avatar-med">{user.name.slice(0,1).toUpperCase()}</span>
              <div className="profile-details">
                <span className="profile-name">{user.name}</span>
                <span className="profile-stats-text">LEVEL {user.level} • {user.xp.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="profile-progress-bar">
              <div className="profile-progress-fill" style={{ width: '68%' }}></div>
            </div>
            <div className="profile-actions">
              <Link href="/profile" className="profile-link">View Profile</Link>
              <button
                className="profile-logout"
                onClick={handleLogout}
                disabled={logout.isPending}
                data-testid="button-sign-out"
              >
                {logout.isPending ? 'Signing out…' : 'Sign Out \u2192'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 20px 20px', display: 'grid', gap: '10px' }}>
            <Link href="/login" className="btn btn-outline compact full-btn">Sign in</Link>
            <Link href="/register" className="btn btn-primary compact full-btn">Join Academy <ArrowRight size={14}/></Link>
          </div>
        )}
      </div>
    </aside>
    
    <main className="main-area">
      {/* Top Navigation Control Bar */}
      <header className="top-nav-bar">
        <div className="top-nav-left">
          <button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMobile(!mobile)}><Menu size={20}/></button>
          
          <div className="admin-indicator">
            {user?.role === 'admin' ? (
              <div className="admin-mode-pill">
                <span className="status-dot green"></span> ADMIN MODE
                <span className="admin-divider">|</span>
                <Link href="/admin" style={{ color: '#dce5e8' }}>MISSION CONTROL</Link>
                <ChevronDown size={14} style={{ marginLeft: 5 }} />
              </div>
            ) : (
              <div className="user-mode-pill">
                <span className="status-dot"></span> USER MODE
              </div>
            )}
          </div>
          
          <div className="security-status-badge">
            <span className="status-dot"></span> SECURITY STATUS: ACTIVE
          </div>
        </div>
        <div className="top-nav-right">
          <div className="system-ops">
            <span className="status-dot green"></span> SYSTEM OPERATIONAL
          </div>
          {user && (
            <>
              <button className="icon-btn notif-btn"><div className="notif-dot"></div><Activity size={18}/></button>
              <div className="user-dropdown">
                <span className="avatar-small">{user.name.slice(0,1).toUpperCase()}</span>
                <span>{user.name}</span>
                <ChevronDown size={14} />
              </div>
            </>
          )}
        </div>
      </header>
      
      <div className="main-scroll-area">
        {children}
        <footer className="footer"><span className="mono">CYBERQUEST AI / COMMAND CENTER</span><span>Built for the next generation of defenders.</span><span className="online"><i/> SECURE CONNECTION</span></footer>
      </div>
    </main>
    <AITutorChat user={user} />
    
    {/* Subtle HUD Effects */}
    <div className="hud-overlay">
      <div className="hud-coord top-left">SYS.OP.2026 // 10.4</div>
      <div className="hud-coord bottom-right">SECURE_LINK_ACTIVE</div>
      <div className="hud-scanner"></div>
    </div>
  </div>;
}
export function NeedAuth({children,admin=false}:{children:ReactNode;admin?:boolean}) {
  const [loc,setLoc]=useLocation();
  const hasHint = hasSessionHint();
  const q=useGetCurrentUser({query:{queryKey:getGetCurrentUserQueryKey(),enabled:hasHint}});

  useEffect(()=>{
    if (!hasHint || (!q.isLoading && !q.data?.data?.user)) {
      if (q.isError || !hasHint) {
        window.localStorage.removeItem(SESSION_HINT);
      }
      setLoc('/login');
    }
  }, [hasHint, q.isLoading, q.data, q.isError, setLoc]);

  if (!hasHint) return null;
  if(q.isLoading)return <Shell><Loading/></Shell>;
  const user=q.data?.data?.user;
  if(!user)return null;
  if(admin&&user.role!=='admin')return <Shell><div className="content-wrap"><Notice>Administrator access is required to view this workspace.</Notice><Link href="/dashboard" className="text-link">Return to command center <ArrowRight size={14}/></Link></div></Shell>;
  return <>{children}</>;
}
function Home() {
  const missions=useListMissions();
  const user=useGetCurrentUser({query:{queryKey:getGetCurrentUserQueryKey(),enabled:hasSessionHint()}}).data?.data?.user;
  const list=missions.data?.data?.missions||[];
  
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  const stats = {
    total: list.length,
    security: list.filter(m => m.category.includes('Security')).length || list.length, // approximation
    coding: 0,
    xp: list.filter(m => m.completed).reduce((sum, m) => sum + m.xpReward, 0),
    completion: list.length ? Math.round((list.filter(m => m.completed).length / list.length) * 100) : 0
  };
  
  const filteredList = list.filter(m => {
    if (filter !== 'All' && !m.category.includes(filter) && !m.difficulty.includes(filter)) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return <Shell><div className="content-wrap fade-in" style={{ maxWidth: '100%' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25, flexWrap: 'wrap', gap: 15 }}>
      <div>
        <h1 className="display" style={{ margin: '0 0 5px', fontSize: 28, color: '#dce5e8' }}>MISSION CONTROL</h1>
        <p style={{ color: '#89999e', margin: '0 0 10px', fontSize: 15 }}>Complete missions, earn XP, and level up your cybersecurity skills.</p>
      </div>
      <div>
        {user?.role === 'admin' && <Link href="/admin" className="btn btn-primary">+ New Mission</Link>}
      </div>
    </div>
    
    {/* Statistics Row */}
    <div style={{ display: 'flex', gap: 15, marginBottom: 25, flexWrap: 'wrap' }}>
      <StatCard label="Total Missions" value={stats.total.toString()} unit="AVAILABLE" icon={<Target size={17}/>} />
      <StatCard label="Security Missions" value={stats.security.toString()} unit="DEFENSE" icon={<Shield size={17}/>} />
      <StatCard label="Coding Missions" value={stats.coding.toString()} unit="DEVELOPMENT" icon={<Code size={17}/>} />
      <StatCard label="Total XP" value={stats.xp.toLocaleString()} unit="EARNED" icon={<Award size={17}/>} />
      <StatCard label="Mission Completion" value={`${stats.completion}%`} unit="SUCCESS RATE" icon={<Activity size={17}/>} />
    </div>
    
    {/* Filters & Search */}
    <div className="panel" style={{ padding: '15px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {['All', 'Security', 'Coding', 'Beginner', 'Intermediate', 'Advanced'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            background: filter === f ? 'rgba(67, 226, 176, 0.15)' : 'transparent',
            color: filter === f ? '#5de8b8' : '#89999e',
            border: `1px solid ${filter === f ? '#43e2b0' : '#2a373d'}`,
            padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s'
          }}>{f}</button>
        ))}
      </div>
      <div style={{ position: 'relative', width: '300px' }}>
        <input 
          type="text" 
          placeholder="Search missions..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: 'rgba(10, 15, 20, 0.5)', border: '1px solid #2a373d', padding: '8px 12px 8px 35px', color: '#dce5e8', borderRadius: 4, outline: 'none' }}
        />
        <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#89999e' }} />
      </div>
    </div>
    
    {/* Mission List */}
    {missions.isLoading ? (
      <div className="mission-grid">{[1,2,3,4,5,6].map(i=><div className={`${box} mission-card`} key={i}><div className="skeleton-line w-32"/><div className="skeleton-line w-64"/></div>)}</div>
    ) : missions.isError ? (
      <Notice>{prettyError(missions.error)}</Notice>
    ) : filteredList.length === 0 ? (
      <div className="empty-state"><Radar size={28}/><b>No active simulations</b><span>Try adjusting your filters or search terms.</span></div>
    ) : (
      <div className="mission-grid">
        {filteredList.map(m => <MissionCard key={m.id} mission={m} />)}
      </div>
    )}
  </div></Shell>;
}

function MissionCard({mission:m}:{mission:Mission}) {
  return <article className={`${box} mission-card`} data-testid={`card-mission-${m.id}`}>
    <div className="mission-card-top" style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 40, height: 40, background: 'rgba(67, 226, 176, 0.1)', border: '1px solid rgba(67, 226, 176, 0.3)', borderRadius: 8, display: 'grid', placeItems: 'center', color: '#43e2b0' }}>
          {m.category.includes('Security') ? <Shield size={20}/> : <Terminal size={20}/>}
        </div>
        <div>
          <span className="tag" style={{ marginBottom: 4, display: 'inline-block' }}>{m.category}</span>
          <br/>
          <span className={`difficulty diff-${m.difficulty.toLowerCase()}`}>{m.difficulty}</span>
        </div>
      </div>
    </div>
    <h3 className="display" style={{ margin: '0 0 10px', fontSize: 18, color: '#dce5e8' }}>{m.title}</h3>
    <p style={{ fontSize: 12, color: '#89999e', marginBottom: 20, flex: 1 }}>{m.description}</p>
    <div className="mission-meta" style={{ borderTop: '1px solid #2a373d', borderBottom: '1px solid #2a373d', padding: '12px 0', marginBottom: 15, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#8da19c' }}><Clock3 size={14} color="#8da19c"/> {m.estimatedMinutes} min</span>
      <span style={{ color: '#dfbd78' }}><Award size={14} color="#dfbd78"/> {m.xpReward} XP</span>
    </div>
    <div className="mission-card-bottom">
      <span className={m.completed ? 'done-state' : 'ready-state'} style={{ fontSize: 11 }}>
        {m.completed ? <><CheckCircle2 size={14}/> COMPLETED</> : <><span className="status-dot"/> READY</>}
      </span>
      <Link href={`/missions/${m.id}`} className="btn btn-outline compact" aria-label={`Open ${m.title}`} data-testid={`link-mission-${m.id}`} style={{ borderColor: '#43e2b0', color: '#43e2b0' }}>
        Start <ArrowRight size={14}/>
      </Link>
    </div>
  </article>;
}
function AuthPage({register}:{register:boolean}) {
  const [loc,setLoc]=useLocation();
  const [name,setName]=useState('');const[email,setEmail]=useState('');const[password,setPassword]=useState('');const[error,setError]=useState('');
  const login=useLogin();const signup=useRegister();const mutation=register?signup:login;
  const submit=(e:FormEvent)=>{e.preventDefault();setError('');mutation.mutate({data:register?{name,email,password}:{email,password}} as any,{onSuccess:(res:any)=>{window.localStorage.setItem(SESSION_HINT,'1');qc.setQueryData(getGetCurrentUserQueryKey(),res);setLoc('/dashboard');},onError:(err:any)=>setError(prettyError(err))});};
  return <Shell><div className="auth-layout"><div className="auth-visual"><div className="auth-orbit"><Shield size={44}/><span className="orbit-dot"/></div><span className="eyebrow">CYBERQUEST / ACCESS NODE</span><h2 className="display">{register?'Your defense journey starts here.':'Good to have you back.'}</h2><p>{register?'Build practical security instincts in a safe, focused environment.':'Resume your learning path and keep building your defensive edge.'}</p><div className="auth-quote mono">“Observe. Verify. Respond.”</div></div><section className="auth-card"><div className="eyebrow">{register?'NEW OPERATIVE':'SECURE SIGN-IN'}</div><h1 className="display">{register?'Create your account':'Access your workspace'}</h1><p>{register?'A name, an email, and a commitment to better defense.':'Your missions and progress are waiting.'}</p>{error&&<Notice>{error}</Notice>}<form onSubmit={submit} className="form-stack">{register&&<Field label="Display name" value={name} onChange={(e:any)=>setName(e.target.value)} minLength={2} required autoComplete="name" data-testid="input-name"/>}<Field label="Email address" type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} required autoComplete="email" data-testid="input-email"/><Field label="Password" type="password" value={password} onChange={(e:any)=>setPassword(e.target.value)} minLength={register?10:1} required autoComplete={register?'new-password':'current-password'} data-testid="input-password"/><Button type="submit" disabled={mutation.isPending} className="full-btn">{mutation.isPending?'Establishing secure session…':register?'Create secure account':'Sign in'} <ArrowRight size={16}/></Button></form><div className="auth-foot">{register?'Already have access?':'New to CyberQuest?'} <Link href={register?'/login':'/register'} className="text-link">{register?'Sign in':'Create an account'}</Link></div><div className="safe-note"><LockKeyhole size={14}/> Cookie-based secure session · defensive learning only</div></section></div></Shell>;
}

function StatCard({label,value,unit,icon}:{label:string;value:string;unit:string;icon:ReactNode}) {return <div className={`${box} stat-card`}><div className="stat-top">{label}<span>{icon}</span></div><div className="stat-value display">{value}</div><div className="stat-unit mono">{unit}</div></div>}
const FINDING_OPTIONS = ['Sender domain mismatch', 'Suspicious link destination', 'Urgent or threatening language', 'Credential request', 'Unexpected attachment', 'Unusual payment request', 'Unexpected sender', 'Request to bypass policy'];
function MissionPage() {
  const {id:raw=''}=useParams<{id:string}>();const id=Number(raw);const q=useGetMission(id,{query:{enabled:Number.isFinite(id)&&id>0,queryKey:getGetMissionQueryKey(id)}});
  const [assessment,setAssessment]=useState<keyof typeof Assessment|''>('');const[findings,setFindings]=useState<string[]>([]);const[feedback,setFeedback]=useState<any>(null);const[error,setError]=useState('');
  const submit=useSubmitMissionAttempt();const m=q.data?.data?.mission;
  const toggle=(x:string)=>setFindings(cur=>cur.includes(x)?cur.filter(y=>y!==x):cur.length<8?[...cur,x]:cur);
  const send=(e:FormEvent)=>{e.preventDefault();if(!assessment){setError('Choose a classification before submitting.');return;}setError('');submit.mutate({id,data:{assessment,findings}},{onSuccess:(res)=>{setFeedback(res.data);qc.invalidateQueries({queryKey:getGetProgressQueryKey()});qc.invalidateQueries({queryKey:getListMissionsQueryKey()});qc.invalidateQueries({queryKey:getGetMissionQueryKey(id)});},onError:(e)=>setError(prettyError(e))});};
  if(q.isLoading)return <Shell><Loading label="Opening isolated investigation"/></Shell>;
  if(q.isError||!m)return <Shell><div className="content-wrap"><Notice>{q.isError?prettyError(q.error):'This mission could not be found.'}</Notice><Link href="/" className="text-link">Return to catalog <ArrowRight size={14}/></Link></div></Shell>;
  return <Shell><div className="content-wrap investigation fade-in"><div className="breadcrumb"><Link href="/">MISSION CATALOG</Link><ChevronRight size={13}/><span>INVESTIGATION {String(m.id).padStart(3,'0')}</span></div><PageHeading eyebrow={`${m.category.toUpperCase()} / ${m.difficulty.toUpperCase()} EXERCISE`} title={m.title} subtitle={m.description} right={<div className="mission-reward"><Award size={17}/><b>{m.xpReward} XP</b><small>REWARD</small></div>}/>
    {feedback?<AnalysisResult feedback={feedback} onAgain={()=>{setFeedback(null);setAssessment('');setFindings([]);}}/>:<div className="investigation-grid"><section className="mail-window"><div className="window-bar"><span className="window-lights"><i/><i/><i/></span><span className="mono">ISOLATED MAIL CLIENT / READ-ONLY SIMULATION</span><span className="sim-label"><ShieldCheck size={12}/> SAFE ENVIRONMENT</span></div><div className="mail-toolbar"><Mail size={16}/><span>INBOX / QUARANTINE REVIEW</span><span className="mono">CASE CQ-{String(m.id).padStart(4,'0')}</span></div><div className="email-head"><div className="email-icon">{m.scenario.senderName.slice(0,1).toUpperCase()}</div><div className="email-address"><b>{m.scenario.senderName}</b><span>{m.scenario.senderEmail}</span><small>TO: {m.scenario.recipientName}</small></div><time>{m.scenario.receivedAt}</time></div><h2 className="email-subject">{m.scenario.subject}</h2><article className="email-body">{m.scenario.body.split('\n').map((line,i)=><p key={i}>{line||'\u00a0'}</p>)}{m.scenario.displayedUrl&&<div className="email-url"><ExternalLink size={14}/><span>{m.scenario.displayedUrl}</span></div>}{m.scenario.attachment&&<div className="attachment"><FileWarning size={16}/><span>{m.scenario.attachment}</span><small>ATTACHMENT</small></div>}</article><div className="mail-footer"><LockKeyhole size={14}/> This email is a fictional training artifact. Links are not active.</div></section>
      <form className={`${box} decision-panel`} onSubmit={send}><div className="panel-heading"><span className="eyebrow">YOUR INVESTIGATION</span><span className="mono muted">01 / CLASSIFY</span></div><p>What is your assessment of this message?</p><div className="assessment-options">{(['SAFE','SUSPICIOUS','PHISHING'] as const).map(option=><button type="button" key={option} onClick={()=>setAssessment(option)} className={cx('assessment-option',assessment===option&&`selected ${option.toLowerCase()}`)}><span className="assessment-indicator">{assessment===option&&<i/>}</span><span>{option}</span><small>{option==='SAFE'?'Legitimate communication':option==='SUSPICIOUS'?'Verify before interacting':'Malicious or deceptive'}</small></button>)}</div><div className="findings-head"><div><span className="eyebrow">02 / MARK EVIDENCE</span><small>Select every signal you observed</small></div><span className="mono">{findings.length} / 8</span></div><div className="finding-list">{FINDING_OPTIONS.map(item=><button type="button" key={item} onClick={()=>toggle(item)} className={cx('finding-option',findings.includes(item)&&'finding-selected')}><span>{findings.includes(item)?<Check size={13}/>:<Plus size={13}/>}</span>{item}</button>)}</div>{error&&<Notice>{error}</Notice>}<Button type="submit" disabled={submit.isPending} className="full-btn">{submit.isPending?'Scoring your investigation…':'Submit assessment'} <ArrowRight size={16}/></Button><div className="submission-note"><Shield size={13}/> Findings and assessment are saved to your learning record.</div></form></div>}
  </div></Shell>;
}
function AnalysisResult({feedback,onAgain}:{feedback:any;onAgain:()=>void}) {
  const f=feedback.feedback;return <div className="analysis-layout fade-in"><section className={`${box} analysis-score`}><div className="eyebrow">AI-GUIDED DEBRIEF / COMPLETE</div><div className="score-ring" style={{'--score':`${f.score}%`} as any}><div><b>{f.score}</b><small> / 100</small></div></div><span className={`risk risk-${f.riskLevel.toLowerCase()}`}>{f.riskLevel} RISK</span><h2 className="display">{f.encouragement}</h2><p>Mission recorded · {feedback.xpAwarded} XP awarded</p><div className="analysis-actions"><Button onClick={onAgain} variant="outline">Review findings</Button><Link href="/dashboard" className="btn btn-primary">View progress <ArrowRight size={15}/></Link></div></section><div className="analysis-details"><section className={`${box} feedback-block`}><span className="eyebrow">ASSESSMENT</span><p>{f.explanation}</p></section><section className={`${box} feedback-block`}><span className="eyebrow positive"><CheckCircle2 size={14}/> CORRECTLY IDENTIFIED</span>{f.correctFindings.length?f.correctFindings.map((x:string)=><div className="feedback-item" key={x}><Check size={14}/>{x}</div>):<p className="muted">No findings matched this time. Every review builds experience.</p>}</section><section className={`${box} feedback-block`}><span className="eyebrow caution"><Eye size={14}/> WORTH A SECOND LOOK</span>{f.missedFindings.length?f.missedFindings.map((x:string)=><div className="feedback-item" key={x}><ArrowDownRight size={14}/>{x}</div>):<p className="muted">You caught every key signal in this review.</p>}</section><section className={`${box} feedback-block`}><span className="eyebrow">RECOMMENDED PRACTICE</span>{f.recommendations.map((x:string)=><div className="feedback-item" key={x}><ArrowRight size={13}/>{x}</div>)}<div className="next-topic"><span className="mono">NEXT TOPIC</span><b>{f.nextRecommendedTopic}</b></div></section></div></div>;
}
function Leaderboard() {
  const [period,setPeriod]=useState<keyof typeof GetLeaderboardPeriod>('weekly');
  const [filter, setFilter] = useState('All Categories');
  const q=useGetLeaderboard({period},{query:{queryKey:getGetLeaderboardQueryKey({period})}});
  const data=q.data?.data;
  const categories = ['All Categories', 'Cybersecurity', 'Programming', 'Coding Challenges', 'Missions', 'Security Labs'];
  
  // Use real data, and if not enough entries, the podium will just show fewer users
  const entries = data?.entries || [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return <Shell><div className="leaderboard-layout fade-in">
    <div className="leaderboard-main">
      <div className="leaderboard-header">
        <div>
          <span className="eyebrow" style={{color: '#89999e'}}>THE DEFENDER NETWORK</span>
          <h1 className="display" style={{fontSize: 28, margin: '8px 0', color: '#fff'}}>Leaderboard</h1>
          <p style={{color: '#A8B5BA', margin: 0, fontSize: 14, maxWidth: 600, lineHeight: 1.5}}>Compete. Improve. Get Recognized. Track your cybersecurity progress and compete with other defenders through missions, coding challenges and security labs.</p>
        </div>
        <div className="leaderboard-live-badge">
          <span className="leaderboard-live-dot"></span> LIVE RANKINGS
        </div>
      </div>

      <div className="leaderboard-controls">
        <div className="leaderboard-tabs">
          {(['weekly','monthly','global'] as const).map(x=>
            <button key={x} onClick={()=>setPeriod(x)} className={`leaderboard-tab ${period===x?'active':''}`}>
              {x === 'global' ? 'All Time' : x.charAt(0).toUpperCase() + x.slice(1)}
            </button>
          )}
        </div>
        <div className="leaderboard-filters">
          <div className="filter-chips">
            {categories.map(c => 
              <button key={c} className="filter-chip" onClick={()=>setFilter(c)} style={{background: filter === c ? 'rgba(67, 226, 176, 0.15)' : '', borderColor: filter === c ? 'rgba(67, 226, 176, 0.4)' : '', color: filter === c ? '#fff' : ''}}>{c}</button>
            )}
          </div>
          <div className="search-box">
            <Search size={14}/>
            <input type="text" placeholder="Search operator..."/>
          </div>
        </div>
      </div>

      {q.isLoading ? <Loading label="Loading defender rankings"/> : q.isError ? <div className="panel"><Notice>{prettyError(q.error)}</Notice><Button variant="outline" onClick={()=>q.refetch()}>Retry</Button></div> : 
      entries.length === 0 ? 
      <div className="panel" style={{textAlign: 'center', padding: '64px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Trophy size={48} color="#89999e" style={{margin: '0 auto 16px', opacity: 0.5}}/>
        <h2 style={{color: '#fff', fontSize: 20, marginBottom: 8}}>No rankings yet</h2>
        <p style={{color: '#89999e', marginBottom: 32, maxWidth: 400}}>Complete your first mission or coding challenge to appear on the leaderboard.</p>
        <div style={{display: 'flex', gap: 16, justifyContent: 'center'}}>
          <Link href="/" className="btn btn-primary">Start a Mission <ArrowRight size={15} style={{marginLeft:5}}/></Link>
          <button className="btn btn-outline" style={{pointerEvents: 'none', opacity: 0.5}}>Start Coding Challenge</button>
        </div>
      </div>
      :
      <>
        {top3.length > 0 && (
          <div className="podium-container">
            {top3[1] && (
              <div className="podium-item podium-2">
                <div className="podium-avatar">{top3[1].name.slice(0,1).toUpperCase()}</div>
                <div className="podium-name">{top3[1].name}</div>
                <div className="podium-xp">{top3[1].xp.toLocaleString()} XP</div>
                <div className="podium-stats">Lvl {top3[1].level} · {top3[1].missions} Missions</div>
                <div className="podium-rank">2</div>
              </div>
            )}
            {top3[0] && (
              <div className="podium-item podium-1">
                <Trophy size={32} color="#dfbd78" style={{position: 'absolute', top: -75, filter: 'drop-shadow(0 0 10px rgba(223,189,120,0.5))'}}/>
                <div className="podium-avatar">{top3[0].name.slice(0,1).toUpperCase()}</div>
                <div className="podium-name" style={{fontSize: 18, color: '#dfbd78'}}>{top3[0].name}</div>
                <div className="podium-xp" style={{fontSize: 15}}>{top3[0].xp.toLocaleString()} XP</div>
                <div className="podium-stats">Lvl {top3[0].level} · {top3[0].missions} Missions</div>
                <div className="podium-rank" style={{fontSize: 48, opacity: 0.15}}>1</div>
              </div>
            )}
            {top3[2] && (
              <div className="podium-item podium-3">
                <div className="podium-avatar">{top3[2].name.slice(0,1).toUpperCase()}</div>
                <div className="podium-name">{top3[2].name}</div>
                <div className="podium-xp">{top3[2].xp.toLocaleString()} XP</div>
                <div className="podium-stats">Lvl {top3[2].level} · {top3[2].missions} Missions</div>
                <div className="podium-rank">3</div>
              </div>
            )}
          </div>
        )}

        {rest.length > 0 && (
          <div className="leaderboard-table-container">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Operator</th>
                  <th>Level</th>
                  <th>XP</th>
                  <th>Missions</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, idx) => (
                  <tr key={entry.userId} className={`lb-row ${data?.currentUserId === entry.userId ? 'is-current-user' : ''}`}>
                    <td>
                      <div className="lb-rank">
                        {entry.rank}
                        <div className="rank-move">
                          {idx % 3 === 0 ? <><ArrowUp size={12} className="rank-up"/>+1</> : idx % 3 === 1 ? <><ArrowDown size={12} className="rank-down"/>-2</> : <Minus size={12} className="rank-same"/>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="lb-operator">
                        <div className="lb-avatar">{entry.name.slice(0,1).toUpperCase()}</div>
                        {entry.name}
                        {data?.currentUserId === entry.userId && <span className="lb-you-badge">YOU</span>}
                      </div>
                    </td>
                    <td><span className="mono">LVL {entry.level}</span></td>
                    <td style={{color: '#43e2b0', fontWeight: 600}}>{entry.xp.toLocaleString()}</td>
                    <td>{entry.missions}</td>
                    <td>{75 + (idx % 20)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>}
    </div>

    <aside className="leaderboard-side">
      <div className="side-panel">
        <h3 className="side-panel-title"><User size={16} color="#43e2b0"/> My Ranking</h3>
        <div className="my-rank-stats">
          <div className="my-rank-stat">
            <label>Current Rank</label>
            <span>#{data?.entries.find(e => e.userId === data.currentUserId)?.rank || '--'}</span>
          </div>
          <div className="my-rank-stat">
            <label>Total XP</label>
            <span style={{color: '#43e2b0'}}>{data?.entries.find(e => e.userId === data.currentUserId)?.xp.toLocaleString() || '0'}</span>
          </div>
          <div className="my-rank-stat">
            <label>Percentile</label>
            <span>Top 18%</span>
          </div>
          <div className="my-rank-stat">
            <label>Skill Score</label>
            <span>78%</span>
          </div>
        </div>
        <div className="my-rank-progress">
          <label><span>Next Rank: Cyber Guardian</span><span>1,580 XP</span></label>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{width: '68%'}}></div>
          </div>
        </div>
      </div>

      <div className="side-panel">
        <h3 className="side-panel-title"><Award size={16} color="#dfbd78"/> Leaderboard Achievements</h3>
        <div className="achievement-list">
          <div className="achievement-item">
            <div className="achievement-icon"><Trophy size={20}/></div>
            <div className="achievement-info">
              <h4>Top Performer</h4>
              <p>Reach top 10 in weekly</p>
            </div>
            <div className="achievement-reward">+500 XP</div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon"><Flame size={20} color="#e24361"/></div>
            <div className="achievement-info">
              <h4>7 Day Streak</h4>
              <p>Complete missions daily</p>
            </div>
            <div className="achievement-reward">+200 XP</div>
          </div>
          <div className="achievement-item">
            <div className="achievement-icon"><ShieldCheck size={20} color="#43e2b0"/></div>
            <div className="achievement-info">
              <h4>Cyber Defender</h4>
              <p>Pass 20 security labs</p>
            </div>
            <div className="achievement-reward">+300 XP</div>
          </div>
        </div>
      </div>

      <div className="side-panel weekly-challenge">
        <h3 className="side-panel-title"><Zap size={16}/> Weekly Cyber Challenge</h3>
        <p style={{color: '#dce5e8', fontSize: 13, marginBottom: 16, lineHeight: 1.5}}>Complete 5 security missions this week</p>
        <div className="my-rank-progress" style={{marginBottom: 16}}>
          <label><span style={{color: '#e24361'}}>Progress: 3/5</span><span style={{color: '#43e2b0'}}>Reward: +250 XP</span></label>
          <div className="progress-bar-bg" style={{background: 'rgba(226,67,97,0.1)'}}>
            <div className="progress-bar-fill" style={{width: '60%', background: 'linear-gradient(90deg, #b0344c, #e24361)'}}></div>
          </div>
        </div>
        <div style={{color: '#89999e', fontSize: 11, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6}}><Clock3 size={12}/> Time remaining: 3 days</div>
        <Link href="/" className="btn btn-outline" style={{width: '100%', justifyContent: 'center', borderColor: 'rgba(226,67,97,0.3)', color: '#e24361'}}>Continue Challenge <ArrowRight size={14} style={{marginLeft: 5}}/></Link>
      </div>
    </aside>
  </div></Shell>;
}
function Profile() {
  const profile=useGetMyProfile();const update=useUpdateMyProfile();const client=useQueryClient();const [name,setName]=useState('');const[userReady,setUserReady]=useState(false);const[message,setMessage]=useState('');const[error,setError]=useState('');
  const user=profile.data?.data?.user;
  useEffect(()=>{if(user&&!userReady){setName(user.name);setUserReady(true);}},[user,userReady]);
  const save=(e:FormEvent)=>{e.preventDefault();setMessage('');setError('');update.mutate({data:{name}},{onSuccess:(res)=>{client.setQueryData(getGetMyProfileQueryKey(),res);client.setQueryData(getGetCurrentUserQueryKey(),res);setMessage('Profile updated successfully.');},onError:e=>setError(prettyError(e))});};
  return <Shell><div className="content-wrap narrow-content">{profile.isLoading?<Loading label="Loading profile"/>:profile.isError?<Notice>{prettyError(profile.error)}</Notice>:user&&<><PageHeading eyebrow="OPERATOR RECORD" title="Profile settings" subtitle="Manage the identity shown across your learning workspace."/><div className={`${box} profile-card`}><div className="profile-identity"><div className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</div><div><span className="eyebrow">ACTIVE OPERATOR</span><h2 className="display">{user.name}</h2><p>{user.email}</p></div><span className="tag">{user.role.toUpperCase()}</span></div><form onSubmit={save} className="form-stack profile-form"><Field label="Display name" value={name} onChange={(e:any)=>setName(e.target.value)} minLength={2} maxLength={80} required data-testid="input-profile-name"/><div className="read-only-field"><span>Email address</span><b>{user.email}</b><small>Email is managed by your account credentials.</small></div><div className="profile-stats"><div><span>LEVEL</span><b>{user.level}</b></div><div><span>EXPERIENCE</span><b>{user.xp.toLocaleString()} XP</b></div><div><span>STREAK</span><b>{user.streak} days</b></div><div><span>MEMBER SINCE</span><b>{new Date(user.createdAt).toLocaleDateString()}</b></div></div>{message&&<Notice tone="success">{message}</Notice>}{error&&<Notice>{error}</Notice>}<Button type="submit" disabled={update.isPending||!name.trim()||name===user.name}>{update.isPending?'Saving changes…':'Save profile'} <Check size={15}/></Button></form></div></>}</div></Shell>;
}
function Mentor() {
  const ask=useAskCyberMentor();const[question,setQuestion]=useState('');const[answer,setAnswer]=useState<any>(null);const[error,setError]=useState('');
  const prompts=[
    'How can I verify a sender domain safely?',
    'What should I do after clicking a suspicious link?',
    'How do passkeys reduce phishing risk?',
    'How do I secure my Python application?',
    'How can I detect a suspicious login?',
    'How should I respond to a ransomware alert?'
  ];
  const topics=['Phishing', 'Network Security', 'Python Security', 'Web Security', 'Incident Response', 'Cloud Security'];
  
  const submit=(e:FormEvent)=>{e.preventDefault();setError('');setAnswer(null);ask.mutate({data:{question}},{onSuccess:r=>{setAnswer(r.data);setQuestion('');},onError:e=>setError(prettyError(e))});};
  
  return <NeedAuth><Shell>
    <div className="mentor-container fade-in">
      <div className="mentor-header">
        <div className="mentor-header-top">
          <h1 className="mentor-title">ASK THE CYBER MENTOR</h1>
          <div className="mentor-status">
            <span className="status-dot"></span> MENTOR ONLINE
          </div>
        </div>
        <p className="mentor-subtitle">Get practical, safety-first guidance for protecting people, applications, networks, and systems.</p>
      </div>

      <div className="mentor-grid">
        <div className="mentor-card">
          <div className="mentor-card-header">
            <div className="mentor-card-title">
              <Shield size={18} color="#43e2b0"/> Defensive Cyber Mentor
            </div>
            <div style={{display: 'flex', gap: 15, alignItems: 'center'}}>
              <div className="mentor-card-ready">● READY • SAFE GUIDANCE ONLY</div>
              <div className="mentor-card-tag">CQ / AI</div>
            </div>
          </div>

          <div className="mentor-content-area">
            {answer ? (
              <div className="mentor-answer">
                <div className="eyebrow" style={{marginBottom: 10, color: '#43e2b0'}}>{answer.topic}{answer.safetyRedirect&&' / SAFETY REDIRECT'}</div>
                <p style={{color: '#dce5e8', lineHeight: 1.6, fontSize: 14}}>{answer.answer}</p>
                <Button variant="outline" onClick={()=>setAnswer(null)} style={{marginTop: 20}}>Ask another question <ArrowRight size={14} style={{marginLeft: 5}}/></Button>
              </div>
            ) : (
              <>
                <div className="mentor-welcome-icon">
                  <Shield size={24}/>
                </div>
                <div className="mentor-welcome-text">
                  <h3>HOW CAN I HELP YOU DEFEND?</h3>
                  <p>Ask about threat detection, secure coding, incident response, networking, privacy, or cybersecurity fundamentals.</p>
                </div>
                <div className="mentor-prompts-grid">
                  {prompts.map(x=><button type="button" key={x} onClick={()=>setQuestion(x)} className="mentor-prompt-card">{x} <ArrowRight size={14}/></button>)}
                </div>
              </>
            )}
            {error && <Notice>{error}</Notice>}
          </div>

          <div className="mentor-input-area">
            <form onSubmit={submit}>
              <textarea 
                className="mentor-textarea"
                value={question} 
                onChange={e=>setQuestion(e.target.value)} 
                minLength={3} 
                maxLength={1000} 
                placeholder="Ask a defensive cybersecurity question..." 
                required 
                data-testid="input-mentor-question"
              />
              <div className="mentor-input-footer">
                <span className="mentor-char-count">{question.length} / 1000</span>
                <Button type="submit" disabled={ask.isPending||question.trim().length<3}>
                  {ask.isPending?'Thinking...':'Send Question'} <ArrowRight size={15} style={{marginLeft: 5}}/>
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="guidelines-card">
          <h3 className="guidelines-title">MENTOR GUIDELINES</h3>
          
          <div className="guideline-item">
            <div className="guideline-icon"><ShieldCheck size={16}/></div>
            <div className="guideline-text">
              <h4>Defense First</h4>
              <p>Guidance focuses on prevention, detection, recognition, and safe response.</p>
            </div>
          </div>

          <div className="guideline-item">
            <div className="guideline-icon"><LockKeyhole size={16}/></div>
            <div className="guideline-text">
              <h4>Keep It Safe</h4>
              <p>Never share passwords, API keys, private information, or real-world sensitive data.</p>
            </div>
          </div>

          <div className="guideline-item">
            <div className="guideline-icon"><Terminal size={16}/></div>
            <div className="guideline-text">
              <h4>Learn by Doing</h4>
              <p>Connect mentor guidance with safe labs, simulations, and coding exercises.</p>
            </div>
          </div>

          <div className="guideline-item">
            <div className="guideline-icon"><Target size={16}/></div>
            <div className="guideline-text">
              <h4>Build Real Skills</h4>
              <p>Practice networking, secure programming, threat analysis, and incident response.</p>
            </div>
          </div>

          <Link href="/" className="btn btn-outline" style={{width: '100%', justifyContent: 'center', marginTop: 10, borderColor: 'rgba(67, 226, 176, 0.3)', color: '#43e2b0'}}>Browse Learning Missions <ArrowRight size={14} style={{marginLeft: 5}}/></Link>

          <div className="quick-topics">
            <h4>QUICK TOPICS</h4>
            <div className="topics-flex">
              {topics.map(t => <div key={t} className="topic-chip" onClick={() => setQuestion(`Tell me about ${t}`)}>{t}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </Shell></NeedAuth>;
}
const freshMissionInput = (): MissionInput => ({title:'',description:'',category:'Email Security',difficulty:Difficulty.Medium,estimatedMinutes:10,xpReward:100,scenario:{senderName:'',senderEmail:'',recipientName:'',subject:'',receivedAt:'',body:'',displayedUrl:null,attachment:null},answerAssessment:Assessment.PHISHING,correctFindings:[]});
function Admin() {
  const q=useListAdminMissions();const create=useCreateMission();const update=useUpdateMission();const archive=useArchiveMission();const client=useQueryClient();const[form,setForm]=useState<MissionInput|null>(null);const[editing,setEditing]=useState<number|null>(null);const[error,setError]=useState('');const[notice,setNotice]=useState('');
  const missions=q.data?.data?.missions||[];
  const set=(key:keyof MissionInput,value:any)=>setForm(cur=>cur?{...cur,[key]:value}:cur);
  const setScenario=(key:keyof MissionInput['scenario'],value:string)=>setForm(cur=>cur?{...cur,scenario:{...cur.scenario,[key]:value||null}}:cur);
  const open=(m?:any)=>{if(m){setEditing(m.id);setForm({...m,scenario:{...m.scenario},correctFindings:[...m.correctFindings]});}else{setEditing(null);setForm(freshMissionInput());}setError('');setNotice('');};
  const finish=()=>{setForm(null);setEditing(null);client.invalidateQueries({queryKey:getListAdminMissionsQueryKey()});client.invalidateQueries({queryKey:getListMissionsQueryKey()});setNotice(editing?'Mission updated.':'Mission created.');};
  const submit=(e:FormEvent)=>{e.preventDefault();if(!form)return;setError('');const task=editing?update:create;task.mutate(editing?{id:editing,data:form} as any:{data:form} as any,{onSuccess:finish,onError:e=>setError(prettyError(e))});};
  return <NeedAuth admin><Shell><div className="content-wrap admin-wrap"><PageHeading eyebrow="ADMINISTRATION / CONTENT CONTROL" title="Mission control" subtitle="Author and maintain safe, simulated investigations." right={<Button onClick={()=>open()}><Plus size={16}/> New mission</Button>}/>{notice&&<Notice tone="success">{notice}</Notice>}{q.isLoading?<Loading label="Loading mission records"/>:q.isError?<><Notice>{prettyError(q.error)}</Notice><Button variant="outline" onClick={()=>q.refetch()}>Retry</Button></>:<section className={`${box} admin-table`}><div className="admin-table-head"><span>MISSION</span><span>CLASSIFICATION</span><span>DIFFICULTY</span><span>REWARD</span><span>ACTIONS</span></div>{missions.length===0?<div className="empty-state"><Radar size={25}/><b>No missions authored</b><span>Create a safe simulation to populate the catalog.</span><Button onClick={()=>open()}><Plus size={15}/> Create mission</Button></div>:missions.map(m=><div className="admin-row" key={m.id}><div><b>{m.title}</b><small>{m.category} · {m.estimatedMinutes} minutes</small></div><span className={`assessment-label ${m.answerAssessment.toLowerCase()}`}>{m.answerAssessment}</span><span className="mono">{m.difficulty}</span><span className="mono">{m.xpReward} XP</span><div className="admin-actions"><Button variant="quiet" onClick={()=>open(m)}>Edit</Button><Button variant="danger" onClick={()=>{if(window.confirm(`Archive “${m.title}”?`)){archive.mutate({id:m.id},{onSuccess:()=>{client.invalidateQueries({queryKey:getListAdminMissionsQueryKey()});client.invalidateQueries({queryKey:getListMissionsQueryKey()});setNotice('Mission archived.');},onError:e=>setError(prettyError(e))});}}} disabled={archive.isPending}>Archive</Button></div></div>)}</section>}
    {error&&<Notice>{error}</Notice>}{form&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setForm(null);}}><div className="mission-modal"><div className="modal-title"><div><span className="eyebrow">{editing?'EDIT MISSION':'MISSION AUTHORING'}</span><h2 className="display">{editing?'Update scenario':'Create a simulation'}</h2></div><button className="icon-btn" onClick={()=>setForm(null)} aria-label="Close"><X size={18}/></button></div><form className="admin-form" onSubmit={submit}><div className="form-two"><Field label="Mission title" value={form.title} onChange={(e:any)=>set('title',e.target.value)} minLength={3} maxLength={120} required/><Field label="Category" value={form.category} onChange={(e:any)=>set('category',e.target.value)} required/></div><label className="field"><span>Description</span><textarea value={form.description} onChange={e=>set('description',e.target.value)} minLength={10} required/></label><div className="form-three"><SelectField label="Difficulty" value={form.difficulty} onChange={v=>set('difficulty',v)} options={['Easy','Medium','Hard','Expert']}/><Field label="Minutes" type="number" min={1} max={180} value={form.estimatedMinutes} onChange={(e:any)=>set('estimatedMinutes',Number(e.target.value))}/><Field label="XP reward" type="number" min={10} max={500} value={form.xpReward} onChange={(e:any)=>set('xpReward',Number(e.target.value))}/></div><div className="form-divider">SIMULATED MESSAGE DETAILS</div><div className="form-two"><Field label="Sender name" value={form.scenario.senderName} onChange={(e:any)=>setScenario('senderName',e.target.value)} required/><Field label="Sender email" type="email" value={form.scenario.senderEmail} onChange={(e:any)=>setScenario('senderEmail',e.target.value)} required/><Field label="Recipient name" value={form.scenario.recipientName} onChange={(e:any)=>setScenario('recipientName',e.target.value)} required/><Field label="Received at" value={form.scenario.receivedAt} onChange={(e:any)=>setScenario('receivedAt',e.target.value)} placeholder="Today, 09:42 AM" required/></div><Field label="Subject" value={form.scenario.subject} onChange={(e:any)=>setScenario('subject',e.target.value)} required/><label className="field"><span>Message body</span><textarea className="body-editor" value={form.scenario.body} onChange={e=>setScenario('body',e.target.value)} required/></label><div className="form-two"><Field label="Displayed URL (optional)" value={form.scenario.displayedUrl||''} onChange={(e:any)=>setScenario('displayedUrl',e.target.value)} placeholder="https://example.test"/><Field label="Attachment (optional)" value={form.scenario.attachment||''} onChange={(e:any)=>setScenario('attachment',e.target.value)} placeholder="document.pdf"/></div><div className="form-divider">ANSWER KEY · ADMIN ONLY</div><SelectField label="Correct assessment" value={form.answerAssessment} onChange={v=>set('answerAssessment',v)} options={['SAFE','SUSPICIOUS','PHISHING']}/><label className="field"><span>Expected finding signals (one per line)</span><textarea value={form.correctFindings.join('\n')} onChange={e=>set('correctFindings',e.target.value.split('\n').map(x=>x.trim()).filter(Boolean))} required/></label><div className="modal-actions"><Button variant="outline" onClick={()=>setForm(null)}>Cancel</Button><Button type="submit" disabled={create.isPending||update.isPending}>{create.isPending||update.isPending?'Saving…':editing?'Save changes':'Create mission'} <ArrowRight size={15}/></Button></div></form></div></div>}
  </div></Shell></NeedAuth>;
}
function SelectField({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}) {return <label className="field"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x} value={x}>{x}</option>)}</select></label>}
function RoutedErrorBoundary({children}:{children:ReactNode}){const [loc]=useLocation();return <ErrorBoundary resetKey={loc}>{children}</ErrorBoundary>}
function ComingSoon({title, icon, text}: {title:string, icon:ReactNode, text:string}) {
  return <NeedAuth><Shell><div className="content-wrap fade-in"><PageHeading eyebrow="WORK IN PROGRESS" title={title} subtitle="This module is currently being constructed for the Academy."/>
  <div className="empty-state">
    <div style={{color:'#4de0ae'}}>{icon}</div>
    <b style={{fontSize:20, marginTop:10}}>{title}</b>
    <span style={{maxWidth:400}}>{text}</span>
    <Link href="/dashboard" className="btn btn-primary" style={{marginTop:20}}>Return to Dashboard</Link>
  </div>
  </div></Shell></NeedAuth>
}

function AITutorChat({user}: {user?: any}) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [msg, setMsg] = useState('');
  const [mode, setMode] = useState('LEARN');
  const [history, setHistory] = useState<{role:'user'|'ai', text:string, raw?: boolean}[]>([]);
  
  const ask = useAskCyberMentor();
  
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(endRef.current) endRef.current.scrollIntoView({behavior:'smooth'})}, [history, open, minimized, ask.isPending]);

  const send = (txt: string) => {
    if (!txt.trim() || ask.isPending) return;
    setMsg('');
    setHistory(c => [...c, {role:'user', text:txt}]);
    
    ask.mutate({ data: { question: txt } }, {
      onSuccess: (r) => {
        setHistory(c => [...c, {role:'ai', raw: true, text: r.data.answer}]);
      },
      onError: (e) => {
        setHistory(c => [...c, {role:'ai', text: 'Error connecting to the AI Tutor.'}]);
      }
    });
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(msg);
    }
  };
  
  if (!user) return null;

  return <>
    {!open && (
      <button 
        className="ai-tutor-fab" 
        onClick={() => { setOpen(true); setMinimized(false); }}
        title="Ask AI Tutor"
        aria-label="Ask AI Tutor"
      >
        <Bot size={22} />
        <span className="ai-tutor-fab-label">Ask AI Tutor</span>
      </button>
    )}
    
    {open && <div className={`ai-tutor-backdrop ${minimized ? 'ai-tutor-minimized' : ''}`}>
      <div className="ai-tutor-window fade-in">
        <div className="ai-tutor-header">
          <div className="ai-tutor-header-left">
            <div className="ai-tutor-icon"><Brain size={20}/></div>
            <div className="ai-tutor-header-title">
              <h2>CYBERQUEST AI TUTOR <span className="ai-tutor-status"><span className="leaderboard-live-dot" style={{display:'inline-block',marginRight:4}}></span>ONLINE</span></h2>
              <p>Your personal cybersecurity learning assistant</p>
            </div>
          </div>
          <div className="ai-tutor-header-actions">
            <button onClick={()=>{setMinimized(true); setOpen(false);}} aria-label="Minimize"><Minimize2 size={16}/></button>
            <button className="close-btn" onClick={()=>{setOpen(false); setHistory([]);}} aria-label="Close"><X size={16}/></button>
          </div>
        </div>

        <div className="ai-tutor-layout">
          <div className="ai-tutor-sidebar">
            <div className="ai-tutor-mode-selector">
              <span className="eyebrow">LEARNING MODE</span>
              {['LEARN', 'PRACTICE', 'INTERVIEW', 'DEBUG', 'CYBERSECURITY', 'PROGRAMMING'].map(m => (
                <button key={m} onClick={()=>setMode(m)} className={`tutor-mode-btn ${mode===m?'active':''}`}>
                  {m==='DEBUG' ? <Terminal size={14}/> : m==='INTERVIEW' ? <Target size={14}/> : m==='PRACTICE' ? <Code size={14}/> : <Brain size={14}/>} {m}
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <span className="eyebrow">TODAY'S PROGRESS</span>
              <div className="sidebar-stat"><span>Questions Asked</span><b>8</b></div>
              <div className="sidebar-stat"><span>Concepts Learned</span><b>5</b></div>
              <div className="sidebar-stat"><span>Practice Score</span><b style={{color:'#43e2b0'}}>82%</b></div>
            </div>

            <div className="sidebar-section">
              <span className="eyebrow">CURRENT TOPIC</span>
              <b style={{color:'#fff', fontSize: 13}}>Cybersecurity Fundamentals</b>
            </div>

            <div className="sidebar-section">
              <span className="eyebrow">RECENT TOPICS</span>
              <div className="recent-topics">
                {['SQL Injection', 'Python', 'Networking', 'Linux', 'SOC Analysis'].map(t => (
                  <div key={t} className="recent-topic-chip" onClick={()=>send(`Let's talk about ${t}`)}>{t}</div>
                ))}
              </div>
            </div>

            <div className="streak-card">
              <span style={{fontSize: 24}}>🔥</span>
              <div>
                <small>LEARNING STREAK</small>
                <b>7 Days</b>
              </div>
            </div>
          </div>

          <div className="ai-tutor-main">
            <div className="chat-history">
              {history.length === 0 ? (
                <div className="chat-empty-state fade-in">
                  <div className="ai-tutor-icon" style={{width: 64, height: 64, borderRadius: 16, marginBottom: 16}}><Bot size={32}/></div>
                  <h2>Your Cybersecurity AI Mentor</h2>
                  <p>Ask anything about cybersecurity, programming, networking, coding, or interview preparation.</p>
                  <div className="chat-categories">
                    <div className="chat-category-card" onClick={()=>send('Teach me Cybersecurity fundamentals')}>
                      <div className="icon-wrap"><Shield size={24}/></div>
                      <span>Cybersecurity</span>
                    </div>
                    <div className="chat-category-card" onClick={()=>send('Help me with Programming')}>
                      <div className="icon-wrap"><Code size={24}/></div>
                      <span>Programming</span>
                    </div>
                    <div className="chat-category-card" onClick={()=>send('Explain Networking basics')}>
                      <div className="icon-wrap"><Network size={24}/></div>
                      <span>Networking</span>
                    </div>
                    <div className="chat-category-card" onClick={()=>send('Prepare me for SOC interview')}>
                      <div className="icon-wrap"><Target size={24}/></div>
                      <span>Interview Prep</span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="chat-message-wrap ai fade-in">
                    <div className="chat-avatar"><Bot size={18}/></div>
                    <div style={{flex: 1}}>
                      <div className="chat-sender-name">AI TUTOR</div>
                      <div className="chat-bubble">
                        Hi Mahesh! 👋<br/><br/>
                        I'm your CyberQuest AI Tutor. I can help you understand cybersecurity, programming, coding challenges, missions, and interview questions.<br/><br/>
                        What would you like to learn today?
                      </div>
                    </div>
                  </div>
                  {history.map((h, i) => (
                    <div key={i} className={`chat-message-wrap ${h.role} fade-in`}>
                      <div className="chat-avatar">{h.role === 'user' ? 'M' : <Bot size={18}/>}</div>
                      <div style={{flex: 1}}>
                        <div className="chat-sender-name">{h.role === 'user' ? 'USER' : 'AI TUTOR'} <span className="chat-timestamp">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                        <div className="chat-bubble">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                  <div className="code-block-wrapper">
                                    <div className="code-block-header">
                                      <span className="code-lang">{match[1]}</span>
                                      <button type="button" className="copy-btn" onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}><Copy size={12}/> Copy Code</button>
                                    </div>
                                    <pre><code className={className} {...props}>{children}</code></pre>
                                  </div>
                                ) : (
                                  <code className={className} {...props}>{children}</code>
                                )
                              }
                            }}
                          >
                            {h.text}
                          </ReactMarkdown>
                        </div>
                        {h.role === 'ai' && (
                          <div className="chat-feedback">
                            <button type="button"><ThumbsUp size={12}/> Helpful</button>
                            <button type="button"><ThumbsDown size={12}/> Not Helpful</button>
                            <button type="button"><Copy size={12}/> Copy</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {ask.isPending && (
                    <div className="chat-message-wrap ai fade-in">
                      <div className="chat-avatar"><Bot size={18}/></div>
                      <div style={{flex: 1}}>
                        <div className="chat-sender-name">AI TUTOR</div>
                        <div className="chat-loading">
                          AI Tutor is thinking <div className="loading-dots"><i/><i/><i/></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={endRef} />
            </div>

            <div className="chat-input-container">
              <div className="quick-prompts-scroll">
                {['Explain SQL Injection', 'Teach me Python', 'C++ Interview Questions', 'How does phishing work?', 'Explain XSS', 'Give me a coding challenge'].map(x => 
                  <button key={x} className="quick-prompt-btn" onClick={()=>send(x)}>{x}</button>
                )}
              </div>
              <div className="chat-input-wrapper">
                <textarea 
                  value={msg} 
                  onChange={e=>setMsg(e.target.value)} 
                  onKeyDown={handleKeyDown}
                  placeholder="Ask your cybersecurity or programming question... (Shift + Enter for new line)"
                  maxLength={2000}
                />
                <div className="chat-input-toolbar">
                  <div className="chat-toolbar-left">
                    <button className="chat-toolbar-btn" title="Attach file"><Paperclip size={15}/></button>
                    <button className="chat-toolbar-btn" onClick={()=>{setHistory([]); setMsg('');}} title="Clear chat"><Trash2 size={15}/></button>
                    <span className="mono">{msg.length} / 2000</span>
                  </div>
                  <button className="chat-send-btn" onClick={()=>send(msg)} disabled={!msg.trim() || ask.isPending}>
                    {ask.isPending ? 'Thinking...' : 'Send'} <Send size={14}/>
                  </button>
                </div>
              </div>
              <div className="chat-footer-note">AI Tutor provides educational and defensive cybersecurity guidance. Verify critical information.</div>
            </div>
          </div>
        </div>
      </div>
    </div>}
  </>;
}

function Router(){return <RoutedErrorBoundary><Switch>
  <Route path="/" component={Home}/><Route path="/login"><AuthPage register={false}/></Route><Route path="/register"><AuthPage register/></Route>
  <Route path="/dashboard"><NeedAuth><Dashboard/></NeedAuth></Route>
  <Route path="/missions/:id"><NeedAuth><MissionPage/></NeedAuth></Route>
  <Route path="/leaderboard" component={Leaderboard}/>
  <Route path="/profile"><NeedAuth><Profile/></NeedAuth></Route>
  <Route path="/mentor"><NeedAuth><Mentor/></NeedAuth></Route>
  <Route path="/admin"><NeedAuth admin><Admin/></NeedAuth></Route>
  <Route path="/events"><NeedAuth><CyberEventsPage/></NeedAuth></Route>
  <Route path="/courses/:courseId/lessons/:lessonId"><NeedAuth><LessonView/></NeedAuth></Route>
  <Route path="/learn/:courseId/lessons/:lessonId"><NeedAuth><LessonView/></NeedAuth></Route>
  <Route path="/learn/:courseId/lesson/:lessonId"><NeedAuth><LessonView/></NeedAuth></Route>
  <Route path="/lessons/:lessonId"><NeedAuth><LessonView/></NeedAuth></Route>
  <Route path="/learn"><NeedAuth><LearningAcademy/></NeedAuth></Route>
  <Route path="/cybersecurity"><NeedAuth><CybersecurityAcademy/></NeedAuth></Route>
  <Route path="/programming"><NeedAuth><ProgrammingAcademy/></NeedAuth></Route>
  <Route path="/lab"><NeedAuth><CodingLab/></NeedAuth></Route>
  <Route path="/projects"><NeedAuth><ProjectHub/></NeedAuth></Route>
  <Route path="/challenges"><NeedAuth><Challenges/></NeedAuth></Route>
  <Route path="/progress"><NeedAuth><ProgressDashboard/></NeedAuth></Route>
  <Route path="/certificates"><NeedAuth><Certificates/></NeedAuth></Route>
  <Route path="/interview"><NeedAuth><InterviewPrep/></NeedAuth></Route>
  <Route component={NotFound}/>
</Switch></RoutedErrorBoundary>}
function App(){return <QueryClientProvider client={qc}><TooltipProvider><Router/><Toaster/></TooltipProvider></QueryClientProvider>}
export default App;
