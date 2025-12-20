import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Building2, AlertCircle, TestTube, Lightbulb, TrendingUp } from 'lucide-react';

export default function PlatformStatsWidget() {
  const { language, isRTL, t } = useLanguage();

  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-count'],
    queryFn: async () => {
      const { data } = await supabase.from('municipalities').select('id');
      return data || [];
    }
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges-count'],
    queryFn: async () => {
      const { data } = await supabase.from('challenges').select('id, created_at').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-count'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('id').eq('is_deleted', false);
      return data || [];
    }
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-count'],
    queryFn: async () => {
      const { data } = await supabase.from('solutions').select('id').eq('is_deleted', false);
      return data || [];
    }
  });

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const challengesThisMonth = challenges.filter(c => {
    const created = new Date(c.created_at);
    return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
  }).length;

  const stats = [
    { 
      label: { en: 'Municipalities', ar: 'البلديات' }, 
      value: municipalities.length, 
      icon: Building2, 
      color: 'text-blue-600',
      link: 'Organizations'
    },
    { 
      label: { en: 'Challenges', ar: 'التحديات' }, 
      value: challenges.length, 
      icon: AlertCircle, 
      color: 'text-red-600',
      change: challengesThisMonth,
      link: 'Challenges'
    },
    { 
      label: { en: 'Pilots', ar: 'التجارب' }, 
      value: pilots.length, 
      icon: TestTube, 
      color: 'text-purple-600',
      link: 'Pilots'
    },
    { 
      label: { en: 'Solutions', ar: 'الحلول' }, 
      value: solutions.length, 
      icon: Lightbulb, 
      color: 'text-amber-600',
      link: 'Solutions'
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          {t({ en: 'Platform Overview', ar: 'نظرة عامة على المنصة' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Link key={i} to={createPageUrl(stat.link)}>
                <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  <Icon className={`h-6 w-6 ${stat.color} mb-2`} />
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-600">{stat.label[language]}</p>
                  {stat.change && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      +{stat.change} {t({ en: 'this month', ar: 'هذا الشهر' })}
                    </Badge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}