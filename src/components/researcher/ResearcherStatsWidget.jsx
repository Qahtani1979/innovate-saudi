/**
 * Researcher Stats Widget
 * Displays researcher statistics and metrics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageContext';
import { 
  BookOpen, Award, Users, Beaker, FileText, TrendingUp, Target
} from 'lucide-react';

export default function ResearcherStatsWidget({ 
  publications = 0,
  citations = 0,
  hIndex = 0,
  activeProjects = 0,
  proposals = 0,
  collaborations = 0,
  profileCompleteness = 0
}) {
  const { t } = useLanguage();

  const stats = [
    { 
      label: { en: 'Publications', ar: 'المنشورات' }, 
      value: publications, 
      icon: BookOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: { en: 'Citations', ar: 'الاقتباسات' }, 
      value: citations, 
      icon: TrendingUp, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: { en: 'H-Index', ar: 'مؤشر H' }, 
      value: hIndex, 
      icon: Award, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    { 
      label: { en: 'Active Projects', ar: 'المشاريع النشطة' }, 
      value: activeProjects, 
      icon: Beaker, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: { en: 'Proposals', ar: 'المقترحات' }, 
      value: proposals, 
      icon: FileText, 
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    },
    { 
      label: { en: 'Collaborations', ar: 'التعاونات' }, 
      value: collaborations, 
      icon: Users, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-teal-600" />
          {t({ en: 'Research Metrics', ar: 'مقاييس البحث' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Completeness */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {t({ en: 'Profile Completeness', ar: 'اكتمال الملف' })}
            </span>
            <span className="font-medium">{profileCompleteness}%</span>
          </div>
          <Progress value={profileCompleteness} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={`text-center p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t(stat.label)}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
