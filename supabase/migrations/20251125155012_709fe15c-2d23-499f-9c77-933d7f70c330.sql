-- Add Ayurvedic properties to foods table
ALTER TABLE foods ADD COLUMN IF NOT EXISTS guna text[] DEFAULT '{}';
ALTER TABLE foods ADD COLUMN IF NOT EXISTS vipaka text;
ALTER TABLE foods ADD COLUMN IF NOT EXISTS dosha_effects jsonb DEFAULT '{"vata": "neutral", "pitta": "neutral", "kapha": "neutral"}';

COMMENT ON COLUMN foods.guna IS 'Ayurvedic qualities like heavy, light, oily, dry, hot, cold, etc.';
COMMENT ON COLUMN foods.vipaka IS 'Post-digestive effect: sweet, sour, or pungent';
COMMENT ON COLUMN foods.dosha_effects IS 'Effects on doshas: increases (+), decreases (-), or neutral (=)';