import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Lightbulb, CheckCircle2, Star, ArrowRight, Building2 } from 'lucide-react';

export default function PublicSolutions() {
  const { language, isRTL, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState('all');

  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['public-solutions-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*, providers(name_en, name_ar)')
        .eq('is_deleted', false)
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const maturities = [
    { value: 'concept', label: t({ en: 'Concept', ar: 'فكرة' }) },
    { value: 'prototype', label: t({ en: 'Prototype', ar: 'نموذج أولي' }) },
    { value: 'pilot_ready', label: t({ en: 'Pilot Ready', ar: 'جاهز للتجربة' }) },
    { value: 'market_ready', label: t({ en: 'Market Ready', ar: 'جاهز للسوق' }) },
    { value: 'proven', label: t({ en: 'Proven', ar: 'مثبت' }) },
  ];

  const filteredSolutions = solutions.filter(s => {
    const maturityMatch = selectedMaturity === 'all' || s.maturity_level === selectedMaturity;
    const searchMatch = !searchTerm || 
      s.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name_ar?.includes(searchTerm) ||
      s.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return maturityMatch && searchMatch;
  });

  const getMaturityBadge = (level) => {
    switch (level) {
      case 'proven': return 'bg-green-100 text-green-700';
      case 'market_ready': return 'bg-blue-100 text-blue-700';
      case 'pilot_ready': return 'bg-purple-100 text-purple-700';
      case 'prototype': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      
      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t({ en: 'Innovation Solutions', ar: 'الحلول المبتكرة' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t({ 
              en: 'Discover verified solutions from innovative providers ready to transform municipal services.', 
              ar: 'اكتشف الحلول المعتمدة من مزودين مبتكرين جاهزين لتحويل الخدمات البلدية.' 
            })}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t({ en: 'Search solutions...', ar: 'ابحث عن الحلول...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={selectedMaturity}
              onChange={(e) => setSelectedMaturity(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">{t({ en: 'All Maturity Levels', ar: 'جميع مستويات النضج' })}</option>
              {maturities.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSolutions.length === 0 ? (
            <div className="text-center py-16">
              <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {t({ en: 'No solutions found', ar: 'لم يتم العثور على حلول' })}
              </h3>
              <p className="text-muted-foreground">
                {t({ en: 'Try adjusting your search or filters.', ar: 'حاول تعديل البحث أو الفلاتر.' })}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSolutions.map(solution => (
                <Card key={solution.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      {solution.is_verified && (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {t({ en: 'Verified', ar: 'معتمد' })}
                        </Badge>
                      )}
                      {solution.maturity_level && (
                        <Badge className={getMaturityBadge(solution.maturity_level)}>
                          {maturities.find(m => m.value === solution.maturity_level)?.label || solution.maturity_level}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {language === 'ar' && solution.description_ar ? solution.description_ar : solution.description_en}
                    </p>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      {solution.providers && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>
                            {language === 'ar' && solution.providers.name_ar 
                              ? solution.providers.name_ar 
                              : solution.providers.name_en}
                          </span>
                        </div>
                      )}
                      {solution.average_rating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{solution.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link to="/auth">
                      <Button variant="outline" className="w-full gap-2">
                        {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t({ en: 'Are You a Solution Provider?', ar: 'هل أنت مزود حلول؟' })}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t({ 
              en: 'Join our marketplace to showcase your solutions and connect with municipalities looking for innovation.', 
              ar: 'انضم إلى سوقنا لعرض حلولك والتواصل مع البلديات التي تبحث عن الابتكار.' 
            })}
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              {t({ en: 'Register Now', ar: 'سجل الآن' })}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}