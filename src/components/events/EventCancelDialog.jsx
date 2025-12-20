import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '@/components/LanguageContext';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EventCancelDialog({ 
  open, 
  onOpenChange, 
  event, 
  onConfirm,
  isLoading = false 
}) {
  const { t, language } = useLanguage();
  const [reason, setReason] = useState('');
  const [notifyRegistrants, setNotifyRegistrants] = useState(true);

  const title = language === 'ar' ? (event?.title_ar || event?.title_en) : (event?.title_en || event?.title_ar);

  const handleConfirm = async () => {
    await onConfirm({
      reason,
      notifyRegistrants
    });
    setReason('');
    setNotifyRegistrants(true);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>
              {t({ en: 'Cancel Event', ar: 'إلغاء الفعالية' })}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {t({ 
              en: `Are you sure you want to cancel "${title}"? This action cannot be undone.`,
              ar: `هل أنت متأكد من إلغاء "${title}"؟ لا يمكن التراجع عن هذا الإجراء.`
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">
              {t({ en: 'Cancellation Reason', ar: 'سبب الإلغاء' })}
            </Label>
            <Textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t({ 
                en: 'Please provide a reason for cancellation...',
                ar: 'الرجاء تقديم سبب الإلغاء...'
              })}
              rows={3}
            />
          </div>

          {event?.registered_count > 0 && (
            <div className="flex items-center space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Checkbox 
                id="notify-registrants" 
                checked={notifyRegistrants}
                onCheckedChange={setNotifyRegistrants}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="notify-registrants"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t({ en: 'Notify all registrants', ar: 'إخطار جميع المسجلين' })}
                </label>
                <p className="text-xs text-muted-foreground">
                  {t({ 
                    en: `${event.registered_count} registered participants will receive a cancellation email`,
                    ar: `سيتلقى ${event.registered_count} مشارك مسجل بريداً إلكترونياً بالإلغاء`
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t({ en: 'Keep Event', ar: 'إبقاء الفعالية' })}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t({ en: 'Cancelling...', ar: 'جاري الإلغاء...' })}
              </>
            ) : (
              t({ en: 'Cancel Event', ar: 'إلغاء الفعالية' })
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
