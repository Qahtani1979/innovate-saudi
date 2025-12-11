-- Add unique constraint on user_email to prevent duplicates
ALTER TABLE public.user_profiles 
ADD CONSTRAINT user_profiles_user_email_unique UNIQUE (user_email);