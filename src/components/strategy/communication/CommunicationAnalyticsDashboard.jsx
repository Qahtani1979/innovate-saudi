import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/components/LanguageContext';
import { useImpactStories } from '@/hooks/strategy/useImpactStories';
import { useCommunicationNotifications } from '@/hooks/strategy/useCommunicationNotifications';
import { useCommunicationAI } from '@/hooks/strategy/useCommunicationAI';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, TrendingUp, TrendingDown, Eye, Share2, Users, 
  Mail, Globe, Radio, MessageSquare, Sparkles, Loader2,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function CommunicationAnalyticsDashboard({ strategicPlanId, communicationPlanId }) {
  const { t, language } = useLanguage();
  const { stories } = useImpactStories({ strategicPlanId, publishedOnly: true });
  const { notifications, getNotificationStats } = useCommunicationNotifications(communicationPlanId);
  const { analyzeEngagement, isLoading: isAILoading } = useCommunicationAI();
  
  const [aiInsights, setAIInsights] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const notificationStats = getNotificationStats();

  // Fetch real communication analytics data
  const { data: analyticsData = [] } = useQuery({
    queryKey: ['communication-analytics', strategicPlanId, communicationPlanId],
    queryFn: async () => {
      let query = supabase
        .from('communication_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (communicationPlanId) {
        query = query.eq('communication_plan_id', communicationPlanId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching analytics:', error);
        return [];
      }
      return data || [];
    }
  });

  // Fetch email logs for email channel analytics
  const { data: emailLogs = [] } = useQuery({
    queryKey: ['email-logs-analytics'],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('email_logs')
        .select('id, status, opened_at, clicked_at, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) return [];
      return data || [];
    }
  });

  // Fetch citizen feedback for sentiment analysis
  const { data: citizenFeedback = [] } = useQuery({
    queryKey: ['citizen-feedback-analytics', strategicPlanId],
    queryFn: async () => {
      let query = supabase
        .from('citizen_feedback')
        .select('id, rating, feedback_type, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (strategicPlanId) {
        query = query.eq('entity_id', strategicPlanId);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data || [];
    }
  });

  // Calculate email metrics
  const emailMetrics = React.useMemo(() => {
    const total = emailLogs.length;
    const sent = emailLogs.filter(l => l.status === 'sent' || l.status === 'delivered').length;
    const opened = emailLogs.filter(l => l.opened_at).length;
    const clicked = emailLogs.filter(l => l.clicked_at).length;
    return {
      total,
      sent,
      opened,
      clicked,
      openRate: total > 0 ? ((opened / total) * 100).toFixed(1) : 0,
      clickRate: opened > 0 ? ((clicked / opened) * 100).toFixed(1) : 0
    };
  }, [emailLogs]);

  // Calculate feedback metrics  
  const feedbackMetrics = React.useMemo(() => {
    const total = citizenFeedback.length;
    const avgRating = total > 0 
      ? (citizenFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / total).toFixed(1)
      : 0;
    const positive = citizenFeedback.filter(f => f.rating >= 4).length;
    return { total, avgRating, positive, positiveRate: total > 0 ? ((positive / total) * 100).toFixed(0) : 0 };
  }, [citizenFeedback]);

  // Calculate story metrics
  const storyMetrics = {
    totalStories: stories.length,
    featuredStories: stories.filter(s => s.is_featured).length,
    totalViews: stories.reduce((sum, s) => sum + (s.view_count || 0), 0),
    totalShares: stories.reduce((sum, s) => sum + (s.share_count || 0), 0),
    avgViewsPerStory: stories.length > 0 
      ? Math.round(stories.reduce((sum, s) => sum + (s.view_count || 0), 0) / stories.length)
      : 0
  };

  // Aggregate analytics by channel
  const channelPerformance = React.useMemo(() => {
    const channels = {};
    analyticsData.forEach(record => {
      const ch = record.channel || 'unknown';
      if (!channels[ch]) {
        channels[ch] = { reach: 0, engagement: 0, count: 0 };
      }
      channels[ch].reach += record.reach || 0;
      channels[ch].engagement += record.engagement_rate || 0;
      channels[ch].count++;
    });

    const channelIcons = {
      portal: <Globe className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />,
      social: <Radio className="h-4 w-4" />,
      in_app: <MessageSquare className="h-4 w-4" />
    };

    return Object.entries(channels).map(([channel, data]) => ({
      channel: channel.charAt(0).toUpperCase() + channel.slice(1).replace('_', ' '),
      channel_ar: channel === 'portal' ? 'البوابة العامة' 
        : channel === 'email' ? 'البريد الإلكتروني'
        : channel === 'social' ? 'وسائل التواصل'
        : 'إشعارات التطبيق',
      icon: channelIcons[channel] || <Globe className="h-4 w-4" />,
      reach: data.reach,
      engagement: data.count > 0 ? (data.engagement / data.count).toFixed(1) : 0,
      trend: 'up',
      change: '+5%'
    }));
  }, [analyticsData]);

  // Fallback if no real data
  const displayChannels = channelPerformance.length > 0 ? channelPerformance : [
    { channel: 'Public Portal', channel_ar: 'البوابة العامة', icon: <Globe className="h-4 w-4" />, reach: 0, engagement: 0, trend: 'up', change: 'N/A' },
    { channel: 'Email Newsletter', channel_ar: 'النشرة الإخبارية', icon: <Mail className="h-4 w-4" />, reach: 0, engagement: 0, trend: 'up', change: 'N/A' },
    { channel: 'Social Media', channel_ar: 'وسائل التواصل', icon: <Radio className="h-4 w-4" />, reach: 0, engagement: 0, trend: 'up', change: 'N/A' },
    { channel: 'In-App', channel_ar: 'إشعارات التطبيق', icon: <MessageSquare className="h-4 w-4" />, reach: 0, engagement: 0, trend: 'up', change: 'N/A' }
  ];

  // Calculate total reach from real data
  const totalReach = analyticsData.reduce((sum, r) => sum + (r.reach || 0), 0);
  const avgEngagement = analyticsData.length > 0 
    ? (analyticsData.reduce((sum, r) => sum + (r.engagement_rate || 0), 0) / analyticsData.length).toFixed(1)
    : 0;
  const handleAnalyzeEngagement = async () => {
    try {
      const analyticsData = {
        stories: storyMetrics,
        notifications: notificationStats,
        channels: channelPerformance
      };
      const result = await analyzeEngagement(analyticsData);
      setAIInsights(result);
      toast.success(t({ en: 'Engagement analysis complete', ar: 'اكتمل تحليل التفاعل' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to analyze engagement', ar: 'فشل في تحليل التفاعل' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t({ en: 'Communication Analytics', ar: 'تحليلات التواصل' })}
            </CardTitle>
            <CardDescription>
              {t({ en: 'Track engagement and performance across all channels', ar: 'تتبع التفاعل والأداء عبر جميع القنوات' })}
            </CardDescription>
          </div>
          <Button onClick={handleAnalyzeEngagement} disabled={isAILoading}>
            {isAILoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Total Reach', ar: 'الوصول الكلي' })}</p>
                <p className="text-2xl font-bold">{totalReach > 0 ? totalReach.toLocaleString() : '0'}</p>
              </div>
              {totalReach > 0 && (
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  Active
                </div>
              )}
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Email Open Rate', ar: 'معدل فتح البريد' })}</p>
                <p className="text-2xl font-bold">{emailMetrics.openRate}%</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {emailMetrics.opened}/{emailMetrics.total}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Story Views', ar: 'مشاهدات القصص' })}</p>
                <p className="text-2xl font-bold">{storyMetrics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Feedback Score', ar: 'درجة الملاحظات' })}</p>
                <p className="text-2xl font-bold">{feedbackMetrics.avgRating}/5</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                {feedbackMetrics.positiveRate}% {t({ en: 'positive', ar: 'إيجابي' })}
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
            <TabsTrigger value="channels">{t({ en: 'Channels', ar: 'القنوات' })}</TabsTrigger>
            <TabsTrigger value="content">{t({ en: 'Content', ar: 'المحتوى' })}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Channel Performance Summary */}
            <div className="space-y-3">
              <h4 className="font-medium">{t({ en: 'Channel Performance', ar: 'أداء القنوات' })}</h4>
              {displayChannels.map((channel, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {channel.icon}
                      <div>
                        <p className="font-medium">
                          {language === 'ar' ? channel.channel_ar : channel.channel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t({ en: 'Reach:', ar: 'الوصول:' })} {typeof channel.reach === 'number' ? channel.reach.toLocaleString() : channel.reach}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="font-medium">{channel.engagement}%</span>
                        {channel.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <span className={`text-sm ${channel.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {channel.change}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* AI Insights */}
            {aiInsights && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
                </h4>
                <div className="space-y-3">
                  {aiInsights.overall_performance && (
                    <div>
                      <p className="text-sm font-medium">{t({ en: 'Overall Score', ar: 'النتيجة الإجمالية' })}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={aiInsights.overall_performance} className="flex-1" />
                        <span>{aiInsights.overall_performance}/100</span>
                      </div>
                    </div>
                  )}
                  {aiInsights.recommendations && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</p>
                      <ul className="space-y-1">
                        {aiInsights.recommendations.slice(0, 5).map((rec, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="channels" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {displayChannels.map((channel, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {channel.icon}
                    </div>
                    <div>
                      <p className="font-medium">
                        {language === 'ar' ? channel.channel_ar : channel.channel}
                      </p>
                      <Badge variant={channel.trend === 'up' ? 'default' : 'secondary'}>
                        {channel.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t({ en: 'Reach', ar: 'الوصول' })}</span>
                        <span>{typeof channel.reach === 'number' ? channel.reach.toLocaleString() : channel.reach}</span>
                      </div>
                      <Progress value={Math.min(channel.reach / 500, 100)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t({ en: 'Engagement', ar: 'التفاعل' })}</span>
                        <span>{channel.engagement}%</span>
                      </div>
                      <Progress value={parseFloat(channel.engagement) || 0} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{storyMetrics.totalStories}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Impact Stories', ar: 'قصص التأثير' })}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{storyMetrics.featuredStories}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Featured', ar: 'مميزة' })}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{storyMetrics.avgViewsPerStory}</p>
                <p className="text-sm text-muted-foreground">{t({ en: 'Avg Views/Story', ar: 'متوسط المشاهدات' })}</p>
              </Card>
            </div>

            {/* Top Stories */}
            <div>
              <h4 className="font-medium mb-3">{t({ en: 'Top Performing Stories', ar: 'أفضل القصص أداءً' })}</h4>
              <div className="space-y-2">
                {stories
                  .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
                  .slice(0, 5)
                  .map((story, idx) => (
                    <Card key={story.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                          <div>
                            <p className="font-medium">{story.title_en || story.title_ar}</p>
                            <Badge variant="outline">{story.entity_type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {story.view_count || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            {story.share_count || 0}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                {stories.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    {t({ en: 'No stories published yet', ar: 'لا توجد قصص منشورة بعد' })}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
