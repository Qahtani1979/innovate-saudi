import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Sparkles, Wand2, 
  Languages, Loader2, Copy, Check, RefreshCw,
  Lightbulb, PenTool, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import {
  CAMPAIGN_CONTENT_SYSTEM_PROMPT,
  CAMPAIGN_TRANSLATION_SYSTEM_PROMPT,
  CAMPAIGN_IMPROVEMENT_SYSTEM_PROMPT,
  CAMPAIGN_SUBJECT_SYSTEM_PROMPT,
  buildCampaignContentPrompt,
  buildCampaignTranslationPrompt,
  buildCampaignImprovementPrompt,
  buildSubjectLinesPrompt
} from '@/lib/ai/prompts/communications/campaignHelpers';

const TONES = [
  { value: 'professional', label: { en: 'Professional', ar: 'احترافي' }, icon: '💼' },
  { value: 'friendly', label: { en: 'Friendly', ar: 'ودي' }, icon: '😊' },
  { value: 'urgent', label: { en: 'Urgent', ar: 'عاجل' }, icon: '⚡' },
  { value: 'celebratory', label: { en: 'Celebratory', ar: 'احتفالي' }, icon: '🎉' },
  { value: 'informative', label: { en: 'Informative', ar: 'إعلامي' }, icon: '📢' },
];

const CAMPAIGN_TYPES = [
  { value: 'newsletter', label: { en: 'Newsletter', ar: 'نشرة إخبارية' } },
  { value: 'announcement', label: { en: 'Announcement', ar: 'إعلان' } },
  { value: 'promotion', label: { en: 'Promotion', ar: 'ترويج' } },
  { value: 'event', label: { en: 'Event Invite', ar: 'دعوة حدث' } },
  { value: 'survey', label: { en: 'Survey Request', ar: 'طلب استبيان' } },
  { value: 'follow_up', label: { en: 'Follow-up', ar: 'متابعة' } },
  { value: 'reengagement', label: { en: 'Re-engagement', ar: 'إعادة تفاعل' } },
];

