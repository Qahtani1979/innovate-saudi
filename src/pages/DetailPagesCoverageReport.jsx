import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  CheckCircle2, XCircle, Eye, FileText, Shield, TestTube, Microscope,
  Calendar, Lightbulb, Users, Building2, Beaker, Target,
  Sparkles, TrendingUp, Activity, BarChart3, MessageSquare, AlertCircle
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function DetailPagesCoverageReport() {
  const { language, isRTL, t } = useLanguage();
  const [filterBy, setFilterBy] = useState('all');

  const detailPages = [
    {
      name: 'PolicyDetail',
      entity: 'PolicyRecommendation',
      icon: Shield,
      status: '🎉 GOLD STANDARD',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'excellent' },
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Implementation', exists: true, quality: 'excellent' },
        { name: 'Amendments', exists: true, quality: 'excellent' },
        { name: 'AI Analysis', exists: true, quality: 'excellent' },
        { name: 'Activity Log', exists: true, quality: 'excellent' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: true,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'PolicyExecutiveSummaryGenerator',
        'PolicyConflictDetector',
        'PolicyRelatedPolicies',
        'PolicyAdoptionMap',
        'PolicyImpactMetrics',
        'PolicyImplementationTracker',
        'PolicyAmendmentWizard',
        'PolicyCommentThread'
      ],
      
      completeness: 100,
      gaps: []
    },
    {
      name: 'ChallengeDetail',
      entity: 'Challenge',
      icon: AlertCircle,
      status: '🎉 GOLD STANDARD',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'excellent' },
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Problem Statement', exists: true, quality: 'excellent' },
        { name: 'Data & Evidence', exists: true, quality: 'excellent' },
        { name: 'KPIs', exists: true, quality: 'excellent' },
        { name: 'Stakeholders', exists: true, quality: 'excellent' },
        { name: 'AI Insights', exists: true, quality: 'excellent' },
        { name: 'Solutions', exists: true, quality: 'excellent' },
        { name: 'Pilots', exists: true, quality: 'excellent' },
        { name: 'R&D', exists: true, quality: 'excellent' },
        { name: 'Related Entities', exists: true, quality: 'excellent' },
        { name: 'Impact', exists: true, quality: 'excellent' },
        { name: 'Media', exists: true, quality: 'excellent' },
        { name: 'Activity Log', exists: true, quality: 'excellent' },
        { name: 'Innovation Framing', exists: true, quality: 'excellent' },
        { name: 'Strategic Alignment', exists: true, quality: 'excellent' },
        { name: 'Proposals', exists: true, quality: 'excellent' },
        { name: 'Expert Evaluations', exists: true, quality: 'excellent' },
        { name: 'Programs', exists: true, quality: 'excellent' },
        { name: 'Knowledge Sharing', exists: true, quality: 'excellent' },
        { name: 'Policy', exists: true, quality: 'excellent' },
        { name: 'Financial', exists: true, quality: 'excellent' },
        { name: 'Workflow History', exists: true, quality: 'excellent' },
        { name: 'Events', exists: true, quality: 'excellent' },
        { name: 'Collaboration', exists: true, quality: 'excellent' },
        { name: 'Dependencies', exists: true, quality: 'excellent' },
        { name: 'Scaling', exists: true, quality: 'excellent' },
        { name: 'External Intelligence', exists: true, quality: 'excellent' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: true,
        hasShareButton: true,
        hasVersionHistory: true,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'UnifiedWorkflowApprovalTab',
        'ChallengeActivityLog',
        'InnovationFramingGenerator',
        'StrategicAlignmentSelector',
        'PolicyRecommendationManager',
        'RelationManager',
        'ImpactReportGenerator',
        'ChallengeRFPGenerator',
        'KPIBenchmarkData',
        'CausalGraphVisualizer',
        'CrossCitySolutionSharing'
      ],
      
      completeness: 100,
      editPageQuality: 100,
      gaps: []
    },
    {
      name: 'PilotDetail',
      entity: 'Pilot',
      icon: TestTube,
      status: '🟡 HIGH PROGRESS',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'good' },
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'AI Predictions', exists: true, quality: 'excellent' },
        { name: 'KPIs & Data', exists: true, quality: 'excellent' },
        { name: 'Financial', exists: true, quality: 'good' },
        { name: 'Team', exists: true, quality: 'good' },
        { name: 'Risks', exists: true, quality: 'good' },
        { name: 'Compliance', exists: true, quality: 'good' },
        { name: 'Sandbox', exists: true, quality: 'basic' },
        { name: 'Timeline', exists: true, quality: 'good' },
        { name: 'Data Collection', exists: true, quality: 'basic' },
        { name: 'Evaluation', exists: true, quality: 'good' },
        { name: 'Media', exists: true, quality: 'basic' },
        { name: 'Experts', exists: true, quality: 'basic' },
        { name: 'AI Connections', exists: true, quality: 'good' },
        { name: 'Policy', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [
        'AISuccessPredictor',
        'EnhancedKPITracker',
        'FinancialTracker'
      ],
      
      completeness: 85,
      gaps: ['No activity log', 'Too many tabs (16), needs consolidation']
    },
    {
      name: 'SolutionDetail',
      entity: 'Solution',
      icon: Lightbulb,
      status: '🎉 GOLD STANDARD',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Workflow & Approvals', exists: true, quality: 'excellent' },
        { name: 'Features', exists: true, quality: 'excellent' },
        { name: 'Technical Specs', exists: true, quality: 'excellent' },
        { name: 'Pricing', exists: true, quality: 'good' },
        { name: 'Competitive Analysis', exists: true, quality: 'excellent' },
        { name: 'Deployments', exists: true, quality: 'good' },
        { name: 'Case Studies', exists: true, quality: 'good' },
        { name: 'Pilots', exists: true, quality: 'excellent' },
        { name: 'Reviews & Ratings', exists: true, quality: 'excellent' },
        { name: 'Experts', exists: true, quality: 'excellent' },
        { name: 'Activity Log', exists: true, quality: 'excellent' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: true,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'UnifiedWorkflowApprovalTab',
        'SolutionActivityLog',
        'RequestDemoButton',
        'ExpressInterestButton',
        'CompetitiveAnalysisTab',
        'SolutionReviewsTab',
        'SolutionVerificationWizard',
        'SolutionDeploymentTracker',
        'SolutionCaseStudyWizard'
      ],
      
      completeness: 100,
      gaps: []
    },
    {
      name: 'ProgramDetail',
      entity: 'Program',
      icon: Calendar,
      status: '🎉 PLATINUM STANDARD',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Workflow & Approvals', exists: true, quality: 'excellent' },
        { name: 'Timeline', exists: true, quality: 'good' },
        { name: 'Eligibility', exists: true, quality: 'good' },
        { name: 'Benefits', exists: true, quality: 'good' },
        { name: 'Funding', exists: true, quality: 'good' },
        { name: 'Curriculum', exists: true, quality: 'good' },
        { name: 'Mentors', exists: true, quality: 'excellent' },
        { name: 'Applications', exists: true, quality: 'good' },
        { name: 'Participants', exists: true, quality: 'excellent' },
        { name: 'Outcomes', exists: true, quality: 'excellent' },
        { name: 'Media', exists: true, quality: 'basic' },
        { name: 'Activity', exists: true, quality: 'excellent' },
        { name: 'Discussion', exists: true, quality: 'good' },
        { name: 'Policy', exists: true, quality: 'good' },
        { name: 'Conversions', exists: true, quality: 'excellent' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: true,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [
        'UnifiedWorkflowApprovalTab',
        'ProgramActivityLog',
        'AIProgramSuccessPredictor',
        'AICohortOptimizerWidget',
        'AIDropoutPredictor',
        'AIAlumniSuggester',
        'ProgramToSolutionWorkflow',
        'ProgramToPilotWorkflow',
        'ProgramExpertEvaluation',
        'PolicyTabWidget',
        'ExpertAssignment integration',
        'ProgramAlumniStoryboard',
        'AIProgramBenchmarking'
      ],
      
      actualImplementation: '16 tabs total (added Conversions). 4 AI widgets integrated. 2 conversion workflows. UnifiedWorkflowApprovalTab with 4 gates + ProgramExpertEvaluation. ProgramActivityLog comprehensive. Expert evaluation system fully integrated.',
      
      completeness: 100,
      gaps: []
    },
    {
      name: 'RDProjectDetail',
      entity: 'RDProject',
      icon: Microscope,
      status: '🎉 COMPLETE',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Workflow & Approvals', exists: true, quality: 'excellent' },
        { name: 'Activity Log', exists: true, quality: 'excellent' },
        { name: 'TRL Assessment', exists: true, quality: 'excellent' },
        { name: 'Team', exists: true, quality: 'good' },
        { name: 'Methodology', exists: true, quality: 'good' },
        { name: 'Timeline', exists: true, quality: 'good' },
        { name: 'Budget', exists: true, quality: 'good' },
        { name: 'Outputs', exists: true, quality: 'good' },
        { name: 'Publications', exists: true, quality: 'good' },
        { name: 'Datasets', exists: true, quality: 'good' },
        { name: 'Impact', exists: true, quality: 'good' },
        { name: 'Pilot Opportunities', exists: true, quality: 'good' },
        { name: 'Media', exists: true, quality: 'basic' },
        { name: 'Discussion', exists: true, quality: 'good' },
        { name: 'Experts', exists: true, quality: 'excellent' },
        { name: 'AI Connections', exists: true, quality: 'excellent' },
        { name: 'Policy', exists: true, quality: 'excellent' },
        { name: 'IP Management', exists: true, quality: 'excellent' },
        { name: 'Final Evaluation', exists: true, quality: 'excellent' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: true,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'UnifiedWorkflowApprovalTab',
        'RDProjectActivityLog',
        'TRLAssessmentWorkflow',
        'IPManagementWidget',
        'RDProjectFinalEvaluationPanel',
        'RDToSolutionConverter',
        'RDToPolicyConverter',
        'RDToPilotTransition',
        'AIProposalWriter',
        'PolicyTabWidget',
        'CrossEntityRecommender'
      ],
      
      completeness: 100,
      gaps: []
    },
    {
      name: 'RDProposalDetail',
      entity: 'RDProposal',
      icon: FileText,
      status: '🟡 IMPROVED',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'good' },
        { name: 'Overview', exists: true, quality: 'good' },
        { name: 'Research Plan', exists: true, quality: 'good' },
        { name: 'Budget', exists: true, quality: 'basic' },
        { name: 'Team', exists: true, quality: 'basic' },
        { name: 'Review', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: false,
        hasComments: true,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [],
      
      completeness: 70,
      gaps: ['No AI academic scorer', 'No activity log']
    },
    {
      name: 'ProgramApplicationDetail',
      entity: 'ProgramApplication',
      icon: Users,
      status: '🟡 IMPROVED',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'good' },
        { name: 'Overview', exists: true, quality: 'good' },
        { name: 'Application Details', exists: true, quality: 'good' },
        { name: 'Evaluation', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: false,
        hasComments: true,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: false,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [],
      
      completeness: 70,
      gaps: ['No AI fit scorer', 'No activity log']
    },
    {
      name: 'MatchmakerApplicationDetail',
      entity: 'MatchmakerApplication',
      icon: Users,
      status: '🟡 IMPROVED',
      
      tabs: [
        { name: 'Workflow & Approvals', exists: true, quality: 'good' },
        { name: 'Overview', exists: true, quality: 'good' },
        { name: 'Organization Profile', exists: true, quality: 'good' },
        { name: 'Matching', exists: true, quality: 'basic' },
        { name: 'Evaluation', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: true,
        hasAIInsights: false,
        hasComments: false,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: false,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [],
      
      completeness: 65,
      gaps: ['No AI match predictor', 'No comments', 'No activity log']
    },
    {
      name: 'OrganizationDetail',
      entity: 'Organization',
      icon: Building2,
      status: '⚠️ BASIC',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'good' },
        { name: 'Solutions', exists: true, quality: 'basic' },
        { name: 'Projects', exists: true, quality: 'basic' },
        { name: 'Partnerships', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: false,
        hasComments: false,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [],
      
      completeness: 40,
      gaps: [
        'No UnifiedWorkflowTab (needs verification workflow)',
        'No AI organization insights',
        'No activity dashboard',
        'Missing performance metrics visualization'
      ]
    },
    {
      name: 'SandboxDetail',
      entity: 'Sandbox',
      icon: Shield,
      status: '⚠️ BASIC',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'basic' },
        { name: 'Applications', exists: true, quality: 'basic' },
        { name: 'Regulations', exists: true, quality: 'basic' },
        { name: 'Monitoring', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: false,
        hasComments: false,
        hasActivityLog: false,
        hasRelatedEntities: false,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [],
      
      completeness: 35,
      gaps: [
        'No UnifiedWorkflowTab',
        'No AI regulatory gap analyzer',
        'Missing incident tracking',
        'No exemption management UI'
      ]
    },
    {
      name: 'LivingLabDetail',
      entity: 'LivingLab',
      icon: Beaker,
      status: '⚠️ BASIC',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'basic' },
        { name: 'Facilities', exists: true, quality: 'basic' },
        { name: 'Bookings', exists: true, quality: 'basic' },
        { name: 'Projects', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: false,
        hasComments: false,
        hasActivityLog: false,
        hasRelatedEntities: false,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [],
      
      completeness: 35,
      gaps: [
        'No UnifiedWorkflowTab (needs accreditation)',
        'No capacity optimization AI',
        'Missing research outputs tracker'
      ]
    },
    {
      name: 'RDCallDetail',
      entity: 'RDCall',
      icon: Microscope,
      status: '⚠️ NEEDS WORK',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'good' },
        { name: 'Challenges', exists: true, quality: 'basic' },
        { name: 'Proposals', exists: true, quality: 'basic' },
        { name: 'Timeline', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: false,
        hasComments: true,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: true,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: false
      },
      
      specialComponents: [],
      
      completeness: 50,
      gaps: [
        'No UnifiedWorkflowTab',
        'No AI call generator from challenges',
        'Missing proposal ranking AI'
      ]
    },
    {
      name: 'IdeaDetail',
      entity: 'CitizenIdea',
      icon: Lightbulb,
      status: '🟡 HIGH PROGRESS',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'Evaluation', exists: true, quality: 'good' },
        { name: 'Comments', exists: true, quality: 'good' },
        { name: 'Related Ideas', exists: true, quality: 'basic' },
        { name: 'Activity', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: true,
        hasComments: true,
        hasActivityLog: true,
        hasRelatedEntities: true,
        hasEditButton: false,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: true,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'AIIdeaClassifier',
        'IdeaToChallengeConverter',
        'IdeaToSolutionConverter',
        'IdeaVotingBoard',
        'CommentThread',
        'SocialShare'
      ],
      
      completeness: 75,
      gaps: ['Needs UnifiedWorkflowApprovalTab for screening + evaluation gates', 'Activity log basic']
    },
    {
      name: 'InnovationProposalDetail',
      entity: 'InnovationProposal',
      icon: Sparkles,
      status: '🟡 STRONG',
      
      tabs: [
        { name: 'Overview', exists: true, quality: 'excellent' },
        { name: 'AI Screening', exists: true, quality: 'excellent' },
        { name: 'Evaluation', exists: true, quality: 'good' },
        { name: 'Stakeholder Alignment', exists: true, quality: 'good' },
        { name: 'Conversion Status', exists: true, quality: 'basic' }
      ],
      
      features: {
        hasUnifiedWorkflowTab: false,
        hasAIInsights: true,
        hasComments: false,
        hasActivityLog: false,
        hasRelatedEntities: true,
        hasEditButton: false,
        hasDeleteButton: true,
        hasExportPDF: false,
        hasShareButton: false,
        hasVersionHistory: false,
        hasBilingual: true,
        hasAttachments: true
      },
      
      specialComponents: [
        'AIProposalScreening',
        'StakeholderAlignmentGate',
        'UnifiedEvaluationForm'
      ],
      
      completeness: 80,
      gaps: ['Needs UnifiedWorkflowApprovalTab for all 3 gates', 'No comments', 'No activity log']
    }
  ];

  const filtered = detailPages.filter(p => {
    if (filterBy === 'complete') return p.completeness >= 90;
    if (filterBy === 'needs_work') return p.completeness < 70;
    if (filterBy === 'has_workflow') return p.features.hasUnifiedWorkflowTab;
    if (filterBy === 'no_workflow') return !p.features.hasUnifiedWorkflowTab;
    if (filterBy === 'has_ai') return p.features.hasAIInsights;
    return true;
  });

  const stats = {
    total: detailPages.length,
    withWorkflowTab: detailPages.filter(p => p.features.hasUnifiedWorkflowTab).length,
    withAI: detailPages.filter(p => p.features.hasAIInsights).length,
    withActivityLog: detailPages.filter(p => p.features.hasActivityLog).length,
    avgCompleteness: Math.round(detailPages.reduce((sum, p) => sum + p.completeness, 0) / detailPages.length),
    goldStandard: detailPages.filter(p => p.completeness === 100).length,
    citizenPages: detailPages.filter(p => ['CitizenIdea', 'InnovationProposal'].includes(p.entity)).length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: '👁️ Detail Pages Coverage', ar: '👁️ تغطية صفحات التفاصيل' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'Audit of all entity detail pages: tabs, features, workflows, and AI integration',
            ar: 'تدقيق جميع صفحات تفاصيل الكيانات: التبويبات، الميزات، سير العمل، والتكامل الذكي'
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Pages', ar: 'إجمالي الصفحات' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.goldStandard}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Excellent (≥90%)', ar: 'ممتاز (≥90%)' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.withWorkflowTab}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With Workflow Tab', ar: 'مع تبويب سير العمل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="pt-4 text-center">
            <Sparkles className="h-8 w-8 text-pink-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-pink-600">{stats.withAI}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With AI', ar: 'مع ذكاء' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <MessageSquare className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.withActivityLog}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Activity Logs', ar: 'سجلات النشاط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-100 to-white">
          <CardContent className="pt-4 text-center">
            <BarChart3 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.avgCompleteness}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Quality', ar: 'الجودة المتوسطة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={filterBy === 'all' ? 'default' : 'outline'} onClick={() => setFilterBy('all')}>
              {t({ en: 'All', ar: 'الكل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'complete' ? 'default' : 'outline'} onClick={() => setFilterBy('complete')}>
              {t({ en: 'Excellent (≥90%)', ar: 'ممتاز (≥90%)' })}
            </Button>
            <Button size="sm" variant={filterBy === 'needs_work' ? 'default' : 'outline'} onClick={() => setFilterBy('needs_work')}>
              {t({ en: 'Needs Work (<70%)', ar: 'يحتاج عمل (<70%)' })}
            </Button>
            <Button size="sm" variant={filterBy === 'has_workflow' ? 'default' : 'outline'} onClick={() => setFilterBy('has_workflow')}>
              {t({ en: 'Has Workflow', ar: 'مع سير عمل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'no_workflow' ? 'default' : 'outline'} onClick={() => setFilterBy('no_workflow')}>
              {t({ en: 'No Workflow', ar: 'بدون سير عمل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'has_ai' ? 'default' : 'outline'} onClick={() => setFilterBy('has_ai')}>
              {t({ en: 'Has AI', ar: 'مع ذكاء' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detail Pages */}
      <div className="space-y-4">
        {filtered.map((page, idx) => {
          const Icon = page.icon;
          
          return (
            <Card key={idx} className="border-2 hover:shadow-lg transition-shadow" style={{
              borderLeftColor: page.completeness >= 90 ? '#10b981' : 
                              page.completeness >= 70 ? '#f59e0b' : '#ef4444',
              borderLeftWidth: '6px'
            }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {page.name}
                        <Badge variant="outline">{page.entity}</Badge>
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{page.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{
                      color: page.completeness >= 90 ? '#10b981' :
                             page.completeness >= 70 ? '#f59e0b' : '#ef4444'
                    }}>
                      {page.completeness}%
                    </div>
                    <p className="text-xs text-slate-500">Quality Score</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feature Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Workflow Tab', ar: 'تبويب سير العمل' })}</p>
                    {page.features.hasUnifiedWorkflowTab ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'AI Insights', ar: 'رؤى ذكية' })}</p>
                    {page.features.hasAIInsights ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Activity Log', ar: 'سجل النشاط' })}</p>
                    {page.features.hasActivityLog ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Comments', ar: 'تعليقات' })}</p>
                    {page.features.hasComments ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    {t({ en: '📑 Tabs:', ar: '📑 التبويبات:' })} ({page.tabs.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {page.tabs.map((tab, i) => (
                      <Badge key={i} variant="outline" className="text-xs" style={{
                        borderColor: tab.quality === 'excellent' ? '#10b981' :
                                    tab.quality === 'good' ? '#3b82f6' :
                                    '#f59e0b'
                      }}>
                        {tab.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Special Components */}
                {page.specialComponents.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-2">
                      {t({ en: '⭐ Special Components:', ar: '⭐ مكونات خاصة:' })}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {page.specialComponents.map((comp, i) => (
                        <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gaps */}
                {page.gaps.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-2">
                      {t({ en: '⚠️ Gaps:', ar: '⚠️ فجوات:' })}
                    </p>
                    <ul className="space-y-1">
                      {page.gaps.map((gap, i) => (
                        <li key={i} className="text-xs text-red-700">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action */}
                <Link to={createPageUrl(page.name)}>
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-3 w-3 mr-2" />
                    {t({ en: 'View Page', ar: 'عرض الصفحة' })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Summary & Priorities', ar: 'الملخص والأولويات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-green-100 rounded-lg">
            <p className="font-semibold text-green-900 mb-2">
              ✅ {t({ en: 'Gold Standards (100%):', ar: 'المعايير الذهبية (100%):' })}
            </p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• PolicyDetail: 100% - Complete workflow, AI, activity log, all features</li>
              <li>• ChallengeDetail: 100% - 27 tabs, UnifiedWorkflowApprovalTab, ChallengeActivityLog, all AI features</li>
              <li>• SolutionDetail: 100% - 12 tabs, UnifiedWorkflowApprovalTab, SolutionActivityLog, engagement features, expert verification</li>
              <li>• ProgramDetail: 100% - 16 tabs (incl. Conversions), 4 AI widgets, 3 conversion workflows, expert eval integrated in UnifiedWorkflowApprovalTab, full workflow, activity log</li>
              <li>• All four are reference implementations for other entities</li>
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-yellow-900 mb-2">
              🟡 {t({ en: 'Citizen & Innovation Pages (75-80%):', ar: 'صفحات المواطنين والابتكار (75-80%):' })}
            </p>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• IdeaDetail: 75% - Strong AI, evaluation, comments, voting. Needs UnifiedWorkflowApprovalTab</li>
              <li>• InnovationProposalDetail: 80% - Excellent AI screening, stakeholder gate. Needs UnifiedWorkflowApprovalTab + activity log</li>
              <li>• Total: {stats.citizenPages} citizen engagement detail pages tracked</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-900 mb-2">
              ⚠️ {t({ en: 'Common Gaps:', ar: 'فجوات شائعة:' })}
            </p>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• Activity logs missing from RDProject, Organization, Sandbox, LivingLab, RDCall, InnovationProposal (6/12 pages) - Program✅ has ProgramActivityLog</li>
              <li>• AI insights missing from RDProject, Organization, Sandbox, LivingLab, RDCall (5/12 pages) - Program✅ has 4 AI widgets</li>
              <li>• Export/share functionality missing from non-policy/challenge/solution pages</li>
              <li>• UnifiedWorkflowApprovalTab needed for IdeaDetail, InnovationProposalDetail (citizen workflow standardization)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(DetailPagesCoverageReport, { requireAdmin: true });
