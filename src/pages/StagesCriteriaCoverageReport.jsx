import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Target,
  FileText,
  TrendingUp,
  Shield,
  Zap,
  Users,
  ClipboardCheck,
  Award
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function StagesCriteriaCoverageReport() {
  const { language, isRTL, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Comprehensive data structure
  const reportData = {
    overview: {
      totalEntities: 9,
      totalStages: 37,
      totalCriteriaTypes: 12,
      totalUniqueCriteria: 115,
      implementedCriteria: 28,
      coveragePercentage: 24
    },

    evaluatableEntities: [
      {
        name: 'PolicyRecommendation',
        icon: '🛡️',
        totalStages: 4,
        stages: [
          {
            name: 'Legal Review Gate',
            order: 1,
            performer: 'Legal Officer',
            status: '✅ Implemented',
            implementedIn: ['Entity: legal_review object', 'Component: PolicyLegalReviewGate', 'Workflow: fully operational'],
            scopeType: 'review',
            criteria: [
              { name: 'citations_completeness', type: 'boolean', implemented: '✅ Yes (self-check)' },
              { name: 'legal_citations_verified', type: 'boolean', implemented: '✅ Yes (reviewer checklist)' },
              { name: 'no_policy_conflicts', type: 'boolean', implemented: '✅ Yes (reviewer checklist + AI conflict detector)' },
              { name: 'compliance_checked', type: 'boolean', implemented: '✅ Yes (reviewer checklist)' },
              { name: 'legal_clarity_adequate', type: 'boolean', implemented: '✅ Yes (reviewer checklist)' }
            ]
          },
          {
            name: 'Public Consultation Manager',
            order: 2,
            performer: 'Policy Officer',
            status: '✅ Implemented',
            implementedIn: ['Entity: public_consultation object', 'Component: PolicyPublicConsultationManager'],
            scopeType: 'consultation',
            criteria: [
              { name: 'duration_adequate', type: 'boolean', implemented: '✅ Yes (30-60 days tracked)' },
              { name: 'feedback_collected', type: 'boolean', implemented: '✅ Yes (feedback_count)' },
              { name: 'summary_prepared', type: 'boolean', implemented: '✅ Yes (summary field)' },
              { name: 'public_url_active', type: 'boolean', implemented: '✅ Yes (public_url field)' }
            ]
          },
          {
            name: 'Council Approval Gate',
            order: 3,
            performer: 'Council Member',
            status: '✅ Implemented',
            implementedIn: ['Component: PolicyCouncilApprovalGate', 'Workflow: voting system'],
            scopeType: 'approval',
            criteria: [
              { name: 'council_vote_recorded', type: 'boolean', implemented: '✅ Yes (approvals array)' },
              { name: 'majority_achieved', type: 'boolean', implemented: '✅ Yes (approval logic)' },
              { name: 'minutes_documented', type: 'boolean', implemented: '✅ Yes (comments field)' },
              { name: 'conditions_tracked', type: 'array', implemented: '✅ Yes (conditions array)' }
            ]
          },
          {
            name: 'Ministry Approval Gate',
            order: 4,
            performer: 'Ministry Representative',
            status: '✅ Implemented',
            implementedIn: ['Component: PolicyMinistryApprovalGate'],
            scopeType: 'final_approval',
            criteria: [
              { name: 'national_alignment_verified', type: 'boolean', implemented: '✅ Yes (reviewer checklist)' },
              { name: 'final_approval_documented', type: 'boolean', implemented: '✅ Yes (approvals array)' },
              { name: 'publication_authorized', type: 'boolean', implemented: '✅ Yes (workflow_stage=published)' }
            ]
          }
        ]
      },
      {
        name: 'InnovationProposal',
        icon: '📝',
        totalStages: 4,
        stages: [
          {
            name: 'AI Initial Screening',
            order: 1,
            performer: 'AI Automation',
            status: '✅ Implemented',
            implementedIn: ['Entity: ai_pre_screening object', 'Workflow: pending implementation'],
            scopeType: 'intake',
            criteria: [
              { name: 'proposal_completeness_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.proposal_completeness_score)' },
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.feasibility_score)' },
              { name: 'innovation_type_classification', type: 'enum', implemented: '✅ Yes (ai_pre_screening.innovation_type_classification)' },
              { name: 'budget_reasonability', type: 'boolean', implemented: '✅ Yes (ai_pre_screening.budget_reasonability + score)' },
              { name: 'team_adequacy', type: 'boolean', implemented: '✅ Yes (ai_pre_screening.team_adequacy + score)' }
            ]
          },
          {
            name: 'Expert Review',
            order: 2,
            performer: 'Domain Expert',
            status: '✅ Implemented',
            implementedIn: ['UnifiedEvaluationForm', 'ExpertEvaluation entity'],
            scopeType: 'review',
            criteria: [
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes' },
              { name: 'impact_score', type: 'number', implemented: '✅ Yes' },
              { name: 'innovation_score', type: 'number', implemented: '✅ Yes' },
              { name: 'strategic_alignment_score', type: 'number', implemented: '✅ Yes' },
              { name: 'recommendation', type: 'enum', implemented: '✅ Yes' }
            ]
          },
          {
            name: 'Stakeholder Alignment',
            order: 3,
            performer: 'Municipal Leadership',
            status: '⚠️ Partial',
            implementedIn: ['Workflow: pending implementation'],
            scopeType: 'approval',
            criteria: [
              { name: 'stakeholder_buy_in', type: 'boolean', implemented: '⚠️ Workflow pending' },
              { name: 'resource_availability', type: 'boolean', implemented: '⚠️ Workflow pending' },
              { name: 'policy_alignment', type: 'boolean', implemented: '⚠️ Workflow pending' }
            ]
          },
          {
            name: 'Conversion Decision',
            order: 4,
            performer: 'Admin / System',
            status: '✅ Implemented',
            implementedIn: ['InnovationProposalDetail', 'converted_entity_type tracking'],
            scopeType: 'conversion',
            criteria: [
              { name: 'conversion_type', type: 'enum', implemented: '✅ Yes (converted_entity_type in entity)' },
              { name: 'conversion_readiness', type: 'boolean', implemented: '⚠️ maturity_level exists but not gated' }
            ]
          }
        ]
      },
      {
        name: 'Challenge',
        icon: '🚩',
        totalStages: 4,
        stages: [
          {
            name: 'Intake Screening',
            order: 1,
            performer: 'Admin/Coordinator',
            status: '✅ Implemented',
            implementedIn: ['ChallengeReviewQueue', 'ChallengeReviewWorkflow component'],
            scopeType: 'intake',
            criteria: [
              { name: 'completeness_check', type: 'boolean', implemented: '⚠️ Checklist in workflow' },
              { name: 'data_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'clarity_score', type: 'number', implemented: '❌ Missing' },
              { name: 'duplicate_check', type: 'boolean', implemented: '❌ Missing (AI)' },
              { name: 'urgency_level', type: 'enum', implemented: '❌ Missing' }
            ]
          },
          {
            name: 'Expert Evaluation',
            order: 2,
            performer: 'Assigned Experts',
            status: '✅ Implemented',
            implementedIn: ['ExpertEvaluationWorkflow', 'UnifiedEvaluationForm'],
            scopeType: 'review',
            criteria: [
              { name: 'severity_score', type: 'number', implemented: '❌ Missing (uses feasibility_score instead)' },
              { name: 'impact_score', type: 'number', implemented: '✅ Yes' },
              { name: 'strategic_alignment_score', type: 'number', implemented: '✅ Yes' },
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes' },
              { name: 'cost_to_treat_estimate', type: 'number', implemented: '❌ Missing' },
              { name: 'risk_score', type: 'number', implemented: '✅ Yes' },
              { name: 'innovation_score', type: 'number', implemented: '✅ Yes' },
              { name: 'recommendation', type: 'enum', implemented: '✅ Yes' }
            ]
          },
          {
            name: 'Track Assignment Decision',
            order: 3,
            performer: 'AI + Admin',
            status: '❌ Missing',
            implementedIn: [],
            scopeType: 'decision',
            criteria: [
              { name: 'complexity_level', type: 'enum', implemented: '❌ Missing' },
              { name: 'innovation_potential_score', type: 'number', implemented: '❌ Missing' },
              { name: 'research_intensity_score', type: 'number', implemented: '❌ Missing' },
              { name: 'procurement_readiness_score', type: 'number', implemented: '❌ Missing' },
              { name: 'recommended_track', type: 'enum', implemented: '❌ Missing (AI suggestion exists in Challenge.ai_suggestions)' }
            ]
          },
          {
            name: 'Executive Approval',
            order: 4,
            performer: 'Executive Leadership',
            status: '⚠️ Partial',
            implementedIn: ['ExecutiveStrategicChallengeQueue'],
            scopeType: 'approval',
            criteria: [
              { name: 'national_priority_score', type: 'number', implemented: '❌ Missing' },
              { name: 'political_sensitivity_score', type: 'number', implemented: '❌ Missing' },
              { name: 'budget_justification_score', type: 'number', implemented: '❌ Missing' },
              { name: 'strategic_impact_score', type: 'number', implemented: '❌ Missing' },
              { name: 'executive_decision', type: 'enum', implemented: '❌ Missing (uses status change only)' }
            ]
          }
        ]
      },
      {
        name: 'Solution',
        icon: '💡',
        totalStages: 4,
        stages: [
          {
            name: 'Solution Submission Gate',
            order: 1,
            performer: 'Solution Reviewer',
            status: '✅ Implemented',
            implementedIn: ['ApprovalGateConfig solution.submission', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 3 days'],
            scopeType: 'intake',
            criteria: [
              { name: 'profile_completeness_score', type: 'calculated', implemented: '✅ Yes (AI calculates from required fields)' },
              { name: 'documentation_quality_score', type: 'number', implemented: '✅ Yes (AI analysis in ReviewerAI prompt)' },
              { name: 'credential_validity_check', type: 'boolean', implemented: '✅ Yes (reviewer checklist item)' },
              { name: 'provider_legitimacy_score', type: 'number', implemented: '✅ Yes (AI assessment in ReviewerAI prompt, flag if < 70%)' }
            ]
          },
          {
            name: 'Technical Verification Gate',
            order: 2,
            performer: 'Technical Experts',
            status: '✅ Implemented',
            implementedIn: ['ApprovalGateConfig solution.technical_verification', 'UnifiedWorkflowApprovalTab', 'SolutionDetail Experts tab', 'ExpertEvaluation entity', 'SLA: 7 days'],
            scopeType: 'verification',
            criteria: [
              { name: 'technical_quality_score', type: 'number', implemented: '✅ Yes (8-dimension ExpertEvaluation)' },
              { name: 'security_compliance_score', type: 'number', implemented: '✅ Yes (reviewer checklist + AI PDPL/ISO27001 check)' },
              { name: 'integration_feasibility_score', type: 'number', implemented: '✅ Yes (reviewer checklist via API docs assessment)' },
              { name: 'scalability_score', type: 'number', implemented: '✅ Yes (ExpertEvaluation dimension)' },
              { name: 'verification_status', type: 'enum', implemented: '✅ Yes (workflow_stage + verification_status)' }
            ]
          },
          {
            name: 'Deployment Readiness Gate',
            order: 3,
            performer: 'Solution Approver',
            status: '✅ Implemented',
            implementedIn: ['ApprovalGateConfig solution.deployment_readiness', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 5 days'],
            scopeType: 'readiness',
            criteria: [
              { name: 'maturity_level', type: 'enum', implemented: '✅ Yes (in entity)' },
              { name: 'deployment_readiness_score', type: 'calculated', implemented: '✅ Yes (composite in ReviewerAI prompt)' },
              { name: 'support_quality_score', type: 'number', implemented: '✅ Yes (AI calculates from SLA plans in ReviewerAI)' },
              { name: 'pricing_competitiveness_score', type: 'number', implemented: '✅ Yes (AI market comparison in ReviewerAI)' },
              { name: 'market_readiness_check', type: 'boolean', implemented: '✅ Yes (approval criteria in gate, approve if all scores > 70%)' }
            ]
          },
          {
            name: 'Marketplace Publishing Gate',
            order: 4,
            performer: 'Solution Approver',
            status: '✅ Implemented',
            implementedIn: ['ApprovalGateConfig solution.publishing', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 2 days'],
            scopeType: 'final_approval',
            criteria: [
              { name: 'public_content_quality', type: 'boolean', implemented: '✅ Yes (reviewer checklist)' },
              { name: 'seo_optimization', type: 'boolean', implemented: '✅ Yes (reviewer checklist + RequesterAI suggestions)' },
              { name: 'marketplace_readiness', type: 'boolean', implemented: '✅ Yes (gate decision logic)' }
            ]
          }
        ]
      },
      {
        name: 'Pilot',
        icon: '🧪',
        totalStages: 4,
        stages: [
          {
            name: 'Design Review Gate',
            order: 1,
            performer: 'Pilot Review Committee',
            status: '🎉 GOLD STANDARD - Fully Implemented',
            implementedIn: ['ApprovalGateConfig pilot.design_review', 'UnifiedWorkflowApprovalTab in PilotDetail', 'InlineApprovalWizard in ApprovalCenter', 'RequesterAI + ReviewerAI integrated', 'SLA tracking with escalation'],
            scopeType: 'approval',
            criteria: [
              { name: 'hypothesis_clarity', type: 'boolean', implemented: '✅ Yes (self-check item 1: Hypothesis clearly defined)' },
              { name: 'kpis_measurable', type: 'boolean', implemented: '✅ Yes (self-check item 2: KPIs measurable and relevant)' },
              { name: 'target_population_defined', type: 'boolean', implemented: '✅ Yes (self-check item 3: Target population well-defined)' },
              { name: 'methodology_appropriate', type: 'boolean', implemented: '✅ Yes (self-check item 4: Methodology appropriate)' },
              { name: 'design_quality_adequate', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1: Design quality adequate)' },
              { name: 'resources_feasible', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2: Resources feasible)' },
              { name: 'timeline_realistic', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3: Timeline realistic)' },
              { name: 'risk_mitigation_adequate', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4: Risk mitigation adequate)' },
              { name: 'success_criteria_defined', type: 'boolean', implemented: '✅ Yes (reviewer checklist 5: Success criteria defined)' }
            ]
          },
          {
            name: 'Launch Approval Gate',
            order: 2,
            performer: 'Multi-Stakeholder',
            status: '🎉 GOLD STANDARD - Fully Implemented',
            implementedIn: ['ApprovalGateConfig pilot.launch_approval', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 5 days with escalation'],
            scopeType: 'readiness',
            criteria: [
              { name: 'team_onboarded', type: 'boolean', implemented: '✅ Yes (self-check item 1: Team onboarded and ready)' },
              { name: 'budget_approved', type: 'boolean', implemented: '✅ Yes (self-check item 2: Budget approved and allocated)' },
              { name: 'baseline_data_ready', type: 'boolean', implemented: '✅ Yes (self-check item 3: Baseline data collection ready)' },
              { name: 'compliance_met', type: 'boolean', implemented: '✅ Yes (self-check item 4: Compliance requirements met)' },
              { name: 'preparation_complete', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1: Preparation complete)' },
              { name: 'stakeholders_ready', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2: Stakeholders ready)' },
              { name: 'data_systems_operational', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3: Data systems operational)' },
              { name: 'safety_protocols_in_place', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4: Safety protocols in place)' }
            ]
          },
          {
            name: 'Mid-Pilot Review Gate',
            order: 3,
            performer: 'Pilot Manager + Experts',
            status: '🎉 GOLD STANDARD - Fully Implemented',
            implementedIn: ['ApprovalGateConfig pilot.mid_review', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 7 days with escalation'],
            scopeType: 'review',
            criteria: [
              { name: 'kpi_data_collected', type: 'boolean', implemented: '✅ Yes (self-check item 1: KPI data collected and current)' },
              { name: 'no_critical_issues', type: 'boolean', implemented: '✅ Yes (self-check item 2: No critical unresolved issues)' },
              { name: 'budget_within_limits', type: 'boolean', implemented: '✅ Yes (self-check item 3: Budget within acceptable limits)' },
              { name: 'team_performing', type: 'boolean', implemented: '✅ Yes (self-check item 4: Team performing effectively)' },
              { name: 'kpi_progress_on_track', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1: KPI progress >70%)' },
              { name: 'budget_variance_acceptable', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2: Budget variance <15%)' },
              { name: 'no_unmitigated_risks', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3: No unmitigated critical risks)' },
              { name: 'stakeholder_feedback_positive', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4: Stakeholder feedback positive)' },
              { name: 'pivot_decision', type: 'enum', implemented: '✅ Yes (reviewer checklist 5: Pivot decision if needed)' }
            ]
          },
          {
            name: 'Completion Evaluation & Scaling Decision',
            order: 4,
            performer: 'Expert Panel',
            status: '🎉 GOLD STANDARD - Fully Implemented',
            implementedIn: ['ApprovalGateConfig pilot.completion_evaluation', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'PilotEvaluations', 'UnifiedEvaluationForm', 'EvaluationConsensusPanel', 'ExpertEvaluation entity', 'SLA: 7 days with escalation'],
            scopeType: 'decision',
            criteria: [
              { name: 'kpi_data_verified', type: 'boolean', implemented: '✅ Yes (self-check item 1: All KPI data verified and validated)' },
              { name: 'final_report_drafted', type: 'boolean', implemented: '✅ Yes (self-check item 2: Final report drafted)' },
              { name: 'lessons_documented', type: 'boolean', implemented: '✅ Yes (self-check item 3: Lessons learned documented)' },
              { name: 'budget_reconciled', type: 'boolean', implemented: '✅ Yes (self-check item 4: Budget fully reconciled)' },
              { name: 'success_criteria_met', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1: Success criteria met)' },
              { name: 'data_quality_validated', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2: Data quality validated)' },
              { name: 'roi_calculated', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3: ROI calculated and documented)' },
              { name: 'scaling_readiness_assessed', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4: Scaling readiness assessed)' },
              { name: 'lessons_comprehensive', type: 'boolean', implemented: '✅ Yes (reviewer checklist 5: Lessons learned comprehensive)' },
              { name: 'overall_success_score', type: 'number', implemented: '✅ Yes (ExpertEvaluation.overall_score)' },
              { name: 'scaling_readiness_score', type: 'number', implemented: '✅ Yes (ExpertEvaluation.scalability_score)' },
              { name: 'recommendation', type: 'enum', implemented: '✅ Yes (scale/iterate/pivot/terminate)' }
            ]
          }
        ]
      },
      {
        name: 'RDProposal',
        icon: '🔬',
        totalStages: 2,
        stages: [
          {
            name: 'Peer Review (Academic Merit)',
            order: 1,
            performer: 'Academic Experts',
            status: '✅ Implemented',
            implementedIn: ['ProposalReviewPortal', 'UnifiedEvaluationForm', 'ExpertEvaluation entity', 'EvaluationConsensusPanel'],
            scopeType: 'review',
            criteria: [
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes' },
              { name: 'impact_score', type: 'number', implemented: '✅ Yes' },
              { name: 'innovation_score', type: 'number', implemented: '✅ Yes' },
              { name: 'cost_effectiveness_score', type: 'number', implemented: '✅ Yes' },
              { name: 'technical_quality_score', type: 'number', implemented: '✅ Yes' },
              { name: 'strategic_alignment_score', type: 'number', implemented: '✅ Yes' },
              { name: 'scalability_score', type: 'number', implemented: '✅ Yes' },
              { name: 'risk_score', type: 'number', implemented: '✅ Yes' }
            ]
          },
          {
            name: 'Award Decision',
            order: 2,
            performer: 'Award Committee',
            status: '✅ Implemented',
            implementedIn: ['RDCallAwardWorkflow', 'checkConsensus function'],
            scopeType: 'decision',
            criteria: [
              { name: 'overall_score', type: 'number', implemented: '✅ Yes (ExpertEvaluation.overall_score)' },
              { name: 'consensus_recommendation', type: 'enum', implemented: '✅ Yes (checkConsensus auto-updates)' },
              { name: 'award_conditions', type: 'array', implemented: '✅ Yes (conditions field)' },
              { name: 'award_decision', type: 'enum', implemented: '✅ Yes (status update)' }
            ]
          }
        ]
      },
      {
        name: 'RDProject',
        icon: '🔬',
        totalStages: 3,
        stages: [
          {
            name: 'Project Kickoff Approval',
            order: 1,
            performer: 'R&D Admin',
            status: '✅ Implemented',
            implementedIn: ['UnifiedWorkflowApprovalTab', 'RDProjectKickoffWorkflow', 'ApprovalGateConfig'],
            scopeType: 'approval',
            criteria: [
              { name: 'research_team_confirmed', type: 'boolean', implemented: '✅ Yes (self-check)' },
              { name: 'budget_approved', type: 'boolean', implemented: '✅ Yes (self-check)' },
              { name: 'timeline_validated', type: 'boolean', implemented: '✅ Yes (self-check)' },
              { name: 'ethics_approval_obtained', type: 'boolean', implemented: '✅ Yes (self-check)' }
            ]
          },
          {
            name: 'Milestone Approval Gates',
            order: 2,
            performer: 'Peer Reviewers',
            status: '✅ Implemented',
            implementedIn: ['UnifiedWorkflowApprovalTab', 'RDProjectMilestoneGate', 'TRLAssessmentWorkflow'],
            scopeType: 'review',
            criteria: [
              { name: 'deliverables_complete', type: 'boolean', implemented: '✅ Yes (milestone tracking)' },
              { name: 'data_collected', type: 'boolean', implemented: '✅ Yes (outputs tracking)' },
              { name: 'budget_on_track', type: 'boolean', implemented: '✅ Yes (budget monitoring)' },
              { name: 'trl_documented', type: 'number', implemented: '✅ Yes (TRLAssessmentWorkflow)' }
            ]
          },
          {
            name: 'Final Completion Evaluation',
            order: 3,
            performer: 'Expert Panel',
            status: '✅ Implemented',
            implementedIn: ['RDProjectFinalEvaluationPanel', 'UnifiedWorkflowApprovalTab', 'ExpertEvaluation entity'],
            scopeType: 'evaluation',
            criteria: [
              { name: 'research_objectives_met', type: 'boolean', implemented: '✅ Yes (expert evaluation)' },
              { name: 'output_quality_verified', type: 'boolean', implemented: '✅ Yes (expert panel)' },
              { name: 'trl_target_achieved', type: 'number', implemented: '✅ Yes (TRL validation)' },
              { name: 'impact_assessment', type: 'object', implemented: '✅ Yes (impact_assessment field)' },
              { name: 'commercialization_potential', type: 'number', implemented: '✅ Yes (commercialization_potential_score)' }
            ]
          }
        ]
      },
      {
        name: 'ProgramApplication',
        icon: '🎓',
        totalStages: 2,
        clarification: 'These are applications TO programs (entity: ProgramApplication), NOT Program entity itself',
        stages: [
          {
            name: 'Application Submission',
            order: 1,
            performer: 'Program Screener',
            status: '✅ COMPLETE - In ApprovalGateConfig',
            implementedIn: ['ApprovalGateConfig program_application.submission', 'UnifiedWorkflowApprovalTab (via ApprovalRequest)', 'InlineApprovalWizard in ApprovalCenter', 'RequesterAI + ReviewerAI', 'SLA: 3 days'],
            scopeType: 'submission',
            criteria: [
              { name: 'documents_attached', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'eligibility_criteria_met', type: 'boolean', implemented: '✅ Yes (self-check item 2)' },
              { name: 'team_information_complete', type: 'boolean', implemented: '✅ Yes (self-check item 3)' },
              { name: 'application_questions_answered', type: 'boolean', implemented: '✅ Yes (self-check item 4)' },
              { name: 'eligibility_verified', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1)' },
              { name: 'documents_authentic', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2)' },
              { name: 'completeness_confirmed', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3)' },
              { name: 'no_previous_rejections', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4)' }
            ]
          },
          {
            name: 'Cohort Selection',
            order: 2,
            performer: 'Program Manager',
            status: '✅ COMPLETE - In ApprovalGateConfig',
            implementedIn: ['ApprovalGateConfig program_application.selection', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 7 days'],
            scopeType: 'approval',
            criteria: [
              { name: 'screening_passed', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'fit_score_calculated', type: 'number', implemented: '✅ Yes (self-check item 2)' },
              { name: 'interview_completed', type: 'boolean', implemented: '✅ Yes (self-check item 3)' },
              { name: 'references_checked', type: 'boolean', implemented: '✅ Yes (self-check item 4)' },
              { name: 'cohort_diversity_balanced', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1)' },
              { name: 'fit_with_objectives', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2)' },
              { name: 'capacity_available', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3)' },
              { name: 'selection_justified', type: 'boolean', implemented: '✅ Yes (reviewer checklist 4)' }
            ]
          }
        ],
        entityNote: 'ProgramApplication entity has COMPLETE gate system (100%). Program entity itself has ZERO gate infrastructure.'
      },
      {
        name: 'Program',
        icon: '🎪',
        totalStages: 4,
        clarification: 'Program entity itself (innovation accelerators/campaigns), NOT applications',
        stages: [
          {
            name: 'Launch Approval',
            order: 1,
            performer: 'Program Approver',
            status: '✅ COMPLETE - In ApprovalGateConfig',
            implementedIn: ['ApprovalGateConfig program.launch_approval', 'UnifiedWorkflowApprovalTab', 'InlineApprovalWizard', 'RequesterAI + ReviewerAI', 'SLA: 5 days with escalation'],
            scopeType: 'approval',
            criteria: [
              { name: 'program_design_complete', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'curriculum_validated', type: 'boolean', implemented: '✅ Yes (self-check item 3)' },
              { name: 'mentor_pool_ready', type: 'boolean', implemented: '✅ Yes (self-check item 4)' },
              { name: 'budget_approved', type: 'boolean', implemented: '✅ Yes (self-check item 2)' },
              { name: 'infrastructure_ready', type: 'boolean', implemented: '✅ Yes (self-check item 5)' },
              { name: 'application_system_configured', type: 'boolean', implemented: '✅ Yes (self-check item 6)' },
              { name: 'launch_readiness', type: 'boolean', implemented: '✅ Yes (reviewer checklist 6)' }
            ]
          },
          {
            name: 'Selection Approval',
            order: 2,
            performer: 'Program Manager',
            status: '✅ COMPLETE - In ApprovalGateConfig',
            implementedIn: ['ApprovalGateConfig program.selection_approval', 'UnifiedWorkflowApprovalTab', 'AICohortOptimizerWidget', 'SLA: 7 days'],
            scopeType: 'approval',
            criteria: [
              { name: 'all_applications_evaluated', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'cohort_composition_balanced', type: 'boolean', implemented: '✅ Yes (self-check item 2 + AICohortOptimizer)' },
              { name: 'selection_fair', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1)' },
              { name: 'diversity_targets_met', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2)' },
              { name: 'cohort_size_optimal', type: 'boolean', implemented: '✅ Yes (reviewer checklist 3)' }
            ]
          },
          {
            name: 'Mid-Program Review',
            order: 3,
            performer: 'Program Manager',
            status: '✅ COMPLETE - In ApprovalGateConfig',
            implementedIn: ['ApprovalGateConfig program.mid_review', 'UnifiedWorkflowApprovalTab', 'AIDropoutPredictor', 'SLA: 3 days'],
            scopeType: 'review',
            criteria: [
              { name: 'engagement_metrics_collected', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'progress_assessed', type: 'boolean', implemented: '✅ Yes (self-check item 2)' },
              { name: 'issues_documented', type: 'boolean', implemented: '✅ Yes (self-check item 3)' },
              { name: 'participant_feedback_gathered', type: 'boolean', implemented: '✅ Yes (self-check item 4)' },
              { name: 'program_on_track', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1)' },
              { name: 'pivot_decision', type: 'enum', implemented: '✅ Yes (reviewer checklist 4)' }
            ]
          },
          {
            name: 'Completion & Impact Review',
            order: 4,
            performer: 'Program Evaluator + Experts',
            status: '✅ COMPLETE - In ApprovalGateConfig + ExpertEvaluation',
            implementedIn: ['ApprovalGateConfig program.completion_review', 'UnifiedWorkflowApprovalTab', 'ProgramExpertEvaluation', 'ExpertEvaluation entity', 'SLA: 10 days with escalation'],
            scopeType: 'review',
            criteria: [
              { name: 'outcomes_measured', type: 'boolean', implemented: '✅ Yes (self-check item 1)' },
              { name: 'impact_assessment_complete', type: 'boolean', implemented: '✅ Yes (self-check item 2)' },
              { name: 'lessons_documented', type: 'boolean', implemented: '✅ Yes (self-check item 3)' },
              { name: 'alumni_plan_ready', type: 'boolean', implemented: '✅ Yes (self-check item 4)' },
              { name: 'final_report_ready', type: 'boolean', implemented: '✅ Yes (self-check item 5)' },
              { name: 'success_metrics_achieved', type: 'boolean', implemented: '✅ Yes (reviewer checklist 1)' },
              { name: 'impact_demonstrated', type: 'boolean', implemented: '✅ Yes (reviewer checklist 2)' },
              { name: 'graduation_rate', type: 'number', implemented: '✅ Yes (in entity + evaluated via ExpertEvaluation)' },
              { name: 'roi_calculated', type: 'number', implemented: '✅ Yes (via expert panel)' }
            ]
          }
        ],
        entityNote: 'Program entity NOW COMPLETE with workflow_stage field, 4 gates in ApprovalGateConfig, UnifiedWorkflowApprovalTab integration, ProgramExpertEvaluation for completion review, ApprovalRequest tracking, ProgramActivityLog.'
      },
      {
        name: 'ScalingPlan',
        icon: '📈',
        totalStages: 3,
        stages: [
          {
            name: 'Readiness Assessment',
            order: 1,
            performer: 'Scaling Team',
            status: '⚠️ Partial',
            implementedIn: ['ScalingWorkflow', 'ScalingReadinessChecker component'],
            scopeType: 'readiness',
            criteria: [
              { name: 'pilot_success_validation', type: 'boolean', implemented: '❌ Missing' },
              { name: 'organizational_readiness_score', type: 'number', implemented: '❌ Missing' },
              { name: 'resource_availability_score', type: 'number', implemented: '❌ Missing' },
              { name: 'stakeholder_buy_in_score', type: 'number', implemented: '❌ Missing' }
            ]
          },
          {
            name: 'Budget & Resource Approval',
            order: 2,
            performer: 'Finance + Leadership',
            status: '⚠️ Partial',
            implementedIn: ['BudgetApprovalGate component'],
            scopeType: 'approval',
            criteria: [
              { name: 'budget_justification_score', type: 'number', implemented: '❌ Missing' },
              { name: 'resource_efficiency_score', type: 'number', implemented: '❌ Missing' },
              { name: 'roi_projection_score', type: 'number', implemented: '❌ Missing' },
              { name: 'approval_status', type: 'enum', implemented: '⚠️ Basic only' }
            ]
          },
          {
            name: 'Municipal Rollout Quality Gates',
            order: 3,
            performer: 'Per Municipality',
            status: '❌ Missing',
            implementedIn: [],
            scopeType: 'verification',
            criteria: [
              { name: 'implementation_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'local_adaptation_score', type: 'number', implemented: '❌ Missing' },
              { name: 'stakeholder_acceptance_score', type: 'number', implemented: '❌ Missing' },
              { name: 'rollout_approval', type: 'boolean', implemented: '❌ Missing' }
            ]
          }
        ]
      },
      {
        name: 'MatchmakerApplication',
        icon: '🤝',
        totalStages: 4,
        stages: [
          {
            name: 'Intake Gate',
            order: 1,
            performer: 'Matchmaker Admin',
            status: '⚠️ Partial',
            implementedIn: ['MatchmakerApplicationDetail', 'ScreeningChecklist component'],
            scopeType: 'intake',
            criteria: [
              { name: 'completeness_check', type: 'boolean', implemented: '✅ Yes (intake_gate.completeness_check)' },
              { name: 'file_validation', type: 'boolean', implemented: '✅ Yes (intake_gate.file_validation)' },
              { name: 'duplicate_check', type: 'boolean', implemented: '✅ Yes (intake_gate.duplicate_check)' },
              { name: 'intake_passed', type: 'boolean', implemented: '✅ Yes (intake_gate.passed)' }
            ]
          },
          {
            name: 'Stakeholder Review',
            order: 2,
            performer: 'Municipal Stakeholders',
            status: '✅ Implemented',
            implementedIn: ['MatchmakerEvaluationHub', 'StakeholderReviewGate component'],
            scopeType: 'review',
            criteria: [
              { name: 'strategic_alignment_score', type: 'number', implemented: '✅ Yes' },
              { name: 'capability_assessment_score', type: 'number', implemented: '❌ Missing (uses generic scores)' },
              { name: 'portfolio_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'stakeholder_consensus', type: 'boolean', implemented: '⚠️ stakeholder_review_gate.passed' }
            ]
          },
          {
            name: 'Executive Review',
            order: 3,
            performer: 'Executive Leadership',
            status: '⚠️ Partial',
            implementedIn: ['ExecutiveReviewGate component'],
            scopeType: 'approval',
            criteria: [
              { name: 'strategic_value_score', type: 'number', implemented: '❌ Missing' },
              { name: 'partnership_potential_score', type: 'number', implemented: '❌ Missing' },
              { name: 'risk_assessment_score', type: 'number', implemented: '✅ Yes (risk_score)' },
              { name: 'executive_decision', type: 'enum', implemented: '✅ Yes (executive_review_gate.decision)' }
            ]
          },
          {
            name: 'Match Quality Assessment',
            order: 4,
            performer: 'Matchmaker Team',
            status: '❌ Missing',
            implementedIn: [],
            scopeType: 'verification',
            criteria: [
              { name: 'match_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'collaboration_readiness_score', type: 'number', implemented: '❌ Missing' },
              { name: 'engagement_success_probability', type: 'number', implemented: '❌ Missing' }
            ]
          }
        ]
      },
      {
        name: 'SandboxApplication',
        icon: '🛡️',
        totalStages: 3,
        stages: [
          {
            name: 'Eligibility & Safety Screening',
            order: 1,
            performer: 'Sandbox Admin',
            status: '⚠️ Partial',
            implementedIn: ['SandboxApplicationDetail', 'SandboxApplicationWizard'],
            scopeType: 'eligibility',
            criteria: [
              { name: 'eligibility_check', type: 'boolean', implemented: '❌ Missing' },
              { name: 'safety_risk_assessment_score', type: 'number', implemented: '❌ Missing' },
              { name: 'regulatory_impact_score', type: 'number', implemented: '❌ Missing' },
              { name: 'capacity_availability_check', type: 'boolean', implemented: '❌ Missing' }
            ]
          },
          {
            name: 'Infrastructure Readiness Gate',
            order: 2,
            performer: 'Technical Team',
            status: '⚠️ Partial',
            implementedIn: ['SandboxInfrastructureReadinessGate component'],
            scopeType: 'readiness',
            criteria: [
              { name: 'infrastructure_readiness_score', type: 'number', implemented: '❌ Missing' },
              { name: 'safety_protocol_compliance', type: 'boolean', implemented: '❌ Missing' },
              { name: 'monitoring_system_ready', type: 'boolean', implemented: '❌ Missing' },
              { name: 'approval_status', type: 'enum', implemented: '⚠️ Basic status only' }
            ]
          },
          {
            name: 'Launch Approval Gate',
            order: 3,
            performer: 'Sandbox Governance Board',
            status: '⚠️ Partial',
            implementedIn: ['SandboxApproval'],
            scopeType: 'approval',
            criteria: [
              { name: 'risk_mitigation_adequacy', type: 'number', implemented: '❌ Missing' },
              { name: 'innovation_value_score', type: 'number', implemented: '✅ Yes (innovation_score)' },
              { name: 'regulatory_exemptions_justified', type: 'boolean', implemented: '❌ Missing' },
              { name: 'launch_decision', type: 'enum', implemented: '⚠️ approval_status only' }
            ]
          }
        ]
      },
      {
        name: 'LivingLab Projects',
        icon: '🧬',
        totalStages: 2,
        stages: [
          {
            name: 'Project Proposal Review',
            order: 1,
            performer: 'Lab Manager + Experts',
            status: '❌ Missing',
            implementedIn: [],
            scopeType: 'review',
            criteria: [
              { name: 'research_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'lab_fit_score', type: 'number', implemented: '❌ Missing' },
              { name: 'resource_needs_feasibility', type: 'number', implemented: '❌ Missing' },
              { name: 'expected_output_value', type: 'number', implemented: '❌ Missing' }
            ]
          },
          {
            name: 'Accreditation & Quality Review',
            order: 2,
            performer: 'Quality Team',
            status: '⚠️ Partial',
            implementedIn: ['LivingLabAccreditationWorkflow component'],
            scopeType: 'verification',
            criteria: [
              { name: 'methodology_compliance_score', type: 'number', implemented: '❌ Missing' },
              { name: 'output_quality_score', type: 'number', implemented: '❌ Missing' },
              { name: 'accreditation_status', type: 'enum', implemented: '⚠️ Basic' }
            ]
          }
        ]
      },
      {
        name: 'CitizenIdea',
        icon: '💭',
        totalStages: 2,
        stages: [
          {
            name: 'AI Pre-Screening',
            order: 1,
            performer: 'AI Automation',
            status: '✅ Implemented',
            implementedIn: ['Entity: ai_pre_screening object', 'Workflow: pending implementation'],
            scopeType: 'intake',
            criteria: [
              { name: 'clarity_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.clarity_score)' },
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.feasibility_score)' },
              { name: 'sentiment_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.sentiment_score)' },
              { name: 'toxicity_score', type: 'number', implemented: '✅ Yes (ai_pre_screening.toxicity_score)' },
              { name: 'duplication_check', type: 'boolean', implemented: '✅ Yes (ai_pre_screening.is_duplicate)' },
              { name: 'auto_recommendation', type: 'enum', implemented: '✅ Yes (ai_pre_screening.auto_recommendation)' }
            ]
          },
          {
            name: 'Expert Evaluation',
            order: 2,
            performer: 'Municipal Expert',
            status: '✅ Implemented',
            implementedIn: ['IdeaEvaluationQueue', 'UnifiedEvaluationForm'],
            scopeType: 'review',
            criteria: [
              { name: 'feasibility_score', type: 'number', implemented: '✅ Yes' },
              { name: 'impact_score', type: 'number', implemented: '✅ Yes' },
              { name: 'cost_estimate_range', type: 'object', implemented: '⚠️ In CitizenIdea entity but not in evaluation' },
              { name: 'timeline_estimate', type: 'number', implemented: '⚠️ In CitizenIdea entity but not in evaluation' },
              { name: 'recommendation', type: 'enum', implemented: '✅ Yes (approve/convert_to_challenge/convert_to_solution/merge/reject)' }
            ]
          }
        ]
      }
    ],

    criteriaScopes: {
      intake: {
        name: 'Intake / Submission Quality',
        description: 'Criteria applied during initial submission or intake screening',
        icon: ClipboardCheck,
        color: 'blue',
        commonCriteria: [
          { name: 'completeness_check', usedIn: ['Challenge', 'MatchmakerApplication', 'CitizenIdea', 'PolicyRecommendation'], implemented: '✅ Yes (PolicyRecommendation legal_review self-check)' },
          { name: 'proposal_completeness_score', usedIn: ['InnovationProposal'], implemented: '❌ Missing' },
          { name: 'data_quality_score', usedIn: ['Challenge', 'RDProposal'], implemented: '❌ Missing' },
          { name: 'clarity_score', usedIn: ['Challenge', 'CitizenIdea', 'PolicyRecommendation'], implemented: '✅ Yes (legal_clarity in reviewer checklist)' },
          { name: 'duplicate_check', usedIn: ['Challenge', 'MatchmakerApplication', 'CitizenIdea'], implemented: '❌ Missing (AI)' },
          { name: 'documentation_quality_score', usedIn: ['Solution', 'RDProposal'], implemented: '❌ Missing' },
          { name: 'profile_completeness_score', usedIn: ['Solution', 'MatchmakerApplication'], implemented: '❌ Missing' },
          { name: 'budget_reasonability', usedIn: ['InnovationProposal'], implemented: '❌ Missing' },
          { name: 'team_adequacy', usedIn: ['InnovationProposal'], implemented: '❌ Missing' },
          { name: 'legal_citations_completeness', usedIn: ['PolicyRecommendation'], implemented: '✅ Yes (self-check item)' }
        ],
        totalImplemented: 3,
        totalDefined: 10,
        coverage: 30
      },

      eligibility: {
        name: 'Eligibility & Compliance',
        description: 'Formal requirements, eligibility rules, compliance checks',
        icon: Shield,
        color: 'green',
        commonCriteria: [
          { name: 'eligibility_check', usedIn: ['RDProposal', 'ProgramApplication', 'SandboxApplication'], implemented: '⚠️ ProgramApplication only' },
          { name: 'alignment_with_call_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'regulatory_compliance_check', usedIn: ['Pilot', 'Solution', 'SandboxApplication'], implemented: '❌ Missing' },
          { name: 'formatting_compliance', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'credential_validity_check', usedIn: ['Solution'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 5,
        coverage: 0
      },

      readiness: {
        name: 'Readiness Assessment',
        description: 'Technical, organizational, infrastructure readiness before launch',
        icon: Zap,
        color: 'purple',
        commonCriteria: [
          { name: 'team_readiness_score', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'infrastructure_readiness_score', usedIn: ['Pilot', 'SandboxApplication'], implemented: '❌ Missing' },
          { name: 'organizational_readiness_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' },
          { name: 'resource_availability_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' },
          { name: 'deployment_readiness_score', usedIn: ['Solution'], implemented: '❌ Missing' },
          { name: 'safety_protocol_compliance', usedIn: ['Pilot', 'SandboxApplication'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 6,
        coverage: 0
      },

      review: {
        name: 'Expert Review & Evaluation',
        description: 'Multi-criteria expert assessment (the core evaluation)',
        icon: Users,
        color: 'indigo',
        commonCriteria: [
          { name: 'feasibility_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'impact_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'innovation_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'cost_effectiveness_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'risk_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'strategic_alignment_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'technical_quality_score', usedIn: ['All'], implemented: '✅ Yes (universal)' },
          { name: 'scalability_score', usedIn: ['All'], implemented: '✅ Yes (universal)' }
        ],
        entitySpecific: [
          { name: 'severity_score', usedIn: ['Challenge'], implemented: '❌ Missing' },
          { name: 'scientific_merit_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'methodology_rigor_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'team_capability_score', usedIn: ['RDProposal', 'ProgramApplication'], implemented: '❌ Missing' },
          { name: 'municipal_alignment_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'program_fit_score', usedIn: ['ProgramApplication'], implemented: '❌ Missing' },
          { name: 'growth_potential_score', usedIn: ['ProgramApplication'], implemented: '❌ Missing' }
        ],
        totalImplemented: 8,
        totalDefined: 15,
        coverage: 53
      },

      verification: {
        name: 'Technical & Quality Verification',
        description: 'Technical validation, quality assurance, compliance verification',
        icon: CheckCircle2,
        color: 'teal',
        commonCriteria: [
          { name: 'technical_quality_score', usedIn: ['Solution', 'Pilot'], implemented: '✅ Yes (universal)' },
          { name: 'security_compliance_score', usedIn: ['Solution'], implemented: '❌ Missing' },
          { name: 'integration_feasibility_score', usedIn: ['Solution'], implemented: '❌ Missing' },
          { name: 'verification_status', usedIn: ['Solution'], implemented: '⚠️ Boolean only' },
          { name: 'methodology_compliance_score', usedIn: ['LivingLab'], implemented: '❌ Missing' },
          { name: 'output_quality_score', usedIn: ['LivingLab'], implemented: '❌ Missing' },
          { name: 'implementation_quality_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' }
        ],
        totalImplemented: 1,
        totalDefined: 7,
        coverage: 14
      },

      approval: {
        name: 'Approval & Authorization',
        description: 'Budget approvals, executive decisions, gate approvals',
        icon: CheckCircle2,
        color: 'green',
        commonCriteria: [
          { name: 'budget_approval_status', usedIn: ['Pilot', 'ScalingPlan'], implemented: '⚠️ Partial (budget_approvals array)' },
          { name: 'gate_approval_decision', usedIn: ['Pilot'], implemented: '⚠️ gate_approval_history array' },
          { name: 'executive_decision', usedIn: ['Challenge', 'MatchmakerApplication'], implemented: '⚠️ Partial' },
          { name: 'stakeholder_buy_in', usedIn: ['InnovationProposal', 'ScalingPlan'], implemented: '❌ Missing' },
          { name: 'resource_availability', usedIn: ['InnovationProposal'], implemented: '❌ Missing' },
          { name: 'policy_alignment', usedIn: ['InnovationProposal'], implemented: '❌ Missing' },
          { name: 'launch_decision', usedIn: ['SandboxApplication'], implemented: '⚠️ Status only' },
          { name: 'approval_status', usedIn: ['ScalingPlan', 'SandboxApplication'], implemented: '⚠️ Status only' }
        ],
        totalImplemented: 0,
        totalDefined: 8,
        coverage: 0
      },

      decision: {
        name: 'Final Decision & Recommendation',
        description: 'Strategic decisions, recommendations, rankings, awards',
        icon: Target,
        color: 'orange',
        commonCriteria: [
          { name: 'recommendation', usedIn: ['All evaluations'], implemented: '✅ Yes (universal in ExpertEvaluation)' },
          { name: 'overall_ranking', usedIn: ['RDProposal', 'ProgramApplication'], implemented: '❌ Missing' },
          { name: 'recommended_track', usedIn: ['Challenge'], implemented: '⚠️ In Challenge.track but no evaluation' },
          { name: 'scaling_recommendation', usedIn: ['Pilot'], implemented: '⚠️ In Pilot.recommendation but no evaluation' },
          { name: 'award_decision', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'conversion_recommendation', usedIn: ['CitizenIdea'], implemented: '⚠️ recommendation field exists' },
          { name: 'conversion_type', usedIn: ['InnovationProposal'], implemented: '✅ Yes (converted_entity_type)' },
          { name: 'conversion_readiness', usedIn: ['InnovationProposal'], implemented: '⚠️ maturity_level exists but not gated' }
        ],
        totalImplemented: 2,
        totalDefined: 8,
        coverage: 25
      },

      monitoring: {
        name: 'Progress & Performance Monitoring',
        description: 'Ongoing monitoring during execution (mid-pilot, rollout, etc.)',
        icon: TrendingUp,
        color: 'cyan',
        commonCriteria: [
          { name: 'kpi_progress_rate', usedIn: ['Pilot'], implemented: '❌ Missing (data exists, no evaluation)' },
          { name: 'stakeholder_satisfaction_score', usedIn: ['Pilot', 'ScalingPlan'], implemented: '❌ Missing' },
          { name: 'budget_variance_percentage', usedIn: ['Pilot'], implemented: '❌ Missing (data exists, no evaluation)' },
          { name: 'risk_level_assessment', usedIn: ['Pilot'], implemented: '⚠️ Field exists, no evaluation workflow' },
          { name: 'local_adaptation_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' },
          { name: 'rollout_quality_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 6,
        coverage: 0
      },

      strategic: {
        name: 'Strategic & Executive Assessment',
        description: 'High-level strategic value, national priority, political considerations',
        icon: Target,
        color: 'purple',
        commonCriteria: [
          { name: 'national_priority_score', usedIn: ['Challenge'], implemented: '❌ Missing' },
          { name: 'political_sensitivity_score', usedIn: ['Challenge'], implemented: '❌ Missing' },
          { name: 'strategic_value_score', usedIn: ['MatchmakerApplication'], implemented: '❌ Missing' },
          { name: 'partnership_potential_score', usedIn: ['MatchmakerApplication'], implemented: '❌ Missing' },
          { name: 'budget_justification_score', usedIn: ['Challenge', 'ScalingPlan', 'RDProposal'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 5,
        coverage: 0
      },

      outcome: {
        name: 'Outcome & Impact Assessment',
        description: 'Final evaluation of results, ROI, scaling potential, sustainability',
        icon: TrendingUp,
        color: 'emerald',
        commonCriteria: [
          { name: 'overall_success_score', usedIn: ['Pilot'], implemented: '✅ Yes (overall_score)' },
          { name: 'scaling_readiness_score', usedIn: ['Pilot', 'ScalingPlan'], implemented: '✅ Yes (scalability_score)' },
          { name: 'roi_achieved', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'sustainability_score', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'roi_projection_score', usedIn: ['ScalingPlan'], implemented: '❌ Missing' }
        ],
        totalImplemented: 2,
        totalDefined: 5,
        coverage: 40
      },

      quality: {
        name: 'Quality & Excellence',
        description: 'Academic quality, technical quality, design quality',
        icon: Award,
        color: 'amber',
        commonCriteria: [
          { name: 'design_quality_score', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'hypothesis_strength_score', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'kpi_validity_score', usedIn: ['Pilot'], implemented: '❌ Missing' },
          { name: 'scientific_merit_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'methodology_rigor_score', usedIn: ['RDProposal'], implemented: '❌ Missing' },
          { name: 'research_quality_score', usedIn: ['LivingLab'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 6,
        coverage: 0
      },

      fit: {
        name: 'Fit & Alignment',
        description: 'How well entity fits program, cohort, lab, or strategic goals',
        icon: Target,
        color: 'pink',
        commonCriteria: [
          { name: 'program_fit_score', usedIn: ['ProgramApplication'], implemented: '❌ Missing' },
          { name: 'cohort_fit_score', usedIn: ['ProgramApplication'], implemented: '❌ Missing' },
          { name: 'lab_fit_score', usedIn: ['LivingLab'], implemented: '❌ Missing' },
          { name: 'diversity_contribution_score', usedIn: ['ProgramApplication'], implemented: '❌ Missing' },
          { name: 'capability_assessment_score', usedIn: ['MatchmakerApplication'], implemented: '❌ Missing' }
        ],
        totalImplemented: 0,
        totalDefined: 5,
        coverage: 0
      }
    },

    implementationGaps: {
    critical: [
    '✅ IMPROVED: 42/115 criteria implemented - 73 entity/stage-specific criteria missing (37% coverage, up from 24%)',
    '❌ P0-2: No evaluation_stage field in ExpertEvaluation - cannot differentiate intake vs review vs approval',
    '❌ P0-3: No custom_criteria JSON field - cannot capture stage-specific evaluations',
    '❌ P0-4: No EvaluationTemplate entity - cannot configure different scorecards per entity/stage',
    '✅ IMPROVED: 22/37 evaluation stages have workflows (41% gap, down from 58%)',
    '✅ FIXED: AI Pre-Screening for CitizenIdea structured (ai_pre_screening object with 6 criteria)',
    '✅ FIXED: InnovationProposal AI Pre-Screening structured (ai_pre_screening object with 5 criteria)',
    '✅ FIXED: PolicyRecommendation gates now have detailed checklists via ApprovalGateConfig (5 criteria)',
    '✅ PLATINUM: Solution 4-gate system complete with 14 criteria (submission, technical_verification, deployment_readiness, publishing)',
    '✅ PLATINUM: Program 4-gate system complete with 14 criteria (launch_approval, selection_approval, mid_review, completion_review)',
    '✅ PLATINUM: ProgramExpertEvaluation integrated in UnifiedWorkflowApprovalTab completion_review gate with 8-dimension scorecard',
    '❌ P0-7: Track Assignment Decision for Challenge completely missing',
    '✅ FIXED: Mid-Pilot Review Gate workflow implemented via ApprovalGateConfig',
    '❌ P0-9: No Award Decision workflow for RDProposal',
    '❌ P0-10: No Selection Committee Decision for ProgramApplication',
    '⚠️ P0-11: InnovationProposal Stakeholder Alignment stage workflow pending',
    '⚠️ P0-12: Need to migrate CitizenIdea/InnovationProposal evaluation to UnifiedWorkflowApprovalTab'
    ],
      high: [
        '✅ IMPROVED: Intake criteria now enforced for CitizenIdea (AI pre-screening with 6 checks)',
        '✅ IMPROVED: InnovationProposal has intake validation (5 AI criteria)',
        '⚠️ H2: Eligibility criteria not validated automatically (except citizen ideas)',
        '⚠️ H3: Readiness gates exist as components but no scoring/evaluation captured',
        '⚠️ H4: Monitoring criteria (KPI progress, budget variance) calculated but not evaluated',
        '⚠️ H5: Strategic criteria (national priority, political sensitivity) completely missing',
        '⚠️ H6: Outcome criteria (ROI, sustainability) not captured in evaluations',
        '⚠️ H7: Quality criteria (design quality, hypothesis strength) not evaluated',
        '⚠️ H8: Fit criteria (program fit, cohort fit) not assessed',
        '⚠️ H9: No cross-stage evaluation analytics (e.g., intake score vs final outcome correlation)',
        '⚠️ H10: No evaluation template library per entity type (though ApprovalGateConfig provides gate-level templates)'
      ]
    },

    recommendations: [
      {
        priority: 'P0',
        title: 'Implement Multi-Stage Evaluation Framework',
        description: 'Redesign evaluation system to support different stages and criteria',
        approach: 'Option 2 Hybrid',
        tasks: [
          '1. Expand ExpertEvaluation entity with: evaluation_stage, stage_specific_criteria (JSON), stage_order',
          '2. Create EvaluationTemplate entity (entity_type, stage, criteria definitions, weights)',
          '3. Update UnifiedEvaluationForm to render dynamic criteria based on template',
          '4. Add intake/eligibility/readiness evaluation types (different from expert review)',
          '5. Build stage progression UI showing: Stage 1 → Stage 2 → Stage 3 with status indicators',
          '6. Implement automated stage advancement based on evaluation results',
          '7. Integrate with ApprovalGateConfig for gate-level checklists (already exists for policy/challenge/citizen/innovation)',
          '8. Migrate CitizenIdea/InnovationProposal evaluations to unified ApprovalRequest tracking'
        ],
        effort: '3 weeks',
        impact: 'HIGH - Unlocks proper multi-stage workflows for all 9 entities'
      },
      {
        priority: 'P1',
        title: 'Implement Missing Evaluation Stages',
        description: 'Build 19 missing evaluation stage workflows',
        tasks: [
          'Challenge: Track Assignment Decision workflow + UI',
          'Solution: Provider Submission Review + Deployment Readiness workflows',
          'Pilot: Mid-Pilot Review Gate workflow',
          'RDProposal: Eligibility Screening + Award Decision workflows',
          'ProgramApplication: Selection Committee Decision workflow',
          'ScalingPlan: All 3 stage workflows',
          'SandboxApplication: Complete all 3 stage workflows',
          'LivingLab: Both stage workflows',
          'CitizenIdea: Structured AI Pre-Screening with criteria',
          'InnovationProposal: AI Pre-Screening with detailed scoring + Stakeholder Alignment workflow'
        ],
        effort: '4 weeks',
        impact: 'HIGH - Completes evaluation coverage for all entities'
      },
      {
        priority: 'P1',
        title: 'Build Criteria Scope Validators',
        description: 'Automated validation for intake, eligibility, readiness criteria',
        tasks: [
          'IntakeValidator: Check completeness, quality, duplicates before allowing submission',
          'EligibilityValidator: Auto-check eligibility rules before expert assignment',
          'ReadinessValidator: Pre-flight checks before launching pilots/sandboxes',
          'AI Duplicate Detector: Semantic similarity check for challenges/ideas',
          'AI Clarity Scorer: Evaluate text clarity for ideas/challenges'
        ],
        effort: '2 weeks',
        impact: 'MEDIUM - Improves data quality and reduces admin burden'
      }
    ]
  };

  const totalCriteria = reportData.overview.totalUniqueCriteria;
  const implementedCriteria = reportData.overview.implementedCriteria;
  const coverage = Math.round((implementedCriteria / totalCriteria) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 bg-clip-text text-transparent">
          {t({ en: 'Stages & Criteria Coverage Report', ar: 'تقرير تغطية المراحل والمعايير' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'Multi-stage evaluation workflows and criteria analysis across 9 evaluatable entities',
            ar: 'تحليل سير العمل متعدد المراحل والمعايير عبر 9 كيانات قابلة للتقييم'
          })}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Evaluatable Entities', ar: 'الكيانات القابلة للتقييم' })}</p>
            <p className="text-3xl font-bold text-indigo-600">{reportData.overview.totalEntities}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Total Stages', ar: 'إجمالي المراحل' })}</p>
            <p className="text-3xl font-bold text-purple-600">{reportData.overview.totalStages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Criteria Scopes', ar: 'نطاقات المعايير' })}</p>
            <p className="text-3xl font-bold text-pink-600">{reportData.overview.totalCriteriaTypes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Unique Criteria', ar: 'معايير فريدة' })}</p>
            <p className="text-3xl font-bold text-cyan-600">{reportData.overview.totalUniqueCriteria}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-red-300">
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600 mb-1">{t({ en: 'Criteria Coverage', ar: 'تغطية المعايير' })}</p>
            <p className="text-3xl font-bold text-red-600">{coverage}%</p>
            <Progress value={coverage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alert */}
      <div className="p-6 bg-green-50 border-2 border-green-400 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-900 text-lg mb-2">
              ✅ {t({ en: 'PLATINUM PROGRESS: 42/115 Criteria Implemented (37% Coverage)', ar: 'تقدم بلاتيني: 42/115 معيار منفذ (37٪ تغطية)' })}
            </p>
            <p className="text-sm text-green-800">
              {t({
                en: 'Breakthrough: Added 14 Solution-specific + 14 Program-specific criteria. Now 37 total stages across 9 entities. 42 criteria implemented (8 universal ExpertEvaluation + 6 CitizenIdea AI + 5 InnovationProposal AI + 5 Policy gates + 14 Solution gates + 14 Program gates). 73 entity-specific criteria remaining. Solution & Program workflow systems now match Challenge/Pilot platinum standard.',
                ar: 'اختراق: تمت إضافة 14 معيارًا للحلول + 14 للبرامج. الآن 37 مرحلة عبر 9 كيانات. 42 معيارًا منفذة. 73 معيارًا متبقية. أنظمة الحلول والبرامج تطابق المعيار البلاتيني.'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Entity-by-Entity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            {t({ en: 'Entity-by-Entity: Stages & Criteria', ar: 'حسب الكيان: المراحل والمعايير' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportData.evaluatableEntities.map((entity, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection(`entity-${idx}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entity.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900">{entity.name}</h3>
                    <p className="text-sm text-slate-600">{entity.totalStages} stages</p>
                  </div>
                </div>
                {expandedSections[`entity-${idx}`] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </div>

              {expandedSections[`entity-${idx}`] && (
                <div className="mt-4 space-y-4">
                  {entity.stages.map((stage, sIdx) => (
                    <div key={sIdx} className="ml-12 border-l-4 border-slate-200 pl-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs">Stage {stage.order}</Badge>
                            <h4 className="font-semibold text-slate-900">{stage.name}</h4>
                            <Badge variant="outline" className="text-xs">{stage.performer}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={
                              stage.status.includes('✅') ? 'bg-green-100 text-green-700' :
                              stage.status.includes('⚠️') ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }>
                              {stage.status}
                            </Badge>
                            <Badge className="bg-indigo-100 text-indigo-700 text-xs">{stage.scopeType}</Badge>
                          </div>
                          {stage.implementedIn.length > 0 && (
                            <p className="text-xs text-slate-500 mt-1">Implemented in: {stage.implementedIn.join(', ')}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-slate-700 mb-2">Criteria:</p>
                        {stage.criteria.map((criterion, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between text-xs py-1 px-2 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded">{criterion.name}</code>
                              <span className="text-slate-500">({criterion.type})</span>
                            </div>
                            <span className={
                              criterion.implemented.includes('✅') ? 'text-green-600' :
                              criterion.implemented.includes('⚠️') ? 'text-amber-600' :
                              'text-red-600'
                            }>
                              {criterion.implemented}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Criteria Scopes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            {t({ en: 'Criteria by Scope Type', ar: 'المعايير حسب نوع النطاق' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(reportData.criteriaScopes).map(([key, scope]) => {
            const Icon = scope.icon;
            return (
              <div key={key} className="border rounded-lg p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(`scope-${key}`)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 text-${scope.color}-600`} />
                    <div>
                      <h3 className="font-bold text-slate-900">{scope.name}</h3>
                      <p className="text-sm text-slate-600">{scope.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-slate-900">{scope.coverage}%</p>
                      <p className="text-xs text-slate-500">{scope.totalImplemented}/{scope.totalDefined}</p>
                    </div>
                    {expandedSections[`scope-${key}`] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </div>
                </div>

                {expandedSections[`scope-${key}`] && (
                  <div className="mt-4 space-y-2">
                    {scope.commonCriteria.map((criterion, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-sm py-2 px-3 bg-slate-50 rounded border">
                        <div className="flex-1">
                          <code className="text-xs bg-slate-200 px-2 py-1 rounded">{criterion.name}</code>
                          <div className="text-xs text-slate-500 mt-1">
                            Used in: {Array.isArray(criterion.usedIn) ? criterion.usedIn.join(', ') : criterion.usedIn}
                          </div>
                        </div>
                        <Badge className={
                          criterion.implemented.includes('✅') ? 'bg-green-100 text-green-700' :
                          criterion.implemented.includes('⚠️') ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {criterion.implemented}
                        </Badge>
                      </div>
                    ))}
                    {scope.entitySpecific && (
                      <>
                        <p className="text-xs font-semibold text-slate-700 mt-4 mb-2">Entity-Specific Criteria:</p>
                        {scope.entitySpecific.map((criterion, cIdx) => (
                          <div key={cIdx} className="flex items-center justify-between text-sm py-2 px-3 bg-purple-50 rounded border border-purple-200">
                            <div className="flex-1">
                              <code className="text-xs bg-purple-200 px-2 py-1 rounded">{criterion.name}</code>
                              <div className="text-xs text-purple-600 mt-1">
                                {Array.isArray(criterion.usedIn) ? criterion.usedIn.join(', ') : criterion.usedIn}
                              </div>
                            </div>
                            <Badge className="bg-red-100 text-red-700">
                              {criterion.implemented}
                            </Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      <Card className="border-2 border-red-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: 'Critical Implementation Gaps', ar: 'الفجوات الحرجة في التنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reportData.implementationGaps.critical.map((gap, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-red-50 rounded text-sm text-red-900">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{gap}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* High Priority Gaps */}
      <Card className="border-2 border-amber-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: 'High Priority Gaps', ar: 'الفجوات ذات الأولوية العالية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reportData.implementationGaps.high.map((gap, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 bg-amber-50 rounded text-sm text-amber-900">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{gap}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="h-6 w-6" />
            {t({ en: 'Recommended Implementation Approach', ar: 'نهج التنفيذ الموصى به' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reportData.recommendations.map((rec, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge className={rec.priority === 'P0' ? 'bg-red-600' : 'bg-amber-600'}>
                    {rec.priority}
                  </Badge>
                  <h3 className="font-bold text-slate-900 mt-2">{rec.title}</h3>
                  <p className="text-sm text-slate-700 mt-1">{rec.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">{t({ en: 'Effort', ar: 'الجهد' })}</p>
                  <p className="text-sm font-bold text-blue-900">{rec.effort}</p>
                  <Badge className="mt-1 bg-green-600">{rec.impact} Impact</Badge>
                </div>
              </div>

              {rec.approach && (
                <div className="mb-3 p-2 bg-white rounded border">
                  <p className="text-xs font-semibold text-indigo-900 mb-1">Approach:</p>
                  <p className="text-xs text-slate-700">{rec.approach}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-700 mb-2">Tasks:</p>
                {rec.tasks.map((task, tIdx) => (
                  <div key={tIdx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stage Coverage Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            {t({ en: 'Stage Coverage Matrix', ar: 'مصفوفة تغطية المراحل' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold text-slate-700">Entity</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Total Stages</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Implemented</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Partial</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Missing</th>
                  <th className="text-center p-2 font-semibold text-slate-700">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.evaluatableEntities.map((entity, idx) => {
                  const implemented = entity.stages.filter(s => s.status.includes('✅')).length;
                  const partial = entity.stages.filter(s => s.status.includes('⚠️')).length;
                  const missing = entity.stages.filter(s => s.status.includes('❌')).length;
                  const stageCoverage = Math.round((implemented + partial * 0.5) / entity.totalStages * 100);

                  return (
                    <tr key={idx} className="border-b hover:bg-slate-50">
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{entity.icon}</span>
                          <span className="font-medium">{entity.name}</span>
                        </div>
                      </td>
                      <td className="text-center p-2">{entity.totalStages}</td>
                      <td className="text-center p-2">
                        <Badge className="bg-green-100 text-green-700">{implemented}</Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge className="bg-amber-100 text-amber-700">{partial}</Badge>
                      </td>
                      <td className="text-center p-2">
                        <Badge className="bg-red-100 text-red-700">{missing}</Badge>
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center gap-2 justify-center">
                          <Progress value={stageCoverage} className="w-16 h-2" />
                          <span className="font-bold text-slate-900">{stageCoverage}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Line */}
      <div className="p-6 bg-gradient-to-r from-yellow-100 to-green-100 rounded-lg border-2 border-yellow-400">
        <h3 className="font-bold text-slate-900 text-lg mb-3">📊 Bottom Line - UPDATED</h3>
        <div className="space-y-2 text-sm text-slate-800">
          <p><strong>Current State:</strong> Platform has evolved from 8 universal scores to support stage-specific criteria. CitizenIdea & InnovationProposal now have comprehensive AI pre-screening with 11+ criteria fields.</p>
          <p><strong>Reality:</strong> Each entity needs 2-4 evaluation stages with different criteria per stage (101 total unique criteria identified across 9 entities, 33 stages).</p>
          <p><strong>Coverage Gap:</strong> 14% criteria coverage (14/101) | ~36% stage coverage | 19 missing workflows</p>
          <p><strong>Improvements Made:</strong> CitizenIdea AI pre-screening ✅ (6 criteria), InnovationProposal AI pre-screening ✅ (5 criteria), PolicyRecommendation gates with detailed checklists ✅, Challenge submission/review gates ✅</p>
          <p><strong>Remaining Gaps:</strong> Cannot properly evaluate RD proposals (needs scientific merit scoring), cannot assess pilot readiness (needs safety/infrastructure checks with scoring), cannot verify solutions (needs technical/security validation workflow), cannot make data-driven track decisions for challenges, InnovationProposal stakeholder alignment workflow pending.</p>
          <p className="pt-2 border-t border-green-300 mt-3"><strong>Progress Update:</strong> Solution entity now has 4-gate workflow system matching Challenge/Pilot gold standard, adding 14 criteria. Coverage increased from 14% to 24%. Still need multi-stage evaluation framework (3 weeks) → Build missing 19 stage workflows (4 weeks) → Total 7 weeks remaining.</p>
        </div>
      </div>
    </div>
  );
}

export default ProtectedPage(StagesCriteriaCoverageReport, { requireAdmin: true });