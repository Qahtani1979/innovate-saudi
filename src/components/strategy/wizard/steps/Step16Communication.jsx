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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Megaphone, Plus, X, Users, Radio, Mail, Globe, BookOpen, 
  ChevronUp, ChevronDown, Link2, MessageSquare, Calendar, LayoutGrid, 
  Table2, CalendarDays, Building2, Handshake, Briefcase, Newspaper,
  GraduationCap, User, Target, AlertTriangle, CheckCircle2, Send,
  Smartphone, Monitor, Tv, Mic, FileText, PresentationIcon, Video,
  Bell, Rss, Hash, Eye, TrendingUp, BarChart3, Loader2, Layers,
  AlertCircle, Info, PieChart
} from 'lucide-react';
import { useLanguage } from '../../../LanguageContext';
import EntityAllocationSelector from '../EntityAllocationSelector';
import { StepDashboardHeader, QualityMetrics, RecommendationsCard, DistributionChart, MainAIGeneratorCard } from '../shared';

// Enhanced Audience Types
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

// Channel Types
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

// Message Types
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

// Calculate completeness
function calculateCompleteness(communicationPlan) {
  const targetAudiences = communicationPlan.target_audiences || [];
  const keyMessages = communicationPlan.key_messages || [];
  const internalChannels = communicationPlan.internal_channels || [];
  const externalChannels = communicationPlan.external_channels || [];
  
  const checks = [
    { name: 'narrative', weight: 15, complete: !!(communicationPlan.master_narrative_en || communicationPlan.master_narrative_ar) },
    { name: 'audiences', weight: 20, complete: targetAudiences.length >= 3 },
    { name: 'messages', weight: 25, complete: keyMessages.length > 0 && keyMessages.every(m => m.text_en && m.audience) },
    { name: 'internal', weight: 20, complete: internalChannels.length > 0 && internalChannels.every(c => c.name_en && c.type) },
    { name: 'external', weight: 20, complete: externalChannels.length > 0 && externalChannels.every(c => c.name_en && c.type) }
  ];
  
  const score = checks.reduce((acc, check) => acc + (check.complete ? check.weight : 0), 0);
  return { score, checks };
}

// Calculate message completeness
function calculateMessageCompleteness(message) {
  const fields = [
    { name: 'text_en', filled: !!message.text_en },
    { name: 'text_ar', filled: !!message.text_ar },
    { name: 'type', filled: !!message.type },
    { name: 'audience', filled: !!message.audience },
    { name: 'channel', filled: !!message.channel }
  ];
  return Math.round((fields.filter(f => f.filled).length / fields.length) * 100);
}

// Calculate channel completeness
function calculateChannelCompleteness(channel) {
  const fields = [
    { name: 'name_en', filled: !!channel.name_en },
    { name: 'name_ar', filled: !!channel.name_ar },
    { name: 'type', filled: !!channel.type },
    { name: 'frequency', filled: !!channel.frequency },
    { name: 'owner', filled: !!channel.owner },
    { name: 'purpose_en', filled: !!channel.purpose_en }
  ];
  return Math.round((fields.filter(f => f.filled).length / fields.length) * 100);
}
// Helper function for calculating completeness (used in SummaryView)

