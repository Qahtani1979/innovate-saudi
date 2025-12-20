import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExportPDFButton({ data, filename, title }) {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = async () => {
    setExporting(true);
    try {
      // Simple text-based export for now
      const content = `
${title}
Generated: ${new Date().toLocaleDateString()}

${JSON.stringify(data, null, 2)}
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename || 'export'}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast.success('Exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToPDF}
      disabled={exporting}
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      Export
    </Button>
  );
}