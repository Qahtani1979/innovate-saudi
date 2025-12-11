import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Lightbulb, CheckCircle2, Star, Building2, Bookmark, ExternalLink, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createPageUrl } from '@/utils/url';

export default function CitizenSolutionsBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: solutions = [], isLoading } = useQuery({
    queryKey: ['citizen-solutions-browser'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*, providers(name_en, name_ar)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Get user's bookmarks
  const { data: userBookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ['citizen-solution-bookmarks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('bookmarks')
        .select('entity_id')
        .eq('user_email', user.email)
        .eq('entity_type', 'solution');
      if (error) throw error;
      return data?.map(b => b.entity_id) || [];
    },
    enabled: !!user?.email
  });

  const maturities = [
    { value: 'concept', label: t({ en: 'Concept', ar: 'فكرة' }) },
    { value: 'prototype', label: t({ en: 'Prototype', ar: 'نموذج أولي' }) },
    { value: 'pilot_ready', label: t({ en: 'Pilot Ready', ar: 'جاهز للتجربة' }) },
    { value: 'market_ready', label: t({ en: 'Market Ready', ar: 'جاهز للسوق' }) },
    { value: 'proven', label: t({ en: 'Proven', ar: 'مثبت' }) },
  ];

  const categories = [...new Set(solutions.map(s => s.category).filter(Boolean))];

  const filteredSolutions = solutions.filter(s => {
    const maturityMatch = selectedMaturity === 'all' || s.maturity_level === selectedMaturity;
    const categoryMatch = selectedCategory === 'all' || s.category === selectedCategory;
    const searchMatch = !searchTerm || 
      s.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name_ar?.includes(searchTerm) ||
      s.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return maturityMatch && categoryMatch && searchMatch;
  });

  const handleBookmark = async (solutionId) => {
    if (!user?.email) return;
    try {
      const isBookmarked = userBookmarks.includes(solutionId);
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_email', user.email)
          .eq('entity_id', solutionId)
          .eq('entity_type', 'solution');
        toast({ title: t({ en: 'Bookmark removed', ar: 'تم إزالة الإشارة' }) });
      } else {
        await supabase.from('bookmarks').insert({
          user_email: user.email,
          entity_id: solutionId,
          entity_type: 'solution'
        });
        toast({ title: t({ en: 'Bookmarked!', ar: 'تم حفظ الإشارة!' }) });
      }
      refetchBookmarks();
    } catch (err) {
      toast({ title: t({ en: 'Error', ar: 'خطأ' }), variant: 'destructive' });
    }
  };

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
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          {t({ en: 'Browse Solutions', ar: 'تصفح الحلول' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Discover innovative solutions transforming municipal services', ar: 'اكتشف الحلول المبتكرة التي تحول الخدمات البلدية' })}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-md bg-background"
              >
                <option value="all">{t({ en: 'All Categories', ar: 'جميع الفئات' })}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{solutions.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total Solutions', ar: 'إجمالي الحلول' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{solutions.filter(s => s.is_verified).length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Verified', ar: 'معتمدة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{solutions.filter(s => s.maturity_level === 'proven').length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Proven', ar: 'مثبتة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{userBookmarks.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Bookmarked', ar: 'محفوظة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Solutions Grid */}
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
        <Card>
          <CardContent className="py-16 text-center">
            <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t({ en: 'No solutions found', ar: 'لم يتم العثور على حلول' })}
            </h3>
            <p className="text-muted-foreground">
              {t({ en: 'Try adjusting your search or filters.', ar: 'حاول تعديل البحث أو الفلاتر.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSolutions.map(solution => (
            <Card key={solution.id} className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink className="h-4 w-4" />
                      {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    </Button>
                  </Link>
                  <Button
                    variant={userBookmarks.includes(solution.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleBookmark(solution.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
