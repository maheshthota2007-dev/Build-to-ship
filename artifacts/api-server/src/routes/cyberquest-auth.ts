import { Router, type IRouter, type Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import {
  GetCurrentUserResponse,
  GetMyProfileResponse,
  LoginBody,
  LoginResponse,
  RegisterBody,
  RegisterResponse,
  UpdateMyProfileBody,
  UpdateMyProfileResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  errorResponse,
  publicUser,
  SESSION_COOKIE,
} from "../lib/cyberquest";
import {
  requireAuth,
  signSession,
} from "../middlewares/cyberquest-auth";

const router: IRouter = Router();
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; startedAt: number }>();

function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

function checkLoginLimit(ip: string): boolean {
  const now = Date.now();
  const existing = loginAttempts.get(ip);
  if (!existing || now - existing.startedAt > 60_000) {
    loginAttempts.set(ip, { count: 1, startedAt: now });
    return true;
  }
  existing.count += 1;
  return existing.count <= 12;
}

router.post("/auth/register", async (req, res, next): Promise<void> => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      errorResponse(res, 400, "VALIDATION_ERROR", "Check the name, email, and password fields.");
      return;
    }
    const email = parsed.data.email.trim().toLowerCase();
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    if (existing.length) {
      errorResponse(res, 409, "EMAIL_IN_USE", "An account with this email already exists.");
      return;
    }
    const adminEmail = process.env.CYBERQUEST_ADMIN_EMAIL?.trim().toLowerCase();
    const [user] = await db
      .insert(usersTable)
      .values({
        name: parsed.data.name.trim(),
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 12),
        role: adminEmail && email === adminEmail ? "admin" : "user",
      })
      .returning();
    if (!user) {
      errorResponse(res, 500, "ACCOUNT_CREATE_FAILED", "Unable to create the account.");
      return;
    }
    setSessionCookie(res, signSession({ userId: user.id, role: user.role === "admin" ? "admin" : "user" }));
    res.status(201).json(
      RegisterResponse.parse({ success: true, data: { user: publicUser(user) } }),
    );
  } catch (error) {
    req.log?.error({ err: error }, "Error during registration");
    errorResponse(res, 500, "INTERNAL_ERROR", "Unable to create account. Please try again later.");
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const ip = req.ip || "unknown";
  if (!checkLoginLimit(ip)) {
    errorResponse(res, 429, "RATE_LIMITED", "Too many sign-in attempts. Wait a minute and try again.");
    return;
  }
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Enter a valid email and password.");
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    errorResponse(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
    return;
  }
  loginAttempts.delete(ip);
  setSessionCookie(res, signSession({ userId: user.id, role: user.role === "admin" ? "admin" : "user" }));
  res.json(
    LoginResponse.parse({ success: true, data: { user: publicUser(user) } }),
  );
});

router.post("/auth/logout", (_req, res): void => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  res.json({ success: true, data: {} });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.cyberquestUser!.userId))
    .limit(1);
  if (!user) {
    errorResponse(res, 401, "UNAUTHORIZED", "Your session is no longer valid.");
    return;
  }
  res.json(
    GetCurrentUserResponse.parse({ success: true, data: { user: publicUser(user) } }),
  );
});

router.get("/users/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.cyberquestUser!.userId))
    .limit(1);
  if (!user) {
    errorResponse(res, 404, "USER_NOT_FOUND", "Profile not found.");
    return;
  }
  res.json(
    GetMyProfileResponse.parse({ success: true, data: { user: publicUser(user) } }),
  );
});

router.put("/users/me", requireAuth, async (req, res): Promise<void> => {
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    errorResponse(res, 400, "VALIDATION_ERROR", "Name must be between 2 and 80 characters.");
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ name: parsed.data.name.trim() })
    .where(eq(usersTable.id, req.cyberquestUser!.userId))
    .returning();
  if (!user) {
    errorResponse(res, 404, "USER_NOT_FOUND", "Profile not found.");
    return;
  }
  res.json(
    UpdateMyProfileResponse.parse({ success: true, data: { user: publicUser(user) } }),
  );
});

export default router;
