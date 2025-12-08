import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Network, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function MultiCityOrchestration({ masterPilot }) {
  const { language, t } = useLanguage();

  const { data: childPilots = [] } = useQuery({
    queryKey: ['child-pilots', masterPilot.id],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.code?.includes(masterPilot.code) && p.id !== masterPilot.id);
    },
    initialData: []
  });

  const cityData = childPilots.map(p => ({
    city: p.municipality_id?.substring(0, 15) || 'Unknown',
    progress: Math.round((p.milestones?.filter(m => m.status === 'completed').length / (p.milestones?.length || 1)) * 100),
    kpiAchievement: p.kpis?.filter(k => k.status === 'on_track').length || 0
  }));

  const avgProgress = cityData.length > 0 
    ? Math.round(cityData.reduce((sum, c) => sum + c.progress, 0) / cityData.length)
    : 0;

  const onTrackCities = childPilots.filter(p => {
    const completedMilestones = p.milestones?.filter(m => m.status === 'completed').length || 0;
    const totalMilestones = p.milestones?.length || 1;
    return (completedMilestones / totalMilestones) >= 0.7;
  }).length;

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-purple-600" />
            {t({ en: 'Multi-City Orchestration', ar: 'تنسيق متعدد المدن' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-300 text-center">
              <p className="text-3xl font-bold text-blue-600">{childPilots.length}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Cities', ar: 'مدن' })}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <p className="text-3xl font-bold text-green-600">{avgProgress}%</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300 text-center">
              <p className="text-3xl font-bold text-purple-600">{onTrackCities}/{childPilots.length}</p>
              <p className="text-xs text-slate-600 mt-1">{t({ en: 'On Track', ar: 'على المسار' })}</p>
            </div>
          </div>

          {childPilots.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-slate-700 mb-3">
                {t({ en: 'Progress by City', ar: 'التقدم حسب المدينة' })}
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={cityData}>
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-2">
            {childPilots.map((city, i) => {
              const progress = Math.round((city.milestones?.filter(m => m.status === 'completed').length / (city.milestones?.length || 1)) * 100);
              return (
                <div key={i} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm text-slate-900">{city.municipality_id}</span>
                    <Badge className={progress >= 70 ? 'bg-green-600' : progress >= 50 ? 'bg-yellow-600' : 'bg-red-600'}>
                      {progress}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${progress >= 70 ? 'bg-green-600' : progress >= 50 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-blue-50 rounded border border-blue-300">
            <p className="text-xs text-slate-600">
              {t({ 
                en: 'Synchronized milestones and shared learnings across all cities enable consistent implementation', 
                ar: 'المعالم المتزامنة والتعلم المشترك عبر جميع المدن يمكّن التنفيذ المتسق' 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}