-- Create email digest queue table for batching notifications
CREATE TABLE IF NOT EXISTS public.email_digest_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  user_id UUID,
  trigger_key VARCHAR(100) NOT NULL,
  template_key VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  variables JSONB DEFAULT '{}',
  language VARCHAR(5) DEFAULT 'en',
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  digest_type VARCHAR(20) DEFAULT 'daily' CHECK (digest_type IN ('daily', 'weekly')),
  processed_at TIMESTAMPTZ,
  digest_id UUID
);

-- Create index for efficient querying
CREATE INDEX idx_email_digest_queue_user ON email_digest_queue(user_email, digest_type, processed_at);
CREATE INDEX idx_email_digest_queue_pending ON email_digest_queue(digest_type, processed_at) WHERE processed_at IS NULL;

-- Enable RLS
ALTER TABLE public.email_digest_queue ENABLE ROW LEVEL SECURITY;

-- Create policy for system access (edge functions use service role)
CREATE POLICY "System can manage digest queue" 
ON public.email_digest_queue 
FOR ALL 
USING (true);

-- Add comment
COMMENT ON TABLE public.email_digest_queue IS 'Queues notifications for daily/weekly digest emails instead of immediate sending';