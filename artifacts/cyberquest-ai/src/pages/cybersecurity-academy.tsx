import React, { useState, useMemo } from 'react';
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
  CheckCircle2,
  AlertTriangle,
  Radio,
  Terminal,
  Flag,
  Globe,
  Database,
  Cloud,
  Key,
  Bug,
  Compass,
  FileSearch,
  Eye,
  Crosshair,
  Server,
  Zap,
  Check,
  Play
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useGetCurrentUser, useGetProgress, useListMissions } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

// -----------------------------------------------------------------------------
// 16 Cybersecurity Learning Domains
// -----------------------------------------------------------------------------
interface CyberDomain {
  id: string;
  category: string;
  name: string;
  desc: string;
  diff: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: number;
  labs: number;
  challenges: number;
  hours: number;
  prog: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  icon: string;
  modules: {
    id: string;
    title: string;
    type: 'Lesson' | 'Lab' | 'Challenge' | 'Quiz';
    duration: string;
    completed: boolean;
  }[];
}

const CYBER_DOMAINS: CyberDomain[] = [
  {
    id: 'fund',
    category: 'Core Fundamentals',
    name: 'Cybersecurity Fundamentals',
    desc: 'Core principles of confidentiality, integrity, availability, threat modeling, and defensive controls.',
    diff: 'Beginner',
    lessons: 12,
    labs: 6,
    challenges: 4,
    hours: 3,
    prog: 40,
    status: 'In Progress',
    icon: '🛡️',
    modules: [
      { id: 'f-1', title: 'CIA Triad & Security Principles', type: 'Lesson', duration: '15m', completed: true },
      { id: 'f-2', title: 'Threat Vectors & Attack Surfaces', type: 'Lesson', duration: '20m', completed: true },
      { id: 'f-3', title: 'Hands-on CIA Control Mapping', type: 'Lab', duration: '25m', completed: true },
      { id: 'f-4', title: 'Security Policies & Frameworks (NIST/ISO)', type: 'Lesson', duration: '15m', completed: false },
      { id: 'f-5', title: 'Authentication vs Authorization Challenge', type: 'Challenge', duration: '20m', completed: false },
      { id: 'f-6', title: 'Security Architecture Quiz', type: 'Quiz', duration: '10m', completed: false }
    ]
  },
  {
    id: 'net-sec',
    category: 'Infrastructure & Defense',
    name: 'Network Security',
    desc: 'Protocols, TCP/IP handshake, DNS protection, packet inspection, firewalls, and network perimeter defense.',
    diff: 'Intermediate',
    lessons: 14,
    labs: 8,
    challenges: 5,
    hours: 5,
    prog: 25,
    status: 'In Progress',
    icon: '🌐',
    modules: [
      { id: 'n-1', title: 'TCP/IP Model & Deep Packet Anatomy', type: 'Lesson', duration: '20m', completed: true },
      { id: 'n-2', title: 'Wireshark Packet Analysis Lab', type: 'Lab', duration: '35m', completed: true },
      { id: 'n-3', title: 'DNS Spoofing & Cache Poisoning Defense', type: 'Lesson', duration: '25m', completed: false },
      { id: 'n-4', title: 'Stateful vs Stateless Firewall Rule Lab', type: 'Lab', duration: '30m', completed: false },
      { id: 'n-5', title: 'Network Segmentation Strategy', type: 'Challenge', duration: '25m', completed: false }
    ]
  },
  {
    id: 'web-sec',
    category: 'Application Security',
    name: 'Web Application Security',
    desc: 'OWASP Top 10, cross-site scripting (XSS), SQL injection, CSRF, security headers, and secure API architecture.',
    diff: 'Intermediate',
    lessons: 16,
    labs: 10,
    challenges: 6,
    hours: 6,
    prog: 15,
    status: 'In Progress',
    icon: '💻',
    modules: [
      { id: 'w-1', title: 'OWASP Top 10 Deep Dive', type: 'Lesson', duration: '25m', completed: true },
      { id: 'w-2', title: 'SQL Injection Remediation Lab', type: 'Lab', duration: '40m', completed: true },
      { id: 'w-3', title: 'XSS Prevention: Sanitization & CSP', type: 'Lab', duration: '30m', completed: false },
      { id: 'w-4', title: 'Authentication Bypass Analysis', type: 'Challenge', duration: '20m', completed: false },
      { id: 'w-5', title: 'Secure REST API Hardening', type: 'Lab', duration: '35m', completed: false }
    ]
  },
  {
    id: 'app-sec',
    category: 'Application Security',
    name: 'Application Security & DevSecOps',
    desc: 'Secure SDLC, SAST/DAST tooling, dependency scanning, threat modeling, and container security.',
    diff: 'Advanced',
    lessons: 10,
    labs: 6,
    challenges: 3,
    hours: 4,
    prog: 0,
    status: 'Not Started',
    icon: '📦',
    modules: [
      { id: 'a-1', title: 'DevSecOps Pipeline Architecture', type: 'Lesson', duration: '20m', completed: false },
      { id: 'a-2', title: 'Automated Dependency Vulnerability Audit', type: 'Lab', duration: '30m', completed: false },
      { id: 'a-3', title: 'Static Code Analysis (SAST) Workbench', type: 'Lab', duration: '35m', completed: false }
    ]
  },
  {
    id: 'soc',
    category: 'Security Operations & DFIR',
    name: 'Security Operations (SOC Analyst)',
    desc: 'SIEM monitoring, alert triage, incident detection, syslog correlation, and blue team defensive operations.',
    diff: 'Intermediate',
    lessons: 14,
    labs: 8,
    challenges: 5,
    hours: 5,
    prog: 20,
    status: 'In Progress',
    icon: '🛰️',
    modules: [
      { id: 's-1', title: 'SOC Tier 1 Alert Triage Workflow', type: 'Lesson', duration: '20m', completed: true },
      { id: 's-2', title: 'SIEM Query Formulation (KQL & SPL)', type: 'Lab', duration: '35m', completed: false },
      { id: 's-3', title: 'Brute Force Alert Investigation Lab', type: 'Lab', duration: '30m', completed: false },
      { id: 's-4', title: 'True vs False Positive Classification', type: 'Challenge', duration: '25m', completed: false }
    ]
  },
  {
    id: 'threat-intel',
    category: 'Security Operations & DFIR',
    name: 'Threat Intelligence',
    desc: 'Indicators of compromise (IOCs), MITRE ATT&CK taxonomy, threat actors, and intelligence-driven defense.',
    diff: 'Advanced',
    lessons: 12,
    labs: 5,
    challenges: 4,
    hours: 4,
    prog: 0,
    status: 'Not Started',
    icon: '🔎',
    modules: [
      { id: 't-1', title: 'Cyber Threat Intelligence Fundamentals', type: 'Lesson', duration: '20m', completed: false },
      { id: 't-2', title: 'MITRE ATT&CK Matrix Navigation', type: 'Lab', duration: '30m', completed: false },
      { id: 't-3', title: 'IOC Extraction & STIX/TAXII Standards', type: 'Lab', duration: '25m', completed: false }
    ]
  },
  {
    id: 'forensics',
    category: 'Security Operations & DFIR',
    name: 'Digital Forensics (DFIR)',
    desc: 'Evidence preservation, chain of custody, file metadata analysis, memory dump inspection, and timeline reconstruction.',
    diff: 'Intermediate',
    lessons: 13,
    labs: 7,
    challenges: 4,
    hours: 5,
    prog: 10,
    status: 'In Progress',
    icon: '🔬',
    modules: [
      { id: 'fo-1', title: 'Forensic Principles & Evidence Handling', type: 'Lesson', duration: '20m', completed: true },
      { id: 'fo-2', title: 'Windows Event Log Forensic Analysis', type: 'Lab', duration: '40m', completed: false },
      { id: 'fo-3', title: 'File Carving & Deleted Artifact Recovery', type: 'Lab', duration: '35m', completed: false }
    ]
  },
  {
    id: 'iam',
    category: 'Core Fundamentals',
    name: 'Identity & Access Management (IAM)',
    desc: 'Role-based access control (RBAC), multi-factor authentication, OAuth 2.0, SAML, and least-privilege enforcement.',
    diff: 'Beginner',
    lessons: 10,
    labs: 5,
    challenges: 3,
    hours: 3,
    prog: 30,
    status: 'In Progress',
    icon: '🔑',
    modules: [
      { id: 'i-1', title: 'Authentication, Authorization & Accounting', type: 'Lesson', duration: '15m', completed: true },
      { id: 'i-2', title: 'Enforcing Least Privilege with RBAC', type: 'Lab', duration: '25m', completed: true },
      { id: 'i-3', title: 'OAuth2 & JWT Token Security Lab', type: 'Lab', duration: '30m', completed: false }
    ]
  },
  {
    id: 'cloud-sec',
    category: 'Infrastructure & Defense',
    name: 'Cloud Security',
    desc: 'AWS, Azure, and GCP security controls, shared responsibility model, S3 bucket misconfigurations, and cloud IAM.',
    diff: 'Intermediate',
    lessons: 12,
    labs: 6,
    challenges: 4,
    hours: 4,
    prog: 0,
    status: 'Not Started',
    icon: '☁️',
    modules: [
      { id: 'c-1', title: 'Cloud Shared Responsibility Model', type: 'Lesson', duration: '20m', completed: false },
      { id: 'c-2', title: 'Detecting Exposed Cloud Storage Buckets', type: 'Lab', duration: '30m', completed: false },
      { id: 'c-3', title: 'CloudTrail Audit Log Investigation', type: 'Lab', duration: '35m', completed: false }
    ]
  },
  {
    id: 'crypto',
    category: 'Core Fundamentals',
    name: 'Cryptography & Data Protection',
    desc: 'Symmetric & asymmetric encryption, cryptographic hashing, digital signatures, PKI, and TLS/SSL architecture.',
    diff: 'Intermediate',
    lessons: 11,
    labs: 6,
    challenges: 4,
    hours: 4,
    prog: 50,
    status: 'In Progress',
    icon: '🔐',
    modules: [
      { id: 'cr-1', title: 'AES vs RSA: Encryption Mechanics', type: 'Lesson', duration: '20m', completed: true },
      { id: 'cr-2', title: 'Hash Collision & Salting Workbench', type: 'Lab', duration: '25m', completed: true },
      { id: 'cr-3', title: 'TLS Handshake & Certificate Verification', type: 'Lab', duration: '30m', completed: true },
      { id: 'cr-4', title: 'Digital Signature Creation & Validation', type: 'Lab', duration: '25m', completed: false }
    ]
  },
  {
    id: 'malware',
    category: 'Advanced Offense & Defense',
    name: 'Malware Analysis & Reverse Engineering',
    desc: 'Static & dynamic malware analysis in isolated sandboxes, disassembler workflows, and behavior profiling.',
    diff: 'Advanced',
    lessons: 15,
    labs: 7,
    challenges: 4,
    hours: 6,
    prog: 0,
    status: 'Not Started',
    icon: '☣️',
    modules: [
      { id: 'm-1', title: 'Malware Analysis Sandbox Architecture', type: 'Lesson', duration: '25m', completed: false },
      { id: 'm-2', title: 'Static PE Header & String Inspection', type: 'Lab', duration: '40m', completed: false },
      { id: 'm-3', title: 'Behavioral Process & Registry Monitoring', type: 'Lab', duration: '35m', completed: false }
    ]
  },
  {
    id: 'ir',
    category: 'Security Operations & DFIR',
    name: 'Incident Response & Triage',
    desc: 'NIST & SANS incident handling lifecycles: preparation, detection, containment, eradication, and post-incident review.',
    diff: 'Advanced',
    lessons: 10,
    labs: 6,
    challenges: 3,
    hours: 4,
    prog: 0,
    status: 'Not Started',
    icon: '🚨',
    modules: [
      { id: 'ir-1', title: 'The 6 Phases of Incident Handling', type: 'Lesson', duration: '20m', completed: false },
      { id: 'ir-2', title: 'Host Containment & Isolation Procedure', type: 'Lab', duration: '30m', completed: false },
      { id: 'ir-3', title: 'Post-Mortem & Lessons Learned Reporting', type: 'Lab', duration: '30m', completed: false }
    ]
  },
  {
    id: 'vuln-mgmt',
    category: 'Infrastructure & Defense',
    name: 'Vulnerability Management',
    desc: 'CVE & CVSS v3.1 scoring, vulnerability scanning methodologies, risk prioritization, and automated patch management.',
    diff: 'Intermediate',
    lessons: 9,
    labs: 5,
    challenges: 3,
    hours: 3,
    prog: 0,
    status: 'Not Started',
    icon: '🎯',
    modules: [
      { id: 'vm-1', title: 'CVSS Scoring & Vulnerability Metrics', type: 'Lesson', duration: '15m', completed: false },
      { id: 'vm-2', title: 'Vulnerability Scan Report Triage', type: 'Lab', duration: '25m', completed: false },
      { id: 'vm-3', title: 'Remediation SLA & Patch Scheduling', type: 'Lab', duration: '20m', completed: false }
    ]
  },
  {
    id: 'sec-eng',
    category: 'Infrastructure & Defense',
    name: 'Security Engineering',
    desc: 'Zero Trust architecture, defense in depth, secure network enclaves, bastion hosts, and cryptographic hardware.',
    diff: 'Advanced',
    lessons: 11,
    labs: 6,
    challenges: 3,
    hours: 5,
    prog: 0,
    status: 'Not Started',
    icon: '⚙️',
    modules: [
      { id: 'se-1', title: 'Zero Trust Architecture Principles', type: 'Lesson', duration: '25m', completed: false },
      { id: 'se-2', title: 'Design a DMZ with Multi-Tier Firewalls', type: 'Lab', duration: '40m', completed: false },
      { id: 'se-3', title: 'Hardware Security Modules & Enclaves', type: 'Lesson', duration: '20m', completed: false }
    ]
  },
  {
    id: 'ethical-hack',
    category: 'Advanced Offense & Defense',
    name: 'Ethical Hacking & Penetration Testing',
    desc: 'Authorized reconnaissance, vulnerability discovery, exploit verification, and professional reporting in controlled sandboxes.',
    diff: 'Advanced',
    lessons: 14,
    labs: 9,
    challenges: 6,
    hours: 6,
    prog: 0,
    status: 'Not Started',
    icon: '⚡',
    modules: [
      { id: 'eh-1', title: 'Legal & Ethical Frameworks in Pentesting', type: 'Lesson', duration: '20m', completed: false },
      { id: 'eh-2', title: 'Passive & Active Reconnaissance Lab', type: 'Lab', duration: '35m', completed: false },
      { id: 'eh-3', title: 'Web Sandbox Vulnerability Assessment', type: 'Lab', duration: '45m', completed: false }
    ]
  },
  {
    id: 'awareness',
    category: 'Core Fundamentals',
    name: 'Security Awareness & Governance',
    desc: 'Phishing defense, social engineering tactics, operational security (OPSEC), and privacy compliance standards.',
    diff: 'Beginner',
    lessons: 8,
    labs: 3,
    challenges: 2,
    hours: 2,
    prog: 100,
    status: 'Completed',
    icon: '🎓',
    modules: [
      { id: 'aw-1', title: 'Social Engineering & Phishing Indicators', type: 'Lesson', duration: '15m', completed: true },
      { id: 'aw-2', title: 'Email Header Verification Lab', type: 'Lab', duration: '20m', completed: true },
      { id: 'aw-3', title: 'Personal OPSEC & Data Hygiene', type: 'Lesson', duration: '15m', completed: true }
    ]
  }
];

