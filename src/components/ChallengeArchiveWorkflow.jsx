import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from './LanguageContext';
import { Archive, Loader2, X } from 'lucide-react';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

export default function ChallengeArchiveWorkflow({ challenge, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const [archiveReason, setArchiveReason] = useState('');
  const { updateChallenge } = useChallengeMutations();

  const handleArchive = () => {
    updateChallenge.mutate({
      id: challenge.id,
      data: {
        status: 'archived',
        is_archived: true,
        archive_date: new Date().toISOString(),
        archive_reason: archiveReason
      },
      metadata: { archive_reason: archiveReason }
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card className="max-w-2xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-slate-600" />
            {t({ en: 'Archive Challenge', ar: 'أرشفة التحدي' })}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Challenge Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-xs text-slate-500 mb-1">{challenge.code}</p>
          <p className="font-semibold text-slate-900">{challenge.title_en}</p>
        </div>

        {/* Warning */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            {t({
              en: '⚠️ Archiving will move this challenge out of active workflows. It can be restored later if needed.',
              ar: '⚠️ الأرشفة ستنقل هذا التحدي خارج سير العمل النشط. يمكن استعادته لاحقاً إذا لزم الأمر.'
            })}
          </p>
        </div>

        {/* Archive Reason */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Reason for Archiving', ar: 'سبب الأرشفة' })}
          </label>
          <Textarea
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder={t({
              en: 'E.g., No longer relevant, Duplicate, Resolved through other means...',
              ar: 'مثلاً، لم يعد ذا صلة، مكرر، تم الحل بوسائل أخرى...'
            })}
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button
            onClick={handleArchive}
            disabled={!archiveReason || updateChallenge.isPending}
            className="bg-slate-600 hover:bg-slate-700"
          >
            {updateChallenge.isPending ? (
              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
            ) : (
              <Archive className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Archive Challenge', ar: 'أرشفة التحدي' })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
