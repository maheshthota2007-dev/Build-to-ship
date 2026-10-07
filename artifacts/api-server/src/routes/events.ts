import { Router, type IRouter } from "express";
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { z } from "zod/v4";
import {
  db,
  pool,
  eventsTable,
  eventRegistrationsTable,
  usersTable,
  type Event,
  type EventRegistration
} from "@workspace/db";
import { errorResponse } from "../lib/cyberquest";
import { optionalAuth, requireAdmin, requireAuth } from "../middlewares/cyberquest-auth";

const router: IRouter = Router();

// -----------------------------------------------------------------------------
// Seed events
// -----------------------------------------------------------------------------
const SEED_EVENTS = [
  {
    slug: "cyber-defense-challenge-oct-2026",
    title: "Cyber Defense Challenge: Incident Response Simulation",
    description: "Learn how security operations teams detect, investigate, and respond to a simulated multi-stage cyber incident in a live virtual range.",
    type: "CTF",
    category: "Security Operations",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 6 * 3600 * 1000 + 21 * 60 * 1000), // ~4 days 6 hours in future
    endAt: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 8 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "Online / CyberQuest Range",
    meetingUrl: "https://cyberquest.academy/live/defense-challenge-01",
    difficulty: "Intermediate",
    capacity: 100,
    registeredCount: 42,
    instructor: "Commander Marcus Vance",
    instructorRole: "Principal Incident Responder & Former SOC Lead",
    skills: ["Incident Response", "Log Analysis", "Threat Detection", "Security Operations", "SIEM Triage"],
    requirements: ["Cybersecurity Fundamentals", "Basic Syslog & Network Awareness"],
    tags: ["Live Simulation", "Blue Team", "Hands-on", "SOC Tier 2"],
    registrationDeadline: new Date(Date.now() + 4 * 24 * 3600 * 1000),
    featured: true,
    active: true,
  },
  {
    slug: "network-traffic-analysis-lab-live",
    title: "Network Traffic Analysis & Packet Anomaly Lab",
    description: "Hands-on packet stream inspection: detect suspicious reverse shells, data exfiltration channels, and unencrypted credentials.",
    type: "LAB",
    category: "Network Defense",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 2 * 3600 * 1000), // ~2 days from now
    endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000 + 3.5 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "CyberQuest Virtual Packet Sandbox",
    meetingUrl: "https://cyberquest.academy/live/net-traffic-lab",
    difficulty: "Beginner",
    capacity: 80,
    registeredCount: 38,
    instructor: "Elena Rostova",
    instructorRole: "Network Defense Architect",
    skills: ["Wireshark", "PCAP Analysis", "TCP/IP Handshake", "Port Profiling"],
    requirements: ["Basic understanding of IP addresses and ports"],
    tags: ["Hands-on Lab", "Wireshark", "Packet Capture"],
    registrationDeadline: new Date(Date.now() + 2 * 24 * 3600 * 1000),
    featured: false,
    active: true,
  },
  {
    slug: "threat-intel-investigation-workshop",
    title: "Threat Intelligence & IOC Hunting Session",
    description: "Investigate real-world indicators of compromise, map attack patterns to MITRE ATT&CK techniques, and correlate infrastructure across threat feeds.",
    type: "THREAT_HUNT",
    category: "Threat Intelligence",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 6 * 24 * 3600 * 1000), // ~6 days
    endAt: new Date(Date.now() + 6 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "Online / Cyber Threat Intelligence Studio",
    meetingUrl: "https://cyberquest.academy/live/threat-intel-drill",
    difficulty: "Advanced",
    capacity: 60,
    registeredCount: 29,
    instructor: "Dr. Aris Thorne",
    instructorRole: "Senior Cyber Threat Researcher",
    skills: ["IOC Analysis", "MITRE ATT&CK", "Threat Hunting", "STIX/TAXII"],
    requirements: ["Intermediate security concepts", "Threat vectors familiarity"],
    tags: ["Threat Hunting", "MITRE", "IOCs"],
    featured: false,
    active: true,
  },
  {
    slug: "secure-coding-owasp-top-10-challenge",
    title: "Secure Coding Challenge: OWASP Top 10 Breakdown",
    description: "Live interactive challenge to spot vulnerabilities (SQLi, XSS, IDOR, SSRF) in real application code and write verified defensive patches.",
    type: "CODING_CHALLENGE",
    category: "Application Security",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 10 * 3600 * 1000), // 10 hours from now (Starting Soon!)
    endAt: new Date(Date.now() + 12 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "CyberQuest Coding Lab IDE",
    meetingUrl: "https://cyberquest.academy/live/secure-code-challenge",
    difficulty: "Intermediate",
    capacity: 120,
    registeredCount: 84,
    instructor: "Maya Lin",
    instructorRole: "DevSecOps Lead Engineer",
    skills: ["Input Validation", "Defensive Coding", "SQLi Remediation", "CSP Config"],
    requirements: ["Basic programming knowledge in JavaScript or Python"],
    tags: ["Coding Lab", "DevSecOps", "OWASP"],
    featured: false,
    active: true,
  },
  {
    slug: "cloud-security-misconfig-drill",
    title: "Cloud Infrastructure Defense & S3 Security Drill",
    description: "Hands-on audit of a misconfigured cloud tenant: discover exposed storage buckets, overly permissive IAM roles, and leaked API secrets.",
    type: "SECURITY_DRILL",
    category: "Cloud Security",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 8 * 24 * 3600 * 1000),
    endAt: new Date(Date.now() + 8 * 24 * 3600 * 1000 + 2.5 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "CyberQuest Cloud Range",
    meetingUrl: "https://cyberquest.academy/live/cloud-drill",
    difficulty: "Intermediate",
    capacity: 75,
    registeredCount: 31,
    instructor: "Derrick Chen",
    instructorRole: "Cloud Security Specialist",
    skills: ["AWS IAM", "CloudTrail", "Bucket Policies", "Least Privilege"],
    requirements: ["Cloud fundamentals", "Identity & Access basics"],
    tags: ["Cloud", "IAM", "Hardening"],
    featured: false,
    active: true,
  },
  {
    slug: "cyberquest-defensive-hackathon-2026",
    title: "CyberQuest Defensive Hackathon 2026",
    description: "Join fellow defenders worldwide to build automated security bots, detection rules, and blue-team alerting pipelines. Prizes & XP rewards!",
    type: "HACKATHON",
    category: "Community & Hackathons",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 14 * 24 * 3600 * 1000),
    endAt: new Date(Date.now() + 16 * 24 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "Global Discord & CyberQuest Range",
    meetingUrl: "https://cyberquest.academy/hackathon",
    difficulty: "All Levels",
    capacity: 500,
    registeredCount: 215,
    instructor: "CyberQuest Academy Faculty",
    instructorRole: "Community Hackathon Mentors",
    skills: ["Teamwork", "Detection Engineering", "Scripting", "Project Presentation"],
    requirements: ["Enthusiasm to build and learn with teammates"],
    tags: ["Hackathon", "Prizes", "+500 XP", "All Levels"],
    featured: false,
    active: true,
  },
  {
    slug: "security-career-panel-soc-engineering",
    title: "Security Careers Panel: Breaking into SOC & Engineering",
    description: "Interactive session with industry professionals covering resume building, interview prep, home lab setups, and top security certifications.",
    type: "CAREER",
    category: "Career & Community",
    status: "PUBLISHED",
    startAt: new Date(Date.now() + 18 * 24 * 3600 * 1000),
    endAt: new Date(Date.now() + 18 * 24 * 3600 * 1000 + 1.5 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "Live Webinar Studio",
    meetingUrl: "https://cyberquest.academy/live/careers-panel",
    difficulty: "All Levels",
    capacity: 250,
    registeredCount: 140,
    instructor: "Sarah Jenkins & Industry Panel",
    instructorRole: "Cybersecurity Recruitment Lead & SOC Managers",
    skills: ["Career Planning", "Certifications", "Resume Review", "Interview Strategy"],
    requirements: ["Open to all students and career switchers"],
    tags: ["Webinar", "Q&A", "Career Transition"],
    featured: false,
    active: true,
  },
  {
    slug: "intro-cryptography-pki-workshop",
    title: "Applied Cryptography & PKI Deep Dive",
    description: "A foundational walkthrough of public/private key pairs, digital signatures, hashing algorithms, and TLS certificate lifecycle management.",
    type: "WORKSHOP",
    category: "Cryptography",
    status: "PUBLISHED",
    startAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago (COMPLETED)
    endAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
    timezone: "UTC",
    locationType: "online",
    location: "CyberQuest Virtual Classroom",
    meetingUrl: "https://cyberquest.academy/replays/crypto-pki",
    difficulty: "Beginner",
    capacity: 100,
    registeredCount: 94,
    instructor: "Prof. Kenneth Wright",
    instructorRole: "Applied Cryptography Fellow",
    skills: ["RSA", "ECC", "Digital Signatures", "X.509 Certificates"],
    requirements: ["Basic mathematics and security fundamentals"],
    tags: ["Workshop", "Completed", "Replay Available"],
    featured: false,
    active: true,
  }
];

