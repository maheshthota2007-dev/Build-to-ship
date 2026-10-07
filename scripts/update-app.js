const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'artifacts/cyberquest-ai/src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Icons
content = content.replace(
  /Trophy, X,\n} from 'lucide-react';/,
  `Trophy, X, Code, Bot, Folder, GraduationCap, LayoutDashboard, Brain, MessageSquare, Terminal, Lightbulb, Play, Send\n} from 'lucide-react';`
);

// 2. Replace Shell
const shellOriginal = `function Shell({children}: {children:ReactNode}) {
  const [mobile,setMobile]=useState(false);
  const [loc,setLoc]=useLocation();
  const auth=useGetCurrentUser({query:{queryKey:getGetCurrentUserQueryKey(),enabled:hasSessionHint()}});
  const logout=useLogout();
  const user=auth.data?.data?.user;
  const links=[['/','Discover'],['/dashboard','Command center'],['/leaderboard','Leaderboard'],['/mentor','Cyber mentor']];
  return <div className="app-frame">
    <header className="topbar">
      <Link href="/" className="brand"><span className="brand-mark"><Shield size={19}/><i/></span><span>CYBER<span className="brand-accent">QUEST</span><small>DEFENSIVE LEARNING SYSTEM</small></span></Link>
      <button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMobile(!mobile)}><Menu size={20}/></button>
      <nav className={cx('topnav',mobile&&'nav-open')} aria-label="Main navigation">
        {links.map(([href,label])=><Link key={href} href={href} onClick={()=>setMobile(false)} className={cx('navlink',loc===href&&'nav-active')}>{label}</Link>)}
      </nav>
      <div className="top-actions">{user?<><Link href="/profile" className="user-pill"><span className="avatar">{user.name.slice(0,1).toUpperCase()}</span><span>{user.name}<small>LVL {user.level} · {user.xp.toLocaleString()} XP</small></span></Link><button className="icon-btn" title="Sign out" onClick={()=>logout.mutate(undefined,{onSuccess:()=>{window.localStorage.removeItem(SESSION_HINT);qc.setQueryData(getGetCurrentUserQueryKey(),undefined);setLoc('/');}})} disabled={logout.isPending}><LogOut size={17}/></button></>:<><Link href="/login" className="navlink">Sign in</Link><Link href="/register" className="btn btn-primary compact">Join the network <ArrowRight size={15}/></Link></>}</div>
    </header>
    {user?.role==='admin'&&<div className="admin-strip"><span className="status-dot"/> ADMIN ACCESS ENABLED <Link href="/admin">MISSION CONTROL <ArrowRight size={13}/></Link></div>}
    <main className="main-area">{children}</main>
    <footer className="footer"><span className="mono">CYBERQUEST / DEFENSE FIRST</span><span>Practice safely. Protect confidently.</span><span className="online"><i/> SYSTEM OPERATIONAL</span></footer>
  </div>;
}`;

