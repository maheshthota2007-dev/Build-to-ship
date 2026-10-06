import { and, eq } from "drizzle-orm";
import {
  db,
  missionCompletionsTable,
  missionsTable,
  type EmailScenario,
  type Mission,
} from "@workspace/db";
import type { Response } from "express";

export const SESSION_COOKIE = "cyberquest_session";

export const findingOptions = [
  "Sender domain mismatch",
  "Suspicious link destination",
  "Urgent or threatening language",
  "Credential request",
  "Unexpected attachment",
  "Unusual payment request",
  "Unexpected sender",
  "Request to bypass policy",
] as const;

export function errorResponse(
  res: Response,
  status: number,
  code: string,
  message: string,
): void {
  res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export function levelForXp(xp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
} {
  const thresholds = [0, 100, 250, 450, 700, 1000, 1400, 1850, 2400, 3000];
  let levelIndex = 0;
  for (let index = 0; index < thresholds.length; index += 1) {
    if (xp >= thresholds[index]) levelIndex = index;
    else break;
  }
  const nextLevelXp =
    thresholds[levelIndex + 1] ??
    thresholds[thresholds.length - 1] + (levelIndex + 1 - thresholds.length) * 600;
  return {
    level: levelIndex + 1,
    currentLevelXp: thresholds[levelIndex] ?? 0,
    nextLevelXp,
  };
}

export function publicUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
  xp: number;
  streak: number;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role === "admin" ? "admin" : "user",
    xp: user.xp,
    level: levelForXp(user.xp).level,
    streak: user.streak,
    createdAt: user.createdAt.toISOString(),
  };
}

type SeedMission = {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  estimatedMinutes: number;
  xpReward: number;
  scenario: EmailScenario;
  answerAssessment: "SAFE" | "SUSPICIOUS" | "PHISHING";
  correctFindings: string[];
};

