import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  ArrowRight, Lightbulb, TestTube, Microscope, Shield,
  ShoppingCart, TrendingUp, Calendar, FileText, Activity,
  Sparkles, CheckCircle2, AlertCircle, Search, Filter,
  ExternalLink, Target, Users, Zap
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import ProtectedPage from '../components/permissions/ProtectedPage';

function ConversionHub() {
  const { language, isRTL, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all entities that can be converted
  const { data: challenges } = useQuery({
    queryKey: ['challenges-for-conversion'],
    queryFn: () => base44.entities.Challenge.list(),
    initialData: []
  });

  const { data: pilots } = useQuery({
    queryKey: ['pilots-for-conversion'],
    queryFn: () => base44.entities.Pilot.list(),
    initialData: []
  });

  const { data: citizenIdeas } = useQuery({
    queryKey: ['ideas-for-conversion'],
    queryFn: () => base44.entities.CitizenIdea.list(),
    initialData: []
  });

  const { data: innovationProposals } = useQuery({
    queryKey: ['proposals-for-conversion'],
    queryFn: () => base44.entities.InnovationProposal.list(),
    initialData: []
  });

  const { data: rdProjects } = useQuery({
    queryKey: ['rd-for-conversion'],
    queryFn: () => base44.entities.RDProject.list(),
    initialData: []
  });

  const { data: solutions } = useQuery({
    queryKey: ['solutions-for-conversion'],
    queryFn: () => base44.entities.Solution.list(),
    initialData: []
  });

  const { data: scalingPlans } = useQuery({
    queryKey: ['scaling-for-conversion'],
    queryFn: () => base44.entities.ScalingPlan.list(),
    initialData: []
  });

  const { data: policies } = useQuery({
    queryKey: ['policies-for-conversion'],
    queryFn: () => base44.entities.PolicyRecommendation.list(),
    initialData: []
  });

  const { data: contracts } = useQuery({
    queryKey: ['contracts-for-conversion'],
    queryFn: () => base44.entities.Contract.list(),
    initialData: []
  });

  const { data: challengeRelations } = useQuery({
    queryKey: ['challenge-relations'],
    queryFn: () => base44.entities.ChallengeRelation.list(),
    initialData: []
  });

  const { data: rdCalls } = useQuery({
    queryKey: ['rd-calls'],
    queryFn: () => base44.entities.RDCall.list(),
    initialData: []
  });

  // Helper: Check if conversion already exists
  const getConversionStatus = (sourceId, conversionType) => {
    let count = 0;
    let canConvertAgain = true;
    let singleUse = false;

    switch(conversionType) {
      case 'challenge_to_pilot':
        count = pilots.filter(p => p.challenge_id === sourceId).length;
        canConvertAgain = true; // Can create multiple pilots per challenge
        break;
      
      case 'challenge_to_rd_call':
        count = rdCalls.filter(r => r.challenge_ids?.includes(sourceId)).length;
        canConvertAgain = true; // Can create multiple R&D calls
        break;
      
      case 'challenge_to_policy':
        count = policies.filter(p => p.challenge_id === sourceId).length;
        canConvertAgain = true; // Can create multiple policies
        break;
      
      case 'challenge_to_program':
        count = 0; // Not implemented yet
        canConvertAgain = true;
        break;
      
      case 'pilot_to_rd':
        count = rdProjects.filter(r => r.pilot_id === sourceId || r.linked_pilot_ids?.includes(sourceId)).length;
        canConvertAgain = count === 0; // Usually one R&D follow-up per pilot
        break;
      
      case 'pilot_to_policy':
        count = policies.filter(p => p.pilot_id === sourceId).length;
        canConvertAgain = true; // Can generate multiple policy recommendations
        break;
      
      case 'pilot_to_procurement':
        count = contracts.filter(c => c.entity_type === 'pilot' && c.entity_id === sourceId).length;
        canConvertAgain = count === 0; // Usually one procurement per pilot
        singleUse = true;
        break;
      
      case 'pilot_to_scaling':
        count = scalingPlans.filter(s => s.pilot_id === sourceId).length;
        canConvertAgain = count === 0; // One scaling plan per pilot
        singleUse = true;
        break;
      
      case 'citizen_idea_to_challenge':
        const idea = citizenIdeas.find(i => i.id === sourceId);
        count = idea?.converted_challenge_id ? 1 : 0;
        canConvertAgain = count === 0; // 1-to-1 conversion
        singleUse = true;
        break;
      
      case 'citizen_idea_to_solution':
        const idea2 = citizenIdeas.find(i => i.id === sourceId);
        count = idea2?.status === 'converted_to_challenge' ? 1 : 0; // Approximate
        canConvertAgain = true; // Can become both challenge AND solution
        break;
      
      case 'innovation_proposal_to_pilot':
        const proposal = innovationProposals.find(p => p.id === sourceId);
        count = proposal?.converted_entity_id && proposal?.converted_entity_type === 'pilot' ? 1 : 0;
        canConvertAgain = count === 0; // 1-to-1 conversion
        singleUse = true;
        break;
      
      case 'innovation_proposal_to_challenge':
        const proposal2 = innovationProposals.find(p => p.id === sourceId);
        count = proposal2?.converted_entity_type === 'challenge' ? 1 : 0;
        canConvertAgain = count === 0;
        singleUse = true;
        break;
      
      case 'rd_to_pilot':
        count = pilots.filter(p => p.linked_rd_project_id === sourceId).length;
        canConvertAgain = true; // Can create multiple pilots from one R&D
        break;
      
      case 'rd_to_solution':
        count = 0; // Not tracked yet
        canConvertAgain = true;
        break;
      
      case 'rd_to_policy':
        count = policies.filter(p => p.rd_project_id === sourceId).length;
        canConvertAgain = true;
        break;
      
      case 'solution_to_pilot':
        count = pilots.filter(p => p.solution_id === sourceId).length;
        canConvertAgain = true; // Solution can be tested in multiple pilots
        break;
      
      case 'scaling_to_program':
      case 'policy_to_program':
        count = 0; // Not tracked yet
        canConvertAgain = true;
        break;
    }

    return { count, canConvertAgain, singleUse };
  };

  // Define conversion opportunities with eligibility criteria
  const conversionOpportunities = [
    // FROM CHALLENGE
    {
      id: 'challenge_to_pilot',
      source: 'Challenge',
      target: 'Pilot',
      icon: TestTube,
      color: 'blue',
      detailPage: 'ChallengeDetail',
      location: 'Next Steps tab',
      eligibleRecords: challenges.filter(c => c.status === 'approved' && !c.is_deleted),
      eligibilityCriteria: 'Status = approved',
      autoFields: ['challenge_id', 'title', 'sector', 'municipality_id', 'objective', 'KPIs'],
      aiFeatures: ['Hypothesis generator', 'KPI suggester', 'Methodology recommender']
    },
    {
      id: 'challenge_to_rd_call',
      source: 'Challenge',
      target: 'RDCall',
      icon: Microscope,
      color: 'purple',
      detailPage: 'ChallengeDetail',
      location: 'Research tab',
      eligibleRecords: challenges.filter(c => ['approved', 'in_treatment'].includes(c.status) && !c.is_deleted),
      eligibilityCriteria: 'Status = approved/in_treatment',
      autoFields: ['challenge_ids', 'title', 'research_area', 'objectives', 'scope', 'keywords'],
      aiFeatures: ['Research questions generator', 'Scope definition', 'Budget estimator']
    },
    {
      id: 'challenge_to_policy',
      source: 'Challenge',
      target: 'PolicyRecommendation',
      icon: Shield,
      color: 'indigo',
      detailPage: 'ChallengeDetail',
      location: 'Policy tab',
      eligibleRecords: challenges.filter(c => ['resolved', 'in_treatment'].includes(c.status) && !c.is_deleted),
      eligibilityCriteria: 'Status = resolved/in_treatment',
      autoFields: ['challenge_id', 'title', 'sector', 'recommendation', 'rationale', 'stakeholders'],
      aiFeatures: ['Policy draft generator', 'Impact assessment', 'Stakeholder mapper']
    },
    {
      id: 'challenge_to_program',
      source: 'Challenge',
      target: 'Program',
      icon: Calendar,
      color: 'pink',
      detailPage: 'ChallengeDetail',
      location: 'Programs tab',
      eligibleRecords: challenges.filter(c => c.status === 'approved' && !c.is_deleted),
      eligibilityCriteria: 'Status = approved',
      autoFields: ['challenge_ids', 'focus_areas', 'objectives', 'target_participants'],
      aiFeatures: ['Program design suggester', 'Target audience mapper']
    },

    // FROM PILOT
    {
      id: 'pilot_to_rd',
      source: 'Pilot',
      target: 'RDProject',
      icon: Microscope,
      color: 'purple',
      detailPage: 'PilotDetail',
      location: 'Next Steps tab',
      eligibleRecords: pilots.filter(p => ['completed', 'evaluation'].includes(p.stage) && !p.is_deleted),
      eligibilityCriteria: 'Stage = completed/evaluation',
      autoFields: ['pilot_id', 'challenge_ids', 'title', 'methodology', 'budget', 'research_themes'],
      aiFeatures: ['Research questions extractor', 'Methodology generator', 'Budget estimator']
    },
    {
      id: 'pilot_to_policy',
      source: 'Pilot',
      target: 'PolicyRecommendation',
      icon: Shield,
      color: 'blue',
      detailPage: 'PilotDetail',
      location: 'Next Steps tab',
      eligibleRecords: pilots.filter(p => ['completed', 'scaled'].includes(p.stage) && !p.is_deleted),
      eligibilityCriteria: 'Stage = completed/scaled',
      autoFields: ['pilot_id', 'challenge_id', 'title', 'recommendation', 'rationale', 'impact_assessment'],
      aiFeatures: ['Evidence-based policy generator', 'Impact assessor', 'Rationale builder']
    },
    {
      id: 'pilot_to_procurement',
      source: 'Pilot',
      target: 'Contract',
      icon: ShoppingCart,
      color: 'green',
      detailPage: 'PilotDetail',
      location: 'Next Steps tab',
      eligibleRecords: pilots.filter(p => ['completed', 'scaled'].includes(p.stage) && p.solution_id && !p.is_deleted),
      eligibilityCriteria: 'Stage = completed/scaled + has solution_id',
      autoFields: ['pilot_id', 'solution_id', 'title', 'scope', 'technical_specs', 'evaluation_criteria'],
      aiFeatures: ['RFP generator', 'Technical specs extractor', 'Vendor criteria builder']
    },
    {
      id: 'pilot_to_scaling',
      source: 'Pilot',
      target: 'ScalingPlan',
      icon: TrendingUp,
      color: 'teal',
      detailPage: 'PilotDetail',
      location: 'Scaling tab OR ScalingWorkflow page',
      eligibleRecords: pilots.filter(p => p.stage === 'completed' && p.recommendation === 'scale' && !p.is_deleted),
      eligibilityCriteria: 'Stage = completed + recommendation = scale',
      autoFields: ['pilot_id', 'title', 'sector', 'baseline_metrics', 'success_factors', 'risks'],
      aiFeatures: ['Scaling readiness checker', 'Target city suggester', 'Cost estimator']
    },

    // FROM CITIZEN IDEA
    {
      id: 'citizen_idea_to_challenge',
      source: 'CitizenIdea',
      target: 'Challenge',
      icon: Lightbulb,
      color: 'amber',
      detailPage: 'IdeaDetail',
      location: 'IdeaEvaluationQueue',
      eligibleRecords: citizenIdeas.filter(i => i.status === 'approved' && !i.is_deleted),
      eligibilityCriteria: 'Status = approved',
      autoFields: ['citizen_origin_idea_id', 'title', 'description', 'sector', 'problem_statement', 'priority'],
      aiFeatures: ['Challenge structurer', 'Problem statement generator', 'KPI suggester', 'Priority scorer']
    },
    {
      id: 'citizen_idea_to_solution',
      source: 'CitizenIdea',
      target: 'Solution',
      icon: Lightbulb,
      color: 'pink',
      detailPage: 'IdeaDetail',
      location: 'IdeaEvaluationQueue',
      eligibleRecords: citizenIdeas.filter(i => i.status === 'approved' && !i.is_deleted),
      eligibilityCriteria: 'Status = approved',
      autoFields: ['origin_idea_id', 'name', 'description', 'sectors', 'provider_name', 'contact_email'],
      aiFeatures: ['Value proposition extractor', 'Maturity classifier', 'Feature suggester']
    },

    // FROM INNOVATION PROPOSAL
    {
      id: 'innovation_proposal_to_pilot',
      source: 'InnovationProposal',
      target: 'Pilot',
      icon: FileText,
      color: 'indigo',
      detailPage: 'InnovationProposalDetail',
      location: 'Actions menu',
      eligibleRecords: innovationProposals.filter(p => p.status === 'approved' && !p.is_deleted),
      eligibilityCriteria: 'Status = approved',
      autoFields: ['title', 'challenge_id', 'solution_id', 'municipality_id', 'objective', 'budget', 'team'],
      aiFeatures: ['Pilot structure converter', 'Completeness validator', 'Gap analyzer']
    },
    {
      id: 'innovation_proposal_to_challenge',
      source: 'InnovationProposal',
      target: 'Challenge',
      icon: AlertCircle,
      color: 'orange',
      detailPage: 'InnovationProposalDetail',
      location: 'Actions menu',
      eligibleRecords: innovationProposals.filter(p => p.proposal_type === 'problem' && p.status === 'approved' && !p.is_deleted),
      eligibilityCriteria: 'Type = problem + Status = approved',
      autoFields: ['title', 'description', 'sector', 'municipality_id', 'problem_statement'],
      aiFeatures: ['Challenge formatter', 'Root cause analyzer']
    },

    // FROM R&D PROJECT
    {
      id: 'rd_to_pilot',
      source: 'RDProject',
      target: 'Pilot',
      icon: TestTube,
      color: 'blue',
      detailPage: 'RDProjectDetail',
      location: 'Transition tab',
      eligibleRecords: rdProjects.filter(r => r.trl_current >= 6 && ['active', 'completed'].includes(r.status) && !r.is_deleted),
      eligibilityCriteria: 'TRL ≥ 6 + Status = active/completed',
      autoFields: ['rd_project_id', 'title', 'sector', 'challenge_ids', 'methodology', 'hypothesis', 'team'],
      aiFeatures: ['Research-to-pilot translator', 'Hypothesis generator', 'Scope recommender']
    },
    {
      id: 'rd_to_solution',
      source: 'RDProject',
      target: 'Solution',
      icon: Lightbulb,
      color: 'green',
      detailPage: 'RDProjectDetail',
      location: 'Commercialization tab',
      eligibleRecords: rdProjects.filter(r => r.trl_current >= 7 && r.status === 'completed' && !r.is_deleted),
      eligibilityCriteria: 'TRL ≥ 7 + Status = completed',
      autoFields: ['name', 'description', 'technical_specs', 'maturity_level', 'provider_name'],
      aiFeatures: ['Commercialization readiness', 'Solution profiler', 'Market fit analyzer']
    },
    {
      id: 'rd_to_policy',
      source: 'RDProject',
      target: 'PolicyRecommendation',
      icon: Shield,
      color: 'purple',
      detailPage: 'RDProjectDetail',
      location: 'Outputs tab',
      eligibleRecords: rdProjects.filter(r => r.status === 'completed' && !r.is_deleted),
      eligibilityCriteria: 'Status = completed',
      autoFields: ['rd_project_id', 'title', 'recommendation', 'rationale', 'evidence'],
      aiFeatures: ['Research-to-policy translator', 'Evidence synthesizer']
    },

    // FROM SOLUTION
    {
      id: 'solution_to_pilot',
      source: 'Solution',
      target: 'Pilot',
      icon: TestTube,
      color: 'teal',
      detailPage: 'SolutionDetail',
      location: 'Pilot Opportunities tab',
      eligibleRecords: solutions.filter(s => ['pilot_ready', 'market_ready', 'proven'].includes(s.maturity_level) && s.is_verified && !s.is_deleted),
      eligibilityCriteria: 'Maturity ≥ pilot_ready + verified',
      autoFields: ['solution_id', 'title', 'sector', 'description', 'technical_specs'],
      aiFeatures: ['Challenge matcher', 'Municipality recommender', 'Pilot designer']
    },

    // FROM SCALING PLAN
    {
      id: 'scaling_to_program',
      source: 'ScalingPlan',
      target: 'Program',
      icon: Calendar,
      color: 'orange',
      detailPage: 'ScalingPlanDetail',
      location: 'Institutionalization tab',
      eligibleRecords: scalingPlans.filter(s => s.status === 'completed' && s.deployed_count >= 3 && !s.is_deleted),
      eligibilityCriteria: 'Status = completed + deployed ≥ 3 cities',
      autoFields: ['name', 'focus_areas', 'objectives', 'curriculum', 'target_participants'],
      aiFeatures: ['Training program generator', 'Curriculum builder from lessons learned']
    },

    // FROM POLICY
    {
      id: 'policy_to_program',
      source: 'PolicyRecommendation',
      target: 'Program',
      icon: Calendar,
      color: 'indigo',
      detailPage: 'PolicyDetail',
      location: 'Implementation tab',
      eligibleRecords: policies.filter(p => p.workflow_stage === 'published' && !p.is_deleted),
      eligibilityCriteria: 'Workflow = published',
      autoFields: ['name', 'objectives', 'focus_areas', 'stakeholders', 'success_metrics'],
      aiFeatures: ['Implementation program designer', 'Training needs analyzer']
    }
  ];

  // Calculate stats
  const stats = {
    totalPaths: conversionOpportunities.length,
    totalEligible: conversionOpportunities.reduce((sum, c) => sum + c.eligibleRecords.length, 0),
    bySource: {}
  };

  conversionOpportunities.forEach(c => {
    if (!stats.bySource[c.source]) {
      stats.bySource[c.source] = 0;
    }
    stats.bySource[c.source] += c.eligibleRecords.length;
  });

  // Filter by active tab
  const filteredOpportunities = activeTab === 'all' 
    ? conversionOpportunities 
    : conversionOpportunities.filter(c => c.source === activeTab);

  // Search filter
  const searchFiltered = filteredOpportunities.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.source.toLowerCase().includes(q) || 
           c.target.toLowerCase().includes(q) ||
           c.eligibleRecords.some(r => 
             (r.title_en?.toLowerCase().includes(q)) || 
             (r.title_ar?.includes(q)) ||
             (r.name_en?.toLowerCase().includes(q)) ||
             (r.name_ar?.includes(q)) ||
             (r.title?.toLowerCase().includes(q))
           );
  });

  const getRecordTitle = (record) => {
    return (language === 'ar' && record.title_ar) ? record.title_ar :
           record.title_en || record.name_en || record.title || record.name_ar || record.code || 'Untitled';
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-4">
          <ArrowRight className="h-12 w-12" />
          <div>
            <h1 className="text-4xl font-bold">
              {t({ en: 'Conversion Control Center', ar: 'مركز التحكم بالتحويلات' })}
            </h1>
            <p className="text-lg text-white/90 mt-2">
              {t({ 
                en: 'Real-time conversion opportunities across the innovation pipeline',
                ar: 'فرص التحويل المباشر عبر خط الابتكار'
              })}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{stats.totalPaths}</p>
            <p className="text-sm">{t({ en: 'Conversion Types', ar: 'أنواع التحويلات' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{stats.totalEligible}</p>
            <p className="text-sm">{t({ en: 'Records Ready', ar: 'سجلات جاهزة' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">{Object.keys(stats.bySource).length}</p>
            <p className="text-sm">{t({ en: 'Source Entities', ar: 'كيانات المصدر' })}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="text-3xl font-bold">95%</p>
            <p className="text-sm">{t({ en: 'Avg Automation', ar: 'متوسط الأتمتة' })}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search records, entities, conversions...', ar: 'بحث السجلات، الكيانات، التحويلات...' })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs by source entity */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">
            {t({ en: 'All', ar: 'الكل' })} ({stats.totalEligible})
          </TabsTrigger>
          <TabsTrigger value="Challenge">
            Challenge ({stats.bySource['Challenge'] || 0})
          </TabsTrigger>
          <TabsTrigger value="Pilot">
            Pilot ({stats.bySource['Pilot'] || 0})
          </TabsTrigger>
          <TabsTrigger value="CitizenIdea">
            Idea ({stats.bySource['CitizenIdea'] || 0})
          </TabsTrigger>
          <TabsTrigger value="InnovationProposal">
            Proposal ({stats.bySource['InnovationProposal'] || 0})
          </TabsTrigger>
          <TabsTrigger value="RDProject">
            R&D ({stats.bySource['RDProject'] || 0})
          </TabsTrigger>
          <TabsTrigger value="Solution">
            Solution ({stats.bySource['Solution'] || 0})
          </TabsTrigger>
          <TabsTrigger value="ScalingPlan">
            Scaling ({stats.bySource['ScalingPlan'] || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6 mt-6">
          {searchFiltered.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-8 pb-8 text-center">
                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">
                  {t({ en: 'No conversion opportunities found', ar: 'لم يتم العثور على فرص تحويل' })}
                </p>
              </CardContent>
            </Card>
          ) : (
            searchFiltered.map((opportunity) => {
              const Icon = opportunity.icon;
              
              if (opportunity.eligibleRecords.length === 0) return null;

              return (
                <Card key={opportunity.id} className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-lg bg-${opportunity.color}-100 flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 text-${opportunity.color}-600`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <span>{opportunity.source}</span>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                            <span>{opportunity.target}</span>
                          </CardTitle>
                          <p className="text-xs text-slate-500 mt-1">
                            {opportunity.location}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-lg px-3 py-1">
                        {opportunity.eligibleRecords.length} {t({ en: 'Ready', ar: 'جاهز' })}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Eligibility Criteria */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        {t({ en: 'Eligibility:', ar: 'الأهلية:' })}
                      </p>
                      <p className="text-xs text-slate-700">{opportunity.eligibilityCriteria}</p>
                    </div>

                    {/* AI Features */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs font-semibold text-purple-900 mb-2">
                        {t({ en: 'AI Automation:', ar: 'الأتمتة الذكية:' })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {opportunity.aiFeatures.map((feature, i) => (
                          <Badge key={i} className="bg-purple-100 text-purple-700 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Eligible Records List */}
                    <div className="border-t pt-3">
                      <p className="text-sm font-semibold text-slate-900 mb-3">
                        {t({ en: 'Eligible Records:', ar: 'السجلات المؤهلة:' })}
                      </p>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {opportunity.eligibleRecords.map((record, idx) => {
                          const conversionStatus = getConversionStatus(record.id, opportunity.id);
                          
                          return (
                            <Link
                              key={record.id}
                              to={createPageUrl(opportunity.detailPage) + `?id=${record.id}`}
                              className="block"
                            >
                              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group">
                                <div className="flex-1">
                                  <p className="font-medium text-slate-900 group-hover:text-blue-600">
                                    {getRecordTitle(record)}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {record.code || record.id?.slice(0, 8)}
                                    </Badge>
                                    {record.sector && (
                                      <Badge variant="outline" className="text-xs">
                                        {record.sector}
                                      </Badge>
                                    )}
                                    {record.status && (
                                      <Badge className="text-xs bg-green-100 text-green-700">
                                        {record.status}
                                      </Badge>
                                    )}
                                    {record.stage && (
                                      <Badge className="text-xs bg-green-100 text-green-700">
                                        {record.stage}
                                      </Badge>
                                    )}
                                    
                                    {/* Conversion Status Badge */}
                                    {conversionStatus.count > 0 && (
                                      <Badge className={conversionStatus.canConvertAgain ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                                        {conversionStatus.singleUse ? (
                                          <>
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            {t({ en: 'Converted', ar: 'محول' })}
                                          </>
                                        ) : (
                                          <>
                                            {conversionStatus.count}x {t({ en: 'converted', ar: 'محول' })}
                                          </>
                                        )}
                                      </Badge>
                                    )}
                                    {conversionStatus.count === 0 && (
                                      <Badge className="bg-green-100 text-green-700">
                                        <Zap className="h-3 w-3 mr-1" />
                                        {t({ en: 'New', ar: 'جديد' })}
                                      </Badge>
                                    )}
                                    {conversionStatus.count > 0 && !conversionStatus.singleUse && conversionStatus.canConvertAgain && (
                                      <Badge className="bg-purple-100 text-purple-700">
                                        {t({ en: 'Can add more', ar: 'يمكن الإضافة' })}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                                    disabled={conversionStatus.singleUse && conversionStatus.count > 0 && !conversionStatus.canConvertAgain}
                                  >
                                    <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                    {conversionStatus.count > 0 && !conversionStatus.singleUse ? 
                                      t({ en: 'Add Another', ar: 'إضافة آخر' }) :
                                      conversionStatus.singleUse && conversionStatus.count > 0 ?
                                      t({ en: 'View Existing', ar: 'عرض الموجود' }) :
                                      t({ en: 'Open & Convert', ar: 'فتح وتحويل' })
                                    }
                                  </Button>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="font-bold text-slate-900">{opportunity.autoFields.length}</p>
                        <p className="text-slate-600">{t({ en: 'Auto Fields', ar: 'حقول تلقائية' })}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="font-bold text-slate-900">{opportunity.aiFeatures.length}</p>
                        <p className="text-slate-600">{t({ en: 'AI Features', ar: 'ميزات ذكية' })}</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded border border-green-200">
                        <p className="font-bold text-green-600">{opportunity.eligibleRecords.length}</p>
                        <p className="text-slate-600">{t({ en: 'Ready Now', ar: 'جاهز الآن' })}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Summary Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900 text-lg mb-2">
                  {t({ en: '🎯 Conversion Opportunities', ar: '🎯 فرص التحويل' })}
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✅ {stats.totalEligible} records ready for conversion</li>
                  <li>✅ Duplicate detection prevents errors</li>
                  <li>✅ Multi-conversion support (Pilot → Policy + R&D + Procurement)</li>
                  <li>✅ Visual indicators show conversion status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-10 w-10 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-900 text-lg mb-2">
                  {t({ en: '🤖 Smart Conversion Rules', ar: '🤖 قواعد التحويل الذكية' })}
                </p>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>🔒 <strong>1-to-1:</strong> CitizenIdea/Proposal (single conversion)</li>
                  <li>🔄 <strong>1-to-many:</strong> Challenge (multiple pilots/policies OK)</li>
                  <li>🌐 <strong>Multi-path:</strong> Pilot (can do R&D + Policy + Procurement)</li>
                  <li>♻️ <strong>Feedback:</strong> Pilot → Solution (update, not create)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to={createPageUrl('ConversionsCoverageReport')}>
          <Button className="w-full" variant="outline">
            <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'View Technical Coverage Report', ar: 'عرض تقرير التغطية الفني' })}
          </Button>
        </Link>
        <Link to={createPageUrl('ApprovalCenter')}>
          <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600">
            <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'View Approval Center', ar: 'عرض مركز الموافقات' })}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default ProtectedPage(ConversionHub, { requireAdmin: true });