/**
 * Implementation Progress Tracker Page
 * Displays AI prompt module migration progress
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

const ImplementationProgressTracker = () => {
  const progressData = {
    totalModules: 368,
    categories: 142,
    components: { migrated: 94, total: 94, percentage: 100 },
    pages: { migrated: 100, total: 102, percentage: 98 },
    edgeFunctions: { migrated: 0, total: 2, percentage: 0 },
    overall: 99
  };

  const sessions = [
    { id: 53, modules: ['solutions/competitorAnalysis', 'challenges/trendPredictor'], status: 'complete' },
    { id: 52, modules: ['solutions/verification', 'pilots/riskMonitor', 'pilots/scalingRecommender', 'programs/applicationScreening'], status: 'complete' },
    { id: 51, modules: ['challenges/rdConversion', 'challenges/priorityMatrix', 'challenges/clusterAnalysis', 'citizen/engagementOptimizer'], status: 'complete' },
    { id: 50, modules: ['compliance/complianceAssessment', 'scheduling/planner'], status: 'complete' },
  ];

  const remaining = [
    { category: 'Pages', items: 2, priority: 'medium' },
    { category: 'Edge Functions', items: 2, priority: 'low' },
    { category: 'Quality Review', items: 'All', priority: 'future' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Prompt Modules - Implementation Progress</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Session 53
        </Badge>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Migration Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Progress value={progressData.overall} className="flex-1 h-4" />
            <span className="text-2xl font-bold">{progressData.overall}%</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{progressData.totalModules}+</div>
              <div className="text-sm text-muted-foreground">Prompt Modules</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary">{progressData.categories}+</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-green-600">{progressData.components.percentage}%</div>
              <div className="text-sm text-muted-foreground">Components</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{progressData.pages.percentage}%</div>
              <div className="text-sm text-muted-foreground">Pages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Phase Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Prompt Modules', progress: 100, status: 'complete' },
              { name: 'Components', progress: progressData.components.percentage, status: 'complete' },
              { name: 'Pages', progress: progressData.pages.percentage, status: 'in-progress' },
              { name: 'Edge Functions', progress: progressData.edgeFunctions.percentage, status: 'pending' },
            ].map((phase) => (
              <div key={phase.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{phase.name}</span>
                  <span className="font-medium">{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Remaining Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {remaining.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span>{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.items}</span>
                    <Badge variant={item.priority === 'future' ? 'secondary' : 'outline'}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <Badge variant="outline">Session {session.id}</Badge>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {session.modules.map((module) => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImplementationProgressTracker;
