import { usePrograms } from '@/hooks/usePrograms';
import { useProgramPilotLinks } from '@/hooks/useProgramIntegrations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, TestTube, Target, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramImpactDashboard() {
  const { t } = useLanguage();

  const { data: programLinks = [], isLoading: linksLoading } = useProgramPilotLinks();
  const { programs, isLoading: programsLoading } = usePrograms();

  const isLoading = linksLoading || programsLoading;

  const conversionRate = programLinks.length > 0
    ? (programLinks.filter(pl => pl.conversion_status === 'converted').length / programLinks.length) * 100
    : 0;

  const byProgram = programs.map(prog => {
    const links = programLinks.filter(pl => pl.program_id === prog.id);
    const converted = links.filter(pl => pl.conversion_status === 'converted').length;
    return {
      name: prog.name_en || prog.name_ar,
      participants: links.length,
      converted,
      rate: links.length > 0 ? (converted / links.length) * 100 : 0
    };
  }).filter(p => p.participants > 0);

  const stats = {
    total_participants: programLinks.length,
    converted_to_pilots: programLinks.filter(pl => pl.conversion_status === 'converted').length,
    in_progress: programLinks.filter(pl => pl.conversion_status === 'in_progress').length,
    conversion_rate: conversionRate
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Program Impact Dashboard', ar: 'لوحة تأثير البرامج' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Program → Pilot conversion analytics', ar: 'تحليلات تحويل البرنامج إلى تجربة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total_participants}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Participants', ar: 'المشاركون' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <TestTube className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.converted_to_pilots}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Converted to Pilots', ar: 'تحول لتجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200">
          <CardContent className="pt-6 text-center">
            <Target className="h-10 w-10 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.in_progress}</p>
            <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{conversionRate.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Conversion Rate', ar: 'معدل التحويل' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Conversion by Program', ar: 'التحويل حسب البرنامج' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byProgram}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="converted" fill="#10b981" name="Converted" />
              <Bar dataKey="participants" fill="#3b82f6" name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramImpactDashboard, { requireAdmin: true });