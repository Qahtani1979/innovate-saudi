import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import {
  Handshake, Calendar, AlertTriangle,
  Clock, TrendingUp, Users, ArrowRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { useMyPartnerships } from '@/hooks/useMyPartnerships';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

function MyPartnershipsPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // GOLD STANDARD HOOK
  const {
    partnerships,
    stats,
    isLoading,
    isEmpty,
    totalPages
  } = useMyPartnerships(user?.email, { page, userId: user?.id });

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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6 text-center">
              <Handshake className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{stats.activeCount}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Active Partnerships', ar: 'شراكات نشطة' })}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{stats.atRiskCount}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Need Attention', ar: 'تحتاج انتباه' })}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-orange-600">{stats.upcomingMilestones.length}</p>
              <p className="text-sm text-slate-600">{t({ en: 'Upcoming Milestones', ar: 'معالم قادمة' })}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">
                {stats.avgHealth}%
              </p>
              <p className="text-sm text-slate-600">{t({ en: 'Avg Health', ar: 'متوسط الصحة' })}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* At-Risk Alert (Using stats data) */}
      {!isLoading && stats.atRiskCount > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  {t({ en: `${stats.atRiskCount} Partnerships Need Attention`, ar: `${stats.atRiskCount} شراكات تحتاج انتباه` })}
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
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      ) : isEmpty ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Handshake className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No partnerships found', ar: 'لم يتم العثور على شراكات' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {partnerships.map(partnership => {
            // Re-calculate health locally for individual cards if needed, OR move logic to utils.
            // For now, duplicate basic logic presentation.
            const calculateHealthScore = (p) => {
              const completedDel = p.deliverables?.filter(d => d.status === 'completed').length || 0;
              const totalDel = p.deliverables?.length || 1;
              const delScore = (completedDel / totalDel) * 40;
              const lastMeeting = p.meetings?.[0]?.date;
              const daysSince = lastMeeting ? differenceInDays(new Date(), new Date(lastMeeting)) : 90;
              const commScore = Math.max(0, 30 - (daysSince / 3));
              const initScore = Math.min(30, (p.joint_initiatives?.length || 0) * 10);
              return Math.round(delScore + commScore + initScore);
            };

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
      )}

      {/* PAGINATION UI */}
      {!isLoading && !isEmpty && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

export default ProtectedPage(MyPartnershipsPage, { requiredPermissions: [] });
