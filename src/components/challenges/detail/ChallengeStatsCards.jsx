import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from '@/components/LanguageContext';
import { TestTube, Lightbulb, Users, TrendingUp } from 'lucide-react';

export default function ChallengeStatsCards({ challenge, pilots = [], solutions = [], proposals = [] }) {
  const { t } = useLanguage();

  const stats = [
    {
      label: t({ en: 'Pilots', ar: 'التجارب' }),
      value: pilots.length,
      icon: TestTube,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: t({ en: 'Matched Solutions', ar: 'حلول مطابقة' }),
      value: solutions.length,
      icon: Lightbulb,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      label: t({ en: 'Proposals', ar: 'المقترحات' }),
      value: proposals.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: t({ en: 'Impact Score', ar: 'درجة التأثير' }),
      value: challenge.impact_score || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={stat.bgColor}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
