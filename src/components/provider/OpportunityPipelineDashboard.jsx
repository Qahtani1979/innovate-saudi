import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
  Target, Sparkles, FileText, TestTube, TrendingUp,
  ArrowRight, Eye, Mail
} from 'lucide-react';

export default function OpportunityPipelineDashboard({ providerId, providerEmail }) {
  const { language, isRTL, t } = useLanguage();

  const { data: solutions = [] } = useQuery({
    queryKey: ['provider-solutions', providerId],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.provider_id === providerId || s.created_by === providerEmail);
    },
    enabled: !!providerId || !!providerEmail
  });

  const { data: matches = [] } = useQuery({
    queryKey: ['challenge-matches', providerId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const allMatches = await base44.entities.ChallengeSolutionMatch.list();
      return allMatches.filter(m => solutionIds.includes(m.solution_id));
    },
    enabled: solutions.length > 0
  });

  const { data: interests = [] } = useQuery({
    queryKey: ['solution-interests', providerId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const allInterests = await base44.entities.SolutionInterest.list();
      return allInterests.filter(i => solutionIds.includes(i.solution_id));
    },
    enabled: solutions.length > 0
  });

  const { data: demoRequests = [] } = useQuery({
    queryKey: ['demo-requests', providerId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const allDemos = await base44.entities.DemoRequest.list();
      return allDemos.filter(d => solutionIds.includes(d.solution_id));
    },
    enabled: solutions.length > 0
  });

  const { data: proposals = [] } = useQuery({
    queryKey: ['challenge-proposals', providerEmail],
    queryFn: async () => {
      const all = await base44.entities.ChallengeProposal.list();
      return all.filter(p => p.proposer_email === providerEmail);
    },
    enabled: !!providerEmail
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['solution-pilots', providerId],
    queryFn: async () => {
      const solutionIds = solutions.map(s => s.id);
      const allPilots = await base44.entities.Pilot.list();
      return allPilots.filter(p => solutionIds.includes(p.solution_id));
    },
    enabled: solutions.length > 0
  });

  const pipeline = {
    discovered: matches.length,
    interested: interests.length,
    demosRequested: demoRequests.length,
    proposed: proposals.length,
    pilotsWon: pilots.length,
    deployed: pilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length
  };

  const conversionRates = {
    discoveryToInterest: pipeline.discovered > 0 ? ((pipeline.interested / pipeline.discovered) * 100).toFixed(0) : 0,
    interestToProposal: pipeline.interested > 0 ? ((pipeline.proposed / pipeline.interested) * 100).toFixed(0) : 0,
    proposalToPilot: pipeline.proposed > 0 ? ((pipeline.pilotsWon / pipeline.proposed) * 100).toFixed(0) : 0,
    pilotToDeployment: pipeline.pilotsWon > 0 ? ((pipeline.deployed / pipeline.pilotsWon) * 100).toFixed(0) : 0
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <h3 className="font-bold text-slate-900 flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-600" />
        {t({ en: 'Opportunity Pipeline', ar: 'خط الفرص' })}
      </h3>

      {/* Funnel Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <FunnelStage
              icon={Sparkles}
              label={t({ en: 'Discovered', ar: 'مكتشفة' })}
              count={pipeline.discovered}
              color="blue"
              isFirst
            />
            <FunnelStage
              icon={Eye}
              label={t({ en: 'Interest Expressed', ar: 'اهتمام معلن' })}
              count={pipeline.interested}
              color="purple"
              conversionRate={conversionRates.discoveryToInterest}
            />
            <FunnelStage
              icon={Mail}
              label={t({ en: 'Demos Requested', ar: 'عروض مطلوبة' })}
              count={pipeline.demosRequested}
              color="indigo"
            />
            <FunnelStage
              icon={FileText}
              label={t({ en: 'Proposals Submitted', ar: 'مقترحات مقدمة' })}
              count={pipeline.proposed}
              color="amber"
              conversionRate={conversionRates.interestToProposal}
            />
            <FunnelStage
              icon={TestTube}
              label={t({ en: 'Pilots Won', ar: 'تجارب فائزة' })}
              count={pipeline.pilotsWon}
              color="green"
              conversionRate={conversionRates.proposalToPilot}
            />
            <FunnelStage
              icon={TrendingUp}
              label={t({ en: 'Successfully Deployed', ar: 'منشورة بنجاح' })}
              count={pipeline.deployed}
              color="teal"
              conversionRate={conversionRates.pilotToDeployment}
              isLast
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {t({ en: 'Conversion Metrics', ar: 'مقاييس التحويل' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-xs text-slate-600">Discovery → Interest</p>
              <p className="text-2xl font-bold text-blue-600">{conversionRates.discoveryToInterest}%</p>
            </div>
            <div className="p-3 bg-amber-50 rounded">
              <p className="text-xs text-slate-600">Interest → Proposal</p>
              <p className="text-2xl font-bold text-amber-600">{conversionRates.interestToProposal}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <p className="text-xs text-slate-600">Proposal → Pilot</p>
              <p className="text-2xl font-bold text-green-600">{conversionRates.proposalToPilot}%</p>
            </div>
            <div className="p-3 bg-teal-50 rounded">
              <p className="text-xs text-slate-600">Pilot → Deployed</p>
              <p className="text-2xl font-bold text-teal-600">{conversionRates.pilotToDeployment}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FunnelStage({ icon: Icon, label, count, color, conversionRate, isFirst, isLast }) {
  const widthPercent = isFirst ? 100 : isLast ? 50 : 75;
  
  return (
    <div className="flex items-center gap-3">
      <div 
        className={`bg-${color}-100 border-2 border-${color}-300 rounded-lg p-3 transition-all`}
        style={{ width: `${widthPercent}%` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 text-${color}-600`} />
            <span className="text-sm font-medium text-slate-900">{label}</span>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold text-${color}-600`}>{count}</p>
            {conversionRate !== undefined && (
              <p className="text-xs text-slate-600">{conversionRate}% conv.</p>
            )}
          </div>
        </div>
      </div>
      {!isLast && <ArrowRight className="h-5 w-5 text-slate-400" />}
    </div>
  );
}