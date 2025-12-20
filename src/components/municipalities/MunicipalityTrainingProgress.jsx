import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { BookOpen, Award, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function MunicipalityTrainingProgress({ enrollments = [] }) {
  const { language, isRTL, t } = useLanguage();

  // Mock data for demonstration
  const trainingData = [
    {
      id: 'challenge-design',
      title_en: 'Challenge Design Workshop',
      title_ar: 'ورشة تصميم التحديات',
      enrollmentDate: '2025-01-15',
      progress: 100,
      status: 'completed',
      completionDate: '2025-01-17',
      certificateUrl: '#'
    },
    {
      id: 'pilot-management',
      title_en: 'Pilot Management Fundamentals',
      title_ar: 'أساسيات إدارة التجارب',
      enrollmentDate: '2025-01-20',
      progress: 65,
      status: 'in_progress',
      nextSession: '2025-02-01'
    },
    {
      id: 'data-driven-decisions',
      title_en: 'Data-Driven Decision Making',
      title_ar: 'اتخاذ القرارات المبنية على البيانات',
      enrollmentDate: '2025-02-10',
      progress: 0,
      status: 'enrolled',
      startDate: '2025-02-15'
    }
  ];

  const completedCount = trainingData.filter(t => t.status === 'completed').length;
  const inProgressCount = trainingData.filter(t => t.status === 'in_progress').length;
  const totalProgress = (trainingData.reduce((sum, t) => sum + t.progress, 0) / trainingData.length).toFixed(0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{trainingData.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Enrolled', ar: 'إجمالي المسجلين' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{inProgressCount}</p>
              <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{completedCount}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-slate-900">{totalProgress}%</p>
              <p className="text-xs text-slate-600">{t({ en: 'Avg Progress', ar: 'التقدم المتوسط' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'My Training Programs', ar: 'برامجي التدريبية' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingData.map((training) => (
              <div key={training.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{language === 'ar' ? training.title_ar : training.title_en}</h4>
                    <p className="text-xs text-slate-600">
                      {t({ en: 'Enrolled', ar: 'مسجل' })}: {new Date(training.enrollmentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={
                    training.status === 'completed' ? 'bg-green-100 text-green-700' :
                    training.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }>
                    {training.status === 'completed' ? t({ en: 'Completed', ar: 'مكتمل' }) :
                     training.status === 'in_progress' ? t({ en: 'In Progress', ar: 'قيد التنفيذ' }) :
                     t({ en: 'Enrolled', ar: 'مسجل' })}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</span>
                    <span className="font-semibold">{training.progress}%</span>
                  </div>
                  <Progress value={training.progress} className="h-2" />
                </div>

                {training.status === 'completed' && training.certificateUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <Award className="h-4 w-4 text-green-600" />
                    <a href={training.certificateUrl} className="text-sm text-blue-600 hover:underline">
                      {t({ en: 'Download Certificate', ar: 'تحميل الشهادة' })}
                    </a>
                  </div>
                )}

                {training.status === 'in_progress' && training.nextSession && (
                  <p className="mt-3 text-sm text-slate-600">
                    {t({ en: 'Next session', ar: 'الجلسة القادمة' })}: {new Date(training.nextSession).toLocaleDateString()}
                  </p>
                )}

                {training.status === 'enrolled' && training.startDate && (
                  <p className="mt-3 text-sm text-slate-600">
                    {t({ en: 'Starts on', ar: 'تبدأ في' })}: {new Date(training.startDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}