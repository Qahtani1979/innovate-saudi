import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Calendar, Megaphone, Users, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageContext';

export function QuickActions({ onCreateEvent, onCreateProgram }) {
  const { t, isRTL } = useLanguage();

  const actions = [
    {
      icon: Plus,
      label: t({ en: 'New Program', ar: 'برنامج جديد' }),
      description: t({ en: 'Create innovation program', ar: 'إنشاء برنامج ابتكار' }),
      href: createPageUrl('ProgramCreate'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Calendar,
      label: t({ en: 'New Event', ar: 'فعالية جديدة' }),
      description: t({ en: 'Schedule an event', ar: 'جدولة فعالية' }),
      href: createPageUrl('EventCreate'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Megaphone,
      label: t({ en: 'New Campaign', ar: 'حملة جديدة' }),
      description: t({ en: 'Launch awareness campaign', ar: 'إطلاق حملة توعية' }),
      href: createPageUrl('CampaignPlanner'),
      color: 'bg-pink-600 hover:bg-pink-700'
    },
    {
      icon: Users,
      label: t({ en: 'View Applications', ar: 'عرض الطلبات' }),
      description: t({ en: 'Review pending applications', ar: 'مراجعة الطلبات المعلقة' }),
      href: createPageUrl('ApplicationReviewHub'),
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  return (
    <Card className="border-2 border-dashed border-muted">
      <CardContent className="pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">
          {t({ en: 'Quick Actions', ar: 'إجراءات سريعة' })}
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                size="sm" 
                className={`${action.color} text-white`}
              >
                <action.icon className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {action.label}
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;
