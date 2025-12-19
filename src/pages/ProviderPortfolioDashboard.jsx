import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Lightbulb, TrendingUp, Star, TestTube, Edit, Eye, XCircle,
  Activity, DollarSign, CheckCircle2, AlertCircle, BarChart3, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import ProviderSolutionCard from '../components/solutions/ProviderSolutionCard';
import SolutionDeprecationWizard from '../components/solutions/SolutionDeprecationWizard';
import MultiCityOperationsManager from '../components/startup/MultiCityOperationsManager';
import ProviderCollaborationNetwork from '../components/solutions/ProviderCollaborationNetwork';
import ContractPipelineTracker from '../components/startup/ContractPipelineTracker';
import ClientTestimonialsShowcase from '../components/solutions/ClientTestimonialsShowcase';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

export default function ProviderPortfolioDashboard() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: myOrg } = useQuery({
    queryKey: ['my-organization', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('*');
      return data?.find(o => o.created_by === user?.email || o.contact_email === user?.email);
    },
    enabled: !!user
  });

  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['my-solutions', user?.email, myOrg?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_deleted', false);
      return data?.filter(s => 
        s.created_by === user?.email || 
        (myOrg && s.provider_id === myOrg.id)
      ) || [];
    },
    enabled: !!user
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-for-solutions', solutions.map(s => s.id)],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const { data } = await supabase
        .from('pilots')
        .select('*')
        .eq('is_deleted', false);
      return data?.filter(p => solutionIds.includes(p.solution_id)) || [];
    },
    enabled: solutions.length > 0
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews-for-solutions', solutions.map(s => s.id)],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const { data } = await supabase.from('solution_reviews').select('*');
      return data?.filter(r => solutionIds.includes(r.solution_id)) || [];
    },
    enabled: solutions.length > 0
  });

  const toggleSelection = (solutionId) => {
    setSelectedSolutions(prev =>
      prev.includes(solutionId)
        ? prev.filter(id => id !== solutionId)
        : [...prev, solutionId]
    );
  };

  const bulkDeprecateMutation = useMutation({
    mutationFn: async (solutionIds) => {
      for (const id of solutionIds) {
        await supabase.from('solutions').update({
          workflow_stage: 'deprecated',
          is_published: false,
          is_archived: true
        }).eq('id', id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-solutions']);
      setSelectedSolutions([]);
      toast.success(t({ en: 'Solutions deprecated', ar: 'تم إيقاف الحلول' }));
    }
  });

  const portfolioStats = {
    total: solutions.length,
    published: solutions.filter(s => s.is_published).length,
    verified: solutions.filter(s => s.is_verified).length,
    inPilots: solutions.filter(s => pilots.some(p => p.solution_id === s.id)).length,
    avgRating: solutions.length > 0
      ? (solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / solutions.length).toFixed(1)
      : 'N/A',
    totalDeployments: solutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0),
    totalReviews: reviews.length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={Briefcase}
        title={t({ en: 'My Solutions Portfolio', ar: 'محفظة حلولي' })}
        description={t({ en: 'Manage all your solutions and track performance', ar: 'إدارة جميع حلولك وتتبع الأداء' })}
        stats={[
          { icon: Lightbulb, value: portfolioStats.total, label: t({ en: 'Total Solutions', ar: 'إجمالي الحلول' }) },
          { icon: CheckCircle2, value: portfolioStats.verified, label: t({ en: 'Verified', ar: 'معتمدة' }) },
          { icon: TestTube, value: portfolioStats.inPilots, label: t({ en: 'In Pilots', ar: 'في تجارب' }) },
          { icon: Star, value: portfolioStats.avgRating, label: t({ en: 'Avg Rating', ar: 'متوسط التقييم' }) },
        ]}
        actions={
          <Link to={createPageUrl('SolutionCreate')}>
            <Button className="bg-blue-600">
              <Lightbulb className="h-4 w-4 mr-2" />
              {t({ en: 'Add Solution', ar: 'إضافة حل' })}
            </Button>
          </Link>
        }
      />

      {/* Portfolio Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Lightbulb className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{portfolioStats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Solutions', ar: 'إجمالي الحلول' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{portfolioStats.published}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Published', ar: 'منشورة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{portfolioStats.verified}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Verified', ar: 'معتمدة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <TestTube className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{portfolioStats.inPilots}</p>
            <p className="text-xs text-slate-600">{t({ en: 'In Pilots', ar: 'في تجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-white">
          <CardContent className="pt-4 text-center">
            <Star className="h-6 w-6 text-rose-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-rose-600">{portfolioStats.avgRating}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Rating', ar: 'متوسط التقييم' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{portfolioStats.totalDeployments}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Deployments', ar: 'عمليات نشر' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white">
          <CardContent className="pt-4 text-center">
            <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-600">{portfolioStats.totalReviews}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Reviews', ar: 'مراجعات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedSolutions.length > 0 && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">
                {selectedSolutions.length} {t({ en: 'solutions selected', ar: 'حلول محددة' })}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSolutions([])}
                >
                  {t({ en: 'Clear Selection', ar: 'إلغاء التحديد' })}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(t({ en: 'Deprecate selected solutions?', ar: 'إيقاف الحلول المحددة؟' }))) {
                      bulkDeprecateMutation.mutate(selectedSolutions);
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t({ en: 'Bulk Deprecate', ar: 'إيقاف جماعي' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-City Operations - Integrated */}
      {myOrg && (
        <MultiCityOperationsManager providerId={myOrg.id} />
      )}

      {/* Collaboration Network - Integrated */}
      {myOrg && (
        <ProviderCollaborationNetwork providerId={myOrg.id} />
      )}

      {/* Contract Pipeline - Integrated */}
      {myOrg && (
        <ContractPipelineTracker providerId={myOrg.id} />
      )}

      {/* Solutions Grid */}
      {solutions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Lightbulb className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">
              {t({ en: 'No solutions yet. Create your first solution to get started.', ar: 'لا توجد حلول بعد. أنشئ حلك الأول للبدء.' })}
            </p>
            <Link to={createPageUrl('SolutionCreate')}>
              <Button className="bg-blue-600">
                <Lightbulb className="h-4 w-4 mr-2" />
                {t({ en: 'Create Solution', ar: 'إنشاء حل' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map((solution) => {
            const solutionPilots = pilots.filter(p => p.solution_id === solution.id);
            const solutionReviews = reviews.filter(r => r.solution_id === solution.id);
            
            return (
              <ProviderSolutionCard
                key={solution.id}
                solution={solution}
                pilots={solutionPilots}
                reviews={solutionReviews}
                isSelected={selectedSolutions.includes(solution.id)}
                onToggleSelect={() => toggleSelection(solution.id)}
              />
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}