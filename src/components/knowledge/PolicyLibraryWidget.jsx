import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../LanguageContext';
import { Shield, Search, BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function PolicyLibraryWidget() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState('all');

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['knowledge-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('policy_recommendations')
        .select('*');
      if (error) throw error;
      // Only show published/active policies in knowledge hub
      return (data || []).filter(p => 
        ['published', 'active', 'implemented'].includes(p.workflow_stage || p.status)
      );
    }
  });

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = !searchQuery || 
      p.title_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recommendation_text_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recommendation_text_en?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStage === 'all' || 
      (p.workflow_stage || p.status) === filterStage;
    
    return matchesSearch && matchesFilter;
  });

  // Group by sector/theme
  const policiesByCategory = filteredPolicies.reduce((acc, policy) => {
    const category = policy.policy_type || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(policy);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            {t({ en: 'Policy Library', ar: 'مكتبة السياسات' })}
          </CardTitle>
          <Badge>{filteredPolicies.length} {t({ en: 'policies', ar: 'سياسة' })}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t({ en: 'Search policies...', ar: 'بحث السياسات...' })}
              className="pl-10"
            />
          </div>
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">{t({ en: 'All', ar: 'الكل' })}</option>
            <option value="published">{t({ en: 'Published', ar: 'منشور' })}</option>
            <option value="active">{t({ en: 'Active', ar: 'فعال' })}</option>
            <option value="implemented">{t({ en: 'Implemented', ar: 'منفذ' })}</option>
          </select>
        </div>

        {/* Policy Categories */}
        {Object.keys(policiesByCategory).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(policiesByCategory).map(([category, categoryPolicies]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <p className="text-sm font-semibold text-purple-900 capitalize">
                    {category.replace(/_/g, ' ')} ({categoryPolicies.length})
                  </p>
                </div>
                <div className="space-y-2">
                  {categoryPolicies.map(policy => (
                    <Link key={policy.id} to={createPageUrl(`PolicyDetail?id=${policy.id}`)}>
                      <div className="p-3 bg-white border rounded-lg hover:bg-purple-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {language === 'ar' && policy.title_ar ? policy.title_ar : policy.title_en}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {policy.code && (
                                <Badge variant="outline" className="text-xs font-mono">{policy.code}</Badge>
                              )}
                              <Badge className="text-xs">
                                {(policy.workflow_stage || policy.status)?.replace(/_/g, ' ')}
                              </Badge>
                              {policy.regulatory_change_needed && (
                                <Badge className="text-xs bg-orange-100 text-orange-700">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {t({ en: 'Regulatory', ar: 'تنظيمي' })}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              {language === 'ar' && policy.recommendation_text_ar 
                                ? policy.recommendation_text_ar 
                                : policy.recommendation_text_en}
                            </p>
                          </div>
                          {policy.impact_score && (
                            <div className="text-right ml-3">
                              <div className="text-lg font-bold text-purple-600">{policy.impact_score}</div>
                              <div className="text-xs text-slate-500">{t({ en: 'Impact', ar: 'تأثير' })}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              {t({ en: 'No policies found', ar: 'لم يتم العثور على سياسات' })}
            </p>
          </div>
        )}

        <div className="pt-4 border-t">
          <Link to={createPageUrl('PolicyHub')}>
            <Button variant="outline" className="w-full">
              {t({ en: 'View All Policies', ar: 'عرض جميع السياسات' })}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
