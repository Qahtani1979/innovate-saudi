import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/lib/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { usePrograms } from '@/hooks/usePrograms';
import { useMunicipalities } from '@/hooks/useMunicipalities';
import { EVENT_TYPES } from '@/components/events/EventFilters';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import MediaFieldWithPicker from '@/components/media/MediaFieldWithPicker';
import { AIConflictDetector } from '@/components/ai/AIConflictDetector';
import { AIEventOptimizer } from '@/components/ai/AIEventOptimizer';
import StrategicPlanSelector from '@/components/strategy/StrategicPlanSelector';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Clock,
  ArrowLeft,
  Save,
  Send,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

function EventCreate() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { userProfile, municipalityId } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('program_id');

  const { createEvent, isCreating } = useEvents();

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    description_en: '',
    description_ar: '',
    event_type: 'workshop',
    start_date: '',
    end_date: '',
    location: '',
    location_ar: '',
    is_virtual: false,
    virtual_link: '',
    max_participants: '',
    registration_deadline: '',
    image_url: '',
    status: 'draft',
    is_published: false,
    program_id: programId || '',
    municipality_id: municipalityId || '',
    strategic_plan_ids: [],
    strategic_objective_ids: []
  });


  // ... inside component

  const { data: programs = [] } = usePrograms({ status: 'active' });
  const { data: municipalities = [] } = useMunicipalities({ includeInactive: false });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (publish = false) => {
    if (!formData.title_en) {
      toast.error(t({ en: 'Title is required', ar: 'العنوان مطلوب' }));
      return;
    }
    if (!formData.start_date) {
      toast.error(t({ en: 'Start date is required', ar: 'تاريخ البداية مطلوب' }));
      return;
    }

    try {
      const eventData = {
        ...formData,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_published: publish
        // Note: status is determined by useEvents hook - 'pending' if publishing (requires approval), 'draft' otherwise
      };

      const result = await createEvent(eventData);

      if (publish) {
        toast.success(t({
          en: 'Event submitted for approval! It will be visible once approved.',
          ar: 'تم إرسال الفعالية للموافقة! ستكون مرئية بعد الموافقة.'
        }));
      } else {
        toast.success(t({
          en: 'Event saved as draft',
          ar: 'تم حفظ الفعالية كمسودة'
        }));
      }

      navigate(createPageUrl('EventDetail') + `?id=${result.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(t({ en: 'Failed to create event', ar: 'فشل إنشاء الفعالية' }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t({ en: 'Create Event', ar: 'إنشاء فعالية' })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t({ en: 'Create a new event for your organization', ar: 'إنشاء فعالية جديدة لمنظمتك' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={isCreating}>
            <Save className="h-4 w-4 mr-2" />
            {t({ en: 'Save Draft', ar: 'حفظ كمسودة' })}
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Submit for Approval', ar: 'إرسال للموافقة' })}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="basic">
            {t({ en: 'Basic Info', ar: 'المعلومات الأساسية' })}
          </TabsTrigger>
          <TabsTrigger value="schedule">
            {t({ en: 'Schedule', ar: 'الجدول' })}
          </TabsTrigger>
          <TabsTrigger value="location">
            {t({ en: 'Location', ar: 'الموقع' })}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {t({ en: 'Settings', ar: 'الإعدادات' })}
          </TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {t({ en: 'Event Details', ar: 'تفاصيل الفعالية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })} *</Label>
                  <Input
                    value={formData.title_en}
                    onChange={(e) => handleChange('title_en', e.target.value)}
                    placeholder={t({ en: 'Enter event title...', ar: 'أدخل عنوان الفعالية...' })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={(e) => handleChange('title_ar', e.target.value)}
                    placeholder={t({ en: 'Enter Arabic title...', ar: 'أدخل العنوان بالعربية...' })}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Event Type', ar: 'نوع الفعالية' })}</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleChange('event_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(type.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => handleChange('description_en', e.target.value)}
                    placeholder={t({ en: 'Describe your event...', ar: 'صف فعاليتك...' })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => handleChange('description_ar', e.target.value)}
                    placeholder={t({ en: 'Describe in Arabic...', ar: 'صف بالعربية...' })}
                    rows={4}
                    dir="rtl"
                  />
                </div>
              </div>

              <MediaFieldWithPicker
                label={t({ en: 'Cover Image', ar: 'صورة الغلاف' })}
                value={formData.image_url}
                onChange={(url) => handleChange('image_url', url)}
                fieldName="image_url"
                entityType="events"
                mediaType="image"
                bucket="events"
                placeholder={t({ en: 'Image URL...', ar: 'رابط الصورة...' })}
              />

              {/* AI Event Optimizer */}
              <AIEventOptimizer
                eventData={formData}
                compact={true}
                onApplySuggestion={(field, value) => {
                  if (field === 'description_en') {
                    handleChange('description_en', value);
                    toast.success(t({ en: 'Applied enhanced description', ar: 'تم تطبيق الوصف المحسن' }));
                  } else if (field === 'suggested_tags') {
                    toast.info(t({ en: 'Tags suggestion applied', ar: 'تم تطبيق اقتراح الوسوم' }));
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t({ en: 'Schedule & Timing', ar: 'الجدول والتوقيت' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ en: 'Start Date & Time', ar: 'تاريخ ووقت البداية' })} *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ en: 'End Date & Time', ar: 'تاريخ ووقت النهاية' })}</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Registration Deadline', ar: 'آخر موعد للتسجيل' })}</Label>
                <Input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => handleChange('registration_deadline', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t({ en: 'Leave empty for no deadline', ar: 'اتركه فارغاً لعدم وجود موعد نهائي' })}
                </p>
              </div>

              {/* AI Conflict Detector */}
              {formData.start_date && (
                <AIConflictDetector
                  proposedDate={formData.start_date?.split('T')[0]}
                  proposedTime={formData.start_date?.split('T')[1] || '10:00'}
                  onConflictsFound={(conflicts) => {
                    if (conflicts.length > 0) {
                      toast.warning(t({
                        en: `${conflicts.length} potential conflicts detected`,
                        ar: `تم اكتشاف ${conflicts.length} تعارضات محتملة`
                      }));
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location */}
        <TabsContent value="location">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {t({ en: 'Event Location', ar: 'موقع الفعالية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t({ en: 'Virtual Event', ar: 'فعالية افتراضية' })}</p>
                    <p className="text-sm text-muted-foreground">
                      {t({ en: 'Event will be held online', ar: 'ستعقد الفعالية عبر الإنترنت' })}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_virtual}
                  onCheckedChange={(v) => handleChange('is_virtual', v)}
                />
              </div>

              {formData.is_virtual ? (
                <div className="space-y-2">
                  <Label>{t({ en: 'Virtual Meeting Link', ar: 'رابط الاجتماع الافتراضي' })}</Label>
                  <Input
                    value={formData.virtual_link}
                    onChange={(e) => handleChange('virtual_link', e.target.value)}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ en: 'Location (English)', ar: 'الموقع (إنجليزي)' })}</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder={t({ en: 'Enter venue address...', ar: 'أدخل عنوان المكان...' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ en: 'Location (Arabic)', ar: 'الموقع (عربي)' })}</Label>
                    <Input
                      value={formData.location_ar}
                      onChange={(e) => handleChange('location_ar', e.target.value)}
                      placeholder={t({ en: 'Enter Arabic address...', ar: 'أدخل العنوان بالعربية...' })}
                      dir="rtl"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {t({ en: 'Registration & Settings', ar: 'التسجيل والإعدادات' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t({ en: 'Maximum Participants', ar: 'الحد الأقصى للمشاركين' })}</Label>
                <Input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => handleChange('max_participants', e.target.value)}
                  placeholder={t({ en: 'Leave empty for unlimited', ar: 'اتركه فارغاً لعدد غير محدود' })}
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Link to Program', ar: 'ربط بالبرنامج' })}</Label>
                <Select value={formData.program_id || 'none'} onValueChange={(v) => handleChange('program_id', v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select program (optional)', ar: 'اختر البرنامج (اختياري)' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t({ en: 'No program', ar: 'بدون برنامج' })}</SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {language === 'ar' ? (p.name_ar || p.name_en) : (p.name_en || p.name_ar)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t({ en: 'Municipality', ar: 'البلدية' })}</Label>
                <Select value={formData.municipality_id || 'none'} onValueChange={(v) => handleChange('municipality_id', v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ en: 'Select municipality (optional)', ar: 'اختر البلدية (اختياري)' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t({ en: 'National (all)', ar: 'وطني (الجميع)' })}</SelectItem>
                    {municipalities.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {language === 'ar' ? (m.name_ar || m.name_en) : (m.name_en || m.name_ar)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Strategic Alignment Section */}
              <div className="border-t pt-4 mt-4">
                <StrategicPlanSelector
                  selectedPlanIds={formData.strategic_plan_ids || []}
                  selectedObjectiveIds={formData.strategic_objective_ids || []}
                  onPlanChange={(ids) => handleChange('strategic_plan_ids', ids)}
                  onObjectiveChange={(ids) => handleChange('strategic_objective_ids', ids)}
                  showObjectives={true}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(EventCreate, {
  requiredPermissions: ['event_create'],
  requiredRoles: ['admin', 'super_admin', 'municipality_admin', 'gdibs_internal', 'event_manager'],
  requireAllPermissions: false
});
