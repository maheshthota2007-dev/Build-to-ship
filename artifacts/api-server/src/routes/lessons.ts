import { and, asc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  coursesTable,
  db,
  learningProgressTable,
  lessonsTable,
  pool,
  usersTable,
} from "@workspace/db";
import { errorResponse } from "../lib/cyberquest";
import { optionalAuth, requireAuth } from "../middlewares/cyberquest-auth";

const router: IRouter = Router();

// -----------------------------------------------------------------------------
// Seed Courses
// -----------------------------------------------------------------------------
const SEED_COURSES = [
  {
    id: "python",
    slug: "python",
    name: "Python",
    category: "Programming",
    description: "Learn Python from fundamentals to real-world cybersecurity & backend programming.",
    difficulty: "Beginner",
    totalLessons: 10,
    active: true,
  },
  {
    id: "cpp",
    slug: "cpp",
    name: "C++",
    category: "Systems & Security",
    description: "Master memory management, pointers, OOP, and high-performance system structures.",
    difficulty: "Intermediate",
    totalLessons: 10,
    active: true,
  },
  {
    id: "javascript",
    slug: "javascript",
    name: "JavaScript",
    category: "Web & Security",
    description: "The language of the web. Build interactive fullstack security tools and apps.",
    difficulty: "Beginner",
    totalLessons: 10,
    active: true,
  },
  {
    id: "java",
    slug: "java",
    name: "Java",
    category: "Enterprise Security",
    description: "Object-oriented programming, concurrency patterns, and enterprise backend logic.",
    difficulty: "Intermediate",
    totalLessons: 10,
    active: true,
  },
  {
    id: "sql",
    slug: "sql",
    name: "SQL & Databases",
    category: "Databases",
    description: "Manage relational databases, write analytical queries, and practice secure data handling.",
    difficulty: "Beginner",
    totalLessons: 10,
    active: true,
  },
  {
    id: "c",
    slug: "c",
    name: "C & Systems Security",
    category: "Systems",
    description: "Low-level buffer handling, memory safety basics, and vulnerability mitigation.",
    difficulty: "Advanced",
    totalLessons: 10,
    active: true,
  },
  {
    id: "cybersecurity",
    slug: "cybersecurity",
    name: "Cybersecurity Fundamentals",
    category: "Cybersecurity",
    description: "Core principles of confidentiality, integrity, availability, threat modeling, and defensive controls.",
    difficulty: "Beginner",
    totalLessons: 10,
    active: true,
  },
];

