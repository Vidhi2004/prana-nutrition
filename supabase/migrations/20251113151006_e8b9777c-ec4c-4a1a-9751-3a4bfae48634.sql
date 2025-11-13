-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'dietitian', 'patient');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table to add role_type for easier access
ALTER TABLE public.profiles ADD COLUMN role_type app_role;

-- Function to assign default role on signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Get role from user metadata, default to 'patient'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'::app_role)
  );
  RETURN NEW;
END;
$$;

-- Trigger to assign role on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();

-- Update existing RLS policies for patients table
DROP POLICY IF EXISTS "Practitioners can view their own patients" ON public.patients;
DROP POLICY IF EXISTS "Practitioners can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Practitioners can update their patients" ON public.patients;
DROP POLICY IF EXISTS "Practitioners can delete their patients" ON public.patients;

CREATE POLICY "Dietitians can view their patients"
ON public.patients FOR SELECT
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Patients can view their own record"
ON public.patients FOR SELECT
USING (
  public.has_role(auth.uid(), 'patient') 
  AND id IN (
    SELECT p.id FROM patients p 
    JOIN profiles prof ON p.email = prof.contact_number OR p.full_name = prof.full_name
    WHERE prof.id = auth.uid()
  )
);

CREATE POLICY "Dietitians can insert patients"
ON public.patients FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can update their patients"
ON public.patients FOR UPDATE
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can delete their patients"
ON public.patients FOR DELETE
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for diet_charts
DROP POLICY IF EXISTS "Practitioners can view their diet charts" ON public.diet_charts;
DROP POLICY IF EXISTS "Practitioners can insert diet charts" ON public.diet_charts;
DROP POLICY IF EXISTS "Practitioners can update their diet charts" ON public.diet_charts;
DROP POLICY IF EXISTS "Practitioners can delete their diet charts" ON public.diet_charts;

CREATE POLICY "Dietitians and patients can view diet charts"
ON public.diet_charts FOR SELECT
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'patient') AND patient_id IN (
    SELECT p.id FROM patients p 
    WHERE p.email = (SELECT contact_number FROM profiles WHERE id = auth.uid())
  )
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can insert diet charts"
ON public.diet_charts FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can update diet charts"
ON public.diet_charts FOR UPDATE
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can delete diet charts"
ON public.diet_charts FOR DELETE
USING (
  public.has_role(auth.uid(), 'dietitian') AND auth.uid() = practitioner_id
  OR public.has_role(auth.uid(), 'admin')
);

-- Update RLS policies for diet_chart_items
DROP POLICY IF EXISTS "Practitioners can view diet chart items through diet charts" ON public.diet_chart_items;
DROP POLICY IF EXISTS "Practitioners can insert diet chart items" ON public.diet_chart_items;
DROP POLICY IF EXISTS "Practitioners can update diet chart items" ON public.diet_chart_items;
DROP POLICY IF EXISTS "Practitioners can delete diet chart items" ON public.diet_chart_items;

CREATE POLICY "Dietitians and patients can view diet chart items"
ON public.diet_chart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM diet_charts dc
    WHERE dc.id = diet_chart_items.diet_chart_id
    AND (
      (public.has_role(auth.uid(), 'dietitian') AND dc.practitioner_id = auth.uid())
      OR (public.has_role(auth.uid(), 'patient') AND dc.patient_id IN (
        SELECT p.id FROM patients p 
        WHERE p.email = (SELECT contact_number FROM profiles WHERE id = auth.uid())
      ))
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Dietitians can insert diet chart items"
ON public.diet_chart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM diet_charts dc
    WHERE dc.id = diet_chart_items.diet_chart_id
    AND (
      (public.has_role(auth.uid(), 'dietitian') AND dc.practitioner_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Dietitians can update diet chart items"
ON public.diet_chart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM diet_charts dc
    WHERE dc.id = diet_chart_items.diet_chart_id
    AND (
      (public.has_role(auth.uid(), 'dietitian') AND dc.practitioner_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

CREATE POLICY "Dietitians can delete diet chart items"
ON public.diet_chart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM diet_charts dc
    WHERE dc.id = diet_chart_items.diet_chart_id
    AND (
      (public.has_role(auth.uid(), 'dietitian') AND dc.practitioner_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
    )
  )
);

-- Update foods table RLS for admin management
CREATE POLICY "Admins can insert foods"
ON public.foods FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update foods"
ON public.foods FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete foods"
ON public.foods FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));