import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageContext';
import { supabase } from '@/lib/supabase';

export default function ExportIdeasData() {
  const { t } = useLanguage();
  const [format, setFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  const { data: ideas = [] } = useQuery({
    queryKey: ['citizen-ideas-export'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data;
    }
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      if (format === 'csv') {
        const headers = ['ID', 'Title', 'Category', 'Status', 'Votes', 'Submitter', 'Date', 'Municipality'];
        const rows = ideas.map(i => [
          i.id,
          i.title,
          i.category,
          i.status,
          i.vote_count || 0,
          i.submitter_name || 'Anonymous',
          new Date(i.created_date).toLocaleDateString(),
          i.municipality_id || ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citizen-ideas-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else if (format === 'json') {
        const json = JSON.stringify(ideas, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `citizen-ideas-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }

      toast.success(t({ en: 'Export complete', ar: 'تم التصدير' }));
    } catch (error) {
      toast.error(t({ en: 'Export failed', ar: 'فشل التصدير' }));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={format} onValueChange={setFormat}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="csv">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV
            </div>
          </SelectItem>
          <SelectItem value="json">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              JSON
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleExport} disabled={exporting} variant="outline">
        {exporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {t({ en: 'Export', ar: 'تصدير' })} ({ideas.length})
      </Button>
    </div>
  );
}