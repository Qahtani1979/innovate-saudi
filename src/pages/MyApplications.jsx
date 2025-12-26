import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useMyApplications } from '@/hooks/useMyApplications';
import { StandardPagination } from '@/components/ui/StandardPagination';
import { EntityListSkeleton } from '@/components/ui/skeletons/EntityListSkeleton';
import { format } from 'date-fns';

function MyApplications() {
  const { language, t } = useLanguage();
  const { user } = useAuth();

  const [matchmakerPage, setMatchmakerPage] = useState(1);
  const [programsPage, setProgramsPage] = useState(1);
  const [rdPage, setRdPage] = useState(1);

  // GOLD STANDARD HOOK
  const { matchmaker, programs, rd, stats: statsData } = useMyApplications(user?.email, {
    matchmakerPage,
    programsPage,
    rdPage
  });

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    screening: 'bg-purple-100 text-purple-700',
    evaluating: 'bg-indigo-100 text-indigo-700'
  };

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Applications & Proposals', ar: 'طلباتي ومقترحاتي' }}
        subtitle={{ en: 'Track all your submissions', ar: 'تتبع جميع تقديماتك' }}
        icon={<FileText className="h-6 w-6 text-white" />}
      />

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{statsData.total}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Applications', ar: 'إجمالي الطلبات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{statsData.pending}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{statsData.accepted}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Accepted', ar: 'مقبول' })}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t({ en: 'All', ar: 'الكل' })}</TabsTrigger>
          <TabsTrigger value="matchmaker">{t({ en: 'Matchmaker', ar: 'التوفيق' })}</TabsTrigger>
          <TabsTrigger value="programs">{t({ en: 'Programs', ar: 'البرامج' })}</TabsTrigger>
          <TabsTrigger value="rd">{t({ en: 'R&D', ar: 'البحث' })}</TabsTrigger>
        </TabsList>

        {/* ALL TAB: Shows first 3 items from each category (Dashboard style) */}
        <TabsContent value="all" className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-800">{t({ en: 'Recent Activity', ar: 'النشاط الأخير' })}</h3>
            {matchmaker.isLoading || programs.isLoading || rd.isLoading ? (
              <EntityListSkeleton mode="list" rowCount={5} />
            ) : (
              [...matchmaker.data, ...programs.data, ...rd.data]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map((item, i) => (
                  <Card key={i} className="hover:border-blue-300 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <Badge variant="outline">
                              {item.program_id ? 'Program' : item.rd_call_id ? 'R&D' : 'Matchmaker'}
                            </Badge>
                            <Badge className={statusColors[item.status] || 'bg-slate-100'}>
                              {item.status}
                            </Badge>
                          </div>
                          <p className="font-medium text-slate-900">
                            {item.organization_name || item.project_title_en || (item.program?.name_en || 'Application')}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {format(new Date(item.created_at), 'PPP')}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        {/* MATCHMAKER TAB */}
        <TabsContent value="matchmaker" className="space-y-4">
          {matchmaker.isLoading ? (
            <EntityListSkeleton mode="list" rowCount={3} />
          ) : matchmaker.isEmpty ? (
            <div className="text-center py-8 text-slate-500">{t({ en: 'No applications found', ar: 'لا توجد طلبات' })}</div>
          ) : (
            matchmaker.data.map(app => (
              <Link key={app.id} to={createPageUrl(`MatchmakerApplicationDetail?id=${app.id}`)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className={statusColors[app.status]}>{app.status}</Badge>
                        <h3 className="font-semibold mt-2">{app.organization_name}</h3>
                        <p className="text-sm text-slate-600">{app.classification}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">{format(new Date(app.created_at), 'PPP')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
          <StandardPagination
            currentPage={matchmakerPage}
            totalPages={matchmaker.totalPages}
            onPageChange={setMatchmakerPage}
          />
        </TabsContent>

        {/* PROGRAMS TAB */}
        <TabsContent value="programs" className="space-y-4">
          {programs.isLoading ? (
            <EntityListSkeleton mode="list" rowCount={3} />
          ) : programs.isEmpty ? (
            <div className="text-center py-8 text-slate-500">{t({ en: 'No program applications', ar: 'لا توجد طلبات برامج' })}</div>
          ) : (
            programs.data.map(app => (
              <Link key={app.id} to={createPageUrl(`ProgramApplicationDetail?id=${app.id}`)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className={statusColors[app.status]}>{app.status}</Badge>
                        <h3 className="font-semibold mt-2">{app.program?.name_en || 'Unknown Program'}</h3>
                        <p className="text-sm text-slate-600">{t({ en: 'Applicant', ar: 'المتقدم' })}: {app.applicant_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
          <StandardPagination
            currentPage={programsPage}
            totalPages={programs.totalPages}
            onPageChange={setProgramsPage}
          />
        </TabsContent>

        {/* RD TAB */}
        <TabsContent value="rd" className="space-y-4">
          {rd.isLoading ? (
            <EntityListSkeleton mode="list" rowCount={3} />
          ) : rd.isEmpty ? (
            <div className="text-center py-8 text-slate-500">{t({ en: 'No R&D proposals', ar: 'لا توجد مقترحات بحث' })}</div>
          ) : (
            rd.data.map(proposal => (
              <Link key={proposal.id} to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className={statusColors[proposal.status]}>{proposal.status}</Badge>
                        <h3 className="font-semibold mt-2">{proposal.project_title_en}</h3>
                        <p className="text-sm text-slate-600">{t({ en: 'Call ID', ar: 'رقم الدعوة' })}: {proposal.rd_call_id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
          <StandardPagination
            currentPage={rdPage}
            totalPages={rd.totalPages}
            onPageChange={setRdPage}
          />
        </TabsContent>

      </Tabs>
    </PageLayout>
  );
}

export default ProtectedPage(MyApplications, { requiredPermissions: [] });
