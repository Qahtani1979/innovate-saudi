import { useState } from 'react';

import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Lightbulb,
  Building2,
  TrendingUp,
  Star,
  ExternalLink,
  Plus,
  Edit,
  Sparkles,
  Loader2,
  X,
  Trash2,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '@/hooks/usePermissions';
import { usePrompt } from '@/hooks/usePrompt';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useSolutionMutations } from '@/hooks/useSolutionMutations';
import SolutionErrorBoundary from '../components/solutions/SolutionErrorBoundary';
import SolutionDeleteDialog from '../components/solutions/SolutionDeleteDialog';

// Pluralization helper (i18n-4)
const pluralize = (count, singular, plural) => count === 1 ? singular : plural;

function SolutionsPage() {
  const { hasPermission, isAdmin, isDeputyship, isMunicipality, isStaffUser, user } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [maturityFilter, setMaturityFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at'); // lc-3: Sort state
  const [sortOrder, setSortOrder] = useState('desc'); // lc-3: Sort order
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState(null);
  const { invoke: invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = usePrompt(null);
  const { language, isRTL, t } = useLanguage();



  // Use visibility-aware hook for solutions
  const { data: solutionsResponse, isLoading } = useSolutionsWithVisibility({
    sectorId: sectorFilter !== 'all' ? sectorFilter : undefined,
    maturityLevel: maturityFilter !== 'all' ? maturityFilter : undefined,
    limit: 100
  });

  const solutions = Array.isArray(solutionsResponse) ? solutionsResponse : (solutionsResponse?.data || []);

  // mh-2: Optimistic updates handled in hook
  const { deleteSolution, bulkArchiveSolutions, togglePublishSolution } = useSolutionMutations();

  const handleDeleteClick = (solution, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSolutionToDelete(solution);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (solutionToDelete) {
      deleteSolution.mutate(solutionToDelete.id, {
        onSuccess: () => { // Callback handled in hook but can add local state cleanup
          setDeleteDialogOpen(false);
          setSolutionToDelete(null);
        }
      });
    }
  };

  // lc-3: Filter and sort solutions
  const filteredSolutions = solutions.filter(solution => {
    const matchesSearch = solution.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solution.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = sectorFilter === 'all' || solution.sectors?.includes(sectorFilter);
    const matchesMaturity = maturityFilter === 'all' || solution.maturity_level === maturityFilter;
    const notArchived = !solution.is_archived;
    return matchesSearch && matchesSector && matchesMaturity && notArchived;
  }).sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (sortField === 'name_en') {
      aVal = aVal?.toLowerCase() || '';
      bVal = bVal?.toLowerCase() || '';
    }
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const maturityColors = {
    concept: 'bg-slate-100 text-slate-700',
    prototype: 'bg-blue-100 text-blue-700',
    pilot_ready: 'bg-purple-100 text-purple-700',
    market_ready: 'bg-green-100 text-green-700',
    proven: 'bg-teal-100 text-teal-700'
  };

  const providerTypeColors = {
    startup: 'bg-orange-100 text-orange-700',
    sme: 'bg-blue-100 text-blue-700',
    corporate: 'bg-purple-100 text-purple-700',
    university: 'bg-green-100 text-green-700',
    research_center: 'bg-teal-100 text-teal-700'
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);

    // Import centralized prompt module
    const { solutionPrompts, SOLUTION_SYSTEM_PROMPT } = await import('@/lib/ai/prompts/innovation/solutionPrompts');
    const { buildPrompt } = await import('@/lib/ai/promptBuilder');

    const solutionSummary = solutions.slice(0, 15).map(s => ({
      name: s.name_en,
      provider: s.provider_name,
      maturity: s.maturity_level,
      deployments: s.deployment_count,
      success_rate: s.success_rate,
      sectors: s.sectors
    }));

    const { prompt, schema } = buildPrompt(solutionPrompts.portfolioAnalysis, {
      solutionSummary,
      totalSolutions: solutions.length,
      marketReadyCount: solutions.filter(s => s.maturity_level === 'market_ready' || s.maturity_level === 'proven').length,
      startupCount: solutions.filter(s => s.provider_type === 'startup').length,
      avgDeployments: Math.round(solutions.reduce((acc, s) => acc + (s.deployment_count || 0), 0) / solutions.length || 0)
    });

    const result = await invokeAI({
      prompt,
      system_prompt: SOLUTION_SYSTEM_PROMPT,
      response_json_schema: schema
    });
    if (result.success) {
      setAiInsights(result.data);
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Solutions Marketplace', ar: 'سوق الحلول' }}
        subtitle={{ en: 'Discover validated solutions from providers across the ecosystem', ar: 'اكتشف الحلول المعتمدة من مقدمي الخدمات عبر النظام البيئي' }}
        icon={<Lightbulb className="h-6 w-6 text-white" />}
        actions={<div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-white/50" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
            {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
          </Button>
          {hasPermission('solution_create') && (
            <Link to={createPageUrl('SolutionCreate')}>
              <Button variant="secondary">
                <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Add Solution', ar: 'إضافة حل' })}
              </Button>
            </Link>
          )}
        </div>} description={undefined} action={undefined} children={undefined} />

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" error={undefined} />
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing solutions...', ar: 'جاري تحليل الحلول...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.landscape_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Landscape Gaps', ar: 'الفجوات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.landscape_gaps.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.ecosystem_health?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Ecosystem Health', ar: 'صحة النظام' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.ecosystem_health.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.deployment_strategies?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Deployment Strategies', ar: 'استراتيجيات النشر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.deployment_strategies.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.high_potential_solutions?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'High Potential', ar: 'الإمكانات العالية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.high_potential_solutions.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.market_development?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Market Development', ar: 'تطوير السوق' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.market_development.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: { en: 'Total Solutions', ar: 'إجمالي الحلول' }, value: solutions.length, icon: Lightbulb, color: 'from-yellow-500 to-amber-500' },
          { label: { en: 'Market Ready', ar: 'جاهز للسوق' }, value: solutions.filter(s => s.maturity_level === 'market_ready' || s.maturity_level === 'proven').length, icon: Star, color: 'from-green-500 to-emerald-500' },
          { label: { en: 'Startups', ar: 'الشركات الناشئة' }, value: solutions.filter(s => s.provider_type === 'startup').length, icon: TrendingUp, color: 'from-orange-500 to-red-500' },
          { label: { en: 'Avg. Deployments', ar: 'متوسط عمليات النشر' }, value: Math.round(solutions.reduce((acc, s) => acc + (s.deployment_count || 0), 0) / solutions.length || 0), icon: Building2, color: 'from-blue-500 to-cyan-500' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-gradient-to-br from-white to-slate-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t(stat.label)}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selection Mode & Compare Button */}
      {selectedSolutions.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600 text-white">{selectedSolutions.length} selected</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSolutions([])}
                >
                  Clear
                </Button>
              </div>
              <Link to={createPageUrl('SolutionComparison') + `?ids=${selectedSolutions.join(',')}`}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t({ en: 'Compare Solutions', ar: 'مقارنة الحلول' })}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search solutions or providers...', ar: 'ابحث عن الحلول أو مقدمي الخدمات...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="urban_design">Urban Design</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="environment">Environment</SelectItem>
              <SelectItem value="digital_services">Digital Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maturityFilter} onValueChange={setMaturityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Maturity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Maturity</SelectItem>
              <SelectItem value="concept">Concept</SelectItem>
              <SelectItem value="prototype">Prototype</SelectItem>
              <SelectItem value="pilot_ready">Pilot Ready</SelectItem>
              <SelectItem value="market_ready">Market Ready</SelectItem>
              <SelectItem value="proven">Proven</SelectItem>
            </SelectContent>
          </Select>

          {/* lc-3: Sort controls */}
          <Select value={sortField} onValueChange={setSortField}>
            <SelectTrigger className="w-40">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">{t({ en: 'Date Created', ar: 'تاريخ الإنشاء' })}</SelectItem>
              <SelectItem value="name_en">{t({ en: 'Name', ar: 'الاسم' })}</SelectItem>
              <SelectItem value="deployment_count">{t({ en: 'Deployments', ar: 'عمليات النشر' })}</SelectItem>
              <SelectItem value="trl">{t({ en: 'TRL Level', ar: 'مستوى TRL' })}</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </Card>

      {/* Results count with pluralization (i18n-4) */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          {t({
            en: `${filteredSolutions.length} ${pluralize(filteredSolutions.length, 'solution', 'solutions')} found`,
            ar: `تم العثور على ${filteredSolutions.length} ${pluralize(filteredSolutions.length, 'حل', 'حلول')}`
          })}
        </span>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-slate-200 rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredSolutions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Lightbulb className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No solutions found</p>
          </div>
        ) : (
          filteredSolutions.map((solution) => (
            <Card
              key={solution.id}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
              tabIndex={0}
              role="article"
              aria-label={`${solution.name_en} by ${solution.provider_name}`}
              onKeyDown={(e) => {
                // a11y-3: Keyboard navigation
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  window.location.href = createPageUrl(`SolutionDetail?id=${solution.id}`);
                }
              }}
            >
              {solution.image_url && (
                <div className="h-48 overflow-hidden">
                  <img src={solution.image_url} alt={solution.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {solution.name_en}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <p className="text-sm text-slate-600">{solution.provider_name}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-3">
                  {solution.description_en}
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge className={maturityColors[solution.maturity_level]}>
                    {solution.maturity_level?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={providerTypeColors[solution.provider_type]}>
                    {solution.provider_type?.replace(/_/g, ' ')}
                  </Badge>
                  {solution.trl && (
                    <Badge variant="outline">TRL {solution.trl}</Badge>
                  )}
                </div>

                {/* Deployment Badges - Import at top */}
                {solution.deployment_count >= 1 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {solution.deployment_count >= 10 && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs">🚀 Nationally Deployed</Badge>
                    )}
                    {solution.deployment_count >= 3 && solution.deployment_count < 10 && (
                      <Badge className="bg-green-100 text-green-700 text-xs">🏙️ Multi-City</Badge>
                    )}
                    {solution.deployment_count >= 1 && solution.deployment_count < 3 && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">✅ Pilot Tested</Badge>
                    )}
                  </div>
                )}

                {solution.deployment_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>{solution.deployment_count} deployments</span>
                    {solution.success_rate && (
                      <span className="text-green-600 font-medium">
                        • {solution.success_rate}% success
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedSolutions.includes(solution.id)}
                      onChange={() => {
                        setSelectedSolutions(prev =>
                          prev.includes(solution.id)
                            ? prev.filter(id => id !== solution.id)
                            : [...prev, solution.id]
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                  </div>
                  <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="flex-1">
                    <Button variant="outline" className="w-full group-hover:border-blue-600 group-hover:text-blue-600">
                      {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    </Button>
                  </Link>
                  {hasPermission('solution_edit') && (
                    <Link to={createPageUrl(`SolutionEdit?id=${solution.id}`)}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {(hasPermission('solution_delete') || solution.created_by === user?.email) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => handleDeleteClick(solution, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {solution.website && (
                    <Button variant="ghost" size="icon" asChild>
                      <a href={solution.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog (lc-5) */}
      <SolutionDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        solution={solutionToDelete}
        onConfirm={confirmDelete}
        isDeleting={deleteSolution.isPending}
      />
    </PageLayout>
  );
}

// Wrap with ErrorBoundary (pc-6)
function SolutionsPageWithErrorBoundary(props) {
  return (
    <SolutionErrorBoundary>
      <SolutionsPage {...props} />
    </SolutionErrorBoundary>
  );
}

export default ProtectedPage(SolutionsPageWithErrorBoundary, { requiredPermissions: ['solution_view_all', 'solution_view', 'dashboard_view'] });
