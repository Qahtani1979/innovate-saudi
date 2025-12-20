import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Target, AlertTriangle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function GanttView() {
  const { t } = useLanguage();
  const [entityFilter, setEntityFilter] = useState('all');

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: () => base44.entities.Milestone.list('-due_date')
  });

  const filteredMilestones = milestones.filter(m => 
    entityFilter === 'all' || m.entity_type === entityFilter
  );

  // Group by entity
  const byEntity = filteredMilestones.reduce((acc, m) => {
    const key = `${m.entity_type}-${m.entity_id}`;
    if (!acc[key]) {
      acc[key] = {
        entity_type: m.entity_type,
        entity_id: m.entity_id,
        milestones: []
      };
    }
    acc[key].milestones.push(m);
    return acc;
  }, {});

  const today = new Date();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Gantt View', ar: 'عرض جانت' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Timeline view of milestones across entities', ar: 'عرض الجدول الزمني للمعالم عبر الكيانات' })}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</option>
            <option value="pilot">{t({ en: 'Pilots', ar: 'التجارب' })}</option>
            <option value="rd_project">{t({ en: 'R&D', ar: 'البحث' })}</option>
            <option value="program">{t({ en: 'Programs', ar: 'البرامج' })}</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Timeline', ar: 'الجدول الزمني' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.values(byEntity).map((entity, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  {entity.entity_type} - {entity.entity_id}
                </h3>
                <div className="space-y-2">
                  {entity.milestones.map(milestone => {
                    const isOverdue = milestone.due_date && milestone.status !== 'completed' &&
                      new Date(milestone.due_date) < today;
                    
                    return (
                      <div key={milestone.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                        <Target className={`h-4 w-4 ${milestone.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{milestone.milestone_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {milestone.due_date && (
                              <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                                <Calendar className="h-3 w-3 inline mr-1" />
                                {new Date(milestone.due_date).toLocaleDateString()}
                                {isOverdue && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                              </p>
                            )}
                            <Badge className={`${milestone.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'} text-xs`}>
                              {milestone.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(GanttView, { requireAdmin: true });