import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, TestTube, Microscope, Calendar, Filter, Download, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function InitiativePortfolio() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSector, setFilterSector] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTheme, setFilterTheme] = useState('all');

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list()
  });

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs'],
    queryFn: () => base44.entities.Program.list()
  });

  const { data: strategicPlans = [] } = useQuery({
    queryKey: ['strategic-plans'],
    queryFn: () => base44.entities.StrategicPlan.list()
  });

  const activePlan = strategicPlans.find(p => p.status === 'active') || strategicPlans[0];

  // Unified initiative view
  const allInitiatives = [
    ...challenges.map(c => ({
      id: c.id,
      type: 'challenge',
      title: c.title_en || c.title_ar,
      sector: c.sector,
      status: c.status,
      strategic_theme: c.strategic_goal,
      year: new Date(c.created_date).getFullYear(),
      entity: c,
      page: 'ChallengeDetail'
    })),
    ...pilots.map(p => ({
      id: p.id,
      type: 'pilot',
      title: p.title_en || p.title_ar,
      sector: p.sector,
      status: p.stage,
      strategic_theme: p.tags?.find(t => activePlan?.strategic_themes?.some(st => st.name_en?.toLowerCase().includes(t.toLowerCase()))),
      year: new Date(p.created_date).getFullYear(),
      entity: p,
      page: 'PilotDetail'
    })),
    ...rdProjects.map(r => ({
      id: r.id,
      type: 'rd_project',
      title: r.title_en || r.title_ar,
      sector: r.research_area_en,
      status: r.status,
      strategic_theme: r.tags?.find(t => activePlan?.strategic_themes?.some(st => st.name_en?.toLowerCase().includes(t.toLowerCase()))),
      year: new Date(r.created_date).getFullYear(),
      entity: r,
      page: 'RDProjectDetail'
    })),
    ...programs.map(p => ({
      id: p.id,
      type: 'program',
      title: p.name_en || p.name_ar,
      sector: p.focus_areas?.join(', '),
      status: p.status,
      strategic_theme: p.tags?.find(t => activePlan?.strategic_themes?.some(st => st.name_en?.toLowerCase().includes(t.toLowerCase()))),
      year: new Date(p.created_date).getFullYear(),
      entity: p,
      page: 'ProgramDetail'
    }))
  ];

  // Filter initiatives
  const filteredInitiatives = allInitiatives.filter(initiative => {
    const matchesSearch = !searchQuery || initiative.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = filterSector === 'all' || initiative.sector?.includes(filterSector);
    const matchesYear = filterYear === 'all' || initiative.year === parseInt(filterYear);
    const matchesStatus = filterStatus === 'all' || initiative.status === filterStatus;
    const matchesTheme = filterTheme === 'all' || initiative.strategic_theme?.toLowerCase().includes(filterTheme.toLowerCase());

    return matchesSearch && matchesSector && matchesYear && matchesStatus && matchesTheme;
  });

  // Group by strategic theme
  const themes = activePlan?.strategic_themes || [];
  const groupedByTheme = themes.map(theme => ({
    theme: theme.name_en,
    initiatives: filteredInitiatives.filter(i => 
      i.strategic_theme?.toLowerCase().includes(theme.name_en?.toLowerCase())
    )
  }));

  const unassigned = filteredInitiatives.filter(i => !i.strategic_theme);

  const typeIcons = {
    challenge: AlertCircle,
    pilot: TestTube,
    rd_project: Microscope,
    program: Calendar
  };

  const typeColors = {
    challenge: 'bg-blue-100 text-blue-700',
    pilot: 'bg-purple-100 text-purple-700',
    rd_project: 'bg-green-100 text-green-700',
    program: 'bg-amber-100 text-amber-700'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Initiative Portfolio Master View', ar: 'عرض المحفظة الرئيسية للمبادرات' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: `${allInitiatives.length} initiatives across all types`, ar: `${allInitiatives.length} مبادرة عبر جميع الأنواع` })}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Export Portfolio', ar: 'تصدير المحفظة' })}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search initiatives...', ar: 'ابحث عن المبادرات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Sectors', ar: 'جميع القطاعات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="urban_design">Urban Design</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Years', ar: 'جميع السنوات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Years', ar: 'جميع السنوات' })}</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Status', ar: 'جميع الحالات' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTheme} onValueChange={setFilterTheme}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Themes', ar: 'جميع المحاور' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Themes', ar: 'جميع المحاور' })}</SelectItem>
                {themes.map((theme, idx) => (
                  <SelectItem key={idx} value={theme.name_en?.toLowerCase()}>{theme.name_en}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grouped by Theme */}
      {groupedByTheme.map((group, idx) => (
        group.initiatives.length > 0 && (
          <Card key={idx}>
            <CardHeader className="bg-slate-50">
              <div className="flex items-center justify-between">
                <CardTitle>{group.theme}</CardTitle>
                <Badge variant="outline">{group.initiatives.length} {t({ en: 'initiatives', ar: 'مبادرات' })}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.initiatives.map((initiative) => {
                  const Icon = typeIcons[initiative.type];
                  return (
                    <Link key={initiative.id} to={createPageUrl(initiative.page) + `?id=${initiative.id}`}>
                      <div className="p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-slate-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-slate-900 mb-1">{initiative.title}</h4>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={typeColors[initiative.type]} variant="outline">
                                {initiative.type.replace(/_/g, ' ')}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{initiative.status}</Badge>
                              {initiative.sector && <span className="text-xs text-slate-600">{initiative.sector}</span>}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )
      ))}

      {/* Unassigned */}
      {unassigned.length > 0 && (
        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              {t({ en: 'Unassigned to Strategic Theme', ar: 'غير معينة لمحور استراتيجي' })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {unassigned.map((initiative) => {
                const Icon = typeIcons[initiative.type];
                return (
                  <Link key={initiative.id} to={createPageUrl(initiative.page) + `?id=${initiative.id}`}>
                    <div className="p-3 border rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all">
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-slate-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-slate-900 mb-1">{initiative.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge className={typeColors[initiative.type]} variant="outline">
                              {initiative.type.replace(/_/g, ' ')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">{initiative.status}</Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(InitiativePortfolio, { requiredPermissions: [] });