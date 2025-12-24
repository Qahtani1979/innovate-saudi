import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useLanguage } from '../components/LanguageContext';
import WhatIfSimulator from '../components/strategy/WhatIfSimulator';
import HistoricalComparison from '../components/strategy/HistoricalComparison';
import CollaborationMapper from '../components/strategy/CollaborationMapper';
import ProtectedPage from '../components/permissions/ProtectedPage';

function WhatIfSimulatorPage() {
  const { language, isRTL, t } = useLanguage();

  const { data: challenges = [] } = useChallengesWithVisibility();
  const { data: pilots = [] } = usePilotsWithVisibility();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Advanced Analytics & Simulation', ar: 'التحليلات والمحاكاة المتقدمة' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Test scenarios, compare trends, and discover partnerships', ar: 'اختبار السيناريوهات، مقارنة الاتجاهات، واكتشاف الشراكات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatIfSimulator currentState={{ challenges, pilots }} />
        <CollaborationMapper />
      </div>

      <HistoricalComparison currentData={{ challenges, pilots }} />
    </div>
  );
}

export default ProtectedPage(WhatIfSimulatorPage, { requiredPermissions: [], requiredRoles: ['Executive Leadership', 'GDISB Strategy Lead'] });