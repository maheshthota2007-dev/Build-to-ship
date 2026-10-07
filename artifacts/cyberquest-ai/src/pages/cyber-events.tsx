import React, { useState, useEffect, useMemo } from 'react';
import { Shell, NeedAuth, Button, Loading } from '../App';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Check, 
  AlertCircle, 
  Play, 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Shield, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Award, 
  Terminal, 
  Video, 
  Globe, 
  BookOpen, 
  Flag,
  Share2
} from 'lucide-react';
import { Link } from 'wouter';
import { useGetCurrentUser } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface CyberEvent {
  id: number;
  slug: string;
  title: string;
  description: string;
  type: string;
  category: string;
  status: string;
  startAt: string;
  endAt: string;
  timezone: string;
  locationType: string;
  location: string;
  meetingUrl?: string | null;
  difficulty: string;
  capacity: number;
  registeredCount: number;
  instructor: string;
  instructorRole?: string | null;
  skills: string[];
  requirements: string[];
  tags: string[];
  registrationDeadline?: string | null;
  featured: boolean;
  active: boolean;
  liveStatus: 'UPCOMING' | 'STARTING_SOON' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  isRegistered?: boolean;
  reminderPreference?: string | null;
  countdownMs?: number;
}

// -----------------------------------------------------------------------------
// Format Helpers
// -----------------------------------------------------------------------------
const EVENT_TYPE_CONFIG: Record<string, { label: string; icon: string; cls: string }> = {
  LAB: { label: 'Security Lab', icon: '🧪', cls: 'lab' },
  CTF: { label: 'CTF Challenge', icon: '🚩', cls: 'ctf' },
  WORKSHOP: { label: 'Workshop', icon: '🎓', cls: 'workshop' },
  WEBINAR: { label: 'Webinar', icon: '📡', cls: 'webinar' },
  CODING_CHALLENGE: { label: 'Coding Challenge', icon: '💻', cls: 'coding_challenge' },
  HACKATHON: { label: 'Hackathon', icon: '🏆', cls: 'hackathon' },
  SECURITY_DRILL: { label: 'Security Drill', icon: '🛡️', cls: 'security_drill' },
  THREAT_HUNT: { label: 'Threat Hunt', icon: '🔎', cls: 'threat_hunt' },
  CAREER: { label: 'Career Session', icon: '💼', cls: 'career' },
  COMMUNITY: { label: 'Community', icon: '👥', cls: 'community' },
};

export function getEventTypeMeta(type: string) {
  const normalized = type.toUpperCase().replace(/\s+/g, '_');
  return EVENT_TYPE_CONFIG[normalized] || { label: type, icon: '⚡', cls: 'lab' };
}

export function formatEventDateTime(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const dateStr = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const startTimeStr = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const endTimeStr = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  const durationMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  const durationStr = durationMin >= 60 ? `${Math.round(durationMin / 60)}h ${durationMin % 60 ? (durationMin % 60) + 'm' : ''}` : `${durationMin} mins`;

  // Get user's local timezone abbreviation/name
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    dateStr,
    timeRange: `${startTimeStr} – ${endTimeStr}`,
    durationStr,
    tzName,
  };
}

