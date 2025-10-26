-- Add index on shared_results.conversation_id for better query performance
-- This supports the 1:N relation between conversations and shared_results

CREATE INDEX IF NOT EXISTS "shared_results_conversation_id_idx" 
  ON "shared_results"("conversation_id");

