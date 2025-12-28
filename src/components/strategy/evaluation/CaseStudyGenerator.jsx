import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useCaseStudyMutations } from '@/hooks/useCaseStudies';
import { toast } from 'sonner';
import {
  BookOpen, Sparkles, Download, Save, RefreshCw,
  Target, Lightbulb, CheckCircle2, AlertTriangle, TrendingUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import {
  CASE_STUDY_PROMPTS,
  buildCaseStudyPrompt,
  CASE_STUDY_SCHEMA
} from '@/lib/ai/prompts/strategy';

export default function CaseStudyGenerator({ entity, entityType }) {
  const { t, language } = useLanguage();
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const { createCaseStudy } = useCaseStudyMutations();

  const [caseStudy, setCaseStudy] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const generateCaseStudy = async () => {
    if (!entity) return;

    const result = await invokeAI({
      systemPrompt: CASE_STUDY_PROMPTS.systemPrompt,
      prompt: buildCaseStudyPrompt(entity, entityType),
      response_json_schema: CASE_STUDY_SCHEMA
    });

    if (result.success) {
      setCaseStudy(result.data);
      setEditedContent(result.data);
      toast.success(t({ en: 'Case study generated', ar: 'تم إنشاء دراسة الحالة' }));
    }
  };

  const saveCaseStudy = async () => {
    setIsSaving(true);
    try {
      await createCaseStudy.mutateAsync({
        entity_type: entityType,
        entity_id: entity.id,
        title_en: editedContent.title_en,
        title_ar: editedContent.title_ar,
        description_en: editedContent.executive_summary_en,
        description_ar: editedContent.executive_summary_ar,
        challenge_description: editedContent.challenge_description_en,
        solution_description: editedContent.solution_approach_en,
        implementation_details: editedContent.implementation_en,
        results_achieved: editedContent.results_en,
        lessons_learned: editedContent.lessons_learned_en?.join('\n'),
        tags: editedContent.tags,
        is_published: false,
        sector_id: entity.sector_id,
        municipality_id: entity.municipality_id
      });
      // Success toast is handled by the hook
      setEditMode(false);
    } catch (error) {
      console.error('Save error:', error);
      // Error toast is handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const downloadCaseStudy = () => {
    if (!caseStudy) return;

    const content = `# ${caseStudy.title_en}
## ${caseStudy.title_ar}

---

## Executive Summary
${caseStudy.executive_summary_en}

### الملخص التنفيذي
${caseStudy.executive_summary_ar}

---

## Challenge Description
${caseStudy.challenge_description_en}

### وصف التحدي
${caseStudy.challenge_description_ar}

---

## Solution Approach
${caseStudy.solution_approach_en}

### نهج الحل
${caseStudy.solution_approach_ar}

---

## Implementation
${caseStudy.implementation_en}

### التنفيذ
${caseStudy.implementation_ar}

---

## Results & Impact
${caseStudy.results_en}

### النتائج والأثر
${caseStudy.results_ar}

---

## Key Success Factors
${caseStudy.success_factors_en?.map(f => `- ${f}`).join('\n')}

### عوامل النجاح الرئيسية
${caseStudy.success_factors_ar?.map(f => `- ${f}`).join('\n')}

---

## Lessons Learned
${caseStudy.lessons_learned_en?.map(l => `- ${l}`).join('\n')}

### الدروس المستفادة
${caseStudy.lessons_learned_ar?.map(l => `- ${l}`).join('\n')}

---

## Recommendations
${caseStudy.recommendations_en?.map(r => `- ${r}`).join('\n')}

### التوصيات
${caseStudy.recommendations_ar?.map(r => `- ${r}`).join('\n')}

---

Tags: ${caseStudy.tags?.join(', ')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-study-${entity.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SectionCard = ({ icon: Icon, title, content, contentAr }) => (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
        <ReactMarkdown>{language === 'ar' ? contentAr : content}</ReactMarkdown>
      </div>
    </div>
  );

  const ListSection = ({ icon: Icon, title, items }) => (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <ul className="space-y-1">
        {items?.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t({ en: 'Case Study Generator', ar: 'منشئ دراسة الحالة' })}
          </CardTitle>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!caseStudy ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {t({
                en: 'Generate a comprehensive case study from this entity for knowledge sharing',
                ar: 'أنشئ دراسة حالة شاملة من هذا الكيان لمشاركة المعرفة'
              })}
            </p>
            <Button
              onClick={generateCaseStudy}
              disabled={isLoading || !isAvailable}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Case Study', ar: 'إنشاء دراسة الحالة' })}
            </Button>
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="text-center pb-4 border-b">
              <h2 className="text-2xl font-bold">
                {language === 'ar' ? caseStudy.title_ar : caseStudy.title_en}
              </h2>
              <div className="flex justify-center gap-2 mt-2">
                {caseStudy.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Executive Summary */}
            <div className="p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold mb-2">
                {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
              </h3>
              <p className="text-muted-foreground">
                {language === 'ar' ? caseStudy.executive_summary_ar : caseStudy.executive_summary_en}
              </p>
            </div>

            {/* Main Sections */}
            <div className="grid gap-4 md:grid-cols-2">
              <SectionCard
                icon={AlertTriangle}
                title={t({ en: 'Challenge', ar: 'التحدي' })}
                content={caseStudy.challenge_description_en}
                contentAr={caseStudy.challenge_description_ar}
              />
              <SectionCard
                icon={Lightbulb}
                title={t({ en: 'Solution', ar: 'الحل' })}
                content={caseStudy.solution_approach_en}
                contentAr={caseStudy.solution_approach_ar}
              />
              <SectionCard
                icon={Target}
                title={t({ en: 'Implementation', ar: 'التنفيذ' })}
                content={caseStudy.implementation_en}
                contentAr={caseStudy.implementation_ar}
              />
              <SectionCard
                icon={TrendingUp}
                title={t({ en: 'Results & Impact', ar: 'النتائج والأثر' })}
                content={caseStudy.results_en}
                contentAr={caseStudy.results_ar}
              />
            </div>

            {/* List Sections */}
            <div className="grid gap-4 md:grid-cols-3">
              <ListSection
                icon={CheckCircle2}
                title={t({ en: 'Success Factors', ar: 'عوامل النجاح' })}
                items={language === 'ar' ? caseStudy.success_factors_ar : caseStudy.success_factors_en}
              />
              <ListSection
                icon={BookOpen}
                title={t({ en: 'Lessons Learned', ar: 'الدروس المستفادة' })}
                items={language === 'ar' ? caseStudy.lessons_learned_ar : caseStudy.lessons_learned_en}
              />
              <ListSection
                icon={Target}
                title={t({ en: 'Recommendations', ar: 'التوصيات' })}
                items={language === 'ar' ? caseStudy.recommendations_ar : caseStudy.recommendations_en}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={generateCaseStudy} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {t({ en: 'Regenerate', ar: 'إعادة الإنشاء' })}
              </Button>
              <Button variant="outline" onClick={downloadCaseStudy}>
                <Download className="h-4 w-4 mr-2" />
                {t({ en: 'Download', ar: 'تحميل' })}
              </Button>
              <Button onClick={saveCaseStudy} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving
                  ? t({ en: 'Saving...', ar: 'جاري الحفظ...' })
                  : t({ en: 'Save to Library', ar: 'حفظ في المكتبة' })
                }
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
