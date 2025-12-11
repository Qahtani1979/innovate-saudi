import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import PersonaPageLayout from '@/components/layout/PersonaPageLayout';
import PeerBenchmarkingTool from '@/components/municipalities/PeerBenchmarkingTool';
import { Users } from 'lucide-react';

const MunicipalityPeerMatcher = () => {
  const { language } = useLanguage();

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
        <PeerBenchmarkingTool />
      </div>
    </PersonaPageLayout>
  );
};

export default MunicipalityPeerMatcher;
