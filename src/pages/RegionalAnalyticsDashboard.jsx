import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { MapPin, TrendingUp, Building2 } from 'lucide-react';
import { useLanguage } from '../components/LanguageContext';
import ProtectedPage from '../components/permissions/ProtectedPage';

function RegionalAnalyticsDashboard() {
  const { t } = useLanguage();

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list()
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const regionalData = regions.map(region => {
    const regionMunis = municipalities.filter(m => m.region_id === region.id);
    const muniIds = regionMunis.map(m => m.id);
    const regionPilots = pilots.filter(p => muniIds.includes(p.municipality_id));
    const avgMII = regionMunis.reduce((sum, m) => sum + (m.mii_score || 0), 0) / (regionMunis.length || 1);

    return {
      name: region.name_en,
      municipalities: regionMunis.length,
      pilots: regionPilots.length,
      avgMII: Math.round(avgMII),
      population: region.population || 0
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {t({ en: 'Regional Analytics Dashboard', ar: 'لوحة التحليلات الإقليمية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Regional innovation performance and coordination', ar: 'الأداء والتنسيق الإقليمي للابتكار' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pilots by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pilots" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Average MII by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgMII" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regionalData.map((region, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                {region.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Municipalities:</span>
                <Badge>{region.municipalities}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Pilots:</span>
                <Badge className="bg-purple-600">{region.pilots}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg MII:</span>
                <Badge className={region.avgMII > 50 ? 'bg-green-600' : 'bg-amber-600'}>
                  {region.avgMII}
                </Badge>
              </div>
              <Progress value={region.avgMII} className="mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ProtectedPage(RegionalAnalyticsDashboard, { requiredPermission: 'analytics_view' });