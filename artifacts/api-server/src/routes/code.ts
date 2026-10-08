import { Router, type Request, type Response, type RequestHandler } from "express";
import { optionalAuth, requireAuth } from "../middlewares/cyberquest-auth";
import { z } from "zod/v4";
import { db, savedCodeTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { explainCode, debugCode } from "../lib/ai";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const router = Router();

const RunCodeRequest = z.object({
  language: z.string(),
  code: z.string(),
  stdin: z.string().optional().default(""),
});

async function runLocalSandbox(language: string, code: string, stdin?: string): Promise<{ stdout: string; stderr: string; exitCode: number; executionTime: number }> {
  const startTime = Date.now();
  const tmpDir = os.tmpdir();
  const fileId = `cq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  let cmd = "";
  let args: string[] = [];
  let tempFilePath = "";

  if (language === "python") {
    tempFilePath = path.join(tmpDir, `${fileId}.py`);
    await fs.writeFile(tempFilePath, code, "utf-8");
    cmd = "python";
    args = [tempFilePath];
  } else if (language === "javascript") {
    tempFilePath = path.join(tmpDir, `${fileId}.js`);
    await fs.writeFile(tempFilePath, code, "utf-8");
    cmd = "node";
    args = [tempFilePath];
  } else {
    throw new Error(`Local runtime not available for ${language}`);
  }

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    const proc = spawn(cmd, args, { timeout: 6000, shell: false });

    if (stdin && proc.stdin) {
      proc.stdin.write(stdin);
      proc.stdin.end();
    }

    proc.stdout.on("data", (d) => {
      stdout += d.toString();
      if (stdout.length > 50000) proc.kill();
    });

    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > 50000) proc.kill();
    });

    proc.on("error", async (err) => {
      if (tempFilePath) try { await fs.unlink(tempFilePath); } catch {}
      reject(err);
    });

    proc.on("close", async (exitCode) => {
      if (tempFilePath) try { await fs.unlink(tempFilePath); } catch {}
      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? 0,
        executionTime: Date.now() - startTime,
      });
    });
  });
}

router.post("/code/run", optionalAuth, (async (req: Request, res: Response) => {
  try {
    const parsed = RunCodeRequest.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid request payload." });
      return;
    }

    const { language, code, stdin } = parsed.data;
    const normLang = language.toLowerCase();

    // 1. Try local execution for Python and JavaScript (first-class support)
    if (normLang === "python" || normLang === "javascript") {
      try {
        const result = await runLocalSandbox(normLang, code, stdin);
        res.json({
          success: true,
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTime: result.executionTime,
        });
        return;
      } catch (localErr: any) {
        req.log?.warn({ err: localErr }, "Local execution error, falling back to external runner");
      }
    }

    // 2. Try external piston execution
    const langMap: Record<string, string> = {
      python: "python",
      javascript: "javascript",
      "c++": "c++",
      cpp: "c++",
      java: "java",
      c: "c",
      sql: "sqlite3",
    };

    const mappedLang = langMap[normLang];
    if (!mappedLang) {
      res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
      return;
    }

    const pistonReq = {
      language: mappedLang,
      version: "*",
      files: [
        {
          name: `main.${normLang === "python" ? "py" : normLang === "javascript" ? "js" : normLang === "java" ? "java" : normLang === "c++" ? "cpp" : "sql"}`,
          content: code,
        },
      ],
      stdin: stdin,
      run_timeout: 5000,
    };

    const startTime = Date.now();
    try {
      const response: any = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pistonReq),
      });

      if (response && response.ok) {
        const data: any = await response.json();
        const executionTime = Date.now() - startTime;

        if (data.compile && data.compile.code !== 0) {
          res.json({
            success: true,
            stdout: "",
            stderr: data.compile.stderr || data.compile.output,
            exitCode: data.compile.code,
            executionTime,
          });
          return;
        }

        res.json({
          success: true,
          stdout: data.run.stdout,
          stderr: data.run.stderr,
          exitCode: data.run.code,
          executionTime,
        });
        return;
      }
    } catch {}

    // If both failed or unavailable for this language
    res.status(503).json({
      success: false,
      error: `Execution sandbox for ${language} is temporarily unavailable. Local Python 3.13 and Node.js execution are active.`,
    });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to execute code");
    res.status(500).json({ success: false, error: "Internal server error during code execution." });
  }
}) as RequestHandler);

// AI Explain endpoint
router.post("/code/explain", optionalAuth, (async (req: Request, res: Response) => {
  try {
    const { language = "python", code = "" } = req.body;
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ success: false, error: "Code content is required for explanation." });
      return;
    }
    const explanation = await explainCode({ language, code });
    res.json({ success: true, data: explanation });
  } catch (err: any) {
    req.log?.error({ err }, "Error explaining code");
    res.status(500).json({ success: false, error: err.message || "Failed to generate explanation." });
  }
}) as RequestHandler);

// AI Debug endpoint
router.post("/code/debug", optionalAuth, (async (req: Request, res: Response) => {
  try {
    const { language = "python", code = "", errorOutput = "" } = req.body;
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ success: false, error: "Code content is required for debugging." });
      return;
    }
    const debugResult = await debugCode({ language, code, errorOutput });
    res.json({ success: true, data: debugResult });
  } catch (err: any) {
    req.log?.error({ err }, "Error debugging code");
    res.status(500).json({ success: false, error: err.message || "Failed to debug code." });
  }
}) as RequestHandler);

const SaveCodeRequest = z.object({
  challengeId: z.number().optional(),
  language: z.string(),
  code: z.string(),
});

router.post("/code/save", optionalAuth, (async (req: Request, res: Response) => {
  try {
    const parsed = SaveCodeRequest.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Invalid request payload." });
      return;
    }
    const userId = req.cyberquestUser?.userId || 1;
    const { challengeId, language, code } = parsed.data;

    const existing = await db
      .select({ id: savedCodeTable.id })
      .from(savedCodeTable)
      .where(
        and(
          eq(savedCodeTable.userId, userId),
          challengeId ? eq(savedCodeTable.challengeId, challengeId) : eq(savedCodeTable.language, language)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(savedCodeTable)
        .set({ sourceCode: code, updatedAt: new Date() })
        .where(eq(savedCodeTable.id, existing[0].id));
    } else {
      await db.insert(savedCodeTable).values({
        userId,
        challengeId: challengeId || null,
        language,
        sourceCode: code,
      });
    }

    res.json({ success: true, message: "Code saved successfully." });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to save code");
    res.status(500).json({ success: false, error: "Failed to save code." });
  }
}) as RequestHandler);

router.get("/code/saved", optionalAuth, (async (req: Request, res: Response) => {
  try {
    const userId = req.cyberquestUser?.userId || 1;
    const saved = await db
      .select()
      .from(savedCodeTable)
      .where(eq(savedCodeTable.userId, userId))
      .orderBy(desc(savedCodeTable.updatedAt));
    
    res.json({ success: true, data: saved });
  } catch (error) {
    req.log?.error({ err: error }, "Failed to fetch saved code");
    res.status(500).json({ success: false, error: "Failed to fetch saved code." });
  }
}) as RequestHandler);

export default router;
