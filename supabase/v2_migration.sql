-- IDfy v2.0 Schema Migration
-- Run this in the Supabase SQL Editor

-- ─── Add new columns to ideas ────────────────────────────────────────────────

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS layer INTEGER NOT NULL DEFAULT 3
  CHECK (layer IN (1, 2, 3));

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

ALTER TABLE ideas DROP CONSTRAINT IF EXISTS ideas_category_check;
ALTER TABLE ideas
  ADD CONSTRAINT ideas_category_check
  CHECK (category IN (
    'Technology', 'Business', 'Creative', 'Science', 'Social', 'Other',
    'Media', 'Health', 'Finance', 'Sustainability'
  ));

-- ─── Layer 2 team invitations ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS idea_invitations (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id       UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  invited_by    UUID REFERENCES profiles(id) NOT NULL,
  invited_email TEXT NOT NULL,
  invited_user_id UUID REFERENCES profiles(id),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, invited_email)
);

-- ─── Idea followers ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS idea_followers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id     UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  email       TEXT NOT NULL,
  user_id     UUID REFERENCES profiles(id),
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, email)
);

-- ─── Follower notifications ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS follower_notifications (
  id       UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id  UUID REFERENCES ideas(id) ON DELETE CASCADE NOT NULL,
  subject  TEXT NOT NULL,
  body     TEXT NOT NULL,
  sent_at  TIMESTAMPTZ DEFAULT NOW(),
  sent_by  UUID REFERENCES profiles(id)
);

-- ─── RLS ─────────────────────────────────────────────────────────────────────

ALTER TABLE idea_invitations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_followers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='idea_invitations'
    AND policyname='Invitations visible to creator and invited'
  ) THEN
    CREATE POLICY "Invitations visible to creator and invited"
      ON idea_invitations FOR ALL
      USING (invited_by = auth.uid() OR invited_user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='idea_followers'
    AND policyname='Anyone can follow an idea'
  ) THEN
    CREATE POLICY "Anyone can follow an idea"
      ON idea_followers FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='idea_followers'
    AND policyname='Followers visible to idea creator'
  ) THEN
    CREATE POLICY "Followers visible to idea creator"
      ON idea_followers FOR SELECT
      USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
        OR user_id = auth.uid()
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='idea_followers'
    AND policyname='Public follower count'
  ) THEN
    CREATE POLICY "Public follower count"
      ON idea_followers FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='follower_notifications'
    AND policyname='Notifications visible to idea creator'
  ) THEN
    CREATE POLICY "Notifications visible to idea creator"
      ON follower_notifications FOR ALL
      USING (idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='ideas'
    AND policyname='Layer 3 ideas publicly readable'
  ) THEN
    CREATE POLICY "Layer 3 ideas publicly readable"
      ON ideas FOR SELECT
      USING (layer = 3 AND status = 'active');
  END IF;
END $$;

-- ─── Storage bucket for cover images ─────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
  VALUES ('idea-covers', 'idea-covers', true)
  ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects'
    AND policyname='Anyone can view cover images'
  ) THEN
    CREATE POLICY "Anyone can view cover images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'idea-covers');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='objects'
    AND policyname='Authenticated users can upload cover images'
  ) THEN
    CREATE POLICY "Authenticated users can upload cover images"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'idea-covers' AND auth.role() = 'authenticated');
  END IF;
END $$;
