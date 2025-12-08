import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Flag, TrendingUp, Users, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function FeatureFlagsDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiLoading, setAiLoading] = useState(false);
  const [flags, setFlags] = useState([
    { id: 1, name: 'AI Matching Engine', enabled: true, rollout: 100, users: 1250, experiments: 0 },
    { id: 2, name: 'Advanced Analytics', enabled: true, rollout: 75, users: 938, experiments: 1 },
    { id: 3, name: 'Team Workspaces', enabled: false, rollout: 0, users: 0, experiments: 0 },
    { id: 4, name: 'Predictive Insights', enabled: true, rollout: 50, users: 625, experiments: 2 }
  ]);

  const handleAIExperimentDesign = async (flag) => {
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Design an A/B experiment for feature: ${flag.name}
Current rollout: ${flag.rollout}%
Active users: ${flag.users}

Suggest:
1. Experiment hypothesis
2. Success metrics
3. Sample size calculation
4. Duration recommendation
5. Risk assessment`,
        response_json_schema: {
          type: 'object',
          properties: {
            hypothesis: { type: 'string' },
            success_metrics: { type: 'array', items: { type: 'string' } },
            sample_size: { type: 'number' },
            duration_days: { type: 'number' },
            risks: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      toast.success(t({ en: 'Experiment designed', ar: 'تم تصميم التجربة' }));
      console.log('Experiment Design:', result);
    } catch (error) {
      toast.error(t({ en: 'AI design failed', ar: 'فشل التصميم' }));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🚩 Feature Flags & Experimentation', ar: '🚩 أعلام الميزات والتجريب' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Control feature rollouts, run A/B tests, and manage gradual deployments', ar: 'التحكم في طرح الميزات، إجراء اختبارات A/B، وإدارة النشر التدريجي' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Flag className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{flags.filter(f => f.enabled).length}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active Flags', ar: 'أعلام نشطة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{flags.reduce((sum, f) => sum + f.users, 0)}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Users in Experiments', ar: 'مستخدمون في التجارب' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{flags.reduce((sum, f) => sum + f.experiments, 0)}</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Running Experiments', ar: 'تجارب جارية' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{(flags.reduce((sum, f) => sum + f.rollout, 0) / flags.length).toFixed(0)}%</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Avg Rollout', ar: 'متوسط الطرح' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Feature Flags', ar: 'أعلام الميزات' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="p-4 bg-slate-50 rounded-lg border-2">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-slate-900">{flag.name}</h4>
                    <Badge className={flag.enabled ? 'bg-green-600' : 'bg-slate-400'}>
                      {flag.enabled ? t({ en: 'ON', ar: 'مفعل' }) : t({ en: 'OFF', ar: 'معطل' })}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>{flag.rollout}% rollout</span>
                    <span>{flag.users} users</span>
                    {flag.experiments > 0 && (
                      <Badge variant="outline" className="text-xs">{flag.experiments} experiments</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAIExperimentDesign(flag)} disabled={aiLoading}>
                    <Sparkles className="h-3 w-3" />
                  </Button>
                  <Switch checked={flag.enabled} onCheckedChange={(v) => {
                    const newFlags = [...flags];
                    newFlags[flag.id - 1].enabled = v;
                    setFlags(newFlags);
                  }} />
                </div>
              </div>
              <Progress value={flag.rollout} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(FeatureFlagsDashboard, { requireAdmin: true });