import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function CoverageReportExporter({ reportData, reportName }) {
  const exportToJSON = () => {
    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  const exportToText = () => {
    const text = `
${reportName.toUpperCase()}
Generated: ${new Date().toLocaleString()}

${JSON.stringify(reportData, null, 2)}
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={exportToJSON}>
        <Download className="h-3 w-3 mr-2" />
        JSON
      </Button>
      <Button size="sm" variant="outline" onClick={exportToText}>
        <FileText className="h-3 w-3 mr-2" />
        Text
      </Button>
    </div>
  );
}
