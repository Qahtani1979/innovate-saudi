import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsList } from '@/hooks/usePilots';
import { useTasks } from '@/hooks/useTasks';
import { useSolutions } from '@/hooks/useSolutions';
import { useRDProjects } from '@/hooks/useRDProjects';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function PlatformHealthMonitor() {
  const { language, t } = useLanguage();

  const { data: challengesData } = useChallengesWithVisibility({ limit: 1000, paginate: false });
  const challenges = Array.isArray(challengesData) ? challengesData : (challengesData?.data || []);
  const { data: pilots = [] } = usePilotsList();
  const { useUserTasks } = useTasks({ isAdmin: true, user: { email: 'admin' } }); // Assuming monitor needs all tasks or admin view
  const { data: tasks = [] } = useUserTasks();
  const { solutions } = useSolutions({ publishedOnly: false, limit: 1000 });
  const { data: rdProjects = [] } = useRDProjects();

  const healthChecks = [
    {
      name: t({ en: 'Challenge Pipeline', ar: 'خط التحديات' }),
      status: challenges.filter(c => c.status === 'approved').length > 0 ? 'healthy' : 'warning',
      value: `${challenges.filter(c => c.status === 'approved').length} active`,
      threshold: '> 0 approved challenges'
    },
    {
      name: t({ en: 'Pilot Execution', ar: 'تنفيذ التجارب' }),
      status: pilots.filter(p => p.stage === 'active').length > 0 ? 'healthy' : 'warning',
      value: `${pilots.filter(p => p.stage === 'active').length} running`,
      threshold: '> 0 active pilots'
    },
    {
      name: t({ en: 'Task Completion Rate', ar: 'معدل إنجاز المهام' }),
      status: tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1) > 0.7 ? 'healthy' :
        tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1) > 0.4 ? 'warning' : 'critical',
      value: `${Math.round((tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1)) * 100)}%`,
      threshold: '> 70% completion'
    },
    {
      name: t({ en: 'Scaling Success', ar: 'نجاح التوسع' }),
      status: pilots.filter(p => p.stage === 'scaled').length > 0 ? 'healthy' : 'info',
      value: `${pilots.filter(p => p.stage === 'scaled').length} scaled`,
      threshold: '> 0 scaled pilots'
    }
  ];

  const overallHealth = healthChecks.every(h => h.status === 'healthy') ? 'healthy' :
    healthChecks.some(h => h.status === 'critical') ? 'critical' : 'warning';

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-teal-600" />
            {t({ en: 'Platform Health Monitor', ar: 'مراقب صحة المنصة' })}
          </CardTitle>
          <Badge className={
            overallHealth === 'healthy' ? 'bg-green-600' :
              overallHealth === 'critical' ? 'bg-red-600' :
                'bg-yellow-600'
          }>
            {overallHealth.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {healthChecks.map((check, i) => {
            const Icon = check.status === 'healthy' ? CheckCircle :
              check.status === 'critical' ? XCircle :
                check.status === 'warning' ? AlertTriangle :
                  Activity;

            const colorClass = check.status === 'healthy' ? 'text-green-600 bg-green-50 border-green-300' :
              check.status === 'critical' ? 'text-red-600 bg-red-50 border-red-300' :
                check.status === 'warning' ? 'text-yellow-600 bg-yellow-50 border-yellow-300' :
                  'text-blue-600 bg-blue-50 border-blue-300';

            return (
              <div key={i} className={`p-4 rounded-lg border-2 ${colorClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${check.status === 'healthy' ? 'text-green-600' :
                      check.status === 'critical' ? 'text-red-600' :
                        check.status === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
                    <div>
                      <p className="font-medium text-slate-900">{check.name}</p>
                      <p className="text-xs text-slate-600">{check.threshold}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{check.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300">
          <h4 className="font-semibold text-sm text-teal-900 mb-2">
            {t({ en: '📊 Platform Metrics', ar: '📊 مقاييس المنصة' })}
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-600">Total Challenges:</span>
              <span className="font-bold text-slate-900 ml-2">{challenges.length}</span>
            </div>
            <div>
              <span className="text-slate-600">Total Pilots:</span>
              <span className="font-bold text-slate-900 ml-2">{pilots.length}</span>
            </div>
            <div>
              <span className="text-slate-600">Total Solutions:</span>
              <span className="font-bold text-slate-900 ml-2">{solutions.length}</span>
            </div>
            <div>
              <span className="text-slate-600">R&D Projects:</span>
              <span className="font-bold text-slate-900 ml-2">{rdProjects.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}