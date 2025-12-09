import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function ChallengeImport() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(';').map(h => h.trim());
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(';').map(v => v.trim().replace(/^"|"$/g, ''));
      const record = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      data.push(record);
    }
    
    return data;
  };

  const mapToEntity = (record) => {
    const statusMap = {
      'قائم': 'active',
      'غير قائم': 'inactive',
      'مسودة': 'draft',
      'مُقدّم': 'submitted',
      'قيد المراجعة': 'under_review',
      'معتمد': 'approved',
      'قيد المعالجة': 'in_treatment',
      'محلول': 'resolved',
      'مؤرشف': 'archived'
    };

    const relationMap = {
      'ارتباط كلي': 'full_relation',
      'ارتباط جزئي': 'partial_relation',
      'لا يوجد': 'none'
    };

    const typeMap = {
      'تشغيلي': 'operational',
      'تنظيمي': 'regulatory',
      'استراتيجي': 'strategic'
    };

    return {
      code: record['معرف التحدي'],
      title_ar: record['عنوان التحدي  بالعربي'],
      title_en: record['عنوان التحدي بالانجليزية '] || record['عنوان التحدي  بالعربي'],
      description_ar: record['وصف التحدي'],
      description_en: record['وصف التحدي'],
      root_cause_ar: record['السبب الجذري'],
      root_cause_en: record['السبب الجذري'],
      theme: record['الثيم '],
      keywords: record['الكلمات المفتاحية'] ? record['الكلمات المفتاحية'].split(',').map(k => k.trim()) : [],
      challenge_type: typeMap[record['نوع التحدي']] || 'other',
      challenge_relation: relationMap[record['ارتباط التحدي']] || '',
      challenge_owner: record['مالك التحدي'],
      sector: 'environment',
      sub_sector: record['المجال الفرعي'],
      ministry_service: record['الخدمة من الورازة '],
      responsible_agency: record['الوكالة المسؤولة'],
      department: record['الادارة'],
      entry_date: record['تاريخ الإدخال'],
      processing_date: record['تاريخ المعالجة'],
      source: record['مصدر التحدي'],
      strategic_goal: record['الهدف الاستراتيجي المرتبط'],
      related_challenge_id: record['معرف التحدي المرتبط'],
      related_questions_count: parseInt(record['عدد الاسئلة المرتبط في التحدي']) || 0,
      reviewer: record['المسؤول عن المراجعة'],
      status: statusMap[record['حالة التحدي']] || 'draft',
      municipality_id: 'default-municipality',
      priority: 'tier_3',
      is_published: true
    };
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCSV(text);
        const mapped = parsed.map(mapToEntity);
        setParsedData(mapped);
        toast.success(`${mapped.length} challenges parsed successfully`);
      } catch (error) {
        toast.error('Failed to parse file: ' + error.message);
      }
    };

    reader.readAsText(uploadedFile, 'UTF-8');
  };

  const translateMissingFields = async () => {
    setTranslating(true);
    const translated = [];

    for (let i = 0; i < parsedData.length; i++) {
      const record = { ...parsedData[i] };
      setProgress((i / parsedData.length) * 100);

      try {
        const prompt = `Translate the following challenge data from Arabic to English. Return JSON only.

Arabic Title: ${record.title_ar}
Arabic Description: ${record.description_ar}
Arabic Root Cause: ${record.root_cause_ar}

Return:
{
  "title_en": "...",
  "description_en": "...",
  "root_cause_en": "..."
}`;

        const result = await invokeAI({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              title_en: { type: "string" },
              description_en: { type: "string" },
              root_cause_en: { type: "string" }
            }
          }
        });

        if (result.success) {
          record.title_en = result.data.title_en || record.title_ar;
          record.description_en = result.data.description_en || record.description_ar;
          record.root_cause_en = result.data.root_cause_en || record.root_cause_ar;
        }
      } catch (error) {
        console.error('Translation failed for record', i, error);
      }

      translated.push(record);
    }

    setParsedData(translated);
    setProgress(100);
    setTranslating(false);
    toast.success('Translation complete!');
  };

  const enrichWithAI = async () => {
    setEnriching(true);
    const enriched = [];

    for (let i = 0; i < parsedData.length; i++) {
      const record = { ...parsedData[i] };
      setProgress((i / parsedData.length) * 100);

      try {
        const prompt = `Analyze this challenge and enrich with AI scoring and classification:

Title: ${record.title_en}
Description: ${record.description_en}
Sector: ${record.sector}

Generate:
1. Severity score (0-100)
2. Impact score (0-100)
3. Keywords (5-7 terms)
4. Root causes array (3-5 specific causes)
5. Affected services (2-4 municipal services)
6. Priority tier (1-4, where 1=critical)
7. Theme category`;

        const result = await invokeAI({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              severity_score: { type: 'number' },
              impact_score: { type: 'number' },
              keywords: { type: 'array', items: { type: 'string' } },
              root_causes: { type: 'array', items: { type: 'string' } },
              affected_services: { type: 'array', items: { type: 'string' } },
              priority_tier: { type: 'number' },
              theme: { type: 'string' }
            }
          }
        });

        if (result.success) {
          record.severity_score = result.data.severity_score || 50;
          record.impact_score = result.data.impact_score || 50;
          record.overall_score = Math.round((record.severity_score + record.impact_score) / 2);
          record.keywords = result.data.keywords || [];
          record.root_causes = result.data.root_causes || [];
          record.affected_services = result.data.affected_services || [];
          record.priority = `tier_${result.data.priority_tier || 3}`;
          record.theme = result.data.theme || '';
        }
      } catch (error) {
        console.error('Enrichment failed for record', i, error);
      }

      enriched.push(record);
    }

    setParsedData(enriched);
    setProgress(100);
    setEnriching(false);
    toast.success(t({ en: 'AI enrichment complete!', ar: 'اكتمل الإثراء الذكي!' }));
  };

  const handleImport = async () => {
    if (parsedData.length === 0) {
      toast.error('No data to import');
      return;
    }

    setImporting(true);
    setProgress(0);
    const imported = [];
    const failed = [];

    for (let i = 0; i < parsedData.length; i++) {
      try {
        await base44.entities.Challenge.create(parsedData[i]);
        imported.push(parsedData[i].code);
        setProgress(((i + 1) / parsedData.length) * 100);
      } catch (error) {
        failed.push({ code: parsedData[i].code, error: error.message });
      }
    }

    setImporting(false);
    setResults({ imported, failed });
    queryClient.invalidateQueries(['challenges']);
    
    if (failed.length === 0) {
      toast.success(`Successfully imported ${imported.length} challenges`);
    } else {
      toast.warning(`Imported ${imported.length}, failed ${failed.length}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Import Challenges', ar: 'استيراد التحديات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Bulk import challenges from CSV/TXT file', ar: 'استيراد جماعي للتحديات من ملف CSV/TXT' })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            {t({ en: 'Step 1: Upload File', ar: 'الخطوة 1: رفع الملف' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">
                {t({ en: 'Click to upload TXT or CSV file', ar: 'انقر لرفع ملف TXT أو CSV' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t({ en: 'Semicolon-delimited format', ar: 'تنسيق مفصول بفاصلة منقوطة' })}
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">{file.name}</span>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {parsedData.length} {t({ en: 'records', ar: 'سجل' })}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {t({ en: 'Step 2: AI Translation (Optional)', ar: 'الخطوة 2: الترجمة بالذكاء الاصطناعي' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                {t({ 
                  en: 'Use AI to translate Arabic fields to English for better matching and analysis.', 
                  ar: 'استخدم الذكاء الاصطناعي لترجمة الحقول العربية إلى الإنجليزية لتحسين المطابقة والتحليل.' 
                })}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={translateMissingFields}
                  disabled={translating || enriching}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {translating ? (
                    <>
                      <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                      {t({ en: 'Translating...', ar: 'جاري الترجمة...' })} {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'Translate to English', ar: 'ترجمة للإنجليزية' })}
                    </>
                  )}
                </Button>

                <Button
                  onClick={enrichWithAI}
                  disabled={enriching || translating}
                  className="bg-gradient-to-r from-blue-600 to-teal-600"
                >
                  {enriching ? (
                    <>
                      <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                      {t({ en: 'Enriching...', ar: 'جاري الإثراء...' })} {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t({ en: 'AI Enrich (Score, KPIs)', ar: 'إثراء ذكي (نقاط، مؤشرات)' })}
                    </>
                  )}
                </Button>
              </div>

              {(translating || enriching) && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-slate-500">
                    {t({ en: 'Processing', ar: 'معالجة' })} {Math.round(progress)}% {t({ en: 'complete...', ar: 'مكتمل...' })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t({ en: 'Step 3: Preview Data', ar: 'الخطوة 3: معاينة البيانات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Code', ar: 'الرمز' })}</th>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Title (AR)', ar: 'العنوان (ع)' })}</th>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Title (EN)', ar: 'العنوان (EN)' })}</th>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Score', ar: 'النقاط' })}</th>
                      <th className="text-left p-2 font-semibold">{t({ en: 'Owner', ar: 'المالك' })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 20).map((record, i) => (
                      <tr key={i} className="border-b hover:bg-slate-50">
                        <td className="p-2 font-mono text-xs">{record.code}</td>
                        <td className="p-2 max-w-xs truncate" dir="rtl">{record.title_ar}</td>
                        <td className="p-2 max-w-xs truncate">{record.title_en}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{record.status}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">{record.overall_score || '-'}</Badge>
                        </td>
                        <td className="p-2 text-xs">{record.challenge_owner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 20 && (
                  <p className="text-xs text-slate-500 text-center mt-3">
                    Showing 20 of {parsedData.length} records
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {t({ en: 'Step 4: Import to Database', ar: 'الخطوة 4: الاستيراد إلى قاعدة البيانات' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  {t({ 
                    en: `Ready to import ${parsedData.length} challenges to the database.`, 
                    ar: `جاهز لاستيراد ${parsedData.length} تحدي إلى قاعدة البيانات.` 
                  })}
                </p>
              </div>

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600"
                size="lg"
              >
                {importing ? (
                  <>
                    <Loader2 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                    {t({ en: 'Importing...', ar: 'جاري الاستيراد...' })} {Math.round(progress)}%
                  </>
                ) : (
                  <>
                    <Upload className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t({ en: 'Start Import', ar: 'بدء الاستيراد' })}
                  </>
                )}
              </Button>

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-slate-600 text-center">
                    {Math.round(progress)}% {t({ en: 'complete', ar: 'مكتمل' })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {results.failed.length === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  {t({ en: 'Import Results', ar: 'نتائج الاستيراد' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{results.imported.length}</p>
                    <p className="text-sm text-green-600">{t({ en: 'Successfully Imported', ar: 'تم الاستيراد بنجاح' })}</p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-2xl font-bold text-red-700">{results.failed.length}</p>
                    <p className="text-sm text-red-600">{t({ en: 'Failed', ar: 'فشل' })}</p>
                  </div>
                </div>

                {results.failed.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Failed Records:</p>
                    <div className="max-h-48 overflow-auto space-y-1">
                      {results.failed.map((fail, i) => (
                        <div key={i} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <span className="font-mono">{fail.code}</span>: {fail.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => navigate(createPageUrl('Challenges'))}
                  className="w-full"
                >
                  {t({ en: 'View Imported Challenges', ar: 'عرض التحديات المستوردة' })}
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}