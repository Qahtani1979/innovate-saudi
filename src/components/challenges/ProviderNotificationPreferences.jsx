import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useSectors } from '@/hooks/useSectors';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export default function ProviderNotificationPreferences() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();

  const { data: sectors = [] } = useSectors();

  const {
    preferences,
    isLoading: prefsLoading,
    savePreferences
  } = useNotificationPreferences(user?.email);

  // Use bracket notation to bypass TS strict check if types are outdated
  const [selectedSectors, setSelectedSectors] = useState(preferences?.['challenge_sectors'] || []);
  const [notifyNewChallenges, setNotifyNewChallenges] = useState(preferences?.['notify_new_challenges'] ?? true);
  const [notifyMatchedChallenges, setNotifyMatchedChallenges] = useState(preferences?.['notify_matched_challenges'] ?? true);

  // Sync state with loaded preferences
  useEffect(() => {
    if (preferences) {
      setSelectedSectors(preferences['challenge_sectors'] || []);
      setNotifyNewChallenges(preferences['notify_new_challenges'] ?? true);
      setNotifyMatchedChallenges(preferences['notify_matched_challenges'] ?? true);
    }
  }, [preferences]);

  const handleSave = () => {
    savePreferences.mutate({
      data: {
        challenge_sectors: selectedSectors,
        notify_new_challenges: notifyNewChallenges,
        notify_matched_challenges: notifyMatchedChallenges
      },
      userId: user?.id
    });
  };

  if (prefsLoading) return <div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          {t({ en: 'Challenge Notification Preferences', ar: 'تفضيلات إشعارات التحديات' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <p className="font-medium text-slate-900">
              {t({ en: 'New Challenge Alerts', ar: 'تنبيهات التحديات الجديدة' })}
            </p>
            <p className="text-sm text-slate-600">
              {t({ en: 'Get notified when challenges match your sectors', ar: 'احصل على إشعارات عند تطابق التحديات مع قطاعاتك' })}
            </p>
          </div>
          <Switch
            checked={notifyNewChallenges}
            onCheckedChange={setNotifyNewChallenges}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div>
            <p className="font-medium text-slate-900">
              {t({ en: 'AI Match Alerts', ar: 'تنبيهات المطابقة الذكية' })}
            </p>
            <p className="text-sm text-slate-600">
              {t({ en: 'Get notified when AI matches challenges to your solutions', ar: 'احصل على إشعارات عند مطابقة الذكاء الاصطناعي للتحديات مع حلولك' })}
            </p>
          </div>
          <Switch
            checked={notifyMatchedChallenges}
            onCheckedChange={setNotifyMatchedChallenges}
          />
        </div>

        <div className="space-y-3">
          <p className="font-medium text-slate-900">
            {t({ en: 'Notify me for these sectors:', ar: 'أشعرني بهذه القطاعات:' })}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {sectors.map((sector) => (
              <div key={sector.id} className="flex items-center gap-2 p-2 border rounded hover:bg-slate-50">
                <Checkbox
                  checked={selectedSectors.includes(sector.code)}
                  onCheckedChange={(checked) => {
                    setSelectedSectors(prev =>
                      checked
                        ? [...prev, sector.code]
                        : prev.filter(s => s !== sector.code)
                    );
                  }}
                />
                <span className="text-sm text-slate-700">
                  {language === 'ar' && sector.name_ar ? sector.name_ar : sector.name_en}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={savePreferences.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
        >
          {savePreferences.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t({ en: 'Saving...', ar: 'جاري الحفظ...' })}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {t({ en: 'Save Preferences', ar: 'حفظ التفضيلات' })}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
