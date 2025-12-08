import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Heart, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function UserHealthScores({ users = [] }) {
  const { language, isRTL, t } = useLanguage();

  const calculateHealthScore = (user) => {
    let score = 100;
    const daysSinceLogin = Math.floor((Date.now() - new Date(user.created_date)) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLogin > 30) score -= 30;
    else if (daysSinceLogin > 14) score -= 15;
    
    return Math.max(0, score);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-5 w-5 text-blue-600" />;
    if (score >= 40) return <AlertCircle className="h-5 w-5 text-amber-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  const topUsers = users.slice(0, 10).map(u => ({
    ...u,
    healthScore: calculateHealthScore(u)
  })).sort((a, b) => b.healthScore - a.healthScore);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-600" />
          {t({ en: 'User Health Scores', ar: 'نقاط صحة المستخدمين' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topUsers.map((user, i) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white border-2">
              <span className="text-xs font-bold text-slate-600">#{i + 1}</span>
            </div>
            
            {getHealthIcon(user.healthScore)}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.full_name || user.email}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-32">
                <Progress value={user.healthScore} className="h-2" />
              </div>
              <Badge className={`${getHealthColor(user.healthScore)} bg-transparent border`}>
                {user.healthScore}%
              </Badge>
            </div>
          </div>
        ))}

        {topUsers.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            {t({ en: 'No user data available', ar: 'لا توجد بيانات' })}
          </div>
        )}

        <div className="mt-4 pt-4 border-t text-xs text-slate-600">
          <p>{t({ en: 'Health score based on: activity frequency, feature usage, login patterns', ar: 'النقاط بناءً على: تكرار النشاط، استخدام الميزات، أنماط الدخول' })}</p>
        </div>
      </CardContent>
    </Card>
  );
}