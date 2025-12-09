-- Allow anonymous inserts to citizen_ideas table for public submissions
CREATE POLICY "Allow anonymous inserts to citizen_ideas"
ON public.citizen_ideas
FOR INSERT
WITH CHECK (true);

-- Allow public read access to published ideas
CREATE POLICY "Allow public read access to published citizen_ideas"
ON public.citizen_ideas
FOR SELECT
USING (is_published = true);