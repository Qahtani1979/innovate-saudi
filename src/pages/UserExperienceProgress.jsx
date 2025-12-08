import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';

export default function UserExperienceProgress() {
  const { t, isRTL } = useLanguage();

  const improvements = [
    {
      category: 'Bug Fixes',
      items: [
        { name: 'Fixed missing language variable in OnboardingWizard', status: 'completed', priority: 'critical' },
        { name: 'Fixed missing language variable in OnboardingChecklist', status: 'completed', priority: 'critical' },
        { name: 'Fixed hardcoded completion status in checklist', status: 'completed', priority: 'high' },
      ]
    },
    {
      category: 'User Directory & Search',
      items: [
        { name: 'User Directory page with advanced search', status: 'in_progress', priority: 'high' },
        { name: 'Skill-based user filtering', status: 'in_progress', priority: 'high' },
        { name: 'Expert finder functionality', status: 'in_progress', priority: 'medium' },
      ]
    },
    {
      category: 'Gamification & Recognition',
      items: [
        { name: 'Achievement system', status: 'pending', priority: 'medium' },
        { name: 'User badges', status: 'pending', priority: 'medium' },
        { name: 'Contribution leaderboard', status: 'pending', priority: 'low' },
        { name: 'Activity points system', status: 'pending', priority: 'medium' },
      ]
    },
    {
      category: 'Personalized Dashboard',
      items: [
        { name: 'Role-based widget configuration', status: 'pending', priority: 'high' },
        { name: 'AI-curated daily summary', status: 'pending', priority: 'high' },
        { name: 'Priority task recommendations', status: 'pending', priority: 'medium' },
      ]
    },
    {
      category: 'Smart Notifications',
      items: [
        { name: 'AI-filtered notification system', status: 'pending', priority: 'high' },
        { name: 'Notification preference management', status: 'pending', priority: 'medium' },
        { name: 'Digest options (daily/weekly)', status: 'pending', priority: 'low' },
      ]
    },
    {
      category: 'Delegation & Workflow',
      items: [
        { name: 'Delegation management system', status: 'pending', priority: 'medium' },
        { name: 'Out-of-office auto-responder', status: 'pending', priority: 'low' },
        { name: 'Approval chain configuration', status: 'pending', priority: 'medium' },
      ]
    },
    {
      category: 'User Profile Enhancements',
      items: [
        { name: 'Profile field validation', status: 'pending', priority: 'high' },
        { name: 'Profile completeness indicator', status: 'pending', priority: 'medium' },
        { name: 'Public/private profile sections', status: 'pending', priority: 'low' },
      ]
    }
  ];

  const allItems = improvements.flatMap(cat => cat.items);
  const completed = allItems.filter(i => i.status === 'completed').length;
  const inProgress = allItems.filter(i => i.status === 'in_progress').length;
  const pending = allItems.filter(i => i.status === 'pending').length;
  const totalProgress = (completed / allItems.length) * 100;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default: return <Circle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-600 text-white',
      medium: 'bg-yellow-600 text-white',
      low: 'bg-slate-600 text-white'
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 p-8 text-white">
        <h1 className="text-5xl font-bold mb-2">
          {t({ en: '🚀 User Experience Improvements Progress', ar: '🚀 تقدم تحسينات تجربة المستخدم' })}
        </h1>
        <p className="text-xl text-white/90">
          {t({ en: 'Tracking all user-related enhancements and fixes', ar: 'تتبع جميع التحسينات والإصلاحات المتعلقة بالمستخدمين' })}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle>{t({ en: 'Overall Progress', ar: 'التقدم الإجمالي' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-purple-600">{Math.round(totalProgress)}%</span>
                <span className="text-sm text-slate-600">
                  {completed} / {allItems.length} {t({ en: 'completed', ar: 'مكتمل' })}
                </span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-white">
                <CardContent className="pt-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{completed}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتمل' })}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-white">
                <CardContent className="pt-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'In Progress', ar: 'قيد التنفيذ' })}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="pt-4 text-center">
                  <Circle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-600">{pending}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Pending', ar: 'معلق' })}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Progress by Category */}
      {improvements.map((category, idx) => {
        const catCompleted = category.items.filter(i => i.status === 'completed').length;
        const catProgress = (catCompleted / category.items.length) * 100;

        return (
          <Card key={idx}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{category.category}</CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {catCompleted}/{category.items.length}
                  </span>
                  <Progress value={catProgress} className="w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.status === 'completed' ? 'bg-green-50 border-green-200' :
                      item.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(item.status)}
                      <span className={`text-sm ${item.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {item.name}
                      </span>
                    </div>
                    {getPriorityBadge(item.priority)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}