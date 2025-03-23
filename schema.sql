-- Schema for Cloudflare D1 database used by the Score Quiz application

-- Main table for quiz submissions
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  score INTEGER,
  data TEXT,  -- Stores the complete quiz data as JSON
  created_at TEXT
);

-- Index for querying by email
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions(email);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_submissions_date ON submissions(created_at);

-- Table for storing quiz configurations
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  questions TEXT,  -- JSON array of questions
  created_at TEXT,
  updated_at TEXT
);

-- Table for analytics data
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  quiz_id TEXT,
  metrics TEXT,  -- JSON with metrics like average score, completion rate, etc.
  period TEXT,   -- daily, weekly, monthly
  date TEXT,
  FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
); 