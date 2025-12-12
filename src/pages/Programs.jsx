import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Edit, Trash2, Archive, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Calendar,
  Users,
  Target,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Sparkles,
  Award,
  Clock,
  MapPin,
  LayoutGrid,
  List,
  CalendarDays,
  Eye
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

function ProgramsPage() {
  const { hasPermission, isAdmin } = usePermissions();
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const queryClient = useQueryClient();
  
  const { invokeAI, status: aiStatus, isLoading: aiLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list('-created_date')
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ['sectors'],
    queryFn: () => base44.entities.Sector.list()
  });

  const { data: regions = [] } = useQuery({
    queryKey: ['regions'],
    queryFn: () => base44.entities.Region.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Program.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['programs']);
      toast.success('Program deleted');
    }
  });

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !searchTerm || 
      program.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.name_ar?.includes(searchTerm);
    const matchesType = filterType === 'all' || program.program_type === filterType;
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    const matchesSector = filterSector === 'all' || program.sector_id === filterSector;
    const matchesRegion = filterRegion === 'all' || program.region_targets?.includes(filterRegion);
    return matchesSearch && matchesType && matchesStatus && matchesSector && matchesRegion;
  });

  const stats = {
    total: programs.length,
    active: programs.filter(p => p.status === 'in_progress' || p.status === 'open').length,
    completed: programs.filter(p => p.status === 'completed').length,
    participants: programs.reduce((sum, p) => sum + (p.participants_count || 0), 0)
  };

  const statusColors = {
    planning: 'bg-slate-100 text-slate-700',
    open: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-purple-100 text-purple-700',
    evaluation: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700'
  };

  const typeColors = {
    matchmakers: 'bg-pink-100 text-pink-700',
    accelerator: 'bg-orange-100 text-orange-700',
    hackathon: 'bg-indigo-100 text-indigo-700',
    training: 'bg-teal-100 text-teal-700',
    sandbox_wave: 'bg-purple-100 text-purple-700',
    innovation_lab: 'bg-blue-100 text-blue-700',
    other: 'bg-slate-100 text-slate-700'
  };

  const handleAIInsights = async () => {
    setShowAIInsights(true);
    try {
      const programSummary = programs.slice(0, 15).map(p => ({
        name: p.name_en,
        type: p.program_type,
        status: p.status,
        participants: p.application_count || 0,
        outcomes: p.outcomes
      }));

      const result = await invokeAI({
        prompt: `Analyze these innovation programs for Saudi municipalities and provide strategic insights in BOTH English AND Arabic:

Programs: ${JSON.stringify(programSummary)}

Statistics:
- Total: ${stats.total}
- Active: ${stats.active}
- Completed: ${stats.completed}
- Total Participants: ${stats.participants}

Provide bilingual insights (each item should have both English and Arabic versions):
1. Program effectiveness patterns across different types
2. Participant engagement optimization strategies
3. Outcome improvement recommendations
4. Recommendations for new program types or focus areas
5. Partnership and collaboration opportunities`,
        response_json_schema: {
          type: 'object',
          properties: {
            effectiveness_patterns: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            engagement_optimization: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            outcome_improvements: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            new_program_recommendations: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } },
            partnership_opportunities: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' } } } }
          }
        }
      });
      if (result.success && result.data) {
        setAiInsights(result.data);
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate AI insights', ar: 'فشل توليد الرؤى الذكية' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Programs & Events', ar: 'البرامج والفعاليات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Innovation programs, matchmakers, and capacity building', ar: 'برامج الابتكار والتدريب وبناء القدرات' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" onClick={handleAIInsights}>
            <Sparkles className="h-4 w-4" />
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
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>
          {hasPermission('program_create') && (
            <Link to={createPageUrl('ProgramCreate')}>
              <Button className="bg-gradient-to-r from-blue-600 to-teal-600 gap-2">
                <Plus className="h-5 w-5" />
                {t({ en: 'New Program', ar: 'برنامج جديد' })}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* AI Insights Modal */}
      {showAIInsights && (
        <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-pink-700">
              <Sparkles className="h-5 w-5" />
              {t({ en: 'AI Strategic Insights', ar: 'الرؤى الاستراتيجية الذكية' })}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing programs...', ar: 'جاري تحليل البرامج...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiInsights.effectiveness_patterns?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Effectiveness Patterns', ar: 'أنماط الفعالية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.effectiveness_patterns.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.engagement_optimization?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Engagement Optimization', ar: 'تحسين المشاركة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.engagement_optimization.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.outcome_improvements?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Outcome Improvements', ar: 'تحسين النتائج' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.outcome_improvements.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.new_program_recommendations?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'New Program Ideas', ar: 'أفكار البرامج الجديدة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.new_program_recommendations.map((item, i) => (
                        <li key={i} className="text-slate-700" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                          • {typeof item === 'object' ? (language === 'ar' ? item.ar : item.en) : item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-teal-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-teal-700 mb-2">{t({ en: 'Partnership Opportunities', ar: 'فرص الشراكة' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((item, i) => (
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
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Programs</p>
                <p className="text-sm text-slate-600" dir="rtl">إجمالي البرامج</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Programs</p>
                <p className="text-sm text-slate-600" dir="rtl">البرامج النشطة</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.active}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-sm text-slate-600" dir="rtl">المكتملة</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Participants</p>
                <p className="text-sm text-slate-600" dir="rtl">إجمالي المشاركين</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.participants}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Sparkles className="h-5 w-5" />
                {t({ en: 'AI Ecosystem Insights', ar: 'رؤى النظام الذكية' })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowAIInsights(false)}>
                <Plus className="h-4 w-4 rotate-45" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>{t({ en: 'Analyzing...', ar: 'يحلل...' })}</span>
              </div>
            ) : aiInsights ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiInsights.coverage_gaps?.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">{t({ en: 'Coverage Gaps', ar: 'فجوات التغطية' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.coverage_gaps.map((gap, i) => (
                        <li key={i} className="text-slate-700">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.timing_tips?.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">{t({ en: 'Timing Tips', ar: 'نصائح التوقيت' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.timing_tips.map((tip, i) => (
                        <li key={i} className="text-slate-700">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.partnership_opportunities?.length > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-700 mb-2">{t({ en: 'Partnerships', ar: 'الشراكات' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.partnership_opportunities.map((opp, i) => (
                        <li key={i} className="text-slate-700">• {opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.impact_strategies?.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">{t({ en: 'Impact Strategies', ar: 'استراتيجيات الأثر' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.impact_strategies.map((str, i) => (
                        <li key={i} className="text-slate-700">• {str}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {aiInsights.synergies?.length > 0 && (
                  <div className="p-4 bg-amber-50 rounded-lg md:col-span-2">
                    <h4 className="font-semibold text-amber-700 mb-2">{t({ en: 'Cross-Program Synergies', ar: 'التآزر بين البرامج' })}</h4>
                    <ul className="text-sm space-y-1">
                      {aiInsights.synergies.map((syn, i) => (
                        <li key={i} className="text-slate-700">• {syn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search programs...', ar: 'ابحث عن البرامج...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Program Type', ar: 'نوع البرنامج' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Types', ar: 'جميع الأنواع' })}</SelectItem>
                <SelectItem value="matchmakers">Matchmakers</SelectItem>
                <SelectItem value="accelerator">Accelerator</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="sandbox_wave">Sandbox Wave</SelectItem>
                <SelectItem value="innovation_lab">Innovation Lab</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="evaluation">Evaluation</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Sector', ar: 'القطاع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</SelectItem>
                {sectors.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {language === 'ar' && s.name_ar ? s.name_ar : s.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Region', ar: 'المنطقة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Regions', ar: 'جميع المناطق' })}</SelectItem>
                {regions.map(r => (
                  <SelectItem key={r.id} value={r.id}>
                    {language === 'ar' && r.name_ar ? r.name_ar : r.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Programs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              {program.image_url && (
                <div className="h-48 overflow-hidden">
                  <img src={program.image_url} alt={program.name_en} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={typeColors[program.type]}>
                    {program.type?.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={statusColors[program.status]}>
                    {program.status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardTitle className="text-xl">
                  {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-3">
                  {language === 'ar' && program.description_ar ? program.description_ar : program.description_en}
                </p>

                <div className="space-y-2 text-sm">
                  {program.start_date && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(program.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  )}
                  {program.participants_count > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="h-4 w-4" />
                      <span>{program.participants_count} {t({ en: 'participants', ar: 'مشارك' })}</span>
                    </div>
                  )}
                  {program.challenges_addressed > 0 && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Target className="h-4 w-4" />
                      <span>{program.challenges_addressed} {t({ en: 'challenges', ar: 'تحدي' })}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                  {hasPermission('program_edit') && (
                    <Link to={createPageUrl(`ProgramEdit?id=${program.id}`)}>
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
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Program', ar: 'البرنامج' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Type', ar: 'النوع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Start Date', ar: 'تاريخ البدء' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Participants', ar: 'المشاركون' })}</th>
                    <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((program) => (
                    <tr key={program.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {program.image_url && (
                            <img src={program.image_url} alt={program.name_en} className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <p className="font-medium">{program.name_en}</p>
                            <p className="text-xs text-slate-500">{program.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={typeColors[program.type]}>{program.type?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[program.status]}>{program.status?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {program.start_date ? new Date(program.start_date).toLocaleDateString() : 'TBD'}
                      </td>
                      <td className="p-4 text-sm">{program.participants_count || 0}</td>
                      <td className="p-4 text-right">
                        <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
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
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {Array.from({ length: 12 }, (_, i) => {
                const month = new Date(2025, i, 1);
                const monthPrograms = filteredPrograms.filter(p => 
                  p.start_date && new Date(p.start_date).getMonth() === i
                );
                return monthPrograms.length > 0 ? (
                  <div key={i}>
                    <h3 className="font-semibold text-lg mb-3">{month.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {monthPrograms.map(program => (
                        <Link key={program.id} to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                          <Card className="hover:shadow-md transition-all">
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{program.name_en}</p>
                                  <p className="text-xs text-slate-500">{new Date(program.start_date).toLocaleDateString()}</p>
                                  <Badge className="mt-1 text-xs" variant="outline">{program.type?.replace(/_/g, ' ')}</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{t({ en: 'No programs found', ar: 'لا توجد برامج' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(ProgramsPage, { requiredPermissions: ['program_view_all', 'program_view', 'program_participate', 'dashboard_view'] });