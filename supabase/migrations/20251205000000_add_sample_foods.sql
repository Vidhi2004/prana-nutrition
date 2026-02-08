-- Add dosha_effects column to foods table if not exists
ALTER TABLE public.foods ADD COLUMN IF NOT EXISTS dosha_effects JSONB DEFAULT '{}'::JSONB;

-- Insert comprehensive sample food data with Ayurvedic properties
INSERT INTO public.foods (
  name, category, cuisine_type, temperature, digestibility, primary_taste, 
  calories_per_100g, protein_g, carbs_g, fat_g, fiber_g, dosha_effects
) VALUES
-- Grains
('White Rice', 'Grains', 'Indian', 'neutral', 'easy', 'sweet', 130, 2.7, 28.2, 0.3, 0.4, '{"vata": "decrease", "pitta": "decrease", "kapha": "increase"}'::JSONB),
('Wheat Flour', 'Grains', 'Indian', 'hot', 'moderate', 'sweet', 364, 10, 76, 1.5, 2.7, '{"vata": "decrease", "pitta": "neutral", "kapha": "increase"}'::JSONB),
('Barley', 'Grains', 'Indian', 'cold', 'moderate', 'sweet', 354, 12.5, 73.5, 2.3, 17.3, '{"vata": "increase", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Quinoa', 'Grains', 'International', 'hot', 'easy', 'sweet', 368, 14.1, 64.2, 6.1, 7, '{"vata": "decrease", "pitta": "neutral", "kapha": "neutral"}'::JSONB),
('Oats', 'Grains', 'International', 'hot', 'moderate', 'sweet', 389, 16.9, 66.3, 6.9, 10.6, '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB),

-- Pulses & Legumes
('Toor Dal', 'Pulses', 'Indian', 'hot', 'moderate', 'sweet', 343, 22.3, 62.2, 1.7, 15, '{"vata": "increase", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Masoor Dal', 'Pulses', 'Indian', 'hot', 'easy', 'astringent', 352, 25.8, 63.4, 1.1, 10.7, '{"vata": "increase", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Chana Dal', 'Pulses', 'Indian', 'neutral', 'difficult', 'sweet', 364, 22.5, 57.8, 5.6, 9.8, '{"vata": "increase", "pitta": "neutral", "kapha": "decrease"}'::JSONB),
('Black Gram', 'Pulses', 'Indian', 'hot', 'difficult', 'sweet', 347, 25.2, 58.9, 1.6, 18.3, '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB),
('Kidney Beans', 'Pulses', 'Indian', 'hot', 'difficult', 'astringent', 333, 22.5, 60.3, 1.2, 15.2, '{"vata": "increase", "pitta": "increase", "kapha": "decrease"}'::JSONB),

-- Vegetables
('Carrot', 'Vegetables', 'Indian', 'hot', 'easy', 'sweet', 41, 0.9, 9.6, 0.2, 2.8, '{"vata": "decrease", "pitta": "neutral", "kapha": "neutral"}'::JSONB),
('Beetroot', 'Vegetables', 'Indian', 'hot', 'easy', 'sweet', 43, 1.6, 9.6, 0.2, 2.8, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Bottle Gourd', 'Vegetables', 'Indian', 'cold', 'easy', 'sweet', 14, 0.6, 3.4, 0.0, 0.5, '{"vata": "neutral", "pitta": "decrease", "kapha": "neutral"}'::JSONB),
('Bitter Gourd', 'Vegetables', 'Indian', 'cold', 'moderate', 'bitter', 17, 1.0, 3.7, 0.2, 2.8, '{"vata": "increase", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Tomato', 'Vegetables', 'Indian', 'hot', 'moderate', 'sour', 18, 0.9, 3.9, 0.2, 1.2, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Cucumber', 'Vegetables', 'Indian', 'cold', 'easy', 'sweet', 15, 0.7, 3.6, 0.1, 0.5, '{"vata": "neutral", "pitta": "decrease", "kapha": "increase"}'::JSONB),
('Pumpkin', 'Vegetables', 'Indian', 'hot', 'easy', 'sweet', 26, 1.0, 6.5, 0.1, 0.5, '{"vata": "decrease", "pitta": "neutral", "kapha": "neutral"}'::JSONB),
('Okra', 'Vegetables', 'Indian', 'hot', 'moderate', 'sweet', 33, 1.9, 7.5, 0.2, 3.2, '{"vata": "decrease", "pitta": "neutral", "kapha": "increase"}'::JSONB),
('Cauliflower', 'Vegetables', 'Indian', 'hot', 'moderate', 'astringent', 25, 1.9, 4.9, 0.3, 2.0, '{"vata": "increase", "pitta": "neutral", "kapha": "decrease"}'::JSONB),
('Broccoli', 'Vegetables', 'International', 'hot', 'moderate', 'astringent', 34, 2.8, 7.0, 0.4, 2.6, '{"vata": "increase", "pitta": "neutral", "kapha": "decrease"}'::JSONB),

-- Fruits
('Apple', 'Fruits', 'International', 'neutral', 'easy', 'sweet', 52, 0.3, 13.8, 0.2, 2.4, '{"vata": "decrease", "pitta": "decrease", "kapha": "neutral"}'::JSONB),
('Mango', 'Fruits', 'Indian', 'hot', 'easy', 'sweet', 60, 0.8, 15.0, 0.4, 1.6, '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB),
('Papaya', 'Fruits', 'Indian', 'hot', 'easy', 'sweet', 43, 0.5, 10.8, 0.3, 1.7, '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB),
('Pomegranate', 'Fruits', 'Indian', 'cold', 'easy', 'astringent', 83, 1.7, 18.7, 1.2, 4.0, '{"vata": "neutral", "pitta": "decrease", "kapha": "neutral"}'::JSONB),
('Grapes', 'Fruits', 'Indian', 'cold', 'easy', 'sweet', 69, 0.7, 18.1, 0.2, 0.9, '{"vata": "decrease", "pitta": "decrease", "kapha": "increase"}'::JSONB),
('Orange', 'Fruits', 'International', 'cold', 'easy', 'sour', 47, 0.9, 11.8, 0.1, 2.4, '{"vata": "decrease", "pitta": "increase", "kapha": "neutral"}'::JSONB),
('Watermelon', 'Fruits', 'Indian', 'cold', 'easy', 'sweet', 30, 0.6, 7.6, 0.2, 0.4, '{"vata": "neutral", "pitta": "decrease", "kapha": "increase"}'::JSONB),

-- Dairy
('Cow Milk', 'Dairy', 'Indian', 'cold', 'easy', 'sweet', 61, 3.2, 4.8, 3.3, 0, '{"vata": "decrease", "pitta": "decrease", "kapha": "increase"}'::JSONB),
('Yogurt', 'Dairy', 'Indian', 'hot', 'easy', 'sour', 60, 3.5, 4.7, 3.3, 0, '{"vata": "neutral", "pitta": "increase", "kapha": "increase"}'::JSONB),
('Buttermilk', 'Dairy', 'Indian', 'cold', 'easy', 'astringent', 40, 3.3, 4.8, 0.9, 0, '{"vata": "decrease", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Paneer', 'Dairy', 'Indian', 'cold', 'moderate', 'sweet', 265, 18.3, 1.2, 20.8, 0, '{"vata": "decrease", "pitta": "neutral", "kapha": "increase"}'::JSONB),

-- Nuts & Seeds
('Cashew', 'Nuts & Seeds', 'Indian', 'hot', 'difficult', 'sweet', 553, 18.2, 30.2, 43.9, 3.3, '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB),
('Walnuts', 'Nuts & Seeds', 'International', 'hot', 'difficult', 'sweet', 654, 15.2, 13.7, 65.2, 6.7, '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB),
('Pumpkin Seeds', 'Nuts & Seeds', 'Indian', 'hot', 'moderate', 'sweet', 446, 18.6, 54.0, 19.0, 18.4, '{"vata": "decrease", "pitta": "increase", "kapha": "neutral"}'::JSONB),
('Sesame Seeds', 'Nuts & Seeds', 'Indian', 'hot', 'difficult', 'sweet', 573, 17.7, 23.5, 49.7, 11.8, '{"vata": "decrease", "pitta": "increase", "kapha": "neutral"}'::JSONB),
('Flax Seeds', 'Nuts & Seeds', 'International', 'hot', 'moderate', 'sweet', 534, 18.3, 28.9, 42.2, 27.3, '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB),

-- Spices & Herbs
('Cumin', 'Spices', 'Indian', 'hot', 'easy', 'pungent', 375, 17.8, 44.2, 22.3, 10.5, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Coriander', 'Spices', 'Indian', 'cold', 'easy', 'sweet', 298, 12.4, 54.9, 17.8, 41.9, '{"vata": "neutral", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Cardamom', 'Spices', 'Indian', 'hot', 'easy', 'pungent', 311, 10.8, 68.5, 6.7, 28.0, '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB),
('Cinnamon', 'Spices', 'Indian', 'hot', 'moderate', 'sweet', 247, 4.0, 80.6, 1.2, 53.1, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Black Pepper', 'Spices', 'Indian', 'hot', 'moderate', 'pungent', 251, 10.4, 63.9, 3.3, 25.3, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Fennel', 'Spices', 'Indian', 'cold', 'easy', 'sweet', 345, 15.8, 52.3, 14.9, 39.8, '{"vata": "decrease", "pitta": "decrease", "kapha": "neutral"}'::JSONB),
('Mint', 'Herbs & Roots', 'Indian', 'cold', 'easy', 'pungent', 70, 3.8, 14.9, 0.9, 8.0, '{"vata": "neutral", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Curry Leaves', 'Herbs & Roots', 'Indian', 'hot', 'easy', 'pungent', 108, 6.1, 18.7, 1.0, 6.4, '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB),

-- Oils
('Coconut Oil', 'Fats & Oils', 'Indian', 'cold', 'easy', 'sweet', 862, 0, 0, 100, 0, '{"vata": "decrease", "pitta": "decrease", "kapha": "increase"}'::JSONB),
('Mustard Oil', 'Fats & Oils', 'Indian', 'hot', 'moderate', 'pungent', 884, 0, 0, 100, 0, '{"vata": "decrease", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Olive Oil', 'Fats & Oils', 'International', 'neutral', 'easy', 'sweet', 884, 0, 0, 100, 0, '{"vata": "decrease", "pitta": "neutral", "kapha": "neutral"}'::JSONB),

-- Sweeteners
('Honey', 'Sweeteners', 'Indian', 'hot', 'easy', 'sweet', 304, 0.3, 82.4, 0, 0.2, '{"vata": "neutral", "pitta": "increase", "kapha": "decrease"}'::JSONB),
('Jaggery', 'Sweeteners', 'Indian', 'hot', 'easy', 'sweet', 383, 0.4, 98.0, 0.1, 0, '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB),

-- Beverages Base Ingredients
('Green Tea Leaves', 'Beverages', 'International', 'cold', 'easy', 'astringent', 1, 0, 0, 0, 0, '{"vata": "increase", "pitta": "decrease", "kapha": "decrease"}'::JSONB),
('Black Tea Leaves', 'Beverages', 'Indian', 'hot', 'moderate', 'astringent', 1, 0.2, 0.3, 0, 0, '{"vata": "increase", "pitta": "increase", "kapha": "decrease"}'::JSONB);

-- Update existing foods with dosha effects
UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "decrease", "kapha": "neutral"}'::JSONB
WHERE name = 'Brown Rice';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "decrease", "kapha": "decrease"}'::JSONB
WHERE name = 'Moong Dal';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "neutral", "kapha": "increase"}'::JSONB
WHERE name = 'Ghee';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB
WHERE name = 'Turmeric';

UPDATE public.foods 
SET dosha_effects = '{"vata": "neutral", "pitta": "decrease", "kapha": "decrease"}'::JSONB
WHERE name = 'Spinach';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "decrease", "kapha": "increase"}'::JSONB
WHERE name = 'Banana';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "increase", "kapha": "increase"}'::JSONB
WHERE name = 'Almonds';

UPDATE public.foods 
SET dosha_effects = '{"vata": "decrease", "pitta": "neutral", "kapha": "decrease"}'::JSONB
WHERE name = 'Ginger';



