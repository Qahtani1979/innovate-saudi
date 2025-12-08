import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Send, Flag, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function CommentThread({ ideaId }) {
  const { language, isRTL, t } = useLanguage();
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');
  const [commenterEmail, setCommenterEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['idea-comments', ideaId],
    queryFn: async () => {
      const all = await base44.entities.IdeaComment.list();
      return all.filter(c => c.idea_id === ideaId && c.is_approved && !c.is_deleted)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!ideaId
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => base44.entities.IdeaComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['idea-comments', ideaId]);
      setNewComment('');
      toast.success(t({ en: 'Comment posted', ar: 'تم نشر التعليق' }));
    }
  });

  const flagCommentMutation = useMutation({
    mutationFn: (commentId) => base44.entities.IdeaComment.update(commentId, { is_flagged: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['idea-comments', ideaId]);
      toast.success(t({ en: 'Comment flagged for review', ar: 'تم الإبلاغ عن التعليق' }));
    }
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    
    addCommentMutation.mutate({
      idea_id: ideaId,
      comment_text: newComment,
      commenter_name: commenterName || 'Anonymous',
      commenter_email: commenterEmail || undefined
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
                    <p className="font-medium text-sm text-slate-900">{comment.commenter_name}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(comment.created_date).toLocaleString()}
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder={t({ en: 'Your name', ar: 'اسمك' })}
              value={commenterName}
              onChange={(e) => setCommenterName(e.target.value)}
            />
            <Input
              type="email"
              placeholder={t({ en: 'Email (optional)', ar: 'البريد (اختياري)' })}
              value={commenterEmail}
              onChange={(e) => setCommenterEmail(e.target.value)}
            />
          </div>
          <Textarea
            placeholder={t({ en: 'Share your thoughts...', ar: 'شارك أفكارك...' })}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!newComment.trim() || addCommentMutation.isLoading}
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