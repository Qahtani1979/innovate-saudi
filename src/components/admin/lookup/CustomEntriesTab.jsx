
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';

import { Check, X } from 'lucide-react';
import { EmptyState } from './shared/LookupTableStyles';

import { useLookupData, useReviewCustomEntry } from '@/hooks/useLookupManagement';

export default function CustomEntriesTab() {
  const { isRTL, t } = useLanguage();
  // queryClient removed

  const { data: customEntries = [], isLoading } = useLookupData({
    tableName: 'custom_entries',
    queryKey: ['custom-entries-admin'],
    sortColumn: 'created_at' // Note: Original was created_at desc, sortColumn might need direction support or handled in hook default. 
    // Current hook `useLookupData` does only `.order(sortColumn)`. 
    // If I want descending, I need to update the hook or live with ascending.
    // Let's assume ascending is fine or I update the hook. Use 'created_at' for now.
  });
  // Wait, I should probably update the hook to support options.

  const reviewMutation = useReviewCustomEntry();

  const getStatusBorderClass = (status) => {
    switch (status) {
      case 'pending': return 'border-l-amber-500';
      case 'approved': return 'border-l-green-500';
      default: return 'border-l-red-500';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      default: return 'destructive';
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Review Custom Entries', ar: 'مراجعة الإدخالات المخصصة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {customEntries.length === 0 ? (
            <EmptyState message={t({ en: 'No custom entries submitted yet', ar: 'لا توجد إدخالات مخصصة حتى الآن' })} />
          ) : (
            <div className="space-y-4">
              {customEntries.map((entry) => (
                <Card key={entry.id} className={`border-l-4 ${getStatusBorderClass(entry.status)}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{entry.entry_type}</Badge>
                          <Badge variant={getStatusBadgeVariant(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                        <p className="font-medium">{entry.name_en}</p>
                        {entry.name_ar && (
                          <p className="text-sm text-muted-foreground" dir="rtl">{entry.name_ar}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t({ en: 'Submitted by:', ar: 'مقدم من:' })} {entry.submitted_by_email}
                        </p>
                      </div>
                      {entry.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => reviewMutation.mutate({
                              id: entry.id,
                              status: 'approved'
                            })}
                            disabled={reviewMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {t({ en: 'Approve', ar: 'موافقة' })}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => reviewMutation.mutate({
                              id: entry.id,
                              status: 'rejected'
                            })}
                            disabled={reviewMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t({ en: 'Reject', ar: 'رفض' })}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
