import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../components/LanguageContext';
import { Shield, CheckCircle2, XCircle, Award, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionVerification() {
  const { language, isRTL, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [blindReview, setBlindReview] = useState(false);

  const { data: solutions = [] } = useQuery({
    queryKey: ['solutions-verification'],
    queryFn: () => base44.entities.Solution.list()
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.Provider.list()
  });

  const { data: expertAssignments = [] } = useQuery({
    queryKey: ['expert-assignments-solutions'],
    queryFn: () => base44.entities.ExpertAssignment.filter({ entity_type: 'Solution' })
  });

  const pendingSolutions = solutions.filter(s => 
    ['verification_pending', 'under_review'].includes(s.workflow_stage) || 
    (!s.is_verified && s.is_published)
  );
  const verifiedSolutions = solutions.filter(s => s.is_verified || s.workflow_stage === 'verified');

  const handleEvaluate = (solution) => {
    setSelectedSolution(solution);
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);
    
    if (selectedSolution) {
      await base44.functions.invoke('checkConsensus', {
        entity_type: 'solution',
        entity_id: selectedSolution.id
      });
    }
    
    setSelectedSolution(null);
    queryClient.invalidateQueries(['solutions-verification']);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedSolution && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType="solution"
              entityId={selectedSolution.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              {t({ en: 'Solution Verification', ar: 'التحقق من الحلول' })}
            </h1>
            <p className="text-slate-600 mt-2">
              {t({ en: 'Review and certify solutions for marketplace', ar: 'مراجعة واعتماد الحلول للسوق' })}
            </p>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
            <input
              type="checkbox"
              id="blind-review"
              checked={blindReview}
              onChange={(e) => setBlindReview(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="blind-review" className="text-sm font-medium text-slate-700 cursor-pointer">
              {t({ en: 'Blind Review Mode', ar: 'وضع المراجعة المجهولة' })}
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingSolutions.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Verified', ar: 'موثق' })}</p>
                <p className="text-3xl font-bold text-green-600">{verifiedSolutions.length}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Solutions', ar: 'إجمالي الحلول' })}</p>
                <p className="text-3xl font-bold text-blue-600">{solutions.length}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          {t({ en: 'Pending Verification', ar: 'التحقق المعلق' })}
        </h2>

        {pendingSolutions.map((solution) => {
          const provider = providers.find(p => p.organization_id === solution.provider_id);
          const assignments = expertAssignments.filter(a => a.entity_id === solution.id);
          
          return (
            <Card key={solution.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {blindReview ? `Solution ${solution.code || solution.id.slice(0, 8)}` : (language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en)}
                      </h3>
                      <div className="flex items-center gap-3 text-sm flex-wrap">
                        <Badge>{solution.provider_type?.replace(/_/g, ' ')}</Badge>
                        <Badge variant="outline">{solution.maturity_level?.replace(/_/g, ' ')}</Badge>
                        {solution.trl && <Badge variant="outline">TRL {solution.trl}</Badge>}
                        {solution.workflow_stage && (
                          <Badge className="bg-purple-100 text-purple-700">
                            {solution.workflow_stage.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      {!blindReview && <p className="text-sm text-slate-600 mt-2">{solution.provider_name}</p>}
                      
                      {/* Expert Assignments */}
                      {assignments.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-2">
                            {t({ en: 'Assigned Experts:', ar: 'الخبراء المعينون:' })}
                          </p>
                          <div className="space-y-1">
                            {assignments.map(a => (
                              <div key={a.id} className="flex items-center justify-between text-xs">
                                <span className="text-blue-800">{a.expert_name}</span>
                                <Badge variant="outline" className="text-xs">{a.status}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                      <Button variant="outline" size="sm">
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                      </Button>
                    </Link>
                  </div>

                  <EvaluationConsensusPanel 
                    entityType="solution" 
                    entityId={solution.id} 
                  />

                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={() => handleEvaluate(solution)}
                      className="flex-1 bg-blue-600"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t({ en: 'Evaluate', ar: 'تقييم' })}
                    </Button>
                    <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                      <Button variant="outline">
                        {t({ en: 'Details', ar: 'التفاصيل' })}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {pendingSolutions.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No solutions pending verification', ar: 'لا توجد حلول تنتظر التحقق' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(SolutionVerification, { requiredPermissions: ['solution_verify'] });