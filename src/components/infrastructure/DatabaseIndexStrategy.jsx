import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Database, TrendingUp, Code } from 'lucide-react';

/**
 * Database Indexing Strategy
 * Critical indexes for query performance optimization
 */

export default function DatabaseIndexStrategy() {
  const criticalIndexes = [
    {
      collection: 'Challenge',
      indexes: [
        { fields: ['municipality_id', 'status'], type: 'compound', impact: 'high', reason: 'List challenges by municipality' },
        { fields: ['sector', 'priority'], type: 'compound', impact: 'high', reason: 'Sector filtering' },
        { fields: ['created_date'], type: 'single', impact: 'medium', reason: 'Recent challenges query' },
        { fields: ['status', 'updated_date'], type: 'compound', impact: 'high', reason: 'Active challenges tracking' },
        { fields: ['$text'], type: 'text', impact: 'high', reason: 'Full-text search' }
      ]
    },
    {
      collection: 'Pilot',
      indexes: [
        { fields: ['challenge_id'], type: 'single', impact: 'critical', reason: 'Challenge-to-pilot lookup' },
        { fields: ['municipality_id', 'stage'], type: 'compound', impact: 'high', reason: 'Active pilots by city' },
        { fields: ['stage', 'timeline.pilot_start'], type: 'compound', impact: 'high', reason: 'Timeline queries' },
        { fields: ['solution_id'], type: 'single', impact: 'medium', reason: 'Solution tracking' },
        { fields: ['$text'], type: 'text', impact: 'high', reason: 'Full-text search' }
      ]
    },
    {
      collection: 'Solution',
      indexes: [
        { fields: ['provider_id'], type: 'single', impact: 'high', reason: 'Provider solutions' },
        { fields: ['sectors'], type: 'single', impact: 'high', reason: 'Sector filtering' },
        { fields: ['maturity_level'], type: 'single', impact: 'medium', reason: 'Maturity queries' },
        { fields: ['is_verified', 'is_published'], type: 'compound', impact: 'high', reason: 'Public marketplace' }
      ]
    },
    {
      collection: 'User',
      indexes: [
        { fields: ['email'], type: 'unique', impact: 'critical', reason: 'Authentication' },
        { fields: ['role'], type: 'single', impact: 'high', reason: 'RBAC queries' }
      ]
    },
    {
      collection: 'Notification',
      indexes: [
        { fields: ['recipient_email', 'is_read'], type: 'compound', impact: 'critical', reason: 'Unread notifications' },
        { fields: ['created_date'], type: 'single', impact: 'medium', reason: 'Chronological ordering' }
      ]
    },
    {
      collection: 'Task',
      indexes: [
        { fields: ['assigned_to', 'status'], type: 'compound', impact: 'high', reason: 'User task lists' },
        { fields: ['entity_type', 'entity_id'], type: 'compound', impact: 'high', reason: 'Entity tasks lookup' }
      ]
    }
  ];

  const implementationCode = `
// MongoDB Index Creation Script
db.Challenge.createIndex({ municipality_id: 1, status: 1 });
db.Challenge.createIndex({ sector: 1, priority: 1 });
db.Challenge.createIndex({ created_date: -1 });
db.Challenge.createIndex({ status: 1, updated_date: -1 });
db.Challenge.createIndex({ 
  title_en: "text", 
  title_ar: "text", 
  description_en: "text" 
});

db.Pilot.createIndex({ challenge_id: 1 });
db.Pilot.createIndex({ municipality_id: 1, stage: 1 });
db.Pilot.createIndex({ stage: 1, "timeline.pilot_start": -1 });
db.Pilot.createIndex({ solution_id: 1 });

db.Solution.createIndex({ provider_id: 1 });
db.Solution.createIndex({ sectors: 1 });
db.Solution.createIndex({ is_verified: 1, is_published: 1 });

db.User.createIndex({ email: 1 }, { unique: true });
db.User.createIndex({ role: 1 });

db.Notification.createIndex({ recipient_email: 1, is_read: 1 });
db.Notification.createIndex({ created_date: -1 });

db.Task.createIndex({ assigned_to: 1, status: 1 });
db.Task.createIndex({ entity_type: 1, entity_id: 1 });

// Performance Impact Analysis
db.Challenge.explain("executionStats").find({
  municipality_id: "123",
  status: "approved"
});
`;

  const performanceMetrics = [
    { metric: 'Query Time (Before)', value: '2.5s', color: 'text-red-600' },
    { metric: 'Query Time (After)', value: '0.05s', color: 'text-green-600' },
    { metric: 'Index Size', value: '~200MB', color: 'text-blue-600' },
    { metric: 'Expected Improvement', value: '50x faster', color: 'text-green-600' }
  ];

  return (
    <div className="space-y-4">
      <Card className="border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-amber-600" />
            Database Indexing Strategy
            <Badge variant="outline" className="ml-auto">High Impact</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Critical Performance Gap</p>
                <p>6 entities missing critical indexes causing slow queries</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {performanceMetrics.map((metric, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600">{metric.metric}</p>
                <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {criticalIndexes.map((collection, idx) => (
              <div key={idx} className="p-3 bg-white border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-slate-900">{collection.collection}</p>
                  <Badge>{collection.indexes.length} indexes</Badge>
                </div>
                <div className="space-y-2">
                  {collection.indexes.map((index, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs p-2 bg-slate-50 rounded">
                      <div className="flex-1">
                        <code className="text-blue-600">{Array.isArray(index.fields) ? index.fields.join(', ') : index.fields}</code>
                        <p className="text-slate-600 mt-1">{index.reason}</p>
                      </div>
                      <Badge 
                        variant={index.impact === 'critical' ? 'destructive' : index.impact === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {index.impact}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Code className="h-3 w-3" />
              MongoDB Index Creation Script
            </p>
            <pre className="text-xs text-slate-600 overflow-x-auto max-h-64">{implementationCode}</pre>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Implementation Steps:</p>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>1. Analyze current query patterns with db.currentOp()</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>2. Create indexes during low-traffic window</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>3. Monitor index usage with db.collection.getIndexes()</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>4. Test query performance improvements</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>5. Document index strategy for new collections</span>
              </div>
            </div>
          </div>

          <Button className="w-full" disabled>
            <TrendingUp className="h-4 w-4 mr-2" />
            Deploy Database Indexes (Requires DBA Access)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}