import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(__dirname, "db.json");
const SQL_PATH = process.env.SQLITE_PATH ? path.resolve(process.env.SQLITE_PATH) : path.join(__dirname, "civicai.sqlite");

export const sql = new DatabaseSync(SQL_PATH);
sql.exec(`
  PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, citizen_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT NOT NULL, status TEXT NOT NULL, priority INTEGER, department TEXT,
    assigned_authority_id TEXT, latitude REAL NOT NULL, longitude REAL NOT NULL, address TEXT NOT NULL,
    ward TEXT, municipality TEXT, province TEXT, status_reason TEXT, resolution_notes TEXT,
    ai_status TEXT NOT NULL DEFAULT 'pending', ai_category TEXT, ai_priority INTEGER,
    ai_confidence REAL, ai_summary TEXT, ai_department TEXT, ai_analyzed_at TEXT,
    possible_duplicate_id TEXT, duplicate_similarity REAL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, submitted_at TEXT NOT NULL,
    acknowledged_at TEXT, assigned_at TEXT, resolved_at TEXT, closed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_reports_citizen_created ON reports(citizen_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_reports_department_status ON reports(department, status);
  CREATE INDEX IF NOT EXISTS idx_reports_status_category_priority ON reports(status, category, priority);
  CREATE TABLE IF NOT EXISTS report_evidence (
    id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    storage_name TEXT NOT NULL UNIQUE, original_name TEXT NOT NULL, mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'citizen', uploaded_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS report_status_history (
    id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    old_status TEXT, new_status TEXT NOT NULL, changed_by TEXT NOT NULL, reason TEXT, created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_history_report_created ON report_status_history(report_id, created_at);
  CREATE TABLE IF NOT EXISTS report_notes (
    id TEXT PRIMARY KEY, report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL, report_id TEXT REFERENCES reports(id) ON DELETE CASCADE,
    kind TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('citizen','authority','admin')),
    phone TEXT, location TEXT, organization TEXT, department TEXT, status TEXT NOT NULL,
    email_verified INTEGER NOT NULL DEFAULT 0, provider TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_verification_tokens(user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reset_tokens_user ON password_reset_tokens(user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
`);

function defaultDB() {
  return {
    users: [],
    sessions: [],
    emailVerificationTokens: [],
    passwordResetTokens: [],
    reports: [],
    confirmations: {},
    confirmationFeedback: {},
  };
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const fresh = defaultDB();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = { ...defaultDB(), ...JSON.parse(raw) };
    // Legacy auth records contained reusable raw tokens. They cannot be
    // migrated safely, so invalidate them during the production migration.
    delete parsed.verifyTokens;
    delete parsed.resetTokens;
    parsed.sessions = parsed.sessions.filter((session) => session.tokenHash);
    if (!parsed.confirmations) parsed.confirmations = {};
    if (!parsed.confirmationFeedback) parsed.confirmationFeedback = {};
    return parsed;
  } catch {
    return defaultDB();
  }
}

// Loaded once on boot, kept in memory, written to disk on every mutation.
// Simple and reliable for hackathon scale -- no native modules, no DB
// server to install, works identically on every OS.
export const db = load();

export function persist() {
  const tempPath = `${DB_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), { mode: 0o600 });
  fs.renameSync(tempPath, DB_PATH);
}

// Synchronous mutations are serialized by Node's event loop. This snapshot
// gives multi-record auth operations rollback semantics in this single-process
// JSON architecture.
export function transaction(mutate) {
  const snapshot = structuredClone(db);
  try {
    const result = mutate(db);
    persist();
    return result;
  } catch (error) {
    for (const key of Object.keys(db)) delete db[key];
    Object.assign(db, snapshot);
    throw error;
  }
}
