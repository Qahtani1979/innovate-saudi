import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';

function ProposalReviewPortal() {
  const { language, isRTL, t } = useLanguage();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: proposals = [] } = useQuery({
    queryKey: ['rd-proposals-review'],
    queryFn: () => base44.entities.RDProposal.list()
  });

  const pending = proposals.filter(p => p.status === 'submitted' || p.status === 'under_review');
  const reviewed = proposals.filter(p => ['approved', 'rejected'].includes(p.status));

  const handleEvaluate = (proposal) => {
    setSelectedProposal(proposal);
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);
    
    if (selectedProposal) {
      await base44.functions.invoke('checkConsensus', {
        entity_type: 'rd_proposal',
        entity_id: selectedProposal.id
      });
    }
    
    setSelectedProposal(null);
    queryClient.invalidateQueries(['rd-proposals-review']);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType="rd_proposal"
              entityId={selectedProposal.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'Proposal Review Portal', ar: 'بوابة مراجعة المقترحات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Review and evaluate R&D proposals', ar: 'مراجعة وتقييم المقترحات البحثية' })}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{pending.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Pending Review', ar: 'قيد المراجعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{proposals.filter(p => p.status === 'approved').length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'موافق عليه' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">
              {proposals.length > 0 ? Math.round((proposals.filter(p => p.status === 'approved').length / proposals.length) * 100) : 0}%
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Approval Rate', ar: 'معدل الموافقة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">{t({ en: 'Pending', ar: 'معلق' })} ({pending.length})</TabsTrigger>
          <TabsTrigger value="reviewed">{t({ en: 'Reviewed', ar: 'تمت المراجعة' })} ({reviewed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pending.map(proposal => (
            <Card key={proposal.id} className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{proposal.rd_call_id}</Badge>
                    <h3 className="font-semibold text-slate-900">{proposal.title_en}</h3>
                    <p className="text-sm text-slate-600 mt-1">{proposal.institution_en}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{proposal.budget_requested?.toLocaleString()} SAR</span>
                      <span>{proposal.duration_months} months</span>
                    </div>
                  </div>
                </div>

                <EvaluationConsensusPanel 
                  entityType="rd_proposal" 
                  entityId={proposal.id} 
                />

                <div className="flex gap-2 mt-4">
                  <Button size="sm" className="bg-blue-600" onClick={() => handleEvaluate(proposal)}>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t({ en: 'Evaluate', ar: 'تقييم' })}
                  </Button>
                  <Link to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
                    <Button size="sm" variant="outline">{t({ en: 'Details', ar: 'التفاصيل' })}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-3">
          {reviewed.map(proposal => (
            <Link key={proposal.id} to={createPageUrl(`RDProposalDetail?id=${proposal.id}`)}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{proposal.project_title_en}</h3>
                      <p className="text-sm text-slate-600">{proposal.institution_en}</p>
                    </div>
                    <Badge className={proposal.status === 'approved' ? 'bg-green-600' : 'bg-red-600'}>
                      {proposal.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProtectedPage(ProposalReviewPortal, { requiredPermissions: [], requiredRoles: ['R&D Manager', 'Research Evaluator'] });