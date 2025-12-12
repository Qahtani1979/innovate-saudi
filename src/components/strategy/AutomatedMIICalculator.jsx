import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calculator, RefreshCw, Loader2, Award, CheckCircle2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { useMIIData } from '@/hooks/useMIIData';

/**
 * AutomatedMIICalculator - Now uses the calculate-mii edge function
 * instead of AI-based calculation for consistent, reliable results.
 */
export default function AutomatedMIICalculator({ municipalityId }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [calculating, setCalculating] = useState(false);
  const [justCalculated, setJustCalculated] = useState(false);
  
  // Use the centralized MII data hook
  const { 
    latestResult, 
    radarData, 
    trend,
    strengths,
    improvementAreas,
    hasData,
    isLoading 
  } = useMIIData(municipalityId);

  const calculateMII = async () => {
    setCalculating(true);
    setJustCalculated(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-mii', {
        body: { municipality_id: municipalityId }
      });
      
      if (error) throw error;
      
      const result = data.results?.[0];
      if (result) {
        toast.success(t({ 
          en: `MII calculated: ${result.overall_score} points`, 
          ar: `تم حساب المؤشر: ${result.overall_score} نقطة` 
        }));
        setJustCalculated(true);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries(['mii-latest-result', municipalityId]);
        queryClient.invalidateQueries(['mii-history', municipalityId]);
        queryClient.invalidateQueries(['municipality', municipalityId]);
      }
    } catch (error) {
      console.error('MII calculation failed:', error);
      toast.error(t({ en: 'Calculation failed', ar: 'فشل الحساب' }));
    } finally {
      setCalculating(false);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-amber-600';

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            {t({ en: 'MII Calculator', ar: 'حاسبة المؤشر' })}
          </CardTitle>
          <Button 
            onClick={calculateMII} 
            disabled={calculating} 
            size="sm" 
            className="bg-amber-600 hover:bg-amber-700 gap-2"
          >
            {calculating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t({ en: 'Calculating...', ar: 'جاري الحساب...' })}
              </>
            ) : justCalculated ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                {t({ en: 'Done!', ar: 'تم!' })}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t({ en: 'Calculate', ar: 'حساب' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : !hasData ? (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'No MII data yet. Click Calculate to generate.', ar: 'لا توجد بيانات. انقر على حساب للتوليد.' })}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300 text-center">
              <Award className="h-10 w-10 text-amber-600 mx-auto mb-2" />
              <p className="text-5xl font-bold text-amber-600">{latestResult?.overall_score || 0}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'MII Score', ar: 'درجة المؤشر' })}</p>
              <div className={`flex items-center justify-center gap-1 mt-2 ${trendColor}`}>
                <TrendIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {trend === 'up' ? t({ en: 'Improving', ar: 'تحسن' }) : 
                   trend === 'down' ? t({ en: 'Declining', ar: 'تراجع' }) : 
                   t({ en: 'Stable', ar: 'مستقر' })}
                </span>
              </div>
            </div>

            {/* Dimension Scores */}
            {radarData.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {radarData.map(dim => (
                  <div key={dim.code} className="p-3 bg-slate-50 rounded border text-center">
                    <p className="text-2xl font-bold text-slate-700">{dim.value}</p>
                    <p className="text-xs text-slate-600">
                      {language === 'ar' ? dim.dimensionAr : dim.dimension}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="p-3 bg-green-50 rounded border border-green-300">
                <h4 className="font-semibold text-sm text-green-900 mb-2">
                  {t({ en: '💪 Strengths', ar: '💪 نقاط القوة' })}
                </h4>
                <ul className="space-y-1">
                  {strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700">✓ {s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvement Areas */}
            {improvementAreas.length > 0 && (
              <div className="p-3 bg-orange-50 rounded border border-orange-300">
                <h4 className="font-semibold text-sm text-orange-900 mb-2">
                  {t({ en: '📈 Improvement Areas', ar: '📈 مجالات التحسين' })}
                </h4>
                <ul className="space-y-1">
                  {improvementAreas.map((area, i) => (
                    <li key={i} className="text-sm text-slate-700">→ {area}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Calculated */}
            {latestResult?.assessment_date && (
              <p className="text-xs text-center text-slate-500">
                {t({ en: 'Last calculated:', ar: 'آخر حساب:' })} {latestResult.assessment_date}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
