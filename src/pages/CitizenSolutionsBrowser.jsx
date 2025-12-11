import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckCircle2, Star, Building2, Bookmark, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenSearchFilter, 
  CitizenCardGrid, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function CitizenSolutionsBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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
    if (!user?.email) {
      toast({ title: t({ en: 'Please login to bookmark', ar: 'يرجى تسجيل الدخول للحفظ' }), variant: 'destructive' });
      return;
    }
    try {
      const isBookmarked = userBookmarks.includes(solutionId);
      if (isBookmarked) {
        await supabase.from('bookmarks').delete()
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
      case 'proven': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'market_ready': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pilot_ready': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'prototype': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const activeFiltersCount = (selectedMaturity !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Lightbulb}
        title={t({ en: 'Browse Solutions', ar: 'تصفح الحلول' })}
        description={t({ en: 'Discover innovative solutions transforming municipal services', ar: 'اكتشف الحلول المبتكرة التي تحول الخدمات البلدية' })}
        stats={[
          { value: solutions.length, label: t({ en: 'Solutions', ar: 'حلول' }), icon: Lightbulb },
          { value: solutions.filter(s => s.is_verified).length, label: t({ en: 'Verified', ar: 'معتمدة' }), icon: CheckCircle2 },
          { value: solutions.filter(s => s.maturity_level === 'proven').length, label: t({ en: 'Proven', ar: 'مثبتة' }), icon: Star },
        ]}
      />

      <CitizenSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t({ en: 'Search solutions...', ar: 'ابحث عن الحلول...' })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilters={activeFiltersCount}
        onClearFilters={() => { setSelectedMaturity('all'); setSelectedCategory('all'); }}
        filters={[
          {
            label: t({ en: 'Maturity', ar: 'النضج' }),
            placeholder: t({ en: 'Maturity', ar: 'النضج' }),
            value: selectedMaturity,
            onChange: setSelectedMaturity,
            options: maturities
          },
          ...(categories.length > 0 ? [{
            label: t({ en: 'Category', ar: 'الفئة' }),
            placeholder: t({ en: 'Category', ar: 'الفئة' }),
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: categories.map(c => ({ value: c, label: c }))
          }] : [])
        ]}
      />

      <CitizenCardGrid 
        viewMode={viewMode}
        emptyState={
          <CitizenEmptyState
            icon={Lightbulb}
            title={t({ en: 'No solutions found', ar: 'لم يتم العثور على حلول' })}
            description={t({ en: 'Try adjusting your filters or check back later', ar: 'حاول تعديل الفلاتر أو تحقق لاحقاً' })}
          />
        }
      >
        {filteredSolutions.map(solution => (
          <Card 
            key={solution.id} 
            className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <CardContent className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-6 w-full' : ''}`}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getMaturityBadge(solution.maturity_level)}>
                      {maturities.find(m => m.value === solution.maturity_level)?.label || solution.maturity_level}
                    </Badge>
                    {solution.is_verified && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t({ en: 'Verified', ar: 'معتمد' })}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${userBookmarks.includes(solution.id) ? 'text-amber-500' : 'text-muted-foreground'}`}
                    onClick={(e) => { e.preventDefault(); handleBookmark(solution.id); }}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'ar' ? (solution.name_ar || solution.name_en) : (solution.name_en || solution.name_ar)}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {language === 'ar' ? (solution.description_ar || solution.description_en) : (solution.description_en || solution.description_ar)}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {solution.providers?.name_en && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {language === 'ar' ? solution.providers.name_ar : solution.providers.name_en}
                    </span>
                  )}
                  {solution.category && (
                    <Badge variant="outline" className="text-xs">
                      {solution.category}
                    </Badge>
                  )}
                </div>

                <Link to={`/solution-detail?id=${solution.id}`}>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </CitizenCardGrid>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenSolutionsBrowser, { requiredPermissions: [] });
