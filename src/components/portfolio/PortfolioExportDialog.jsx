import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { FileText, Table, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function PortfolioExportDialog({ open, onClose, data }) {
  const { language, isRTL, t } = useLanguage();
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    title: true,
    sector: true,
    status: true,
    budget: true,
    kpis: true,
    timeline: true
  });

  const handleExport = async () => {
    setLoading(true);
    try {
      if (format === 'pdf') {
        const content = `Portfolio Export\n\nTotal Items: ${data.length}\n\n` +
          data.map((item, i) => 
            `${i + 1}. ${item.title_en}\n` +
            (fields.sector ? `   Sector: ${item.sector}\n` : '') +
            (fields.status ? `   Status: ${item.status}\n` : '') +
            (fields.budget ? `   Budget: ${item.budget || 'N/A'}\n` : '')
          ).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-export.txt';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const csvContent = [
          Object.keys(fields).filter(k => fields[k]).join(','),
          ...data.map(item => 
            Object.keys(fields).filter(k => fields[k]).map(k => item[k] || '').join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-export.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(t({ en: 'Export successful', ar: 'نجح التصدير' }));
      onClose();
    } catch (error) {
      toast.error(t({ en: 'Export failed', ar: 'فشل التصدير' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t({ en: 'Export Portfolio', ar: 'تصدير المحفظة' })}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">{t({ en: 'Format', ar: 'التنسيق' })}</p>
            <div className="flex gap-3">
              <Button
                variant={format === 'pdf' ? 'default' : 'outline'}
                onClick={() => setFormat('pdf')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant={format === 'excel' ? 'default' : 'outline'}
                onClick={() => setFormat('excel')}
                className="flex-1"
              >
                <Table className="h-4 w-4 mr-2" />
                Excel/CSV
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">{t({ en: 'Include Fields', ar: 'تضمين الحقول' })}</p>
            <div className="space-y-2">
              {Object.keys(fields).map(field => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    checked={fields[field]}
                    onCheckedChange={(checked) => setFields({ ...fields, [field]: checked })}
                  />
                  <label className="text-sm">{field}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              {t({ en: `${data.length} items will be exported`, ar: `سيتم تصدير ${data.length} عنصر` })}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t({ en: 'Cancel', ar: 'إلغاء' })}
          </Button>
          <Button onClick={handleExport} disabled={loading} className="bg-blue-600">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t({ en: 'Export', ar: 'تصدير' })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
