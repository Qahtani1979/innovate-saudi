import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Database, TrendingUp, AlertCircle } from 'lucide-react';

export default function QueryOptimizationPanel() {
  const { t } = useLanguage();

  const optimizations = [
    { metric: 'Database Indexes', current: 'Basic', target: 'Comprehensive', impact: 'High' },
    { metric: 'Query Complexity', current: 'N+1 in some', target: 'Optimized', impact: 'High' },
    { metric: 'Pagination', current: 'Basic', target: 'Cursor-based', impact: 'Medium' },
    { metric: 'Eager Loading', current: 'Minimal', target: 'Strategic', impact: 'Medium' },
    { metric: 'Query Caching', current: 'None', target: 'Redis', impact: 'High' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          {t({ en: 'Query Optimization', ar: 'تحسين الاستعلامات' })}
          <Badge className="ml-auto bg-amber-600">Pending</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium">Performance Optimization Needed</p>
              <p>Database indexing, query optimization, and caching strategy required</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {optimizations.map((opt, idx) => (
            <div key={idx} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{opt.metric}</p>
                <Badge className={opt.impact === 'High' ? 'bg-red-600' : 'bg-amber-600'}>
                  {opt.impact} Impact
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Current: {opt.current}</span>
                <TrendingUp className="h-3 w-3 text-slate-400" />
                <span>Target: {opt.target}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Optimization tasks:</p>
          <ul className="space-y-1 ml-4">
            <li>• Create indexes on frequently queried fields</li>
            <li>• Optimize N+1 query patterns</li>
            <li>• Implement cursor-based pagination</li>
            <li>• Add query explain analysis</li>
            <li>• Profile slow queries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
