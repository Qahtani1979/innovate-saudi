import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Lightbulb, Send, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, 
  Loader2, Globe, Star, Users, Trophy, Heart, Rocket
} from 'lucide-react';
import { toast } from 'sonner';
import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

// Rate limiting helper
const RATE_LIMIT_KEY = 'public_idea_submissions';
const MAX_SUBMISSIONS_PER_DAY = 3;

const checkRateLimit = () => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  if (!stored) return { allowed: true, remaining: MAX_SUBMISSIONS_PER_DAY };
  
  const { count, date } = JSON.parse(stored);
  const today = new Date().toDateString();
  
  if (date !== today) {
    return { allowed: true, remaining: MAX_SUBMISSIONS_PER_DAY };
  }
  
  return { 
    allowed: count < MAX_SUBMISSIONS_PER_DAY, 
    remaining: MAX_SUBMISSIONS_PER_DAY - count 
  };
};

const recordSubmission = () => {
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  const today = new Date().toDateString();
  
  if (!stored) {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, date: today }));
    return;
  }
  
  const { count, date } = JSON.parse(stored);
  if (date !== today) {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: 1, date: today }));
  } else {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ count: count + 1, date: today }));
  }
};

export default function PublicIdeaSubmission() {
  const { language, isRTL, t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState({ allowed: true, remaining: MAX_SUBMISSIONS_PER_DAY });
  
  // Check rate limit on mount and after submissions
  useEffect(() => {
    setRateLimitInfo(checkRateLimit());
  }, [submitted]);
  
  // Step 1: Initial input
  const [initialIdea, setInitialIdea] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  
  // Step 2: AI-generated data
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    category: '',
    tags: [],
    tags_ar: [],
    impact_score: 0,
    feasibility_score: 0,
    suggested_category: '',
    ai_summary: '',
    ai_summary_ar: ''
  });
  
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    is_anonymous: false
  });

  // Fetch municipalities
  const { data: municipalities = [] } = useQuery({
    queryKey: ['public-municipalities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .order('name_en');
      return data || [];
    }
  });

  // AI Generate idea details
  const handleAIGenerate = async () => {
    if (!initialIdea.trim()) {
      toast.error(t({ 
        en: 'Please describe your idea first', 
        ar: 'يرجى وصف فكرتك أولاً' 
      }));
      return;
    }

    setIsAIProcessing(true);
    try {
      const municipality = municipalities.find(m => m.id === selectedMunicipality);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-idea-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          idea: initialIdea,
          municipality: municipality ? `${municipality.name_en} (${municipality.name_ar})` : null
        })
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const result = await response.json();
      
      setFormData({
        title: result.title_en || '',
        title_ar: result.title_ar || '',
        description: result.description_en || '',
        description_ar: result.description_ar || '',
        category: result.category || 'other',
        tags: result.tags_en || result.tags || [],
        tags_ar: result.tags_ar || [],
        impact_score: result.impact_score || 50,
        feasibility_score: result.feasibility_score || 50,
        suggested_category: result.suggested_category || '',
        ai_summary: result.ai_summary_en || result.ai_summary || '',
        ai_summary_ar: result.ai_summary_ar || ''
      });
      
      setCurrentStep(2);
      toast.success(t({ 
        en: 'AI has analyzed your idea!', 
        ar: 'قام الذكاء الاصطناعي بتحليل فكرتك!' 
      }));
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ 
        en: 'AI analysis failed. Please try again.', 
        ar: 'فشل تحليل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.' 
      }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Submit idea
  const handleSubmit = async () => {
    // Re-check rate limit
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      toast.error(t({ 
        en: `Daily limit reached. You can submit ${MAX_SUBMISSIONS_PER_DAY} ideas per day. Please come back tomorrow!`, 
        ar: `تم الوصول إلى الحد اليومي. يمكنك تقديم ${MAX_SUBMISSIONS_PER_DAY} أفكار يوميًا. يرجى العودة غدًا!` 
      }));
      setRateLimitInfo(rateLimit);
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t({ 
        en: 'Please provide an idea title', 
        ar: 'يرجى تقديم عنوان للفكرة' 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      // Build metadata including contact info
      const submissionMetadata = {
        original_input: initialIdea,
        ai_generated: true,
        contact_name: contactInfo.is_anonymous ? null : contactInfo.name,
        contact_email: contactInfo.is_anonymous ? null : contactInfo.email,
        is_anonymous: contactInfo.is_anonymous,
        submitted_at: new Date().toISOString()
      };

      const { data: insertedIdea, error } = await supabase
        .from('citizen_ideas')
        .insert({
          title: language === 'ar' ? formData.title_ar : formData.title,
          description: language === 'ar' ? formData.description_ar : formData.description,
          category: formData.category,
          municipality_id: selectedMunicipality || null,
          tags: formData.tags,
          status: 'pending',
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;
      
      // Send confirmation email if contact provided
      if (!contactInfo.is_anonymous && contactInfo.email) {
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
            },
            body: JSON.stringify({
              to: contactInfo.email,
              subject: language === 'ar' 
                ? 'شكرًا لمشاركة فكرتك - بلدي للابتكار' 
                : 'Thank you for your idea - Baladi Innovation',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #10b981;">${language === 'ar' ? 'شكرًا لمشاركة فكرتك!' : 'Thank you for sharing your idea!'}</h2>
                  <p>${language === 'ar' ? `مرحبًا ${contactInfo.name || ''},` : `Hello ${contactInfo.name || ''},`}</p>
                  <p>${language === 'ar' 
                    ? 'لقد استلمنا فكرتك وسيتم مراجعتها من قبل فريقنا.' 
                    : 'We have received your idea and it will be reviewed by our team.'}</p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>${language === 'ar' ? 'عنوان الفكرة:' : 'Idea Title:'}</strong><br/>
                    ${formData.title}
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    ${language === 'ar' 
                      ? 'سنتواصل معك إذا كانت لدينا أي أسئلة.' 
                      : 'We will contact you if we have any questions.'}
                  </p>
                </div>
              `
            })
          });
        } catch (emailError) {
          console.log('Email notification failed (non-critical):', emailError);
        }
      }
      
      recordSubmission();
      setRateLimitInfo(checkRateLimit());
      setSubmitted(true);
      toast.success(t({ 
        en: 'Your idea has been submitted successfully!', 
        ar: 'تم إرسال فكرتك بنجاح!' 
      }));
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t({ 
        en: 'Failed to submit. Please try again.', 
        ar: 'فشل الإرسال. يرجى المحاولة مرة أخرى.' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSubmitted(false);
    setCurrentStep(1);
    setInitialIdea('');
    setSelectedMunicipality('');
    setFormData({
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      category: '',
      tags: [],
      tags_ar: [],
      impact_score: 0,
      feasibility_score: 0,
      suggested_category: '',
      ai_summary: '',
      ai_summary_ar: ''
    });
    setContactInfo({ name: '', email: '', is_anonymous: false });
  };

  // Success screen
  if (submitted) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <PublicHeader />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="max-w-2xl w-full border-2 border-emerald-300 shadow-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                {t({ en: 'Thank You, Changemaker!', ar: 'شكراً لك، صانع التغيير!' })}
              </h2>
              
              <p className="text-lg text-slate-600 mb-8">
                {t({ 
                  en: 'Your idea has been submitted and will be reviewed by the municipality team. You are helping shape the future of your city!', 
                  ar: 'تم إرسال فكرتك وستتم مراجعتها من قبل فريق البلدية. أنت تساهم في صياغة مستقبل مدينتك!' 
                })}
              </p>

              {/* Engagement promotion */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center justify-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {t({ en: 'Join Our Community', ar: 'انضم إلى مجتمعنا' })}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                    <span className="text-sm font-medium text-slate-700">
                      {t({ en: 'Earn Points', ar: 'اكسب النقاط' })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t({ en: 'For every idea', ar: 'لكل فكرة' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <Users className="h-8 w-8 text-blue-500 mb-2" />
                    <span className="text-sm font-medium text-slate-700">
                      {t({ en: 'Get Votes', ar: 'احصل على أصوات' })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t({ en: 'From citizens', ar: 'من المواطنين' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm">
                    <Rocket className="h-8 w-8 text-purple-500 mb-2" />
                    <span className="text-sm font-medium text-slate-700">
                      {t({ en: 'See Impact', ar: 'شاهد التأثير' })}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t({ en: 'Track progress', ar: 'تتبع التقدم' })}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => window.location.href = '/auth'}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  {t({ en: 'Create Free Account', ar: 'إنشاء حساب مجاني' })}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={handleReset}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit Another Idea', ar: 'إرسال فكرة أخرى' })}
                </Button>
                <Button variant="ghost" onClick={() => window.location.href = '/public-challenges'}>
                  {t({ en: 'View Active Challenges', ar: 'عرض التحديات النشطة' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-4">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              {t({ en: 'AI-Powered Idea Submission', ar: 'تقديم الأفكار بالذكاء الاصطناعي' })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            {t({ en: 'Share Your Vision', ar: 'شارك رؤيتك' })}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t({ 
              en: 'Help improve your city with innovative ideas. Our AI will help refine and categorize your submission.', 
              ar: 'ساعد في تحسين مدينتك بأفكار مبتكرة. سيساعدك الذكاء الاصطناعي في تحسين وتصنيف فكرتك.' 
            })}
          </p>
        </div>

        {/* Rate Limit Notice */}
        {!rateLimitInfo.allowed ? (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Lightbulb className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800">
                  {t({ en: 'Daily Limit Reached', ar: 'تم الوصول إلى الحد اليومي' })}
                </h3>
                <p className="text-amber-700 text-sm mt-1">
                  {t({ 
                    en: `You've submitted ${MAX_SUBMISSIONS_PER_DAY} ideas today. Come back tomorrow to share more ideas!`,
                    ar: `لقد قدمت ${MAX_SUBMISSIONS_PER_DAY} أفكار اليوم. عد غدًا لمشاركة المزيد من الأفكار!`
                  })}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                  onClick={() => window.location.href = '/public-challenges'}
                >
                  {t({ en: 'View Active Challenges Instead', ar: 'عرض التحديات النشطة بدلاً من ذلك' })}
                </Button>
              </div>
            </div>
          </div>
        ) : rateLimitInfo.remaining <= 2 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <p className="text-blue-700 text-sm">
                {t({ 
                  en: `You have ${rateLimitInfo.remaining} idea${rateLimitInfo.remaining === 1 ? '' : 's'} remaining today.`,
                  ar: `لديك ${rateLimitInfo.remaining} ${rateLimitInfo.remaining === 1 ? 'فكرة متبقية' : 'أفكار متبقية'} اليوم.`
                })}
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">1</span>
              <span className="font-medium">{t({ en: 'Describe', ar: 'الوصف' })}</span>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">2</span>
              <span className="font-medium">{t({ en: 'Review & Submit', ar: 'المراجعة والإرسال' })}</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Step 1: AI-First Input */}
          {currentStep === 1 && (
            <Card className="border-2 border-indigo-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  {t({ en: 'Describe Your Idea', ar: 'صف فكرتك' })}
                </CardTitle>
                <p className="text-white/90 mt-2">
                  {t({ 
                    en: 'Tell us about your idea in your own words. AI will help structure and enhance it.', 
                    ar: 'أخبرنا عن فكرتك بكلماتك الخاصة. سيساعدك الذكاء الاصطناعي في هيكلتها وتحسينها.' 
                  })}
                </p>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {/* Municipality Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Municipality (Optional)', ar: 'البلدية (اختياري)' })}
                  </label>
                  <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ en: 'Select municipality...', ar: 'اختر البلدية...' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {municipalities.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {language === 'ar' ? m.name_ar || m.name_en : m.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Main Idea Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Your Idea *', ar: 'فكرتك *' })}
                  </label>
                  <Textarea
                    value={initialIdea}
                    onChange={(e) => setInitialIdea(e.target.value)}
                    placeholder={t({ 
                      en: 'Describe your idea in detail. What problem does it solve? What improvements would it bring? Be as specific as possible...', 
                      ar: 'صف فكرتك بالتفصيل. ما المشكلة التي تحلها؟ ما التحسينات التي ستجلبها؟ كن محددًا قدر الإمكان...' 
                    })}
                    rows={8}
                    className="text-lg"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    {t({ 
                      en: `${initialIdea.length} characters - We recommend at least 50 characters for better AI analysis`, 
                      ar: `${initialIdea.length} حرف - نوصي بما لا يقل عن 50 حرفًا لتحليل أفضل بالذكاء الاصطناعي` 
                    })}
                  </p>
                </div>

                {/* AI Generate Button */}
                <Button
                  onClick={handleAIGenerate}
                  disabled={isAIProcessing || initialIdea.length < 20 || !rateLimitInfo.allowed}
                  className="w-full h-14 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  {isAIProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {t({ en: 'AI is analyzing your idea...', ar: 'الذكاء الاصطناعي يحلل فكرتك...' })}
                    </>
                  ) : !rateLimitInfo.allowed ? (
                    <>
                      {t({ en: 'Daily limit reached', ar: 'تم الوصول إلى الحد اليومي' })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {t({ en: 'Analyze with AI & Continue', ar: 'تحليل بالذكاء الاصطناعي والمتابعة' })}
                    </>
                  )}
                </Button>

                {/* Rate limit info */}
                <p className="text-center text-sm text-slate-500">
                  {t({ 
                    en: `You can submit up to ${MAX_SUBMISSIONS_PER_DAY} ideas per day. Remaining today: ${rateLimitInfo.remaining}`, 
                    ar: `يمكنك تقديم ${MAX_SUBMISSIONS_PER_DAY} أفكار يوميًا. المتبقي اليوم: ${rateLimitInfo.remaining}` 
                  })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Review AI-Generated Content */}
          {currentStep === 2 && (
            <Card className="border-2 border-indigo-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  {t({ en: 'Review & Submit', ar: 'المراجعة والإرسال' })}
                </CardTitle>
                <p className="text-white/90 mt-2">
                  {t({ 
                    en: 'AI has analyzed your idea. Review the details below and submit when ready.', 
                    ar: 'قام الذكاء الاصطناعي بتحليل فكرتك. راجع التفاصيل أدناه وأرسل عندما تكون جاهزًا.' 
                  })}
                </p>
              </CardHeader>
              <CardContent className="pt-8 space-y-6">
                {/* AI Analysis Summary */}
                {(formData.ai_summary || formData.ai_summary_ar) && (
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      <span className="font-medium text-indigo-900">
                        {t({ en: 'AI Analysis', ar: 'تحليل الذكاء الاصطناعي' })}
                      </span>
                    </div>
                    <p className="text-slate-700">{language === 'ar' ? (formData.ai_summary_ar || formData.ai_summary) : formData.ai_summary}</p>
                  </div>
                )}

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-emerald-600">{formData.impact_score}%</div>
                    <div className="text-sm text-slate-600">
                      {t({ en: 'Impact Score', ar: 'درجة التأثير' })}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-blue-600">{formData.feasibility_score}%</div>
                    <div className="text-sm text-slate-600">
                      {t({ en: 'Feasibility Score', ar: 'درجة الجدوى' })}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Title', ar: 'العنوان' })}
                  </label>
                  <Input
                    value={language === 'ar' ? formData.title_ar : formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [language === 'ar' ? 'title_ar' : 'title']: e.target.value
                    }))}
                    className="text-lg font-medium"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Description', ar: 'الوصف' })}
                  </label>
                  <Textarea
                    value={language === 'ar' ? formData.description_ar : formData.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [language === 'ar' ? 'description_ar' : 'description']: e.target.value
                    }))}
                    rows={5}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t({ en: 'Category', ar: 'الفئة' })}
                  </label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
                      <SelectItem value="infrastructure">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</SelectItem>
                      <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
                      <SelectItem value="digital_services">{t({ en: 'Digital Services', ar: 'الخدمات الرقمية' })}</SelectItem>
                      <SelectItem value="parks">{t({ en: 'Parks & Recreation', ar: 'الحدائق والترفيه' })}</SelectItem>
                      <SelectItem value="waste">{t({ en: 'Waste Management', ar: 'إدارة النفايات' })}</SelectItem>
                      <SelectItem value="safety">{t({ en: 'Safety', ar: 'السلامة' })}</SelectItem>
                      <SelectItem value="health">{t({ en: 'Health', ar: 'الصحة' })}</SelectItem>
                      <SelectItem value="education">{t({ en: 'Education', ar: 'التعليم' })}</SelectItem>
                      <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                {(formData.tags.length > 0 || formData.tags_ar?.length > 0) && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t({ en: 'Tags', ar: 'الكلمات المفتاحية' })}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(language === 'ar' && formData.tags_ar?.length > 0 ? formData.tags_ar : formData.tags).map((tag, idx) => (
                        <Badge key={idx} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {t({ en: 'Your Information (Optional)', ar: 'معلوماتك (اختياري)' })}
                  </h3>
                  
                  {/* Anonymous Toggle */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={contactInfo.is_anonymous}
                      onChange={(e) => setContactInfo(prev => ({ 
                        ...prev, 
                        is_anonymous: e.target.checked,
                        name: e.target.checked ? '' : prev.name,
                        email: e.target.checked ? '' : prev.email
                      }))}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="anonymous" className="text-slate-700 cursor-pointer">
                      {t({ en: 'Submit anonymously', ar: 'إرسال بشكل مجهول' })}
                    </label>
                  </div>

                  {!contactInfo.is_anonymous && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Your Name', ar: 'اسمك' })}
                        </label>
                        <Input
                          value={contactInfo.name}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, name: e.target.value }))}
                          placeholder={t({ en: 'Enter your name...', ar: 'أدخل اسمك...' })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {t({ en: 'Email Address', ar: 'البريد الإلكتروني' })}
                        </label>
                        <Input
                          type="email"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={t({ en: 'your@email.com', ar: 'your@email.com' })}
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-slate-500 mt-3">
                    {contactInfo.is_anonymous 
                      ? t({ en: 'Your idea will be submitted without any personal information.', ar: 'سيتم إرسال فكرتك دون أي معلومات شخصية.' })
                      : t({ en: 'Providing your contact info helps us follow up on your idea.', ar: 'تقديم معلومات الاتصال يساعدنا في متابعة فكرتك.' })
                    }
                  </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t({ en: 'Back', ar: 'رجوع' })}
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t({ en: 'Submitting...', ar: 'جاري الإرسال...' })}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t({ en: 'Submit Idea', ar: 'إرسال الفكرة' })}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
}
