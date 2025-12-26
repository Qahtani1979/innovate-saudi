import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '@/components/LanguageContext';
import { usePermissions } from '@/components/permissions/usePermissions';
import { useAuth } from '@/lib/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { usePrograms } from '@/hooks/usePrograms';
import { useMunicipalities } from '@/hooks/useMunicipalities';
import { EVENT_TYPES, EVENT_STATUSES } from '@/components/events/EventFilters';
import { EventCancelDialog, EventAttendeeList } from '@/components/events';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import MediaFieldWithPicker from '@/components/media/MediaFieldWithPicker';
import { useMediaIntegration } from '@/hooks/useMediaIntegration';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Clock,
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

function EventEdit() {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const { municipalityId, hasAnyPermission } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('id');

  const { updateEvent, cancelEvent, isUpdating, isCancelling, useEvent } = useEvents();
  const { data: event, isLoading } = useEvent(eventId);
  const { handleMediaSelect } = useMediaIntegration('events', eventId);

  const [activeTab, setActiveTab] = useState('basic');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [formData, setFormData] = useState(null);

  const canManage = hasAnyPermission(['event_manage', 'admin']) ||
    (event?.created_by === user?.email);

  // Initialize form when event loads
  useEffect(() => {
    if (event && !formData) {
      setFormData({
        title_en: event.title_en || '',
        title_ar: event.title_ar || '',
        description_en: event.description_en || '',
        description_ar: event.description_ar || '',
        event_type: event.event_type || 'workshop',
        start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
        end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
        location: event.location || '',
        location_ar: event.location_ar || '',
        is_virtual: event.is_virtual || false,
        virtual_link: event.virtual_link || '',
        max_participants: event.max_participants?.toString() || '',
        registration_deadline: event.registration_deadline ? new Date(event.registration_deadline).toISOString().slice(0, 16) : '',
        image_url: event.image_url || '',
        status: event.status || 'draft',
        is_published: event.is_published || false,
        program_id: event.program_id || '',
        municipality_id: event.municipality_id || ''
      });
    }
  }, [event, formData]);


  // ... inside component

  const { data: programs = [] } = usePrograms({ status: 'active' });
  const { data: municipalities = [] } = useMunicipalities({ includeInactive: false });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title_en) {
      toast.error(t({ en: 'Title is required', ar: 'العنوان مطلوب' }));
      return;
    }

    try {
      await updateEvent({
        eventId,
        updates: {
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null
        }
      });
      toast.success(t({ en: 'Event updated!', ar: 'تم تحديث الفعالية!' }));
      navigate(createPageUrl('EventDetail') + `?id=${eventId}`);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(t({ en: 'Failed to update event', ar: 'فشل تحديث الفعالية' }));
    }
  };

  const handleCancel = async (data) => {
    try {
      await cancelEvent({
        eventId,
        reason: data.reason,
        notifyRegistrants: data.notifyRegistrants
      });
      toast.success(t({ en: 'Event cancelled', ar: 'تم إلغاء الفعالية' }));
      setShowCancelDialog(false);
      navigate(createPageUrl('EventCalendar'));
    } catch (error) {
      console.error('Error cancelling event:', error);
      toast.error(t({ en: 'Failed to cancel event', ar: 'فشل إلغاء الفعالية' }));
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium">{t({ en: 'Event not found', ar: 'الفعالية غير موجودة' })}</p>
        <Button onClick={() => navigate(createPageUrl('EventCalendar'))}>
          {t({ en: 'Back to Events', ar: 'العودة للفعاليات' })}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {t({ en: 'Edit Event', ar: 'تعديل الفعالية' })}
              </h1>
              <Badge variant={event.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {event.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? (event.title_ar || event.title_en) : (event.title_en || event.title_ar)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {event.status !== 'cancelled' && (
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              onClick={() => setShowCancelDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t({ en: 'Cancel Event', ar: 'إلغاء الفعالية' })}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">
                {t({ en: 'Basic', ar: 'أساسي' })}
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
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })} *</Label>
                      <Input
                        value={formData.title_en}
                        onChange={(e) => handleChange('title_en', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}</Label>
                      <Input
                        value={formData.title_ar}
                        onChange={(e) => handleChange('title_ar', e.target.value)}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label>{t({ en: 'Status', ar: 'الحالة' })}</Label>
                      <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_STATUSES.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(status.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (English)', ar: 'الوصف (إنجليزي)' })}</Label>
                      <Textarea
                        value={formData.description_en}
                        onChange={(e) => handleChange('description_en', e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ en: 'Description (Arabic)', ar: 'الوصف (عربي)' })}</Label>
                      <Textarea
                        value={formData.description_ar}
                        onChange={(e) => handleChange('description_ar', e.target.value)}
                        rows={4}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <MediaFieldWithPicker
                    label={t({ en: 'Cover Image', ar: 'صورة الغلاف' })}
                    value={formData.image_url || ''}
                    onChange={(url) => handleChange('image_url', url)}
                    onMediaSelect={handleMediaSelect}
                    fieldName="image_url"
                    entityType="events"
                    entityId={eventId}
                    mediaType="image"
                    bucket="events"
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
                    {t({ en: 'Schedule', ar: 'الجدول' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location */}
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t({ en: 'Location', ar: 'الموقع' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{t({ en: 'Virtual Event', ar: 'فعالية افتراضية' })}</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.is_virtual}
                      onCheckedChange={(v) => handleChange('is_virtual', v)}
                    />
                  </div>

                  {formData.is_virtual ? (
                    <div className="space-y-2">
                      <Label>{t({ en: 'Virtual Meeting Link', ar: 'رابط الاجتماع' })}</Label>
                      <Input
                        value={formData.virtual_link}
                        onChange={(e) => handleChange('virtual_link', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t({ en: 'Location (English)', ar: 'الموقع (إنجليزي)' })}</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => handleChange('location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t({ en: 'Location (Arabic)', ar: 'الموقع (عربي)' })}</Label>
                        <Input
                          value={formData.location_ar}
                          onChange={(e) => handleChange('location_ar', e.target.value)}
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
                    {t({ en: 'Settings', ar: 'الإعدادات' })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{t({ en: 'Published', ar: 'منشور' })}</p>
                      <p className="text-sm text-muted-foreground">
                        {t({ en: 'Make this event visible to the public', ar: 'جعل الفعالية مرئية للجمهور' })}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(v) => handleChange('is_published', v)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Maximum Participants', ar: 'الحد الأقصى للمشاركين' })}</Label>
                    <Input
                      type="number"
                      value={formData.max_participants}
                      onChange={(e) => handleChange('max_participants', e.target.value)}
                      min={1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ en: 'Link to Program', ar: 'ربط بالبرنامج' })}</Label>
                    <Select value={formData.program_id || 'none'} onValueChange={(v) => handleChange('program_id', v === 'none' ? '' : v)}>
                      <SelectTrigger>
                        <SelectValue />
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Panel - Attendees */}
        <div className="lg:col-span-1">
          <EventAttendeeList eventId={eventId} canManage={canManage} />
        </div>
      </div>

      {/* Cancel Dialog */}
      <EventCancelDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        event={event}
        onConfirm={handleCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}

export default ProtectedPage(EventEdit, {
  requiredPermissions: ['event_edit'],
  requiredRoles: ['admin', 'super_admin', 'municipality_admin', 'gdibs_internal', 'event_manager'],
  requireAllPermissions: false
});
