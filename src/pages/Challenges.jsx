import { useState } from 'react';
import ChallengeClustering from '../components/challenges/ChallengeClustering';
import ChallengeToProgramWorkflow from '../components/challenges/ChallengeToProgramWorkflow';
import { useProgramMutations } from '@/hooks/useProgramMutations';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Archive,
  LayoutGrid,
  List,
  Loader2,
  CheckCircle2,
  Target
} from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from 'sonner';
import ExportData from '../components/ExportData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from '../components/permissions/usePermissions';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { useChallengeListRealtime } from '@/hooks/useChallengeRealtime';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import VirtualizedChallengeGrid from '@/components/challenges/VirtualizedChallengeGrid';
import { useChallengeMutations } from '@/hooks/useChallengeMutations';

function Challenges() {
  const { hasPermission, isAdmin, isDeputyship, isMunicipality, isStaffUser } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedIds, setSelectedIds] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const { refreshPrograms } = useProgramMutations();
  const { language, isRTL, t } = useLanguage();

  const { invokeAI, status: aiStatus, isLoading: aiAnalyzing, isAvailable, rateLimitInfo } = useAIWithFallback();

  // Use visibility-aware hook for challenges
  const { data: challenges = [], isLoading } = useChallengesWithVisibility({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sectorId: sectorFilter !== 'all' ? sectorFilter : undefined,
    limit: 100
  });

  // Enable realtime updates (rt-1, live-1)
  const { isConnected: realtimeConnected } = useChallengeListRealtime();

  // Use mutations hook
  const { deleteChallenge, archiveChallenge, changeStatus } = useChallengeMutations();

  const generateAIInsights = async () => {
    if (!challenges || challenges.length === 0) {
      toast.error(t({ en: 'No challenges available', ar: 'لا توجد تحديات متاحة' }));
      return;
    }

    const topChallenges = challenges
      .filter(c => c.priority === 'tier_1' || c.priority === 'tier_2')
      .slice(0, 5);

    if (topChallenges.length === 0) {
      toast.info(t({ en: 'No high-priority challenges to analyze', ar: 'لا توجد تحديات ذات أولوية عالية للتحليل' }));
      return;
    }

    try {
      // Import centralized prompt module
      const { CHALLENGE_PORTFOLIO_PROMPT_TEMPLATE, CHALLENGE_PORTFOLIO_RESPONSE_SCHEMA } = await import('@/lib/ai/prompts/challenges/portfolioAnalysis');

      const result = await invokeAI({
        system_prompt: "You are an expert innovation consultant analyzing a portfolio of challenges. Return only valid JSON.",
        prompt: CHALLENGE_PORTFOLIO_PROMPT_TEMPLATE(topChallenges),
        response_json_schema: CHALLENGE_PORTFOLIO_RESPONSE_SCHEMA || {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            priority_sectors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sector: { type: 'string' },
                  reason_en: { type: 'string' },
                  reason_ar: { type: 'string' }
                }
              }
            },
            systemic_solutions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            risk_alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            quick_wins: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  challenge_code: { type: 'string' },
                  approach_en: { type: 'string' },
                  approach_ar: { type: 'string' }
                }
              }
            },
            recommendations_en: { type: 'string' },
            recommendations_ar: { type: 'string' },
            coordination_opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            },
            technology_opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  en: { type: 'string' },
                  ar: { type: 'string' }
                }
              }
            }
          }
        }
      });

      setAiInsights(result);
      toast.success(t({ en: 'AI analysis complete', ar: 'اكتمل التحليل الذكي' }));
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast.error(t({ en: 'AI analysis failed', ar: 'فشل التحليل الذكي' }));
    }
  };

  const handleBulkAction = async (action) => {
    if (action === 'clear') {
      setSelectedIds([]);
      return;
    }
    if (selectedIds.length === 0) return;

    if (action === 'approve') {
      try {
        await Promise.all(selectedIds.map(id => changeStatus.mutateAsync({ id, newStatus: 'approved' })));
        toast.success(t({ en: `${selectedIds.length} challenges approved`, ar: `تم اعتماد ${selectedIds.length} تحديات` }));
      } catch (error) {
        console.error("Bulk approve failed", error);
        toast.error(t({ en: 'Bulk approval failed', ar: 'فشل الاعتماد الجماعي' }));
      }
    } else if (action === 'archive') {
      try {
        await Promise.all(selectedIds.map(id => archiveChallenge.mutateAsync(id)));
        toast.success(t({ en: `${selectedIds.length} challenges archived`, ar: `تم أرشفة ${selectedIds.length} تحديات` }));
      } catch (error) {
        console.error("Bulk archive failed", error);
        toast.error(t({ en: 'Bulk archive failed', ar: 'فشل الأرشفة الجماعية' }));
      }
    } else if (action === 'delete') {
      if (confirm(t({ en: `Delete ${selectedIds.length} challenges permanently?`, ar: `حذف ${selectedIds.length} تحديات نهائياً؟` }))) {
        try {
          await Promise.all(selectedIds.map(id => deleteChallenge.mutateAsync(id)));
          toast.success(t({ en: `${selectedIds.length} challenges deleted`, ar: `تم حذف ${selectedIds.length} تحديات` }));
        } catch (error) {
          console.error("Bulk delete failed", error);
          toast.error(t({ en: 'Bulk delete failed', ar: 'فشل الحذف الجماعي' }));
        }
      }
    }
    setSelectedIds([]);
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.title_ar?.includes(searchTerm) ||
      challenge.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || challenge.sector === sectorFilter;
    const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
    const notHidden = !challenge.is_hidden;
    return matchesSearch && matchesSector && matchesStatus && notHidden;
  });

  const sectorOptions = [
    { value: 'urban_design', label: { en: 'Urban Design', ar: 'التصميم العمراني' } },
    { value: 'transport', label: { en: 'Transport', ar: 'النقل' } },
    { value: 'environment', label: { en: 'Environment', ar: 'البيئة' } },
    { value: 'digital_services', label: { en: 'Digital Services', ar: 'الخدمات الرقمية' } },
    { value: 'health', label: { en: 'Health', ar: 'الصحة' } },
    { value: 'education', label: { en: 'Education', ar: 'التعليم' } },
    { value: 'safety', label: { en: 'Safety', ar: 'السلامة' } },
    { value: 'economic_development', label: { en: 'Economic Development', ar: 'التنمية الاقتصادية' } },
    { value: 'social_services', label: { en: 'Social Services', ar: 'الخدمات الاجتماعية' } },
    { value: 'other', label: { en: 'Other', ar: 'أخرى' } }
  ];

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    submitted: 'bg-blue-100 text-blue-700 border-blue-300',
    under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    approved: 'bg-green-100 text-green-700 border-green-300',
    in_treatment: 'bg-purple-100 text-purple-700 border-purple-300',
    resolved: 'bg-teal-100 text-teal-700 border-teal-300',
    archived: 'bg-gray-100 text-gray-700 border-gray-300'
  };

  const priorityColors = {
    tier_1: 'bg-red-100 text-red-700 border-red-300',
    tier_2: 'bg-orange-100 text-orange-700 border-orange-300',
    tier_3: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    tier_4: 'bg-green-100 text-green-700 border-green-300'
  };

  const headerActions = (
    <div className="flex items-center gap-2">
      <ExportData data={filteredChallenges} filename="challenges" entityType="Challenge" />
      {hasPermission('challenge_create') && (
        <Link to={createPageUrl('ChallengeCreate')}>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg">
            <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t({ en: 'Add Challenge', ar: 'إضافة تحدي' })}
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={Target}
        title={{ en: 'Challenge Bank', ar: 'بنك التحديات' }}
        description={{ en: 'National repository of municipal challenges', ar: 'المستودع الوطني للتحديات البلدية' }}
        actions={headerActions}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

        {/* AI Insights Banner */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{t({ en: 'AI Analysis', ar: 'تحليل الذكاء الاصطناعي' })}</p>
              <p className="text-sm text-slate-600 mt-1">
                {t({ en: `${challenges.length} challenges identified`, ar: `تم تحديد ${challenges.length} تحدي` })}.{' '}
                <span className="text-blue-600 font-medium">
                  {challenges.filter(c => c.priority === 'tier_1' || c.priority === 'tier_2').length} {t({ en: 'high-priority challenges require immediate attention', ar: 'تحدي عالي الأولوية يتطلب اهتماماً فورياً' })}
                </span>.
              </p>
            </div>
            <Button
              onClick={generateAIInsights}
              disabled={aiAnalyzing || isLoading || challenges.length === 0}
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-teal-600"
            >
              {aiAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
        </Card>

        {aiInsights && (
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-purple-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.patterns?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Common Patterns:', ar: 'الأنماط المشتركة:' })}</p>
                  <div className="space-y-1">
                    {aiInsights.patterns.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                        <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {typeof p === 'string' ? p : (language === 'ar' && p.ar ? p.ar : p.en)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiInsights.priority_sectors?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Priority Sectors:', ar: 'القطاعات ذات الأولوية:' })}</p>
                  <div className="space-y-2">
                    {aiInsights.priority_sectors.map((s, i) => (
                      <div key={i} className="p-3 bg-white rounded-lg border">
                        <Badge className="bg-red-100 text-red-700 mb-1">
                          {typeof s === 'string' ? s : s.sector}
                        </Badge>
                        {typeof s === 'object' && (s.reason_en || s.reason_ar) && (
                          <p className="text-xs text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' && s.reason_ar ? s.reason_ar : s.reason_en}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiInsights.quick_wins?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Quick Wins:', ar: 'الإنجازات السريعة:' })}</p>
                  <div className="space-y-2">
                    {aiInsights.quick_wins.map((w, i) => (
                      <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            {typeof w === 'object' && w.challenge_code && (
                              <Badge variant="outline" className="text-xs mb-1">{w.challenge_code}</Badge>
                            )}
                            <p className="text-sm text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              {typeof w === 'string' ? w : (language === 'ar' && w.approach_ar ? w.approach_ar : w.approach_en)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(aiInsights.recommendations_en || aiInsights.recommendations_ar || aiInsights.recommendations) && (
                <div className="p-4 bg-white/50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Strategic Recommendations:', ar: 'التوصيات الاستراتيجية:' })}</p>
                  <p className="text-sm text-slate-700 leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' && aiInsights.recommendations_ar
                      ? aiInsights.recommendations_ar
                      : aiInsights.recommendations_en || aiInsights.recommendations}
                  </p>
                </div>
              )}
              {aiInsights.coordination_opportunities?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Coordination Opportunities:', ar: 'فرص التنسيق:' })}</p>
                  <div className="space-y-1">
                    {aiInsights.coordination_opportunities.map((opp, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-blue-700">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600 mt-1.5" />
                        <span dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          {typeof opp === 'string' ? opp : (language === 'ar' && opp.ar ? opp.ar : opp.en)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiInsights.technology_opportunities?.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-purple-900 mb-2">{t({ en: 'Technology Opportunities:', ar: 'فرص التقنية:' })}</p>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.technology_opportunities.map((tech, i) => (
                      <Badge key={i} variant="outline" className="bg-white" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {typeof tech === 'string' ? tech : (language === 'ar' && tech.ar ? tech.ar : tech.en)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedIds.length} {t({ en: 'selected', ar: 'محدد' })}
            </span>
            {hasPermission('challenge_approve') && (
              <Button size="sm" onClick={() => handleBulkAction('approve')} className="bg-green-600">
                {t({ en: 'Approve All', ar: 'الموافقة على الكل' })}
              </Button>
            )}
            {(hasPermission('challenge_edit') || isAdmin) && (
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                {t({ en: 'Archive All', ar: 'أرشفة الكل' })}
              </Button>
            )}
            {hasPermission('challenge_delete') && (
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} className="text-red-600">
                {t({ en: 'Delete All', ar: 'حذف الكل' })}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => handleBulkAction('clear')}>
              {t({ en: 'Clear', ar: 'مسح' })}
            </Button>
          </div>
        )}

        {/* View Mode Tabs */}
        <Tabs defaultValue="grid" value={viewMode} onValueChange={setViewMode}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grid">{t({ en: 'Grid View', ar: 'عرض الشبكة' })}</TabsTrigger>
            <TabsTrigger value="table">{t({ en: 'Table View', ar: 'عرض الجدول' })}</TabsTrigger>
            <TabsTrigger value="clusters">{t({ en: 'AI Clusters', ar: 'التجمعات الذكية' })}</TabsTrigger>
          </TabsList>

          {/* Filters */}
          <Card className="p-6 mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
                <Input
                  placeholder={t({ en: 'Search by title, code, or keyword...', ar: 'ابحث بالعنوان، الرمز، أو الكلمة المفتاحية...' })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10' : 'pl-10'}
                />
              </div>

              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-48">
                  <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <SelectValue placeholder={t({ en: 'All Sectors', ar: 'جميع القطاعات' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</SelectItem>
                  {sectorOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t({ en: 'All Status', ar: 'جميع الحالات' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
                  {/* ... statuses ... */}
                  <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                  <SelectItem value="submitted">{t({ en: 'Submitted', ar: 'مُقدّم' })}</SelectItem>
                  <SelectItem value="under_review">{t({ en: 'Under Review', ar: 'قيد المراجعة' })}</SelectItem>
                  <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
                  <SelectItem value="in_treatment">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</SelectItem>
                  <SelectItem value="resolved">{t({ en: 'Resolved', ar: 'محلول' })}</SelectItem>
                  <SelectItem value="archived">{t({ en: 'Archived', ar: 'مؤرشف' })}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <TabsContent value="grid">
            {/* Grid View - With Virtualization for large lists */}
            <VirtualizedChallengeGrid
              challenges={filteredChallenges}
              statusColors={statusColors}
              priorityColors={priorityColors}
              language={language}
              t={t}
              hasPermission={hasPermission}
            />
          </TabsContent>

          <TabsContent value="table">
            {/* Table View */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === filteredChallenges.length && filteredChallenges.length > 0}
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked ? filteredChallenges.map(c => c.id) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Code', ar: 'الرمز' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Title', ar: 'العنوان' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Sector', ar: 'القطاع' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Municipality', ar: 'البلدية' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Priority', ar: 'الأولوية' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Score', ar: 'النقاط' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</TableHead>
                    <TableHead className="font-semibold">{t({ en: 'Track', ar: 'المسار' })}</TableHead>
                    <TableHead className={`${isRTL ? 'text-left' : 'text-right'} font-semibold`}>{t({ en: 'Actions', ar: 'الإجراءات' })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={9}>
                          <div className="h-12 bg-slate-100 rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredChallenges.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <AlertTriangle className="h-12 w-12 text-slate-400" />
                          <p className="text-slate-600">{t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChallenges.map((challenge) => (
                      <TableRow
                        key={challenge.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(challenge.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds(checked
                                ? [...selectedIds, challenge.id]
                                : selectedIds.filter(id => id !== challenge.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{challenge.code}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 capitalize">
                            {challenge.sector?.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {challenge.municipality_id?.substring(0, 15)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[challenge.priority] || priorityColors.tier_3}>
                            {challenge.priority?.replace('tier_', 'T')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{challenge.overall_score || 0}</span>
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[challenge.status]}>
                            {challenge.status?.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 capitalize">
                            {challenge.track?.replace(/_/g, ' ') || t({ en: 'None', ar: 'لا يوجد' })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                              <Button variant="ghost" size="icon" className="hover:bg-blue-50">
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                            </Link>
                            {hasPermission('challenge_edit') && (
                              <Link to={createPageUrl(`ChallengeEdit?id=${challenge.id}`)}>
                                <Button variant="ghost" size="icon" className="hover:bg-yellow-50">
                                  <Edit className="h-4 w-4 text-yellow-600" />
                                </Button>
                              </Link>
                            )}
                            {(hasPermission('challenge_edit') || isAdmin) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => archiveChallenge.mutate(challenge.id)}
                                className="hover:bg-amber-50"
                              >
                                <Archive className="h-4 w-4 text-amber-600" />
                              </Button>
                            )}
                            {hasPermission('challenge_delete') && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm(t({ en: 'Delete permanently?', ar: 'حذف نهائياً؟' }))) {
                                    deleteChallenge.mutate(challenge.id);
                                  }
                                }}
                                className="hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="clusters">
            {/* Clustering View with Program Creation */}
            <ChallengeClustering
              challenges={filteredChallenges}
              onClusterAction={(cluster) => {
                // Allow creating program from cluster
                const clusterChallenges = filteredChallenges.filter(c =>
                  cluster.challenge_ids?.includes(c.id)
                );
                if (clusterChallenges.length >= 2) {
                  // Show program creation workflow
                  return <ChallengeToProgramWorkflow
                    selectedChallenges={clusterChallenges}
                    onSuccess={refreshPrograms}
                    onCancel={() => { }}
                  />;
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(Challenges, { requiredPermissions: ['challenge_view_all', 'challenge_view_own', 'challenge_view', 'challenge_create', 'dashboard_view'] });