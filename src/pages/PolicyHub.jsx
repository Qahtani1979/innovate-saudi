import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Shield,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  Network,
  Target,
  Building2,
  Loader2,
  LayoutGrid,
  List,
  CheckSquare,
  Calendar,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import PolicyTimelineView from '../components/policy/PolicyTimelineView';
import PolicyReportTemplates from '../components/policy/PolicyReportTemplates';
import PolicySemanticSearch from '../components/policy/PolicySemanticSearch';
import PolicyTemplateLibrary from '../components/policy/PolicyTemplateLibrary';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';
import { usePoliciesWithVisibility } from '@/hooks/usePoliciesWithVisibility';
import { usePolicyMatching } from '@/hooks/usePolicyMatching';
import { usePolicyMutations, usePolicyInvalidator } from '@/hooks/usePolicyMutations';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';

function PolicyHub() {
  const { language, isRTL, t } = useLanguage();
  const { invalidatePolicies } = usePolicyInvalidator();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    entity_type: 'all',
    regulatory_change: 'all'
  });
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedPolicies, setSelectedPolicies] = useState([]);
  const [showReports, setShowReports] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const { runPolicyMatching, isMatching: isMatchingPolicies } = usePolicyMatching();

  // Centralized Mutations
  const { updatePolicy, bulkUpdatePolicies, bulkDeletePolicies } = usePolicyMutations();

  // Fetch all policies with visibility
  const { data: policies = [], isLoading } = usePoliciesWithVisibility({
    status: filters.status,
    entityType: filters.entity_type,
    priority: filters.priority
  });

  // Fetch related entities with visibility
  const { data: challenges = [] } = useChallengesWithVisibility();
  const { data: pilots = [] } = usePilotsWithVisibility();
  const { data: rdProjects = [] } = useRDProjectsWithVisibility();
  const { data: programs = [] } = useProgramsWithVisibility();



  // Filter policies
  const filteredPolicies = policies.filter(p => {
    const status = p.status;
    if (filters.status !== 'all' && status !== filters.status) return false;
    if (filters.priority !== 'all' && p.priority !== filters.priority) return false;
    if (filters.entity_type !== 'all' && p.source_entity_type !== filters.entity_type) return false;
    if (filters.regulatory_change !== 'all') {
      if (filters.regulatory_change === 'yes' && !p.regulatory_change_needed) return false;
      if (filters.regulatory_change === 'no' && p.regulatory_change_needed) return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.title_ar?.toLowerCase().includes(query) ||
        p.title_en?.toLowerCase().includes(query) ||
        p.description_ar?.toLowerCase().includes(query) ||
        p.description_en?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleBulkUpdate = (field, value) => {
    bulkUpdatePolicies.mutate({
      ids: selectedPolicies,
      data: { [field]: value },
      metadata: { field, value }
    }, {
      onSuccess: () => {
        setSelectedPolicies([]);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedPolicies.length === filteredPolicies.length) {
      setSelectedPolicies([]);
    } else {
      setSelectedPolicies(filteredPolicies.map(p => p.id));
    }
  };

  // Stats
  const stats = {
    total: policies.length,
    draft: policies.filter(p => p.status === 'draft').length,
    under_review: policies.filter(p => p.status === 'under_review' || p.status === 'legal_review').length,
    approved: policies.filter(p => p.status === 'approved' || p.status === 'published').length,
    implemented: policies.filter(p => p.status === 'implemented' || p.status === 'active').length,
    regulatory_changes: policies.filter(p => p.regulatory_change_needed).length
  };

  const getEntityName = (policy) => {
    if (policy.source_entity_type === 'challenge') {
      const c = challenges.find(ch => ch.id === policy.source_entity_id);
      return c?.code || c?.title_ar || c?.title_en || 'Challenge';
    }
    if (policy.source_entity_type === 'pilot') {
      const p = pilots.find(p => p.id === policy.source_entity_id);
      return p?.code || p?.title_ar || p?.title_en || 'Pilot';
    }
    if (policy.source_entity_type === 'rd_project') {
      const r = rdProjects.find(r => r.id === policy.source_entity_id);
      return r?.code || r?.title_ar || r?.title_en || 'R&D';
    }
    if (policy.source_entity_type === 'program') {
      const pr = programs.find(pr => pr.id === policy.source_entity_id);
      return pr?.code || pr?.name_ar || pr?.name_en || 'Program';
    }
    return 'Platform-wide';
  };

  return (
    <PageLayout>
      <PageHeader
        icon={Shield}
        title={{ en: 'Policy Hub', ar: 'مركز السياسات' }}
        subtitle={{ en: 'Overview', ar: 'نظرة عامة' }}
        description={{ en: 'Manage policy recommendations across the platform', ar: 'إدارة التوصيات السياسية عبر المنصة' }}
        stats={[
          { icon: Shield, value: stats.total, label: { en: 'Total', ar: 'الإجمالي' } },
          { icon: Clock, value: stats.under_review, label: { en: 'Review', ar: 'مراجعة' } },
          { icon: CheckCircle2, value: stats.approved, label: { en: 'Approved', ar: 'موافق' } }
        ]}
        action={null}
        actions={
          <div className="flex gap-2">
            <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                onClick={() => setViewMode('timeline')}
                className="h-8 w-8 p-0"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowReports(!showReports)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowSemanticSearch(!showSemanticSearch)}
              variant="outline"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {t({ en: 'Semantic Search', ar: 'بحث دلالي' })}
            </Button>
            <Button
              onClick={() => setShowTemplates(!showTemplates)}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {t({ en: 'Templates', ar: 'القوالب' })}
            </Button>
            <Link to={createPageUrl('PolicyCreate')}>
              <PersonaButton className="gap-2">
                <Plus className="h-4 w-4" />
                {t({ en: 'New Policy', ar: 'سياسة جديدة' })}
              </PersonaButton>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-slate-600">{stats.draft}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Draft', ar: 'مسودة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-yellow-600">{stats.under_review}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Review', ar: 'مراجعة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Approved', ar: 'موافق' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 text-teal-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-teal-600">{stats.implemented}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Implemented', ar: 'منفذ' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-600">{stats.regulatory_changes}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Reg. Changes', ar: 'تغييرات تنظيمية' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t({ en: 'Search policies...', ar: 'بحث السياسات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Filter className="h-4 w-4 text-slate-500" />

            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'كل الحالات' })}</SelectItem>
                <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                <SelectItem value="legal_review">{t({ en: 'Legal Review', ar: 'مراجعة قانونية' })}</SelectItem>
                <SelectItem value="public_consultation">{t({ en: 'Public Consultation', ar: 'استشارة عامة' })}</SelectItem>
                <SelectItem value="council_approval">{t({ en: 'Council Approval', ar: 'موافقة المجلس' })}</SelectItem>
                <SelectItem value="ministry_approval">{t({ en: 'Ministry Approval', ar: 'موافقة الوزارة' })}</SelectItem>
                <SelectItem value="published">{t({ en: 'Published', ar: 'منشور' })}</SelectItem>
                <SelectItem value="active">{t({ en: 'Active', ar: 'فعال' })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priority} onValueChange={(v) => setFilters({ ...filters, priority: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Priority', ar: 'كل الأولويات' })}</SelectItem>
                <SelectItem value="low">{t({ en: 'Low', ar: 'منخفض' })}</SelectItem>
                <SelectItem value="medium">{t({ en: 'Medium', ar: 'متوسط' })}</SelectItem>
                <SelectItem value="high">{t({ en: 'High', ar: 'عالي' })}</SelectItem>
                <SelectItem value="critical">{t({ en: 'Critical', ar: 'حرج' })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.entity_type} onValueChange={(v) => setFilters({ ...filters, entity_type: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Entities', ar: 'كل الكيانات' })}</SelectItem>
                <SelectItem value="challenge">{t({ en: 'Challenge', ar: 'تحدي' })}</SelectItem>
                <SelectItem value="pilot">{t({ en: 'Pilot', ar: 'تجربة' })}</SelectItem>
                <SelectItem value="rd_project">{t({ en: 'R&D', ar: 'بحث' })}</SelectItem>
                <SelectItem value="program">{t({ en: 'Program', ar: 'برنامج' })}</SelectItem>
                <SelectItem value="platform">{t({ en: 'Platform-wide', ar: 'عام' })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.regulatory_change} onValueChange={(v) => setFilters({ ...filters, regulatory_change: v })}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'Regulatory Change', ar: 'تغيير تنظيمي' })}</SelectItem>
                <SelectItem value="yes">{t({ en: 'Required', ar: 'مطلوب' })}</SelectItem>
                <SelectItem value="no">{t({ en: 'Not Required', ar: 'غير مطلوب' })}</SelectItem>
              </SelectContent>
            </Select>

            <Badge variant="outline">
              {filteredPolicies.length} {t({ en: 'results', ar: 'نتيجة' })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Semantic Search */}
      {showSemanticSearch && (
        <PolicySemanticSearch onResultsFound={(results) => {
          // Handle results - maybe filter the list or show a modal
          console.log('Semantic search results:', results);
          toast.info(t({ en: 'Search results found', ar: 'تم العثور على نتائج' }));
        }} />
      )}

      {/* Templates */}
      {showTemplates && (
        <PolicyTemplateLibrary onTemplateSelect={(template) => {
          // Navigate to create page with template
          const params = new URLSearchParams();
          params.set('template_id', template.id);
          // navigate(createPageUrl('PolicyCreate') + '?' + params.toString());
          window.location.href = createPageUrl('PolicyCreate') + '?' + params.toString();
        }} />
      )}

      {/* Reports Section */}
      {showReports && (
        <PolicyReportTemplates />
      )}

      {/* Bulk Actions */}
      {selectedPolicies.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {selectedPolicies.length} {t({ en: 'selected', ar: 'محدد' })}
                </span>
              </div>
              <div className="flex gap-2">
                <Select onValueChange={(v) => handleBulkUpdate('status', v)}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder={t({ en: 'Change Stage', ar: 'تغيير المرحلة' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="legal_review">Legal Review</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    if (confirm(t({ en: 'Delete selected policies?', ar: 'حذف السياسات المحددة؟' }))) {
                      bulkDeletePolicies.mutate(selectedPolicies, {
                        onSuccess: () => setSelectedPolicies([])
                      });
                    }
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t({ en: 'Delete', ar: 'حذف' })}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedPolicies([])}>
                  {t({ en: 'Clear', ar: 'مسح' })}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      {viewMode === 'timeline' ? (
        <PolicyTimelineView policies={filteredPolicies} />
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['draft', 'legal_review', 'council_approval', 'published'].map(stage => (
            <div key={stage} className="space-y-3">
              <div className="p-3 bg-slate-100 rounded-lg">
                <p className="text-sm font-semibold text-slate-900">
                  {stage.replace(/_/g, ' ').toUpperCase()}
                </p>
                <Badge variant="outline" className="mt-1">
                  {filteredPolicies.filter(p => p.status === stage).length}
                </Badge>
              </div>
              <div className="space-y-2">
                {filteredPolicies
                  .filter(p => p.status === stage)
                  .map(policy => (
                    <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-3 pb-3">
                          <p className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">
                            {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                          </p>
                          <div className="flex gap-1 flex-wrap">
                            {policy.priority && (
                              <Badge className="text-xs">{policy.priority}</Badge>
                            )}
                            {policy.regulatory_change_needed && (
                              <Badge className="text-xs bg-orange-100 text-orange-700">Reg</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Policy List */}
      {viewMode === 'list' && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={selectedPolicies.length === filteredPolicies.length && filteredPolicies.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm text-slate-600">
              {t({ en: 'Select all', ar: 'تحديد الكل' })}
            </span>
          </div>
        </>
      )}

      {viewMode === 'list' && isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {t({ en: 'No policies found', ar: 'لم يتم العثور على سياسات' })}
            </p>
            <Link to={createPageUrl('PolicyCreate')}>
              <Button className="bg-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'Create First Policy', ar: 'إنشاء أول سياسة' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {filteredPolicies.map((policy) => {
            const statusColors = {
              draft: 'bg-slate-100 text-slate-700',
              under_review: 'bg-yellow-100 text-yellow-700',
              approved: 'bg-blue-100 text-blue-700',
              implemented: 'bg-green-100 text-green-700',
              rejected: 'bg-red-100 text-red-700'
            };

            const priorityColors = {
              low: 'bg-blue-100 text-blue-700',
              medium: 'bg-yellow-100 text-yellow-700',
              high: 'bg-orange-100 text-orange-700',
              critical: 'bg-red-100 text-red-700'
            };

            return (
              <Card key={policy.id} className="hover:shadow-lg transition-all border-2 hover:border-blue-300">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPolicies.includes(policy.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (e.target.checked) {
                          setSelectedPolicies([...selectedPolicies, policy.id]);
                        } else {
                          setSelectedPolicies(selectedPolicies.filter(id => id !== policy.id));
                        }
                      }}
                      className="h-4 w-4 rounded mt-1"
                    />
                    <Link to={createPageUrl(`PolicyDetail?id=${policy.id}`)} className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {policy.code && (
                              <Badge variant="outline" className="font-mono text-xs">{policy.code}</Badge>
                            )}
                            <Badge className={statusColors[policy.status]}>
                              {policy.status?.replace(/_/g, ' ')}
                            </Badge>
                            {policy.priority && (
                              <Badge className={priorityColors[policy.priority]}>
                                {policy.priority}
                              </Badge>
                            )}
                            {policy.regulatory_change_needed && (
                              <Badge className="bg-orange-100 text-orange-700">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reg. Change
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">
                            {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                          </h3>
                          <p className="text-sm text-slate-700 line-clamp-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {language === 'ar' && policy.description_ar
                              ? policy.description_ar
                              : policy.description_en}
                          </p>
                        </div>
                        {policy.impact_score && (
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-purple-600">{policy.impact_score}</div>
                            <div className="text-xs text-slate-500">{t({ en: 'Impact', ar: 'تأثير' })}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Network className="h-3 w-3" />
                          <span>{getEntityName(policy)}</span>
                        </div>
                        {policy.timeline_months && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{policy.timeline_months} months</span>
                          </div>
                        )}
                        {policy.submitted_by && (
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span>{policy.submitted_by}</span>
                          </div>
                        )}
                      </div>

                      {policy.regulatory_framework && (
                        <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs text-amber-900">
                            <span className="font-semibold">{t({ en: 'Framework:', ar: 'الإطار:' })}</span> {policy.regulatory_framework}
                          </p>
                        </div>
                      )}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageLayout>
  );
}

export default ProtectedPage(PolicyHub, { requiredPermissions: ['policy_view'] });
