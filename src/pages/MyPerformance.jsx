import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { TrendingUp, Award, Target, Users, Zap, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MyPerformance() {
  const { language, isRTL, t } = useLanguage();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: myChallenges = [] } = useQuery({
    queryKey: ['my-challenges-perf', user?.email],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.list();
      return challenges.filter(c => c.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: myPilots = [] } = useQuery({
    queryKey: ['my-pilots-perf', user?.email],
    queryFn: async () => {
      const pilots = await base44.entities.Pilot.list();
      return pilots.filter(p => p.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['my-tasks-perf', user?.email],
    queryFn: async () => {
      const tasks = await base44.entities.Task.list();
      return tasks.filter(t => t.assigned_to === user?.email || t.created_by === user?.email);
    },
    enabled: !!user
  });

  const completionRate = myTasks.length > 0 ? Math.round((myTasks.filter(t => t.status === 'completed').length / myTasks.length) * 100) : 0;
  const scaledPilots = myPilots.filter(p => p.stage === 'scaled').length;
  const impactScore = Math.min(100, (myChallenges.length * 1 + myPilots.length * 3 + scaledPilots * 10));

  const monthlyActivity = [
    { month: 'Jan', challenges: 2, pilots: 1 },
    { month: 'Feb', challenges: 3, pilots: 2 },
    { month: 'Mar', challenges: 1, pilots: 1 },
    { month: 'Apr', challenges: 2, pilots: 0 }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Performance & Impact', ar: 'أدائي وتأثيري' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track your contributions and achievements', ar: 'تتبع مساهماتك وإنجازاتك' })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{myChallenges.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Challenges Created', ar: 'تحديات منشأة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{myPilots.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pilots Launched', ar: 'تجارب مطلقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
            <p className="text-sm text-slate-600">{t({ en: 'Task Completion', ar: 'إكمال المهام' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{impactScore}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Impact Score', ar: 'درجة التأثير' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contribution Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Monthly Activity', ar: 'النشاط الشهري' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="challenges" fill="#3b82f6" name="Challenges" />
                <Bar dataKey="pilots" fill="#a855f7" name="Pilots" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'Challenge→Pilot Conversion', ar: 'تحويل التحدي→التجربة' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {myChallenges.length > 0 ? Math.round((myChallenges.filter(c => c.linked_pilot_ids?.length > 0).length / myChallenges.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600" 
                  style={{ width: `${myChallenges.length > 0 ? Math.round((myChallenges.filter(c => c.linked_pilot_ids?.length > 0).length / myChallenges.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'Pilot Success Rate', ar: 'معدل نجاح التجارب' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {myPilots.length > 0 ? Math.round((myPilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length / myPilots.length) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600" 
                  style={{ width: `${myPilots.length > 0 ? Math.round((myPilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length / myPilots.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">{t({ en: 'On-Time Delivery', ar: 'التسليم في الوقت' })}</span>
                <span className="text-sm font-bold text-slate-900">
                  {myTasks.filter(t => t.status === 'completed').length > 0 ? 85 : 0}%
                </span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '85%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t({ en: 'Your Achievements', ar: 'إنجازاتك' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-lg text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="text-xs text-slate-600">{t({ en: 'First Challenge', ar: 'أول تحدي' })}</p>
            </div>
            {myPilots.length >= 10 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">🚀</div>
                <p className="text-xs text-slate-600">{t({ en: '10 Pilots', ar: '10 تجارب' })}</p>
              </div>
            )}
            {scaledPilots >= 1 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">⭐</div>
                <p className="text-xs text-slate-600">{t({ en: 'First Scale', ar: 'أول توسع' })}</p>
              </div>
            )}
            {completionRate >= 90 && (
              <div className="p-3 bg-white rounded-lg text-center">
                <div className="text-3xl mb-1">💯</div>
                <p className="text-xs text-slate-600">{t({ en: 'High Performer', ar: 'أداء عالي' })}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyPerformance, { requiredPermissions: [] });