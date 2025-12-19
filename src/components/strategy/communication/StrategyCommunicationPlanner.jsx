import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useCommunicationPlans } from '@/hooks/strategy/useCommunicationPlans';
import { useCommunicationAI } from '@/hooks/strategy/useCommunicationAI';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Megaphone, Users, MessageSquare, Calendar, Sparkles, 
  Plus, Save, Target, Radio, Mail, Globe, Loader2, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const AUDIENCE_TYPES = [
  { id: 'citizens', label_en: 'Citizens', label_ar: 'المواطنون', icon: '👥' },
  { id: 'municipalities', label_en: 'Municipalities', label_ar: 'البلديات', icon: '🏛️' },
  { id: 'partners', label_en: 'Partners & Providers', label_ar: 'الشركاء والموردون', icon: '🤝' },
  { id: 'leadership', label_en: 'Executive Leadership', label_ar: 'القيادة التنفيذية', icon: '👔' },
  { id: 'media', label_en: 'Media & Press', label_ar: 'الإعلام والصحافة', icon: '📰' },
  { id: 'academia', label_en: 'Academia & Research', label_ar: 'الأكاديميا والبحث', icon: '🎓' }
];

const CHANNELS = [
  { id: 'portal', label_en: 'Public Portal', label_ar: 'البوابة العامة', icon: <Globe className="h-4 w-4" /> },
  { id: 'email', label_en: 'Email Newsletter', label_ar: 'النشرة الإخبارية', icon: <Mail className="h-4 w-4" /> },
  { id: 'social', label_en: 'Social Media', label_ar: 'وسائل التواصل', icon: <Radio className="h-4 w-4" /> },
  { id: 'press', label_en: 'Press Releases', label_ar: 'البيانات الصحفية', icon: <Megaphone className="h-4 w-4" /> },
  { id: 'events', label_en: 'Town Halls & Events', label_ar: 'اللقاءات والفعاليات', icon: <Users className="h-4 w-4" /> }
];

