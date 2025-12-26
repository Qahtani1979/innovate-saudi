import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import PersonaPageLayout from '@/components/layout/PersonaPageLayout';
import PeerBenchmarkingTool from '@/components/municipalities/PeerBenchmarkingTool';
import { Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMunicipalitiesWithVisibility } from '@/hooks/useMunicipalitiesWithVisibility';

/**
 * MunicipalityPeerMatcher
 * ✅ GOLD STANDARD COMPLIANT
 */
const MunicipalityPeerMatcher = () => {
  const { language, t } = useLanguage();
  const { userProfile } = useAuth();

  const municipalityId = userProfile?.municipality_id;

  // Use visibility-aware hook with filter
  const { data: municipalities = [], isLoading } = useMunicipalitiesWithVisibility({
    filterIds: municipalityId ? [municipalityId] : [],
    limit: 1
  });

  const municipality = municipalities[0] || null;

  return (
    <PersonaPageLayout
      title={{
        en: "Municipality Peer Matcher",
        ar: "مطابقة الأقران البلدية"
      }}
      subtitle={{
        en: "Find and compare with similar municipalities",
        ar: "ابحث وقارن مع البلديات المماثلة"
      }}
      icon={<Users className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : municipality ? (
          <PeerBenchmarkingTool municipality={municipality} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {t ? t({
                en: 'No municipality assigned to your profile',
                ar: 'لم يتم تعيين بلدية لملفك الشخصي'
              }) : 'No municipality assigned to your profile'}
            </CardContent>
          </Card>
        )}
      </div>
    </PersonaPageLayout>
  );
};

export default MunicipalityPeerMatcher;
