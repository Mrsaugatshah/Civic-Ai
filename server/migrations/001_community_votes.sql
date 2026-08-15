-- Safe additive migration for existing CivicAI SQLite databases.
CREATE TABLE IF NOT EXISTS community_votes (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK(vote_type IN ('confirm', 'reject')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(report_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_community_votes_report ON community_votes(report_id, vote_type);
