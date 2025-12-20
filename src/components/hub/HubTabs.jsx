import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Calendar, Megaphone, CalendarDays, Sparkles } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export function HubTabs({ activeTab, onTabChange, counts = {} }) {
  const { t } = useLanguage();

  const tabs = [
    {
      value: 'programs',
      icon: Lightbulb,
      label: t({ en: 'Programs', ar: 'البرامج' }),
      count: counts.programs || 0
    },
    {
      value: 'events',
      icon: Calendar,
      label: t({ en: 'Events', ar: 'الفعاليات' }),
      count: counts.events || 0
    },
    {
      value: 'campaigns',
      icon: Megaphone,
      label: t({ en: 'Campaigns', ar: 'الحملات' }),
      count: counts.campaigns || 0
    },
    {
      value: 'calendar',
      icon: CalendarDays,
      label: t({ en: 'Calendar', ar: 'التقويم' }),
      count: null
    },
    {
      value: 'analytics',
      icon: Sparkles,
      label: t({ en: 'AI Insights', ar: 'رؤى ذكية' }),
      count: null
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full h-auto flex-wrap justify-start gap-1 bg-muted/50 p-1">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {tab.count !== null && tab.count > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {tab.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default HubTabs;
