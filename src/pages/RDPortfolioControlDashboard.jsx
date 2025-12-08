import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Microscope, BookOpen, Award, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RDPortfolioControlDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // RLS: Admins see all, researchers see their own projects
  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-portfolio', user?.email, user?.role],
    queryFn: async () => {
      const all = await base44.entities.RDProject.list();
      if (user?.role === 'admin') return all;
      return all.filter(p => 
        p.created_by === user?.email || 
        p.principal_investigator?.email === user?.email ||
        p.team_members?.some(m => m.email === user?.email)
      );
    },
    enabled: !!user
  });

  // RLS: R&D calls - admins see all, others see published only
  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls-portfolio', user?.role],
    queryFn: async () => {
      const all = await base44.entities.RDCall.list();
      if (user?.role === 'admin') return all;
      return all.filter(c => c.is_published);
    },
    enabled: !!user
  });

  const activeProjects = rdProjects.filter(p => p.status === 'active');
  const totalPublications = rdProjects.reduce((sum, p) => sum + (p.publications?.length || 0), 0);
  const totalPatents = rdProjects.reduce((sum, p) => sum + (p.patents?.length || 0), 0);
  const avgTRLGain = rdProjects
    .filter(p => p.trl_current && p.trl_start)
    .reduce((sum, p, _, arr) => sum + (p.trl_current - p.trl_start) / arr.length, 0);

  const researchAreaData = rdProjects.reduce((acc, p) => {
    const area = p.research_area_en || 'Other';
    if (!acc[area]) acc[area] = { area, count: 0 };
    acc[area].count++;
    return acc;
  }, {});

  const chartData = Object.values(researchAreaData);

  const generatePortfolioAnalysis = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze R&D portfolio:

Total projects: ${rdProjects.length}
Active: ${activeProjects.length}
Publications: ${totalPublications}
Patents: ${totalPatents}
Avg TRL gain: ${Math.round(avgTRLGain * 10) / 10}

Research areas: ${JSON.stringify(chartData)}

Provide:
1. Portfolio diversity assessment
2. Research gaps to address
3. Commercialization potential (TRL advancement)
4. Recommendations for next R&D calls`,
        response_json_schema: {
          type: 'object',
          properties: {
            diversity_score: { type: 'number' },
            gaps: { type: 'array', items: { type: 'string' } },
            commercialization_opportunities: { type: 'array', items: { type: 'string' } },
            call_recommendations: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      setAiAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'R&D Portfolio Dashboard', ar: 'لوحة محفظة البحث والتطوير' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Research portfolio overview and impact', ar: 'نظرة عامة على محفظة البحث والتأثير' })}
          </p>
        </div>
        <Button onClick={generatePortfolioAnalysis} disabled={loading} className="bg-purple-600">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {t({ en: 'Analyze Portfolio', ar: 'تحليل المحفظة' })}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Microscope className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{rdProjects.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'R&D Projects', ar: 'مشاريع البحث' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{totalPublications}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Publications', ar: 'المنشورات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{totalPatents}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Patents', ar: 'براءات الاختراع' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">+{Math.round(avgTRLGain * 10) / 10}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg TRL Gain', ar: 'متوسط كسب TRL' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis */}
      {aiAnalysis && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Portfolio Intelligence', ar: 'ذكاء المحفظة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Research Gaps', ar: 'فجوات البحث' })}</h4>
              <ul className="space-y-1 text-sm">{aiAnalysis.gaps?.map((g, i) => <li key={i}>• {g}</li>)}</ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Next R&D Calls', ar: 'دعوات البحث التالية' })}</h4>
              <ul className="space-y-1 text-sm">{aiAnalysis.call_recommendations?.map((r, i) => <li key={i}>• {r}</li>)}</ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Areas */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Research Areas Distribution', ar: 'توزيع مجالات البحث' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="area" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active R&D Projects', ar: 'مشاريع البحث النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeProjects.slice(0, 5).map(project => (
            <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
              <div className="p-4 border-2 rounded-lg hover:bg-purple-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{project.code}</Badge>
                    <h3 className="font-semibold text-slate-900">{project.title_en}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {project.institution_en} • TRL {project.trl_current || project.trl_start}
                    </p>
                  </div>
                  <Badge>{project.status}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(RDPortfolioControlDashboard, { 
  requiredPermissions: ['rd_view_portfolio'] 
});