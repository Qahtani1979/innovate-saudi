import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Eye, Bell, BellOff, TrendingUp, AlertCircle } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { useAuth } from '@/lib/AuthContext';
import { useUserFollows } from '@/hooks/useUserFollows';

function MyFollowing() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const { useFollowing } = useUserFollows(user?.email);
  const { data: following = [], isLoading } = useFollowing();

  const byEntityType = following.reduce((acc, f) => {
    const type = f.entity_type || 'other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const withNotifications = following.filter(f => f.notifications_enabled).length;

  const stats = {
    total: following.length,
    challenges: byEntityType.challenge || 0,
    pilots: byEntityType.pilot || 0,
    programs: byEntityType.program || 0,
    with_notifications: withNotifications
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t({ en: 'My Following', ar: 'متابعاتي' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Entities you are following for updates', ar: 'الكيانات التي تتابعها للحصول على تحديثات' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Eye className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Total Following', ar: 'إجمالي المتابعات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{stats.challenges}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Challenges', ar: 'التحديات' })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-600">{stats.pilots}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Pilots', ar: 'التجارب' })}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6 text-center">
            <Bell className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.with_notifications}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With Notifications', ar: 'مع الإشعارات' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Following List', ar: 'قائمة المتابعات' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {following.map(follow => (
              <div key={follow.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{follow.entity_type}</Badge>
                      <span className="text-sm text-slate-600">
                        {t({ en: 'ID:', ar: 'الرقم:' })} {follow.entity_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {t({ en: 'Following since:', ar: 'متابع منذ:' })} {new Date(follow.followed_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {follow.notifications_enabled ? (
                      <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Bell className="h-3 w-3" />
                        {t({ en: 'Notifications On', ar: 'الإشعارات مفعلة' })}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <BellOff className="h-3 w-3" />
                        {t({ en: 'Notifications Off', ar: 'الإشعارات معطلة' })}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {following.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                {t({ en: 'You are not following any entities yet', ar: 'لا تتابع أي كيانات بعد' })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(MyFollowing, { requiredPermissions: [] });
