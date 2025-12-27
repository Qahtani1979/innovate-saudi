import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Save, Loader2, Sparkles, X, Lightbulb } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import FileUploader from '../components/FileUploader';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '@/hooks/usePermissions';
import AIProfileEnhancer from '../components/solutions/AIProfileEnhancer';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

import { useSolutionMutations } from '../hooks/useSolutionMutations';
import { useSolutionDetails } from '@/hooks/useSolutionDetails';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { SOLUTION_CONSULTANT_SYSTEM_PROMPT, enhancementPrompts } from '@/lib/ai/prompts/solutions/enhancerPrompts';
import { buildPrompt } from '@/lib/ai/promptBuilder';

function SolutionEditPage() {
  const { user } = usePermissions();
  const urlParams = new URLSearchParams(window.location.search);
  const solutionId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();

  // FIX: Use hook for single solution
  const { useSolution } = useSolutionDetails(solutionId);
  const { data: solution, isLoading } = useSolution();

  // Use hook for challenges
  const { data: challenges = [] } = useChallengesWithVisibility();

  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [changedFields, setChangedFields] = useState(new Set());
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const { invokeAI, status: aiStatus, isLoading: isAIProcessing, isAvailable, rateLimitInfo } = useAIWithFallback();

  // ... useEffects

  const { updateSolution } = useSolutionMutations();




  // ... inside component

  const handleAIEnhancement = async () => {
    if (!formData.name_en && !formData.description_en) {
      toast.error(language === 'ar' ? 'يرجى إدخال الاسم أو الوصف أولاً' : 'Please enter a name or description first');
      return;
    }

    // Build Standardized Prompt
    const { prompt, schema } = buildPrompt(enhancementPrompts.enhanceDetails, {
      formData,
      challenges
    });

    const result = await invokeAI({
      prompt,
      system_prompt: SOLUTION_CONSULTANT_SYSTEM_PROMPT,
      response_json_schema: schema
    });

    if (result.success) {
      setFormData(prev => ({
        ...prev,
        name_en: result.data.refined_name_en || prev.name_en,
        name_ar: result.data.refined_name_ar || prev.name_ar,
        description_en: result.data.improved_description_en || prev.description_en,
        description_ar: result.data.improved_description_ar || prev.description_ar,
        tagline_en: result.data.tagline_en || prev.tagline_en,
        tagline_ar: result.data.tagline_ar || prev.tagline_ar,
        value_proposition: result.data.value_proposition || prev.value_proposition,
        features: result.data.features || prev.features || [],
        use_cases: result.data.use_cases || prev.use_cases || [],
        technical_specifications: {
          ...(prev.technical_specifications || {}),
          technology_stack: result.data.technology_stack || prev.technical_specifications?.technology_stack || []
        },
        sectors: result.data.sectors || prev.sectors || [],
        trl: result.data.trl || prev.trl
      }));

      toast.success(language === 'ar' ? '✨ تم التحسين بنجاح!' : '✨ AI enhancement complete!');
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
    <PageLayout className="max-w-4xl mx-auto">
      <PageHeader
        icon={Lightbulb}
        title={{ en: 'Edit Solution', ar: 'تعديل الحل' }}
        subtitle={{ en: 'Update your innovation details', ar: 'تحديث تفاصيل الابتكار الخاص بك' }}
        description={formData.name_en}
        actions={[]}
        action={
          <div className="flex gap-2">
            {changedFields.size > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                {changedFields.size} {t({ en: 'fields modified', ar: 'حقول معدلة' })}
              </Badge>
            )}
            <Button
              variant={previewMode ? 'default' : 'outline'}
              onClick={() => setPreviewMode(!previewMode)}
              size="sm"
            >
              {previewMode ? t({ en: 'Edit', ar: 'تعديل' }) : t({ en: 'Preview', ar: 'معاينة' })}
            </Button>
          </div>
        }
      >
        <div />
      </PageHeader>

      {/* AI Profile Enhancer - Integrated */}
      {!previewMode && formData && (
        <AIProfileEnhancer
          solution={formData}
          onUpdate={(updatedFields) => setFormData({ ...formData, ...updatedFields })}
        />
      )}

      <Card>
        <CardHeader>
          <AIStatusIndicator
            status={aiStatus}
            error={null}
            rateLimitInfo={rateLimitInfo}
            className="mb-4"
          />
          <CardTitle className="flex items-center justify-between">
            <span>{t({ en: 'Solution Information', ar: 'معلومات الحل' })}</span>
            <Button
              onClick={handleAIEnhancement}
              disabled={isAIProcessing || previewMode || !isAvailable}
              variant="outline"
              className="gap-2"
            >
              {isAIProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t({ en: 'AI Processing...', ar: 'معالجة ذكية...' })}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  {t({ en: 'Enhance with AI', ar: 'تحسين بالذكاء الاصطناعي' })}
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {previewMode ? (
            <div className="space-y-6 p-6 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 mb-1">Solution Name:</p>
                <p className="text-xl font-bold text-slate-900">{formData.name_en}</p>
                {formData.name_ar && (
                  <p className="text-lg text-slate-700" dir="rtl">{formData.name_ar}</p>
                )}
              </div>
              {formData.description_en && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Description:</p>
                  <p className="text-sm text-slate-700">{formData.description_en}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Provider</p>
                  <p className="font-medium">{formData.provider_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Maturity</p>
                  <Badge>{formData.maturity_level}</Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-500">TRL</p>
                  <Badge>TRL {formData.trl}</Badge>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name (English)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className={changedFields.has('name_en') ? 'border-amber-400' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم الحل (عربي)</Label>
                  <Input
                    value={formData.name_ar || ''}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    dir="rtl"
                    className={changedFields.has('name_ar') ? 'border-amber-400' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tagline (English)</Label>
                  <Input
                    value={formData.tagline_en || ''}
                    onChange={(e) => setFormData({ ...formData, tagline_en: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الشعار (عربي)</Label>
                  <Input
                    value={formData.tagline_ar || ''}
                    onChange={(e) => setFormData({ ...formData, tagline_ar: e.target.value })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (English)</Label>
                <Textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>الوصف (عربي)</Label>
                <Textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider Name</Label>
                  <Input
                    value={formData.provider_name || ''}
                    onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Provider Type</Label>
                  <Select
                    value={formData.provider_type || 'startup'}
                    onValueChange={(v) => setFormData({ ...formData, provider_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="sme">SME</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="research_center">Research Center</SelectItem>
                      <SelectItem value="government">Government</SelectItem>
                      <SelectItem value="ngo">NGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Maturity Level</Label>
                  <Select
                    value={formData.maturity_level}
                    onValueChange={(v) => setFormData({ ...formData, maturity_level: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concept">Concept</SelectItem>
                      <SelectItem value="prototype">Prototype</SelectItem>
                      <SelectItem value="pilot_ready">Pilot Ready</SelectItem>
                      <SelectItem value="market_ready">Market Ready</SelectItem>
                      <SelectItem value="proven">Proven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>TRL Level</Label>
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={formData.trl || ''}
                    onChange={(e) => setFormData({ ...formData, trl: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Success Rate (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.success_rate || ''}
                    onChange={(e) => setFormData({ ...formData, success_rate: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Value Proposition</Label>
                <Textarea
                  value={formData.value_proposition || ''}
                  onChange={(e) => setFormData({ ...formData, value_proposition: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    value={formData.contact_name || ''}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Demo URL</Label>
                  <Input
                    value={formData.demo_url || ''}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-slate-900">{t({ en: 'Media & Resources', ar: 'الوسائط والموارد' })}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Logo/Image', ar: 'الشعار/صورة' })}</Label>
                    <FileUploader
                      type="image"
                      label={t({ en: 'Upload Solution Image', ar: 'رفع صورة الحل' })}
                      description={t({ en: 'JPEG, PNG up to 10MB', ar: 'JPEG, PNG حتى 10 ميجابايت' })}
                      maxSize={10}
                      enableImageSearch={true}
                      searchContext={formData.name_en || formData.description_en?.substring(0, 100)}
                      onUploadComplete={(url) => setFormData({ ...formData, image_url: url })}
                    />
                    {formData.image_url && (
                      <div className="relative mt-2">
                        <img src={formData.image_url} alt="Current" className="w-full h-32 object-cover rounded" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 h-6 w-6"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                        >
                          <X className="h-3 w-3 text-white" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Demo Video', ar: 'فيديو تجريبي' })}</Label>
                    <FileUploader
                      type="video"
                      label={t({ en: 'Upload Demo', ar: 'رفع عرض تجريبي' })}
                      description={t({ en: 'MP4 up to 200MB', ar: 'MP4 حتى 200 ميجابايت' })}
                      maxSize={200}
                      preview={false}
                      onUploadComplete={(url) => setFormData({ ...formData, video_url: url })}
                    />
                    {formData.video_url && (
                      <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                        <video src={formData.video_url} className="w-20 h-12 object-cover rounded" />
                        <span className="text-xs text-slate-600 flex-1">Video uploaded</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setFormData({ ...formData, video_url: '' })}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Brochure/Documentation', ar: 'كتيب/توثيق' })}</Label>
                  <FileUploader
                    type="document"
                    label={t({ en: 'Upload PDF', ar: 'رفع PDF' })}
                    description={t({ en: 'PDF up to 50MB', ar: 'PDF حتى 50 ميجابايت' })}
                    maxSize={50}
                    preview={false}
                    onUploadComplete={(url) => setFormData({ ...formData, brochure_url: url })}
                  />
                  {formData.brochure_url && (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                      <span className="text-xs text-slate-600 flex-1">📄 Brochure uploaded</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setFormData({ ...formData, brochure_url: '' })}
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Gallery Images', ar: 'معرض الصور' })}</Label>
                  <FileUploader
                    type="image"
                    label={t({ en: 'Add to Gallery', ar: 'إضافة للمعرض' })}
                    description={t({ en: 'Up to 10MB per image', ar: 'حتى 10 ميجابايت للصورة' })}
                    maxSize={10}
                    onUploadComplete={(url) => {
                      setFormData(prev => ({
                        ...prev,
                        gallery_urls: [...(prev.gallery_urls || []), url]
                      }));
                    }}
                  />
                  {formData.gallery_urls?.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {formData.gallery_urls.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 h-6 w-6"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                gallery_urls: prev.gallery_urls.filter((_, i) => i !== idx)
                              }));
                            }}
                          >
                            <X className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {changedFields.size > 0 && !previewMode && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-900 mb-2">
                {t({ en: 'Modified Fields:', ar: 'الحقول المعدلة:' })}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(changedFields).map(field => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={() => {
              const confirmDiscard = changedFields.size === 0 || window.confirm(
                t({ en: 'Discard unsaved changes?', ar: 'تجاهل التغييرات غير المحفوظة؟' })
              );
              if (confirmDiscard) {
                localStorage.removeItem(`solution_edit_draft_${solutionId}`);
                navigate(createPageUrl(`SolutionDetail?id=${solutionId}`));
              }
            }}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button
              onClick={() => {
                updateSolution.mutate({
                  id: solutionId,
                  data: formData,
                  changedFields: Array.from(changedFields),
                  activityLog: {
                    type: 'updated',
                    description: `Solution "${formData.name_en}" updated with ${changedFields.size} field changes.`,
                    metadata: {
                      changed_fields: Array.from(changedFields)
                    }
                  }
                }, {
                  onSuccess: () => {
                    localStorage.removeItem(`solution_edit_draft_${solutionId}`);
                    navigate(createPageUrl(`SolutionDetail?id=${solutionId}`));
                  }
                });
              }}
              disabled={updateSolution.isPending || changedFields.size === 0}
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {updateSolution.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: `Save ${changedFields.size} Changes`, ar: `حفظ ${changedFields.size} تغييرات` })}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(SolutionEditPage, {
  requiredPermissions: ['solution_edit']
});
