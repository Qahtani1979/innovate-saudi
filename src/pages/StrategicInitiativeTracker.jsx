import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Target, CheckCircle2, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import ProtectedPage from '../components/permissions/ProtectedPage';

function StrategicInitiativeTracker() {
  const { language, isRTL, t } = useLanguage();

  // Mock data - replace with real entity when StrategicInitiative entity is created
  const initiatives = [
    {
      id: 'I-2025-001',
      code: 'I-2025-001',
      title: { en: 'National Smart Parking Rollout', ar: 'طرح المواقف الذكية الوطنية' },
      owner: 'Dr. Ahmed Al-Rashid',
      status: 'active',
      progress: 65,
      milestones_completed: 4,
      milestones_total: 6,
      kpis_on_track: 3,
      kpis_total: 5,
      budget_spent: 85,
      health_score: 75
    },
    {
      id: 'I-2025-002',
      code: 'I-2025-002',
      title: { en: 'Digital Services Transformation', ar: 'تحول الخدمات الرقمية' },
      owner: 'Sarah Al-Omar',
      status: 'active',
      progress: 42,
      milestones_completed: 2,
      milestones_total: 7,
      kpis_on_track: 4,
      kpis_total: 6,
      budget_spent: 45,
      health_score: 82
    }
  ];

  const healthColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Strategic Initiative Tracker', ar: 'متتبع المبادرات الاستراتيجية' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track strategic initiatives with milestones and KPIs', ar: 'تتبع المبادرات الاستراتيجية مع المعالم والمؤشرات' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{initiatives.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Initiatives', ar: 'مبادرات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {Math.round(initiatives.reduce((sum, i) => sum + i.progress, 0) / initiatives.length)}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Progress', ar: 'متوسط التقدم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {initiatives.reduce((sum, i) => sum + i.milestones_completed, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Milestones Done', ar: 'معالم منجزة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">
              {initiatives.filter(i => i.health_score < 60).length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'At Risk', ar: 'في خطر' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Initiatives List */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Strategic Initiatives', ar: 'المبادرات الاستراتيجية' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {initiatives.map(initiative => (
            <div key={initiative.id} className="p-4 border-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{initiative.code}</Badge>
                    <Badge className={healthColor(initiative.health_score)}>
                      {t({ en: 'Health', ar: 'الصحة' })}: {initiative.health_score}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-900">{initiative.title[language]}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {t({ en: 'Owner', ar: 'المالك' })}: {initiative.owner}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">{t({ en: 'Progress', ar: 'التقدم' })}</p>
                  <Progress value={initiative.progress} className="h-2 mt-1" />
                  <p className="text-xs text-slate-600 mt-1">{initiative.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {initiative.milestones_completed}/{initiative.milestones_total}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t({ en: 'KPIs', ar: 'المؤشرات' })}</p>
                  <p className="text-sm font-medium text-slate-900">
                    {initiative.kpis_on_track}/{initiative.kpis_total} {t({ en: 'on track', ar: 'على المسار' })}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm">
                {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(StrategicInitiativeTracker, { requiredPermissions: [] });