import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { GitBranch, User, Clock, FileText } from 'lucide-react';

export default function DataLineageTracker({ entityType, entityId }) {
  const { language, t } = useLanguage();

  const { data: activities = [] } = useQuery({
    queryKey: ['access-log', entityType, entityId],
    queryFn: async () => {
      const all = await base44.entities.AccessLog.list();
      return all
        .filter(a => a.entity_type === entityType && a.entity_id === entityId)
        .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
        .slice(0, 20);
    },
    initialData: []
  });

  const getActionColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      view: 'bg-slate-100 text-slate-700',
      approve: 'bg-purple-100 text-purple-700'
    };
    return colors[action] || 'bg-slate-100 text-slate-700';
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Data Lineage', ar: 'أصل البيانات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'No activity history', ar: 'لا سجل نشاط' })}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((activity, i) => (
              <div key={i} className="p-3 bg-white rounded border flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Badge className={getActionColor(activity.action_type)}>
                    {activity.action_type}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3 text-slate-400" />
                    <span className="text-xs font-medium text-slate-900">
                      {activity.user_email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(activity.created_date).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-slate-500 text-center">
            {t({ 
              en: 'Complete audit trail for compliance and accountability', 
              ar: 'مسار تدقيق كامل للامتثال والمساءلة' 
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}