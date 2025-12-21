import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from 'lucide-react';

export default function DiscussionTab({
    comments,
    comment,
    setComment,
    onPostComment,
    t
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    {t({ en: 'Research Discussion', ar: 'نقاش البحث' })} ({comments.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {comments.filter(c => c && c.created_date).map((c) => (
                    <div key={c.id} className={`p-3 rounded-lg border ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
                        <div className="flex items-start gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-slate-900">{c.created_by}</span>
                                    {c.is_internal && <Badge variant="outline" className="text-xs">{t({ en: 'Internal', ar: 'داخلي' })}</Badge>}
                                </div>
                                <p className="text-sm text-slate-700">{c.comment_text}</p>
                                <span className="text-xs text-slate-500 mt-1 block">
                                    {c.created_date ? new Date(c.created_date).toLocaleString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="space-y-3 pt-4 border-t">
                    <Textarea
                        placeholder={t({ en: "Add a research comment...", ar: "أضف تعليقاً بحثياً..." })}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                    />
                    <Button
                        onClick={onPostComment}
                        className="bg-gradient-to-r from-blue-600 to-teal-600"
                        disabled={!comment}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {t({ en: 'Post Comment', ar: 'نشر التعليق' })}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
