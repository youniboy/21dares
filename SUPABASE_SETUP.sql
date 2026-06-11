-- Run this in the Supabase SQL editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  host_id       TEXT NOT NULL,
  password_hash TEXT,                          -- NULL means no password
  game_state    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 3. Allow all operations (public party game — tighten later if needed)
CREATE POLICY "Allow all operations on rooms"
  ON public.rooms
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Enable Realtime for the rooms table
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;

-- 5. Auto-cleanup: delete rooms with no players or older than 24 hours
-- Run in Supabase SQL Editor → requires pg_cron extension (enabled by default on Supabase)
SELECT cron.schedule(
  'cleanup-stale-rooms',
  '0 * * * *',  -- every hour
  $$
    DELETE FROM public.rooms
    WHERE
      updated_at < NOW() - INTERVAL '24 hours'
      OR (game_state->'players')::jsonb = '[]'::jsonb;
  $$
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE: dare response media (photo/video) — deleted after judging
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dare-responses',
  'dare-responses',
  true,
  104857600,  -- 100 MB limit (for videos)
  ARRAY['image/jpeg','image/png','image/gif','image/webp','image/heic',
        'video/mp4','video/quicktime','video/webm','video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anon uploads to dare-responses"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'dare-responses');

CREATE POLICY "Allow public read of dare-responses"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'dare-responses');

CREATE POLICY "Allow anon deletes from dare-responses"
  ON storage.objects FOR DELETE TO anon
  USING (bucket_id = 'dare-responses');

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE: proof images bucket
-- Run these separately in the SQL editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 6. Create the proofs storage bucket (public so images can be displayed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proofs',
  'proofs',
  true,
  5242880,  -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 7. Allow anyone to upload to the proofs bucket (no auth in this app)
CREATE POLICY "Allow anon uploads to proofs"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'proofs');

-- 8. Allow anyone to read proof images
CREATE POLICY "Allow public read of proofs"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'proofs');
