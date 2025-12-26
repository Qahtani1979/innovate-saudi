import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from '@/components/LanguageContext';
import { Users, Search, Bell, Mail, BellOff, MailX, RefreshCw, Loader2, Edit } from 'lucide-react';
import { useAllNotificationPreferences } from '@/hooks/useAllNotificationPreferences';

export default function UserPreferencesOverview() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedPrefs, setEditedPrefs] = useState(null);

  const {
    preferences,
    stats,
    isLoading,
    isUpdating,
    refetch,
    updatePreferences
  } = useAllNotificationPreferences(searchTerm);

  const handleEditUser = (pref) => {
    setSelectedUser(pref);
    setEditedPrefs({
      email_notifications: pref.email_notifications !== false,
      in_app_notifications: pref.in_app_notifications !== false,
      push_notifications: pref.push_notifications === true,
      email_categories: pref.email_categories || {},
      frequency: pref.frequency || 'immediate',
    });
  };

  const handleSavePrefs = () => {
    if (selectedUser && editedPrefs) {
      updatePreferences({
        userId: selectedUser.user_id,
        updates: editedPrefs
      }, {
        onSuccess: () => {
          setSelectedUser(null);
          setEditedPrefs(null);
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-100">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total Users', ar: 'إجمالي المستخدمين' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-100">
          <CardContent className="p-4 text-center">
            <Mail className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{stats?.emailEnabled || 0}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Email Enabled', ar: 'البريد مفعل' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-100">
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{stats?.inAppEnabled || 0}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'In-App Enabled', ar: 'الإشعارات مفعلة' })}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-100">
          <CardContent className="p-4 text-center">
            <Bell className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{stats?.pushEnabled || 0}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Push Enabled', ar: 'الدفع مفعل' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t({ en: 'Search by email...', ar: 'بحث بالبريد...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t({ en: 'Refresh', ar: 'تحديث' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t({ en: 'User Notification Preferences', ar: 'تفضيلات إشعارات المستخدمين' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : preferences.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{t({ en: 'No user preferences found', ar: 'لا توجد تفضيلات مستخدمين' })}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {preferences.map((pref) => (
                <div
                  key={pref.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {/* @ts-ignore */}
                      {pref.user_profiles?.avatar_url ? (
                        /* @ts-ignore */
                        <img src={pref.user_profiles.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <Users className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* @ts-ignore */}
                      <p className="font-medium truncate">{pref.user_profiles?.full_name || pref.user_email}</p>
                      <p className="text-sm text-muted-foreground truncate">{pref.user_email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pref.email_notifications !== false ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 gap-1">
                          <Mail className="h-3 w-3" />
                          {t({ en: 'Email', ar: 'بريد' })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 gap-1">
                          <MailX className="h-3 w-3" />
                          {t({ en: 'No Email', ar: 'بدون بريد' })}
                        </Badge>
                      )}
                      {pref.in_app_notifications !== false ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 gap-1">
                          <Bell className="h-3 w-3" />
                          {t({ en: 'In-App', ar: 'داخل التطبيق' })}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-700 gap-1">
                          <BellOff className="h-3 w-3" />
                          {t({ en: 'No In-App', ar: 'بدون إشعارات' })}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(pref)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => { setSelectedUser(null); setEditedPrefs(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {t({ en: 'Edit Preferences', ar: 'تعديل التفضيلات' })}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && editedPrefs && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                {/* @ts-ignore */}
                <p className="font-medium">{selectedUser.user_profiles?.full_name || selectedUser.user_email}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.user_email}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{t({ en: 'Email Notifications', ar: 'إشعارات البريد' })}</span>
                  </div>
                  {/* @ts-ignore */}
                  <Switch
                    checked={editedPrefs.email_notifications}
                    onCheckedChange={(v) => setEditedPrefs(p => ({ ...p, email_notifications: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>{t({ en: 'In-App Notifications', ar: 'الإشعارات داخل التطبيق' })}</span>
                  </div>
                  {/* @ts-ignore */}
                  <Switch
                    checked={editedPrefs.in_app_notifications}
                    onCheckedChange={(v) => setEditedPrefs(p => ({ ...p, in_app_notifications: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>{t({ en: 'Push Notifications', ar: 'إشعارات الدفع' })}</span>
                  </div>
                  {/* @ts-ignore */}
                  <Switch
                    checked={editedPrefs.push_notifications}
                    onCheckedChange={(v) => setEditedPrefs(p => ({ ...p, push_notifications: v }))}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedUser(null); setEditedPrefs(null); }}>
              {t({ en: 'Cancel', ar: 'إلغاء' })}
            </Button>
            <Button onClick={handleSavePrefs} disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