let initPromise: Promise<void> | undefined;

async function ensureEventsTableAndSeeds(): Promise<void> {
  initPromise ??= (async () => {
    // 1. Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyberquest_events (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Cybersecurity',
        status TEXT NOT NULL DEFAULT 'PUBLISHED',
        start_at TIMESTAMPTZ NOT NULL,
        end_at TIMESTAMPTZ NOT NULL,
        timezone TEXT NOT NULL DEFAULT 'UTC',
        location_type TEXT NOT NULL DEFAULT 'online',
        location TEXT NOT NULL DEFAULT 'Online / CyberQuest Range',
        meeting_url TEXT,
        difficulty TEXT NOT NULL DEFAULT 'All Levels',
        capacity INTEGER NOT NULL DEFAULT 100,
        registered_count INTEGER NOT NULL DEFAULT 0,
        instructor TEXT NOT NULL DEFAULT 'CyberQuest Academy',
        instructor_role TEXT,
        skills TEXT[] NOT NULL DEFAULT '{}',
        requirements TEXT[] NOT NULL DEFAULT '{}',
        tags TEXT[] NOT NULL DEFAULT '{}',
        registration_deadline TIMESTAMPTZ,
        image TEXT,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cyberquest_event_registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES cyberquest_events(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES cyberquest_users(id) ON DELETE CASCADE,
        reminder_preference TEXT NOT NULL DEFAULT '1h',
        status TEXT NOT NULL DEFAULT 'REGISTERED',
        registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT cyberquest_user_event_unique UNIQUE (user_id, event_id)
      );

      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS slug TEXT;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS type TEXT;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Cybersecurity';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PUBLISHED';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'online';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Online / CyberQuest Range';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS meeting_url TEXT;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'All Levels';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 100;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS registered_count INTEGER DEFAULT 0;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS instructor TEXT DEFAULT 'CyberQuest Academy';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS instructor_role TEXT;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS requirements TEXT[] DEFAULT '{}';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
      ALTER TABLE cyberquest_events ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
    `);

    // 2. Check if events table has any rows; if empty, insert seed events
    const existing = await db.select({ id: eventsTable.id }).from(eventsTable).limit(1);
    if (existing.length === 0) {
      await db.insert(eventsTable).values(SEED_EVENTS).onConflictDoNothing();
    }
  })().catch((err: unknown) => {
    initPromise = undefined;
    throw err;
  });

  return initPromise;
}

// -----------------------------------------------------------------------------
// Helper to compute dynamic lifecycle status
// -----------------------------------------------------------------------------
export function computeEventStatus(event: {
  status: string;
  startAt: Date | string;
  endAt: Date | string;
}): 'UPCOMING' | 'STARTING_SOON' | 'LIVE' | 'COMPLETED' | 'CANCELLED' {
  if (event.status === 'CANCELLED') return 'CANCELLED';

  const now = Date.now();
  const start = new Date(event.startAt).getTime();
  const end = new Date(event.endAt).getTime();

  if (now > end) return 'COMPLETED';
  if (now >= start && now <= end) return 'LIVE';
  // Starting soon if within 24 hours
  if (start - now <= 24 * 60 * 60 * 1000) return 'STARTING_SOON';
  return 'UPCOMING';
}

function parseEventId(param: string | string[] | undefined): number {
  const raw = Array.isArray(param) ? param[0] : param;
  return parseInt(raw || "", 10);
}

// -----------------------------------------------------------------------------
// GET /events - List events with search, category, type & date filters
// -----------------------------------------------------------------------------
router.get("/events", optionalAuth, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const userId = req.cyberquestUser?.userId;
  const { search, category, type, difficulty, timeFilter, status } = req.query as Record<string, string | undefined>;

  let events = await db
    .select()
    .from(eventsTable)
    .where(eq(eventsTable.active, true))
    .orderBy(asc(eventsTable.startAt));

  // Fetch registrations for current user if logged in
  let userRegistrations = new Map<number, string>();
  if (userId) {
    const regs = await db
      .select({
        eventId: eventRegistrationsTable.eventId,
        reminder: eventRegistrationsTable.reminderPreference,
      })
      .from(eventRegistrationsTable)
      .where(and(
        eq(eventRegistrationsTable.userId, userId),
        eq(eventRegistrationsTable.status, "REGISTERED")
      ));
    for (const r of regs) {
      userRegistrations.set(r.eventId, r.reminder);
    }
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000 - 1);
  const endOfWeek = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Apply in-memory filtering for responsive rich queries
  const processedEvents = events
    .map(ev => {
      const liveStatus = computeEventStatus(ev);
      const isRegistered = userRegistrations.has(ev.id);
      const reminderPref = userRegistrations.get(ev.id) || null;
      const startMs = new Date(ev.startAt).getTime();
      const countdownMs = Math.max(0, startMs - Date.now());

      return {
        ...ev,
        liveStatus,
        isRegistered,
        reminderPreference: reminderPref,
        countdownMs,
        startAt: new Date(ev.startAt).toISOString(),
        endAt: new Date(ev.endAt).toISOString(),
        registrationDeadline: ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString() : null,
      };
    })
    .filter(ev => {
      // Search
      if (search?.trim()) {
        const q = search.trim().toLowerCase();
        const matchTitle = ev.title.toLowerCase().includes(q);
        const matchDesc = ev.description.toLowerCase().includes(q);
        const matchType = ev.type.toLowerCase().includes(q);
        const matchInstructor = ev.instructor.toLowerCase().includes(q);
        const matchSkills = (ev.skills as string[])?.some((s: string) => s.toLowerCase().includes(q));
        const matchTags = (ev.tags as string[])?.some((t: string) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchType && !matchInstructor && !matchSkills && !matchTags) {
          return false;
        }
      }

      // Type filter
      if (type && type !== 'All') {
        if (ev.type.toUpperCase() !== type.toUpperCase()) return false;
      }

      // Category filter
      if (category && category !== 'All') {
        if (!ev.category.toLowerCase().includes(category.toLowerCase())) return false;
      }

      // Difficulty filter
      if (difficulty && difficulty !== 'All') {
        if (ev.difficulty.toLowerCase() !== difficulty.toLowerCase()) return false;
      }

      // Status filter
      if (status && status !== 'All') {
        if (ev.liveStatus !== status.toUpperCase()) return false;
      }

      // Time filter
      if (timeFilter) {
        const evDate = new Date(ev.startAt);
        if (timeFilter === 'today') {
          if (evDate < startOfToday || evDate > endOfToday) return false;
        } else if (timeFilter === 'week') {
          if (evDate < startOfToday || evDate > endOfWeek) return false;
        } else if (timeFilter === 'month') {
          if (evDate < startOfToday || evDate > endOfMonth) return false;
        } else if (timeFilter === 'upcoming') {
          if (ev.liveStatus === 'COMPLETED') return false;
        }
      }

      return true;
    });

  // Find primary featured event
  const featured = processedEvents.find(e => e.featured && e.liveStatus !== 'COMPLETED') ||
    processedEvents.find(e => e.liveStatus === 'LIVE' || e.liveStatus === 'STARTING_SOON') ||
    processedEvents.find(e => e.liveStatus === 'UPCOMING') ||
    processedEvents[0] || null;

  res.json({
    success: true,
    data: {
      events: processedEvents,
      total: processedEvents.length,
      featuredEvent: featured,
    }
  });
});

// -----------------------------------------------------------------------------
// GET /events/:id - Get single event details
// -----------------------------------------------------------------------------
router.get("/events/:id", optionalAuth, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const id = parseEventId(req.params.id);
  if (isNaN(id)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const [ev] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.id, id), eq(eventsTable.active, true)))
    .limit(1);

  if (!ev) {
    errorResponse(res, 404, "EVENT_NOT_FOUND", "Event could not be found.");
    return;
  }

  let isRegistered = false;
  let reminderPref: string | null = null;
  const userId = req.cyberquestUser?.userId;

  if (userId) {
    const [reg] = await db
      .select()
      .from(eventRegistrationsTable)
      .where(and(
        eq(eventRegistrationsTable.eventId, id),
        eq(eventRegistrationsTable.userId, userId),
        eq(eventRegistrationsTable.status, "REGISTERED")
      ))
      .limit(1);
    if (reg) {
      isRegistered = true;
      reminderPref = reg.reminderPreference;
    }
  }

  const liveStatus = computeEventStatus(ev);
  const startMs = new Date(ev.startAt).getTime();
  const countdownMs = Math.max(0, startMs - Date.now());

  res.json({
    success: true,
    data: {
      ...ev,
      liveStatus,
      isRegistered,
      reminderPreference: reminderPref,
      countdownMs,
      startAt: new Date(ev.startAt).toISOString(),
      endAt: new Date(ev.endAt).toISOString(),
      registrationDeadline: ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString() : null,
    }
  });
});

// -----------------------------------------------------------------------------
// POST /events/:id/register - Register user for event
// -----------------------------------------------------------------------------
router.post("/events/:id/register", requireAuth, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const eventId = parseEventId(req.params.id);
  if (isNaN(eventId)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const userId = req.cyberquestUser!.userId;
  const reminderPreference = (req.body?.reminderPreference as string) || "1h";

  const [ev] = await db
    .select()
    .from(eventsTable)
    .where(and(eq(eventsTable.id, eventId), eq(eventsTable.active, true)))
    .limit(1);

  if (!ev) {
    errorResponse(res, 404, "EVENT_NOT_FOUND", "Event could not be found.");
    return;
  }

  if (ev.status === "CANCELLED") {
    errorResponse(res, 400, "EVENT_CANCELLED", "This event has been cancelled.");
    return;
  }

  const now = Date.now();
  if (new Date(ev.endAt).getTime() < now) {
    errorResponse(res, 400, "EVENT_ENDED", "This event has already concluded.");
    return;
  }

  if (ev.registrationDeadline && new Date(ev.registrationDeadline).getTime() < now) {
    errorResponse(res, 400, "DEADLINE_PASSED", "The registration deadline for this event has passed.");
    return;
  }

  if (ev.registeredCount >= ev.capacity) {
    errorResponse(res, 400, "CAPACITY_REACHED", "This event is currently at full capacity.");
    return;
  }

  // Check existing registration
  const [existingReg] = await db
    .select()
    .from(eventRegistrationsTable)
    .where(and(
      eq(eventRegistrationsTable.eventId, eventId),
      eq(eventRegistrationsTable.userId, userId)
    ))
    .limit(1);

  if (existingReg) {
    if (existingReg.status === "REGISTERED") {
      res.json({
        success: true,
        message: "You are already registered for this event.",
        isRegistered: true,
        reminderPreference: existingReg.reminderPreference,
      });
      return;
    } else {
      // Re-activate cancelled registration
      await db
        .update(eventRegistrationsTable)
        .set({ status: "REGISTERED", reminderPreference, registeredAt: new Date() })
        .where(eq(eventRegistrationsTable.id, existingReg.id));
      
      await db
        .update(eventsTable)
        .set({ registeredCount: ev.registeredCount + 1 })
        .where(eq(eventsTable.id, eventId));

      res.json({
        success: true,
        message: "Registration confirmed!",
        isRegistered: true,
        registeredCount: ev.registeredCount + 1,
      });
      return;
    }
  }

  // Create new registration
  await db.insert(eventRegistrationsTable).values({
    eventId,
    userId,
    reminderPreference,
    status: "REGISTERED",
  });

  await db
    .update(eventsTable)
    .set({ registeredCount: ev.registeredCount + 1 })
    .where(eq(eventsTable.id, eventId));

  res.json({
    success: true,
    message: "Registration confirmed!",
    isRegistered: true,
    registeredCount: ev.registeredCount + 1,
  });
});

// -----------------------------------------------------------------------------
// DELETE /events/:id/register - Cancel event registration
// -----------------------------------------------------------------------------
router.delete("/events/:id/register", requireAuth, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const eventId = parseEventId(req.params.id);
  if (isNaN(eventId)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const userId = req.cyberquestUser!.userId;

  const [existingReg] = await db
    .select()
    .from(eventRegistrationsTable)
    .where(and(
      eq(eventRegistrationsTable.eventId, eventId),
      eq(eventRegistrationsTable.userId, userId),
      eq(eventRegistrationsTable.status, "REGISTERED")
    ))
    .limit(1);

  if (!existingReg) {
    res.json({ success: true, message: "No active registration to cancel.", isRegistered: false });
    return;
  }

  await db
    .delete(eventRegistrationsTable)
    .where(eq(eventRegistrationsTable.id, existingReg.id));

  // Decrement count
  const [ev] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
  const newCount = Math.max(0, (ev?.registeredCount || 1) - 1);
  if (ev) {
    await db.update(eventsTable).set({ registeredCount: newCount }).where(eq(eventsTable.id, eventId));
  }

  res.json({
    success: true,
    message: "Registration cancelled.",
    isRegistered: false,
    registeredCount: newCount,
  });
});

// -----------------------------------------------------------------------------
// GET /my-events - Get events registered by the current user
// -----------------------------------------------------------------------------
router.get("/my-events", requireAuth, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const userId = req.cyberquestUser!.userId;

  const registrations = await db
    .select({
      regId: eventRegistrationsTable.id,
      registeredAt: eventRegistrationsTable.registeredAt,
      reminderPreference: eventRegistrationsTable.reminderPreference,
      event: eventsTable,
    })
    .from(eventRegistrationsTable)
    .innerJoin(eventsTable, eq(eventRegistrationsTable.eventId, eventsTable.id))
    .where(and(
      eq(eventRegistrationsTable.userId, userId),
      eq(eventRegistrationsTable.status, "REGISTERED")
    ))
    .orderBy(asc(eventsTable.startAt));

  const upcoming: any[] = [];
  const completed: any[] = [];

  for (const item of registrations) {
    const liveStatus = computeEventStatus(item.event);
    const startMs = new Date(item.event.startAt).getTime();
    const countdownMs = Math.max(0, startMs - Date.now());

    const formatted = {
      ...item.event,
      liveStatus,
      isRegistered: true,
      reminderPreference: item.reminderPreference,
      registeredAt: new Date(item.registeredAt).toISOString(),
      startAt: new Date(item.event.startAt).toISOString(),
      endAt: new Date(item.event.endAt).toISOString(),
      countdownMs,
    };

    if (liveStatus === "COMPLETED") {
      completed.push(formatted);
    } else {
      upcoming.push(formatted);
    }
  }

  res.json({
    success: true,
    data: {
      upcoming,
      completed,
      totalRegistered: registrations.length,
    }
  });
});

// -----------------------------------------------------------------------------
// ADMIN ROUTES: Create, Edit, Delete, Publish, Cancel Events
// -----------------------------------------------------------------------------
const AdminEventSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10),
  type: z.string(),
  category: z.string().default("Cybersecurity"),
  startAt: z.string().refine(s => !isNaN(Date.parse(s)), "Invalid startAt timestamp"),
  endAt: z.string().refine(s => !isNaN(Date.parse(s)), "Invalid endAt timestamp"),
  timezone: z.string().default("UTC"),
  locationType: z.string().default("online"),
  location: z.string().default("Online / CyberQuest Range"),
  meetingUrl: z.string().optional().nullable(),
  difficulty: z.string().default("All Levels"),
  capacity: z.number().int().min(1).default(100),
  instructor: z.string().default("CyberQuest Academy"),
  instructorRole: z.string().optional().nullable(),
  skills: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});

// POST /admin/events - Create new event
router.post("/admin/events", requireAdmin, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const parsed = AdminEventSchema.safeParse(req.body);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", parsed.error.issues.map(i => i.message).join(", "));
    return;
  }

  const { title, startAt, endAt, ...rest } = parsed.data;
  const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`;

  const [newEvent] = await db
    .insert(eventsTable)
    .values({
      slug,
      title,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      ...rest,
      status: "PUBLISHED",
      active: true,
      registeredCount: 0,
    })
    .returning();

  res.json({
    success: true,
    message: "Event created successfully.",
    data: newEvent,
  });
});

// PUT /admin/events/:id - Update existing event
router.put("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const id = parseEventId(req.params.id);
  if (isNaN(id)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const parsed = AdminEventSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", parsed.error.issues.map(i => i.message).join(", "));
    return;
  }

  const updates: any = { ...parsed.data };
  if (updates.startAt) updates.startAt = new Date(updates.startAt);
  if (updates.endAt) updates.endAt = new Date(updates.endAt);

  const [updatedEvent] = await db
    .update(eventsTable)
    .set(updates)
    .where(eq(eventsTable.id, id))
    .returning();

  if (!updatedEvent) {
    errorResponse(res, 404, "EVENT_NOT_FOUND", "Event could not be found.");
    return;
  }

  res.json({
    success: true,
    message: "Event updated successfully.",
    data: updatedEvent,
  });
});

