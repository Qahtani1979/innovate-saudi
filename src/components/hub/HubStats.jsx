import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Lightbulb, Target, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export function HubStats({ programs = [], events = [], campaigns = [] }) {
  const { t } = useLanguage();

  const stats = [
    {
      icon: Lightbulb,
      value: programs.length,
      label: t({ en: 'Total Programs', ar: 'إجمالي البرامج' }),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Calendar,
      value: events.filter(e => e.status === 'upcoming' || e.status === 'published').length,
      label: t({ en: 'Upcoming Events', ar: 'الفعاليات القادمة' }),
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Target,
      value: campaigns.filter(c => c.status === 'active').length,
      label: t({ en: 'Active Campaigns', ar: 'الحملات النشطة' }),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      icon: Users,
      value: programs.reduce((sum, p) => sum + (p.accepted_count || 0), 0),
      label: t({ en: 'Total Participants', ar: 'إجمالي المشاركين' }),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: TrendingUp,
      value: programs.filter(p => p.status === 'active').length,
      label: t({ en: 'Active Programs', ar: 'البرامج النشطة' }),
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Clock,
      value: events.filter(e => {
        const eventDate = new Date(e.start_date);
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return eventDate >= now && eventDate <= weekFromNow;
      }).length,
      label: t({ en: 'This Week', ar: 'هذا الأسبوع' }),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} border-0`}>
          <CardContent className="pt-4 pb-4 text-center">
            <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default HubStats;
