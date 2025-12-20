import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Star, TestTube, TrendingUp, Eye, Edit, Activity,
  CheckCircle2
} from 'lucide-react';

export default function ProviderSolutionCard({ solution, pilots, reviews, isSelected, onToggleSelect }) {
  const { language, isRTL, t } = useLanguage();

  const healthScore = calculateHealthScore(solution, pilots, reviews);
  const activePilots = pilots.filter(p => ['active', 'monitoring'].includes(p.stage));

  return (
    <Card className={`hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 mt-1"
          />
          <div className="flex-1 mx-3">
            <h3 className="font-bold text-slate-900 line-clamp-2">
              {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
            </h3>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge className={
                solution.maturity_level === 'proven' ? 'bg-green-600' :
                solution.maturity_level === 'market_ready' ? 'bg-blue-600' :
                'bg-slate-600'
              }>{solution.maturity_level}</Badge>
              {solution.is_verified && (
                <Badge className="bg-purple-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {solution.workflow_stage && (
                <Badge variant="outline">{solution.workflow_stage}</Badge>
              )}
            </div>
          </div>
          <HealthIndicator score={healthScore} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-2 bg-slate-50 rounded text-center">
            <TestTube className="h-4 w-4 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Pilots</p>
            <p className="font-bold text-slate-900">{pilots.length}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded text-center">
            <Star className="h-4 w-4 text-rose-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Rating</p>
            <p className="font-bold text-slate-900">{solution.average_rating?.toFixed(1) || 'N/A'}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded text-center">
            <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Deployments</p>
            <p className="font-bold text-slate-900">{solution.deployment_count || 0}</p>
          </div>
        </div>

        {/* Active Pilots Alert */}
        {activePilots.length > 0 && (
          <div className="p-2 bg-blue-50 rounded border border-blue-200 mb-3">
            <p className="text-xs text-blue-900 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {activePilots.length} active {activePilots.length === 1 ? 'pilot' : 'pilots'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              <Eye className="h-3 w-3 mr-1" />
              {t({ en: 'View', ar: 'عرض' })}
            </Button>
          </Link>
          <Link to={createPageUrl(`SolutionEdit?id=${solution.id}`)} className="flex-1">
            <Button size="sm" variant="outline" className="w-full">
              <Edit className="h-3 w-3 mr-1" />
              {t({ en: 'Edit', ar: 'تعديل' })}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthIndicator({ score }) {
  const color = score >= 80 ? 'bg-green-500' :
                score >= 60 ? 'bg-blue-500' :
                score >= 40 ? 'bg-amber-500' : 'bg-red-500';
  
  return (
    <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center text-white flex-shrink-0`}>
      <span className="text-sm font-bold">{score}</span>
    </div>
  );
}

function calculateHealthScore(solution, pilots, reviews) {
  let score = 50; // Base
  
  if (solution.is_verified) score += 15;
  if (solution.is_published) score += 10;
  if (solution.average_rating >= 4) score += 15;
  if (pilots.length > 0) score += 10;
  if (solution.deployment_count >= 3) score += 10;
  if (reviews.length >= 3) score += 5;
  
  return Math.min(100, Math.max(0, score));
}