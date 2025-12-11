import React from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PersonaPageLayout from '@/components/layout/PersonaPageLayout';
import PeerBenchmarkingTool from '@/components/municipalities/PeerBenchmarkingTool';
import { Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const MunicipalityPeerMatcher = () => {
  const { language, t } = useLanguage();
  const { userProfile } = useAuth();

  const { data: municipality, isLoading } = useQuery({
    queryKey: ['my-municipality-peer', userProfile?.municipality_id],
    queryFn: async () => {
      if (!userProfile?.municipality_id) return null;
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('id', userProfile.municipality_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.municipality_id
  });

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
              {t ? t({ en: 'No municipality assigned to your profile', ar: 'لم يتم تعيين بلدية لملفك الشخصي' }) : 'No municipality assigned to your profile'}
            </CardContent>
          </Card>
        )}
      </div>
    </PersonaPageLayout>
  );
};

export default MunicipalityPeerMatcher;
