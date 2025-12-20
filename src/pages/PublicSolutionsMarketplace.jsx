import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import DeploymentBadges from '../components/solutions/DeploymentBadges';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Search, Lightbulb, Award, CheckCircle2, Star, TrendingUp, Filter } from 'lucide-react';

export default function PublicSolutionsMarketplace() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedMaturity, setSelectedMaturity] = useState('all');

  const { data: solutions = [] } = useQuery({
    queryKey: ['public-solutions'],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => s.is_published && !s.is_archived);
    }
  });

  const { data: successfulDeployments = [] } = useQuery({
    queryKey: ['successful-deployments'],
    queryFn: async () => {
      const pilots = await base44.entities.Pilot.filter({
        stage: { $in: ['completed', 'scaled'] },
        recommendation: 'scale',
        is_published: true
      }, '-updated_date', 6);
      return pilots;
    }
  });

  const sectors = [...new Set(solutions.flatMap(s => s.sectors || []))];
  const maturities = ['concept', 'prototype', 'pilot_ready', 'market_ready', 'proven'];

  const filteredSolutions = solutions.filter(s => {
    const sectorMatch = selectedSector === 'all' || s.sectors?.includes(selectedSector);
    const maturityMatch = selectedMaturity === 'all' || s.maturity_level === selectedMaturity;
    const searchMatch = !searchTerm || 
      s.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.provider_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return sectorMatch && maturityMatch && searchMatch;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="h-8 w-8" />
            <h1 className="text-4xl font-bold">
              {t({ en: 'Solutions Marketplace', ar: 'سوق الحلول' })}
            </h1>
          </div>
          <p className="text-xl opacity-90">
            {t({ en: 'Discover proven innovations for municipal challenges', ar: 'اكتشف الابتكارات المثبتة للتحديات البلدية' })}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search solutions, providers...', ar: 'ابحث عن حلول، مقدمين...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${isRTL ? 'pr-10' : 'pl-10'} text-lg`}
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedSector === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSector('all')}
                >
                  {t({ en: 'All Sectors', ar: 'كل القطاعات' })}
                </Button>
                {sectors.slice(0, 6).map((sector) => (
                  <Button
                    key={sector}
                    variant={selectedSector === sector ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSector(sector)}
                  >
                    {sector}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-slate-600">{t({ en: 'Maturity:', ar: 'النضج:' })}</span>
              {maturities.map((maturity) => (
                <Button
                  key={maturity}
                  variant={selectedMaturity === maturity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMaturity(maturity)}
                >
                  {maturity.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Stories */}
      {successfulDeployments.length > 0 && (
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              {t({ en: 'Success Stories - Proven Deployments', ar: 'قصص النجاح - عمليات نشر مثبتة' })}
            </CardTitle>
            <p className="text-sm text-slate-600">
              {t({ en: 'Real-world innovations that have been successfully deployed and scaled', ar: 'ابتكارات حقيقية تم نشرها وتوسيعها بنجاح' })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {successfulDeployments.map((pilot) => {
                const solution = solutions.find(s => s.id === pilot.solution_id);
                if (!solution) return null;
                
                return (
                  <Card key={pilot.id} className="hover:shadow-lg transition-all border-2 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-2">
                            {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                          </h4>
                          <p className="text-xs text-slate-600">{solution.provider_name}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-slate-700 line-clamp-2">
                          {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                        </p>
                        
                        {pilot.kpis && pilot.kpis.length > 0 && (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-900 mb-1">
                              {t({ en: 'Impact:', ar: 'التأثير:' })}
                            </p>
                            <p className="text-xs text-green-800">
                              {pilot.kpis[0]?.name}: {pilot.kpis[0]?.target}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {pilot.deployment_count > 0 && (
                            <Badge className="bg-green-600 text-white text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {pilot.deployment_count} {t({ en: 'cities', ar: 'مدن' })}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {pilot.stage}
                          </Badge>
                        </div>
                        
                        <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                          <Button size="sm" variant="outline" className="w-full mt-2">
                            {t({ en: 'View Solution', ar: 'عرض الحل' })}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{solutions.length}</div>
            <div className="text-sm text-slate-600">{t({ en: 'Total Solutions', ar: 'إجمالي الحلول' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {solutions.filter(s => s.maturity_level === 'proven' || s.maturity_level === 'market_ready').length}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'Market Ready', ar: 'جاهزة للسوق' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {solutions.filter(s => s.is_verified).length}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'Verified', ar: 'موثقة' })}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-amber-600">
              {solutions.filter(s => s.deployment_count > 0).length}
            </div>
            <div className="text-sm text-slate-600">{t({ en: 'Deployed', ar: 'مطبقة' })}</div>
          </CardContent>
        </Card>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSolutions.map((solution) => (
          <Card key={solution.id} className="hover:shadow-xl transition-all">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline">{solution.provider_type?.replace(/_/g, ' ')}</Badge>
                {solution.is_verified && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Verified', ar: 'موثق' })}
                  </Badge>
                )}
              </div>
              <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                <CardTitle className="text-lg hover:text-blue-600 line-clamp-2">
                  {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                </CardTitle>
              </Link>
              <p className="text-sm text-slate-600">{solution.provider_name}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-700 line-clamp-3">
                {language === 'ar' && solution.description_ar ? solution.description_ar : solution.description_en}
              </p>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={
                  solution.maturity_level === 'proven' ? 'bg-green-600' :
                  solution.maturity_level === 'market_ready' ? 'bg-blue-600' :
                  'bg-amber-600'
                }>
                  {solution.maturity_level?.replace(/_/g, ' ')}
                </Badge>
                {solution.trl && (
                  <Badge variant="outline">TRL {solution.trl}</Badge>
                )}
                <DeploymentBadges solution={solution} pilots={[]} />
              </div>

              {solution.sectors && solution.sectors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {solution.sectors.slice(0, 3).map((sector, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{sector}</Badge>
                  ))}
                </div>
              )}

              {solution.deployment_count > 0 && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <TrendingUp className="h-4 w-4" />
                  <span>{solution.deployment_count} {t({ en: 'deployments', ar: 'عمليات نشر' })}</span>
                </div>
              )}

              {solution.ratings?.average > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= solution.ratings.average ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-600">({solution.ratings.count})</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSolutions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">{t({ en: 'No solutions found', ar: 'لم يتم العثور على حلول' })}</p>
            <p className="text-slate-400 text-sm mt-2">{t({ en: 'Try adjusting your filters', ar: 'جرب تعديل الفلاتر' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}