// -----------------------------------------------------------------------------
// Seed Lessons (Python Track + Core Foundations)
// -----------------------------------------------------------------------------
const SEED_LESSONS = [
  // ----------------- PYTHON LESSONS -----------------
  {
    courseId: "python",
    slug: "python-01-intro",
    order: 1,
    title: "Introduction & Setup for Python",
    description: "Master Python's runtime architecture, virtual environments, and secure script execution fundamentals.",
    duration: 15,
    type: "Basics",
    objectives: [
      "Understand the Python execution model and bytecode compilation",
      "Configure isolated virtual environments using venv and pip hygiene",
      "Recognize dependency security risks such as typosquatting and supply chain poisoning",
      "Write and execute your first defensive telemetry script in Python",
    ],
    content: `# Lesson 01: Introduction & Setup for Python

Welcome to the **Python Track for Cybersecurity & Software Engineering**. Python has become the industry-standard language for security automation, malware analysis, network defense, penetration testing scripts, and cloud infrastructure operations.

---

### 1. The Python Execution Architecture
When you execute a Python script (\`.py\`), the runtime performs two primary stages:
1. **Compilation**: The source code is parsed into abstract syntax trees and compiled into platform-independent **bytecode** (\`.pyc\` files located inside \`__pycache__\`).
2. **Virtual Machine Execution**: The **Python Virtual Machine (PVM)** interprets the bytecode line-by-line and interacts with your operating system's underlying system calls.

\`\`\`python
# Example: Inspecting python runtime environment
import sys
import platform

print("Python Version:", platform.python_version())
print("Executable Path:", sys.executable)
print("Bytecode Magic Number:", sys.byteorder)
\`\`\`

---

### 2. Virtual Environments & Package Hygiene
Never install project packages into your system global Python environment. Always create an isolated virtual environment:

\`\`\`bash
# Create an isolated environment
python -m venv .venv

# Activate environment (Linux/macOS)
source .venv/bin/activate

# Activate environment (Windows PowerShell)
.\\.venv\\Scripts\\Activate.ps1
\`\`\`

### 3. Defensive Supply Chain Practices
- Always pin dependencies with exact hashes in \`requirements.txt\`.
- Use tools like \`pip-audit\` and \`safety\` to scan installed dependencies for known **CVEs (Common Vulnerabilities and Exposures)**.
- Avoid installing packages without verifying the exact spelling to protect against **typosquatting** attacks (e.g., \`reqeusts\` vs \`requests\`).

---

### Hands-on Exercise:
Review the basic script below that verifies system security properties and prints a greeting banner.`,
    starterCode: `import sys\nimport os\n\ndef main():\n    print("CYBERQUEST PYTHON ENVIRONMENT READY")\n    print(f"Platform: {sys.platform}")\n    print(f"Current User: {os.getlogin() if hasattr(os, 'getlogin') else 'security_operator'}")\n\nif __name__ == "__main__":\n    main()`,
    solutionCode: `import sys\nimport os\n\ndef main():\n    print("CYBERQUEST PYTHON ENVIRONMENT READY")\n    print(f"Platform: {sys.platform}")\n    print(f"Current User: {os.getlogin() if hasattr(os, 'getlogin') else 'security_operator'}")\n\nif __name__ == "__main__":\n    main()`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-02-variables",
    order: 2,
    title: "Variables, Memory & Data Types",
    description: "Deep dive into variable references, primitive data types, binary byte manipulation, and type-confusion defense.",
    duration: 20,
    type: "Hands-on Lab",
    objectives: [
      "Understand Python variables as labeled references rather than fixed memory buckets",
      "Work with primitive types: int, float, str, bytes, and bool",
      "Distinguish Unicode strings from raw binary byte sequences for network payloads",
      "Apply defensive type validation and prevent type-confusion vulnerabilities",
    ],
    content: `# Lesson 02: Variables, Memory & Data Types

In Python, variables are **labels (names) bound to memory objects**, not static memory slots. When you write \`x = 10\`, Python allocates an integer object \`10\` on the heap and points the name \`x\` to it.

---

### 1. Primitive Types in Python
Python provides powerful built-in primitive types:
- **int**: Arbitrary precision integers (no integer overflow vulnerabilities like in C/C++).
- **float**: Double-precision 64-bit IEEE 754 floating point numbers.
- **bool**: Boolean subtype of integer (\`True\` or \`False\`).
- **str**: Immutable sequence of Unicode code points.
- **bytes**: Immutable sequence of raw 8-bit bytes (\`0x00\` to \`0xFF\`).

\`\`\`python
# Variables & References
target_host = "192.168.1.100"   # str (Unicode)
target_port = 443               # int
is_secure = True                # bool
response_time = 0.042           # float

# Checking object identity in memory
print(id(target_host))          # Memory address of the object
print(type(target_host))        # <class 'str'>
\`\`\`

---

### 2. Strings vs Raw Bytes in Cybersecurity
In cybersecurity engineering, the distinction between \`str\` and \`bytes\` is paramount:
- \`str\` is for human-readable text.
- \`bytes\` is for network packet payloads, cryptographic hashes, encrypted ciphers, and raw socket buffers.

\`\`\`python
# Converting text to bytes (encoding)
raw_payload = "SECRET_TOKEN_4492".encode("utf-8")
print(raw_payload)          # b'SECRET_TOKEN_4492'
print(type(raw_payload))     # <class 'bytes'>

# Converting network bytes back to text (decoding)
decoded_text = raw_payload.decode("utf-8")
print(decoded_text)         # 'SECRET_TOKEN_4492'
\`\`\`

---

### 3. Defensive Type Checking
Type confusion occurs when an untrusted input is passed to an operation expecting a different data type. Always enforce validation:

\`\`\`python
def inspect_port(port: int) -> bool:
    if not isinstance(port, int):
        raise TypeError("Port number must be a valid integer.")
    if not (1 <= port <= 65535):
        raise ValueError("Port number must be between 1 and 65535.")
    return True
\`\`\`

---

### Hands-on Exercise:
Examine the variable transformations and execute the code to observe how string tokens convert to cryptographic hash buffers.`,
    starterCode: `def analyze_payload():\n    session_token = "admin_auth_9982"\n    token_bytes = session_token.encode("utf-8")\n    \n    print(f"Token string length: {len(session_token)}")\n    print(f"Token byte length: {len(token_bytes)}")\n    print(f"Raw byte representation: {token_bytes.hex()}")\n\nif __name__ == "__main__":\n    analyze_payload()`,
    solutionCode: `def analyze_payload():\n    session_token = "admin_auth_9982"\n    token_bytes = session_token.encode("utf-8")\n    \n    print(f"Token string length: {len(session_token)}")\n    print(f"Token byte length: {len(token_bytes)}")\n    print(f"Raw byte representation: {token_bytes.hex()}")\n\nif __name__ == "__main__":\n    analyze_payload()`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-03-control-flow",
    order: 3,
    title: "Control Flow & Conditionals",
    description: "Logical branching, short-circuit evaluation, structural pattern matching, and secure authorization guards.",
    duration: 20,
    type: "Hands-on Lab",
    objectives: [
      "Master if, elif, and else conditional decision structures",
      "Understand short-circuit boolean evaluation and side effects",
      "Utilize Python 3.10+ structural pattern matching (match/case) for protocol dispatch",
      "Avoid logic flaws and race conditions in security authorization checks",
    ],
    content: `# Lesson 03: Control Flow & Conditionals

Control flow structures dictate the execution path of your applications. In defensive security tools, flawed conditional branches are one of the most common sources of bypass vulnerabilities (such as privilege escalation and authentication bypass).

---

### 1. Conditional Branching
Use \`if\`, \`elif\`, and \`else\` to evaluate conditions:

\`\`\`python
def check_firewall_rule(ip_address: str, port: int, is_authenticated: bool) -> str:
    # Fail-closed default: evaluate most restrictive checks first
    if not is_authenticated:
        return "DENY: Unauthenticated request."
    
    if port == 22:
        return "ALLOW: Secure Shell (SSH) connection authorized."
    elif port in (80, 443):
        return "ALLOW: Web traffic authorized."
    else:
        return "DENY: Port blocked by perimeter policy."
\`\`\`

---

### 2. Short-Circuit Evaluation
In Python, \`and\` and \`or\` expressions evaluate lazily from left to right:
- \`A and B\`: If \`A\` is falsy, Python immediately returns \`A\` without evaluating \`B\`.
- \`A or B\`: If \`A\` is truthy, Python immediately returns \`A\` without evaluating \`B\`.

Use this defensive property to protect against \`None\` references:
\`\`\`python
user = None
# Safe because user is checked before accessing attribute:
if user is not None and user.is_admin:
    print("Welcome Admin")
\`\`\`

---

### 3. Structural Pattern Matching
Python 3.10 introduced \`match\` and \`case\` for expressive, clean protocol dispatching:

\`\`\`python
def handle_incident_severity(level: str):
    match level.upper():
        case "LOW":
            return "Log to SIEM for review."
        case "MEDIUM":
            return "Create Tier 1 analyst investigation ticket."
        case "HIGH" | "CRITICAL":
            return "TRIGGER PAGERDUTY: Immediate SOC triage."
        case _:
            return "UNKNOWN: Unrecognized severity indicator."
\`\`\`

---

### Hands-on Exercise:
Implement the security gate function below and test various IP and role scenarios.`,
    starterCode: `def verify_access(role: str, mfa_enabled: bool) -> str:\n    if role == "admin" and not mfa_enabled:\n        return "DENIED: Admin accounts require MFA."\n    elif role in ("admin", "analyst") and mfa_enabled:\n        return "GRANTED: Secure workstation access permitted."\n    else:\n        return "DENIED: Insufficient credentials."\n\nprint(verify_access("admin", False))\nprint(verify_access("analyst", True))`,
    solutionCode: `def verify_access(role: str, mfa_enabled: bool) -> str:\n    if role == "admin" and not mfa_enabled:\n        return "DENIED: Admin accounts require MFA."\n    elif role in ("admin", "analyst") and mfa_enabled:\n        return "GRANTED: Secure workstation access permitted."\n    else:\n        return "DENIED: Insufficient credentials."\n\nprint(verify_access("admin", False))\nprint(verify_access("analyst", True))`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-04-functions",
    order: 4,
    title: "Functions & Scope Management",
    description: "Write clean, reusable functions with type annotations, understand LEGB scope, and prevent mutable default vulnerabilities.",
    duration: 20,
    type: "Hands-on Lab",
    objectives: [
      "Define modular functions with Python typing signatures",
      "Understand variable scope resolution: Local, Enclosing, Global, Built-in (LEGB)",
      "Eliminate the critical mutable default argument vulnerability (def fn(items=[]))",
      "Implement pure, deterministic functions for auditable security checks",
    ],
    content: `# Lesson 04: Functions & Scope Management

Functions encapsulate discrete operations, making your codebase modular, maintainable, and verifiable. In security software, writing predictable functions with explicit inputs and outputs minimizes attack surface.

---

### 1. Function Signatures & Type Hints
Always use explicit type annotations:

\`\`\`python
from typing import Optional

def calculate_risk_score(cve_score: float, exploit_available: bool) -> float:
    base = cve_score
    if exploit_available:
        base *= 1.25
    return round(min(10.0, base), 2)
\`\`\`

---

### 2. Variable Scope (LEGB Rule)
When Python encounters a variable name, it searches four scopes in order:
1. **L**ocal: Inside the current function.
2. **E**nclosing: Any enclosing nested functions (closures).
3. **G**lobal: Module-level variables.
4. **B**uilt-in: Python built-in namespace (\`len\`, \`range\`, etc.).

---

### 3. Critical Security Pitfall: Mutable Default Arguments
In Python, default parameter expressions are evaluated **once at function definition time**, not when the function is called!

\`\`\`python
# VULNERABLE: The list persists across different callers!
def log_event_flawed(event_name: str, tags: list = []):
    tags.append(event_name)
    return tags

# SECURE: Always use None and create a new list inside:
def log_event_secure(event_name: str, tags: Optional[list] = None):
    if tags is None:
        tags = []
    tags.append(event_name)
    return tags
\`\`\`

---

### Hands-on Exercise:
Execute the function below and observe how defensive scope handling isolates sensitive variables.`,
    starterCode: `def sanitize_header(header_name: str) -> str:\n    # Strip dangerous carriage returns and whitespace\n    cleaned = header_name.strip().replace("\\r", "").replace("\\n", "")\n    return cleaned.upper()\n\nprint("Sanitized:", sanitize_header("  x-forwarded-for\\r\\n  "))`,
    solutionCode: `def sanitize_header(header_name: str) -> str:\n    cleaned = header_name.strip().replace("\\r", "").replace("\\n", "")\n    return cleaned.upper()\n\nprint("Sanitized:", sanitize_header("  x-forwarded-for\\r\\n  "))`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-05-data-structures",
    order: 5,
    title: "Data Structures & Collections",
    description: "Harness lists, tuples, dictionaries, and sets for rapid log parsing, IOC deduplication, and telemetry modeling.",
    duration: 25,
    type: "Hands-on Lab",
    objectives: [
      "Select optimal data structures based on time complexity and mutability",
      "Utilize sets for O(1) deduplication of Indicators of Compromise (IOCs)",
      "Safe dictionary lookups using .get() and defaultdict to prevent unhandled exceptions",
      "Model structured security log records with typed dictionaries and tuples",
    ],
    content: `# Lesson 05: Data Structures & Collections

Security analysts and engineers process large volumes of security telemetry every second. Understanding data structures ensures your analysis tools run efficiently and without unexpected crashes.

---

### 1. The Core Four Data Structures
- **List** (\`[]\`): Ordered, mutable collection. Ideal for sequential event streams.
- **Tuple** (\`()\`): Ordered, **immutable** collection. Ideal for fixed records (e.g. \`(ip, port, protocol)\`).
- **Dictionary** (\`{}\`): Key-value mappings with O(1) lookup.
- **Set** (\`set()\`) / (\`{a, b}\`): Unordered collection of unique items with O(1) membership testing.

---

### 2. High-Speed IOC Deduplication with Sets
When checking whether an IP is in a blacklist of 1,000,000 entries:
- Checking in a \`list\` takes **O(n)** time (slow linear search).
- Checking in a \`set\` takes **O(1)** time (instant hash table lookup).

\`\`\`python
malicious_ips = {"198.51.100.12", "203.0.113.88", "192.0.2.45"}

incoming_ip = "198.51.100.12"
if incoming_ip in malicious_ips:
    print(f"ALERT: Detected communication with malicious IP {incoming_ip}")
\`\`\`

---

### 3. Safe Dictionary Lookups
Avoid accessing keys with \`dict[key]\` if the key might not exist; instead use \`.get(key, default)\`:

\`\`\`python
log_entry = {"timestamp": "2026-10-08T00:00:00Z", "action": "LOGIN"}

# Will NOT raise KeyError:
user_agent = log_entry.get("user_agent", "UNKNOWN_CLIENT")
\`\`\`

---

### Hands-on Exercise:
Process the log entries below and aggregate blocked IP frequencies.`,
    starterCode: `def parse_threat_feed():\n    feed = [\n        {"ip": "10.0.0.5", "action": "BLOCKED"},\n        {"ip": "10.0.0.8", "action": "ALLOWED"},\n        {"ip": "10.0.0.5", "action": "BLOCKED"},\n    ]\n    blocked_ips = set()\n    for item in feed:\n        if item.get("action") == "BLOCKED":\n            blocked_ips.add(item["ip"])\n    return blocked_ips\n\nprint("Unique Blocked IPs:", parse_threat_feed())`,
    solutionCode: `def parse_threat_feed():\n    feed = [\n        {"ip": "10.0.0.5", "action": "BLOCKED"},\n        {"ip": "10.0.0.8", "action": "ALLOWED"},\n        {"ip": "10.0.0.5", "action": "BLOCKED"},\n    ]\n    blocked_ips = set()\n    for item in feed:\n        if item.get("action") == "BLOCKED":\n            blocked_ips.add(item["ip"])\n    return blocked_ips\n\nprint("Unique Blocked IPs:", parse_threat_feed())`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-06-input-validation",
    order: 6,
    title: "Input Validation & Defensive Coding",
    description: "Neutralize command injection, path traversal, and ReDoS attacks using strict allowlists and safe parameterization.",
    duration: 25,
    type: "Hands-on Lab",
    objectives: [
      "Implement strict allowlist validation for untrusted inputs",
      "Prevent shell command injection when calling system utilities (subprocess)",
      "Sanitize inputs using shlex.quote and avoid shell=True",
      "Defend against Regular Expression Denial of Service (ReDoS)",
    ],
    content: `# Lesson 06: Input Validation & Defensive Coding

Never trust user input. Whether data arrives from an HTTP request, a CLI argument, a file upload, or an external API, assume it is potentially hostile.

---

### 1. Allowlist vs Denylist Validation
Denylists (attempting to block known bad characters) always fail because attackers use novel encodings. **Always use an allowlist** (specifying exactly what is permitted).

\`\`\`python
import re

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{3,20}$")

def is_valid_username(name: str) -> bool:
    return bool(USERNAME_PATTERN.match(name))
\`\`\`

---

### 2. Preventing Command Injection
Never concatenate untrusted input into shell commands:

\`\`\`python
import subprocess
import shlex

# VULNERABLE:
# host = "127.0.0.1; rm -rf /"
# subprocess.run(f"ping -c 1 {host}", shell=True)

# SECURE: Pass arguments as an array and disable the shell!
def safe_ping(target_host: str):
    # Verify input format first
    if not re.match(r"^[a-zA-Z0-9.-]+$", target_host):
        raise ValueError("Invalid target hostname format.")
    
    # Run directly without shell execution
    return subprocess.run(["ping", "-c", "1", target_host], capture_output=True, text=True)
\`\`\`

---

### Hands-on Exercise:
Validate user-provided file names to ensure they contain only alphanumeric characters and safe extensions.`,
    starterCode: `import re\n\ndef validate_filename(filename: str) -> bool:\n    # Allow alphanumeric, underscores, hyphens, and .txt / .log extensions\n    pattern = r"^[a-zA-Z0-9_-]+\\.(txt|log|json)$"\n    return bool(re.match(pattern, filename))\n\ntests = ["audit_2026.log", "../etc/passwd", "report-final.json", "payload;rm -rf.txt"]\nfor t in tests:\n    print(f"{t}: {'SAFE' if validate_filename(t) else 'REJECTED'}")`,
    solutionCode: `import re\n\ndef validate_filename(filename: str) -> bool:\n    pattern = r"^[a-zA-Z0-9_-]+\\.(txt|log|json)$"\n    return bool(re.match(pattern, filename))\n\ntests = ["audit_2026.log", "../etc/passwd", "report-final.json", "payload;rm -rf.txt"]\nfor t in tests:\n    print(f"{t}: {'SAFE' if validate_filename(t) else 'REJECTED'}")`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-07-error-handling",
    order: 7,
    title: "Error Handling & Exception Recovery",
    description: "Write robust try-except-finally blocks, prevent sensitive information disclosure, and ensure fail-closed security.",
    duration: 20,
    type: "Hands-on Lab",
    objectives: [
      "Structure granular try, except, else, and finally blocks",
      "Avoid catching generic Exception or bare except: clauses",
      "Prevent stack trace leaks and internal path disclosure in production",
      "Implement fail-closed exception handling in security controls",
    ],
    content: `# Lesson 07: Error Handling & Exception Recovery

Uncaught exceptions cause service crashes, Denial of Service (DoS), and information leakage (e.g., database table names and stack traces exposed to attackers).

---

### 1. Granular Exception Handling
Catch specific exception types rather than blanket catching:

\`\`\`python
def read_security_config(file_path: str):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        print("Config file not found. Loading safe defaults.")
        return {}
    except PermissionError:
        print("Security Alert: Insufficient filesystem permissions.")
        raise
    except UnicodeDecodeError:
        print("Corrupt configuration encoding.")
        return {}
\`\`\`

---

### 2. Fail-Closed Pattern
In security authorization checks, if an error occurs, the result must **fail closed** (deny access):

\`\`\`python
def authorize_transaction(account_id: str) -> bool:
    try:
        return query_fraud_service(account_id)
    except Exception as e:
        # Log internal error safely for developers
        audit_log.error(f"Fraud check failed: {type(e).__name__}")
        # Always return False (fail closed)
        return False
\`\`\`

---

### Hands-on Exercise:
Examine the safe error handling below and verify graceful recovery.`,
    starterCode: `def parse_int_safe(val: str, default: int = 0) -> int:\n    try:\n        return int(val)\n    except (ValueError, TypeError):\n        return default\n\nprint("Valid:", parse_int_safe("42"))\nprint("Invalid:", parse_int_safe("malicious_string", default=1))`,
    solutionCode: `def parse_int_safe(val: str, default: int = 0) -> int:\n    try:\n        return int(val)\n    except (ValueError, TypeError):\n        return default\n\nprint("Valid:", parse_int_safe("42"))\nprint("Invalid:", parse_int_safe("malicious_string", default=1))`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-08-file-io",
    order: 8,
    title: "File I/O & Serialization Safety",
    description: "Safely read and write files using context managers, neutralize path traversal with pathlib, and avoid unsafe pickle usage.",
    duration: 25,
    type: "Hands-on Lab",
    objectives: [
      "Execute file operations with context managers (with open(...))",
      "Prevent Path Traversal (../../) using pathlib.Path.resolve()",
      "Understand why pickle is dangerous and use json or yaml.safe_load",
      "Manage file permissions and temporary files securely (tempfile)",
    ],
    content: `# Lesson 08: File I/O & Serialization Safety

File operations and serialization are among the most exploited vectors in application security. Flaws can lead to arbitrary file overwrite, credential theft, and remote code execution (RCE).

---

### 1. Defending Against Path Traversal
Attackers often pass \`../../../../etc/passwd\` to download sensitive files. Always canonicalize paths:

\`\`\`python
from pathlib import Path

BASE_DIRECTORY = Path("/var/cyberquest/reports").resolve()

def get_report_path(user_filename: str) -> Path:
    # Resolve the full canonical path
    candidate_path = (BASE_DIRECTORY / user_filename).resolve()
    
    # Verify the target resides STRICTLY inside the base directory
    if not candidate_path.is_relative_to(BASE_DIRECTORY):
        raise PermissionError("Path traversal attack detected!")
    
    return candidate_path
\`\`\`

---

### 2. The Danger of \`pickle\` (Remote Code Execution)
Never unpickle untrusted data! Python's \`pickle\` executes arbitrary code during deserialization via \`__reduce__\`. Always use secure formats like **JSON**:

\`\`\`python
import json

# Safe Serialization:
payload_json = json.dumps({"user": "analyst", "role": "operator"})
data = json.loads(payload_json)
\`\`\`

---

### Hands-on Exercise:
Verify the path sandbox check in the sample code.`,
    starterCode: `from pathlib import Path\n\ndef is_safe_path(base: Path, target: str) -> bool:\n    try:\n        resolved = (base / target).resolve()\n        return resolved.is_relative_to(base.resolve())\n    except (ValueError, Exception):\n        return False\n\nbase = Path("/app/data")\nprint("report.txt:", is_safe_path(base, "report.txt"))\nprint("../etc/shadow:", is_safe_path(base, "../etc/shadow"))`,
    solutionCode: `from pathlib import Path\n\ndef is_safe_path(base: Path, target: str) -> bool:\n    try:\n        resolved = (base / target).resolve()\n        return resolved.is_relative_to(base.resolve())\n    except (ValueError, Exception):\n        return False\n\nbase = Path("/app/data")\nprint("report.txt:", is_safe_path(base, "report.txt"))\nprint("../etc/shadow:", is_safe_path(base, "../etc/shadow"))`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-09-oop",
    order: 9,
    title: "Object-Oriented Design Patterns",
    description: "Build robust security frameworks using classes, encapsulation, abstract interfaces, and immutable dataclasses.",
    duration: 25,
    type: "Hands-on Lab",
    objectives: [
      "Structure security modules using classes and data encapsulation",
      "Implement inheritance and abstract base classes for security detectors",
      "Leverage immutable dataclasses (frozen=True) for tamper-evident audit records",
      "Protect sensitive properties using getters and private attributes",
    ],
    content: `# Lesson 09: Object-Oriented Design Patterns

Object-Oriented Programming (OOP) allows you to model complex security systems, such as SIEM detection rules, incident trackers, and network packet analyzers, into clean, extensible components.

---

### 1. Immutable Dataclasses for Audit Logs
Security records should not be modified once created. Use \`dataclass(frozen=True)\`:

\`\`\`python
from dataclasses import dataclass
from datetime import datetime

@dataclass(frozen=True)
class SecurityEvent:
    event_id: str
    source_ip: str
    severity: str
    timestamp: str = datetime.utcnow().isoformat()

event = SecurityEvent("EVT-101", "10.0.4.12", "HIGH")
# event.severity = "LOW" -> Raises FrozenInstanceError!
\`\`\`

---

### 2. Abstract Base Classes for Security Scanners
Create extensible scanner interfaces:

\`\`\`python
from abc import ABC, abstractmethod

class BaseVulnerabilityScanner(ABC):
    @abstractmethod
    def scan_target(self, target: str) -> list[str]:
        pass

class PortScanner(BaseVulnerabilityScanner):
    def scan_target(self, target: str) -> list[str]:
        # Implementation logic
        return ["Open ports: 80, 443"]
\`\`\`

---

### Hands-on Exercise:
Run the sample security event aggregator class.`,
    starterCode: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass ThreatAlert:\n    rule_id: str\n    threat_name: str\n    score: int\n\nalert = ThreatAlert("SIG-001", "Suspicious PowerShell Execution", 85)\nprint(f"Alert {alert.rule_id}: {alert.threat_name} (Score: {alert.score})")`,
    solutionCode: `from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass ThreatAlert:\n    rule_id: str\n    threat_name: str\n    score: int\n\nalert = ThreatAlert("SIG-001", "Suspicious PowerShell Execution", 85)\nprint(f"Alert {alert.rule_id}: {alert.threat_name} (Score: {alert.score})")`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "python",
    slug: "python-10-concurrency",
    order: 10,
    title: "Concurrency & Advanced Architectures",
    description: "Build high-speed asynchronous network tools with asyncio, understand the GIL, and prevent race conditions.",
    duration: 30,
    type: "Hands-on Lab",
    objectives: [
      "Understand concurrency models: threading, multiprocessing, and asyncio",
      "Build a high-performance asynchronous port scanner using asyncio",
      "Avoid race conditions using synchronization primitives (asyncio.Lock)",
      "Manage timeouts defensively to prevent resource starvation",
    ],
    content: `# Lesson 10: Concurrency & Advanced Architectures

Scanning 65,535 ports or analyzing millions of network packets sequentially would take hours. Concurrency allows security tools to handle thousands of operations concurrently in seconds.

---

### 1. \`asyncio\` for Network Security
Because network operations spend most of their time waiting for packet responses (I/O bound), Python's event loop (\`asyncio\`) is extraordinarily fast:

\`\`\`python
import asyncio

async def scan_port(host: str, port: int) -> bool:
    try:
        # Connect with a strict 1-second timeout
        conn = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(conn, timeout=1.0)
        writer.close()
        await writer.wait_closed()
        return True
    except (asyncio.TimeoutError, ConnectionRefusedError, OSError):
        return False

async def main():
    target = "scanme.nmap.org"
    ports = [21, 22, 80, 443, 8080]
    tasks = [scan_port(target, p) for p in ports]
    results = await asyncio.gather(*tasks)
    for port, is_open in zip(ports, results):
        if is_open:
            print(f"[+] Port {port} is OPEN on {target}")
\`\`\`

---

### 2. Thread Safety and Locks
When multiple concurrent workers write to shared telemetry state, use locks to prevent race condition corruption:

\`\`\`python
lock = asyncio.Lock()
alert_counter = 0

async def record_alert():
    global alert_counter
    async with lock:
        alert_counter += 1
\`\`\`

---

### Hands-on Exercise:
Congratulations on reaching the final lesson of the Python Track! Execute the asynchronous worker pattern below.`,
    starterCode: `import asyncio\n\nasync def check_service(name: str, delay: float):\n    await asyncio.sleep(delay)\n    return f"{name}: HEALTHY"\n\nasync def run_checks():\n    results = await asyncio.gather(\n        check_service("Firewall Sensor", 0.1),\n        check_service("SIEM Pipeline", 0.2),\n        check_service("EDR Agent", 0.15)\n    )\n    for r in results:\n        print(r)\n\nasyncio.run(run_checks())`,
    solutionCode: `import asyncio\n\nasync def check_service(name: str, delay: float):\n    await asyncio.sleep(delay)\n    return f"{name}: HEALTHY"\n\nasync def run_checks():\n    results = await asyncio.gather(\n        check_service("Firewall Sensor", 0.1),\n        check_service("SIEM Pipeline", 0.2),\n        check_service("EDR Agent", 0.15)\n    )\n    for r in results:\n        print(r)\n\nasyncio.run(run_checks())`,
    xpReward: 50,
    active: true,
  },

  // ----------------- FOUNDATIONAL LESSONS FOR OTHER TRACKS -----------------
  {
    courseId: "cpp",
    slug: "cpp-01-intro",
    order: 1,
    title: "Introduction & Memory Safety in C++",
    description: "Explore compilation, pointer primitives, buffer management, and modern C++ RAII safety.",
    duration: 20,
    type: "Basics",
    objectives: [
      "Understand the C++ compilation pipeline and linkers",
      "Differentiate stack versus heap memory allocation",
      "Understand pointer semantics and memory address references",
      "Apply RAII (Resource Acquisition Is Initialization) to avoid leaks",
    ],
    content: `# Introduction & Memory Safety in C++\n\nC++ provides direct hardware access and deterministic performance. However, manual memory management introduces vulnerabilities such as buffer overflows and use-after-free. Modern C++ emphasizes smart pointers and RAII to build secure, high-performance systems.`,
    starterCode: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "C++ Systems Environment Initialized" << endl;\n    return 0;\n}`,
    solutionCode: `#include <iostream>\nusing namespace std;\nint main() {\n    cout << "C++ Systems Environment Initialized" << endl;\n    return 0;\n}`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "javascript",
    slug: "javascript-01-intro",
    order: 1,
    title: "Introduction & Modern JavaScript Runtime",
    description: "V8 engine architecture, asynchronous event loop, and secure DOM manipulation.",
    duration: 15,
    type: "Basics",
    objectives: [
      "Understand the V8 JavaScript engine and event loop",
      "Work with modern ES6+ features, let/const, and arrow functions",
      "Avoid prototype pollution vulnerabilities",
      "Handle asynchronous promises and async/await cleanly",
    ],
    content: `# Introduction & Modern JavaScript Runtime\n\nJavaScript powers both client-side interfaces and backend Node.js microservices. In cybersecurity, understanding JavaScript is essential for finding and fixing Cross-Site Scripting (XSS), prototype pollution, and SSRF flaws.`,
    starterCode: `function main() {\n    console.log("JavaScript Runtime Initialized");\n}\nmain();`,
    solutionCode: `function main() {\n    console.log("JavaScript Runtime Initialized");\n}\nmain();`,
    xpReward: 50,
    active: true,
  },
  {
    courseId: "cybersecurity",
    slug: "cybersecurity-01-intro",
    order: 1,
    title: "CIA Triad & Core Security Principles",
    description: "Master Confidentiality, Integrity, Availability, threat modeling, and defense-in-depth.",
    duration: 15,
    type: "Basics",
    objectives: [
      "Analyze confidentiality, integrity, and availability trade-offs",
      "Understand defense-in-depth and zero-trust architecture",
      "Identify common threat actor vectors and attack surfaces",
      "Implement baseline defensive controls and audit trails",
    ],
    content: `# CIA Triad & Core Security Principles\n\nThe CIA triad forms the cornerstone of cybersecurity architecture:\n- **Confidentiality**: Ensuring data is accessible only to authorized entities.\n- **Integrity**: Protecting data and systems from unauthorized tampering.\n- **Availability**: Guaranteeing systems and services remain operational when needed.`,
    starterCode: `print("Security Principles Lab Active")`,
    solutionCode: `print("Security Principles Lab Active")`,
    xpReward: 50,
    active: true,
  },
];

