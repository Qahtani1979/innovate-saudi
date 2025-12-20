import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Users, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';

export default function PeerBenchmarkingTool({ municipality }) {
  const { t, language } = useLanguage();
  const [showComparison, setShowComparison] = useState(false);

  // Use visibility-aware hooks for proper access control
  const { data: allMunicipalities = [] } = useMunicipalitiesWithVisibility();
  const { data: challenges = [] } = useChallengesWithVisibility();
  const { data: pilots = [] } = usePilotsWithVisibility();

  // Find peer municipalities (similar size or region)
  const peers = allMunicipalities.filter(m => 
    m.id !== municipality.id &&
    (m.city_type === municipality.city_type ||
     m.region === municipality.region ||
     Math.abs((m.population || 0) - (municipality.population || 0)) < municipality.population * 0.5)
  ).slice(0, 5);

  const calculateMetrics = (muni) => {
    const muniChallenges = challenges.filter(c => c.municipality_id === muni.id);
    const muniPilots = pilots.filter(p => p.municipality_id === muni.id);
    
    return {
      mii_score: muni.mii_score || 0,
      challenges_count: muniChallenges.length,
      active_pilots: muniPilots.filter(p => ['active', 'monitoring'].includes(p.stage)).length,
      completed_pilots: muniPilots.filter(p => p.stage === 'completed').length,
      resolution_rate: muniChallenges.length > 0 
        ? Math.round((muniChallenges.filter(c => c.status === 'resolved').length / muniChallenges.length) * 100)
        : 0
    };
  };

  const myMetrics = calculateMetrics(municipality);
  const peerMetrics = peers.map(p => ({ municipality: p, metrics: calculateMetrics(p) }));

  return (
    <Card className="border-2 border-teal-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600" />
          {t({ en: 'Peer Benchmarking', ar: 'المقارنة بالنظراء' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-4">
          <Button onClick={() => setShowComparison(!showComparison)} variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            {showComparison 
              ? t({ en: 'Hide Comparison', ar: 'إخفاء المقارنة' })
              : t({ en: 'Compare to Peers', ar: 'مقارنة بالنظراء' })}
          </Button>
        </div>

        {showComparison && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
              <p className="font-semibold text-blue-900 mb-3">{t({ en: 'My Performance', ar: 'أدائي' })}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-blue-700">MII Score</p>
                  <p className="text-2xl font-bold">{myMetrics.mii_score}</p>
                </div>
                <div>
                  <p className="text-blue-700">{t({ en: 'Active Pilots', ar: 'تجارب نشطة' })}</p>
                  <p className="text-2xl font-bold">{myMetrics.active_pilots}</p>
                </div>
                <div>
                  <p className="text-blue-700">{t({ en: 'Challenges', ar: 'تحديات' })}</p>
                  <p className="text-2xl font-bold">{myMetrics.challenges_count}</p>
                </div>
                <div>
                  <p className="text-blue-700">{t({ en: 'Resolution', ar: 'الحل' })}</p>
                  <p className="text-2xl font-bold">{myMetrics.resolution_rate}%</p>
                </div>
              </div>
            </div>

            <div>
              <p className="font-semibold text-sm mb-2">{t({ en: 'Peer Comparison', ar: 'مقارنة النظراء' })}</p>
              {peerMetrics.map(({ municipality: peer, metrics }) => (
                <Link key={peer.id} to={createPageUrl(`MunicipalityProfile?id=${peer.id}`)}>
                  <div className="p-3 mb-2 border rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{language === 'ar' && peer.name_ar ? peer.name_ar : peer.name_en}</p>
                      <Badge className={
                        metrics.mii_score > myMetrics.mii_score ? 'bg-green-600' :
                        metrics.mii_score === myMetrics.mii_score ? 'bg-blue-600' : 'bg-slate-600'
                      }>
                        MII: {metrics.mii_score}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className={metrics.active_pilots > myMetrics.active_pilots ? 'text-green-700' : 'text-slate-600'}>
                        {metrics.active_pilots} pilots
                      </div>
                      <div className={metrics.completed_pilots > myMetrics.completed_pilots ? 'text-green-700' : 'text-slate-600'}>
                        {metrics.completed_pilots} completed
                      </div>
                      <div className="text-slate-600">
                        {metrics.challenges_count} challenges
                      </div>
                      <div className={metrics.resolution_rate > myMetrics.resolution_rate ? 'text-green-700' : 'text-slate-600'}>
                        {metrics.resolution_rate}% resolved
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}