import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { FileText, CheckCircle2, AlertTriangle, Microscope } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';

function EvaluationPanel() {
  const { language, isRTL, t } = useLanguage();
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: proposals = [] } = useQuery({
    queryKey: ['pending-proposals'],
    queryFn: async () => {
      const all = await base44.entities.RDProposal.list();
      return all.filter(p => p.status === 'submitted' || p.status === 'under_review');
    }
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['evaluation-pilots'],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => p.stage === 'evaluation');
    }
  });

  const handleEvaluate = (entity, type) => {
    setSelectedEntity({ ...entity, entityType: type });
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);
    
    if (selectedEntity) {
      await base44.functions.invoke('checkConsensus', {
        entity_type: selectedEntity.entityType,
        entity_id: selectedEntity.id
      });
    }
    
    setSelectedEntity(null);
    queryClient.invalidateQueries(['pending-proposals']);
    queryClient.invalidateQueries(['evaluation-pilots']);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedEntity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType={selectedEntity.entityType}
              entityId={selectedEntity.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Evaluation Panel', ar: 'لجنة التقييم' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Review and evaluate proposals and pilots', ar: 'مراجعة وتقييم المقترحات والتجارب' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{proposals.length + pilots.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Proposals', ar: 'المقترحات' })}</p>
                <p className="text-3xl font-bold text-blue-600">{proposals.length}</p>
              </div>
              <Microscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
                <p className="text-3xl font-bold text-purple-600">{pilots.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="proposals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proposals">{t({ en: 'R&D Proposals', ar: 'المقترحات البحثية' })} ({proposals.length})</TabsTrigger>
          <TabsTrigger value="pilots">{t({ en: 'Pilot Evaluations', ar: 'تقييمات التجارب' })} ({pilots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4 mt-6">
          {proposals.map((proposal) => (
            <Card key={proposal.id} className="border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{proposal.title_en}</h3>
                      <p className="text-sm text-slate-600 mb-3">{proposal.abstract_en?.substring(0, 200)}...</p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-600">{proposal.institution_en}</span>
                        <Badge className="bg-blue-100 text-blue-700">
                          {proposal.budget_requested ? `${(proposal.budget_requested / 1000).toFixed(0)}K SAR` : 'TBD'}
                        </Badge>
                      </div>
                    </div>
                    <Link to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View', ar: 'عرض' })}
                      </Button>
                    </Link>
                  </div>

                  <EvaluationConsensusPanel 
                    entityType="rd_proposal" 
                    entityId={proposal.id} 
                  />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleEvaluate(proposal, 'rd_proposal')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Evaluate', ar: 'تقييم' })}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {proposals.length === 0 && (
            <div className="text-center py-12">
              <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No proposals to evaluate', ar: 'لا توجد مقترحات للتقييم' })}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pilots" className="space-y-4 mt-6">
          {pilots.map((pilot) => (
            <Card key={pilot.id} className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{pilot.title_en}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline">{pilot.code}</Badge>
                        <span className="text-slate-600">{pilot.sector?.replace(/_/g, ' ')}</span>
                        <Badge className="bg-purple-100 text-purple-700">
                          {pilot.duration_weeks}w • {pilot.budget ? `${(pilot.budget / 1000).toFixed(0)}K` : 'TBD'}
                        </Badge>
                      </div>
                    </div>
                    <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View', ar: 'عرض' })}
                      </Button>
                    </Link>
                  </div>

                  <EvaluationConsensusPanel 
                    entityType="pilot" 
                    entityId={pilot.id} 
                  />

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleEvaluate(pilot, 'pilot')}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Evaluate', ar: 'تقييم' })}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {pilots.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t({ en: 'No pilots to evaluate', ar: 'لا توجد تجارب للتقييم' })}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(EvaluationPanel, { requiredPermissions: ['expert_evaluate'] });