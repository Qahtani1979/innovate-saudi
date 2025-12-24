import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, AlertCircle, ArrowRight } from 'lucide-react';

export default function DependencyVisualizer() {
  const { language, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list(),
    initialData: []
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list(),
    initialData: []
  });

  const dependencies = useMemo(() => {
    const deps = [];
    
    // Find pilots that depend on R&D
    pilots.forEach(pilot => {
      if (pilot.linked_rd_ids?.length > 0) {
        pilot.linked_rd_ids.forEach(rdId => {
          const rd = rdProjects.find(r => r.id === rdId);
          if (rd) {
            deps.push({
              from: rd.title_en,
              to: pilot.title_en,
              type: 'rd_to_pilot',
              status: rd.status === 'completed' ? 'ready' : 'blocked'
            });
          }
        });
      }
    });

    // Find resource conflicts
    const labBookings = {};
    pilots.forEach(pilot => {
      if (pilot.living_lab_id) {
        if (!labBookings[pilot.living_lab_id]) {
          labBookings[pilot.living_lab_id] = [];
        }
        labBookings[pilot.living_lab_id].push(pilot);
      }
    });

    Object.entries(labBookings).forEach(([labId, pilotsInLab]) => {
      if (pilotsInLab.length > 1) {
        pilotsInLab.forEach((p1, i) => {
          pilotsInLab.slice(i + 1).forEach(p2 => {
            deps.push({
              from: p1.title_en,
              to: p2.title_en,
              type: 'resource_conflict',
              status: 'conflict'
            });
          });
        });
      }
    });

    return deps;
  }, [pilots, rdProjects]);

  const blockedItems = dependencies.filter(d => d.status === 'blocked').length;
  const conflicts = dependencies.filter(d => d.status === 'conflict').length;

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          {t({ en: 'Dependency Visualizer', ar: 'مصور التبعيات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
            <Network className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{dependencies.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Dependencies', ar: 'تبعيات' })}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{conflicts}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Conflicts', ar: 'تعارضات' })}</p>
          </div>
        </div>

        <div className="space-y-2">
          {dependencies.slice(0, 10).map((dep, i) => (
            <div key={i} className={`p-3 rounded border ${
              dep.status === 'conflict' ? 'bg-red-50 border-red-300' :
              dep.status === 'blocked' ? 'bg-yellow-50 border-yellow-300' :
              'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-900">{dep.from}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <span className="font-medium text-slate-900">{dep.to}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {dep.type.replace(/_/g, ' ')}
                </Badge>
                <Badge className={
                  dep.status === 'ready' ? 'bg-green-600' :
                  dep.status === 'blocked' ? 'bg-yellow-600' : 'bg-red-600'
                }>
                  {dep.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {conflicts > 0 && (
          <div className="p-4 bg-red-50 rounded border-2 border-red-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">
                  {t({ en: 'Resource Conflicts Detected', ar: 'تعارضات الموارد مكتشفة' })}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {t({ en: `${conflicts} initiatives competing for same resources`, ar: `${conflicts} مبادرات تتنافس على نفس الموارد` })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}