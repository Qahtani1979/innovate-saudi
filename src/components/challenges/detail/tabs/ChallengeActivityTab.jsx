import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { MessageSquare, Send, Loader2 } from 'lucide-react';
import ChallengeActivityLog from '@/components/challenges/ChallengeActivityLog';
import { usePermissions } from '@/components/permissions/usePermissions';
import { toast } from 'sonner';
import { useComments, useCommentMutations } from '@/hooks/useComments';
import { useAuth } from '@/lib/AuthContext';

export default function ChallengeActivityTab({
  challengeId
}) {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const { user } = useAuth();
  const { userEmail } = usePermissions();

  const { data: comments = [], isLoading: isLoadingComments } = useComments('challenge', challengeId);
  const { addComment } = useCommentMutations('challenge', challengeId);

  const handleSubmit = async () => {
    if (comment.trim()) {
      try {
        await addComment.mutateAsync({
          entity_id: challengeId,
          entity_type: 'challenge',
          comment_text: comment,
          user_email: userEmail || user?.email,
          user_name: user?.user_metadata?.full_name || userEmail
        });
        setComment('');
        toast.success(t({ en: 'Comment added', ar: 'تم إضافة التعليق' }));
      } catch (err) {
        // handled in hook or toast here
      }
    }
  };

  return (
    <div className="space-y-6">
      <ChallengeActivityLog challengeId={challengeId} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            {t({ en: 'Comments & Discussion', ar: 'التعليقات والمناقشة' })} ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingComments ? (
            <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
          ) : (
            comments.filter(c => c && c.created_at).map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-background'}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{c.user_name || c.user_email}</span>
                      {c.is_internal && <Badge variant="outline" className="text-xs">Internal</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{c.comment_text}</p>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {c.created_at ? new Date(c.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="space-y-3 pt-4 border-t">
            <Textarea
              placeholder={t({ en: 'Add a comment...', ar: 'أضف تعليقاً...' })}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
              disabled={!comment.trim() || addComment.isPending}
            >
              {addComment.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t({ en: 'Post Comment', ar: 'نشر التعليق' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
