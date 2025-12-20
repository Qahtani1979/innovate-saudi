import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from './LanguageContext';
import { CheckCircle2, Circle, Clock, Target } from 'lucide-react';

export default function ImplementationTracker({ category = 'strategic_planning' }) {
  const { language, isRTL, t } = useLanguage();

  const trackers = {
    strategic_planning: {
      title: { en: 'Strategic Planning Implementation', ar: 'تنفيذ التخطيط الاستراتيجي' },
      baseline: 14.1,
      items: [
        { name: 'Strategic Plan Builder', status: 'complete', coverage: 100, just_built: true },
        { name: 'Budget Allocation Tool', status: 'complete', coverage: 100, just_built: true },
        { name: 'Gap Analysis Tool (AI)', status: 'complete', coverage: 100, just_built: true },
        { name: 'Strategy Cockpit', status: 'complete', coverage: 100 },
        { name: 'Portfolio Heatmap', status: 'complete', coverage: 100 },
        { name: 'Pipeline Kanban', status: 'complete', coverage: 100 },
        { name: 'R&D Portfolio Planner', status: 'in_progress', coverage: 15 },
        { name: 'Program Portfolio Planner', status: 'in_progress', coverage: 20 },
        { name: 'Domain Taxonomy Builder', status: 'in_progress', coverage: 30 },
        { name: 'Portfolio Rebalancing Wizard', status: 'pending', coverage: 0 },
        { name: 'Strategic KPI Tracker', status: 'pending', coverage: 0 },
        { name: 'Technology Gap Planner', status: 'in_progress', coverage: 10 },
        { name: 'Campaign Planning Tool', status: 'in_progress', coverage: 5 },
        { name: 'Sandbox & Lab Strategy', status: 'complete', coverage: 100 }
      ]
    },
    admin_portal: {
      title: { en: 'Admin Portal Features', ar: 'ميزات بوابة المسؤول' },
      baseline: 78,
      items: [
        { name: 'Matchmaker Journey (10 gates)', status: 'complete', coverage: 100 },
        { name: 'AI Matchers (9 types)', status: 'complete', coverage: 100 },
        { name: 'Master Data Management', status: 'complete', coverage: 100 },
        { name: 'Workflow Automation', status: 'complete', coverage: 100 },
        { name: 'Bulk Operations', status: 'complete', coverage: 100 },
        { name: 'Analytics Suite', status: 'complete', coverage: 80 },
        { name: 'Strategic Planning', status: 'in_progress', coverage: 35, updating: true },
        { name: 'AI Configuration Panel', status: 'pending', coverage: 0 },
        { name: 'Enhanced Taxonomy UI', status: 'in_progress', coverage: 40 },
        { name: 'User Role Assignment UI', status: 'pending', coverage: 0 }
      ]
    }
  };

  const tracker = trackers[category];
  const currentCoverage = (tracker.items.reduce((sum, item) => sum + item.coverage, 0) / tracker.items.length).toFixed(1);
  const improvement = (currentCoverage - tracker.baseline).toFixed(1);
  const completed = tracker.items.filter(i => i.status === 'complete').length;

  const statusConfig = {
    complete: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    in_progress: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    pending: { icon: Circle, color: 'text-slate-400', bg: 'bg-slate-50' }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {tracker.title[language]}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-100 text-blue-700 text-lg px-3 py-1">
              {currentCoverage}%
            </Badge>
            {improvement > 0 && (
              <Badge className="bg-green-100 text-green-700">
                +{improvement}%
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3">
          <Progress value={parseFloat(currentCoverage)} className="h-3" />
          <p className="text-xs text-slate-500 mt-2">
            {completed}/{tracker.items.length} components complete
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tracker.items.map((item, idx) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;
            
            return (
              <div key={idx} className={`p-3 rounded-lg ${config.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-medium text-slate-900">{item.name}</span>
                    {item.just_built && (
                      <Badge className="bg-blue-600 text-white text-xs animate-pulse">
                        {t({ en: 'Just Built!', ar: 'تم البناء!' })}
                      </Badge>
                    )}
                    {item.updating && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {t({ en: 'Updating...', ar: 'جاري التحديث...' })}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{item.coverage}%</span>
                    <Progress value={item.coverage} className="h-1 w-20" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}