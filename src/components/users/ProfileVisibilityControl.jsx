import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { Globe, Users, UserCheck, Lock } from 'lucide-react';

export default function ProfileVisibilityControl({ visibility, onChange }) {
  const { t, language } = useLanguage();

  const visibilityOptions = [
    {
      value: 'public',
      icon: Globe,
      label: { en: 'Public', ar: 'عام' },
      description: { en: 'Anyone can view your profile', ar: 'يمكن لأي شخص رؤية ملفك' }
    },
    {
      value: 'platform',
      icon: Users,
      label: { en: 'Platform Users', ar: 'مستخدمو المنصة' },
      description: { en: 'Only registered users can view', ar: 'المستخدمون المسجلون فقط' }
    },
    {
      value: 'team',
      icon: UserCheck,
      label: { en: 'Team Only', ar: 'الفريق فقط' },
      description: { en: 'Only your team members', ar: 'أعضاء فريقك فقط' }
    },
    {
      value: 'private',
      icon: Lock,
      label: { en: 'Private', ar: 'خاص' },
      description: { en: 'Only you can view', ar: 'أنت فقط' }
    }
  ];

  const selectedOption = visibilityOptions.find(opt => opt.value === visibility) || visibilityOptions[1];
  const SelectedIcon = selectedOption.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">
          {t({ en: 'Profile Visibility', ar: 'خصوصية الملف' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={visibility || 'platform'} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue>
              <div className="flex items-center gap-2">
                <SelectedIcon className="h-4 w-4" />
                <span>{selectedOption.label[language]}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {visibilityOptions.map(option => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{option.label[language]}</div>
                      <div className="text-xs text-slate-500">{option.description[language]}</div>
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
          {selectedOption.description[language]}
        </div>
      </CardContent>
    </Card>
  );
}