// DELETE /admin/events/:id - Delete an event
router.delete("/admin/events/:id", requireAdmin, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const id = parseEventId(req.params.id);
  if (isNaN(id)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  await db.delete(eventsTable).where(eq(eventsTable.id, id));

  res.json({
    success: true,
    message: "Event deleted permanently.",
  });
});

// POST /admin/events/:id/publish - Toggle publish status
router.post("/admin/events/:id/publish", requireAdmin, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const id = parseEventId(req.params.id);
  if (isNaN(id)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const [ev] = await db.select().from(eventsTable).where(eq(eventsTable.id, id)).limit(1);
  if (!ev) {
    errorResponse(res, 404, "EVENT_NOT_FOUND", "Event not found.");
    return;
  }

  const newStatus = ev.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  const [updated] = await db.update(eventsTable).set({ status: newStatus }).where(eq(eventsTable.id, id)).returning();

  res.json({
    success: true,
    message: `Event status changed to ${newStatus}.`,
    data: updated,
  });
});

// POST /admin/events/:id/cancel - Mark event as cancelled
router.post("/admin/events/:id/cancel", requireAdmin, async (req, res): Promise<void> => {
  await ensureEventsTableAndSeeds();

  const id = parseEventId(req.params.id);
  if (isNaN(id)) {
    errorResponse(res, 400, "INVALID_ID", "Event ID must be a number.");
    return;
  }

  const [updated] = await db.update(eventsTable).set({ status: "CANCELLED" }).where(eq(eventsTable.id, id)).returning();
  if (!updated) {
    errorResponse(res, 404, "EVENT_NOT_FOUND", "Event not found.");
    return;
  }

  res.json({
    success: true,
    message: "Event marked as CANCELLED.",
    data: updated,
  });
});

export default router;
