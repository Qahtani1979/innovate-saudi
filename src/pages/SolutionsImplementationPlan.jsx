import React, { useState } from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, Clock, Target, Zap, Calendar, Users, Code,
  FileText, Sparkles, TrendingUp, AlertCircle, ChevronDown,
  ChevronRight, Package, Layers, Activity
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionsImplementationPlan() {
  const { language, isRTL, t } = useLanguage();
  const [expandedPhases, setExpandedPhases] = useState({});

  const togglePhase = (id) => {
    setExpandedPhases(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const implementationPlan = {
    overview: {
      totalGaps: 8,
      completedGaps: 8,
      inProgress: 0,
      planned: 0,
      estimatedDays: 12,
      priority: 'P3 - Optional Enhancements',
      moduleStatus: '✅ 100% COMPLETE - Core + All Enhancements'
    },

    phases: [
      {
        id: 'phase1',
        name: 'Provider Intelligence & Portfolio (Days 1-4)',
        priority: 'P3',
        effort: 'Medium',
        impact: 'Medium',
        status: 'completed',
        completeness: 100,
        completedDate: '2025-12-03',
        
        gaps: [
          {
            id: 'gap-1',
            title: 'Provider Portfolio Dashboard',
            description: 'Multi-solution management UI for providers with performance analytics',
            effort: '2 days',
            impact: 'Medium',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Page',
                name: 'ProviderPortfolioDashboard',
                description: 'Unified view of all provider solutions, pilots, and performance',
                specs: [
                  'Grid view of all solutions by provider',
                  'Performance metrics per solution',
                  'Active pilots using each solution',
                  'Reviews aggregation',
                  'Version history access',
                  'Bulk actions (deprecate, update pricing)',
                  'Analytics: total deployments, avg rating, success rate'
                ]
              },
              {
                type: 'Component',
                name: 'solutions/ProviderSolutionCard',
                description: 'Card component for portfolio grid',
                specs: [
                  'Solution overview with status badges',
                  'Quick stats (pilots, rating, deployments)',
                  'Quick actions menu',
                  'Health indicator'
                ]
              },
              {
                type: 'Update',
                name: 'StartupDashboard',
                description: 'Add link to portfolio dashboard',
                specs: ['Add "Manage My Solutions Portfolio" card with count']
              }
            ],
            
            integrationPoints: [
              'SolutionHealthDashboard (reuse health metrics)',
              'SolutionDetail (link to each solution)',
              'SolutionEdit (quick edit from portfolio)',
              'SolutionDeprecationWizard (bulk deprecate)'
            ],
            
            testCriteria: [
              'Provider can see all their solutions in one view',
              'Performance metrics display correctly',
              'Bulk actions work on selected solutions',
              'Links to detail pages function',
              'Analytics aggregate correctly'
            ]
          },
          {
            id: 'gap-2',
            title: 'Provider Opportunity Pipeline Tracker',
            description: 'Track challenges discovered, proposals submitted, pilots won',
            effort: '2 days',
            impact: 'Medium',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Component',
                name: 'provider/OpportunityPipelineDashboard',
                description: 'Funnel view of provider opportunity pipeline',
                specs: [
                  'Stage funnel: Discovered → Interested → Proposed → Pilot → Deployed',
                  'Count per stage',
                  'Conversion rates',
                  'List view of opportunities in each stage',
                  'Filters by sector, municipality, date range'
                ]
              },
              {
                type: 'Entity Enhancement',
                name: 'Solution',
                description: 'Add pipeline tracking fields',
                specs: [
                  'challenges_discovered (IDs of matched challenges)',
                  'interests_expressed (count from SolutionInterest)',
                  'demos_requested (count from DemoRequest)',
                  'proposals_submitted (count from ChallengeProposal)',
                  'pilots_won (count from Pilot where solution_id)',
                  'Last update these counts via functions/mutations'
                ]
              },
              {
                type: 'Update',
                name: 'StartupDashboard',
                description: 'Add pipeline widget',
                specs: ['Opportunity funnel visualization', 'Conversion rate display']
              }
            ],
            
            integrationPoints: [
              'SolutionInterest entity (count interests)',
              'DemoRequest entity (count demos)',
              'ChallengeProposal entity (count proposals)',
              'Pilot entity (count pilots won)',
              'ChallengeSolutionMatch entity (count discoveries)'
            ],
            
            testCriteria: [
              'Pipeline counts update when new interest/demo/proposal created',
              'Funnel displays conversion rates',
              'Provider can drill down into each stage',
              'Historical tracking works'
            ]
          }
        ]
      },

      {
        id: 'phase2',
        name: 'Municipal Engagement & Marketplace (Days 5-7)',
        priority: 'P3',
        effort: 'Small',
        impact: 'Low-Medium',
        status: 'completed',
        completeness: 100,
        completedDate: '2025-12-03',
        
        gaps: [
          {
            id: 'gap-3',
            title: 'Municipal Proposal Inbox',
            description: 'UI for municipalities to review solution proposals',
            effort: '1 day',
            impact: 'Medium',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Page',
                name: 'MunicipalProposalInbox',
                description: 'Queue for reviewing provider proposals',
                specs: [
                  'List all ChallengeProposal for my municipality',
                  'Filter by status, challenge, provider',
                  'Proposal preview cards',
                  'Quick approve/reject actions',
                  'Link to full proposal detail',
                  'Notification badge for pending proposals'
                ]
              },
              {
                type: 'Component',
                name: 'proposals/ProposalReviewCard',
                description: 'Card for proposal quick review',
                specs: [
                  'Provider info with verification badge',
                  'Proposal summary',
                  'Timeline and budget',
                  'Accept/Reject/Request More Info buttons',
                  'Challenge context'
                ]
              },
              {
                type: 'Update',
                name: 'MunicipalityDashboard',
                description: 'Add proposal inbox widget',
                specs: ['Show count of pending proposals', 'Link to inbox']
              },
              {
                type: 'Update',
                name: 'Layout navigation',
                description: 'Add to municipality menu',
                specs: ['Add under "My Work" section']
              }
            ],
            
            integrationPoints: [
              'ChallengeProposal entity (fetch proposals)',
              'ChallengeDetail (link to challenge)',
              'OrganizationDetail (link to provider)',
              'Notification system (proposal alerts)'
            ],
            
            testCriteria: [
              'Municipality sees all proposals for their challenges',
              'Can filter and search proposals',
              'Actions update proposal status',
              'Provider gets notified of decision',
              'Proposal count updates in real-time'
            ]
          },
          {
            id: 'gap-4',
            title: 'Direct Marketplace Widget (MunicipalityDashboard)',
            description: 'Quick access to solutions marketplace from municipality dashboard',
            effort: '0.5 days',
            impact: 'Low',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Component',
                name: 'municipalities/QuickSolutionsMarketplace',
                description: 'Widget showing top matched solutions',
                specs: [
                  'Top 4-6 solutions matched to municipality challenges',
                  'Solution cards with quick view',
                  'Filter by sector',
                  'Link to full marketplace',
                  'Express interest button'
                ]
              },
              {
                type: 'Update',
                name: 'MunicipalityDashboard',
                description: 'Add solutions widget',
                specs: ['Section: "Recommended Solutions for Your Challenges"']
              }
            ],
            
            integrationPoints: [
              'ChallengeSolutionMatch (get matched solutions)',
              'Solution entity',
              'ExpressInterestButton',
              'Solutions page (link to full marketplace)'
            ],
            
            testCriteria: [
              'Shows solutions relevant to municipality',
              'Links work correctly',
              'Express interest works from widget'
            ]
          },
          {
            id: 'gap-5',
            title: 'Trending Solutions Widget (Home)',
            description: 'Showcase trending/featured solutions on home page',
            effort: '0.5 days',
            impact: 'Low',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Component',
                name: 'home/TrendingSolutionsWidget',
                description: 'Carousel of trending solutions',
                specs: [
                  'Top 5 trending solutions (by recent interest, demos, reviews)',
                  'Solution cards with image, name, provider, rating',
                  'Trending indicator',
                  'Link to SolutionDetail',
                  'Auto-rotate carousel'
                ]
              },
              {
                type: 'Update',
                name: 'Home page',
                description: 'Add trending widget',
                specs: ['Section after platform stats']
              }
            ],
            
            integrationPoints: [
              'Solution entity (fetch by trending score)',
              'SolutionDetail (link)',
              'SolutionInterest/DemoRequest (calculate trending)'
            ],
            
            testCriteria: [
              'Shows actively-engaged solutions',
              'Updates based on recent activity',
              'Links work',
              'Carousel rotates'
            ]
          }
        ]
      },

      {
        id: 'phase3',
        name: 'Provider Success Credentials & Integration (Days 8-10)',
        priority: 'P3',
        effort: 'Small',
        impact: 'Low',
        status: 'completed',
        completeness: 100,
        completedDate: '2025-12-03',
        
        gaps: [
          {
            id: 'gap-6',
            title: 'Nationally Deployed Credential Badge',
            description: 'Badge system for solutions deployed at scale',
            effort: '1 day',
            impact: 'Low',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Component',
                name: 'solutions/DeploymentBadges',
                description: 'Badge component for deployment achievements',
                specs: [
                  'Badges: Single Pilot, Multi-City, Nationally Deployed (5+ cities), Proven Success',
                  'Badge criteria auto-calculated from deployment_count',
                  'Display on SolutionDetail, Solutions list, PublicMarketplace',
                  'Tooltip showing deployment details'
                ]
              },
              {
                type: 'Entity Enhancement',
                name: 'Solution',
                description: 'Add badge calculation logic',
                specs: [
                  'achievement_badges: ["single_pilot", "multi_city", "nationally_deployed", "proven_success"]',
                  'Auto-update when deployment_count changes'
                ]
              },
              {
                type: 'Update',
                name: 'Multiple pages',
                description: 'Display badges',
                specs: [
                  'SolutionDetail hero section',
                  'Solutions list cards',
                  'PublicSolutionsMarketplace cards',
                  'SolutionComparison table'
                ]
              }
            ],
            
            integrationPoints: [
              'ScalingPlan entity (detect national deployments)',
              'Pilot entity (count deployments)',
              'SolutionDetail, Solutions, PublicMarketplace pages'
            ],
            
            testCriteria: [
              'Badges appear when criteria met',
              'Badges update automatically',
              'Tooltips show deployment details',
              'Badges display across all pages'
            ]
          },
          {
            id: 'gap-7',
            title: 'Solution → Matchmaker Auto-Enrollment',
            description: 'Automatically create matchmaker application when solution submitted',
            effort: '1 day',
            impact: 'Low',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Function',
                name: 'functions/autoMatchmakerEnrollment',
                description: 'Auto-create matchmaker app on solution approval',
                specs: [
                  'Trigger: When solution.workflow_stage → "verified"',
                  'Check if provider has matchmaker application',
                  'If not, create MatchmakerApplication',
                  'Auto-populate from solution data',
                  'Set stage: "auto_enrolled"',
                  'Notify provider of enrollment'
                ]
              },
              {
                type: 'Update',
                name: 'SolutionVerification workflow',
                description: 'Add auto-enrollment trigger',
                specs: ['Call function on approval']
              }
            ],
            
            integrationPoints: [
              'Solution entity (trigger)',
              'MatchmakerApplication entity (create)',
              'Organization entity (link)',
              'Notification system'
            ],
            
            testCriteria: [
              'Matchmaker app created on solution approval',
              'Provider notified',
              'No duplicate applications',
              'Data populated correctly'
            ]
          },
          {
            id: 'gap-8',
            title: 'Scaling Commercial Tracking',
            description: 'Track provider revenue, contracts, and growth from scaling',
            effort: '1 day',
            impact: 'Low',
            status: 'completed',
            completedDate: '2025-12-03',
            
            deliverables: [
              {
                type: 'Component',
                name: 'scaling/ProviderScalingCommercial',
                description: 'Provider view of scaling commercial metrics',
                specs: [
                  'List of scaling plans using provider solution',
                  'Cities deployed count',
                  'Contract value per city',
                  'Total revenue from scaling',
                  'Status per city deployment',
                  'Link to each scaling plan'
                ]
              },
              {
                type: 'Entity Enhancement',
                name: 'ScalingPlan',
                description: 'Add commercial tracking',
                specs: [
                  'contract_value_per_city',
                  'provider_revenue_total',
                  'payment_terms',
                  'contract_status_per_city (array)'
                ]
              },
              {
                type: 'Update',
                name: 'SolutionDetail',
                description: 'Add scaling commercial tab',
                specs: ['New tab showing scaling deployments and revenue']
              },
              {
                type: 'Update',
                name: 'ProviderPortfolioDashboard',
                description: 'Show scaling revenue',
                specs: ['Total scaling revenue across all solutions']
              }
            ],
            
            integrationPoints: [
              'ScalingPlan entity',
              'Solution entity',
              'Contract entity (link)',
              'ProviderPortfolioDashboard'
            ],
            
            testCriteria: [
              'Provider sees scaling deployments',
              'Revenue calculates correctly',
              'Contract status updates',
              'Dashboard aggregates correctly'
            ]
          }
        ],
        
        dependencies: [],
        blockers: []
      },

      {
        id: 'phase4',
        name: 'Marketplace UX Enhancements (Days 11-12)',
        priority: 'P4',
        effort: 'Small',
        impact: 'Low',
        status: 'planned',
        completeness: 0,
        
        gaps: [
          /* Remaining gaps from phase breakdown */
        ],
        
        note: 'Quick wins for improved UX - all existing functionality, just better visibility'
      }
    ],

    trackingMechanism: {
      dailyStandups: [
        'Review completed deliverables',
        'Update completeness percentages',
        'Identify blockers',
        'Adjust timeline if needed'
      ],
      
      reportUpdates: [
        {
          report: 'SolutionsCoverageReport',
          updateFrequency: 'After each gap completion',
          fieldsToUpdate: [
            'overallCoverage percentage',
            'gaps.critical, gaps.high, gaps.medium arrays',
            'Workflow coverage percentages',
            'User journey coverage scores',
            'Bottom line summary'
          ]
        },
        {
          report: 'ParallelUniverseTracker',
          updateFrequency: 'After phase completion',
          fieldsToUpdate: [
            'Pipeline universe ecosystemIntegration score',
            'Isolation symptoms',
            'Required workflows',
            'Current metrics'
          ]
        },
        {
          report: 'SystemProgressTracker',
          updateFrequency: 'After each gap',
          fieldsToUpdate: [
            'Solutions module completion',
            'Completed components list',
            'Timeline progress',
            'Metrics.completed count'
          ]
        },
        {
          report: 'MasterGapsList',
          updateFrequency: 'Real-time',
          fieldsToUpdate: [
            'solutionsQuality array - mark completed',
            'Executive stats',
            'Latest updates section'
          ]
        },
        {
          report: 'StartupCoverageReport',
          updateFrequency: 'After provider features',
          fieldsToUpdate: [
            'Workflow coverage scores',
            'Component integration status',
            'User journey completeness',
            'Gap arrays'
          ]
        },
        {
          report: 'PortalDesignCoverage',
          updateFrequency: 'After UI additions',
          fieldsToUpdate: [
            'Portal entity completeness scores',
            'Display type descriptions',
            'Gap arrays'
          ]
        }
      ],

      successMetrics: {
        technical: [
          'All 8 gaps implemented',
          'Zero critical bugs',
          'Test criteria passed',
          'Code reviewed',
          'Documentation updated'
        ],
        business: [
          'Providers can manage portfolio (gap 1)',
          'Providers can track opportunities (gap 2)',
          'Municipalities have proposal workflow (gap 3)',
          'Solutions more discoverable (gaps 4-5)',
          'Provider success visible (gaps 6-8)'
        ],
        user: [
          'Provider satisfaction with portfolio tools',
          'Municipality adoption of proposal inbox',
          'Increased solution discovery from widgets',
          'Provider engagement with pipeline tracker'
        ]
      }
    },

    rolloutStrategy: {
      approach: 'Incremental with validation',
      phases: [
        {
          phase: 'Build',
          duration: '10 days',
          activities: ['Implement all 8 gaps', 'Write tests', 'Internal review']
        },
        {
          phase: 'Validate',
          duration: '1 day',
          activities: ['User testing with 2-3 providers', 'Municipality testing', 'Fix critical bugs']
        },
        {
          phase: 'Deploy',
          duration: '1 day',
          activities: ['Production deployment', 'Monitor for issues', 'Update all reports']
        }
      ],
      
      rollback: 'Feature flags for each enhancement - can disable individually',
      monitoring: 'Track usage analytics for each new feature'
    },

    riskAssessment: [
      {
        risk: 'Low adoption of new features',
        likelihood: 'Medium',
        impact: 'Low',
        mitigation: 'In-app tooltips, onboarding tour, email announcements',
        contingency: 'Gather feedback and iterate'
      },
      {
        risk: 'Performance impact from additional queries',
        likelihood: 'Low',
        impact: 'Low',
        mitigation: 'Use React Query caching, optimize queries, lazy load',
        contingency: 'Add indexes, implement pagination'
      },
      {
        risk: 'Complexity creep',
        likelihood: 'Medium',
        impact: 'Low',
        mitigation: 'Keep components focused, avoid over-engineering',
        contingency: 'Simplify features if too complex'
      }
    ],

    resources: {
      development: '1 developer',
      estimatedHours: 80,
      breakdown: {
        coding: 50,
        testing: 15,
        documentation: 10,
        deployment: 5
      }
    }
  };

  const stats = {
    totalGaps: implementationPlan.overview.totalGaps,
    completed: implementationPlan.overview.completedGaps,
    inProgress: implementationPlan.overview.inProgress,
    planned: implementationPlan.overview.planned,
    totalDays: implementationPlan.overview.estimatedDays,
    progress: Math.round((implementationPlan.overview.completedGaps / implementationPlan.overview.totalGaps) * 100)
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t({ en: '🎯 Solutions Enhancement - Implementation Plan', ar: '🎯 تحسين الحلول - خطة التنفيذ' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ 
            en: 'P3 Optional Enhancements - 8 remaining gaps for provider intelligence and marketplace UX',
            ar: 'تحسينات اختيارية P3 - 8 فجوات متبقية لذكاء المزود وتجربة السوق'
          })}
        </p>
        <div className="mt-3 p-4 bg-green-100 rounded-lg border-2 border-green-400">
          <p className="font-bold text-green-900 mb-2">
            ✅ {t({ en: 'Core Module: 100% Complete', ar: 'الوحدة الأساسية: 100% مكتملة' })}
          </p>
          <p className="text-sm text-green-800">
            {t({
              en: 'All P0-P2 gaps resolved. This plan covers optional P3-P4 enhancements for improved provider experience and marketplace discoverability.',
              ar: 'تم حل جميع فجوات P0-P2. هذه الخطة تغطي التحسينات الاختيارية P3-P4.'
            })}
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-4 text-center">
            <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.totalGaps}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Gaps', ar: 'إجمالي الفجوات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
          <CardContent className="pt-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-4 text-center">
            <Activity className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-600">{stats.inProgress}</p>
            <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-4 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.totalDays}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Est. Days', ar: 'أيام متوقعة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-100 to-white">
          <CardContent className="pt-4 text-center">
            <TrendingUp className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-900">{stats.progress}%</p>
            <p className="text-xs text-slate-600">{t({ en: 'Progress', ar: 'التقدم' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            {t({ en: 'Overall Implementation Progress', ar: 'التقدم الإجمالي للتنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{t({ en: 'Total Progress', ar: 'التقدم الكلي' })}</span>
              <span className="text-sm font-bold text-blue-600">{stats.progress}%</span>
            </div>
            <Progress value={stats.progress} className="h-3" />
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}/{stats.totalGaps}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}/{stats.totalGaps}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-slate-600 mb-1">{t({ en: 'Remaining', ar: 'متبقي' })}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.planned}/{stats.totalGaps}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Breakdown */}
      <div className="space-y-4">
        {implementationPlan.phases.map((phase, idx) => (
          <Card key={phase.id} className="border-2">
            <CardHeader>
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    phase.status === 'completed' ? 'bg-green-100' :
                    phase.status === 'in_progress' ? 'bg-amber-100' :
                    'bg-blue-100'
                  }`}>
                    <span className="font-bold text-lg">{idx + 1}</span>
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg">{phase.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge className={
                        phase.priority === 'P3' ? 'bg-blue-600' : 'bg-slate-600'
                      }>{phase.priority}</Badge>
                      <Badge variant="outline">{phase.effort}</Badge>
                      <Badge className="bg-green-100 text-green-700">{phase.impact}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Progress value={phase.completeness} className="w-32 mb-1" />
                    <p className="text-xs text-slate-600">{phase.completeness}% Complete</p>
                  </div>
                  {expandedPhases[phase.id] ? (
                    <ChevronDown className="h-5 w-5" />
                  ) : (
                    <ChevronRight className="h-5 w-5" />
                  )}
                </div>
              </button>
            </CardHeader>

            {expandedPhases[phase.id] && (
              <CardContent className="border-t pt-6 space-y-6">
                {/* Gaps in Phase */}
                {phase.gaps?.map((gap, gIdx) => (
                  <div key={gap.id} className="p-4 bg-slate-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg text-slate-900">{gap.title}</h4>
                          <Badge className={
                            gap.status === 'completed' ? 'bg-green-600 text-white' :
                            gap.status === 'in_progress' ? 'bg-amber-600 text-white' :
                            'bg-blue-600 text-white'
                          }>{gap.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{gap.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {gap.effort}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            {gap.impact}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="space-y-3">
                      <p className="font-semibold text-sm text-slate-900">
                        {t({ en: 'Deliverables:', ar: 'المخرجات:' })}
                      </p>
                      {gap.deliverables.map((deliverable, dIdx) => (
                        <div key={dIdx} className="p-3 bg-white rounded border">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {deliverable.type}
                            </Badge>
                            <p className="font-medium text-sm">{deliverable.name}</p>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{deliverable.description}</p>
                          <div className="space-y-1">
                            {deliverable.specs.map((spec, sIdx) => (
                              <div key={sIdx} className="text-xs text-slate-700 flex items-start gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{spec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Integration Points */}
                    {gap.integrationPoints?.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold text-sm text-slate-900 mb-2">
                          {t({ en: 'Integration Points:', ar: 'نقاط التكامل:' })}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {gap.integrationPoints.map((point, pIdx) => (
                            <Badge key={pIdx} variant="outline" className="text-xs">
                              <Layers className="h-3 w-3 mr-1" />
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Test Criteria */}
                    {gap.testCriteria?.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="font-semibold text-sm text-blue-900 mb-2">
                          {t({ en: 'Test Criteria:', ar: 'معايير الاختبار:' })}
                        </p>
                        <ul className="space-y-1">
                          {gap.testCriteria.map((criteria, cIdx) => (
                            <li key={cIdx} className="text-xs text-blue-800">• {criteria}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Phase Dependencies */}
                {(phase.dependencies?.length > 0 || phase.blockers?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4">
                    {phase.dependencies?.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="font-semibold text-sm text-blue-900 mb-2">Dependencies:</p>
                        <ul className="space-y-1">
                          {phase.dependencies.map((dep, dIdx) => (
                            <li key={dIdx} className="text-xs text-blue-800">• {dep}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {phase.blockers?.length > 0 && (
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="font-semibold text-sm text-red-900 mb-2">Blockers:</p>
                        <ul className="space-y-1">
                          {phase.blockers.map((blocker, bIdx) => (
                            <li key={bIdx} className="text-xs text-red-800">• {blocker}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Tracking Mechanism */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            {t({ en: 'Progress Tracking & Report Updates', ar: 'تتبع التقدم وتحديثات التقارير' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg border">
            <p className="font-semibold text-slate-900 mb-3">{t({ en: 'Daily Tracking:', ar: 'التتبع اليومي:' })}</p>
            <ul className="space-y-2">
              {implementationPlan.trackingMechanism.dailyStandups.map((item, idx) => (
                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-900 mb-3">
              {t({ en: 'Report Update Schedule:', ar: 'جدول تحديث التقارير:' })}
            </p>
            <div className="space-y-3">
              {implementationPlan.trackingMechanism.reportUpdates.map((report, idx) => (
                <div key={idx} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{report.report}</p>
                    <Badge variant="outline" className="text-xs">{report.updateFrequency}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {report.fieldsToUpdate.map((field, fIdx) => (
                      <Badge key={fIdx} className="bg-blue-100 text-blue-700 text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Metrics */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            {t({ en: 'Success Metrics', ar: 'مقاييس النجاح' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <p className="font-semibold text-sm text-slate-900 mb-3">Technical</p>
              <ul className="space-y-1">
                {implementationPlan.trackingMechanism.successMetrics.technical.map((metric, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="font-semibold text-sm text-slate-900 mb-3">Business</p>
              <ul className="space-y-1">
                {implementationPlan.trackingMechanism.successMetrics.business.map((metric, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <p className="font-semibold text-sm text-slate-900 mb-3">User</p>
              <ul className="space-y-1">
                {implementationPlan.trackingMechanism.successMetrics.user.map((metric, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1">
                    <CheckCircle2 className="h-3 w-3 text-purple-600 mt-0.5 flex-shrink-0" />
                    <span>{metric}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rollout Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            {t({ en: 'Rollout Strategy', ar: 'استراتيجية الطرح' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="font-semibold text-indigo-900 mb-2">Approach: {implementationPlan.rolloutStrategy.approach}</p>
          </div>

          <div className="space-y-3">
            {implementationPlan.rolloutStrategy.phases.map((rolloutPhase, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-indigo-600 text-white">{rolloutPhase.phase}</Badge>
                  <span className="text-sm font-medium">{rolloutPhase.duration}</span>
                </div>
                <ul className="space-y-1">
                  {rolloutPhase.activities.map((activity, aIdx) => (
                    <li key={aIdx} className="text-xs text-slate-700">• {activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-slate-600 mb-1">Rollback Plan:</p>
              <p className="text-sm text-slate-900">{implementationPlan.rolloutStrategy.rollback}</p>
            </div>
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <p className="text-xs text-slate-600 mb-1">Monitoring:</p>
              <p className="text-sm text-slate-900">{implementationPlan.rolloutStrategy.monitoring}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            {t({ en: 'Risk Assessment & Mitigation', ar: 'تقييم المخاطر والتخفيف' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {implementationPlan.riskAssessment.map((risk, idx) => (
              <div key={idx} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-slate-900">{risk.risk}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{risk.likelihood}</Badge>
                    <Badge className={
                      risk.impact === 'Low' ? 'bg-green-100 text-green-700' :
                      risk.impact === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    } size="sm">{risk.impact}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-600 mb-1">Mitigation:</p>
                    <p className="text-slate-900">{risk.mitigation}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Contingency:</p>
                    <p className="text-slate-900">{risk.contingency}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            {t({ en: 'Resource Allocation', ar: 'تخصيص الموارد' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border text-center">
              <p className="text-2xl font-bold text-teal-600">{implementationPlan.resources.development}</p>
              <p className="text-xs text-slate-600">Developer</p>
            </div>
            <div className="p-4 bg-white rounded-lg border text-center">
              <p className="text-2xl font-bold text-blue-600">{implementationPlan.resources.estimatedHours}h</p>
              <p className="text-xs text-slate-600">Total Hours</p>
            </div>
            <div className="p-4 bg-white rounded-lg border text-center">
              <p className="text-2xl font-bold text-purple-600">{implementationPlan.resources.breakdown.coding}h</p>
              <p className="text-xs text-slate-600">Coding</p>
            </div>
            <div className="p-4 bg-white rounded-lg border text-center">
              <p className="text-2xl font-bold text-green-600">{implementationPlan.resources.breakdown.testing}h</p>
              <p className="text-xs text-slate-600">Testing</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Line */}
      <Card className="border-2 border-green-400 bg-gradient-to-br from-green-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-900 text-lg mb-2">
                {t({ en: '✅ Solutions Module: 100% COMPLETE - All 53 Gaps Resolved', ar: '✅ وحدة الحلول: 100% مكتملة - جميع 53 فجوة محلولة' })}
              </p>
              <p className="text-sm text-green-800 mb-3">
                {t({
                  en: 'All 45 core gaps + 8 optional enhancements fully implemented. Module ready for production.',
                  ar: 'جميع 45 فجوة أساسية + 8 تحسينات اختيارية منفذة بالكامل. الوحدة جاهزة للإنتاج.'
                })}
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Estimated Duration:</span>
                  <p className="font-bold text-green-900">{stats.totalDays} days</p>
                </div>
                <div>
                  <span className="text-slate-600">Effort:</span>
                  <p className="font-bold text-green-900">{implementationPlan.resources.estimatedHours} hours</p>
                </div>
                <div>
                  <span className="text-slate-600">Priority:</span>
                  <p className="font-bold text-blue-900">{implementationPlan.overview.priority}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(SolutionsImplementationPlan, { requireAdmin: true });