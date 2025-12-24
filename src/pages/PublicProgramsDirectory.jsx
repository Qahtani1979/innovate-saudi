import { useState } from 'react';
import { usePublicPrograms, usePublicSectors } from '@/hooks/usePublicData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Calendar, Users, Clock, Award, Search, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PublicProgramsDirectory() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Public only sees published and open/active programs
  const { data: programs = [], isLoading } = usePublicPrograms();

  const { data: sectors = [] } = usePublicSectors();

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = !searchTerm ||
      program.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.name_ar?.includes(searchTerm) ||
      program.focus_areas?.some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || program.program_type === filterType;
    const matchesSector = filterSector === 'all' || program.sector_id === filterSector;
    const matchesStatus = filterStatus === 'all' || program.status === filterStatus;
    return matchesSearch && matchesType && matchesSector && matchesStatus;
  });

  const typeColors = {
    accelerator: 'bg-orange-100 text-orange-700',
    incubator: 'bg-pink-100 text-pink-700',
    hackathon: 'bg-indigo-100 text-indigo-700',
    challenge: 'bg-red-100 text-red-700',
    fellowship: 'bg-purple-100 text-purple-700',
    training: 'bg-teal-100 text-teal-700',
    matchmaker: 'bg-blue-100 text-blue-700',
    sandbox_wave: 'bg-purple-100 text-purple-700'
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
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-12 text-white">
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-4">
            {t({ en: 'Innovation Programs & Opportunities', ar: 'برامج وفرص الابتكار' })}
          </h1>
          <p className="text-xl text-white/90 mb-6">
            {t({ en: 'Join accelerators, hackathons, fellowships, and training programs', ar: 'انضم للمسرعات، الهاكاثونات، الزمالات، وبرامج التدريب' })}
          </p>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-white/40 text-base px-4 py-2">
              {programs.filter(p => p.status === 'applications_open').length} {t({ en: 'Open Now', ar: 'مفتوحة الآن' })}
            </Badge>
            <Badge className="bg-white/20 text-white border-white/40 text-base px-4 py-2">
              {programs.filter(p => p.funding_available).length} {t({ en: 'With Funding', ar: 'بتمويل' })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
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
                <SelectItem value="accelerator">Accelerator</SelectItem>
                <SelectItem value="incubator">Incubator</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="fellowship">Fellowship</SelectItem>
                <SelectItem value="training">Training</SelectItem>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All', ar: 'الكل' })}</SelectItem>
                <SelectItem value="applications_open">{t({ en: 'Open', ar: 'مفتوحة' })}</SelectItem>
                <SelectItem value="active">{t({ en: 'Active', ar: 'نشطة' })}</SelectItem>
                <SelectItem value="planning">{t({ en: 'Coming Soon', ar: 'قريباً' })}</SelectItem>
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
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programs Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((program) => {
            const daysUntilDeadline = program.timeline?.application_close
              ? Math.ceil((new Date(program.timeline.application_close) - new Date()) / (1000 * 60 * 60 * 24))
              : null;
            const spotsAvailable = program.target_participants?.max_participants
              ? (program.target_participants.max_participants - (program.accepted_count || 0))
              : null;

            return (
              <Card key={program.id} className="hover:shadow-xl transition-all overflow-hidden group">
                {program.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={program.image_url}
                      alt={program.name_en}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={typeColors[program.program_type]}>
                      {program.program_type?.replace(/_/g, ' ')}
                    </Badge>
                    {program.status === 'applications_open' && (
                      <Badge className="bg-green-600 text-white animate-pulse">
                        {t({ en: 'Open', ar: 'مفتوحة' })}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                  </CardTitle>
                  {(program.tagline_en || program.tagline_ar) && (
                    <p className="text-sm text-slate-600 mt-2">
                      {language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    {program.duration_weeks && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>{program.duration_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}</span>
                      </div>
                    )}
                    {program.timeline?.application_close && (
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {daysUntilDeadline > 0
                            ? `${daysUntilDeadline} ${t({ en: 'days left', ar: 'يوم متبقي' })}`
                            : t({ en: 'Closed', ar: 'مغلقة' })
                          }
                        </span>
                      </div>
                    )}
                    {spotsAvailable !== null && spotsAvailable > 0 && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="h-4 w-4" />
                        <span>{spotsAvailable} {t({ en: 'spots available', ar: 'مقعد متاح' })}</span>
                      </div>
                    )}
                    {program.funding_available && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <Award className="h-4 w-4" />
                        <span>{t({ en: 'Funding Available', ar: 'تمويل متاح' })}</span>
                      </div>
                    )}
                  </div>

                  {program.focus_areas && program.focus_areas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {program.focus_areas.slice(0, 3).map((area, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {t({ en: 'Learn More', ar: 'اعرف المزيد' })}
                      </Button>
                    </Link>
                    {program.status === 'applications_open' && (
                      <Link to={createPageUrl('ProgramApplicationWizard')} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                          {t({ en: 'Apply Now', ar: 'قدم الآن' })}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredPrograms.map((program) => {
                const daysUntilDeadline = program.timeline?.application_close
                  ? Math.ceil((new Date(program.timeline.application_close) - new Date()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div key={program.id} className="p-6 hover:bg-slate-50 transition-all">
                    <div className="flex items-start gap-4">
                      {program.image_url && (
                        <img src={program.image_url} alt={program.name_en} className="w-24 h-24 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={typeColors[program.program_type]}>
                                {program.program_type?.replace(/_/g, ' ')}
                              </Badge>
                              {program.status === 'applications_open' && (
                                <Badge className="bg-green-600 text-white">
                                  {t({ en: 'Open', ar: 'مفتوحة' })}
                                </Badge>
                              )}
                              {program.funding_available && (
                                <Badge className="bg-amber-600 text-white">
                                  {t({ en: 'Funded', ar: 'ممولة' })}
                                </Badge>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                              {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {language === 'ar' && program.description_ar ? program.description_ar : program.description_en}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm mt-3">
                          {program.duration_weeks && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="h-4 w-4" />
                              <span>{program.duration_weeks} {t({ en: 'weeks', ar: 'أسبوع' })}</span>
                            </div>
                          )}
                          {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                            <div className="flex items-center gap-1 text-red-600 font-medium">
                              <Calendar className="h-4 w-4" />
                              <span>{daysUntilDeadline} {t({ en: 'days left', ar: 'يوم متبقي' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                          <Button variant="outline" size="sm">
                            {t({ en: 'Details', ar: 'التفاصيل' })}
                          </Button>
                        </Link>
                        {program.status === 'applications_open' && (
                          <Link to={createPageUrl('ProgramApplicationWizard')}>
                            <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                              {t({ en: 'Apply', ar: 'تقدم' })}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {t({ en: 'No programs found matching your criteria', ar: 'لا توجد برامج تطابق معاييرك' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}