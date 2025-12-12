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
import { Mail, Eye, Save, Sparkles, Loader2, Send, Plus, Trash2, Copy, Settings, RefreshCw, Check, X, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
    const result = await invokeAI({
      prompt: `Generate a professional bilingual email template for: ${template.name_en || template.template_key}
        
For a Saudi municipal innovation platform. Include:
- Professional yet warm tone
- Clear call-to-action
- Both English and Arabic versions (formal Arabic فصحى)
- Use HTML formatting with <p>, <strong>, <ul>, <li> tags
- Include appropriate variables like {{userName}}, {{entityTitle}}, {{actionUrl}}`,
      response_json_schema: {
        type: 'object',
        properties: {
          subject_en: { type: 'string' },
          subject_ar: { type: 'string' },
          body_en: { type: 'string' },
          body_ar: { type: 'string' },
          header_title_en: { type: 'string' },
          header_title_ar: { type: 'string' },
          cta_text_en: { type: 'string' },
          cta_text_ar: { type: 'string' },
          suggested_variables: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    if (result.success) {
      setTemplate(prev => ({
        ...prev,
        subject_en: result.data.subject_en || prev.subject_en,
        subject_ar: result.data.subject_ar || prev.subject_ar,
        body_en: result.data.body_en || prev.body_en,
        body_ar: result.data.body_ar || prev.body_ar,
        header_title_en: result.data.header_title_en || prev.header_title_en,
        header_title_ar: result.data.header_title_ar || prev.header_title_ar,
        cta_text_en: result.data.cta_text_en || prev.cta_text_en,
        cta_text_ar: result.data.cta_text_ar || prev.cta_text_ar,
      }));
      toast.success(t({ en: 'AI template generated', ar: 'تم توليد القالب الذكي' }));
    }
  };

  const handleSendTest = async () => {
    const recipientEmail = testEmail || currentUser?.email;
    if (!recipientEmail) {
      toast.error(t({ en: 'Please enter an email address', ar: 'يرجى إدخال عنوان البريد الإلكتروني' }));
      return;
    }

    setIsSending(true);
    try {
      // Build test variables
      const testVariables = {
        userName: currentUser?.user_metadata?.full_name || 'Test User',
        sentAt: new Date().toLocaleString(),
        loginUrl: window.location.origin,
        dashboardUrl: window.location.origin,
        detailUrl: window.location.origin,
        trackingUrl: window.location.origin,
        taskUrl: window.location.origin,
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
        toast.error(data.error || data.message || 'Failed to send email');
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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-10 w-10" />
            <h1 className="text-4xl font-bold">
              {t({ en: 'Email Template Manager', ar: 'مدير قوالب البريد' })}
            </h1>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">
            {t({ en: 'Create, customize, and test bilingual email templates for all platform communications', ar: 'إنشاء وتخصيص واختبار قوالب البريد ثنائية اللغة لجميع اتصالات المنصة' })}
          </p>
        </div>
      </div>

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
    </div>
  );
}

export default ProtectedPage(EmailTemplateEditor, { requireAdmin: true });