export function formatCountdown(targetMs: number) {
  if (targetMs <= 0) return 'In Progress';
  const totalSeconds = Math.floor(targetMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

// -----------------------------------------------------------------------------
// Main Cyber Events Page Component
// -----------------------------------------------------------------------------
export default function CyberEventsPage() {
  const { toast } = useToast();
  const currentUserQuery = useGetCurrentUser();
  const user = currentUserQuery.data?.data?.user;
  const isAdmin = user?.role === 'admin';

  // Events data & loading state
  const [events, setEvents] = useState<CyberEvent[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<CyberEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'today' | 'week' | 'month' | 'all'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'my-events'>('list');

  // Real-time ticking counter (every second)
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [activeDetailsEvent, setActiveDetailsEvent] = useState<CyberEvent | null>(null);
  const [reminderPref, setReminderPref] = useState('1h');
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminEditingEvent, setAdminEditingEvent] = useState<CyberEvent | null>(null);
  const [adminFormData, setAdminFormData] = useState({
    title: '',
    description: '',
    type: 'LAB',
    category: 'Cybersecurity',
    startAt: '',
    endAt: '',
    timezone: 'UTC',
    location: 'Online / CyberQuest Range',
    meetingUrl: '',
    difficulty: 'Intermediate',
    capacity: 100,
    instructor: 'CyberQuest Academy',
    skills: '',
    requirements: '',
    tags: '',
    featured: false,
  });

  // Calendar State
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);

  // Fetch Events from API
  const fetchEvents = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to load events');
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data.events || []);
        setFeaturedEvent(json.data.featuredEvent || null);
      }
    } catch (err: any) {
      setLoadError(err.message || 'Unable to connect to events service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle Registration
  const handleToggleRegistration = async (event: CyberEvent) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to register for CyberQuest events.',
        variant: 'destructive',
      });
      return;
    }

    setIsRegistering(true);
    try {
      if (event.isRegistered) {
        // Cancel registration
        const res = await fetch(`/api/events/${event.id}/register`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          toast({
            title: 'Registration Cancelled',
            description: `You have successfully unregistered from "${event.title}".`,
          });
          // Update local state
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isRegistered: false, registeredCount: Math.max(0, e.registeredCount - 1) } : e));
          if (featuredEvent?.id === event.id) {
            setFeaturedEvent(prev => prev ? { ...prev, isRegistered: false, registeredCount: Math.max(0, prev.registeredCount - 1) } : null);
          }
          if (activeDetailsEvent?.id === event.id) {
            setActiveDetailsEvent(prev => prev ? { ...prev, isRegistered: false, registeredCount: Math.max(0, prev.registeredCount - 1) } : null);
          }
        }
      } else {
        // Register
        const res = await fetch(`/api/events/${event.id}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reminderPreference: reminderPref }),
        });
        const json = await res.json();
        if (json.success) {
          toast({
            title: 'Registration Confirmed! 🎟️',
            description: `You are booked for "${event.title}". A reminder is scheduled ${reminderPref} prior to start.`,
          });
          // Update local state
          setEvents(prev => prev.map(e => e.id === event.id ? { ...e, isRegistered: true, registeredCount: e.registeredCount + 1 } : e));
          if (featuredEvent?.id === event.id) {
            setFeaturedEvent(prev => prev ? { ...prev, isRegistered: true, registeredCount: prev.registeredCount + 1 } : null);
          }
          if (activeDetailsEvent?.id === event.id) {
            setActiveDetailsEvent(prev => prev ? { ...prev, isRegistered: true, registeredCount: prev.registeredCount + 1 } : null);
          }
        } else {
          toast({
            title: 'Registration Failed',
            description: json.error?.message || 'Could not complete registration.',
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      toast({
        title: 'Network Error',
        description: 'Failed to communicate with events server.',
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Calendar specific date filter
      if (calendarSelectedDate) {
        const evDate = new Date(ev.startAt).toDateString();
        const selDate = new Date(calendarSelectedDate).toDateString();
        if (evDate !== selDate) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchInstructor = ev.instructor.toLowerCase().includes(q);
        const matchSkills = ev.skills?.some(s => s.toLowerCase().includes(q));
        const matchTags = ev.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchInstructor && !matchSkills && !matchTags) return false;
      }

      // Category
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) return false;

      // Type
      if (selectedType !== 'All' && ev.type !== selectedType) return false;

      // Time Filter
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const evDate = new Date(ev.startAt);

      if (timeFilter === 'upcoming') {
        if (ev.liveStatus === 'COMPLETED') return false;
      } else if (timeFilter === 'today') {
        if (evDate < startOfToday || evDate > endOfToday) return false;
      } else if (timeFilter === 'week') {
        if (evDate < startOfToday || evDate > endOfWeek) return false;
      } else if (timeFilter === 'month') {
        if (evDate < startOfToday || evDate > endOfMonth) return false;
      }

      return true;
    });
  }, [events, search, selectedCategory, selectedType, timeFilter, calendarSelectedDate]);

  // My Events
  const myRegisteredEvents = useMemo(() => {
    return events.filter(e => e.isRegistered);
  }, [events]);

  // Calendar Calculation
  const calendarData = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + calendarMonthOffset);
    const year = d.getFullYear();
    const month = d.getMonth();
    const monthName = d.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Map events per day
    const eventsPerDay: Record<number, CyberEvent[]> = {};
    for (const ev of events) {
      const ed = new Date(ev.startAt);
      if (ed.getFullYear() === year && ed.getMonth() === month) {
        const day = ed.getDate();
        eventsPerDay[day] = eventsPerDay[day] || [];
        eventsPerDay[day].push(ev);
      }
    }

    return {
      monthName,
      firstDayIndex,
      totalDays,
      eventsPerDay,
      year,
      month,
    };
  }, [calendarMonthOffset, events]);

  // Admin: Save or Update Event
  const handleAdminSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: adminFormData.title,
        description: adminFormData.description,
        type: adminFormData.type,
        category: adminFormData.category,
        startAt: new Date(adminFormData.startAt).toISOString(),
        endAt: new Date(adminFormData.endAt).toISOString(),
        timezone: adminFormData.timezone || 'UTC',
        location: adminFormData.location,
        meetingUrl: adminFormData.meetingUrl || null,
        difficulty: adminFormData.difficulty,
        capacity: Number(adminFormData.capacity),
        instructor: adminFormData.instructor,
        skills: adminFormData.skills.split(',').map(s => s.trim()).filter(Boolean),
        requirements: adminFormData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        tags: adminFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
        featured: adminFormData.featured,
      };

      const url = adminEditingEvent ? `/api/admin/events/${adminEditingEvent.id}` : '/api/admin/events';
      const method = adminEditingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: adminEditingEvent ? 'Event Updated' : 'Event Created',
          description: `"${adminFormData.title}" has been saved.`,
        });
        setShowAdminModal(false);
        setAdminEditingEvent(null);
        fetchEvents();
      } else {
        toast({
          title: 'Error Saving Event',
          description: json.error?.message || 'Check form parameters.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Server Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Admin: Delete Event
  const handleAdminDeleteEvent = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Event Deleted' });
        fetchEvents();
      }
    } catch (err) {
      toast({ title: 'Failed to delete event', variant: 'destructive' });
    }
  };

  return (
    <Shell>
      <div className="events-page-wrap fade-in">

        {/* ================================================================= */}
        {/* Page Header                                                       */}
        {/* ================================================================= */}
        <div className="events-header-block">
          <div className="events-eyebrow">
            <Radio size={14} className="text-[#43e2b0] animate-pulse" />
            CYBERQUEST EVENTS • LIVE SESSIONS & CHALLENGES
          </div>
          <h1 className="events-title">Upcoming Events</h1>
          <p className="events-subtitle">
            Join live security labs, CTF challenges, expert workshops, incident response drills, and community activities.
          </p>

          {/* Admin Header Action */}
          {isAdmin && (
            <div style={{ marginTop: '16px' }}>
              <button
                className="event-card-btn primary"
                style={{ width: 'auto', padding: '0 20px', height: '40px' }}
                onClick={() => {
                  setAdminEditingEvent(null);
                  setAdminFormData({
                    title: '',
                    description: '',
                    type: 'LAB',
                    category: 'Cybersecurity',
                    startAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16),
                    endAt: new Date(Date.now() + 26 * 3600 * 1000).toISOString().slice(0, 16),
                    timezone: 'UTC',
                    location: 'Online / CyberQuest Range',
                    meetingUrl: '',
                    difficulty: 'Intermediate',
                    capacity: 100,
                    instructor: 'CyberQuest Academy',
                    skills: 'Threat Analysis, Defensive Security',
                    requirements: 'Basic Security Awareness',
                    tags: 'Live Lab, Hands-on',
                    featured: false,
                  });
                  setShowAdminModal(true);
                }}
              >
                <Plus size={15} /> Create New Event (Admin Mode)
              </button>
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* Featured Upcoming Event Hero                                      */}
        {/* ================================================================= */}
        {featuredEvent && (
          <div className="featured-event-hero">
            <div className="featured-hero-top">
              <span className="featured-hero-badge">
                <Sparkles size={14} /> FEATURED EVENT
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className={`event-type-badge ${getEventTypeMeta(featuredEvent.type).cls}`}>
                  {getEventTypeMeta(featuredEvent.type).icon} {getEventTypeMeta(featuredEvent.type).label}
                </span>
                <span className={`event-status-pill ${featuredEvent.liveStatus.toLowerCase()}`}>
                  {featuredEvent.liveStatus === 'LIVE' ? '🔴 Live Now' : featuredEvent.liveStatus === 'STARTING_SOON' ? '🟡 Starting Soon' : '🟢 Upcoming'}
                </span>
              </div>
            </div>

            <h2 className="featured-hero-title">{featuredEvent.title}</h2>
            <p className="featured-hero-desc">{featuredEvent.description}</p>

            {/* Meta Grid */}
            {(() => {
              const dt = formatEventDateTime(featuredEvent.startAt, featuredEvent.endAt);
              return (
                <div className="featured-hero-meta-grid">
                  <div className="featured-meta-item">
                    <div className="featured-meta-icon"><Calendar size={18} /></div>
                    <div>
                      <div className="featured-meta-label">Date</div>
                      <div className="featured-meta-val">{dt.dateStr}</div>
                    </div>
                  </div>
                  <div className="featured-meta-item">
                    <div className="featured-meta-icon"><Clock size={18} /></div>
                    <div>
                      <div className="featured-meta-label">Time & Duration</div>
                      <div className="featured-meta-val">{dt.timeRange} ({dt.durationStr})</div>
                    </div>
                  </div>
                  <div className="featured-meta-item">
                    <div className="featured-meta-icon"><MapPin size={18} /></div>
                    <div>
                      <div className="featured-meta-label">Location</div>
                      <div className="featured-meta-val">{featuredEvent.location}</div>
                    </div>
                  </div>
                  <div className="featured-meta-item">
                    <div className="featured-meta-icon"><Users size={18} /></div>
                    <div>
                      <div className="featured-meta-label">Attendance</div>
                      <div className="featured-meta-val">{featuredEvent.registeredCount} / {featuredEvent.capacity} Registered</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom Actions & Countdown */}
            <div className="featured-hero-bottom">
              <div className="featured-countdown-box">
                <span className="featured-countdown-label">
                  {featuredEvent.liveStatus === 'LIVE' ? 'STATUS' : 'STARTS IN'}
                </span>
                <span className="featured-countdown-value">
                  {featuredEvent.liveStatus === 'LIVE'
                    ? '🔴 LIVE RIGHT NOW'
                    : formatCountdown(new Date(featuredEvent.startAt).getTime() - currentTime)}
                </span>
              </div>

              <div className="featured-hero-actions">
                <button
                  className={`event-card-btn ${featuredEvent.isRegistered ? 'registered' : 'primary'}`}
                  style={{ width: 'auto', padding: '0 24px', height: '46px' }}
                  onClick={() => handleToggleRegistration(featuredEvent)}
                  disabled={isRegistering}
                >
                  {featuredEvent.isRegistered ? (
                    <><Check size={16} /> Registered ✓</>
                  ) : (
                    <><Calendar size={16} /> Register Now</>
                  )}
                </button>
                <button
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 20px', height: '46px' }}
                  onClick={() => setActiveDetailsEvent(featuredEvent)}
                >
                  View Details →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* Filter & Search Toolbar                                           */}
        {/* ================================================================= */}
        <div className="events-toolbar">
          {/* Search Input */}
          <div className="events-search-wrap">
            <Search size={18} className="events-search-icon" />
            <input
              type="text"
              placeholder="Search events by title, description, skills, instructor..."
              className="events-search-input"
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

          {/* Filter Pills Row */}
          <div className="events-controls-row">
            <div className="events-pills-wrap">
              {[
                { id: 'All', label: 'All Events' },
                { id: 'LAB', label: '🧪 Labs' },
                { id: 'CTF', label: '🚩 CTF' },
                { id: 'WORKSHOP', label: '🎓 Workshops' },
                { id: 'CODING_CHALLENGE', label: '💻 Challenges' },
                { id: 'WEBINAR', label: '📡 Webinars' },
                { id: 'SECURITY_DRILL', label: '🛡️ Drills' },
                { id: 'HACKATHON', label: '🏆 Hackathons' },
                { id: 'CAREER', label: '💼 Career' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`events-pill ${selectedType === t.id ? 'active' : ''}`}
                  onClick={() => { setSelectedType(t.id); setCalendarSelectedDate(null); }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggles */}
            <div className="events-view-toggles">
              <button
                className={`events-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List View
              </button>
              <button
                className={`events-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
              <button
                className={`events-toggle-btn ${viewMode === 'my-events' ? 'active' : ''}`}
                onClick={() => setViewMode('my-events')}
              >
                My Events ({myRegisteredEvents.length})
              </button>
            </div>
          </div>

          {/* Date Filter Pills (List View Only) */}
          {viewMode === 'list' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'DM Mono', color: '#688e84', textTransform: 'uppercase' }}>
                TIMEFRAME:
              </span>
              {[
                { id: 'upcoming', label: 'All Upcoming' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All (Incl. Past)' },
              ].map(tf => (
                <button
                  key={tf.id}
                  className={`events-pill ${timeFilter === tf.id ? 'active' : ''}`}
                  onClick={() => { setTimeFilter(tf.id as any); setCalendarSelectedDate(null); }}
                >
                  {tf.label}
                </button>
              ))}
              {calendarSelectedDate && (
                <span className="event-type-badge lab" style={{ gap: '6px' }}>
                  Filter: {new Date(calendarSelectedDate).toLocaleDateString()}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCalendarSelectedDate(null)} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* View Mode 1: LIST VIEW                                            */}
        {/* ================================================================= */}
        {viewMode === 'list' && (
          <>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="event-card" style={{ height: '280px', opacity: 0.6 }}>
                    <Loading label="Fetching event details..." />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div className="event-card" style={{ textAlign: 'center', padding: '40px' }}>
                <AlertCircle size={36} color="#f87171" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ color: '#ebf6f3', fontSize: '18px', marginBottom: '8px' }}>Unable to load events</h3>
                <p style={{ color: '#8daea5', marginBottom: '18px' }}>{loadError}</p>
                <button className="event-card-btn primary" style={{ width: 'auto', padding: '0 24px' }} onClick={fetchEvents}>
                  Try Again
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="event-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Calendar size={40} color="#43e2b0" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                <h3 style={{ color: '#ebf6f3', fontSize: '20px', marginBottom: '8px' }}>No Events Found</h3>
                <p style={{ color: '#8daea5', maxWidth: '480px', margin: '0 auto 20px' }}>
                  There are no scheduled events matching your current filters. Try searching with different keywords or switch categories.
                </p>
                <button
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 20px' }}
                  onClick={() => { setSearch(''); setSelectedType('All'); setSelectedCategory('All'); setTimeFilter('upcoming'); setCalendarSelectedDate(null); }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="events-cards-grid">
                {filteredEvents.map(event => {
                  const typeMeta = getEventTypeMeta(event.type);
                  const dt = formatEventDateTime(event.startAt, event.endAt);
                  const targetStart = new Date(event.startAt).getTime();
                  const remainingMs = targetStart - currentTime;

                  return (
                    <div key={event.id} className="event-card">
                      <div>
                        {/* Top Badge Row */}
                        <div className="event-card-top">
                          <span className={`event-type-badge ${typeMeta.cls}`}>
                            {typeMeta.icon} {typeMeta.label}
                          </span>
                          <span className={`event-status-pill ${event.liveStatus.toLowerCase()}`}>
                            {event.liveStatus === 'LIVE' ? '🔴 Live' : event.liveStatus === 'STARTING_SOON' ? '🟡 Soon' : event.liveStatus === 'COMPLETED' ? '✓ Ended' : '🟢 Upcoming'}
                          </span>
                        </div>

                        {/* Event Title & Description */}
                        <h3 className="event-card-title">{event.title}</h3>
                        <p className="event-card-desc">{event.description}</p>

                        {/* Date & Time Strip */}
                        <div className="event-schedule-strip">
                          <div className="event-schedule-row">
                            <Calendar size={13} color="#43e2b0" />
                            <span>{dt.dateStr}</span>
                          </div>
                          <div className="event-schedule-row">
                            <Clock size={13} color="#43e2b0" />
                            <span>{dt.timeRange} ({dt.durationStr})</span>
                          </div>
                          <div className="event-schedule-row">
                            <MapPin size={13} color="#43e2b0" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {/* Attendance & Countdown Row */}
                        <div className="event-card-meta">
                          <span>🎯 {event.difficulty} • 👥 {event.registeredCount}/{event.capacity}</span>
                          <span className="event-countdown-pill">
                            {event.liveStatus === 'LIVE' ? (
                              '🔴 LIVE NOW'
                            ) : event.liveStatus === 'COMPLETED' ? (
                              '✓ COMPLETED'
                            ) : (
                              formatCountdown(remainingMs)
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="event-card-actions">
                        <button
                          className={`event-card-btn ${event.isRegistered ? 'registered' : 'primary'}`}
                          onClick={() => handleToggleRegistration(event)}
                          disabled={isRegistering || event.liveStatus === 'COMPLETED'}
                        >
                          {event.isRegistered ? (
                            <><Check size={14} /> Registered ✓</>
                          ) : event.liveStatus === 'COMPLETED' ? (
                            'Event Concluded'
                          ) : (
                            'Register'
                          )}
                        </button>
                        <button
                          className="event-card-btn secondary"
                          onClick={() => setActiveDetailsEvent(event)}
                        >
                          Details
                        </button>

                        {/* Admin Action Menu */}
                        {isAdmin && (
                          <button
                            className="event-card-btn secondary"
                            title="Edit Event (Admin)"
                            style={{ padding: '0 10px' }}
                            onClick={() => {
                              setAdminEditingEvent(event);
                              setAdminFormData({
                                title: event.title,
                                description: event.description,
                                type: event.type,
                                category: event.category,
                                startAt: new Date(event.startAt).toISOString().slice(0, 16),
                                endAt: new Date(event.endAt).toISOString().slice(0, 16),
                                timezone: event.timezone,
                                location: event.location,
                                meetingUrl: event.meetingUrl || '',
                                difficulty: event.difficulty,
                                capacity: event.capacity,
                                instructor: event.instructor,
                                skills: event.skills.join(', '),
                                requirements: event.requirements.join(', '),
                                tags: event.tags.join(', '),
                                featured: event.featured,
                              });
                              setShowAdminModal(true);
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ================================================================= */}
        {/* View Mode 2: CALENDAR VIEW                                        */}
        {/* ================================================================= */}
        {viewMode === 'calendar' && (
          <div className="events-calendar-box">
            <div className="calendar-header">
              <div className="calendar-month-title">
                📅 {calendarData.monthName}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 14px', height: '34px' }}
                  onClick={() => setCalendarMonthOffset(calendarMonthOffset - 1)}
                >
                  <ChevronLeft size={16} /> Prev Month
                </button>
                <button
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 14px', height: '34px' }}
                  onClick={() => setCalendarMonthOffset(0)}
                >
                  Today
                </button>
                <button
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 14px', height: '34px' }}
                  onClick={() => setCalendarMonthOffset(calendarMonthOffset + 1)}
                >
                  Next Month <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="calendar-day-header">{d}</div>
              ))}

              {/* Leading Empty Cells */}
              {Array.from({ length: calendarData.firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day-cell empty" />
              ))}

              {/* Days of Month */}
              {Array.from({ length: calendarData.totalDays }).map((_, i) => {
                const dayNum = i + 1;
                const dayEvents = calendarData.eventsPerDay[dayNum] || [];
                const hasEvents = dayEvents.length > 0;
                const dateKey = `${calendarData.year}-${String(calendarData.month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = calendarSelectedDate === dateKey;

                return (
                  <div
                    key={dayNum}
                    className={`calendar-day-cell ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (hasEvents) {
                        setCalendarSelectedDate(isSelected ? null : dateKey);
                        setViewMode('list');
                      }
                    }}
                  >
                    <span className="calendar-date-num">{dayNum}</span>
                    {hasEvents && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {dayEvents.slice(0, 2).map(ev => (
                          <span key={ev.id} className="calendar-event-dot-tag" title={ev.title}>
                            {getEventTypeMeta(ev.type).icon} {ev.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span style={{ fontSize: '9px', color: '#43e2b0', fontFamily: 'DM Mono' }}>
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* View Mode 3: MY EVENTS                                            */}
        {/* ================================================================= */}
        {viewMode === 'my-events' && (
          <div className="my-events-section">
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '20px', color: '#ebf6f3', margin: '0 0 16px' }}>
              🎟️ My Registered Events ({myRegisteredEvents.length})
            </h3>

            {myRegisteredEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#8daea5' }}>
                <p>You haven't registered for any events yet.</p>
                <button
                  className="event-card-btn primary"
                  style={{ width: 'auto', padding: '0 24px', margin: '12px auto 0' }}
                  onClick={() => setViewMode('list')}
                >
                  Browse Upcoming Events
                </button>
              </div>
            ) : (
              <div className="my-events-list">
                {myRegisteredEvents.map(ev => {
                  const dt = formatEventDateTime(ev.startAt, ev.endAt);
                  return (
                    <div key={ev.id} className="my-event-card">
                      <div>
                        <span className={`event-type-badge ${getEventTypeMeta(ev.type).cls}`} style={{ marginBottom: '6px' }}>
                          {getEventTypeMeta(ev.type).icon} {getEventTypeMeta(ev.type).label}
                        </span>
                        <div style={{ fontWeight: 700, color: '#ebf6f3', fontSize: '15px' }}>{ev.title}</div>
                        <div style={{ fontSize: '12px', color: '#7d9e96', marginTop: '4px' }}>
                          {dt.dateStr} • {dt.timeRange}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button
                          className="event-card-btn secondary"
                          style={{ height: '34px', fontSize: '12px', padding: '0 14px' }}
                          onClick={() => setActiveDetailsEvent(ev)}
                        >
                          View Details
                        </button>
                        <button
                          style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer', fontFamily: 'Manrope' }}
                          onClick={() => handleToggleRegistration(ev)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* Event Details Modal                                                 */}
      {/* =================================================================== */}
      {activeDetailsEvent && (
        <div className="events-modal-overlay" onClick={() => setActiveDetailsEvent(null)}>
          <div className="events-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="events-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`event-type-badge ${getEventTypeMeta(activeDetailsEvent.type).cls}`}>
                  {getEventTypeMeta(activeDetailsEvent.type).icon} {getEventTypeMeta(activeDetailsEvent.type).label}
                </span>
                <span className={`event-status-pill ${activeDetailsEvent.liveStatus.toLowerCase()}`}>
                  {activeDetailsEvent.liveStatus}
                </span>
              </div>
              <button
                onClick={() => setActiveDetailsEvent(null)}
                style={{ background: 'none', border: 'none', color: '#799d94', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="events-modal-body">
              <div>
                <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '24px', fontWeight: 700, color: '#ebf6f3', margin: '0 0 8px' }}>
                  {activeDetailsEvent.title}
                </h2>
                <p style={{ fontSize: '14.5px', color: '#9cb8b1', lineHeight: 1.6, margin: 0 }}>
                  {activeDetailsEvent.description}
                </p>
              </div>

              {/* Meta Grid */}
              {(() => {
                const dt = formatEventDateTime(activeDetailsEvent.startAt, activeDetailsEvent.endAt);
                return (
                  <div className="featured-hero-meta-grid" style={{ margin: 0 }}>
                    <div className="featured-meta-item">
                      <div className="featured-meta-icon"><Calendar size={18} /></div>
                      <div>
                        <div className="featured-meta-label">Date</div>
                        <div className="featured-meta-val">{dt.dateStr}</div>
                      </div>
                    </div>
                    <div className="featured-meta-item">
                      <div className="featured-meta-icon"><Clock size={18} /></div>
                      <div>
                        <div className="featured-meta-label">Time & Timezone</div>
                        <div className="featured-meta-val">{dt.timeRange} ({dt.tzName})</div>
                      </div>
                    </div>
                    <div className="featured-meta-item">
                      <div className="featured-meta-icon"><MapPin size={18} /></div>
                      <div>
                        <div className="featured-meta-label">Location</div>
                        <div className="featured-meta-val">{activeDetailsEvent.location}</div>
                      </div>
                    </div>
                    <div className="featured-meta-item">
                      <div className="featured-meta-icon"><Users size={18} /></div>
                      <div>
                        <div className="featured-meta-label">Capacity</div>
                        <div className="featured-meta-val">{activeDetailsEvent.registeredCount} / {activeDetailsEvent.capacity} Spots Booked</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Instructor Section */}
              <div style={{ background: 'rgba(16, 32, 42, 0.65)', border: '1px solid rgba(44, 76, 70, 0.4)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11px', fontFamily: 'DM Mono', color: '#43e2b0', textTransform: 'uppercase', marginBottom: '4px' }}>
                  SESSION INSTRUCTOR & LEAD
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#ebf6f3' }}>
                  {activeDetailsEvent.instructor}
                </div>
                {activeDetailsEvent.instructorRole && (
                  <div style={{ fontSize: '12.5px', color: '#8daea5', marginTop: '2px' }}>
                    {activeDetailsEvent.instructorRole}
                  </div>
                )}
              </div>

              {/* Skills Gained */}
              {activeDetailsEvent.skills?.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: 'Space Grotesk', fontSize: '14px', color: '#ebf6f3', marginBottom: '8px' }}>
                    SKILLS & COMPETENCIES
                  </h4>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeDetailsEvent.skills.map(s => (
                      <span key={s} className="cyber-feature-tag">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {activeDetailsEvent.requirements?.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: 'Space Grotesk', fontSize: '14px', color: '#ebf6f3', marginBottom: '8px' }}>
                    PREREQUISITES & PREPARATION
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {activeDetailsEvent.requirements.map(r => (
                      <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9cb8b1' }}>
                        <Check size={14} color="#43e2b0" /> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reminder Preference Selector */}
              {!activeDetailsEvent.isRegistered && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(13, 26, 34, 0.7)', padding: '12px 16px', borderRadius: '10px' }}>
                  <Bell size={16} color="#43e2b0" />
                  <span style={{ fontSize: '12.5px', color: '#a4c4bd' }}>Send me a reminder:</span>
                  <select
                    value={reminderPref}
                    onChange={(e) => setReminderPref(e.target.value)}
                    style={{ background: '#0b161e', color: '#ebf6f3', border: '1px solid #2c4c46', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}
                  >
                    <option value="15m">15 minutes before</option>
                    <option value="1h">1 hour before</option>
                    <option value="1d">1 day before</option>
                  </select>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="events-modal-footer">
              <button
                className="event-card-btn secondary"
                style={{ width: 'auto', padding: '0 20px' }}
                onClick={() => setActiveDetailsEvent(null)}
              >
                Close
              </button>

              <button
                className={`event-card-btn ${activeDetailsEvent.isRegistered ? 'registered' : 'primary'}`}
                style={{ width: 'auto', padding: '0 24px' }}
                onClick={() => handleToggleRegistration(activeDetailsEvent)}
                disabled={isRegistering || activeDetailsEvent.liveStatus === 'COMPLETED'}
              >
                {activeDetailsEvent.isRegistered ? (
                  <><Check size={15} /> Registered (Click to Cancel)</>
                ) : activeDetailsEvent.liveStatus === 'COMPLETED' ? (
                  'Event Concluded'
                ) : (
                  'Register for Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* Admin Create / Edit Modal                                           */}
      {/* =================================================================== */}
      {showAdminModal && (
        <div className="events-modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="events-modal-container" style={{ width: '850px' }} onClick={(e) => e.stopPropagation()}>
            <div className="events-modal-header">
              <span style={{ fontFamily: 'Space Grotesk', fontSize: '18px', fontWeight: 700, color: '#ebf6f3' }}>
                {adminEditingEvent ? 'Edit Event' : 'Create New Cyber Event'}
              </span>
              <button
                onClick={() => setShowAdminModal(false)}
                style={{ background: 'none', border: 'none', color: '#799d94', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminSaveEvent}>
              <div className="events-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      EVENT TITLE *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminFormData.title}
                      onChange={(e) => setAdminFormData({ ...adminFormData, title: e.target.value })}
                      className="events-search-input"
                      placeholder="e.g. Incident Response Simulation"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      EVENT TYPE *
                    </label>
                    <select
                      value={adminFormData.type}
                      onChange={(e) => setAdminFormData({ ...adminFormData, type: e.target.value })}
                      className="events-search-input"
                    >
                      <option value="LAB">Security Lab (LAB)</option>
                      <option value="CTF">CTF Challenge (CTF)</option>
                      <option value="WORKSHOP">Workshop</option>
                      <option value="WEBINAR">Webinar</option>
                      <option value="CODING_CHALLENGE">Coding Challenge</option>
                      <option value="HACKATHON">Hackathon</option>
                      <option value="SECURITY_DRILL">Security Drill</option>
                      <option value="THREAT_HUNT">Threat Hunt</option>
                      <option value="CAREER">Career Session</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      START DATE & TIME *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={adminFormData.startAt}
                      onChange={(e) => setAdminFormData({ ...adminFormData, startAt: e.target.value })}
                      className="events-search-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      END DATE & TIME *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={adminFormData.endAt}
                      onChange={(e) => setAdminFormData({ ...adminFormData, endAt: e.target.value })}
                      className="events-search-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      DIFFICULTY LEVEL
                    </label>
                    <select
                      value={adminFormData.difficulty}
                      onChange={(e) => setAdminFormData({ ...adminFormData, difficulty: e.target.value })}
                      className="events-search-input"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      MAX CAPACITY
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={adminFormData.capacity}
                      onChange={(e) => setAdminFormData({ ...adminFormData, capacity: Number(e.target.value) })}
                      className="events-search-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      LOCATION / PLATFORM
                    </label>
                    <input
                      type="text"
                      value={adminFormData.location}
                      onChange={(e) => setAdminFormData({ ...adminFormData, location: e.target.value })}
                      className="events-search-input"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                      INSTRUCTOR NAME
                    </label>
                    <input
                      type="text"
                      value={adminFormData.instructor}
                      onChange={(e) => setAdminFormData({ ...adminFormData, instructor: e.target.value })}
                      className="events-search-input"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                    DESCRIPTION *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={adminFormData.description}
                    onChange={(e) => setAdminFormData({ ...adminFormData, description: e.target.value })}
                    className="events-search-input"
                    style={{ height: 'auto' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontFamily: 'DM Mono', color: '#43e2b0', display: 'block', marginBottom: '6px' }}>
                    SKILLS (comma separated)
                  </label>
                  <input
                    type="text"
                    value={adminFormData.skills}
                    onChange={(e) => setAdminFormData({ ...adminFormData, skills: e.target.value })}
                    className="events-search-input"
                    placeholder="Log Analysis, SIEM, Incident Response"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="feat-chk"
                    checked={adminFormData.featured}
                    onChange={(e) => setAdminFormData({ ...adminFormData, featured: e.target.checked })}
                  />
                  <label htmlFor="feat-chk" style={{ fontSize: '13px', color: '#ebf6f3', cursor: 'pointer' }}>
                    Highlight as Primary Featured Event
                  </label>
                </div>
              </div>

              <div className="events-modal-footer">
                <button
                  type="button"
                  className="event-card-btn secondary"
                  style={{ width: 'auto', padding: '0 20px' }}
                  onClick={() => setShowAdminModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="event-card-btn primary"
                  style={{ width: 'auto', padding: '0 24px' }}
                >
                  {adminEditingEvent ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </Shell>
  );
}
