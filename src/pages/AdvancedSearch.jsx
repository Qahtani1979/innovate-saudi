import { useState } from 'react';
import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';
import { usePilotsWithVisibility } from '@/hooks/usePilotsWithVisibility';
import { useSolutionsWithVisibility } from '@/hooks/useSolutionsWithVisibility';
import { useProgramsWithVisibility } from '@/hooks/useProgramsWithVisibility';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import { Search, AlertCircle, TestTube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function AdvancedSearch() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState(false);

  /* Use visibility hooks with high limit for search */
  const { data: challenges = [] } = useChallengesWithVisibility({ limit: 1000 });
  const { data: pilots = [] } = usePilotsWithVisibility({ limit: 1000 });
  const { data: solutions = [] } = useSolutionsWithVisibility({ limit: 1000 });
  const { data: programs = [] } = useProgramsWithVisibility({ limit: 1000 });

  const performSearch = () => {
    if (!searchQuery.trim()) return;
    setActiveSearch(true);
  };

  const searchResults = {
    challenges: challenges.filter(c =>
      c.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title_ar?.includes(searchQuery) ||
      c.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    pilots: pilots.filter(p =>
      p.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title_ar?.includes(searchQuery) ||
      p.code?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    solutions: solutions.filter(s =>
      s.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.provider_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    programs: programs.filter(p =>
      p.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_ar?.includes(searchQuery)
    )
  };

  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'Advanced Search', ar: 'البحث المتقدم' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Search across all platform entities', ar: 'البحث في جميع عناصر المنصة' })}
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search challenges, pilots, solutions, programs...', ar: 'ابحث عن تحديات، تجارب، حلول، برامج...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className={`${isRTL ? 'pr-12' : 'pl-12'} text-lg h-14`}
              />
            </div>
            <Button
              onClick={performSearch}
              className="bg-gradient-to-r from-blue-600 to-teal-600 h-14 px-8"
            >
              <Search className="h-5 w-5 mr-2" />
              {t({ en: 'Search', ar: 'بحث' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeSearch && searchQuery && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                {t({ en: 'Search Results', ar: 'نتائج البحث' })} ({totalResults})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalResults === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">{t({ en: 'No results found', ar: 'لا توجد نتائج' })}</p>
                </div>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges ({searchResults.challenges.length})</TabsTrigger>
                    <TabsTrigger value="pilots">Pilots ({searchResults.pilots.length})</TabsTrigger>
                    <TabsTrigger value="solutions">Solutions ({searchResults.solutions.length})</TabsTrigger>
                    <TabsTrigger value="programs">Programs ({searchResults.programs.length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4 mt-6">
                    {searchResults.challenges.slice(0, 3).map(c => (
                      <Link key={c.id} to={createPageUrl(`ChallengeDetail?id=${c.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{c.title_en}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{c.code}</Badge>
                                <Badge>{c.status}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {searchResults.pilots.slice(0, 3).map(p => (
                      <Link key={p.id} to={createPageUrl(`PilotDetail?id=${p.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex items-start gap-3">
                            <TestTube className="h-5 w-5 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{p.title_en}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{p.code}</Badge>
                                <Badge>{p.stage}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="challenges" className="space-y-3 mt-6">
                    {searchResults.challenges.map(c => (
                      <Link key={c.id} to={createPageUrl(`ChallengeDetail?id=${c.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{c.code}</Badge>
                                <Badge>{c.status}</Badge>
                              </div>
                              <p className="font-medium text-slate-900">{c.title_en}</p>
                              <p className="text-sm text-slate-600 mt-1" dir="rtl">{c.title_ar}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{c.overall_score || 0}</div>
                              <div className="text-xs text-slate-500">Score</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="pilots" className="space-y-3 mt-6">
                    {searchResults.pilots.map(p => (
                      <Link key={p.id} to={createPageUrl(`PilotDetail?id=${p.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <p className="font-medium text-slate-900">{p.title_en}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{p.code}</Badge>
                            <Badge>{p.stage}</Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="solutions" className="space-y-3 mt-6">
                    {searchResults.solutions.map(s => (
                      <Link key={s.id} to={createPageUrl(`SolutionDetail?id=${s.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <p className="font-medium text-slate-900">{s.name_en}</p>
                          <p className="text-sm text-slate-600 mt-1">{s.provider_name}</p>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>

                  <TabsContent value="programs" className="space-y-3 mt-6">
                    {searchResults.programs.map(p => (
                      <Link key={p.id} to={createPageUrl(`ProgramDetail?id=${p.id}`)}>
                        <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                          <p className="font-medium text-slate-900">{p.name_en}</p>
                          <Badge>{p.type}</Badge>
                        </div>
                      </Link>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default ProtectedPage(AdvancedSearch, { requiredPermissions: [] });
