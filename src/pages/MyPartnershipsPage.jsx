import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Handshake, Calendar, CheckCircle2, AlertTriangle, 
  Clock, TrendingUp, Users, FileText, ArrowRight, Activity
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';

function MyPartnershipsPage() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', user?.email)
        .single();
      return data;
    },
    enabled: !!user?.email
  });

  const { data: partnerships = [], isLoading } = useQuery({
    queryKey: ['my-partnerships', user?.email, userProfile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase.from('partnerships').select('*').eq('is_deleted', false);
      return (data || []).filter(p => 
        p.parties?.includes(userProfile?.organization_id) ||
        p.contact_email === user?.email ||
        p.created_by === user?.email
      );
    },
    enabled: !!user?.email && !!userProfile
  });

  const calculateHealthScore = (partnership) => {
    let score = 100;
    
    // Check deliverables
    const completedDeliverables = partnership.deliverables?.filter(d => d.status === 'completed').length || 0;
    const totalDeliverables = partnership.deliverables?.length || 1;
    const deliverableScore = (completedDeliverables / totalDeliverables) * 40;
    
    // Check communication frequency
    const lastMeeting = partnership.meetings?.[0]?.date;
    const daysSinceContact = lastMeeting ? differenceInDays(new Date(), new Date(lastMeeting)) : 90;
    const communicationScore = Math.max(0, 30 - (daysSinceContact / 3));
    
    // Check joint initiatives
    const initiativeScore = Math.min(30, (partnership.joint_initiatives?.length || 0) * 10);
    
    return Math.round(deliverableScore + communicationScore + initiativeScore);
  };

  const activePartnerships = partnerships.filter(p => p.status === 'active');
  const atRiskPartnerships = activePartnerships.filter(p => calculateHealthScore(p) < 50);
  const upcomingMilestones = partnerships.flatMap(p => 
    (p.milestones || [])
      .filter(m => m.status !== 'completed' && m.due_date)
      .map(m => ({ ...m, partnership: p }))
  ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).slice(0, 5);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-slate-500">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Handshake className="h-8 w-8 text-blue-600" />
          {t({ en: 'My Partnerships', ar: 'شراكاتي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Track your active partnerships, milestones, and deliverables', ar: 'تتبع شراكاتك النشطة والمعالم والمخرجات' })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <Handshake className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{activePartnerships.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Partnerships', ar: 'شراكات نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{atRiskPartnerships.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Need Attention', ar: 'تحتاج انتباه' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{upcomingMilestones.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Upcoming Milestones', ar: 'معالم قادمة' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {Math.round(activePartnerships.reduce((sum, p) => sum + calculateHealthScore(p), 0) / (activePartnerships.length || 1))}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Avg Health', ar: 'متوسط الصحة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* At-Risk Alert */}
      {atRiskPartnerships.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  {t({ en: `${atRiskPartnerships.length} Partnerships Need Attention`, ar: `${atRiskPartnerships.length} شراكات تحتاج انتباه` })}
                </h3>
                <p className="text-sm text-red-800">
                  {t({ en: 'Low communication or missed deliverables detected', ar: 'اتصال منخفض أو مخرجات مفقودة مكتشفة' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Partnerships Grid */}
      <div className="grid grid-cols-1 gap-4">
        {partnerships.map(partnership => {
          const healthScore = calculateHealthScore(partnership);
          const nextMilestone = partnership.milestones?.find(m => m.status !== 'completed');

          return (
            <Card key={partnership.id} className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{partnership.name_en || partnership.name_ar}</CardTitle>
                      <Badge className={
                        healthScore >= 70 ? 'bg-green-100 text-green-800' :
                        healthScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {t({ en: 'Health:', ar: 'الصحة:' })} {healthScore}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{partnership.parties?.length || 0} {t({ en: 'parties', ar: 'أطراف' })}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600">{t({ en: 'Deliverables', ar: 'المخرجات' })}</span>
                    <span className="font-medium">
                      {partnership.deliverables?.filter(d => d.status === 'completed').length || 0} / {partnership.deliverables?.length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all" 
                      style={{ 
                        width: `${partnership.deliverables?.length ? 
                          (partnership.deliverables.filter(d => d.status === 'completed').length / partnership.deliverables.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Next Milestone */}
                {nextMilestone && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{nextMilestone.name || t({ en: 'Next Milestone', ar: 'المعلم التالي' })}</span>
                      </div>
                      {nextMilestone.due_date && (
                        <Badge variant="outline">
                          {format(new Date(nextMilestone.due_date), 'MMM d')}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-lg font-bold text-slate-900">{partnership.meetings?.length || 0}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Meetings', ar: 'اجتماعات' })}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-lg font-bold text-slate-900">{partnership.joint_initiatives?.length || 0}</p>
                    <p className="text-xs text-slate-600">{t({ en: 'Initiatives', ar: 'مبادرات' })}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-lg font-bold text-slate-900">
                      {partnership.meetings?.[0]?.date ? 
                        `${differenceInDays(new Date(), new Date(partnership.meetings[0].date))}d` : 
                        'N/A'
                      }
                    </p>
                    <p className="text-xs text-slate-600">{t({ en: 'Last Contact', ar: 'آخر اتصال' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {partnerships.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Handshake className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No partnerships found', ar: 'لم يتم العثور على شراكات' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(MyPartnershipsPage, { requiredPermissions: [] });