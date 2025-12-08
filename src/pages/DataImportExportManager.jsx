import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '../components/permissions/ProtectedPage';

function DataImportExportManager() {
  const { language, isRTL, t } = useLanguage();
  const [file, setFile] = useState(null);

  const handleExport = async (entityType) => {
    // Export functionality placeholder
    alert(`Exporting ${entityType} data...`);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Data Import/Export Manager', ar: 'مدير استيراد/تصدير البيانات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Bulk data operations and migrations', ar: 'عمليات البيانات الجماعية والترحيل' })}
        </p>
      </div>

      <Tabs defaultValue="export">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export">{t({ en: 'Export', ar: 'تصدير' })}</TabsTrigger>
          <TabsTrigger value="import">{t({ en: 'Import', ar: 'استيراد' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Export Data', ar: 'تصدير البيانات' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['Challenge', 'Pilot', 'Solution', 'Municipality', 'RDProject', 'Program'].map(entity => (
                <div key={entity} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-slate-900">{entity}</span>
                  </div>
                  <Button onClick={() => handleExport(entity)} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    {t({ en: 'Export CSV', ar: 'تصدير CSV' })}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Import Data', ar: 'استيراد البيانات' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">
                  {t({ en: 'Upload CSV or Excel file', ar: 'رفع ملف CSV أو Excel' })}
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button as="span" className="cursor-pointer">
                    {t({ en: 'Choose File', ar: 'اختر ملف' })}
                  </Button>
                </label>
                {file && (
                  <p className="text-sm text-green-600 mt-3">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {file.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(DataImportExportManager, { requiredPermissions: [], requiredRoles: ['Super Admin', 'Data Manager'] });