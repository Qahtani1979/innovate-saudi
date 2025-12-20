import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { EmptyState } from './shared/LookupTableStyles';

export default function CustomEntriesTab() {
  const { isRTL, t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: customEntries = [], isLoading } = useQuery({
    queryKey: ['custom-entries-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_entries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reviewNotes }) => {
      const { error } = await supabase
        .from('custom_entries')
        .update({
          status,
          review_notes: reviewNotes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;

      // If approved, add to the appropriate lookup table
      if (status === 'approved') {
        const entry = customEntries.find(e => e.id === id);
        if (entry) {
          const table = entry.entry_type === 'department' ? 'lookup_departments' : 'lookup_specializations';
          await supabase.from(table).insert({
            name_en: entry.name_en,
            name_ar: entry.name_ar,
            is_active: true,
            display_order: 99
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['custom-entries-admin']);
      queryClient.invalidateQueries(['lookup-departments-admin']);
      queryClient.invalidateQueries(['lookup-specializations-admin']);
      toast.success(t({ en: 'Entry reviewed', ar: 'تمت المراجعة' }));
    },
    onError: () => toast.error(t({ en: 'Failed to review', ar: 'فشل في المراجعة' }))
  });

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
