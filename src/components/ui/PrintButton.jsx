import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

export default function PrintButton({ targetId }) {
  const handlePrint = () => {
    if (targetId) {
      const printContent = document.getElementById(targetId);
      if (printContent) {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
          <html>
            <head>
              <title>Print</title>
              <style>
                body { font-family: system-ui; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                @media print {
                  button, .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint} className="no-print">
      <Printer className="h-4 w-4 mr-2" />
      Print
    </Button>
  );
}