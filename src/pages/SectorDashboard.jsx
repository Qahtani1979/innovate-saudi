import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, TestTube, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';

function SectorDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSector, setSelectedSector] = useState('urban_design');

  const sectors = [
    { value: 'urban_design', label: { en: 'Urban Design', ar: 'التصميم الحضري' } },
    { value: 'transport', label: { en: 'Transport', ar: 'النقل' } },
    { value: 'environment', label: { en: 'Environment', ar: 'البيئة' } },
    { value: 'digital_services', label: { en: 'Digital Services', ar: 'الخدمات الرقمية' } },
    { value: 'health', label: { en: 'Health', ar: 'الصحة' } },
    { value: 'safety', label: { en: 'Safety', ar: 'السلامة' } }
  ];

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges', selectedSector],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.sector === selectedSector);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots', selectedSector],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.sector === selectedSector);
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions', selectedSector],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.sectors?.includes(selectedSector));
    }
  });

  const { data: allTrends = [] } = useQuery({
    queryKey: ['sector-trends', selectedSector],
    queryFn: async () => {
      const trends = await base44.entities.TrendEntry.list();
      return trends.filter(t => t.sector === selectedSector && t.period?.includes('2025'));
    }
  });

  const trendData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => ({
    month,
    challenges: allTrends.filter(t => t.period?.includes(month) && t.metric_name === 'challenges_count')[0]?.metric_value || 0,
    pilots: allTrends.filter(t => t.period?.includes(month) && t.metric_name === 'pilots_count')[0]?.metric_value || 0,
  }));

  const statusData = [
    { status: 'Draft', count: challenges.filter(c => c.status === 'draft').length },
    { status: 'Active', count: challenges.filter(c => c.status === 'approved').length },
    { status: 'Resolved', count: challenges.filter(c => c.status === 'resolved').length },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Sector Dashboard', ar: 'لوحة القطاع' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Deep dive into sector-specific innovation', ar: 'غوص عميق في ابتكار القطاع' })}
          </p>
        </div>
        <Select value={selectedSector} onValueChange={setSelectedSector}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector.value} value={sector.value}>
                {sector.label[language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Challenges</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{challenges.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pilots</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{pilots.length}</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Solutions</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{solutions.length}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Pilots</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {pilots.filter(p => p.stage === 'in_progress').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Activity Trend', ar: 'اتجاه النشاط' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="challenges" stroke="#3b82f6" name="Challenges" />
              <Line type="monotone" dataKey="pilots" stroke="#a855f7" name="Pilots" />
            </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Challenge Status', ar: 'حالة التحديات' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            {t({ en: 'AI Sector Insights', ar: 'رؤى القطاع الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-blue-700">
              💡 {challenges.length} {t({ en: 'challenges', ar: 'تحدي' })} • {pilots.length} {t({ en: 'pilots', ar: 'تجربة' })} • {solutions.length} {t({ en: 'solutions', ar: 'حل' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm font-medium text-green-700">
              ✓ {pilots.filter(p => p.stage === 'in_progress').length} {t({ en: 'active pilots in this sector', ar: 'تجارب نشطة في هذا القطاع' })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Top Challenges', ar: 'أهم التحديات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {challenges.slice(0, 5).map((challenge) => (
              <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="block p-3 border rounded-lg hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" className="mb-1">{challenge.code}</Badge>
                    <p className="font-medium text-sm">{challenge.title_en}</p>
                  </div>
                  <Badge>{challenge.priority}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(SectorDashboard, { requiredPermissions: ['challenge_view_all'] });