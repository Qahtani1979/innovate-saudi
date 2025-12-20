import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { MapPin, TrendingUp, Building2, DollarSign } from 'lucide-react';

export default function MultiMunicipalityExpansionTracker({ providerId }) {
  const { t } = useLanguage();

  const { data: solutions = [] } = useQuery({
    queryKey: ['provider-solutions-expansion', providerId],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.provider_id === providerId);
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['provider-pilots-expansion', providerId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const all = await base44.entities.Pilot.list();
      return all.filter(p => solutionIds.includes(p.solution_id));
    },
    enabled: solutions.length > 0
  });

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-expansion'],
    queryFn: () => base44.entities.Municipality.list()
  });

  const uniqueMunicipalities = new Set(pilots.map(p => p.municipality_id));
  const expansionRate = pilots.length > 0 ? (uniqueMunicipalities.size / municipalities.length * 100).toFixed(1) : 0;

  const municipalityData = Array.from(uniqueMunicipalities).map(munId => {
    const mun = municipalities.find(m => m.id === munId);
    const munPilots = pilots.filter(p => p.municipality_id === munId);
    return {
      id: munId,
      name: mun?.name_en || 'Unknown',
      pilots: munPilots.length,
      active: munPilots.filter(p => p.stage === 'active').length,
      completed: munPilots.filter(p => p.stage === 'completed').length
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          {t({ en: 'Multi-Municipality Expansion', ar: 'التوسع متعدد البلديات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{uniqueMunicipalities.size}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Municipalities', ar: 'البلديات' })}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{expansionRate}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Market Penetration', ar: 'اختراق السوق' })}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{pilots.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Deployments', ar: 'إجمالي النشر' })}</p>
          </div>
        </div>

        {municipalityData.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">
              {t({ en: 'Expansion Map', ar: 'خريطة التوسع' })}
            </p>
            {municipalityData.map(mun => (
              <div key={mun.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-slate-900">{mun.name}</p>
                  <Badge>{mun.pilots} deployments</Badge>
                </div>
                <div className="flex gap-2 text-xs">
                  <Badge className="bg-green-100 text-green-700">{mun.active} active</Badge>
                  <Badge className="bg-blue-100 text-blue-700">{mun.completed} completed</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}