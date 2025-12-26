import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Handshake, MapPin, TrendingUp, CheckCircle2, Plus } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { usePilotCollaborations } from '@/hooks/usePilotCollaborations';

function MultiCityCoordination() {
  const { t } = useLanguage();

  const { data: collaborations = [], isLoading } = usePilotCollaborations();

  const activeCollaborations = collaborations.filter(c => /** @type {any} */(c).collaboration_status === 'active');
  const successfulCollaborations = collaborations.filter(c => /** @type {any} */(c).collaboration_status === 'completed');

  const totalCities = new Set(
    collaborations.flatMap(c => /** @type {any} */(c).participating_cities || [])
  ).size;

  const stats = {
    total: collaborations.length,
    active: activeCollaborations.length,
    cities_involved: totalCities,
    successful: successfulCollaborations.length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Handshake}
        title={{ en: 'Multi-City Coordination', ar: 'التنسيق بين المدن' }}
        subtitle={{ en: 'Cross-municipality pilot collaborations and knowledge sharing', ar: 'تعاونات التجارب بين البلديات ومشاركة المعرفة' }}
        description={{ en: '', ar: '' }}
        stats={[
          { icon: Handshake, value: stats.total, label: { en: 'Total Collaborations', ar: 'إجمالي التعاونات' } },
          { icon: TrendingUp, value: stats.active, label: { en: 'Active', ar: 'نشط' } },
          { icon: MapPin, value: stats.cities_involved, label: { en: 'Cities', ar: 'مدن' } },
        ]}
        action={
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Collaboration', ar: 'تعاون جديد' })}
          </Button>
        }
        actions={<></>}
        children={<></>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Handshake className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Collaborations', ar: 'إجمالي التعاونات' })}</p>
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
            <p className="text-xs text-slate-600">{t({ en: 'Cities Involved', ar: 'المدن المشاركة' })}</p>
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
              <div key={collab.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {t({ en: 'Pilot ID:', ar: 'رقم التجربة:' })} {collab.pilot_id}
                    </h3>
                    {/** @type {any} */(collab).collaboration_type && (
                      <Badge variant="outline" className="mb-2">{/** @type {any} */(collab).collaboration_type}</Badge>
                    )}
                  </div>
                  <Badge className="bg-green-200 text-green-700">
                    {t({ en: 'Active', ar: 'نشط' })}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-slate-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 mb-1">
                        {t({ en: 'Participating Cities:', ar: 'المدن المشاركة:' })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(/** @type {any} */(collab).participating_cities || []).map((city, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{city}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/** @type {any} */(collab).lead_municipality_id && (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{t({ en: 'Lead Municipality:', ar: 'البلدية الرائدة:' })}</span> {/** @type {any} */(collab).lead_municipality_id}
                    </div>
                  )}

                  {/** @type {any} */(collab).shared_learnings && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        {t({ en: 'Shared Learnings:', ar: 'التعلم المشترك:' })}
                      </p>
                      <p className="text-sm text-slate-700">{/** @type {any} */(collab).shared_learnings}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {activeCollaborations.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {t({ en: 'No active collaborations', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªØ¹Ø§ÙˆÙ†Ø§Øª Ù†Ø´Ø·Ø©' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MultiCityCoordination, { requireAdmin: true });
