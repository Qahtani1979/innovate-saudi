import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, CheckCircle2, Circle } from 'lucide-react';

export default function TRLVisualization({ trl_start, trl_current, trl_target }) {
  const { language, t } = useLanguage();

  const trlDescriptions = {
    1: { en: 'Basic principles observed', ar: 'مبادئ أساسية ملاحظة' },
    2: { en: 'Technology concept formulated', ar: 'مفهوم التقنية محدد' },
    3: { en: 'Experimental proof of concept', ar: 'إثبات تجريبي للمفهوم' },
    4: { en: 'Technology validated in lab', ar: 'التقنية مختبرة في المختبر' },
    5: { en: 'Technology validated in relevant environment', ar: 'التقنية مختبرة في بيئة مناسبة' },
    6: { en: 'Technology demonstrated in relevant environment', ar: 'التقنية مُظهرة في بيئة مناسبة' },
    7: { en: 'System prototype demonstrated in operational environment', ar: 'نموذج أولي مُظهر في بيئة تشغيل' },
    8: { en: 'System complete and qualified', ar: 'النظام كامل ومؤهل' },
    9: { en: 'Actual system proven in operational environment', ar: 'النظام الفعلي مُثبت في بيئة تشغيل' }
  };

  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <TrendingUp className="h-5 w-5" />
          {t({ en: 'TRL Progression', ar: 'تقدم المستوى التقني' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Start', ar: 'البداية' })}</p>
            <p className="text-3xl font-bold text-blue-600">{trl_start || 'N/A'}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Current', ar: 'الحالي' })}</p>
            <p className="text-3xl font-bold text-green-600">{trl_current || trl_start || 'N/A'}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Target', ar: 'الهدف' })}</p>
            <p className="text-3xl font-bold text-purple-600">{trl_target || 'N/A'}</p>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="space-y-2">
          {levels.map((level) => {
            const isStart = level === trl_start;
            const isCurrent = level === (trl_current || trl_start);
            const isTarget = level === trl_target;
            const isPassed = level <= (trl_current || trl_start);
            const isPlanned = level > (trl_current || trl_start) && level <= trl_target;

            return (
              <div key={level} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isPassed ? 'bg-green-600 text-white' :
                  isPlanned ? 'bg-blue-100 text-blue-600 border-2 border-blue-300' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isPassed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold ${isPassed ? 'text-green-700' : 'text-slate-600'}`}>
                      TRL {level}
                    </span>
                    {isStart && <Badge className="bg-blue-600 text-xs">Start</Badge>}
                    {isCurrent && <Badge className="bg-green-600 text-xs">Current</Badge>}
                    {isTarget && <Badge className="bg-purple-600 text-xs">Target</Badge>}
                  </div>
                  <p className={`text-xs ${isPassed ? 'text-slate-700' : 'text-slate-500'}`}>
                    {t(trlDescriptions[level])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">
              {t({ en: 'Overall Progress', ar: 'التقدم الكلي' })}
            </span>
            <span className="text-sm font-bold text-green-600">
              {Math.round(((trl_current || trl_start || 1) - (trl_start || 1)) / ((trl_target || 9) - (trl_start || 1)) * 100)}%
            </span>
          </div>
          <Progress 
            value={((trl_current || trl_start || 1) - (trl_start || 1)) / ((trl_target || 9) - (trl_start || 1)) * 100}
            className="h-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}