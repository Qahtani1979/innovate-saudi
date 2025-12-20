import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/lib/supabase';

export default function IdeaBulkActions({ selectedIds, onComplete }) {
  const { t } = useLanguage();
  const [action, setAction] = useState('');
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, ids }) => {
      const updates = {
        approve: { status: 'approved' },
        reject: { status: 'rejected' },
        review: { status: 'under_review' }
      };

      const promises = ids.map(async (id) => {
        const { error } = await supabase
          .from('citizen_ideas')
          .update(updates[action])
          .eq('id', id);

        if (error) throw error;
      });

      return await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas']);
      toast.success(t({ en: `${selectedIds.length} ideas updated`, ar: `تم تحديث ${selectedIds.length} أفكار` }));
      if (onComplete) onComplete();
    }
  });

  const handleBulkAction = () => {
    if (!action || selectedIds.length === 0) return;
    bulkUpdateMutation.mutate({ action, ids: selectedIds });
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
              Approve All
            </div>
          </SelectItem>
          <SelectItem value="reject">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Reject All
            </div>
          </SelectItem>
          <SelectItem value="review">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-yellow-600" />
              Mark for Review
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button
        onClick={handleBulkAction}
        disabled={!action || bulkUpdateMutation.isPending}
        className="bg-blue-600"
      >
        {bulkUpdateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {t({ en: 'Apply', ar: 'تطبيق' })}
      </Button>
    </div>
  );
}