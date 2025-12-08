import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { 
  Sparkles, TrendingUp, Award, MapPin, Target, TestTube, Lightbulb, 
  CheckCircle2, Users, Building2, Rocket, BarChart3, Globe, BookOpen,
  MessageSquare, Calendar, Microscope, Beaker
} from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PublicPortal() {
  const { language, isRTL, t } = useLanguage();

  // RLS: Public sees only PUBLISHED and COMPLETED items
  const { data: successfulPilots = [] } = useQuery({
    queryKey: ['public-successful-pilots'],
    queryFn: async () => {
      const all = await base44.entities.Pilot.list();
      return all.filter(p => 
        (p.stage === 'completed' || p.stage === 'scaled') && 
        p.is_published &&
        p.recommendation === 'scale'
      );
    }
  });

  const { data: publishedChallenges = [] } = useQuery({
    queryKey: ['public-challenges'],
    queryFn: async () => {
      const all = await base44.entities.Challenge.list();
      return all.filter(c => c.is_published);
    }
  });

  const { data: verifiedSolutions = [] } = useQuery({
    queryKey: ['public-solutions'],
    queryFn: async () => {
      const all = await base44.entities.Solution.list();
      return all.filter(s => 
        s.is_published && 
        s.is_verified &&
        (s.maturity_level === 'market_ready' || s.maturity_level === 'proven')
      );
    }
  });

  const { data: topMunicipalities = [] } = useQuery({
    queryKey: ['top-municipalities-public'],
    queryFn: async () => {
      const all = await base44.entities.Municipality.list();
      return all
        .filter(m => m.is_active)
        .sort((a, b) => (b.mii_score || 0) - (a.mii_score || 0))
        .slice(0, 5);
    }
  });

  const { data: openPrograms = [] } = useQuery({
    queryKey: ['public-programs'],
    queryFn: async () => {
      const all = await base44.entities.Program.list();
      return all.filter(p => 
        p.is_published && 
        p.status === 'applications_open'
      );
    }
  });

  const { data: caseStudies = [] } = useQuery({
    queryKey: ['public-case-studies'],
    queryFn: async () => {
      const all = await base44.entities.CaseStudy.list('-created_date');
      return all.filter(c => c.is_published).slice(0, 6);
    }
  });

  const { data: publishedRDProjects = [] } = useQuery({
    queryKey: ['public-rd-projects'],
    queryFn: async () => {
      const all = await base44.entities.RDProject.list();
      return all.filter(r => r.is_published && r.status === 'completed');
    }
  });

  const { data: openRDCalls = [] } = useQuery({
    queryKey: ['public-rd-calls'],
    queryFn: async () => {
      const all = await base44.entities.RDCall.list();
      return all.filter(c => c.status === 'open' && c.is_published);
    }
  });

  const successRate = successfulPilots.length > 0 
    ? Math.round((successfulPilots.filter(p => p.recommendation === 'scale').length / successfulPilots.length) * 100) 
    : 0;

  return (
    <div className="space-y-12" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-teal-600 p-12 text-white">
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium">
              {t({ en: 'National Municipal Innovation Platform', ar: 'المنصة الوطنية للابتكار البلدي' })}
            </span>
          </div>
          <h1 className="text-6xl font-bold mb-4">
            {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            {t({ 
              en: 'Transforming municipal services through innovation, collaboration, and evidence-based solutions',
              ar: 'تحويل الخدمات البلدية من خلال الابتكار والتعاون والحلول القائمة على الأدلة'
            })}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to={createPageUrl('PublicIdeasBoard')}>
              <Button className="bg-white text-blue-600 hover:bg-white/90" size="lg">
                <Lightbulb className="h-5 w-5 mr-2" />
                {t({ en: 'Explore Challenges', ar: 'استكشف التحديات' })}
              </Button>
            </Link>
            <Link to={createPageUrl('PublicIdeaSubmission')}>
              <Button variant="outline" className="border-white text-white hover:bg-white/20" size="lg">
                {t({ en: 'Share Your Idea', ar: 'شارك فكرتك' })}
              </Button>
            </Link>
            <Link to={createPageUrl('MII')}>
              <Button variant="outline" className="border-white text-white hover:bg-white/20" size="lg">
                <Award className="h-5 w-5 mr-2" />
                {t({ en: 'Innovation Index', ar: 'مؤشر الابتكار' })}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Platform Impact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="text-center bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-8 pb-8">
            <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <div className="text-5xl font-bold text-blue-600 mb-2">{topMunicipalities.length}</div>
            <p className="text-sm text-slate-600 font-medium">
              {t({ en: 'Participating Municipalities', ar: 'البلديات المشاركة' })}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-8 pb-8">
            <TestTube className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <div className="text-5xl font-bold text-green-600 mb-2">{successfulPilots.length}</div>
            <p className="text-sm text-slate-600 font-medium">
              {t({ en: 'Successful Pilots', ar: 'التجارب الناجحة' })}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-8 pb-8">
            <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <div className="text-5xl font-bold text-purple-600 mb-2">{verifiedSolutions.length}</div>
            <p className="text-sm text-slate-600 font-medium">
              {t({ en: 'Validated Solutions', ar: 'الحلول المعتمدة' })}
            </p>
          </CardContent>
        </Card>

        <Card className="text-center bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
          <CardContent className="pt-8 pb-8">
            <TrendingUp className="h-12 w-12 text-amber-600 mx-auto mb-3" />
            <div className="text-5xl font-bold text-amber-600 mb-2">{successRate}%</div>
            <p className="text-sm text-slate-600 font-medium">
              {t({ en: 'Success Rate', ar: 'معدل النجاح' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Innovation Leaders */}
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          {t({ en: 'Innovation Leaders', ar: 'رواد الابتكار' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topMunicipalities.map((muni, idx) => (
            <Link key={muni.id} to={createPageUrl(`MunicipalityProfile?id=${muni.id}`)}>
              <Card className="hover:shadow-2xl transition-all border-2 hover:border-blue-400">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                      'bg-gradient-to-br from-blue-500 to-teal-500'
                    }`}>
                      <span className="text-2xl font-bold text-white">#{idx + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                    </h3>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{muni.mii_score || 0}</div>
                    <p className="text-xs text-slate-500">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</p>
                    <div className="mt-3 text-xs text-slate-600">
                      {muni.active_pilots || 0} {t({ en: 'active pilots', ar: 'تجارب نشطة' })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Open Programs */}
      {openPrograms.length > 0 && (
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t({ en: 'Open Innovation Programs', ar: 'برامج الابتكار المفتوحة' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openPrograms.map((program) => (
              <Card key={program.id} className="hover:shadow-xl transition-all border-2 hover:border-purple-400">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-purple-100 text-purple-700">{program.program_type?.replace(/_/g, ' ')}</Badge>
                    {program.funding_available && (
                      <Badge className="bg-green-600 text-white">
                        {t({ en: 'Funded', ar: 'ممول' })}
                      </Badge>
                    )}
                  </div>
                  {program.image_url && (
                    <img src={program.image_url} alt={program.name_en} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                    {language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    {program.duration_weeks && <span>{program.duration_weeks} {t({ en: 'weeks', ar: 'أسابيع' })}</span>}
                    {program.timeline?.application_close && (
                      <>
                        <span>•</span>
                        <span className="text-red-600">{t({ en: 'Closes:', ar: 'يغلق:' })} {new Date(program.timeline.application_close).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                  <Link to={createPageUrl(`ProgramDetail?id=${program.id}`)}>
                    <Button size="sm" variant="outline" className="w-full">
                      {t({ en: 'Learn More & Apply', ar: 'معرفة المزيد والتقديم' })}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Verified Solutions Marketplace */}
      {verifiedSolutions.length > 0 && (
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t({ en: 'Verified Solutions Marketplace', ar: 'سوق الحلول المعتمدة' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {verifiedSolutions.slice(0, 8).map((solution) => (
              <Link key={solution.id} to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    {solution.image_url && (
                      <img src={solution.image_url} alt={solution.name_en} className="w-full h-32 object-cover rounded-lg mb-3" />
                    )}
                    <Badge className="mb-2 text-xs bg-blue-100 text-blue-700">{solution.maturity_level?.replace(/_/g, ' ')}</Badge>
                    <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2">
                      {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                    </h3>
                    <p className="text-xs text-slate-600 mb-2">{solution.provider_name}</p>
                    {solution.average_rating && (
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-500" />
                        <span className="text-xs font-medium">{solution.average_rating.toFixed(1)}/5</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Published Challenges */}
      {publishedChallenges.length > 0 && (
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t({ en: 'Innovation Challenges', ar: 'تحديات الابتكار' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedChallenges.slice(0, 6).map((challenge) => (
              <Link key={challenge.id} to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                <Card className="hover:shadow-lg transition-all border hover:border-blue-400">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs font-mono">{challenge.code}</Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">{challenge.sector?.replace(/_/g, ' ')}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">
                      {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                      {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                    </p>
                    <div className="text-xs text-slate-500">
                      {challenge.municipality_id?.substring(0, 30)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Success Stories */}
      <div>
        <h2 className="text-4xl font-bold text-slate-900 mb-6">
          {t({ en: 'Innovation Success Stories', ar: 'قصص نجاح الابتكار' })}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successfulPilots.slice(0, 6).map((pilot) => (
            <Card key={pilot.id} className="hover:shadow-xl transition-all border-2 hover:border-green-400">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t({ en: 'Success', ar: 'نجاح' })}
                  </Badge>
                  {pilot.is_flagship && (
                    <Badge className="bg-purple-600 text-white">
                      <Award className="h-3 w-3 mr-1" />
                      {t({ en: 'Flagship', ar: 'رائد' })}
                    </Badge>
                  )}
                </div>
                {pilot.image_url && (
                  <img src={pilot.image_url} alt={pilot.title_en} className="w-full h-40 object-cover rounded-lg mb-3" />
                )}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {language === 'ar' && pilot.title_ar ? pilot.title_ar : pilot.title_en}
                </h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {language === 'ar' && pilot.description_ar ? pilot.description_ar : pilot.description_en}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <span>{pilot.sector?.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span>{pilot.municipality_id?.substring(0, 20)}</span>
                </div>
                <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <Button size="sm" variant="outline" className="w-full">
                    {t({ en: 'Read Success Story', ar: 'اقرأ قصة النجاح' })}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
          <CardContent className="pt-8 pb-8 text-center">
            <Lightbulb className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: 'Share Your Ideas', ar: 'شارك أفكارك' })}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {t({ en: 'Help improve your city by submitting ideas', ar: 'ساعد في تحسين مدينتك بتقديم الأفكار' })}
            </p>
            <Link to={createPageUrl('PublicIdeaSubmission')}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                {t({ en: 'Submit Idea', ar: 'تقديم فكرة' })}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
          <CardContent className="pt-8 pb-8 text-center">
            <Target className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: 'Explore Challenges', ar: 'استكشف التحديات' })}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {t({ en: 'See what municipalities are working on', ar: 'شاهد ما تعمل عليه البلديات' })}
            </p>
            <Link to={createPageUrl('PublicIdeasBoard')}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {t({ en: 'Browse', ar: 'تصفح' })}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-2 border-green-200">
          <CardContent className="pt-8 pb-8 text-center">
            <BarChart3 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {t({ en: 'Innovation Index', ar: 'مؤشر الابتكار' })}
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              {t({ en: 'See how cities compare on innovation', ar: 'شاهد كيف تتنافس المدن في الابتكار' })}
            </p>
            <Link to={createPageUrl('MII')}>
              <Button className="bg-green-600 hover:bg-green-700">
                {t({ en: 'View Rankings', ar: 'عرض الترتيب' })}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Featured Content */}
      {caseStudies.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            {t({ en: 'Featured Case Studies', ar: 'دراسات الحالة المميزة' })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study) => (
              <Card key={study.id} className="hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  {study.image_url && (
                    <img src={study.image_url} alt={study.title_en} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <Badge className="mb-2 text-xs">{study.category}</Badge>
                  <h3 className="font-bold text-slate-900 mb-2">
                    {language === 'ar' && study.title_ar ? study.title_ar : study.title_en}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                    {language === 'ar' && study.summary_ar ? study.summary_ar : study.summary_en}
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    {t({ en: 'Read More', ar: 'اقرأ المزيد' })}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* R&D Opportunities */}
      {(openRDCalls.length > 0 || publishedRDProjects.length > 0) && (
        <div>
          <h2 className="text-4xl font-bold text-slate-900 mb-6">
            {t({ en: 'Research & Development', ar: 'البحث والتطوير' })}
          </h2>
          
          {openRDCalls.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {t({ en: 'Open Research Calls', ar: 'دعوات البحث المفتوحة' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {openRDCalls.slice(0, 3).map(call => (
                  <Card key={call.id} className="hover:shadow-lg transition-all border-2 hover:border-indigo-400">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Microscope className="h-5 w-5 text-indigo-600" />
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">{call.call_type?.replace(/_/g, ' ')}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        {language === 'ar' && call.title_ar ? call.title_ar : call.title_en}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                        {language === 'ar' && call.tagline_ar ? call.tagline_ar : call.tagline_en}
                      </p>
                      {call.total_funding && (
                        <p className="text-sm font-medium text-green-600 mb-3">
                          {t({ en: 'Funding:', ar: 'التمويل:' })} {(call.total_funding / 1000000).toFixed(1)}M SAR
                        </p>
                      )}
                      {call.timeline?.submission_close && (
                        <p className="text-xs text-red-600 mb-4">
                          {t({ en: 'Deadline:', ar: 'الموعد النهائي:' })} {new Date(call.timeline.submission_close).toLocaleDateString()}
                        </p>
                      )}
                      <Link to={createPageUrl(`RDCallDetail?id=${call.id}`)}>
                        <Button size="sm" variant="outline" className="w-full">
                          {t({ en: 'View Call & Apply', ar: 'عرض والتقديم' })}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {publishedRDProjects.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {t({ en: 'Research Outputs & Impact', ar: 'مخرجات البحث والتأثير' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {publishedRDProjects.slice(0, 4).map(project => (
                  <Link key={project.id} to={createPageUrl(`RDProjectDetail?id=${project.id}`)}>
                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <Beaker className="h-6 w-6 text-purple-600" />
                          <Badge variant="outline">TRL {project.trl_current}</Badge>
                        </div>
                        <h4 className="font-bold text-sm line-clamp-2 mb-2">
                          {language === 'ar' && project.title_ar ? project.title_ar : project.title_en}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">{project.institution_en || project.institution}</p>
                        {project.publications?.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <BookOpen className="h-3 w-3" />
                            <span>{project.publications.length} {t({ en: 'publications', ar: 'منشورات' })}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Get Involved CTA */}
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white border-0">
        <CardContent className="py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            {t({ en: 'Join the Innovation Ecosystem', ar: 'انضم لمنظومة الابتكار' })}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t({ 
              en: 'Whether you\'re a municipality, solution provider, researcher, or citizen - there\'s a place for you',
              ar: 'سواء كنت بلدية، مزود حلول، باحث، أو مواطن - هناك مكان لك'
            })}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to={createPageUrl('About')}>
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-white/90">
                {t({ en: 'Learn More', ar: 'اعرف المزيد' })}
              </Button>
            </Link>
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t({ en: 'Contact Us', ar: 'تواصل معنا' })}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(PublicPortal, { requiredPermissions: [] });