import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Users, CheckCircle2, Clock, User } from 'lucide-react';

export default function MatchmakerActivityLog({ applicationId }) {
  const { t, language } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['matchmaker-activities', applicationId],
    queryFn: () => base44.entities.SystemActivity.filter({ 
      entity_id: applicationId,
      entity_type: 'MatchmakerApplication'
    }, '-created_date', 100)
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['matchmaker-evaluations', applicationId],
    queryFn: async () => {
      const sessions = await base44.entities.MatchmakerEvaluationSession.filter({ 
        application_id: applicationId 
      }, '-created_date');
      return sessions;
    }
  });

  const allEvents = [
    ...activities.map(a => ({ ...a, type: 'activity' })),
    ...evaluations.map(e => ({ 
      ...e, 
      type: 'evaluation',
      activity_description: `Evaluation: ${e.evaluation_outcome || 'In Progress'}`,
      created_by: e.evaluator_email
    }))
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity & Evaluations Log', ar: 'سجل النشاط والتقييمات' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allEvents.map((event, idx) => {
            const Icon = event.type === 'evaluation' ? CheckCircle2 : Activity;
            return (
              <div key={idx} className={`flex gap-3 p-3 rounded-lg border ${
                event.type === 'evaluation' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50'
              }`}>
                <div className={`h-8 w-8 rounded-full ${
                  event.type === 'evaluation' ? 'bg-purple-100' : 'bg-blue-100'
                } flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${event.type === 'evaluation' ? 'text-purple-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-sm font-medium">{event.created_by}</span>
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(event.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{event.activity_description}</p>
                  {event.activity_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.activity_type}
                    </Badge>
                  )}
                  {event.evaluation_outcome && (
                    <Badge className={`mt-2 text-xs ${
                      event.evaluation_outcome === 'approved' ? 'bg-green-600' :
                      event.evaluation_outcome === 'rejected' ? 'bg-red-600' :
                      'bg-blue-600'
                    }`}>
                      {event.evaluation_outcome}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {allEvents.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity recorded', ar: 'لا يوجد نشاط مسجل' })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}