import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const { user } = useAuth();

  const submitFeedback = async () => {
    if (!feedback.trim()) return;

    try {
      // Store feedback in user_activities table
      await supabase.from('user_activities').insert({
        user_email: user?.email || 'anonymous',
        activity_type: 'feedback',
        activity_description: `Platform Feedback - Rating: ${rating}/5`,
        metadata: {
          rating,
          feedback,
          page: window.location.pathname,
          timestamp: new Date().toISOString()
        }
      });

      toast.success('Feedback sent! Thank you.');
      setFeedback('');
      setRating(0);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to send feedback');
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-40 rounded-full shadow-lg"
        size="icon"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {open && (
        <Card className="fixed bottom-20 left-4 w-80 z-50 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Share Feedback</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-slate-600 mb-2">Rate your experience:</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`text-2xl ${n <= rating ? 'text-yellow-500' : 'text-slate-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
            <Button onClick={submitFeedback} className="w-full" disabled={!feedback.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Feedback
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}