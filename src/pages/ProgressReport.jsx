import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, Target, CheckCircle2, Award, BarChart3 } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProgressReport() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const progressData = [
    { sector: 'Transport', challenges: 25, pilots: 12, solutions: 18 },
    { sector: 'Environment', challenges: 18, pilots: 8, solutions: 14 },
    { sector: 'Digital', challenges: 22, pilots: 15, solutions: 20 },
    { sector: 'Urban', challenges: 30, pilots: 10, solutions: 16 }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Progress Report', ar: 'تقرير التقدم' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track innovation initiative progress across the platform', ar: 'تتبع تقدم مبادرات الابتكار عبر المنصة' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Challenges', ar: 'إجمالي التحديات' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{solutions.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Solutions', ar: 'الحلول' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{pilots.filter(p => p.stage === 'scaled').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Scaled', ar: 'تم التوسع' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Sector Progress', ar: 'تقدم القطاعات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="challenges" fill="#ef4444" name="Challenges" />
              <Bar dataKey="pilots" fill="#3b82f6" name="Pilots" />
              <Bar dataKey="solutions" fill="#8b5cf6" name="Solutions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Key Milestones', ar: 'المعالم الرئيسية' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label_en: 'Challenge Submission Rate', label_ar: 'معدل تقديم التحديات', value: 85, target: 100 },
                { label_en: 'Pilot Success Rate', label_ar: 'معدل نجاح التجارب', value: 78, target: 80 },
                { label_en: 'Scaling Conversion', label_ar: 'معدل التوسع', value: 45, target: 60 }
              ].map((milestone, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{language === 'ar' ? milestone.label_ar : milestone.label_en}</p>
                    <span className="text-sm text-slate-600">{milestone.value}% / {milestone.target}%</span>
                  </div>
                  <Progress value={(milestone.value / milestone.target) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Recent Achievements', ar: 'الإنجازات الأخيرة' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { text_en: '5 pilots scaled this month', text_ar: '5 تجارب تم توسيعها هذا الشهر', badge: 'Success' },
                { text_en: '12 new challenges approved', text_ar: '12 تحدي جديد تمت الموافقة عليه', badge: 'New' },
                { text_en: '8 solutions verified', text_ar: '8 حلول تم التحقق منها', badge: 'Verified' }
              ].map((achievement, i) => (
                <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-900">{language === 'ar' ? achievement.text_ar : achievement.text_en}</p>
                    <Badge className="bg-green-600 text-white">{achievement.badge}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}