import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Users, Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';

export default function IdeaBulkActions({ selectedIds, onComplete }) {
  const { t } = useLanguage();
  const [action, setAction] = useState('');
  const { bulkUpdateIdeas } = useCitizenIdeas();

  const handleBulkAction = () => {
    if (!action || selectedIds.length === 0) return;

    const updatesMap = {
      approve: { status: 'approved' },
      reject: { status: 'rejected' },
      review: { status: 'under_review' }
    };

    bulkUpdateIdeas.mutate({
      ids: selectedIds,
      updates: updatesMap[action]
    }, {
      onSuccess: () => {
        if (onComplete) onComplete();
      }
    });
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-blue-900">{selectedIds.length} selected</span>
      </div>

      <Select value={action} onValueChange={setAction}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t({ en: 'Bulk action...', ar: 'إجراء جماعي...' })} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="approve">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              {t({ en: 'Approve All', ar: 'الموافقة على الكل' })}
            </div>
          </SelectItem>
          <SelectItem value="reject">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              {t({ en: 'Reject All', ar: 'رفض الكل' })}
            </div>
          </SelectItem>
          <SelectItem value="review">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-yellow-600" />
              {t({ en: 'Mark for Review', ar: 'وضع علامة للمراجعة' })}
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleBulkAction}
        disabled={!action || bulkUpdateIdeas.isPending}
        className="bg-blue-600"
      >
        {bulkUpdateIdeas.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t({ en: 'Apply', ar: 'تطبيق' })}
      </Button>
    </div>
  );
}