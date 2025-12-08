import React from 'react';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Users, Calendar, FileText } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function GovernanceCommitteeManager() {
  const { language, isRTL, t } = useLanguage();

  const committees = [
    {
      id: 1,
      name: { en: 'Innovation Board', ar: 'مجلس الابتكار' },
      type: 'strategic',
      members: 15,
      next_meeting: '2025-02-15',
      recent_decisions: 5
    },
    {
      id: 2,
      name: { en: 'Budget Committee', ar: 'لجنة الميزانية' },
      type: 'financial',
      members: 8,
      next_meeting: '2025-02-10',
      recent_decisions: 3
    }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            {t({ en: 'Governance & Committee Manager', ar: 'مدير الحوكمة واللجان' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Manage committees, meetings, and decisions', ar: 'إدارة اللجان والاجتماعات والقرارات' })}
          </p>
        </div>
        <Button className="bg-blue-600">
          {t({ en: 'Create Committee', ar: 'إنشاء لجنة' })}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{committees.length}</p>
            <p className="text-sm text-slate-600">{t({ en: 'Active Committees', ar: 'لجان نشطة' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">
              {committees.reduce((sum, c) => sum + c.members, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Total Members', ar: 'إجمالي الأعضاء' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6 text-center">
            <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">
              {committees.reduce((sum, c) => sum + c.recent_decisions, 0)}
            </p>
            <p className="text-sm text-slate-600">{t({ en: 'Recent Decisions', ar: 'قرارات حديثة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Committees */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Committees', ar: 'اللجان' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {committees.map(committee => (
            <div key={committee.id} className="p-4 border-2 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{committee.name[language]}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span><Users className="h-4 w-4 inline mr-1" />{committee.members} {t({ en: 'members', ar: 'عضو' })}</span>
                    <span><Calendar className="h-4 w-4 inline mr-1" />{committee.next_meeting}</span>
                    <span><FileText className="h-4 w-4 inline mr-1" />{committee.recent_decisions} {t({ en: 'decisions', ar: 'قرار' })}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {t({ en: 'Manage', ar: 'إدارة' })}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(GovernanceCommitteeManager, { requiredPermissions: [] });