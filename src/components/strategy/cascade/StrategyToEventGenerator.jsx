import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CalendarDays, Loader2, CheckCircle2, Plus, Users, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function StrategyToEventGenerator({ onEventCreated }) {
  const { t, isRTL } = useLanguage();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [eventType, setEventType] = useState('workshop');
  const [targetAudience, setTargetAudience] = useState([]);
  const [generatedEvents, setGeneratedEvents] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const eventTypes = [
    { value: 'conference', label: { en: 'Conference', ar: 'مؤتمر' } },
    { value: 'workshop', label: { en: 'Workshop', ar: 'ورشة عمل' } },
    { value: 'hackathon', label: { en: 'Hackathon', ar: 'هاكاثون' } },
    { value: 'exhibition', label: { en: 'Exhibition', ar: 'معرض' } },
    { value: 'webinar', label: { en: 'Webinar', ar: 'ندوة عبر الإنترنت' } },
    { value: 'networking', label: { en: 'Networking Event', ar: 'فعالية تواصل' } }
  ];

  const audienceOptions = [
    { value: 'municipalities', label: { en: 'Municipalities', ar: 'البلديات' } },
    { value: 'startups', label: { en: 'Startups', ar: 'الشركات الناشئة' } },
    { value: 'researchers', label: { en: 'Researchers', ar: 'الباحثون' } },
    { value: 'investors', label: { en: 'Investors', ar: 'المستثمرون' } },
    { value: 'citizens', label: { en: 'Citizens', ar: 'المواطنون' } },
    { value: 'government', label: { en: 'Government', ar: 'الحكومة' } }
  ];

  const { data: strategicPlans } = useQuery({
    queryKey: ['strategic-plans-for-event-gen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_plans')
        .select('id, name_en, name_ar, objectives')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const handleAudienceToggle = (audience) => {
    setTargetAudience(prev => 
      prev.includes(audience) 
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const handleGenerate = async () => {
    if (!selectedPlanId) {
      toast.error(t({ en: 'Please select a strategic plan', ar: 'الرجاء اختيار خطة استراتيجية' }));
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('strategy-event-planner', {
        body: {
          strategic_plan_id: selectedPlanId,
          event_type: eventType,
          target_audience: targetAudience
        }
      });

      if (error) throw error;
      setGeneratedEvents(data?.events || []);
      toast.success(t({ en: 'Event concepts generated', ar: 'تم إنشاء مفاهيم الفعاليات' }));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t({ en: 'Failed to generate events', ar: 'فشل في إنشاء الفعاليات' }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEvent = async (event, index) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title_en: event.title_en,
          title_ar: event.title_ar,
          description_en: event.description_en,
          description_ar: event.description_ar,
          event_type: eventType,
          target_audience: targetAudience,
          strategic_plan_ids: [selectedPlanId],
          is_strategy_derived: true,
          strategy_derivation_date: new Date().toISOString(),
          status: 'planning',
          estimated_attendees: event.estimated_attendees,
          suggested_agenda: event.agenda
        })
        .select()
        .single();

      if (error) throw error;

      const updated = [...generatedEvents];
      updated[index] = { ...updated[index], saved: true, savedId: data.id };
      setGeneratedEvents(updated);
      
      toast.success(t({ en: 'Event saved successfully', ar: 'تم حفظ الفعالية بنجاح' }));
      onEventCreated?.(data);
    } catch (error) {
      console.error('Save error:', error);
      toast.error(t({ en: 'Failed to save event', ar: 'فشل في حفظ الفعالية' }));
    }
  };

  const selectedEventType = eventTypes.find(e => e.value === eventType);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            {t({ en: 'Strategic Event Planner', ar: 'مخطط الفعاليات الاستراتيجية' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              en: 'Generate event concepts aligned with strategic objectives',
              ar: 'إنشاء مفاهيم فعاليات متوافقة مع الأهداف الاستراتيجية'
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Strategic Plan', ar: 'الخطة الاستراتيجية' })}
              </label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder={t({ en: 'Select a plan', ar: 'اختر خطة' })} />
                </SelectTrigger>
                <SelectContent>
                  {strategicPlans?.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {isRTL ? plan.name_ar : plan.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t({ en: 'Event Type', ar: 'نوع الفعالية' })}
              </label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {isRTL ? type.label.ar : type.label.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">
              {t({ en: 'Target Audience', ar: 'الجمهور المستهدف' })}
            </label>
            <div className="flex flex-wrap gap-4">
              {audienceOptions.map(option => (
                <div key={option.value} className="flex items-center gap-2">
                  <Checkbox
                    id={`audience-${option.value}`}
                    checked={targetAudience.includes(option.value)}
                    onCheckedChange={() => handleAudienceToggle(option.value)}
                  />
                  <label htmlFor={`audience-${option.value}`} className="text-sm cursor-pointer">
                    {isRTL ? option.label.ar : option.label.en}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || !selectedPlanId} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t({ en: 'Generating...', ar: 'جاري الإنشاء...' })}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t({ en: 'Generate Event Concepts', ar: 'إنشاء مفاهيم الفعاليات' })}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {t({ en: 'Generated Events', ar: 'الفعاليات المُنشأة' })}
            <Badge variant="secondary">{generatedEvents.length}</Badge>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedEvents.map((event, idx) => (
              <Card key={idx} className={event.saved ? 'border-green-500/50 bg-green-50/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {isRTL ? event.title_ar : event.title_en}
                        </CardTitle>
                        <Badge variant="outline">
                          {isRTL ? selectedEventType?.label.ar : selectedEventType?.label.en}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1">
                        {isRTL ? event.description_ar : event.description_en}
                      </CardDescription>
                    </div>
                    {event.saved ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <Button size="sm" onClick={() => handleSaveEvent(event, idx)}>
                        <Plus className="h-3 w-3 mr-1" />
                        {t({ en: 'Save', ar: 'حفظ' })}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    {event.estimated_attendees && (
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.estimated_attendees} {t({ en: 'attendees', ar: 'حاضر' })}
                      </span>
                    )}
                    {event.suggested_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.suggested_location}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
