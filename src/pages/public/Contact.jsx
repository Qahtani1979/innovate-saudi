import { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function Contact() {
  const { language, isRTL, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    type: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(t({ 
      en: 'Message sent successfully! We will get back to you soon.', 
      ar: 'تم إرسال الرسالة بنجاح! سنعود إليك قريباً.' 
    }));
    
    setFormData({
      name: '',
      email: '',
      organization: '',
      type: '',
      subject: '',
      message: ''
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: t({ en: 'Email', ar: 'البريد الإلكتروني' }),
      value: 'info@innovation-platform.sa',
      description: t({ en: 'Send us an email anytime', ar: 'أرسل لنا بريداً إلكترونياً في أي وقت' })
    },
    {
      icon: Phone,
      title: t({ en: 'Phone', ar: 'الهاتف' }),
      value: '+966 11 XXX XXXX',
      description: t({ en: 'Sun-Thu 8AM-4PM', ar: 'الأحد-الخميس 8ص-4م' })
    },
    {
      icon: MapPin,
      title: t({ en: 'Address', ar: 'العنوان' }),
      value: t({ en: 'Riyadh, Saudi Arabia', ar: 'الرياض، المملكة العربية السعودية' }),
      description: t({ en: 'Visit our headquarters', ar: 'زيارة المقر الرئيسي' })
    }
  ];

  const inquiryTypes = [
    { value: 'municipality', label: t({ en: 'Municipality Inquiry', ar: 'استفسار بلدية' }) },
    { value: 'provider', label: t({ en: 'Solution Provider Inquiry', ar: 'استفسار مزود حلول' }) },
    { value: 'partnership', label: t({ en: 'Partnership Opportunity', ar: 'فرصة شراكة' }) },
    { value: 'media', label: t({ en: 'Media & Press', ar: 'الإعلام والصحافة' }) },
    { value: 'support', label: t({ en: 'Technical Support', ar: 'الدعم الفني' }) },
    { value: 'other', label: t({ en: 'Other', ar: 'أخرى' }) }
  ];

  return (
    <>
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {t({ en: 'Contact Us', ar: 'تواصل معنا' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t({ 
              en: 'Have questions or want to learn more? We would love to hear from you.', 
              ar: 'لديك أسئلة أو تريد معرفة المزيد؟ نحب أن نسمع منك.' 
            })}
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-12 px-4 -mt-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                  <p className="text-primary font-medium mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {t({ en: 'Send Us a Message', ar: 'أرسل لنا رسالة' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t({ en: 'Full Name', ar: 'الاسم الكامل' })} *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t({ en: 'Your name', ar: 'اسمك' })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t({ en: 'Email', ar: 'البريد الإلكتروني' })} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t({ en: 'you@example.com', ar: 'you@example.com' })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="organization">{t({ en: 'Organization', ar: 'المنظمة' })}</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder={t({ en: 'Your organization name', ar: 'اسم منظمتك' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">{t({ en: 'Inquiry Type', ar: 'نوع الاستفسار' })} *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select type', ar: 'اختر النوع' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">{t({ en: 'Subject', ar: 'الموضوع' })} *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t({ en: 'Brief subject of your inquiry', ar: 'موضوع استفسارك باختصار' })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">{t({ en: 'Message', ar: 'الرسالة' })} *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={t({ en: 'Tell us more about your inquiry...', ar: 'أخبرنا المزيد عن استفسارك...' })}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className="w-full gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>{t({ en: 'Sending...', ar: 'جاري الإرسال...' })}</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t({ en: 'Send Message', ar: 'إرسال الرسالة' })}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {t({ en: 'Looking for Quick Answers?', ar: 'تبحث عن إجابات سريعة؟' })}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t({ 
              en: 'Check our frequently asked questions for common inquiries.', 
              ar: 'تحقق من الأسئلة الشائعة للاستفسارات المتكررة.' 
            })}
          </p>
          <Button variant="outline" size="lg" asChild>
            <a href="/faq">{t({ en: 'View FAQ', ar: 'عرض الأسئلة الشائعة' })}</a>
          </Button>
        </div>
      </section>
    </>
  );
}
