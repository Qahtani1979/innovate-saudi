import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../LanguageContext';
import { Users, Calendar, FileText, MessageSquare, TrendingUp } from 'lucide-react';

export default function TeamWorkspace({ team }) {
  const { language, isRTL, t } = useLanguage();

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{team?.name}</h2>
              <p className="text-slate-600 mt-1">{team?.description}</p>
            </div>
            <Badge className="bg-purple-600 text-white">
              {team?.member_count || 0} {t({ en: 'members', ar: 'أعضاء' })}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-xs">{t({ en: 'Schedule', ar: 'الجدول' })}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          <span className="text-xs">{t({ en: 'Documents', ar: 'المستندات' })}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span className="text-xs">{t({ en: 'Discussion', ar: 'النقاش' })}</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          <span className="text-xs">{t({ en: 'Analytics', ar: 'التحليلات' })}</span>
        </Button>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Team Activity', ar: 'نشاط الفريق' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm font-medium">New pilot created by Sarah</p>
              <p className="text-xs text-slate-600">2 hours ago</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-sm font-medium">Challenge approved: Drainage System</p>
              <p className="text-xs text-slate-600">5 hours ago</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm font-medium">3 new members joined</p>
              <p className="text-xs text-slate-600">1 day ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-blue-600">12</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Active Projects', ar: 'مشاريع نشطة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-green-600">8</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-purple-600">94%</p>
            <p className="text-xs text-slate-600 mt-1">{t({ en: 'Success Rate', ar: 'نسبة النجاح' })}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}