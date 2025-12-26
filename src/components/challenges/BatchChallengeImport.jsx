import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useImportChallenges } from '@/hooks/useChallengeMutations';
import * as usePlatformCore from '@/hooks/usePlatformCore';

export default function BatchChallengeImport() {
  const { language, t } = useLanguage();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processing, setProcessing] = useState(false);

  const importMutation = useImportChallenges();
  const { uploadMutation } = usePlatformCore.useFileStorage();

  // Wrapper to match previous behavior of clearing state on success
  const handleImport = () => {
    importMutation.mutate(preview, {
      onSuccess: () => {
        setFile(null);
        setPreview(null);
      }
    });
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setProcessing(true);

    try {
      // Use the Gold Standard hook for file uploads
      await uploadMutation.mutateAsync({
        file: selectedFile,
        bucket: 'uploads'
      });

      // For now, show a placeholder - real parsing would use an edge function
      toast.info(t({ en: 'File uploaded. Manual parsing needed for now.', ar: 'تم تحميل الملف. يلزم التحليل اليدوي حاليًا.' }));
      setProcessing(false);
    } catch (error) {
      setProcessing(false);
    }
  };

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
