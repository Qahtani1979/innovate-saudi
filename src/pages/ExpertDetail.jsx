import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Award,
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  FileText,
  Globe,
  Linkedin,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

export default function ExpertDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert-profile', expertId],
    queryFn: async () => {
      const experts = await base44.entities.ExpertProfile.list();
      return experts.find(e => e.id === expertId);
    },
    enabled: !!expertId
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['expert-assignments', expert?.user_email],
    queryFn: async () => {
      if (!expert?.user_email) return [];
      const all = await base44.entities.ExpertAssignment.list();
      return all.filter(a => a.expert_email === expert.user_email);
    },
    enabled: !!expert?.user_email
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['expert-evaluations', expert?.user_email],
    queryFn: async () => {
      if (!expert?.user_email) return [];
      const all = await base44.entities.ExpertEvaluation.list();
      return all.filter(e => e.expert_email === expert.user_email);
    },
    enabled: !!expert?.user_email
  });

  if (isLoading || !expert) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const avgEvaluationScore = evaluations.length > 0
    ? (evaluations.reduce((sum, e) => sum + (e.overall_score || 0), 0) / evaluations.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-white text-purple-600 text-3xl font-bold">
                {expert.user_email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">
                  {expert.title} {expert.user_email?.split('@')[0]}
                </h1>
                {expert.is_verified && (
                  <CheckCircle2 className="h-6 w-6 text-green-300" />
                )}
              </div>
              {expert.position && (
                <div className="flex items-center gap-2 text-white/90 mb-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-lg">{language === 'en' ? expert.position : (expert.position_ar || expert.position)}</span>
                </div>
              )}
              {expert.expert_rating > 0 && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="text-xl font-semibold">{expert.expert_rating.toFixed(1)}</span>
                  <span className="text-white/80">({expert.evaluation_count} {t({ en: 'evaluations', ar: 'تقييم' })})</span>
                </div>
              )}
            </div>
            <Link to={createPageUrl(`ExpertProfileEdit?id=${expertId}`)}>
              <Button variant="outline" className="bg-white/20 border-white/40 text-white hover:bg-white/30">
                {t({ en: 'Edit Profile', ar: 'تعديل الملف' })}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">{completedAssignments}</div>
              <div className="text-sm text-white/80">{t({ en: 'Completed', ar: 'مكتمل' })}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">{avgEvaluationScore}</div>
              <div className="text-sm text-white/80">{t({ en: 'Avg Score', ar: 'متوسط النقاط' })}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">{expert.years_of_experience || 0}</div>
              <div className="text-sm text-white/80">{t({ en: 'Years Exp.', ar: 'سنوات خبرة' })}</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold">{expert.publications?.length || 0}</div>
              <div className="text-sm text-white/80">{t({ en: 'Publications', ar: 'منشورات' })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t({ en: 'Profile', ar: 'الملف' })}</TabsTrigger>
          <TabsTrigger value="expertise">{t({ en: 'Expertise', ar: 'الخبرة' })}</TabsTrigger>
          <TabsTrigger value="experience">{t({ en: 'Experience', ar: 'التجربة' })}</TabsTrigger>
          <TabsTrigger value="performance">{t({ en: 'Performance', ar: 'الأداء' })}</TabsTrigger>
          <TabsTrigger value="availability">{t({ en: 'Availability', ar: 'التوفر' })}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t({ en: 'Biography', ar: 'السيرة الذاتية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? (expert.bio_ar || expert.bio_en) : expert.bio_en || t({ en: 'No biography provided', ar: 'لا توجد سيرة ذاتية' })}
              </p>
            </CardContent>
          </Card>

          {expert.certifications && expert.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Certifications', ar: 'الشهادات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expert.certifications.map((cert, idx) => (
                    <div key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{cert.name}</p>
                          <p className="text-sm text-slate-600">{cert.issuer}</p>
                          {cert.date && (
                            <p className="text-xs text-slate-500 mt-1">
                              {t({ en: 'Issued:', ar: 'تاريخ الإصدار:' })} {new Date(cert.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {cert.certificate_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                              {t({ en: 'View', ar: 'عرض' })}
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Contact', ar: 'التواصل' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${expert.user_email}`} className="text-blue-600 hover:underline">
                    {expert.user_email}
                  </a>
                </div>
                {expert.linkedin_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-4 w-4 text-slate-400" />
                    <a href={expert.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {expert.google_scholar_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-slate-400" />
                    <a href={expert.google_scholar_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Google Scholar
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t({ en: 'Preferences', ar: 'التفضيلات' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {expert.preferred_engagement_types && expert.preferred_engagement_types.length > 0 && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Engagement:', ar: 'نوع المشاركة:' })}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expert.preferred_engagement_types.map((type, idx) => (
                        <Badge key={idx} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {expert.availability_hours_per_month && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Availability:', ar: 'التوفر:' })}</span>{' '}
                    {expert.availability_hours_per_month} {t({ en: 'hours/month', ar: 'ساعة/شهر' })}
                  </div>
                )}
                {expert.languages && expert.languages.length > 0 && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Languages:', ar: 'اللغات:' })}</span>{' '}
                    {expert.languages.join(', ')}
                  </div>
                )}
                {expert.travel_willing && (
                  <div className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {t({ en: 'Willing to travel', ar: 'مستعد للسفر' })}
                  </div>
                )}
                {expert.remote_only && (
                  <Badge variant="outline">{t({ en: 'Remote Only', ar: 'عن بُعد فقط' })}</Badge>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expertise Tab */}
        <TabsContent value="expertise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                {t({ en: 'Areas of Expertise', ar: 'مجالات الخبرة' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {((language === 'en' && expert.expertise_areas) || (language === 'ar' && expert.expertise_areas_ar) || expert.expertise_areas) ? (
                <div className="flex flex-wrap gap-2">
                  {(language === 'ar' && expert.expertise_areas_ar ? expert.expertise_areas_ar : expert.expertise_areas || []).map((area, idx) => (
                    <Badge key={idx} className="bg-purple-100 text-purple-700">
                      {area}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">{t({ en: 'No expertise areas specified', ar: 'لا توجد مجالات خبرة محددة' })}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                {t({ en: 'Sector Specializations', ar: 'التخصصات القطاعية' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expert.sector_specializations && expert.sector_specializations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {expert.sector_specializations.map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="capitalize">
                      {sector.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">{t({ en: 'No sectors specified', ar: 'لا توجد قطاعات محددة' })}</p>
              )}
            </CardContent>
          </Card>

          {expert.publications && expert.publications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  {t({ en: 'Publications', ar: 'المنشورات' })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expert.publications.map((pub, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="font-medium text-slate-900">{pub.title}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {pub.authors?.join(', ')} ({pub.year})
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{pub.publication}</p>
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                          {t({ en: 'View Publication', ar: 'عرض المنشور' })}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                {t({ en: 'Assignment History', ar: 'سجل المهام' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.slice(0, 10).map((assignment) => (
                    <div key={assignment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{assignment.entity_type}</Badge>
                        <Badge className={
                          assignment.status === 'completed' ? 'bg-green-100 text-green-700' :
                          assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {assignment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 capitalize">
                        {assignment.assignment_type?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(assignment.assigned_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No assignments yet', ar: 'لا توجد مهام بعد' })}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-600" />
                {t({ en: 'Evaluation History', ar: 'سجل التقييمات' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evaluations.length > 0 ? (
                <div className="space-y-3">
                  {evaluations.slice(0, 10).map((evaluation) => (
                    <div key={evaluation.id} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{evaluation.entity_type}</Badge>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{evaluation.overall_score}</div>
                          <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'النقاط' })}</div>
                        </div>
                      </div>
                      <Badge className={
                        evaluation.recommendation === 'approve' ? 'bg-green-100 text-green-700' :
                        evaluation.recommendation === 'reject' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {evaluation.recommendation}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(evaluation.evaluation_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-8">
                  {t({ en: 'No evaluations yet', ar: 'لا توجد تقييمات بعد' })}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'Quality Score', ar: 'نقاط الجودة' })}</p>
                    <p className="text-3xl font-bold text-green-600">{expert.evaluation_quality_score || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'Response Time', ar: 'وقت الرد' })}</p>
                    <p className="text-3xl font-bold text-blue-600">{expert.response_time_avg_hours || 0}h</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{t({ en: 'Acceptance Rate', ar: 'معدل القبول' })}</p>
                    <p className="text-3xl font-bold text-purple-600">{expert.acceptance_rate || 0}%</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                {t({ en: 'Availability', ar: 'التوفر' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">{t({ en: 'Monthly Capacity:', ar: 'القدرة الشهرية:' })}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                        style={{ width: `${Math.min((expert.availability_hours_per_month || 0) / 40 * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{expert.availability_hours_per_month || 0}h</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">{t({ en: 'Current Load:', ar: 'الحمل الحالي:' })}</p>
                    <p className="font-medium text-slate-900">{assignments.filter(a => a.status === 'in_progress').length} {t({ en: 'active', ar: 'نشط' })}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">{t({ en: 'Status:', ar: 'الحالة:' })}</p>
                    <Badge className={expert.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {expert.is_active ? t({ en: 'Available', ar: 'متاح' }) : t({ en: 'Unavailable', ar: 'غير متاح' })}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}