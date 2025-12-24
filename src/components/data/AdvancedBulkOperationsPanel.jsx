import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Layers, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedBulkOperationsPanel({ entityName, selectedIds, onComplete }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [operation, setOperation] = useState(null);
  const [updateData, setUpdateData] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  const executeMutation = useMutation({
    mutationFn: async ({ op, data }) => {
      if (op === 'update') {
        return Promise.all(selectedIds.map(id => 
          base44.entities[entityName].update(id, data)
        ));
      } else if (op === 'delete') {
        return Promise.all(selectedIds.map(id => 
          base44.entities[entityName].delete(id)
        ));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries([entityName.toLowerCase()]);
      toast.success(t({ en: 'Operation completed', ar: 'العملية مكتملة' }));
      onComplete?.();
    }
  });

  const previewOperation = () => {
    setShowPreview(true);
  };

  const executeOperation = () => {
    executeMutation.mutate({ op: operation, data: updateData });
    setShowPreview(false);
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Bulk Operations', ar: 'العمليات الجماعية' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm text-slate-700">
            <strong>{selectedIds.length}</strong> {t({ en: 'items selected', ar: 'عنصر محدد' })}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setOperation('update')}
            className={operation === 'update' ? 'border-2 border-indigo-500' : ''}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t({ en: 'Bulk Update', ar: 'تحديث جماعي' })}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOperation('delete')}
            className={operation === 'delete' ? 'border-2 border-red-500' : ''}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t({ en: 'Bulk Delete', ar: 'حذف جماعي' })}
          </Button>
        </div>

        {operation === 'update' && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                {t({ en: 'Update Status', ar: 'تحديث الحالة' })}
              </label>
              <select
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">{t({ en: 'Select status...', ar: 'اختر الحالة...' })}</option>
                <option value="under_review">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</option>
                <option value="approved">{t({ en: 'Approved', ar: 'موافق عليه' })}</option>
                <option value="archived">{t({ en: 'Archived', ar: 'مؤرشف' })}</option>
              </select>
            </div>
            <Button onClick={previewOperation} className="w-full bg-indigo-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              {t({ en: 'Preview Changes', ar: 'معاينة التغييرات' })}
            </Button>
          </div>
        )}

        {operation === 'delete' && (
          <div className="space-y-3">
            <div className="p-4 bg-red-50 rounded border-2 border-red-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">
                    {t({ en: 'Warning: Permanent Deletion', ar: 'تحذير: حذف دائم' })}
                  </p>
                  <p className="text-xs text-red-700">
                    {t({ 
                      en: 'This will permanently delete all selected items. This action cannot be undone.', 
                      ar: 'سيؤدي هذا إلى حذف جميع العناصر المحددة بشكل دائم. لا يمكن التراجع عن هذا الإجراء.' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={previewOperation} variant="destructive" className="w-full">
              <Trash2 className="h-4 w-4 mr-2" />
              {t({ en: 'Preview Deletion', ar: 'معاينة الحذف' })}
            </Button>
          </div>
        )}

        {showPreview && (
          <div className="p-4 bg-slate-50 rounded border-2 border-slate-300 space-y-3">
            <h4 className="font-semibold text-slate-900">
              {t({ en: 'Preview', ar: 'معاينة' })}
            </h4>
            <p className="text-sm text-slate-700">
              {operation === 'update' 
                ? t({ en: `Update ${selectedIds.length} items with new status: ${updateData.status}`, ar: `تحديث ${selectedIds.length} عنصر بحالة جديدة: ${updateData.status}` })
                : t({ en: `Delete ${selectedIds.length} items permanently`, ar: `حذف ${selectedIds.length} عنصر بشكل دائم` })
              }
            </p>
            <div className="flex gap-3">
              <Button onClick={executeOperation} disabled={executeMutation.isPending} className="flex-1">
                {t({ en: 'Confirm & Execute', ar: 'تأكيد وتنفيذ' })}
              </Button>
              <Button onClick={() => setShowPreview(false)} variant="outline">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}