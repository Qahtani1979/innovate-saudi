import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useMyPilots } from '@/hooks/useMyPilots';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '@/components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { TestTube, Plus, TrendingUp, Target, LayoutGrid, List, Eye } from 'lucide-react';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';
import { StandardPagination } from '@/components/ui/StandardPagination';
import { EntityListSkeleton } from '@/components/ui/skeletons/EntityListSkeleton';
import { EntityFilter } from '@/components/ui/EntityFilter';

function MyPilots() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  // GOLD STANDARD HOOK
  const {
    pilots,
    stats,
    isLoading,
    isEmpty,
    totalPages,
  } = useMyPilots(user?.email, page);

  // Client-side filtering for current page (standard for Search/Status until API support)
  const filteredPilots = pilots.filter(pilot => {
    const matchesSearch = pilot.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilot.title_ar?.includes(searchTerm) ||
      pilot.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || pilot.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const stageColors = {
    pre_pilot: 'bg-slate-100 text-slate-700',
    approved: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    scaled: 'bg-teal-100 text-teal-700'
  };

  const stageOptions = [
    { value: 'pre_pilot', label: t({ en: 'Pre-Pilot', ar: 'ما قبل التجربة' }) },
    { value: 'approved', label: t({ en: 'Approved', ar: 'معتمد' }) },
    { value: 'in_progress', label: t({ en: 'In Progress', ar: 'قيد التنفيذ' }) },
    { value: 'evaluation', label: t({ en: 'Evaluation', ar: 'التقييم' }) },
    { value: 'completed', label: t({ en: 'Completed', ar: 'مكتمل' }) },
    { value: 'scaled', label: t({ en: 'Scaled', ar: 'موسع' }) }
  ];

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Pilots', ar: 'تجاربي' }}
        subtitle={{ en: 'Track and manage your pilot projects', ar: 'تتبع وإدارة مشاريعك التجريبية' }}
        icon={<TestTube className="h-6 w-6 text-white" />}
        description=""
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white/50">
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
            <Link to={createPageUrl('PilotCreate')}>
              <Button variant="secondary">
                <Plus className="h-4 w-4 mr-2" />
                {t({ en: 'New Pilot', ar: 'تجربة جديدة' })}
              </Button>
            </Link>
          </div>
        }
      />

      {/* STATS CARDS (Powered by separate stats query) */}
      {isLoading ? (
        <EntityListSkeleton mode="grid" rowCount={4} columnCount={1} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <TestTube className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.in_progress}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{t({ en: 'Avg Success', ar: 'متوسط النجاح' })}</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.avg_success}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <EntityFilter
            searchQuery={searchTerm}
            onSearchChange={setSearchTerm}
            statusValue={stageFilter}
            onStatusChange={setStageFilter}
            statusOptions={stageOptions}
            placeholder={t({ en: 'Search pilots...', ar: 'بحث عن التجارب...' })}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <EntityListSkeleton mode={viewMode} rowCount={6} />
          ) : filteredPilots.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t({ en: 'No pilots found', ar: 'لم يتم العثور على تجارب' })}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPilots.map((pilot) => (
                <Card key={pilot.id} className="hover:shadow-lg transition-all overflow-hidden">
                  {pilot.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={pilot.image_url} alt={pilot.title_en} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {pilot.code}
                          </Badge>
                          <Badge className={stageColors[pilot.stage]}>
                            {pilot.stage?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </h3>
                        <p className="text-sm text-slate-600 capitalize">
                          {pilot.sector?.replace(/_/g, ' ')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">{t({ en: 'Success Probability', ar: 'احتمالية النجاح' })}</span>
                          <span className="font-semibold text-purple-600">{pilot.success_probability || 0}%</span>
                        </div>
                        <Progress value={pilot.success_probability || 0} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-500">{t({ en: 'Duration', ar: 'المدة' })}</p>
                          <p className="font-medium">{pilot.duration_weeks || 0}w</p>
                        </div>
                        <div>
                          <p className="text-slate-500">{t({ en: 'Budget', ar: 'الميزانية' })}</p>
                          <p className="font-medium">{pilot.budget ? `${(pilot.budget / 1000).toFixed(0)}K` : 'N/A'}</p>
                        </div>
                      </div>

                      <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                        <Button className="w-full" variant="outline">
                          {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Code', ar: 'الرمز' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Title', ar: 'العنوان' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Stage', ar: 'المرحلة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Success', ar: 'النجاح' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Duration', ar: 'المدة' })}</th>
                    <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPilots.map((pilot) => (
                    <tr key={pilot.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono text-xs">{pilot.code}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {pilot.image_url && (
                            <img src={pilot.image_url} alt={pilot.title_en} className="w-10 h-10 object-cover rounded" />
                          )}
                          <p className="font-medium">{language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={stageColors[pilot.stage]}>{pilot.stage?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={pilot.success_probability || 0} className="w-20 h-2" />
                          <span className="text-xs font-medium">{pilot.success_probability || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{pilot.duration_weeks || 0}w</td>
                      <td className="p-4 text-right">
                        <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
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
          )}

          {/* PAGINATION UI */}
          {!isLoading && !isEmpty && (
            <StandardPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MyPilots, { requiredPermissions: [] });
