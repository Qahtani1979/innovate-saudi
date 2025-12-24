import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePolicies } from '@/hooks/usePolicies';
import { usePolicyMutations } from '@/hooks/usePolicyMutations';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Save, Sparkles, Loader2, AlertTriangle, GitBranch, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import PolicyConflictDetector from '../components/policy/PolicyConflictDetector';
import PolicyEditHistory from '../components/policy/PolicyEditHistory';
import PolicyAmendmentWizard from '../components/policy/PolicyAmendmentWizard';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function PolicyEdit() {
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const policyId = urlParams.get('id');
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAmendmentWizard, setShowAmendmentWizard] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: isEnhancing, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { usePolicy } = usePolicies();
  const { data: policy, isLoading } = usePolicy(policyId);
  const { updatePolicy, translatePolicy } = usePolicyMutations();

  useEffect(() => {
    if (policy) {
      setFormData(policy);
      setOriginalData(policy);
    }
  }, [policy]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!formData || !policyId) return;

    const autoSave = setInterval(() => {
      const changes = getChangedFields();
      if (Object.keys(changes).length > 0) {
        localStorage.setItem(`policy_edit_draft_${policyId}`, JSON.stringify({
          formData,
          timestamp: new Date().toISOString()
        }));
        setLastSaved(new Date());
      }
    }, 30000);

    return () => clearInterval(autoSave);
  }, [formData, policyId]);

  // Load draft on mount
  useEffect(() => {
    if (!policyId) return;
    const draft = localStorage.getItem(`policy_edit_draft_${policyId}`);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const draftAge = Date.now() - new Date(parsed.timestamp).getTime();
        if (draftAge < 24 * 60 * 60 * 1000) {
          if (confirm(t({ en: 'Unsaved changes found. Load draft?', ar: 'عثر على تغييرات غير محفوظة. تحميلها؟' }))) {
            setFormData(parsed.formData);
          }
        }
      } catch (e) { }
    }
  }, [policyId]);

  // Arabic-required validation
  useEffect(() => {
    if (!formData) return;
    const errors = [];

    if (!formData.title_ar) {
      errors.push({ field: 'title_ar', message: t({ en: 'Arabic title required', ar: 'العنوان العربي مطلوب' }) });
    }
    if (!formData.recommendation_text_ar) {
      errors.push({ field: 'recommendation_text_ar', message: t({ en: 'Arabic recommendation required', ar: 'التوصية العربية مطلوبة' }) });
    }

    setValidationErrors(errors);
  }, [formData?.title_ar, formData?.recommendation_text_ar]);

  const getChangedFields = () => {
    if (!formData || !originalData) return {};
    const changes = {};
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(originalData[key])) {
        changes[key] = { old: originalData[key], new: formData[key] };
      }
    });
    return changes;
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const changes = getChangedFields();

      toast.info(t({ en: 'Translating updates to English...', ar: 'جاري ترجمة التحديثات للإنجليزية...' }));

      // Check if Arabic fields changed
      const arabicChanged = changes.title_ar || changes.recommendation_text_ar ||
        changes.implementation_steps || changes.success_metrics ||
        changes.stakeholder_involvement_ar;

      let translations = {};
      if (arabicChanged) {
        toast.info(t({ en: 'Translating updates...', ar: 'جاري ترجمة التحديثات...' }));
        try {
          const translationResponse = await translatePolicy.mutateAsync({
            title_ar: formData.title_ar,
            recommendation_text_ar: formData.recommendation_text_ar,
            implementation_steps: formData.implementation_steps,
            success_metrics: formData.success_metrics,
            stakeholder_involvement_ar: formData.stakeholder_involvement_ar
          });
          translations = translationResponse || {};
        } catch (error) {
          console.error('Translation error:', error);
          toast.warning(t({ en: 'Translation failed, saving Arabic only', ar: 'فشلت الترجمة، سيتم حفظ العربية فقط' }));
        }
      }

      // Merge data
      const updateData = arabicChanged ? { ...formData, ...translations } : formData;

      // Update using hook - handle logging internally
      await updatePolicy.mutateAsync({ id: policyId, data: updateData });

      localStorage.removeItem(`policy_edit_draft_${policyId}`);
      toast.success(t({ en: '✓ Policy updated with auto-translation', ar: '✓ تم تحديث السياسة مع الترجمة الآلية' }));
      navigate(createPageUrl(`PolicyDetail?id=${policyId}`));
    } catch (error) {
      console.error('Update failed', error);
      // Hook handles error toast
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAIAssist = async () => {
    const { POLICY_ENHANCEMENT_PROMPT_TEMPLATE } = await import('@/lib/ai/prompts/policy/enhancement');
    const promptConfig = POLICY_ENHANCEMENT_PROMPT_TEMPLATE(formData);

    const result = await invokeAI({
      prompt: promptConfig.prompt,
      system_prompt: promptConfig.system,
      response_json_schema: promptConfig.schema
    });

    if (result.success) {
      setFormData(prev => ({ ...prev, ...result.data }));
      toast.success(t({ en: 'AI enhancement applied', ar: 'تم التحسين الذكي' }));
    } else {
      toast.error(t({ en: 'AI assist failed', ar: 'فشل المساعد' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const changedFieldsCount = Object.keys(getChangedFields()).length;

  return (
    <PageLayout className="max-w-6xl mx-auto">
      <PageHeader
        icon={Shield}
        title={{ en: 'Edit Policy', ar: 'تعديل السياسة' }}
        description={policy?.title_ar || policy?.title_en}
        action={
          <div className="flex gap-2">
            <Button onClick={() => setShowAmendmentWizard(true)} variant="outline" className="gap-2">
              <GitBranch className="h-4 w-4" />
              {t({ en: 'Create Amendment', ar: 'إنشاء تعديل' })}
            </Button>
            <Button onClick={handleAIAssist} disabled={isEnhancing} variant="outline" className="gap-2">
              {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-600" />}
              {t({ en: 'AI Enhance', ar: 'تحسين ذكي' })}
            </Button>
          </div>
        }
        actions={null}
        subtitle={null}
        children={null}
      />
      <div className="space-y-6">

        {/* Validation Warnings */}
        {validationErrors.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription>
              <p className="font-semibold text-orange-900 text-sm mb-2">
                {t({ en: 'Bilingual Content Missing:', ar: 'محتوى ثنائي اللغة مفقود:' })}
              </p>
              <ul className="text-xs text-orange-800 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i}>• {err.message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Unsaved Changes Warning */}
        {changedFieldsCount > 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900">
              {changedFieldsCount} {t({ en: 'unsaved changes', ar: 'تغييرات غير محفوظة' })}
            </AlertDescription>
          </Alert>
        )}

        {/* Amendment Wizard Modal */}
        {showAmendmentWizard && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <PolicyAmendmentWizard
                policy={{ ...originalData, id: policyId }}
                onClose={() => setShowAmendmentWizard(false)}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Policy Information', ar: 'معلومات السياسة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Auto-Translation Notice */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          {t({ en: '🤖 Arabic-First System', ar: '🤖 نظام العربية أولاً' })}
                        </p>
                        <p className="text-xs text-slate-700">
                          {t({
                            en: 'Edit Arabic fields only. English translations will be automatically regenerated on save.',
                            ar: 'عدّل الحقول العربية فقط. الترجمات الإنجليزية ستُنشأ تلقائياً عند الحفظ.'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Title - Arabic Only */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Policy Title (Arabic)', ar: 'عنوان السياسة' })}</Label>
                  <Input
                    value={formData.title_ar || ''}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    dir="rtl"
                    className="text-lg"
                  />
                </div>

                {/* Recommendation - Arabic Only */}
                <div className="space-y-2">
                  <Label>{t({ en: 'Policy Recommendation (Arabic)', ar: 'نص التوصية السياسية' })}</Label>
                  <Textarea
                    value={formData.recommendation_text_ar || ''}
                    onChange={(e) => setFormData({ ...formData, recommendation_text_ar: e.target.value })}
                    rows={12}
                    dir="rtl"
                    className="leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Regulatory Framework', ar: 'الإطار التنظيمي' })}</Label>
                  <Input
                    value={formData.regulatory_framework || ''}
                    onChange={(e) => setFormData({ ...formData, regulatory_framework: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.regulatory_change_needed || false}
                    onChange={(e) => setFormData({ ...formData, regulatory_change_needed: e.target.checked })}
                    className="rounded"
                  />
                  <Label>{t({ en: 'Regulatory change needed', ar: 'يتطلب تغيير تنظيمي' })}</Label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Timeline (months)', ar: 'المدة (أشهر)' })}</Label>
                    <Input
                      type="number"
                      value={formData.timeline_months || ''}
                      onChange={(e) => setFormData({ ...formData, timeline_months: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Priority', ar: 'الأولوية' })}</Label>
                    <Select
                      value={formData.priority_level || 'medium'}
                      onValueChange={(v) => setFormData({ ...formData, priority_level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Impact Score', ar: 'درجة التأثير' })}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.impact_score || ''}
                      onChange={(e) => setFormData({ ...formData, impact_score: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Link to={createPageUrl(`PolicyDetail?id=${policyId}`)}>
                    <Button variant="outline">
                      {t({ en: 'Cancel', ar: 'إلغاء' })}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleUpdate}
                    disabled={isUpdating || !formData.title_ar}
                    className="gap-2 bg-blue-600"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t({ en: 'Translating...', ar: 'جاري الترجمة...' })}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <PolicyEditHistory policyId={policyId} />
            <PolicyConflictDetector policy={formData} />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {t({ en: 'Change Summary', ar: 'ملخص التغييرات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {changedFieldsCount > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">
                      {changedFieldsCount} {t({ en: 'fields modified', ar: 'حقول معدلة' })}
                    </p>
                    <div className="space-y-1">
                      {Object.keys(getChangedFields()).map((field, i) => (
                        <Badge key={i} variant="outline" className="text-xs mr-1 mb-1">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    {t({ en: 'No changes yet', ar: 'لا تغييرات بعد' })}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout >
  );
}

export default ProtectedPage(PolicyEdit, { requiredPermissions: ['policy_edit'] });