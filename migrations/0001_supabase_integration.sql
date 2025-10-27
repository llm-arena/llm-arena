-- Supabase Integration Migration
-- This migration creates all necessary tables for the AI Model Arena with Supabase Auth integration

-- Create enums
DO $$ BEGIN
  CREATE TYPE "config_source" AS ENUM('manual', 'cherry-studio', 'newapi');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "message_role" AS ENUM('user', 'assistant', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "vote_type" AS ENUM('like', 'neutral', 'dislike');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL UNIQUE,
  "username" TEXT UNIQUE,
  "full_name" TEXT,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User preferences
CREATE TABLE IF NOT EXISTS "user_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE UNIQUE,
  "theme" TEXT DEFAULT 'system',
  "language" TEXT DEFAULT 'en',
  "default_models" JSONB,
  "config_source" "config_source" DEFAULT 'manual',
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- API Keys (encrypted)
CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider_name" TEXT NOT NULL,
  "encrypted_key" TEXT NOT NULL,
  "config_source" "config_source" DEFAULT 'manual',
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Conversations
CREATE TABLE IF NOT EXISTS "conversations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Messages
CREATE TABLE IF NOT EXISTS "messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "role" "message_role" NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Model responses
CREATE TABLE IF NOT EXISTS "model_responses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "message_id" UUID NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "model_name" TEXT NOT NULL,
  "provider_name" TEXT NOT NULL,
  "response_content" TEXT NOT NULL,
  "tokens_used" INTEGER,
  "response_time_ms" INTEGER,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User votes
CREATE TABLE IF NOT EXISTS "user_votes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "message_id" UUID NOT NULL REFERENCES "messages"("id") ON DELETE CASCADE,
  "model_response_id" UUID NOT NULL REFERENCES "model_responses"("id") ON DELETE CASCADE,
  "vote_type" "vote_type" NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT "unique_user_model_vote" UNIQUE ("user_id", "model_response_id")
);

-- Model rankings
CREATE TABLE IF NOT EXISTS "model_rankings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "model_name" TEXT NOT NULL UNIQUE,
  "provider_name" TEXT NOT NULL,
  "total_likes" INTEGER DEFAULT 0 NOT NULL,
  "total_dislikes" INTEGER DEFAULT 0 NOT NULL,
  "total_neutral" INTEGER DEFAULT 0 NOT NULL,
  "ranking_score" REAL DEFAULT 0 NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Files (stored as text/base64)
CREATE TABLE IF NOT EXISTS "files" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "filename" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "file_data" TEXT NOT NULL,
  "size_bytes" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Shared results
CREATE TABLE IF NOT EXISTS "shared_results" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversation_id" UUID NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
  "share_token" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "expires_at" TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "user_preferences_user_id_idx" ON "user_preferences"("user_id");
CREATE INDEX IF NOT EXISTS "api_keys_user_id_idx" ON "api_keys"("user_id");
CREATE INDEX IF NOT EXISTS "conversations_user_id_idx" ON "conversations"("user_id");
CREATE INDEX IF NOT EXISTS "messages_conversation_id_idx" ON "messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "model_responses_message_id_idx" ON "model_responses"("message_id");
CREATE INDEX IF NOT EXISTS "user_votes_user_id_idx" ON "user_votes"("user_id");
CREATE INDEX IF NOT EXISTS "user_votes_message_id_idx" ON "user_votes"("message_id");
CREATE INDEX IF NOT EXISTS "user_votes_model_response_id_idx" ON "user_votes"("model_response_id");
CREATE INDEX IF NOT EXISTS "model_rankings_ranking_score_idx" ON "model_rankings"("ranking_score" DESC);
CREATE INDEX IF NOT EXISTS "files_user_id_idx" ON "files"("user_id");
CREATE INDEX IF NOT EXISTS "shared_results_share_token_idx" ON "shared_results"("share_token");

