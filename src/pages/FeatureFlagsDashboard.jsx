import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { Flag, TrendingUp, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function FeatureFlagsDashboard() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  
  // Fetch feature flags from platform_configs
  const { data: flagsConfig = [] } = useQuery({
    queryKey: ['platform-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_configs')
        .select('*')
        .eq('category', 'feature_flags');
      if (error) throw error;
      return data || [];
    }
  });
  
  // Default flags - will be merged with DB values
  const defaultFlags = [
    { id: 1, name: 'AI Matching Engine', key: 'ai_matching_engine', enabled: true, rollout: 100, users: 1250, experiments: 0 },
    { id: 2, name: 'Advanced Analytics', key: 'advanced_analytics', enabled: true, rollout: 75, users: 938, experiments: 1 },
    { id: 3, name: 'Team Workspaces', key: 'team_workspaces', enabled: false, rollout: 0, users: 0, experiments: 0 },
    { id: 4, name: 'Predictive Insights', key: 'predictive_insights', enabled: true, rollout: 50, users: 625, experiments: 2 }
  ];
  
  // Merge DB config with defaults
  const [flags, setFlags] = useState(defaultFlags);
  
  useEffect(() => {
    if (flagsConfig.length > 0) {
      setFlags(prev => prev.map(flag => {
        const dbConfig = flagsConfig.find(c => c.config_key === flag.key);
        if (dbConfig?.config_value) {
          return {
            ...flag,
            enabled: dbConfig.config_value.enabled ?? flag.enabled,
            rollout: dbConfig.config_value.rollout ?? flag.rollout
          };
        }
        return flag;
      }));
    }
  }, [flagsConfig]);
  
  // Toggle flag mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ key, enabled, rollout }) => {
      await supabase
        .from('platform_configs')
        .upsert({
          config_key: key,
          config_value: { enabled, rollout },
          category: 'feature_flags',
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'config_key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['platform-feature-flags']);
    }
  });

  const handleAIExperimentDesign = async (flag) => {
    const result = await invokeAI({
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
    
    if (result.success) {
      toast.success(t({ en: 'Experiment designed', ar: 'تم تصميم التجربة' }));
      console.log('Experiment Design:', result.data);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Flag}
        title={t({ en: 'Feature Flags & Experimentation', ar: 'أعلام الميزات والتجريب' })}
        description={t({ en: 'Control feature rollouts, run A/B tests, and manage gradual deployments', ar: 'التحكم في طرح الميزات، إجراء اختبارات A/B، وإدارة النشر التدريجي' })}
        stats={[
          { icon: Flag, value: flags.filter(f => f.enabled).length, label: t({ en: 'Active Flags', ar: 'أعلام نشطة' }) },
          { icon: Users, value: flags.reduce((sum, f) => sum + f.users, 0), label: t({ en: 'Users in Tests', ar: 'مستخدمون في التجارب' }) },
          { icon: TrendingUp, value: flags.reduce((sum, f) => sum + f.experiments, 0), label: t({ en: 'Running Experiments', ar: 'تجارب جارية' }) },
        ]}
      />
      <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />

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
                  <Button size="sm" variant="outline" onClick={() => handleAIExperimentDesign(flag)} disabled={aiLoading || !isAvailable}>
                    <Sparkles className="h-3 w-3" />
                  </Button>
                  <Switch checked={flag.enabled} onCheckedChange={(v) => {
                    const newFlags = [...flags];
                    const flagIndex = newFlags.findIndex(f => f.id === flag.id);
                    if (flagIndex >= 0) {
                      newFlags[flagIndex].enabled = v;
                      setFlags(newFlags);
                      toggleMutation.mutate({ key: flag.key, enabled: v, rollout: flag.rollout });
                    }
                  }} />
                </div>
              </div>
              <Progress value={flag.rollout} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(FeatureFlagsDashboard, { requireAdmin: true });