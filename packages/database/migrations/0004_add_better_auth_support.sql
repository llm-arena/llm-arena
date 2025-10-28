-- Better-Auth Integration Migration
-- This migration adds Better-Auth support with new user fields and auth tables

-- Create new enums for Better-Auth
DO $$ BEGIN
  CREATE TYPE "user_role" AS ENUM('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "user_status" AS ENUM('active', 'disabled', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Extend users table with Better-Auth fields
ALTER TABLE "users" 
  ADD COLUMN IF NOT EXISTS "role" "user_role" DEFAULT 'user' NOT NULL,
  ADD COLUMN IF NOT EXISTS "status" "user_status" DEFAULT 'active' NOT NULL,
  ADD COLUMN IF NOT EXISTS "github_id" TEXT,
  ADD COLUMN IF NOT EXISTS "google_id" TEXT,
  ADD COLUMN IF NOT EXISTS "linuxdo_id" TEXT,
  ADD COLUMN IF NOT EXISTS "inviter_id" UUID,
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP;

-- Add unique constraints for OAuth IDs
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_github_id_unique" UNIQUE("github_id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_google_id_unique" UNIQUE("google_id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_linuxdo_id_unique" UNIQUE("linuxdo_id");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add foreign key for inviter
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_inviter_id_fkey" 
    FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add indexes for new user fields
CREATE INDEX IF NOT EXISTS "users_github_id_idx" ON "users"("github_id");
CREATE INDEX IF NOT EXISTS "users_google_id_idx" ON "users"("google_id");
CREATE INDEX IF NOT EXISTS "users_linuxdo_id_idx" ON "users"("linuxdo_id");
CREATE INDEX IF NOT EXISTS "users_inviter_id_idx" ON "users"("inviter_id");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- Create Better-Auth session table
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMP NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session"("token");

-- Create Better-Auth account table (OAuth)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "expires_at" TIMESTAMP,
  "password" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id", "account_id")
);

CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"("user_id");

-- Create Better-Auth verification table
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

-- Enable Row Level Security on new tables
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;

-- Session table policies
CREATE POLICY "Users can view their own sessions"
  ON "session" FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON "session" FOR DELETE
  USING (auth.uid() = user_id);

-- Account table policies
CREATE POLICY "Users can view their own accounts"
  ON "account" FOR SELECT
  USING (auth.uid() = user_id);

-- Verification table policies (handled by Better-Auth internally)
CREATE POLICY "Anyone can insert verification records"
  ON "verification" FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can select verification records"
  ON "verification" FOR SELECT
  USING (true);
