import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Send, Flag, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function CommentThread({ ideaId, entityType = 'citizen_idea', entityId }) {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const queryClient = useQueryClient();
  
  const actualEntityId = entityId || ideaId;

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', entityType, actualEntityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', actualEntityId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!actualEntityId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('comments').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, actualEntityId]);
      setNewComment('');
      toast.success(t({ en: 'Comment posted', ar: 'تم نشر التعليق' }));
    }
  });

  const flagCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabase
        .from('comments')
        .update({ is_internal: true })
        .eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', entityType, actualEntityId]);
      toast.success(t({ en: 'Comment flagged for review', ar: 'تم الإبلاغ عن التعليق' }));
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      entity_type: entityType,
      entity_id: actualEntityId,
      comment_text: newComment,
      user_name: commenterName || user?.email?.split('@')[0] || 'Anonymous',
      user_email: user?.email || 'anonymous@guest.com'
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">
            {t({ en: 'Discussion', ar: 'النقاش' })} ({comments.length})
          </h3>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">{comment.user_name || 'Anonymous'}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => flagCommentMutation.mutate(comment.id)}
                  className="text-slate-400 hover:text-red-600"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-slate-700">{comment.comment_text}</p>
            </div>
          ))}
        </div>

        {/* Add Comment Form */}
        <div className="space-y-3 pt-4 border-t">
          <Input
            placeholder={t({ en: 'Your name (optional)', ar: 'اسمك (اختياري)' })}
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
          />
          <Textarea
            placeholder={t({ en: 'Share your thoughts...', ar: 'شارك أفكارك...' })}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="bg-purple-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Post Comment', ar: 'نشر التعليق' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}