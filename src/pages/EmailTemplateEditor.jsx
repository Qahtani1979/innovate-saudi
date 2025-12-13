import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Mail, Eye, Save, Sparkles, Loader2, Send, Plus, Trash2, Copy, Settings, RefreshCw, Check, X, FileText, Brain, AlertTriangle, Lightbulb, TrendingUp, CheckCircle2, History } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

const CATEGORIES = [
  { value: 'auth', label: { en: 'Authentication', ar: 'المصادقة' } },
  { value: 'role', label: { en: 'Role Management', ar: 'إدارة الأدوار' } },
  { value: 'challenge', label: { en: 'Challenges', ar: 'التحديات' } },
  { value: 'solution', label: { en: 'Solutions', ar: 'الحلول' } },
  { value: 'pilot', label: { en: 'Pilots', ar: 'التجارب' } },
  { value: 'program', label: { en: 'Programs', ar: 'البرامج' } },
  { value: 'evaluation', label: { en: 'Evaluations', ar: 'التقييمات' } },
  { value: 'citizen', label: { en: 'Citizen Engagement', ar: 'مشاركة المواطنين' } },
  { value: 'task', label: { en: 'Tasks', ar: 'المهام' } },
  { value: 'event', label: { en: 'Events', ar: 'الفعاليات' } },
  { value: 'contract', label: { en: 'Contracts', ar: 'العقود' } },
  { value: 'sandbox', label: { en: 'Sandboxes', ar: 'البيئات التجريبية' } },
  { value: 'system', label: { en: 'System', ar: 'النظام' } },
  { value: 'research', label: { en: 'Research', ar: 'البحث' } },
];

