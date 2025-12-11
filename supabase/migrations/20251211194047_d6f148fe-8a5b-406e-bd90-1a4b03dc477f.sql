-- Add executive hierarchy roles
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'executive_leader';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'executive_director';