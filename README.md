# CyberQuest AI

CyberQuest AI is a defensive cybersecurity training arena. Learners review fictional,
isolated email scenarios, classify the message, mark evidence, and receive an AI-guided
debrief. It includes accounts, saved progress, XP, streaks, category accuracy,
leaderboards, a defensive mentor, and administrator mission authoring.

## Run in Replit

The project uses the existing PostgreSQL database and the managed `API Server` and
`web` workflows. Add these values in Replit Secrets:

- `SESSION_SECRET` — a long, randomly generated value used to sign secure sessions.
- `GEMINI_API_KEY` — used by the server for mission debriefs and mentor responses.
- `CYBERQUEST_ADMIN_EMAIL` — optional; set this before that email creates an account
  to grant the account administrator access.

The server also accepts `JWT_SECRET` as a separate signing key. If it is unset,
`SESSION_SECRET` is used. Never put real secret values in this file or client code.

After schema changes, apply the development database schema with:

```sh
pnpm --filter @workspace/db run push
```

Useful checks:

```sh
pnpm run typecheck:libs
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/cyberquest-ai run typecheck
```

## Design and safety

- Sessions use signed JWTs in HTTP-only, same-site cookies; password hashes use
  bcrypt. Public user responses never include password hashes.
- Mission answer keys are returned only to administrator routes. Public mission
  responses contain the fictional scenario, not the correct classification or signals.
- XP is granted only on the first completion of each mission. Scores and evidence
  matches are computed on the server; AI feedback cannot change them.
- Email senders use reserved `.example` domains. Links are displayed as inert text;
  the app does not send messages or contact real targets.
- Gemini calls run on the API server. If the provider is unavailable, the app returns
  a safe deterministic debrief instead of blocking the training flow.
- The mentor is restricted to defensive education and safe incident response.
  Conversation text is not stored; only response metadata is retained.

The UI is a responsive dark operations-console design, with reduced-motion support.
