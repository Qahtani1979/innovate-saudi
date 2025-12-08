import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { 
  Calendar, Microscope, Users, CheckCircle, XCircle, Clock, 
  FileText, Sparkles, Loader2, Star, TrendingUp, Award, AlertCircle
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';

function ApplicationReviewHub() {
  const [selectedApp, setSelectedApp] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const { language, isRTL, t } = useLanguage();

  const queryClient = useQueryClient();

  // Fetch Program Applications
  const { data: programApps = [] } = useQuery({
    queryKey: ['program-applications-review'],
    queryFn: async () => {
      const all = await base44.entities.ProgramApplication.list('-created_date');
      return all.filter(app => ['submitted', 'under_review', 'screening'].includes(app.status));
    }
  });

  // Fetch R&D Proposals
  const { data: rdProposals = [] } = useQuery({
    queryKey: ['rd-proposals-review'],
    queryFn: async () => {
      const all = await base44.entities.RDProposal.list('-created_date');
      return all.filter(p => ['submitted', 'under_review', 'screening'].includes(p.status));
    }
  });

  // Fetch Matchmaker Applications
  const { data: matchmakerApps = [] } = useQuery({
    queryKey: ['matchmaker-apps-review'],
    queryFn: async () => {
      const all = await base44.entities.MatchmakerApplication.list('-created_date');
      return all.filter(app => ['submitted', 'screening', 'under_review'].includes(app.status));
    }
  });

  // Fetch related data
  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['rd-calls'],
    queryFn: () => base44.entities.RDCall.list()
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => base44.entities.Organization.list()
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => base44.entities.Solution.list()
  });

  const handleEvaluate = (app, type) => {
    setSelectedApp({ ...app, type });
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);
    setSelectedApp(null);
    
    // Check consensus
    if (selectedApp) {
      const entityTypeMap = {
        'program': 'program_application',
        'rd': 'rd_proposal',
        'matchmaker': 'matchmaker_application'
      };
      
      await base44.functions.invoke('checkConsensus', {
        entity_type: entityTypeMap[selectedApp.type],
        entity_id: selectedApp.id
      });
    }
    
    queryClient.invalidateQueries();
  };

  const totalPending = programApps.length + rdProposals.length + matchmakerApps.length;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType={
                selectedApp.type === 'program' ? 'program_application' :
                selectedApp.type === 'rd' ? 'rd_proposal' : 'matchmaker_application'
              }
              entityId={selectedApp.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Application Review Hub', ar: 'مركز مراجعة الطلبات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Unified review center for programs, R&D, and matchmaker applications', ar: 'مركز موحد لمراجعة طلبات البرامج والبحث والتوفيق' })}
          </p>
        </div>
        <Badge className="text-2xl px-4 py-2">
          {totalPending} {t({ en: 'Pending', ar: 'معلق' })}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Program Apps', ar: 'طلبات البرامج' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{programApps.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'R&D Proposals', ar: 'مقترحات البحث' })}</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{rdProposals.length}</p>
              </div>
              <Microscope className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Matchmaker Apps', ar: 'طلبات التوفيق' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{matchmakerApps.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="programs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="programs">
            <Calendar className="h-4 w-4 mr-2" />
            {t({ en: 'Programs', ar: 'البرامج' })} ({programApps.length})
          </TabsTrigger>
          <TabsTrigger value="rd">
            <Microscope className="h-4 w-4 mr-2" />
            {t({ en: 'R&D', ar: 'البحث' })} ({rdProposals.length})
          </TabsTrigger>
          <TabsTrigger value="matchmaker">
            <Users className="h-4 w-4 mr-2" />
            {t({ en: 'Matchmaker', ar: 'التوفيق' })} ({matchmakerApps.length})
          </TabsTrigger>
        </TabsList>

        {/* Program Applications Tab */}
        <TabsContent value="programs" className="space-y-4">
          {programApps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t({ en: 'Applications', ar: 'الطلبات' })}</h3>
                {programApps.map((app) => {
                  const program = programs.find(p => p.id === app.program_id);
                  const organization = organizations.find(o => o.id === app.applicant_org_id);
                  return (
                    <Card 
                      key={app.id} 
                      className={`cursor-pointer transition-all ${selectedApp?.id === app.id ? 'border-teal-500 border-2' : ''}`}
                      onClick={() => setSelectedApp({ ...app, type: 'program', organization })}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge className="mb-2">{app.status}</Badge>
                            <h4 className="font-semibold text-lg">{organization?.name_en || app.applicant_org_id}</h4>
                            <p className="text-sm text-slate-600">{program?.name_en || 'Program'}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {app.proposal_summary?.substring(0, 80)}...
                            </p>
                            {app.ai_score && (
                              <div className="flex items-center gap-2 mt-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">{app.ai_score}/100</span>
                              </div>
                            )}
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvaluate(app, 'program');
                            }}
                            size="sm"
                            className="bg-blue-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t({ en: 'Evaluate', ar: 'تقييم' })}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>{app.submission_date?.split('T')[0] || app.created_date?.split('T')[0]}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div>
                {selectedApp?.type === 'program' && !showEvaluationForm ? (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>{t({ en: 'Application Details', ar: 'تفاصيل الطلب' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{selectedApp.organization?.name_en || selectedApp.applicant_org_id}</h4>
                        <p className="text-sm text-slate-600">{programs.find(p => p.id === selectedApp.program_id)?.name_en}</p>
                      </div>

                      {selectedApp.proposal_summary && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Proposal Summary', ar: 'ملخص المقترح' })}</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedApp.proposal_summary}</p>
                        </div>
                      )}

                      <EvaluationConsensusPanel 
                        entityType="program_application" 
                        entityId={selectedApp.id} 
                      />

                      <Link to={createPageUrl(`ProgramApplicationDetail?id=${selectedApp.id}`)}>
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          {t({ en: 'Full Details', ar: 'التفاصيل الكاملة' })}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'Select an application to review', ar: 'اختر طلبًا للمراجعة' })}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending program applications', ar: 'لا توجد طلبات برامج معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* R&D Proposals Tab */}
        <TabsContent value="rd" className="space-y-4">
          {rdProposals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t({ en: 'Proposals', ar: 'المقترحات' })}</h3>
                {rdProposals.map((proposal) => {
                  const call = rdCalls.find(c => c.id === proposal.rd_call_id);
                  return (
                    <Card 
                      key={proposal.id} 
                      className={`cursor-pointer transition-all ${selectedApp?.id === proposal.id ? 'border-amber-500 border-2' : ''}`}
                      onClick={() => setSelectedApp({ ...proposal, type: 'rd' })}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge className="mb-2">{proposal.status}</Badge>
                            <h4 className="font-semibold text-lg">{proposal.title_en}</h4>
                            <p className="text-sm text-slate-600">{proposal.institution_name}</p>
                            <p className="text-xs text-slate-500 mt-1">PI: {proposal.pi_name}</p>
                            <p className="text-xs text-slate-500">{call?.title_en}</p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEvaluate(proposal, 'rd');
                            }}
                            size="sm"
                            className="bg-amber-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t({ en: 'Evaluate', ar: 'تقييم' })}
                          </Button>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>{proposal.budget_requested?.toLocaleString()} SAR</span>
                          <span>{proposal.duration_months} months</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div>
                {selectedApp?.type === 'rd' && !showEvaluationForm ? (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>{t({ en: 'Proposal Details', ar: 'تفاصيل المقترح' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{selectedApp.title_en}</h4>
                        <p className="text-sm text-slate-600">{selectedApp.institution_en}</p>
                      </div>

                      {selectedApp.abstract_en && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-1">{t({ en: 'Abstract', ar: 'الملخص' })}</p>
                          <p className="text-sm text-slate-600">{selectedApp.abstract_en}</p>
                        </div>
                      )}

                      <EvaluationConsensusPanel 
                        entityType="rd_proposal" 
                        entityId={selectedApp.id} 
                      />

                      <Link to={createPageUrl(`RDProposalDetail?id=${selectedApp.id}`)}>
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          {t({ en: 'Full Details', ar: 'التفاصيل الكاملة' })}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'Select a proposal to review', ar: 'اختر مقترحًا للمراجعة' })}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending R&D proposals', ar: 'لا توجد مقترحات بحث معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Matchmaker Applications Tab */}
        <TabsContent value="matchmaker" className="space-y-4">
          {matchmakerApps.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{t({ en: 'Applications', ar: 'الطلبات' })}</h3>
                {matchmakerApps.map((app) => (
                  <Card 
                    key={app.id} 
                    className={`cursor-pointer transition-all ${selectedApp?.id === app.id ? 'border-green-500 border-2' : ''}`}
                    onClick={() => setSelectedApp({ ...app, type: 'matchmaker' })}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Badge className="mb-2">{app.status}</Badge>
                          <h4 className="font-semibold text-lg">{app.organization_name}</h4>
                          <p className="text-sm text-slate-600">{app.organization_type}</p>
                          {app.sectors?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {app.sectors.slice(0, 3).map((sector, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{sector}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEvaluate(app, 'matchmaker');
                          }}
                          size="sm"
                          className="bg-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t({ en: 'Evaluate', ar: 'تقييم' })}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>{app.created_date?.split('T')[0]}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div>
                {selectedApp?.type === 'matchmaker' && !showEvaluationForm ? (
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle>{t({ en: 'Application Details', ar: 'تفاصيل الطلب' })}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">{selectedApp.organization_name_en}</h4>
                        <p className="text-sm text-slate-600">{selectedApp.contact_email}</p>
                      </div>

                      <EvaluationConsensusPanel 
                        entityType="matchmaker_application" 
                        entityId={selectedApp.id} 
                      />

                      <Link to={createPageUrl(`MatchmakerApplicationDetail?id=${selectedApp.id}`)}>
                        <Button variant="outline" className="w-full">
                          <FileText className="h-4 w-4 mr-2" />
                          {t({ en: 'Full Details', ar: 'التفاصيل الكاملة' })}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">{t({ en: 'Select an application to review', ar: 'اختر طلبًا للمراجعة' })}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-500">{t({ en: 'No pending matchmaker applications', ar: 'لا توجد طلبات توفيق معلقة' })}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(ApplicationReviewHub, { requiredPermissions: ['program_evaluate', 'rd_proposal_approve', 'matchmaker_approve'], requireAll: false });