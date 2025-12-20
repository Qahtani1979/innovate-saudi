import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { 
  Activity, TrendingUp, Clock, Eye, FileText, MessageSquare, 
  ThumbsUp, Lightbulb, Target
} from 'lucide-react';
import { ProfileStatCard, ProfileStatGrid } from '@/components/profile/ProfileStatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function ActivityTab() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();

  const { data: activities = [] } = useQuery({
    queryKey: ['my-activities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: votes = [] } = useQuery({
    queryKey: ['my-votes', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from('citizen_votes')
        .select('*')
        .eq('user_email', user.email);
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['my-comments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('user_email', user.email)
        .eq('is_deleted', false);
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ['my-ideas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('citizen_ideas')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id
  });

  // Activity timeline data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const activityByDay = last30Days.map(date => {
    const count = activities.filter(a => 
      a.created_at?.split('T')[0] === date
    ).length;
    return { date: date.slice(5), count };
  });

  // Activity by type
  const activityTypes = activities.reduce((acc, a) => {
    const type = a.activity_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(activityTypes)
    .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Recent activity
  const recentActivities = activities.slice(0, 10);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'view': return Eye;
      case 'create': return FileText;
      case 'comment': return MessageSquare;
      case 'vote': return ThumbsUp;
      case 'idea': return Lightbulb;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats */}
      <ProfileStatGrid columns={4}>
        <ProfileStatCard
          icon={Activity}
          value={activities.length}
          label={t({ en: 'Total Activities', ar: 'إجمالي الأنشطة' })}
          variant="primary"
        />
        <ProfileStatCard
          icon={ThumbsUp}
          value={votes.length}
          label={t({ en: 'Votes Cast', ar: 'الأصوات' })}
          variant="success"
        />
        <ProfileStatCard
          icon={MessageSquare}
          value={comments.length}
          label={t({ en: 'Comments', ar: 'التعليقات' })}
          variant="purple"
        />
        <ProfileStatCard
          icon={Lightbulb}
          value={ideas.length}
          label={t({ en: 'Ideas', ar: 'الأفكار' })}
          variant="amber"
        />
      </ProfileStatGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t({ en: 'Activity (Last 30 Days)', ar: 'النشاط (آخر 30 يوم)' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={activityByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t({ en: 'Activity by Type', ar: 'النشاط حسب النوع' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length > 0 ? (
            <div className="space-y-3">
              {recentActivities.map((activity, i) => {
                const Icon = getActivityIcon(activity.activity_type);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description || activity.activity_type?.replace(/_/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {activity.entity_type || 'general'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {t({ en: 'No activity yet. Start exploring!', ar: 'لا يوجد نشاط بعد. ابدأ الاستكشاف!' })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
