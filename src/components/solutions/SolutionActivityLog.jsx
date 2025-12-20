import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { 
  FileText, MessageSquare, CheckCircle2, Upload, Link as LinkIcon,
  AlertCircle, Star, TestTube, Eye, Edit, Sparkles, Shield
} from 'lucide-react';
import { format } from 'date-fns';

export default function SolutionActivityLog({ solution }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['solution-activities', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_activities')
        .select('*')
        .eq('entity_type', 'Solution')
        .eq('entity_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['solution-comments', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('entity_type', 'solution')
        .eq('entity_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ['solution-approvals', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('entity_type', 'Solution')
        .eq('entity_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['solution-interests', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_interests')
        .select('*')
        .eq('solution_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['solution-reviews', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_reviews')
        .select('*')
        .eq('solution_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  const { data: demoRequests = [] } = useQuery({
    queryKey: ['demo-requests', solution.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('demo_requests')
        .select('*')
        .eq('solution_id', solution.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!solution.id
  });

  // Merge all activity types
  const mergedActivities = [
    ...activities.map(a => ({ ...a, type: 'system_activity', date: a.created_date })),
    ...comments.map(c => ({ ...c, type: 'comment', date: c.created_date })),
    ...approvals.map(a => ({ ...a, type: 'approval', date: a.created_date })),
    ...interests.map(i => ({ ...i, type: 'interest', date: i.created_date })),
    ...reviews.map(r => ({ ...r, type: 'review', date: r.created_date })),
    ...demoRequests.map(d => ({ ...d, type: 'demo_request', date: d.created_date }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const getActivityIcon = (activity) => {
    switch (activity.type) {
      case 'system_activity':
        if (activity.activity_type === 'created') return FileText;
        if (activity.activity_type === 'updated') return Edit;
        if (activity.activity_type === 'status_changed') return AlertCircle;
        if (activity.activity_type === 'file_uploaded') return Upload;
        if (activity.activity_type === 'matched_to_challenge') return LinkIcon;
        if (activity.activity_type === 'linked_to_pilot') return TestTube;
        if (activity.activity_type === 'ai_enhancement') return Sparkles;
        return FileText;
      case 'comment': return MessageSquare;
      case 'approval': return Shield;
      case 'interest': return Eye;
      case 'review': return Star;
      case 'demo_request': return CheckCircle2;
      default: return FileText;
    }
  };

  const getActivityColor = (activity) => {
    switch (activity.type) {
      case 'approval': return 'text-green-600';
      case 'review': return 'text-yellow-600';
      case 'interest': return 'text-blue-600';
      case 'demo_request': return 'text-purple-600';
      case 'comment': return 'text-slate-600';
      default: return 'text-slate-500';
    }
  };

  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case 'system_activity':
        return activity.description || activity.activity_type;
      case 'comment':
        return t({ en: 'Comment added', ar: 'تم إضافة تعليق' });
      case 'approval':
        return `${activity.gate_name} - ${activity.status}`;
      case 'interest':
        return t({ en: 'Interest expressed', ar: 'تم إبداء الاهتمام' });
      case 'review':
        return t({ en: `Review: ${activity.overall_rating}/5 stars`, ar: `مراجعة: ${activity.overall_rating}/5 نجوم` });
      case 'demo_request':
        return t({ en: 'Demo requested', ar: 'طلب عرض تجريبي' });
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity Timeline', ar: 'الجدول الزمني للنشاط' })}
          <Badge variant="outline">{mergedActivities.length} {t({ en: 'events', ar: 'حدث' })}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mergedActivities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity yet', ar: 'لا يوجد نشاط بعد' })}
            </p>
          ) : (
            mergedActivities.map((activity, idx) => {
              const Icon = getActivityIcon(activity);
              const color = getActivityColor(activity);

              return (
                <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {getActivityDescription(activity)}
                    </p>
                    {activity.type === 'comment' && (
                      <p className="text-sm text-slate-600 mt-1">{activity.comment_text}</p>
                    )}
                    {activity.type === 'interest' && (
                      <p className="text-sm text-slate-600 mt-1">
                        {activity.interested_by_name} ({activity.municipality_id})
                      </p>
                    )}
                    {activity.type === 'review' && activity.review_text && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{activity.review_text}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">
                        {format(new Date(activity.date), 'MMM d, yyyy HH:mm')}
                      </span>
                      {activity.created_by && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{activity.created_by}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}