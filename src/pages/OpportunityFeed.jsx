import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Sparkles, Target, Lightbulb, TestTube, Calendar, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function OpportunityFeed() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data: challenges = [] } = useQuery({
    queryKey: ['open-challenges'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.status === 'approved' && c.is_published);
    }
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['open-programs'],
    queryFn: async () => {
      const all = await base44.entities.Program.list();
      return all.filter(p => p.status === 'applications_open' && p.is_published);
    }
  });

  const { data: rdCalls = [] } = useQuery({
    queryKey: ['open-rd-calls'],
    queryFn: async () => {
      const all = await base44.entities.RDCall.list();
      return all.filter(r => r.status === 'open' && r.is_published);
    }
  });

  const opportunities = [
    ...challenges.map(c => ({ ...c, type: 'challenge', icon: Target })),
    ...programs.map(p => ({ ...p, type: 'program', icon: Calendar })),
    ...rdCalls.map(r => ({ ...r, type: 'rd_call', icon: Lightbulb }))
  ].filter(opp => {
    const matchesType = filterType === 'all' || opp.type === filterType;
    const matchesSearch = !searchQuery || 
      (opp.title_en || opp.name_en || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <PageLayout>
      <PageHeader
        icon={Sparkles}
        title={t({ en: 'Opportunity Feed', ar: 'فرص الابتكار' })}
        description={t({ en: 'Discover challenges, programs, and R&D calls you can engage with', ar: 'اكتشف التحديات والبرامج ودعوات البحث التي يمكنك المشاركة فيها' })}
        stats={[
          { icon: Target, value: challenges.length, label: t({ en: 'Challenges', ar: 'تحديات' }) },
          { icon: Calendar, value: programs.length, label: t({ en: 'Programs', ar: 'برامج' }) },
          { icon: Lightbulb, value: rdCalls.length, label: t({ en: 'R&D Calls', ar: 'دعوات بحث' }) },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('all')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{opportunities.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Opportunities', ar: 'إجمالي الفرص' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('challenge')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Target className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-600">{challenges.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Open Challenges', ar: 'تحديات مفتوحة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('program')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{programs.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Open Programs', ar: 'برامج مفتوحة' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-white cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilterType('rd_call')}>
          <CardContent className="pt-6">
            <div className="text-center">
              <Lightbulb className="h-8 w-8 text-teal-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-teal-600">{rdCalls.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'R&D Calls', ar: 'دعوات بحث' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search opportunities...', ar: 'بحث في الفرص...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Button variant="outline" onClick={() => setFilterType('all')}>
              <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t({ en: 'All', ar: 'الكل' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opp) => {
              const Icon = opp.icon;
              return (
                <div key={opp.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">
                          {opp.title_en || opp.name_en}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {opp.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">
                        {(opp.tagline_en || opp.description_en || '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-3">
                        {opp.type === 'challenge' && (
                          <Link to={createPageUrl(`ChallengeDetail?id=${opp.id}`)}>
                            <Button size="sm" variant="outline">
                              {t({ en: 'View Challenge', ar: 'عرض التحدي' })}
                            </Button>
                          </Link>
                        )}
                        {opp.type === 'program' && (
                          <Link to={createPageUrl(`ProgramDetail?id=${opp.id}`)}>
                            <Button size="sm" variant="outline">
                              {t({ en: 'View Program', ar: 'عرض البرنامج' })}
                            </Button>
                          </Link>
                        )}
                        {opp.type === 'rd_call' && (
                          <Link to={createPageUrl(`RDCallDetail?id=${opp.id}`)}>
                            <Button size="sm" variant="outline">
                              {t({ en: 'View Call', ar: 'عرض الدعوة' })}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(OpportunityFeed, { requiredPermissions: [] });