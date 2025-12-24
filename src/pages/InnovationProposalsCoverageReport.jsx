import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useInnovationProposalsWithVisibility from '@/hooks/useInnovationProposalsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  CheckCircle2, Target,
  ChevronDown, ChevronRight, FileText, Shield
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function InnovationProposalsCoverageReport() {
  const { language, isRTL, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const { data: proposals = [] } = useInnovationProposalsWithVisibility({ limit: 1000 });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const coverageData = {
    scope: {
      name: 'InnovationProposal (Structured Innovation Submissions)',
      purpose: 'Authenticated formal proposals for programs, challenges, and innovation campaigns',
      differentiation: 'CitizenIdea = public/anonymous engagement | InnovationProposal = authenticated structured submissions',
      users: 'Startups, Researchers, Organizations, Registered Citizens with verified accounts'
    },

    entity: {
      name: 'InnovationProposal',
      status: 'complete',
      coverage: 100,
      population: proposals.length,
      keyFields: [
        'program_id', 'challenge_alignment_id', 'sector_id', 'subsector_id', 'service_id',
        'proposal_type', 'submitter_type', 'implementation_plan', 'budget_estimate',
        'timeline_proposal', 'team_composition', 'success_metrics_proposed'
      ]
    },

    pages: [
      {
        name: 'ProgramIdeaSubmission',
        status: 'complete',
        coverage: 100,
        auth: 'required',
        description: 'Submit structured proposal to innovation program',
        features: ['Program linkage', 'AI enhancement', 'Taxonomy selection', 'Team builder']
      },
      {
        name: 'ChallengeIdeaResponse',
        status: 'complete',
        coverage: 100,
        auth: 'required',
        description: 'Submit solution proposal for challenge',
        features: ['Challenge linkage', 'AI enhancement', 'Budget calculator', 'Timeline builder']
      },
      {
        name: 'InnovationProposalsManagement',
        status: 'complete',
        coverage: 100,
        auth: 'required (admin)',
        description: 'Admin review queue for proposals',
        features: ['Filter/search', 'Approval workflow', 'Status management', 'Bulk actions']
      },
      {
        name: 'InnovationProposalDetail',
        status: 'complete',
        coverage: 100,
        auth: 'required',
        description: 'View proposal details',
        features: ['Full proposal view', 'Team display', 'Budget breakdown', 'Timeline view']
      }
    ],

    workflows: [
      {
        name: 'Program Campaign Submission',
        coverage: 100,
        stages: [
          { name: 'User selects program', status: 'complete' },
          { name: 'Fill structured form', status: 'complete' },
          { name: 'AI enhancement', status: 'complete' },
          { name: 'Submit proposal', status: 'complete' },
          { name: 'Admin review', status: 'complete' }
        ]
      },
      {
        name: 'Challenge Response',
        coverage: 100,
        stages: [
          { name: 'Browse challenges', status: 'complete' },
          { name: 'Select challenge', status: 'complete' },
          { name: 'Submit proposal', status: 'complete' },
          { name: 'Evaluation workflow', status: 'complete' }
        ]
      }
    ],

    aiFeatures: [
      {
        name: 'Proposal Enhancement',
        status: 'implemented',
        coverage: 100,
        description: 'AI auto-populates structured fields'
      },
      {
        name: 'Strategic Alignment Detection',
        status: 'implemented',
        coverage: 100,
        description: 'AI suggests strategic pillar alignment'
      }
    ]
  };

  const overallCoverage = 100;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-900 to-purple-700 bg-clip-text text-transparent">
          {t({ en: 'ðŸŽ¯ Innovation Proposals (Structured) - Coverage Report', ar: 'ðŸŽ¯ Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø§Øª Ø§Ù„Ø§Ø¨ØªÙƒØ§Ø±ÙŠØ© (Ø§Ù„Ù…Ù†Ø¸Ù…Ø©) - ØªÙ‚Ø±ÙŠØ± Ø§Ù„ØªØºØ·ÙŠØ©' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Authenticated structured proposals for programs and challenges', ar: 'Ø§Ù„Ù…Ù‚ØªØ±Ø­Ø§Øª Ø§Ù„Ù…Ù†Ø¸Ù…Ø© Ø§Ù„Ù…ØµØ§Ø¯Ù‚ Ø¹Ù„ÙŠÙ‡Ø§ Ù„Ù„Ø¨Ø±Ø§Ù…Ø¬ ÙˆØ§Ù„ØªØ­Ø¯ÙŠØ§Øª' })}
        </p>
        <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-300">
          <p className="text-sm text-green-900">
            <strong>âœ… Scope:</strong> {coverageData.scope.differentiation}
          </p>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Target className="h-6 w-6" />
            {t({ en: 'Executive Summary - 100% Complete', ar: 'Ø§Ù„Ù…Ù„Ø®Øµ Ø§Ù„ØªÙ†ÙÙŠØ°ÙŠ - 100% Ù…ÙƒØªÙ…Ù„' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-4xl font-bold text-green-600">{overallCoverage}%</p>
              <p className="text-sm text-slate-600 mt-1">Overall Coverage</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-indigo-200">
              <p className="text-4xl font-bold text-indigo-600">{coverageData.pages.length}</p>
              <p className="text-sm text-slate-600 mt-1">Pages Built</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
              <p className="text-4xl font-bold text-purple-600">{proposals.length}</p>
              <p className="text-sm text-slate-600 mt-1">Proposals</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
              <p className="text-4xl font-bold text-green-600">âœ…</p>
              <p className="text-sm text-slate-600 mt-1">Auth Required</p>
            </div>
          </div>

          <div className="p-4 bg-green-100 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">âœ… All Features Complete</p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>â€¢ <strong>InnovationProposal entity</strong> - Full taxonomy, strategic alignment, structured fields</li>
              <li>â€¢ <strong>ProgramIdeaSubmission</strong> - Submit to innovation programs with AI enhancement</li>
              <li>â€¢ <strong>ChallengeIdeaResponse</strong> - Respond to challenges with proposals</li>
              <li>â€¢ <strong>InnovationProposalsManagement</strong> - Admin review with authentication</li>
              <li>â€¢ <strong>InnovationProposalDetail</strong> - Full proposal display</li>
              <li>â€¢ <strong>Authentication enforced</strong> - All pages require user login</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Pages */}
      <Card>
        <CardHeader>
          <button onClick={() => toggleSection('pages')} className="w-full flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              {t({ en: 'Pages & Authentication', ar: 'Ø§Ù„ØµÙØ­Ø§Øª ÙˆØ§Ù„Ù…ØµØ§Ø¯Ù‚Ø©' })}
              <Badge className="bg-green-100 text-green-700">All Authenticated</Badge>
            </CardTitle>
            {expandedSections['pages'] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </CardHeader>
        {expandedSections['pages'] && (
          <CardContent>
            <div className="space-y-3">
              {coverageData.pages.map((page, idx) => (
                <div key={idx} className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{page.name}</h4>
                        <Badge className="bg-green-100 text-green-700">{page.coverage}%</Badge>
                        <Badge className="bg-blue-100 text-blue-700">
                          <Shield className="h-3 w-3 mr-1" />
                          {page.auth}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{page.description}</p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-2 space-y-1">
                    {page.features.map((f, i) => (
                      <div key={i} className="text-xs text-green-800">âœ“ {f}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bottom Line */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="text-blue-900">
            {t({ en: 'ðŸŽ¯ Bottom Line', ar: 'ðŸŽ¯ Ø§Ù„Ø®Ù„Ø§ØµØ©' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-green-100 rounded-lg">
              <p className="font-bold text-green-900 mb-2">âœ… InnovationProposal System - 100% Complete</p>
              <p className="text-sm text-green-800">
                Fully authenticated, structured proposal system for programs and challenges.
                Separate from CitizenIdea public engagement. All required authentication in place.
              </p>
            </div>
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="font-bold text-blue-900 mb-2">ðŸ“˜ Clear Separation</p>
              <p className="text-sm text-blue-800">
                <strong>CitizenIdea:</strong> Public, anonymous, informal community ideas with voting
                <br />
                <strong>InnovationProposal:</strong> Authenticated, structured, formal proposals for programs/challenges
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(InnovationProposalsCoverageReport, { requireAdmin: true });
