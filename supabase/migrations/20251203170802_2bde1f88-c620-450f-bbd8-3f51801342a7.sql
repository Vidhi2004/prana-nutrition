-- Create table for storing weekly meal plans
CREATE TABLE public.meal_calendar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id UUID NOT NULL,
  patient_id UUID,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
  quantity_grams NUMERIC NOT NULL DEFAULT 100,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(practitioner_id, patient_id, meal_date, meal_type, food_id)
);

-- Enable RLS
ALTER TABLE public.meal_calendar ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Dietitians can view their meal calendars"
ON public.meal_calendar FOR SELECT
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can insert meal calendar items"
ON public.meal_calendar FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can update their meal calendar items"
ON public.meal_calendar FOR UPDATE
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can delete their meal calendar items"
ON public.meal_calendar FOR DELETE
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- Add trigger for updated_at
CREATE TRIGGER update_meal_calendar_updated_at
BEFORE UPDATE ON public.meal_calendar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();