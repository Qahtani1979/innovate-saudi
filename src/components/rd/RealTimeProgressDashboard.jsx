import { useRDProject } from '@/hooks/useRDData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '../LanguageContext';
import { Activity, BookOpen, Award, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RealTimeProgressDashboard({ projectId }) {
  const { language, isRTL, t } = useLanguage();

  const { data: project } = useRDProject(projectId);

  const milestones = project?.timeline?.milestones || [];
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = milestones.length > 0 ? (completedMilestones / milestones.length) * 100 : 0;

  const publications = project?.publications || [];
  const patents = project?.patents || [];
  const trlProgress = (project?.trl_current || 0) - (project?.trl_start || 0);

  const milestoneData = milestones.map(m => ({
    name: m.name_en?.substring(0, 15) || 'Milestone',
    status: m.status === 'completed' ? 100 : m.status === 'in_progress' ? 50 : 0
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Activity className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{progress.toFixed(0)}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{publications.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Publications', ar: 'المنشورات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{patents.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Patents', ar: 'براءات الاختراع' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 text-teal-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-teal-600">+{trlProgress}</p>
            <p className="text-xs text-slate-600">{t({ en: 'TRL Gain', ar: 'تقدم TRL' })}</p>
          </CardContent>
        </Card>
      </div>

      {milestoneData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">{t({ en: 'Milestone Progress', ar: 'تقدم المعالم' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={milestoneData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="status" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {progress < 50 && project?.status === 'active' && (
        <div className="p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
          <p className="font-semibold text-yellow-900 mb-1">
            ⚠️ {t({ en: 'Progress Alert', ar: 'تنبيه التقدم' })}
          </p>
          <p className="text-sm text-slate-700">
            {t({ en: 'Project is progressing slower than planned. Review timeline and resources.', ar: 'المشروع يتقدم أبطأ من المخطط. راجع الجدول الزمني والموارد.' })}
          </p>
        </div>
      )}
    </div>
  );
}
