import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Handshake, Calendar, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MyPartnerships() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('user_profiles').select('*').eq('user_email', user?.email).single();
      return data;
    },
    enabled: !!user
  });

  const { data: myPartnerships = [] } = useQuery({
    queryKey: ['my-partnerships', userProfile?.organization_id, user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('partnerships').select('*').eq('is_deleted', false);
      return (data || []).filter(p => 
        p.parties?.includes(userProfile?.organization_id) ||
        p.primary_contact_email === user?.email ||
        p.created_by === user?.email
      );
    },
    enabled: !!userProfile || !!user
  });

  const activePartnerships = myPartnerships.filter(p => p.status === 'active');
  const upcomingMilestones = myPartnerships.flatMap(p => 
    p.milestones?.filter(m => m.status !== 'completed' && new Date(m.due_date) > new Date()) || []
  );

  const calculateHealth = (partnership) => {
    if (!partnership.milestones) return 70;
    const total = partnership.milestones.length;
    const completed = partnership.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'My Partnerships & Collaborations', ar: 'شراكاتي وتعاوناتي' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Active partnerships and collaboration workspace', ar: 'الشراكات النشطة ومساحة التعاون' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Handshake className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{myPartnerships.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Partnerships', ar: 'إجمالي الشراكات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{activePartnerships.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{upcomingMilestones.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Upcoming Milestones', ar: 'المعالم القادمة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Partnerships */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Active Partnerships', ar: 'الشراكات النشطة' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activePartnerships.length === 0 ? (
            <p className="text-center text-slate-500 py-8">
              {t({ en: 'No active partnerships', ar: 'لا توجد شراكات نشطة' })}
            </p>
          ) : (
            activePartnerships.map((partnership) => {
              const health = calculateHealth(partnership);
              return (
                <div key={partnership.id} className="p-4 border-2 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{partnership.name_en}</h3>
                      <p className="text-sm text-slate-600 mt-1">{partnership.type}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{partnership.status}</Badge>
                        {partnership.start_date && (
                          <span className="text-xs text-slate-500">
                            {t({ en: 'Since', ar: 'منذ' })} {format(new Date(partnership.start_date), 'MMM yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${health >= 75 ? 'text-green-600' : health >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {health}%
                      </div>
                      <p className="text-xs text-slate-500">{t({ en: 'Health', ar: 'الصحة' })}</p>
                    </div>
                  </div>

                  {partnership.milestones && partnership.milestones.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-2">
                        {t({ en: 'Next Milestone', ar: 'المعلم التالي' })}:
                      </p>
                      {partnership.milestones.filter(m => m.status !== 'completed').slice(0, 1).map((milestone, i) => (
                        <div key={i} className="p-2 bg-blue-50 rounded text-sm">
                          <p className="font-medium text-slate-900">{milestone.name}</p>
                          {milestone.due_date && (
                            <p className="text-xs text-slate-600 mt-1">
                              {t({ en: 'Due', ar: 'مستحق' })}: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full">
                    {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Upcoming Partnership Milestones', ar: 'معالم الشراكات القادمة' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMilestones.slice(0, 5).map((milestone, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-900">{milestone.name}</span>
                </div>
                <p className="text-xs text-slate-600">
                  {t({ en: 'Due', ar: 'مستحق' })}: {format(new Date(milestone.due_date), 'MMMM dd, yyyy')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(MyPartnerships, { requiredPermissions: [] });