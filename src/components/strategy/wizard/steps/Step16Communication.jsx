import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, Megaphone, Plus, X, Users, Radio, Mail, Globe, BookOpen, 
  ChevronUp, ChevronDown, Link2, MessageSquare, Calendar, LayoutGrid, 
  Table2, CalendarDays, Building2, Handshake, Briefcase, Newspaper,
  GraduationCap, User, Target, AlertTriangle, CheckCircle2, Send,
  Smartphone, Monitor, Tv, Mic, FileText, PresentationIcon, Video,
  Bell, Rss, Hash, Eye, TrendingUp, BarChart3, Loader2, Layers
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import { useCommunicationAI } from '@/hooks/strategy/useCommunicationAI';
import { useCommunicationPlans } from '@/hooks/strategy/useCommunicationPlans';
import EntityAllocationSelector from '../EntityAllocationSelector';

// Enhanced Audience Types with categories and engagement levels
const AUDIENCE_TYPES = [
  { id: 'citizens', label: { en: 'Citizens', ar: 'المواطنون' }, icon: Users, category: 'external', description: { en: 'General public and residents', ar: 'عامة الناس والمقيمين' }, priority: 'high' },
  { id: 'municipalities', label: { en: 'Municipalities', ar: 'البلديات' }, icon: Building2, category: 'internal', description: { en: 'Local government entities', ar: 'الجهات الحكومية المحلية' }, priority: 'high' },
  { id: 'partners', label: { en: 'Partners & Providers', ar: 'الشركاء والموردون' }, icon: Handshake, category: 'external', description: { en: 'Business partners and service providers', ar: 'شركاء الأعمال ومقدمي الخدمات' }, priority: 'medium' },
  { id: 'leadership', label: { en: 'Executive Leadership', ar: 'القيادة التنفيذية' }, icon: Briefcase, category: 'internal', description: { en: 'C-suite and senior management', ar: 'الإدارة العليا والتنفيذية' }, priority: 'critical' },
  { id: 'media', label: { en: 'Media & Press', ar: 'الإعلام والصحافة' }, icon: Newspaper, category: 'external', description: { en: 'Journalists and media outlets', ar: 'الصحفيون ووسائل الإعلام' }, priority: 'medium' },
  { id: 'academia', label: { en: 'Academia & Research', ar: 'الأكاديميا والبحث' }, icon: GraduationCap, category: 'external', description: { en: 'Universities and research institutions', ar: 'الجامعات ومؤسسات البحث' }, priority: 'low' },
  { id: 'staff', label: { en: 'Internal Staff', ar: 'الموظفون الداخليون' }, icon: User, category: 'internal', description: { en: 'Ministry employees and contractors', ar: 'موظفو الوزارة والمتعاقدون' }, priority: 'high' },
  { id: 'investors', label: { en: 'Investors & Donors', ar: 'المستثمرون والمانحون' }, icon: TrendingUp, category: 'external', description: { en: 'Financial stakeholders', ar: 'أصحاب المصلحة الماليون' }, priority: 'medium' }
];

// Enhanced Channel Types with categories and reach
const CHANNEL_TYPES = [
  { value: 'portal', label: { en: 'Portal/Website', ar: 'البوابة/الموقع' }, icon: Globe, category: 'digital', reach: 'high' },
  { value: 'email', label: { en: 'Email', ar: 'البريد الإلكتروني' }, icon: Mail, category: 'digital', reach: 'medium' },
  { value: 'social', label: { en: 'Social Media', ar: 'وسائل التواصل' }, icon: Hash, category: 'digital', reach: 'high' },
  { value: 'press', label: { en: 'Press/Media', ar: 'الصحافة/الإعلام' }, icon: Newspaper, category: 'traditional', reach: 'high' },
  { value: 'events', label: { en: 'Events/Townhalls', ar: 'الفعاليات/اللقاءات' }, icon: PresentationIcon, category: 'in-person', reach: 'medium' },
  { value: 'newsletter', label: { en: 'Newsletter', ar: 'النشرة الإخبارية' }, icon: FileText, category: 'digital', reach: 'medium' },
  { value: 'intranet', label: { en: 'Intranet', ar: 'الشبكة الداخلية' }, icon: Monitor, category: 'internal', reach: 'low' },
  { value: 'workshops', label: { en: 'Workshops/Training', ar: 'ورش العمل/التدريب' }, icon: GraduationCap, category: 'in-person', reach: 'low' },
  { value: 'mobile_app', label: { en: 'Mobile App', ar: 'تطبيق الجوال' }, icon: Smartphone, category: 'digital', reach: 'high' },
  { value: 'tv_radio', label: { en: 'TV/Radio', ar: 'التلفزيون/الراديو' }, icon: Tv, category: 'traditional', reach: 'high' },
  { value: 'video', label: { en: 'Video Content', ar: 'محتوى الفيديو' }, icon: Video, category: 'digital', reach: 'high' },
  { value: 'podcast', label: { en: 'Podcast', ar: 'بودكاست' }, icon: Mic, category: 'digital', reach: 'medium' }
];

