import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function BulkImport() {
  const { language, isRTL, t } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState('Challenge');
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const entitySchemas = {
        Challenge: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            description_en: { type: 'string' },
            sector: { type: 'string' },
            municipality_id: { type: 'string' }
          }
        },
        Solution: {
          type: 'object',
          properties: {
            name_en: { type: 'string' },
            provider_name: { type: 'string' },
            provider_type: { type: 'string' },
            sectors: { type: 'array', items: { type: 'string' } }
          }
        }
      };

      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: entitySchemas[selectedEntity] || entitySchemas.Challenge
      });

      if (extracted.status === 'success' && extracted.output) {
        const data = Array.isArray(extracted.output) ? extracted.output : [extracted.output];
        await base44.entities[selectedEntity].bulkCreate(data);
        return { success: true, count: data.length };
      }
      throw new Error(extracted.details || 'Extraction failed');
    },
    onSuccess: (data) => {
      setResults(data);
      toast.success(t({ en: `${data.count} records imported`, ar: `تم استيراد ${data.count} سجلات` }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Bulk Data Import', ar: 'الاستيراد الجماعي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Import multiple records from CSV, Excel, or PDF files', ar: 'استيراد سجلات متعددة من ملفات CSV أو Excel أو PDF' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Import Configuration', ar: 'إعداد الاستيراد' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Entity Type', ar: 'نوع الكيان' })}</label>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Challenge">Challenges</SelectItem>
                <SelectItem value="Solution">Solutions</SelectItem>
                <SelectItem value="Municipality">Municipalities</SelectItem>
                <SelectItem value="Organization">Organizations</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t({ en: 'Upload File', ar: 'رفع ملف' })}</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-1">
                  {t({ en: 'Click to upload or drag and drop', ar: 'انقر للرفع أو اسحب وأفلت' })}
                </p>
                <p className="text-xs text-slate-500">CSV, Excel, or PDF files</p>
              </label>
            </div>
            {file && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
                </div>
              </div>
            )}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
            onClick={() => uploadMutation.mutate(file)}
            disabled={!file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            )}
            {t({ en: 'Import Data', ar: 'استيراد البيانات' })}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              {t({ en: 'Import Successful', ar: 'تم الاستيراد بنجاح' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-green-600 mb-2">{results.count}</p>
              <p className="text-sm text-slate-700">
                {t({ en: 'records imported successfully', ar: 'سجل تم استيراده بنجاح' })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Import Templates', ar: 'قوالب الاستيراد' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {['Challenge', 'Solution', 'Municipality', 'Organization'].map((entity) => (
              <Button key={entity} variant="outline" className="justify-start">
                <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {entity} Template
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(BulkImport, { requireAdmin: true });