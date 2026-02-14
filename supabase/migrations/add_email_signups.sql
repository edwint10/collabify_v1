-- Email signups for splash page waitlist
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (public signups)
CREATE POLICY "Allow public inserts" ON email_signups
  FOR INSERT WITH CHECK (true);
