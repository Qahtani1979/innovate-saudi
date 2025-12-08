import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BatchChallengeImport() {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title_en: { type: "string" },
                  title_ar: { type: "string" },
                  description_en: { type: "string" },
                  sector: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success') {
        setPreview(result.output.challenges || []);
        toast.success(t({ en: `${result.output.challenges?.length || 0} challenges extracted`, ar: `${result.output.challenges?.length || 0} تحدي مستخرج` }));
      } else {
        toast.error(result.details || 'Extraction failed');
      }
    } catch (error) {
      toast.error(t({ en: 'File processing failed', ar: 'فشلت معالجة الملف' }));
    } finally {
      setProcessing(false);
    }
  };

  const importMutation = useMutation({
    mutationFn: async (challenges) => {
      const results = await Promise.allSettled(
        challenges.map(c => base44.entities.Challenge.create({
          ...c,
          status: 'draft',
          priority: c.priority || 'medium'
        }))
      );
      return results.filter(r => r.status === 'fulfilled').length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries(['challenges']);
      toast.success(t({ en: `${count} challenges imported`, ar: `${count} تحدي مستورد` }));
      setFile(null);
      setPreview(null);
    }
  });

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          {t({ en: 'Batch Import Challenges', ar: 'استيراد التحديات بالجملة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {!preview && (
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-4">
              {t({ en: 'Upload Excel or CSV file with challenges', ar: 'حمّل ملف Excel أو CSV بالتحديات' })}
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={processing}
            />
            <label htmlFor="file-upload">
              <Button asChild disabled={processing} className="bg-blue-600">
                <span>
                  {processing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t({ en: 'Select File', ar: 'اختر ملف' })}
                </span>
              </Button>
            </label>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  {t({ en: `${preview.length} challenges ready`, ar: `${preview.length} تحدي جاهز` })}
                </span>
              </div>
              <Badge className="bg-green-600">{t({ en: 'Validated', ar: 'مُتحقق' })}</Badge>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {preview.map((ch, i) => (
                <div key={i} className="p-3 bg-white rounded border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-slate-900">{ch.title_en || ch.title_ar}</h4>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ch.description_en}</p>
                      <div className="flex gap-2 mt-2">
                        {ch.sector && <Badge variant="outline" className="text-xs">{ch.sector}</Badge>}
                        {ch.priority && <Badge variant="outline" className="text-xs">{ch.priority}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button onClick={() => { setFile(null); setPreview(null); }} variant="outline" className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
              <Button 
                onClick={() => importMutation.mutate(preview)} 
                disabled={importMutation.isPending}
                className="flex-1 bg-blue-600"
              >
                {importMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Import All', ar: 'استيراد الكل' })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}