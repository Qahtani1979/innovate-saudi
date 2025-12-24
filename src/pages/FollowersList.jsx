import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Users, Heart, TrendingUp } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';

function FollowersList() {
  const { t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const entityType = urlParams.get('entity_type');
  const entityId = urlParams.get('entity_id');

  const { data: followers = [], isLoading } = useQuery({
    queryKey: ['followers', entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('followed_entity_type', entityType)
        .eq('followed_entity_id', entityId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!entityType && !!entityId
  });

  const stats = {
    total: followers.length,
    with_notifications: followers.filter(f => f.notifications_enabled).length
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
          {t({ en: 'Followers', ar: 'المتابعون' })}
        </h1>
        <p className="text-slate-600 mt-1">
          {t({ en: 'Users following this entity', ar: 'المستخدمون الذين يتابعون هذا الكيان' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Heart className="h-10 w-10 text-pink-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-pink-600">{stats.total}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Followers', ar: 'المتابعون' })}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stats.with_notifications}</p>
            <p className="text-xs text-slate-600">{t({ en: 'With Notifications', ar: 'مع الإشعارات' })}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Followers List', ar: 'قائمة المتابعين' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {followers.map(follower => (
              <div key={follower.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{follower.follower_email}</p>
                    <p className="text-xs text-slate-500">
                      {t({ en: 'Following since', ar: 'يتابع منذ' })}{' '}
                      {follower.created_at && new Date(follower.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {follower.notifications_enabled && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {t({ en: 'Notifications ON', ar: 'الإشعارات مفعلة' })}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProtectedPage(FollowersList, { requiredPermissions: [] });