export default function CampaignAIHelpers({ onUseSubject, onUseBody, campaignContext }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  
  // Generate content state
  const [campaignType, setCampaignType] = useState('announcement');
  const [tone, setTone] = useState('professional');
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  
  // Translate state
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState(language === 'en' ? 'ar' : 'en');
  
  // Improve state
  const [textToImprove, setTextToImprove] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [improvementType, setImprovementType] = useState('clarity');
  
  // Subject lines state
  const [subjectContext, setSubjectContext] = useState('');
  const [generatedSubjects, setGeneratedSubjects] = useState([]);

  const { invokeAI } = useAIWithFallback();

  const handleGenerateContent = async () => {
    if (!topic.trim()) {
      toast.error(t({ en: 'Please enter a topic', ar: 'يرجى إدخال موضوع' }));
      return;
    }
    
    setIsLoading(true);
    try {
      const prompt = buildCampaignContentPrompt({ campaignType, tone, topic, keyPoints });
      
      const result = await invokeAI({
        prompt,
        system_prompt: CAMPAIGN_CONTENT_SYSTEM_PROMPT
      });

      if (result.success) {
        const jsonMatch = JSON.stringify(result.data).match(/\{[\s\S]*\}/);
        if (result.data?.subject_en) {
          setGeneratedSubject(language === 'ar' ? result.data.subject_ar : result.data.subject_en);
          setGeneratedBody(language === 'ar' ? result.data.body_ar : result.data.body_en);
        } else if (typeof result.data === 'string') {
          const parsed = JSON.parse(result.data.match(/\{[\s\S]*\}/)?.[0] || '{}');
          setGeneratedSubject(language === 'ar' ? parsed.subject_ar : parsed.subject_en);
          setGeneratedBody(language === 'ar' ? parsed.body_ar : parsed.body_en);
        }
      }
      
      toast.success(t({ en: 'Content generated!', ar: 'تم إنشاء المحتوى!' }));
    } catch (err) {
      console.error('Generation error:', err);
      toast.error(t({ en: 'Failed to generate content', ar: 'فشل في إنشاء المحتوى' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) {
      toast.error(t({ en: 'Please enter text to translate', ar: 'يرجى إدخال نص للترجمة' }));
      return;
    }
    
    setIsLoading(true);
    try {
      const prompt = buildCampaignTranslationPrompt({ text: textToTranslate, targetLanguage: targetLang === 'ar' ? 'Arabic' : 'English' });
      
      const result = await invokeAI({
        prompt,
        system_prompt: CAMPAIGN_TRANSLATION_SYSTEM_PROMPT
      });

      if (result.success) {
        setTranslatedText(typeof result.data === 'string' ? result.data.trim() : JSON.stringify(result.data));
      }
      
      toast.success(t({ en: 'Translation complete!', ar: 'اكتملت الترجمة!' }));
    } catch (err) {
      console.error('Translation error:', err);
      toast.error(t({ en: 'Translation failed', ar: 'فشلت الترجمة' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!textToImprove.trim()) {
      toast.error(t({ en: 'Please enter text to improve', ar: 'يرجى إدخال نص للتحسين' }));
      return;
    }
    
    setIsLoading(true);
    try {
      const prompt = buildCampaignImprovementPrompt({ text: textToImprove, improvementType });
      
      const result = await invokeAI({
        prompt,
        system_prompt: CAMPAIGN_IMPROVEMENT_SYSTEM_PROMPT
      });

      if (result.success) {
        setImprovedText(typeof result.data === 'string' ? result.data.trim() : JSON.stringify(result.data));
      }
      
      toast.success(t({ en: 'Text improved!', ar: 'تم تحسين النص!' }));
    } catch (err) {
      console.error('Improvement error:', err);
      toast.error(t({ en: 'Failed to improve text', ar: 'فشل تحسين النص' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSubjectLines = async () => {
    if (!subjectContext.trim()) {
      toast.error(t({ en: 'Please describe your email content', ar: 'يرجى وصف محتوى بريدك' }));
      return;
    }
    
    setIsLoading(true);
    try {
      const prompt = buildSubjectLinesPrompt({ context: subjectContext, language });
      
      const result = await invokeAI({
        prompt,
        system_prompt: CAMPAIGN_SUBJECT_SYSTEM_PROMPT
      });

      if (result.success) {
        if (Array.isArray(result.data)) {
          setGeneratedSubjects(result.data);
        } else if (typeof result.data === 'string') {
          const jsonMatch = result.data.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            setGeneratedSubjects(JSON.parse(jsonMatch[0]));
          }
        }
      }
      
      toast.success(t({ en: 'Subject lines generated!', ar: 'تم إنشاء عناوين البريد!' }));
    } catch (err) {
      console.error('Subject generation error:', err);
      toast.error(t({ en: 'Failed to generate subjects', ar: 'فشل إنشاء العناوين' }));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success(t({ en: 'Copied!', ar: 'تم النسخ!' }));
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          {t({ en: 'AI Campaign Helpers', ar: 'مساعدات الحملة بالذكاء الاصطناعي' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-4">
            <TabsTrigger value="generate" className="gap-1 text-xs">
              <Wand2 className="h-3 w-3" />
              {t({ en: 'Generate', ar: 'إنشاء' })}
            </TabsTrigger>
            <TabsTrigger value="subjects" className="gap-1 text-xs">
              <Lightbulb className="h-3 w-3" />
              {t({ en: 'Subjects', ar: 'عناوين' })}
            </TabsTrigger>
            <TabsTrigger value="translate" className="gap-1 text-xs">
              <Languages className="h-3 w-3" />
              {t({ en: 'Translate', ar: 'ترجمة' })}
            </TabsTrigger>
            <TabsTrigger value="improve" className="gap-1 text-xs">
              <PenTool className="h-3 w-3" />
              {t({ en: 'Improve', ar: 'تحسين' })}
            </TabsTrigger>
          </TabsList>

          {/* Generate Content Tab */}
          <TabsContent value="generate" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">{t({ en: 'Campaign Type', ar: 'نوع الحملة' })}</label>
                <Select value={campaignType} onValueChange={setCampaignType}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(type.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">{t({ en: 'Tone', ar: 'النبرة' })}</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TONES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label[language]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-xs font-medium">{t({ en: 'Topic / Main Message', ar: 'الموضوع / الرسالة الرئيسية' })}</label>
              <Input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={t({ en: 'e.g., New innovation program launch...', ar: 'مثال: إطلاق برنامج ابتكار جديد...' })}
                className="h-9"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium">{t({ en: 'Key Points (optional)', ar: 'النقاط الرئيسية (اختياري)' })}</label>
              <Textarea
                value={keyPoints}
                onChange={e => setKeyPoints(e.target.value)}
                placeholder={t({ en: 'List key points to include...', ar: 'اذكر النقاط الرئيسية...' })}
                rows={2}
                className="text-sm"
              />
            </div>
            
            <Button 
              onClick={handleGenerateContent} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {t({ en: 'Generate Email Content', ar: 'إنشاء محتوى البريد' })}
            </Button>
            
            {generatedSubject && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{t({ en: 'Subject', ar: 'العنوان' })}</span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(generatedSubject, 'subject')}
                    >
                      {copied === 'subject' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    {onUseSubject && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => onUseSubject(generatedSubject)}
                      >
                        {t({ en: 'Use', ar: 'استخدم' })}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm">{generatedSubject}</p>
              </div>
            )}
            
            {generatedBody && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{t({ en: 'Body', ar: 'المحتوى' })}</span>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 px-2"
                      onClick={() => copyToClipboard(generatedBody, 'body')}
                    >
                      {copied === 'body' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                    {onUseBody && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-6 px-2 text-xs"
                        onClick={() => onUseBody(generatedBody)}
                      >
                        {t({ en: 'Use', ar: 'استخدم' })}
                      </Button>
                    )}
                  </div>
                </div>
                <div 
                  className="text-sm max-h-40 overflow-y-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: generatedBody }}
                />
              </div>
            )}
          </TabsContent>

          {/* Subject Lines Tab */}
          <TabsContent value="subjects" className="space-y-3">
            <div>
              <label className="text-xs font-medium">{t({ en: 'Describe your email content', ar: 'صف محتوى بريدك' })}</label>
              <Textarea
                value={subjectContext}
                onChange={e => setSubjectContext(e.target.value)}
                placeholder={t({ en: 'e.g., Announcing new challenge program with SAR 500K funding for smart city solutions...', ar: 'مثال: الإعلان عن برنامج تحدي جديد بتمويل 500 ألف ريال لحلول المدن الذكية...' })}
                rows={3}
                className="text-sm"
              />
            </div>
            
            <Button 
              onClick={handleGenerateSubjectLines} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb className="h-4 w-4" />}
              {t({ en: 'Generate Subject Lines', ar: 'إنشاء عناوين البريد' })}
            </Button>
            
            {generatedSubjects.length > 0 && (
              <div className="space-y-2">
                {generatedSubjects.map((subject, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <span className="text-sm flex-1">{subject}</span>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2"
                        onClick={() => copyToClipboard(subject, `subj-${idx}`)}
                      >
                        {copied === `subj-${idx}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                      {onUseSubject && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => onUseSubject(subject)}
                        >
                          {t({ en: 'Use', ar: 'استخدم' })}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Translate Tab */}
          <TabsContent value="translate" className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {targetLang === 'ar' ? 'EN → AR' : 'AR → EN'}
              </Badge>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setTargetLang(targetLang === 'ar' ? 'en' : 'ar')}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
            
            <Textarea
              value={textToTranslate}
              onChange={e => setTextToTranslate(e.target.value)}
              placeholder={t({ en: 'Enter text to translate...', ar: 'أدخل النص للترجمة...' })}
              rows={4}
              className="text-sm"
            />
            
            <Button 
              onClick={handleTranslate} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              {t({ en: 'Translate', ar: 'ترجمة' })}
            </Button>
            
            {translatedText && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{t({ en: 'Translation', ar: 'الترجمة' })}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(translatedText, 'translation')}
                  >
                    {copied === 'translation' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                  {translatedText}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Improve Tab */}
          <TabsContent value="improve" className="space-y-3">
            <div>
              <label className="text-xs font-medium">{t({ en: 'Improvement Type', ar: 'نوع التحسين' })}</label>
              <Select value={improvementType} onValueChange={setImprovementType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clarity">{t({ en: 'Clarity', ar: 'الوضوح' })}</SelectItem>
                  <SelectItem value="concise">{t({ en: 'More Concise', ar: 'أكثر إيجازاً' })}</SelectItem>
                  <SelectItem value="engaging">{t({ en: 'More Engaging', ar: 'أكثر جاذبية' })}</SelectItem>
                  <SelectItem value="formal">{t({ en: 'More Formal', ar: 'أكثر رسمية' })}</SelectItem>
                  <SelectItem value="friendly">{t({ en: 'More Friendly', ar: 'أكثر ودية' })}</SelectItem>
                  <SelectItem value="persuasive">{t({ en: 'More Persuasive', ar: 'أكثر إقناعاً' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Textarea
              value={textToImprove}
              onChange={e => setTextToImprove(e.target.value)}
              placeholder={t({ en: 'Paste your email text to improve...', ar: 'الصق نص بريدك لتحسينه...' })}
              rows={4}
              className="text-sm"
            />
            
            <Button 
              onClick={handleImprove} 
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {t({ en: 'Improve Text', ar: 'تحسين النص' })}
            </Button>
            
            {improvedText && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{t({ en: 'Improved Text', ar: 'النص المحسّن' })}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(improvedText, 'improved')}
                  >
                    {copied === 'improved' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div 
                  className="text-sm max-h-40 overflow-y-auto prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: improvedText }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
