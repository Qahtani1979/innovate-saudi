import React from 'react';
import StrategyToPartnershipGenerator from '@/components/strategy/cascade/StrategyToPartnershipGenerator';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyPartnershipGeneratorPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t({ en: 'Partnership Matcher', ar: 'مُطابق الشراكات' })}</h1>
        <p className="text-muted-foreground mt-1">{t({ en: 'Find strategic partners aligned with your objectives', ar: 'ابحث عن شركاء استراتيجيين متوافقين مع أهدافك' })}</p>
      </div>
      <StrategyToPartnershipGenerator />
    </div>
  );
}

export default ProtectedPage(StrategyPartnershipGeneratorPage, { requiredPermissions: ['strategy_cascade'] });