const shellReplacement = `function Shell({children}: {children:ReactNode}) {
  const [mobile,setMobile]=useState(false);
  const [loc,setLoc]=useLocation();
  const auth=useGetCurrentUser({query:{queryKey:getGetCurrentUserQueryKey(),enabled:hasSessionHint()}});
  const logout=useLogout();
  const user=auth.data?.data?.user;
  const mainLinks=[
    ['/dashboard','Dashboard', <LayoutDashboard size={15}/>],
    ['/learn','Learn', <GraduationCap size={15}/>],
    ['/cybersecurity','Cybersecurity', <Shield size={15}/>],
    ['/programming','Programming', <Code size={15}/>],
    ['/','Missions', <Target size={15}/>],
    ['/lab','Coding Lab', <Terminal size={15}/>],
    ['/projects','Projects', <Folder size={15}/>],
  ];
  const secLinks=[
    ['/mentor','AI Tutor', <Bot size={15}/>],
    ['/challenges','Challenges', <Flag size={15}/>],
    ['/leaderboard','Leaderboard', <Trophy size={15}/>],
    ['/progress','Progress', <TrendingUp size={15}/>],
    ['/certificates','Certificates', <Award size={15}/>],
    ['/interview','Interview Prep', <MessageSquare size={15}/>],
  ];
  return <div className="app-frame">
    <aside className={cx('sidebar',mobile&&'nav-open')}>
      <Link href="/" className="brand"><span className="brand-mark"><Shield size={19}/><i/></span><span>CYBER<span className="brand-accent">QUEST</span><small>LEARN. CODE. DEFEND.</small></span></Link>
      {user?.role==='admin'&&<div className="admin-strip"><span className="status-dot"/> ADMIN <Link href="/admin">MISSION CONTROL <ArrowRight size={13}/></Link></div>}
      
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="nav-section">ACADEMY</div>
        {mainLinks.map(([href,label,icon])=><Link key={href as string} href={href as string} onClick={()=>setMobile(false)} className={cx('navlink',loc===href&&'nav-active')}>{icon}{label}</Link>)}
        <div className="nav-section">CAREER & PROGRESS</div>
        {secLinks.map(([href,label,icon])=><Link key={href as string} href={href as string} onClick={()=>setMobile(false)} className={cx('navlink',loc===href&&'nav-active')}>{icon}{label}</Link>)}
      </nav>
      
      <div className="top-actions">
        {user ? <>
          <Link href="/profile" className="user-pill"><span className="avatar">{user.name.slice(0,1).toUpperCase()}</span><span>{user.name}<small>LVL {user.level} · {user.xp.toLocaleString()} XP</small></span></Link>
          <button className="btn btn-outline compact full-btn" title="Sign out" onClick={()=>logout.mutate(undefined,{onSuccess:()=>{window.localStorage.removeItem(SESSION_HINT);qc.setQueryData(getGetCurrentUserQueryKey(),undefined);setLoc('/');}})} disabled={logout.isPending}>Sign Out <LogOut size={14}/></button>
        </> : <>
          <Link href="/login" className="btn btn-outline compact full-btn">Sign in</Link>
          <Link href="/register" className="btn btn-primary compact full-btn">Join Academy <ArrowRight size={14}/></Link>
        </>}
      </div>
    </aside>
    <main className="main-area">
      <button className="mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMobile(!mobile)}><Menu size={20}/></button>
      {children}
      <footer className="footer"><span className="mono">CYBERQUEST AI / LEARN. CODE. DEFEND.</span><span>Built for the next generation of defenders.</span><span className="online"><i/> SYSTEM OPERATIONAL</span></footer>
    </main>
    <AITutorChat user={user} />
  </div>;
}`;
content = content.replace(shellOriginal, shellReplacement);

