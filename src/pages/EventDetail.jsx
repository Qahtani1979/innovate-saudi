import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/lib/AuthContext';
import { Calendar, MapPin, Users, Clock, Globe, UserPlus, Edit, Bookmark, MessageSquare, Send, Loader2, Award, Info, Sparkles, BarChart3, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { EventExpertEvaluation } from '@/components/events';
import EventStrategicAlignment from '@/components/events/EventStrategicAlignment';
import { AIEventOptimizer } from '@/components/ai/AIEventOptimizer';
import { AIAttendancePredictor } from '@/components/ai/AIAttendancePredictor';
import {
  useEvent,
  useEventComments,
  useEventBookmarkStatus,
  useEventInvalidator
} from '@/hooks/useEvents';
import { useEventMutations } from '@/hooks/useEventMutations';

function EventDetail() {
  const { t, language } = useLanguage();
  const { hasAnyPermission, roles, userEmail } = usePermissions();
  const { user } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');
  const { invalidateEvent } = useEventInvalidator();

  const [newComment, setNewComment] = useState('');

  const canEditEvents = hasAnyPermission(['event_edit', 'event_manage', 'admin']) ||
    roles?.some(r => ['admin', 'super_admin', 'municipality_admin', 'gdibs_internal', 'event_manager'].includes(r));

  const canEvaluateEvents = hasAnyPermission(['event_evaluate', 'expert_evaluate', 'admin']) ||
    roles?.some(r => ['admin', 'super_admin', 'expert', 'evaluator', 'gdibs_internal'].includes(r));

  // Use custom hooks
  const { data: event, isLoading } = useEvent(eventId);
  const { data: comments = [] } = useEventComments(eventId);
  const { data: isBookmarked } = useEventBookmarkStatus(eventId, userEmail);
  const { addComment, toggleBookmark } = useEventMutations();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate({ eventId, content: newComment }, {
      onSuccess: () => setNewComment(''),
      onError: () => toast.error(t({ en: 'Failed to add comment', ar: 'فشل في إضافة التعليق' }))
    });
  };

  const handleToggleBookmark = () => {
    toggleBookmark.mutate({ eventId, isBookmarked });
  };

  if (isLoading || !event) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    published: 'bg-blue-200 text-blue-800',
    registration_open: 'bg-green-600 text-white',
    registration_closed: 'bg-amber-200 text-amber-800',
    in_progress: 'bg-purple-600 text-white',
    completed: 'bg-green-200 text-green-800',
    cancelled: 'bg-red-200 text-red-800'
  };

  const title = language === 'ar' ? event.title_ar : event.title_en;
  const description = language === 'ar' ? event.description_ar : event.description_en;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            <Badge className={statusColors[event.status] || 'bg-gray-200'}>
              {event.status}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm">
            {t({ en: 'Event Code:', ar: 'رمز الفعالية:' })} {event.code}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userEmail && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleBookmark}
              disabled={toggleBookmark.isPending}
              className={isBookmarked ? 'text-yellow-600' : 'text-slate-400'}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          )}
          {canEditEvents && (
            <Link to={createPageUrl('EventEdit') + `?id=${eventId}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {t({ en: 'Edit', ar: 'تعديل' })}
              </Button>
            </Link>
          )}
          {event.status === 'registration_open' && (
            <Link to={createPageUrl('EventRegistration') + `?id=${eventId}`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                {t({ en: 'Register', ar: 'التسجيل' })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">
              {new Date(event.start_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Start Date', ar: 'تاريخ البداية' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">
              {new Date(event.end_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'End Date', ar: 'تاريخ النهاية' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {event.registration_count || 0} / {event.capacity || '∞'}
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Registrations', ar: 'التسجيلات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Globe className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">{event.mode || 'N/A'}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Mode', ar: 'الطريقة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Details, AI Insights, Comments, Expert Evaluation */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            {t({ en: 'Details', ar: 'التفاصيل' })}
          </TabsTrigger>
          <TabsTrigger value="strategy" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t({ en: 'Strategy', ar: 'الاستراتيجية' })}
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t({ en: 'Comments', ar: 'التعليقات' })} ({comments.length})
          </TabsTrigger>
          {canEvaluateEvents && (
            <TabsTrigger value="evaluation" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t({ en: 'Evaluation', ar: 'تقييم' })}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Event Details', ar: 'تفاصيل الفعالية' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.event_type && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">{t({ en: 'Event Type', ar: 'نوع الفعالية' })}</p>
                  <Badge>{event.event_type}</Badge>
                </div>
              )}

              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-600">{t({ en: 'Location', ar: 'الموقع' })}</p>
                    <p className="text-sm text-slate-900">{event.location}</p>
                  </div>
                </div>
              )}

              {description && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-2">{t({ en: 'Description', ar: 'الوصف' })}</p>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{description}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {event.agenda && event.agenda.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Agenda', ar: 'جدول الأعمال' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{item.title || item}</p>
                          {item.time && (
                            <p className="text-xs text-slate-600 mt-1">{item.time}</p>
                          )}
                        </div>
                        {item.duration && (
                          <Badge variant="outline" className="text-xs">{item.duration}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {event.speakers && event.speakers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Speakers', ar: 'المتحدثون' })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.speakers.map((speaker, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-slate-900">{speaker.name || speaker}</p>
                      {speaker.title && (
                        <p className="text-sm text-slate-600">{speaker.title}</p>
                      )}
                      {speaker.organization && (
                        <p className="text-xs text-slate-500 mt-1">{speaker.organization}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6 mt-6">
          <EventStrategicAlignment event={event} onUpdate={() => invalidateEvent(eventId)} />
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Attendance Predictor */}
            <AIAttendancePredictor
              event={event}
              registrationCount={event.registration_count || 0}
            />

            {/* AI Event Optimizer */}
            {canEditEvents && (
              <AIEventOptimizer
                eventData={event}
                onApplySuggestion={(field, value) => {
                  toast.info(t({
                    en: `Suggestion: Update ${field} to optimize event`,
                    ar: `اقتراح: تحديث ${field} لتحسين الفعالية`
                  }));
                }}
              />
            )}
          </div>

          {/* Link to full analytics */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {t({ en: 'Event Analytics Dashboard', ar: 'لوحة تحليلات الفعالية' })}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {t({ en: 'View detailed attendance, engagement, and ROI metrics', ar: 'عرض مقاييس الحضور والتفاعل والعائد بالتفصيل' })}
                    </p>
                  </div>
                </div>
                <Link to={createPageUrl('EventsAnalyticsDashboard')}>
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                    {t({ en: 'View Analytics', ar: 'عرض التحليلات' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t({ en: 'Comments', ar: 'التعليقات' })} ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userEmail && (
                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t({ en: 'Add a comment...', ar: 'أضف تعليقاً...' })}
                    className="min-h-[80px]"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    className="self-end"
                  >
                    {addComment.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">
                  {t({ en: 'No comments yet. Be the first to comment!', ar: 'لا توجد تعليقات بعد. كن أول من يعلق!' })}
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-900">
                          {comment.user_name || comment.user_email}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.content || comment.comment_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expert Evaluation Tab */}
        {canEvaluateEvents && (
          <TabsContent value="evaluation" className="mt-6">
            <EventExpertEvaluation event={event} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ProtectedPage(EventDetail, { requiredPermissions: [] });
