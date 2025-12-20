import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { Users, Search, Plus, Filter, Zap, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function MatchmakerApplicationsPage() {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['matchmaker-applications'],
    queryFn: () => base44.entities.MatchmakerApplication.list('-created_date', 100),
    initialData: []
  });

  const stages = [
    { id: 'all', label_en: 'All', label_ar: 'الكل' },
    { id: 'intake', label_en: 'Intake', label_ar: 'استقبال' },
    { id: 'screening', label_en: 'Screening', label_ar: 'فحص' },
    { id: 'stakeholder_review', label_en: 'Stakeholder Review', label_ar: 'مراجعة الأطراف' },
    { id: 'detailed_evaluation', label_en: 'Evaluation', label_ar: 'تقييم' },
    { id: 'executive_review', label_en: 'Executive Review', label_ar: 'مراجعة القيادة' },
    { id: 'approved', label_en: 'Approved', label_ar: 'معتمد' },
    { id: 'matching', label_en: 'Matching', label_ar: 'مطابقة' },
    { id: 'engagement', label_en: 'Engagement', label_ar: 'مشاركة' },
    { id: 'pilot_conversion', label_en: 'Pilot Conversion', label_ar: 'تحويل لتجربة' }
  ];

  const classifications = [
    { id: 'all', label_en: 'All', label_ar: 'الكل' },
    { id: 'fast_pass', label_en: 'Fast Pass', label_ar: 'تمرير سريع', color: 'bg-purple-100 text-purple-700' },
    { id: 'strong_qualified', label_en: 'Strong', label_ar: 'قوي', color: 'bg-green-100 text-green-700' },
    { id: 'conditional', label_en: 'Conditional', label_ar: 'مشروط', color: 'bg-amber-100 text-amber-700' },
    { id: 'not_qualified', label_en: 'Not Qualified', label_ar: 'غير مؤهل', color: 'bg-red-100 text-red-700' }
  ];

  const filteredApplications = applications.filter(app => {
    const matchesStage = statusFilter === 'all' || app.stage === statusFilter;
    const matchesClassification = classificationFilter === 'all' || app.classification === classificationFilter;
    const matchesSearch = searchQuery === '' ||
      (app.organization_name_en && app.organization_name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.organization_name_ar && app.organization_name_ar.includes(searchQuery));
    return matchesStage && matchesClassification && matchesSearch;
  });

  const stats = {
    total: applications.length,
    fastPass: applications.filter(a => a.classification === 'fast_pass').length,
    strong: applications.filter(a => a.classification === 'strong_qualified').length,
    pending: applications.filter(a => a.stage === 'intake' || a.stage === 'screening' || a.stage === 'stakeholder_review').length
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">{t({ en: 'Matchmaker Applications', ar: 'طلبات التوفيق' })}</h1>
          <p className="text-slate-600 mt-2">{t({ en: 'Manage provider applications and evaluations', ar: 'إدارة طلبات المزودين والتقييمات' })}</p>
        </div>
        <Link to={createPageUrl('MatchmakerApplicationCreate')}>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Plus className="h-4 w-4 mr-2" />
            {t({ en: 'New Application', ar: 'طلب جديد' })}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Total Applications', ar: 'إجمالي الطلبات' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{stats.fastPass}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Fast Pass', ar: 'تمرير سريع' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{stats.strong}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Strong Qualified', ar: 'مؤهل قوي' })}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pending Review', ar: 'بانتظار المراجعة' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search applications...', ar: 'ابحث عن الطلبات...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">{t({ en: 'Stage:', ar: 'المرحلة:' })}</span>
              {stages.map((stage) => (
                <Button
                  key={stage.id}
                  variant={statusFilter === stage.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(stage.id)}
                >
                  {language === 'ar' ? stage.label_ar : stage.label_en}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">{t({ en: 'Classification:', ar: 'التصنيف:' })}</span>
              {classifications.map((cls) => (
                <Button
                  key={cls.id}
                  variant={classificationFilter === cls.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setClassificationFilter(cls.id)}
                >
                  {language === 'ar' ? cls.label_ar : cls.label_en}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">{t({ en: 'Loading...', ar: 'جاري التحميل...' })}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const classInfo = classifications.find(c => c.id === app.classification);
            
            return (
              <Link key={app.id} to={createPageUrl('MatchmakerApplicationDetail') + `?id=${app.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg" dir={language === 'ar' && app.organization_name_ar ? 'rtl' : 'ltr'}>
                            {language === 'ar' && app.organization_name_ar ? app.organization_name_ar : app.organization_name_en}
                          </h3>
                          {app.classification && (
                            <Badge className={classInfo?.color || 'bg-slate-100'}>
                              {language === 'ar' ? classInfo?.label_ar : classInfo?.label_en}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{app.headquarters_location}</span>
                          {app.company_stage && <span>• {app.company_stage.replace(/_/g, ' ')}</span>}
                          {app.sectors?.length > 0 && <span>• {app.sectors.length} {t({ en: 'sectors', ar: 'قطاعات' })}</span>}
                        </div>

                        {app.evaluation_score?.total_score && (
                          <div className="mt-3 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{t({ en: 'Score:', ar: 'الدرجة:' })}</span>
                              <Badge variant="outline" className="font-mono">{app.evaluation_score.total_score}/100</Badge>
                            </div>
                            {app.evaluation_score.bonus_points > 0 && (
                              <Badge className="bg-amber-100 text-amber-700">
                                +{app.evaluation_score.bonus_points} {t({ en: 'bonus', ar: 'إضافي' })}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <Badge variant="outline">{app.stage?.replace(/_/g, ' ')}</Badge>
                        {app.application_code && (
                          <p className="text-xs text-slate-500 mt-2 font-mono">{app.application_code}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {filteredApplications.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">{t({ en: 'No applications found', ar: 'لم يتم العثور على طلبات' })}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(MatchmakerApplicationsPage, { requiredPermissions: ['matchmaker_view'] });