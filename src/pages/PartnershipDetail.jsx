import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Handshake, Users, FileText, TrendingUp, 
  Target, CheckCircle2, Clock, ArrowLeft, Edit, Sparkles
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';
import AIAgreementGenerator from '@/components/partnerships/AIAgreementGenerator';
import PartnershipEngagementTracker from '@/components/partnerships/PartnershipEngagementTracker';

function PartnershipDetail() {
  const { language, isRTL, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const partnershipId = searchParams.get('id');

  const { data: partnership, isLoading } = useQuery({
    queryKey: ['partnership', partnershipId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partnerships')
        .select('*')
        .eq('id', partnershipId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!partnershipId
  });

  const calculateHealthScore = (p) => {
    if (!p) return 0;
    let score = 100;
    
    const completedDeliverables = p.deliverables?.filter(d => d.status === 'completed').length || 0;
    const totalDeliverables = p.deliverables?.length || 1;
    const deliverableScore = (completedDeliverables / totalDeliverables) * 40;
    
    const lastMeeting = p.meeting_history?.[0]?.date;
    const daysSinceContact = lastMeeting ? differenceInDays(new Date(), new Date(lastMeeting)) : 90;
    const communicationScore = Math.max(0, 30 - (daysSinceContact / 3));
    
    const kpiScore = Math.min(30, (p.kpis?.filter(k => k.status === 'achieved').length || 0) * 10);
    
    return Math.round(deliverableScore + communicationScore + kpiScore);
  };

  const getStatusColor = (status) => {
    const colors = {
      prospect: 'bg-blue-100 text-blue-700',
      negotiation: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      completed: 'bg-slate-100 text-slate-700',
      suspended: 'bg-red-100 text-red-700',
      terminated: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!partnership) {
    return (
      <div className="text-center py-12">
        <Handshake className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600">{t({ en: 'Partnership not found', ar: 'الشراكة غير موجودة' })}</p>
      </div>
    );
  }

  const healthScore = partnership.health_score || calculateHealthScore(partnership);
  const completedMilestones = partnership.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = partnership.milestones?.length || 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('PartnershipRegistry')}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">
                {language === 'ar' && partnership.name_ar ? partnership.name_ar : partnership.name_en}
              </h1>
              <Badge className={getStatusColor(partnership.status)}>
                {partnership.status}
              </Badge>
              {partnership.is_strategic && (
                <Badge className="bg-purple-100 text-purple-700">
                  {t({ en: 'Strategic', ar: 'استراتيجي' })}
                </Badge>
              )}
            </div>
            <p className="text-slate-600">
              {partnership.partnership_type?.replace(/_/g, ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <p className={`text-3xl font-bold ${healthScore >= 70 ? 'text-green-600' : healthScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {healthScore}%
            </p>
            <p className="text-xs text-slate-600">{t({ en: 'Health Score', ar: 'درجة الصحة' })}</p>
          </div>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {t({ en: 'Edit', ar: 'تعديل' })}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{partnership.parties?.length || 0}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Parties', ar: 'الأطراف' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">
              {completedMilestones}/{totalMilestones}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Milestones', ar: 'المعالم' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{partnership.deliverables?.length || 0}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Deliverables', ar: 'المخرجات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">
              {partnership.partnership_value_estimate ? `${(partnership.partnership_value_estimate / 1000000).toFixed(1)}M` : 'N/A'}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Est. Value (SAR)', ar: 'القيمة المقدرة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
          <TabsTrigger value="parties">{t({ en: 'Parties', ar: 'الأطراف' })}</TabsTrigger>
          <TabsTrigger value="milestones">{t({ en: 'Milestones', ar: 'المعالم' })}</TabsTrigger>
          <TabsTrigger value="engagement">{t({ en: 'Engagement', ar: 'المشاركة' })}</TabsTrigger>
          <TabsTrigger value="ai">{t({ en: 'AI Tools', ar: 'أدوات الذكاء' })}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Partnership Details', ar: 'تفاصيل الشراكة' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{t({ en: 'Scope', ar: 'النطاق' })}</p>
                  <p className="text-slate-900">{partnership.scope_en || partnership.scope_ar || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</p>
                    <p className="text-slate-900">
                      {partnership.start_date ? format(new Date(partnership.start_date), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t({ en: 'End Date', ar: 'تاريخ الانتهاء' })}</p>
                    <p className="text-slate-900">
                      {partnership.end_date ? format(new Date(partnership.end_date), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                </div>
                {partnership.mou_signed_date && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">{t({ en: 'MOU Signed', ar: 'توقيع الاتفاقية' })}</p>
                    <p className="text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      {format(new Date(partnership.mou_signed_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                {partnership.agreement_url && (
                  <div>
                    <a href={partnership.agreement_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t({ en: 'View Agreement Document', ar: 'عرض وثيقة الاتفاقية' })}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t({ en: 'Performance Metrics', ar: 'مقاييس الأداء' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partnership.kpis && partnership.kpis.length > 0 ? (
                  partnership.kpis.map((kpi, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{kpi.name}</span>
                        <Badge className={kpi.status === 'achieved' ? 'bg-green-600' : 'bg-yellow-600'}>
                          {kpi.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Target: {kpi.target}</span>
                        <span>Actual: {kpi.actual || '-'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">{t({ en: 'No KPIs defined', ar: 'لا توجد مؤشرات أداء' })}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parties">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Partner Organizations', ar: 'المنظمات الشريكة' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {partnership.parties && partnership.parties.length > 0 ? (
                <div className="space-y-3">
                  {partnership.parties.map((party, i) => (
                    <div key={i} className="p-4 border-2 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{party.organization_name}</h4>
                          <Badge variant="outline">{party.role}</Badge>
                        </div>
                        {party.contact_email && (
                          <span className="text-sm text-slate-600">{party.contact_email}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">{t({ en: 'No parties defined', ar: 'لا توجد أطراف محددة' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>{t({ en: 'Milestones & Deliverables', ar: 'المعالم والمخرجات' })}</CardTitle>
            </CardHeader>
            <CardContent>
              {partnership.milestones && partnership.milestones.length > 0 ? (
                <div className="space-y-3">
                  {partnership.milestones.map((milestone, i) => (
                    <div key={i} className="p-4 border-2 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-yellow-600" />
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-900">{milestone.name}</h4>
                          {milestone.due_date && (
                            <span className="text-sm text-slate-600">
                              {t({ en: 'Due:', ar: 'الموعد:' })} {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={milestone.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'}>
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">{t({ en: 'No milestones defined', ar: 'لا توجد معالم محددة' })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <PartnershipEngagementTracker partnership={partnership} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">{t({ en: 'AI-Powered Tools', ar: 'أدوات مدعومة بالذكاء الاصطناعي' })}</h3>
            </div>
            <p className="text-sm text-slate-600">
              {t({ en: 'Generate agreements, analyze performance, and get strategic recommendations', ar: 'توليد الاتفاقيات وتحليل الأداء والحصول على توصيات استراتيجية' })}
            </p>
          </div>
          
          <AIAgreementGenerator partnership={partnership} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(PartnershipDetail, { requiredPermissions: [] });