const seedMissions: SeedMission[] = [
  {
    slug: "payroll-account-change",
    title: "The Payroll Change Request",
    description: "A time-sensitive payroll email asks you to confirm a direct-deposit change.",
    category: "phishing",
    difficulty: "Easy",
    estimatedMinutes: 5,
    xpReward: 100,
    scenario: {
      senderName: "People Operations",
      senderEmail: "payroll@northstarr-people.example",
      recipientName: "Alex Morgan",
      subject: "ACTION REQUIRED: payroll details lock at 5 PM",
      receivedAt: "Today, 9:14 AM",
      body: "We detected an issue with your direct deposit. Confirm your bank and sign-in details immediately to avoid a delayed paycheck. This request is outside the usual employee portal so it can be processed faster.",
      displayedUrl: "https://northstar-payroll-check.example/verify",
      attachment: null,
    },
    answerAssessment: "PHISHING",
    correctFindings: [
      "Sender domain mismatch",
      "Suspicious link destination",
      "Urgent or threatening language",
      "Credential request",
      "Request to bypass policy",
    ],
  },
  {
    slug: "cloud-password-expiry",
    title: "Cloud Password Expiration",
    description: "Review a familiar-looking security notice before deciding whether to act.",
    category: "phishing",
    difficulty: "Easy",
    estimatedMinutes: 4,
    xpReward: 90,
    scenario: {
      senderName: "Workspace Security",
      senderEmail: "security@workplace-alerts.example",
      recipientName: "Alex Morgan",
      subject: "Your account will be suspended in 30 minutes",
      receivedAt: "Today, 10:02 AM",
      body: "Your password has expired. Use the secure link below and enter your current password to keep access. Do not contact IT because this automated recovery window cannot be extended.",
      displayedUrl: "https://workspace-auth-session.example/login",
      attachment: null,
    },
    answerAssessment: "PHISHING",
    correctFindings: [
      "Sender domain mismatch",
      "Suspicious link destination",
      "Urgent or threatening language",
      "Credential request",
      "Request to bypass policy",
    ],
  },
  {
    slug: "delivery-exception",
    title: "Package Delivery Exception",
    description: "A delivery update asks for a small payment through an unfamiliar page.",
    category: "social-engineering",
    difficulty: "Medium",
    estimatedMinutes: 5,
    xpReward: 110,
    scenario: {
      senderName: "Parcel Desk",
      senderEmail: "tracking@parcel-notice.example",
      recipientName: "Alex Morgan",
      subject: "Delivery held — confirm address today",
      receivedAt: "Today, 11:35 AM",
      body: "A parcel addressed to you could not be delivered. Pay a small re-delivery fee and confirm your full address and card details to release it. Your tracking reference is CQ-4821.",
      displayedUrl: "https://parcel-redelivery-charge.example/claim",
      attachment: null,
    },
    answerAssessment: "PHISHING",
    correctFindings: [
      "Sender domain mismatch",
      "Suspicious link destination",
      "Urgent or threatening language",
      "Credential request",
      "Unusual payment request",
    ],
  },
  {
    slug: "invoice-review",
    title: "Invoice Review from a New Vendor",
    description: "An unexpected invoice attachment arrives with a request to ignore normal review.",
    category: "malware-awareness",
    difficulty: "Medium",
    estimatedMinutes: 6,
    xpReward: 120,
    scenario: {
      senderName: "Accounts Payable",
      senderEmail: "billing@bright-supply.example",
      recipientName: "Alex Morgan",
      subject: "Past-due invoice — review attached today",
      receivedAt: "Today, 12:08 PM",
      body: "Please open the attached invoice and arrange same-day payment. Our account details changed this morning. Skip the vendor verification queue so we do not miss the payment window.",
      displayedUrl: null,
      attachment: "Invoice_Review_4821.zip",
    },
    answerAssessment: "SUSPICIOUS",
    correctFindings: [
      "Unexpected attachment",
      "Urgent or threatening language",
      "Unusual payment request",
      "Unexpected sender",
      "Request to bypass policy",
    ],
  },
  {
    slug: "vpn-sign-in-alert",
    title: "VPN Sign-in Alert",
    description: "A sign-in warning contains a plausible report and a destination worth checking.",
    category: "incident-response",
    difficulty: "Hard",
    estimatedMinutes: 7,
    xpReward: 140,
    scenario: {
      senderName: "IT Service Desk",
      senderEmail: "helpdesk@northstar.example",
      recipientName: "Alex Morgan",
      subject: "Was this sign-in yours?",
      receivedAt: "Today, 1:21 PM",
      body: "We recorded a VPN sign-in from a new device. If this was not you, open the company security portal from your saved bookmark or contact the service desk using the number in your directory. We will never ask for your password by email.",
      displayedUrl: "https://northstar.example/security",
      attachment: null,
    },
    answerAssessment: "SAFE",
    correctFindings: [],
  },
  {
    slug: "benefits-enrollment",
    title: "Benefits Enrollment Reminder",
    description: "Check whether this routine internal reminder uses the expected safe process.",
    category: "data-privacy",
    difficulty: "Easy",
    estimatedMinutes: 4,
    xpReward: 80,
    scenario: {
      senderName: "People Operations",
      senderEmail: "people@northstar.example",
      recipientName: "Alex Morgan",
      subject: "Benefits enrollment closes next Friday",
      receivedAt: "Today, 2:05 PM",
      body: "Open enrollment closes next Friday. Visit the employee portal using your saved bookmark to compare plan details. People Operations will not ask you to reply with personal or payment information.",
      displayedUrl: "https://northstar.example/benefits",
      attachment: null,
    },
    answerAssessment: "SAFE",
    correctFindings: [],
  },
  {
    slug: "mfa-device-reset",
    title: "MFA Device Reset",
    description: "A message claims support can reset your MFA if you send a one-time code.",
    category: "password-security",
    difficulty: "Medium",
    estimatedMinutes: 5,
    xpReward: 110,
    scenario: {
      senderName: "Account Support",
      senderEmail: "support@northstar-help.example",
      recipientName: "Alex Morgan",
      subject: "Reply with your verification code to restore MFA",
      receivedAt: "Today, 2:42 PM",
      body: "Your authenticator is out of sync. Reply with the six-digit verification code you just received and your password so we can reconnect the account. This reset expires in ten minutes.",
      displayedUrl: null,
      attachment: null,
    },
    answerAssessment: "PHISHING",
    correctFindings: [
      "Sender domain mismatch",
      "Urgent or threatening language",
      "Credential request",
      "Unexpected sender",
    ],
  },
  {
    slug: "quarterly-access-review",
    title: "Quarterly Access Review",
    description: "A routine access review directs employees to use their established workflow.",
    category: "network-security",
    difficulty: "Medium",
    estimatedMinutes: 5,
    xpReward: 100,
    scenario: {
      senderName: "Security Operations",
      senderEmail: "security-ops@northstar.example",
      recipientName: "Alex Morgan",
      subject: "Review your application access this week",
      receivedAt: "Today, 3:15 PM",
      body: "Please review your application access by Friday in the identity portal. Navigate there from the company intranet. If anything looks unfamiliar, use the service desk contact listed in the directory.",
      displayedUrl: "https://northstar.example/identity",
      attachment: null,
    },
    answerAssessment: "SAFE",
    correctFindings: [],
  },
  {
    slug: "shared-document-invite",
    title: "Shared Document Invitation",
    description: "An unfamiliar sender invites you to sign in to read a confidential document.",
    category: "web-security",
    difficulty: "Hard",
    estimatedMinutes: 6,
    xpReward: 130,
    scenario: {
      senderName: "Document Collaboration",
      senderEmail: "share@collab-access.example",
      recipientName: "Alex Morgan",
      subject: "A confidential document was shared with you",
      receivedAt: "Today, 3:49 PM",
      body: "A colleague shared a confidential file. Sign in with your work password to read it. The share will be removed shortly, so use the attached access request if the page asks for extra verification.",
      displayedUrl: "https://document-workspace-signin.example/open",
      attachment: "Access_Instructions.html",
    },
    answerAssessment: "SUSPICIOUS",
    correctFindings: [
      "Sender domain mismatch",
      "Suspicious link destination",
      "Urgent or threatening language",
      "Credential request",
      "Unexpected attachment",
    ],
  },
  {
    slug: "executive-gift-card-request",
    title: "Executive Gift Card Request",
    description: "A senior leader asks for a quick purchase and requests secrecy.",
    category: "social-engineering",
    difficulty: "Expert",
    estimatedMinutes: 7,
    xpReward: 160,
    scenario: {
      senderName: "Chief Operating Officer",
      senderEmail: "coo@northstar-executive.example",
      recipientName: "Alex Morgan",
      subject: "Quick favor before the meeting",
      receivedAt: "Today, 4:07 PM",
      body: "I am in a meeting and need you to buy gift cards for a partner. Send the codes here and keep it confidential. I cannot take a call right now; please do this in the next few minutes.",
      displayedUrl: null,
      attachment: null,
    },
    answerAssessment: "PHISHING",
    correctFindings: [
      "Sender domain mismatch",
      "Urgent or threatening language",
      "Unusual payment request",
      "Unexpected sender",
      "Request to bypass policy",
    ],
  },
];

