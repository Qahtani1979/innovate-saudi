import { useComments, useCommentMutations } from '@/hooks/useComments';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function PolicyCommentThread({ policyId }) {
  const { language, isRTL, t } = useLanguage();
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();

  const { data: comments = [], isLoading } = useComments('policy', policyId);
  const { addComment } = useCommentMutations();

  const handleAddComment = () => {
    addComment.mutate({
      entity_type: 'policy',
      entity_id: policyId,
      comment_text: newComment,
      user_email: user?.email || 'anonymous',
      is_internal: false
    }, {
      onSuccess: () => {
        setNewComment('');
        toast.success(t({ en: 'Comment added', ar: 'تمت إضافة التعليق' }));
      },
      onError: (error) => {
        toast.error(t({ en: 'Failed to add comment', ar: 'فشل إضافة التعليق' }));
        console.error(error);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          {t({ en: 'Discussion', ar: 'النقاش' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t({ en: 'Add your comment or feedback...', ar: 'أضف تعليقك أو ملاحظاتك...' })}
            rows={3}
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || addComment.isPending}
              className="gap-2"
              size="sm"
            >
              {addComment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {t({ en: 'Post', ar: 'نشر' })}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No comments yet', ar: 'لا تعليقات بعد' })}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">
                        {comment.user_email || comment.created_by}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700" dir={isRTL ? 'rtl' : 'ltr'}>
                      {comment.comment_text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}