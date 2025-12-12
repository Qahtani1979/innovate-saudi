import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageLayout from '@/components/PageLayout.jsx';
import PageHeader from '@/components/PageHeader.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { 
  Upload, Download, FileSpreadsheet, FileText, Database, 
  Loader2, CheckCircle, AlertCircle, FileUp, RefreshCw,
  History, Settings, Wand2
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/ProtectedPage';

const EXPORTABLE_ENTITIES = [
  { value: 'challenges', label: 'Challenges', table: 'challenges' },
  { value: 'solutions', label: 'Solutions', table: 'solutions' },
  { value: 'pilots', label: 'Pilots', table: 'pilots' },
  { value: 'programs', label: 'Programs', table: 'programs' },
  { value: 'providers', label: 'Providers', table: 'providers' },
  { value: 'organizations', label: 'Organizations', table: 'organizations' },
  { value: 'municipalities', label: 'Municipalities', table: 'municipalities' },
  { value: 'citizen_ideas', label: 'Citizen Ideas', table: 'citizen_ideas' },
  { value: 'events', label: 'Events', table: 'events' },
  { value: 'knowledge_base', label: 'Knowledge Base', table: 'knowledge_base' },
];

const IMPORTABLE_ENTITIES = [
  { value: 'challenges', label: 'Challenges', table: 'challenges' },
  { value: 'solutions', label: 'Solutions', table: 'solutions' },
  { value: 'pilots', label: 'Pilots', table: 'pilots' },
  { value: 'programs', label: 'Programs', table: 'programs' },
  { value: 'providers', label: 'Providers', table: 'providers' },
  { value: 'organizations', label: 'Organizations', table: 'organizations' },
  { value: 'events', label: 'Events', table: 'events' },
];

