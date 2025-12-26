import { useState } from 'react';

import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useRDProjects } from '@/hooks/useRDProjects';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Network, CheckCircle2, XCircle, Target } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function NetworkTabAnalysis() {
  const { t, isRTL } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState('Challenge');

  const { data: challenges = [] } = useChallengesWithVisibility({ includeAll: true });
  const { data: pilots = [] } = usePilotsWithVisibility({ includeAll: true });
  const { data: solutions = [] } = useSolutionsWithVisibility({ includeAll: true });
  const { data: programs = [] } = useProgramsWithVisibility({ includeAll: true });
  const { data: rdProjects = [] } = useRDProjects();

  const entityNetworkAnalysis = {
    Challenge: {
      total: challenges.length,
      withNetwork: challenges.filter(c => c.linked_solution_ids?.length || c.linked_pilot_ids?.length || c.linked_rd_ids?.length).length,
      avgConnections: challenges.length > 0 ? (challenges.reduce((sum, c) => sum + (c.linked_solution_ids?.length || 0) + (c.linked_pilot_ids?.length || 0) + (c.linked_rd_ids?.length || 0), 0) / challenges.length).toFixed(1) : 0,
      isolated: challenges.filter(c => !c.linked_solution_ids?.length && !c.linked_pilot_ids?.length && !c.linked_rd_ids?.length).length
    },
    Pilot: {
      total: pilots.length,
      withNetwork: pilots.filter(p => p.challenge_id || p.solution_id || p.scaling_plan).length,
      avgConnections: pilots.length > 0 ? (pilots.reduce((sum, p) => sum + (p.challenge_id ? 1 : 0) + (p.solution_id ? 1 : 0) + (p.scaling_plan ? 1 : 0), 0) / pilots.length).toFixed(1) : 0,
      isolated: pilots.filter(p => !p.challenge_id && !p.solution_id).length
    },
    Solution: {
      total: solutions.length,
      withNetwork: solutions.filter(s => s.challenges_discovered?.length || s.deployment_count > 0).length,
      avgConnections: solutions.length > 0 ? (solutions.reduce((sum, s) => sum + (s.challenges_discovered?.length || 0) + (s.deployment_count || 0), 0) / solutions.length).toFixed(1) : 0,
      isolated: solutions.filter(s => !s.challenges_discovered?.length && s.deployment_count === 0).length
    },
    Program: {
      total: programs.length,
      withNetwork: programs.filter(p => p.challenge_clusters_inspiration?.length || p.graduate_solutions_produced?.length).length,
      avgConnections: programs.length > 0 ? (programs.reduce((sum, p) => sum + (p.challenge_clusters_inspiration?.length || 0) + (p.graduate_solutions_produced?.length || 0), 0) / programs.length).toFixed(1) : 0,
      isolated: programs.filter(p => !p.challenge_clusters_inspiration?.length && !p.graduate_solutions_produced?.length).length
    },
    RDProject: {
      total: rdProjects.length,
      withNetwork: rdProjects.filter(r => r.challenge_ids?.length || r.pilot_opportunities?.length).length,
      avgConnections: rdProjects.length > 0 ? (rdProjects.reduce((sum, r) => sum + (r.challenge_ids?.length || 0) + (r.pilot_opportunities?.length || 0), 0) / rdProjects.length).toFixed(1) : 0,
      isolated: rdProjects.filter(r => !r.challenge_ids?.length && !r.pilot_opportunities?.length).length
    }
  };

  const currentAnalysis = entityNetworkAnalysis[selectedEntity];
  const networkScore = currentAnalysis.total > 0 ? Math.round((currentAnalysis.withNetwork / currentAnalysis.total) * 100) : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t({ en: '🔗 Network Tab Analysis', ar: '🔗 تحليل علامات الشبكة' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Analyze entity relationship patterns and network connectivity', ar: 'تحليل أنماط علاقات الكيانات والاتصال الشبكي' })}
        </p>
      </div>

      {/* Entity Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2">
            {Object.keys(entityNetworkAnalysis).map(entity => (
              <Badge
                key={entity}
                className={`cursor-pointer ${selectedEntity === entity ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                onClick={() => setSelectedEntity(entity)}
              >
                {entity}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{currentAnalysis.total}</p>
            <p className="text-xs text-slate-600">Total {selectedEntity}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">{currentAnalysis.withNetwork}</p>
            <p className="text-xs text-slate-600">With Connections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-red-600">{currentAnalysis.isolated}</p>
            <p className="text-xs text-slate-600">Isolated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">{currentAnalysis.avgConnections}</p>
            <p className="text-xs text-slate-600">Avg Connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Network Score */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              {t({ en: 'Network Connectivity Score', ar: 'درجة الاتصال الشبكي' })}
            </span>
            <Badge className={networkScore >= 80 ? 'bg-green-600' : networkScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'}>
              {networkScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={networkScore} className="h-4 mb-4" />
          <p className="text-sm text-slate-600">
            {networkScore >= 80 ? '✅ Excellent network connectivity' :
              networkScore >= 50 ? '⚠️ Moderate connectivity - room for improvement' :
                '🚨 Low connectivity - many isolated entities'}
          </p>
        </CardContent>
      </Card>

      {/* Analysis by Entity */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'All Entities Network Analysis', ar: 'تحليل شبكة جميع الكيانات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(entityNetworkAnalysis).map(([entity, data]) => {
              const score = data.total > 0 ? Math.round((data.withNetwork / data.total) * 100) : 0;
              return (
                <div key={entity} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{entity}</h3>
                    <Badge className={score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                      {score}% connected
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600">Total</p>
                      <p className="font-bold text-slate-900">{data.total}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Connected</p>
                      <p className="font-bold text-green-600">{data.withNetwork}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Isolated</p>
                      <p className="font-bold text-red-600">{data.isolated}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Avg Links</p>
                      <p className="font-bold text-purple-600">{data.avgConnections}</p>
                    </div>
                  </div>
                  <Progress value={score} className="mt-3 h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(NetworkTabAnalysis, { requireAdmin: true });
