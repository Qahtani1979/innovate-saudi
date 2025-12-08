import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Users, AlertTriangle } from 'lucide-react';

export default function QuickEvaluationCard({ 
  evaluations = [], 
  compact = false 
}) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="text-xs text-slate-500 italic">
        No evaluations yet
      </div>
    );
  }

  const avgScore = evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length;
  
  const recommendations = evaluations.map(e => e.recommendation);
  const consensusRec = recommendations.reduce((acc, rec) => {
    acc[rec] = (acc[rec] || 0) + 1;
    return acc;
  }, {});
  const topRec = Object.entries(consensusRec).sort((a, b) => b[1] - a[1])[0];
  const consensusPercent = (topRec[1] / evaluations.length) * 100;

  const getRecommendationColor = (rec) => {
    if (rec.includes('approve')) return 'bg-green-100 text-green-700';
    if (rec.includes('reject')) return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Badge variant="outline">{evaluations.length} evaluators</Badge>
        <span className="font-semibold text-blue-600">{avgScore.toFixed(1)}/100</span>
        <Badge className={getRecommendationColor(topRec[0])}>
          {topRec[0]?.replace(/_/g, ' ')}
        </Badge>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-900">
              {evaluations.length} Expert{evaluations.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{avgScore.toFixed(1)}</p>
            <p className="text-xs text-slate-500">Avg Score</p>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">Consensus</span>
              <span className="font-semibold">{consensusPercent.toFixed(0)}%</span>
            </div>
            <Progress value={consensusPercent} className="h-2" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600">Recommendation:</span>
            <Badge className={getRecommendationColor(topRec[0])}>
              {topRec[0]?.replace(/_/g, ' ')}
            </Badge>
          </div>

          {consensusPercent < 70 && (
            <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              <AlertTriangle className="h-3 w-3" />
              <span>Low consensus - review needed</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}