// -----------------------------------------------------------------------------
// Interactive Security Experiments Data
// -----------------------------------------------------------------------------
interface ExperimentItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  tags: string[];
  type: string;
}

const EXPERIMENTS: ExperimentItem[] = [
  {
    id: 'exp-http',
    num: '01',
    title: 'HTTP Request Investigation',
    desc: 'Analyze HTTP requests, headers, cookies, authentication tokens, and response status codes.',
    tags: ['HTTP/1.1', 'Headers', 'Cookies', 'Inspect'],
    type: 'Web Security'
  },
  {
    id: 'exp-pwd',
    num: '02',
    title: 'Password Security Lab',
    desc: 'Explore cryptographic hashing (MD5, SHA-256, bcrypt), salting, entropy, and crack resistance.',
    tags: ['bcrypt', 'Salting', 'Entropy', 'Hashes'],
    type: 'Cryptography'
  },
  {
    id: 'exp-net',
    num: '03',
    title: 'Network Traffic Analysis',
    desc: 'Examine simulated PCAP packet streams and identify abnormal port activity or plaintext credentials.',
    tags: ['PCAP', 'TCP/IP', 'Wireshark', 'Ports'],
    type: 'Networking'
  },
  {
    id: 'exp-log',
    num: '04',
    title: 'Log Investigation',
    desc: 'Analyze simulated authentication syslogs to pinpoint brute-force patterns and unauthorized access.',
    tags: ['SIEM', 'Syslog', 'Brute Force', 'Triage'],
    type: 'SOC Ops'
  },
  {
    id: 'exp-file',
    num: '05',
    title: 'File Integrity Investigation',
    desc: 'Compare SHA-256 checksums to detect unauthorized binary tampering and trojanized scripts.',
    tags: ['SHA-256', 'Hashing', 'Integrity', 'Baseline'],
    type: 'Forensics'
  },
  {
    id: 'exp-headers',
    num: '06',
    title: 'Security Headers Lab',
    desc: 'Inspect web responses and simulate the defensive effect of CSP, HSTS, and X-Frame-Options.',
    tags: ['CSP', 'HSTS', 'X-Frame-Options', 'OWASP'],
    type: 'Web Security'
  }
];