// Message Types/Categories
const MESSAGE_TYPES = [
  { value: 'announcement', label: { en: 'Announcement', ar: 'إعلان' }, icon: Megaphone, color: 'bg-blue-500' },
  { value: 'update', label: { en: 'Progress Update', ar: 'تحديث التقدم' }, icon: TrendingUp, color: 'bg-green-500' },
  { value: 'alert', label: { en: 'Alert/Urgent', ar: 'تنبيه/عاجل' }, icon: AlertTriangle, color: 'bg-red-500' },
  { value: 'milestone', label: { en: 'Milestone', ar: 'معلم رئيسي' }, icon: Target, color: 'bg-purple-500' },
  { value: 'success', label: { en: 'Success Story', ar: 'قصة نجاح' }, icon: CheckCircle2, color: 'bg-emerald-500' },
  { value: 'educational', label: { en: 'Educational', ar: 'تعليمي' }, icon: GraduationCap, color: 'bg-amber-500' }
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: { en: 'Daily', ar: 'يومي' } },
  { value: 'weekly', label: { en: 'Weekly', ar: 'أسبوعي' } },
  { value: 'biweekly', label: { en: 'Bi-weekly', ar: 'كل أسبوعين' } },
  { value: 'monthly', label: { en: 'Monthly', ar: 'شهري' } },
  { value: 'quarterly', label: { en: 'Quarterly', ar: 'ربع سنوي' } },
  { value: 'as_needed', label: { en: 'As Needed', ar: 'حسب الحاجة' } }
];

