import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, Clock, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MyApplications() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: matchmakerApps = [] } = useQuery({
    queryKey: ['my-matchmaker-apps', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('matchmaker_applications').select('*');
      return (data || []).filter(a => a.contact_email === user?.email || a.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: programApps = [] } = useQuery({
    queryKey: ['my-program-apps', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('program_applications').select('*');
      return (data || []).filter(a => a.applicant_email === user?.email || a.created_by === user?.email);
    },
    enabled: !!user
  });

  const { data: rdProposals = [] } = useQuery({
    queryKey: ['my-rd-proposals', user?.email],
    queryFn: async () => {
      const { data } = await supabase.from('rd_proposals').select('*');
      return (data || []).filter(p => p.created_by === user?.email);
    },
    enabled: !!user
  });

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    screening: 'bg-purple-100 text-purple-700',
    evaluating: 'bg-indigo-100 text-indigo-700'
  };

  const totalApplications = matchmakerApps.length + programApps.length + rdProposals.length;
  const pending = [...matchmakerApps, ...programApps, ...rdProposals].filter(a => 
    ['submitted', 'under_review', 'screening', 'evaluating'].includes(a.status || a.stage)
  ).length;

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Applications & Proposals', ar: 'طلباتي ومقترحاتي' }}
        subtitle={{ en: 'Track all your submissions', ar: 'تتبع جميع تقديماتك' }}
        icon={<FileText className="h-6 w-6 text-white" />}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{totalApplications}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Applications', ar: 'إجمالي الطلبات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{pending}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {[...matchmakerApps, ...programApps, ...rdProposals].filter(a => a.status === 'accepted').length}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Accepted', ar: 'مقبول' })}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t({ en: 'All', ar: 'الكل' })} ({totalApplications})</TabsTrigger>
          <TabsTrigger value="matchmaker">{t({ en: 'Matchmaker', ar: 'التوفيق' })} ({matchmakerApps.length})</TabsTrigger>
          <TabsTrigger value="programs">{t({ en: 'Programs', ar: 'البرامج' })} ({programApps.length})</TabsTrigger>
          <TabsTrigger value="rd">{t({ en: 'R&D', ar: 'البحث' })} ({rdProposals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {[...matchmakerApps, ...programApps, ...rdProposals].map((app) => (
            <Card key={app.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {app.organization_name ? 'Matchmaker' : app.program_id ? 'Program' : 'R&D'}
                      </Badge>
                      <Badge className={statusColors[app.status || app.stage]}>
                        {app.status || app.stage}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {app.organization_name || app.program_id || app.project_title_en}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {t({ en: 'Submitted', ar: 'مقدم' })}: {new Date(app.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {t({ en: 'View', ar: 'عرض' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="matchmaker" className="space-y-3">
          {matchmakerApps.map((app) => (
            <Link key={app.id} to={createPageUrl(`MatchmakerApplicationDetail?id=${app.id}`)}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={statusColors[app.stage]}>{app.stage}</Badge>
                      <h3 className="font-semibold text-slate-900 mt-2">{app.organization_name}</h3>
                      <p className="text-sm text-slate-600">{app.classification}</p>
                    </div>
                    {app.evaluation_score?.total_score && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{app.evaluation_score.total_score}</div>
                        <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'الدرجة' })}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="programs" className="space-y-3">
          {programApps.map((app) => (
            <Link key={app.id} to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Badge className={statusColors[app.status]}>{app.status}</Badge>
                  <h3 className="font-semibold text-slate-900 mt-2">{app.applicant_name}</h3>
                  <p className="text-sm text-slate-600">Program: {app.program_id}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>

        <TabsContent value="rd" className="space-y-3">
          {rdProposals.map((proposal) => (
            <Link key={proposal.id} to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                  <h3 className="font-semibold text-slate-900 mt-2">{proposal.project_title_en}</h3>
                  <p className="text-sm text-slate-600">Call: {proposal.rd_call_id}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(MyApplications, { requiredPermissions: [] });