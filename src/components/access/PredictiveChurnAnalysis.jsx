import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { TrendingDown, AlertTriangle, Sparkles } from 'lucide-react';

export default function PredictiveChurnAnalysis({ users = [] }) {
  const { language, isRTL, t } = useLanguage();

  const atRiskUsers = [
    { email: 'user1@example.com', name: 'Ahmed Ali', churnRisk: 78, lastActivity: '15 days ago', reason: 'Low engagement' },
    { email: 'user2@example.com', name: 'Sara Mohammed', churnRisk: 65, lastActivity: '8 days ago', reason: 'Declining activity' },
    { email: 'user3@example.com', name: 'Khalid Hassan', churnRisk: 82, lastActivity: '22 days ago', reason: 'No recent logins' }
  ];

  const getRiskColor = (risk) => {
    if (risk >= 75) return 'red';
    if (risk >= 50) return 'amber';
    return 'green';
  };

  return (
    <Card className="border-2 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-600" />
          {t({ en: 'Predictive Churn Analysis', ar: 'تحليل توقع الانسحاب' })}
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm font-medium text-red-900">
            {atRiskUsers.length} {t({ en: 'users at risk of churning', ar: 'مستخدمون معرضون للانسحاب' })}
          </p>
        </div>

        <div className="space-y-3">
          {atRiskUsers.map((user, i) => {
            const color = getRiskColor(user.churnRisk);
            return (
              <div key={i} className={`p-4 bg-${color}-50 rounded-lg border-2 border-${color}-200`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </div>
                  <Badge className={`bg-${color}-600 text-white`}>
                    {user.churnRisk}% risk
                  </Badge>
                </div>
                
                <div className="mb-2">
                  <Progress value={user.churnRisk} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <AlertTriangle className="h-3 w-3" />
                    {user.reason}
                  </div>
                  <span className="text-slate-500">{user.lastActivity}</span>
                </div>

                <Button size="sm" variant="outline" className="mt-3 w-full">
                  {t({ en: 'Send Re-engagement Email', ar: 'إرسال بريد إعادة التفاعل' })}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
