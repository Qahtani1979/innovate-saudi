import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { 
  Activity, AlertCircle, TestTube, Lightbulb, Microscope, 
  Calendar, Handshake, CheckCircle2,
  Filter, RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function CrossEntityActivityStream() {
  const { language, isRTL, t } = useLanguage();
  const [filterType, setFilterType] = useState('all');
  const [filterOrg, setFilterOrg] = useState('all');
  const { user } = useAuth();

  const { data: activities = [], isLoading, refetch } = useQuery({
    queryKey: ['system-activities'],
    queryFn: async () => {
      const { data } = await supabase
        .from('system_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
    refetchInterval: 30000
  });

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', user?.email)
        .single();
      return data;
    },
    enabled: !!user?.email
  });

  const activityConfig = {
    challenge_created: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: { en: 'Challenge submitted', ar: 'تحدي مقدم' } },
    challenge_updated: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', label: { en: 'Challenge updated', ar: 'تحدي محدث' } },
    pilot_created: { icon: TestTube, color: 'text-blue-600', bg: 'bg-blue-50', label: { en: 'Pilot created', ar: 'تجربة منشأة' } },
    pilot_milestone: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: { en: 'Milestone reached', ar: 'معلم متحقق' } },
    solution_verified: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', label: { en: 'Solution verified', ar: 'حل محقق' } },
    rd_completed: { icon: Microscope, color: 'text-purple-600', bg: 'bg-purple-50', label: { en: 'R&D completed', ar: 'بحث مكتمل' } },
    program_launched: { icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50', label: { en: 'Program launched', ar: 'برنامج أُطلق' } },
    partnership_formed: { icon: Handshake, color: 'text-teal-600', bg: 'bg-teal-50', label: { en: 'Partnership formed', ar: 'شراكة شُكّلت' } },
    default: { icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50', label: { en: 'Activity', ar: 'نشاط' } }
  };

  const filteredActivities = activities.filter(a => {
    if (filterType !== 'all' && a.activity_type !== filterType) return false;
    if (filterOrg === 'mine' && a.created_by !== user?.email) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            {t({ en: 'Platform Activity Stream', ar: 'تدفق نشاط المنصة' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Real-time updates across all entities and initiatives', ar: 'تحديثات في الوقت الفعلي عبر جميع الكيانات والمبادرات' })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t({ en: 'Refresh', ar: 'تحديث' })}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-5 w-5 text-slate-500" />
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterOrg === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOrg('all')}
              >
                {t({ en: 'All Platform', ar: 'جميع المنصة' })}
              </Button>
              <Button
                variant={filterOrg === 'mine' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterOrg('mine')}
              >
                {t({ en: 'My Activities', ar: 'أنشطتي' })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stream */}
      <div className="space-y-3">
        {filteredActivities.map((activity, idx) => {
          const config = activityConfig[activity.activity_type] || activityConfig.default;
          const Icon = config.icon;

          return (
            <Card key={idx} className={`border-l-4 hover:shadow-md transition-shadow ${config.bg}`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {activity.description || config.label[language]}
                        </p>
                        {activity.entity_code && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {activity.entity_code}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.created_date), { addSuffix: true })}
                      </span>
                    </div>
                    {activity.created_by && (
                      <p className="text-xs text-slate-600 mt-1">
                        {t({ en: 'by', ar: 'بواسطة' })} {activity.created_by}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No recent activity', ar: 'لا نشاط حديث' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(CrossEntityActivityStream, { requiredPermissions: [] });