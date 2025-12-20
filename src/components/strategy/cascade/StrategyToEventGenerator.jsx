import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CalendarDays, Loader2, CheckCircle2, Plus, Users, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';

export default function StrategyToEventGenerator({ strategicPlanId, strategicPlan, onEventCreated }) {
  const { t, isRTL } = useLanguage();
  const { createApprovalRequest } = useApprovalRequest();
  const [eventType, setEventType] = useState('workshop');
  const [targetAudience, setTargetAudience] = useState([]);
  const [generatedEvents, setGeneratedEvents] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the passed strategicPlanId from context
  const selectedPlanId = strategicPlanId;

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

  const handleSaveEvent = async (event, index, submitForApproval = false) => {
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
          status: submitForApproval ? 'pending' : 'planning',
          estimated_attendees: event.estimated_attendees,
          suggested_agenda: event.agenda,
          is_deleted: false,
          is_published: false
        })
        .select()
        .single();

      if (error) throw error;

      // Create approval request if submitting (Phase 4 integration)
      if (submitForApproval) {
        await createApprovalRequest({
          entityType: 'event',
          entityId: data.id,
          entityTitle: event.title_en,
          isStrategyDerived: true,
          strategicPlanIds: [selectedPlanId],
          metadata: {
            event_type: eventType,
            target_audience: targetAudience,
            source: 'cascade_generator'
          }
        });
      }

      const updated = [...generatedEvents];
      updated[index] = { ...updated[index], saved: true, savedId: data.id, submitted: submitForApproval };
      setGeneratedEvents(updated);
      
      toast.success(t({ 
        en: submitForApproval ? 'Event saved and submitted for approval' : 'Event saved successfully', 
        ar: submitForApproval ? 'تم حفظ الفعالية وإرسالها للموافقة' : 'تم حفظ الفعالية بنجاح' 
      }));
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
                      <Badge variant="outline" className={event.submitted ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {event.submitted 
                          ? t({ en: 'Submitted', ar: 'مُرسل' })
                          : t({ en: 'Saved', ar: 'محفوظ' })}
                      </Badge>
                    ) : (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleSaveEvent(event, idx, false)}>
                          <Plus className="h-3 w-3 mr-1" />
                          {t({ en: 'Save', ar: 'حفظ' })}
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEvent(event, idx, true)}>
                          <Send className="h-3 w-3 mr-1" />
                          {t({ en: 'Save & Submit', ar: 'حفظ وإرسال' })}
                        </Button>
                      </div>
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
