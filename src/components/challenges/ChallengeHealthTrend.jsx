import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ChallengeHealthTrend({ challenge, historicalScores = [] }) {
  const { language, isRTL, t } = useLanguage();

  // Calculate health score based on various factors
  const calculateHealthScore = (challenge) => {
    let score = 50;
    
    // Status progression
    if (challenge.status === 'resolved') score += 30;
    else if (challenge.status === 'in_treatment') score += 20;
    else if (challenge.status === 'approved') score += 10;
    else if (challenge.status === 'under_review') score += 5;
    
    // Track assignment
    if (challenge.track && challenge.track !== 'none') score += 10;
    
    // Linked entities
    if (challenge.linked_pilot_ids?.length > 0) score += 10;
    if (challenge.linked_rd_ids?.length > 0) score += 5;
    
    // Activity
    if (challenge.view_count > 10) score += 5;
    
    // SLA compliance
    if (challenge.escalation_level === 0) score += 5;
    else if (challenge.escalation_level === 1) score -= 10;
    else if (challenge.escalation_level === 2) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  };

  const currentHealth = calculateHealthScore(challenge);
  
  // Determine trend
  const trend = historicalScores.length >= 2
    ? currentHealth > historicalScores[historicalScores.length - 2].score
      ? 'improving'
      : currentHealth < historicalScores[historicalScores.length - 2].score
      ? 'declining'
      : 'stable'
    : 'stable';

  const healthColor = currentHealth >= 70 ? 'green' : currentHealth >= 40 ? 'yellow' : 'red';

  return (
    <Card className={`border-2 border-${healthColor}-200 bg-gradient-to-br from-${healthColor}-50 to-white`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`h-5 w-5 text-${healthColor}-600`} />
          {t({ en: 'Challenge Health', ar: 'صحة التحدي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-5xl font-bold text-slate-900">{currentHealth}</p>
            <p className="text-sm text-slate-600 mt-1">
              {t({ en: 'Health Score', ar: 'درجة الصحة' })}
            </p>
          </div>
          <div className="text-right">
            <Badge className={
              trend === 'improving' ? 'bg-green-100 text-green-700' :
              trend === 'declining' ? 'bg-red-100 text-red-700' :
              'bg-slate-100 text-slate-700'
            }>
              {trend === 'improving' && <TrendingUp className="h-3 w-3 mr-1" />}
              {trend === 'declining' && <TrendingDown className="h-3 w-3 mr-1" />}
              {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
              {trend}
            </Badge>
          </div>
        </div>

        {/* Health Indicators */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-500">{t({ en: 'Status', ar: 'الحالة' })}</p>
            <p className="font-medium capitalize">{challenge.status?.replace(/_/g, ' ')}</p>
          </div>
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-500">{t({ en: 'Track', ar: 'المسار' })}</p>
            <p className="font-medium capitalize">{challenge.track?.replace(/_/g, ' ') || 'None'}</p>
          </div>
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-500">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
            <p className="font-medium">{challenge.linked_pilot_ids?.length || 0}</p>
          </div>
          <div className="p-2 bg-white rounded border">
            <p className="text-xs text-slate-500">{t({ en: 'Escalation', ar: 'التصعيد' })}</p>
            <p className={`font-medium ${
              challenge.escalation_level === 0 ? 'text-green-600' :
              challenge.escalation_level === 1 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {challenge.escalation_level === 0 ? 'None' :
               challenge.escalation_level === 1 ? 'Warning' : 'Critical'}
            </p>
          </div>
        </div>

        {/* Trend Chart */}
        {historicalScores.length >= 3 && (
          <div className="h-32 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}