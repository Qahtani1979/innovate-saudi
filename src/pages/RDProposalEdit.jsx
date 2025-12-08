import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function RDProposalEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const proposalId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [aiEnhancing, setAiEnhancing] = useState(false);

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['rd-proposal', proposalId],
    queryFn: async () => {
      const proposals = await base44.entities.RDProposal.list();
      return proposals.find(p => p.id === proposalId);
    },
    enabled: !!proposalId
  });

  const [formData, setFormData] = useState(null);

  React.useEffect(() => {
    if (proposal && !formData) {
      setFormData({
        ...proposal,
        principal_investigator: proposal.principal_investigator || { name: '', title: '', email: '', expertise: [] },
        team_members: proposal.team_members || [],
        budget_breakdown: proposal.budget_breakdown || [],
        expected_outputs: proposal.expected_outputs || []
      });
    }
  }, [proposal]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.RDProposal.update(proposalId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-proposal']);
      toast.success(t({ en: 'Proposal updated', ar: 'تم تحديث المقترح' }));
      navigate(createPageUrl(`RDProposalDetail?id=${proposalId}`));
    }
  });

  const handleAIEnhance = async () => {
    setAiEnhancing(true);
    try {
      const prompt = `Enhance this research proposal with professional academic content:

Title: ${formData.title_en}
Abstract: ${formData.abstract_en || 'N/A'}
Research Area: ${formData.research_area || 'N/A'}
Methodology: ${formData.methodology_en || 'N/A'}

Generate comprehensive bilingual (English + Arabic) enhanced content:
1. Improved title and tagline (EN + AR)
2. Detailed abstract (EN + AR) - 300+ words covering objectives, methodology, expected outcomes
3. Enhanced methodology description (EN + AR) - 200+ words
4. Literature review section (5+ key references)
5. Expected outputs with descriptions
6. Impact statement (EN + AR)
7. Innovation claim (what makes it novel)
8. 5-8 relevant keywords`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title_en: { type: 'string' },
            title_ar: { type: 'string' },
            tagline_en: { type: 'string' },
            tagline_ar: { type: 'string' },
            abstract_en: { type: 'string' },
            abstract_ar: { type: 'string' },
            methodology_en: { type: 'string' },
            methodology_ar: { type: 'string' },
            impact_statement: { type: 'string' },
            innovation_claim: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
            expected_outputs: { type: 'array', items: { 
              type: 'object',
              properties: {
                output: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' }
              }
            }}
          }
        }
      });

      setFormData(prev => ({ ...prev, ...result }));
      toast.success(t({ en: '✨ AI academic enhancement complete!', ar: '✨ تم التحسين الأكاديمي الذكي!' }));
    } catch (error) {
      toast.error(t({ en: 'Enhancement failed', ar: 'فشل التحسين' }));
    } finally {
      setAiEnhancing(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Edit Research Proposal', ar: 'تعديل المقترح البحثي' })}
        </h1>
        <p className="text-slate-600 mt-1">{formData.title_en}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t({ en: 'Proposal Information', ar: 'معلومات المقترح' })}</CardTitle>
            <Button onClick={handleAIEnhance} disabled={aiEnhancing} variant="outline" size="sm">
              {aiEnhancing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Enhancing...', ar: 'جاري التحسين...' })}</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" />{t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Title (English) *', ar: 'العنوان (إنجليزي) *' })}</Label>
              <Input value={formData.title_en} onChange={(e) => setFormData({...formData, title_en: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
              <Input value={formData.title_ar || ''} onChange={(e) => setFormData({...formData, title_ar: e.target.value})} dir="rtl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</Label>
              <Input value={formData.tagline_en || ''} onChange={(e) => setFormData({...formData, tagline_en: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</Label>
              <Input value={formData.tagline_ar || ''} onChange={(e) => setFormData({...formData, tagline_ar: e.target.value})} dir="rtl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Abstract (English) *', ar: 'الملخص (إنجليزي) *' })}</Label>
            <Textarea value={formData.abstract_en || ''} onChange={(e) => setFormData({...formData, abstract_en: e.target.value})} rows={6} />
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Abstract (Arabic)', ar: 'الملخص (عربي)' })}</Label>
            <Textarea value={formData.abstract_ar || ''} onChange={(e) => setFormData({...formData, abstract_ar: e.target.value})} rows={6} dir="rtl" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'Lead Institution *', ar: 'المؤسسة الرائدة *' })}</Label>
              <Input value={formData.lead_institution || ''} onChange={(e) => setFormData({...formData, lead_institution: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Research Area', ar: 'مجال البحث' })}</Label>
              <Input value={formData.research_area || ''} onChange={(e) => setFormData({...formData, research_area: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t({ en: 'Methodology (English)', ar: 'المنهجية (إنجليزي)' })}</Label>
            <Textarea value={formData.methodology_en || ''} onChange={(e) => setFormData({...formData, methodology_en: e.target.value})} rows={4} />
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">{t({ en: 'Principal Investigator', ar: 'الباحث الرئيسي' })}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t({ en: 'Name *', ar: 'الاسم *' })}</Label>
                <Input 
                  value={formData.principal_investigator?.name || ''} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    principal_investigator: {...(formData.principal_investigator || {}), name: e.target.value}
                  })} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Title', ar: 'اللقب' })}</Label>
                <Input 
                  value={formData.principal_investigator?.title || ''} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    principal_investigator: {...(formData.principal_investigator || {}), title: e.target.value}
                  })} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t({ en: 'Email *', ar: 'البريد الإلكتروني *' })}</Label>
                <Input 
                  type="email"
                  value={formData.principal_investigator?.email || ''} 
                  onChange={(e) => setFormData({
                    ...formData, 
                    principal_investigator: {...(formData.principal_investigator || {}), email: e.target.value}
                  })} 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Start', ar: 'المستوى التقني الحالي' })}</Label>
              <Input type="number" min="1" max="9" value={formData.trl_start || ''} onChange={(e) => setFormData({...formData, trl_start: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'TRL Target', ar: 'المستوى المستهدف' })}</Label>
              <Input type="number" min="1" max="9" value={formData.trl_target || ''} onChange={(e) => setFormData({...formData, trl_target: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Duration (months)', ar: 'المدة (شهور)' })}</Label>
              <Input type="number" value={formData.duration_months || ''} onChange={(e) => setFormData({...formData, duration_months: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</Label>
              <Input type="number" value={formData.budget_requested || ''} onChange={(e) => setFormData({...formData, budget_requested: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate(createPageUrl(`RDProposalDetail?id=${proposalId}`))}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending || !formData.title_en || !formData.lead_institution}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{t({ en: 'Saving...', ar: 'جاري الحفظ...' })}</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}