

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from './LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Building2, Rocket, Microscope, Target, AlertCircle, TestTube, FileText, Lightbulb } from 'lucide-react';

import { useUserProfile } from '@/hooks/useUserProfiles';

export default function PersonaDashboardWidget({ user }) {
  const { language, isRTL, t } = useLanguage();

  const { data: userProfile } = useUserProfile(user?.email);

  const isMunicipality = userProfile?.organization_type === 'municipality';
  const isStartup = userProfile?.organization_type === 'startup';
  const isResearcher = userProfile?.organization_type === 'university';

  if (!userProfile?.organization_type) return null;

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          {isMunicipality && <Building2 className="h-8 w-8 text-blue-600" />}
          {isStartup && <Rocket className="h-8 w-8 text-purple-600" />}
          {isResearcher && <Microscope className="h-8 w-8 text-green-600" />}
          <div>
            <h3 className="font-bold text-slate-900">
              {isMunicipality && t({ en: 'Municipality Quick View', ar: 'عرض سريع للبلدية' })}
              {isStartup && t({ en: 'Startup Dashboard', ar: 'لوحة الشركة' })}
              {isResearcher && t({ en: 'Researcher Dashboard', ar: 'لوحة الباحث' })}
            </h3>
            <Badge variant="outline">{userProfile.organization_type}</Badge>
          </div>
        </div>

        <div className="space-y-3">
          {isMunicipality && (
            <>
              <Link to={createPageUrl('MyChallenges')}>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {t({ en: 'My Challenges', ar: 'تحدياتي' })}
                </Button>
              </Link>
              <Link to={createPageUrl('MyPilots')}>
                <Button variant="outline" className="w-full justify-start">
                  <TestTube className="h-4 w-4 mr-2" />
                  {t({ en: 'My Pilots', ar: 'تجاربي' })}
                </Button>
              </Link>
              <Link to={createPageUrl('MII')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'My MII Score', ar: 'نقاط المؤشر' })}
                </Button>
              </Link>
            </>
          )}

          {isStartup && (
            <>
              <Link to={createPageUrl('OpportunityFeed')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'Opportunities', ar: 'الفرص' })}
                </Button>
              </Link>
              <Link to={createPageUrl('MyApplications')}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  {t({ en: 'My Applications', ar: 'طلباتي' })}
                </Button>
              </Link>
              <Link to={createPageUrl('Solutions')}>
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {t({ en: 'My Solutions', ar: 'حلولي' })}
                </Button>
              </Link>
            </>
          )}

          {isResearcher && (
            <>
              <Link to={createPageUrl('RDCalls')}>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  {t({ en: 'Open R&D Calls', ar: 'دعوات البحث المفتوحة' })}
                </Button>
              </Link>
              <Link to={createPageUrl('MyApplications')}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  {t({ en: 'My Proposals', ar: 'مقترحاتي' })}
                </Button>
              </Link>
              <Link to={createPageUrl('LivingLabs')}>
                <Button variant="outline" className="w-full justify-start">
                  <Microscope className="h-4 w-4 mr-2" />
                  {t({ en: 'Living Labs', ar: 'المختبرات الحية' })}
                </Button>
              </Link>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}