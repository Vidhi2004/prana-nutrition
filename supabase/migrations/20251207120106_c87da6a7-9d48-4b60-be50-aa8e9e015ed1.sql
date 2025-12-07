-- Create meal_plan_templates table for saving reusable weekly meal plans
CREATE TABLE public.meal_plan_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practitioner_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  dosha_target text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create meal_plan_template_items table for template items
CREATE TABLE public.meal_plan_template_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid NOT NULL REFERENCES public.meal_plan_templates(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  meal_type text NOT NULL,
  food_id uuid NOT NULL REFERENCES public.foods(id),
  quantity_grams numeric NOT NULL DEFAULT 100,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_template_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_plan_templates
CREATE POLICY "Dietitians can view their templates"
ON public.meal_plan_templates FOR SELECT
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can insert templates"
ON public.meal_plan_templates FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can update their templates"
ON public.meal_plan_templates FOR UPDATE
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Dietitians can delete their templates"
ON public.meal_plan_templates FOR DELETE
USING (
  (has_role(auth.uid(), 'dietitian') AND practitioner_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- RLS policies for meal_plan_template_items
CREATE POLICY "Dietitians can view template items"
ON public.meal_plan_template_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plan_templates t
    WHERE t.id = template_id
    AND ((has_role(auth.uid(), 'dietitian') AND t.practitioner_id = auth.uid())
         OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Dietitians can insert template items"
ON public.meal_plan_template_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meal_plan_templates t
    WHERE t.id = template_id
    AND ((has_role(auth.uid(), 'dietitian') AND t.practitioner_id = auth.uid())
         OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Dietitians can update template items"
ON public.meal_plan_template_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plan_templates t
    WHERE t.id = template_id
    AND ((has_role(auth.uid(), 'dietitian') AND t.practitioner_id = auth.uid())
         OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Dietitians can delete template items"
ON public.meal_plan_template_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.meal_plan_templates t
    WHERE t.id = template_id
    AND ((has_role(auth.uid(), 'dietitian') AND t.practitioner_id = auth.uid())
         OR has_role(auth.uid(), 'admin'))
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_meal_plan_templates_updated_at
BEFORE UPDATE ON public.meal_plan_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();