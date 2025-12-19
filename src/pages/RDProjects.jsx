import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Edit, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Microscope,
  Beaker,
  TrendingUp,
  Plus,
  Search,
  Target,
  University,
  FileText,
  Sparkles,
  Award,
  LayoutGrid,
  List,
  Eye,
  FlaskConical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePermissions } from '../components/permissions/usePermissions';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useRDProjectsWithVisibility } from '@/hooks/useRDProjectsWithVisibility';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function RDProjectsPage() {
  const { hasPermission, isAdmin, isDeputyship, isMunicipality, isStaffUser } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const { invokeAI, status, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();
  const queryClient = useQueryClient();

  // Use visibility-aware hook for R&D projects
  const { data: projects = [], isLoading, error: projectsError } = useRDProjectsWithVisibility({
    status: filterStatus !== 'all' ? filterStatus : undefined,
    limit: 100,
    staleTime: 5 * 60 * 1000
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.RDProject.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['rd-projects']);
    }
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.title_ar?.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    piloted: projects.filter(p => p.status === 'piloted' || p.readiness_for_pilot === 'piloted').length
  };

  const statusColors = {
    proposal: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    piloted: 'bg-teal-100 text-teal-700'
  };

  const readinessColors = {
    not_ready: 'bg-red-100 text-red-700',
    needs_validation: 'bg-yellow-100 text-yellow-700',
    ready: 'bg-green-100 text-green-700',
    piloted: 'bg-teal-100 text-teal-700'
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    const projectSummary = projects.slice(0, 10).map(p => ({
      title: p.title_en,
      status: p.status,
      institution: p.institution_en || p.institution,
      research_area: p.research_area_en || p.research_area,
      trl_current: p.trl_current || p.trl_start,
      trl_target: p.trl_target
    }));

    const result = await invokeAI({
      prompt: `Analyze these R&D projects for Saudi municipal innovation and provide strategic insights in BOTH English AND Arabic:

Projects: ${JSON.stringify(projectSummary)}

Statistics:
- Total: ${stats.total}
- Active: ${stats.active}
- Completed: ${stats.completed}
- Piloted: ${stats.piloted}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Key patterns and trends across R&D projects
2. Research gaps that need attention
3. Recommendations for accelerating TRL progression
4. Potential collaboration opportunities between projects
5. Priority areas for new R&D initiatives aligned with Vision 2030

Return each insight with both _en and _ar versions.`,
      response_json_schema: {
        type: 'object',
        properties: {
          patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          gaps: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          trl_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          collaboration_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
          priority_areas: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
        }
      }
    });
    if (result.success) {
      setAiInsights(result.data);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (projectsError) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-destructive">{t({ en: 'Error loading R&D projects', ar: 'خطأ في تحميل المشاريع' })}</p>
        </div>
      </PageLayout>
    );
  }

  const headerActions = (
    <div className="flex items-center gap-3">
      <Button variant="outline" className="gap-2" onClick={handleAIInsights} disabled={aiLoading || !isAvailable}>
        {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {t({ en: 'AI Insights', ar: 'رؤى ذكية' })}
      </Button>
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
      {hasPermission('rd_project_create') && (
        <Link to={createPageUrl('RDProjectCreate')}>
          <Button className="bg-gradient-to-r from-blue-600 to-teal-600 gap-2">
            <Plus className="h-5 w-5" />
            {t({ en: 'New Project', ar: 'مشروع جديد' })}
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <PageLayout>
      <PageHeader
        icon={FlaskConical}
        title={{ en: 'R&D Projects', ar: 'مشاريع البحث والتطوير' }}
        description={{ en: 'Research and development initiatives', ar: 'مبادرات البحث والتطوير والابتكار' }}
        actions={headerActions}
      />

      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} className="mb-4" />
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className="ml-3 text-slate-600">{t({ en: 'Analyzing R&D portfolio...', ar: 'جاري تحليل محفظة البحث والتطوير...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.patterns?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Key Patterns', ar: 'الأنماط الرئيسية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.patterns.map((p, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof p === 'object' ? (language === 'ar' ? p.ar : p.en) : p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Research Gaps', ar: 'الفجوات البحثية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.gaps.map((g, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof g === 'object' ? (language === 'ar' ? g.ar : g.en) : g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.trl_recommendations?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'TRL Acceleration', ar: 'تسريع المستوى التقني' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.trl_recommendations.map((r, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof r === 'object' ? (language === 'ar' ? r.ar : r.en) : r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.collaboration_opportunities?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Collaboration Opportunities', ar: 'فرص التعاون' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.collaboration_opportunities.map((c, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof c === 'object' ? (language === 'ar' ? c.ar : c.en) : c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.priority_areas?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Priority Areas for New R&D', ar: 'المجالات ذات الأولوية للبحث الجديد' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.priority_areas.map((a, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof a === 'object' ? (language === 'ar' ? a.ar : a.en) : a}
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
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Projects', ar: 'إجمالي المشاريع' })}</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
              </div>
              <Microscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Active', ar: 'النشطة' })}</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.active}</p>
              </div>
              <Beaker className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'المكتملة' })}</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Piloted', ar: 'تم تجربتها' })}</p>
                <p className="text-3xl font-bold text-teal-600 mt-1">{stats.piloted}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search R&D projects...', ar: 'ابحث عن المشاريع...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="proposal">{t({ en: 'Proposal', ar: 'مقترح' })}</SelectItem>
                <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
                <SelectItem value="in_progress">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</SelectItem>
                <SelectItem value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</SelectItem>
                <SelectItem value="piloted">{t({ en: 'Piloted', ar: 'تمت تجربته' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {project.image_url && (
                <div className="h-48 overflow-hidden">
                  <img src={project.image_url} alt={project.title_en} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={statusColors[project.status]}>
                    {project.status?.replace(/_/g, ' ')}
                  </Badge>
                  {project.readiness_for_pilot && (
                    <Badge className={readinessColors[project.readiness_for_pilot]}>
                      {project.readiness_for_pilot?.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">
                  {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(project.abstract_en || project.abstract_ar || project.tagline_en || project.description_en) && (
                  <p className="text-sm text-slate-600 line-clamp-3" dir={language === 'ar' && project.abstract_ar ? 'rtl' : 'ltr'}>
                    {language === 'ar' && project.abstract_ar 
                      ? project.abstract_ar 
                      : (project.abstract_en || project.tagline_en || project.description_en)}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {(project.institution_en || project.institution_ar || project.institution || project.lead_institution) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <University className="h-4 w-4" />
                      <span className="truncate">
                        {language === 'ar' && project.institution_ar 
                          ? project.institution_ar 
                          : (project.institution_en || project.institution || project.lead_institution)}
                      </span>
                    </div>
                  )}
                  {(project.trl_current || project.trl_start) && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Target className="h-4 w-4" />
                      <span>TRL {project.trl_current || project.trl_start}</span>
                      {project.trl_target && <span>→ {project.trl_target}</span>}
                    </div>
                  )}
                  {(project.research_area_en || project.research_area_ar || project.research_area || project.research_themes?.length > 0 || project.sectors?.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {(project.research_area_en || project.research_area) && (
                        <Badge variant="outline" className="text-xs">
                          {language === 'ar' && project.research_area_ar 
                            ? project.research_area_ar 
                            : (project.research_area_en || project.research_area)}
                        </Badge>
                      )}
                      {project.research_themes?.slice(0, 2).map((theme, i) => (
                        <Badge key={i} variant="outline" className="text-xs capitalize">
                          {theme}
                        </Badge>
                      ))}
                      {!project.research_area_en && !project.research_area && project.sectors?.slice(0, 2).map((sector, i) => (
                        <Badge key={i} variant="outline" className="text-xs capitalize">
                          {sector.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link to={createPageUrl(`RDProjectDetail?id=${project.id}`)} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                  {hasPermission('rd_project_edit') && (
                    <Link to={createPageUrl(`RDProjectEdit?id=${project.id}`)}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Project', ar: 'المشروع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Institution', ar: 'المؤسسة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Area', ar: 'المجال' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'TRL', ar: 'المستوى' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {project.image_url && (
                            <img src={project.image_url} alt={project.title_en} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{project.title_en}</p>
                            <p className="text-xs text-slate-500">{project.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{project.institution_en || project.institution || project.lead_institution || '-'}</td>
                      <td className="p-4 text-sm">{project.research_area_en || project.research_area || project.sectors?.[0]?.replace(/_/g, ' ') || '-'}</td>
                      <td className="p-4 text-sm">{project.trl_current || project.trl_start || 'N/A'}</td>
                      <td className="p-4">
                        <Badge className={statusColors[project.status]}>{project.status?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Microscope className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No R&D projects found', ar: 'لا توجد مشاريع' })}</p>
          </CardContent>
        </Card>
      )}
      </div>
    </PageLayout>
  );
}

export default ProtectedPage(RDProjectsPage, { requiredPermissions: ['rd_project_view_all'] });