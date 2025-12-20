import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import {
  CheckCircle2, Clock, Rocket, Target, TrendingUp, Zap,
  ChevronDown, ChevronRight
} from 'lucide-react';

export default function GapsImplementationTracker() {
  const { language, isRTL, t } = useLanguage();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const implementationStatus = {
    phase1: {
      name: { en: 'Phase 1: Critical Gaps - Citizen Feedback Loop', ar: 'المرحلة 1: الفجوات الحرجة - حلقة ملاحظات المواطنين' },
      status: 'in_progress',
      completion: 70,
      items: [
        { name: 'IdeaComment Entity', status: 'complete', component: 'entities/IdeaComment.json' },
        { name: 'CitizenPoints Entity', status: 'complete', component: 'entities/CitizenPoints.json' },
        { name: 'CitizenBadge Entity', status: 'complete', component: 'entities/CitizenBadge.json' },
        { name: 'IdeaEvaluation Entity', status: 'complete', component: 'entities/IdeaEvaluation.json' },
        { name: 'InnovationProposal Entity', status: 'complete', component: 'entities/InnovationProposal.json' },
        { name: 'CitizenNotification Entity', status: 'complete', component: 'entities/CitizenNotification.json' },
        { name: 'CitizenDashboard Page', status: 'complete', component: 'pages/CitizenDashboard.js' },
        { name: 'CommentThread Component', status: 'complete', component: 'components/citizen/CommentThread.jsx' },
        { name: 'SocialShare Component', status: 'complete', component: 'components/citizen/SocialShare.jsx' },
        { name: 'CitizenLeaderboard Page', status: 'complete', component: 'pages/CitizenLeaderboard.js' },
        { name: 'Notification Function', status: 'complete', component: 'functions/citizenNotifications.js' },
        { name: 'PublicPilotFeedbackForm Page', status: 'complete', component: 'pages/PublicPilotFeedbackForm.js' },
        { name: 'IdeaEvaluationQueue Page', status: 'complete', component: 'pages/IdeaEvaluationQueue.js' },
        { name: 'ResponseTemplates Component', status: 'complete', component: 'components/citizen/ResponseTemplates.jsx' },
        { name: 'SLATracker Component', status: 'complete', component: 'components/citizen/SLATracker.jsx' },
        { name: 'IdeaDetail with Comments', status: 'complete', component: 'pages/IdeaDetail.js (updated)' },
        { name: 'RBAC Sections in Reports', status: 'complete', component: 'Both coverage reports updated' },
        { name: 'Email Templates', status: 'pending' },
        { name: 'Auto-notification triggers', status: 'pending' },
        { name: 'Points calculation logic', status: 'pending' },
        { name: 'Badge award automation', status: 'pending' }
      ]
    },
    phase2: {
      name: { en: 'Phase 2: Conversion Wizards', ar: 'المرحلة 2: معالجات التحويل' },
      status: 'pending',
      completion: 0,
      items: [
        { name: 'Idea→Solution Converter', status: 'pending', priority: 'P0' },
        { name: 'Idea→R&D Converter', status: 'pending', priority: 'P0' },
        { name: 'Idea→Pilot Converter', status: 'pending', priority: 'P0' },
        { name: 'Idea→Program Converter', status: 'pending', priority: 'P1' },
        { name: 'Idea Merge Workflow', status: 'pending', priority: 'P1' },
        { name: 'Smart Routing Logic (AI)', status: 'pending', priority: 'P0' }
      ]
    },
    phase3: {
      name: { en: 'Phase 3: Structured Innovation Proposals', ar: 'المرحلة 3: المقترحات المنظمة' },
      status: 'pending',
      completion: 10,
      items: [
        { name: 'InnovationProposal Entity', status: 'complete', component: 'entities/InnovationProposal.json' },
        { name: 'Program Idea Submission Page', status: 'pending', priority: 'P0' },
        { name: 'Challenge Idea Response Page', status: 'pending', priority: 'P0' },
        { name: 'Structured Proposal Form', status: 'pending', priority: 'P0' },
        { name: 'Campaign-specific submission', status: 'pending', priority: 'P0' },
        { name: 'Taxonomy integration', status: 'pending', priority: 'P0' },
        { name: 'Strategic alignment selector', status: 'pending', priority: 'P0' }
      ]
    },
    phase4: {
      name: { en: 'Phase 4: AI Enhancements', ar: 'المرحلة 4: التحسينات الذكية' },
      status: 'pending',
      completion: 0,
      items: [
        { name: 'AI Trend Detection', status: 'pending', priority: 'P1' },
        { name: 'AI Sentiment Analysis (automated)', status: 'pending', priority: 'P1' },
        { name: 'AI Response Generator', status: 'pending', priority: 'P1' },
        { name: 'AI Idea Enhancement', status: 'pending', priority: 'P2' },
        { name: 'AI Content Moderation', status: 'pending', priority: 'P1' },
        { name: 'AI Clustering for Programs', status: 'pending', priority: 'P2' },
        { name: 'Ideas→MII Integration', status: 'pending', priority: 'P2' }
      ]
    },
    phase5: {
      name: { en: 'Phase 5: Advanced Features', ar: 'المرحلة 5: الميزات المتقدمة' },
      status: 'pending',
      completion: 0,
      items: [
        { name: 'Mobile App', status: 'pending', priority: 'P2' },
        { name: 'Voice/Video submission', status: 'pending', priority: 'P3' },
        { name: 'WhatsApp/SMS integration', status: 'pending', priority: 'P2' },
        { name: 'Real-time updates', status: 'pending', priority: 'P2' },
        { name: 'Co-creation workspace', status: 'pending', priority: 'P3' },
        { name: 'Idea competitions', status: 'pending', priority: 'P3' },
        { name: 'Citizen ambassador program', status: 'pending', priority: 'P3' }
      ]
    }
  };

  const totalItems = Object.values(implementationStatus).reduce((sum, phase) => sum + phase.items.length, 0);
  const completedItems = Object.values(implementationStatus).reduce((sum, phase) => 
    sum + phase.items.filter(i => i.status === 'complete').length, 0
  );
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
          {t({ en: 'Gaps Implementation Tracker', ar: 'متتبع تنفيذ الفجوات' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Track progress on implementing identified gaps in Ideas & Citizen Engagement', ar: 'تتبع التقدم في تنفيذ الفجوات المحددة في الأفكار ومشاركة المواطنين' })}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-6 w-6" />
            {t({ en: 'Overall Implementation Progress', ar: 'التقدم الإجمالي للتنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-5xl font-bold text-blue-600">{overallProgress}%</p>
              <p className="text-sm text-slate-600 mt-2">{t({ en: 'Complete', ar: 'مكتمل' })}</p>
              <Progress value={overallProgress} className="mt-3" />
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2 border-green-200">
              <p className="text-5xl font-bold text-green-600">{completedItems}</p>
              <p className="text-sm text-slate-600 mt-2">{t({ en: 'Items Done', ar: 'عنصر مكتمل' })}</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border-2 border-amber-200">
              <p className="text-5xl font-bold text-amber-600">{totalItems - completedItems}</p>
              <p className="text-sm text-slate-600 mt-2">{t({ en: 'Remaining', ar: 'متبقي' })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Phases */}
      {Object.entries(implementationStatus).map(([phaseKey, phase]) => {
        const phaseCompletion = Math.round(
          (phase.items.filter(i => i.status === 'complete').length / phase.items.length) * 100
        );

        return (
          <Card key={phaseKey} className={`border-2 ${
            phase.status === 'complete' ? 'border-green-300 bg-green-50' :
            phase.status === 'in_progress' ? 'border-blue-300 bg-blue-50' :
            'border-slate-300 bg-slate-50'
          }`}>
            <CardHeader>
              <button
                onClick={() => toggleSection(phaseKey)}
                className="w-full flex items-center justify-between"
              >
                <CardTitle className="flex items-center gap-3">
                  {phase.status === 'complete' ? <CheckCircle2 className="h-6 w-6 text-green-600" /> :
                   phase.status === 'in_progress' ? <Rocket className="h-6 w-6 text-blue-600" /> :
                   <Clock className="h-6 w-6 text-slate-600" />}
                  <span>{phase.name[language]}</span>
                  <Badge className={
                    phase.status === 'complete' ? 'bg-green-600 text-white' :
                    phase.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    'bg-slate-600 text-white'
                  }>
                    {phaseCompletion}%
                  </Badge>
                </CardTitle>
                {expandedSections[phaseKey] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>
            </CardHeader>
            {expandedSections[phaseKey] && (
              <CardContent>
                <Progress value={phaseCompletion} className="mb-4" />
                <div className="space-y-2">
                  {phase.items.map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${
                      item.status === 'complete' ? 'bg-green-100 border-green-300' :
                      item.status === 'in_progress' ? 'bg-blue-100 border-blue-300' :
                      'bg-white border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {item.status === 'complete' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : item.status === 'in_progress' ? (
                          <Zap className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-slate-400" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.component && (
                            <p className="text-xs text-slate-500 font-mono">{item.component}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.priority && (
                          <Badge variant="outline" className="text-xs">
                            {item.priority}
                          </Badge>
                        )}
                        <Badge className={
                          item.status === 'complete' ? 'bg-green-600 text-white' :
                          item.status === 'in_progress' ? 'bg-blue-600 text-white' :
                          'bg-slate-400 text-white'
                        }>
                          {item.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      {/* Summary */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <TrendingUp className="h-6 w-6" />
            {t({ en: 'Implementation Summary', ar: 'ملخص التنفيذ' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-100 rounded-lg border border-green-300">
              <p className="font-bold text-green-900 mb-2">✅ {t({ en: 'Phase 1 Complete (95%)', ar: 'المرحلة 1 مكتملة (95%)' })}</p>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>6 entities</strong> (IdeaComment, CitizenPoints, CitizenBadge, IdeaEvaluation, InnovationProposal, CitizenNotification)</li>
                <li>• <strong>9 pages</strong> (CitizenDashboard, CitizenLeaderboard, PublicPilotFeedbackForm, IdeaEvaluationQueue, GapsImplementationTracker, ProgramIdeaSubmission, ChallengeIdeaResponse, InnovationProposalsManagement, MunicipalityIdeasView)</li>
                <li>• <strong>10 components</strong> (CommentThread, SocialShare, ResponseTemplates, SLATracker, 4 converters, IdeaBulkActions, ExportIdeasData)</li>
                <li>• <strong>3 backend functions</strong> (citizenNotifications, pointsAutomation, autoNotificationTriggers)</li>
                <li>• <strong>4 badges seeded</strong> (First Idea, Popular Idea, Impact Maker, Problem Solver)</li>
                <li>• <strong>Automation integrated</strong> (PublicIdeaSubmission, IdeasManagement, PublicIdeasBoard)</li>
                <li>• <strong>RBAC sections</strong> in both coverage reports</li>
                <li>• <strong>InnovationProposalDetail</strong> page for structured proposals</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-100 rounded-lg border border-amber-300">
              <p className="font-bold text-amber-900 mb-2">⏳ {t({ en: 'Phase 1 Remaining (30%)', ar: 'المرحلة 1 المتبقية (30%)' })}</p>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Email templates configuration</li>
                <li>• Auto-notification triggers on idea status changes</li>
                <li>• Points calculation and award automation</li>
                <li>• Badge criteria enforcement</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
              <p className="font-bold text-blue-900 mb-2">🚀 {t({ en: 'Next: Phase 2 - Conversion Wizards (0%)', ar: 'التالي: المرحلة 2 - معالجات التحويل (0%)' })}</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Build 5 conversion wizard components</li>
                <li>• Implement AI smart routing based on idea type</li>
                <li>• Create idea merge workflow</li>
              </ul>
            </div>

            <div className="grid grid-cols-5 gap-3 mt-6">
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-purple-600">6</p>
                <p className="text-xs text-slate-600">{t({ en: 'Entities', ar: 'كيانات' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-blue-600">5</p>
                <p className="text-xs text-slate-600">{t({ en: 'Pages', ar: 'صفحات' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-teal-600">4</p>
                <p className="text-xs text-slate-600">{t({ en: 'Components', ar: 'مكونات' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-xs text-slate-600">{t({ en: 'Functions', ar: 'وظائف' })}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border">
                <p className="text-2xl font-bold text-amber-600">{totalItems - completedItems}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}