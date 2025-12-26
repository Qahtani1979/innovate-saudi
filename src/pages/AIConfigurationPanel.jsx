import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Brain, Target, Shield, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function AIConfigurationPanel() {
  const { language, isRTL, t } = useLanguage();
  
  const [config, setConfig] = useState({
    matching_threshold: 75,
    anomaly_sensitivity: 70,
    risk_threshold_high: 80,
    risk_threshold_medium: 50,
    success_prediction_enabled: true,
    auto_suggestions_enabled: true,
    peer_comparison_enabled: true,
    min_confidence_score: 65,
    max_recommendations: 5,
    gap_analysis_depth: 80
  });

  const handleSave = () => {
    toast.success(t({ en: 'AI settings saved', ar: 'تم حفظ إعدادات الذكاء الاصطناعي' }));
  };

  const handleReset = () => {
    setConfig({
      matching_threshold: 75,
      anomaly_sensitivity: 70,
      risk_threshold_high: 80,
      risk_threshold_medium: 50,
      success_prediction_enabled: true,
      auto_suggestions_enabled: true,
      peer_comparison_enabled: true,
      min_confidence_score: 65,
      max_recommendations: 5,
      gap_analysis_depth: 80
    });
    toast.success(t({ en: 'Reset to defaults', ar: 'إعادة تعيين إلى الافتراضي' }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🤖 AI Configuration Panel', ar: '🤖 لوحة تكوين الذكاء الاصطناعي' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Configure AI model thresholds, sensitivity, and behavior', ar: 'تكوين عتبات النماذج الذكية والحساسية والسلوك' })}
        </p>
      </div>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Feature Toggles', ar: 'تبديل ميزات الذكاء الاصطناعي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">{t({ en: 'Success Prediction', ar: 'توقع النجاح' })}</p>
              <p className="text-sm text-slate-600">{t({ en: 'AI-powered pilot success forecasting', ar: 'توقع نجاح التجارب بالذكاء الاصطناعي' })}</p>
            </div>
            <Switch
              checked={config.success_prediction_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, success_prediction_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">{t({ en: 'Auto Suggestions', ar: 'الاقتراحات التلقائية' })}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Automatic AI recommendations in forms', ar: 'توصيات ذكية تلقائية في النماذج' })}</p>
            </div>
            <Switch
              checked={config.auto_suggestions_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, auto_suggestions_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-900">{t({ en: 'Peer Comparison', ar: 'المقارنة بالأقران' })}</p>
              <p className="text-sm text-slate-600">{t({ en: 'AI peer benchmarking and comparison', ar: 'المقارنة المرجعية بالذكاء الاصطناعي' })}</p>
            </div>
            <Switch
              checked={config.peer_comparison_enabled}
              onCheckedChange={(checked) => setConfig({ ...config, peer_comparison_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Model Thresholds', ar: 'عتبات النماذج الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">
                {t({ en: 'Matching Threshold', ar: 'عتبة المطابقة' })}
              </label>
              <Badge>{config.matching_threshold}%</Badge>
            </div>
            <Slider
              value={[config.matching_threshold]}
              onValueChange={(val) => setConfig({ ...config, matching_threshold: val[0] })}
              max={100}
              step={5}
            />
            <p className="text-xs text-slate-500 mt-2">
              {t({ en: 'Minimum AI confidence for solution-challenge matching', ar: 'الحد الأدنى لثقة الذكاء الاصطناعي في مطابقة الحل والتحدي' })}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">
                {t({ en: 'Anomaly Detection Sensitivity', ar: 'حساسية كشف الشذوذ' })}
              </label>
              <Badge>{config.anomaly_sensitivity}%</Badge>
            </div>
            <Slider
              value={[config.anomaly_sensitivity]}
              onValueChange={(val) => setConfig({ ...config, anomaly_sensitivity: val[0] })}
              max={100}
              step={5}
            />
            <p className="text-xs text-slate-500 mt-2">
              {t({ en: 'Higher = more sensitive to KPI anomalies', ar: 'أعلى = أكثر حساسية لشذوذ المؤشرات' })}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">
                {t({ en: 'Minimum Confidence Score', ar: 'الحد الأدنى لدرجة الثقة' })}
              </label>
              <Badge>{config.min_confidence_score}%</Badge>
            </div>
            <Slider
              value={[config.min_confidence_score]}
              onValueChange={(val) => setConfig({ ...config, min_confidence_score: val[0] })}
              max={100}
              step={5}
            />
            <p className="text-xs text-slate-500 mt-2">
              {t({ en: 'Minimum confidence to show AI recommendations', ar: 'الحد الأدنى للثقة لإظهار توصيات الذكاء الاصطناعي' })}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900">
                {t({ en: 'Gap Analysis Depth', ar: 'عمق تحليل الفجوات' })}
              </label>
              <Badge>{config.gap_analysis_depth}%</Badge>
            </div>
            <Slider
              value={[config.gap_analysis_depth]}
              onValueChange={(val) => setConfig({ ...config, gap_analysis_depth: val[0] })}
              max={100}
              step={10}
            />
            <p className="text-xs text-slate-500 mt-2">
              {t({ en: 'Depth of analysis for gap detection (higher = more thorough)', ar: 'عمق التحليل لاكتشاف الفجوات (أعلى = أكثر شمولاً)' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            {t({ en: 'Risk Assessment Thresholds', ar: 'عتبات تقييم المخاطر' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                {t({ en: 'High Risk Threshold', ar: 'عتبة المخاطر العالية' })}
              </label>
              <Input
                type="number"
                value={config.risk_threshold_high}
                onChange={(e) => setConfig({ ...config, risk_threshold_high: parseInt(e.target.value) })}
              />
              <p className="text-xs text-slate-500 mt-1">Score ≥ {config.risk_threshold_high} = High Risk</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                {t({ en: 'Medium Risk Threshold', ar: 'عتبة المخاطر المتوسطة' })}
              </label>
              <Input
                type="number"
                value={config.risk_threshold_medium}
                onChange={(e) => setConfig({ ...config, risk_threshold_medium: parseInt(e.target.value) })}
              />
              <p className="text-xs text-slate-500 mt-1">Score ≥ {config.risk_threshold_medium} = Medium Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            {t({ en: 'Recommendation Settings', ar: 'إعدادات التوصيات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-slate-900 mb-2 block">
              {t({ en: 'Max Recommendations per Query', ar: 'الحد الأقصى للتوصيات لكل استعلام' })}
            </label>
            <Input
              type="number"
              value={config.max_recommendations}
              onChange={(e) => setConfig({ ...config, max_recommendations: parseInt(e.target.value) })}
            />
            <p className="text-xs text-slate-500 mt-1">
              {t({ en: 'Number of AI suggestions to show (1-10)', ar: 'عدد الاقتراحات الذكية للعرض (1-10)' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
          <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Save Configuration', ar: 'حفظ التكوين' })}
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'Reset to Default', ar: 'إعادة تعيين' })}
        </Button>
      </div>
    </div>
  );
}

export default ProtectedPage(AIConfigurationPanel, { requireAdmin: true });
