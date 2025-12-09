import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, TrendingUp, Award, MapPin, Target, TestTube, Lightbulb, 
  CheckCircle2, Users, Building2, Rocket, BarChart3, Globe, BookOpen,
  MessageSquare, Calendar, Microscope, Beaker, LogIn, UserPlus, ArrowRight,
  ChevronRight, Play, Star, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

function PublicPortal() {
  const { language, isRTL, t, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  // Fetch public data using Supabase
  const { data: successfulPilots = [] } = useQuery({
    queryKey: ['public-successful-pilots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .in('stage', ['completed', 'scaled'])
        .eq('is_published', true)
        .eq('recommendation', 'scale')
        .limit(6);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: publishedChallenges = [] } = useQuery({
    queryKey: ['public-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: verifiedSolutions = [] } = useQuery({
    queryKey: ['public-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solutions')
        .select('*')
        .eq('is_published', true)
        .eq('is_verified', true)
        .in('maturity_level', ['market_ready', 'proven'])
        .limit(8);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: topMunicipalities = [] } = useQuery({
    queryKey: ['top-municipalities-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('is_active', true)
        .order('mii_score', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: openPrograms = [] } = useQuery({
    queryKey: ['public-programs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('is_published', true)
        .eq('status', 'applications_open')
        .limit(3);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: platformStats } = useQuery({
    queryKey: ['public-platform-stats'],
    queryFn: async () => {
      const [
        { count: challengeCount },
        { count: pilotCount },
        { count: solutionCount },
        { count: municipalityCount }
      ] = await Promise.all([
        supabase.from('challenges').select('*', { count: 'exact', head: true }),
        supabase.from('pilots').select('*', { count: 'exact', head: true }),
        supabase.from('solutions').select('*', { count: 'exact', head: true }),
        supabase.from('municipalities').select('*', { count: 'exact', head: true })
      ]);
      return {
        challenges: challengeCount || 0,
        pilots: pilotCount || 0,
        solutions: solutionCount || 0,
        municipalities: municipalityCount || 0
      };
    }
  });

  const stats = platformStats || { challenges: 0, pilots: 0, solutions: 0, municipalities: 0 };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">
                {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/about" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'About', ar: 'عن المنصة' })}
              </Link>
              <Link to="/public-challenges" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'Challenges', ar: 'التحديات' })}
              </Link>
              <Link to="/public-solutions" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'Solutions', ar: 'الحلول' })}
              </Link>
              <Link to="/for-municipalities" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'For Municipalities', ar: 'للبلديات' })}
              </Link>
              <Link to="/for-providers" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'For Providers', ar: 'للمزودين' })}
              </Link>
              <Link to="/for-innovators" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'For Innovators', ar: 'للمبتكرين' })}
              </Link>
              <Link to="/faq" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'FAQ', ar: 'الأسئلة الشائعة' })}
              </Link>
              <Link to="/contact" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                {t({ en: 'Contact', ar: 'تواصل' })}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-slate-600 gap-2"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'العربية' : 'English'}</span>
              </Button>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-slate-600">
                  <LogIn className="h-4 w-4 mr-2" />
                  {t({ en: 'Sign In', ar: 'تسجيل الدخول' })}
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t({ en: 'Get Started', ar: 'ابدأ الآن' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zNHY2aC02VjBoNnptLTYgMzR2Nmg2djZoLTZ2LTZoLTZ2LTZoNnptLTYgMHYtNmg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">
                {t({ en: 'National Municipal Innovation Platform', ar: 'المنصة الوطنية للابتكار البلدي' })}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              {t({ en: 'Transforming Cities', ar: 'تحويل المدن' })}
              <br />
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                {t({ en: 'Through Innovation', ar: 'من خلال الابتكار' })}
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto mb-10">
              {t({ 
                en: 'Connect municipalities with innovative solutions, conduct evidence-based pilots, and scale what works across the Kingdom.',
                ar: 'ربط البلديات بالحلول المبتكرة، وإجراء تجارب قائمة على الأدلة، وتوسيع نطاق ما ينجح في جميع أنحاء المملكة.'
              })}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl px-8">
                  <Rocket className="h-5 w-5 mr-2" />
                  {t({ en: 'Join the Platform', ar: 'انضم للمنصة' })}
                </Button>
              </Link>
              <Link to="/public-solutions">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-8">
                  <Play className="h-5 w-5 mr-2" />
                  {t({ en: 'Explore Solutions', ar: 'استكشف الحلول' })}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: Building2, value: stats.municipalities, label: { en: 'Municipalities', ar: 'البلديات' }, color: 'blue' },
            { icon: Target, value: stats.challenges, label: { en: 'Challenges', ar: 'التحديات' }, color: 'red' },
            { icon: Lightbulb, value: stats.solutions, label: { en: 'Solutions', ar: 'الحلول' }, color: 'amber' },
            { icon: TestTube, value: stats.pilots, label: { en: 'Pilots', ar: 'التجارب' }, color: 'green' },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white shadow-xl border-0">
              <CardContent className="pt-6 pb-6 text-center">
                <stat.icon className={`h-8 w-8 mx-auto mb-3 text-${stat.color}-600`} />
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <p className="text-sm text-slate-500">{t(stat.label)}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* How It Works */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {t({ en: 'How It Works', ar: 'كيف تعمل المنصة' })}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t({ en: 'A systematic approach to municipal innovation', ar: 'نهج منظم للابتكار البلدي' })}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Target, title: { en: 'Identify Challenges', ar: 'تحديد التحديات' }, desc: { en: 'Municipalities document real operational challenges', ar: 'توثق البلديات التحديات التشغيلية الحقيقية' } },
              { step: 2, icon: Lightbulb, title: { en: 'Match Solutions', ar: 'مطابقة الحلول' }, desc: { en: 'AI-powered matching with verified providers', ar: 'مطابقة بالذكاء الاصطناعي مع مزودين معتمدين' } },
              { step: 3, icon: TestTube, title: { en: 'Run Pilots', ar: 'تشغيل التجارب' }, desc: { en: 'Evidence-based testing with clear KPIs', ar: 'اختبار قائم على الأدلة بمؤشرات واضحة' } },
              { step: 4, icon: Rocket, title: { en: 'Scale Success', ar: 'توسيع النجاح' }, desc: { en: 'Roll out proven solutions nationwide', ar: 'نشر الحلول المثبتة على مستوى المملكة' } },
            ].map((item, idx) => (
              <Card key={idx} className="relative group hover:shadow-lg transition-all">
                <CardContent className="pt-8 pb-6">
                  <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </div>
                  <item.icon className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{t(item.title)}</h3>
                  <p className="text-sm text-slate-600">{t(item.desc)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Top Municipalities */}
        {topMunicipalities.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {t({ en: 'Innovation Leaders', ar: 'رواد الابتكار' })}
                </h2>
                <p className="text-slate-600">{t({ en: 'Top performing municipalities by MII score', ar: 'البلديات الأعلى أداءً حسب مؤشر الابتكار' })}</p>
              </div>
              <Link to="/auth">
                <Button variant="outline">
                  {t({ en: 'View All Rankings', ar: 'عرض جميع الترتيبات' })}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topMunicipalities.map((muni, idx) => (
                <Card key={muni.id} className="text-center hover:shadow-lg transition-all group cursor-pointer">
                  <CardContent className="pt-6 pb-6">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                      idx === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                      'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-xl font-bold text-white">#{idx + 1}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-sm">
                      {language === 'ar' && muni.name_ar ? muni.name_ar : muni.name_en}
                    </h3>
                    <div className="text-2xl font-bold text-blue-600 mb-1">{muni.mii_score || 0}</div>
                    <p className="text-xs text-slate-500">{t({ en: 'MII Score', ar: 'مؤشر الابتكار' })}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Open Programs */}
        {openPrograms.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {t({ en: 'Open Programs', ar: 'البرامج المفتوحة' })}
                </h2>
                <p className="text-slate-600">{t({ en: 'Apply now for funding and support', ar: 'قدم الآن للتمويل والدعم' })}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {openPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-xl transition-all border-2 hover:border-purple-400 group">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className="bg-purple-100 text-purple-700">{program.program_type?.replace(/_/g, ' ')}</Badge>
                      {program.funding_available && (
                        <Badge className="bg-green-100 text-green-700">
                          {t({ en: 'Funded', ar: 'ممول' })}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {language === 'ar' && program.name_ar ? program.name_ar : program.name_en}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {language === 'ar' && program.tagline_ar ? program.tagline_ar : program.tagline_en}
                    </p>
                    <Link to="/auth">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        {t({ en: 'Sign Up to Apply', ar: 'سجل للتقديم' })}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Featured Solutions */}
        {verifiedSolutions.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {t({ en: 'Verified Solutions', ar: 'الحلول المعتمدة' })}
                </h2>
                <p className="text-slate-600">{t({ en: 'Market-ready solutions from verified providers', ar: 'حلول جاهزة للسوق من مزودين معتمدين' })}</p>
              </div>
              <Link to="/public-solutions">
                <Button variant="outline">
                  {t({ en: 'Browse Marketplace', ar: 'تصفح السوق' })}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {verifiedSolutions.slice(0, 4).map((solution) => (
                <Card key={solution.id} className="hover:shadow-lg transition-all group">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <Badge variant="outline" className="text-xs">
                        {solution.maturity_level?.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{solution.provider_name}</p>
                    {solution.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-medium">{solution.average_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* CTA Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 hover:shadow-lg transition-all">
            <CardContent className="pt-8 pb-8 text-center">
              <Building2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t({ en: 'For Municipalities', ar: 'للبلديات' })}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {t({ en: 'Document challenges, find solutions, run pilots', ar: 'وثق التحديات، اعثر على الحلول، شغل التجارب' })}
              </p>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {t({ en: 'Register Municipality', ar: 'سجل البلدية' })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 hover:shadow-lg transition-all">
            <CardContent className="pt-8 pb-8 text-center">
              <Rocket className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t({ en: 'For Startups', ar: 'للشركات الناشئة' })}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {t({ en: 'List solutions, access opportunities, grow business', ar: 'اعرض حلولك، احصل على الفرص، نمي أعمالك' })}
              </p>
              <Link to="/auth">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  {t({ en: 'Join as Provider', ar: 'انضم كمزود' })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-pink-50 border-2 border-indigo-200 hover:shadow-lg transition-all">
            <CardContent className="pt-8 pb-8 text-center">
              <Lightbulb className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t({ en: 'For Innovators', ar: 'للمبتكرين' })}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {t({ en: 'Submit proposals, access funding, pilot solutions', ar: 'قدم مقترحات، احصل على تمويل، جرب الحلول' })}
              </p>
              <Link to="/for-innovators">
                <Button className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700">
                  {t({ en: 'Learn More', ar: 'اعرف المزيد' })}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-lg transition-all">
            <CardContent className="pt-8 pb-8 text-center">
              <Microscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {t({ en: 'For Researchers', ar: 'للباحثين' })}
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {t({ en: 'Access data, apply for R&D calls, collaborate', ar: 'احصل على البيانات، قدم لدعوات البحث، تعاون' })}
              </p>
              <Link to="/auth">
                <Button className="bg-green-600 hover:bg-green-700">
                  {t({ en: 'Join as Researcher', ar: 'انضم كباحث' })}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Citizen Participation */}
        <section>
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <CardContent className="py-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <Badge className="bg-amber-100 text-amber-700 mb-4">
                    {t({ en: 'Citizen Participation', ar: 'مشاركة المواطنين' })}
                  </Badge>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {t({ en: 'Your Ideas Matter', ar: 'أفكارك مهمة' })}
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-xl">
                    {t({ 
                      en: 'Share ideas to improve your city. Vote on community proposals. Help shape the future of municipal services.',
                      ar: 'شارك أفكارك لتحسين مدينتك. صوت على مقترحات المجتمع. ساعد في تشكيل مستقبل الخدمات البلدية.'
                    })}
                  </p>
                  <Link to="/auth">
                    <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                      <Lightbulb className="h-5 w-5 mr-2" />
                      {t({ en: 'Submit Your Idea', ar: 'قدم فكرتك' })}
                    </Button>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Users className="h-24 w-24 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            {t({ en: 'Ready to Transform Your City?', ar: 'مستعد لتحويل مدينتك؟' })}
          </h2>
          <p className="text-xl text-white/90 mb-10">
            {t({ 
              en: 'Join hundreds of municipalities, startups, and researchers building the future of Saudi cities.',
              ar: 'انضم لمئات البلديات والشركات الناشئة والباحثين الذين يبنون مستقبل المدن السعودية.'
            })}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-xl px-10">
                {t({ en: 'Create Free Account', ar: 'أنشئ حساب مجاني' })}
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20 px-10">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t({ en: 'Talk to Our Team', ar: 'تحدث مع فريقنا' })}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                {t({ en: 'Saudi Innovates', ar: 'الابتكار السعودي' })}
              </span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link to="/about" className="hover:text-white transition-colors">
                {t({ en: 'About', ar: 'عن المنصة' })}
              </Link>
              <Link to="/contact" className="hover:text-white transition-colors">
                {t({ en: 'Contact', ar: 'تواصل' })}
              </Link>
              <Link to="/faq" className="hover:text-white transition-colors">
                {t({ en: 'FAQ', ar: 'الأسئلة الشائعة' })}
              </Link>
              <Link to="/privacy" className="hover:text-white transition-colors">
                {t({ en: 'Privacy', ar: 'الخصوصية' })}
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                {t({ en: 'Terms', ar: 'الشروط' })}
              </Link>
            </div>
            
            <p className="text-sm text-slate-500">
              © 2024 {t({ en: 'Ministry of Municipal and Rural Affairs', ar: 'وزارة الشؤون البلدية والقروية' })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicPortal;