import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, TrendingDown, Minus, Loader2, BarChart3, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export function AIAttendancePredictor({ 
  event = {},
  registrationCount = 0,
  historicalData = [],
  onPredictionComplete
}) {
  const { t, isRTL } = useLanguage();
  const [prediction, setPrediction] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const generatePrediction = async () => {
    const prompt = `You are an event attendance prediction expert.

Analyze this event and predict attendance:
- Event Title: ${event.title_en || event.title_ar || 'Event'}
- Event Type: ${event.event_type || 'general'}
- Current Registrations: ${registrationCount}
- Max Capacity: ${event.max_participants || 'unlimited'}
- Days Until Event: ${event.start_date ? Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24)) : 'unknown'}
- Event Mode: ${event.event_mode || 'in-person'}
- Historical Average Attendance Rate: ${historicalData.length > 0 ? '75%' : 'No data'}

Provide your response as a JSON object:
{
  "predicted_attendance": 45,
  "attendance_rate": 85,
  "confidence": "high|medium|low",
  "trend": "up|down|stable",
  "factors": [
    {"factor": "Event type popular", "impact": "positive"},
    {"factor": "Weekday timing", "impact": "neutral"}
  ],
  "recommendations": [
    "Consider sending reminder emails 2 days before",
    "Current capacity seems appropriate"
  ],
  "risk_level": "low|medium|high",
  "no_show_estimate": 15
}`;

    const result = await invokeAI(prompt, 'json');
    if (result.success && result.data) {
      setPrediction(result.data);
      if (onPredictionComplete) {
        onPredictionComplete(result.data);
      }
    }
  };

  const getTrendIcon = () => {
    if (!prediction?.trend) return <Minus className="h-4 w-4 text-slate-500" />;
    if (prediction.trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (prediction.trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-slate-500" />;
  };

  const getConfidenceBadge = () => {
    const colors = {
      high: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-red-100 text-red-700'
    };
    return colors[prediction?.confidence] || colors.medium;
  };

  const getRiskBadge = () => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-amber-100 text-amber-700',
      high: 'bg-red-100 text-red-700'
    };
    return colors[prediction?.risk_level] || colors.medium;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Attendance Predictor', ar: 'متنبئ الحضور' })}
          </CardTitle>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!prediction ? (
          <div className="text-center py-4">
            <Users className="h-12 w-12 text-blue-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-2">
              {t({ en: 'Current Registrations', ar: 'التسجيلات الحالية' })}: <strong>{registrationCount}</strong>
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t({ 
                en: 'Predict final attendance and get optimization recommendations',
                ar: 'توقع الحضور النهائي واحصل على توصيات التحسين'
              })}
            </p>
            <Button 
              onClick={generatePrediction}
              disabled={isLoading || !isAvailable}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t({ en: 'Predicting...', ar: 'جاري التنبؤ...' })}
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {t({ en: 'Predict Attendance', ar: 'توقع الحضور' })}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Main Prediction */}
            <div className="p-4 bg-white rounded-lg border text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {getTrendIcon()}
                <span className="text-4xl font-bold text-blue-600">{prediction.predicted_attendance}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t({ en: 'Predicted Attendees', ar: 'الحضور المتوقع' })}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className={getConfidenceBadge()}>
                  {prediction.confidence} {t({ en: 'confidence', ar: 'ثقة' })}
                </Badge>
                <Badge className={getRiskBadge()}>
                  {prediction.risk_level} {t({ en: 'risk', ar: 'مخاطرة' })}
                </Badge>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="p-3 bg-white rounded-lg border">
              <div className="flex justify-between text-sm mb-2">
                <span>{t({ en: 'Expected Attendance Rate', ar: 'نسبة الحضور المتوقعة' })}</span>
                <span className="font-medium">{prediction.attendance_rate}%</span>
              </div>
              <Progress value={prediction.attendance_rate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {t({ en: 'Estimated no-shows', ar: 'عدم الحضور المتوقع' })}: ~{prediction.no_show_estimate}
              </p>
            </div>

            {/* Factors */}
            {prediction.factors && prediction.factors.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium text-sm mb-2">{t({ en: 'Key Factors', ar: 'العوامل الرئيسية' })}</p>
                <div className="space-y-1">
                  {prediction.factors.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        f.impact === 'positive' ? 'bg-green-500' :
                        f.impact === 'negative' ? 'bg-red-500' : 'bg-slate-400'
                      }`} />
                      <span>{f.factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="font-medium text-sm">{t({ en: 'Recommendations', ar: 'توصيات' })}</p>
                </div>
                <ul className="space-y-1">
                  {prediction.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              onClick={generatePrediction}
              className="w-full"
            >
              {t({ en: 'Refresh Prediction', ar: 'تحديث التنبؤ' })}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AIAttendancePredictor;