function EmailTemplateEditor() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showPreview, setShowPreview] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [isSending, setIsSending] = useState(false);
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  const [template, setTemplate] = useState({
    template_key: '',
    category: 'system',
    name_en: '',
    name_ar: '',
    subject_en: '',
    subject_ar: '',
    body_en: '',
    body_ar: '',
    is_html: true,
    use_header: true,
    use_footer: true,
    header_title_en: '',
    header_title_ar: '',
    header_gradient_start: '#006C35',
    header_gradient_end: '#00A651',
    cta_text_en: '',
    cta_text_ar: '',
    cta_url_variable: '',
    variables: [],
    is_active: true,
    is_system: false,
    is_critical: false,
  });

  // Fetch templates
  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('category', { ascending: true })
        .order('name_en', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  // Filter templates
  const filteredTemplates = templates.filter(t => 
    filterCategory === 'all' || t.category === filterCategory
  );

  // Load selected template
  useEffect(() => {
    if (selectedTemplateId) {
      const selected = templates.find(t => t.id === selectedTemplateId);
      if (selected) {
        setTemplate({
          ...selected,
          variables: selected.variables || []
        });
      }
    }
  }, [selectedTemplateId, templates]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (selectedTemplateId) {
        const { error } = await supabase
          .from('email_templates')
          .update(data)
          .eq('id', selectedTemplateId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('email_templates')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success(t({ en: 'Template saved successfully', ar: 'تم حفظ القالب بنجاح' }));
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      setSelectedTemplateId(null);
      resetForm();
      toast.success(t({ en: 'Template deleted', ar: 'تم حذف القالب' }));
    }
  });

  const resetForm = () => {
    setTemplate({
      template_key: '',
      category: 'system',
      name_en: '',
      name_ar: '',
      subject_en: '',
      subject_ar: '',
      body_en: '',
      body_ar: '',
      is_html: true,
      use_header: true,
      use_footer: true,
      header_title_en: '',
      header_title_ar: '',
      header_gradient_start: '#006C35',
      header_gradient_end: '#00A651',
      cta_text_en: '',
      cta_text_ar: '',
      cta_url_variable: '',
      variables: [],
      is_active: true,
      is_system: false,
      is_critical: false,
    });
  };

  const handleSave = () => {
    if (!template.template_key || !template.name_en || !template.subject_en || !template.body_en) {
      toast.error(t({ en: 'Please fill required fields', ar: 'يرجى ملء الحقول المطلوبة' }));
      return;
    }
    saveMutation.mutate(template);
  };

  const handleAIGenerate = async () => {
    const categoryLabel = CATEGORIES.find(c => c.value === template.category)?.label.en || template.category;
    
    const result = await invokeAI({
      prompt: `Generate a COMPLETE professional bilingual email template for: "${template.name_en || template.template_key}"
Category: ${categoryLabel}

This is for a Saudi municipal innovation platform (الابتكار السعودي). Generate ALL fields:

REQUIREMENTS:
1. Professional yet warm tone appropriate for government/municipal communication
2. Both English and Arabic versions (use formal Arabic فصحى)
3. Use HTML formatting: <p>, <strong>, <ul>, <li>, <br> tags
4. Include ALL necessary template variables wrapped in {{variableName}} format
5. CTA (Call-to-Action) should be action-oriented and clear
6. Arabic name should be a proper translation of the English name

COMMON VARIABLES TO USE (pick relevant ones):
- {{userName}} - recipient's name
- {{userEmail}} - recipient's email
- {{entityTitle}} - title of challenge/solution/pilot/etc
- {{organizationName}} - organization name
- {{municipalityName}} - municipality name
- {{actionUrl}} - link to take action
- {{dashboardUrl}} - link to dashboard
- {{deadline}} - deadline date
- {{status}} - current status
- {{score}} - evaluation score
- {{roleName}} - role name
- {{rejectionReason}} - reason for rejection if applicable

Generate a complete, production-ready email template.`,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string', description: 'English display name for the template' },
          name_ar: { type: 'string', description: 'Arabic display name for the template' },
          subject_en: { type: 'string', description: 'English email subject line' },
          subject_ar: { type: 'string', description: 'Arabic email subject line' },
          body_en: { type: 'string', description: 'Full English email body with HTML formatting' },
          body_ar: { type: 'string', description: 'Full Arabic email body with HTML formatting' },
          header_title_en: { type: 'string', description: 'English header/banner title' },
          header_title_ar: { type: 'string', description: 'Arabic header/banner title' },
          cta_text_en: { type: 'string', description: 'English call-to-action button text' },
          cta_text_ar: { type: 'string', description: 'Arabic call-to-action button text' },
          cta_url_variable: { type: 'string', description: 'Variable name for CTA URL like actionUrl or dashboardUrl' },
          variables: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'List of all variable names used in the template (without curly braces)'
          }
        },
        required: ['name_en', 'name_ar', 'subject_en', 'subject_ar', 'body_en', 'body_ar', 'header_title_en', 'header_title_ar', 'cta_text_en', 'cta_text_ar', 'variables']
      }
    });
    
    if (result.success) {
      const data = result.data;
      setTemplate(prev => ({
        ...prev,
        name_en: data.name_en || prev.name_en,
        name_ar: data.name_ar || prev.name_ar,
        subject_en: data.subject_en || prev.subject_en,
        subject_ar: data.subject_ar || prev.subject_ar,
        body_en: data.body_en || prev.body_en,
        body_ar: data.body_ar || prev.body_ar,
        header_title_en: data.header_title_en || prev.header_title_en,
        header_title_ar: data.header_title_ar || prev.header_title_ar,
        cta_text_en: data.cta_text_en || prev.cta_text_en,
        cta_text_ar: data.cta_text_ar || prev.cta_text_ar,
        cta_url_variable: data.cta_url_variable || prev.cta_url_variable || 'actionUrl',
        variables: data.variables && data.variables.length > 0 ? data.variables : prev.variables,
      }));
      toast.success(t({ en: 'AI generated all template fields', ar: 'تم توليد جميع حقول القالب' }));
    } else {
      toast.error(t({ en: 'AI generation failed', ar: 'فشل التوليد الذكي' }));
    }
  };

  const handleAIAnalysis = async () => {
    setShowAnalysisDialog(true);
    setAnalysisResult(null);
    
    // Prepare template summary for analysis
    const templateSummary = templates.map(t => ({
      key: t.template_key,
      category: t.category,
      name: t.name_en,
      hasArabic: !!t.body_ar,
      hasHeader: t.use_header,
      hasFooter: t.use_footer,
      hasCTA: !!t.cta_text_en,
      variableCount: t.variables?.length || 0,
      isActive: t.is_active,
      isSystem: t.is_system,
      isCritical: t.is_critical
    }));
    
    const categoryCounts = CATEGORIES.map(c => ({
      category: c.value,
      label: c.label.en,
      count: templates.filter(t => t.category === c.value).length
    }));
    
    const result = await invokeAI({
      prompt: `Analyze this email template database for a Saudi municipal innovation platform (bilingual EN/AR).

TEMPLATES (${templates.length} total):
${JSON.stringify(templateSummary, null, 2)}

CATEGORY DISTRIBUTION:
${JSON.stringify(categoryCounts, null, 2)}

Provide a comprehensive analysis covering:
1. Overall health assessment (score 1-100)
2. Coverage gaps (missing templates for common workflows)
3. Consistency issues (templates missing Arabic, headers, CTAs)
4. Category balance (over/under represented categories)
5. Specific recommendations for improvement
6. Best practices compliance
7. Suggested new templates to add`,
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          health_summary: { type: 'string' },
          coverage_gaps: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                gap: { type: 'string' },
                priority: { type: 'string' },
                suggested_template: { type: 'string' }
              }
            }
          },
          consistency_issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                issue: { type: 'string' },
                affected_templates: { type: 'array', items: { type: 'string' } },
                fix: { type: 'string' }
              }
            }
          },
          category_analysis: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                category: { type: 'string' },
                status: { type: 'string' },
                recommendation: { type: 'string' }
              }
            }
          },
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                priority: { type: 'string' }
              }
            }
          },
          suggested_templates: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                template_key: { type: 'string' },
                category: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }
    });
    
    if (result.success) {
      setAnalysisResult(result.data);
    } else {
      toast.error(t({ en: 'Analysis failed', ar: 'فشل التحليل' }));
    }
  };

  // Actionable handlers for AI Analysis - keep drawer open for continued actions
  const handleSelectTemplateByKey = (templateKey) => {
    const found = templates.find(t => t.template_key === templateKey);
    if (found) {
      setSelectedTemplateId(found.id);
      // Don't close drawer - allow user to continue taking actions
      toast.success(t({ en: `Selected: ${found.name_en}`, ar: `تم تحديد: ${found.name_en}` }));
    } else {
      toast.error(t({ en: 'Template not found', ar: 'القالب غير موجود' }));
    }
  };

  const handleFilterByCategory = (category) => {
    // Map category names to values
    const catMap = {
      'auth': 'auth', 'authentication': 'auth',
      'role': 'role', 'role management': 'role',
      'challenge': 'challenge', 'challenges': 'challenge',
      'solution': 'solution', 'solutions': 'solution',
      'pilot': 'pilot', 'pilots': 'pilot',
      'program': 'program', 'programs': 'program',
      'evaluation': 'evaluation', 'evaluations': 'evaluation',
      'citizen': 'citizen', 'citizen engagement': 'citizen',
      'task': 'task', 'tasks': 'task',
      'event': 'event', 'events': 'event',
      'contract': 'contract', 'contracts': 'contract',
      'sandbox': 'sandbox', 'sandboxes': 'sandbox',
      'system': 'system',
      'research': 'research'
    };
    const catValue = catMap[category.toLowerCase()] || category.toLowerCase();
    if (CATEGORIES.some(c => c.value === catValue)) {
      setFilterCategory(catValue);
      // Don't close drawer - allow user to continue taking actions
      toast.success(t({ en: `Filtered by: ${category}`, ar: `تمت التصفية حسب: ${category}` }));
    }
  };

  const handleCreateSuggestedTemplate = (suggested) => {
    setSelectedTemplateId(null);
    setTemplate({
      template_key: suggested.template_key || '',
      category: suggested.category || 'system',
      name_en: suggested.name || '',
      name_ar: '',
      subject_en: '',
      subject_ar: '',
      body_en: '',
      body_ar: '',
      is_html: true,
      use_header: true,
      use_footer: true,
      header_title_en: suggested.name || '',
      header_title_ar: '',
      header_gradient_start: '#006C35',
      header_gradient_end: '#00A651',
      cta_text_en: '',
      cta_text_ar: '',
      cta_url_variable: '',
      variables: [],
      is_active: true,
      is_system: false,
      is_critical: false,
    });
    // Don't close drawer - allow user to continue taking actions
    toast.success(t({ en: `Created draft: ${suggested.name}. Use AI Generate to fill content.`, ar: `تم إنشاء مسودة: ${suggested.name}. استخدم التوليد الذكي لملء المحتوى.` }));
  };

  const handleSendTest = async () => {
    const recipientEmail = testEmail || currentUser?.email;
    if (!recipientEmail) {
      toast.error(t({ en: 'Please enter an email address', ar: 'يرجى إدخال عنوان البريد الإلكتروني' }));
      return;
    }

    setIsSending(true);
    try {
      // Build comprehensive test variables - language-aware based on preview language
      const isArabic = previewLanguage === 'ar';
      const testVariables = {
        userName: currentUser?.user_metadata?.full_name || (isArabic ? 'مستخدم تجريبي' : 'Test User'),
        userEmail: currentUser?.email || 'test@example.com',
        sentAt: new Date().toLocaleString(isArabic ? 'ar-SA' : 'en-US'),
        loginUrl: window.location.origin,
        dashboardUrl: window.location.origin,
        detailUrl: window.location.origin,
        trackingUrl: window.location.origin,
        taskUrl: window.location.origin,
        // Role-related variables
        roleName: isArabic ? 'موظف بلدية' : 'Municipality Staff',
        requestedRole: isArabic ? 'موظف بلدية' : 'Municipality Staff',
        rejectionReason: isArabic ? 'سبب الرفض التجريبي' : 'Sample rejection reason for testing',
        // Entity-related variables
        challengeTitle: isArabic ? 'عنوان التحدي التجريبي' : 'Sample Challenge Title',
        solutionTitle: isArabic ? 'عنوان الحل التجريبي' : 'Sample Solution Title',
        pilotTitle: isArabic ? 'عنوان التجربة التجريبية' : 'Sample Pilot Title',
        proposalTitle: isArabic ? 'عنوان المقترح التجريبي' : 'Sample Proposal Title',
        ideaTitle: isArabic ? 'عنوان الفكرة التجريبية' : 'Sample Idea Title',
        taskName: isArabic ? 'اسم المهمة التجريبية' : 'Sample Task Name',
        // Status and counts
        newStatus: isArabic ? 'تمت الموافقة' : 'approved',
        score: '85',
        totalItems: '5',
        // Time-related
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US'),
        // Organization
        organizationName: isArabic ? 'المنظمة التجريبية' : 'Sample Organization',
        municipalityName: isArabic ? 'البلدية التجريبية' : 'Sample Municipality',
      };

      // Use the current template if saved, otherwise send direct content for preview
      const templateExists = selectedTemplateId && template.template_key;
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: templateExists ? {
          template_key: template.template_key,
          recipient_email: recipientEmail,
          variables: testVariables,
          language: previewLanguage,
          force_send: true,
          triggered_by: currentUser?.email
        } : {
          recipient_email: recipientEmail,
          subject: previewLanguage === 'ar' ? template.subject_ar || template.subject_en : template.subject_en,
          html: `
            <div style="font-family: ${previewLanguage === 'ar' ? "'Noto Sans Arabic', sans-serif" : 'Arial, sans-serif'}; direction: ${previewLanguage === 'ar' ? 'rtl' : 'ltr'}; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, ${template.header_gradient_start || '#006C35'}, ${template.header_gradient_end || '#00A651'}); padding: 24px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">${previewLanguage === 'ar' ? template.header_title_ar || template.header_title_en : template.header_title_en || 'Test Email'}</h1>
              </div>
              <div style="padding: 24px; background: #fff; border: 1px solid #eee; border-top: none;">
                ${previewLanguage === 'ar' ? template.body_ar || template.body_en : template.body_en}
              </div>
              <div style="padding: 16px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
                <p>© ${new Date().getFullYear()} Saudi Innovates. ${previewLanguage === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
              </div>
            </div>
          `,
          language: previewLanguage,
          force_send: true,
          triggered_by: currentUser?.email
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast.success(t({ en: `Test email sent to ${recipientEmail}`, ar: `تم إرسال البريد التجريبي إلى ${recipientEmail}` }));
        setShowTestDialog(false);
      } else {
        // Handle error object from Resend API
        const errorMessage = typeof data.error === 'object' 
          ? data.error?.message || JSON.stringify(data.error) 
          : data.error || data.message || 'Failed to send email';
        toast.error(errorMessage, { duration: 8000 });
      }
    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error(err.message);
    } finally {
      setIsSending(false);
    }
  };

  const insertVariable = (variable) => {
    // This would insert at cursor position - simplified for now
    const varText = `{{${variable}}}`;
    navigator.clipboard.writeText(varText);
    toast.success(t({ en: `Copied ${varText} to clipboard`, ar: `تم نسخ ${varText}` }));
  };

  const getPreviewContent = () => {
    const subject = previewLanguage === 'ar' && template.subject_ar ? template.subject_ar : template.subject_en;
    const body = previewLanguage === 'ar' && template.body_ar ? template.body_ar : template.body_en;
    const headerTitle = previewLanguage === 'ar' ? template.header_title_ar : template.header_title_en;
    const ctaText = previewLanguage === 'ar' ? template.cta_text_ar : template.cta_text_en;
    
    // Replace variables with sample data
    const sampleVars = {
      userName: 'Ahmed Mohammed',
      challengeTitle: 'Smart Waste Management',
      pilotCode: 'PLT-2024-001',
      date: new Date().toLocaleDateString(),
      link: '#'
    };
    
    let processedBody = body;
    let processedSubject = subject;
    Object.entries(sampleVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedBody = processedBody.replace(regex, value);
      processedSubject = processedSubject.replace(regex, value);
    });
    
    return { subject: processedSubject, body: processedBody, headerTitle, ctaText };
  };

  return (
    <PageLayout>
      {/* Header with PageHeader component */}
      <PageHeader
        icon={Mail}
        title={{ en: 'Email Template Manager', ar: 'مدير قوالب البريد' }}
        description={{ en: 'Create, customize, and test bilingual email templates for all platform communications', ar: 'إنشاء وتخصيص واختبار قوالب البريد ثنائية اللغة لجميع اتصالات المنصة' }}
        stats={[
          { icon: FileText, value: templates.length, label: { en: 'Templates', ar: 'قوالب' } },
          { icon: CheckCircle2, value: templates.filter(t => t.is_active).length, label: { en: 'Active', ar: 'نشط' } },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {analysisResult && (
              <Button variant="outline" onClick={() => setShowAnalysisDialog(true)} className="gap-2">
                <History className="h-4 w-4" />
                {t({ en: 'View Analysis', ar: 'عرض التحليل' })}
                <Badge variant="secondary" className="ml-1">{analysisResult.overall_score}/100</Badge>
              </Button>
            )}
            <Button onClick={handleAIAnalysis} disabled={aiLoading || templates.length === 0} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Brain className="h-4 w-4" />
              {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        {/* Template List Sidebar */}
        <div className="col-span-4">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t({ en: 'Templates', ar: 'القوالب' })}</CardTitle>
                <Button size="sm" onClick={() => { setSelectedTemplateId(null); resetForm(); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t({ en: 'New', ar: 'جديد' })}
                </Button>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t({ en: 'Filter by category', ar: 'تصفية حسب الفئة' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</SelectItem>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {t(cat.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto space-y-2">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t({ en: 'No templates found', ar: 'لا توجد قوالب' })}
                </p>
              ) : (
                filteredTemplates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedTemplateId === tmpl.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{tmpl.name_en}</p>
                        <p className="text-xs text-muted-foreground truncate">{tmpl.template_key}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={tmpl.is_active ? 'default' : 'secondary'} className="text-xs">
                          {tmpl.category}
                        </Badge>
                        {tmpl.is_system && (
                          <Badge variant="outline" className="text-xs">
                            <Settings className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Editor Panel */}
        <div className="col-span-8 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleAIGenerate} disabled={aiLoading || !isAvailable} variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
              {aiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2 text-purple-600" />}
              {t({ en: 'AI Generate', ar: 'توليد ذكي' })}
            </Button>
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              {t({ en: 'Preview', ar: 'معاينة' })}
            </Button>
            <Button onClick={() => { setTestEmail(currentUser?.email || ''); setShowTestDialog(true); }} variant="outline">
              <Send className="h-4 w-4 mr-2" />
              {t({ en: 'Test Send', ar: 'إرسال تجريبي' })}
            </Button>
            <Button onClick={handleAIAnalysis} disabled={aiLoading || !isAvailable || templates.length === 0} variant="outline" className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200">
              {aiLoading && showAnalysisDialog ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2 text-blue-600" />}
              {t({ en: 'AI Analysis', ar: 'تحليل ذكي' })}
            </Button>
            <div className="flex-1" />
            {selectedTemplateId && !template.is_system && (
              <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(selectedTemplateId)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {t({ en: 'Delete', ar: 'حذف' })}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-emerald-600 hover:bg-emerald-700">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t({ en: 'Save Template', ar: 'حفظ القالب' })}
            </Button>
          </div>

          <AIStatusIndicator status={aiStatus} rateLimitInfo={rateLimitInfo} />

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t({ en: 'Template Information', ar: 'معلومات القالب' })}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Template Key *', ar: 'مفتاح القالب *' })}</label>
                <Input 
                  value={template.template_key} 
                  onChange={(e) => setTemplate({...template, template_key: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                  placeholder="welcome_new_user"
                  disabled={template.is_system}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Category', ar: 'الفئة' })}</label>
                <Select value={template.category} onValueChange={(v) => setTemplate({...template, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{t(cat.label)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Name (English) *', ar: 'الاسم (إنجليزي) *' })}</label>
                <Input value={template.name_en} onChange={(e) => setTemplate({...template, name_en: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Name (Arabic)', ar: 'الاسم (عربي)' })}</label>
                <Input value={template.name_ar || ''} onChange={(e) => setTemplate({...template, name_ar: e.target.value})} dir="rtl" />
              </div>
              <div className="col-span-2 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={template.is_active} onCheckedChange={(v) => setTemplate({...template, is_active: v})} />
                  <span className="text-sm">{t({ en: 'Active', ar: 'نشط' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={template.is_critical} onCheckedChange={(v) => setTemplate({...template, is_critical: v})} />
                  <span className="text-sm">{t({ en: 'Critical (bypasses preferences)', ar: 'حرج (يتجاوز التفضيلات)' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={template.use_header} onCheckedChange={(v) => setTemplate({...template, use_header: v})} />
                  <span className="text-sm">{t({ en: 'Include Header', ar: 'تضمين الرأس' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={template.use_footer} onCheckedChange={(v) => setTemplate({...template, use_footer: v})} />
                  <span className="text-sm">{t({ en: 'Include Footer', ar: 'تضمين التذييل' })}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="content">{t({ en: 'Content', ar: 'المحتوى' })}</TabsTrigger>
              <TabsTrigger value="header">{t({ en: 'Header & CTA', ar: 'الرأس والإجراء' })}</TabsTrigger>
              <TabsTrigger value="variables">{t({ en: 'Variables', ar: 'المتغيرات' })}</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline">EN</Badge>
                      {t({ en: 'English Version', ar: 'النسخة الإنجليزية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">{t({ en: 'Subject *', ar: 'الموضوع *' })}</label>
                      <Input value={template.subject_en} onChange={(e) => setTemplate({...template, subject_en: e.target.value})} placeholder="Welcome to {{platformName}}" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">{t({ en: 'Body (HTML) *', ar: 'المحتوى (HTML) *' })}</label>
                      <Textarea value={template.body_en} onChange={(e) => setTemplate({...template, body_en: e.target.value})} rows={14} className="font-mono text-sm" placeholder="<p>Dear {{userName}},</p>" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Badge variant="outline">AR</Badge>
                      {t({ en: 'Arabic Version', ar: 'النسخة العربية' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">{t({ en: 'Subject', ar: 'الموضوع' })}</label>
                      <Input value={template.subject_ar || ''} onChange={(e) => setTemplate({...template, subject_ar: e.target.value})} dir="rtl" placeholder="مرحباً بك في {{platformName}}" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block text-muted-foreground">{t({ en: 'Body (HTML)', ar: 'المحتوى (HTML)' })}</label>
                      <Textarea value={template.body_ar || ''} onChange={(e) => setTemplate({...template, body_ar: e.target.value})} rows={14} dir="rtl" className="font-mono text-sm" placeholder="<p>عزيزي {{userName}}،</p>" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="header" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Header Title (English)', ar: 'عنوان الرأس (إنجليزي)' })}</label>
                    <Input value={template.header_title_en || ''} onChange={(e) => setTemplate({...template, header_title_en: e.target.value})} placeholder="Welcome!" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Header Title (Arabic)', ar: 'عنوان الرأس (عربي)' })}</label>
                    <Input value={template.header_title_ar || ''} onChange={(e) => setTemplate({...template, header_title_ar: e.target.value})} dir="rtl" placeholder="مرحباً!" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Gradient Start Color', ar: 'لون بداية التدرج' })}</label>
                    <div className="flex gap-2">
                      <Input type="color" value={template.header_gradient_start || '#006C35'} onChange={(e) => setTemplate({...template, header_gradient_start: e.target.value})} className="w-16 h-10 p-1" />
                      <Input value={template.header_gradient_start || '#006C35'} onChange={(e) => setTemplate({...template, header_gradient_start: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Gradient End Color', ar: 'لون نهاية التدرج' })}</label>
                    <div className="flex gap-2">
                      <Input type="color" value={template.header_gradient_end || '#00A651'} onChange={(e) => setTemplate({...template, header_gradient_end: e.target.value})} className="w-16 h-10 p-1" />
                      <Input value={template.header_gradient_end || '#00A651'} onChange={(e) => setTemplate({...template, header_gradient_end: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'CTA Button Text (English)', ar: 'نص زر الإجراء (إنجليزي)' })}</label>
                    <Input value={template.cta_text_en || ''} onChange={(e) => setTemplate({...template, cta_text_en: e.target.value})} placeholder="Get Started" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'CTA Button Text (Arabic)', ar: 'نص زر الإجراء (عربي)' })}</label>
                    <Input value={template.cta_text_ar || ''} onChange={(e) => setTemplate({...template, cta_text_ar: e.target.value})} dir="rtl" placeholder="ابدأ الآن" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1.5 block">{t({ en: 'CTA URL Variable', ar: 'متغير رابط الإجراء' })}</label>
                    <Input value={template.cta_url_variable || ''} onChange={(e) => setTemplate({...template, cta_url_variable: e.target.value})} placeholder="loginUrl, dashboardUrl, detailUrl..." />
                    <p className="text-xs text-muted-foreground mt-1">{t({ en: 'The variable name that contains the URL (without {{}})', ar: 'اسم المتغير الذي يحتوي على الرابط (بدون {{}})' })}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variables" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {t({ en: 'Click a variable to copy it to clipboard, then paste where needed.', ar: 'انقر على المتغير لنسخه، ثم الصقه حيث تحتاج.' })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['userName', 'userEmail', 'challengeTitle', 'challengeCode', 'pilotTitle', 'pilotCode', 'programName', 'taskTitle', 'roleName', 'date', 'dueDate', 'startDate', 'endDate', 'loginUrl', 'dashboardUrl', 'detailUrl', 'trackingUrl', 'approvalUrl', 'resetUrl', 'actionUrl'].map(v => (
                      <Button key={v} variant="outline" size="sm" onClick={() => insertVariable(v)} className="font-mono text-xs">
                        <Copy className="h-3 w-3 mr-1" />
                        {`{{${v}}}`}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{t({ en: 'Email Preview', ar: 'معاينة البريد' })}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant={previewLanguage === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewLanguage('en')}>EN</Button>
                <Button variant={previewLanguage === 'ar' ? 'default' : 'outline'} size="sm" onClick={() => setPreviewLanguage('ar')}>AR</Button>
              </div>
            </div>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden" dir={previewLanguage === 'ar' ? 'rtl' : 'ltr'}>
            {/* Email Header Preview */}
            {template.use_header && (
              <div 
                className="p-8 text-center text-white"
                style={{ background: `linear-gradient(135deg, ${template.header_gradient_start || '#006C35'}, ${template.header_gradient_end || '#00A651'})` }}
              >
                <Mail className="h-10 w-10 mx-auto mb-3" />
                <h2 className="text-xl font-bold">{getPreviewContent().headerTitle || 'Saudi Innovates'}</h2>
              </div>
            )}
            {/* Subject */}
            <div className="p-4 bg-muted/50 border-b">
              <p className="text-sm text-muted-foreground">{t({ en: 'Subject:', ar: 'الموضوع:' })}</p>
              <p className="font-semibold">{getPreviewContent().subject}</p>
            </div>
            {/* Body */}
            <div className="p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: getPreviewContent().body }}
              />
              {/* CTA Button */}
              {getPreviewContent().ctaText && (
                <div className="mt-6 text-center">
                  <button 
                    className="px-6 py-3 rounded-lg text-white font-semibold"
                    style={{ backgroundColor: template.header_gradient_start || '#006C35' }}
                  >
                    {getPreviewContent().ctaText}
                  </button>
                </div>
              )}
            </div>
            {/* Footer Preview */}
            {template.use_footer && (
              <div className="p-6 bg-muted/30 text-center text-sm text-muted-foreground border-t">
                <p>support@saudiinnovates.sa</p>
                <p>© {new Date().getFullYear()} Saudi Innovates. {previewLanguage === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</p>
                <p>Riyadh, Saudi Arabia</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Send Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t({ en: 'Send Test Email', ar: 'إرسال بريد تجريبي' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Recipient Email', ar: 'البريد الإلكتروني للمستلم' })}</label>
              <Input 
                value={testEmail} 
                onChange={(e) => setTestEmail(e.target.value)} 
                placeholder={currentUser?.email || 'email@example.com'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t({ en: 'Leave empty to send to your email', ar: 'اتركه فارغاً للإرسال إلى بريدك' })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t({ en: 'Language', ar: 'اللغة' })}</label>
              <div className="flex gap-2">
                <Button variant={previewLanguage === 'en' ? 'default' : 'outline'} onClick={() => setPreviewLanguage('en')}>English</Button>
                <Button variant={previewLanguage === 'ar' ? 'default' : 'outline'} onClick={() => setPreviewLanguage('ar')}>العربية</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSendTest} disabled={isSending} className="bg-emerald-600 hover:bg-emerald-700">
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {t({ en: 'Send Test', ar: 'إرسال تجريبي' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Sheet - Side panel that stays open while taking actions */}
      <Sheet open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <SheetContent side="right" className="w-full max-w-lg p-0" dir={isRTL ? 'rtl' : 'ltr'}>
          <SheetHeader className="border-b p-4">
            <SheetTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              {t({ en: 'Email Template Analysis', ar: 'تحليل قوالب البريد' })}
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {t({ en: 'Click any item to take action - panel stays open', ar: 'انقر على أي عنصر لاتخاذ إجراء - اللوحة تبقى مفتوحة' })}
            </p>
          </SheetHeader>
          
          <ScrollArea className="flex-1 h-[calc(100vh-140px)] p-4">
            {aiLoading && !analysisResult ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-muted-foreground">{t({ en: 'Analyzing templates...', ar: 'جاري تحليل القوالب...' })}</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                {/* Overall Score */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className={`text-3xl font-bold ${
                    analysisResult.overall_score >= 80 ? 'text-green-600' : 
                    analysisResult.overall_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysisResult.overall_score}/100
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{t({ en: 'Health Score', ar: 'نقاط الصحة' })}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{analysisResult.health_summary}</p>
                  </div>
                </div>

                {/* Coverage Gaps */}
                {analysisResult.coverage_gaps?.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      {t({ en: 'Coverage Gaps', ar: 'فجوات التغطية' })} ({analysisResult.coverage_gaps.length})
                    </h3>
                    <div className="space-y-1.5">
                      {analysisResult.coverage_gaps.map((gap, i) => (
                        <div key={i} className="p-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg group hover:border-orange-400 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-xs flex-1">{gap.gap}</p>
                            <Badge variant={gap.priority === 'high' ? 'destructive' : gap.priority === 'medium' ? 'warning' : 'secondary'} className="text-[10px] h-5">
                              {gap.priority}
                            </Badge>
                          </div>
                          {gap.suggested_template && (
                            <div className="flex items-center justify-between mt-1.5">
                              <p className="text-[10px] text-muted-foreground">💡 {gap.suggested_template}</p>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 text-[10px] px-2"
                                onClick={() => handleCreateSuggestedTemplate({ 
                                  template_key: gap.suggested_template.toLowerCase().replace(/\s+/g, '_'),
                                  name: gap.suggested_template,
                                  category: 'system'
                                })}
                              >
                                <Plus className="h-3 w-3 mr-0.5" />
                                {t({ en: 'Create', ar: 'إنشاء' })}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Consistency Issues */}
                {analysisResult.consistency_issues?.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                      <X className="h-4 w-4 text-red-500" />
                      {t({ en: 'Consistency Issues', ar: 'مشاكل الاتساق' })} ({analysisResult.consistency_issues.length})
                    </h3>
                    <div className="space-y-1.5">
                      {analysisResult.consistency_issues.map((issue, i) => (
                        <div key={i} className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="font-medium text-xs">{issue.issue}</p>
                          {issue.affected_templates?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {issue.affected_templates.slice(0, 5).map((templateKey, j) => (
                                <Badge 
                                  key={j} 
                                  variant="outline" 
                                  className="text-[10px] font-mono cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 hover:border-red-400 transition-colors"
                                  onClick={() => handleSelectTemplateByKey(templateKey)}
                                >
                                  {templateKey}
                                  <Eye className="h-2.5 w-2.5 ml-0.5" />
                                </Badge>
                              ))}
                              {issue.affected_templates.length > 5 && (
                                <Badge variant="outline" className="text-[10px]">+{issue.affected_templates.length - 5}</Badge>
                              )}
                            </div>
                          )}
                          {issue.fix && (
                            <p className="text-[10px] text-green-700 dark:text-green-400 mt-1">✓ {issue.fix}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Analysis */}
                {analysisResult.category_analysis?.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      {t({ en: 'Category Analysis', ar: 'تحليل الفئات' })}
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {analysisResult.category_analysis.map((cat, i) => (
                        <div 
                          key={i} 
                          className="p-2 border rounded-lg cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors"
                          onClick={() => handleFilterByCategory(cat.category)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-xs">{cat.category}</span>
                            <Badge variant={cat.status === 'good' ? 'default' : cat.status === 'low' ? 'warning' : 'secondary'} className="text-[10px] h-4">
                              {cat.status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{cat.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {analysisResult.recommendations?.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      {t({ en: 'Recommendations', ar: 'التوصيات' })} ({analysisResult.recommendations.length})
                    </h3>
                    <div className="space-y-1.5">
                      {analysisResult.recommendations.map((rec, i) => (
                        <div key={i} className="p-2 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-xs">{rec.title}</p>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'warning' : 'secondary'} className="text-[10px] h-5">
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Templates */}
                {analysisResult.suggested_templates?.length > 0 && (
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm">
                      <Plus className="h-4 w-4 text-green-500" />
                      {t({ en: 'Suggested Templates', ar: 'قوالب مقترحة' })} ({analysisResult.suggested_templates.length})
                    </h3>
                    <div className="space-y-1.5">
                      {analysisResult.suggested_templates.map((tmpl, i) => (
                        <div 
                          key={i} 
                          className="p-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start justify-between gap-2 hover:border-green-400 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs truncate">{tmpl.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{tmpl.template_key}</p>
                          </div>
                          <Button 
                            size="sm" 
                            className="h-6 text-[10px] px-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleCreateSuggestedTemplate(tmpl)}
                          >
                            <Plus className="h-3 w-3 mr-0.5" />
                            {t({ en: 'Create', ar: 'إنشاء' })}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">{t({ en: 'Analysis will appear here', ar: 'سيظهر التحليل هنا' })}</p>
              </div>
            )}
          </ScrollArea>
          
          <SheetFooter className="border-t flex-row gap-2 p-4">
            <Button variant="outline" onClick={() => setShowAnalysisDialog(false)} className="flex-1">
              {t({ en: 'Close', ar: 'إغلاق' })}
            </Button>
            {analysisResult && (
              <Button onClick={handleAIAnalysis} disabled={aiLoading} variant="outline" className="flex-1">
                <RefreshCw className={`h-4 w-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                {t({ en: 'Re-analyze', ar: 'إعادة التحليل' })}
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PageLayout>
  );
}

export default ProtectedPage(EmailTemplateEditor, { requireAdmin: true });