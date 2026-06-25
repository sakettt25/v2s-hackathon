-- ============================================================
-- Community Hero — Initial Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================
-- PROFILES (linked to auth.users via trigger)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'moderator', 'official')),
  reputation_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ISSUES
-- ============================================================
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity_score INTEGER NOT NULL DEFAULT 5 CHECK (severity_score BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'verifying', 'in-progress', 'resolved')),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  formatted_address TEXT,
  media_url TEXT,
  description_embedding vector(768),
  cluster_id UUID REFERENCES public.issues(id) ON DELETE SET NULL,
  upvote_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- VERIFICATIONS
-- ============================================================
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('approve', 'dispute')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(issue_id, user_id)
);

-- ============================================================
-- OFFICIAL ACTIONS
-- ============================================================
CREATE TABLE public.official_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  official_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  updates TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('resolved', 'deferred', 'auto-complaint')),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_issues_status ON public.issues(status);
CREATE INDEX idx_issues_category ON public.issues(category);
CREATE INDEX idx_issues_cluster ON public.issues(cluster_id);
CREATE INDEX idx_issues_created ON public.issues(created_at DESC);
CREATE INDEX idx_issues_reporter ON public.issues(reporter_id);
CREATE INDEX idx_issues_embedding ON public.issues USING hnsw (description_embedding vector_cosine_ops);
CREATE INDEX idx_verifications_issue ON public.verifications(issue_id);
CREATE INDEX idx_verifications_user ON public.verifications(user_id);
CREATE INDEX idx_official_actions_issue ON public.official_actions(issue_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_actions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Issues
CREATE POLICY "Issues are viewable by everyone" ON public.issues
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create issues" ON public.issues
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Reporter or staff can update issues" ON public.issues
  FOR UPDATE USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'official'))
  );

-- Verifications
CREATE POLICY "Verifications are viewable" ON public.verifications
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can verify" ON public.verifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Official Actions
CREATE POLICY "Official actions are viewable" ON public.official_actions
  FOR SELECT USING (true);
CREATE POLICY "Officials can create actions" ON public.official_actions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('moderator', 'official'))
  );

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on issues
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Find nearby issues (for deduplication — Haversine formula)
CREATE OR REPLACE FUNCTION public.find_nearby_issues(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_radius_meters DOUBLE PRECISION DEFAULT 50
)
RETURNS SETOF public.issues AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.issues
  WHERE status IN ('open', 'verifying', 'in-progress')
    AND cluster_id IS NULL
    AND (
      6371000 * acos(
        LEAST(1.0,
          cos(radians(p_lat)) * cos(radians(lat)) *
          cos(radians(lng) - radians(p_lng)) +
          sin(radians(p_lat)) * sin(radians(lat))
        )
      )
    ) <= p_radius_meters;
END;
$$ LANGUAGE plpgsql;

-- Match issues by embedding similarity
CREATE OR REPLACE FUNCTION public.match_issues_by_embedding(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.8,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.title,
    i.description,
    i.category,
    1 - (i.description_embedding <=> query_embedding) AS similarity
  FROM public.issues i
  WHERE i.description_embedding IS NOT NULL
    AND i.cluster_id IS NULL
    AND i.status IN ('open', 'verifying', 'in-progress')
    AND 1 - (i.description_embedding <=> query_embedding) > match_threshold
  ORDER BY i.description_embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.verifications;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('issue-media', 'issue-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view issue media" ON storage.objects
  FOR SELECT USING (bucket_id = 'issue-media');
CREATE POLICY "Authenticated users can upload issue media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'issue-media' AND auth.role() = 'authenticated');