let initPromise: Promise<void> | undefined;

async function ensureLessonsTableAndSeeds(): Promise<void> {
  initPromise ??= (async () => {
    // 1. Create tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cyberquest_courses (
        id TEXT PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'Programming',
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'Beginner',
        total_lessons INTEGER NOT NULL DEFAULT 10,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cyberquest_lessons (
        id SERIAL PRIMARY KEY,
        course_id TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        "order" INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL DEFAULT 20,
        type TEXT NOT NULL DEFAULT 'Hands-on Lab',
        objectives TEXT[] NOT NULL DEFAULT '{}',
        content TEXT NOT NULL,
        starter_code TEXT,
        solution_code TEXT,
        xp_reward INTEGER NOT NULL DEFAULT 50,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT cyberquest_course_lesson_order_unique UNIQUE (course_id, "order")
      );

      CREATE TABLE IF NOT EXISTS cyberquest_learning_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES cyberquest_users(id) ON DELETE CASCADE,
        item_id TEXT NOT NULL,
        item_type TEXT NOT NULL,
        status TEXT NOT NULL,
        score INTEGER DEFAULT 0,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT cyberquest_user_item_unique UNIQUE (user_id, item_id, item_type)
      );
    `);

    // 2. Seed courses if empty
    const existingCourses = await db.select({ id: coursesTable.id }).from(coursesTable).limit(1);
    if (existingCourses.length === 0) {
      for (const course of SEED_COURSES) {
        await db.insert(coursesTable).values(course).onConflictDoNothing();
      }
    }

    // 3. Seed lessons if empty
    const existingLessons = await db.select({ id: lessonsTable.id }).from(lessonsTable).limit(1);
    if (existingLessons.length === 0) {
      for (const lesson of SEED_LESSONS) {
        await db.insert(lessonsTable).values(lesson).onConflictDoNothing();
      }
    }
  })().catch((err) => {
    initPromise = undefined;
    console.error("Failed to ensure lessons table & seeds:", err);
    throw err;
  });

  return initPromise;
}

// -----------------------------------------------------------------------------
// GET /courses - List all courses with lesson count and progress
// -----------------------------------------------------------------------------
router.get("/courses", optionalAuth, async (req, res): Promise<void> => {
  await ensureLessonsTableAndSeeds();

  const courses = await db.select().from(coursesTable).where(eq(coursesTable.active, true));
  const userId = req.cyberquestUser?.userId;

  let progressMap = new Map<string, number>();
  if (userId) {
    const userProgress = await db
      .select({ itemId: learningProgressTable.itemId, status: learningProgressTable.status })
      .from(learningProgressTable)
      .where(and(
        eq(learningProgressTable.userId, userId),
        eq(learningProgressTable.itemType, "lesson"),
        eq(learningProgressTable.status, "COMPLETED")
      ));
    
    for (const p of userProgress) {
      // itemId is lesson slug or course-prefixed
      const coursePrefix = p.itemId.split("-")[0];
      progressMap.set(coursePrefix, (progressMap.get(coursePrefix) || 0) + 1);
    }
  }

  const result = courses.map((c) => {
    const completedCount = progressMap.get(c.id) || 0;
    const prog = c.totalLessons > 0 ? Math.round((completedCount / c.totalLessons) * 100) : 0;
    return {
      ...c,
      completedLessons: completedCount,
      prog,
    };
  });

  res.json({ success: true, data: result });
});

// -----------------------------------------------------------------------------
// GET /courses/:courseId/lessons - Get all lessons for a specific course
// -----------------------------------------------------------------------------
router.get("/courses/:courseId/lessons", optionalAuth, async (req, res): Promise<void> => {
  await ensureLessonsTableAndSeeds();

  const courseIdParam = req.params.courseId;
  const courseId = Array.isArray(courseIdParam) ? courseIdParam[0] : courseIdParam;

  const lessons = await db
    .select()
    .from(lessonsTable)
    .where(and(eq(lessonsTable.courseId, courseId), eq(lessonsTable.active, true)))
    .orderBy(asc(lessonsTable.order));

  const userId = req.cyberquestUser?.userId;
  let userProgressRecords: Array<{ itemId: string; status: string }> = [];

  if (userId) {
    userProgressRecords = await db
      .select({
        itemId: learningProgressTable.itemId,
        status: learningProgressTable.status,
      })
      .from(learningProgressTable)
      .where(and(
        eq(learningProgressTable.userId, userId),
        eq(learningProgressTable.itemType, "lesson")
      ));
  }

  const statusMap = new Map<string, string>();
  for (const r of userProgressRecords) {
    statusMap.set(r.itemId, r.status);
  }

  const processedLessons = lessons.map((l, index) => {
    // Check if recorded in db
    let status = statusMap.get(l.slug) || statusMap.get(String(l.id));

    // Default: for demo/guest/new users, Lesson 1 is completed by default to showcase review mode,
    // subsequent lessons are NOT_STARTED unless user started/completed them
    if (!status) {
      if (index === 0) {
        status = "COMPLETED";
      } else {
        status = "NOT_STARTED";
      }
    }

    return {
      id: l.id,
      courseId: l.courseId,
      slug: l.slug,
      order: l.order,
      title: l.title,
      description: l.description,
      duration: l.duration,
      type: l.type,
      objectives: l.objectives,
      xpReward: l.xpReward,
      status, // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
    };
  });

  res.json({
    success: true,
    data: {
      courseId,
      total: processedLessons.length,
      lessons: processedLessons,
    },
  });
});

// -----------------------------------------------------------------------------
// GET /lessons/:lessonId - Get single lesson details with navigation
// -----------------------------------------------------------------------------
router.get("/lessons/:lessonId", optionalAuth, async (req, res): Promise<void> => {
  await ensureLessonsTableAndSeeds();

  const lessonIdParam = req.params.lessonId;
  const paramVal = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam;

  let lesson: any = null;
  const numericId = parseInt(paramVal, 10);

  if (!isNaN(numericId)) {
    const [found] = await db
      .select()
      .from(lessonsTable)
      .where(and(eq(lessonsTable.id, numericId), eq(lessonsTable.active, true)))
      .limit(1);
    lesson = found;
  }

  if (!lesson) {
    const [found] = await db
      .select()
      .from(lessonsTable)
      .where(and(eq(lessonsTable.slug, paramVal), eq(lessonsTable.active, true)))
      .limit(1);
    lesson = found;
  }

  if (!lesson) {
    errorResponse(res, 404, "LESSON_NOT_FOUND", "The requested lesson could not be found.");
    return;
  }

  // Find course info
  const [course] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, lesson.courseId))
    .limit(1);

  // Find user progress
  const userId = req.cyberquestUser?.userId;
  let status = "NOT_STARTED";

  if (userId) {
    const [p] = await db
      .select()
      .from(learningProgressTable)
      .where(and(
        eq(learningProgressTable.userId, userId),
        eq(learningProgressTable.itemId, lesson.slug),
        eq(learningProgressTable.itemType, "lesson")
      ))
      .limit(1);
    if (p) {
      status = p.status;
    } else if (lesson.order === 1) {
      status = "COMPLETED";
    }
  } else if (lesson.order === 1) {
    status = "COMPLETED";
  }

  // Find previous and next lessons in this course
  const [prevLesson] = await db
    .select({ id: lessonsTable.id, slug: lessonsTable.slug, order: lessonsTable.order, title: lessonsTable.title })
    .from(lessonsTable)
    .where(and(eq(lessonsTable.courseId, lesson.courseId), eq(lessonsTable.order, lesson.order - 1), eq(lessonsTable.active, true)))
    .limit(1);

  const [nextLesson] = await db
    .select({ id: lessonsTable.id, slug: lessonsTable.slug, order: lessonsTable.order, title: lessonsTable.title })
    .from(lessonsTable)
    .where(and(eq(lessonsTable.courseId, lesson.courseId), eq(lessonsTable.order, lesson.order + 1), eq(lessonsTable.active, true)))
    .limit(1);

  res.json({
    success: true,
    data: {
      ...lesson,
      status,
      course: course || { id: lesson.courseId, name: lesson.courseId.toUpperCase() },
      previousLesson: prevLesson || null,
      nextLesson: nextLesson || null,
    },
  });
});

// -----------------------------------------------------------------------------
// POST /lessons/:lessonId/progress - Mark lesson as IN_PROGRESS
// -----------------------------------------------------------------------------
router.post("/lessons/:lessonId/progress", optionalAuth, async (req, res): Promise<void> => {
  await ensureLessonsTableAndSeeds();

  const lessonIdParam = req.params.lessonId;
  const paramVal = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam;

  let lesson: any = null;
  const numericId = parseInt(paramVal, 10);
  if (!isNaN(numericId)) {
    const [found] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, numericId)).limit(1);
    lesson = found;
  }
  if (!lesson) {
    const [found] = await db.select().from(lessonsTable).where(eq(lessonsTable.slug, paramVal)).limit(1);
    lesson = found;
  }
  if (!lesson) {
    errorResponse(res, 404, "LESSON_NOT_FOUND", "Lesson not found.");
    return;
  }

  const userId = req.cyberquestUser?.userId;
  if (userId) {
    // Only update if not already COMPLETED
    const [existing] = await db
      .select()
      .from(learningProgressTable)
      .where(and(
        eq(learningProgressTable.userId, userId),
        eq(learningProgressTable.itemId, lesson.slug),
        eq(learningProgressTable.itemType, "lesson")
      ))
      .limit(1);

    if (!existing) {
      await db.insert(learningProgressTable).values({
        userId,
        itemId: lesson.slug,
        itemType: "lesson",
        status: "IN_PROGRESS",
      }).onConflictDoNothing();
    }
  }

  res.json({ success: true, message: "Lesson marked as in progress.", status: "IN_PROGRESS" });
});

// -----------------------------------------------------------------------------
// POST /lessons/:lessonId/complete - Mark lesson as COMPLETED & Award XP
// -----------------------------------------------------------------------------
router.post("/lessons/:lessonId/complete", requireAuth, async (req, res): Promise<void> => {
  await ensureLessonsTableAndSeeds();

  const lessonIdParam = req.params.lessonId;
  const paramVal = Array.isArray(lessonIdParam) ? lessonIdParam[0] : lessonIdParam;

  let lesson: any = null;
  const numericId = parseInt(paramVal, 10);
  if (!isNaN(numericId)) {
    const [found] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, numericId)).limit(1);
    lesson = found;
  }
  if (!lesson) {
    const [found] = await db.select().from(lessonsTable).where(eq(lessonsTable.slug, paramVal)).limit(1);
    lesson = found;
  }
  if (!lesson) {
    errorResponse(res, 404, "LESSON_NOT_FOUND", "Lesson not found.");
    return;
  }

  const userId = req.cyberquestUser!.userId;

  // Check if previously completed to avoid duplicate XP
  const [existing] = await db
    .select()
    .from(learningProgressTable)
    .where(and(
      eq(learningProgressTable.userId, userId),
      eq(learningProgressTable.itemId, lesson.slug),
      eq(learningProgressTable.itemType, "lesson")
    ))
    .limit(1);

  const alreadyCompleted = existing?.status === "COMPLETED";
  const xpReward = alreadyCompleted ? 0 : (lesson.xpReward || 50);

  if (existing) {
    await db
      .update(learningProgressTable)
      .set({
        status: "COMPLETED",
        completedAt: new Date(),
      })
      .where(eq(learningProgressTable.id, existing.id));
  } else {
    await db.insert(learningProgressTable).values({
      userId,
      itemId: lesson.slug,
      itemType: "lesson",
      status: "COMPLETED",
      completedAt: new Date(),
    });
  }

  // Award XP to user if first completion
  let updatedXp = 0;
  if (xpReward > 0) {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        xp: sql`${usersTable.xp} + ${xpReward}`,
        lastActivityDate: new Date().toISOString().slice(0, 10),
      })
      .where(eq(usersTable.id, userId))
      .returning({ xp: usersTable.xp });
    updatedXp = updatedUser?.xp || 0;
  } else {
    const [u] = await db.select({ xp: usersTable.xp }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    updatedXp = u?.xp || 0;
  }

  res.json({
    success: true,
    message: alreadyCompleted ? "Lesson reviewed and updated." : `Lesson completed! +${xpReward} XP awarded.`,
    data: {
      status: "COMPLETED",
      xpAwarded: xpReward,
      currentXp: updatedXp,
      lessonId: lesson.id,
      slug: lesson.slug,
    },
  });
});

export default router;
