import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Users, Eye, MessageSquare, Paperclip, Bell } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function StakeholderEngagementTracker({ challenge }) {
  const { language, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['challenge-activities', challenge.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_activities')
        .select('*')
        .eq('challenge_id', challenge.id);
      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const stakeholders = challenge.stakeholders || [];
  
  const engagement = stakeholders.map(sh => {
    const views = activities.filter(a => a.user_email === sh.email && a.activity_type === 'view').length;
    const comments = activities.filter(a => a.user_email === sh.email && a.activity_type === 'comment').length;
    const attachments = activities.filter(a => a.user_email === sh.email && a.activity_type === 'attachment').length;
    const lastActive = activities.filter(a => a.user_email === sh.email).sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0]?.created_date;

    const score = Math.min((views * 5 + comments * 15 + attachments * 10), 100);
    const daysSinceActive = lastActive ? 
      Math.floor((new Date() - new Date(lastActive)) / (1000 * 60 * 60 * 24)) : 999;

    return {
      ...sh,
      views,
      comments,
      attachments,
      score,
      daysSinceActive,
      status: score >= 60 ? 'active' : score >= 30 ? 'moderate' : 'low'
    };
  }).sort((a, b) => b.score - a.score);

  const avgEngagement = engagement.length > 0 ? 
    Math.round(engagement.reduce((sum, e) => sum + e.score, 0) / engagement.length) : 0;

  const lowEngagers = engagement.filter(e => e.daysSinceActive > 14);

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            {t({ en: 'Stakeholder Engagement', ar: 'مشاركة أصحاب المصلحة' })}
          </CardTitle>
          <Badge className={
            avgEngagement >= 60 ? 'bg-green-600' : 
            avgEngagement >= 30 ? 'bg-yellow-600' : 'bg-red-600'
          }>
            {avgEngagement}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-700">{t({ en: 'Overall Engagement', ar: 'المشاركة الإجمالية' })}</span>
            <span className="font-bold">{avgEngagement}%</span>
          </div>
          <Progress value={avgEngagement} className="h-2" />
        </div>

        {engagement.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-slate-700">
              {t({ en: 'Stakeholder Activity', ar: 'نشاط أصحاب المصلحة' })}
            </h4>
            {engagement.map((sh, i) => (
              <div key={i} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{sh.name}</p>
                    <p className="text-xs text-slate-500">{sh.role}</p>
                  </div>
                  <Badge className={
                    sh.status === 'active' ? 'bg-green-600' :
                    sh.status === 'moderate' ? 'bg-yellow-600' : 'bg-red-600'
                  }>
                    {sh.score}
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {sh.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" /> {sh.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> {sh.attachments}
                  </span>
                </div>
                {sh.daysSinceActive > 14 && (
                  <p className="text-xs text-red-600 mt-2">
                    ⚠️ {t({ en: `Inactive for ${sh.daysSinceActive} days`, ar: `غير نشط لـ ${sh.daysSinceActive} يوم` })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {lowEngagers.length > 0 && (
          <div className="p-3 bg-red-50 rounded border-2 border-red-300">
            <h4 className="font-semibold text-sm text-red-900 mb-2 flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t({ en: 'Engagement Alerts', ar: 'تنبيهات المشاركة' })}
            </h4>
            <p className="text-sm text-slate-700 mb-2">
              {t({ 
                en: `${lowEngagers.length} stakeholders inactive for >14 days`, 
                ar: `${lowEngagers.length} من أصحاب المصلحة غير نشطين لـ >14 يوم` 
              })}
            </p>
            <Button size="sm" variant="outline" className="w-full">
              {t({ en: 'Send Reminder', ar: 'إرسال تذكير' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}