// 3. Update Hero
const heroRegex = /<h1 className="display">Learn\. Investigate\.<br\/><span>Defend\.<\/span><br\/>Practice safely\.<\/h1>\s*<p>Realistic threat simulations\. AI-guided debriefs\. Skills that hold up when it matters\. Your next incident starts here—safely\.<\/p>/;
const heroRepl = \`<h1 className="display">Learn. Code.<br/><span>Defend.</span><br/>Practice safely.</h1>
        <p>An AI-powered cybersecurity and programming academy built for the next generation of developers and security professionals.</p>\`;
content = content.replace(heroRegex, heroRepl);

const heroBtnRegex = /<div className="hero-buttons"><Link href=\{user\?'\/dashboard':'\/register'\} className="btn btn-primary">Enter the training floor <ArrowRight size=\{17\}\/><\/Link><a href="#missions" className="btn btn-outline">Explore simulations <ChevronDown size=\{16\}\/><\/a><\/div>/;
const heroBtnRepl = \`<div className="hero-buttons"><Link href={user?'/dashboard':'/register'} className="btn btn-primary">Start Learning <ArrowRight size={17}/></Link><a href="#missions" className="btn btn-outline">Explore Missions <ChevronDown size={16}/></a></div>\`;
content = content.replace(heroBtnRegex, heroBtnRepl);

// 4. Update Dashboard stats
const statsRegex = /<div className="stats-grid"><StatCard label="Experience" value=\{p\.xp\.toLocaleString\(\)\} unit="XP TOTAL" icon=\{<Sparkles size=\{17\}\/>\}\/><StatCard label="Missions complete" value=\{p\.missionsCompleted\.toString\(\)\.padStart\(2,'0'\)\} unit="INVESTIGATIONS" icon=\{<ShieldCheck size=\{17\}\/>\} \/><StatCard label="Decision accuracy" value=\{.*?\} unit="AVERAGE SCORE" icon=\{<Crosshair size=\{17\}\/>\} \/><StatCard label="Current streak" value=\{String\(p\.streak\)\} unit="DAYS ACTIVE" icon=\{<TrendingUp size=\{17\}\/>\} \/><\/div>/s;
const statsRepl = \`<div className="stats-grid">
  <StatCard label="Experience" value={p.xp.toLocaleString()} unit="XP TOTAL" icon={<Sparkles size={17}/>}/>
  <StatCard label="Missions" value={p.missionsCompleted.toString()} unit="COMPLETED" icon={<ShieldCheck size={17}/>} />
  <StatCard label="Coding Labs" value="0" unit="COMPLETED" icon={<Terminal size={17}/>} />
  <StatCard label="Current streak" value={String(p.streak)} unit="DAYS ACTIVE" icon={<TrendingUp size={17}/>} />
</div>\`;
content = content.replace(statsRegex, statsRepl);

// 5. Update Dashboard columns (add Programming skills)
const catPanelRegex = /<section className="\{box\} category-panel"\>.*?<\/section>/s;
const catPanelRepl = \`<section className={\`\${box} category-panel\`}><div className="panel-heading"><span className="eyebrow">PROGRAMMING SKILLS</span><span className="mono muted">BY LANGUAGE</span></div>
  <div className="category-row"><div><span className="category-bullet">01</span><b>Python</b></div><div className="barline"><i style={{width:'72%'}}/></div><strong>72%</strong></div>
  <div className="category-row"><div><span className="category-bullet">02</span><b>C++</b></div><div className="barline"><i style={{width:'54%'}}/></div><strong>54%</strong></div>
  <div className="category-row"><div><span className="category-bullet">03</span><b>JavaScript</b></div><div className="barline"><i style={{width:'46%'}}/></div><strong>46%</strong></div>
  <div className="category-row"><div><span className="category-bullet">04</span><b>SQL</b></div><div className="barline"><i style={{width:'61%'}}/></div><strong>61%</strong></div>
</section>\`;
content = content.replace(catPanelRegex, catPanelRepl);

// 6. Update Dashboard Quick Missions (add Daily Challenge)
const quickRegex = /<section className="\{box\} quick-missions"\>.*?<\/section>/s;
const quickRepl = \`<section className={\`\${box} quick-missions\`} style={{borderColor:'#43e2b0', background:'linear-gradient(145deg, #10261f, #12181d)'}}>
  <div className="panel-heading"><span className="eyebrow" style={{color:'#5de8b8'}}>🔥 DAILY CYBER CHALLENGE</span></div>
  <div style={{padding:'20px 0'}}>
    <h3 style={{margin:'0 0 10px', fontSize:18, color:'#dce5e8'}}>Can you identify the suspicious email?</h3>
    <p style={{fontSize:12, color:'#89999e'}}>A targeted phishing attack bypassed the spam filter. Review the headers and link structure.</p>
    <div style={{display:'flex', gap:15, marginTop:15, fontSize:10}} className="mono">
      <span style={{color:'#5de8b8'}}><Clock3 size={12} style={{display:'inline',marginRight:5}}/> 5 MINUTES</span>
      <span style={{color:'#dfbd78'}}><Award size={12} style={{display:'inline',marginRight:5}}/> +50 XP</span>
    </div>
  </div>
  <Link href="/" className="btn btn-primary full-btn">Start Challenge <Play size={15}/></Link>
</section>\`;
content = content.replace(quickRegex, quickRepl);

// 7. Add AI Tutor Component and ComingSoon Component
const componentsCode = \`
function AITutorChat({user}: {user?: any}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [history, setHistory] = useState<{role:'user'|'ai', text:string}[]>([{role:'ai', text:'Hi! I am the CyberQuest AI Tutor. I can help you with cybersecurity concepts, explain code, give hints for missions, or practice interview questions. What would you like to learn today?'}]);
  
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ if(endRef.current) endRef.current.scrollIntoView({behavior:'smooth'})}, [history, open]);

  const send = (e?: any) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    const txt = msg.trim();
    setMsg('');
    setHistory(c => [...c, {role:'user', text:txt}]);
    setTimeout(() => {
      setHistory(c => [...c, {role:'ai', text:\`I am your AI Tutor in demo mode. I see you asked about "\${txt}". In a fully integrated environment, I would connect to the Gemini API via the backend to provide an interactive educational response.\`}]);
    }, 800);
  };
  
  if (!user) return null;

  return <>
    {!open && <div className="ai-tutor-fab" onClick={()=>setOpen(true)}><Bot size={26}/></div>}
    {open && <div className="ai-tutor-window">
      <div className="ai-tutor-header">
        <div><div className="ai-tutor-icon"><Brain size={18}/></div> <span>AI Tutor</span></div>
        <button className="icon-btn" style={{border:0,width:28,height:28}} onClick={()=>setOpen(false)}><X size={18}/></button>
      </div>
      <div className="ai-tutor-body">
        {history.map((h, i) => <div key={i} className={\`chat-msg \${h.role}\`}>{h.text}</div>)}
        <div ref={endRef} />
        {history.length === 1 && <div className="chat-quick-actions">
          {['Explain SQL Injection', 'Hint for mission', 'Debug my Python code', 'Quiz me on Phishing'].map(x => <button key={x} type="button" className="chat-quick-btn" onClick={()=>{setMsg(x); setTimeout(()=>send(),10)}}>{x}</button>)}
        </div>}
      </div>
      <form className="ai-tutor-footer" onSubmit={send}>
        <div className="ai-tutor-input">
          <input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ask anything..." />
          <button type="submit" disabled={!msg.trim()}><Send size={15}/></button>
        </div>
      </form>
    </div>}
  </>;
}

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
\`;

content = componentsCode + content;

// 8. Add routes
const routesRegex = /<Route path="\/leaderboard" component=\{Leaderboard\}\/>/s;
const routesRepl = \`<Route path="/leaderboard" component={Leaderboard}/>
  <Route path="/learn"><ComingSoon title="Learning Paths" icon={<GraduationCap size={40}/>} text="The interactive learning module is coming soon. Here you will find structured lessons on Cyber Fundamentals, Networking, and Cloud Security."/></Route>
  <Route path="/cybersecurity"><ComingSoon title="Cybersecurity Academy" icon={<Shield size={40}/>} text="Master 7 modules from Fundamentals to Cloud Security. Complete with quizzes, interactive examples, and realistic attack chains."/></Route>
  <Route path="/programming"><ComingSoon title="Programming Academy" icon={<Code size={40}/>} text="Learn Python, C++, JavaScript, and Web Development with an emphasis on defensive coding."/></Route>
  <Route path="/lab"><ComingSoon title="Coding Lab" icon={<Terminal size={40}/>} text="An interactive, in-browser sandbox for compiling C++, executing Python, and testing web applications securely."/></Route>
  <Route path="/projects"><ComingSoon title="Project Hub" icon={<Folder size={40}/>} text="Build real-world portfolio projects like Phishing Detection Systems and Log Analyzers."/></Route>
  <Route path="/challenges"><ComingSoon title="Coding Challenges" icon={<Flag size={40}/>} text="Daily competitive coding tasks focused on security paradigms."/></Route>
  <Route path="/progress"><ComingSoon title="Skill Analytics" icon={<TrendingUp size={40}/>} text="Detailed radar charts of your skill proficiency across all Academy topics."/></Route>
  <Route path="/certificates"><ComingSoon title="Certifications" icon={<Award size={40}/>} text="Earn and showcase your verifiable completion certificates."/></Route>
  <Route path="/interview"><ComingSoon title="Interview Prep" icon={<MessageSquare size={40}/>} text="Practice AI-guided mock interviews for SOC Analyst and Security Engineer roles."/></Route>
\`;
content = content.replace(routesRegex, routesRepl);

fs.writeFileSync(file, content, 'utf8');
console.log('App.tsx updated successfully.');
