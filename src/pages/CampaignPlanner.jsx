import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Megaphone, Plus, Calendar, Target, Sparkles, Users, Loader2, Edit2, Trash2, RefreshCw, CheckCircle2, Link as LinkIcon, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useEventSync } from '@/hooks/useEventSync';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useSectorsWithVisibility } from '@/hooks/useSectorsWithVisibility';
import { useStrategiesWithVisibility } from '@/hooks/useStrategiesWithVisibility';
import { useProgramMutations } from '@/hooks/useProgramMutations';

const INITIAL_CAMPAIGN_DATA = {
  program_type: 'campaign',
  name_en: '',
  name_ar: '',
  tagline_en: '',
  tagline_ar: '',
  description_en: '',
  description_ar: '',
  focus_areas: [],
  timeline: {},
  events: [],
  target_participants: {},
  objectives_en: '',
  objectives_ar: '',
  strategic_plan_id: null,
  duration_weeks: 0,
  budget_estimate: 0
};

/**
 * CampaignPlanner
 * ✅ GOLD STANDARD COMPLIANT
 */
function CampaignPlanner({ embedded = false }) {
  const { language, isRTL, t } = useLanguage();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [syncingEvents, setSyncingEvents] = useState(false);
  const [campaignData, setCampaignData] = useState(INITIAL_CAMPAIGN_DATA);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo, error } = useAIWithFallback();
  const { syncAllEvents, deleteEvent } = useEventSync();

  // Sync events to events table after campaign creation
  const syncEventsToTable = async (programId, events) => {
    if (!events || events.length === 0) return;

    setSyncingEvents(true);
    try {
      const results = await syncAllEvents.mutateAsync(events);
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        toast.success(t({ en: `${successCount} events synced to calendar`, ar: `تم مزامنة ${successCount} فعالية مع التقويم` }));
      }
    } catch (error) {
      console.error('Error syncing events:', error);
      toast.error(t({ en: 'Failed to sync events', ar: 'فشل في مزامنة الفعاليات' }));
    } finally {
      setSyncingEvents(false);
    }
  };

  // Manual sync for existing program
  const handleManualSync = async (program) => {
    if (!program?.id || !program?.events?.length) {
      toast.info(t({ en: 'No events to sync', ar: 'لا توجد فعاليات للمزامنة' }));
      return;
    }
    await syncEventsToTable(program.id, program.events);
  };

  const { createProgram, deleteProgram } = useProgramMutations();

  const { data: rawPrograms = [] } = useProgramsWithVisibility({ type: 'campaign' });
  const { data: rawChallenges = [] } = useChallengesWithVisibility();
  const { data: rawSectors = [] } = useSectorsWithVisibility();
  const { data: rawStrategicPlans = [] } = useStrategiesWithVisibility();

  // Safe list accessors for Union types (Array<T> | { data: Array<T>, totalCount: number })
  const programList = Array.isArray(rawPrograms) ? rawPrograms : (rawPrograms?.data || []);
  const challengeList = Array.isArray(rawChallenges) ? rawChallenges : (rawChallenges?.data || []);
  const sectorList = Array.isArray(rawSectors) ? rawSectors : (rawSectors?.data || []);
  const strategyList = Array.isArray(rawStrategicPlans) ? rawStrategicPlans : (rawStrategicPlans?.data || []);

  // Handle create
  const handleCreateCampaign = (data) => {
    createProgram.mutateAsync(data).then((createdProgram) => {
      // Sync events to events table after campaign creation
      if (campaignData.events?.length > 0 && createdProgram?.id) {
        syncEventsToTable(createdProgram.id, campaignData.events);
      }

      setWizardOpen(false);
      setCurrentStep(1);
      setCampaignData(INITIAL_CAMPAIGN_DATA);
    });
  };

  const generateAICampaign = async () => {
    const result = await invokeAI({
      prompt: `Design a municipal innovation campaign for Saudi Arabia based on current gaps and strategic priorities.

Active Challenges: ${challengeList.slice(0, 10).map(c => c.title_en).join(', ')}
Sectors: ${sectorList.map(s => s.name_en).join(', ')}
Strategic Themes: ${strategyList[0]?.strategic_themes?.map(t => t.name_en).join(', ') || 'Smart Cities, Sustainability, Quality of Life'}

Generate a comprehensive innovation campaign in BOTH English and Arabic:
1. Campaign name and tagline
2. Strategic objectives
3. Focus areas (3-5 sectors/themes)
4. Target participants (types and numbers)
5. Recommended events (3-5 events with dates)
6. Success metrics
7. Budget estimate`,
      response_json_schema: {
        type: 'object',
        properties: {
          name_en: { type: 'string' },
          name_ar: { type: 'string' },
          tagline_en: { type: 'string' },
          tagline_ar: { type: 'string' },
          description_en: { type: 'string' },
          description_ar: { type: 'string' },
          objectives_en: { type: 'string' },
          objectives_ar: { type: 'string' },
          focus_areas: { type: 'array', items: { type: 'string' } },
          events: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string' },
                date: { type: 'string' },
                location: { type: 'string' }
              }
            }
          },
          target_participants: {
            type: 'object',
            properties: {
              type: { type: 'array', items: { type: 'string' } },
              min_participants: { type: 'number' },
              max_participants: { type: 'number' }
            }
          },
          budget_estimate: { type: 'number' }
        }
      }
    }, {
      system_prompt: 'You are an expert campaign strategist for Saudi municipal innovation. Create detailed, culturally relevant campaign plans.'
    });

    if (result.success) {
      setCampaignData({ ...campaignData, ...result.data });
      toast.success(t({ en: 'AI campaign generated', ar: 'تم إنشاء الحملة بالذكاء' }));
    }
  };

  const handleSubmit = () => {
    handleCreateCampaign(campaignData);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header - Only show when not embedded */}
      {!embedded && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-pink-600 via-rose-600 to-orange-600 p-8 text-white">
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: '📣 Campaign Planner', ar: '📣 مخطط الحملات' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Design and manage innovation campaigns, events, and awareness initiatives', ar: 'تصميم وإدارة حملات الابتكار والفعاليات ومبادرات التوعية' })}
          </p>
          <div className="mt-4">
            <Badge variant="outline" className="bg-white/20 text-white border-white/40">
              {programList.length} {t({ en: 'active campaigns', ar: 'حملات نشطة' })}
            </Badge>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-6 text-center">
            <Megaphone className="h-10 w-10 text-pink-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-pink-600">{programList.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Campaigns', ar: 'إجمالي الحملات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {programList.filter(p => p.status === 'active').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {programList.reduce((sum, p) => sum + (p.accepted_count || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Participants', ar: 'المشاركين' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {programList.reduce((sum, p) => sum + (p.events?.length || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Events', ar: 'الفعاليات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Generator */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-purple-900 mb-1 text-lg">
                {t({ en: 'AI Campaign Designer', ar: 'مصمم الحملات الذكي' })}
              </p>
              <p className="text-sm text-slate-600">
                {t({ en: 'Generate complete campaign with events, themes, and targeting based on current gaps', ar: 'إنشاء حملة كاملة مع الفعاليات والمحاور والاستهداف بناءً على الفجوات الحالية' })}
              </p>
            </div>
            <Button onClick={generateAICampaign} disabled={aiLoading || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
              {aiLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {t({ en: 'Generate Campaign', ar: 'إنشاء حملة' })}
            </Button>
          </div>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} error={error} />
        </CardContent>
      </Card>

      {/* Create New Campaign Button */}
      {!wizardOpen && (
        <Button onClick={() => setWizardOpen(true)} className="w-full bg-gradient-to-r from-pink-600 to-orange-600">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Create New Campaign', ar: 'إنشاء حملة جديدة' })}
        </Button>
      )}

      {/* Campaign Wizard */}
      {wizardOpen && (
        <Card className="border-2 border-pink-300 bg-gradient-to-br from-pink-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-pink-600" />
                {t({ en: 'Campaign Creation Wizard', ar: 'معالج إنشاء الحملة' })}
              </CardTitle>
              <Badge className="bg-pink-600">{t({ en: `Step ${currentStep}/4`, ar: `خطوة ${currentStep}/4` })}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">{t({ en: 'Step 1: Campaign Details', ar: 'الخطوة 1: تفاصيل الحملة' })}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Campaign Name (English)', ar: 'اسم الحملة (إنجليزي)' })}</label>
                    <Input
                      value={campaignData.name_en}
                      onChange={(e) => setCampaignData({ ...campaignData, name_en: e.target.value })}
                      placeholder="e.g., Smart Cities Innovation Challenge 2025"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Campaign Name (Arabic)', ar: 'اسم الحملة (عربي)' })}</label>
                    <Input
                      value={campaignData.name_ar}
                      onChange={(e) => setCampaignData({ ...campaignData, name_ar: e.target.value })}
                      placeholder="مثال: تحدي المدن الذكية للابتكار 2025"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Tagline (English)', ar: 'الشعار (إنجليزي)' })}</label>
                    <Input
                      value={campaignData.tagline_en}
                      onChange={(e) => setCampaignData({ ...campaignData, tagline_en: e.target.value })}
                      placeholder="One-line campaign message"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Tagline (Arabic)', ar: 'الشعار (عربي)' })}</label>
                    <Input
                      value={campaignData.tagline_ar}
                      onChange={(e) => setCampaignData({ ...campaignData, tagline_ar: e.target.value })}
                      placeholder="رسالة الحملة في سطر واحد"
                      dir="rtl"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</label>
                    <Textarea
                      value={campaignData.description_en}
                      onChange={(e) => setCampaignData({ ...campaignData, description_en: e.target.value })}
                      rows={3}
                      placeholder="Campaign overview and purpose"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</label>
                    <Textarea
                      value={campaignData.description_ar}
                      onChange={(e) => setCampaignData({ ...campaignData, description_ar: e.target.value })}
                      rows={3}
                      placeholder="نظرة عامة وهدف الحملة"
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Themes & Focus */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">{t({ en: 'Step 2: Strategic Alignment', ar: 'الخطوة 2: المواءمة الاستراتيجية' })}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Focus Areas', ar: 'مجالات التركيز' })}</label>
                    <Select
                      onValueChange={(value) => {
                        if (!campaignData.focus_areas.includes(value)) {
                          setCampaignData({ ...campaignData, focus_areas: [...campaignData.focus_areas, value] });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select sectors...', ar: 'اختر القطاعات...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {sectorList.map(sector => (
                          <SelectItem key={sector.id} value={sector.name_en}>
                            {language === 'ar' ? sector.name_ar : sector.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {campaignData.focus_areas.map((area, idx) => (
                        <Badge key={idx} variant="outline" className="cursor-pointer" onClick={() => {
                          setCampaignData({ ...campaignData, focus_areas: campaignData.focus_areas.filter((_, i) => i !== idx) });
                        }}>
                          {area} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Strategic Plan Link', ar: 'ربط الخطة الاستراتيجية' })}</label>
                    <Select
                      onValueChange={(value) => setCampaignData({ ...campaignData, strategic_plan_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Link to strategic plan...', ar: 'ربط بخطة استراتيجية...' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {strategyList.map(plan => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {language === 'ar' ? plan.name_ar : plan.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Objectives (English)', ar: 'الأهداف (إنجليزي)' })}</label>
                    <Textarea
                      value={campaignData.objectives_en}
                      onChange={(e) => setCampaignData({ ...campaignData, objectives_en: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Objectives (Arabic)', ar: 'الأهداف (عربي)' })}</label>
                    <Textarea
                      value={campaignData.objectives_ar}
                      onChange={(e) => setCampaignData({ ...campaignData, objectives_ar: e.target.value })}
                      rows={3}
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Events & Timeline */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">{t({ en: 'Step 3: Events Schedule', ar: 'الخطوة 3: جدول الفعاليات' })}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Launch Date', ar: 'تاريخ الإطلاق' })}</label>
                      <Input
                        type="date"
                        value={campaignData.timeline?.announcement_date || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, timeline: { ...campaignData.timeline, announcement_date: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</label>
                      <Input
                        type="date"
                        value={campaignData.timeline?.program_start || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, timeline: { ...campaignData.timeline, program_start: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</label>
                      <Input
                        type="date"
                        value={campaignData.timeline?.program_end || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, timeline: { ...campaignData.timeline, program_end: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Duration (weeks)', ar: 'المدة (أسابيع)' })}</label>
                      <Input
                        type="number"
                        value={campaignData.duration_weeks || ''}
                        onChange={(e) => setCampaignData({ ...campaignData, duration_weeks: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900">{t({ en: 'Campaign Events', ar: 'فعاليات الحملة' })}</p>
                        {campaignData.events?.some(e => e.sync_id) && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t({ en: 'Synced', ar: 'مزامن' })}
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setCampaignData({
                          ...campaignData,
                          events: [...(campaignData.events || []), { name: '', type: 'workshop', date: '', location: '' }]
                        })}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Add Event', ar: 'إضافة فعالية' })}
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {campaignData.events?.map((event, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-3 p-3 bg-white rounded border relative">
                          {event.sync_id && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute -top-1 -right-1">
                                    <LinkIcon className="h-3 w-3 text-green-600" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t({ en: 'Synced to calendar', ar: 'مزامن مع التقويم' })}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Input
                            placeholder={t({ en: 'Event name', ar: 'اسم الفعالية' })}
                            value={event.name}
                            onChange={(e) => {
                              const newEvents = [...campaignData.events];
                              newEvents[idx].name = e.target.value;
                              setCampaignData({ ...campaignData, events: newEvents });
                            }}
                          />
                          <Select
                            value={event.type}
                            onValueChange={(value) => {
                              const newEvents = [...campaignData.events];
                              newEvents[idx].type = value;
                              setCampaignData({ ...campaignData, events: newEvents });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="workshop">Workshop</SelectItem>
                              <SelectItem value="hackathon">Hackathon</SelectItem>
                              <SelectItem value="demo_day">Demo Day</SelectItem>
                              <SelectItem value="webinar">Webinar</SelectItem>
                              <SelectItem value="networking">Networking</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={event.date}
                            onChange={(e) => {
                              const newEvents = [...campaignData.events];
                              newEvents[idx].date = e.target.value;
                              setCampaignData({ ...campaignData, events: newEvents });
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Location"
                              value={event.location}
                              onChange={(e) => {
                                const newEvents = [...campaignData.events];
                                newEvents[idx].location = e.target.value;
                                setCampaignData({ ...campaignData, events: newEvents });
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                // Delete synced event from events table
                                if (event.sync_id) {
                                  await deleteEvent.mutateAsync(event.sync_id);
                                }
                                setCampaignData({ ...campaignData, events: campaignData.events.filter((_, i) => i !== idx) });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Targeting & Budget */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-900">{t({ en: 'Step 4: Targeting & Budget', ar: 'الخطوة 4: الاستهداف والميزانية' })}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Min Participants', ar: 'الحد الأدنى للمشاركين' })}</label>
                    <Input
                      type="number"
                      value={campaignData.target_participants?.min_participants || ''}
                      onChange={(e) => setCampaignData({
                        ...campaignData,
                        target_participants: { ...campaignData.target_participants, min_participants: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Max Participants', ar: 'الحد الأقصى للمشاركين' })}</label>
                    <Input
                      type="number"
                      value={campaignData.target_participants?.max_participants || ''}
                      onChange={(e) => setCampaignData({
                        ...campaignData,
                        target_participants: { ...campaignData.target_participants, max_participants: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">{t({ en: 'Budget (SAR)', ar: 'الميزانية (ريال)' })}</label>
                    <Input
                      type="number"
                      value={campaignData.budget_estimate || ''}
                      onChange={(e) => setCampaignData({ ...campaignData, budget_estimate: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Summary */}
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">{t({ en: 'Campaign Summary', ar: 'ملخص الحملة' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-600">{t({ en: 'Name:', ar: 'الاسم:' })}</p>
                        <p className="font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? campaignData.name_ar : campaignData.name_en}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t({ en: 'Duration:', ar: 'المدة:' })}</p>
                        <p className="font-medium">{campaignData.duration_weeks || 0} weeks</p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t({ en: 'Focus Areas:', ar: 'المجالات:' })}</p>
                        <p className="font-medium">{campaignData.focus_areas?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t({ en: 'Events:', ar: 'الفعاليات:' })}</p>
                        <p className="font-medium">{campaignData.events?.length || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                {t({ en: 'Previous', ar: 'السابق' })}
              </Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep(currentStep + 1)} className="bg-pink-600">
                  {t({ en: 'Next', ar: 'التالي' })}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!campaignData.name_en || createProgram.isPending}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Create Campaign', ar: 'إنشاء الحملة' })}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active & Planned Campaigns', ar: 'الحملات النشطة والمخططة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          {programList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programList.map(campaign => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow border-2 border-pink-100">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {language === 'ar' ? campaign.name_ar : campaign.name_en}
                        </p>
                        {campaign.tagline_en && (
                          <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' ? campaign.tagline_ar : campaign.tagline_en}
                          </p>
                        )}
                      </div>
                      <Badge className={
                        campaign.status === 'active' ? 'bg-green-600' :
                          campaign.status === 'planning' ? 'bg-blue-600' :
                            'bg-slate-600'
                      }>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      {campaign.focus_areas?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tags className="h-3 w-3 text-slate-500" />
                          <span>{campaign.focus_areas.length} focus areas</span>
                        </div>
                      )}
                      {campaign.events?.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{campaign.events.length} events</span>
                        </div>
                      )}
                      {campaign.accepted_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-slate-500" />
                          <span>{campaign.accepted_count} participants</span>
                        </div>
                      )}
                      {campaign.timeline?.program_start && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>{campaign.timeline.program_start}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link to={createPageUrl(`ProgramDetail?id=${campaign.id}`)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        </Button>
                      </Link>
                      {campaign.events?.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManualSync(campaign)}
                                disabled={syncingEvents}
                              >
                                {syncingEvents ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-4 w-4 text-blue-600" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t({ en: 'Sync events to calendar', ar: 'مزامنة الفعاليات مع التقويم' })}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <Link to={createPageUrl(`ProgramEdit?id=${campaign.id}`)}>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(t({ en: 'Delete this campaign?', ar: 'حذف هذه الحملة؟' }))) {
                            deleteProgram.mutate(campaign.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">{t({ en: 'No campaigns yet', ar: 'لا توجد حملات بعد' })}</p>
              <Button onClick={() => setWizardOpen(true)} className="bg-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create First Campaign', ar: 'إنشاء أول حملة' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CampaignPlanner, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'Program Director', 'Communication Manager'] });