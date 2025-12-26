import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Layers, CheckCircle, RotateCcw } from 'lucide-react';
import { useBulkMutations } from '@/hooks/useBulkMutations';

export default function AdvancedBulkOperations({ selectedRecords, entityType, onComplete }) {
  const { t } = useLanguage();
  const [operation, setOperation] = useState('update_status');
  const [newStatus, setNewStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { updateBatch, deleteBatch } = useBulkMutations(entityType);
  const isPending = updateBatch.isPending || deleteBatch.isPending;

  const handleExecute = () => {
    const ids = selectedRecords.map(r => r.id);

    if (operation === 'update_status' && newStatus) {
      updateBatch.mutate(
        { ids, data: { status: newStatus } },
        { onSuccess: () => onComplete?.() }
      );
    } else if (operation === 'bulk_delete') {
      deleteBatch.mutate(ids, { onSuccess: () => onComplete?.() });
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-purple-600" />
          {t({ en: 'Bulk Operations', ar: 'العمليات الجماعية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <p className="text-sm text-slate-700 mb-3">
            {t({ en: `${selectedRecords.length} records selected`, ar: `${selectedRecords.length} سجل محدد` })}
          </p>

          <div className="space-y-3">
            <Select value={operation} onValueChange={setOperation}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="update_status">{t({ en: 'Update Status', ar: 'تحديث الحالة' })}</SelectItem>
                <SelectItem value="bulk_assign">{t({ en: 'Assign to User', ar: 'تعيين لمستخدم' })}</SelectItem>
                <SelectItem value="bulk_delete">{t({ en: 'Delete', ar: 'حذف' })}</SelectItem>
              </SelectContent>
            </Select>

            {operation === 'update_status' && (
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select new status', ar: 'اختر الحالة الجديدة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="w-full"
            >
              {showPreview ? t({ en: 'Hide Preview', ar: 'إخفاء المعاينة' }) : t({ en: 'Preview Changes', ar: 'معاينة التغييرات' })}
            </Button>

            {showPreview && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  {t({ en: 'Preview:', ar: 'المعاينة:' })}
                </p>
                <div className="space-y-1">
                  {selectedRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="text-xs text-slate-700 bg-white p-2 rounded">
                      {record.code || record.id}: {record.status} → <strong>{newStatus || 'Deleted'}</strong>
                    </div>
                  ))}
                  {selectedRecords.length > 5 && (
                    <p className="text-xs text-slate-500 text-center">
                      ...and {selectedRecords.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleExecute}
              disabled={isPending || (operation === 'update_status' && !newStatus)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Execute Operation', ar: 'تنفيذ العملية' })}
            </Button>

            <div className="p-3 bg-amber-50 rounded border border-amber-300">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-amber-700" />
                <p className="text-xs text-amber-900">
                  {t({ en: 'Rollback available for 24 hours', ar: 'التراجع متاح لمدة 24 ساعة' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