let seedPromise: Promise<void> | undefined;

export function ensureSeedMissions(): Promise<void> {
  seedPromise ??= (async () => {
    const existing = await db.select({ id: missionsTable.id }).from(missionsTable).limit(1);
    if (existing.length > 0) return;
    await db.insert(missionsTable).values(seedMissions).onConflictDoNothing();
  })().catch((error: unknown) => {
    seedPromise = undefined;
    throw error;
  });
  return seedPromise;
}

export function toPublicMission(
  mission: Mission,
  completed = false,
) {
  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    category: mission.category,
    difficulty: mission.difficulty,
    estimatedMinutes: mission.estimatedMinutes,
    xpReward: mission.xpReward,
    scenario: mission.scenario,
    completed,
    createdAt: mission.createdAt.toISOString(),
  };
}

export function toAdminMission(mission: Mission) {
  return {
    ...toPublicMission(mission),
    answerAssessment: mission.answerAssessment,
    correctFindings: mission.correctFindings,
  };
}

export async function isMissionCompleted(
  userId: number,
  missionId: number,
): Promise<boolean> {
  const completion = await db
    .select({ id: missionCompletionsTable.id })
    .from(missionCompletionsTable)
    .where(and(
      eq(missionCompletionsTable.userId, userId),
      eq(missionCompletionsTable.missionId, missionId),
    ))
    .limit(1);
  return completion.length > 0;
}