// Audience Card Component
function AudienceCard({ audience, isSelected, onToggle, language, t, isReadOnly }) {
  const IconComponent = audience.icon;
  const priorityColors = {
    critical: 'border-red-500/50 bg-red-500/5',
    high: 'border-orange-500/50 bg-orange-500/5',
    medium: 'border-blue-500/50 bg-blue-500/5',
    low: 'border-muted bg-muted/5'
  };

  return (
    <Card 
      className={`transition-all ${isReadOnly ? '' : 'cursor-pointer'} ${
        isSelected 
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
          : `hover:border-primary/50 ${priorityColors[audience.priority]}`
      }`}
      onClick={() => !isReadOnly && onToggle()}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20' : 'bg-muted'}`}>
            <IconComponent className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{audience.label[language]}</span>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{audience.description[language]}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-[10px]">
                {audience.category === 'internal' ? t({ en: 'Internal', ar: 'داخلي' }) : t({ en: 'External', ar: 'خارجي' })}
              </Badge>
              <Badge variant="outline" className={`text-[10px] capitalize ${
                audience.priority === 'critical' ? 'border-red-500 text-red-500' :
                audience.priority === 'high' ? 'border-orange-500 text-orange-500' : ''
              }`}>
                {audience.priority}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Message Card Component
function MessageCard({ message, index, onUpdate, onRemove, language, t, strategicPlanId, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageType = MESSAGE_TYPES.find(mt => mt.value === message.type) || MESSAGE_TYPES[0];
  const TypeIcon = messageType.icon;
  const completeness = calculateMessageCompleteness(message);

  const getFieldClass = (value) => value ? 'border-emerald-500/50 bg-emerald-500/5' : '';

  return (
    <Card className={`overflow-hidden ${completeness === 100 ? 'border-emerald-500/30' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-1.5 rounded ${messageType.color}`}>
                  <TypeIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">
                    {message.text_en || message.text_ar || t({ en: 'New Message', ar: 'رسالة جديدة' })}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
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
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <Progress value={completeness} className="w-16 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8">{completeness}%</span>
                </div>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
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
              <Select value={message.type || 'announcement'} onValueChange={(v) => onUpdate('type', v)} disabled={isReadOnly}>
                <SelectTrigger className={getFieldClass(message.type)}>
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
                  className={getFieldClass(message.text_en)}
                  disabled={isReadOnly}
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
                  className={getFieldClass(message.text_ar)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Target & Channel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
                <Select value={message.audience || ''} onValueChange={(v) => onUpdate('audience', v)} disabled={isReadOnly}>
                  <SelectTrigger className={getFieldClass(message.audience)}>
                    <SelectValue placeholder={t({ en: 'Select audience', ar: 'اختر الجمهور' })} />
                  </SelectTrigger>
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
                <Select value={message.channel || ''} onValueChange={(v) => onUpdate('channel', v)} disabled={isReadOnly}>
                  <SelectTrigger className={getFieldClass(message.channel)}>
                    <SelectValue placeholder={t({ en: 'Select channel', ar: 'اختر القناة' })} />
                  </SelectTrigger>
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
            {!isReadOnly && strategicPlanId && (
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
                  placeholder={t({ en: 'Select entities...', ar: 'اختر الكيانات...' })}
                />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Channel Card Component
function ChannelCard({ channel, index, type, onUpdate, onRemove, language, t, isReadOnly }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const channelType = CHANNEL_TYPES.find(ct => ct.value === channel.type) || CHANNEL_TYPES[0];
  const ChannelIcon = channelType.icon;
  const completeness = calculateChannelCompleteness(channel);

  const getFieldClass = (value) => value ? 'border-emerald-500/50 bg-emerald-500/5' : '';

  return (
    <Card className={`overflow-hidden ${completeness === 100 ? 'border-emerald-500/30' : ''}`}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-lg bg-muted">
                  <ChannelIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {channel.name_en || channel.name_ar || t({ en: 'New Channel', ar: 'قناة جديدة' })}
                  </p>
                  <div className="flex gap-2 mt-1 flex-wrap">
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
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <Progress value={completeness} className="w-16 h-1.5" />
                  <span className="text-xs text-muted-foreground w-8">{completeness}%</span>
                </div>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
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
                  className={getFieldClass(channel.name_en)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label className="text-xs">{t({ en: 'Channel Name (AR)', ar: 'اسم القناة (عربي)' })}</Label>
                <Input
                  dir="rtl"
                  value={channel.name_ar || ''}
                  onChange={(e) => onUpdate('name_ar', e.target.value)}
                  placeholder="مثال: النشرة الإخبارية للوزارة"
                  className={getFieldClass(channel.name_ar)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Type, Frequency, Owner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">{t({ en: 'Type', ar: 'النوع' })}</Label>
                <Select value={channel.type || 'email'} onValueChange={(v) => onUpdate('type', v)} disabled={isReadOnly}>
                  <SelectTrigger className={getFieldClass(channel.type)}>
                    <SelectValue />
                  </SelectTrigger>
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
                <Select value={channel.frequency || 'weekly'} onValueChange={(v) => onUpdate('frequency', v)} disabled={isReadOnly}>
                  <SelectTrigger className={getFieldClass(channel.frequency)}>
                    <SelectValue />
                  </SelectTrigger>
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
                  className={getFieldClass(channel.owner)}
                  disabled={isReadOnly}
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
                  className={getFieldClass(channel.purpose_en)}
                  disabled={isReadOnly}
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
                  className={getFieldClass(channel.purpose_ar)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {type === 'external' && (
              <div>
                <Label className="text-xs">{t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}</Label>
                <Input
                  value={channel.audience || ''}
                  onChange={(e) => onUpdate('audience', e.target.value)}
                  placeholder={t({ en: 'e.g., Citizens, Media', ar: 'مثال: المواطنون، الإعلام' })}
                  className={getFieldClass(channel.audience)}
                  disabled={isReadOnly}
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

  if (channelsByCategory.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
        {t({ en: 'No channels defined yet', ar: 'لم يتم تحديد قنوات بعد' })}
      </div>
    );
  }

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
                          {FREQUENCY_OPTIONS.find(f => f.value === channel.frequency)?.label[language] || channel.frequency || '-'}
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
    </div>
  );
}

// Summary View
function SummaryView({ communicationPlan, language, t }) {
  const targetAudiences = communicationPlan.target_audiences || [];
  const keyMessages = communicationPlan.key_messages || [];
  const internalChannels = communicationPlan.internal_channels || [];
  const externalChannels = communicationPlan.external_channels || [];
  const { score } = calculateCompleteness(communicationPlan);

  // Audience distribution
  const internalAudiences = targetAudiences.filter(a => AUDIENCE_TYPES.find(at => at.id === a)?.category === 'internal');
  const externalAudiences = targetAudiences.filter(a => AUDIENCE_TYPES.find(at => at.id === a)?.category === 'external');
  
  // Message distribution by type
  const messagesByType = MESSAGE_TYPES.map(mt => ({
    type: mt,
    count: keyMessages.filter(m => m.type === mt.value).length
  })).filter(m => m.count > 0);

  // Channel distribution by category
  const allChannels = [...internalChannels, ...externalChannels];
  const channelCategories = ['digital', 'traditional', 'in-person', 'internal'];
  const channelsByCategory = channelCategories.map(cat => ({
    category: cat,
    count: allChannels.filter(c => CHANNEL_TYPES.find(ct => ct.value === c.type)?.category === cat).length
  })).filter(c => c.count > 0);

  // Recommendations
  const recommendations = [];
  if (targetAudiences.length < 3) recommendations.push({ en: 'Add more target audiences (minimum 3 recommended)', ar: 'أضف المزيد من الجمهور المستهدف (يوصى بـ 3 على الأقل)' });
  if (!communicationPlan.master_narrative_en && !communicationPlan.master_narrative_ar) recommendations.push({ en: 'Define a master narrative', ar: 'حدد السرد الأساسي' });
  if (keyMessages.length === 0) recommendations.push({ en: 'Add key messages for your audiences', ar: 'أضف رسائل رئيسية لجمهورك' });
  if (internalChannels.length === 0) recommendations.push({ en: 'Define internal communication channels', ar: 'حدد قنوات التواصل الداخلية' });
  if (externalChannels.length === 0) recommendations.push({ en: 'Define external communication channels', ar: 'حدد قنوات التواصل الخارجية' });
  if (keyMessages.some(m => !m.audience)) recommendations.push({ en: 'Assign audiences to all key messages', ar: 'حدد الجمهور لجميع الرسائل الرئيسية' });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audience Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t({ en: 'Audience Distribution', ar: 'توزيع الجمهور' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t({ en: 'Internal', ar: 'داخلي' })}</span>
                <Badge variant="secondary">{internalAudiences.length}</Badge>
              </div>
              <Progress value={targetAudiences.length > 0 ? (internalAudiences.length / targetAudiences.length) * 100 : 0} className="h-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm">{t({ en: 'External', ar: 'خارجي' })}</span>
                <Badge variant="secondary">{externalAudiences.length}</Badge>
              </div>
              <Progress value={targetAudiences.length > 0 ? (externalAudiences.length / targetAudiences.length) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Message Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {t({ en: 'Message Types', ar: 'أنواع الرسائل' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.length > 0 ? (
              <div className="space-y-2">
                {messagesByType.map((m, idx) => {
                  const Icon = m.type.icon;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${m.type.color}`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{m.type.label[language]}</span>
                      </div>
                      <Badge variant="outline">{m.count}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No messages yet', ar: 'لا توجد رسائل بعد' })}</p>
            )}
          </CardContent>
        </Card>

        {/* Channel Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Radio className="w-4 h-4" />
              {t({ en: 'Channel Categories', ar: 'فئات القنوات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channelsByCategory.length > 0 ? (
              <div className="space-y-2">
                {channelsByCategory.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{c.category.replace('-', ' ')}</span>
                    <Badge variant="outline">{c.count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t({ en: 'No channels yet', ar: 'لا توجد قنوات بعد' })}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Quality */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t({ en: 'Data Quality', ar: 'جودة البيانات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{keyMessages.filter(m => m.text_en && m.text_ar).length}/{keyMessages.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Bilingual Messages', ar: 'رسائل ثنائية اللغة' })}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{keyMessages.filter(m => m.audience && m.channel).length}/{keyMessages.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Targeted Messages', ar: 'رسائل مستهدفة' })}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{allChannels.filter(c => c.owner).length}/{allChannels.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Channels with Owner', ar: 'قنوات بمسؤول' })}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{allChannels.filter(c => c.purpose_en || c.purpose_ar).length}/{allChannels.length}</p>
              <p className="text-xs text-muted-foreground">{t({ en: 'Channels with Purpose', ar: 'قنوات بغرض' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <RecommendationsCard
        title={t({ en: 'Recommendations', ar: 'التوصيات' })}
        recommendations={[
          ...recommendations.map(rec => ({ type: 'info', message: rec })),
          ...(score >= 80 ? [{ type: 'success', message: { en: 'Communication plan is well-documented.', ar: 'خطة التواصل موثقة جيداً.' } }] : [])
        ]}
        language={language}
      />
    </div>
  );
}

// Step 16: Communication Plan
export function Step16Communication({ data, onChange, onGenerateAI, isGenerating, strategicPlanId, isReadOnly = false }) {
  const { language, t, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('audiences');
  const [viewMode, setViewMode] = useState('cards');
  
  const communicationPlan = data.communication_plan || {};
  const targetAudiences = communicationPlan.target_audiences || [];
  const keyMessages = communicationPlan.key_messages || [];
  const internalChannels = communicationPlan.internal_channels || [];
  const externalChannels = communicationPlan.external_channels || [];

  const updatePlan = (updates) => {
    if (isReadOnly) return;
    onChange({
      communication_plan: {
        ...communicationPlan,
        ...updates
      }
    });
  };

  const toggleAudience = (audienceId) => {
    if (isReadOnly) return;
    const updated = targetAudiences.includes(audienceId)
      ? targetAudiences.filter(a => a !== audienceId)
      : [...targetAudiences, audienceId];
    updatePlan({ target_audiences: updated });
  };

  const addKeyMessage = () => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    const updated = keyMessages.map((m, i) => (i === index ? { ...m, [field]: value } : m));
    updatePlan({ key_messages: updated });
  };

  const removeKeyMessage = (index) => {
    if (isReadOnly) return;
    updatePlan({ key_messages: keyMessages.filter((_, i) => i !== index) });
  };

  const addChannel = (type) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    const channels = type === 'internal' ? internalChannels : externalChannels;
    const updated = channels.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    updatePlan({ 
      [type === 'internal' ? 'internal_channels' : 'external_channels']: updated
    });
  };

  const removeChannel = (type, index) => {
    if (isReadOnly) return;
    const channels = type === 'internal' ? internalChannels : externalChannels;
    updatePlan({ 
      [type === 'internal' ? 'internal_channels' : 'external_channels']: channels.filter((_, i) => i !== index)
    });
  };

  // Alerts
  const alerts = [];
  if (targetAudiences.length === 0) alerts.push({ type: 'warning', message: { en: 'No target audiences selected', ar: 'لم يتم تحديد جمهور مستهدف' } });
  if (keyMessages.length === 0) alerts.push({ type: 'info', message: { en: 'Add key messages to communicate with your audiences', ar: 'أضف رسائل رئيسية للتواصل مع جمهورك' } });
  if (internalChannels.length === 0 && externalChannels.length === 0) alerts.push({ type: 'warning', message: { en: 'No communication channels defined', ar: 'لم يتم تحديد قنوات تواصل' } });

  const getFieldClass = (value) => value ? 'border-emerald-500/50 bg-emerald-500/5' : '';

  // Calculate stats for dashboard
  const { score: completenessScore } = calculateCompleteness(communicationPlan);
  const totalChannels = internalChannels.length + externalChannels.length;
  const internalAudiencesCount = targetAudiences.filter(a => AUDIENCE_TYPES.find(at => at.id === a)?.category === 'internal').length;
  const externalAudiencesCount = targetAudiences.filter(a => AUDIENCE_TYPES.find(at => at.id === a)?.category === 'external').length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dashboard Header */}
      <StepDashboardHeader
        score={completenessScore}
        title={t({ en: 'Communication Plan', ar: 'خطة التواصل' })}
        subtitle={t({ en: 'Define your communication strategy, audiences, and channels', ar: 'حدد استراتيجية التواصل والجمهور والقنوات' })}
        language={language}
        stats={[
          { icon: Users, value: targetAudiences.length, label: t({ en: 'Audiences', ar: 'الجمهور' }), subValue: `${internalAudiencesCount}/${externalAudiencesCount}` },
          { icon: MessageSquare, value: keyMessages.length, label: t({ en: 'Messages', ar: 'الرسائل' }) },
          { icon: Mail, value: internalChannels.length, label: t({ en: 'Internal', ar: 'داخلي' }) },
          { icon: Globe, value: externalChannels.length, label: t({ en: 'External', ar: 'خارجي' }) },
          { icon: Radio, value: totalChannels, label: t({ en: 'Channels', ar: 'القنوات' }) },
        ]}
        metrics={[
          { label: t({ en: 'Audiences', ar: 'الجمهور' }), value: Math.min(targetAudiences.length * 20, 100) },
          { label: t({ en: 'Messages', ar: 'الرسائل' }), value: Math.min(keyMessages.length * 25, 100) },
          { label: t({ en: 'Channels', ar: 'القنوات' }), value: Math.min(totalChannels * 15, 100) },
        ]}
      />

      {/* AI Generation Card */}
      {!isReadOnly && (
        <MainAIGeneratorCard
          title={{ en: 'AI-Powered Communication Plan', ar: 'خطة الاتصال بالذكاء الاصطناعي' }}
          description={{ en: 'Generate audiences, channels, and messaging strategies', ar: 'إنشاء الجماهير والقنوات واستراتيجيات الرسائل' }}
          onGenerate={onGenerateAI}
          isGenerating={isGenerating}
          generateLabel={{ en: 'Generate with AI', ar: 'إنشاء بالذكاء الاصطناعي' }}
        />
      )}

      {/* Alerts */}
      {alerts.length > 0 && !isReadOnly && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.type === 'warning' ? 'destructive' : 'default'} className={alert.type === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : ''}>
              {alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
              <AlertDescription>{alert.message[language]}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

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
                className={getFieldClass(communicationPlan.master_narrative_en)}
                disabled={isReadOnly}
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
                className={getFieldClass(communicationPlan.master_narrative_ar)}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle & Tabs */}
      <div className="flex items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="audiences" className="gap-1 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Audiences', ar: 'الجمهور' })}</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">{targetAudiences.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Messages', ar: 'الرسائل' })}</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">{keyMessages.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="internal" className="gap-1 text-xs sm:text-sm">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Internal', ar: 'داخلي' })}</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">{internalChannels.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="external" className="gap-1 text-xs sm:text-sm">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'External', ar: 'خارجي' })}</span>
              <Badge variant="secondary" className="ml-1 text-[10px]">{externalChannels.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-1 text-xs sm:text-sm">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ en: 'Summary', ar: 'ملخص' })}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {(activeTab === 'internal' || activeTab === 'external') && (
          <div className="flex gap-1">
            <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'matrix' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('matrix')}>
              <Table2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Tab Content */}
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
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define key messages for different audiences and channels', ar: 'حدد الرسائل الرئيسية لمختلف الجماهير والقنوات' })}
            </p>
            {!isReadOnly && (
              <Button variant="outline" size="sm" onClick={addKeyMessage}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Message', ar: 'إضافة رسالة' })}
              </Button>
            )}
          </div>
          
          {keyMessages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t({ en: 'No key messages added', ar: 'لم تتم إضافة رسائل' })}</p>
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
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'internal' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define internal communication channels', ar: 'حدد قنوات التواصل الداخلية' })}
            </p>
            {!isReadOnly && (
              <Button variant="outline" size="sm" onClick={() => addChannel('internal')}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
              </Button>
            )}
          </div>
          
          {viewMode === 'matrix' ? (
            <ChannelMatrixView internalChannels={internalChannels} externalChannels={[]} language={language} t={t} />
          ) : (
            internalChannels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No internal channels defined', ar: 'لم يتم تحديد قنوات داخلية' })}</p>
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
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {activeTab === 'external' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Define external communication channels', ar: 'حدد قنوات التواصل الخارجية' })}
            </p>
            {!isReadOnly && (
              <Button variant="outline" size="sm" onClick={() => addChannel('external')}>
                <Plus className="w-4 h-4 mr-1" />{t({ en: 'Add Channel', ar: 'إضافة قناة' })}
              </Button>
            )}
          </div>
          
          {viewMode === 'matrix' ? (
            <ChannelMatrixView internalChannels={[]} externalChannels={externalChannels} language={language} t={t} />
          ) : (
            externalChannels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t({ en: 'No external channels defined', ar: 'لم يتم تحديد قنوات خارجية' })}</p>
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
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <SummaryView communicationPlan={communicationPlan} language={language} t={t} />
      )}
    </div>
  );
}

export default Step16Communication;
