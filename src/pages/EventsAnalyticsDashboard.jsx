import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageContext';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  BarChart3, 
  PieChart,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  DollarSign,
  Target,
  Sparkles,
  ArrowLeft,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function EventsAnalyticsDashboard() {
  const { t, language, isRTL } = useLanguage();
  const [timeRange, setTimeRange] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [aiInsights, setAiInsights] = useState(null);
  
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Fetch all events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch registrations
  const { data: registrations = [] } = useQuery({
    queryKey: ['event-registrations-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('is_deleted', false);
      if (error) throw error;
      return data || [];
    }
  });

  // Generate AI insights
  const generateInsights = async () => {
    if (!isAvailable || events.length === 0) return;
    
    const response = await invokeAI({
      prompt: `Analyze event data for a Saudi municipal innovation platform:

Events summary:
- Total events: ${events.length}
- Event types: ${[...new Set(events.map(e => e.event_type))].join(', ')}
- Completed: ${events.filter(e => e.status === 'completed').length}
- Upcoming: ${events.filter(e => new Date(e.start_date) > new Date()).length}

Registrations: ${registrations.length} total, ${registrations.filter(r => r.attendance_status === 'attended').length} attended

Provide 3 actionable insights about:
1. Optimal timing for events
2. Popular/successful event types  
3. A recommendation for improvement

Format each with title and description in both English and Arabic.`,
      response_json_schema: {
        type: 'object',
        properties: {
          optimal_timing: { type: 'object', properties: { title_en: { type: 'string' }, title_ar: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' } } },
          popular_types: { type: 'object', properties: { title_en: { type: 'string' }, title_ar: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' } } },
          recommendation: { type: 'object', properties: { title_en: { type: 'string' }, title_ar: { type: 'string' }, description_en: { type: 'string' }, description_ar: { type: 'string' } } }
        }
      }
    });
    
    if (response.success && response.data?.response) {
      setAiInsights(response.data.response);
    }
  };

  // Auto-generate insights when data is loaded
  useEffect(() => {
    if (!aiInsights && isAvailable && events.length > 0 && registrations.length >= 0) {
      generateInsights();
    }
  }, [events.length, registrations.length, isAvailable]);

  // Filter events by time range
  const filteredEvents = events.filter(event => {
    if (timeRange === 'all') return true;
    const eventDate = new Date(event.start_date);
    const now = new Date();
    const daysAgo = (now - eventDate) / (1000 * 60 * 60 * 24);
    if (timeRange === '30') return daysAgo <= 30;
    if (timeRange === '90') return daysAgo <= 90;
    if (timeRange === '365') return daysAgo <= 365;
    return true;
  }).filter(event => {
    if (selectedType === 'all') return true;
    return event.event_type === selectedType;
  });

  // Calculate metrics
  const totalEvents = filteredEvents.length;
  const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
  const upcomingEvents = filteredEvents.filter(e => new Date(e.start_date) > new Date()).length;
  const totalRegistrations = registrations.filter(r => 
    filteredEvents.some(e => e.id === r.event_id)
  ).length;
  const avgRegistrationsPerEvent = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;
  const attendedCount = registrations.filter(r => r.attendance_status === 'attended').length;
  const attendanceRate = totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

  // Events by type
  const eventTypes = ['workshop', 'webinar', 'conference', 'training', 'meetup', 'hackathon'];
  const eventsByType = eventTypes.map(type => ({
    type: type.charAt(0).toUpperCase() + type.slice(1),
    count: filteredEvents.filter(e => e.event_type === type).length
  })).filter(d => d.count > 0);

  // Events by status
  const statusData = [
    { name: 'Draft', value: filteredEvents.filter(e => e.status === 'draft').length, color: '#9CA3AF' },
    { name: 'Published', value: filteredEvents.filter(e => e.status === 'published').length, color: '#3B82F6' },
    { name: 'Open', value: filteredEvents.filter(e => e.status === 'registration_open').length, color: '#22C55E' },
    { name: 'Completed', value: filteredEvents.filter(e => e.status === 'completed').length, color: '#10B981' },
    { name: 'Cancelled', value: filteredEvents.filter(e => e.status === 'cancelled').length, color: '#EF4444' }
  ].filter(d => d.value > 0);

  // Monthly trend (last 12 months)
  const monthlyTrend = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthEvents = events.filter(e => {
      const eventDate = new Date(e.start_date);
      return eventDate.getFullYear() === date.getFullYear() && 
             eventDate.getMonth() === date.getMonth();
    });
    monthlyTrend.push({
      month: date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short' }),
      events: monthEvents.length,
      registrations: registrations.filter(r => 
        monthEvents.some(e => e.id === r.event_id)
      ).length
    });
  }

  // Top performing events
  const topEvents = [...filteredEvents]
    .filter(e => e.status === 'completed')
    .sort((a, b) => (b.registration_count || 0) - (a.registration_count || 0))
    .slice(0, 5);

  // Virtual vs In-Person
  const virtualCount = filteredEvents.filter(e => e.is_virtual).length;
  const inPersonCount = filteredEvents.filter(e => !e.is_virtual).length;
  const modeData = [
    { name: t({ en: 'Virtual', ar: 'افتراضي' }), value: virtualCount, color: '#8B5CF6' },
    { name: t({ en: 'In-Person', ar: 'حضوري' }), value: inPersonCount, color: '#F59E0B' }
  ].filter(d => d.value > 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('EventCalendar')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              {t({ en: 'Events Analytics Dashboard', ar: 'لوحة تحليلات الفعاليات' })}
            </h1>
            <p className="text-muted-foreground">
              {t({ en: 'Comprehensive insights into event performance and engagement', ar: 'رؤى شاملة حول أداء الفعاليات والتفاعل' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Time', ar: 'كل الوقت' })}</SelectItem>
              <SelectItem value="30">{t({ en: 'Last 30 Days', ar: 'آخر 30 يوم' })}</SelectItem>
              <SelectItem value="90">{t({ en: 'Last 90 Days', ar: 'آخر 90 يوم' })}</SelectItem>
              <SelectItem value="365">{t({ en: 'Last Year', ar: 'السنة الماضية' })}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Types', ar: 'كل الأنواع' })}</SelectItem>
              {eventTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalEvents}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Events', ar: 'إجمالي الفعاليات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{completedEvents}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{upcomingEvents}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Upcoming', ar: 'قادمة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{totalRegistrations}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Registrations', ar: 'التسجيلات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{avgRegistrationsPerEvent}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg/Event', ar: 'المتوسط/فعالية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-rose-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-rose-600">{attendanceRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Attendance Rate', ar: 'معدل الحضور' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t({ en: 'Monthly Trend', ar: 'الاتجاه الشهري' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  name={t({ en: 'Events', ar: 'الفعاليات' })}
                />
                <Area 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3}
                  name={t({ en: 'Registrations', ar: 'التسجيلات' })}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              {t({ en: 'Events by Type', ar: 'الفعاليات حسب النوع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              {t({ en: 'Status Distribution', ar: 'توزيع الحالات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-600" />
              {t({ en: 'Event Mode', ar: 'نوع الفعالية' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={modeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {modeData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-rose-600" />
              {t({ en: 'Top Performing Events', ar: 'أفضل الفعاليات' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topEvents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                {t({ en: 'No completed events yet', ar: 'لا توجد فعاليات مكتملة بعد' })}
              </p>
            ) : (
              <div className="space-y-3">
                {topEvents.map((event, idx) => (
                  <Link key={event.id} to={createPageUrl('EventDetail') + `?id=${event.id}`}>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium text-sm text-slate-900 line-clamp-1">
                            {language === 'ar' ? event.title_ar : event.title_en}
                          </p>
                          <p className="text-xs text-slate-500">{event.event_type}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {event.registration_count || 0} {t({ en: 'reg', ar: 'تسجيل' })}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI-Powered Insights', ar: 'رؤى مدعومة بالذكاء الاصطناعي' })}
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateInsights}
              disabled={aiLoading || !isAvailable}
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className={isRTL ? 'mr-2' : 'ml-2'}>{t({ en: 'Refresh', ar: 'تحديث' })}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          
          {aiLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            </div>
          ) : aiInsights ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">
                  {language === 'ar' ? aiInsights.optimal_timing?.title_ar : aiInsights.optimal_timing?.title_en}
                </h4>
                <p className="text-sm text-slate-600">
                  {language === 'ar' ? aiInsights.optimal_timing?.description_ar : aiInsights.optimal_timing?.description_en}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">
                  {language === 'ar' ? aiInsights.popular_types?.title_ar : aiInsights.popular_types?.title_en}
                </h4>
                <p className="text-sm text-slate-600">
                  {language === 'ar' ? aiInsights.popular_types?.description_ar : aiInsights.popular_types?.description_en}
                </p>
              </div>
              <div className="p-4 bg-white rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-700 mb-2">
                  {language === 'ar' ? aiInsights.recommendation?.title_ar : aiInsights.recommendation?.title_en}
                </h4>
                <p className="text-sm text-slate-600">
                  {language === 'ar' ? aiInsights.recommendation?.description_ar : aiInsights.recommendation?.description_en}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t({ en: 'Click Refresh to generate AI insights', ar: 'انقر على تحديث لإنشاء رؤى الذكاء الاصطناعي' })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(EventsAnalyticsDashboard, { requiredPermissions: [] });
