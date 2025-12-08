import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Upload, Download, Database, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BulkDataOperations() {
  const { language, t } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState('Challenge');
  const [file, setFile] = useState(null);

  const uploadFile = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    }
  });

  const extractData = useMutation({
    mutationFn: async ({ fileUrl, schema }) => {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: schema
      });
      return result;
    }
  });

  const handleImport = async () => {
    if (!file) return;
    
    const fileUrl = await uploadFile.mutateAsync(file);
    const schema = await base44.entities[selectedEntity].schema();
    const result = await extractData.mutateAsync({ fileUrl, schema });
    
    if (result.status === 'success' && result.output) {
      await base44.entities[selectedEntity].bulkCreate(Array.isArray(result.output) ? result.output : [result.output]);
      alert(t({ en: 'Import successful', ar: 'نجح الاستيراد' }));
    }
  };

  const handleExport = async () => {
    const data = await base44.entities[selectedEntity].list();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEntity}_export.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Database className="h-8 w-8 text-blue-600" />
          {t({ en: 'Bulk Data Operations', ar: 'عمليات البيانات الجماعية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Import and export data in bulk', ar: 'استيراد وتصدير البيانات بشكل جماعي' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Select Entity', ar: 'اختر الكيان' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEntity} onValueChange={setSelectedEntity}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Challenge">Challenges</SelectItem>
              <SelectItem value="Pilot">Pilots</SelectItem>
              <SelectItem value="Solution">Solutions</SelectItem>
              <SelectItem value="RDProject">R&D Projects</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              {t({ en: 'Import Data', ar: 'استيراد البيانات' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".csv,.json,.xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded"
            />
            <Button onClick={handleImport} disabled={!file || uploadFile.isPending} className="w-full">
              {uploadFile.isPending ? t({ en: 'Importing...', ar: 'جاري الاستيراد...' }) : t({ en: 'Import', ar: 'استيراد' })}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-600" />
              {t({ en: 'Export Data', ar: 'تصدير البيانات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} className="w-full">
              {t({ en: 'Export as JSON', ar: 'تصدير كـ JSON' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}