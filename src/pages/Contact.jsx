import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function Contact() {
  const { language, isRTL, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: ''
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // Send contact form email via trigger hub
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'CONTACT_FORM',
          recipientEmail: 'platform@saudimih.sa',
          variables: {
            senderName: data.name,
            senderEmail: data.email,
            senderOrganization: data.organization,
            subject: data.subject,
            message: data.message
          }
        }
      });

      // Send confirmation to user
      await supabase.functions.invoke('email-trigger-hub', {
        body: {
          trigger: 'CONTACT_FORM_CONFIRMATION',
          recipientEmail: data.email,
          variables: {
            userName: data.name,
            subject: data.subject
          }
        }
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success(t({ en: 'Message sent successfully', ar: 'تم إرسال الرسالة بنجاح' }));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">
            {t({ en: 'Contact Us', ar: 'اتصل بنا' })}
          </h1>
          <p className="text-xl opacity-90">
            {t({ en: 'Get in touch with our team', ar: 'تواصل مع فريقنا' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t({ en: 'Get in Touch', ar: 'تواصل معنا' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Email', ar: 'البريد الإلكتروني' })}
                  </p>
                  <p className="text-sm text-slate-600">info@saudimih.sa</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Phone', ar: 'الهاتف' })}
                  </p>
                  <p className="text-sm text-slate-600">+966 11 XXX XXXX</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-slate-900">
                    {t({ en: 'Address', ar: 'العنوان' })}
                  </p>
                  <p className="text-sm text-slate-600">
                    {t({ 
                      en: 'Ministry of Municipal and Rural Affairs\nRiyadh, Saudi Arabia', 
                      ar: 'وزارة الشؤون البلدية والقروية والإسكان\nالرياض، المملكة العربية السعودية' 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                {t({ en: 'Business Hours', ar: 'ساعات العمل' })}
              </h3>
              <p className="text-sm text-slate-700">
                {t({ 
                  en: 'Sunday - Thursday: 8:00 AM - 4:00 PM', 
                  ar: 'الأحد - الخميس: 8:00 ص - 4:00 م' 
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t({ en: 'Send us a message', ar: 'أرسل لنا رسالة' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {t({ en: 'Message Sent!', ar: 'تم إرسال الرسالة!' })}
                </h3>
                <p className="text-slate-600 mb-6">
                  {t({ 
                    en: 'Thank you for contacting us. We will get back to you within 2 business days.', 
                    ar: 'شكراً لتواصلك معنا. سنرد عليك خلال يومي عمل.' 
                  })}
                </p>
                <Button onClick={() => setSubmitted(false)}>
                  {t({ en: 'Send Another Message', ar: 'إرسال رسالة أخرى' })}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Full Name *', ar: 'الاسم الكامل *' })}
                    </label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t({ en: 'Your name', ar: 'اسمك' })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Email *', ar: 'البريد الإلكتروني *' })}
                    </label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Organization', ar: 'المنظمة' })}
                  </label>
                  <Input
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder={t({ en: 'Your organization', ar: 'منظمتك' })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Subject *', ar: 'الموضوع *' })}
                  </label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t({ en: 'What is this about?', ar: 'ما هو موضوع رسالتك؟' })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t({ en: 'Message *', ar: 'الرسالة *' })}
                  </label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    placeholder={t({ en: 'Tell us more...', ar: 'أخبرنا المزيد...' })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t({ en: 'Sending...', ar: 'جاري الإرسال...' })}
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {t({ en: 'Send Message', ar: 'إرسال الرسالة' })}
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(Contact, { requiredPermissions: [] });