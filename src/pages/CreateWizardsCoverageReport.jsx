import { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import {
  CheckCircle2, XCircle, AlertCircle, Sparkles, FileText, TestTube,
  Microscope, Shield, Users, Calendar, Lightbulb, ArrowRight, Zap,
  Target, Building2, Handshake, Beaker, Megaphone, Award, BookOpen,
  MapPin, Tags, Send
} from 'lucide-react';

function CreateWizardsCoverageReport() {
  const { language, isRTL, t } = useLanguage();
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('cards');

  const firstStepPatterns = {
    'ai_first': {
      name: 'AI-First (Generative)',
      description: 'AI generates structure from free-form input',
      criteria: 'High complexity OR user lacks domain expertise',
      color: 'purple',
      examples: ['PolicyCreate', 'RDProjectCreate']
    },
    'context_first': {
      name: 'Context-First (Selection)',
      description: 'Select parent/linked entity before proceeding',
      criteria: 'Mandatory dependency OR entity must link to existing record',
      color: 'blue',
      examples: ['PilotCreate', 'ProposalWizard', 'ProgramApplicationWizard']
    },
    'info_first': {
      name: 'Info-First (Traditional Form)',
      description: 'Direct data entry from first step',
      criteria: 'Straightforward structure AND user has info ready',
      color: 'green',
      examples: ['ChallengeCreate', 'SolutionCreate', 'ProgramCreate']
    },
    'simplified': {
      name: 'Simplified (Public)',
      description: 'Minimal friction, single page',
      criteria: 'Public/citizen users OR simple submission',
      color: 'teal',
      examples: ['PublicIdeaSubmission', 'KnowledgeDocumentCreate']
    }
  };

  const getRecommendedPattern = (wizard) => {
    if (wizard.canInitiateFrom?.some(source => 
      ['Challenge detail', 'RDCall detail', 'Program detail'].some(page => source.includes(page))
    )) {
      return 'context_first';
    }
    
    if (['Policy', 'RDProject', 'RDProposal'].some(type => wizard.entityType.includes(type))) {
      return 'ai_first';
    }
    
    if (wizard.userPersona?.includes('Citizen') || wizard.userPersona?.includes('Public')) {
      return 'simplified';
    }
    
    return 'info_first';
  };

  const wizards = [
    {
      name: 'ProgramIdeaSubmission',
      entityType: 'InnovationProposal',
      icon: Users,
      status: '✅ COMPLETE - FIXED',
      userPersona: 'Citizen / Startup / Participant',
      actualFirstStep: '✨ HYBRID: Context-first with AI + auto-skip: Program selection → (auto-skip if ?program_id) → AI proposal writer',
      firstStepPattern: 'context_first',
      firstStepContent: 'Step 1: Program selection (auto-skip if pre-filled) → Step 2: Proposal details with AI enhance + auto-save + draft recovery',
      canInitiateFrom: ['Program detail (?program_id auto-skip)', 'Public portal'],
      contextHandling: '✅ FIXED: Auto-skip Step 1 if ?program_id pre-filled + shows program context',
      uxStrength: '✅ EXCELLENT: Auto-skip + AI assist + auto-save + bilingual translation buttons',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Program Selection (auto-skip if pre-filled)', 'Proposal Details + AI Enhance', 'Review & Submit'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI proposal writer from program context',
          'Strategic alignment scorer',
          'Budget reasonability checker',
          'Team adequacy scorer',
          'Quick translation buttons (AR→EN, EN→AR)',
          'Auto-translation with user edit tracking'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN with quick translation buttons',
        
        validation: true,
        validationFeatures: ['Program required', 'Budget required', 'Auto-save every 30s', 'Draft recovery'],
        
        entityLinking: true,
        linkableEntities: ['Program'],
        
        fileUpload: true,
        uploadTypes: ['Team documents', 'Supporting materials'],
        
        specialFeatures: [
          '✨ Auto-skip Step 1 if ?program_id present',
          '✨ Program context display card',
          '✨ AI proposal writer',
          '✨ Quick translation buttons',
          '✨ User edit tracking for smart re-translation',
          '✨ Auto-save draft every 30s',
          '✨ Draft recovery on reload',
          '✨ Last saved timestamp display'
        ]
      },
      
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'ChallengeIdeaResponse',
      entityType: 'InnovationProposal',
      icon: Target,
      status: '✅ COMPLETE - ENHANCED',
      userPersona: 'Citizen / Startup / Solution Provider',
      actualFirstStep: '✨ HYBRID: Visual challenge cards → AI fit scoring → Proposal form with AI enhance',
      firstStepPattern: 'context_first',
      firstStepContent: 'Step 1: Challenge selection (visual cards with fit scoring) → Step 2: AI response writer → Step 3: Review',
      canInitiateFrom: ['Challenge detail (?challenge_id)', 'Public challenges board'],
      contextHandling: '✅ ENHANCED: Visual challenge cards + AI fit scoring + challenge context display',
      uxStrength: '✅ EXCELLENT: Visual cards + AI fit analysis + bilingual AI assist',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Challenge Selection (visual cards + fit scoring)', 'Response Details + AI Enhance', 'Review & Submit'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI challenge-proposal fit scoring (0-100)',
          'AI response writer from challenge context',
          'Auto-fill approach from challenge requirements',
          'Gap analysis vs challenge KPIs',
          'Bilingual content generation',
          'Quick translation buttons'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN with AI assist',
        
        validation: true,
        validationFeatures: ['Challenge required', 'Implementation plan required'],
        
        entityLinking: true,
        linkableEntities: ['Challenge'],
        
        fileUpload: true,
        uploadTypes: ['Supporting documents'],
        
        specialFeatures: [
          '✨ Visual challenge cards with images',
          '✨ AI fit scoring per challenge',
          '✨ Challenge context box',
          '✨ AI response writer',
          '✨ Quick translation buttons',
          '✨ Gap analysis widget'
        ]
      },
      
      completeness: 100,
      maturityScore: 93,
      gaps: []
    },
    {
      name: 'ProgramApplicationWizard',
      entityType: 'ProgramApplication',
      icon: Award,
      status: '✅ COMPLETE - ENHANCED',
      userPersona: 'Startup / Participant / Applicant',
      actualFirstStep: '✨ ENHANCED: Visual program cards with deadlines → Application form + AI writer',
      firstStepPattern: 'context_first',
      firstStepContent: 'Step 1: Program selection (visual cards) → Step 2: Link work + AI proposal writer → Step 3: Team → Step 4: Success',
      canInitiateFrom: ['Program detail (?program_id)', 'Programs list'],
      contextHandling: '✅ ENHANCED: Visual program cards + deadline badges + AI application writer',
      uxStrength: '✅ EXCELLENT: Visual cards + AI writer + progress tracking',

      features: {
        multiStep: true,
        stepCount: 4,
        steps: ['Program Selection (visual cards)', 'Link Work + AI Writer', 'Team Members', 'Success Confirmation'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI application writer',
          'Program-applicant fit analysis',
          'Proposal improvement suggestions'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full bilingual',
        
        validation: true,
        validationFeatures: ['Program required', 'Team info required'],
        
        entityLinking: true,
        linkableEntities: ['Program', 'Challenge', 'Solution'],
        
        fileUpload: false,
        uploadTypes: [],
        
        specialFeatures: [
          '✨ Visual program cards',
          '✨ Application deadline badges',
          '✨ AI application writer',
          '✨ Team builder',
          '✨ Progress tracker'
        ]
      },
      
      completeness: 100,
      maturityScore: 92,
      gaps: []
    },
    {
      name: 'SandboxCreate',
      entityType: 'Sandbox',
      icon: Shield,
      status: '✅ COMPLETE - AI ENHANCED',
      userPersona: 'Admin / Sandbox Operator',
      actualFirstStep: '✨ HYBRID: Context-first (Domain* + City*) → AI Generator → Structured form with nested bilingual objects',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: Domain + City selection → Step 1.5: AI Generator (vision textarea → generate) → Step 2-5: Structured forms',
      canInitiateFrom: ['Standalone'],
      contextHandling: '✅ NEW: AI generates regulatory framework items + safety protocols as nested bilingual objects',
      uxStrength: '✅ EXCELLENT: Context selection → AI full generation → Manual refinement with auto-save',
      
      features: {
        multiStep: true,
        stepCount: 6,
        steps: [
          'Context (Domain + City)',
          'AI Generator (vision → generate complete sandbox)',
          'Details + Regulatory Framework Items',
          'Infrastructure',
          'Pricing & Contact',
          'Review & Media'
        ],
        
        aiAssistance: true,
        aiFeatures: [
          'AI complete sandbox generator from vision',
          'Full bilingual content (name, tagline, description, objectives)',
          'Regulatory framework items (7 bilingual objects)',
          'Safety protocols (6 bilingual objects with risk levels)',
          'Target industries array',
          'Available exemptions array',
          'Access requirements array',
          'Code auto-generation'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN with nested bilingual objects',
        
        validation: true,
        validationFeatures: ['Domain + City required', 'Name required', 'Auto-save', 'Draft recovery'],
        
        entityLinking: true,
        linkableEntities: ['City', 'Organization', 'LivingLab'],
        
        fileUpload: true,
        uploadTypes: ['Image with AI search', 'Video', 'Brochure PDF'],
        
        specialFeatures: [
          '✨ AI-first pattern with context selection',
          '✨ AI generates regulatory framework items (bilingual objects)',
          '✨ AI generates safety protocols (bilingual objects with metadata)',
          '✨ FileUploader with AI image search',
          '✨ Auto-save every 30s',
          '✨ Draft recovery',
          '✨ Success screen before redirect',
          '✨ Data cleaning before submission'
        ]
      },
      
      completeness: 100,
      maturityScore: 96,
      gaps: []
    },
    {
      name: 'KnowledgeDocumentCreate',
      entityType: 'KnowledgeDocument',
      icon: BookOpen,
      status: '✅ COMPLETE - AI ENHANCED',
      userPersona: 'Knowledge Manager / Admin / Content Creator',
      actualFirstStep: '✨ ENHANCED: Step 1: AI Generator → Step 2: Manual form with file upload',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: AI knowledge generator (topic → generate) → Step 2: Structured bilingual form + file upload',
      canInitiateFrom: ['Knowledge library'],
      contextHandling: '✅ NEW: AI-first pattern with content generation',
      uxStrength: '✅ EXCELLENT: AI generation → manual refinement',

      features: {
        multiStep: true,
        stepCount: 2,
        steps: ['AI Generator', 'Details + Media'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI knowledge document generator',
          'Full bilingual content',
          'Auto-categorization',
          'Tag suggestions',
          'Content type classification'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN',
        
        validation: true,
        validationFeatures: ['Title required'],
        
        entityLinking: false,
        linkableEntities: [],
        
        fileUpload: true,
        uploadTypes: ['Document, Video, Audio, Image based on content_type'],
        
        specialFeatures: [
          '✨ AI content generator',
          '✨ Auto-tagging',
          '✨ Auto-categorization',
          '✨ Conditional file upload by content_type',
          '✨ Duration tracking for video/audio'
        ]
      },
      
      completeness: 100,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'CaseStudyCreate',
      entityType: 'CaseStudy',
      icon: Award,
      status: '✅ COMPLETE - AI ENHANCED',
      userPersona: 'Knowledge Manager / Admin / Success Story Writer',
      actualFirstStep: '✨ ENHANCED: Step 1: AI Story Generator → Step 2: Manual form with media',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: AI case study generator (pilot/success story → generate) → Step 2: Structured form + media',
      canInitiateFrom: ['Pilot (success conversion)', 'Knowledge library'],
      contextHandling: '✅ NEW: AI story generator with entity context',
      uxStrength: '✅ EXCELLENT: AI generation → structured editing',

      features: {
        multiStep: true,
        stepCount: 2,
        steps: ['AI Story Generator', 'Details + Media'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI case study generator',
          'Impact calculator',
          'Success metrics generator',
          'Bilingual content',
          'Entity linking to Challenge/Pilot/Solution'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN',
        
        validation: true,
        validationFeatures: ['Title required'],
        
        entityLinking: true,
        linkableEntities: ['Challenge', 'Pilot', 'Solution'],
        
        fileUpload: true,
        uploadTypes: ['Image with AI search', 'Thumbnail', 'Video', 'Document'],
        
        specialFeatures: [
          '✨ AI story generator',
          '✨ Impact calculator',
          '✨ Entity linking',
          '✨ FileUploader with AI search',
          '✨ Multiple media types',
          '✨ Metrics field (object)'
        ]
      },
      
      completeness: 100,
      maturityScore: 93,
      gaps: []
    },
    {
      name: 'PolicyCreate',
      entityType: 'PolicyRecommendation',
      icon: Shield,
      status: '🎉 COMPLETE',
      userPersona: 'Policy Analyst / Municipal Legal Team',
      actualFirstStep: '✨ HYBRID: Entity Linking (optional dropdowns) + Free-form policy thoughts textarea → AI Generate Framework button',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: Link entities (Challenge/Pilot/RD/Program) + Policy thoughts textarea + AI Generate → Step 2: Structured AR-first form',
      canInitiateFrom: ['Challenge', 'Pilot', 'RDProject', 'Program', 'Standalone'],
      contextHandling: '✅ BEST PRACTICE: Pre-fills entity links from URL params but KEEPS AI-first UX for all users',
      uxStrength: '✅ EXCELLENT: Hybrid approach allows context linking WITHOUT forcing Info-First pattern',
      
      features: {
        multiStep: true,
        stepCount: 2,
        steps: ['AI Thoughts + Entity Linking (hybrid)', 'Structured Arabic-First Form'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI generates complete policy framework from free-form thoughts',
          'Auto-translation from Arabic to English',
          'Linked entity context enrichment',
          'Template library integration',
          'Similar policy detection'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Arabic-first (official), auto-translate to English',
        
        validation: true,
        validationFeatures: ['Required field validation', 'Arabic content required', 'Auto-save drafts'],
        
        entityLinking: true,
        linkableEntities: ['Challenge', 'Pilot', 'RDProject', 'Program'],
        
        fileUpload: true,
        uploadTypes: ['Supporting documents', 'Attachments'],
        
        specialFeatures: [
          '✨ Template library browser',
          '✨ Similar policy detector',
          '✨ Implementation steps builder (bilingual)',
          '✨ Success metrics builder (bilingual objects)',
          '✨ Stakeholder involvement editor',
          '✨ Auto-save to localStorage',
          '✨ Draft recovery on reload'
        ]
      },
      
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'ChallengeCreate',
      entityType: 'Challenge',
      icon: AlertCircle,
      status: '🎉 COMPLETE - REFACTORED',
      userPersona: 'Municipality Innovation Staff / Challenge Owner',
      actualFirstStep: '✨ HYBRID AI-First + Context-First: Municipality* → Optional entity links (CitizenIdea/StrategicPlan) → Free-form thoughts → AI Generate',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: Municipality* (Field #1) + Optional entity linking + Free-form challenge description → AI Generate → Step 2: Full structured bilingual form',
      canInitiateFrom: ['CitizenIdea (?idea_id=xxx auto-fill)', 'StrategicPlan (?strategic_plan_id=xxx)', 'Standalone'],
      contextHandling: '✅ BEST PRACTICE: URL params pre-fill silently, AI-first pattern for all users',
      uxStrength: '✅ EXCELLENT: Follows PolicyCreate pattern, Municipality first, AI-powered, all fields editable with re-translation',
      
      features: {
        multiStep: true,
        stepCount: 5,
        steps: [
          'AI Generate (Municipality* + Optional links + Free-form → Generate)',
          'Review & Edit (Full bilingual form, all editable with re-translate)',
          'Innovation Framing (HMW/What-If/Questions - editable)',
          'Strategic Alignment (Multi-select plans)',
          'Review & Submit (Draft only)'
        ],
        
        aiAssistance: true,
        aiFeatures: [
          'AI generates complete challenge from free-form description',
          'Full bilingual content generation (AR+EN)',
          'Root cause analysis (primary + array)',
          'Severity & impact scoring',
          'Keyword extraction',
          'Nested taxonomy auto-selection (sector→subsector→service)',
          'KPIs generation (bilingual objects with baseline/target)',
          'Stakeholders mapper',
          'Data evidence suggester',
          'Constraints identifier',
          'Re-translation on manual edits',
          'Innovation framing generator (editable)',
          'Strategic alignment validator',
          'Context enrichment from linked entities'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN with manual edit + re-translate buttons',
        
        validation: true,
        validationFeatures: ['Municipality required (Field #1)', 'Title required', 'Auto-save draft every 30s', 'Draft recovery on reload'],
        
        entityLinking: true,
        linkableEntities: ['CitizenIdea', 'StrategicPlan'],
        
        fileUpload: true,
        uploadTypes: ['Image with AI search', 'Documents/evidence (planned)'],
        
        specialFeatures: [
          '✨ HYBRID: AI-First + Context-First in same step (like PolicyCreate)',
          '✨ Municipality Field #1 (CRITICAL FIX)',
          '✨ Challenge Code auto-generated, read-only',
          '✨ URL params: ?idea_id=xxx, ?strategic_plan_id=xxx pre-fill',
          '✨ Re-translate buttons with edit detection',
          '✨ Editable Innovation Framing (add/edit/delete/translate)',
          '✨ Editable KPIs, stakeholders, evidence, constraints',
          '✨ Nested taxonomy with auto-filtering',
          '✨ No publishing settings in creation (draft only)',
          '✨ AI avoids describing solutions in descriptions',
          '✨ Open-ended desired outcomes',
          '✨ Auto-save + draft recovery',
          '✨ FileUploader with AI image search'
        ]
      },
      
      completeness: 100,
      maturityScore: 98,
      gaps: []
    },
    {
      name: 'PilotCreate',
      entityType: 'Pilot',
      icon: TestTube,
      status: '🎉 COMPLETE',
      userPersona: 'Municipality Pilot Manager / Innovation Lead',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Challenge → Select Solution → Readiness Gate → Location',
      canInitiateFrom: ['Challenge', 'ChallengeSolutionMatch', 'Program (graduates)'],
      contextHandling: '✅ Pre-fills challenge_id from URL params',
      mandatoryGate: '🔒 Solution Readiness Check required before proceeding',
      
      features: {
        multiStep: true,
        stepCount: 7,
        steps: [
          'Pre-Pilot Setup (challenge, solution, location)',
          'Design & KPIs',
          'Target Population & Data Collection',
          'Sandbox & Compliance',
          'Timeline & Milestones',
          'Budget & Media',
          'Review & Submit'
        ],
        
        aiAssistance: true,
        aiFeatures: [
          'Auto-design from challenge + solution',
          'KPI suggestions',
          'Risk assessment',
          'Team builder AI',
          'Stakeholder mapper AI',
          'Technology stack recommender',
          'Budget optimizer AI',
          'Milestone generator AI',
          'Safety checklist generator'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN for all text fields',
        
        validation: true,
        validationFeatures: ['Challenge required', 'Municipality required', 'Sector required', 'Title required'],
        
        entityLinking: true,
        linkableEntities: ['Challenge', 'Solution', 'LivingLab', 'Sandbox'],
        
        fileUpload: true,
        uploadTypes: ['Image with AI search', 'Video', 'Gallery', 'Documents'],
        
        specialFeatures: [
          '✨ Template library integration',
          '✨ Auto-filtered solutions based on challenge',
          '✨ Auto-filtered sandboxes by municipality+sector',
          '✨ Auto-calculate end date from start+duration',
          '✨ Safety protocol generator (8-12 bilingual items)',
          '✨ AI milestone generator with bilingual names/deliverables',
          '✨ Budget breakdown AI optimizer',
          '✨ Funding sources suggester',
          '✨ Progress stepper (7 steps)',
          '✨ Comprehensive review screen before submit'
        ]
      },
      
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'RDProjectCreate',
      entityType: 'RDProject',
      icon: Microscope,
      status: '🎉 COMPLETE',
      userPersona: 'Academic Researcher / R&D Institution',
      firstStepPattern: 'ai_first',
      firstStepContent: 'AI Proposal Writer - generates full project from abstract',
      canInitiateFrom: ['RDCall (response)', 'Challenge (research track)', 'Standalone'],
      contextHandling: '✅ Pre-fills rd_call_id and challenge_ids from URL params',

      features: {
        multiStep: true,
        stepCount: 5,
        steps: ['AI Assistant', 'Basic Info', 'Research Design', 'Team & Budget', 'Review'],

        aiAssistance: true,
        aiFeatures: ['AI academic writing assistant', 'AI full proposal generator', 'AI methodology designer', 'AI team requirements', 'AI budget breakdown', 'AI literature review'],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN',
        
        validation: true,
        validationFeatures: ['Title, institution required', 'Research area validation', 'TRL validation'],
        
        entityLinking: true,
        linkableEntities: ['RDCall', 'Challenge'],
        
        fileUpload: true,
        uploadTypes: ['Documents', 'Research materials'],
        
        specialFeatures: [
          '✨ RDProjectCreateWizard component',
          '✨ AIProposalWriter integration',
          '✨ TRL validator',
          '✨ Methodology recommender',
          '✨ Research question generator'
        ]
      },
      
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'ProposalWizard',
      entityType: 'RDProposal',
      icon: FileText,
      status: '🎉 COMPLETE',
      userPersona: 'Academic Researcher / University',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select R&D Call → Shows call details & deadline',
      canInitiateFrom: ['RDCall detail page', 'RDCalls list'],
      contextHandling: '✅ Pre-fills rd_call_id from URL ?callId param',

      features: {
        multiStep: true,
        stepCount: 4,
        steps: ['Select R&D Call', 'Proposal Details (AI enhanced)', 'Team & Technical', 'Success Confirmation'],
        
        aiAssistance: true,
        aiFeatures: [
          'Full bilingual enhancement',
          'Academic writing optimizer',
          'Impact statement generator',
          'Innovation claim generator',
          'Expected outputs suggester',
          'Keyword extraction',
          'Call requirement alignment checker'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN with AI enhancement',
        
        validation: true,
        validationFeatures: ['Call selection required', 'Title, abstract, institution required', 'PI info required'],
        
        entityLinking: true,
        linkableEntities: ['RDCall'],
        
        fileUpload: false,
        uploadTypes: [],
        
        specialFeatures: [
          '✨ AI Enhance All button',
          '✨ Call context display',
          '✨ Deadline alerts',
          '✨ Progress tracker'
        ]
      },
      
      completeness: 100,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'ProgramCreate',
      entityType: 'Program',
      icon: Calendar,
      status: '🎉 COMPLETE',
      userPersona: 'Program Operator / Admin / Accelerator Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Program Name EN/AR, Program Type, Tagline',
      canInitiateFrom: ['Challenge cluster (theme-based)', 'Strategic Plan'],
      contextHandling: '✅ ChallengeToProgramWorkflow pre-fills themes and objectives',
      
      features: {
        multiStep: true,
        stepCount: 6,
        steps: [
          'Basic Info (name, type, tagline)',
          'Program Structure (duration, cohort, curriculum)',
          'Participants (eligibility, target audience)',
          'Benefits & Funding',
          'Organization & Partners',
          'Review & Submit'
        ],
        
        aiAssistance: true,
        aiFeatures: [
          'Full bilingual enhancement (name, tagline, description, objectives)',
          'AI curriculum generator with customization',
          'Challenge-to-program theme generation',
          'Partner organization suggester',
          'Success metrics builder',
          'Timeline calculator from duration',
          'Cohort size optimizer',
          'Auto-translation support'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN with AI auto-translation',
        
        validation: true,
        validationFeatures: ['Name and type required', 'Timeline validation', 'Funding validation', 'Eligibility criteria required'],
        
        entityLinking: true,
        linkableEntities: ['Challenge', 'Organization'],
        
        fileUpload: true,
        uploadTypes: ['Image', 'Video', 'Gallery', 'Brochure (PDF)'],
        
        specialFeatures: [
          '✨ ProgramCreateWizard (6-step)',
          '✨ AI program design generator',
          '✨ AICurriculumGenerator integrated',
          '✨ Challenge cluster integration via ChallengeToProgramWorkflow',
          '✨ Funding details builder',
          '✨ Timeline auto-calculator',
          '✨ Partner organization selector',
          '✨ Success metrics builder',
          '✨ Progress stepper with visual feedback',
          '✨ Comprehensive review screen'
        ]
      },
      
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'SolutionCreate',
      entityType: 'Solution',
      icon: Lightbulb,
      status: '🎉 COMPLETE',
      userPersona: 'Startup / Solution Provider / Vendor',
      firstStepPattern: 'info_first',
      firstStepContent: 'Solution Name EN/AR, Tagline, Description, Provider Name, Provider Type',
      canInitiateFrom: ['Program (graduate)', 'RDProject (commercialization)', 'Standalone'],
      contextHandling: 'Could pre-fill from program/R&D context if source_program_id set',
      uxOpportunity: '💡 Add "Quick AI Draft" option in Step 1 for non-technical providers',
      
      features: {
        multiStep: true,
        stepCount: 6,
        steps: [
          'Basic Info (titles, descriptions)',
          'Technical Specs (TRL, maturity, features)',
          'AI Enhancement (classification, matching, competitive analysis, pricing)',
          'Provider & Commercial (pricing, contact)',
          'Validation & Media (files, certifications)',
          'Review & Submit'
        ],
        
        aiAssistance: true,
        aiFeatures: [
          'Full bilingual enhancement of all fields',
          'Auto-classification by sector',
          'Automated TRL assessment with justification',
          'Competitive analysis and positioning (NEW: CompetitiveAnalysisWidget)',
          'Pricing intelligence and suggestions (NEW: AIPricingSuggester)',
          'Challenge matching preview (auto-match to opportunities)',
          'Value proposition generator',
          'Use case generator with sectors',
          'Technology stack identifier',
          'Keywords extraction for SEO',
          'Similar solutions detection',
          'Market positioning analysis'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Full parallel AR+EN with AI auto-translation',
        
        validation: true,
        validationFeatures: ['Name required', 'Provider required', 'TRL validation (1-9)', 'Contact email required'],
        
        entityLinking: false,
        linkableEntities: [],
        
        fileUpload: true,
        uploadTypes: ['Image with AI search', 'Video', 'Gallery', 'Brochure/Documentation'],
        
        specialFeatures: [
          '✨ AI profile enhancer with competitive positioning',
          '✨ CompetitiveAnalysisWidget - finds similar solutions + analyzes differentiators',
          '✨ AIPricingSuggester - market pricing intelligence + ROI value proposition',
          '✨ Auto TRL assessment from features and maturity',
          '✨ Semantic challenge matching preview',
          '✨ Technology stack auto-detection',
          '✨ Progress stepper with 6 steps',
          '✨ Use case builder with sector mapping',
          '✨ Value proposition generator',
          '✨ SEO keyword extraction',
          '✨ Competitive advantage analyzer'
        ]
      },
      
      completeness: 100,
      maturityScore: 98,
      gaps: []
    },
    {
      name: 'PublicIdeaSubmission',
      entityType: 'CitizenIdea',
      icon: Lightbulb,
      status: '🎉 COMPLETE',
      userPersona: 'Citizens (General Public)',
      actualFirstStep: 'Title*, Description*, Category dropdown*, Location, Anonymous checkbox, Name/Email (conditional)',
      firstStepPattern: 'simplified',
      firstStepContent: 'Single-page submission: Title, Description, Category, Location, Name/Email (if not anonymous)',
      canInitiateFrom: ['Standalone public portal', 'Public ideas board'],
      contextHandling: '✅ PERFECT: No context needed, AI screening on submit (not intrusive)',
      uxStrength: '✅ EXCELLENT: Minimal friction, AI works in background, toxicity/spam filtering automatic',
      
      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single-step submission with AI enhancement'],
        
        aiAssistance: true,
        aiFeatures: [
          'AI pre-screening (clarity, feasibility, sentiment, toxicity)',
          'Auto-classification by category',
          'Duplicate detection',
          'Auto-recommendation (approve/screen/reject)',
          'Municipality auto-assignment',
          'Sector auto-classification'
        ],
        
        bilingualSupport: true,
        bilingualApproach: 'Arabic or English submission, AI handles classification',
        
        validation: true,
        validationFeatures: ['Title required', 'Description required', 'Toxicity check'],
        
        entityLinking: false,
        linkableEntities: [],
        
        fileUpload: true,
        uploadTypes: ['Supporting images/documents'],
        
        specialFeatures: [
          '✨ Anonymous or authenticated submission',
          '✨ AI pre-screening before submission',
          '✨ Auto-categorization',
          '✨ Duplicate warning',
          '✨ Public voting enabled',
          '✨ Municipality auto-detection from user profile'
        ]
      },
      
      completeness: 100,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'MatchmakerApplicationCreate',
      entityType: 'MatchmakerApplication',
      icon: Handshake,
      status: '🎉 COMPLETE',
      userPersona: 'Startup / Corporate / International Organization',
      firstStepPattern: 'info_first',
      firstStepContent: 'Organization Name, Headquarters, Year, Contact Info (single page)',
      canInitiateFrom: ['Standalone', 'Public matchmaker landing'],
      contextHandling: 'N/A - always standalone application',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form with AI matching analysis'],
        aiAssistance: true,
        aiFeatures: ['AI capability matcher', 'Strategic fit scorer (0-100)', 'Top matches recommender', 'Portfolio synergy analyzer', 'Partnership opportunities detector', 'Engagement approach suggester'],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Organization required', 'Capabilities required'],
        entityLinking: true,
        linkableEntities: ['Organization'],
        fileUpload: true,
        uploadTypes: ['Documents'],
        specialFeatures: ['✨ AI Match button', '✨ Strategic fit scorer', '✨ Top matches with scores', '✨ Engagement approach recommender', '✨ Portfolio synergies analyzer']
      },
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'LivingLabCreate',
      entityType: 'LivingLab',
      icon: Beaker,
      status: '🎉 COMPLETE',
      userPersona: 'Admin / Living Lab Operator',
      actualFirstStep: 'Code, Name EN/AR*, Tagline, Lab Type*, Focus Areas* (checkboxes), Description EN/AR',
      firstStepPattern: 'info_first',
      firstStepContent: 'All basic info in Step 1 with AI Enhance button',
      canInitiateFrom: ['Standalone'],
      contextHandling: '✅ Has "AI Enhance" button in Step 1 - generates taglines, descriptions, objectives',
      uxStrength: '✅ Clear required fields (*), AI assistance on-demand',

      features: {
        multiStep: true,
        stepCount: 2,
        steps: ['Basic Info & AI Infrastructure', 'Review & Create'],
        aiAssistance: true,
        aiFeatures: ['Full bilingual enhancement', 'Infrastructure recommendations (5-8 items)', 'Equipment list generator (8-12 items)', 'Focus areas suggester', 'Booking rules generator'],
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN',
        validation: true,
        validationFeatures: ['Name required', 'Lab type required'],
        entityLinking: true,
        linkableEntities: ['Municipality'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ LivingLabCreateWizard (2-step)', '✨ AI infrastructure planner', '✨ Equipment catalog generator', '✨ Research focus recommender']
      },
      completeness: 100,
      maturityScore: 95,
      gaps: []
    },
    {
      name: 'OrganizationCreate',
      entityType: 'Organization',
      icon: Building2,
      status: '🎉 COMPLETE - REFACTORED',
      userPersona: 'Admin / Network Manager',
      actualFirstStep: '✨ AI-First: Org Type* (Field #1) → Free-form description → AI Generate',
      firstStepPattern: 'ai_first',
      firstStepContent: 'Step 1: Org Type* → Free-form thoughts → AI Generate → Step 2: Full bilingual form with conditional fields',
      canInitiateFrom: ['Standalone'],
      contextHandling: '✅ Org Type Field #1, AI-first pattern, conditional funding fields',
      uxStrength: '✅ FIXED: Org Type now controls conditional fields visibility',

      features: {
        multiStep: true,
        stepCount: 2,
        steps: ['AI Generate (Type* + Free-form → Generate)', 'Review & Edit (Full bilingual, conditional fields)'],
        aiAssistance: true,
        aiFeatures: [
          'AI generates complete profile from free-form',
          'Full bilingual (names, descriptions)',
          'Specializations (bilingual objects)',
          'Capabilities (bilingual objects)',
          'Sectors classification',
          'Team size estimation',
          'Maturity level assessment',
          'Funding stage (for commercial orgs)',
          'Re-translation on edits'
        ],
        bilingualSupport: true,
        bilingualApproach: 'AI-generated parallel AR+EN with re-translate buttons',
        validation: true,
        validationFeatures: ['Org Type required (Field #1)', 'Name required', 'Conditional field validation'],
        entityLinking: true,
        linkableEntities: ['Region', 'City'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: [
          '✨ Org Type Field #1 (CRITICAL FIX)',
          '✨ Code auto-generated, read-only',
          '✨ Conditional funding fields (startup/company/sme only)',
          '✨ Bilingual specializations array',
          '✨ Bilingual capabilities array',
          '✨ Re-translate buttons',
          '✨ AI-first pattern'
        ]
      },
      completeness: 100,
      maturityScore: 98,
      gaps: []
    },
    {
      name: 'SandboxApplicationWizard',
      entityType: 'SandboxApplication',
      icon: Shield,
      status: '🎉 COMPLETE',
      userPersona: 'Startup / Pilot Manager',
      actualFirstStep: 'Org Name*, Contact Name*, Email* (Step 1 of 5)',
      firstStepPattern: 'context_first',
      firstStepContent: 'Sandbox passed as prop → Step 1: Basic Info → Step 2: Project → Step 3: Team/Budget → Step 4: Risk/Safety → Step 5: Review',
      canInitiateFrom: ['Sandbox detail page'],
      contextHandling: '✅ Receives sandbox object as prop - wizard triggered from sandbox context',
      uxStrength: '✅ Has AIExemptionSuggester + AISafetyProtocolGenerator in Step 4 (on-demand)',

      features: {
        multiStep: true,
        stepCount: 5,
        steps: ['Basic Info (org, contact)', 'Project Details (title, scope, outcomes)', 'Team & Budget', 'Risk & Safety + AI tools', 'Review'],
        aiAssistance: true,
        aiFeatures: ['AI exemption suggester', 'AI safety protocol generator'],
        bilingualSupport: true,
        bilingualApproach: 'Manual AR+EN',
        validation: true,
        validationFeatures: ['Required fields per step', 'Progress validation'],
        entityLinking: true,
        linkableEntities: ['Sandbox (prop)'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ AIExemptionSuggester component', '✨ AISafetyProtocolGenerator component', '✨ Step-by-step validation']
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'RDCallCreate',
      entityType: 'RDCall',
      icon: Megaphone,
      status: '🎉 COMPLETE',
      userPersona: 'Admin / R&D Program Manager',
      actualFirstStep: 'Title EN *required* → AI Draft Complete Call button → Manual fields',
      firstStepPattern: 'info_first',
      firstStepContent: 'Title EN/AR, Tagline, Description, Call Type, Funding, Timeline (single comprehensive page)',
      canInitiateFrom: ['Challenge (generate call from challenge)', 'Standalone'],
      contextHandling: '✅ Has "AI Draft Complete Call" button - generates all fields from title',
      uxStrength: '✅ Single-page with powerful AI drafting - good for expert users',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single comprehensive form with AI'],
        aiAssistance: true,
        aiFeatures: ['AI complete call generator', 'AI bilingual content', 'AI research themes', 'AI evaluation criteria', 'AI budget recommendations', 'AI eligibility requirements'],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Title required'],
        entityLinking: true,
        linkableEntities: ['Challenge'],
        fileUpload: true,
        uploadTypes: ['Documents'],
        specialFeatures: []
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'RegionCreate',
      entityType: 'Region',
      icon: MapPin,
      status: '⚠️ Basic Form',
      userPersona: 'Super Admin',
      firstStepPattern: 'info_first',
      firstStepContent: 'Name EN/AR, Code, Type, Population (single page)',
      canInitiateFrom: ['Standalone admin'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name, code required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI geo-data enrichment', 'No coordinates auto-fill']
    },
    {
      name: 'CityCreate',
      entityType: 'City',
      icon: Building2,
      status: '⚠️ Basic Form',
      userPersona: 'Super Admin',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Region → City Name EN/AR, Population',
      canInitiateFrom: ['Region detail', 'Standalone admin'],
      contextHandling: 'Should pre-fill region_id from URL params',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Region, name required'],
        entityLinking: true,
        linkableEntities: ['Region'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI geo-data enrichment', 'No coordinates auto-fill']
    },
    {
      name: 'MunicipalityCreate',
      entityType: 'Municipality',
      icon: Building2,
      status: '⚠️ EXISTS - Basic',
      userPersona: 'Super Admin / Platform Administrator',
      actualFirstStep: 'Name EN/AR, Region dropdown, City Type, Population, Contact (single page with AI Enhance button)',
      firstStepPattern: 'info_first',
      firstStepContent: 'All fields in single page: Name EN/AR, Region, City Type, Population, MII Score, Contact',
      canInitiateFrom: ['Standalone admin only'],
      contextHandling: '✅ Has "AI Enhance" button - estimates MII score, suggests focus areas',
      uxNote: '✅ Appropriate for admin reference data - single page is fine',
      
      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name, region required'],
        entityLinking: true,
        linkableEntities: ['Region'],
        fileUpload: true,
        uploadTypes: ['Logo, images'],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI data enrichment from external sources', 'No demographic auto-fill']
    },
    {
      name: 'ChallengeProposalCreate',
      entityType: 'ChallengeProposal',
      icon: FileText,
      status: '🎉 COMPLETE',
      userPersona: 'Solution Provider / Startup',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Challenge → Provider Info → Proposal Details',
      canInitiateFrom: ['Challenge detail', 'Challenges list', 'Solution detail (express interest)'],
      contextHandling: '✅ Pre-fills challenge_id from URL params',

      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Challenge Selection', 'Provider Details', 'Technical Proposal'],
        aiAssistance: true,
        aiFeatures: ['AI proposal writer', 'Challenge alignment checker', 'Technical feasibility scorer'],
        bilingualSupport: true,
        bilingualApproach: 'Manual AR+EN',
        validation: true,
        validationFeatures: ['Challenge required', 'Solution approach required'],
        entityLinking: true,
        linkableEntities: ['Challenge', 'Solution'],
        fileUpload: true,
        uploadTypes: ['Proposal documents'],
        specialFeatures: ['✨ Challenge context display', '✨ Auto-alignment scoring']
      },
      completeness: 85,
      maturityScore: 80,
      gaps: ['Could add demo video upload']
    },
    {
      name: 'StrategicPlanCreate',
      entityType: 'StrategicPlan',
      icon: Target,
      status: '🎉 COMPLETE',
      userPersona: 'Municipality Strategic Planner / Admin',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Municipality → Plan Period → Strategic Objectives (StrategicPlanBuilder)',
      canInitiateFrom: ['Municipality context', 'StrategyCockpit'],
      contextHandling: '✅ Pre-fills municipality_id from context',

      features: {
        multiStep: true,
        stepCount: 4,
        steps: ['Municipality & Period', 'Strategic Objectives', 'KPIs & Targets', 'Review'],
        aiAssistance: true,
        aiFeatures: ['AI objective generator', 'KPI suggester', 'Alignment checker'],
        bilingualSupport: true,
        bilingualApproach: 'Full AR+EN',
        validation: true,
        validationFeatures: ['Municipality, period required'],
        entityLinking: true,
        linkableEntities: ['Municipality'],
        fileUpload: true,
        uploadTypes: ['Plan document'],
        specialFeatures: ['✨ Strategic objectives builder', '✨ KPI alignment tool']
      },
      completeness: 90,
      maturityScore: 85,
      gaps: ['Could add AI plan analyzer']
    },
    {
      name: 'ExpertProfileCreate',
      entityType: 'ExpertProfile',
      icon: Award,
      status: '🎉 COMPLETE',
      userPersona: 'Expert / Evaluator / Consultant',
      firstStepPattern: 'info_first',
      firstStepContent: 'Full Name, Title, Organization, Expertise Areas (ExpertOnboarding wizard)',
      canInitiateFrom: ['ExpertOnboarding page', 'Admin invitation'],
      contextHandling: 'N/A',

      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Basic Info', 'Expertise & Credentials', 'Availability'],
        aiAssistance: true,
        aiFeatures: ['AI credential verification', 'Expertise classifier', 'Bio generator'],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name, expertise required'],
        entityLinking: true,
        linkableEntities: ['Organization'],
        fileUpload: true,
        uploadTypes: ['CV, Certifications'],
        specialFeatures: ['✨ Credential verification AI', '✨ Expertise classification']
      },
      completeness: 85,
      maturityScore: 80,
      gaps: ['Could add AI bio writer']
    },
    {
      name: 'RoleCreate',
      entityType: 'Role',
      icon: Shield,
      status: '🎉 COMPLETE',
      userPersona: 'Super Admin / RBAC Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Role Name, Description, Permissions Selection (RolePermissionManager)',
      canInitiateFrom: ['RolePermissionManager'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form with permission matrix'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: false,
        bilingualApproach: 'English only (system)',
        validation: true,
        validationFeatures: ['Name required', 'At least one permission required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ Permission selector matrix', '✨ Role templates']
      },
      completeness: 80,
      maturityScore: 75,
      gaps: ['Could add AI permission recommender']
    },
    {
      name: 'TeamCreate',
      entityType: 'Team',
      icon: Users,
      status: '🎉 COMPLETE',
      userPersona: 'Admin / Team Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Team Name, Description, Members (TeamManagement page)',
      canInitiateFrom: ['TeamManagement'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form with member selector'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: false,
        bilingualApproach: 'English only',
        validation: true,
        validationFeatures: ['Name required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ Member multi-select', '✨ Permission inheritance']
      },
      completeness: 80,
      maturityScore: 75,
      gaps: []
    },
    {
      name: 'PilotSubmissionWizard',
      entityType: 'Pilot (workflow)',
      icon: Send,
      status: '🎉 COMPLETE',
      userPersona: 'Pilot Manager / Municipality',
      actualFirstStep: 'Readiness checklist (5 required checks) → Check all → Continue',
      firstStepPattern: 'context_first',
      firstStepContent: 'Pilot object passed as prop → Step 1: Checklist → Step 2: AI Brief → Step 3: Submit',
      canInitiateFrom: ['Pilot detail page (workflow trigger)'],
      contextHandling: '✅ Receives pilot object as prop - pure workflow wizard',
      uxStrength: '✅ EXCELLENT: Submission wizard for EXISTING pilots, not creation',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Pre-submission checklist', 'AI submission brief generator', 'Final notes & submit'],
        aiAssistance: true,
        aiFeatures: ['AI submission brief (exec summary, alignment, outcomes, risks, recommendation)'],
        bilingualSupport: true,
        bilingualApproach: 'Bilingual AI brief',
        validation: true,
        validationFeatures: ['Required checklist items must be checked'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ Readiness checklist', '✨ AI approver brief', '✨ Updates stage to approval_pending']
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'ChallengeSubmissionWizard',
      entityType: 'Challenge (workflow)',
      icon: Send,
      status: '🎉 COMPLETE',
      userPersona: 'Challenge Owner / Municipality',
      actualFirstStep: 'Readiness checklist (8 items) → 75% threshold → Continue',
      firstStepPattern: 'context_first',
      firstStepContent: 'Challenge object passed → Step 1: Checklist → Step 2: AI Brief → Step 3: Submit',
      canInitiateFrom: ['Challenge detail page (workflow)'],
      contextHandling: '✅ Receives challenge object as prop - workflow wizard',
      uxStrength: '✅ Readiness score + AI brief for reviewers',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Submission checklist (75% threshold)', 'AI submission brief', 'Final submission'],
        aiAssistance: true,
        aiFeatures: ['Bilingual AI brief (exec summary, highlights, complexity, review time estimate)'],
        bilingualSupport: true,
        bilingualApproach: 'Full bilingual AI outputs',
        validation: true,
        validationFeatures: ['75% checklist completion required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ Progress indicator', '✨ Readiness score', '✨ Updates status to submitted']
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'SolutionVerificationWizard',
      entityType: 'Solution (workflow)',
      icon: Shield,
      status: '🎉 COMPLETE',
      userPersona: 'Admin / Solution Verifier',
      actualFirstStep: '3-tab checklist: Documentation → Technical → Maturity (12 total checks)',
      firstStepPattern: 'context_first',
      firstStepContent: 'Solution object passed → 3-step verification → AI analysis → Verify',
      canInitiateFrom: ['Solution detail (admin action)', 'Verification queue'],
      contextHandling: '✅ Receives solution object as prop - admin verification workflow',
      uxStrength: '✅ Structured verification with AI recommendation',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Documentation checks', 'Technical review checks', 'Maturity validation + AI analysis'],
        aiAssistance: true,
        aiFeatures: ['AI verification recommendation (approve/conditional/reject)', 'Risk assessment', 'Condition suggester'],
        bilingualSupport: true,
        bilingualApproach: 'Interface bilingual',
        validation: true,
        validationFeatures: ['80% completion threshold'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ 3-category checklist', '✨ AI risk assessment', '✨ Auto-matchmaker enrollment on verification']
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'ProposalSubmissionWizard',
      entityType: 'RDProposal (workflow)',
      icon: Send,
      status: '🎉 COMPLETE',
      userPersona: 'Researcher / Academia',
      actualFirstStep: 'Readiness checklist (8 items) → Check all → Continue',
      firstStepPattern: 'context_first',
      firstStepContent: 'Proposal object passed → Step 1: Checklist → Step 2: AI Brief → Step 3: Submit',
      canInitiateFrom: ['RDProposal detail (workflow)'],
      contextHandling: '✅ Receives proposal object as prop - submission workflow',
      uxStrength: '✅ Comprehensive readiness check + AI brief for reviewers',
      
      features: {
        multiStep: true,
        stepCount: 3,
        steps: ['Readiness checklist', 'AI brief generation', 'Final confirmation'],
        aiAssistance: true,
        aiFeatures: ['AI submission brief (summary, strengths, concerns, recommendation)'],
        bilingualSupport: true,
        bilingualApproach: 'Bilingual interface',
        validation: true,
        validationFeatures: ['100% checklist required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['✨ Readiness score display', '✨ AI strengths/concerns analyzer']
      },
      completeness: 95,
      maturityScore: 90,
      gaps: []
    },
    {
      name: 'ProviderProposalWizard',
      entityType: 'ChallengeProposal',
      icon: FileText,
      status: '🟢 COMPLETE',
      userPersona: 'Solution Provider / Startup',
      actualFirstStep: 'Select Solution (my solutions) → Title, Approach, Timeline, Cost, Deliverables (single page)',
      firstStepPattern: 'context_first',
      firstStepContent: 'Challenge pre-filled from URL → Select my solution → Proposal details → Submit',
      canInitiateFrom: ['Challenge detail (express interest)', 'OpportunityFeed'],
      contextHandling: '✅ Pre-fills challenge_id from URL ?challenge_id param, shows challenge title',
      uxStrength: '✅ Simple, focused on provider\'s existing solutions',
      
      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single comprehensive form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual EN/AR',
        validation: true,
        validationFeatures: ['Solution, title, text required'],
        entityLinking: true,
        linkableEntities: ['Challenge', 'Solution'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: ['Filters to my solutions only', 'Success metrics builder', 'Team composition builder']
      },
      completeness: 75,
      maturityScore: 70,
      gaps: ['No AI proposal writer', 'Could add challenge-solution fit scorer']
    },
    {
      name: 'SectorCreate',
      entityType: 'Sector',
      icon: Target,
      status: '⚠️ Basic Form',
      userPersona: 'Super Admin / Taxonomy Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Name EN/AR, Code, Description (in TaxonomyBuilder)',
      canInitiateFrom: ['TaxonomyBuilder'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Inline form in TaxonomyBuilder'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name, code required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI description generator', 'No icon suggester']
    },
    {
      name: 'SubsectorCreate',
      entityType: 'Subsector',
      icon: Target,
      status: '⚠️ Basic Form',
      userPersona: 'Super Admin / Taxonomy Manager',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Sector → Subsector Name EN/AR, Code',
      canInitiateFrom: ['TaxonomyBuilder'],
      contextHandling: 'Pre-fills sector_id from parent selection',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Inline form in TaxonomyBuilder'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Sector, name required'],
        entityLinking: true,
        linkableEntities: ['Sector'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI description generator']
    },
    {
      name: 'ServiceCreate',
      entityType: 'Service',
      icon: FileText,
      status: '⚠️ Basic Form',
      userPersona: 'Admin / Service Catalog Manager',
      firstStepPattern: 'context_first',
      firstStepContent: 'Select Sector → Service Name EN/AR, Code, Category',
      canInitiateFrom: ['ServiceCatalog'],
      contextHandling: 'Pre-fills sector_id from parent selection',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form in ServiceCatalog'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name, code, sector required'],
        entityLinking: true,
        linkableEntities: ['Sector', 'Subsector'],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI service description generator', 'No SLA auto-suggester']
    },
    {
      name: 'KPIReferenceCreate',
      entityType: 'KPIReference',
      icon: Target,
      status: '⚠️ Basic',
      userPersona: 'Admin / KPI Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Code, Name EN/AR, Category, Unit, Calculation Method',
      canInitiateFrom: ['KPI library admin'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Code, name, category, unit required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI calculation method generator', 'No benchmark auto-fill']
    },
    {
      name: 'TagCreate',
      entityType: 'Tag',
      icon: Tags,
      status: '⚠️ Basic',
      userPersona: 'Admin / Taxonomy Manager',
      firstStepPattern: 'info_first',
      firstStepContent: 'Tag Name EN/AR, Type, Color',
      canInitiateFrom: ['Inline in various pages'],
      contextHandling: 'N/A',

      features: {
        multiStep: false,
        stepCount: 1,
        steps: ['Single form'],
        aiAssistance: false,
        aiFeatures: [],
        bilingualSupport: true,
        bilingualApproach: 'Manual',
        validation: true,
        validationFeatures: ['Name required'],
        entityLinking: false,
        linkableEntities: [],
        fileUpload: false,
        uploadTypes: [],
        specialFeatures: []
      },
      completeness: 40,
      maturityScore: 40,
      gaps: ['No AI tag suggester']
    }
  ];

  const patternMismatches = wizards.filter(w => {
    const recommended = getRecommendedPattern(w);
    return w.firstStepPattern !== recommended && w.uxIssue;
  });

  const filtered = wizards.filter(w => {
    if (filterBy === 'complete') return w.completeness === 100;
    if (filterBy === 'incomplete') return w.completeness < 100;
    if (filterBy === 'has_ai') return w.features.aiAssistance;
    if (filterBy === 'no_ai') return !w.features.aiAssistance;
    return true;
  });

  const stats = {
    total: wizards.length,
    complete: wizards.filter(w => w.completeness === 100).length,
    withAI: wizards.filter(w => w.features.aiAssistance).length,
    avgCompleteness: Math.round(wizards.reduce((sum, w) => sum + w.completeness, 0) / wizards.length),
    creationWizards: wizards.filter(w => !w.entityType.includes('workflow')).length,
    workflowWizards: wizards.filter(w => w.entityType.includes('workflow')).length,
    citizenWizards: wizards.filter(w => ['CitizenIdea', 'InnovationProposal'].includes(w.entityType)).length,
    needsEnhancement: wizards.filter(w => w.completeness < 100 || w.uxIssue).length,
    criticalIssues: wizards.filter(w => w.uxIssue?.includes('CRITICAL')).length,
    byPattern: {
      ai_first: wizards.filter(w => w.firstStepPattern === 'ai_first').length,
      context_first: wizards.filter(w => w.firstStepPattern === 'context_first').length,
      info_first: wizards.filter(w => w.firstStepPattern === 'info_first').length,
      simplified: wizards.filter(w => w.firstStepPattern === 'simplified').length
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: '🧙 Create Wizards Coverage - Complete Validation', ar: '🧙 تغطية معالجات الإنشاء - التحقق الكامل' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'Comprehensive validation of all wizards with actual implementation analysis and first-step patterns',
            ar: 'التحقق الشامل من جميع المعالجات مع تحليل التنفيذ الفعلي وأنماط الخطوة الأولى'
          })}
        </p>
        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
          <p className="text-sm font-semibold text-green-900 mb-1">
            {t({ en: '✅ 6 WIZARDS FULLY FIXED & ENHANCED!', ar: '✅ 6 معالجات تم إصلاحها وتحسينها بالكامل!' })}
          </p>
          <p className="text-xs text-slate-700">
            {t({ 
              en: 'ProgramIdeaSubmission, ChallengeIdeaResponse, ProgramApplicationWizard, SandboxCreate, KnowledgeDocumentCreate, CaseStudyCreate - All with AI-first/hybrid patterns, auto-save, bilingual support, and FileUploader integration.',
              ar: 'تقديم فكرة البرنامج، الرد على التحدي، معالج طلب البرنامج، إنشاء المنطقة، إنشاء وثيقة معرفية، إنشاء دراسة حالة - جميعها مع أنماط الذكاء أولاً/الهجين، الحفظ التلقائي، الدعم ثنائي اللغة، وتكامل FileUploader.'
            })}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <Button 
          size="sm" 
          variant={viewMode === 'cards' ? 'default' : 'outline'} 
          onClick={() => setViewMode('cards')}
        >
          {t({ en: 'Detailed View', ar: 'عرض تفصيلي' })}
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'firstSteps' ? 'default' : 'outline'} 
          onClick={() => setViewMode('firstSteps')}
        >
          {t({ en: 'First Steps Analysis', ar: 'تحليل الخطوات الأولى' })}
        </Button>
        <Button 
          size="sm" 
          variant={viewMode === 'criteria' ? 'default' : 'outline'} 
          onClick={() => setViewMode('criteria')}
        >
          {t({ en: 'Pattern Criteria', ar: 'معايير الأنماط' })}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Wizards', ar: 'إجمالي المعالجات' })}</p>
            <p className="text-xs text-slate-400 mt-1">{stats.creationWizards} create + {stats.workflowWizards} workflow</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.complete}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Complete (100%)', ar: 'مكتمل (100%)' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.withAI}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With AI', ar: 'مع ذكاء' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-100 to-white">
          <CardContent className="pt-4 text-center">
            <Zap className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.avgCompleteness}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Completeness', ar: 'الاكتمال المتوسط' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="pt-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-600">{stats.criticalIssues}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Critical UX Issues', ar: 'مشاكل UX حرجة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.needsEnhancement}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Need Enhancement', ar: 'تحتاج تحسين' })}</p>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'criteria' && (
        <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              {t({ en: '🎯 First Step Pattern Criteria & Distribution', ar: '🎯 معايير وتوزيع أنماط الخطوة الأولى' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(firstStepPatterns).map(([key, pattern]) => (
              <div key={key} className={`p-4 border-2 rounded-lg bg-${pattern.color}-50 border-${pattern.color}-200`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{pattern.name}</h3>
                  <Badge className={`bg-${pattern.color}-600`}>
                    {stats.byPattern[key]} wizards
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{pattern.description}</p>
                <p className="text-xs text-slate-600 mb-3">
                  <strong>{t({ en: 'When to use:', ar: 'متى تستخدم:' })}</strong> {pattern.criteria}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pattern.examples.map(ex => (
                    <Badge key={ex} variant="outline" className="text-xs">{ex}</Badge>
                  ))}
                </div>
              </div>
            ))}

            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl">
              <h4 className="font-bold mb-2">{t({ en: '💡 Key Design Principles', ar: '💡 المبادئ التصميمية الرئيسية' })}</h4>
              <div className="space-y-2 text-sm opacity-95">
                <p>
                  <strong>{t({ en: '1. Pattern Selection:', ar: '1. اختيار النمط:' })}</strong> {t({ 
                    en: 'Context-first when linking is mandatory, AI-first for complex/expert content, Info-first when users have data ready, Simplified for public.',
                    ar: 'السياق أولاً عند الربط الإلزامي، الذكاء أولاً للمحتوى المعقد، المعلومات أولاً عندما يكون لدى المستخدمين بيانات، المبسط للعام.'
                  })}
                </p>
                <p>
                  <strong>{t({ en: '2. Hybrid Approach (RECOMMENDED):', ar: '2. النهج الهجين (موصى به):' })}</strong> {t({ 
                    en: 'AI-first can include optional entity linking in Step 1 (see PolicyCreate). Info-first can add AI assist buttons per step (see ChallengeCreate).',
                    ar: 'الذكاء أولاً يمكن أن يشمل ربط كيانات اختياري في الخطوة 1. المعلومات أولاً يمكن إضافة أزرار مساعدة ذكية لكل خطوة.'
                  })}
                </p>
                <p>
                  <strong>{t({ en: '3. Context Handling:', ar: '3. معالجة السياق:' })}</strong> {t({ 
                    en: 'When initiated from parent entity (e.g., Challenge→Pilot), pre-fill context but do NOT force pattern change. URL params auto-fill silently.',
                    ar: 'عند البدء من كيان أب (مثل: تحدي→تجربة)، املأ السياق مسبقاً لكن لا تفرض تغيير النمط. معاملات URL تملأ تلقائياً بصمت.'
                  })}
                </p>
                <p>
                  <strong>{t({ en: '4. Field Order Priority:', ar: '4. أولوية ترتيب الحقول:' })}</strong> {t({ 
                    en: 'First field = highest-impact filter. Municipality/Org Type should come before dependent dropdowns. Required (*) fields before optional.',
                    ar: 'الحقل الأول = الفلتر الأعلى تأثيراً. البلدية/نوع الجهة قبل القوائم المنسدلة التابعة. الحقول المطلوبة (*) قبل الاختيارية.'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'firstSteps' && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>{t({ en: '🔍 First Step Comparative Analysis', ar: '🔍 تحليل مقارن للخطوات الأولى' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="p-3 text-left">{t({ en: 'Wizard', ar: 'المعالج' })}</th>
                    <th className="p-3 text-left">{t({ en: 'User Persona', ar: 'شخصية المستخدم' })}</th>
                    <th className="p-3 text-left">{t({ en: 'Pattern', ar: 'النمط' })}</th>
                    <th className="p-3 text-left">{t({ en: 'First Step Content', ar: 'محتوى الخطوة الأولى' })}</th>
                    <th className="p-3 text-left">{t({ en: 'Can Initiate From', ar: 'يمكن البدء من' })}</th>
                    <th className="p-3 text-left">{t({ en: 'Issues', ar: 'مشاكل' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {wizards.map((wizard, idx) => (
                    <tr key={idx} className="border-b hover:bg-blue-50">
                      <td className="p-3">
                        <div className="font-medium">{wizard.name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{wizard.entityType}</Badge>
                      </td>
                      <td className="p-3 text-xs">{wizard.userPersona}</td>
                      <td className="p-3">
                        <Badge className={
                          wizard.firstStepPattern === 'ai_first' ? 'bg-purple-600' :
                          wizard.firstStepPattern === 'context_first' ? 'bg-blue-600' :
                          wizard.firstStepPattern === 'info_first' ? 'bg-green-600' :
                          'bg-teal-600'
                        }>
                          {wizard.firstStepPattern?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs max-w-md">{wizard.firstStepContent}</td>
                      <td className="p-3 text-xs">
                        <div className="space-y-1">
                          {wizard.canInitiateFrom?.map((source, i) => (
                            <div key={i} className="text-xs text-slate-600">• {source}</div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {wizard.uxIssue && (
                          <Badge variant="outline" className="text-xs bg-amber-50 border-amber-400">
                            {wizard.uxIssue}
                          </Badge>
                        )}
                        {wizard.uxOpportunity && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-400">
                            {wizard.uxOpportunity}
                          </Badge>
                        )}
                        {wizard.mandatoryGate && (
                          <Badge variant="outline" className="text-xs bg-purple-50 border-purple-400">
                            {wizard.mandatoryGate}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'cards' && (
        <>
      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant={filterBy === 'all' ? 'default' : 'outline'} onClick={() => setFilterBy('all')}>
              {t({ en: 'All', ar: 'الكل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'complete' ? 'default' : 'outline'} onClick={() => setFilterBy('complete')}>
              {t({ en: 'Complete', ar: 'مكتمل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'incomplete' ? 'default' : 'outline'} onClick={() => setFilterBy('incomplete')}>
              {t({ en: 'Incomplete', ar: 'غير مكتمل' })}
            </Button>
            <Button size="sm" variant={filterBy === 'has_ai' ? 'default' : 'outline'} onClick={() => setFilterBy('has_ai')}>
              {t({ en: 'Has AI', ar: 'مع ذكاء' })}
            </Button>
            <Button size="sm" variant={filterBy === 'no_ai' ? 'default' : 'outline'} onClick={() => setFilterBy('no_ai')}>
              {t({ en: 'No AI', ar: 'بدون ذكاء' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {patternMismatches.length > 0 && (
        <Card className="border-2 border-amber-400 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5" />
              {t({ en: '⚠️ UX Issues & Opportunities Detected', ar: '⚠️ تم اكتشاف مشاكل وفرص UX' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {patternMismatches.map((w, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-amber-200">
                <div className="font-medium text-amber-900 mb-1">{w.name}</div>
                <p className="text-sm text-slate-700">{w.uxIssue || w.uxOpportunity}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filtered.map((wizard, idx) => {
          const Icon = wizard.icon;
          const patternInfo = firstStepPatterns[wizard.firstStepPattern];
          
          return (
            <Card key={idx} className="border-2 hover:shadow-lg transition-shadow" style={{
              borderLeftColor: wizard.completeness === 100 ? '#10b981' : 
                              wizard.completeness >= 60 ? '#f59e0b' : '#ef4444',
              borderLeftWidth: '6px'
            }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        {wizard.name}
                        <Badge variant="outline">{wizard.entityType}</Badge>
                        {patternInfo && (
                          <Badge className={`bg-${patternInfo.color}-600 text-xs`}>
                            {wizard.firstStepPattern?.replace('_', ' ')}
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{wizard.status}</p>
                      {wizard.userPersona && (
                        <p className="text-xs text-slate-500 mt-1">
                          👤 {wizard.userPersona}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold" style={{
                      color: wizard.completeness === 100 ? '#10b981' :
                             wizard.completeness >= 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      {wizard.completeness}%
                    </div>
                    <p className="text-xs text-slate-500">Completeness</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        {t({ en: '🚀 First Step:', ar: '🚀 الخطوة الأولى:' })}
                      </p>
                      <p className="text-sm text-slate-700">{wizard.firstStepContent}</p>
                    </div>
                    {patternInfo && (
                      <Badge className={`bg-${patternInfo.color}-600 text-xs`}>
                        {patternInfo.name}
                      </Badge>
                    )}
                  </div>
                  {wizard.canInitiateFrom && wizard.canInitiateFrom.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-slate-600 mb-1">
                        {t({ en: 'Can be initiated from:', ar: 'يمكن البدء من:' })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {wizard.canInitiateFrom.map((source, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{source}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {wizard.contextHandling && (
                    <p className="text-xs text-blue-700 mt-2">
                      📋 {wizard.contextHandling}
                    </p>
                  )}
                  {wizard.uxIssue && (
                    <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-xs text-amber-900">
                      {wizard.uxIssue}
                    </div>
                  )}
                  {wizard.uxOpportunity && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-900">
                      {wizard.uxOpportunity}
                    </div>
                  )}
                  {wizard.mandatoryGate && (
                    <div className="mt-2 p-2 bg-purple-100 border border-purple-300 rounded text-xs text-purple-900">
                      {wizard.mandatoryGate}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Multi-Step', ar: 'متعدد الخطوات' })}</p>
                    {wizard.features.multiStep ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-bold">{wizard.features.stepCount} steps</span>
                      </div>
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'AI Assistance', ar: 'مساعدة ذكية' })}</p>
                    {wizard.features.aiAssistance ? (
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Bilingual', ar: 'ثنائي اللغة' })}</p>
                    {wizard.features.bilingualSupport ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-slate-600 mb-1">{t({ en: 'Validation', ar: 'تحقق' })}</p>
                    {wizard.features.validation ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>

                {wizard.features.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {t({ en: '📋 Wizard Steps:', ar: '📋 خطوات المعالج:' })}
                    </p>
                    <div className="space-y-1">
                      {wizard.features.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-slate-700">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {wizard.features.aiFeatures.length > 0 && (
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-xs font-semibold text-purple-900 mb-2">
                      {t({ en: '✨ AI Features:', ar: '✨ الميزات الذكية:' })}
                    </p>
                    <ul className="space-y-1">
                      {wizard.features.aiFeatures.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                          <Sparkles className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {wizard.features.specialFeatures.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      {t({ en: '🎯 Special Features:', ar: '🎯 ميزات خاصة:' })}
                    </p>
                    <ul className="space-y-1">
                      {wizard.features.specialFeatures.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-700">{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {wizard.gaps.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs font-semibold text-red-900 mb-2">
                      {t({ en: '⚠️ Gaps:', ar: '⚠️ فجوات:' })}
                    </p>
                    <ul className="space-y-1">
                      {wizard.gaps.map((gap, i) => (
                        <li key={i} className="text-xs text-red-700">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link to={createPageUrl(wizard.name)}>
                  <Button size="sm" variant="outline" className="w-full">
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {t({ en: 'Open Wizard', ar: 'فتح المعالج' })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {t({ en: '✅ Achievement Summary', ar: '✅ ملخص الإنجاز' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl border-4 border-green-400 shadow-xl">
            <div className="flex items-center gap-4">
              <Award className="h-12 w-12" />
              <div>
                <p className="font-bold text-2xl mb-1">
                  🎉 {t({ en: '6 WIZARDS FULLY ENHANCED!', ar: '6 معالجات تم تحسينها بالكامل!' })}
                </p>
                <p className="text-lg opacity-95">
                  {t({ en: 'ProgramIdeaSubmission, ChallengeIdeaResponse, ProgramApplicationWizard, SandboxCreate, KnowledgeDocumentCreate, CaseStudyCreate',
                       ar: 'تقديم فكرة البرنامج، الرد على التحدي، معالج طلب البرنامج، إنشاء المنطقة، إنشاء وثيقة معرفية، إنشاء دراسة حالة' })}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3 text-sm opacity-95">
                  <div className="p-2 bg-white/20 rounded">
                    <strong>{t({ en: '✅ AI-First/Hybrid Patterns', ar: '✅ أنماط الذكاء أولاً/الهجين' })}</strong>
                    <p className="text-xs opacity-90 mt-1">
                      {t({ en: 'All wizards now use AI generation with context handling',
                           ar: 'جميع المعالجات تستخدم الآن توليد الذكاء مع معالجة السياق' })}
                    </p>
                  </div>
                  <div className="p-2 bg-white/20 rounded">
                    <strong>{t({ en: '✅ Auto-Save + Draft Recovery', ar: '✅ الحفظ التلقائي + استعادة المسودة' })}</strong>
                    <p className="text-xs opacity-90 mt-1">
                      {t({ en: 'All major wizards have 30s auto-save + draft recovery',
                           ar: 'جميع المعالجات الرئيسية لديها حفظ تلقائي كل 30 ثانية + استعادة المسودة' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-100 rounded-lg">
            <p className="font-semibold text-green-900 mb-2">
              🎉 {t({ en: 'Recently Fixed Wizards:', ar: 'المعالجات المصلحة مؤخراً:' })}
            </p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>✓ <strong>ProgramIdeaSubmission:</strong> Auto-skip + AI writer + translation buttons + auto-save</li>
              <li>✓ <strong>ChallengeIdeaResponse:</strong> Visual challenge cards + AI fit scoring + bilingual AI</li>
              <li>✓ <strong>ProgramApplicationWizard:</strong> Visual program cards + AI writer + progress tracking</li>
              <li>✓ <strong>SandboxCreate:</strong> AI generator + nested bilingual objects (regulatory + safety) + FileUploader</li>
              <li>✓ <strong>KnowledgeDocumentCreate:</strong> AI content generator + auto-tagging + categorization</li>
              <li>✓ <strong>CaseStudyCreate:</strong> AI story generator + impact calculator + entity linking + FileUploader</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">
              🎯 {t({ en: 'Remaining Enhancement Opportunities:', ar: 'فرص التحسين المتبقية:' })}
            </p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Badge className="bg-blue-600 text-xs">Medium</Badge>
                <span><strong>ProviderProposalWizard:</strong> Add AI proposal writer (currently manual)</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-teal-600 text-xs">Low</Badge>
                <span><strong>Admin Reference Forms:</strong> Region/City/Sector/Service - Add AI geo-enrichment</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-teal-600 text-xs">Low</Badge>
                <span><strong>ExpertProfileCreate:</strong> Add AI bio writer</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge className="bg-teal-600 text-xs">Low</Badge>
                <span><strong>RoleCreate:</strong> Add AI permission recommender based on role description</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">
              📊 {t({ en: 'Pattern Distribution Analysis', ar: 'تحليل توزيع الأنماط' })}
            </p>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="text-center p-2 bg-purple-100 rounded">
                <div className="text-2xl font-bold text-purple-900">{stats.byPattern.ai_first}</div>
                <div className="text-purple-700">AI-First</div>
              </div>
              <div className="text-center p-2 bg-blue-100 rounded">
                <div className="text-2xl font-bold text-blue-900">{stats.byPattern.context_first}</div>
                <div className="text-blue-700">Context-First</div>
              </div>
              <div className="text-center p-2 bg-green-100 rounded">
                <div className="text-2xl font-bold text-green-900">{stats.byPattern.info_first}</div>
                <div className="text-green-700">Info-First</div>
              </div>
              <div className="text-center p-2 bg-teal-100 rounded">
                <div className="text-2xl font-bold text-teal-900">{stats.byPattern.simplified}</div>
                <div className="text-teal-700">Simplified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}

export default ProtectedPage(CreateWizardsCoverageReport, { requireAdmin: true });
