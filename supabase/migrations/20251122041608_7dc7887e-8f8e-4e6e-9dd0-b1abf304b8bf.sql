-- Drop the problematic policy
DROP POLICY IF EXISTS "Patients can view their own record" ON public.patients;

-- Create a security definer function to check if a patient belongs to a user
CREATE OR REPLACE FUNCTION public.is_patient_owner(_user_id uuid, _patient_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.profiles prof ON (p.email = prof.contact_number OR p.full_name = prof.full_name)
    WHERE p.id = _patient_id
      AND prof.id = _user_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Patients can view their own record" 
ON public.patients 
FOR SELECT 
USING (
  has_role(auth.uid(), 'patient'::app_role) 
  AND public.is_patient_owner(auth.uid(), id)
);