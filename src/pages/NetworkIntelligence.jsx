import { useState } from 'react';
import { useOrganizationsWithVisibility } from '@/hooks/useOrganizationsWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useRDProjects } from '@/hooks/useRDProjects';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Network, Sparkles, TrendingUp, Users, Building2, Zap, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { NETWORK_INTELLIGENCE_PROMPT_TEMPLATE, NETWORK_INTELLIGENCE_RESPONSE_SCHEMA } from '@/lib/ai/prompts/network/intelligence';

function NetworkIntelligence() {
  const { language, isRTL, t } = useLanguage();
  const [networkAnalysis, setNetworkAnalysis] = useState(null);
  const { invokeAI, status, isLoading: analyzing, rateLimitInfo, isAvailable } = useAIWithFallback();

  const { data: organizations = [] } = useOrganizationsWithVisibility({ includeAll: true });
  const { data: pilots = [] } = usePilotsWithVisibility({ includeAll: true });
  const { data: rdProjects = [] } = useRDProjects();

  const analyzeNetwork = async () => {
    const collaborationData = pilots.map(p => ({
      pilot: p.title_en,
      stakeholders: p.stakeholders?.map(s => s.name) || [],
      team: p.team?.map(t => t.organization) || []
    }));

    const { success, data } = await invokeAI({
      prompt: NETWORK_INTELLIGENCE_PROMPT_TEMPLATE({
        organizationCount: organizations.length,
        pilotCount: pilots.length,
        rdProjectCount: rdProjects.length,
        collaborationData: collaborationData.slice(0, 10)
      }),
      response_json_schema: NETWORK_INTELLIGENCE_RESPONSE_SCHEMA
    });

    if (success) {
      setNetworkAnalysis(data);
      toast.success(t({ en: 'Network analysis complete', ar: 'اكتمل تحليل الشبكة' }));
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Network Intelligence', ar: 'ذكاء الشبكة' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'AI-powered network analysis and partnership optimization', ar: 'تحليل الشبكة المدعوم بالذكاء الاصطناعي وتحسين الشراكات' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={analyzeNetwork} disabled={analyzing || !isAvailable} className="bg-gradient-to-r from-purple-600 to-pink-600">
            {analyzing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {analyzing ? t({ en: 'Analyzing...', ar: 'جاري التحليل...' }) : t({ en: 'Analyze Network', ar: 'تحليل الشبكة' })}
          </Button>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{organizations.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Organizations', ar: 'المنظمات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Network className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {pilots.reduce((sum, p) => sum + (p.team?.length || 0), 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Connections', ar: 'الاتصالات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">
              {pilots.filter(p => (p.stakeholders?.length || 0) >= 3).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Multi-Party', ar: 'متعدد الأطراف' })}</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${(networkAnalysis?.health_score || 0) >= 70 ? 'from-green-50' : 'from-amber-50'} to-white`}>
          <CardContent className="pt-6 text-center">
            <TrendingUp className={`h-10 w-10 ${(networkAnalysis?.health_score || 0) >= 70 ? 'text-green-600' : 'text-amber-600'} mx-auto mb-2`} />
            <p className={`text-3xl font-bold ${(networkAnalysis?.health_score || 0) >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
              {networkAnalysis?.health_score || '--'}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Health Score', ar: 'درجة الصحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {networkAnalysis && (
        <div className="space-y-6">
          {/* Top Connectors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                {t({ en: 'Network Influencers', ar: 'المؤثرون في الشبكة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {networkAnalysis.top_connectors?.map((connector, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{connector.organization}</p>
                        <p className="text-xs text-slate-600">{connector.connection_count} connections</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{connector.influence_score}</p>
                      <p className="text-xs text-slate-500">{t({ en: 'Influence', ar: 'التأثير' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Clusters */}
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5 text-purple-600" />
                {t({ en: 'Collaboration Clusters', ar: 'عناقيد التعاون' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {networkAnalysis.clusters?.map((cluster, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">{cluster.cluster_name}</h4>
                  <p className="text-sm text-slate-700 mb-2">{cluster.focus}</p>
                  <div className="flex flex-wrap gap-2">
                    {cluster.members?.map((member, i) => (
                      <Badge key={i} variant="outline">{member}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Network Gaps */}
          <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Zap className="h-5 w-5" />
                {t({ en: 'Strategic Gaps & Opportunities', ar: 'الفجوات والفرص الاستراتيجية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {networkAnalysis.gaps?.map((gap, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-red-200">
                  <Badge className="bg-red-100 text-red-700 mb-2">{gap.area}</Badge>
                  <p className="text-sm text-red-700 mb-2">⚠️ {gap.issue}</p>
                  <p className="text-sm text-slate-700">💡 <strong>{t({ en: 'Fix:', ar: 'الحل:' })}</strong> {gap.recommendation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strategic Introductions */}
          <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                {t({ en: 'AI-Recommended Introductions', ar: 'التوصيات الذكية للتعريف' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {networkAnalysis.introductions?.map((intro, idx) => (
                <div key={idx} className="p-4 bg-white rounded-lg border border-teal-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-700">{intro.party_a}</Badge>
                      <span className="text-slate-400">↔</span>
                      <Badge className="bg-purple-100 text-purple-700">{intro.party_b}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700">🤝 {intro.synergy}</p>
                  <Button size="sm" className="mt-3 bg-teal-600">
                    {t({ en: 'Facilitate Introduction', ar: 'تسهيل التعريف' })}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(NetworkIntelligence, { requiredPermissions: [] });
