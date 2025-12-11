-- Add foreign key constraint from municipalities.region_id to regions.id
ALTER TABLE public.municipalities 
ADD CONSTRAINT municipalities_region_id_fkey 
FOREIGN KEY (region_id) REFERENCES public.regions(id);