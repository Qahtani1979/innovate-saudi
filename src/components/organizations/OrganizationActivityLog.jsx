import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, Edit, Users, Handshake, Clock, User } from 'lucide-react';

export default function OrganizationActivityLog({ organizationId }) {
  const { t, language } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['org-activities', organizationId],
    queryFn: () => base44.entities.SystemActivity.filter({ 
      entity_id: organizationId,
      entity_type: 'Organization'
    }, '-created_date', 100)
  });

  const activityIcons = {
    created: Edit,
    updated: Edit,
    partnership: Handshake,
    verification: Users,
    default: Activity
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          {t({ en: 'Activity History', ar: 'سجل النشاط' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, idx) => {
            const Icon = activityIcons[activity.activity_type] || activityIcons.default;
            return (
              <div key={idx} className="flex gap-3 p-3 bg-slate-50 rounded-lg border">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span className="text-sm font-medium">{activity.created_by}</span>
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500">
                      {new Date(activity.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{activity.activity_description}</p>
                  {activity.activity_type && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {activity.activity_type}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {activities.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">
              {t({ en: 'No activity recorded', ar: 'لا يوجد نشاط مسجل' })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}