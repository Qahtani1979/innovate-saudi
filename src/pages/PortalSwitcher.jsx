import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Building2, Rocket, Microscope, Shield, Globe, Target, Users, ArrowRight } from 'lucide-react';

export default function PortalSwitcher() {
  const { language, isRTL, t } = useLanguage();

  const portals = [
    {
      name: { en: 'Executive Dashboard', ar: 'لوحة التحكم التنفيذية' },
      description: { en: 'Strategic overview and decision support', ar: 'نظرة استراتيجية عامة ودعم القرار' },
      page: 'ExecutiveDashboard',
      icon: Target,
      color: 'from-purple-600 to-pink-600'
    },
    {
      name: { en: 'Admin Portal', ar: 'بوابة الإدارة' },
      description: { en: 'Platform administration and configuration', ar: 'إدارة المنصة والإعدادات' },
      page: 'AdminPortal',
      icon: Shield,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      name: { en: 'Municipality Hub', ar: 'مركز البلدية' },
      description: { en: 'Manage challenges and pilots', ar: 'إدارة التحديات والتجارب' },
      page: 'MunicipalityDashboard',
      icon: Building2,
      color: 'from-green-600 to-emerald-600'
    },
    {
      name: { en: 'Startup Portal', ar: 'بوابة الشركات الناشئة' },
      description: { en: 'Find opportunities and submit solutions', ar: 'ابحث عن الفرص وقدم الحلول' },
      page: 'StartupDashboard',
      icon: Rocket,
      color: 'from-orange-600 to-red-600'
    },
    {
      name: { en: 'Academia & Research', ar: 'الأكاديميين والباحثين' },
      description: { en: 'R&D projects and research calls', ar: 'مشاريع البحث والدعوات البحثية' },
      page: 'AcademiaDashboard',
      icon: Microscope,
      color: 'from-teal-600 to-cyan-600'
    },
    {
      name: { en: 'Public Portal', ar: 'البوابة العامة' },
      description: { en: 'Explore success stories and initiatives', ar: 'استكشف قصص النجاح والمبادرات' },
      page: 'PublicPortal',
      icon: Globe,
      color: 'from-slate-600 to-slate-800'
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          {t({ en: 'Portal Switcher', ar: 'محول البوابات' })}
        </h1>
        <p className="text-lg text-slate-600">
          {t({ en: 'Access different views based on your role', ar: 'الوصول إلى طرق عرض مختلفة حسب دورك' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portals.map((portal, idx) => {
          const Icon = portal.icon;
          return (
            <Link key={idx} to={createPageUrl(portal.page)}>
              <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {t(portal.name)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">
                    {t(portal.description)}
                  </p>
                  <Button variant="outline" className="w-full group-hover:border-blue-600 group-hover:text-blue-600">
                    {t({ en: 'Enter Portal', ar: 'دخول البوابة' })}
                    <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}