// Communication Dashboard Component
function CommunicationDashboard({ communicationPlan, t, language }) {
  const targetAudiences = communicationPlan.target_audiences || [];
  const keyMessages = communicationPlan.key_messages || [];
  const internalChannels = communicationPlan.internal_channels || [];
  const externalChannels = communicationPlan.external_channels || [];
  const totalChannels = internalChannels.length + externalChannels.length;
  
  // Calculate coverage and health
  const audienceCoverage = Math.round((targetAudiences.length / AUDIENCE_TYPES.length) * 100);
  const hasNarrative = !!(communicationPlan.master_narrative_en || communicationPlan.master_narrative_ar);
  const hasInternalChannels = internalChannels.length > 0;
  const hasExternalChannels = externalChannels.length > 0;
  const hasMessages = keyMessages.length > 0;
  
  // Health score calculation
  const healthChecks = [
    hasNarrative,
    targetAudiences.length >= 3,
    hasMessages,
    hasInternalChannels,
    hasExternalChannels,
    keyMessages.every(m => m.text_en && m.audience),
    internalChannels.every(c => c.name_en && c.type),
    externalChannels.every(c => c.name_en && c.type)
  ];
  const healthScore = Math.round((healthChecks.filter(Boolean).length / healthChecks.length) * 100);
  
  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const stats = [
    { label: { en: 'Target Audiences', ar: 'الجمهور المستهدف' }, value: targetAudiences.length, icon: Users, color: 'text-blue-500' },
    { label: { en: 'Key Messages', ar: 'الرسائل الرئيسية' }, value: keyMessages.length, icon: MessageSquare, color: 'text-purple-500' },
    { label: { en: 'Internal Channels', ar: 'القنوات الداخلية' }, value: internalChannels.length, icon: Mail, color: 'text-green-500' },
    { label: { en: 'External Channels', ar: 'القنوات الخارجية' }, value: externalChannels.length, icon: Globe, color: 'text-orange-500' },
    { label: { en: 'Audience Coverage', ar: 'تغطية الجمهور' }, value: `${audienceCoverage}%`, icon: Eye, color: 'text-cyan-500' },
    { label: { en: 'Plan Health', ar: 'صحة الخطة' }, value: `${healthScore}%`, icon: BarChart3, color: getHealthColor(healthScore) }
  ];

  return (
    <Card className="bg-gradient-to-br from-background to-muted/30 border-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          {t({ en: 'Communication Dashboard', ar: 'لوحة معلومات التواصل' })}
        </CardTitle>
        <CardDescription>
          {t({ en: 'Overview of your communication plan components', ar: 'نظرة عامة على مكونات خطة التواصل' })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="text-center p-3 rounded-lg bg-background/50 border">
                <IconComponent className={`w-6 h-6 mx-auto mb-1 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label[language]}</p>
              </div>
            );
          })}
        </div>
        
        {/* Health Indicators */}
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">{t({ en: 'Completeness Check', ar: 'التحقق من الاكتمال' })}</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={hasNarrative ? 'default' : 'outline'} className={hasNarrative ? 'bg-emerald-500' : ''}>
              {hasNarrative ? '✓' : '○'} {t({ en: 'Narrative', ar: 'السرد' })}
            </Badge>
            <Badge variant={targetAudiences.length >= 3 ? 'default' : 'outline'} className={targetAudiences.length >= 3 ? 'bg-emerald-500' : ''}>
              {targetAudiences.length >= 3 ? '✓' : '○'} {t({ en: '3+ Audiences', ar: '3+ جمهور' })}
            </Badge>
            <Badge variant={hasMessages ? 'default' : 'outline'} className={hasMessages ? 'bg-emerald-500' : ''}>
              {hasMessages ? '✓' : '○'} {t({ en: 'Messages', ar: 'الرسائل' })}
            </Badge>
            <Badge variant={hasInternalChannels ? 'default' : 'outline'} className={hasInternalChannels ? 'bg-emerald-500' : ''}>
              {hasInternalChannels ? '✓' : '○'} {t({ en: 'Internal', ar: 'داخلي' })}
            </Badge>
            <Badge variant={hasExternalChannels ? 'default' : 'outline'} className={hasExternalChannels ? 'bg-emerald-500' : ''}>
              {hasExternalChannels ? '✓' : '○'} {t({ en: 'External', ar: 'خارجي' })}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Audience Card Component
function AudienceCard({ audience, isSelected, onToggle, language, t }) {
  const IconComponent = audience.icon;
  const priorityColors = {
    critical: 'border-red-500 bg-red-500/5',
    high: 'border-orange-500 bg-orange-500/5',
    medium: 'border-blue-500 bg-blue-500/5',
    low: 'border-gray-500 bg-gray-500/5'
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : `hover:border-primary/50 ${priorityColors[audience.priority]}`
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
            <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{audience.label[language]}</span>
              {isSelected && <Badge variant="default" className="shrink-0">✓</Badge>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{audience.description[language]}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {audience.category === 'internal' 
                  ? t({ en: 'Internal', ar: 'داخلي' }) 
                  : t({ en: 'External', ar: 'خارجي' })}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">{audience.priority}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Message Card Component
function MessageCard({ message, index, onUpdate, onRemove, language, t, strategicPlanId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageType = MESSAGE_TYPES.find(mt => mt.value === message.type) || MESSAGE_TYPES[0];
  const TypeIcon = messageType.icon;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded ${messageType.color}`}>
                  <TypeIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm line-clamp-1">
                    {message.text_en || message.text_ar || t({ en: 'New Message', ar: 'رسالة جديدة' })}
                  </p>
                  <div className="flex gap-2 mt-1">
                    {message.audience && (
                      <Badge variant="outline" className="text-xs">
                        {AUDIENCE_TYPES.find(a => a.id === message.audience)?.label[language] || message.audience}
                      </Badge>
                    )}
                    {message.channel && (
                      <Badge variant="outline" className="text-xs">
                        {CHANNEL_TYPES.find(c => c.value === message.channel)?.label[language] || message.channel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                  <X className="w-4 h-4" />
                </Button>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4 border-t">
            {/* Message Type */}
            <div>
              <Label className="text-xs">{t({ en: 'Message Type', ar: 'نوع الرسالة' })}</Label>
              <Select value={message.type || 'announcement'} onValueChange={(v) => onUpdate('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MESSAGE_TYPES.map(mt => {
                    const Icon = mt.icon;
                    return (
                      <SelectItem key={mt.value} value={mt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {mt.label[language]}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Message Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Message (EN)', ar: 'الرسالة (إنجليزي)' })}</Label>
                <Textarea
                  value={message.text_en || ''}
                  onChange={(e) => onUpdate('text_en', e.target.value)}
                  placeholder={t({ en: 'Enter key message...', ar: 'أدخل الرسالة الرئيسية...' })}
                  rows={3}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Message (AR)', ar: 'الرسالة (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={message.text_ar || ''}
                  onChange={(e) => onUpdate('text_ar', e.target.value)}
                  placeholder="أدخل الرسالة الرئيسية..."
                  rows={3}
                />
              </div>
            </div>

            {/* Target & Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
                <Select value={message.audience || ''} onValueChange={(v) => onUpdate('audience', v)}>
                  <SelectTrigger><SelectValue placeholder={t({ en: 'Select audience', ar: 'اختر الجمهور' })} /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_TYPES.map(a => {
                      const Icon = a.icon;
                      return (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {a.label[language]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Recommended Channel', ar: 'القناة الموصى بها' })}</Label>
                <Select value={message.channel || ''} onValueChange={(v) => onUpdate('channel', v)}>
                  <SelectTrigger><SelectValue placeholder={t({ en: 'Select channel', ar: 'اختر القناة' })} /></SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPES.map(c => {
                      const Icon = c.icon;
                      return (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {c.label[language]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Entity Allocation */}
            <div className="space-y-1 pt-2 border-t">
              <Label className="text-xs flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                {t({ en: 'Link to Entity Launches', ar: 'ربط بإطلاق الكيانات' })}
              </Label>
              <EntityAllocationSelector
                strategicPlanId={strategicPlanId}
                value={message.entity_launches || []}
                onChange={(allocations) => onUpdate('entity_launches', allocations)}
                multiple={true}
                placeholder={t({ en: 'Select entities this message announces...', ar: 'اختر الكيانات التي تعلن عنها هذه الرسالة...' })}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Channel Card Component
function ChannelCard({ channel, index, type, onUpdate, onRemove, language, t }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const channelType = CHANNEL_TYPES.find(ct => ct.value === channel.type) || CHANNEL_TYPES[0];
  const ChannelIcon = channelType.icon;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <ChannelIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {channel.name_en || channel.name_ar || t({ en: 'New Channel', ar: 'قناة جديدة' })}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {type === 'internal' ? t({ en: 'Internal', ar: 'داخلي' }) : t({ en: 'External', ar: 'خارجي' })}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{channelType.label[language]}</Badge>
                    {channel.frequency && (
                      <Badge variant="outline" className="text-xs">
                        {FREQUENCY_OPTIONS.find(f => f.value === channel.frequency)?.label[language]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                  <X className="w-4 h-4" />
                </Button>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4 border-t">
            {/* Channel Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Channel Name (EN)', ar: 'اسم القناة (إنجليزي)' })}</Label>
                <Input
                  value={channel.name_en || ''}
                  onChange={(e) => onUpdate('name_en', e.target.value)}
                  placeholder="e.g., Ministry Newsletter"
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Channel Name (AR)', ar: 'اسم القناة (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={channel.name_ar || ''}
                  onChange={(e) => onUpdate('name_ar', e.target.value)}
                  placeholder="مثال: النشرة الإخبارية للوزارة"
                />
              </div>
            </div>

            {/* Type, Frequency, Owner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                <Select value={channel.type || 'email'} onValueChange={(v) => onUpdate('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CHANNEL_TYPES.map(ct => {
                      const Icon = ct.icon;
                      return (
                        <SelectItem key={ct.value} value={ct.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {ct.label[language]}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Frequency', ar: 'التكرار' })}</Label>
                <Select value={channel.frequency || 'weekly'} onValueChange={(v) => onUpdate('frequency', v)}>
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
                  onChange={(e) => onUpdate('owner', e.target.value)}
                  placeholder={t({ en: 'Role or department', ar: 'الدور أو الإدارة' })}
                />
              </div>
            </div>

            {/* Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Purpose (EN)', ar: 'الغرض (إنجليزي)' })}</Label>
                <Textarea
                  value={channel.purpose_en || ''}
                  onChange={(e) => onUpdate('purpose_en', e.target.value)}
                  placeholder="What is this channel used for?"
                  rows={2}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Purpose (AR)', ar: 'الغرض (عربي)' })}</Label>
                <Textarea
                  dir="rtl"
                  value={channel.purpose_ar || ''}
                  onChange={(e) => onUpdate('purpose_ar', e.target.value)}
                  placeholder="ما هو الغرض من هذه القناة؟"
                  rows={2}
                />
              </div>
            </div>

            {/* External-specific: Audience */}
            {type === 'external' && (
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
                <Input
                  value={channel.audience || ''}
                  onChange={(e) => onUpdate('audience', e.target.value)}
                  placeholder={t({ en: 'e.g., Citizens, Media', ar: 'مثال: المواطنون، الإعلام' })}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Channel Matrix View
function ChannelMatrixView({ internalChannels, externalChannels, language, t }) {
  const allChannels = [
    ...internalChannels.map(c => ({ ...c, scope: 'internal' })),
    ...externalChannels.map(c => ({ ...c, scope: 'external' }))
  ];

  const channelsByCategory = useMemo(() => {
    const categories = ['digital', 'traditional', 'in-person', 'internal'];
    return categories.map(cat => ({
      category: cat,
      label: {
        digital: { en: 'Digital', ar: 'رقمي' },
        traditional: { en: 'Traditional', ar: 'تقليدي' },
        'in-person': { en: 'In-Person', ar: 'شخصي' },
        internal: { en: 'Internal Systems', ar: 'أنظمة داخلية' }
      }[cat],
      channels: allChannels.filter(c => {
        const channelType = CHANNEL_TYPES.find(ct => ct.value === c.type);
        return channelType?.category === cat;
      })
    })).filter(g => g.channels.length > 0);
  }, [allChannels]);

  return (
    <div className="space-y-4">
      {channelsByCategory.map(group => (
        <Card key={group.category}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {group.label[language]} ({group.channels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t({ en: 'Channel', ar: 'القناة' })}</th>
                    <th className="text-left p-2">{t({ en: 'Type', ar: 'النوع' })}</th>
                    <th className="text-left p-2">{t({ en: 'Scope', ar: 'النطاق' })}</th>
                    <th className="text-left p-2">{t({ en: 'Frequency', ar: 'التكرار' })}</th>
                    <th className="text-left p-2">{t({ en: 'Owner', ar: 'المسؤول' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.channels.map((channel, idx) => {
                    const channelType = CHANNEL_TYPES.find(ct => ct.value === channel.type);
                    const ChannelIcon = channelType?.icon || Globe;
                    return (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4 text-muted-foreground" />
                            {language === 'ar' ? (channel.name_ar || channel.name_en) : (channel.name_en || channel.name_ar)}
                          </div>
                        </td>
                        <td className="p-2">{channelType?.label[language] || channel.type}</td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {channel.scope === 'internal' ? t({ en: 'Internal', ar: 'داخلي' }) : t({ en: 'External', ar: 'خارجي' })}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {FREQUENCY_OPTIONS.find(f => f.value === channel.frequency)?.label[language] || channel.frequency}
                        </td>
                        <td className="p-2 text-muted-foreground">{channel.owner || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {channelsByCategory.length === 0 && (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
          {t({ en: 'No channels defined yet. Add channels in the Internal/External tabs.', ar: 'لم يتم تحديد قنوات بعد. أضف قنوات في علامات التبويب الداخلية/الخارجية.' })}
        </div>
      )}
    </div>
  );
}

// Step 16: Communication Plan
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating, strategicPlanId }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('audiences');
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'matrix'
  
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
      type: 'announcement',
      audience: '',
      channel: '',
      entity_launches: []
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

  // Channel handlers
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

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with AI Generate */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            {t({ en: 'Communication Plan', ar: 'خطة التواصل' })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t({ en: 'Define your communication strategy, target audiences, and channels', ar: 'حدد استراتيجية التواصل والجمهور المستهدف والقنوات' })}
          </p>
        </div>
        <Button variant="outline" onClick={onGenerateAI} disabled={isGenerating} className="gap-2">
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isGenerating ? t({ en: 'Generating...', ar: 'جاري الإنشاء...' }) : t({ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' })}
        </Button>
      </div>

      {/* Dashboard */}
      <CommunicationDashboard communicationPlan={communicationPlan} t={t} language={language} />

      {/* Master Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5 text-primary" />
            {t({ en: 'Master Narrative', ar: 'السرد الأساسي' })}
          </CardTitle>
          <CardDescription>
            {t({ en: 'The overarching story that connects all communications', ar: 'القصة الشاملة التي تربط جميع الاتصالات' })}
          </CardDescription>
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

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="audiences" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Audiences', ar: 'الجمهور' })}</span>
              <Badge variant="secondary" className="ml-1">{targetAudiences.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Messages', ar: 'الرسائل' })}</span>
              <Badge variant="secondary" className="ml-1">{keyMessages.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="internal" className="gap-2">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Internal', ar: 'داخلي' })}</span>
              <Badge variant="secondary" className="ml-1">{internalChannels.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'External', ar: 'خارجي' })}</span>
              <Badge variant="secondary" className="ml-1">{externalChannels.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {(activeTab === 'internal' || activeTab === 'external') && (
          <div className="flex gap-1 ml-4">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'matrix' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('matrix')}
            >
              <Table2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Target Audiences Tab */}
      {activeTab === 'audiences' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t({ en: 'Select target audiences for your communication plan', ar: 'اختر الجمهور المستهدف لخطة التواصل' })}
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE_TYPES.map(audience => (
              <AudienceCard
                key={audience.id}
                audience={audience}
                isSelected={targetAudiences.includes(audience.id)}
                onToggle={() => toggleAudience(audience.id)}
                language={language}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* Key Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define key messages for different audiences and channels', ar: 'حدد الرسائل الرئيسية لمختلف الجماهير والقنوات' })}
            </p>
            <Button variant="outline" size="sm" onClick={addKeyMessage}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Message', ar: 'إضافة رسالة' })}
            </Button>
          </div>
          
          {keyMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t({ en: 'No key messages added. Click "Add Message" to create one.', ar: 'لم تتم إضافة رسائل. انقر على "إضافة رسالة" لإنشاء واحدة.' })}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keyMessages.map((msg, idx) => (
                <MessageCard
                  key={msg.id || idx}
                  message={msg}
                  index={idx}
                  onUpdate={(field, value) => updateKeyMessage(idx, field, value)}
                  onRemove={() => removeKeyMessage(idx)}
                  language={language}
                  t={t}
                  strategicPlanId={strategicPlanId}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Internal Channels Tab */}
      {activeTab === 'internal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define internal communication channels for staff and teams', ar: 'حدد قنوات التواصل الداخلية للموظفين والفرق' })}
            </p>
            <Button variant="outline" size="sm" onClick={() => addChannel('internal')}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
            </Button>
          </div>
          
          {viewMode === 'matrix' ? (
            <ChannelMatrixView 
              internalChannels={internalChannels} 
              externalChannels={[]} 
              language={language} 
              t={t} 
            />
          ) : (
            internalChannels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No internal channels defined. Click "Add Channel" to create one.', ar: 'لم يتم تحديد قنوات داخلية. انقر على "إضافة قناة" لإنشاء واحدة.' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {internalChannels.map((channel, idx) => (
                  <ChannelCard
                    key={channel.id || idx}
                    channel={channel}
                    index={idx}
                    type="internal"
                    onUpdate={(field, value) => updateChannel('internal', idx, field, value)}
                    onRemove={() => removeChannel('internal', idx)}
                    language={language}
                    t={t}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* External Channels Tab */}
      {activeTab === 'external' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define external communication channels for public and stakeholders', ar: 'حدد قنوات التواصل الخارجية للجمهور وأصحاب المصلحة' })}
            </p>
            <Button variant="outline" size="sm" onClick={() => addChannel('external')}>
              <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
            </Button>
          </div>
          
          {viewMode === 'matrix' ? (
            <ChannelMatrixView 
              internalChannels={[]} 
              externalChannels={externalChannels} 
              language={language} 
              t={t} 
            />
          ) : (
            externalChannels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No external channels defined. Click "Add Channel" to create one.', ar: 'لم يتم تحديد قنوات خارجية. انقر على "إضافة قناة" لإنشاء واحدة.' })}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {externalChannels.map((channel, idx) => (
                  <ChannelCard
                    key={channel.id || idx}
                    channel={channel}
                    index={idx}
                    type="external"
                    onUpdate={(field, value) => updateChannel('external', idx, field, value)}
                    onRemove={() => removeChannel('external', idx)}
                    language={language}
                    t={t}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}


export default Step16Communication;
