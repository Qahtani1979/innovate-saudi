import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Handshake, MapPin, TrendingUp, CheckCircle2 } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function CollaborativePilots() {
  const { t } = useLanguage();

  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['pilot-collaborations'],
    queryFn: () => base44.entities.PilotCollaboration.list('-created_date')
  });

  const activeCollaborations = collaborations.filter(c => c.collaboration_status === 'active');

  const totalCities = new Set(
    collaborations.flatMap(c => c.participating_cities || [])
  ).size;

  const stats = {
    total: collaborations.length,
    active: activeCollaborations.length,
    cities_involved: totalCities,
    successful: collaborations.filter(c => c.collaboration_status === 'completed').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Collaborative Pilots', ar: 'التجارب التعاونية' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Cross-municipality pilot collaborations', ar: 'تعاونات التجارب بين البلديات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Handshake className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Collaborations', ar: 'التعاونات' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Active', ar: 'نشط' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.cities_involved}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Cities', ar: 'المدن' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.successful}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Successful', ar: 'ناجح' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Collaborations', ar: 'التعاونات النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCollaborations.map(collab => (
              <div key={collab.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t({ en: 'Pilot:', ar: 'تجربة:' })} {collab.pilot_id}
                    </h3>
                    {collab.collaboration_type && (
                      <Badge variant="outline" className="mb-2">{collab.collaboration_type}</Badge>
                    )}
                  </div>
                  <Badge className="bg-green-200 text-green-700">Active</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 mb-1">{t({ en: 'Cities:', ar: 'المدن:' })}</p>
                      <div className="flex flex-wrap gap-1">
                        {(collab.participating_cities || []).map((city, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{city}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {collab.lead_municipality_id && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{t({ en: 'Lead:', ar: 'القائد:' })}</span> {collab.lead_municipality_id}
                    </div>
                  )}

                  {collab.shared_learnings && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        {t({ en: 'Shared Learnings:', ar: 'التعلم المشترك:' })}
                      </p>
                      <p className="text-sm text-slate-700">{collab.shared_learnings}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(CollaborativePilots, { requireAdmin: true });