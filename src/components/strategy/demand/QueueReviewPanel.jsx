import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/components/LanguageContext';
import { useQueueNotifications } from '@/hooks/strategy/useQueueNotifications';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  AlertTriangle,
  TrendingUp,
  Loader2
} from 'lucide-react';

export default function QueueReviewPanel({ strategicPlanId }) {
  const { t, isRTL } = useLanguage();
  const { 
    reviewItems, 
    reviewCount, 
    approveItem, 
    rejectItemWithFeedback,
    requestRegeneration,
    isLoading 
  } = useQueueNotifications(strategicPlanId);

  const [selectedItem, setSelectedItem] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState('reject'); // 'reject' or 'regenerate'
  const [feedbackReason, setFeedbackReason] = useState('');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const handleApprove = async (itemId) => {
    await approveItem.mutateAsync(itemId);
  };

  const openFeedbackDialog = (item, type) => {
    setSelectedItem(item);
    setFeedbackType(type);
    setFeedbackReason('');
    setFeedbackNotes('');
    setFeedbackDialogOpen(true);
  };

  const submitFeedback = async () => {
    if (!selectedItem) return;

    if (feedbackType === 'reject') {
      await rejectItemWithFeedback.mutateAsync({
        itemId: selectedItem.id,
        reason: feedbackReason,
        improvementNotes: feedbackNotes
      });
    } else {
      await requestRegeneration.mutateAsync({
        itemId: selectedItem.id,
        feedbackNotes: `${feedbackReason}\n\n${feedbackNotes}`
      });
    }

    setFeedbackDialogOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (reviewCount === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
          <p className="font-medium">{t({ en: 'All caught up!', ar: 'لا توجد عناصر للمراجعة!' })}</p>
          <p className="text-sm mt-2">
            {t({ en: 'No items pending review', ar: 'لا توجد عناصر في انتظار المراجعة' })}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card dir={isRTL ? 'rtl' : 'ltr'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t({ en: 'Items Pending Review', ar: 'عناصر في انتظار المراجعة' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  en: `${reviewCount} items need your attention`, 
                  ar: `${reviewCount} عنصر يحتاج انتباهك` 
                })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-8 px-3 text-lg">
              {reviewCount}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {reviewItems.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-lg border bg-amber-50/50 border-amber-200 hover:bg-amber-100/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {item.entity_type}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {t({ en: 'Score', ar: 'النتيجة' })}: {item.quality_score || 'N/A'}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-sm truncate">
                        {item.prefilled_spec?.title_en || item.prefilled_spec?.name_en || `${item.entity_type} item`}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.prefilled_spec?.description_en || item.prefilled_spec?.ai_context?.objective_text || 'No description available'}
                      </p>
                      
                      {/* Quality feedback preview */}
                      {item.quality_feedback?.dimension_scores && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {Object.entries(item.quality_feedback.dimension_scores).slice(0, 3).map(([dim, score]) => (
                            <Badge 
                              key={dim} 
                              variant={score >= 70 ? 'outline' : 'destructive'}
                              className="text-xs"
                            >
                              {dim}: {score}%
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(item.id)}
                        disabled={approveItem.isPending}
                        className="gap-1"
                      >
                        {approveItem.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {t({ en: 'Approve', ar: 'موافقة' })}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openFeedbackDialog(item, 'regenerate')}
                        className="gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        {t({ en: 'Regen', ar: 'إعادة' })}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => openFeedbackDialog(item, 'reject')}
                        className="gap-1"
                      >
                        <XCircle className="h-3 w-3" />
                        {t({ en: 'Reject', ar: 'رفض' })}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackType === 'reject' 
                ? t({ en: 'Reject Item', ar: 'رفض العنصر' })
                : t({ en: 'Request Regeneration', ar: 'طلب إعادة التوليد' })
              }
            </DialogTitle>
            <DialogDescription>
              {feedbackType === 'reject'
                ? t({ en: 'Please provide feedback to help improve future generations', ar: 'يرجى تقديم ملاحظات للمساعدة في تحسين التوليدات المستقبلية' })
                : t({ en: 'Describe what should be improved in the regeneration', ar: 'صف ما يجب تحسينه في إعادة التوليد' })
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Reason', ar: 'السبب' })}
              </label>
              <Textarea 
                value={feedbackReason}
                onChange={(e) => setFeedbackReason(e.target.value)}
                placeholder={feedbackType === 'reject' 
                  ? t({ en: 'Why is this item not acceptable?', ar: 'لماذا هذا العنصر غير مقبول؟' })
                  : t({ en: 'What should be different?', ar: 'ما الذي يجب أن يكون مختلفًا؟' })
                }
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Improvement Notes', ar: 'ملاحظات التحسين' })}
              </label>
              <Textarea 
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder={t({ en: 'Additional suggestions for improvement...', ar: 'اقتراحات إضافية للتحسين...' })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDialogOpen(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button 
              onClick={submitFeedback}
              disabled={!feedbackReason.trim() || rejectItemWithFeedback.isPending || requestRegeneration.isPending}
              variant={feedbackType === 'reject' ? 'destructive' : 'default'}
            >
              {(rejectItemWithFeedback.isPending || requestRegeneration.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {feedbackType === 'reject' 
                ? t({ en: 'Reject', ar: 'رفض' })
                : t({ en: 'Request Regeneration', ar: 'طلب إعادة التوليد' })
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
