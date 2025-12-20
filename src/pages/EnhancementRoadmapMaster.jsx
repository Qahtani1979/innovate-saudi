import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';

import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { CheckCircle2, Database, BarChart, TrendingUp
} from 'lucide-react';

export default function EnhancementRoadmapMaster() {
  const { t, language } = useLanguage();
  const [selectedPhase, setSelectedPhase] = useState('all');

  const phases = [
    {
      id: 'performance',
      name: { en: 'Critical Database Performance', ar: 'أداء قاعدة البيانات الحرج' },
      icon: Database,
      color: 'orange',
      items: [
        'Database Indexing Strategy - Deploy Critical Indexes',
        'Index Monitoring & Maintenance',
        'Query Performance Validation'
      ]
    }
  ];

  const stats = {
    totalEnhancements: 87,
    completed: 75,
    remaining: 12,
    percentComplete: 86,
    infrastructureDeployment: 12
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-white">
        <div>
          <h1 className="text-5xl font-bold mb-2">
            {t({ en: 'Master Enhancement Roadmap', ar: 'خارطة التحسينات الرئيسية' })}
          </h1>
          <p className="text-xl text-white/90">
            {t({ en: 'Track all 87 optional enhancements - 75 completed, 12 infrastructure remaining', ar: 'تتبع 87 تحسين اختياري - 75 مكتمل، 12 بنية تحتية متبقي' })}
          </p>
          <div className="mt-4 flex gap-3 text-sm">
            <span className="bg-white/10 px-3 py-1 rounded-full">195/207 Complete (94%)</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">75 Enhancements Added</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">12 Infrastructure Remaining</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-blue-600">{stats.remaining}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Remaining', ar: 'متبقي' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-purple-600">{stats.totalEnhancements}</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Total Optional', ar: 'إجمالي اختياري' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white border-2 border-teal-200">
          <CardContent className="pt-6 text-center">
            <p className="text-4xl font-bold text-teal-600">{stats.percentComplete}%</p>
            <p className="text-sm text-slate-600 mt-1">{t({ en: 'Progress', ar: 'التقدم' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Completions */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            {t({ en: '✅ Latest Completions (Dec 4, 2025)', ar: '✅ آخر الإنجازات (4 ديسمبر 2025)' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>NetworkTabAnalysis page</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>ChallengeDetailGapsVerified page</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>MatchmakerSuccessAnalytics page</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>Programs - RBAC protection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>Portfolio - RBAC protection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>PolicyHub - RBAC protection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>ExpertAssignmentQueue - Permission check</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>ExpertOnboarding - Public access</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>IdeaFieldSecurity - PII protection</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>RDCallActivityLog component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>OrganizationActivityLog component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>SandboxActivityLog component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>LivingLabActivityLog component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>MatchmakerActivityLog component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>BookmarkButton + MyBookmarks page</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>ShareButton component</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>ExportPDFButton + PrintButton</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>KeyboardShortcuts + DarkModeToggle</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>RecentItems + HelpTooltip</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>FieldPermissions + ProtectedAction</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>BilingualText + BilingualValidation</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>MobileTableCard + MobileNav + PWA</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white rounded border text-xs">
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span>TouchOptimized components</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Deployment Summary */}
      <Card className="border-2 border-orange-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-orange-600" />
            {t({ en: '12 Infrastructure Deployment Items (All UI Ready)', ar: '12 عنصر نشر بنية تحتية (كل الواجهة جاهزة)' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-2 border-red-200">
              <span className="font-medium">Security Infrastructure</span>
              <Badge className="bg-red-600">5 items</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-2 border-orange-200">
              <span className="font-medium">Performance Infrastructure</span>
              <Badge className="bg-orange-600">2 items</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border-2 border-amber-200">
              <span className="font-medium">Cloud Infrastructure</span>
              <Badge className="bg-amber-600">3 items</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
              <span className="font-medium">Integration & Monitoring</span>
              <Badge className="bg-yellow-600">2 items</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link to={createPageUrl('PlatformCoverageAudit')}>
          <Button className="w-full bg-blue-600">
            <BarChart className="h-4 w-4 mr-2" />
            {t({ en: 'Coverage Audit', ar: 'تدقيق التغطية' })}
          </Button>
        </Link>
        <Link to={createPageUrl('RemainingTasksDetail')}>
          <Button className="w-full bg-purple-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t({ en: 'Detailed Task List', ar: 'قائمة المهام التفصيلية' })}
          </Button>
        </Link>
      </div>
    </div>
  );
}