import { usePlatformInsights } from '@/hooks/usePlatformInsights';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import {
  Megaphone, Bell, Sparkles,
  AlertCircle, X
} from 'lucide-react';
import { format } from 'date-fns';
import ProtectedPage from '../components/permissions/ProtectedPage';

function WhatsNewHub() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { announcements, markAsRead } = usePlatformInsights();

  const typeIcons = {
    trend: Sparkles,
    risk: AlertCircle,
    opportunity: Megaphone,
    update: Bell,
    feature: Sparkles
  };

  const typeColors = {
    trend: 'bg-blue-100 text-blue-800 border-blue-300',
    risk: 'bg-red-100 text-red-800 border-red-300',
    opportunity: 'bg-green-100 text-green-800 border-green-300',
    update: 'bg-purple-100 text-purple-800 border-purple-300',
    feature: 'bg-amber-100 text-amber-800 border-amber-300'
  };

  const unreadCount = announcements.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-purple-600" />
            {t({ en: "What's New", ar: 'ما الجديد' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Platform updates, new features, and important announcements', ar: 'تحديثات المنصة والميزات الجديدة والإعلانات المهمة' })}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
            {unreadCount} {t({ en: 'new', ar: 'جديد' })}
          </Badge>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <Badge className="bg-blue-50 text-blue-700 px-4 py-2 cursor-pointer hover:bg-blue-100">
          {t({ en: 'All Updates', ar: 'جميع التحديثات' })}
        </Badge>
        <Badge className="bg-purple-50 text-purple-700 px-4 py-2 cursor-pointer hover:bg-purple-100">
          {t({ en: 'New Features', ar: 'ميزات جديدة' })}
        </Badge>
        <Badge className="bg-green-50 text-green-700 px-4 py-2 cursor-pointer hover:bg-green-100">
          {t({ en: 'Opportunities', ar: 'فرص' })}
        </Badge>
        <Badge className="bg-red-50 text-red-700 px-4 py-2 cursor-pointer hover:bg-red-100">
          {t({ en: 'Alerts', ar: 'تنبيهات' })}
        </Badge>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map(announcement => {
          const Icon = typeIcons[announcement.type] || Bell;
          const colorClass = typeColors[announcement.type] || typeColors.update;

          return (
            <Card key={announcement.id} className={`border-2 ${colorClass.replace('bg-', 'border-').split(' ')[0].replace('100', '200')}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">
                          {announcement.title_en || announcement.title_ar}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(announcement.created_date), 'MMM d, yyyy')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {announcement.description_en || announcement.description_ar}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead.mutate(announcement.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {announcement.data_points && (
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(announcement.data_points).map(([key, value], i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium text-slate-700">{key}:</span>{' '}
                        <span className="text-slate-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {announcements.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">
              {t({ en: 'No announcements at this time', ar: 'لا إعلانات في الوقت الحالي' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(WhatsNewHub, { requiredPermissions: [] });
