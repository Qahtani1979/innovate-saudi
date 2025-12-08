import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Heart, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export default function ChallengeHealthScore({ challenge }) {
  const { language, t } = useLanguage();
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    calculateHealth();
  }, [challenge.id]);

  const calculateHealth = async () => {
    const dataQuality = calculateDataQuality();
    const stakeholderEngagement = calculateStakeholderEngagement();
    const progressVelocity = calculateProgressVelocity();

    const overallScore = Math.round(
      dataQuality * 0.3 + 
      stakeholderEngagement * 0.3 + 
      progressVelocity * 0.4
    );

    const status = overallScore >= 80 ? 'healthy' : 
                   overallScore >= 60 ? 'warning' : 'critical';

    const issues = [];
    if (dataQuality < 60) issues.push(t({ en: 'Incomplete data', ar: 'بيانات غير مكتملة' }));
    if (stakeholderEngagement < 60) issues.push(t({ en: 'Low stakeholder activity', ar: 'نشاط أصحاب مصلحة منخفض' }));
    if (progressVelocity < 60) issues.push(t({ en: 'Slow progress', ar: 'تقدم بطيء' }));

    setHealthData({
      score: overallScore,
      status,
      dataQuality,
      stakeholderEngagement,
      progressVelocity,
      issues
    });
  };

  const calculateDataQuality = () => {
    const requiredFields = ['title_en', 'description_en', 'sector', 'municipality_id'];
    const optionalFields = ['kpis', 'stakeholders', 'data_evidence', 'budget_estimate'];
    
    const requiredFilled = requiredFields.filter(f => challenge[f]).length;
    const optionalFilled = optionalFields.filter(f => challenge[f]?.length > 0 || challenge[f]).length;
    
    return Math.round(((requiredFilled / requiredFields.length) * 0.7 + 
                       (optionalFilled / optionalFields.length) * 0.3) * 100);
  };

  const calculateStakeholderEngagement = () => {
    const hasStakeholders = challenge.stakeholders?.length > 0;
    const recentActivity = challenge.updated_date && 
      (new Date() - new Date(challenge.updated_date)) < 14 * 24 * 60 * 60 * 1000;
    
    let score = 50;
    if (hasStakeholders) score += 30;
    if (recentActivity) score += 20;
    
    return Math.min(score, 100);
  };

  const calculateProgressVelocity = () => {
    const statuses = {
      draft: 20,
      submitted: 40,
      under_review: 50,
      approved: 70,
      in_treatment: 85,
      resolved: 100
    };
    
    const baseScore = statuses[challenge.status] || 20;
    
    const daysSinceUpdate = challenge.updated_date ? 
      Math.floor((new Date() - new Date(challenge.updated_date)) / (1000 * 60 * 60 * 24)) : 999;
    
    const recencyPenalty = daysSinceUpdate > 30 ? -20 : daysSinceUpdate > 14 ? -10 : 0;
    
    return Math.max(baseScore + recencyPenalty, 0);
  };

  if (!healthData) return null;

  const Icon = healthData.status === 'healthy' ? CheckCircle :
               healthData.status === 'warning' ? AlertTriangle : Heart;

  const colorClass = healthData.status === 'healthy' ? 'border-green-300 bg-gradient-to-r from-green-50 to-emerald-50' :
                     healthData.status === 'warning' ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50' :
                     'border-red-300 bg-gradient-to-r from-red-50 to-rose-50';

  return (
    <Card className={`border-2 ${colorClass}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${
              healthData.status === 'healthy' ? 'text-green-600' :
              healthData.status === 'warning' ? 'text-yellow-600' :
              'text-red-600'
            }`} />
            {t({ en: 'Health Score', ar: 'درجة الصحة' })}
          </CardTitle>
          <Badge className={
            healthData.status === 'healthy' ? 'bg-green-600' :
            healthData.status === 'warning' ? 'bg-yellow-600' :
            'bg-red-600'
          }>
            {healthData.score}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t({ en: 'Data Quality', ar: 'جودة البيانات' })}</span>
              <span className="font-bold">{healthData.dataQuality}%</span>
            </div>
            <Progress value={healthData.dataQuality} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t({ en: 'Stakeholder Engagement', ar: 'مشاركة الأطراف' })}</span>
              <span className="font-bold">{healthData.stakeholderEngagement}%</span>
            </div>
            <Progress value={healthData.stakeholderEngagement} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t({ en: 'Progress Velocity', ar: 'سرعة التقدم' })}</span>
              <span className="font-bold">{healthData.progressVelocity}%</span>
            </div>
            <Progress value={healthData.progressVelocity} className="h-2" />
          </div>
        </div>

        {healthData.issues?.length > 0 && (
          <div className="p-3 bg-white rounded border-2 border-amber-300">
            <h4 className="font-semibold text-sm text-amber-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t({ en: 'Attention Needed', ar: 'يحتاج اهتمام' })}
            </h4>
            <ul className="space-y-1">
              {healthData.issues.map((issue, i) => (
                <li key={i} className="text-sm text-slate-700">• {issue}</li>
              ))}
            </ul>
          </div>
        )}

        {healthData.status === 'healthy' && (
          <div className="p-3 bg-green-100 rounded border border-green-300 text-center">
            <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-green-900">
              {t({ en: 'Challenge is healthy and progressing well', ar: 'التحدي صحي ويتقدم بشكل جيد' })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}