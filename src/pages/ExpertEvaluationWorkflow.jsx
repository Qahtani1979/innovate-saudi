import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Loader2, X, Eye, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function ExpertEvaluationWorkflow() {
  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignment_id');
  const { language, isRTL, t } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [savingDraft, setSavingDraft] = useState(false);

  const { data: assignment, isLoading: assignmentLoading } = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: async () => {
      const { data } = await supabase.from('expert_assignments').select('*').eq('id', assignmentId).single();
      return data;
    },
    enabled: !!assignmentId
  });

  const { data: entity, isLoading: entityLoading } = useQuery({
    queryKey: ['evaluation-entity', assignment?.entity_type, assignment?.entity_id],
    queryFn: async () => {
      if (!assignment) return null;
      
      const tableMap = {
        challenge: 'challenges',
        pilot: 'pilots',
        solution: 'solutions',
        rd_proposal: 'rd_proposals',
        rd_project: 'rd_projects',
        program_application: 'program_applications',
        matchmaker_application: 'matchmaker_applications',
        scaling_plan: 'scaling_plans',
        citizen_idea: 'citizen_ideas'
      };

      const table = tableMap[assignment.entity_type];
      if (!table) return null;

      const { data } = await supabase.from(table).select('*').eq('id', assignment.entity_id).single();
      return data;
    },
    enabled: !!assignment
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: async (status) => {
      const { error } = await supabase.from('expert_assignments').update({
        status,
        completed_date: status === 'completed' ? new Date().toISOString() : undefined
      }).eq('id', assignmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['expert-assignments']);
    }
  });

  const handleSaveDraft = async (evaluationData) => {
    setSavingDraft(true);
    try {
      localStorage.setItem(`expert_eval_draft_${assignmentId}`, JSON.stringify(evaluationData));
      toast.success(t({ en: 'Draft saved', ar: 'تم حفظ المسودة' }));
    } catch (error) {
      toast.error(t({ en: 'Failed to save draft', ar: 'فشل حفظ المسودة' }));
    } finally {
      setSavingDraft(false);
    }
  };

  const handleEvaluationSubmit = async (evaluationData) => {
    await updateAssignmentMutation.mutateAsync('completed');
    localStorage.removeItem(`expert_eval_draft_${assignmentId}`);
    navigate(createPageUrl('ExpertAssignmentQueue'));
  };

  if (assignmentLoading || entityLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-slate-600">{t({ en: 'Assignment not found', ar: 'لم يتم العثور على المهمة' })}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedDraft = localStorage.getItem(`expert_eval_draft_${assignmentId}`);
  const initialData = savedDraft ? JSON.parse(savedDraft) : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Expert Evaluation', ar: 'تقييم الخبير' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {assignment.entity_type.replace(/_/g, ' ')} • {assignment.assignment_type}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(createPageUrl('ExpertAssignmentQueue'))}>
          <X className="h-4 w-4 mr-2" />
          {t({ en: 'Cancel', ar: 'إلغاء' })}
        </Button>
      </div>

      {/* Entity Overview */}
      {entity && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                {t({ en: 'Entity Being Evaluated', ar: 'الكيان قيد التقييم' })}
              </CardTitle>
              <Link 
                to={createPageUrl(`${assignment.entity_type === 'challenge' ? 'ChallengeDetail' :
                  assignment.entity_type === 'pilot' ? 'PilotDetail' :
                  assignment.entity_type === 'solution' ? 'SolutionDetail' :
                  assignment.entity_type === 'rd_proposal' ? 'RDProposalDetail' :
                  assignment.entity_type === 'rd_project' ? 'RDProjectDetail' :
                  assignment.entity_type === 'program_application' ? 'ProgramApplicationDetail' :
                  assignment.entity_type === 'matchmaker_application' ? 'MatchmakerApplicationDetail' :
                  assignment.entity_type === 'scaling_plan' ? 'ScalingPlanDetail' :
                  'IdeaDetail'}?id=${entity.id}`)}
                target="_blank"
              >
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  {t({ en: 'View Full Details', ar: 'عرض التفاصيل' })}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {entity.title_en || entity.name_en || entity.title_ar || entity.name_ar || 'Untitled'}
              </p>
              {entity.code && (
                <Badge variant="outline" className="mt-1">{entity.code}</Badge>
              )}
            </div>
            {(entity.description_en || entity.abstract_en || entity.objective_en) && (
              <p className="text-sm text-slate-700 line-clamp-3">
                {entity.description_en || entity.abstract_en || entity.objective_en}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {entity.sector && <Badge variant="outline">{entity.sector}</Badge>}
              {entity.status && <Badge>{entity.status}</Badge>}
              {entity.trl_current && <Badge variant="outline">TRL {entity.trl_current}</Badge>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unified Evaluation Form */}
      <UnifiedEvaluationForm
        entityType={assignment.entity_type}
        entityId={assignment.entity_id}
        assignmentId={assignmentId}
        onSubmitSuccess={handleEvaluationSubmit}
        onSaveDraft={handleSaveDraft}
        initialData={initialData}
      />
    </div>
  );
}