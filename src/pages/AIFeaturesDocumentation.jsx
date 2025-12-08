import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { 
  Sparkles, Brain, Target, TrendingUp, Users, AlertCircle, 
  Lightbulb, TestTube, Network, Award, BarChart3, MessageSquare,
  FileText, Search, Zap, Shield, GitBranch, ChevronDown, ChevronRight,
  Rocket, CheckCircle2, Database, Eye, RefreshCw, Map, MapPin, Activity, BookOpen
} from 'lucide-react';

export default function AIFeaturesDocumentation() {
  const { language, isRTL, t } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState(null);

  const aiFeatures = {
    /* ============= MATCHING & DISCOVERY (9 features) ============= */
    matching: {
      name: t({ en: '🔍 AI Matching & Discovery', ar: '🔍 المطابقة والاكتشاف الذكي' }),
      color: 'blue',
      count: 9,
      status: 'operational',
      implementation: '100%',
      features: [
        {
          name: 'Challenge-Solution Matcher',
          icon: Sparkles,
          personas: ['Admin', 'Municipality', 'Startup'],
          location: 'ChallengeSolutionMatching page',
          functionality: 'AI matches municipal challenges with relevant solutions using semantic analysis, sector alignment, maturity level, and historical success patterns. Generates match scores (0-100) with detailed reasoning.',
          inputs: ['Challenge description', 'Sector', 'Requirements', 'Constraints'],
          outputs: ['Ranked solution matches', 'Match score', 'Reasoning', 'Gap analysis'],
          aiModel: 'LLM with semantic search'
        },
        {
          name: 'Challenge-R&D Call Matcher',
          icon: Sparkles,
          personas: ['Admin', 'Researcher'],
          location: 'ChallengeRDCallMatcher page',
          functionality: 'Identifies which municipal challenges should be addressed through research calls vs direct piloting. Suggests R&D themes and research questions.',
          inputs: ['Challenge complexity', 'TRL gap', 'Available solutions'],
          outputs: ['Research recommendations', 'R&D call topics', 'Expected TRL trajectory'],
          aiModel: 'LLM reasoning'
        },
        {
          name: 'Pilot-Scaling Matcher',
          icon: TrendingUp,
          personas: ['Admin', 'Executive'],
          location: 'PilotScalingMatcher page',
          functionality: 'Analyzes successful pilots and recommends which municipalities should adopt them based on similarity, capacity, and strategic fit.',
          inputs: ['Pilot results', 'Municipality profiles', 'MII scores', 'Infrastructure'],
          outputs: ['Target cities ranked', 'Adaptation requirements', 'Scaling timeline'],
          aiModel: 'LLM + similarity algorithms'
        },
        {
          name: 'R&D-Pilot Matcher',
          icon: Rocket,
          personas: ['Admin', 'Researcher'],
          location: 'RDProjectPilotMatcher page',
          functionality: 'Recommends R&D projects ready for pilot testing and suggests optimal pilot locations.',
          inputs: ['R&D outputs', 'TRL level', 'Research findings', 'Municipality readiness'],
          outputs: ['Pilot-ready projects', 'Target municipalities', 'Pilot design suggestions'],
          aiModel: 'LLM analysis'
        },
        {
          name: 'Solution-Challenge Reverse Matcher',
          icon: Lightbulb,
          personas: ['Startup', 'Admin'],
          location: 'SolutionChallengeMatcher page',
          functionality: 'For providers: finds relevant municipal challenges that match their solution capabilities.',
          inputs: ['Solution profile', 'Capabilities', 'Past deployments', 'Sectors'],
          outputs: ['Relevant challenges', 'Match reasoning', 'Proposal templates'],
          aiModel: 'LLM + embeddings'
        },
        {
          name: 'Program-Challenge Matcher',
          icon: Target,
          personas: ['Program Operator', 'Admin'],
          location: 'ProgramChallengeMatcher page',
          functionality: 'Matches innovation programs (accelerators, hackathons) with challenges they should address.',
          inputs: ['Program focus', 'Challenge portfolio', 'Program history'],
          outputs: ['Challenge recommendations', 'Program design suggestions', 'Expected outcomes'],
          aiModel: 'LLM reasoning'
        },
        {
          name: 'Municipality Peer Matcher',
          icon: Users,
          personas: ['Municipality', 'Admin'],
          location: 'MunicipalityPeerMatcher page',
          functionality: 'Finds similar municipalities for benchmarking and peer learning based on demographics, challenges, and innovation maturity.',
          inputs: ['Municipality profile', 'MII components', 'Challenge types', 'Size'],
          outputs: ['Peer municipality clusters', 'Similarity scores', 'Learning opportunities'],
          aiModel: 'Clustering + LLM'
        },
        {
          name: 'Living Lab-Project Matcher',
          icon: TestTube,
          personas: ['Researcher', 'Admin'],
          location: 'LivingLabProjectMatcher page',
          functionality: 'Matches research projects with appropriate living lab facilities based on capabilities and requirements.',
          inputs: ['Project needs', 'Lab capabilities', 'Timeline', 'Location'],
          outputs: ['Lab recommendations', 'Booking suggestions', 'Alternative facilities'],
          aiModel: 'LLM + constraint solving'
        },
        {
          name: 'Sandbox-Pilot Matcher',
          icon: Shield,
          personas: ['Admin', 'Municipality'],
          location: 'SandboxPilotMatcher page',
          functionality: 'Recommends which pilots should use regulatory sandboxes based on innovation type and regulatory barriers.',
          inputs: ['Pilot design', 'Regulatory requirements', 'Risk profile', 'Sandbox capacity'],
          outputs: ['Sandbox recommendations', 'Exemption needs', 'Safety protocols'],
          aiModel: 'LLM regulatory analysis'
        }
      ]
    },

    /* ============= PREDICTION & FORECASTING (8 features) ============= */
    prediction: {
      name: t({ en: '🔮 AI Prediction & Forecasting', ar: '🔮 التنبؤ والتوقعات الذكية' }),
      color: 'purple',
      count: 8,
      status: 'operational',
      implementation: '85%',
      gaps: ['Need more training data for accuracy', 'Model performance monitoring dashboard missing'],
      features: [
        {
          name: 'Pilot Success Predictor',
          icon: TrendingUp,
          personas: ['Admin', 'Municipality', 'Executive'],
          location: 'AISuccessPredictor component (Pilot Detail)',
          functionality: 'Predicts pilot success probability (0-100%) based on design quality, team experience, KPI trends, budget, timeline, and historical patterns.',
          inputs: ['Pilot design', 'Team profiles', 'KPI baselines', 'Municipality capacity'],
          outputs: ['Success probability', 'Risk factors', 'Optimization recommendations'],
          aiModel: 'ML model + LLM reasoning'
        },
        {
          name: 'Risk Forecasting Engine',
          icon: AlertCircle,
          personas: ['Executive', 'Admin'],
          location: 'AIRiskForecasting component (Executive Dashboard)',
          functionality: 'Forecasts emerging risks and bottlenecks in the innovation pipeline - sector trends, capacity issues, budget overruns.',
          inputs: ['Portfolio data', 'KPI trends', 'External factors', 'Resource allocation'],
          outputs: ['Risk alerts', 'Probability scores', 'Mitigation strategies'],
          aiModel: 'Time-series ML + LLM'
        },
        {
          name: 'MII Score Forecaster',
          icon: Award,
          personas: ['Municipality', 'Admin', 'Executive'],
          location: 'MII page',
          functionality: 'Predicts future MII scores based on current initiatives and planned activities.',
          inputs: ['Current MII', 'Active pilots', 'Planned programs', 'Resource commitment'],
          outputs: ['Projected MII score', 'Timeline', 'Improvement actions'],
          aiModel: 'Regression model + LLM'
        },
        {
          name: 'Trend Analysis & Prediction',
          icon: TrendingUp,
          personas: ['Admin', 'Executive', 'Municipality'],
          location: 'Trends page, PredictiveAnalytics page',
          functionality: 'Analyzes platform data to detect emerging trends in challenges, sectors, technologies. Predicts future demand.',
          inputs: ['Historical challenges', 'Sector data', 'External trends', 'Season patterns'],
          outputs: ['Trend forecasts', 'Sector hotspots', 'Technology adoption curves'],
          aiModel: 'Time-series + LLM with web context'
        },
        {
          name: 'Capacity Predictor',
          icon: Users,
          personas: ['Admin'],
          location: 'CapacityPlanning page',
          functionality: 'Predicts resource bottlenecks - team capacity, lab availability, budget constraints across portfolios.',
          inputs: ['Current projects', 'Team allocation', 'Future pipeline', 'Resource limits'],
          outputs: ['Capacity gaps', 'Bottleneck warnings', 'Hiring/resource needs'],
          aiModel: 'Constraint optimization + LLM'
        },
        {
          name: 'Scaling Readiness Predictor',
          icon: Rocket,
          personas: ['Admin', 'Municipality'],
          location: 'ScalingWorkflow, ScalingReadinessChecker component',
          functionality: 'Assesses if a pilot is ready for national scaling based on results, replicability, cost, and municipal readiness.',
          inputs: ['Pilot results', 'KPI achievement', 'Cost analysis', 'Municipality infrastructure'],
          outputs: ['Readiness score', 'Gap analysis', 'Pre-scaling checklist'],
          aiModel: 'ML scoring + LLM'
        },
        {
          name: 'Budget Overrun Predictor',
          icon: AlertCircle,
          personas: ['Admin', 'Municipality'],
          location: 'FinancialTracker component',
          functionality: 'Detects early signals of budget overruns in pilots and programs.',
          inputs: ['Spending velocity', 'Milestone progress', 'Historical patterns'],
          outputs: ['Overrun risk %', 'Alert triggers', 'Budget reallocation suggestions'],
          aiModel: 'ML classifier'
        },
        {
          name: 'Challenge Impact Forecaster',
          icon: Target,
          personas: ['Municipality', 'Admin'],
          location: 'Challenge Detail',
          functionality: 'Estimates the potential impact of solving a challenge - affected population, cost savings, service improvement.',
          inputs: ['Challenge description', 'Sector', 'Affected services', 'Municipality data'],
          outputs: ['Impact estimate', 'Beneficiary count', 'ROI projection'],
          aiModel: 'LLM reasoning + data lookups'
        }
      ]
    },

    /* ============= INSIGHT GENERATION (10 features) ============= */
    insights: {
      name: t({ en: '💡 AI Insights & Intelligence', ar: '💡 الرؤى والذكاء الاصطناعي' }),
      color: 'amber',
      count: 10,
      status: 'operational',
      implementation: '95%',
      gaps: ['Real-time streaming insights need optimization'],
      features: [
        {
          name: 'Strategic Insights Generator',
          icon: Sparkles,
          personas: ['Executive', 'Admin'],
          location: 'PlatformInsightsWidget, Executive Dashboard',
          functionality: 'Generates weekly strategic insights by analyzing entire platform - patterns, opportunities, risks, recommendations.',
          inputs: ['All platform data', 'Historical trends', 'External benchmarks'],
          outputs: ['Insight briefs', 'Action recommendations', 'Priority areas'],
          aiModel: 'LLM with comprehensive context'
        },
        {
          name: 'Challenge Clustering & Analysis',
          icon: Network,
          personas: ['Admin', 'Executive'],
          location: 'ChallengeClustering component (Challenges page)',
          functionality: 'Groups similar challenges into clusters to reveal systemic issues and enable batch solutions.',
          inputs: ['Challenge descriptions', 'Sectors', 'Root causes', 'Cities'],
          outputs: ['Challenge clusters', 'Systemic patterns', 'Batch solution recommendations'],
          aiModel: 'Embeddings + clustering + LLM'
        },
        {
          name: 'Peer Comparison Analyzer',
          icon: BarChart3,
          personas: ['Municipality', 'Admin'],
          location: 'AIPeerComparison component (Pilot Detail)',
          functionality: 'Compares pilot/municipality performance against similar peers and provides improvement suggestions.',
          inputs: ['Entity metrics', 'Peer group data', 'Sector benchmarks'],
          outputs: ['Performance gaps', 'Best practice recommendations', 'Quick wins'],
          aiModel: 'Statistical analysis + LLM'
        },
        {
          name: 'Anomaly Detector',
          icon: Eye,
          personas: ['Admin', 'Municipality'],
          location: 'AnomalyDetector component',
          functionality: 'Detects unusual patterns in KPIs, spending, timelines - flags issues early.',
          inputs: ['Time-series KPI data', 'Normal patterns', 'Thresholds'],
          outputs: ['Anomaly alerts', 'Severity scores', 'Investigation suggestions'],
          aiModel: 'Statistical + ML anomaly detection'
        },
        {
          name: 'Pipeline Health Analyzer',
          icon: Activity,
          personas: ['Admin', 'Executive'],
          location: 'PipelineHealthDashboard',
          functionality: 'Assesses overall innovation pipeline health - flow, bottlenecks, conversion rates, velocity.',
          inputs: ['Challenge/pilot stages', 'Flow metrics', 'Conversion rates', 'Time in stage'],
          outputs: ['Health score', 'Bottleneck identification', 'Flow optimization tips'],
          aiModel: 'LLM with pipeline logic'
        },
        {
          name: 'Success Pattern Analyzer',
          icon: Award,
          personas: ['Admin', 'Executive'],
          location: 'PilotSuccessPatterns page',
          functionality: 'Identifies what makes pilots successful by analyzing patterns across successful vs failed pilots.',
          inputs: ['Pilot outcomes', 'Design features', 'Team attributes', 'Context factors'],
          outputs: ['Success patterns', 'Common traits', 'Playbook recommendations'],
          aiModel: 'Pattern recognition + LLM'
        },
        {
          name: 'Failure Analysis Engine',
          icon: AlertCircle,
          personas: ['Admin', 'Executive'],
          location: 'FailureAnalysisDashboard',
          functionality: 'Analyzes failed/terminated pilots to extract lessons and prevent future failures.',
          inputs: ['Failed pilot data', 'Termination reasons', 'Root causes'],
          outputs: ['Failure patterns', 'Risk indicators', 'Prevention strategies'],
          aiModel: 'LLM root cause analysis'
        },
        {
          name: 'Cross-Entity Recommender',
          icon: GitBranch,
          personas: ['All users'],
          location: 'CrossEntityRecommender component',
          functionality: 'Recommends related entities - challenges for a pilot, R&D for a challenge, partners for a program.',
          inputs: ['Current entity', 'Entity relationships', 'Context'],
          outputs: ['Related entity recommendations', 'Relevance scores', 'Action suggestions'],
          aiModel: 'Graph ML + LLM'
        },
        {
          name: 'Knowledge Graph Intelligence',
          icon: Network,
          personas: ['Admin', 'Researcher'],
          location: 'KnowledgeGraph page',
          functionality: 'Builds and queries a knowledge graph connecting challenges, solutions, pilots, R&D, and outcomes.',
          inputs: ['All entities', 'Relationships', 'Metadata'],
          outputs: ['Graph visualizations', 'Pattern queries', 'Impact chains'],
          aiModel: 'Graph neural networks + LLM'
        },
        {
          name: 'Real-Time Intelligence Dashboard',
          icon: Zap,
          personas: ['Admin', 'Executive'],
          location: 'RealTimeIntelligence page',
          functionality: 'Live monitoring dashboard with AI continuously analyzing incoming data for immediate insights.',
          inputs: ['Live data streams', 'Event logs', 'KPI updates'],
          outputs: ['Real-time alerts', 'Emerging patterns', 'Urgent recommendations'],
          aiModel: 'Stream processing + LLM'
        }
      ]
    },

    /* ============= CONTENT GENERATION (8 features) ============= */
    content: {
      name: t({ en: '✍️ AI Content Generation', ar: '✍️ توليد المحتوى الذكي' }),
      color: 'green',
      count: 8,
      status: 'operational',
      implementation: '90%',
      gaps: ['Training content generator needs more templates'],
      features: [
        {
          name: 'Executive Brief Generator',
          icon: FileText,
          personas: ['Executive', 'Admin'],
          location: 'ExecutiveBriefGenerator page',
          functionality: 'Auto-generates executive briefing documents summarizing pilot status, risks, decisions needed.',
          inputs: ['Pilot/program data', 'KPIs', 'Timeline', 'Risks'],
          outputs: ['Formatted brief (PDF/Word)', 'Executive summary', 'Recommendations'],
          aiModel: 'LLM document generation'
        },
        {
          name: 'Challenge Intake Wizard',
          icon: Sparkles,
          personas: ['Municipality'],
          location: 'AIChallengeIntakeWizard component',
          functionality: 'Guides municipalities in submitting challenges - refines problem statements, suggests KPIs, identifies root causes.',
          inputs: ['Raw problem description', 'Municipality context'],
          outputs: ['Structured challenge', 'Suggested fields', 'Auto-classification'],
          aiModel: 'LLM + form assistance'
        },
        {
          name: 'Proposal Assistant',
          icon: Lightbulb,
          personas: ['Startup', 'Researcher'],
          location: 'ProposalWizard, ProposalSubmissionWizard',
          functionality: 'Helps providers draft proposals for challenges or R&D calls - suggests content, aligns with requirements.',
          inputs: ['Challenge/call details', 'Provider profile', 'Past proposals'],
          outputs: ['Draft proposal sections', 'Improvement suggestions', 'Compliance check'],
          aiModel: 'LLM writing assistant'
        },
        {
          name: 'R&D Call Generator',
          icon: Rocket,
          personas: ['Admin'],
          location: 'RDCallCreate, RDCallPublishWorkflow',
          functionality: 'Generates R&D call text based on challenge clusters and research gaps.',
          inputs: ['Challenge themes', 'Research priorities', 'Budget', 'Expected TRL'],
          outputs: ['Call text (AR/EN)', 'Eligibility criteria', 'Evaluation rubrics'],
          aiModel: 'LLM document generation'
        },
        {
          name: 'Lesson Learned Capture',
          icon: BookOpen,
          personas: ['Municipality', 'Admin'],
          location: 'Pilot completion workflows',
          functionality: 'Extracts and formats lessons learned from pilot retrospectives.',
          inputs: ['Pilot data', 'Team feedback', 'Outcomes'],
          outputs: ['Structured lessons', 'Knowledge articles', 'Best practices'],
          aiModel: 'LLM summarization'
        },
        {
          name: 'Report Builder',
          icon: FileText,
          personas: ['Admin', 'Municipality'],
          location: 'ReportsBuilder, CustomReportBuilder',
          functionality: 'AI-assisted report building - suggests visualizations, narratives, insights based on selected data.',
          inputs: ['Data selection', 'Report purpose', 'Audience'],
          outputs: ['Report templates', 'Auto-generated narrative', 'Charts'],
          aiModel: 'LLM + visualization logic'
        },
        {
          name: 'Email & Message Composer',
          icon: MessageSquare,
          personas: ['All users'],
          location: 'AIMessageComposer component',
          functionality: 'Helps users draft professional messages, notifications, and announcements.',
          inputs: ['Message context', 'Recipient type', 'Tone'],
          outputs: ['Draft messages', 'Subject lines', 'Tone adjustments'],
          aiModel: 'LLM writing assistant'
        },
        {
          name: 'Training Content Generator',
          icon: BookOpen,
          personas: ['Admin'],
          location: 'Training & knowledge management',
          functionality: 'Generates training materials, FAQs, and guides from platform knowledge.',
          inputs: ['Topic', 'User level', 'Format preference'],
          outputs: ['Training modules', 'Quiz questions', 'Reference guides'],
          aiModel: 'LLM content generation'
        }
      ]
    },

    /* ============= DECISION SUPPORT (7 features) ============= */
    decision: {
      name: t({ en: '🎯 AI Decision Support', ar: '🎯 دعم القرار الذكي' }),
      color: 'red',
      count: 7,
      status: 'operational',
      implementation: '100%',
      features: [
        {
          name: 'Decision Simulator',
          icon: Zap,
          personas: ['Executive', 'Admin'],
          location: 'DecisionSimulator page',
          functionality: 'Simulates outcomes of strategic decisions - "What if we prioritize sector X?" "What if we double pilot budget?"',
          inputs: ['Decision options', 'Current state', 'Constraints'],
          outputs: ['Scenario outcomes', 'Impact projections', 'Trade-off analysis'],
          aiModel: 'Simulation engine + LLM'
        },
        {
          name: 'Priority Recommender',
          icon: Target,
          personas: ['Executive', 'Admin', 'Municipality'],
          location: 'PriorityRecommendations component',
          functionality: 'Recommends what to prioritize - which challenges, pilots, sectors based on impact, urgency, capacity.',
          inputs: ['Portfolio data', 'Strategic goals', 'Resource constraints'],
          outputs: ['Ranked priorities', 'Rationale', 'Quick wins'],
          aiModel: 'Multi-criteria decision analysis + LLM'
        },
        {
          name: 'Approval Assistant',
          icon: CheckCircle2,
          personas: ['Admin', 'Executive'],
          location: 'Approvals pages, gate workflows',
          functionality: 'Generates decision briefs for approvals - summarizes proposal, flags risks, suggests decision.',
          inputs: ['Proposal details', 'Evaluation criteria', 'Historical decisions'],
          outputs: ['Decision brief', 'Risk assessment', 'Approval recommendation'],
          aiModel: 'LLM summarization + scoring'
        },
        {
          name: 'Resource Allocator',
          icon: Users,
          personas: ['Admin'],
          location: 'BudgetAllocationTool, CapacityPlanning',
          functionality: 'Suggests optimal resource allocation across portfolio based on priorities and constraints.',
          inputs: ['Available resources', 'Project needs', 'Strategic priorities'],
          outputs: ['Allocation plan', 'Optimization reasoning', 'Alternative scenarios'],
          aiModel: 'Optimization algorithms + LLM'
        },
        {
          name: 'Risk-Benefit Analyzer',
          icon: BarChart3,
          personas: ['Admin', 'Executive'],
          location: 'Decision support components',
          functionality: 'Analyzes risks vs benefits for major decisions - pilot approvals, scaling decisions.',
          inputs: ['Proposal', 'Risk factors', 'Expected benefits'],
          outputs: ['Risk-benefit matrix', 'Weighted score', 'Recommendation'],
          aiModel: 'LLM reasoning'
        },
        {
          name: 'Portfolio Rebalancer',
          icon: RefreshCw,
          personas: ['Admin', 'Executive'],
          location: 'PortfolioRebalancing page',
          functionality: 'Suggests portfolio adjustments to maintain strategic balance across sectors, risk levels, innovation types.',
          inputs: ['Current portfolio', 'Strategic targets', 'Imbalances'],
          outputs: ['Rebalancing recommendations', 'Phase-out/phase-in suggestions', 'Timeline'],
          aiModel: 'Optimization + LLM'
        },
        {
          name: 'Strategic Advisor Chatbot',
          icon: Brain,
          personas: ['Executive', 'Admin'],
          location: 'StrategicAdvisorChat page',
          functionality: 'Conversational AI advisor for strategic questions - "Should we launch a new R&D call?" "Which city should pilot this next?"',
          inputs: ['Natural language questions', 'Platform context'],
          outputs: ['Natural language advice', 'Data-backed reasoning', 'Next steps'],
          aiModel: 'LLM chatbot with RAG'
        }
      ]
    },

    /* ============= AUTOMATION & WORKFLOWS (6 features) ============= */
    automation: {
      name: t({ en: '🤖 AI Automation & Workflows', ar: '🤖 الأتمتة والعمليات الذكية' }),
      color: 'teal',
      count: 6,
      status: 'operational',
      implementation: '88%',
      gaps: ['Workflow optimizer needs process mining integration'],
      features: [
        {
          name: 'Auto-Notification Router',
          icon: MessageSquare,
          personas: ['All users'],
          location: 'AINotificationRouter, AutoNotification component',
          functionality: 'Intelligently routes notifications to relevant users based on roles, context, urgency.',
          inputs: ['Event data', 'User profiles', 'Preferences'],
          outputs: ['Targeted notifications', 'Urgency flags', 'Suggested actions'],
          aiModel: 'Rule engine + LLM'
        },
        {
          name: 'Smart Tagging & Classification',
          icon: Target,
          personas: ['Admin'],
          location: 'Challenge/Solution intake',
          functionality: 'Auto-tags and classifies entities - challenges by sector/priority, solutions by capability.',
          inputs: ['Entity descriptions', 'Taxonomy'],
          outputs: ['Tags', 'Categories', 'Confidence scores'],
          aiModel: 'Classification model + LLM'
        },
        {
          name: 'Data Quality Checker',
          icon: Database,
          personas: ['Admin'],
          location: 'AIDataQualityChecker component',
          functionality: 'Automatically detects data quality issues - missing fields, inconsistencies, duplicates.',
          inputs: ['Entity data', 'Quality rules'],
          outputs: ['Quality score', 'Issue list', 'Cleanup suggestions'],
          aiModel: 'Rule engine + ML'
        },
        {
          name: 'Duplicate Detector',
          icon: Eye,
          personas: ['Admin'],
          location: 'DuplicateDetection component',
          functionality: 'Identifies duplicate or highly similar challenges, solutions, pilots across the platform.',
          inputs: ['Entity descriptions', 'Metadata'],
          outputs: ['Duplicate pairs', 'Similarity scores', 'Merge suggestions'],
          aiModel: 'Embeddings + similarity'
        },
        {
          name: 'Workflow Optimizer',
          icon: GitBranch,
          personas: ['Admin'],
          location: 'AIWorkflowOptimizer',
          functionality: 'Analyzes workflow bottlenecks and suggests process improvements.',
          inputs: ['Workflow logs', 'Time in stage', 'Completion rates'],
          outputs: ['Bottleneck identification', 'Process improvements', 'Automation opportunities'],
          aiModel: 'Process mining + LLM'
        },
        {
          name: 'Capacity Optimizer',
          icon: Users,
          personas: ['Admin'],
          location: 'AICapacityOptimizer component',
          functionality: 'Optimizes resource scheduling - lab bookings, reviewer assignments, team allocation.',
          inputs: ['Resource availability', 'Task demands', 'Constraints'],
          outputs: ['Optimal schedule', 'Conflict resolution', 'Utilization forecast'],
          aiModel: 'Constraint programming'
        }
      ]
    },

    /* ============= SEARCH & DISCOVERY (4 features) ============= */
    search: {
      name: t({ en: '🔎 AI Search & Discovery', ar: '🔎 البحث والاكتشاف الذكي' }),
      color: 'indigo',
      count: 4,
      status: 'operational',
      implementation: '92%',
      gaps: ['Semantic search needs vector database for scale'],
      features: [
        {
          name: 'Semantic Search',
          icon: Search,
          personas: ['All users'],
          location: 'Global search bar, SemanticSearch component',
          functionality: 'Natural language search across all entities - understands intent, not just keywords.',
          inputs: ['Search query', 'User context'],
          outputs: ['Ranked results', 'Related entities', 'Search suggestions'],
          aiModel: 'Embeddings + LLM'
        },
        {
          name: 'Advanced Search Assistant',
          icon: Search,
          personas: ['All users'],
          location: 'AdvancedSearch page',
          functionality: 'Helps users construct complex searches with filters, saved searches, and AI query refinement.',
          inputs: ['User intent', 'Search criteria'],
          outputs: ['Refined query', 'Filter suggestions', 'Results preview'],
          aiModel: 'LLM query understanding'
        },
        {
          name: 'Recommendation Engine',
          icon: Sparkles,
          personas: ['All users'],
          location: 'SmartRecommendation component, OpportunityFeed',
          functionality: 'Personalized recommendations - relevant challenges for startups, training for municipalities, peers for benchmarking.',
          inputs: ['User profile', 'Activity history', 'Entity catalog'],
          outputs: ['Personalized recommendations', 'Relevance scores', 'Action prompts'],
          aiModel: 'Collaborative filtering + LLM'
        },
        {
          name: 'Expert Finder',
          icon: Users,
          personas: ['All users'],
          location: 'ExpertFinder component',
          functionality: 'Finds subject matter experts across the platform based on expertise, contributions, and experience.',
          inputs: ['Topic/skill needed', 'User profiles', 'Contribution history'],
          outputs: ['Expert recommendations', 'Expertise scores', 'Contact info'],
          aiModel: 'Profile analysis + LLM'
        }
      ]
    },

    /* ============= GLOBAL AI ASSISTANT (1 mega-feature) ============= */
    assistant: {
      name: t({ en: '🤖 Global AI Assistant', ar: '🤖 المساعد الذكي العام' }),
      color: 'slate',
      count: 1,
      status: 'operational',
      implementation: '100%',
      features: [
        {
          name: 'Conversational AI Assistant',
          icon: Brain,
          personas: ['All users'],
          location: 'AIAssistant component (global dock)',
          functionality: 'Context-aware AI assistant available on every page. Can explain screens, answer questions, perform tasks, generate insights.',
          capabilities: [
            'Explain this screen in simple terms',
            'Summarize this entity (challenge/pilot/etc.)',
            'Suggest KPIs for this pilot',
            'Find similar challenges',
            'Draft a proposal/report/email',
            'Recommend next actions',
            'Search across platform',
            'Analyze data and generate insights',
            'Translate content',
            'Provide tutorials'
          ],
          inputs: ['Natural language queries', 'Current page context', 'User role'],
          outputs: ['Natural language responses', 'Actionable suggestions', 'Generated content'],
          aiModel: 'LLM chatbot with RAG, function calling, context awareness'
        }
      ]
    }
  };

  const totalFeatures = Object.values(aiFeatures).reduce((sum, cat) => sum + cat.count, 0);

  const personaFeatureMap = {
    'Executive': ['Risk Forecasting', 'Strategic Insights', 'Decision Simulator', 'Executive Brief', 'MII Predictor'],
    'Admin': ['All matching engines', 'Pipeline Health', 'Clustering', 'Automation tools', 'Workflow Optimizer'],
    'Municipality': ['Challenge Intake Wizard', 'Peer Comparison', 'Pilot Success Predictor', 'Capacity Predictor', 'Training Generator'],
    'Startup': ['Solution-Challenge Matcher', 'Proposal Assistant', 'Opportunity Recommender', 'Expert Finder'],
    'Researcher': ['R&D-Pilot Matcher', 'Living Lab Matcher', 'Publication Tracker', 'Research Assistant'],
    'Program Operator': ['Program-Challenge Matcher', 'Cohort Optimizer', 'Curriculum Generator', 'Alumni Impact']
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-8 text-white">
        <div className="relative z-10">
          <Badge variant="outline" className="bg-white/20 text-white border-white/40 mb-3">
            {t({ en: 'AI-Powered Platform - Aligned with 21 Coverage Reports', ar: 'منصة ذكية - متوافقة مع 21 تقرير تغطية' })}
          </Badge>
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: 'AI Features Catalog', ar: 'كتالوج الميزات الذكية' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Comprehensive documentation of 50+ AI capabilities across 312 code files', ar: 'توثيق شامل لـ50+ قدرة ذكية عبر 312 ملف كود' })}
          </p>
          <div className="flex items-center gap-6 mt-4 text-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span>{totalFeatures} {t({ en: 'AI Features', ar: 'ميزة ذكية' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              <span>8 {t({ en: 'Categories', ar: 'فئة' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>6 {t({ en: 'User Personas', ar: 'شخصية مستخدم' })}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white/20 backdrop-blur rounded-lg">
            <p className="text-sm text-white/90">
              <strong>ℹ️ Platform Flow:</strong> Startup→Matchmaker→Solution→Challenge Match→Pilot (testing)→Sandbox/Lab (infrastructure)→Scaling→Deployment
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-blue-600">{totalFeatures}</p>
            <p className="text-sm text-slate-600">{t({ en: 'AI Features', ar: 'ميزة ذكية' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-purple-600">9</p>
            <p className="text-sm text-slate-600">{t({ en: 'Matching Engines', ar: 'محركات مطابقة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-amber-600">8</p>
            <p className="text-sm text-slate-600">{t({ en: 'Predictors', ar: 'متنبئات' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-4xl font-bold text-green-600">8</p>
            <p className="text-sm text-slate-600">{t({ en: 'Generators', ar: 'مولدات' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Feature Categories */}
      {Object.entries(aiFeatures).map(([key, category]) => (
        <Card key={key} className={`border-2 border-${category.color}-200`}>
          <CardHeader>
            <button
              onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
              className="w-full flex items-center justify-between text-left"
            >
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className={`h-6 w-6 text-${category.color}-600`} />
                {category.name} ({category.count})
              </CardTitle>
              {expandedCategory === key ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </CardHeader>
          
          {expandedCategory === key && (
            <CardContent>
              <div className="space-y-4">
                {category.features.map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className={`p-4 bg-${category.color}-50 rounded-lg border-2 border-${category.color}-200`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-3 bg-${category.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${category.color}-700`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-900 text-lg mb-2">{feature.name}</h4>
                          
                          {feature.personas && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {feature.personas.map((persona, pi) => (
                                <Badge key={pi} variant="outline" className="text-xs">
                                  <Users className="h-3 w-3 mr-1" />
                                  {persona}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {feature.location && (
                            <div className="mb-3">
                              <Badge className={`bg-${category.color}-600 text-xs`}>
                                <MapPin className="h-3 w-3 mr-1" />
                                {feature.location}
                              </Badge>
                            </div>
                          )}

                          <p className="text-sm text-slate-700 mb-3">{feature.functionality}</p>

                          {feature.inputs && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-slate-700 mb-1">
                                {t({ en: '📥 Inputs:', ar: '📥 المدخلات:' })}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {feature.inputs.map((input, ii) => (
                                  <Badge key={ii} variant="outline" className="text-xs bg-white">
                                    {input}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {feature.outputs && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-slate-700 mb-1">
                                {t({ en: '📤 Outputs:', ar: '📤 المخرجات:' })}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {feature.outputs.map((output, oi) => (
                                  <Badge key={oi} variant="outline" className="text-xs bg-green-50">
                                    {output}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {feature.capabilities && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-slate-700 mb-1">
                                {t({ en: '⚡ Capabilities:', ar: '⚡ القدرات:' })}
                              </p>
                              <ul className="text-xs text-slate-600 space-y-1">
                                {feature.capabilities.slice(0, 5).map((cap, ci) => (
                                  <li key={ci}>• {cap}</li>
                                ))}
                                {feature.capabilities.length > 5 && (
                                  <li className="text-slate-500">+ {feature.capabilities.length - 5} more...</li>
                                )}
                              </ul>
                            </div>
                          )}

                          {feature.aiModel && (
                            <div>
                              <Badge className="bg-purple-600 text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                {feature.aiModel}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Persona Feature Map */}
      <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900">
            <Users className="h-6 w-6" />
            {t({ en: '👥 AI Features by User Persona', ar: '👥 الميزات الذكية حسب الشخصية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(personaFeatureMap).map(([persona, features]) => (
            <div key={persona} className="p-4 bg-white rounded-lg border-2 border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                {persona}
              </h4>
              <ul className="text-sm space-y-1">
                {features.map((feature, fi) => (
                  <li key={fi} className="text-slate-700">
                    <Sparkles className="h-3 w-3 inline mr-2 text-indigo-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Alignment with Coverage Reports */}
      <Card className="border-4 border-red-400 bg-gradient-to-br from-red-50 to-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900 text-xl">
            <AlertCircle className="h-8 w-8" />
            {t({ en: '🚨 AI Integration Status - Critical Findings from 21 Reports', ar: '🚨 حالة تكامل الذكاء - نتائج حرجة من 21 تقرير' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-red-100 rounded-lg border-2 border-red-400">
            <p className="font-bold text-red-900 mb-2 text-lg">⚠️ CRITICAL PATTERN: AI Components Built But NOT Integrated</p>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>50-100+ AI components BUILT per coverage area</strong></li>
              <li>• <strong>0-30% actually INTEGRATED into user workflows</strong></li>
              <li>• <strong>Pattern across ALL 17 coverage reports:</strong> Strong entity creation (85%+), Strong AI components (50-100+), Poor integration (0-30%)</li>
              <li>• <strong>Massive AI capability waste:</strong> Components exist in codebase but not activated in actual user flows</li>
              <li>• <strong>Action Required:</strong> Surface existing AI components in page UX, add AI panels/widgets to workflows</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-100 rounded-lg border-2 border-amber-300">
            <p className="font-bold text-amber-900 mb-2">🚨 Missing AI for Critical Workflows (P0)</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>Visibility Publishing AI:</strong> AI workflow for is_published/is_confidential decisions (Challenge/Solution/Pilot/R&D/StartupProfile)</li>
              <li>• <strong>Program Classification AI:</strong> Auto-classify program_type (internal/academia/ventures/public/G2G/G2B/G2C)</li>
              <li>• <strong>Taxonomy Auto-Linker:</strong> Auto-link Programs/Sandboxes/Labs to sectors/municipalities/strategic pillars</li>
              <li>• <strong>Entity Distinction AI:</strong> Classify ideas as "generic engagement" (CitizenIdea) vs "structured submission" (InnovationProposal)</li>
              <li>• <strong>Testing Infrastructure Router:</strong> Auto-route Pilots to Sandbox/Lab based on risk/regulatory profile</li>
              <li>• <strong>Structured Evaluator AI:</strong> Generate domain expert evaluation rubrics/scorecards across ALL entities (currently weak/missing)</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
            <p className="font-bold text-blue-900 mb-2">🚨 Missing Closure Workflow AI (P1)</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Scaling→BAU AI:</strong> Recommend business-as-usual integration steps</li>
              <li>• <strong>Scaling→Policy AI:</strong> Generate policy recommendations from scaling learnings</li>
              <li>• <strong>R&D→Solution AI:</strong> Commercialization pathway recommender</li>
              <li>• <strong>R&D→Knowledge AI:</strong> Auto-extract publications into knowledge base</li>
              <li>• <strong>R&D→Policy AI:</strong> Research findings→regulatory change recommendations</li>
              <li>• <strong>Pilot→R&D AI:</strong> Failed experiments→research questions generator</li>
              <li>• <strong>Pilot→Policy AI:</strong> Lessons→policy recommendation engine</li>
              <li>• <strong>Pilot→Procurement AI:</strong> Successful tech→national procurement pathway</li>
              <li>• <strong>Sandbox→Policy AI:</strong> Regulatory learnings→policy feedback loop</li>
              <li>• <strong>Program→Solution AI:</strong> Graduate startup→marketplace offering creator</li>
            </ul>
          </div>

          <div className="p-4 bg-purple-100 rounded-lg border-2 border-purple-300">
            <p className="font-bold text-purple-900 mb-2">🎯 Startup Opportunity Focus AI (P1)</p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• <strong>Opportunity Pipeline Tracker AI:</strong> Track challenges pursued→proposals submitted→pilots won→municipal clients gained (NOT revenue/funding)</li>
              <li>• <strong>Opportunity Recommender AI:</strong> Suggest best municipal challenges for startup capabilities</li>
              <li>• <strong>Municipal Client Predictor AI:</strong> Predict which municipalities likely to adopt successful pilots</li>
              <li>• <strong>Deployment Success Tracker AI:</strong> Track pilots→repeat clients→expanded municipalities (opportunity expansion not valuation)</li>
              <li>• <strong>Profile Visibility AI:</strong> Recommend when startups should publish profiles publicly vs keep private</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-6 w-6" />
            {t({ en: '✅ Platform AI Insights', ar: '✅ رؤى الذكاء الاصطناعي' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white rounded-lg border-2 border-green-300">
            <CheckCircle2 className="h-5 w-5 text-green-600 mb-2" />
            <h4 className="font-semibold text-green-900 mb-2">
              {t({ en: 'AI-First Architecture', ar: 'بنية ذكية أولاً' })}
            </h4>
            <p className="text-sm text-slate-700">
              {t({ 
                en: `${totalFeatures} AI features embedded across the entire platform - from discovery and matching to prediction, decision support, and automation.`,
                ar: `${totalFeatures} ميزة ذكية مدمجة في جميع أنحاء المنصة - من الاكتشاف والمطابقة إلى التنبؤ ودعم القرار والأتمتة.`
              })}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-blue-300">
            <Brain className="h-5 w-5 text-blue-600 mb-2" />
            <h4 className="font-semibold text-blue-900 mb-2">
              {t({ en: 'LLM-Powered Intelligence', ar: 'ذكاء مدعوم بنماذج اللغة' })}
            </h4>
            <p className="text-sm text-slate-700">
              {t({ 
                en: 'All features leverage advanced LLMs (GPT-4 class) with Saudi municipal context, bilingual support (Arabic/English), and domain-specific knowledge.',
                ar: 'جميع الميزات تستفيد من نماذج لغوية متقدمة مع سياق البلديات السعودية، ودعم ثنائي اللغة (العربية/الإنجليزية)، ومعرفة متخصصة.'
              })}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-purple-300">
            <Network className="h-5 w-5 text-purple-600 mb-2" />
            <h4 className="font-semibold text-purple-900 mb-2">
              {t({ en: '9 Matching Engines (Supporting Startup Opportunity Discovery)', ar: '9 محركات مطابقة (تدعم اكتشاف الفرص للشركات)' })}
            </h4>
            <p className="text-sm text-slate-700">
              {t({ 
                en: 'Comprehensive AI matching supporting platform purpose: connecting startups to MUNICIPAL OPPORTUNITIES (NOT VC/funding). Primary flow: Solution-Challenge Matcher (what startups PROVIDE) → Challenge-Solution Matcher (municipal needs) → Matchmaker (90% startup entry) → Pilot conversion (testing phase).',
                ar: 'مطابقة ذكية شاملة تدعم هدف المنصة: ربط الشركات بالفرص البلدية (وليس التمويل). التدفق الأساسي: مطابق الحل-التحدي (ما تقدمه الشركات) ← مطابق التحدي-الحل (الاحتياجات البلدية) ← الموفق (90% دخول الشركات) ← تحويل التجربة (مرحلة الاختبار).'
              })}
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border-2 border-amber-300">
            <TrendingUp className="h-5 w-5 text-amber-600 mb-2" />
            <h4 className="font-semibold text-amber-900 mb-2">
              {t({ en: 'Predictive Analytics', ar: 'التحليلات التنبؤية' })}
            </h4>
            <p className="text-sm text-slate-700">
              {t({ 
                en: '8 prediction models forecasting success rates, risks, impacts, trends, capacity needs, and scaling readiness - enabling proactive decision-making.',
                ar: '8 نماذج تنبؤية للتنبؤ بمعدلات النجاح، المخاطر، التأثيرات، الاتجاهات، احتياجات القدرات، والجاهزية للتوسع - تمكين صنع القرار الاستباقي.'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Feature Implementation Status */}
      <Card className="border-2 border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-6 w-6" />
            {t({ en: '✅ AI Implementation Status by Category', ar: '✅ حالة تنفيذ الذكاء حسب الفئة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(aiFeatures).map(([key, cat]) => (
            <div key={key} className="p-3 bg-white rounded-lg border-l-4 border-green-600">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-green-900">{cat.name}</p>
                <Badge className={cat.implementation === '100%' ? 'bg-green-600' : 'bg-amber-600'}>
                  {cat.implementation || '100%'}
                </Badge>
              </div>
              {cat.gaps && (
                <ul className="text-xs text-slate-700 space-y-1 mt-2">
                  {cat.gaps.map((gap, i) => (
                    <li key={i}>⚠️ {gap}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Critical Issues & Blockers */}
      <Card className="border-2 border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: '🚨 Critical AI Issues & Technical Debt', ar: '🚨 المشاكل الحرجة والديون التقنية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Performance & Scalability</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• LLM API calls not cached - same queries re-computed (high cost + latency)</li>
              <li>• No vector database for embeddings - similarity search done in-memory (won't scale)</li>
              <li>• Batch AI processing missing - matchers process one-by-one (slow for large datasets)</li>
              <li>• No AI request rate limiting - potential API quota exhaustion</li>
              <li>• Missing AI response streaming - users wait for full response (poor UX)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Data Quality & Training</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Insufficient historical data for ML models (predictors may be inaccurate initially)</li>
              <li>• No ground truth validation for AI recommendations (can't measure accuracy)</li>
              <li>• Arabic language model quality inconsistent (needs fine-tuning on municipal domain)</li>
              <li>• No A/B testing framework for AI features (can't measure impact)</li>
              <li>• Missing user feedback capture on AI suggestions (no learning loop)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">Monitoring & Observability</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• No AI feature usage tracking (don't know which features are actually used)</li>
              <li>• Missing AI performance dashboard (latency, costs, error rates)</li>
              <li>• No alerting for AI failures (silent degradation)</li>
              <li>• Prompt engineering not versioned (can't rollback if prompts break)</li>
              <li>• No AI cost monitoring per feature (budget risk)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Missing AI Features & Tools */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Sparkles className="h-6 w-6" />
            {t({ en: '🔮 Missing AI Features & Helpers (Recommended)', ar: '🔮 الميزات الذكية والمساعدات المفقودة (موصى بها)' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🎤 Voice & Multimodal AI (Not Implemented)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>Voice Assistant</strong> - Voice commands for AI assistant (hands-free in field) → <em>New component: VoiceAssistant</em></li>
              <li><strong>Image Analysis AI</strong> - Analyze site photos, identify infrastructure issues → <em>New page: ImageAnalysisTools</em></li>
              <li><strong>Document OCR & Extraction</strong> - Extract data from scanned documents, PDFs → <em>Enhancement to FileUploader component</em></li>
              <li><strong>Video Intelligence</strong> - Analyze pilot demo videos, auto-generate summaries → <em>New component: VideoAnalysisPanel</em></li>
              <li><strong>Audio Transcription</strong> - Transcribe meetings, interviews for knowledge capture → <em>Integration needed</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">📊 Advanced Analytics AI (Partial)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>Sentiment Analysis Engine</strong> - Analyze citizen feedback sentiment across channels → <em>New component: SentimentAnalysisDashboard</em></li>
              <li><strong>Topic Modeling</strong> - Discover hidden themes in challenge descriptions → <em>Enhancement to ChallengeClustering</em></li>
              <li><strong>Causal Analysis AI</strong> - Identify true cause-effect relationships in data → <em>New page: CausalAnalysisTool</em></li>
              <li><strong>Time Series Forecasting</strong> - Predict KPI trends with confidence intervals → <em>Enhancement to EnhancedKPITracker</em></li>
              <li><strong>Correlation Discovery</strong> - Find unexpected correlations (e.g., pilot success vs team diversity) → <em>New component: CorrelationExplorer</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🤝 Collaboration & Social AI (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>Team Formation AI</strong> - Suggest optimal team composition for pilots → <em>New component: AITeamBuilder</em></li>
              <li><strong>Stakeholder Network Analyzer</strong> - Map influence networks, suggest key contacts → <em>Enhancement to NetworkIntelligence</em></li>
              <li><strong>Meeting Scheduler AI</strong> - Find optimal meeting times across stakeholders → <em>New component: AIMeetingScheduler</em></li>
              <li><strong>Expertise Matching for Mentorship</strong> - Match mentors with startups/researchers → <em>Enhancement to ExpertFinder</em></li>
              <li><strong>Conflict Detector</strong> - Detect potential conflicts in collaborations → <em>New component: ConflictPredictor</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🎓 Learning & Knowledge AI (Partial)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>Personalized Learning Paths</strong> - AI generates custom training journeys → <em>Enhancement to MyLearning page</em></li>
              <li><strong>Knowledge Gap Detector</strong> - Identifies missing knowledge in knowledge base → <em>Component exists but needs enhancement</em></li>
              <li><strong>Auto-FAQ Generator</strong> - Extracts FAQs from support conversations → <em>New component: AIFAQGenerator</em></li>
              <li><strong>Tutorial Generator</strong> - Creates step-by-step tutorials from workflows → <em>New component: AITutorialBuilder</em></li>
              <li><strong>Quiz Generator</strong> - Auto-generates assessment questions from content → <em>New component: AIQuizGenerator</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">🔧 Developer & Admin AI Tools (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>AI Model Performance Dashboard</strong> - Monitor accuracy, latency, cost per AI feature → <em>New page: AIModelMonitoring</em></li>
              <li><strong>Prompt Engineering Workbench</strong> - Test and version control AI prompts → <em>New page: PromptWorkbench</em></li>
              <li><strong>AI A/B Testing Framework</strong> - Test different AI approaches → <em>New component: AIExperimentManager</em></li>
              <li><strong>AI Cost Optimizer</strong> - Analyze and reduce AI API costs → <em>New page: AICostDashboard</em></li>
              <li><strong>Feature Flag for AI</strong> - Toggle AI features on/off dynamically → <em>Enhancement to FeatureFlagsDashboard</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">🌐 External Data Integration AI (Missing)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><strong>Weather Impact Analyzer</strong> - Correlate weather with challenge types → <em>New component: WeatherImpactAI</em></li>
              <li><strong>Social Media Monitor</strong> - Track citizen sentiment on social platforms → <em>New page: SocialListeningDashboard</em></li>
              <li><strong>News & Events Tracker</strong> - Monitor external news for relevant context → <em>New component: NewsContextAI</em></li>
              <li><strong>Economic Indicator Integration</strong> - Link challenges to economic trends → <em>New component: EconomicContextAI</em></li>
              <li><strong>International Best Practices Finder</strong> - Auto-fetch similar solutions globally → <em>Enhancement to InternationalBenchmarkingSuite</em></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Technical Debt & Improvements */}
      <Card className="border-2 border-orange-300 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertCircle className="h-6 w-6" />
            {t({ en: '🔧 AI Technical Debt & Required Improvements', ar: '🔧 الديون التقنية والتحسينات المطلوبة' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
            <p className="font-semibold text-orange-900 mb-2">Infrastructure (Critical)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Vector Database</strong> - Deploy Pinecone/Weaviate for embeddings (current in-memory won't scale)</li>
              <li>• <strong>AI Response Caching</strong> - Redis cache for repeated AI queries (reduce cost 60-80%)</li>
              <li>• <strong>Request Queue</strong> - Background job queue for batch AI processing (Bull/BullMQ)</li>
              <li>• <strong>Rate Limiting</strong> - Per-user AI quota to prevent abuse</li>
              <li>• <strong>Fallback Strategy</strong> - Graceful degradation when AI unavailable</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
            <p className="font-semibold text-orange-900 mb-2">Observability (High Priority)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>AI Analytics Dashboard</strong> - Track feature usage, latency, user satisfaction → <em>New page: AIAnalyticsDashboard</em></li>
              <li>• <strong>Cost Monitoring</strong> - Real-time AI spending per feature/user → <em>New page: AICostMonitor</em></li>
              <li>• <strong>Accuracy Tracking</strong> - Measure prediction accuracy over time → <em>New component: AIAccuracyTracker</em></li>
              <li>• <strong>Error Alerting</strong> - Alert admins when AI features fail → <em>Integration with ErrorLogsConsole</em></li>
              <li>• <strong>User Feedback Loop</strong> - Thumbs up/down on AI suggestions → <em>New component: AIFeedbackWidget</em></li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
            <p className="font-semibold text-orange-900 mb-2">Model Management (Medium Priority)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>Prompt Version Control</strong> - Git-like versioning for prompts → <em>New page: PromptVersionControl</em></li>
              <li>• <strong>Model Registry</strong> - Track which models power which features → <em>New page: AIModelRegistry</em></li>
              <li>• <strong>Fine-tuning Pipeline</strong> - Fine-tune models on Saudi municipal data → <em>Backend infrastructure</em></li>
              <li>• <strong>Evaluation Datasets</strong> - Build test sets for model validation → <em>New page: AITestDataManager</em></li>
              <li>• <strong>Model Drift Detection</strong> - Alert when model accuracy degrades → <em>New component: ModelDriftMonitor</em></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Missing AI Features by Targeted Page/Component */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Rocket className="h-6 w-6" />
            {t({ en: '🚀 Missing AI Features Mapped to Pages/Components', ar: '🚀 الميزات الذكية المفقودة المرتبطة بالصفحات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">📄 New AI Pages Needed (Infrastructure + Coverage Gaps)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>AIModelMonitoring</strong> - Real-time AI performance, costs, errors per feature (P0 - Critical)</li>
              <li>• <strong>AICostDashboard</strong> - Track AI spending by feature, user, time period (P0 - Budget control)</li>
              <li>• <strong>AIAnalyticsDashboard</strong> - Feature usage heatmap, user satisfaction, adoption rates (P1)</li>
              <li>• <strong>PromptWorkbench</strong> - Test, version, and optimize AI prompts (P1)</li>
              <li>• <strong>StartupOpportunityPipelineAI</strong> - Track challenges→proposals→pilots→clients (NOT revenue/funding) (P0 - Startup focus)</li>
              <li>• <strong>EvaluatorWorkbench</strong> - Domain expert evaluation management + rubric builder (P0 - Weak evaluation rigor)</li>
              <li>• <strong>ClosureWorkflowAI</strong> - Manage 8+ missing closure workflows (Scaling→BAU/Policy, R&D→Solution/Knowledge/Policy, etc.) (P1)</li>
              <li>• <strong>ImageAnalysisTools</strong> - Upload images, detect objects, extract text, classify issues (P2)</li>
              <li>• <strong>CausalAnalysisTool</strong> - Discover cause-effect relationships in platform data (P2)</li>
              <li>• <strong>SocialListeningDashboard</strong> - Monitor Twitter/X for citizen sentiment on municipal services (P2)</li>
              <li>• <strong>AITestDataManager</strong> - Manage evaluation datasets for AI model testing (P2)</li>
              <li>• <strong>PromptVersionControl</strong> - Version control system for AI prompts (P2)</li>
              <li>• <strong>AIModelRegistry</strong> - Catalog of all AI models, versions, performance (P2)</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-red-600">
            <p className="font-semibold text-red-900 mb-2">🚨 P0: Critical AI Components MISSING (Coverage Reports)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>VisibilityPublishingAI</strong> - Recommend when to publish Challenge/Solution/Pilot/R&D publicly vs keep confidential → Add to Create/Edit pages</li>
              <li>• <strong>ProgramTypeClassifierAI</strong> - Auto-classify program as internal/academia/ventures/public/G2G/G2B/G2C → Add to ProgramCreate/Edit</li>
              <li>• <strong>TaxonomyAutoLinkerAI</strong> - Auto-suggest sector/subsector/service/municipality/strategic linkage for Programs/Sandboxes/Labs → Add to entity forms</li>
              <li>• <strong>IdeaTypeClassifierAI</strong> - Classify idea as generic (CitizenIdea) vs structured (InnovationProposal) and route accordingly → Add to PublicIdeaSubmission</li>
              <li>• <strong>TestingInfrastructureRouterAI</strong> - Auto-recommend Sandbox/Lab for Pilot based on regulatory/research profile → Add to PilotCreate</li>
              <li>• <strong>EvaluatorAssignmentAI</strong> - Assign domain expert evaluators by sector/expertise (currently missing across ALL entities) → Add to all review queues</li>
              <li>• <strong>RubricGeneratorAI</strong> - Generate structured evaluation scorecards per entity type → Add to evaluation workflows</li>
              <li>• <strong>OpportunityPipelineTrackerAI</strong> - Track startup opportunity journey (NOT revenue/funding) → Add to StartupDashboard</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-600">
            <p className="font-semibold text-amber-900 mb-2">⚠️ P1: Closure Workflow AI Components (10 MISSING)</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>ScalingToBAUAI</strong> - Generate institutionalization/BAU integration plans → Add to ScalingWorkflow</li>
              <li>• <strong>ScalingToPolicyAI</strong> - Extract policy recommendations from scaling → Add to ScalingWorkflow</li>
              <li>• <strong>RDToSolutionAI</strong> - Commercialization pathway for research outputs → Add to RDProjectDetail</li>
              <li>• <strong>RDToKnowledgeAI</strong> - Auto-extract publications into knowledge base → Add to ResearchOutputsHub</li>
              <li>• <strong>RDToPolicyAI</strong> - Research findings→regulatory changes → Add to RDProjectDetail</li>
              <li>• <strong>PilotToRDAI</strong> - Failed pilots→research questions → Add to PilotTerminationWorkflow</li>
              <li>• <strong>PilotToPolicyAI</strong> - Lessons learned→policy recommendations → Add to PilotEvaluations</li>
              <li>• <strong>PilotToProcurementAI</strong> - Successful tech→national procurement → Add to PilotDetail</li>
              <li>• <strong>SandboxToPolicyAI</strong> - Regulatory learnings→policy feedback → Add to SandboxReporting</li>
              <li>• <strong>ProgramToSolutionAI</strong> - Graduate startup→marketplace offering → Add to ProgramCompletionWorkflow</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">🧩 P2: General Enhancement AI Components</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>VoiceAssistant</strong> - Voice input/output for AI assistant → Add to AIAssistant component</li>
              <li>• <strong>VideoAnalysisPanel</strong> - Upload pilot videos, auto-extract insights → Add to Pilot Detail</li>
              <li>• <strong>SentimentAnalysisDashboard</strong> - Real-time sentiment from citizen feedback → Add to CitizenEngagementDashboard</li>
              <li>• <strong>AITeamBuilder</strong> - Suggest team composition for pilots → Add to PilotCreate page</li>
              <li>• <strong>AIMeetingScheduler</strong> - AI finds optimal meeting times → Add to CalendarView</li>
              <li>• <strong>AIFeedbackWidget</strong> - Thumbs up/down on AI suggestions → Add to all AI-powered components (P0)</li>
              <li>• <strong>AIAccuracyTracker</strong> - Shows prediction accuracy trends → Add to admin dashboard</li>
              <li>• <strong>ModelDriftMonitor</strong> - Detects when models degrade → Add to SystemHealthDashboard</li>
              <li>• <strong>CorrelationExplorer</strong> - Discover hidden correlations in data → Add to PredictiveAnalytics</li>
              <li>• <strong>ConflictPredictor</strong> - Predict team/stakeholder conflicts → Add to team management</li>
              <li>• <strong>AIFAQGenerator</strong> - Auto-generate FAQs from conversations → Add to Knowledge page</li>
              <li>• <strong>AITutorialBuilder</strong> - Auto-create tutorials from workflows → Add to PlatformDocs</li>
              <li>• <strong>AIQuizGenerator</strong> - Generate assessment quizzes → Add to MyLearning</li>
              <li>• <strong>WeatherImpactAI</strong> - Link weather to infrastructure challenges → New component</li>
              <li>• <strong>NewsContextAI</strong> - Pull relevant news context → New component</li>
              <li>• <strong>EconomicContextAI</strong> - Add economic indicators context → New component</li>
            </ul>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-purple-600">
            <p className="font-semibold text-purple-900 mb-2">📄 P2: Infrastructure AI Pages</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• <strong>AIModelMonitoring</strong> - Real-time AI performance, costs, errors per feature</li>
              <li>• <strong>PromptWorkbench</strong> - Test, version, and optimize AI prompts</li>
              <li>• <strong>AICostDashboard</strong> - Track AI spending by feature, user, time period</li>
              <li>• <strong>AIAnalyticsDashboard</strong> - Feature usage heatmap, user satisfaction, adoption rates</li>
              <li>• <strong>ImageAnalysisTools</strong> - Upload images, detect objects, extract text, classify issues</li>
              <li>• <strong>CausalAnalysisTool</strong> - Discover cause-effect relationships in platform data</li>
              <li>• <strong>SocialListeningDashboard</strong> - Monitor Twitter/X for citizen sentiment on municipal services</li>
              <li>• <strong>AITestDataManager</strong> - Manage evaluation datasets for AI model testing</li>
              <li>• <strong>PromptVersionControl</strong> - Version control system for AI prompts</li>
              <li>• <strong>AIModelRegistry</strong> - Catalog of all AI models, versions, performance</li>
            </ul>
          </div>
          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-600">
            <p className="font-semibold text-blue-900 mb-2">🔌 Integration Enhancements</p>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>• Connect to Saudi Open Data portal for real-time datasets</li>
              <li>• Integrate with Google Maps API for location intelligence</li>
              <li>• Add weather API integration (precipitation, temperature impacts)</li>
              <li>• Connect to international innovation databases (Bloomberg, Crunchbase, etc.)</li>
              <li>• Integrate with translation APIs for higher quality Arabic (DeepL, Google Translate Advanced)</li>
              <li>• Add IoT sensor platform integration for real-time pilot monitoring</li>
              <li>• Connect to social media APIs (Twitter/X, LinkedIn) for sentiment analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* AI Helpers Priority Matrix */}
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-6 w-6" />
            {t({ en: '🎯 AI Feature Priority Matrix', ar: '🎯 مصفوفة أولويات الميزات الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
              <p className="font-bold text-red-900 mb-3">🔥 CRITICAL (Do First)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>✓ Vector database deployment (scalability blocker)</li>
                <li>✓ AI response caching (cost reduction 60-80%)</li>
                <li>✓ AIModelMonitoring page (visibility)</li>
                <li>✓ AICostDashboard page (budget control)</li>
                <li>✓ AIFeedbackWidget (learning loop)</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border-2 border-orange-300">
              <p className="font-bold text-orange-900 mb-3">⚠️ HIGH (Next Sprint)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• AIAnalyticsDashboard (usage insights)</li>
                <li>• PromptWorkbench (prompt optimization)</li>
                <li>• SentimentAnalysisDashboard (citizen insights)</li>
                <li>• AITeamBuilder (pilot success)</li>
                <li>• ImageAnalysisTools (field work efficiency)</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg border-2 border-amber-300">
              <p className="font-bold text-amber-900 mb-3">📋 MEDIUM (Backlog)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• VoiceAssistant component</li>
                <li>• VideoAnalysisPanel component</li>
                <li>• CausalAnalysisTool page</li>
                <li>• WeatherImpactAI integration</li>
                <li>• SocialListeningDashboard</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
              <p className="font-bold text-slate-900 mb-3">💡 LOW (Nice to Have)</p>
              <ul className="text-sm text-slate-700 space-y-1">
                <li>• AIQuizGenerator</li>
                <li>• AITutorialBuilder</li>
                <li>• AIMeetingScheduler</li>
                <li>• NewsContextAI</li>
                <li>• EconomicContextAI</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}