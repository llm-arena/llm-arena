-- Fix model_rankings unique constraint
-- Change from single model_name unique to composite (model_name, provider_name) unique

-- Drop the existing unique constraint on model_name
ALTER TABLE "model_rankings" DROP CONSTRAINT IF EXISTS "model_rankings_model_name_unique";

-- Add composite unique constraint on (model_name, provider_name)
ALTER TABLE "model_rankings" ADD CONSTRAINT "model_rankings_model_provider_unique" 
  UNIQUE ("model_name", "provider_name");

-- Update the update_model_rankings function to use the correct conflict resolution
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
  
  -- Calculate vote counts for this specific model + provider combination
  SELECT 
    COUNT(*) FILTER (WHERE vote_type = 'like'),
    COUNT(*) FILTER (WHERE vote_type = 'dislike'),
    COUNT(*) FILTER (WHERE vote_type = 'neutral')
  INTO v_total_likes, v_total_dislikes, v_total_neutral
  FROM user_votes uv
  JOIN model_responses mr ON mr.id = uv.model_response_id
  WHERE mr.model_name = v_model_name 
    AND mr.provider_name = v_provider_name;
  
  -- Calculate ranking score (likes / total votes)
  v_ranking_score := CASE 
    WHEN (v_total_likes + v_total_dislikes + v_total_neutral) > 0 
    THEN v_total_likes::REAL / (v_total_likes + v_total_dislikes + v_total_neutral)
    ELSE 0
  END;
  
  -- Upsert model rankings using composite unique constraint
  INSERT INTO model_rankings (model_name, provider_name, total_likes, total_dislikes, total_neutral, ranking_score, updated_at)
  VALUES (v_model_name, v_provider_name, v_total_likes, v_total_dislikes, v_total_neutral, v_ranking_score, NOW())
  ON CONFLICT (model_name, provider_name) 
  DO UPDATE SET
    total_likes = EXCLUDED.total_likes,
    total_dislikes = EXCLUDED.total_dislikes,
    total_neutral = EXCLUDED.total_neutral,
    ranking_score = EXCLUDED.ranking_score,
    updated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

