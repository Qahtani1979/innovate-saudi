import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Target } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SectorAnalyticsDashboard() {
  const { t } = useLanguage();

  const { useSectors, useChallenges, usePilots } = useMatchingEntities();

  const { data: sectors = [] } = useSectors();
  const { data: challenges = [] } = useChallenges({ limit: 2000 });
  const { data: pilots = [] } = usePilots({ limit: 2000 });

  const sectorData = sectors.map(sector => {
    const sectorChallenges = challenges.filter(c => c.sector === sector.code);
    const sectorPilots = pilots.filter(p => p.sector === sector.code);
    const successRate = sectorPilots.length > 0
      ? (sectorPilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length / sectorPilots.length * 100)
      : 0;

    return {
      name: sector.name_en,
      challenges: sectorChallenges.length,
      pilots: sectorPilots.length,
      successRate: Math.round(successRate)
    };
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          {t({ en: 'Sector Analytics Dashboard', ar: 'لوحة تحليلات القطاعات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Sector-specific performance and gap analysis', ar: 'أداء القطاعات وتحليل الفجوات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Challenges by Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="challenges" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pilot Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectorData} dataKey="pilots" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sectorData.map((sector, idx) => (
          <Card key={idx} className="border-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" style={{ color: COLORS[idx % COLORS.length] }} />
                {sector.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Challenges:</span>
                <Badge>{sector.challenges}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pilots:</span>
                <Badge>{sector.pilots}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Success Rate:</span>
                <Badge className={sector.successRate > 50 ? 'bg-green-600' : 'bg-amber-600'}>
                  {sector.successRate}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(SectorAnalyticsDashboard, { requiredPermissions: ['challenge_view_all'] });