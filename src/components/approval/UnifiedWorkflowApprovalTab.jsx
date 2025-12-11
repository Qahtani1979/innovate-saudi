import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight,
  Send, FileText, User, Shield
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import RequesterAI from './RequesterAI';
import ReviewerAI from './ReviewerAI';
import ProgramExpertEvaluation from '../programs/ProgramExpertEvaluation';

/**
 * UnifiedWorkflowApprovalTab - Single tab replacing separate Workflow + Approvals tabs
 * Shows workflow timeline + approval gates in one unified view
 */
export default function UnifiedWorkflowApprovalTab({ 
  entityType, 
  entityId, 
  entityData
}) {
  const { t, language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedGate, setSelectedGate] = useState(null);
  const [showSelfCheck, setShowSelfCheck] = useState(false);

  // Fetch approval requests for this entity
  const { data: approvalRequests = [] } = useQuery({
    queryKey: ['approval-requests', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!entityId
  });

  // Simplified gate configuration - no external dependencies
  const gates = [];

  // Create approval request mutation
  const createApprovalMutation = useMutation({
    mutationFn: (data) => base44.entities.ApprovalRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['approval-requests', entityType, entityId]);
    }
  });

  // Update approval request mutation
  const updateApprovalMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ApprovalRequest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['approval-requests', entityType, entityId]);
    }
  });

  // Get approval request for a specific gate
  const getApprovalForGate = (gateName) => {
    return approvalRequests.find(a => a.gate_name === gateName && !a.is_deleted);
  };

  // Submit for approval (simplified)
  const handleSubmitForApproval = async (gateName) => {
    const approvalData = {
      entity_type: entityType,
      entity_id: entityId,
      gate_name: gateName,
      gate_type: 'review',
      workflow_stage: entityData?.workflow_stage || entityData?.status || entityData?.stage || 'unknown',
      requester_email: currentUser?.email || 'unknown',
      reviewer_role: 'admin',
      status: 'pending',
      priority: 'medium'
    };

    await createApprovalMutation.mutateAsync(approvalData);
  };

  // Reviewer decision
  const handleReviewerDecision = async (approvalRequest, decision, comments, conditions = []) => {
    await updateApprovalMutation.mutateAsync({
      id: approvalRequest.id,
      data: {
        status: decision === 'approved' ? 'approved' : 
               decision === 'rejected' ? 'rejected' : 
               decision === 'conditional' ? 'conditional' : 'info_requested',
        decision,
        decision_date: new Date().toISOString(),
        reviewer_email: currentUser.email,
        comments,
        conditions: conditions.length > 0 ? conditions : undefined
      }
    });
  };

  // Get gate status
  const getGateStatus = (gateName) => {
    const approval = getApprovalForGate(gateName);
    if (!approval) return { status: 'not_started', color: 'slate', icon: Clock };
    
    if (approval.status === 'approved') return { status: 'approved', color: 'green', icon: CheckCircle2 };
    if (approval.status === 'rejected') return { status: 'rejected', color: 'red', icon: XCircle };
    if (approval.status === 'conditional') return { status: 'conditional', color: 'yellow', icon: AlertTriangle };
    if (approval.status === 'under_review') return { status: 'under_review', color: 'blue', icon: Clock };
    return { status: 'pending', color: 'amber', icon: Clock };
  };

  // Render gate content (simplified without policy gates to avoid circular dependency)
  const renderGateContent = (tab) => {
    const approval = getApprovalForGate(selectedGate?.name);

    if (tab === 'selfcheck') {
      return (
        <>
          <RequesterAI
            entityType={entityType}
            entityData={entityData}
            gateName={selectedGate.name}
            gateConfig={selectedGate}
            onSelfCheckUpdate={(data) => {
              if (approval) {
                updateApprovalMutation.mutate({
                  id: approval.id,
                  data: { self_check_data: data }
                });
              }
            }}
          />
          <SelfCheckPanel gate={selectedGate} approval={approval} />
        </>
      );
    }

    if (tab === 'review') {
      // Special case: Program completion_review uses expert evaluation
      if (entityType === 'program' && selectedGate.name === 'completion_review') {
        return (
          <>
            <ReviewerAI
              entityType={entityType}
              entityData={entityData}
              gateName={selectedGate.name}
              gateConfig={selectedGate}
              approvalRequest={approval}
            />
            <ProgramExpertEvaluation 
              program={entityData} 
              approvalRequest={approval}
            />
          </>
        );
      }

      return (
        <>
          <ReviewerAI
            entityType={entityType}
            entityData={entityData}
            gateName={selectedGate.name}
            gateConfig={selectedGate}
            approvalRequest={approval}
          />
          <ReviewPanel 
            gate={selectedGate} 
            approval={approval}
            currentUser={currentUser}
            onDecision={handleReviewerDecision}
          />
        </>
      );
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Workflow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {t({ en: 'Workflow & Approval Gates', ar: 'سير العمل وبوابات الموافقة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gates.map((gate, idx) => {
              const approval = getApprovalForGate(gate.name);
              const gateStatus = getGateStatus(gate.name);
              const StatusIcon = gateStatus.icon;
              const isOverdue = false;

              return (
                <div key={idx} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedGate?.name === gate.name ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setSelectedGate(gate)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-${gateStatus.color}-100`}>
                        <StatusIcon className={`h-5 w-5 text-${gateStatus.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{gate.label[language]}</h4>
                        <p className="text-xs text-slate-500">
                          {gate.requiredRole} • SLA: {gate.sla_days} days
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isOverdue && (
                        <Badge className="bg-red-600 text-white">
                          {t({ en: 'Overdue', ar: 'متأخر' })}
                        </Badge>
                      )}
                      <Badge className={`bg-${gateStatus.color}-100 text-${gateStatus.color}-700`}>
                        {gateStatus.status.replace(/_/g, ' ')}
                      </Badge>
                      {approval && (
                        <Badge variant="outline" className="text-xs">
                          {t({ en: `Submitted ${new Date(approval.created_date).toLocaleDateString()}`, 
                               ar: `قُدم ${new Date(approval.created_date).toLocaleDateString()}` })}
                        </Badge>
                      )}
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gate Detail View */}
      {selectedGate && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedGate.label[language]}</span>
              {!getApprovalForGate(selectedGate.name) && (
                <Button 
                  onClick={() => handleSubmitForApproval(selectedGate.name)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t({ en: 'Submit for Approval', ar: 'تقديم للموافقة' })}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">{t({ en: 'Overview', ar: 'نظرة عامة' })}</TabsTrigger>
                <TabsTrigger value="selfcheck">{t({ en: 'Self-Check', ar: 'الفحص الذاتي' })}</TabsTrigger>
                <TabsTrigger value="review">{t({ en: 'Review', ar: 'المراجعة' })}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <GateOverview gate={selectedGate} approval={getApprovalForGate(selectedGate.name)} />
              </TabsContent>

              <TabsContent value="selfcheck" className="space-y-4">
                {renderGateContent('selfcheck')}
              </TabsContent>

              <TabsContent value="review" className="space-y-4">
                {renderGateContent('review')}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Gate Overview Component
function GateOverview({ gate, approval }) {
  const { t, language } = useLanguage();

  const gateTypeLabels = {
    review: { en: 'Review', ar: 'مراجعة' },
    approval: { en: 'Approval', ar: 'موافقة' },
    compliance: { en: 'Compliance', ar: 'امتثال' },
    submission: { en: 'Submission', ar: 'تقديم' },
    budget: { en: 'Budget', ar: 'ميزانية' },
    safety: { en: 'Safety', ar: 'سلامة' },
    quality: { en: 'Quality', ar: 'جودة' },
    exit: { en: 'Exit', ar: 'خروج' }
  };

  const roleLabels = {
    legal_officer: { en: 'Legal Officer', ar: 'المسؤول القانوني' },
    policy_officer: { en: 'Policy Officer', ar: 'مسؤول السياسات' },
    council_member: { en: 'Council Member', ar: 'عضو المجلس' },
    ministry_representative: { en: 'Ministry Representative', ar: 'ممثل الوزارة' },
    admin: { en: 'Admin', ar: 'مسؤول' },
    reviewer: { en: 'Reviewer', ar: 'مراجع' }
  };

  const statusLabels = {
    pending: { en: 'Pending', ar: 'معلق' },
    under_review: { en: 'Under Review', ar: 'قيد المراجعة' },
    approved: { en: 'Approved', ar: 'موافق عليه' },
    rejected: { en: 'Rejected', ar: 'مرفوض' },
    conditional: { en: 'Conditional', ar: 'مشروط' },
    info_requested: { en: 'Info Requested', ar: 'معلومات مطلوبة' }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600">{t({ en: 'Gate Type', ar: 'نوع البوابة' })}</p>
          <p className="font-semibold text-slate-900">
            {gateTypeLabels[gate.type] ? t(gateTypeLabels[gate.type]) : gate.type}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600">{t({ en: 'Required Role', ar: 'الدور المطلوب' })}</p>
          <p className="font-semibold text-slate-900">
            {roleLabels[gate.requiredRole] ? t(roleLabels[gate.requiredRole]) : gate.requiredRole}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600">{t({ en: 'SLA', ar: 'الوقت المحدد' })}</p>
          <p className="font-semibold text-slate-900">
            {gate.sla_days} {t({ en: 'days', ar: 'يوم' })}
          </p>
        </div>
        <div className="p-3 bg-slate-50 rounded border">
          <p className="text-xs text-slate-600">{t({ en: 'Status', ar: 'الحالة' })}</p>
          <p className="font-semibold text-slate-900">
            {approval 
              ? (statusLabels[approval.status] ? t(statusLabels[approval.status]) : approval.status)
              : t({ en: 'Not Started', ar: 'لم يبدأ' })}
          </p>
        </div>
      </div>

      {approval && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">{t({ en: 'Submitted By:', ar: 'قدمه:' })}</p>
              <p className="font-medium text-slate-900">{approval.requester_email}</p>
            </div>
            <div>
              <p className="text-slate-600">{t({ en: 'Submitted On:', ar: 'تاريخ التقديم:' })}</p>
              <p className="font-medium text-slate-900">
                {new Date(approval.created_date).toLocaleDateString()}
              </p>
            </div>
            {approval.reviewer_email && (
              <>
                <div>
                  <p className="text-slate-600">{t({ en: 'Reviewer:', ar: 'المراجع:' })}</p>
                  <p className="font-medium text-slate-900">{approval.reviewer_email}</p>
                </div>
                <div>
                  <p className="text-slate-600">{t({ en: 'Decision:', ar: 'القرار:' })}</p>
                  <Badge className={
                    approval.decision === 'approved' ? 'bg-green-600 text-white' :
                    approval.decision === 'rejected' ? 'bg-red-600 text-white' :
                    'bg-yellow-600 text-white'
                  }>
                    {approval.decision || 'Pending'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Self-Check Panel Component
function SelfCheckPanel({ gate, approval }) {
  const { t, language } = useLanguage();

  if (!approval) {
    return (
      <div className="text-center py-8 text-slate-500">
        {t({ en: 'Submit for approval to start self-check', ar: 'قدم للموافقة لبدء الفحص الذاتي' })}
      </div>
    );
  }

  const selfCheckData = approval.self_check_data || {};

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {gate.selfCheckItems?.map((item, idx) => {
          const checkItem = selfCheckData.checklist_items?.find(c => c.item === item[language]);
          
          return (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded border">
              {checkItem?.checked ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{item[language]}</p>
                {checkItem?.ai_verified && (
                  <Badge className="bg-purple-100 text-purple-700 text-xs mt-1">
                    AI Verified
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selfCheckData.ai_assessment && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="font-semibold text-purple-900 mb-2">
            {t({ en: '🤖 AI Assessment', ar: '🤖 تقييم الذكاء' })}
          </p>
          <p className="text-sm text-slate-700">
            Readiness Score: <span className="font-bold">{selfCheckData.ai_assessment.readiness_score}%</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Review Panel Component
function ReviewPanel({ gate, approval, currentUser, onDecision }) {
  const { t, language } = useLanguage();
  const [comments, setComments] = useState('');
  const [showDecision, setShowDecision] = useState(false);

  if (!approval) {
    return (
      <div className="text-center py-8 text-slate-500">
        {t({ en: 'No approval request yet', ar: 'لا يوجد طلب موافقة بعد' })}
      </div>
    );
  }

  // Check if current user can review
  const canReview = currentUser.role === 'admin' || 
                    currentUser.assigned_roles?.includes(gate.requiredRole);

  if (!canReview) {
    return (
      <div className="text-center py-8">
        <Badge className="bg-amber-100 text-amber-700">
          {t({ en: `Requires ${gate.requiredRole} role`, ar: `يتطلب دور ${gate.requiredRole}` })}
        </Badge>
      </div>
    );
  }

  if (approval.status === 'approved' || approval.status === 'rejected') {
    return (
      <div className="p-4 bg-slate-50 rounded-lg border">
        <p className="font-semibold text-slate-900 mb-2">
          {t({ en: 'Decision Recorded', ar: 'القرار مسجل' })}
        </p>
        <Badge className={approval.decision === 'approved' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>
          {approval.decision}
        </Badge>
        <p className="text-sm text-slate-700 mt-3">{approval.comments}</p>
        <p className="text-xs text-slate-500 mt-2">
          {t({ en: 'By', ar: 'بواسطة' })}: {approval.reviewer_email} • {new Date(approval.decision_date).toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reviewer Checklist */}
      <div className="space-y-2">
        <p className="font-semibold text-slate-900">
          {t({ en: 'Reviewer Checklist:', ar: 'قائمة المراجع:' })}
        </p>
        {gate.reviewerChecklistItems?.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded border">
            <CheckCircle2 className="h-5 w-5 text-slate-400 mt-0.5" />
            <p className="text-sm text-slate-700">{item[language]}</p>
          </div>
        ))}
      </div>

      {/* Decision Actions */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Textarea
          placeholder={t({ en: 'Reviewer comments...', ar: 'تعليقات المراجع...' })}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="mb-3"
        />
        
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => onDecision(approval, 'approved', comments)}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {t({ en: 'Approve', ar: 'موافقة' })}
          </Button>
          <Button
            onClick={() => onDecision(approval, 'conditional', comments, [])}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {t({ en: 'Conditional', ar: 'مشروط' })}
          </Button>
          <Button
            onClick={() => onDecision(approval, 'rejected', comments)}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {t({ en: 'Reject', ar: 'رفض' })}
          </Button>
        </div>
      </div>
    </div>
  );
}