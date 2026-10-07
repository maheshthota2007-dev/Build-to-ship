import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { errorResponse, SESSION_COOKIE } from "../lib/cyberquest";

export type AuthClaims = {
  userId: number;
  role: "user" | "admin";
};

declare global {
  namespace Express {
    interface Request {
      cyberquestUser?: AuthClaims;
    }
  }
}

function secret(): string {
  const value = process.env.JWT_SECRET ?? process.env.SESSION_SECRET;
  if (!value) throw new Error("JWT_SECRET or SESSION_SECRET must be configured");
  return value;
}

function readClaims(token: string): AuthClaims | undefined {
  try {
    const verified = jwt.verify(token, secret(), { issuer: "cyberquest-ai" });
    if (typeof verified === "string") return undefined;
    const payload = verified as JwtPayload;
    if (
      typeof payload.userId !== "number" ||
      (payload.role !== "user" && payload.role !== "admin")
    ) {
      return undefined;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return undefined;
  }
}

export function signSession(claims: AuthClaims): string {
  return jwt.sign(claims, secret(), {
    expiresIn: "7d",
    issuer: "cyberquest-ai",
  });
}

function extractToken(req: Request): string | undefined {
  const fromCookie = req.cookies?.[SESSION_COOKIE];
  if (typeof fromCookie === "string") return fromCookie;
  const header = req.headers.authorization;
  if (typeof header === "string" && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return undefined;
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req);
  if (typeof token === "string") req.cyberquestUser = readClaims(token);
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = extractToken(req);
  const claims = typeof token === "string" ? readClaims(token) : undefined;
  if (!claims) {
    errorResponse(res, 401, "UNAUTHORIZED", "Sign in to continue.");
    return;
  }
  req.cyberquestUser = claims;
  next();
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.cyberquestUser) {
    errorResponse(res, 401, "UNAUTHORIZED", "Sign in to continue.");
    return;
  }
  if (req.cyberquestUser.role !== "admin") {
    errorResponse(res, 403, "FORBIDDEN", "Administrator access is required.");
    return;
  }
  next();
}