-- Enable Row Level Security on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "model_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "model_rankings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shared_results" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON "users" FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON "users" FOR UPDATE
  USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON "user_preferences" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON "user_preferences" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON "user_preferences" FOR UPDATE
  USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view their own API keys"
  ON "api_keys" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
  ON "api_keys" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON "api_keys" FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
  ON "api_keys" FOR DELETE
  USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON "conversations" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON "conversations" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON "conversations" FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON "conversations" FOR DELETE
  USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON "messages" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "conversations"
      WHERE "conversations"."id" = "messages"."conversation_id"
      AND "conversations"."user_id" = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON "messages" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "conversations"
      WHERE "conversations"."id" = "messages"."conversation_id"
      AND "conversations"."user_id" = auth.uid()
    )
  );

-- Model responses policies
CREATE POLICY "Users can view model responses in their conversations"
  ON "model_responses" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "messages"
      JOIN "conversations" ON "conversations"."id" = "messages"."conversation_id"
      WHERE "messages"."id" = "model_responses"."message_id"
      AND "conversations"."user_id" = auth.uid()
    )
  );

CREATE POLICY "Users can insert model responses in their conversations"
  ON "model_responses" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "messages"
      JOIN "conversations" ON "conversations"."id" = "messages"."conversation_id"
      WHERE "messages"."id" = "model_responses"."message_id"
      AND "conversations"."user_id" = auth.uid()
    )
  );

-- User votes policies
CREATE POLICY "Users can view their own votes"
  ON "user_votes" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own votes"
  ON "user_votes" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON "user_votes" FOR UPDATE
  USING (auth.uid() = user_id);

-- Model rankings policies (public read)
CREATE POLICY "Anyone can view model rankings"
  ON "model_rankings" FOR SELECT
  USING (true);

-- Files policies
CREATE POLICY "Users can view their own files"
  ON "files" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON "files" FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON "files" FOR DELETE
  USING (auth.uid() = user_id);

-- Shared results policies
CREATE POLICY "Anyone can view shared results with valid token"
  ON "shared_results" FOR SELECT
  USING (
    expires_at IS NULL OR expires_at > NOW()
  );

CREATE POLICY "Users can create shared results for their conversations"
  ON "shared_results" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "conversations"
      WHERE "conversations"."id" = "shared_results"."conversation_id"
      AND "conversations"."user_id" = auth.uid()
    )
  );

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update model rankings when votes change
CREATE OR REPLACE FUNCTION public.update_model_rankings()
RETURNS TRIGGER AS $$
DECLARE
  v_model_name TEXT;
  v_provider_name TEXT;
  v_total_likes INT;
  v_total_dislikes INT;
  v_total_neutral INT;
  v_ranking_score REAL;
BEGIN
  -- Get model info from model_responses
  SELECT mr.model_name, mr.provider_name
  INTO v_model_name, v_provider_name
  FROM model_responses mr
  WHERE mr.id = COALESCE(NEW.model_response_id, OLD.model_response_id);
  
  -- Calculate vote counts
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'like'),
    COUNT(*) FILTER (WHERE vote_type = 'dislike'),
    COUNT(*) FILTER (WHERE vote_type = 'neutral')
  INTO v_total_likes, v_total_dislikes, v_total_neutral
  FROM user_votes uv
  JOIN model_responses mr ON mr.id = uv.model_response_id
  WHERE mr.model_name = v_model_name;
  
  -- Calculate ranking score (likes / total votes)
  v_ranking_score := CASE 
    WHEN (v_total_likes + v_total_dislikes + v_total_neutral) > 0 
    THEN v_total_likes::REAL / (v_total_likes + v_total_dislikes + v_total_neutral)
    ELSE 0
  END;
  
  -- Upsert model rankings
  INSERT INTO model_rankings (model_name, provider_name, total_likes, total_dislikes, total_neutral, ranking_score, updated_at)
  VALUES (v_model_name, v_provider_name, v_total_likes, v_total_dislikes, v_total_neutral, v_ranking_score, NOW())
  ON CONFLICT (model_name) 
  DO UPDATE SET
    total_likes = EXCLUDED.total_likes,
    total_dislikes = EXCLUDED.total_dislikes,
    total_neutral = EXCLUDED.total_neutral,
    ranking_score = EXCLUDED.ranking_score,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user_votes table
DROP TRIGGER IF EXISTS on_vote_change ON user_votes;
CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON user_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_model_rankings();

