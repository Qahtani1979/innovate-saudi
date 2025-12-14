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

  // Mock channel performance data (in real implementation, this would come from analytics table)
  const channelPerformance = [
    { 
      channel: 'Public Portal', 
      channel_ar: 'البوابة العامة',
      icon: <Globe className="h-4 w-4" />,
      reach: 12500, 
      engagement: 8.5, 
      trend: 'up', 
      change: '+12%' 
    },
    { 
      channel: 'Email Newsletter', 
      channel_ar: 'النشرة الإخبارية',
      icon: <Mail className="h-4 w-4" />,
      reach: 8200, 
      engagement: 24.3, 
      trend: 'up', 
      change: '+8%' 
    },
    { 
      channel: 'Social Media', 
      channel_ar: 'وسائل التواصل',
      icon: <Radio className="h-4 w-4" />,
      reach: 45000, 
      engagement: 3.2, 
      trend: 'down', 
      change: '-2%' 
    },
    { 
      channel: 'In-App Notifications', 
      channel_ar: 'إشعارات التطبيق',
      icon: <MessageSquare className="h-4 w-4" />,
      reach: 5600, 
      engagement: 42.1, 
      trend: 'up', 
      change: '+18%' 
    }
  ];

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
                <p className="text-2xl font-bold">71.3K</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                +15%
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t({ en: 'Engagement Rate', ar: 'معدل التفاعل' })}</p>
                <p className="text-2xl font-bold">12.4%</p>
              </div>
              <div className="flex items-center text-green-600 text-sm">
                <ArrowUpRight className="h-4 w-4" />
                +3%
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
                <p className="text-sm text-muted-foreground">{t({ en: 'Notifications Sent', ar: 'الإشعارات المرسلة' })}</p>
                <p className="text-2xl font-bold">{notificationStats.sent}</p>
              </div>
              <Mail className="h-5 w-5 text-muted-foreground" />
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
              {channelPerformance.map((channel, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {channel.icon}
                      <div>
                        <p className="font-medium">
                          {language === 'ar' ? channel.channel_ar : channel.channel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t({ en: 'Reach:', ar: 'الوصول:' })} {channel.reach.toLocaleString()}
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
              {channelPerformance.map((channel, idx) => (
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
                        <span>{channel.reach.toLocaleString()}</span>
                      </div>
                      <Progress value={Math.min(channel.reach / 500, 100)} />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t({ en: 'Engagement', ar: 'التفاعل' })}</span>
                        <span>{channel.engagement}%</span>
                      </div>
                      <Progress value={channel.engagement} />
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
