import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { History, User, Clock } from 'lucide-react';

export default function PolicyEditHistory({ policyId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['policy-activities', policyId],
    queryFn: async () => {
      const acts = await base44.entities.SystemActivity.filter({ 
        entity_type: 'PolicyRecommendation',
        entity_id: policyId 
      }, '-created_date', 20);
      return acts;
    },
    enabled: !!policyId
  });

  const editActivities = activities.filter(a => 
    a.action_type === 'updated' && a.changes
  );

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4 text-blue-600" />
          {t({ en: 'Edit History', ar: 'سجل التعديلات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-96 overflow-y-auto">
        {editActivities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            {t({ en: 'No edit history yet', ar: 'لا يوجد سجل تعديلات بعد' })}
          </p>
        ) : (
          editActivities.map((activity, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-slate-600" />
                  <span className="font-medium text-slate-900">{activity.user_email}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(activity.created_date).toLocaleString()}</span>
                </div>
              </div>
              {activity.changes && typeof activity.changes === 'object' && (
                <div className="space-y-1">
                  {Object.entries(activity.changes).map(([field, values], i) => (
                    <div key={i} className="pl-3 border-l-2 border-blue-300">
                      <Badge variant="outline" className="text-xs mb-1">{field}</Badge>
                      <p className="text-slate-600">
                        {values.old !== undefined && (
                          <span className="line-through text-red-600">
                            {String(values.old).substring(0, 50)}
                          </span>
                        )}
                        {' → '}
                        {values.new !== undefined && (
                          <span className="text-green-600">
                            {String(values.new).substring(0, 50)}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}