function ImportExportHub() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('export');
  
  // Export state
  const [exportEntity, setExportEntity] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState([]);
  const [exporting, setExporting] = useState(false);
  
  // Import state
  const [importEntity, setImportEntity] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  
  // Export history
  const { data: exportHistory = [] } = useQuery({
    queryKey: ['export-history'],
    queryFn: async () => {
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .eq('action', 'data_export')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  const handleExport = async () => {
    if (!exportEntity) {
      toast.error('Please select an entity to export');
      return;
    }

    setExporting(true);
    try {
      const entity = EXPORTABLE_ENTITIES.find(e => e.value === exportEntity);
      const { data, error } = await supabase
        .from(entity.table)
        .select('*')
        .limit(10000);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No data to export');
        return;
      }

      const filename = `${exportEntity}-${new Date().toISOString().split('T')[0]}`;
      
      if (exportFormat === 'csv') {
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => 
            headers.map(h => {
              const val = row[h];
              if (val === null || val === undefined) return '';
              if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
              return `"${String(val).replace(/"/g, '""')}"`;
            }).join(',')
          )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `${filename}.csv`);
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `${filename}.json`);
      }

      // Log export
      await supabase.from('access_logs').insert({
        action: 'data_export',
        entity_type: exportEntity,
        metadata: { format: exportFormat, count: data.length }
      });

      toast.success(`Exported ${data.length} ${entity.label} records`);
      queryClient.invalidateQueries(['export-history']);
    } catch (error) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    
    // Preview CSV content
    if (file.name.endsWith('.csv')) {
      const text = await file.text();
      const lines = text.split('\n').slice(0, 6);
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
      });
      setImportPreview({ headers, rows, totalLines: text.split('\n').length - 1 });
    } else if (file.name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      const items = Array.isArray(data) ? data : [data];
      setImportPreview({ 
        headers: items.length > 0 ? Object.keys(items[0]) : [],
        rows: items.slice(0, 5),
        totalLines: items.length
      });
    }
  };

  const handleImport = async () => {
    if (!importEntity || !importFile) {
      toast.error('Please select entity and file');
      return;
    }

    setImporting(true);
    try {
      const text = await importFile.text();
      let records = [];

      if (importFile.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        records = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || null }), {});
        });
      } else {
        const data = JSON.parse(text);
        records = Array.isArray(data) ? data : [data];
      }

      // Remove id fields to let database generate them
      records = records.map(r => {
        const { id, ...rest } = r;
        return rest;
      });

      const entity = IMPORTABLE_ENTITIES.find(e => e.value === importEntity);
      const { error } = await supabase.from(entity.table).insert(records);

      if (error) throw error;

      toast.success(`Imported ${records.length} records to ${entity.label}`);
      queryClient.invalidateQueries([importEntity]);
      setImportFile(null);
      setImportPreview(null);
    } catch (error) {
      toast.error('Import failed: ' + error.message);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = (entityValue) => {
    const entity = IMPORTABLE_ENTITIES.find(e => e.value === entityValue);
    const templates = {
      challenges: 'title_en,title_ar,description_en,description_ar,category,priority,status',
      solutions: 'title_en,title_ar,description_en,description_ar,category,technology_type,pricing_model',
      pilots: 'title_en,title_ar,description_en,description_ar,status,start_date,end_date',
      programs: 'title_en,title_ar,description_en,description_ar,program_type,status',
      providers: 'name_en,name_ar,description_en,description_ar,provider_type,website',
      organizations: 'name_en,name_ar,organization_type,website,email',
      events: 'title_en,title_ar,description_en,event_type,start_date,end_date,location',
    };
    
    const csv = templates[entityValue] || 'field1,field2,field3';
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `${entityValue}-template.csv`);
    toast.success('Template downloaded');
  };

  return (
    <ProtectedPage requiredPermissions={['data.import', 'data.export', 'admin']}>
      <PageLayout>
        <PageHeader 
          title={t({ en: "Import & Export Hub", ar: "مركز الاستيراد والتصدير" })}
          description={t({ en: "Centralized data import and export management", ar: "إدارة مركزية لاستيراد وتصدير البيانات" })}
          icon={<Database className="h-6 w-6" />}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {t({ en: "Export", ar: "تصدير" })}
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t({ en: "Import", ar: "استيراد" })}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t({ en: "History", ar: "السجل" })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    {t({ en: "Export Data", ar: "تصدير البيانات" })}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: "Export entity data to CSV or JSON format", ar: "تصدير بيانات الكيان بتنسيق CSV أو JSON" })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t({ en: "Select Entity", ar: "اختر الكيان" })}</Label>
                    <Select value={exportEntity} onValueChange={setExportEntity}>
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: "Choose entity to export", ar: "اختر الكيان للتصدير" })} />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPORTABLE_ENTITIES.map(entity => (
                          <SelectItem key={entity.value} value={entity.value}>
                            {entity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: "Export Format", ar: "تنسيق التصدير" })}</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={exportFormat === 'csv' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('csv')}
                        className="flex-1"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        CSV/Excel
                      </Button>
                      <Button
                        variant={exportFormat === 'json' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExportFormat('json')}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleExport} 
                    disabled={!exportEntity || exporting}
                    className="w-full"
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {t({ en: "Export Data", ar: "تصدير البيانات" })}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: "Quick Export", ar: "تصدير سريع" })}</CardTitle>
                  <CardDescription>
                    {t({ en: "One-click export for common entities", ar: "تصدير بنقرة واحدة للكيانات الشائعة" })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPORTABLE_ENTITIES.slice(0, 6).map(entity => (
                      <Button
                        key={entity.value}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExportEntity(entity.value);
                          setExportFormat('csv');
                        }}
                      >
                        {entity.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" />
                    {t({ en: "Import Data", ar: "استيراد البيانات" })}
                  </CardTitle>
                  <CardDescription>
                    {t({ en: "Upload CSV or JSON files to import data", ar: "رفع ملفات CSV أو JSON لاستيراد البيانات" })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t({ en: "Target Entity", ar: "الكيان المستهدف" })}</Label>
                    <Select value={importEntity} onValueChange={setImportEntity}>
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: "Choose target entity", ar: "اختر الكيان المستهدف" })} />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPORTABLE_ENTITIES.map(entity => (
                          <SelectItem key={entity.value} value={entity.value}>
                            {entity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: "Upload File", ar: "رفع الملف" })}</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        className="hidden"
                        id="import-file"
                      />
                      <label htmlFor="import-file" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {importFile ? importFile.name : t({ en: "Click to upload CSV or JSON", ar: "انقر لرفع CSV أو JSON" })}
                        </p>
                      </label>
                    </div>
                  </div>

                  {importPreview && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <p className="font-medium mb-1">
                        {t({ en: "Preview", ar: "معاينة" })}: {importPreview.totalLines} {t({ en: "records", ar: "سجل" })}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {t({ en: "Fields", ar: "الحقول" })}: {importPreview.headers.join(', ')}
                      </p>
                    </div>
                  )}

                  <Button 
                    onClick={handleImport} 
                    disabled={!importEntity || !importFile || importing}
                    className="w-full"
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t({ en: "Import Data", ar: "استيراد البيانات" })}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t({ en: "Import Templates", ar: "قوالب الاستيراد" })}</CardTitle>
                  <CardDescription>
                    {t({ en: "Download templates with correct column headers", ar: "تحميل القوالب مع عناوين الأعمدة الصحيحة" })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPORTABLE_ENTITIES.map(entity => (
                      <Button
                        key={entity.value}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate(entity.value)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        {entity.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: "Export History", ar: "سجل التصدير" })}</CardTitle>
                <CardDescription>
                  {t({ en: "Recent data export operations", ar: "عمليات تصدير البيانات الأخيرة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {exportHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ en: "No export history yet", ar: "لا يوجد سجل تصدير حتى الآن" })}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {exportHistory.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="font-medium capitalize">{log.entity_type}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {log.metadata?.format?.toUpperCase() || 'CSV'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageLayout>
    </ProtectedPage>
  );
}

export default ImportExportHub;
