import { useState } from 'react';
import { useInitiativePortfolioData } from '@/hooks/useInitiativePortfolioData';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { AlertCircle, AlertTriangle, TestTube, Microscope, Calendar, Download, Search, ChevronRight } from 'lucide-react';
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

  const {
    allInitiatives,
    activePlan,
    themes,
    isLoading
  } = useInitiativePortfolioData();

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
  // themes is provided by hook
  const groupedByTheme = themes.map(theme => {
    // @ts-ignore
    const themeName = theme.name_en || theme;
    return {
      theme: themeName,
      initiatives: filteredInitiatives.filter(i =>
        i.strategic_theme?.toLowerCase().includes(themeName?.toLowerCase())
      )
    };
  });

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
            {t({ en: 'Initiative Portfolio Master View', ar: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ø­ÙØ¸Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© Ù„Ù„Ù…Ø¨Ø§Ø¯Ø±Ø§Øª' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: `${allInitiatives.length} initiatives across all types`, ar: `${allInitiatives.length} Ù…Ø¨Ø§Ø¯Ø±Ø© Ø¹Ø¨Ø± Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø£Ù†ÙˆØ§Ø¹` })}
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {t({ en: 'Export Portfolio', ar: 'ØªØµØ¯ÙŠØ± Ø§Ù„Ù…Ø­ÙØ¸Ø©' })}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search initiatives...', ar: 'Ø§Ø¨Ø­Ø« Ø¹Ù† Ø§Ù„Ù…Ø¨Ø§Ø¯Ø±Ø§Øª...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={filterSector} onValueChange={setFilterSector}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Sectors', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Sectors', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª' })}</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="environment">Environment</SelectItem>
                <SelectItem value="urban_design">Urban Design</SelectItem>
                <SelectItem value="digital_services">Digital Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Years', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø³Ù†ÙˆØ§Øª' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Years', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø³Ù†ÙˆØ§Øª' })}</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Status', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø­Ø§Ù„Ø§Øª' })}</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTheme} onValueChange={setFilterTheme}>
              <SelectTrigger>
                <SelectValue placeholder={t({ en: 'All Themes', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø­Ø§ÙˆØ±' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Themes', ar: 'Ø¬Ù…ÙŠØ¹ Ø§Ù„Ù…Ø­Ø§ÙˆØ±' })}</SelectItem>
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
                <Badge variant="outline">{group.initiatives.length} {t({ en: 'initiatives', ar: 'Ù…Ø¨Ø§Ø¯Ø±Ø§Øª' })}</Badge>
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
              {t({ en: 'Unassigned to Strategic Theme', ar: 'ØºÙŠØ± Ù…Ø¹ÙŠÙ†Ø© Ù„Ù…Ø­ÙˆØ± Ø§Ø³ØªØ±Ø§ØªÙŠØ¬ÙŠ' })}
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
