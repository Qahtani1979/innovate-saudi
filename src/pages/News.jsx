import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Megaphone, Calendar, Award, Rocket, FileText, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function News() {
  const { language, isRTL, t } = useLanguage();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-news'],
    queryFn: () => base44.entities.Pilot.list()
  });

  const { data: rdProjects = [] } = useQuery({
    queryKey: ['rd-projects-news'],
    queryFn: () => base44.entities.RDProject.list()
  });

  const { data: programs = [] } = useQuery({
    queryKey: ['programs-news'],
    queryFn: () => base44.entities.Program.list()
  });

  const newsItems = [
    ...pilots.filter(p => p.stage === 'scaled' || p.stage === 'completed').slice(0, 3).map(p => ({
      type: 'pilot_success',
      icon: Award,
      title: { 
        en: `Pilot Success: ${p.title_en}`, 
        ar: `نجاح تجربة: ${p.title_ar || p.title_en}` 
      },
      desc: { 
        en: `Successfully scaled in ${p.municipality_id}`, 
        ar: `تم توسيعها بنجاح في ${p.municipality_id}` 
      },
      date: p.scaled_date || p.updated_date,
      color: 'green'
    })),
    ...programs.filter(p => p.status === 'active').slice(0, 2).map(p => ({
      type: 'program',
      icon: Rocket,
      title: { 
        en: `Program Launch: ${p.name_en}`, 
        ar: `إطلاق برنامج: ${p.name_ar || p.name_en}` 
      },
      desc: { 
        en: `Now accepting applications`, 
        ar: 'يقبل الطلبات الآن' 
      },
      date: p.timeline?.announcement_date || p.created_date,
      color: 'blue'
    })),
    ...rdProjects.filter(p => p.status === 'active').slice(0, 2).map(p => ({
      type: 'rd',
      icon: FileText,
      title: { 
        en: `R&D Milestone: ${p.title_en}`, 
        ar: `إنجاز بحثي: ${p.title_ar || p.title_en}` 
      },
      desc: { 
        en: `Reached TRL ${p.trl_current}`, 
        ar: `وصل إلى TRL ${p.trl_current}` 
      },
      date: p.updated_date,
      color: 'purple'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const announcements = [
    {
      title: { en: 'New MII Rankings Released', ar: 'تصنيفات MII الجديدة' },
      date: '2025-01-15',
      type: 'announcement'
    },
    {
      title: { en: 'Q2 Innovation Forum Registration Open', ar: 'التسجيل مفتوح لمنتدى الابتكار Q2' },
      date: '2025-01-10',
      type: 'event'
    },
    {
      title: { en: 'Platform 2.0 Features Launched', ar: 'إطلاق ميزات المنصة 2.0' },
      date: '2025-01-05',
      type: 'platform'
    }
  ];

  const colorClasses = {
    green: 'from-green-50 to-white border-green-200',
    blue: 'from-blue-50 to-white border-blue-200',
    purple: 'from-purple-50 to-white border-purple-200',
    amber: 'from-amber-50 to-white border-amber-200'
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="h-8 w-8" />
            <h1 className="text-4xl font-bold">
              {t({ en: 'News & Updates', ar: 'الأخبار والتحديثات' })}
            </h1>
          </div>
          <p className="text-xl opacity-90">
            {t({ en: 'Latest innovations, milestones, and announcements', ar: 'آخر الابتكارات والإنجازات والإعلانات' })}
          </p>
        </div>
      </div>

      {/* Featured Announcements */}
      <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <Megaphone className="h-5 w-5" />
            {t({ en: 'Platform Announcements', ar: 'إعلانات المنصة' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.map((ann, i) => (
              <div key={i} className="p-4 bg-white rounded-lg border hover:border-amber-300 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {ann.title[language]}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(ann.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  </div>
                  <Badge variant="outline">{ann.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest News */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            {t({ en: 'Latest Updates', ar: 'آخر التحديثات' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {newsItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`p-6 rounded-xl border-2 bg-gradient-to-br ${colorClasses[item.color]}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-${item.color}-100`}>
                      <Icon className={`h-6 w-6 text-${item.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-slate-900 mb-2">
                        {item.title[language]}
                      </h3>
                      <p className="text-slate-700 mb-3">
                        {item.desc[language]}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subscribe CTA */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6 text-center">
          <Megaphone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {t({ en: 'Stay Updated', ar: 'ابق على اطلاع' })}
          </h3>
          <p className="text-slate-600 mb-4">
            {t({ en: 'Get the latest news and updates delivered to your inbox', ar: 'احصل على آخر الأخبار والتحديثات في بريدك الإلكتروني' })}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(News, { requiredPermissions: [] });