import StrategyTimelinePlanner from '@/components/strategy/creation/StrategyTimelinePlanner';
import { useLanguage } from '@/components/LanguageContext';
import ProtectedPage from '@/components/permissions/ProtectedPage';

function StrategyTimelinePage() {
  const { t } = useLanguage();

  const handleSave = (data) => {
    console.log('Timeline data saved:', data);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {t({ en: 'Strategy Timeline', ar: 'الجدول الزمني للاستراتيجية' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ 
            en: 'Plan and visualize strategic milestones with Gantt charts and dependency tracking',
            ar: 'خطط وتصور المعالم الاستراتيجية باستخدام مخططات جانت وتتبع التبعيات'
          })}
        </p>
      </div>
      
      <StrategyTimelinePlanner onSave={handleSave} />
    </div>
  );
}

export default ProtectedPage(StrategyTimelinePage, { requiredPermissions: [] });
