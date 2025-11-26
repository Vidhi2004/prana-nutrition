-- Add meal type classification to foods table
ALTER TABLE foods 
ADD COLUMN suitable_for_meals text[] DEFAULT '{}';

COMMENT ON COLUMN foods.suitable_for_meals IS 'Array of meal types: breakfast, lunch, dinner, snacks';