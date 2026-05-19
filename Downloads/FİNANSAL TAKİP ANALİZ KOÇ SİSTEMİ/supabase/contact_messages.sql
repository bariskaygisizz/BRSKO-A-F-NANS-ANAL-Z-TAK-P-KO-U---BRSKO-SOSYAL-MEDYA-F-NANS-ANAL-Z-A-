-- Run this once in Supabase Dashboard → SQL Editor
-- TABLE 1: Contact form messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  subject    TEXT,
  message    TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anonymous users (visitors) to insert, but not read
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact form"
  ON contact_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- TABLE 2: BRSKO Creator waitlist
CREATE TABLE IF NOT EXISTS creator_waitlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE creator_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join creator waitlist"
  ON creator_waitlist FOR INSERT
  TO anon
  WITH CHECK (true);
