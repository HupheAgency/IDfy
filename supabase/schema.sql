-- IDfy Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  bio TEXT,
  expertise TEXT[],
  invite_code_used TEXT,
  invite_codes_remaining INTEGER DEFAULT 5,
  reputation_score INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite codes
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invite requests
CREATE TABLE IF NOT EXISTS invite_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  message TEXT,
  invite_code TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ideas
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  teaser TEXT NOT NULL,
  full_description TEXT,
  category TEXT,
  target_audience TEXT,
  why_it_doesnt_exist TEXT,
  equity_offered_percent NUMERIC,
  status TEXT DEFAULT 'active', -- active, in_progress, completed, archived
  timestamp_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NDA acceptances
CREATE TABLE IF NOT EXISTS nda_acceptances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  idea_id UUID REFERENCES ideas(id) NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  UNIQUE(user_id, idea_id)
);

-- Contributor applications (intake)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) NOT NULL,
  applicant_id UUID REFERENCES profiles(id) NOT NULL,
  expertise_relevant TEXT,
  hours_per_week INTEGER,
  expected_return TEXT, -- equity / payment / both / open
  equity_requested_percent NUMERIC,
  equity_reasoning TEXT,
  first_contribution TEXT,
  time_horizon TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, counter
  counter_offer_equity NUMERIC,
  counter_offer_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, applicant_id)
);

-- Projects (formed when idea gets at least one approved contributor)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id) NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'active', -- active, paused, completed
  idfy_equity_percent NUMERIC DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project members
CREATE TABLE IF NOT EXISTS project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  role TEXT NOT NULL, -- founder, lead, contributor
  equity_percent NUMERIC NOT NULL,
  vesting_months INTEGER DEFAULT 24,
  cliff_months INTEGER DEFAULT 6,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  activity_score INTEGER DEFAULT 100,
  UNIQUE(project_id, user_id)
);

-- Project messages (group + private chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_id UUID REFERENCES profiles(id), -- NULL = group message
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'open', -- open, in_progress, done
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Decision log
CREATE TABLE IF NOT EXISTS decisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  agreed_by UUID[] NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nda_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Invite codes policies
CREATE POLICY "Invite codes readable by authenticated users" ON invite_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Anyone can check invite codes" ON invite_codes
  FOR SELECT USING (true);

-- Invite requests policies
CREATE POLICY "Anyone can create invite requests" ON invite_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view invite requests" ON invite_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update invite requests" ON invite_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Ideas policies
CREATE POLICY "Ideas teasers are public to authenticated users" ON ideas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their ideas" ON ideas
  FOR UPDATE USING (auth.uid() = creator_id);

-- NDA acceptances policies
CREATE POLICY "Users can see own NDAs" ON nda_acceptances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create NDA acceptances" ON nda_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can see applications for their ideas or own apps" ON applications
  FOR SELECT USING (
    auth.uid() = applicant_id OR
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid())
  );

CREATE POLICY "Users can create applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Creators can update applications for their ideas" ON applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid())
    OR auth.uid() = applicant_id
  );

-- Projects policies
CREATE POLICY "Project members can view projects" ON projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid())
  );

CREATE POLICY "Idea creators can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid())
  );

CREATE POLICY "Idea creators can update projects" ON projects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM ideas WHERE id = idea_id AND creator_id = auth.uid())
  );

-- Project members policies
CREATE POLICY "Project members can view team" ON project_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
  );

CREATE POLICY "Founders can manage project members" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_id AND pm.user_id = auth.uid() AND pm.role = 'founder'
    )
    OR EXISTS (
      SELECT 1 FROM projects p JOIN ideas i ON p.idea_id = i.id
      WHERE p.id = project_id AND i.creator_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Project members can view messages" ON messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project members can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

-- Tasks policies
CREATE POLICY "Project members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project members can update tasks" ON tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

-- Decisions policies
CREATE POLICY "Project members can view decisions" ON decisions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

CREATE POLICY "Project members can create decisions" ON decisions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM project_members WHERE project_id = project_id AND user_id = auth.uid())
  );

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_codes(user_id UUID, num_codes INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  new_code TEXT;
BEGIN
  FOR i IN 1..num_codes LOOP
    new_code := upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
    INSERT INTO invite_codes (code, created_by) VALUES (new_code, user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some initial invite codes for admin
INSERT INTO invite_codes (code, created_by) VALUES
  ('IDFY-ALPHA', NULL),
  ('IDFY-BETA1', NULL),
  ('IDFY-BETA2', NULL),
  ('IDFY-BETA3', NULL),
  ('IDFY-BETA4', NULL)
ON CONFLICT DO NOTHING;
