-- Create enum types for Ayurvedic properties
CREATE TYPE public.food_temperature AS ENUM ('hot', 'cold', 'neutral');
CREATE TYPE public.digestibility AS ENUM ('easy', 'moderate', 'difficult');
CREATE TYPE public.rasa_taste AS ENUM ('sweet', 'sour', 'salty', 'bitter', 'pungent', 'astringent');
CREATE TYPE public.patient_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE public.dietary_habit AS ENUM ('vegetarian', 'non_vegetarian', 'vegan', 'eggetarian');

-- Create profiles table for practitioners
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  qualification TEXT,
  specialization TEXT,
  contact_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender patient_gender NOT NULL,
  contact_number TEXT,
  email TEXT,
  dietary_habit dietary_habit NOT NULL DEFAULT 'vegetarian',
  meal_frequency INTEGER DEFAULT 3,
  water_intake_liters DECIMAL(3,1) DEFAULT 2.0,
  bowel_movements_per_day INTEGER DEFAULT 1,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view their own patients"
  ON public.patients FOR SELECT
  USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert patients"
  ON public.patients FOR INSERT
  WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their patients"
  ON public.patients FOR UPDATE
  USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their patients"
  ON public.patients FOR DELETE
  USING (auth.uid() = practitioner_id);

-- Create foods table with Ayurvedic properties
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  cuisine_type TEXT,
  temperature food_temperature NOT NULL DEFAULT 'neutral',
  digestibility digestibility NOT NULL DEFAULT 'moderate',
  primary_taste rasa_taste NOT NULL,
  secondary_tastes rasa_taste[] DEFAULT '{}',
  calories_per_100g DECIMAL(6,2) NOT NULL DEFAULT 0,
  protein_g DECIMAL(5,2) DEFAULT 0,
  carbs_g DECIMAL(5,2) DEFAULT 0,
  fat_g DECIMAL(5,2) DEFAULT 0,
  fiber_g DECIMAL(5,2) DEFAULT 0,
  calcium_mg DECIMAL(6,2) DEFAULT 0,
  iron_mg DECIMAL(5,2) DEFAULT 0,
  vitamin_a_mcg DECIMAL(6,2) DEFAULT 0,
  vitamin_c_mg DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active foods"
  ON public.foods FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create diet charts table
CREATE TABLE public.diet_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chart_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  notes TEXT,
  total_calories DECIMAL(7,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.diet_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view their diet charts"
  ON public.diet_charts FOR SELECT
  USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can insert diet charts"
  ON public.diet_charts FOR INSERT
  WITH CHECK (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can update their diet charts"
  ON public.diet_charts FOR UPDATE
  USING (auth.uid() = practitioner_id);

CREATE POLICY "Practitioners can delete their diet charts"
  ON public.diet_charts FOR DELETE
  USING (auth.uid() = practitioner_id);

-- Create diet chart items table
CREATE TABLE public.diet_chart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_chart_id UUID NOT NULL REFERENCES public.diet_charts(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE RESTRICT,
  meal_type TEXT NOT NULL,
  meal_time TIME,
  quantity_grams DECIMAL(6,2) NOT NULL DEFAULT 100,
  special_instructions TEXT,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE public.diet_chart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Practitioners can view diet chart items through diet charts"
  ON public.diet_chart_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.diet_charts
      WHERE diet_charts.id = diet_chart_items.diet_chart_id
      AND diet_charts.practitioner_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can insert diet chart items"
  ON public.diet_chart_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.diet_charts
      WHERE diet_charts.id = diet_chart_items.diet_chart_id
      AND diet_charts.practitioner_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can update diet chart items"
  ON public.diet_chart_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.diet_charts
      WHERE diet_charts.id = diet_chart_items.diet_chart_id
      AND diet_charts.practitioner_id = auth.uid()
    )
  );

CREATE POLICY "Practitioners can delete diet chart items"
  ON public.diet_chart_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.diet_charts
      WHERE diet_charts.id = diet_chart_items.diet_chart_id
      AND diet_charts.practitioner_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diet_charts_updated_at
  BEFORE UPDATE ON public.diet_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample food data for testing
INSERT INTO public.foods (name, category, cuisine_type, temperature, digestibility, primary_taste, calories_per_100g, protein_g, carbs_g, fat_g, fiber_g) VALUES
('Brown Rice', 'Grains', 'Indian', 'neutral', 'moderate', 'sweet', 111, 2.6, 23, 0.9, 1.8),
('Moong Dal', 'Pulses', 'Indian', 'cold', 'easy', 'sweet', 347, 24.5, 59, 1.2, 16.3),
('Ghee', 'Fats & Oils', 'Indian', 'hot', 'easy', 'sweet', 900, 0, 0, 100, 0),
('Turmeric', 'Spices', 'Indian', 'hot', 'moderate', 'bitter', 312, 9.7, 67.1, 3.2, 22.7),
('Spinach', 'Vegetables', 'Indian', 'cold', 'easy', 'astringent', 23, 2.9, 3.6, 0.4, 2.2),
('Banana', 'Fruits', 'Indian', 'cold', 'easy', 'sweet', 89, 1.1, 22.8, 0.3, 2.6),
('Almonds', 'Nuts & Seeds', 'International', 'hot', 'difficult', 'sweet', 579, 21.2, 21.6, 49.9, 12.5),
('Ginger', 'Herbs & Roots', 'Indian', 'hot', 'moderate', 'pungent', 80, 1.8, 17.8, 0.7, 2.0);
