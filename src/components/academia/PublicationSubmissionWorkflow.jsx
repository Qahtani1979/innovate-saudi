import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Plus, Upload, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function PublicationSubmissionWorkflow({ projectId, onClose }) {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    publication: '',
    year: new Date().getFullYear(),
    url: '',
    doi: '',
    abstract: '',
    keywords: [],
    type: 'journal_article'
  });

  const generateFromAI = async () => {
    const response = await invokeAI({
      prompt: `Generate publication metadata suggestions for an R&D project output. Provide:
1. Suggested keywords (array of 5-7 relevant research terms)
2. Potential journal/conference suggestions (3 options)
3. Impact statement (1 paragraph explaining significance)`,
      response_json_schema: {
        type: 'object',
        properties: {
          keywords: { type: 'array', items: { type: 'string' } },
          venues: { type: 'array', items: { type: 'string' } },
          impact_statement: { type: 'string' }
        }
      }
    });

    if (response.success && response.data) {
      setFormData(prev => ({
        ...prev,
        keywords: response.data.keywords,
        abstract: response.data.impact_statement
      }));
      toast.success(t({ en: 'AI suggestions generated', ar: 'تم إنشاء الاقتراحات الذكية' }));
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const project = await base44.entities.RDProject.list().then(projects => 
        projects.find(p => p.id === projectId)
      );

      const publications = project.publications || [];
      publications.push({
        title: data.title,
        authors: data.authors.split(',').map(a => a.trim()),
        publication: data.publication,
        year: data.year,
        url: data.url,
        doi: data.doi,
        abstract: data.abstract,
        keywords: data.keywords,
        type: data.type
      });

      return base44.entities.RDProject.update(projectId, { publications });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-projects']);
      toast.success(t({ en: 'Publication submitted', ar: 'تم تقديم النشر' }));
      if (onClose) onClose();
    }
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          {t({ en: 'Submit Publication', ar: 'تقديم نشر علمي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`h-2 rounded-full flex-1 ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Publication Type', ar: 'نوع النشر' })}
              </label>
              <div className="flex gap-2 flex-wrap">
                {['journal_article', 'conference_paper', 'book_chapter', 'patent'].map((type) => (
                  <Button
                    key={type}
                    variant={formData.type === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, type })}
                  >
                    {type.replace(/_/g, ' ')}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Title', ar: 'العنوان' })}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t({ en: 'Publication title...', ar: 'عنوان النشر...' })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Authors (comma-separated)', ar: 'المؤلفون (مفصولة بفاصلة)' })}
              </label>
              <Input
                value={formData.authors}
                onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                placeholder="Ahmed Al-Mutairi, Sarah Johnson, ..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Journal/Venue', ar: 'المجلة/المؤتمر' })}
                </label>
                <Input
                  value={formData.publication}
                  onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                  placeholder="Journal of Smart Cities"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t({ en: 'Year', ar: 'السنة' })}
                </label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details & AI */}
        {step === 2 && (
          <div className="space-y-4">
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-2" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {t({ en: 'Publication Details', ar: 'تفاصيل النشر' })}
              </h3>
              <Button
                onClick={generateFromAI}
                disabled={isLoading || !isAvailable}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Abstract/Summary', ar: 'الملخص' })}
              </label>
              <Textarea
                value={formData.abstract}
                onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                rows={4}
                placeholder={t({ en: 'Publication abstract...', ar: 'ملخص النشر...' })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {t({ en: 'Keywords', ar: 'الكلمات المفتاحية' })}
              </label>
              <Input
                value={formData.keywords.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  keywords: e.target.value.split(',').map(k => k.trim()) 
                })}
                placeholder="smart city, IoT, sustainability, ..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">DOI</label>
                <Input
                  value={formData.doi}
                  onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                  placeholder="10.1234/example"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">URL</label>
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-center font-semibold text-green-900 mb-2">
                {t({ en: 'Ready to Submit', ar: 'جاهز للتقديم' })}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">{t({ en: 'Title:', ar: 'العنوان:' })}</span> {formData.title}
                </div>
                <div>
                  <span className="font-medium">{t({ en: 'Authors:', ar: 'المؤلفون:' })}</span> {formData.authors}
                </div>
                <div>
                  <span className="font-medium">{t({ en: 'Publication:', ar: 'النشر:' })}</span> {formData.publication} ({formData.year})
                </div>
                {formData.keywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {formData.keywords.map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose?.()}
          >
            {step === 1 ? t({ en: 'Cancel', ar: 'إلغاء' }) : t({ en: 'Back', ar: 'رجوع' })}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>
              {t({ en: 'Next', ar: 'التالي' })}
            </Button>
          ) : (
            <Button
              onClick={() => submitMutation.mutate(formData)}
              disabled={submitMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Submit', ar: 'تقديم' })}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}