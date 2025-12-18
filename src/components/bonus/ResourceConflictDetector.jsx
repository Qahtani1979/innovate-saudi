import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { AlertCircle, Sparkles, Loader2, Users } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import {
  CONFLICT_DETECTOR_SYSTEM_PROMPT,
  buildConflictDetectorPrompt,
  CONFLICT_DETECTOR_SCHEMA
} from '@/lib/ai/prompts/bonus/conflictDetector';

export default function ResourceConflictDetector() {
  const { language, t } = useLanguage();
  const [conflicts, setConflicts] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const detectConflicts = async () => {
    const activePilots = pilots.filter(p => ['active', 'preparation'].includes(p.stage));
    const activePrograms = programs.filter(p => p.status === 'active');
    const activeRD = rdProjects.filter(r => r.status === 'active');

    const response = await invokeAI({
      prompt: buildConflictDetectorPrompt({ activePilots, activePrograms, activeRD }),
      system_prompt: CONFLICT_DETECTOR_SYSTEM_PROMPT,
      response_json_schema: CONFLICT_DETECTOR_SCHEMA
    });

    if (response.success) {
      setConflicts(response.data);
    }
  };

  return (
    <Card className="border-2 border-red-300">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            {t({ en: 'Resource Conflict Detector', ar: 'كاشف تعارض الموارد' })}
          </CardTitle>
          <Button onClick={detectConflicts} disabled={isLoading || !isAvailable} size="sm" className="bg-red-600">
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Detect', ar: 'كشف' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!conflicts && !isLoading && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI detects team over-allocation, budget conflicts, and timeline overlaps', ar: 'الذكاء يكتشف تخصيص الفريق الزائد وتعارضات الميزانية وتداخلات الجدول' })}
            </p>
          </div>
        )}

        {conflicts && (
          <div className="space-y-4">
            {conflicts.team_conflicts?.length > 0 && (
              <div className="p-4 bg-red-50 rounded border-2 border-red-300">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t({ en: 'Team Over-Allocation', ar: 'تخصيص الفريق الزائد' })} ({conflicts.team_conflicts.length})
                </h4>
                {conflicts.team_conflicts.map((conflict, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900">{conflict.person}</span>
                      <Badge className="bg-red-600">{conflict.severity}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      {t({ en: 'Assigned to:', ar: 'مخصص لـ:' })} {conflict.assigned_to.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {conflicts.budget_conflicts?.length > 0 && (
              <div className="p-4 bg-amber-50 rounded border-2 border-amber-300">
                <h4 className="font-semibold text-amber-900 mb-3">
                  {t({ en: '💰 Budget Conflicts', ar: '💰 تعارضات الميزانية' })} ({conflicts.budget_conflicts.length})
                </h4>
                {conflicts.budget_conflicts.map((conflict, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <p className="font-medium text-slate-900">{conflict.municipality}</p>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-600">Allocated: {conflict.total_allocated.toLocaleString()} SAR</span>
                      <span className="text-red-600 font-bold">Over by: {conflict.overage.toLocaleString()} SAR</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {conflicts.timeline_conflicts?.length > 0 && (
              <div className="p-4 bg-orange-50 rounded border-2 border-orange-300">
                <h4 className="font-semibold text-orange-900 mb-3">
                  {t({ en: '📅 Timeline Overlaps', ar: '📅 تداخلات الجدول' })} ({conflicts.timeline_conflicts.length})
                </h4>
                {conflicts.timeline_conflicts.map((conflict, i) => (
                  <div key={i} className="p-3 bg-white rounded mb-2">
                    <p className="font-medium text-slate-900">{conflict.resource}</p>
                    <p className="text-xs text-slate-600 mt-1">{conflict.dates}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {t({ en: 'Conflicts:', ar: 'تعارضات:' })} {conflict.overlapping_items.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {conflicts.recommendations?.length > 0 && (
              <div className="p-4 bg-blue-50 rounded border-2 border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-3">
                  {t({ en: '💡 Recommendations', ar: '💡 التوصيات' })}
                </h4>
                <ul className="space-y-2">
                  {conflicts.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-slate-700">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
