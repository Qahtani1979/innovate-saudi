import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, CheckCircle2, Circle, Clock, Code, Database, 
  FileText, Layers, Sparkles, Target, Users, Zap, AlertCircle,
  Shield, Activity, TrendingUp, Edit, Eye, ArrowRight, Brain,
  ChevronDown, ChevronRight
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function ProgramGapsImplementationPlan() {
  const { language, isRTL, t } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState({ 0: true });

  const togglePhase = (idx) => {
    setExpandedPhases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const implementationPlan = {
    overview: {
      entity: 'Program',
      currentCompleteness: 15,
      targetCompleteness: 100,
      totalGaps: 35,
      criticalGaps: 15,
      estimatedEffort: '5-6 days',
      priority: 'HIGH',
      
      currentState: {
        strengths: [
          '✅ 13 tabs in ProgramDetail (rich content structure)',
          '✅ Expert mentor integration via ExpertAssignment',
          '✅ AI insights button (bilingual strategic analysis)',
          '✅ PolicyTabWidget integrated',
          '✅ Discussion tab with comments',
          '✅ AI enhancement in ProgramEdit',
          '✅ AI enhancement in ProgramCreate',
          '✅ Modal workflow components (7 exist: Launch, Screening, Selection, Sessions, MentorMatching, Completion, MidReview)',
          '✅ ProgramApplication gates COMPLETE (100% - separate entity)'
        ],
        
        criticalWeaknesses: [
          '🚨 NO workflow_stage field (uses status only)',
          '🚨 NO gates in ApprovalGateConfig (only program_application has gates)',
          '🚨 NOT in ApprovalCenter (only ProgramApplication is)',
          '🚨 NO UnifiedWorkflowApprovalTab in ProgramDetail',
          '🚨 NO ProgramActivityLog component',
          '🚨 NO auto-save in ProgramEdit',
          '🚨 NO versioning, change tracking, preview in ProgramEdit',
          '🚨 ProgramCreate is single form, NOT wizard',
          '🚨 NO conversion paths (Program→Solution, Program→Pilot)',
          '🚨 NO SLA tracking for program workflows',
          '🚨 NO ApprovalRequest entity integration',
          '🚨 Modal components NOT integrated into gate system'
        ]
      },
      
      referenceStandards: [
        'Challenge entity (100% complete - 4 gates, UnifiedWorkflowApprovalTab, ActivityLog, Enhanced Edit)',
        'Pilot entity (100% complete - 4 gates, auto-save, versioning, conversions)',
        'Solution entity (100% complete - 4 gates, verification workflow, reviews)',
        'PolicyRecommendation (100% complete - 4 gates, legal review, public consultation)',
        'ProgramApplication (85% complete - 2 gates in ApprovalGateConfig, InlineApproval)'
      ]
    },

    phases: [
      {
        phase: 1,
        name: 'Foundation: Workflow Infrastructure',
        duration: '1 day',
        priority: 'CRITICAL',
        status: 'not_started',
        
        deliverables: [
          {
            name: 'Add workflow_stage field to Program entity',
            type: 'entity',
            file: 'entities/Program.json',
            effort: '30min',
            priority: 'critical',
            
            details: {
              currentField: 'status (6 values: planning, applications_open, selection, active, completed, cancelled)',
              newField: 'workflow_stage (8 values: draft, design_approval_pending, approved, applications_open, selection, active, evaluation_pending, completed)',
              reasoning: 'Separate workflow stages from business status to enable gate-based approvals',
              migration: 'Map existing status to workflow_stage during deployment'
            },
            
            implementationSteps: [
              '1. Add workflow_stage field to Program entity schema',
              '2. Set default to "draft"',
              '3. Keep status field for backward compatibility',
              '4. Update all Program queries to use workflow_stage',
              '5. Add data migration in ProgramDetail to set workflow_stage = status for existing records'
            ]
          },
          
          {
            name: 'Create Program gates in ApprovalGateConfig',
            type: 'config',
            file: 'components/approval/ApprovalGateConfig.js',
            effort: '3h',
            priority: 'critical',
            
            details: {
              gateCount: 2,
              gates: [
                {
                  id: 'program.launch_approval',
                  name: 'Program Launch Approval',
                  type: 'approval',
                  requiredRole: 'program_approver',
                  slaDays: 5,
                  
                  selfCheckItems: [
                    'Program design document complete (objectives, outcomes, timeline)',
                    'Curriculum validated and finalized',
                    'Mentor pool confirmed (minimum 3 mentors assigned)',
                    'Budget approved and allocated',
                    'Partner agreements signed (if applicable)',
                    'Marketing materials ready',
                    'Application form configured',
                    'Selection criteria defined'
                  ],
                  
                  reviewerChecklist: [
                    'Program aligns with strategic priorities',
                    'Curriculum quality meets standards',
                    'Mentor pool adequate for cohort size',
                    'Budget allocation reasonable and justified',
                    'Target participant numbers realistic',
                    'Timeline feasible for planned activities',
                    'Partnership agreements validated',
                    'Risk mitigation plan adequate'
                  ],
                  
                  requesterAI: {
                    prompt: 'Analyze program launch readiness...',
                    features: ['Design completeness check', 'Resource gap identification', 'Timeline feasibility analysis']
                  },
                  
                  reviewerAI: {
                    prompt: 'Evaluate program for approval...',
                    features: ['Strategic alignment scorer', 'Budget reasonableness check', 'Success probability predictor']
                  }
                },
                
                {
                  id: 'program.completion_evaluation',
                  name: 'Program Completion Evaluation',
                  type: 'review',
                  requiredRole: 'program_evaluator',
                  slaDays: 7,
                  
                  selfCheckItems: [
                    'All planned sessions completed',
                    'Graduation criteria applied to all participants',
                    'Success metrics calculated (completion rate, outcomes)',
                    'Alumni survey conducted and analyzed',
                    'Financial reconciliation complete',
                    'Lessons learned documented',
                    'Impact report prepared',
                    'Media/communications materials finalized'
                  ],
                  
                  reviewerChecklist: [
                    'Target outcomes achieved (compare planned vs actual)',
                    'Graduation rate meets minimum threshold (>70%)',
                    'Participant feedback positive (avg >4.0/5)',
                    'Budget variance within acceptable range (±10%)',
                    'Impact metrics validated and credible',
                    'Lessons learned comprehensive and actionable',
                    'Recommendations for future cohorts clear',
                    'Alumni network activation plan defined'
                  ],
                  
                  requesterAI: {
                    prompt: 'Generate program completion analysis...',
                    features: ['Outcomes vs targets comparison', 'Success factors identification', 'Improvement recommendations']
                  },
                  
                  reviewerAI: {
                    prompt: 'Evaluate program completion and impact...',
                    features: ['Impact scorer', 'ROI calculator', 'Benchmark comparator']
                  }
                }
              ]
            },
            
            implementationSteps: [
              '1. Add APPROVAL_GATE_CONFIGS.program to ApprovalGateConfig.js',
              '2. Define 2 gates: launch_approval + completion_evaluation',
              '3. Add 8+ self-check items per gate',
              '4. Add 8+ reviewer checklist items per gate',
              '5. Define RequesterAI and ReviewerAI prompts',
              '6. Export getGateConfig to support "program" entity type'
            ]
          },
          
          {
            name: 'Add Program to ApprovalCenter',
            type: 'page',
            file: 'pages/ApprovalCenter.js',
            effort: '2h',
            priority: 'critical',
            
            details: {
              integration: 'full_inline',
              approvalTypes: ['program_launch_approval', 'program_completion_evaluation'],
              queryPattern: 'Filter by workflow_stage and fetch pending approvals',
              inlineComponent: 'InlineApprovalWizard',
              
              currentState: 'ApprovalCenter has 7 entity types. Program NOT included (only ProgramApplication).',
              
              changes: [
                'Add programLaunchApprovals query (workflow_stage = "design_approval_pending")',
                'Add programCompletionApprovals query (workflow_stage = "evaluation_pending")',
                'Add summary card for Program approvals',
                'Add "Programs" tab in ApprovalCenter',
                'Integrate InlineApprovalWizard for both gate types',
                'Update stats and counters'
              ]
            },
            
            implementationSteps: [
              '1. Add useQuery for pending program launch approvals',
              '2. Add useQuery for pending program completion evaluations',
              '3. Add Programs summary card to dashboard',
              '4. Add Programs tab to TabsList',
              '5. Add TabsContent with InlineApprovalWizard integration',
              '6. Update summary stats to include program approvals',
              '7. Test approval workflow end-to-end'
            ]
          },
          
          {
            name: 'Create ProgramActivityLog component',
            type: 'component',
            file: 'components/programs/ProgramActivityLog.jsx',
            effort: '2h',
            priority: 'critical',
            
            referenceFiles: [
              'components/challenges/ChallengeActivityLog.jsx',
              'components/pilots/PilotActivityLog.jsx',
              'components/solutions/SolutionActivityLog.jsx'
            ],
            
            features: [
              'Merge SystemActivity + ProgramComment + ApprovalRequest',
              'Timeline view with date grouping',
              'Visual icons by activity type',
              'Metadata display (user, timestamp, details)',
              'Expandable details for complex activities',
              'Filter by activity type',
              'Export activity log'
            ],
            
            implementationSteps: [
              '1. Create components/programs/ProgramActivityLog.jsx',
              '2. Fetch 3 data sources: SystemActivity, ProgramComment, ApprovalRequest',
              '3. Merge and sort by timestamp descending',
              '4. Group by date',
              '5. Render timeline with visual indicators',
              '6. Add filtering UI',
              '7. Test with real program data'
            ]
          },
          
          {
            name: 'Add UnifiedWorkflowApprovalTab to ProgramDetail',
            type: 'page',
            file: 'pages/ProgramDetail.js',
            effort: '1h',
            priority: 'critical',
            
            details: {
              tabName: 'Workflow & Approvals',
              position: 'First tab (before Overview)',
              component: 'UnifiedWorkflowApprovalTab',
              entityType: 'program',
              
              currentTabs: 13,
              newTabs: 14,
              
              integration: [
                'Import UnifiedWorkflowApprovalTab',
                'Add as first TabsTrigger',
                'Pass program, entityType="program", onUpdate callback',
                'Conditionally show based on permissions (program_approve or program_view_all)'
              ]
            },
            
            implementationSteps: [
              '1. Import UnifiedWorkflowApprovalTab',
              '2. Add "Workflow & Approvals" as first tab',
              '3. Pass program data + entityType="program"',
              '4. Add permission check: hasPermission("program_approve") || hasPermission("program_view_all")',
              '5. Test gate display and approval flow',
              '6. Verify RequesterAI and ReviewerAI work correctly'
            ]
          }
        ],
        
        validation: [
          'Program entity has workflow_stage field',
          'ApprovalGateConfig exports program gates',
          'ApprovalCenter shows program approvals',
          'ProgramDetail has Workflow tab as first tab',
          'ProgramActivityLog displays merged timeline',
          'Can approve program launch from ApprovalCenter',
          'Can complete program evaluation from ApprovalCenter'
        ]
      },
      
      {
        phase: 2,
        name: 'Enhanced Editing: Auto-Save & Versioning',
        duration: '1 day',
        priority: 'HIGH',
        status: 'not_started',
        dependencies: ['Phase 1 complete'],
        
        deliverables: [
          {
            name: 'Add auto-save to ProgramEdit',
            type: 'page',
            file: 'pages/ProgramEdit.js',
            effort: '3h',
            priority: 'high',
            
            referenceFiles: [
              'pages/ChallengeEdit.js (lines 41-68: auto-save implementation)',
              'pages/PilotEdit.js (lines 45-72: auto-save with recovery)',
              'pages/SolutionEdit.js (lines 38-65: auto-save pattern)'
            ],
            
            features: [
              'Auto-save every 30 seconds to localStorage',
              '24-hour draft recovery on page reload',
              'Unsaved changes warning on navigation',
              'Visual save indicator (saving... / saved)',
              'Manual save button override',
              'Clear draft after successful save'
            ],
            
            implementationSteps: [
              '1. Add useState for tracking changes and last save time',
              '2. Add useEffect with 30s interval for auto-save to localStorage',
              '3. Add useEffect on mount to recover draft from localStorage',
              '4. Add beforeunload event listener for unsaved changes warning',
              '5. Add visual save status indicator in header',
              '6. Clear localStorage after successful mutation',
              '7. Test recovery flow (reload page mid-edit)'
            ]
          },
          
          {
            name: 'Add version history to ProgramEdit',
            type: 'page',
            file: 'pages/ProgramEdit.js',
            effort: '2h',
            priority: 'high',
            
            details: {
              versionFields: ['version_number', 'previous_version_id'],
              behavior: 'Increment version_number on each save, set previous_version_id to current ID',
              
              implementation: [
                'On save, increment version_number',
                'Create SystemActivity record with version change',
                'Display version number in header',
                'Link to version history view (future enhancement)'
              ]
            },
            
            implementationSteps: [
              '1. Add version_number increment logic in mutation',
              '2. Set previous_version_id = program.id',
              '3. Create SystemActivity record with version metadata',
              '4. Display version badge in header',
              '5. Test version tracking across multiple edits'
            ]
          },
          
          {
            name: 'Add change tracking to ProgramEdit',
            type: 'page',
            file: 'pages/ProgramEdit.js',
            effort: '2h',
            priority: 'high',
            
            referenceFiles: [
              'pages/ChallengeEdit.js (lines 69-92: change tracking)',
              'pages/PilotEdit.js (lines 73-96: field-level tracking)'
            ],
            
            features: [
              'Track which fields were modified',
              'Display change counter badge',
              'Show change summary before save',
              'Field-level diff visualization',
              'Reset tracking after save'
            ],
            
            implementationSteps: [
              '1. Add useState([]) for changedFields array',
              '2. Track field changes in onChange handlers',
              '3. Calculate diff between formData and originalData',
              '4. Display change counter badge in header',
              '5. Show change summary panel in sidebar',
              '6. Reset changedFields after successful save',
              '7. Test with various field changes'
            ]
          },
          
          {
            name: 'Add preview mode to ProgramEdit',
            type: 'page',
            file: 'pages/ProgramEdit.js',
            effort: '1.5h',
            priority: 'medium',
            
            details: {
              toggle: 'Edit Mode / Preview Mode button in header',
              previewComponent: 'Render read-only formatted version of form data',
              styling: 'Match detail page layout for consistency'
            },
            
            implementationSteps: [
              '1. Add useState(false) for preview mode',
              '2. Add toggle button in header',
              '3. Conditionally render form vs preview based on mode',
              '4. Style preview to match ProgramDetail overview',
              '5. Test toggle between modes without losing changes'
            ]
          }
        ],
        
        validation: [
          'ProgramEdit auto-saves every 30s',
          'Draft recovers on page reload within 24h',
          'Version number increments on each save',
          'Changed fields tracked and displayed',
          'Preview mode shows formatted content',
          'Unsaved changes warning appears on navigation'
        ]
      },
      
      {
        phase: 3,
        name: 'Creation Wizard: Multi-Step Program Creator',
        duration: '1 day',
        priority: 'HIGH',
        status: 'not_started',
        dependencies: ['Phase 1 complete'],
        
        deliverables: [
          {
            name: 'Convert ProgramCreate to multi-step wizard',
            type: 'page',
            file: 'pages/ProgramCreate.js',
            effort: '4h',
            priority: 'high',
            
            referenceFiles: [
              'components/solutions/SolutionCreateWizard.jsx (6-step wizard)',
              'pages/ChallengeCreate.js (wizard pattern)'
            ],
            
            wizardSteps: [
              {
                step: 1,
                name: 'Basic Info & Type',
                fields: ['name_ar', 'name_en', 'tagline_ar', 'tagline_en', 'program_type', 'focus_areas'],
                aiFeature: 'AI enhancement for names and taglines (existing)',
                validation: 'Name and type required'
              },
              {
                step: 2,
                name: 'Objectives & Outcomes',
                fields: ['objectives_ar', 'objectives_en', 'description_ar', 'description_en', 'target_participants'],
                aiFeature: 'AI objectives generator from challenges',
                validation: 'Objectives required'
              },
              {
                step: 3,
                name: 'Curriculum & Timeline',
                fields: ['duration_weeks', 'timeline', 'curriculum'],
                aiFeature: 'NEW: AICurriculumGenerator integration (component EXISTS, not integrated)',
                validation: 'Duration required, timeline dates validated'
              },
              {
                step: 4,
                name: 'Funding & Resources',
                fields: ['funding_available', 'funding_details', 'benefits'],
                aiFeature: 'AI funding recommender based on program type',
                validation: 'If funding_available=true, funding_details required'
              },
              {
                step: 5,
                name: 'Eligibility & Selection',
                fields: ['eligibility_criteria', 'target_participants.min/max'],
                aiFeature: 'AI eligibility criteria suggester',
                validation: 'Eligibility criteria required'
              },
              {
                step: 6,
                name: 'Media & Launch',
                fields: ['image_url', 'video_url', 'brochure_url', 'application_url', 'contact_email'],
                aiFeature: 'None',
                validation: 'Contact email required, valid URL formats'
              }
            ],
            
            implementationSteps: [
              '1. Create multi-step wizard layout with progress indicator',
              '2. Split form into 6 logical steps',
              '3. Add step validation before proceeding',
              '4. Integrate AICurriculumGenerator in step 3',
              '5. Add AI objectives generator in step 2',
              '6. Add AI funding recommender in step 4',
              '7. Add AI eligibility suggester in step 5',
              '8. Add step-level draft saving',
              '9. Test complete wizard flow',
              '10. Add "Save as Draft" button on each step'
            ]
          },
          
          {
            name: 'Integrate AICurriculumGenerator',
            type: 'component',
            file: 'components/programs/AICurriculumGenerator.jsx',
            effort: '1h',
            priority: 'high',
            
            details: {
              currentState: 'Component EXISTS but NOT used in ProgramCreate',
              integration: 'Add to step 3 of wizard',
              
              functionality: [
                'Generate curriculum based on duration_weeks and objectives',
                'AI suggests week-by-week topics and activities',
                'Editable generated curriculum',
                'Save to program.curriculum array'
              ]
            },
            
            implementationSteps: [
              '1. Import AICurriculumGenerator in ProgramCreate',
              '2. Add to step 3 (Curriculum & Timeline)',
              '3. Pass duration_weeks and objectives_en as inputs',
              '4. Handle generated curriculum and update formData',
              '5. Allow manual editing of AI-generated curriculum',
              '6. Test AI generation quality'
            ]
          }
        ],
        
        validation: [
          'ProgramCreate is 6-step wizard',
          'AICurriculumGenerator integrated in step 3',
          'AI features work on each applicable step',
          'Draft saving works per step',
          'Validation prevents proceeding with incomplete steps',
          'Final submission creates program successfully'
        ]
      },
      
      {
        phase: 4,
        name: 'Detail Page Enhancement: Workflow Tab & Activity Log',
        duration: '0.5 day',
        priority: 'HIGH',
        status: 'not_started',
        dependencies: ['Phase 1 complete'],
        
        deliverables: [
          {
            name: 'Integrate UnifiedWorkflowApprovalTab in ProgramDetail',
            type: 'page',
            file: 'pages/ProgramDetail.js',
            effort: '30min',
            priority: 'critical',
            
            details: {
              currentTabs: 13,
              newTabs: 15,
              tabOrder: 'Add Workflow & Approvals and Activity Log as first two tabs, before existing 13 tabs',
              
              implementation: 'Import UnifiedWorkflowApprovalTab, add as first tab, pass program + entityType="program"'
            },
            
            implementationSteps: [
              '1. Import UnifiedWorkflowApprovalTab from components/approval',
              '2. Add "Workflow & Approvals" TabsTrigger as first tab',
              '3. Add TabsContent with UnifiedWorkflowApprovalTab',
              '4. Pass: entity={program}, entityType="program", onUpdate={refetch}',
              '5. Add permission check: hasPermission("program_approve") || hasPermission("program_view_all")',
              '6. Test gate display and self-check functionality'
            ]
          },
          
          {
            name: 'Integrate ProgramActivityLog in ProgramDetail',
            type: 'page',
            file: 'pages/ProgramDetail.js',
            effort: '30min',
            priority: 'critical',
            
            details: {
              tabName: 'Activity Log',
              position: 'Second tab (after Workflow)',
              component: 'ProgramActivityLog',
              
              dataSources: [
                'SystemActivity (entity_type="Program", entity_id=program.id)',
                'ProgramComment (program_id=program.id)',
                'ApprovalRequest (entity_type="program", entity_id=program.id)'
              ]
            },
            
            implementationSteps: [
              '1. Import ProgramActivityLog',
              '2. Add "Activity Log" TabsTrigger as second tab',
              '3. Add TabsContent with <ProgramActivityLog programId={program.id} />',
              '4. Test activity log displays merged timeline',
              '5. Verify all activity types render correctly'
            ]
          }
        ],
        
        validation: [
          'ProgramDetail has 15 tabs total',
          'Workflow & Approvals tab appears first',
          'Activity Log tab appears second',
          'UnifiedWorkflowApprovalTab displays 2 gates',
          'Activity log shows merged timeline',
          'Gate approvals appear in activity log'
        ]
      },
      
      {
        phase: 5,
        name: 'Conversion Workflows: Program Closure Paths',
        duration: '1 day',
        priority: 'MEDIUM',
        status: 'not_started',
        dependencies: ['Phase 1-4 complete'],
        
        background: {
          problem: 'Programs complete but have no output paths. Alumni network inactive. Learning not captured.',
          solution: 'Create conversion workflows to transform program outputs into actionable outcomes',
          
          conversionTypes: [
            'Program → Solution (alumni startup launches solution)',
            'Program → Pilot (program cohort proposes pilot to municipality)',
            'Program → Knowledge (lessons learned, best practices)',
            'Program → NextCohort (iterate and improve for next cohort)'
          ]
        },
        
        deliverables: [
          {
            name: 'ProgramToSolutionConverter',
            type: 'component',
            file: 'components/programs/ProgramToSolutionConverter.jsx',
            effort: '3h',
            priority: 'medium',
            
            referenceFiles: [
              'components/pilots/PilotToRDWorkflow.jsx',
              'components/rd/RDToSolutionConverter.jsx'
            ],
            
            workflow: {
              trigger: 'Program completed, alumni ready to launch solution',
              
              autoPopulatedFields: [
                'provider_name (from participant startup/organization)',
                'sectors (from program.focus_areas)',
                'maturity_level = "pilot_ready" or "market_ready"',
                'use_cases (from program curriculum topics)',
                'partnerships (program partners as solution partners)',
                'certifications (program certificates as solution credentials)'
              ],
              
              aiGeneration: [
                'AI generates solution description from program outcomes',
                'AI extracts features from curriculum deliverables',
                'AI creates value proposition from program objectives',
                'AI pricing model suggester based on program context'
              ],
              
              validation: [
                'Participant must be from program (alumni)',
                'Program must be completed',
                'Solution name_en required'
              ]
            },
            
            implementationSteps: [
              '1. Create conversion modal component',
              '2. Add participant selector (program alumni only)',
              '3. Auto-populate fields from program data',
              '4. Add AI generation for solution details',
              '5. Validate and create Solution entity',
              '6. Link: create ProgramSolutionLink record',
              '7. Create SystemActivity for both entities',
              '8. Show success with link to new solution',
              '9. Test end-to-end conversion'
            ]
          },
          
          {
            name: 'ProgramToPilotConverter',
            type: 'component',
            file: 'components/programs/ProgramToPilotConverter.jsx',
            effort: '2.5h',
            priority: 'medium',
            
            workflow: {
              trigger: 'Program cohort proposes pilot based on learning',
              
              autoPopulatedFields: [
                'title_en (from program outcome)',
                'municipality_id (program partner municipality)',
                'team (program participants)',
                'budget (from program project budgets)',
                'methodology (from program curriculum)',
                'stakeholders (program mentors and partners)'
              ],
              
              aiGeneration: [
                'AI generates pilot hypothesis from program deliverables',
                'AI creates pilot objectives from program outcomes',
                'AI suggests KPIs based on program success metrics',
                'AI risk assessment from program challenges faced'
              ],
              
              validation: [
                'Program must be completed or active',
                'Municipality partner required',
                'Challenge linkage optional but recommended'
              ]
            },
            
            implementationSteps: [
              '1. Create conversion modal component',
              '2. Select municipality from program partners',
              '3. Auto-populate team from program participants',
              '4. AI generates pilot content from program outcomes',
              '5. Validate and create Pilot entity',
              '6. Link: create ProgramPilotLink record',
              '7. Create SystemActivity for both entities',
              '8. Test conversion flow'
            ]
          },
          
          {
            name: 'Add Conversions tab to ProgramDetail',
            type: 'page',
            file: 'pages/ProgramDetail.js',
            effort: '1h',
            priority: 'medium',
            
            details: {
              tabName: 'Conversions',
              position: 'After Outcomes tab',
              
              sections: [
                'Alumni Solutions (list of solutions created by alumni)',
                'Program Pilots (pilots launched by cohort)',
                'Knowledge Outputs (documents, case studies)',
                'Convert to Solution button (opens ProgramToSolutionConverter)',
                'Convert to Pilot button (opens ProgramToPilotConverter)'
              ]
            },
            
            implementationSteps: [
              '1. Add "Conversions" TabsTrigger',
              '2. Query solutions by ProgramSolutionLink',
              '3. Query pilots by ProgramPilotLink',
              '4. Query knowledge documents by program_id',
              '5. Add conversion action buttons',
              '6. Display conversion stats',
              '7. Test conversion creation and display'
            ]
          }
        ],
        
        validation: [
          'ProgramToSolutionConverter creates valid solutions',
          'ProgramToPilotConverter creates valid pilots',
          'Conversions tab displays linked entities',
          'ProgramSolutionLink and ProgramPilotLink entities created',
          'SystemActivity logged for conversions',
          'AI generation produces quality content'
        ]
      },
      
      {
        phase: 6,
        name: 'AI Features Enhancement',
        duration: '1 day',
        priority: 'MEDIUM',
        status: 'not_started',
        dependencies: ['Phase 1-3 complete'],
        
        deliverables: [
          {
            name: 'Enhanced AI Insights in ProgramDetail',
            type: 'page',
            file: 'pages/ProgramDetail.js',
            effort: '2h',
            priority: 'medium',
            
            currentAI: 'AI insights button exists (lines 95-134), generates strategic analysis',
            
            enhancements: [
              'Add AI Program Health Score (success probability 0-100)',
              'Add AI Cohort Optimization (ideal cohort size, diversity recommendations)',
              'Add AI Curriculum Quality Analyzer',
              'Add AI Alumni Impact Predictor',
              'Add AI Similar Programs Finder (semantic search)',
              'Add AI Improvement Recommendations'
            ],
            
            implementationSteps: [
              '1. Expand AI insights modal with 6 new sections',
              '2. Add health score calculation (completion rate, outcomes, feedback)',
              '3. Add cohort optimizer (analyze past cohorts, suggest improvements)',
              '4. Add curriculum analyzer (compare to best practices)',
              '5. Add alumni impact predictor (based on program type and outcomes)',
              '6. Add semantic search for similar programs',
              '7. Update AI prompt to generate all 6 insights',
              '8. Test AI quality and accuracy'
            ]
          },
          
          {
            name: 'AI Program Designer (Challenge-based)',
            type: 'component',
            file: 'components/programs/AIProgramDesigner.jsx',
            effort: '3h',
            priority: 'medium',
            
            functionality: {
              input: 'One or more challenges',
              output: 'AI-generated program design',
              
              generates: [
                'Program type recommendation (accelerator, incubator, hackathon, etc.)',
                'Program objectives aligned with challenge themes',
                'Curriculum outline addressing challenge domains',
                'Target participants (startups, researchers, entrepreneurs)',
                'Duration and timeline based on challenge complexity',
                'Success metrics derived from challenge KPIs',
                'Partner organization suggestions'
              ]
            },
            
            implementationSteps: [
              '1. Create modal component with challenge selector',
              '2. Build AI prompt from selected challenges',
              '3. Generate program design via InvokeLLM',
              '4. Display generated design with edit capability',
              '5. Pre-fill ProgramCreate wizard with AI suggestions',
              '6. Add to ConversionHub page',
              '7. Test with various challenge combinations'
            ]
          },
          
          {
            name: 'AI Success Pattern Analyzer',
            type: 'component',
            file: 'components/programs/AISuccessPatternAnalyzer.jsx',
            effort: '2h',
            priority: 'low',
            
            functionality: {
              analyzes: 'Past programs with similar characteristics',
              identifies: 'Success patterns and failure warning signs',
              recommends: 'Optimizations based on historical data',
              
              features: [
                'Cohort size optimizer (analyze graduation rates by size)',
                'Duration optimizer (analyze outcomes by program length)',
                'Curriculum effectiveness scorer',
                'Mentor quality impact analysis'
              ]
            },
            
            implementationSteps: [
              '1. Create analysis component',
              '2. Query historical programs by type',
              '3. Calculate success metrics (graduation_rate, outcomes, alumni_impact)',
              '4. Identify patterns using AI',
              '5. Generate recommendations',
              '6. Display in ProgramDetail AI Insights tab',
              '7. Test with real program data'
            ]
          }
        ],
        
        validation: [
          'AI insights expanded with 6 new features',
          'AIProgramDesigner creates programs from challenges',
          'AISuccessPatternAnalyzer provides data-driven recommendations',
          'All AI features bilingual',
          'AI quality meets gold standard (coherent, actionable)'
        ]
      },
      
      {
        phase: 7,
        name: 'Program Engagement & Feedback',
        duration: '0.5 day',
        priority: 'MEDIUM',
        status: 'not_started',
        dependencies: ['Phase 1-4 complete'],
        
        deliverables: [
          {
            name: 'Alumni Feedback Loop',
            type: 'component',
            file: 'components/programs/AlumniFeedbackCollector.jsx',
            effort: '2h',
            priority: 'medium',
            
            functionality: {
              trigger: 'Program completed, alumni reached 3, 6, 12 months post-graduation',
              
              collects: [
                'Post-program employment status',
                'Skills applied in work',
                'Impact on career/business',
                'Mentor relationship continued',
                'Would recommend program (NPS)',
                'Improvement suggestions'
              ],
              
              automation: [
                'Scheduled feedback requests via email',
                'Survey generation based on program type',
                'Response aggregation and analysis',
                'Display in ProgramDetail Outcomes tab'
              ]
            },
            
            implementationSteps: [
              '1. Create feedback form component',
              '2. Add feedback submission endpoint',
              '3. Store in ProgramParticipantFeedback entity (NEW or use StakeholderFeedback)',
              '4. Aggregate responses for program-level insights',
              '5. Display in Outcomes tab',
              '6. Add automated scheduling logic',
              '7. Test feedback collection and display'
            ]
          },
          
          {
            name: 'Program Impact Dashboard Widget',
            type: 'component',
            file: 'components/programs/ProgramImpactWidget.jsx',
            effort: '1.5h',
            priority: 'low',
            
            displays: [
              'Alumni employment rate',
              'Solutions launched by alumni',
              'Pilots launched by cohort',
              'Partnerships formed',
              'Funding raised by alumni',
              'Impact score (calculated metric)'
            ],
            
            implementationSteps: [
              '1. Create widget component',
              '2. Calculate impact metrics from linked entities',
              '3. Query alumni solutions and pilots',
              '4. Aggregate outcomes data',
              '5. Display in ProgramDetail Overview sidebar',
              '6. Add to ProgramsControlDashboard',
              '7. Test calculations'
            ]
          }
        ],
        
        validation: [
          'AlumniFeedbackCollector integrated',
          'Feedback displayed in Outcomes tab',
          'ProgramImpactWidget shows calculated metrics',
          'Impact score calculated correctly',
          'Alumni network tracking functional'
        ]
      },
      
      {
        phase: 8,
        name: 'SLA & Automation',
        duration: '0.5 day',
        priority: 'LOW',
        status: 'not_started',
        dependencies: ['Phase 1 complete'],
        
        deliverables: [
          {
            name: 'Add SLA tracking for Program gates',
            type: 'entity + function',
            files: ['entities/Program.json', 'functions/slaAutomation.js'],
            effort: '2h',
            priority: 'medium',
            
            entityChanges: {
              newFields: [
                'sla_due_date (date-time)',
                'escalation_level (0=none, 1=warning, 2=critical)',
                'escalation_date (date-time)'
              ],
              
              calculation: 'sla_due_date = submission_date + gate.slaDays',
              escalation: 'Auto-escalate if overdue by >50% of SLA window'
            },
            
            implementationSteps: [
              '1. Add sla_due_date, escalation_level, escalation_date to Program entity',
              '2. Update slaAutomation function to include Program entity',
              '3. Calculate SLA due dates on gate submission',
              '4. Check daily for overdue approvals',
              '5. Escalate to leadership if critical',
              '6. Send notifications on escalation',
              '7. Test SLA automation with test programs'
            ]
          },
          
          {
            name: 'Program Launch Notification Automation',
            type: 'function',
            file: 'functions/autoNotificationTriggers.js',
            effort: '1h',
            priority: 'low',
            
            triggers: [
              'Program approved → notify operator team',
              'Applications open → notify target audience',
              'Selection complete → notify accepted + rejected',
              'Program started → notify participants and mentors',
              'Mid-review due → notify operator',
              'Program completed → trigger alumni feedback'
            ],
            
            implementationSteps: [
              '1. Add program notification triggers to autoNotificationTriggers',
              '2. Define notification templates for each stage',
              '3. Send to relevant stakeholders',
              '4. Test notification delivery',
              '5. Add notification preferences for programs'
            ]
          }
        ],
        
        validation: [
          'SLA due dates auto-calculated on submission',
          'Escalation triggers on overdue approvals',
          'Notifications sent at each program stage',
          'Stakeholders receive appropriate alerts'
        ]
      },
      
      {
        phase: 9,
        name: 'Testing & Validation',
        duration: '0.5 day',
        priority: 'CRITICAL',
        status: 'not_started',
        dependencies: ['All phases complete'],
        
        testingChecklist: [
          {
            category: 'Workflow & Approvals',
            tests: [
              'Create program in draft → submit for launch approval',
              'Program appears in ApprovalCenter with inline wizard',
              'Approve program launch → status changes to approved',
              'Program completes → submit for completion evaluation',
              'Completion evaluation appears in ApprovalCenter',
              'Approve completion → status changes to completed',
              'All approvals logged in ProgramActivityLog',
              'SLA due dates calculated correctly',
              'Escalation triggers on overdue approvals'
            ]
          },
          
          {
            category: 'Creation & Editing',
            tests: [
              'ProgramCreate wizard: complete all 6 steps',
              'AICurriculumGenerator integration works in step 3',
              'AI enhancement works on each wizard step',
              'Draft saving works per wizard step',
              'ProgramEdit auto-saves every 30s',
              'Draft recovery works on reload',
              'Version number increments on save',
              'Change tracking shows modified fields',
              'Preview mode displays formatted content',
              'Unsaved changes warning appears on navigation'
            ]
          },
          
          {
            category: 'Detail Page & Activity',
            tests: [
              'ProgramDetail displays 15 tabs (Workflow first, Activity second)',
              'UnifiedWorkflowApprovalTab shows 2 gates with progress',
              'Self-check items display for requester',
              'Reviewer checklist displays for approver',
              'RequesterAI and ReviewerAI buttons work',
              'ProgramActivityLog shows merged timeline',
              'AI insights generate 6 analysis sections',
              'Expert mentors integrated via ExpertAssignment'
            ]
          },
          
          {
            category: 'Conversions & Engagement',
            tests: [
              'ProgramToSolutionConverter creates solution from alumni',
              'ProgramToPilotConverter creates pilot from cohort',
              'Conversions tab displays linked solutions and pilots',
              'AlumniFeedbackCollector collects responses',
              'ProgramImpactWidget calculates metrics correctly',
              'All conversions logged in activity log'
            ]
          },
          
          {
            category: 'Permissions & Security',
            tests: [
              'Only program_approver can approve launch',
              'Only program_evaluator can approve completion',
              'Alumni can create solutions from their programs',
              'Participants can view program details',
              'Non-participants cannot see confidential info',
              'RBAC enforced at all access points'
            ]
          },
          
          {
            category: 'Bilingual & RTL',
            tests: [
              'All UI text bilingual (AR/EN)',
              'RTL layout works correctly in Arabic',
              'AI generates bilingual content',
              'Form validation messages bilingual',
              'Activity log messages bilingual',
              'Notifications bilingual'
            ]
          }
        ],
        
        acceptanceCriteria: [
          '✅ All 35 gaps closed',
          '✅ Program completeness reaches 100%',
          '✅ All test cases pass',
          '✅ No regressions in existing functionality',
          '✅ Coverage reports updated to reflect completion',
          '✅ Documentation updated'
        ]
      }
    ],

    summaryMatrix: {
      totalTasks: 21,
      
      byPriority: {
        critical: 9,
        high: 7,
        medium: 4,
        low: 1
      },
      
      byType: {
        entity: 2,
        config: 1,
        page: 8,
        component: 6,
        function: 2,
        testing: 2
      },
      
      byEffort: {
        quick: '6 tasks (<1h each)',
        medium: '10 tasks (1-3h each)',
        large: '5 tasks (3-4h each)'
      }
    },

    executionStrategy: {
      recommended: 'Sequential by phase',
      
      phaseOrder: [
        'Phase 1: Foundation (CRITICAL - blocks all other work)',
        'Phase 2: Enhanced Editing (HIGH - improves UX immediately)',
        'Phase 3: Creation Wizard (HIGH - aligns with other entities)',
        'Phase 4: Detail Page Enhancement (HIGH - visible impact)',
        'Phase 5: Conversion Workflows (MEDIUM - enables closure)',
        'Phase 6: AI Features (MEDIUM - value-add)',
        'Phase 7: Engagement (MEDIUM - long-term value)',
        'Phase 8: SLA & Automation (LOW - nice-to-have)',
        'Phase 9: Testing (CRITICAL - validate everything)'
      ],
      
      parallelization: {
        canParallelize: [
          'Phase 2 + Phase 3 (editing and creation are independent)',
          'Phase 5 + Phase 6 (conversions and AI can run parallel)',
          'Phase 7 + Phase 8 (engagement and SLA can run parallel)'
        ],
        
        mustSequence: [
          'Phase 1 MUST complete before all others (foundation)',
          'Phase 9 MUST be last (testing requires all features)'
        ]
      },
      
      estimatedTimeline: {
        sequential: '5-6 days',
        withParallelization: '3-4 days',
        withTeam: '2 days (2 developers)'
      }
    },

    riskMitigation: [
      {
        risk: 'Breaking existing ProgramApplication workflows',
        mitigation: 'ProgramApplication gates separate in ApprovalGateConfig (program_application.* vs program.*)',
        testing: 'Verify ProgramApplication approvals still work after adding Program gates'
      },
      {
        risk: 'Workflow modal components conflict with UnifiedWorkflowApprovalTab',
        mitigation: 'Keep modal components for quick actions, UnifiedWorkflowApprovalTab for gate approvals',
        testing: 'Test both modal launch and gate approval workflows'
      },
      {
        risk: 'Auto-save conflicts with concurrent editing',
        mitigation: 'localStorage scoped to user + program ID, show collaborative editing indicator',
        testing: 'Test multiple users editing same program'
      },
      {
        risk: 'AI curriculum generator quality varies',
        mitigation: 'Allow manual editing of generated curriculum, save as starting point only',
        testing: 'Generate curriculum for 5+ program types, review quality'
      }
    ],

    successMetrics: [
      {
        metric: 'Program Completeness',
        baseline: '15%',
        target: '100%',
        measurement: 'WorkflowApprovalSystemCoverage report'
      },
      {
        metric: 'Gate Coverage',
        baseline: '0 gates',
        target: '2 gates (launch, completion)',
        measurement: 'GateMaturityMatrix report'
      },
      {
        metric: 'Detail Page Quality',
        baseline: '70% (13 tabs, no workflow)',
        target: '100% (15 tabs, workflow + activity)',
        measurement: 'DetailPagesCoverageReport'
      },
      {
        metric: 'Edit Page Quality',
        baseline: '55% (AI but no auto-save)',
        target: '100% (AI + auto-save + versioning)',
        measurement: 'EditPagesCoverageReport'
      },
      {
        metric: 'Create Page Quality',
        baseline: '50% (single form with AI)',
        target: '90% (6-step wizard with integrated AI)',
        measurement: 'CreateWizardsCoverageReport'
      },
      {
        metric: 'ApprovalCenter Integration',
        baseline: 'Not included (only ProgramApplication)',
        target: 'Full inline approval for Program entity',
        measurement: 'ApprovalCenter page has Programs tab'
      }
    ]
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          {t({ en: '🎪 Program Entity: Complete Implementation Plan', ar: '🎪 كيان البرنامج: خطة التنفيذ الكاملة' })}
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          {t({ 
            en: 'Detailed roadmap to achieve 100% completeness (from 15% baseline) following Challenge, Pilot, Solution gold standards',
            ar: 'خارطة طريق مفصلة لتحقيق 100% اكتمال (من خط أساس 15%) وفقاً لمعايير التحديات والتجارب والحلول الذهبية'
          })}
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-600" />
            {t({ en: 'Executive Summary', ar: 'الملخص التنفيذي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-red-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Current State', ar: 'الحالة الحالية' })}</p>
              <p className="text-3xl font-bold text-red-600">{implementationPlan.overview.currentCompleteness}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Target State', ar: 'الحالة المستهدفة' })}</p>
              <p className="text-3xl font-bold text-green-600">{implementationPlan.overview.targetCompleteness}%</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-orange-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Total Gaps', ar: 'إجمالي الفجوات' })}</p>
              <p className="text-3xl font-bold text-orange-600">{implementationPlan.overview.totalGaps}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Estimated Effort', ar: 'الجهد المقدر' })}</p>
              <p className="text-2xl font-bold text-blue-600">{implementationPlan.overview.estimatedEffort}</p>
            </div>
          </div>

          {/* Current State */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="font-semibold text-green-900 mb-3">✅ {t({ en: 'Current Strengths', ar: 'نقاط القوة الحالية' })}</p>
              <ul className="space-y-1 text-xs">
                {implementationPlan.overview.currentState.strengths.map((strength, i) => (
                  <li key={i} className="text-green-800">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-900 mb-3">🚨 {t({ en: 'Critical Gaps', ar: 'الفجوات الحرجة' })}</p>
              <ul className="space-y-1 text-xs">
                {implementationPlan.overview.currentState.criticalWeaknesses.map((weakness, i) => (
                  <li key={i} className="text-red-800">{weakness}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Reference Standards */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="font-semibold text-purple-900 mb-3">
              🎯 {t({ en: 'Reference Standards to Follow', ar: 'المعايير المرجعية للمتابعة' })}
            </p>
            <ul className="space-y-1 text-xs">
              {implementationPlan.overview.referenceStandards.map((ref, i) => (
                <li key={i} className="text-purple-800">• {ref}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Phases */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">
          {t({ en: '📋 Implementation Phases', ar: '📋 مراحل التنفيذ' })}
        </h2>

        {implementationPlan.phases.map((phase, idx) => {
          const isExpanded = expandedPhases[idx];
          const statusColors = {
            not_started: 'bg-slate-100 text-slate-700',
            in_progress: 'bg-blue-100 text-blue-700',
            completed: 'bg-green-100 text-green-700'
          };
          
          const priorityColors = {
            CRITICAL: 'border-red-500',
            HIGH: 'border-orange-500',
            MEDIUM: 'border-yellow-500',
            LOW: 'border-blue-500'
          };

          return (
            <Card key={idx} className={`border-2 ${priorityColors[phase.priority]}`}>
              <CardHeader>
                <button
                  onClick={() => togglePhase(idx)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {phase.phase}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {phase.name}
                        <Badge className={statusColors[phase.status]}>
                          {phase.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {phase.priority}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {phase.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {phase.deliverables.length} deliverables
                        </span>
                        {phase.dependencies && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {phase.dependencies.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {/* Background/Context */}
                  {phase.background && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">📖 {t({ en: 'Background', ar: 'الخلفية' })}</p>
                      <p className="text-xs text-blue-800 mb-2"><strong>Problem:</strong> {phase.background.problem}</p>
                      <p className="text-xs text-blue-800 mb-2"><strong>Solution:</strong> {phase.background.solution}</p>
                      {phase.background.conversionTypes && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Conversion Types:</p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            {phase.background.conversionTypes.map((type, i) => (
                              <li key={i}>• {type}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Deliverables */}
                  <div className="space-y-3">
                    {phase.deliverables.map((deliverable, dIdx) => (
                      <Card key={dIdx} className="bg-slate-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-2">
                              <Code className="h-5 w-5 text-orange-600 mt-0.5" />
                              <div>
                                <p className="font-semibold text-slate-900">{deliverable.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{deliverable.type}</Badge>
                                  <Badge className="text-xs bg-orange-100 text-orange-700">{deliverable.priority}</Badge>
                                  <span className="text-xs text-slate-600">{deliverable.effort}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="mb-3 text-xs">
                            <p className="text-slate-600">
                              <strong>File:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded">{deliverable.file}</code>
                            </p>
                            {deliverable.referenceFiles && (
                              <div className="mt-2">
                                <p className="text-slate-600 mb-1"><strong>Reference Files:</strong></p>
                                <ul className="space-y-0.5 ml-4">
                                  {deliverable.referenceFiles.map((ref, i) => (
                                    <li key={i} className="text-slate-500">
                                      <code className="text-xs bg-slate-200 px-1 py-0.5 rounded">{ref}</code>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          {deliverable.details && (
                            <div className="mb-3 p-3 bg-white rounded border border-slate-200">
                              <p className="text-xs font-semibold text-slate-700 mb-2">Details:</p>
                              {typeof deliverable.details === 'object' && Object.entries(deliverable.details).map(([key, value]) => {
                                if (Array.isArray(value)) {
                                  return (
                                    <div key={key} className="mb-2">
                                      <p className="text-xs text-slate-600 font-medium">{key.replace(/_/g, ' ')}:</p>
                                      <ul className="ml-4 mt-1 space-y-0.5">
                                        {value.map((item, i) => (
                                          <li key={i} className="text-xs text-slate-600">
                                            {typeof item === 'object' ? JSON.stringify(item, null, 2) : `• ${item}`}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                } else if (typeof value === 'object') {
                                  return (
                                    <div key={key} className="mb-2">
                                      <p className="text-xs text-slate-600 font-medium">{key.replace(/_/g, ' ')}:</p>
                                      <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(value, null, 2)}
                                      </pre>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <p key={key} className="text-xs text-slate-600 mb-1">
                                      <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                                    </p>
                                  );
                                }
                              })}
                            </div>
                          )}

                          {/* Features */}
                          {deliverable.features && (
                            <div className="mb-3 p-3 bg-purple-50 rounded border border-purple-200">
                              <p className="text-xs font-semibold text-purple-900 mb-2">✨ Features:</p>
                              <ul className="space-y-1">
                                {deliverable.features.map((feature, i) => (
                                  <li key={i} className="text-xs text-purple-800">• {feature}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Wizard Steps */}
                          {deliverable.wizardSteps && (
                            <div className="mb-3 p-3 bg-blue-50 rounded border border-blue-200">
                              <p className="text-xs font-semibold text-blue-900 mb-2">🧙 Wizard Steps:</p>
                              <div className="space-y-2">
                                {deliverable.wizardSteps.map((step, i) => (
                                  <div key={i} className="p-2 bg-white rounded border">
                                    <p className="text-xs font-semibold text-blue-900">
                                      Step {step.step}: {step.name}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      <strong>Fields:</strong> {step.fields.join(', ')}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      <strong>AI:</strong> {step.aiFeature}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      <strong>Validation:</strong> {step.validation}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Workflow */}
                          {deliverable.workflow && (
                            <div className="mb-3 p-3 bg-teal-50 rounded border border-teal-200">
                              <p className="text-xs font-semibold text-teal-900 mb-2">⚙️ Workflow Details:</p>
                              <div className="space-y-2 text-xs text-teal-800">
                                {deliverable.workflow.trigger && (
                                  <p><strong>Trigger:</strong> {deliverable.workflow.trigger}</p>
                                )}
                                {deliverable.workflow.autoPopulatedFields && (
                                  <div>
                                    <p className="font-semibold mb-1">Auto-Populated Fields:</p>
                                    <ul className="ml-4 space-y-0.5">
                                      {deliverable.workflow.autoPopulatedFields.map((field, i) => (
                                        <li key={i}>• {field}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {deliverable.workflow.aiGeneration && (
                                  <div>
                                    <p className="font-semibold mb-1">AI Generation:</p>
                                    <ul className="ml-4 space-y-0.5">
                                      {deliverable.workflow.aiGeneration.map((gen, i) => (
                                        <li key={i}>• {gen}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {deliverable.workflow.validation && (
                                  <div>
                                    <p className="font-semibold mb-1">Validation:</p>
                                    <ul className="ml-4 space-y-0.5">
                                      {deliverable.workflow.validation.map((val, i) => (
                                        <li key={i}>• {val}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Functionality */}
                          {deliverable.functionality && (
                            <div className="mb-3 p-3 bg-indigo-50 rounded border border-indigo-200">
                              <p className="text-xs font-semibold text-indigo-900 mb-2">⚡ Functionality:</p>
                              <div className="space-y-2 text-xs text-indigo-800">
                                {Object.entries(deliverable.functionality).map(([key, value]) => {
                                  if (Array.isArray(value)) {
                                    return (
                                      <div key={key}>
                                        <p className="font-semibold">{key.replace(/_/g, ' ')}:</p>
                                        <ul className="ml-4 space-y-0.5">
                                          {value.map((item, i) => (
                                            <li key={i}>• {item}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <p key={key}><strong>{key.replace(/_/g, ' ')}:</strong> {value}</p>
                                    );
                                  }
                                })}
                              </div>
                            </div>
                          )}

                          {/* Implementation Steps */}
                          <div className="p-3 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-900 mb-2">
                              🔧 {t({ en: 'Implementation Steps', ar: 'خطوات التنفيذ' })}
                            </p>
                            <ol className="space-y-1">
                              {deliverable.implementationSteps.map((step, i) => (
                                <li key={i} className="text-xs text-green-800">{step}</li>
                              ))}
                            </ol>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Validation Checklist */}
                  {phase.validation && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="font-semibold text-amber-900 mb-2">
                        ✓ {t({ en: 'Validation Checklist', ar: 'قائمة التحقق' })}
                      </p>
                      <ul className="space-y-1">
                        {phase.validation.map((check, i) => (
                          <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                            <Circle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Testing Checklist */}
                  {phase.testingChecklist && (
                    <div className="space-y-3">
                      {phase.testingChecklist.map((testCat, i) => (
                        <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="font-semibold text-green-900 mb-2">
                            ✅ {testCat.category}
                          </p>
                          <ul className="space-y-1">
                            {testCat.tests.map((test, j) => (
                              <li key={j} className="text-xs text-green-800 flex items-start gap-2">
                                <Circle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <span>{test}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Acceptance Criteria */}
                  {phase.acceptanceCriteria && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-2">
                        🎯 {t({ en: 'Acceptance Criteria', ar: 'معايير القبول' })}
                      </p>
                      <ul className="space-y-1">
                        {phase.acceptanceCriteria.map((criteria, i) => (
                          <li key={i} className="text-xs text-purple-800">{criteria}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Summary Matrix */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            {t({ en: 'Implementation Summary Matrix', ar: 'مصفوفة ملخص التنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-600 mb-2">By Priority</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-red-700">Critical:</span>
                  <span className="font-bold">{implementationPlan.summaryMatrix.byPriority.critical}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-700">High:</span>
                  <span className="font-bold">{implementationPlan.summaryMatrix.byPriority.high}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Medium:</span>
                  <span className="font-bold">{implementationPlan.summaryMatrix.byPriority.medium}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Low:</span>
                  <span className="font-bold">{implementationPlan.summaryMatrix.byPriority.low}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-600 mb-2">By Type</p>
              <div className="space-y-1 text-xs">
                {Object.entries(implementationPlan.summaryMatrix.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="text-slate-700">{type}:</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border">
              <p className="text-xs text-slate-600 mb-2">By Effort</p>
              <div className="space-y-1 text-xs text-slate-700">
                <p>{implementationPlan.summaryMatrix.byEffort.quick}</p>
                <p>{implementationPlan.summaryMatrix.byEffort.medium}</p>
                <p>{implementationPlan.summaryMatrix.byEffort.large}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Strategy */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            {t({ en: 'Execution Strategy', ar: 'استراتيجية التنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <p className="text-sm font-semibold text-slate-900 mb-3">
              {t({ en: 'Recommended Approach:', ar: 'النهج الموصى به:' })} {implementationPlan.executionStrategy.recommended}
            </p>
            <ol className="space-y-2 text-xs text-slate-700">
              {implementationPlan.executionStrategy.phaseOrder.map((order, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-bold text-purple-600 flex-shrink-0">{i + 1}.</span>
                  <span>{order}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2">✅ Can Parallelize:</p>
              <ul className="space-y-1 text-xs text-green-800">
                {implementationPlan.executionStrategy.parallelization.canParallelize.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs font-semibold text-red-900 mb-2">🚨 Must Sequence:</p>
              <ul className="space-y-1 text-xs text-red-800">
                {implementationPlan.executionStrategy.parallelization.mustSequence.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-900 mb-2">⏱️ Timeline Estimates:</p>
            <div className="grid grid-cols-3 gap-3 text-xs text-blue-800">
              <div>
                <p className="font-medium">Sequential:</p>
                <p className="text-lg font-bold">{implementationPlan.executionStrategy.estimatedTimeline.sequential}</p>
              </div>
              <div>
                <p className="font-medium">With Parallelization:</p>
                <p className="text-lg font-bold">{implementationPlan.executionStrategy.estimatedTimeline.withParallelization}</p>
              </div>
              <div>
                <p className="font-medium">With Team (2 devs):</p>
                <p className="text-lg font-bold">{implementationPlan.executionStrategy.estimatedTimeline.withTeam}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Mitigation */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            {t({ en: 'Risk Mitigation', ar: 'تخفيف المخاطر' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {implementationPlan.riskMitigation.map((risk, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ {risk.risk}</p>
                <p className="text-xs text-slate-700 mb-1"><strong>Mitigation:</strong> {risk.mitigation}</p>
                <p className="text-xs text-slate-600"><strong>Testing:</strong> {risk.testing}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-600" />
            {t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {implementationPlan.successMetrics.map((metric, i) => (
              <div key={i} className="p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">{metric.metric}</p>
                  <Badge className="bg-green-100 text-green-700">{metric.measurement}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <p className="text-slate-600">Baseline:</p>
                    <p className="font-bold text-red-600">{metric.baseline}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-slate-600">Target:</p>
                    <p className="font-bold text-green-600">{metric.target}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Actions */}
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-orange-600" />
            {t({ en: 'Immediate Next Actions', ar: 'الإجراءات التالية الفورية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-red-500">
              <span className="font-bold text-red-600 flex-shrink-0">1.</span>
              <div>
                <p className="font-semibold text-slate-900">Start Phase 1: Foundation (CRITICAL)</p>
                <p className="text-xs text-slate-600 mt-1">
                  Add workflow_stage field → Create gates in ApprovalGateConfig → Add to ApprovalCenter → Create ProgramActivityLog → Integrate UnifiedWorkflowApprovalTab
                </p>
                <Badge className="mt-2 bg-red-100 text-red-700">BLOCKS ALL OTHER WORK</Badge>
              </div>
            </li>
            
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-orange-500">
              <span className="font-bold text-orange-600 flex-shrink-0">2.</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 2 + 3 in Parallel</p>
                <p className="text-xs text-slate-600 mt-1">
                  Developer A: Enhanced Editing (auto-save, versioning, change tracking)
                  <br />
                  Developer B: Creation Wizard (6-step wizard, AICurriculumGenerator integration)
                </p>
                <Badge className="mt-2 bg-orange-100 text-orange-700">CAN PARALLELIZE</Badge>
              </div>
            </li>
            
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-yellow-500">
              <span className="font-bold text-yellow-600 flex-shrink-0">3.</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 5 + 6 + 7 in Parallel</p>
                <p className="text-xs text-slate-600 mt-1">
                  Conversions, AI features, and engagement can run simultaneously after foundation complete
                </p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-700">MEDIUM PRIORITY</Badge>
              </div>
            </li>
            
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-green-500">
              <span className="font-bold text-green-600 flex-shrink-0">4.</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 9: Comprehensive Testing</p>
                <p className="text-xs text-slate-600 mt-1">
                  Test all 6 categories end-to-end, verify all 35 gaps closed, update coverage reports to 100%
                </p>
                <Badge className="mt-2 bg-green-100 text-green-700">FINAL VALIDATION</Badge>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(ProgramGapsImplementationPlan, { requireAdmin: true });