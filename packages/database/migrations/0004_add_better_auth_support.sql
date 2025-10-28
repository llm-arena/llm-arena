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
  ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;

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

-- Add indexes for new user fields (OAuth ID fields already have indexes from UNIQUE constraints)
CREATE INDEX IF NOT EXISTS "users_inviter_id_idx" ON "users"("inviter_id");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- Create Better-Auth session table
CREATE TABLE IF NOT EXISTS "session" (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("user_id");
-- Note: session.token already has an index from UNIQUE constraint

-- Create Better-Auth account table (OAuth)
CREATE TABLE IF NOT EXISTS "account" (
  "id" TEXT PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "account_id" TEXT NOT NULL,
  "provider_id" TEXT NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "id_token" TEXT,
  "expires_at" TIMESTAMPTZ,
  "password" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT "account_provider_account_unique" UNIQUE("provider_id", "account_id")
);

CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"("user_id");

-- Create Better-Auth verification table
CREATE TABLE IF NOT EXISTS "verification" (
  "id" TEXT PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

-- Disable Row Level Security on Better-Auth tables
-- Better-Auth uses direct database connection (postgres.js via Drizzle) which doesn't have
-- Supabase auth context (auth.uid() or auth.role()). These tables are only accessed by
-- Better-Auth server-side code, not by client-side Supabase clients.
-- Security is handled by Better-Auth at the application layer.
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to automatically update updated_at for each table
CREATE TRIGGER session_set_updated_at
  BEFORE UPDATE ON "session"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER account_set_updated_at
  BEFORE UPDATE ON "account"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER verification_set_updated_at
  BEFORE UPDATE ON "verification"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