// -----------------------------------------------------------------------------
// Cyber Labs
// -----------------------------------------------------------------------------
const LABS = [
  {
    id: 'lab-net',
    domain: 'NETWORK LAB',
    title: 'Packet Analysis & Anomaly Detection',
    desc: 'Analyze provided network traffic captures to discover protocols, suspicious connections, unusual ports, and data exfiltration patterns.',
    features: ['Inspect 50+ packet flows', 'Detect anomalous port 4444', 'Flag unencrypted FTP logins'],
    labChallenge: 'network-packet-analysis'
  },
  {
    id: 'lab-web',
    domain: 'WEB SECURITY LAB',
    title: 'Request & Response Vulnerability Analysis',
    desc: 'Inspect simulated web requests, manipulate parameters safely, and understand input sanitation, CSRF protections, and secure cookies.',
    features: ['Trace SQL injection patterns', 'Sanitize user inputs', 'Test SameSite cookie policies'],
    labChallenge: 'sql-injection-basics'
  },
  {
    id: 'lab-soc',
    domain: 'SOC ANALYST LAB',
    title: 'Security Event & Alert Investigation',
    desc: 'Investigate simulated SOC alerts, triage events, inspect authentication logs, and determine whether alerts represent true or false positives.',
    features: ['Triage multi-stage intrusion alerts', 'Calculate alert severity', 'Formulate containment actions'],
    labChallenge: 'soc-incident-triage'
  },
  {
    id: 'lab-forensics',
    domain: 'FORENSICS LAB',
    title: 'Digital Evidence & Artifact Analysis',
    desc: 'Analyze provided digital artifacts, examine timestamps, extract file metadata, and determine what occurred during a simulated security incident.',
    features: ['Timeline reconstruction', 'Metadata verification', 'Identify modified config files'],
    labChallenge: 'forensics-timeline-analysis'
  }
];

// -----------------------------------------------------------------------------
// Security Missions
// -----------------------------------------------------------------------------
const MISSIONS = [
  {
    id: 'm-01',
    num: 'MISSION 01',
    title: 'Suspicious Login Investigation',
    diff: 'Beginner',
    xp: 150,
    scenario: 'Multiple failed login attempts were detected from an unrecognized external IP address followed by a successful login during non-business hours.',
    objectives: [
      'Analyze authentication log events',
      'Identify source IP geolocation and pattern',
      'Determine if credential stuffing occurred',
      'Recommend account isolation & MFA enforcement'
    ]
  },
  {
    id: 'm-02',
    num: 'MISSION 02',
    title: 'Compromised Web Application',
    diff: 'Intermediate',
    xp: 300,
    scenario: 'An e-commerce staging web app is experiencing anomalous outbound HTTP requests and unexpected file changes in the upload directory.',
    objectives: [
      'Inspect simulated web server access logs',
      'Identify the malicious POST payload',
      'Trace unauthorized webshell placement',
      'Generate remediation patch & WAF rule'
    ]
  },
  {
    id: 'm-03',
    num: 'MISSION 03',
    title: 'Enterprise Incident Response',
    diff: 'Advanced',
    xp: 500,
    scenario: 'A simulated corporate network has detected workstation beaconing to a command-and-control server. Execute rapid containment.',
    objectives: [
      'Isolate compromised host on network',
      'Collect volatile memory and registry runkeys',
      'Extract C2 IP and domain indicators',
      'Draft formal Incident Response Playbook report'
    ]
  }
];

// -----------------------------------------------------------------------------
// Capstone Security Projects
// -----------------------------------------------------------------------------
const PROJECTS = [
  {
    id: 'proj-1',
    num: 'Project 01',
    title: 'Build a Secure Authentication System',
    diff: 'Intermediate',
    time: '4 Hours',
    xp: 400,
    skills: ['bcrypt', 'JWT', 'Rate Limiting', 'MFA'],
    summary: 'Implement a hardened user authentication service with secure password hashing, brute-force mitigation, and time-based one-time password (TOTP) support.'
  },
  {
    id: 'proj-2',
    num: 'Project 02',
    title: 'Design a Network Security Architecture',
    diff: 'Advanced',
    time: '5 Hours',
    xp: 550,
    skills: ['DMZ', 'Firewall Rules', 'VPN', 'Zero Trust'],
    summary: 'Create an enterprise network architecture incorporating perimeter firewalls, segmented subnets, intrusion detection sensors, and secure remote access.'
  },
  {
    id: 'proj-3',
    num: 'Project 03',
    title: 'Create a Security Monitoring Dashboard',
    diff: 'Intermediate',
    time: '3.5 Hours',
    xp: 350,
    skills: ['SIEM', 'Log Analysis', 'Alert Metrics', 'Data Viz'],
    summary: 'Construct an operational SOC dashboard that tracks live failed logins, suspicious network connections, and security telemetry alerts.'
  },
  {
    id: 'proj-4',
    num: 'Project 04',
    title: 'Perform Security Assessment of a Training App',
    diff: 'Advanced',
    time: '6 Hours',
    xp: 600,
    skills: ['OWASP Top 10', 'Risk Assessment', 'Remediation', 'Reporting'],
    summary: 'Conduct an authorized security audit of an isolated training application, identify design weaknesses, calculate CVSS scores, and prepare remediation guidance.'
  },
  {
    id: 'proj-5',
    num: 'Project 05',
    title: 'Create an Incident Response Playbook',
    diff: 'Advanced',
    time: '4 Hours',
    xp: 450,
    skills: ['NIST SP 800-61', 'Containment', 'Communications', 'Forensics'],
    summary: 'Draft a comprehensive Incident Response playbook detailing step-by-step procedures for ransomware detection, stakeholder communication, and recovery.'
  }
];

// -----------------------------------------------------------------------------
// Security Achievements
// -----------------------------------------------------------------------------
const ACHIEVEMENTS = [
  { id: 'ach-1', title: 'First Defender', desc: 'Complete your first security lab or hands-on experiment.', icon: '🛡️', unlocked: true },
  { id: 'ach-2', title: 'Digital Detective', desc: 'Complete 5 digital forensic or log investigations.', icon: '🔍', unlocked: true },
  { id: 'ach-3', title: 'SOC Analyst', desc: 'Triage and resolve 10 security alerts.', icon: '🛰️', unlocked: false },
  { id: 'ach-4', title: 'Network Guardian', desc: 'Complete all packet analysis and firewall labs.', icon: '🌐', unlocked: false },
  { id: 'ach-5', title: 'Security Engineer', desc: 'Complete 3 comprehensive capstone security projects.', icon: '🔐', unlocked: false }
];

