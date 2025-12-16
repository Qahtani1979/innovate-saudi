import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Megaphone, Plus, X, Users, Radio, Mail, Globe, BookOpen, ChevronUp, ChevronDown, Link2 } from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';

const AUDIENCE_TYPES = [
  { id: 'citizens', label: { en: 'Citizens', ar: 'المواطنون' }, icon: '👥' },
  { id: 'municipalities', label: { en: 'Municipalities', ar: 'البلديات' }, icon: '🏛️' },
  { id: 'partners', label: { en: 'Partners & Providers', ar: 'الشركاء والموردون' }, icon: '🤝' },
  { id: 'leadership', label: { en: 'Executive Leadership', ar: 'القيادة التنفيذية' }, icon: '👔' },
  { id: 'media', label: { en: 'Media & Press', ar: 'الإعلام والصحافة' }, icon: '📰' },
  { id: 'academia', label: { en: 'Academia & Research', ar: 'الأكاديميا والبحث' }, icon: '🎓' },
  { id: 'staff', label: { en: 'Internal Staff', ar: 'الموظفون الداخليون' }, icon: '👤' }
];

const CHANNEL_TYPES = [
  { value: 'portal', label: { en: 'Portal/Website', ar: 'البوابة/الموقع' } },
  { value: 'email', label: { en: 'Email', ar: 'البريد الإلكتروني' } },
  { value: 'social', label: { en: 'Social Media', ar: 'وسائل التواصل' } },
  { value: 'press', label: { en: 'Press/Media', ar: 'الصحافة/الإعلام' } },
  { value: 'events', label: { en: 'Events/Townhalls', ar: 'الفعاليات/اللقاءات' } },
  { value: 'newsletter', label: { en: 'Newsletter', ar: 'النشرة الإخبارية' } },
  { value: 'intranet', label: { en: 'Intranet', ar: 'الشبكة الداخلية' } },
  { value: 'workshops', label: { en: 'Workshops/Training', ar: 'ورش العمل/التدريب' } }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: { en: 'Daily', ar: 'يومي' } },
  { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
  { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
  { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
  { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } },
  { value: 'as_needed', label: { en: 'As Needed', ar: 'حسب الحاجة' } }
];

// Step 16: Communication Plan
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating, strategicPlanId }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('audiences');

  const communicationPlan = data.communication_plan || {};
  const targetAudiences = communicationPlan.target_audiences || [];
  const keyMessages = communicationPlan.key_messages || [];
  const internalChannels = communicationPlan.internal_channels || [];
  const externalChannels = communicationPlan.external_channels || [];

  const updatePlan = (updates) => {
    onChange({
      communication_plan: {
        ...communicationPlan,
        ...updates
      }
    });
  };

  // Target Audiences handlers
  const toggleAudience = (audienceId) => {
    const updated = targetAudiences.includes(audienceId)
      ? targetAudiences.filter(a => a !== audienceId)
      : [...targetAudiences, audienceId];
    updatePlan({ target_audiences: updated });
  };

  // Key Messages handlers
  const addKeyMessage = () => {
    const newMessage = {
      id: Date.now().toString(),
      text_en: '',
      text_ar: '',
      audience: '',
      channel: '',
      entity_launches: [] // NEW: Track which entities this message launches
    };
    updatePlan({ key_messages: [...keyMessages, newMessage] });
  };

  const updateKeyMessage = (index, field, value) => {
    const updated = keyMessages.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    updatePlan({ key_messages: updated });
  };

  const removeKeyMessage = (index) => {
    updatePlan({ key_messages: keyMessages.filter((_, i) => i !== index) });
  };

  // Channel handlers (structured)
  const addChannel = (type) => {
    const channels = type === 'internal' ? internalChannels : externalChannels;
    const newChannel = {
      id: Date.now().toString(),
      name_en: '',
      name_ar: '',
      type: 'email',
      purpose_en: '',
      purpose_ar: '',
      frequency: 'weekly',
      owner: '',
      audience: ''
    };
    updatePlan({ 
      [type === 'internal' ? 'internal_channels' : 'external_channels']: [...channels, newChannel]
    });
  };

  const updateChannel = (type, index, field, value) => {
    const channels = type === 'internal' ? internalChannels : externalChannels;
    const updated = channels.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    updatePlan({ 
      [type === 'internal' ? 'internal_channels' : 'external_channels']: updated
    });
  };

  const removeChannel = (type, index) => {
    const channels = type === 'internal' ? internalChannels : externalChannels;
    updatePlan({ 
      [type === 'internal' ? 'internal_channels' : 'external_channels']: channels.filter((_, i) => i !== index)
    });
  };

  const renderChannelCard = (channel, index, type) => (
    <Card key={channel.id || index} className="mb-3">
      <CardContent className="pt-4 space-y-3">
        <div className="flex justify-between items-start">
          <Badge variant="outline">{type === 'internal' ? t({ en: 'Internal', ar: 'داخلي' }) : t({ en: 'External', ar: 'خارجي' })}</Badge>
          <Button variant="ghost" size="icon" onClick={() => removeChannel(type, index)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t({ en: 'Channel Name (EN)', ar: 'اسم القناة (إنجليزي)' })}</Label>
            <Input
              value={typeof channel === 'string' ? channel : (channel.name_en || '')}
              onChange={(e) => updateChannel(type, index, 'name_en', e.target.value)}
              placeholder="e.g., Ministry Newsletter"
            />
          </div>
          <div>
            <Label className="text-xs">{t({ en: 'Channel Name (AR)', ar: 'اسم القناة (عربي)' })}</Label>
            <Input
              dir="rtl"
              value={typeof channel === 'string' ? '' : (channel.name_ar || '')}
              onChange={(e) => updateChannel(type, index, 'name_ar', e.target.value)}
              placeholder="مثال: النشرة الإخبارية للوزارة"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
            <Select
              value={channel.type || 'email'}
              onValueChange={(v) => updateChannel(type, index, 'type', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CHANNEL_TYPES.map(ct => (
                  <SelectItem key={ct.value} value={ct.value}>{ct.label[language]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
            <Select
              value={channel.frequency || 'weekly'}
              onValueChange={(v) => updateChannel(type, index, 'frequency', v)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map(f => (
                  <SelectItem key={f.value} value={f.value}>{f.label[language]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">{t({ en: 'Owner/Manager', ar: 'المسؤول' })}</Label>
            <Input
              value={channel.owner || ''}
              onChange={(e) => updateChannel(type, index, 'owner', e.target.value)}
              placeholder={t({ en: 'Role or department', ar: 'الدور أو الإدارة' })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t({ en: 'Purpose (EN)', ar: 'الغرض (إنجليزي)' })}</Label>
            <Textarea
              value={channel.purpose_en || ''}
              onChange={(e) => updateChannel(type, index, 'purpose_en', e.target.value)}
              placeholder="What is this channel used for?"
              rows={2}
            />
          </div>
          <div>
            <Label className="text-xs">{t({ en: 'Purpose (AR)', ar: 'الغرض (عربي)' })}</Label>
            <Textarea
              dir="rtl"
              value={channel.purpose_ar || ''}
              onChange={(e) => updateChannel(type, index, 'purpose_ar', e.target.value)}
              placeholder="ما هو الغرض من هذه القناة؟"
              rows={2}
            />
          </div>
        </div>

        {type === 'external' && (
          <div>
            <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
            <Input
              value={channel.audience || ''}
              onChange={(e) => updateChannel(type, index, 'audience', e.target.value)}
              placeholder={t({ en: 'e.g., Citizens, Media', ar: 'مثال: المواطنون، الإعلام' })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate Communication Plan', ar: 'إنشاء خطة التواصل' })}
        </Button>
      </div>

      {/* Master Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            {t({ en: 'Master Narrative', ar: 'السرد الأساسي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Narrative (EN)', ar: 'السرد (إنجليزي)' })}</Label>
              <Textarea
                value={communicationPlan.master_narrative_en || ''}
                onChange={(e) => updatePlan({ master_narrative_en: e.target.value })}
                placeholder="The overarching story that connects all communications..."
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Narrative (AR)', ar: 'السرد (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={communicationPlan.master_narrative_ar || ''}
                onChange={(e) => updatePlan({ master_narrative_ar: e.target.value })}
                placeholder="القصة الشاملة التي تربط جميع الاتصالات..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audiences" className="gap-2">
            <Users className="w-4 h-4" />
            {t({ en: 'Audiences', ar: 'الجمهور' })}
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <Megaphone className="w-4 h-4" />
            {t({ en: 'Messages', ar: 'الرسائل' })}
          </TabsTrigger>
          <TabsTrigger value="internal" className="gap-2">
            <Mail className="w-4 h-4" />
            {t({ en: 'Internal', ar: 'داخلي' })}
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-2">
            <Globe className="w-4 h-4" />
            {t({ en: 'External', ar: 'خارجي' })}
          </TabsTrigger>
        </TabsList>

        {/* Target Audiences Tab */}
        <TabsContent value="audiences" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            {t({ en: 'Select target audiences for your communication plan', ar: 'اختر الجمهور المستهدف لخطة التواصل' })}
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {AUDIENCE_TYPES.map(audience => (
              <Card 
                key={audience.id}
                className={`cursor-pointer transition-all ${
                  targetAudiences.includes(audience.id) 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => toggleAudience(audience.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{audience.icon}</span>
                  <span className="font-medium">
                    {audience.label[language]}
                  </span>
                  {targetAudiences.includes(audience.id) && (
                    <Badge className="ml-auto" variant="default">✓</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Key Messages Tab */}
        <TabsContent value="messages" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Megaphone className="w-5 h-5 text-primary" />
              {t({ en: 'Key Messages', ar: 'الرسائل الرئيسية' })}
              <Badge variant="secondary">{keyMessages.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addKeyMessage}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Message', ar: 'إضافة رسالة' })}
            </Button>
          </div>
          
          {keyMessages.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No key messages added. Click "Add Message" to create one.', ar: 'لم تتم إضافة رسائل. انقر على "إضافة رسالة" لإنشاء واحدة.' })}
            </div>
          ) : (
            keyMessages.map((msg, idx) => (
              <Card key={msg.id || idx}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" onClick={() => removeKeyMessage(idx)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t({ en: 'Message (EN)', ar: 'الرسالة (إنجليزي)' })}</Label>
                      <Textarea
                        value={typeof msg === 'string' ? msg : (msg.text_en || '')}
                        onChange={(e) => updateKeyMessage(idx, 'text_en', e.target.value)}
                        placeholder={t({ en: 'Enter key message...', ar: 'أدخل الرسالة الرئيسية...' })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: 'Message (AR)', ar: 'الرسالة (عربي)' })}</Label>
                      <Textarea
                        dir="rtl"
                        value={typeof msg === 'string' ? '' : (msg.text_ar || '')}
                        onChange={(e) => updateKeyMessage(idx, 'text_ar', e.target.value)}
                        placeholder="أدخل الرسالة الرئيسية..."
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
                      <Select
                        value={msg.audience || ''}
                        onValueChange={(v) => updateKeyMessage(idx, 'audience', v)}
                      >
                        <SelectTrigger><SelectValue placeholder={t({ en: 'Select audience', ar: 'اختر الجمهور' })} /></SelectTrigger>
                        <SelectContent>
                          {AUDIENCE_TYPES.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.label[language]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{t({ en: 'Recommended Channel', ar: 'القناة الموصى بها' })}</Label>
                      <Select
                        value={msg.channel || ''}
                        onValueChange={(v) => updateKeyMessage(idx, 'channel', v)}
                      >
                        <SelectTrigger><SelectValue placeholder={t({ en: 'Select channel', ar: 'اختر القناة' })} /></SelectTrigger>
                        <SelectContent>
                          {CHANNEL_TYPES.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label[language]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Internal Channels Tab */}
        <TabsContent value="internal" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="w-5 h-5 text-primary" />
              {t({ en: 'Internal Communication Channels', ar: 'قنوات التواصل الداخلية' })}
              <Badge variant="secondary">{internalChannels.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => addChannel('internal')}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
            </Button>
          </div>
          
          {internalChannels.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No internal channels defined. Click "Add Channel" to create one.', ar: 'لم يتم تحديد قنوات داخلية. انقر على "إضافة قناة" لإنشاء واحدة.' })}
            </div>
          ) : (
            internalChannels.map((channel, idx) => renderChannelCard(channel, idx, 'internal'))
          )}
        </TabsContent>

        {/* External Channels Tab */}
        <TabsContent value="external" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              {t({ en: 'External Communication Channels', ar: 'قنوات التواصل الخارجية' })}
              <Badge variant="secondary">{externalChannels.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => addChannel('external')}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
            </Button>
          </div>
          
          {externalChannels.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No external channels defined. Click "Add Channel" to create one.', ar: 'لم يتم تحديد قنوات خارجية. انقر على "إضافة قناة" لإنشاء واحدة.' })}
            </div>
          ) : (
            externalChannels.map((channel, idx) => renderChannelCard(channel, idx, 'external'))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Step 17: Change Management
export function Step17Change({ data, onChange, onGenerateAI, isGenerating, strategicPlanId }) {
  const { language, t, isRTL } = useLanguage();

  const trainingPlan = data.change_management?.training_plan || [];

  const addTraining = () => {
    const next = [
      ...trainingPlan,
      { 
        id: Date.now().toString(), 
        name_en: '', 
        name_ar: '',
        target_audience_en: '', 
        target_audience_ar: '',
        duration_en: '', 
        duration_ar: '',
        timeline_en: '', 
        timeline_ar: '',
        entity_training: [] // NEW: Track which entities this training supports
      }
    ];

    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  const updateTraining = (id, updates) => {
    const next = trainingPlan.map((tItem) => (tItem.id === id ? { ...tItem, ...updates } : tItem));
    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  const removeTraining = (id) => {
    const next = trainingPlan.filter((tItem) => tItem.id !== id);
    onChange({
      change_management: {
        ...data.change_management,
        training_plan: next
      }
    });
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex justify-end">
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          <Sparkles className="w-4 h-4" />
          {t({ en: 'Generate Change Plan', ar: 'إنشاء خطة التغيير' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {t({ en: 'Readiness Assessment', ar: 'تقييم الجاهزية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Assessment (EN)', ar: 'التقييم (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.readiness_assessment_en || data.change_management?.readiness_assessment || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment_en: e.target.value } })}
                placeholder={t({ en: 'Assess organizational readiness for change...', ar: 'تقييم جاهزية المنظمة للتغيير...' })}
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Assessment (AR)', ar: 'التقييم (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.readiness_assessment_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, readiness_assessment_ar: e.target.value } })}
                placeholder="تقييم جاهزية المنظمة للتغيير..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Change Approach', ar: 'نهج التغيير' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Approach (EN)', ar: 'النهج (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.change_approach_en || data.change_management?.change_approach || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach_en: e.target.value } })}
                placeholder={t({ en: 'Describe the change management approach...', ar: 'وصف نهج إدارة التغيير...' })}
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Approach (AR)', ar: 'النهج (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.change_approach_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, change_approach_ar: e.target.value } })}
                placeholder="وصف نهج إدارة التغيير..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t({ en: 'Resistance Management', ar: 'إدارة المقاومة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t({ en: 'Strategy (EN)', ar: 'الاستراتيجية (إنجليزي)' })}</Label>
              <Textarea
                value={data.change_management?.resistance_management_en || data.change_management?.resistance_management || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management_en: e.target.value } })}
                placeholder={t({ en: 'How will you address resistance to change?', ar: 'كيف ستتعامل مع مقاومة التغيير؟' })}
                rows={3}
              />
            </div>
            <div>
              <Label className="text-xs">{t({ en: 'Strategy (AR)', ar: 'الاستراتيجية (عربي)' })}</Label>
              <Textarea
                dir="rtl"
                value={data.change_management?.resistance_management_ar || ''}
                onChange={(e) => onChange({ change_management: { ...data.change_management, resistance_management_ar: e.target.value } })}
                placeholder="كيف ستتعامل مع مقاومة التغيير؟"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {t({ en: 'Training Plan', ar: 'خطة التدريب' })}
            <Badge variant="secondary">{trainingPlan.length}</Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={addTraining} className="gap-2">
            <Plus className="h-4 w-4" />
            {t({ en: 'Add Training', ar: 'إضافة تدريب' })}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {trainingPlan.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
              {t({ en: 'No training items added', ar: 'لم تتم إضافة عناصر تدريب' })}
            </div>
          ) : (
            trainingPlan.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {language === 'ar' ? (item.name_ar || item.name_en || item.name) : (item.name_en || item.name)} 
                    || {t({ en: 'Training Item', ar: 'عنصر تدريب' })}
                  </p>
                  <Button size="icon" variant="ghost" onClick={() => removeTraining(item.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Training Name (EN)', ar: 'اسم التدريب (إنجليزي)' })}</Label>
                    <Input 
                      value={item.name_en || item.name || ''} 
                      onChange={(e) => updateTraining(item.id, { name_en: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Training Name (AR)', ar: 'اسم التدريب (عربي)' })}</Label>
                    <Input 
                      dir="rtl"
                      value={item.name_ar || ''} 
                      onChange={(e) => updateTraining(item.id, { name_ar: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Target Audience (EN)', ar: 'الفئة المستهدفة (إنجليزي)' })}</Label>
                    <Input 
                      value={item.target_audience_en || item.target_audience || ''} 
                      onChange={(e) => updateTraining(item.id, { target_audience_en: e.target.value })} 
                      placeholder={t({ en: 'e.g., IT Staff', ar: 'مثال: موظفو تقنية المعلومات' })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Target Audience (AR)', ar: 'الفئة المستهدفة (عربي)' })}</Label>
                    <Input 
                      dir="rtl"
                      value={item.target_audience_ar || ''} 
                      onChange={(e) => updateTraining(item.id, { target_audience_ar: e.target.value })} 
                      placeholder="مثال: موظفو تقنية المعلومات"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Duration (EN)', ar: 'المدة (إنجليزي)' })}</Label>
                    <Input 
                      value={item.duration_en || item.duration || ''} 
                      onChange={(e) => updateTraining(item.id, { duration_en: e.target.value })} 
                      placeholder={t({ en: 'e.g., 2 days', ar: 'مثال: يومان' })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Duration (AR)', ar: 'المدة (عربي)' })}</Label>
                    <Input 
                      dir="rtl"
                      value={item.duration_ar || ''} 
                      onChange={(e) => updateTraining(item.id, { duration_ar: e.target.value })} 
                      placeholder="مثال: يومان"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Timeline (EN)', ar: 'الجدول الزمني (إنجليزي)' })}</Label>
                    <Input 
                      value={item.timeline_en || item.timeline || ''} 
                      onChange={(e) => updateTraining(item.id, { timeline_en: e.target.value })} 
                      placeholder={t({ en: 'e.g., Q2 2026', ar: 'مثال: الربع الثاني 2026' })} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t({ en: 'Timeline (AR)', ar: 'الجدول الزمني (عربي)' })}</Label>
                    <Input 
                      dir="rtl"
                      value={item.timeline_ar || ''} 
                      onChange={(e) => updateTraining(item.id, { timeline_ar: e.target.value })} 
                      placeholder="مثال: الربع الثاني 2026"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Step16Communication;
