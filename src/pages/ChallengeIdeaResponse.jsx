import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Target, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle, FileText, Users, Calendar, DollarSign, Send, Info, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { IDEA_RESPONSE_PROMPT_TEMPLATE, IDEA_RESPONSE_SCHEMA } from '@/lib/ai/prompts/citizen/ideaResponse';

const STEPS = [
  { id: 1, title: { en: 'Select Challenge', ar: 'اختر التحدي' }, icon: Target },
  { id: 2, title: { en: 'AI-Assisted Proposal', ar: 'مقترح بمساعدة الذكاء' }, icon: Sparkles },
  { id: 3, title: { en: 'Your Details', ar: 'بياناتك' }, icon: Users },
  { id: 4, title: { en: 'Review & Submit', ar: 'مراجعة وتقديم' }, icon: Send },
];

function ChallengeIdeaResponse() {
  const { language, isRTL, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challenge_id');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiGenerating, rateLimitInfo, isAvailable } = useAIWithFallback();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [initialDescription, setInitialDescription] = useState('');
  
  const [formData, setFormData] = useState({
    challenge_alignment_id: challengeId || '',
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    proposal_type: 'solution',
    submitter_type: 'citizen',
    submitter_email: user?.email || '',
    submitter_name: user?.full_name || '',
    submitter_organization: '',
    implementation_plan: '',
    budget_estimate: '',
    timeline_proposal: '',
    expected_outcomes: '',
    team_description: '',
    resources_needed: '',
  });

  // Fetch open challenges
  const { data: challenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ['challenges-open'],
    queryFn: async () => {
      const { data } = await supabase
        .from('challenges')
        .select('id, title_en, title_ar, description_en, description_ar, sector, priority, status, kpis, desired_outcome_en, desired_outcome_ar, municipality_id')
        .eq('is_published', true)
        .in('status', ['approved', 'in_treatment', 'open']);
      return data || [];
    }
  });

  const selectedChallenge = challenges.find(c => c.id === formData.challenge_alignment_id);

  // Auto-fill user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        submitter_email: user.email || prev.submitter_email,
        submitter_name: user.full_name || prev.submitter_name,
      }));
    }
  }, [user]);

  // AI Generation for proposal
  const generateProposal = async () => {
    if (!selectedChallenge) {
      toast.error(t({ en: 'Please select a challenge first', ar: 'يرجى اختيار تحدي أولاً' }));
      return;
    }

    if (!initialDescription.trim()) {
      toast.error(t({ en: 'Please describe your idea briefly', ar: 'يرجى وصف فكرتك بإيجاز' }));
      return;
    }

    const result = await invokeAI({
      prompt: IDEA_RESPONSE_PROMPT_TEMPLATE({
        challenge: selectedChallenge,
        initialDescription
      }),
      response_json_schema: IDEA_RESPONSE_SCHEMA
    });

    if (result.success && result.data) {
      setFormData(prev => ({
        ...prev,
        title_en: result.data.title_en || prev.title_en,
        title_ar: result.data.title_ar || prev.title_ar,
        description_en: result.data.description_en || prev.description_en,
        description_ar: result.data.description_ar || prev.description_ar,
        implementation_plan: result.data.implementation_plan || prev.implementation_plan,
        expected_outcomes: result.data.expected_outcomes || prev.expected_outcomes,
        resources_needed: result.data.resources_needed || prev.resources_needed,
        team_description: result.data.team_description || prev.team_description,
        budget_estimate: result.data.budget_estimate || prev.budget_estimate,
        timeline_proposal: result.data.timeline_proposal || prev.timeline_proposal,
      }));
      toast.success(t({ en: 'AI generated your proposal draft!', ar: 'تم إنشاء مسودة مقترحك بالذكاء الاصطناعي!' }));
      setCurrentStep(3);
    } else {
      toast.error(t({ en: 'Failed to generate proposal. Please try again.', ar: 'فشل في إنشاء المقترح. يرجى المحاولة مرة أخرى.' }));
    }
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('innovation_proposals')
        .insert({
          code: `PROP-${Date.now().toString().slice(-8)}`,
          title_en: data.title_en,
          title_ar: data.title_ar,
          description_en: data.description_en,
          description_ar: data.description_ar,
          challenge_alignment_id: data.challenge_alignment_id,
          proposal_type: data.proposal_type,
          submitter_type: data.submitter_type,
          submitter_email: data.submitter_email,
          submitter_name: data.submitter_name,
          submitter_organization: data.submitter_organization,
          implementation_plan: data.implementation_plan,
          budget_estimate: data.budget_estimate ? parseFloat(data.budget_estimate) : null,
          timeline_proposal: data.timeline_proposal,
          expected_outcomes: data.expected_outcomes,
          team_description: data.team_description,
          resources_needed: data.resources_needed,
          status: 'submitted',
          created_by: user?.email,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['innovation-proposals']);
      toast.success(t({ en: 'Proposal submitted successfully!', ar: 'تم تقديم المقترح بنجاح!' }));
      navigate(`/innovation-proposal-detail?id=${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || t({ en: 'Failed to submit proposal', ar: 'فشل في تقديم المقترح' }));
    }
  });

  const handleNext = () => {
    if (currentStep === 1 && !formData.challenge_alignment_id) {
      toast.error(t({ en: 'Please select a challenge', ar: 'يرجى اختيار تحدي' }));
      return;
    }
    if (currentStep === 2 && !formData.title_en) {
      toast.error(t({ en: 'Please generate or enter your proposal', ar: 'يرجى إنشاء أو إدخال مقترحك' }));
      return;
    }
    if (currentStep === 3 && !formData.submitter_email) {
      toast.error(t({ en: 'Please enter your email', ar: 'يرجى إدخال بريدك الإلكتروني' }));
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (!formData.title_en || !formData.challenge_alignment_id || !formData.submitter_email) {
      toast.error(t({ en: 'Please complete all required fields', ar: 'يرجى إكمال جميع الحقول المطلوبة' }));
      return;
    }
    submitMutation.mutate(formData);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          {t({ en: 'Submit Innovation Proposal', ar: 'تقديم مقترح ابتكار' })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t({ en: 'Respond to a challenge with your innovative solution', ar: 'قدم حلك المبتكر لتحدي' })}
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {STEPS.map((step) => (
            <div 
              key={step.id}
              className={`flex items-center gap-2 ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <step.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t(step.title)}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Challenge */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {t({ en: 'Select a Challenge to Respond To', ar: 'اختر التحدي للرد عليه' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Browse open challenges and select one that matches your solution idea', ar: 'تصفح التحديات المفتوحة واختر واحداً يتوافق مع فكرة حلك' })}
                </CardDescription>
              </CardHeader>

              {loadingChallenges ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t({ en: 'No open challenges available at the moment', ar: 'لا توجد تحديات مفتوحة حالياً' })}
                </div>
              ) : (
                <div className="grid gap-4">
                  {challenges.map(challenge => (
                    <div
                      key={challenge.id}
                      onClick={() => setFormData(prev => ({ ...prev, challenge_alignment_id: challenge.id }))}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.challenge_alignment_id === challenge.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">
                            {isRTL ? (challenge.title_ar || challenge.title_en) : challenge.title_en}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {isRTL 
                              ? (challenge.description_ar || challenge.description_en)?.substring(0, 150) 
                              : challenge.description_en?.substring(0, 150)}...
                          </p>
                        </div>
                        {formData.challenge_alignment_id === challenge.id && (
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        {challenge.sector && <Badge variant="secondary">{challenge.sector}</Badge>}
                        {challenge.priority && <Badge variant="outline">{challenge.priority}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: AI-Assisted Proposal */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t({ en: 'Describe Your Idea', ar: 'صف فكرتك' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Tell us about your solution idea and our AI will help structure it into a professional proposal', ar: 'أخبرنا عن فكرة حلك وسيساعدك الذكاء الاصطناعي في تنظيمها كمقترح احترافي' })}
                </CardDescription>
              </CardHeader>

              {selectedChallenge && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="font-medium">{t({ en: 'Selected Challenge', ar: 'التحدي المختار' })}</span>
                  </div>
                  <p className="text-sm font-semibold">{selectedChallenge.title_en}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedChallenge.desired_outcome_en || selectedChallenge.description_en?.substring(0, 100)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t({ en: 'Your Solution Idea', ar: 'فكرة حلك' })} *</Label>
                <Textarea
                  value={initialDescription}
                  onChange={(e) => setInitialDescription(e.target.value)}
                  placeholder={t({ 
                    en: 'Describe your idea in your own words. What solution do you propose? How will it help solve the challenge? (Be as detailed as you can)',
                    ar: 'صف فكرتك بكلماتك الخاصة. ما الحل الذي تقترحه؟ كيف سيساعد في حل التحدي؟ (كن مفصلاً قدر الإمكان)'
                  })}
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button 
                onClick={generateProposal} 
                disabled={aiGenerating || !initialDescription.trim() || !isAvailable}
                className="w-full"
                size="lg"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t({ en: 'Generating Proposal...', ar: 'جاري إنشاء المقترح...' })}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {t({ en: 'Generate Proposal with AI', ar: 'إنشاء مقترح بالذكاء الاصطناعي' })}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                {t({ en: 'You can edit all fields after generation', ar: 'يمكنك تعديل جميع الحقول بعد الإنشاء' })}
              </p>
            </div>
          )}

          {/* Step 3: Your Details & Edit Proposal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {t({ en: 'Review & Complete Your Proposal', ar: 'راجع واكمل مقترحك' })}
                </CardTitle>
              </CardHeader>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Proposal Title (English)', ar: 'عنوان المقترح (إنجليزي)' })} *</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Proposal Title (Arabic)', ar: 'عنوان المقترح (عربي)' })}</Label>
                    <Input
                      value={formData.title_ar}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_ar: e.target.value }))}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Detailed Description', ar: 'الوصف التفصيلي' })} *</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Implementation Plan', ar: 'خطة التنفيذ' })}</Label>
                  <Textarea
                    value={formData.implementation_plan}
                    onChange={(e) => setFormData(prev => ({ ...prev, implementation_plan: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t({ en: 'Expected Outcomes', ar: 'النتائج المتوقعة' })}</Label>
                  <Textarea
                    value={formData.expected_outcomes}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_outcomes: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {t({ en: 'Budget Estimate (SAR)', ar: 'تقدير الميزانية (ريال)' })}
                    </Label>
                    <Input
                      type="number"
                      value={formData.budget_estimate}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget_estimate: e.target.value }))}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t({ en: 'Timeline', ar: 'المدة الزمنية' })}
                    </Label>
                    <Input
                      value={formData.timeline_proposal}
                      onChange={(e) => setFormData(prev => ({ ...prev, timeline_proposal: e.target.value }))}
                      placeholder={t({ en: '3-6 months', ar: '3-6 أشهر' })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t({ en: 'Your Information', ar: 'معلوماتك' })}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Your Name', ar: 'اسمك' })} *</Label>
                      <Input
                        value={formData.submitter_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Email', ar: 'البريد الإلكتروني' })} *</Label>
                      <Input
                        type="email"
                        value={formData.submitter_email}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Organization (if any)', ar: 'المنظمة (إن وجدت)' })}</Label>
                      <Input
                        value={formData.submitter_organization}
                        onChange={(e) => setFormData(prev => ({ ...prev, submitter_organization: e.target.value }))}
                        placeholder={t({ en: 'Optional', ar: 'اختياري' })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Submitter Type', ar: 'نوع المقدم' })}</Label>
                      <Select 
                        value={formData.submitter_type} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, submitter_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="citizen">{t({ en: 'Citizen', ar: 'مواطن' })}</SelectItem>
                          <SelectItem value="startup">{t({ en: 'Startup', ar: 'شركة ناشئة' })}</SelectItem>
                          <SelectItem value="researcher">{t({ en: 'Researcher', ar: 'باحث' })}</SelectItem>
                          <SelectItem value="organization">{t({ en: 'Organization', ar: 'منظمة' })}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {t({ en: 'Review Your Proposal', ar: 'مراجعة مقترحك' })}
                </CardTitle>
                <CardDescription>
                  {t({ en: 'Please review all details before submitting', ar: 'يرجى مراجعة جميع التفاصيل قبل التقديم' })}
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                {/* Challenge */}
                {selectedChallenge && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t({ en: 'Responding to Challenge', ar: 'الرد على التحدي' })}</p>
                    <p className="font-semibold">{selectedChallenge.title_en}</p>
                  </div>
                )}

                {/* Proposal Summary */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t({ en: 'Proposal Title', ar: 'عنوان المقترح' })}</p>
                    <p className="font-semibold">{formData.title_en}</p>
                    {formData.title_ar && <p className="text-sm text-muted-foreground" dir="rtl">{formData.title_ar}</p>}
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">{t({ en: 'Description', ar: 'الوصف' })}</p>
                    <p className="text-sm line-clamp-4">{formData.description_en}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                      <p className="font-medium">{formData.budget_estimate ? `SAR ${Number(formData.budget_estimate).toLocaleString()}` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t({ en: 'Timeline', ar: 'المدة' })}</p>
                      <p className="font-medium">{formData.timeline_proposal || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Submitter Info */}
                <div className="border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">{t({ en: 'Submitted By', ar: 'مقدم من' })}</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{formData.submitter_name}</p>
                      <p className="text-sm text-muted-foreground">{formData.submitter_email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t({ en: 'Back', ar: 'رجوع' })}
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                {t({ en: 'Continue', ar: 'متابعة' })}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {submitMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {t({ en: 'Submit Proposal', ar: 'تقديم المقترح' })}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ChallengeIdeaResponse, { requiredPermissions: [] });