export default function CybersecurityAcademy() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Dynamic user data
  const currentUserQuery = useGetCurrentUser();
  const progressQuery = useGetProgress();
  const missionsQuery = useListMissions();

  const user = currentUserQuery.data?.data?.user;
  const progress = progressQuery.data?.data;
  const liveMissions = missionsQuery.data?.data?.missions || [];

  // Computed dynamic stats
  const userLevel = user?.level || progress?.level || 7;
  const userXP = user?.xp || progress?.xp || 2450;
  const labsCompleted = progress?.missionsCompleted || 18;
  const totalLabs = 40;
  const overallProgPercent = Math.min(100, Math.round((labsCompleted / totalLabs) * 100));

  // Filters & Search
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeNav, setActiveNav] = useState('paths');

  // Detail Modal / Drawer state
  const [selectedDomain, setSelectedDomain] = useState<CyberDomain | null>(null);

  // Interactive Experiment Sandbox Modal
  const [activeExperiment, setActiveExperiment] = useState<ExperimentItem | null>(null);
  const [expInput, setExpInput] = useState('');
  const [expResult, setExpResult] = useState<string | null>(null);

  // Daily Challenge state
  const [dailySelected, setDailySelected] = useState<number | null>(null);
  const [dailySubmitted, setDailySubmitted] = useState(false);
  const [dailyXpClaimed, setDailyXpClaimed] = useState(false);

  // Quiz state
  const [quizQuestionIdx, setQuizQuestionIdx] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // SOC Alert Triage state
  const [socTriageStep, setSocTriageStep] = useState(1);
  const [socVerdict, setSocVerdict] = useState<string | null>(null);

  // Filtered Domains
  const filteredDomains = useMemo(() => {
    return CYBER_DOMAINS.filter(domain => {
      if (categoryFilter !== 'All' && domain.category !== categoryFilter) return false;
      if (diffFilter !== 'All' && domain.diff !== diffFilter) return false;
      if (statusFilter !== 'All' && domain.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = domain.name.toLowerCase().includes(q);
        const matchDesc = domain.desc.toLowerCase().includes(q);
        const matchCat = domain.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [categoryFilter, diffFilter, statusFilter, search]);

  // Daily challenge data
  const DAILY_CHALLENGE = {
    title: "Suspicious Login Sequence Investigation",
    question: "A security analyst notices five consecutive failed login attempts on an executive account followed by a successful login 30 seconds later from a different country IP. What should the analyst investigate FIRST?",
    options: [
      { text: "Ignore the event as normal user travel behavior.", correct: false, note: "Unlikely given the 30-second interval between disparate geographical locations." },
      { text: "Examine authentication logs, source IP reputation, and session metadata for impossible travel indicators.", correct: true, note: "Correct! Impossible travel anomaly requires immediate IP reputation verification, session token inspection, and correlation." },
      { text: "Immediately delete all system authentication logs to save disk space.", correct: false, note: "Deleting audit logs destroys forensic evidence and violates compliance." },
      { text: "Permanently delete the executive's user account and email mailbox.", correct: false, note: "Disproportionate response; containment should start with temporary credential rotation or MFA session revocation." }
    ],
    xpReward: 50
  };

  const QUIZ_QUESTIONS = [
    {
      q: "Which security principle gives users and service accounts only the specific permissions required to perform their tasks?",
      options: [
        { text: "Defense in Depth", correct: false, note: "Defense in depth refers to layered defensive controls, not permission scoping." },
        { text: "Principle of Least Privilege (PoLP)", correct: true, note: "Correct! Least privilege minimizes the blast radius of compromised credentials." },
        { text: "Security through Obscurity", correct: false, note: "Hiding implementation details does not replace robust authorization." },
        { text: "Fail-Open Architecture", correct: false, note: "Fail-open is dangerous; secure systems fail closed." }
      ]
    },
    {
      q: "When storing user passwords, which defensive approach provides resilience against offline precomputed dictionary/rainbow table attacks?",
      options: [
        { text: "Plain MD5 Hashing", correct: false, note: "MD5 is cryptographically broken and vulnerable to rapid collision and rainbow tables." },
        { text: "Reversible Base64 Encoding", correct: false, note: "Base64 is encoding, not encryption or hashing; it offers zero confidentiality." },
        { text: "Slow cryptographic hashing with a unique salt (e.g., bcrypt, Argon2)", correct: true, note: "Correct! A unique cryptographic salt plus work-factor iterations nullifies rainbow table attacks." },
        { text: "DES Encryption with a shared static key", correct: false, note: "DES is deprecated and vulnerable to brute-force key search." }
      ]
    }
  ];

  // Daily challenge submission
  const handleDailySubmit = () => {
    if (dailySelected === null) return;
    setDailySubmitted(true);
    if (DAILY_CHALLENGE.options[dailySelected].correct && !dailyXpClaimed) {
      setDailyXpClaimed(true);
      toast({
        title: "⚡ +50 XP Awarded!",
        description: "Great detective work on the daily challenge. Keep your streak alive!",
      });
    }
  };

  // Run experiment simulation
  const handleRunExperiment = () => {
    if (!activeExperiment) return;

    if (activeExperiment.id === 'exp-http') {
      setExpResult(`[SIMULATED HTTP INSPECTOR]
REQ: GET /api/v1/user/profile HTTP/1.1
Host: secure.cyberquest.internal
Authorization: Bearer eyJhbGciOi...[VALID_JWT]
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)

RESP: HTTP/1.1 200 OK
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY

VERDICT: Clean. Strict defensive headers enabled. Token validated.`);
    } else if (activeExperiment.id === 'exp-pwd') {
      const pwd = expInput.trim() || 'CyberQuest#2026!';
      const len = pwd.length;
      const entropy = Math.round(len * 4.2);
      setExpResult(`[PASSWORD STRENGTH ANALYZER]
Target: "${pwd}"
Length: ${len} characters
Calculated Entropy: ~${entropy} bits
bcrypt Hash (Work Factor 12):
$2b$12$e8Yq...k9aW/5tG89d67xYd7v8w921bC.X...

Analysis:
• Character pool: Uppercase, Lowercase, Numbers, Symbols
• Rainbow table immunity: Active (Unique salt generated)
• Offline crack estimation: ~4,200 years against 10B guesses/sec`);
    } else if (activeExperiment.id === 'exp-net') {
      setExpResult(`[SIMULATED PACKET STREAM]
Frame 1: 192.168.1.105:51240 -> 8.8.8.8:53 [DNS Query: secure.bank.com]
Frame 2: 8.8.8.8:53 -> 192.168.1.105:51240 [DNS Response: 104.18.2.14]
Frame 3: 192.168.1.105:49182 -> 198.51.100.22:4444 [TCP SYN]
*** ALERT: Suspicious outbound connection to port 4444 (Known Netcat/Reverse Shell default) ***
Recommended Action: Block IP 198.51.100.22 at firewall egress and isolate 192.168.1.105.`);
    } else if (activeExperiment.id === 'exp-log') {
      setExpResult(`[SIMULATED AUTHENTICATION SYSLOG]
2026-10-07T22:14:01Z auth.service: FAILED_LOGIN user=admin src=185.220.101.4
2026-10-07T22:14:03Z auth.service: FAILED_LOGIN user=admin src=185.220.101.4
2026-10-07T22:14:06Z auth.service: FAILED_LOGIN user=admin src=185.220.101.4
2026-10-07T22:14:09Z auth.service: FAILED_LOGIN user=admin src=185.220.101.4
2026-10-07T22:14:12Z auth.service: SUCCESS_LOGIN user=admin src=185.220.101.4

DIAGNOSIS: Password spraying / dictionary attack pattern detected.
Source IP 185.220.101.4 flagged for automatic temporary rate-limit block.`);
    } else if (activeExperiment.id === 'exp-file') {
      setExpResult(`[FILE INTEGRITY MONITOR - SHA-256]
Target File: /usr/bin/sudo
Expected Hash: a94a8fe5ccb19ba61c4c0873d391e987982fbbd3
Computed Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4

STATUS: [INTEGRITY VIOLATION DETECTED]
Hash mismatch confirmed! Binary has been modified or replaced.
Automated recommendation: Quarantine host, pull disk image for DFIR examination.`);
    } else {
      setExpResult(`[SECURITY HEADERS VERIFICATION]
Target: https://portal.cyberquest.internal

1. Content-Security-Policy (CSP): PRESENT
   - Protects against Cross-Site Scripting (XSS) and data injection.
2. Strict-Transport-Security (HSTS): PRESENT
   - Enforces HTTPS connections and prevents SSL stripping.
3. X-Frame-Options: SAMEORIGIN
   - Defends against Clickjacking attacks.
4. X-Content-Type-Options: nosniff
   - Mitigates MIME type sniffing vulnerabilities.

OVERALL SCORE: A+ (Defensive posture aligned with OWASP recommendations).`);
    }
  };

  return (
    <Shell>
      <div className="cyber-academy-wrap fade-in">
        
        {/* ================================================================= */}
        {/* Top Header                                                        */}
        {/* ================================================================= */}
        <div className="cyber-header-block">
          <div className="cyber-eyebrow">
            <span className="cyber-eyebrow-dot" />
            ACADEMY CURRICULUM • CYBER DEFENSE
          </div>
          <h1 className="cyber-main-title">Cybersecurity Academy</h1>
          <p className="cyber-main-subtitle">
            Learn how systems, networks, applications, and organizations are protected from cyber threats through structured theory, hands-on experimentation, live labs, and incident investigations.
          </p>
          <div className="cyber-lifecycle-bar">
            <span className="cyber-lifecycle-step active">LEARN</span>
            <span className="cyber-lifecycle-arrow">→</span>
            <span className="cyber-lifecycle-step">EXPERIMENT</span>
            <span className="cyber-lifecycle-arrow">→</span>
            <span className="cyber-lifecycle-step">PRACTICE</span>
            <span className="cyber-lifecycle-arrow">→</span>
            <span className="cyber-lifecycle-step">INVESTIGATE</span>
            <span className="cyber-lifecycle-arrow">→</span>
            <span className="cyber-lifecycle-step">DEFEND</span>
            <span className="cyber-lifecycle-arrow">→</span>
            <span className="cyber-lifecycle-step">MASTER</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Compact Progress Dashboard Banner                                  */}
        {/* ================================================================= */}
        <div className="cyber-dashboard-banner">
          <div className="cyber-dashboard-top">
            <div className="cyber-dashboard-label">
              <Shield size={16} /> YOUR CYBERSECURITY PROGRESS & OPERATIONAL READINESS
            </div>
            <div className="cyber-diff-badge beginner">
              LEVEL {userLevel} DEFENDER
            </div>
          </div>

          <div className="cyber-metrics-grid">
            <div className="cyber-metric-card">
              <div className="cyber-metric-title">Overall Progress</div>
              <div className="cyber-metric-value">
                {overallProgPercent}% <span className="cyber-metric-sub">Curriculum</span>
              </div>
            </div>
            <div className="cyber-metric-card">
              <div className="cyber-metric-title">Labs Completed</div>
              <div className="cyber-metric-value">
                {labsCompleted} <span className="cyber-metric-sub">/ {totalLabs}</span>
              </div>
            </div>
            <div className="cyber-metric-card">
              <div className="cyber-metric-title">Total XP Earned</div>
              <div className="cyber-metric-value">
                {userXP.toLocaleString()} <span className="cyber-metric-sub">XP</span>
              </div>
            </div>
            <div className="cyber-metric-card">
              <div className="cyber-metric-title">Active Missions</div>
              <div className="cyber-metric-value">
                {liveMissions.length || 3} <span className="cyber-metric-sub">Deployed</span>
              </div>
            </div>
          </div>

          <div className="cyber-progress-row">
            <div className="cyber-progress-header">
              <span>ACADEMY COMPLETION</span>
              <span>{overallProgPercent}% Complete</span>
            </div>
            <div className="cyber-progress-track">
              <div className="cyber-progress-fill" style={{ width: `${overallProgPercent}%` }} />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Sticky Internal Sub-Navigation                                   */}
        {/* ================================================================= */}
        <div className="cyber-sticky-nav">
          <div className="cyber-sticky-links">
            <a 
              href="#paths" 
              className={`cyber-nav-btn ${activeNav === 'paths' ? 'active' : ''}`}
              onClick={() => setActiveNav('paths')}
            >
              <BookOpen size={14} /> Learning Paths
            </a>
            <a 
              href="#experiments" 
              className={`cyber-nav-btn ${activeNav === 'experiments' ? 'active' : ''}`}
              onClick={() => setActiveNav('experiments')}
            >
              <FlaskConical size={14} /> Experiments
            </a>
            <a 
              href="#labs" 
              className={`cyber-nav-btn ${activeNav === 'labs' ? 'active' : ''}`}
              onClick={() => setActiveNav('labs')}
            >
              <Terminal size={14} /> Cyber Labs
            </a>
            <a 
              href="#missions" 
              className={`cyber-nav-btn ${activeNav === 'missions' ? 'active' : ''}`}
              onClick={() => setActiveNav('missions')}
            >
              <Flag size={14} /> Missions
            </a>
            <a 
              href="#soc" 
              className={`cyber-nav-btn ${activeNav === 'soc' ? 'active' : ''}`}
              onClick={() => setActiveNav('soc')}
            >
              <Radio size={14} /> SOC Analyst
            </a>
            <a 
              href="#intel" 
              className={`cyber-nav-btn ${activeNav === 'intel' ? 'active' : ''}`}
              onClick={() => setActiveNav('intel')}
            >
              <Eye size={14} /> Threat Intel
            </a>
            <a 
              href="#daily" 
              className={`cyber-nav-btn ${activeNav === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveNav('daily')}
            >
              <Zap size={14} /> Daily Challenge
            </a>
            <a 
              href="#quiz" 
              className={`cyber-nav-btn ${activeNav === 'quiz' ? 'active' : ''}`}
              onClick={() => setActiveNav('quiz')}
            >
              <Compass size={14} /> Knowledge Check
            </a>
            <a 
              href="#projects" 
              className={`cyber-nav-btn ${activeNav === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveNav('projects')}
            >
              <Trophy size={14} /> Projects
            </a>
            <a 
              href="#tree" 
              className={`cyber-nav-btn ${activeNav === 'tree' ? 'active' : ''}`}
              onClick={() => setActiveNav('tree')}
            >
              <Layers size={14} /> Skill Tree
            </a>
            <a 
              href="#achievements" 
              className={`cyber-nav-btn ${activeNav === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveNav('achievements')}
            >
              <Sparkles size={14} /> Achievements
            </a>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Search & Dynamic Filters Block                                    */}
        {/* ================================================================= */}
        <div className="cyber-search-filter-block">
          <div className="cyber-search-input-wrap">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search cybersecurity domains, labs, experiments, threat vectors..."
              className="cyber-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: '#799d94', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="cyber-filter-rows">
            <div className="cyber-filter-row">
              <span className="cyber-filter-label">Domain:</span>
              <div className="cyber-filter-pills">
                {['All', 'Core Fundamentals', 'Infrastructure & Defense', 'Application Security', 'Security Operations & DFIR', 'Advanced Offense & Defense'].map(cat => (
                  <button 
                    key={cat} 
                    className={`cyber-pill ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="cyber-filter-row">
              <span className="cyber-filter-label">Difficulty:</span>
              <div className="cyber-filter-pills">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button 
                    key={diff} 
                    className={`cyber-pill ${diffFilter === diff ? 'active' : ''}`}
                    onClick={() => setDiffFilter(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="cyber-filter-row">
              <span className="cyber-filter-label">Status:</span>
              <div className="cyber-filter-pills">
                {['All', 'Not Started', 'In Progress', 'Completed'].map(st => (
                  <button 
                    key={st} 
                    className={`cyber-pill ${statusFilter === st ? 'active' : ''}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: CYBERSECURITY LEARNING PATHS (16 Domains)              */}
        {/* ================================================================= */}
        <section id="paths" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <BookOpen size={14} /> 16 SPECIALIZED DOMAINS
              </div>
              <h2 className="cyber-section-title">Cybersecurity Learning Paths</h2>
              <p className="cyber-section-desc">
                From defense foundations to advanced incident triage. Each path includes structured lessons, interactive experiments, and hands-on coding labs.
              </p>
            </div>
            <div style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#43e2b0' }}>
              Showing {filteredDomains.length} of {CYBER_DOMAINS.length} Domains
            </div>
          </div>

          <div className="cyber-card-grid-3">
            {filteredDomains.map((domain, index) => {
              const diffClass = domain.diff.toLowerCase();
              return (
                <div key={domain.id} className="cyber-path-card">
                  <div>
                    <div className="cyber-path-card-top">
                      <span className={`cyber-diff-badge ${diffClass}`}>
                        {domain.icon} {domain.diff}
                      </span>
                      <span className="cyber-domain-num">DOMAIN #{String(index + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 className="cyber-path-title">{domain.name}</h3>
                    <p className="cyber-path-desc">{domain.desc}</p>

                    <div className="cyber-stats-strip">
                      <div className="cyber-stat-col">
                        <span className="cyber-stat-val">📚 {domain.lessons}</span>
                        <span className="cyber-stat-lbl">Lessons</span>
                      </div>
                      <div className="cyber-stat-col">
                        <span className="cyber-stat-val">🧪 {domain.labs}</span>
                        <span className="cyber-stat-lbl">Labs</span>
                      </div>
                      <div className="cyber-stat-col">
                        <span className="cyber-stat-val">⏱ {domain.hours}h</span>
                        <span className="cyber-stat-lbl">Duration</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'DM Mono', color: '#7d9e96', marginBottom: '6px' }}>
                        <span>Progress</span>
                        <span style={{ color: domain.prog > 0 ? '#43e2b0' : '#7d9e96' }}>{domain.prog}%</span>
                      </div>
                      <div className="cyber-progress-track">
                        <div className="cyber-progress-fill" style={{ width: `${domain.prog}%` }} />
                      </div>
                    </div>
                  </div>

                  <button 
                    className={`cyber-action-btn ${domain.prog === 0 ? 'secondary' : ''}`}
                    onClick={() => setSelectedDomain(domain)}
                  >
                    {domain.prog === 100 
                      ? 'Review Path →' 
                      : domain.prog > 0 
                      ? 'Continue Learning →' 
                      : 'Start Learning →'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 2: HANDS-ON SECURITY EXPERIMENTS                           */}
        {/* ================================================================= */}
        <section id="experiments" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <FlaskConical size={14} /> SAFE & ISOLATED SANDBOXES
              </div>
              <h2 className="cyber-section-title">🧪 Hands-on Security Experiments</h2>
              <p className="cyber-section-desc">
                Learn by interacting with safe, isolated security environments. No complex setups; run directly in your browser.
              </p>
            </div>
          </div>

          <div className="cyber-card-grid-3">
            {EXPERIMENTS.map((exp) => (
              <div key={exp.id} className="cyber-exp-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="cyber-card-type-tag">
                      <FlaskConical size={13} /> EXPERIMENT {exp.num}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono', color: '#688e84' }}>
                      {exp.type}
                    </span>
                  </div>

                  <h3 className="cyber-exp-title">{exp.title}</h3>
                  <p className="cyber-exp-desc">{exp.desc}</p>

                  <div className="cyber-exp-features">
                    {exp.tags.map(tag => (
                      <span key={tag} className="cyber-feature-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                <button 
                  className="cyber-action-btn secondary"
                  onClick={() => {
                    setActiveExperiment(exp);
                    setExpResult(null);
                    setExpInput('');
                  }}
                >
                  <Play size={14} /> Open Experiment
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 3: CYBER LABS                                             */}
        {/* ================================================================= */}
        <section id="labs" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Terminal size={14} /> DIRECT PRACTICAL WORKSPACES
              </div>
              <h2 className="cyber-section-title">💻 Cyber Labs</h2>
              <p className="cyber-section-desc">
                Full-featured virtual exercises connected directly to the Coding Lab IDE and automated security verification test suites.
              </p>
            </div>
          </div>

          <div className="cyber-card-grid-2">
            {LABS.map((lab) => (
              <div key={lab.id} className="cyber-path-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="cyber-diff-badge intermediate">{lab.domain}</span>
                    <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#43e2b0' }}>VIRTUAL LAB</span>
                  </div>
                  <h3 className="cyber-path-title">{lab.title}</h3>
                  <p className="cyber-path-desc">{lab.desc}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {lab.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#a4c4bd' }}>
                        <Check size={14} color="#43e2b0" /> {f}
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={`/lab?challenge=${lab.labChallenge}`}>
                  <button className="cyber-action-btn">
                    <Terminal size={15} /> Launch Lab
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 4: SECURITY MISSIONS                                      */}
        {/* ================================================================= */}
        <section id="missions" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Flag size={14} /> CHALLENGE OPERATIVES
              </div>
              <h2 className="cyber-section-title">🚩 Security Missions</h2>
              <p className="cyber-section-desc">
                Put your skills to the test in simulated threat scenarios with multi-step objectives and real XP rewards.
              </p>
            </div>
          </div>

          <div className="cyber-card-grid-3">
            {MISSIONS.map((mission) => {
              const diffCls = mission.diff.toLowerCase();
              return (
                <div key={mission.id} className="cyber-mission-card">
                  <div>
                    <div className="cyber-mission-header">
                      <span className={`cyber-diff-badge ${diffCls}`}>{mission.diff}</span>
                      <span className="cyber-xp-reward-pill">+{mission.xp} XP</span>
                    </div>

                    <div style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#688e84', marginBottom: '4px' }}>
                      {mission.num}
                    </div>
                    <h3 className="cyber-mission-title">{mission.title}</h3>

                    <div className="cyber-scenario-box">
                      <strong style={{ color: '#ebf6f3' }}>Scenario: </strong>
                      {mission.scenario}
                    </div>

                    <div className="cyber-objectives-list">
                      <div style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#7d9e96', textTransform: 'uppercase', marginBottom: '2px' }}>
                        Mission Objectives:
                      </div>
                      {mission.objectives.map(obj => (
                        <div key={obj} className="cyber-obj-item">
                          <span className="cyber-obj-checkbox"><Check size={10} /></span>
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link href="/challenges">
                    <button className="cyber-action-btn">
                      <Flag size={14} /> Start Mission
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 5: SOC ANALYST TRAINING                                   */}
        {/* ================================================================= */}
        <section id="soc" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Radio size={14} /> BLUE TEAM DEFENSE
              </div>
              <h2 className="cyber-section-title">🛰 SOC Analyst Training</h2>
              <p className="cyber-section-desc">
                Learn how security analysts detect, investigate, and respond to threats using simulated SIEM telemetry and alert correlation.
              </p>
            </div>
          </div>

          <div className="cyber-intel-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span className="cyber-diff-badge intermediate" style={{ marginRight: '8px' }}>ALERT #SOC-8912</span>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 'bold', color: '#ebf6f3' }}>
                  Suspicious Multi-Factor Authentication Push Fatigue
                </span>
              </div>
              <span className="cyber-diff-badge advanced">SEVERITY: MEDIUM</span>
            </div>

            <div className="cyber-log-terminal">
              <div className="cyber-log-line ok">2026-10-07T21:40:11.000Z | Source: Okta_MFA | User: sarah.miller@enterprise.corp</div>
              <div className="cyber-log-line warn">2026-10-07T21:40:14.000Z | Push sent (Attempt 1) | Response: DENIED_BY_USER</div>
              <div className="cyber-log-line warn">2026-10-07T21:40:22.000Z | Push sent (Attempt 2) | Response: DENIED_BY_USER</div>
              <div className="cyber-log-line alert">2026-10-07T21:40:55.000Z | Push sent (Attempt 14) | Response: ACCEPTED</div>
              <div className="cyber-log-line alert">2026-10-07T21:41:02.000Z | New Device Registered: Windows NT 10.0; IP: 194.26.29.112 (Known VPN Node)</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div className="cyber-ioc-card">
                <span className="cyber-ioc-key">Affected Identity</span>
                <div className="cyber-ioc-val">sarah.miller@enterprise.corp</div>
              </div>
              <div className="cyber-ioc-card">
                <span className="cyber-ioc-key">Originating IP</span>
                <div className="cyber-ioc-val">194.26.29.112 (AS49981)</div>
              </div>
              <div className="cyber-ioc-card">
                <span className="cyber-ioc-key">Initial Attack Vector</span>
                <div className="cyber-ioc-val">Compromised Credentials + Push Fatigue</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                className="cyber-action-btn"
                style={{ width: 'auto', padding: '0 24px' }}
                onClick={() => {
                  toast({
                    title: "Host Isolated & Session Terminated",
                    description: "User account suspended, active OAuth refresh tokens revoked, and SOC ticket assigned.",
                  });
                }}
              >
                <Shield size={15} /> Execute Containment Playbook
              </button>
              <Link href="/lab?challenge=soc-incident-triage">
                <button className="cyber-action-btn secondary" style={{ width: 'auto', padding: '0 20px' }}>
                  <Terminal size={15} /> Deep Triage in Lab
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 6: THREAT INTELLIGENCE & DIGITAL FORENSICS                */}
        {/* ================================================================= */}
        <section id="intel" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Eye size={14} /> THREAT INTEL & FORENSIC ARTIFACTS
              </div>
              <h2 className="cyber-section-title">🔎 Threat Intelligence & Digital Forensics</h2>
              <p className="cyber-section-desc">
                Extract Indicators of Compromise (IOCs), cross-reference threat actor signatures, and analyze digital evidence artifacts.
              </p>
            </div>
          </div>

          <div className="cyber-card-grid-2">
            {/* Threat Intel Card */}
            <div className="cyber-path-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="cyber-diff-badge advanced">THREAT INTEL INVESTIGATION</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#43e2b0' }}>IOC ANALYSIS</span>
                </div>
                <h3 className="cyber-path-title">Malicious Infrastructure Discovery</h3>
                <p className="cyber-path-desc">
                  Correlate indicators linked to automated credential harvesters targeting enterprise SSO gateways.
                </p>

                <div className="cyber-ioc-grid">
                  <div className="cyber-ioc-card">
                    <span className="cyber-ioc-key">Indicator IP</span>
                    <div className="cyber-ioc-val">185.220.101.5</div>
                  </div>
                  <div className="cyber-ioc-card">
                    <span className="cyber-ioc-key">Domain</span>
                    <div className="cyber-ioc-val">update-secure-auth.xyz</div>
                  </div>
                  <div className="cyber-ioc-card">
                    <span className="cyber-ioc-key">SHA-256 Hash</span>
                    <div className="cyber-ioc-val">e3b0c442...855</div>
                  </div>
                </div>
              </div>

              <button 
                className="cyber-action-btn"
                onClick={() => {
                  toast({
                    title: "Threat Actor Matched: TA-4022",
                    description: "High-confidence attribution to phishing infrastructure. IOC pushed to threat blocklist.",
                  });
                }}
              >
                <Crosshair size={14} /> Start Investigation
              </button>
            </div>

            {/* Forensics Case Card */}
            <div className="cyber-path-card">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="cyber-diff-badge intermediate">FORENSIC CASE #001</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#38bdf8' }}>EVIDENCE CHAIN</span>
                </div>
                <h3 className="cyber-path-title">Unauthorized Data Exfiltration Investigation</h3>
                <p className="cyber-path-desc">
                  Analyze file system timestamps ($MFT), browser cache history, and cloud upload volumes to establish a verified incident timeline.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#a4c4bd' }}>
                    📄 Authentication event logs (EventID 4624 & 4672)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#a4c4bd' }}>
                    📁 File metadata & NTFS alternate data streams
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#a4c4bd' }}>
                    🕒 Master timeline reconstruction (02:14 – 02:45 UTC)
                  </div>
                </div>
              </div>

              <Link href="/lab?challenge=forensics-timeline-analysis">
                <button className="cyber-action-btn secondary">
                  <FileSearch size={14} /> Examine Evidence in Lab
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 7: DAILY CYBER CHALLENGE                                  */}
        {/* ================================================================= */}
        <section id="daily" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Zap size={14} /> DAILY DEFENDER DRILL
              </div>
              <h2 className="cyber-section-title">⚡ Daily Cyber Challenge</h2>
              <p className="cyber-section-desc">
                Sharpen your defensive instincts with a daily real-world triage question and earn bonus XP.
              </p>
            </div>
          </div>

          <div className="cyber-quiz-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="cyber-diff-badge beginner">TODAY'S CHALLENGE</span>
              <span className="cyber-xp-reward-pill">+{DAILY_CHALLENGE.xpReward} XP REWARD</span>
            </div>

            <h3 className="cyber-quiz-question">{DAILY_CHALLENGE.question}</h3>

            <div className="cyber-quiz-options">
              {DAILY_CHALLENGE.options.map((opt, i) => {
                const isSelected = dailySelected === i;
                let optClass = '';
                if (dailySubmitted) {
                  if (opt.correct) optClass = 'correct';
                  else if (isSelected) optClass = 'wrong';
                } else if (isSelected) {
                  optClass = 'selected';
                }

                return (
                  <button
                    key={i}
                    className={`cyber-quiz-option ${optClass}`}
                    onClick={() => !dailySubmitted && setDailySelected(i)}
                  >
                    <span className="cyber-option-key">{String.fromCharCode(65 + i)}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {dailySubmitted && (
              <div className={`cyber-feedback-box ${DAILY_CHALLENGE.options[dailySelected!].correct ? 'correct' : 'wrong'}`}>
                {DAILY_CHALLENGE.options[dailySelected!].correct ? '✓ Correct! ' : '✕ Incorrect. '}
                {DAILY_CHALLENGE.options[dailySelected!].note}
              </div>
            )}

            <div>
              {!dailySubmitted ? (
                <button 
                  className="cyber-action-btn"
                  style={{ width: 'auto', padding: '0 28px' }}
                  onClick={handleDailySubmit}
                  disabled={dailySelected === null}
                >
                  Submit Answer →
                </button>
              ) : (
                <button 
                  className="cyber-action-btn secondary"
                  style={{ width: 'auto', padding: '0 24px' }}
                  onClick={() => {
                    setDailySubmitted(false);
                    setDailySelected(null);
                  }}
                >
                  Try Another Drill
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 8: KNOWLEDGE CHECK (QUIZZES)                              */}
        {/* ================================================================= */}
        <section id="quiz" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Compass size={14} /> RETENTION & VALIDATION
              </div>
              <h2 className="cyber-section-title">🧠 Knowledge Check</h2>
              <p className="cyber-section-desc">
                Verify conceptual mastery of defense principles, cryptographic algorithms, and access controls.
              </p>
            </div>
          </div>

          <div className="cyber-quiz-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="cyber-diff-badge intermediate">
                QUESTION {quizQuestionIdx + 1} OF {QUIZ_QUESTIONS.length}
              </span>
              <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: '#7d9e96' }}>
                CORE COMPETENCY
              </span>
            </div>

            <h3 className="cyber-quiz-question">
              {QUIZ_QUESTIONS[quizQuestionIdx].q}
            </h3>

            <div className="cyber-quiz-options">
              {QUIZ_QUESTIONS[quizQuestionIdx].options.map((opt, i) => {
                const isSelected = quizSelected === i;
                let optClass = '';
                if (quizSubmitted) {
                  if (opt.correct) optClass = 'correct';
                  else if (isSelected) optClass = 'wrong';
                } else if (isSelected) {
                  optClass = 'selected';
                }

                return (
                  <button
                    key={i}
                    className={`cyber-quiz-option ${optClass}`}
                    onClick={() => !quizSubmitted && setQuizSelected(i)}
                  >
                    <span className="cyber-option-key">{String.fromCharCode(65 + i)}</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {quizSubmitted && (
              <div className={`cyber-feedback-box ${QUIZ_QUESTIONS[quizQuestionIdx].options[quizSelected!].correct ? 'correct' : 'wrong'}`}>
                {QUIZ_QUESTIONS[quizQuestionIdx].options[quizSelected!].correct ? '✓ Correct! ' : '✕ Incorrect. '}
                {QUIZ_QUESTIONS[quizQuestionIdx].options[quizSelected!].note}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              {!quizSubmitted ? (
                <button 
                  className="cyber-action-btn"
                  style={{ width: 'auto', padding: '0 28px' }}
                  onClick={() => quizSelected !== null && setQuizSubmitted(true)}
                  disabled={quizSelected === null}
                >
                  Submit Answer →
                </button>
              ) : (
                <button 
                  className="cyber-action-btn"
                  style={{ width: 'auto', padding: '0 28px' }}
                  onClick={() => {
                    setQuizQuestionIdx((quizQuestionIdx + 1) % QUIZ_QUESTIONS.length);
                    setQuizSelected(null);
                    setQuizSubmitted(false);
                  }}
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 9: CAPSTONE SECURITY PROJECTS                             */}
        {/* ================================================================= */}
        <section id="projects" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Trophy size={14} /> PORTFOLIO BUILDERS
              </div>
              <h2 className="cyber-section-title">🏆 Security Projects</h2>
              <p className="cyber-section-desc">
                Comprehensive multi-disciplinary projects that combine offensive testing, architecture design, and blue-team defense for real-world portfolio proof.
              </p>
            </div>
          </div>

          <div className="cyber-card-grid-3">
            {PROJECTS.map((proj) => (
              <div key={proj.id} className="cyber-path-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span className="cyber-diff-badge advanced">{proj.num}</span>
                    <span className="cyber-xp-reward-pill">+{proj.xp} XP</span>
                  </div>

                  <h3 className="cyber-path-title">{proj.title}</h3>
                  <p className="cyber-path-desc">{proj.summary}</p>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: 'DM Mono', color: '#7d9e96', marginBottom: '14px' }}>
                    <span>⏱ {proj.time}</span>
                    <span>•</span>
                    <span>{proj.diff}</span>
                  </div>

                  <div className="cyber-exp-features">
                    {proj.skills.map(s => (
                      <span key={s} className="cyber-feature-tag">{s}</span>
                    ))}
                  </div>
                </div>

                <Link href="/projects">
                  <button className="cyber-action-btn secondary">
                    View Project Brief →
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 10: CYBERSECURITY SKILL TREE                              */}
        {/* ================================================================= */}
        <section id="tree" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Layers size={14} /> CAREER ROADMAP & PREREQUISITES
              </div>
              <h2 className="cyber-section-title">Cybersecurity Skill Tree</h2>
              <p className="cyber-section-desc">
                Visual progression from foundations to specialized domains. Complete previous modules to unlock advanced defense specializations.
              </p>
            </div>
          </div>

          <div className="cyber-skill-tree-box">
            <div className="cyber-tree-levels">
              {/* Row 1: Root */}
              <div className="cyber-tree-row">
                <div className="cyber-tree-node in-progress">
                  <div className="cyber-tree-node-title">CYBERSECURITY FUNDAMENTALS</div>
                  <div className="cyber-tree-node-status">◉ In Progress (40%)</div>
                </div>
              </div>

              {/* Row 2: Secondary Branches */}
              <div className="cyber-tree-row">
                <div className="cyber-tree-node in-progress">
                  <div className="cyber-tree-node-title">NETWORK SECURITY</div>
                  <div className="cyber-tree-node-status">◉ In Progress (25%)</div>
                </div>
                <div className="cyber-tree-node in-progress">
                  <div className="cyber-tree-node-title">WEB APP SECURITY</div>
                  <div className="cyber-tree-node-status">◉ In Progress (15%)</div>
                </div>
                <div className="cyber-tree-node mastered">
                  <div className="cyber-tree-node-title">SECURITY AWARENESS</div>
                  <div className="cyber-tree-node-status">✓ Mastered (100%)</div>
                </div>
              </div>

              {/* Row 3: Specialized Branches */}
              <div className="cyber-tree-row">
                <div className="cyber-tree-node in-progress">
                  <div className="cyber-tree-node-title">SOC ANALYST (SIEM)</div>
                  <div className="cyber-tree-node-status">◉ In Progress (20%)</div>
                </div>
                <div className="cyber-tree-node in-progress">
                  <div className="cyber-tree-node-title">DIGITAL FORENSICS</div>
                  <div className="cyber-tree-node-status">◉ In Progress (10%)</div>
                </div>
                <div className="cyber-tree-node locked">
                  <div className="cyber-tree-node-title">APP SEC & DEVSECOPS</div>
                  <div className="cyber-tree-node-status">🔒 Complete Web Sec first</div>
                </div>
              </div>

              {/* Row 4: Advanced */}
              <div className="cyber-tree-row">
                <div className="cyber-tree-node locked">
                  <div className="cyber-tree-node-title">INCIDENT RESPONSE & TRIAGE</div>
                  <div className="cyber-tree-node-status">🔒 Complete SOC + Forensics</div>
                </div>
                <div className="cyber-tree-node locked">
                  <div className="cyber-tree-node-title">ETHICAL HACKING & PENTESTING</div>
                  <div className="cyber-tree-node-status">🔒 Complete Network + Web</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECTION 11: SECURITY ACHIEVEMENTS                                 */}
        {/* ================================================================= */}
        <section id="achievements" className="cyber-section">
          <div className="cyber-section-header">
            <div className="cyber-section-title-wrap">
              <div className="cyber-section-tag">
                <Sparkles size={14} /> RECOGNITION BADGES
              </div>
              <h2 className="cyber-section-title">🏅 Security Achievements</h2>
              <p className="cyber-section-desc">
                Milestones unlocked as you complete labs, investigate threats, and execute defensive drills.
              </p>
            </div>
          </div>

          <div className="cyber-achievements-grid">
            {ACHIEVEMENTS.map(ach => (
              <div key={ach.id} className={`cyber-achieve-card ${ach.unlocked ? 'unlocked' : ''}`}>
                <div className="cyber-achieve-icon">{ach.icon}</div>
                <div>
                  <h4 className="cyber-achieve-title">{ach.title}</h4>
                  <p className="cyber-achieve-desc">{ach.desc}</p>
                  <span style={{ fontSize: '10px', fontFamily: 'DM Mono', color: ach.unlocked ? '#43e2b0' : '#688e84', marginTop: '4px', display: 'block' }}>
                    {ach.unlocked ? '✓ UNLOCKED' : '🔒 IN PROGRESS'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* =================================================================== */}
      {/* Interactive Experiment Sandbox Modal                                */}
      {/* =================================================================== */}
      {activeExperiment && (
        <div className="cyber-modal-overlay" onClick={() => setActiveExperiment(null)}>
          <div className="cyber-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cyber-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="cyber-diff-badge intermediate">
                  EXPERIMENT {activeExperiment.num}
                </span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '18px', fontWeight: 'bold', color: '#ebf6f3' }}>
                  {activeExperiment.title}
                </span>
              </div>
              <button 
                onClick={() => setActiveExperiment(null)}
                style={{ background: 'none', border: 'none', color: '#799d94', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cyber-modal-body">
              <p style={{ fontSize: '14px', color: '#a4c4bd', margin: 0 }}>
                {activeExperiment.desc}
              </p>

              {activeExperiment.id === 'exp-pwd' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0' }}>
                    ENTER SAMPLE PASSWORD TO HASH & TEST:
                  </label>
                  <input 
                    type="text"
                    value={expInput}
                    onChange={(e) => setExpInput(e.target.value)}
                    placeholder="e.g. CyberQuest#2026!"
                    className="cyber-search-input"
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {activeExperiment.tags.map(t => (
                  <span key={t} className="cyber-feature-tag">{t}</span>
                ))}
              </div>

              {expResult ? (
                <div className="cyber-log-terminal" style={{ maxHeight: '240px' }}>
                  <pre style={{ margin: 0, fontFamily: 'inherit', color: '#43e2b0' }}>{expResult}</pre>
                </div>
              ) : (
                <div className="cyber-scenario-box" style={{ textAlign: 'center', padding: '24px' }}>
                  Ready to test. Click "Run Experiment Simulation" to execute this isolated sandbox experiment.
                </div>
              )}
            </div>

            <div className="cyber-modal-footer">
              <button 
                className="cyber-action-btn secondary" 
                style={{ width: 'auto', padding: '0 20px' }}
                onClick={() => setActiveExperiment(null)}
              >
                Close
              </button>
              <button 
                className="cyber-action-btn" 
                style={{ width: 'auto', padding: '0 24px' }}
                onClick={handleRunExperiment}
              >
                <Play size={14} /> Run Experiment Simulation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Domain Curriculum Breakdown Modal                                   */}
      {/* =================================================================== */}
      {selectedDomain && (
        <div className="cyber-modal-overlay" onClick={() => setSelectedDomain(null)}>
          <div className="cyber-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="cyber-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`cyber-diff-badge ${selectedDomain.diff.toLowerCase()}`}>
                  {selectedDomain.icon} {selectedDomain.diff}
                </span>
                <span style={{ fontFamily: 'Space Grotesk', fontSize: '18px', fontWeight: 'bold', color: '#ebf6f3' }}>
                  {selectedDomain.name}
                </span>
              </div>
              <button 
                onClick={() => setSelectedDomain(null)}
                style={{ background: 'none', border: 'none', color: '#799d94', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="cyber-modal-body">
              <p style={{ fontSize: '14px', color: '#a4c4bd', margin: 0 }}>
                {selectedDomain.desc}
              </p>

              <div className="cyber-stats-strip">
                <div className="cyber-stat-col">
                  <span className="cyber-stat-val">📚 {selectedDomain.lessons}</span>
                  <span className="cyber-stat-lbl">Lessons</span>
                </div>
                <div className="cyber-stat-col">
                  <span className="cyber-stat-val">🧪 {selectedDomain.labs}</span>
                  <span className="cyber-stat-lbl">Labs</span>
                </div>
                <div className="cyber-stat-col">
                  <span className="cyber-stat-val">⏱ {selectedDomain.hours}h</span>
                  <span className="cyber-stat-lbl">Est. Time</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontFamily: 'Space Grotesk', color: '#ebf6f3', fontSize: '15px', marginBottom: '12px' }}>
                  Curriculum Modules & Exercises ({selectedDomain.modules.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDomain.modules.map((m, idx) => (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setSelectedDomain(null);
                        setLocation(`/courses/cybersecurity/lessons/1`);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: 'rgba(16, 32, 42, 0.7)',
                        border: '1px solid rgba(44, 76, 70, 0.45)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ 
                          width: '22px', 
                          height: '22px', 
                          borderRadius: '50%', 
                          background: m.completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          border: m.completed ? '1px solid #22c55e' : '1px solid rgba(44, 76, 70, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: m.completed ? '#22c55e' : '#7d9e96',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {m.completed ? '✓' : idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '13px', color: '#ebf6f3', fontWeight: 600 }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'DM Mono', color: '#799d94' }}>
                            {m.type} • {m.duration}
                          </div>
                        </div>
                      </div>

                      {m.type === 'Lab' ? (
                        <button 
                          className="cyber-action-btn secondary" 
                          style={{ width: 'auto', height: '34px', padding: '0 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDomain(null);
                            setLocation('/lab');
                          }}
                        >
                          Launch Lab →
                        </button>
                      ) : (
                        <button 
                          className="cyber-action-btn secondary" 
                          style={{ width: 'auto', height: '34px', padding: '0 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDomain(null);
                            setLocation(`/courses/cybersecurity/lessons/1`);
                          }}
                        >
                          {m.completed ? 'Review Lesson' : 'Start Lesson'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cyber-modal-footer">
              <button 
                className="cyber-action-btn secondary"
                style={{ width: 'auto', padding: '0 20px' }}
                onClick={() => setSelectedDomain(null)}
              >
                Close
              </button>
              <Link href="/lab">
                <button 
                  className="cyber-action-btn"
                  style={{ width: 'auto', padding: '0 24px' }}
                >
                  <Terminal size={14} /> Open Domain Workspace
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </Shell>
  );
}
