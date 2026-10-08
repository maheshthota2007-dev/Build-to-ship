# 🛡️ CyberQuest AI

> **A defensive cybersecurity training arena powered by AI — learn, investigate, classify, and respond to realistic security scenarios in a safe environment.**

CyberQuest AI is an interactive cybersecurity learning platform designed to help students, developers, and security enthusiasts build practical defensive security skills.

Instead of simply reading cybersecurity theory, learners investigate fictional security incidents, identify evidence, classify threats, complete missions, earn XP, maintain streaks, and receive AI-guided explanations.

🔐 **Safe by design:** All scenarios are fictional and isolated. The platform does not target real systems, send real phishing emails, or interact with real-world targets.

---

## 🚀 Why CyberQuest AI?

Most cybersecurity learning platforms focus heavily on theory.

**CyberQuest AI focuses on learning by doing.**

Learners can:

- 🔎 Investigate realistic fictional security scenarios
- 🧠 Classify suspicious messages and security events
- 🧩 Identify important evidence and indicators
- 🤖 Receive AI-guided explanations and debriefs
- 🎯 Complete cybersecurity missions
- ⚡ Earn XP and maintain learning streaks
- 📊 Track category accuracy and learning progress
- 🏆 Compete on leaderboards
- 👨‍🏫 Ask the defensive AI mentor for guidance
- 🛠️ Allow administrators to create and manage missions

The goal is simple:

> **Turn cybersecurity knowledge into practical defensive decision-making skills.**

---

## ✨ Key Features

### 🧪 Interactive Cybersecurity Missions

Learners work through fictional security scenarios and make decisions based on evidence.

**Mission flow:**

`Scenario → Investigation → Evidence → Classification → Score → AI Debrief`

---

### 🤖 AI-Powered Security Mentor

The built-in mentor helps learners understand:

- Suspicious email indicators
- Defensive security concepts
- Incident response
- Security best practices
- Why a classification was correct or incorrect
- How to improve future decisions

AI responses are designed around **defensive education and safe incident response**.

---

### 📊 Learning & Progress Tracking

Track your cybersecurity learning journey with:

- XP
- Levels
- Learning streaks
- Mission completion
- Category accuracy
- Performance history
- Leaderboards

---

### 🏆 Gamified Cybersecurity Training

Turn learning into a progression system.

Earn XP → Complete missions → Improve accuracy → Build streaks → Climb the leaderboard.

---

### 🛡️ Security-First Architecture

CyberQuest AI was designed with security and separation of concerns in mind.

- HTTP-only signed session cookies
- Secure password hashing with bcrypt
- Server-side score calculation
- Server-side evidence validation
- Protected administrator routes
- Answer keys hidden from public mission responses
- AI calls executed server-side
- Defensive AI restrictions
- Safe deterministic fallback when AI is unavailable

---

## 🖥️ Platform

### Operations Console

CyberQuest AI uses a dark cybersecurity operations-console interface designed for an immersive security-training experience.

![CyberQuest AI Events Dashboard](./screenshots/events-dashboard.png)

The platform provides quick access to:

- Dashboard
- Cyber Events
- Learning
- Cybersecurity
- Programming
- Missions
- Coding Lab
- Projects
- AI Tutor
- Challenges
- Leaderboard

---

## 🎯 Cyber Events

The Events section provides a central place for upcoming cybersecurity activities.

Users can discover:

- 🧪 Security Labs
- 🚩 CTFs
- 🎓 Workshops
- 💻 Challenges
- 📡 Webinars
- 🛡️ Incident Response Drills
- 🏆 Hackathons
- 💼 Career Events

Events can be searched and filtered by category and timeframe.

---

## 🧠 Learning Experience

CyberQuest AI is designed around an active-learning model rather than passive content consumption.

### Learn

Understand the security concept.

### Investigate

Review the fictional scenario and available evidence.

### Decide

Classify the event based on the evidence.

### Analyze

Understand why the decision was correct or incorrect.

### Improve

Use the AI-guided debrief to strengthen your security reasoning.

---

## 🔐 Safety by Design

CyberQuest AI is intentionally built as a **defensive cybersecurity training platform**.

All security scenarios are fictional and isolated.

The platform:

- Does not send real phishing emails
- Does not contact real targets
- Does not attack external systems
- Uses reserved `.example` domains for fictional senders
- Displays links as inert text
- Keeps mission answer keys on protected administrator routes
- Calculates scores on the server
- Restricts the AI mentor to defensive education

This makes the platform suitable for **learning, demonstrations, academic projects, and cybersecurity training**.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────┐
│                 CyberQuest AI                │
├──────────────────────────────────────────────┤
│                                              │
│              React Web Application           │
│                       │                      │
│                       ▼                      │
│                API Server                   │
│                       │                      │
│          ┌────────────┼────────────┐        │
│          ▼            ▼            ▼        │
│     PostgreSQL     Gemini AI    Auth        │
│       Database      Service     / Sessions  │
│                                              │
└──────────────────────────────────────────────┘
