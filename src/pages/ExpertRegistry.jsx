import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from '../components/LanguageContext';
import { usePermissions } from '../components/permissions/usePermissions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Filter,
  Award,
  Star,
  Plus,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Sparkles,
  Download,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function ExpertRegistry() {
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [semanticSearching, setSemanticSearching] = useState(false);
  const { language, isRTL, t } = useLanguage();

  const runSemanticSearch = () => {
    toast.info(t({ en: 'Feature coming soon', ar: 'قريباً' }));
  };

  const exportExperts = () => {
    toast.info(t({ en: 'Export feature coming soon', ar: 'التصدير قريباً' }));
  };

  const { data: experts = [], isLoading } = useQuery({
    queryKey: ['expert-profiles'],
    queryFn: () => base44.entities.ExpertProfile.list('-created_date', 100)
  });

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.bio_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expert.bio_ar?.includes(searchTerm) ||
                         expert.expertise_areas?.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSector = sectorFilter === 'all' || expert.sector_specializations?.includes(sectorFilter);
    return matchesSearch && matchesSector && expert.is_active && !expert.is_deleted;
  });

  const totalExperts = experts.filter(e => e.is_active && !e.is_deleted).length;
  const verifiedExperts = experts.filter(e => e.is_verified && e.is_active).length;
  const avgRating = experts.length > 0 
    ? (experts.reduce((sum, e) => sum + (e.expert_rating || 0), 0) / experts.length).toFixed(1)
    : 0;

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'Expert Registry', ar: 'سجل الخبراء' }}
        subtitle={{ en: 'Browse and connect with domain experts', ar: 'تصفح وتواصل مع الخبراء المتخصصين' }}
        icon={<Users className="h-6 w-6 text-white" />}
        actions={
          hasPermission('expert_register') && (
            <div className="flex gap-2">
              <Button onClick={runSemanticSearch} disabled={semanticSearching} variant="outline" className="gap-2">
                {semanticSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                AI Search
              </Button>
              <Button onClick={exportExperts} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Link to={createPageUrl('ExpertOnboarding')}>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Plus className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t({ en: 'Become an Expert', ar: 'كن خبيراً' })}
                </Button>
              </Link>
            </div>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total Experts', ar: 'إجمالي الخبراء' })}</p>
                <p className="text-3xl font-bold text-purple-600">{totalExperts}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Verified', ar: 'موثّق' })}</p>
                <p className="text-3xl font-bold text-green-600">{verifiedExperts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Avg. Rating', ar: 'متوسط التقييم' })}</p>
                <p className="text-3xl font-bold text-amber-600">{avgRating}</p>
              </div>
              <Star className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Evaluations', ar: 'التقييمات' })}</p>
                <p className="text-3xl font-bold text-blue-600">
                  {experts.reduce((sum, e) => sum + (e.evaluation_count || 0), 0)}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
            <Input
              placeholder={t({ en: 'Search by expertise, bio, keywords...', ar: 'ابحث بالخبرة، السيرة، الكلمات المفتاحية...' })}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
            />
          </div>

          <Select value={sectorFilter} onValueChange={setSectorFilter}>
            <SelectTrigger className="w-48">
              <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              <SelectValue placeholder={t({ en: 'All Sectors', ar: 'جميع القطاعات' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</SelectItem>
              <SelectItem value="urban_design">{t({ en: 'Urban Design', ar: 'التصميم العمراني' })}</SelectItem>
              <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
              <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
              <SelectItem value="digital_services">{t({ en: 'Digital Services', ar: 'الخدمات الرقمية' })}</SelectItem>
              <SelectItem value="health">{t({ en: 'Health', ar: 'الصحة' })}</SelectItem>
              <SelectItem value="education">{t({ en: 'Education', ar: 'التعليم' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-32 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ))
        ) : filteredExperts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">{t({ en: 'No experts found', ar: 'لم يتم العثور على خبراء' })}</p>
          </div>
        ) : (
          filteredExperts.map((expert) => (
            <Link key={expert.id} to={createPageUrl(`ExpertDetail?id=${expert.id}`)}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">
                        {expert.user_email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">
                          {expert.title} {expert.user_email?.split('@')[0]}
                        </h3>
                        {expert.is_verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {expert.position && (
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{language === 'en' ? expert.position : (expert.position_ar || expert.position)}</span>
                        </div>
                      )}
                      {expert.expert_rating > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{expert.expert_rating.toFixed(1)} ({expert.evaluation_count} {t({ en: 'reviews', ar: 'تقييم' })})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2 mb-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? (expert.bio_ar || expert.bio_en) : expert.bio_en}
                  </p>

                  {((language === 'en' && expert.expertise_areas) || (language === 'ar' && expert.expertise_areas_ar) || expert.expertise_areas) && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(language === 'ar' && expert.expertise_areas_ar ? expert.expertise_areas_ar : expert.expertise_areas || []).slice(0, 3).map((area, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {(language === 'ar' && expert.expertise_areas_ar ? expert.expertise_areas_ar : expert.expertise_areas || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(language === 'ar' && expert.expertise_areas_ar ? expert.expertise_areas_ar : expert.expertise_areas || []).length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {expert.sector_specializations && expert.sector_specializations.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <GraduationCap className="h-3 w-3" />
                      <span>{expert.sector_specializations.length} {t({ en: 'sectors', ar: 'قطاع' })}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
    </PageLayout>
    </div>
  );
}

export default ProtectedPage(ExpertRegistry, { requiredPermissions: []});