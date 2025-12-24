import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDataImportExport } from '@/hooks/useDataImportExport';
import { useLocations } from '@/hooks/useLocations';
import { useSectors } from '@/hooks/useSectors';
import { useProviders } from '@/hooks/useProviders';

import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import {
  Upload, Download, FileSpreadsheet, FileText, Database,
  Loader2, CheckCircle, FileUp,
  History, Wand2, Filter, XCircle, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function ImportExportHub() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('ai-uploader'); // Intentionally keeping 'ai-uploader' as default/first tab concept if needed, or 'export'

  // Hooks
  const {
    ENTITY_DEFINITIONS,
    exportHistory: { data: exportHistory = [] },
    importHistory: { data: importHistory = [] },
    handleExport: executeExport,
    handleImport: executeImport,
    checkDuplicates,
    downloadTemplate
  } = useDataImportExport();

  const { useRegions, useCities, useMunicipalities } = useLocations();
  const { data: sectors = [] } = useSectors();
  const { data: regions = [] } = useRegions();
  const { data: municipalities = [] } = useMunicipalities();
  const { data: providers = [] } = useProviders();

  // Derived constants
  const EXPORTABLE_ENTITIES = useMemo(() => Object.entries(ENTITY_DEFINITIONS).map(([value, def]) => ({
    value,
    label: def.label,
    table: def.table
  })), [ENTITY_DEFINITIONS]);

  const IMPORTABLE_ENTITIES = useMemo(() => Object.entries(ENTITY_DEFINITIONS)
    .filter(([_, def]) => !def.exportOnly)
    .map(([value, def]) => ({
      value,
      label: def.label,
      table: def.table
    })), [ENTITY_DEFINITIONS]);

  // Export state
  const [exportEntity, setExportEntity] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    includeDeleted: false,
    publishedOnly: false,
    dateFrom: '',
    dateTo: '',
    status: ''
  });
  const [selectedFields, setSelectedFields] = useState([]);

  // Import state
  const [importEntity, setImportEntity] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [useAIExtraction, setUseAIExtraction] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // Get available fields for selected export entity
  const availableFields = useMemo(() => {
    if (!exportEntity || !ENTITY_DEFINITIONS[exportEntity]) return [];
    return ENTITY_DEFINITIONS[exportEntity].templateColumns;
  }, [exportEntity, ENTITY_DEFINITIONS]);

  // Reset selected fields when entity changes
  React.useEffect(() => {
    if (availableFields.length > 0) {
      setSelectedFields(availableFields);
    }
  }, [availableFields]);

  const onExportClick = async () => {
    setExporting(true);
    try {
      await executeExport({
        exportEntity,
        exportFilters,
        selectedFields,
        exportFormat,
        lookups: { sectors, regions, municipalities, providers }
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportFile(file);
    setValidationErrors([]);
    setImportPreview(null);

    try {
      // Preview CSV content
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n');
        // Simple CSV parser for preview
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1, 6).filter(l => l.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
        });

        // Full data for import
        const fullRows = lines.slice(1).filter(l => l.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
        });

        setImportPreview({
          headers,
          rows,
          totalLines: lines.length - 1,
          fullData: fullRows
        });

      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : [data];
        setImportPreview({
          headers: items.length > 0 ? Object.keys(items[0]) : [],
          rows: items.slice(0, 5),
          totalLines: items.length,
          fullData: items
        });
      }
    } catch (error) {
      toast.error('Error reading file');
      console.error(error);
    }
  };

  const handleImport = async () => {
    if (!importEntity || !importPreview?.fullData) return;

    setImporting(true);
    try {
      await executeImport({
        importEntity,
        data: importPreview.fullData
      });
      toast.success(t({ en: "Import successful", ar: "تم الاستيراد بنجاح" }));
      setImportFile(null);
      setImportPreview(null);
      setImportEntity('');
    } catch (error) {
      toast.error(t({ en: "Import failed: ", ar: "فشل الاستيراد: " }) + error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={t({ en: "Import/Export Hub", ar: "مركز الاستيراد والتصدير" })}
        breadcrumbItems={[
          { label: t({ en: "Admin", ar: "الإدارة" }), href: "/admin" },
          { label: t({ en: "Data Management", ar: "إدارة البيانات" }) }
        ]}
      />

      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t({ en: "Export Data", ar: "تصدير البيانات" })}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t({ en: "Import Data", ar: "استيراد البيانات" })}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t({ en: "History & Logs", ar: "السجلات والتاريخ" })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: "Export Settings", ar: "إعدادات التصدير" })}</CardTitle>
              <CardDescription>
                {t({ en: "Select entity and format to export data", ar: "اختر الكيان والصيغة لتصدير البيانات" })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t({ en: "Entity", ar: "الكيان" })}</Label>
                  <Select value={exportEntity} onValueChange={setExportEntity}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: "Select entity", ar: "اختر الكيان" })} />
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
                  <Label>{t({ en: "Format", ar: "الصيغة" })}</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Excel)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {exportEntity && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">{t({ en: "Filters & Options", ar: "المرشحات والخيارات" })}</Label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="publishedOnly"
                        checked={exportFilters.publishedOnly}
                        onCheckedChange={(checked) => setExportFilters(prev => ({ ...prev, publishedOnly: checked }))}
                      />
                      <Label htmlFor="publishedOnly" className="cursor-pointer">
                        {t({ en: "Published records only", ar: "السجلات المنشورة فقط" })}
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includeDeleted"
                        checked={exportFilters.includeDeleted}
                        onCheckedChange={(checked) => setExportFilters(prev => ({ ...prev, includeDeleted: checked }))}
                      />
                      <Label htmlFor="includeDeleted" className="cursor-pointer text-destructive">
                        {t({ en: "Include deleted records", ar: "تضمين السجلات المحذوفة" })}
                      </Label>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{t({ en: "Status", ar: "الحالة" })}</Label>
                      <Input
                        placeholder="Filter by status..."
                        value={exportFilters.status}
                        onChange={(e) => setExportFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={onExportClick}
                disabled={!exportEntity || exporting}
                className="w-full sm:w-auto"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: "Exporting...", ar: "جاري التصدير..." })}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    {t({ en: "Start Export", ar: "بدء التصدير" })}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
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
                  {t({ en: "Upload CSV or JSON files", ar: "رفع ملفات CSV أو JSON" })}
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
                  <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
                    <p className="font-medium">
                      {t({ en: "Preview", ar: "معاينة" })}: {importPreview.totalLines} {t({ en: "records", ar: "سجل" })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t({ en: "Headers", ar: "العناوين" })}: {importPreview.headers.join(', ')}
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
                  {t({ en: "Download templates with all required column headers", ar: "تحميل القوالب مع جميع عناوين الأعمدة المطلوبة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[320px]">
                  <div className="grid grid-cols-2 gap-2 pr-4">
                    {IMPORTABLE_ENTITIES.map(entity => (
                      <Button
                        key={entity.value}
                        variant="outline"
                        size="sm"
                        onClick={() => downloadTemplate(entity.value)}
                        className="justify-start text-xs"
                      >
                        <Download className="h-3 w-3 mr-1 shrink-0" />
                        <span className="truncate">{entity.label}</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  {t({ en: "Export History", ar: "سجل التصدير" })}
                </CardTitle>
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
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {exportHistory.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="font-medium capitalize text-sm">{log.entity_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()} • {log.metadata?.count || 0} records
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {log.metadata?.format?.toUpperCase() || 'CSV'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  {t({ en: "Import History", ar: "سجل الاستيراد" })}
                </CardTitle>
                <CardDescription>
                  {t({ en: "Recent data import operations", ar: "عمليات استيراد البيانات الأخيرة" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {t({ en: "No import history yet", ar: "لا يوجد سجل استيراد حتى الآن" })}
                  </p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-4">
                      {importHistory.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="font-medium capitalize text-sm">{log.entity_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleString()} • {log.metadata?.count || 0} records
                              </p>
                            </div>
                          </div>
                          <Badge variant={log.metadata?.method === 'ai' ? 'default' : 'secondary'}>
                            {log.metadata?.method === 'ai' ? 'AI' : 'Direct'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(ImportExportHub, { requiredPermissions: ['data.import', 'data.export', 'admin'] });
