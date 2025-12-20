import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  CheckCircle2, XCircle, AlertCircle, Shield, Search, Filter,
  Sparkles, Clock, TrendingUp
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function GateMaturityMatrix() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  // Comprehensive gate-by-gate audit
  const gates = [
    // PolicyRecommendation Gates (IMPLEMENTED - 100% coverage)
    {
      entityType: 'PolicyRecommendation',
      gateId: 'policy_legal_review',
      gateName: { en: 'Legal Review', ar: 'المراجعة القانونية' },
      workflowStage: 'legal_review',
      
      hasSelfCheck: true,
      selfCheckItemCount: 5,
      selfCheckItems: ['Citations complete', 'Legal framework identified', 'Stakeholder list ready', 'No obvious conflicts', 'Supporting documents attached'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Legal citations verified', 'No conflicts with existing policies', 'Compliance checked', 'Stakeholder consultation reviewed', 'Legal clarity adequate'],
      
      usesUnifiedComponent: true,
      componentName: 'PolicyLegalReviewGate',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 14, escalation: true },
      
      decisions: ['approved', 'requires_changes', 'rejected'],
      nextStageOnApprove: 'public_consultation',
      
      maturityScore: 95,
      gaps: []
    },
    {
      entityType: 'PolicyRecommendation',
      gateId: 'policy_public_consultation',
      gateName: { en: 'Public Consultation', ar: 'الاستشارة العامة' },
      workflowStage: 'public_consultation',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Public URL published', 'Minimum 30 days duration', 'Stakeholders notified', 'Feedback form ready'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Consultation duration adequate (30-60 days)', 'Feedback collected and reviewed', 'Summary prepared', 'Major concerns addressed'],
      
      usesUnifiedComponent: true,
      componentName: 'PolicyPublicConsultationManager',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 60, escalation: false },
      
      decisions: ['completed', 'extended'],
      nextStageOnApprove: 'council_approval',
      
      maturityScore: 90,
      gaps: []
    },
    {
      entityType: 'PolicyRecommendation',
      gateId: 'policy_council_approval',
      gateName: { en: 'Council Approval', ar: 'موافقة المجلس' },
      workflowStage: 'council_approval',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Briefing document prepared', 'Council meeting scheduled', 'All conditions from consultation addressed', 'Final text approved by legal'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Council briefing presented', 'Vote recorded (majority required)', 'Minutes documented', 'Conditions noted if conditional approval'],
      
      usesUnifiedComponent: true,
      componentName: 'PolicyCouncilApprovalGate',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 30, escalation: true },
      
      decisions: ['approved', 'conditional', 'rejected'],
      nextStageOnApprove: 'ministry_approval',
      
      maturityScore: 95,
      gaps: []
    },
    {
      entityType: 'PolicyRecommendation',
      gateId: 'policy_ministry_approval',
      gateName: { en: 'Ministry Approval', ar: 'موافقة الوزارة' },
      workflowStage: 'ministry_approval',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Council approval obtained', 'All conditions satisfied', 'Final text approved', 'Publication materials ready'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Ministry briefing reviewed', 'National alignment verified', 'Final approval documented', 'Publication authorized'],
      
      usesUnifiedComponent: true,
      componentName: 'PolicyMinistryApprovalGate',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 21, escalation: true },
      
      decisions: ['approved', 'rejected'],
      nextStageOnApprove: 'published',
      
      maturityScore: 95,
      gaps: []
    },
    
    // Challenge Gates - FULLY IMPLEMENTED
    {
      entityType: 'Challenge',
      gateId: 'challenge_submission',
      gateName: { en: 'Challenge Submission', ar: 'تقديم التحدي' },
      workflowStage: 'submitted',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Problem statement clear', 'Data/evidence attached', 'Stakeholders identified', 'KPIs defined'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Challenge valid and clear', 'Classification appropriate', 'Priority score justified', 'No duplicates'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 3, escalation: true },
      
      decisions: ['submit'],
      nextStageOnApprove: 'under_review',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Challenge',
      gateId: 'challenge_review',
      gateName: { en: 'Challenge Review', ar: 'مراجعة التحدي' },
      workflowStage: 'under_review',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['All reviewer feedback addressed', 'Classification confirmed', 'Priority validated', 'Ready for approval'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Problem well-defined', 'Evidence sufficient', 'Sector classification correct', 'Priority appropriate', 'No security concerns'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approved', 'requires_changes', 'rejected'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Challenge',
      gateId: 'challenge_treatment',
      gateName: { en: 'Treatment Plan Approval', ar: 'موافقة خطة المعالجة' },
      workflowStage: 'in_treatment',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Treatment track selected', 'Budget estimated', 'Timeline proposed', 'Success metrics defined'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Track appropriate for challenge', 'Resources available', 'Timeline realistic', 'Expected impact justified'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approve_plan'],
      nextStageOnApprove: 'in_treatment',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Challenge',
      gateId: 'challenge_resolution',
      gateName: { en: 'Resolution Approval', ar: 'موافقة الحل' },
      workflowStage: 'resolved',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Treatment completed', 'KPIs met', 'Lessons learned documented', 'Impact report ready'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Original problem solved', 'KPI targets achieved', 'Stakeholders satisfied', 'Scalability assessed', 'Resolution justified'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['resolved'],
      nextStageOnApprove: 'resolved',
      
      maturityScore: 100,
      gaps: []
    },

    // Pilot Gates - FULLY IMPLEMENTED (100% GOLD STANDARD)
    {
      entityType: 'Pilot',
      gateId: 'pilot_design_review',
      gateName: { en: 'Design Review Gate', ar: 'بوابة مراجعة التصميم' },
      workflowStage: 'approval_pending',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Hypothesis clearly defined', 'KPIs measurable and relevant', 'Target population well-defined', 'Methodology appropriate'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Design quality adequate', 'Resources feasible', 'Timeline realistic', 'Risk mitigation adequate', 'Success criteria defined'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approved', 'requires_changes', 'rejected'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Pilot',
      gateId: 'pilot_launch_approval',
      gateName: { en: 'Launch Approval Gate', ar: 'بوابة موافقة الإطلاق' },
      workflowStage: 'preparation',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Team onboarded and ready', 'Budget approved and allocated', 'Baseline data collection ready', 'Compliance requirements met'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Preparation complete', 'Stakeholders ready', 'Data systems operational', 'Safety protocols in place'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['approved', 'needs_preparation', 'rejected'],
      nextStageOnApprove: 'active',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Pilot',
      gateId: 'pilot_mid_review',
      gateName: { en: 'Mid-Pilot Review Gate', ar: 'بوابة المراجعة المتوسطة' },
      workflowStage: 'active',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['KPI data collected and current', 'No critical unresolved issues', 'Budget within acceptable limits', 'Team performing effectively'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['KPI progress on track (>70%)', 'Budget variance acceptable (<15%)', 'No unmitigated critical risks', 'Stakeholder feedback positive', 'Pivot decision if needed'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['continue', 'pivot', 'pause', 'terminate'],
      nextStageOnApprove: 'monitoring',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Pilot',
      gateId: 'pilot_completion_evaluation',
      gateName: { en: 'Completion Evaluation Gate', ar: 'بوابة تقييم الاكتمال' },
      workflowStage: 'evaluation',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['All KPI data verified and validated', 'Final report drafted', 'Lessons learned documented', 'Budget fully reconciled'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Success criteria met', 'Data quality validated', 'ROI calculated and documented', 'Scaling readiness assessed', 'Lessons learned comprehensive'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['scale', 'iterate', 'pivot', 'terminate'],
      nextStageOnApprove: 'completed',
      
      maturityScore: 100,
      gaps: []
    },

    // RDProposal
    {
      entityType: 'RDProposal',
      gateId: 'rd_proposal_submission',
      gateName: { en: 'Proposal Submission', ar: 'تقديم المقترح' },
      workflowStage: 'submitted',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: false,
      reviewerChecklistItemCount: 0,
      reviewerChecklistItems: [],
      
      usesUnifiedComponent: false,
      componentName: 'ProposalSubmissionWizard',
      
      hasRequesterAI: false,
      hasReviewerAI: false,
      aiPromptDefined: false,
      
      inApprovalCenter: true,
      hasInlineApproval: false,
      
      hasSLA: false,
      slaConfig: null,
      
      decisions: ['submit'],
      nextStageOnApprove: 'under_review',
      
      maturityScore: 25,
      gaps: ['No self-check', 'No AI', 'No reviewer checklist', 'No inline approval', 'Not unified', 'No SLA']
    },
    {
      entityType: 'RDProposal',
      gateId: 'rd_proposal_review',
      gateName: { en: 'Proposal Review', ar: 'مراجعة المقترح' },
      workflowStage: 'under_review',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: false,
      reviewerChecklistItemCount: 0,
      reviewerChecklistItems: [],
      
      usesUnifiedComponent: false,
      componentName: 'ProposalReviewWorkflow',
      
      hasRequesterAI: false,
      hasReviewerAI: false,
      aiPromptDefined: false,
      
      inApprovalCenter: true,
      hasInlineApproval: false,
      
      hasSLA: false,
      slaConfig: null,
      
      decisions: ['approved', 'rejected'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 30,
      gaps: ['No self-check', 'No AI scorer', 'No checklist', 'No inline approval', 'Not unified']
    },

    // ProgramApplication
    {
      entityType: 'ProgramApplication',
      gateId: 'program_app_screening',
      gateName: { en: 'Application Screening', ar: 'فحص الطلب' },
      workflowStage: 'under_review',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: false,
      reviewerChecklistItemCount: 0,
      reviewerChecklistItems: [],
      
      usesUnifiedComponent: false,
      componentName: 'ProgramApplicationScreening',
      
      hasRequesterAI: false,
      hasReviewerAI: false,
      aiPromptDefined: false,
      
      inApprovalCenter: true,
      hasInlineApproval: false,
      
      hasSLA: false,
      slaConfig: null,
      
      decisions: ['accepted', 'rejected', 'waitlist'],
      nextStageOnApprove: 'accepted',
      
      maturityScore: 25,
      gaps: ['No self-check', 'No AI', 'No checklist', 'No inline approval', 'Not unified']
    },

    // MatchmakerApplication
    {
      entityType: 'MatchmakerApplication',
      gateId: 'matchmaker_screening',
      gateName: { en: 'Matchmaker Screening', ar: 'فحص التوفيق' },
      workflowStage: 'screening',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: false,
      reviewerChecklistItemCount: 0,
      reviewerChecklistItems: [],
      
      usesUnifiedComponent: false,
      componentName: 'ScreeningChecklist',
      
      hasRequesterAI: false,
      hasReviewerAI: false,
      aiPromptDefined: false,
      
      inApprovalCenter: true,
      hasInlineApproval: false,
      
      hasSLA: false,
      slaConfig: null,
      
      decisions: ['pass', 'fail'],
      nextStageOnApprove: 'evaluation',
      
      maturityScore: 30,
      gaps: ['No self-check', 'No AI', 'No checklist', 'No inline approval', 'Not unified']
    },
    {
      entityType: 'MatchmakerApplication',
      gateId: 'matchmaker_evaluation',
      gateName: { en: 'Evaluation Gate', ar: 'بوابة التقييم' },
      workflowStage: 'evaluation',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: false,
      reviewerChecklistItemCount: 0,
      reviewerChecklistItems: [],
      
      usesUnifiedComponent: false,
      componentName: 'EvaluationRubrics',
      
      hasRequesterAI: false,
      hasReviewerAI: false,
      aiPromptDefined: false,
      
      inApprovalCenter: true,
      hasInlineApproval: false,
      
      hasSLA: false,
      slaConfig: null,
      
      decisions: ['matched', 'not_matched'],
      nextStageOnApprove: 'matched',
      
      maturityScore: 35,
      gaps: ['No self-check', 'No AI match predictor', 'No inline approval', 'Not unified']
    },

    // RDProject Gates - FULLY IMPLEMENTED (100% GOLD STANDARD)
    {
      entityType: 'RDProject',
      gateId: 'rd_project_kickoff',
      gateName: { en: 'Project Kickoff Approval', ar: 'موافقة بدء المشروع' },
      workflowStage: 'approved',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Research team confirmed', 'Budget approved', 'Timeline validated', 'Ethics approval obtained (if required)'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Project scope clear', 'Methodology sound', 'Team qualified', 'Resources adequate', 'Compliance verified'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approved', 'requires_changes'],
      nextStageOnApprove: 'active',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'RDProject',
      gateId: 'rd_milestone_approval',
      gateName: { en: 'Milestone Approval', ar: 'موافقة المعالم' },
      workflowStage: 'active',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Deliverables complete', 'Data collected', 'Budget on track', 'TRL documented'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Deliverables quality adequate', 'Progress on schedule', 'Budget variance acceptable', 'TRL advancement justified', 'Ready for next phase'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['approved', 'requires_revision'],
      nextStageOnApprove: 'active',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'RDProject',
      gateId: 'rd_completion_evaluation',
      gateName: { en: 'Completion Evaluation', ar: 'تقييم الاكتمال' },
      workflowStage: 'completed',
      
      hasSelfCheck: true,
      selfCheckItemCount: 5,
      selfCheckItems: ['All outputs delivered', 'Publications submitted', 'IP documented', 'Impact assessed', 'Final report complete'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 6,
      reviewerChecklistItems: ['Research objectives met', 'Output quality verified', 'TRL target achieved', 'Impact significant', 'Publications peer-reviewed', 'Commercialization potential assessed'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab + RDProjectFinalEvaluationPanel',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 14, escalation: true },
      
      decisions: ['approved', 'requires_additional_work'],
      nextStageOnApprove: 'completed',
      
      maturityScore: 100,
      gaps: []
    },

    // Solution Gates - FULLY IMPLEMENTED (100% GOLD STANDARD)
    {
      entityType: 'Solution',
      gateId: 'solution_submission',
      gateName: { en: 'Solution Submission', ar: 'تقديم الحل' },
      workflowStage: 'verification_pending',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Profile complete', 'Documentation attached', 'Pricing defined', 'Technical specs complete'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Profile quality adequate', 'Documentation valid', 'Provider legitimate', 'No duplicates', 'Compliance check'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 3, escalation: true },
      
      decisions: ['submit'],
      nextStageOnApprove: 'under_review',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Solution',
      gateId: 'solution_technical_verification',
      gateName: { en: 'Technical Verification', ar: 'التحقق التقني' },
      workflowStage: 'under_review',
      
      hasSelfCheck: true,
      selfCheckItemCount: 5,
      selfCheckItems: ['TRL documented', 'Security addressed', 'Scalability proven', 'Case studies attached', 'Certifications uploaded'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 8,
      reviewerChecklistItems: ['Technical quality', 'Security compliance', 'Integration feasibility', 'Scalability', 'TRL accurate', 'Performance proven', 'Architecture sound', 'Deployment ready'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['verified', 'revision_requested', 'rejected'],
      nextStageOnApprove: 'verified',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Solution',
      gateId: 'solution_deployment_readiness',
      gateName: { en: 'Deployment Readiness', ar: 'جاهزية النشر' },
      workflowStage: 'verified',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Support plan ready', 'Pricing competitive', 'Deployment guide complete', 'Training materials available'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Deployment readiness confirmed', 'Support quality adequate', 'Pricing reasonable', 'Market ready', 'Documentation complete'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['approved', 'needs_improvement'],
      nextStageOnApprove: 'verified',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Solution',
      gateId: 'solution_publishing',
      gateName: { en: 'Marketplace Publishing', ar: 'النشر في السوق' },
      workflowStage: 'verified',
      
      hasSelfCheck: true,
      selfCheckItemCount: 3,
      selfCheckItems: ['Public description polished', 'Marketing materials ready', 'Keywords optimized'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 3,
      reviewerChecklistItems: ['Public content appropriate', 'SEO optimized', 'Marketplace ready'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 2, escalation: false },
      
      decisions: ['publish'],
      nextStageOnApprove: 'published',
      
      maturityScore: 100,
      gaps: []
    },

    // Program - PLATINUM (100% - All 4 Gates)
    {
      entityType: 'Program',
      gateId: 'program_launch_approval',
      gateName: { en: 'Program Launch Approval', ar: 'موافقة إطلاق البرنامج' },
      workflowStage: 'launch_approval_pending',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Curriculum complete', 'Mentors confirmed', 'Budget approved', 'Application portal ready'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Program design quality', 'Resource readiness', 'Timeline feasibility', 'Success metrics defined'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['approved', 'requires_changes', 'rejected'],
      nextStageOnApprove: 'applications_open',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Program',
      gateId: 'program_selection_approval',
      gateName: { en: 'Selection Approval', ar: 'موافقة الاختيار' },
      workflowStage: 'selection_in_progress',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Cohort balanced', 'Capacity confirmed', 'Onboarding ready', 'Selection criteria applied'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Selection process fair', 'Diversity adequate', 'Quality threshold met', 'Capacity limits respected'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approved', 'requires_revision'],
      nextStageOnApprove: 'active',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Program',
      gateId: 'program_mid_review',
      gateName: { en: 'Mid-Program Review', ar: 'مراجعة منتصف البرنامج' },
      workflowStage: 'active',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Engagement metrics current', 'Progress on track', 'Issues resolved', 'Adjustments documented'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Participant engagement adequate', 'Progress vs plan acceptable', 'Dropout rate acceptable', 'Quality maintained', 'Adjustments justified'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 3, escalation: true },
      
      decisions: ['continue', 'pivot', 'adjust'],
      nextStageOnApprove: 'active',
      
      maturityScore: 100,
      gaps: []
    },
    {
      entityType: 'Program',
      gateId: 'program_completion_review',
      gateName: { en: 'Program Completion Review', ar: 'مراجعة اكتمال البرنامج' },
      workflowStage: 'completion_review_pending',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['All sessions delivered', 'Participants evaluated', 'Outcomes documented', 'Alumni onboarded'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Success metrics achieved', 'Graduate outcomes tracked', 'Impact report quality', 'Lessons learned documented', 'Alumni network active'],
      
      usesUnifiedComponent: true,
      componentName: 'UnifiedWorkflowApprovalTab + ProgramExpertEvaluation',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: true,
      hasInlineApproval: true,
      
      hasSLA: true,
      slaConfig: { days: 14, escalation: true },
      
      decisions: ['approved', 'requires_revision'],
      nextStageOnApprove: 'completed',
      
      maturityScore: 100,
      gaps: []
    },

    // CitizenIdea Gates
    {
      entityType: 'CitizenIdea',
      gateId: 'citizen_idea_screening',
      gateName: { en: 'Idea Screening', ar: 'فحص الفكرة' },
      workflowStage: 'screening',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['No duplicate ideas', 'Category appropriate', 'Content quality acceptable', 'No toxic content'],
      
      usesUnifiedComponent: false,
      componentName: 'ContentModerationAI + AIIdeaClassifier',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: false,
      hasInlineApproval: false,
      
      hasSLA: true,
      slaConfig: { days: 2, escalation: false },
      
      decisions: ['approved', 'rejected', 'duplicate'],
      nextStageOnApprove: 'under_evaluation',
      
      maturityScore: 65,
      gaps: ['Not in ApprovalCenter', 'No unified tab', 'Self-check for citizens missing', 'Not using ApprovalRequest entity']
    },
    {
      entityType: 'CitizenIdea',
      gateId: 'citizen_idea_evaluation',
      gateName: { en: 'Expert Evaluation', ar: 'تقييم الخبراء' },
      workflowStage: 'under_evaluation',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 8,
      reviewerChecklistItems: ['Feasibility score', 'Impact score', 'Cost score', 'Innovation score', 'Alignment score', 'Urgency score', 'Scalability score', 'Risk score'],
      
      usesUnifiedComponent: false,
      componentName: 'UnifiedEvaluationForm + IdeaEvaluationQueue',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: false,
      hasInlineApproval: false,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['approve', 'reject', 'convert_to_challenge', 'convert_to_solution', 'convert_to_pilot', 'convert_to_rd'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 75,
      gaps: ['Not in ApprovalCenter', 'No unified tab', 'Not using ApprovalRequest entity', 'Multi-evaluator consensus exists but not integrated']
    },

    // InnovationProposal Gates
    {
      entityType: 'InnovationProposal',
      gateId: 'innovation_proposal_submission',
      gateName: { en: 'Proposal Submission', ar: 'تقديم المقترح' },
      workflowStage: 'submitted',
      
      hasSelfCheck: true,
      selfCheckItemCount: 6,
      selfCheckItems: ['Program/Challenge linked', 'Implementation plan complete', 'Budget estimated', 'Team identified', 'Success metrics defined', 'Strategic alignment documented'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 5,
      reviewerChecklistItems: ['Completeness verified', 'Budget realistic', 'Team qualified', 'Alignment confirmed', 'No duplicates'],
      
      usesUnifiedComponent: false,
      componentName: 'AIProposalScreening',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: false,
      hasInlineApproval: false,
      
      hasSLA: true,
      slaConfig: { days: 3, escalation: true },
      
      decisions: ['pass_screening'],
      nextStageOnApprove: 'screening',
      
      maturityScore: 80,
      gaps: ['Not in ApprovalCenter', 'No unified tab', 'Not using ApprovalRequest entity']
    },
    {
      entityType: 'InnovationProposal',
      gateId: 'innovation_proposal_screening',
      gateName: { en: 'Proposal Screening', ar: 'فحص المقترح' },
      workflowStage: 'screening',
      
      hasSelfCheck: false,
      selfCheckItemCount: 0,
      selfCheckItems: [],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 6,
      reviewerChecklistItems: ['Eligibility criteria met', 'Technical feasibility', 'Budget appropriateness', 'Strategic fit', 'Team capacity', 'Risk level acceptable'],
      
      usesUnifiedComponent: false,
      componentName: 'AIProposalScreening',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: false,
      hasInlineApproval: false,
      
      hasSLA: true,
      slaConfig: { days: 5, escalation: true },
      
      decisions: ['approved', 'rejected', 'needs_revision'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 75,
      gaps: ['Not in ApprovalCenter', 'No unified tab', 'Self-check for requester missing', 'Not using ApprovalRequest entity']
    },
    {
      entityType: 'InnovationProposal',
      gateId: 'innovation_stakeholder_alignment',
      gateName: { en: 'Stakeholder Alignment', ar: 'توافق أصحاب المصلحة' },
      workflowStage: 'screening',
      
      hasSelfCheck: true,
      selfCheckItemCount: 4,
      selfCheckItems: ['Municipality buy-in obtained', 'Department alignment confirmed', 'Resource commitment secured', 'Success criteria agreed'],
      
      hasReviewerChecklist: true,
      reviewerChecklistItemCount: 4,
      reviewerChecklistItems: ['Stakeholder signatures collected', 'Alignment documented', 'Commitment letters received', 'Conflicts resolved'],
      
      usesUnifiedComponent: false,
      componentName: 'StakeholderAlignmentGate',
      
      hasRequesterAI: true,
      hasReviewerAI: true,
      aiPromptDefined: true,
      
      inApprovalCenter: false,
      hasInlineApproval: false,
      
      hasSLA: true,
      slaConfig: { days: 7, escalation: true },
      
      decisions: ['aligned', 'needs_negotiation'],
      nextStageOnApprove: 'approved',
      
      maturityScore: 85,
      gaps: ['Not in ApprovalCenter', 'Not using ApprovalRequest entity']
    }
  ];

  // Filter gates
  const filteredGates = gates.filter(gate => {
    if (entityFilter !== 'all' && gate.entityType !== entityFilter) return false;
    
    if (maturityFilter === 'high' && gate.maturityScore < 70) return false;
    if (maturityFilter === 'medium' && (gate.maturityScore < 40 || gate.maturityScore >= 70)) return false;
    if (maturityFilter === 'low' && gate.maturityScore >= 40) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return gate.gateName.en.toLowerCase().includes(q) || 
             gate.gateName.ar?.includes(q) ||
             gate.entityType.toLowerCase().includes(q);
    }
    
    return true;
  });

  const uniqueEntities = [...new Set(gates.map(g => g.entityType))];

  const maturityStats = {
    high: gates.filter(g => g.maturityScore >= 70).length,
    medium: gates.filter(g => g.maturityScore >= 40 && g.maturityScore < 70).length,
    low: gates.filter(g => g.maturityScore < 40).length,
    avgMaturity: Math.round(gates.reduce((sum, g) => sum + g.maturityScore, 0) / gates.length),
    citizenGates: gates.filter(g => g.entityType === 'CitizenIdea' || g.entityType === 'InnovationProposal').length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: '🔬 Gate Maturity Matrix', ar: '🔬 مصفوفة نضج البوابات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'Detailed gate-by-gate analysis of approval infrastructure, checklists, AI assistance, and integration',
            ar: 'تحليل تفصيلي بوابة تلو الأخرى للبنية التحتية للموافقة، القوائم، المساعدة الذكية، والتكامل'
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{gates.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Gates', ar: 'إجمالي البوابات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{maturityStats.high}</p>
            <p className="text-xs text-slate-600">{t({ en: 'High Maturity (≥70%)', ar: 'نضج عالي (≥70%)' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-4 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{maturityStats.medium}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Medium (40-69%)', ar: 'متوسط (40-69%)' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{maturityStats.low}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Low (<40%)', ar: 'منخفض (<40%)' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{maturityStats.avgMaturity}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Maturity', ar: 'النضج المتوسط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-4 text-center">
            <Shield className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{maturityStats.citizenGates}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Citizen Gates', ar: 'بوابات المواطنين' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t({ en: 'Search gates...', ar: 'بحث البوابات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Filter className="h-4 w-4 text-slate-500" />

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</option>
              {uniqueEntities.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>

            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t({ en: 'All Maturity', ar: 'كل النضج' })}</option>
              <option value="high">{t({ en: 'High (≥70%)', ar: 'عالي (≥70%)' })}</option>
              <option value="medium">{t({ en: 'Medium (40-69%)', ar: 'متوسط (40-69%)' })}</option>
              <option value="low">{t({ en: 'Low (<40%)', ar: 'منخفض (<40%)' })}</option>
            </select>

            <Badge variant="outline">
              {filteredGates.length} {t({ en: 'gates', ar: 'بوابة' })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gate Table */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">{t({ en: 'Entity', ar: 'الكيان' })}</th>
                  <th className="text-left p-2 font-semibold">{t({ en: 'Gate', ar: 'البوابة' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Self-Check', ar: 'فحص ذاتي' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Reviewer List', ar: 'قائمة المراجع' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Req AI', ar: 'ذكاء ط' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Rev AI', ar: 'ذكاء م' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Approval Ctr', ar: 'مركز موافقات' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Unified', ar: 'موحد' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'SLA', ar: 'SLA' })}</th>
                  <th className="text-center p-2 font-semibold">{t({ en: 'Maturity', ar: 'النضج' })}</th>
                </tr>
              </thead>
              <tbody>
                {filteredGates.map((gate, idx) => (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">{gate.entityType}</Badge>
                    </td>
                    <td className="p-2">
                      <p className="font-medium text-xs">{gate.gateName[language]}</p>
                      <p className="text-xs text-slate-500">{gate.gateId}</p>
                    </td>
                    <td className="p-2 text-center">
                      {gate.hasSelfCheck ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-slate-600">{gate.selfCheckItemCount}</span>
                        </div>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.hasReviewerChecklist ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-slate-600">{gate.reviewerChecklistItemCount}</span>
                        </div>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.hasRequesterAI ? (
                        <Sparkles className="h-4 w-4 text-pink-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.hasReviewerAI ? (
                        <Sparkles className="h-4 w-4 text-purple-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.inApprovalCenter ? (
                        gate.hasInlineApproval ? (
                          <div className="flex flex-col items-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <Badge className="text-xs bg-green-100 text-green-700 mt-1">Inline</Badge>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <Badge className="text-xs bg-yellow-100 text-yellow-700 mt-1">View</Badge>
                          </div>
                        )
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.usesUnifiedComponent ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {gate.hasSLA ? (
                        <div className="flex flex-col items-center">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-slate-600">{gate.slaConfig?.days}d</span>
                        </div>
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold" style={{
                          color: gate.maturityScore >= 70 ? '#10b981' :
                                 gate.maturityScore >= 40 ? '#f59e0b' : '#ef4444'
                        }}>
                          {gate.maturityScore}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gate Details (Expandable) */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          {t({ en: 'Gate Details & Gaps', ar: 'تفاصيل البوابات والفجوات' })}
        </h2>
        {filteredGates.map((gate, idx) => (
          <Card key={idx} className="border-l-4" style={{
            borderLeftColor: gate.maturityScore >= 70 ? '#10b981' :
                            gate.maturityScore >= 40 ? '#f59e0b' : '#ef4444'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="outline">{gate.entityType}</Badge>
                    <span>{gate.gateName[language]}</span>
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Component: {gate.componentName} • Stage: {gate.workflowStage}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{
                    color: gate.maturityScore >= 70 ? '#10b981' :
                           gate.maturityScore >= 40 ? '#f59e0b' : '#ef4444'
                  }}>
                    {gate.maturityScore}%
                  </div>
                  <p className="text-xs text-slate-500">Maturity</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600 mb-1">{t({ en: 'Self-Check Items', ar: 'عناصر الفحص الذاتي' })}</p>
                  <p className="font-bold text-lg">
                    {gate.hasSelfCheck ? (
                      <span className="text-green-600">{gate.selfCheckItemCount}</span>
                    ) : (
                      <span className="text-red-600">0</span>
                    )}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600 mb-1">{t({ en: 'Reviewer Checklist', ar: 'قائمة المراجع' })}</p>
                  <p className="font-bold text-lg">
                    {gate.hasReviewerChecklist ? (
                      <span className="text-green-600">{gate.reviewerChecklistItemCount}</span>
                    ) : (
                      <span className="text-red-600">0</span>
                    )}
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <p className="text-slate-600 mb-1">{t({ en: 'Decisions', ar: 'القرارات' })}</p>
                  <p className="font-bold text-lg">{gate.decisions.length}</p>
                </div>
              </div>

              {gate.reviewerChecklistItems.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    {t({ en: 'Reviewer Checklist:', ar: 'قائمة المراجع:' })}
                  </p>
                  <div className="space-y-1">
                    {gate.reviewerChecklistItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs p-2 bg-blue-50 rounded">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gate.gaps.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-900 mb-2">
                    {t({ en: 'Gaps:', ar: 'الفجوات:' })}
                  </p>
                  <ul className="space-y-1">
                    {gate.gaps.map((gap, i) => (
                      <li key={i} className="text-xs text-red-700">• {gap}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      <Card className="bg-gradient-to-br from-teal-50 to-white">
        <CardContent className="pt-4 space-y-2">
          <Link to={createPageUrl('WorkflowApprovalSystemCoverage')}>
            <Button className="w-full justify-between" variant="outline">
              <span>{t({ en: '← Back to System Coverage', ar: '← رجوع لتغطية النظام' })}</span>
            </Button>
          </Link>
          <Link to={createPageUrl('ApprovalSystemImplementationPlan')}>
            <Button className="w-full justify-between bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <span>{t({ en: 'View Implementation Plan →', ar: 'عرض خطة التنفيذ ←' })}</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(GateMaturityMatrix, { requireAdmin: true });