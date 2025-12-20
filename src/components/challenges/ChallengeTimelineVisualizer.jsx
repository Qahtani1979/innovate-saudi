import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';

export default function ChallengeTimelineVisualizer({ challenge }) {
  const { language, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['challenge-activities', challenge.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_activities')
        .select('*')
        .eq('challenge_id', challenge.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    initialData: []
  });

  const events = [
    { date: challenge.created_date, type: 'created', label: t({ en: 'Submitted', ar: 'مُقدم' }) },
    challenge.submission_date && { date: challenge.submission_date, type: 'submitted', label: t({ en: 'Submitted for Review', ar: 'مُقدم للمراجعة' }) },
    challenge.review_date && { date: challenge.review_date, type: 'reviewed', label: t({ en: 'Reviewed', ar: 'مراجَع' }) },
    challenge.approval_date && { date: challenge.approval_date, type: 'approved', label: t({ en: 'Approved', ar: 'موافَق عليه' }) },
    challenge.resolution_date && { date: challenge.resolution_date, type: 'resolved', label: t({ en: 'Resolved', ar: 'محلول' }) }
  ].filter(Boolean);

  const getIcon = (type) => {
    switch (type) {
      case 'created': return <Circle className="h-4 w-4 text-blue-600" />;
      case 'submitted': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'reviewed': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Challenge Timeline', ar: 'الجدول الزمني للتحدي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event, i) => (
              <div key={i} className="relative pl-10">
                <div className="absolute left-2 top-1 bg-white border-2 border-slate-300 rounded-full p-1">
                  {getIcon(event.type)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{event.label}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(event.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  {i > 0 && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {Math.floor((new Date(event.date) - new Date(events[i-1].date)) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {activities.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-sm text-slate-700 mb-3">
              {t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}
            </h4>
            <div className="space-y-2">
              {activities.slice(-5).reverse().map((activity, i) => (
                <div key={i} className="text-sm p-2 bg-slate-50 rounded">
                  <p className="text-slate-700">{activity.description}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(activity.created_date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}