export default function StrategyCommunicationPlanner({ strategicPlanId }) {
  const { t, language } = useLanguage();
  const { plans, createPlan, isCreating } = useCommunicationPlans(strategicPlanId);
  const { generateKeyMessages, suggestChannelStrategy, generateContentCalendar, isLoading: isAILoading } = useCommunicationAI();
  
  const [activeTab, setActiveTab] = useState('audiences');
  const [planData, setPlanData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    target_audiences: [],
    key_messages: [],
    channel_strategy: [],
    content_calendar: [],
    master_narrative_en: '',
    master_narrative_ar: ''
  });

  // Fetch real stakeholder data for audience counts
  const { data: stakeholderCounts = {} } = useQuery({
    queryKey: ['stakeholder-counts', strategicPlanId],
    queryFn: async () => {
      const [citizensRes, municipalitiesRes, partnersRes, usersRes] = await Promise.all([
        supabase.from('citizen_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('municipalities').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true })
      ]);
      
      return {
        citizens: citizensRes.count || 0,
        municipalities: municipalitiesRes.count || 0,
        partners: partnersRes.count || 0,
        leadership: usersRes.count || 0
      };
    }
  });

  // Fetch existing communication plans
  const { data: existingPlans = [] } = useQuery({
    queryKey: ['existing-comm-plans', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('communication_plans')
        .select('id, name_en, name_ar, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (strategicPlanId) {
        query = query.eq('strategic_plan_id', strategicPlanId);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    }
  });

  // Fetch related events for content calendar integration
  const { data: relatedEvents = [] } = useQuery({
    queryKey: ['related-events-comm', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('id, title_en, title_ar, start_date, event_type')
        .gte('start_date', new Date().toISOString())
        .eq('is_deleted', false)
        .order('start_date', { ascending: true })
        .limit(10);
      
      if (strategicPlanId) {
        query = query.contains('strategic_plan_ids', [strategicPlanId]);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    }
  });

  // Fetch case studies for content library
  const { data: caseStudies = [] } = useQuery({
    queryKey: ['case-studies-comm', strategicPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('id, title_en, title_ar, is_featured, is_published')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return data || [];
    }
  });

  const handleAudienceToggle = (audienceId) => {
    setPlanData(prev => ({
      ...prev,
      target_audiences: prev.target_audiences.includes(audienceId)
        ? prev.target_audiences.filter(a => a !== audienceId)
        : [...prev.target_audiences, audienceId]
    }));
  };

  const handleChannelToggle = (channelId) => {
    const existing = planData.channel_strategy.find(c => c.channel === channelId);
    if (existing) {
      setPlanData(prev => ({
        ...prev,
        channel_strategy: prev.channel_strategy.filter(c => c.channel !== channelId)
      }));
    } else {
      setPlanData(prev => ({
        ...prev,
        channel_strategy: [...prev.channel_strategy, { channel: channelId, frequency: 'weekly', priority: 'primary' }]
      }));
    }
  };

  const handleGenerateMessages = async () => {
    try {
      const result = await generateKeyMessages(
        { name: planData.name_en, description: planData.description_en },
        planData.target_audiences
      );
      setPlanData(prev => ({
        ...prev,
        master_narrative_en: result.master_narrative_en || prev.master_narrative_en,
        master_narrative_ar: result.master_narrative_ar || prev.master_narrative_ar,
        key_messages: result.key_themes || prev.key_messages
      }));
      toast.success(t({ en: 'Key messages generated', ar: 'تم إنشاء الرسائل الرئيسية' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate messages', ar: 'فشل في إنشاء الرسائل' }));
    }
  };

  const handleSuggestChannels = async () => {
    try {
      const audiences = planData.target_audiences.map(id => 
        AUDIENCE_TYPES.find(a => a.id === id)?.label_en
      );
      const result = await suggestChannelStrategy(audiences, [planData.description_en]);
      if (result.recommended_channels) {
        setPlanData(prev => ({
          ...prev,
          channel_strategy: result.recommended_channels.map(ch => ({
            channel: ch.channel,
            frequency: ch.frequency || 'weekly',
            priority: ch.priority || 'primary',
            best_practices: ch.best_practices
          }))
        }));
      }
      toast.success(t({ en: 'Channel strategy suggested', ar: 'تم اقتراح استراتيجية القنوات' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to suggest channels', ar: 'فشل في اقتراح القنوات' }));
    }
  };

  const handleGenerateCalendar = async () => {
    try {
      const result = await generateContentCalendar(planData, '3 months');
      if (result.calendar_items) {
        setPlanData(prev => ({
          ...prev,
          content_calendar: result.calendar_items
        }));
      }
      toast.success(t({ en: 'Content calendar generated', ar: 'تم إنشاء تقويم المحتوى' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to generate calendar', ar: 'فشل في إنشاء التقويم' }));
    }
  };

  const handleSavePlan = async () => {
    try {
      await createPlan({
        ...planData,
        strategic_plan_id: strategicPlanId,
        status: 'draft'
      });
      toast.success(t({ en: 'Communication plan saved', ar: 'تم حفظ خطة التواصل' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to save plan', ar: 'فشل في حفظ الخطة' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          {t({ en: 'Communication Strategy Planner', ar: 'مخطط استراتيجية التواصل' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Design comprehensive communication plans for your strategy', ar: 'تصميم خطط تواصل شاملة لاستراتيجيتك' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Plan Basics */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t({ en: 'Plan Name (English)', ar: 'اسم الخطة (إنجليزي)' })}</label>
              <Input
                value={planData.name_en}
                onChange={(e) => setPlanData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="Q1 2024 Communication Campaign"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t({ en: 'Plan Name (Arabic)', ar: 'اسم الخطة (عربي)' })}</label>
              <Input
                value={planData.name_ar}
                onChange={(e) => setPlanData(prev => ({ ...prev, name_ar: e.target.value }))}
                placeholder="حملة التواصل للربع الأول 2024"
                dir="rtl"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="audiences">
                <Users className="h-4 w-4 mr-2" />
                {t({ en: 'Audiences', ar: 'الجمهور' })}
              </TabsTrigger>
              <TabsTrigger value="messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                {t({ en: 'Messages', ar: 'الرسائل' })}
              </TabsTrigger>
              <TabsTrigger value="channels">
                <Radio className="h-4 w-4 mr-2" />
                {t({ en: 'Channels', ar: 'القنوات' })}
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                {t({ en: 'Calendar', ar: 'التقويم' })}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audiences" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Select your target audiences for this communication plan', ar: 'اختر الجمهور المستهدف لخطة التواصل' })}
              </p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {AUDIENCE_TYPES.map(audience => (
                  <Card 
                    key={audience.id}
                    className={`cursor-pointer transition-all ${
                      planData.target_audiences.includes(audience.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleAudienceToggle(audience.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <span className="text-2xl">{audience.icon}</span>
                      <span className="font-medium">
                        {language === 'ar' ? audience.label_ar : audience.label_en}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Define key messages and master narrative', ar: 'تحديد الرسائل الرئيسية والسرد الأساسي' })}
                </p>
                <Button onClick={handleGenerateMessages} disabled={isAILoading} variant="outline" size="sm">
                  {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {t({ en: 'AI Generate', ar: 'توليد ذكي' })}
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t({ en: 'Master Narrative (English)', ar: 'السرد الأساسي (إنجليزي)' })}</label>
                  <Textarea
                    value={planData.master_narrative_en}
                    onChange={(e) => setPlanData(prev => ({ ...prev, master_narrative_en: e.target.value }))}
                    placeholder="The overarching story that connects all communications..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t({ en: 'Master Narrative (Arabic)', ar: 'السرد الأساسي (عربي)' })}</label>
                  <Textarea
                    value={planData.master_narrative_ar}
                    onChange={(e) => setPlanData(prev => ({ ...prev, master_narrative_ar: e.target.value }))}
                    placeholder="القصة الشاملة التي تربط جميع الاتصالات..."
                    rows={3}
                    dir="rtl"
                  />
                </div>

                {planData.key_messages.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t({ en: 'Key Themes', ar: 'المحاور الرئيسية' })}</label>
                    <div className="grid gap-2">
                      {planData.key_messages.map((msg, idx) => (
                        <Card key={idx} className="p-3">
                          <p className="font-medium">{msg.theme_en || msg.theme}</p>
                          <p className="text-sm text-muted-foreground">{msg.description_en || msg.description}</p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Select communication channels and define strategy', ar: 'اختر قنوات التواصل وحدد الاستراتيجية' })}
                </p>
                <Button onClick={handleSuggestChannels} disabled={isAILoading} variant="outline" size="sm">
                  {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {CHANNELS.map(channel => {
                  const isSelected = planData.channel_strategy.some(c => c.channel === channel.id);
                  return (
                    <Card 
                      key={channel.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleChannelToggle(channel.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {channel.icon}
                          <span className="font-medium">
                            {language === 'ar' ? channel.label_ar : channel.label_en}
                          </span>
                        </div>
                        {isSelected && <Badge>Selected</Badge>}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {t({ en: 'Plan your content calendar', ar: 'خطط تقويم المحتوى' })}
                </p>
                <Button onClick={handleGenerateCalendar} disabled={isAILoading} variant="outline" size="sm">
                  {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {t({ en: 'AI Generate', ar: 'توليد ذكي' })}
                </Button>
              </div>

              {planData.content_calendar.length > 0 ? (
                <div className="space-y-2">
                  {planData.content_calendar.slice(0, 10).map((item, idx) => (
                    <Card key={idx} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.title_en || item.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.content_type} • {item.channel}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{item.date || `Week ${item.week}`}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">{item.target_audience}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t({ en: 'No calendar items yet. Generate with AI or add manually.', ar: 'لا توجد عناصر في التقويم. قم بالتوليد أو الإضافة يدوياً.' })}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline">
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSavePlan} disabled={isCreating || !planData.name_en}>
              {isCreating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              {t({ en: 'Save Communication Plan', ar: 'حفظ خطة التواصل' })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
