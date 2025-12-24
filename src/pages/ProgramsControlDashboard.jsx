import { useState } from 'react';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { useProgramApplications } from '@/hooks/useProgramApplications';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Calendar, Users, TrendingUp, Target, Sparkles, Loader2, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

function ProgramsControlDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: loading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: programs = [] } = useProgramsWithVisibility({ limit: 1000 });

  const { data: applications = [] } = useProgramApplications({ limit: 2000 });

  const activePrograms = programs.filter(p => p.status === 'active');
  const totalApplicants = applications.length;
  const acceptedApplicants = applications.filter(a => a.status === 'accepted' || a.status === 'enrolled').length;
  const graduatedCount = applications.filter(a => a.status === 'graduated').length;

  const programTypeData = programs.reduce((acc, p) => {
    const type = p.program_type || 'other';
    if (!acc[type]) acc[type] = { type, count: 0, active: 0 };
    acc[type].count++;
    if (p.status === 'active') acc[type].active++;
    return acc;
  }, {});

  const chartData = Object.values(programTypeData);

  const generatePortfolioInsights = async () => {
    const result = await invokeAI({
      prompt: `Analyze this program portfolio:

Total programs: ${programs.length}
Active: ${activePrograms.length}
Types: ${JSON.stringify(chartData)}
Applications: ${totalApplicants}
Acceptance rate: ${Math.round((acceptedApplicants / totalApplicants) * 100)}%
Graduation rate: ${Math.round((graduatedCount / acceptedApplicants) * 100)}%

Provide:
1. Portfolio balance assessment
2. Gaps in program offerings
3. Success patterns across program types
4. Recommendations for new programs`,
      response_json_schema: {
        type: 'object',
        properties: {
          balance_score: { type: 'number' },
          gaps: { type: 'array', items: { type: 'string' } },
          success_patterns: { type: 'array', items: { type: 'string' } },
          recommendations: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    if (result.success) {
      setAiInsights(result.data);
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Programs Portfolio Dashboard', ar: 'لوحة محفظة البرامج' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Unified view of all innovation programs', ar: 'عرض موحد لجميع برامج الابتكار' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('ProgramROIDashboard')}>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              {t({ en: 'ROI Analytics', ar: 'تحليلات العائد' })}
            </Button>
          </Link>
          <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} />
          <Button onClick={generatePortfolioInsights} disabled={loading || !isAvailable} className="bg-purple-600">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {t({ en: 'Portfolio Insights', ar: 'رؤى المحفظة' })}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{programs.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Programs', ar: 'إجمالي البرامج' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{activePrograms.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Programs', ar: 'برامج نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{totalApplicants}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Applicants', ar: 'إجمالي المتقدمين' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{graduatedCount}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Graduates', ar: 'خريجون' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'Portfolio Intelligence', ar: 'ذكاء المحفظة' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Portfolio Gaps', ar: 'فجوات المحفظة' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.gaps?.map((g, i) => <li key={i}>• {g}</li>)}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Recommendations', ar: 'التوصيات' })}</h4>
              <ul className="space-y-1 text-sm">
                {aiInsights.recommendations?.map((r, i) => <li key={i}>• {r}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Program Types Distribution', ar: 'توزيع أنواع البرامج' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Total" />
              <Bar dataKey="active" fill="#10b981" name="Active" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Programs */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Programs', ar: 'البرامج النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activePrograms.map(program => (
            <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
              <div className="p-4 border-2 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{program.program_type}</Badge>
                      <Badge variant="outline">{program.code}</Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {program.application_count || 0} {t({ en: 'applications', ar: 'طلب' })} •
                      {program.accepted_count || 0} {t({ en: 'accepted', ar: 'مقبول' })}
                    </p>
                  </div>
                  <Badge className="bg-green-600">{program.status}</Badge>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramsControlDashboard, { requiredPermissions: [] });