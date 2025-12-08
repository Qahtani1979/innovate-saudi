import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Zap, Award, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';

export default function ClassificationDashboard({ application }) {
  const { language, isRTL, t } = useLanguage();

  const baseScore = application.evaluation_score?.base_score || 0;
  const bonusPoints = application.evaluation_score?.bonus_points || 0;
  const totalScore = baseScore + bonusPoints;

  // Determine classification
  let classification = 'not_qualified';
  let tier = { label_en: 'Not Qualified', label_ar: 'غير مؤهل', color: 'bg-red-600', icon: XCircle };

  if (totalScore >= 85 && baseScore >= 75 && bonusPoints >= 10) {
    classification = 'fast_pass';
    tier = { label_en: 'Fast Pass ⚡', label_ar: 'تمرير سريع ⚡', color: 'bg-purple-600', icon: Zap };
  } else if (totalScore >= 75) {
    classification = 'strong_qualified';
    tier = { label_en: 'Strong Qualified', label_ar: 'مؤهل قوي', color: 'bg-green-600', icon: Award };
  } else if (totalScore >= 60) {
    classification = 'conditional';
    tier = { label_en: 'Conditional', label_ar: 'مشروط', color: 'bg-amber-600', icon: AlertTriangle };
  }

  const Icon = tier.icon;

  return (
    <Card className={`border-4 ${classification === 'fast_pass' ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-white' : classification === 'strong_qualified' ? 'border-green-400 bg-gradient-to-br from-green-50 to-white' : classification === 'conditional' ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-white' : 'border-red-400 bg-gradient-to-br from-red-50 to-white'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Icon className={`h-8 w-8 text-white p-1.5 rounded-lg ${tier.color}`} />
          <div>
            <p className="text-2xl font-bold">{language === 'ar' ? tier.label_ar : tier.label_en}</p>
            <p className="text-sm text-slate-600 font-normal">{t({ en: 'Final Classification', ar: 'التصنيف النهائي' })}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-300">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Base Score', ar: 'الدرجة الأساسية' })}</p>
            <p className="text-4xl font-bold text-blue-600">{baseScore.toFixed(0)}</p>
            <Progress value={baseScore} className="h-2 mt-2" />
          </div>

          <div className="text-center p-4 bg-white rounded-lg border-2 border-amber-300">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Bonus Points', ar: 'النقاط الإضافية' })}</p>
            <p className="text-4xl font-bold text-amber-600">+{bonusPoints}</p>
            <p className="text-xs text-slate-500 mt-2">{t({ en: 'Max: 15', ar: 'الحد الأقصى: 15' })}</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-300">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Total Score', ar: 'المجموع الكلي' })}</p>
            <p className="text-4xl font-bold text-purple-600">{totalScore.toFixed(0)}</p>
            <Progress value={totalScore} className="h-2 mt-2" />
          </div>
        </div>

        {/* Next Actions */}
        <div className="p-4 rounded-lg" style={{
          backgroundColor: classification === 'fast_pass' ? '#f3e8ff' :
                          classification === 'strong_qualified' ? '#dcfce7' :
                          classification === 'conditional' ? '#fef3c7' : '#fee2e2'
        }}>
          <p className="font-semibold text-sm mb-2">
            {t({ en: '🎯 Recommended Action:', ar: '🎯 الإجراء الموصى به:' })}
          </p>
          <p className="text-sm">
            {classification === 'fast_pass' && t({ en: 'Priority treatment + direct acceleration to next stage', ar: 'معاملة ذات أولوية + تسريع مباشر للمرحلة التالية' })}
            {classification === 'strong_qualified' && t({ en: 'Move to next stage with priority', ar: 'الانتقال للمرحلة التالية مع الأولوية' })}
            {classification === 'conditional' && t({ en: 'Needs specific improvements before proceeding', ar: 'يحتاج تحسينات محددة قبل المتابعة' })}
            {classification === 'not_qualified' && t({ en: 'Temporary hold or reject', ar: 'إيقاف مؤقت أو رفض' })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}