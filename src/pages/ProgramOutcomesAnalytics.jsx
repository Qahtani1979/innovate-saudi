import { usePrograms } from '@/hooks/usePrograms';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Award, TrendingUp, Users, Rocket } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramOutcomesAnalytics() {
  const { language, isRTL, t } = useLanguage();

  const { programs } = usePrograms({ limit: 1000 }); // Fetch all programs
  const { useProgramApplications } = usePrograms();
  const { data: applications = [] } = useProgramApplications();

  const { usePilots } = useMatchingEntities();
  const { data: pilots = [] } = usePilots();

  const totalGraduates = applications.filter(a => a.status === 'graduated').length;
  const pilotsGenerated = programs.reduce((sum, p) => sum + (p.outcomes?.pilots_generated || 0), 0);
  const partnershipsFormed = programs.reduce((sum, p) => sum + (p.outcomes?.partnerships_formed || 0), 0);

  const programImpact = programs.map(p => ({
    name: (language === 'ar' && p.name_ar ? p.name_ar : p.name_en)?.substring(0, 20),
    pilots: p.outcomes?.pilots_generated || 0,
    partnerships: p.outcomes?.partnerships_formed || 0
  })).filter(p => p.pilots > 0 || p.partnerships > 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Program Outcomes & Impact', ar: 'نتائج البرامج والتأثير' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track program success and downstream impact', ar: 'تتبع نجاح البرامج والتأثير اللاحق' })}
        </p>
      </div>

      {/* Key Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalGraduates}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Graduates', ar: 'خريجون' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilotsGenerated}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilots Generated', ar: 'تجارب منتجة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{partnershipsFormed}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Partnerships', ar: 'شراكات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {applications.length > 0 ? Math.round((totalGraduates / applications.filter(a => a.status === 'enrolled').length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Graduation Rate', ar: 'معدل التخرج' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Program Impact */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Program Impact Comparison', ar: 'مقارنة تأثير البرامج' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={programImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="pilots" fill="#a855f7" name="Pilots" />
              <Bar dataKey="partnerships" fill="#10b981" name="Partnerships" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Success Stories */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top Performing Programs', ar: 'البرامج الأعلى أداءً' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {programs
            .filter(p => (p.outcomes?.pilots_generated || 0) > 0)
            .sort((a, b) => (b.outcomes?.pilots_generated || 0) - (a.outcomes?.pilots_generated || 0))
            .slice(0, 5)
            .map(program => (
              <div key={program.id} className="p-4 border-2 rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span>{program.outcomes.pilots_generated} {t({ en: 'pilots', ar: 'تجربة' })}</span>
                      <span>{program.outcomes.partnerships_formed || 0} {t({ en: 'partnerships', ar: 'شراكة' })}</span>
                    </div>
                  </div>
                  <Badge className="bg-green-600">{t({ en: 'High Impact', ar: 'تأثير عالي' })}</Badge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramOutcomesAnalytics, { requiredPermissions: [] });
