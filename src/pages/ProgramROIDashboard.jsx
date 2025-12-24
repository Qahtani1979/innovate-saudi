import { usePrograms } from '@/hooks/usePrograms';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  TrendingUp, DollarSign, Award, Lightbulb,
  TestTube, BarChart3, Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

import { Link } from 'react-router-dom';

function ProgramROIDashboard() {
  const { language, isRTL, t, createPageUrl } = useLanguage();

  const { programs } = usePrograms({ limit: 1000 });
  const { useProgramApplications } = usePrograms();
  const { data: applications = [] } = useProgramApplications();

  const { useSolutions, usePilots } = useMatchingEntities();
  const { data: solutions = [] } = useSolutions();
  const { data: pilots = [] } = usePilots();

  const calculateROI = (program) => {
    const budget = program.funding_details?.total_pool || 0;
    const graduates = applications.filter(a =>
      a.program_id === program.id && a.graduation_status === 'graduated'
    ).length;

    const alumniSolutions = solutions.filter(s =>
      applications.some(a => a.program_id === program.id && a.applicant_email === s.created_by)
    ).length;

    const alumniPilots = pilots.filter(p =>
      applications.some(a => a.program_id === program.id && a.applicant_email === p.created_by)
    ).length;

    const costPerGraduate = budget > 0 && graduates > 0 ? budget / graduates : 0;
    const outputsPerGraduate = graduates > 0 ? (alumniSolutions + alumniPilots) / graduates : 0;

    return {
      budget,
      graduates,
      alumniSolutions,
      alumniPilots,
      costPerGraduate,
      outputsPerGraduate,
      roiScore: outputsPerGraduate > 0 ? (outputsPerGraduate * 100000 / (costPerGraduate || 1)) : 0
    };
  };

  const programROIData = programs.map(p => ({
    ...p,
    roi: calculateROI(p)
  })).sort((a, b) => b.roi.roiScore - a.roi.roiScore);

  const totalBudget = programs.reduce((sum, p) => sum + (p.funding_details?.total_pool || 0), 0);
  const totalGraduates = applications.filter(a => a.graduation_status === 'graduated').length;
  const totalOutputs = solutions.length + pilots.length;

  const chartData = programROIData.slice(0, 10).map(p => ({
    name: p.name_en?.substring(0, 20) || 'Program',
    graduates: p.roi.graduates,
    outputs: p.roi.alumniSolutions + p.roi.alumniPilots,
    cost: p.roi.costPerGraduate / 1000
  }));

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: '💰 Program ROI Dashboard', ar: '💰 لوحة عائد الاستثمار للبرامج' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Analyze program efficiency and return on investment', ar: 'تحليل كفاءة البرامج وعائد الاستثمار' })}
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Investment', ar: 'إجمالي الاستثمار' })}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {(totalBudget / 1000000).toFixed(1)}M {t({ en: 'SAR', ar: 'ريال' })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Graduates', ar: 'إجمالي الخريجين' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{totalGraduates}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Outputs Generated', ar: 'المخرجات المولدة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{totalOutputs}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg Cost/Graduate', ar: 'متوسط التكلفة/خريج' })}</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {totalGraduates > 0 ? ((totalBudget / totalGraduates) / 1000).toFixed(0) : 0}K
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            {t({ en: 'Program Performance Comparison', ar: 'مقارنة أداء البرامج' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="graduates" fill="#8b5cf6" name={t({ en: 'Graduates', ar: 'خريجين' })} />
              <Bar dataKey="outputs" fill="#10b981" name={t({ en: 'Outputs', ar: 'مخرجات' })} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Program ROI Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Program ROI Analysis', ar: 'تحليل عائد الاستثمار للبرامج' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Program', ar: 'البرنامج' })}</th>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Budget', ar: 'الميزانية' })}</th>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Graduates', ar: 'الخريجون' })}</th>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Outputs', ar: 'المخرجات' })}</th>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Cost/Grad', ar: 'التكلفة/خريج' })}</th>
                  <th className="text-left p-3 text-sm font-semibold">{t({ en: 'Efficiency', ar: 'الكفاءة' })}</th>
                </tr>
              </thead>
              <tbody>
                {programROIData.slice(0, 15).map((program, idx) => (
                  <tr key={program.id} className="border-b hover:bg-slate-50">
                    <td className="p-3">
                      <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)} className="hover:text-blue-600">
                        <p className="font-medium">{program.name_en}</p>
                        <p className="text-xs text-slate-500">{program.program_type}</p>
                      </Link>
                    </td>
                    <td className="p-3 text-sm">{(program.roi.budget / 1000).toFixed(0)}K SAR</td>
                    <td className="p-3 text-sm">{program.roi.graduates}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {program.roi.alumniSolutions > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <Lightbulb className="h-3 w-3 mr-1" />
                            {program.roi.alumniSolutions}
                          </Badge>
                        )}
                        {program.roi.alumniPilots > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <TestTube className="h-3 w-3 mr-1" />
                            {program.roi.alumniPilots}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm">{(program.roi.costPerGraduate / 1000).toFixed(0)}K</td>
                    <td className="p-3">
                      <Badge className={
                        program.roi.outputsPerGraduate >= 0.5 ? 'bg-green-600 text-white' :
                          program.roi.outputsPerGraduate >= 0.3 ? 'bg-yellow-600 text-white' :
                            'bg-slate-400 text-white'
                      }>
                        {program.roi.outputsPerGraduate.toFixed(2)} outputs/grad
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramROIDashboard, { requireAdmin: true });