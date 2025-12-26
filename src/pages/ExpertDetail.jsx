import { useExpertProfileById, useExpertAssignments, useExpertEvaluations } from '@/hooks/useExpertData';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from '../components/LanguageContext';
import {
  Award,
  Star,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  FileText,
  Linkedin,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  UserCircle
} from 'lucide-react';
import { PageLayout, PageHeader, PersonaButton } from '@/components/layout/PersonaPageLayout';

export default function ExpertDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const expertId = urlParams.get('id');
  const { language, isRTL, t } = useLanguage();

  const { data: expert, isLoading } = useExpertProfileById(expertId);
  const { data: assignments = [] } = useExpertAssignments(expert?.user_email);
  const { data: evaluations = [] } = useExpertEvaluations(expert?.user_email);


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
    <PageLayout>
      <PageHeader
        icon={UserCircle}
        title={`${expert.title || ''} ${expert.user_email?.split('@')[0] || ''}`}
        description={language === 'en' ? expert.position : (expert.position_ar || expert.position)}
        stats={[
          { icon: CheckCircle2, value: completedAssignments, label: t({ en: 'Completed', ar: 'Ù…ÙƒØªÙ…Ù„' }) },
          { icon: Star, value: avgEvaluationScore, label: t({ en: 'Avg Score', ar: 'Ù…ØªÙˆØ³Ø· Ø§Ù„Ù†Ù‚Ø§Ø·' }) },
          { icon: Briefcase, value: expert.years_of_experience || 0, label: t({ en: 'Years Exp.', ar: 'Ø³Ù†ÙˆØ§Øª Ø®Ø¨Ø±Ø©' }) },
        ]}
        badges={[
          expert.is_verified && <Badge key="verified" className="bg-green-100 text-green-700"><CheckCircle2 className="h-3 w-3 mr-1" />{t({ en: 'Verified', ar: 'Ù…ÙˆØ«Ù‚' })}</Badge>,
          expert.expert_rating > 0 && <Badge key="rating" className="bg-amber-100 text-amber-700"><Star className="h-3 w-3 mr-1 fill-current" />{expert.expert_rating.toFixed(1)}</Badge>
        ].filter(Boolean)}
        action={
          <Link to={createPageUrl(`ExpertProfileEdit?id=${expertId}`)}>
            <PersonaButton variant="outline">
              {t({ en: 'Edit Profile', ar: 'ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ù…Ù„Ù' })}
            </PersonaButton>
          </Link>
        }
      />

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t({ en: 'Profile', ar: 'Ø§Ù„Ù…Ù„Ù' })}</TabsTrigger>
          <TabsTrigger value="expertise">{t({ en: 'Expertise', ar: 'Ø§Ù„Ø®Ø¨Ø±Ø©' })}</TabsTrigger>
          <TabsTrigger value="experience">{t({ en: 'Experience', ar: 'Ø§Ù„ØªØ¬Ø±Ø¨Ø©' })}</TabsTrigger>
          <TabsTrigger value="performance">{t({ en: 'Performance', ar: 'Ø§Ù„Ø£Ø¯Ø§Ø¡' })}</TabsTrigger>
          <TabsTrigger value="availability">{t({ en: 'Availability', ar: 'Ø§Ù„ØªÙˆÙØ±' })}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {t({ en: 'Biography', ar: 'Ø§Ù„Ø³ÙŠØ±Ø© Ø§Ù„Ø°Ø§ØªÙŠØ©' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {language === 'ar' ? (expert.bio_ar || expert.bio_en) : expert.bio_en || t({ en: 'No biography provided', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ø³ÙŠØ±Ø© Ø°Ø§ØªÙŠØ©' })}
              </p>
            </CardContent>
          </Card>

          {expert.certifications && expert.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  {t({ en: 'Certifications', ar: 'Ø§Ù„Ø´Ù‡Ø§Ø¯Ø§Øª' })}
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
                              {t({ en: 'Issued:', ar: 'ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¥ØµØ¯Ø§Ø±:' })} {new Date(cert.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {cert.certificate_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer">
                              {t({ en: 'View', ar: 'Ø¹Ø±Ø¶' })}
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
                <CardTitle className="text-sm">{t({ en: 'Contact', ar: 'Ø§Ù„ØªÙˆØ§ØµÙ„' })}</CardTitle>
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
                <CardTitle className="text-sm">{t({ en: 'Preferences', ar: 'Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {expert.preferred_engagement_types && expert.preferred_engagement_types.length > 0 && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Engagement:', ar: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ø´Ø§Ø±ÙƒØ©:' })}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {expert.preferred_engagement_types.map((type, idx) => (
                        <Badge key={idx} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {expert.availability_hours_per_month && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Availability:', ar: 'Ø§Ù„ØªÙˆÙØ±:' })}</span>{' '}
                    {expert.availability_hours_per_month} {t({ en: 'hours/month', ar: 'Ø³Ø§Ø¹Ø©/Ø´Ù‡Ø±' })}
                  </div>
                )}
                {expert.languages && expert.languages.length > 0 && (
                  <div>
                    <span className="text-slate-500">{t({ en: 'Languages:', ar: 'Ø§Ù„Ù„ØºØ§Øª:' })}</span>{' '}
                    {expert.languages.join(', ')}
                  </div>
                )}
                {expert.travel_willing && (
                  <div className="text-green-600">
                    <CheckCircle2 className="h-4 w-4 inline mr-1" />
                    {t({ en: 'Willing to travel', ar: 'Ù…Ø³ØªØ¹Ø¯ Ù„Ù„Ø³ÙØ±' })}
                  </div>
                )}
                {expert.remote_only && (
                  <Badge variant="outline">{t({ en: 'Remote Only', ar: 'Ø¹Ù† Ø¨ÙØ¹Ø¯ ÙÙ‚Ø·' })}</Badge>
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
                {t({ en: 'Areas of Expertise', ar: 'Ù…Ø¬Ø§Ù„Ø§Øª Ø§Ù„Ø®Ø¨Ø±Ø©' })}
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
                <p className="text-slate-500 text-sm">{t({ en: 'No expertise areas specified', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ø¬Ø§Ù„Ø§Øª Ø®Ø¨Ø±Ø© Ù…Ø­Ø¯Ø¯Ø©' })}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                {t({ en: 'Sector Specializations', ar: 'Ø§Ù„ØªØ®ØµØµØ§Øª Ø§Ù„Ù‚Ø·Ø§Ø¹ÙŠØ©' })}
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
                <p className="text-slate-500 text-sm">{t({ en: 'No sectors specified', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù‚Ø·Ø§Ø¹Ø§Øª Ù…Ø­Ø¯Ø¯Ø©' })}</p>
              )}
            </CardContent>
          </Card>

          {expert.publications && expert.publications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  {t({ en: 'Publications', ar: 'Ø§Ù„Ù…Ù†Ø´ÙˆØ±Ø§Øª' })}
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
                          {t({ en: 'View Publication', ar: 'Ø¹Ø±Ø¶ Ø§Ù„Ù…Ù†Ø´ÙˆØ±' })}
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
                {t({ en: 'Assignment History', ar: 'Ø³Ø¬Ù„ Ø§Ù„Ù…Ù‡Ø§Ù…' })}
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
                  {t({ en: 'No assignments yet', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ Ù…Ù‡Ø§Ù… Ø¨Ø¹Ø¯' })}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-600" />
                {t({ en: 'Evaluation History', ar: 'Ø³Ø¬Ù„ Ø§Ù„ØªÙ‚ÙŠÙŠÙ…Ø§Øª' })}
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
                          <div className="text-xs text-slate-500">{t({ en: 'Score', ar: 'Ø§Ù„Ù†Ù‚Ø§Ø·' })}</div>
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
                  {t({ en: 'No evaluations yet', ar: 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙ‚ÙŠÙŠÙ…Ø§Øª Ø¨Ø¹Ø¯' })}
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
                    <p className="text-sm text-slate-600">{t({ en: 'Quality Score', ar: 'Ù†Ù‚Ø§Ø· Ø§Ù„Ø¬ÙˆØ¯Ø©' })}</p>
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
                    <p className="text-sm text-slate-600">{t({ en: 'Response Time', ar: 'ÙˆÙ‚Øª Ø§Ù„Ø±Ø¯' })}</p>
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
                    <p className="text-sm text-slate-600">{t({ en: 'Acceptance Rate', ar: 'Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù‚Ø¨ÙˆÙ„' })}</p>
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
                {t({ en: 'Availability', ar: 'Ø§Ù„ØªÙˆÙØ±' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-2">{t({ en: 'Monthly Capacity:', ar: 'Ø§Ù„Ù‚Ø¯Ø±Ø© Ø§Ù„Ø´Ù‡Ø±ÙŠØ©:' })}</p>
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
                    <p className="text-slate-600">{t({ en: 'Current Load:', ar: 'Ø§Ù„Ø­Ù…Ù„ Ø§Ù„Ø­Ø§Ù„ÙŠ:' })}</p>
                    <p className="font-medium text-slate-900">{assignments.filter(a => a.status === 'in_progress').length} {t({ en: 'active', ar: 'Ù†Ø´Ø·' })}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">{t({ en: 'Status:', ar: 'Ø§Ù„Ø­Ø§Ù„Ø©:' })}</p>
                    <Badge className={expert.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}>
                      {expert.is_active ? t({ en: 'Available', ar: 'Ù…ØªØ§Ø­' }) : t({ en: 'Unavailable', ar: 'ØºÙŠØ± Ù…ØªØ§Ø­' })}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
