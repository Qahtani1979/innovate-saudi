import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Megaphone, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AnnouncementSystem() {
  const { language, isRTL, t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    message_en: '',
    message_ar: '',
    type: 'info',
    active: true,
    target_portals: []
  });

  // Mock announcements - in real app, you'd have Announcement entity
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      message_en: 'Platform maintenance scheduled for Jan 20, 2025 at 2:00 AM',
      message_ar: 'صيانة المنصة مجدولة في 20 يناير 2025 الساعة 2:00 صباحًا',
      type: 'warning',
      active: true,
      target_portals: ['all'],
      created_date: '2025-01-10'
    },
    {
      id: '2',
      message_en: 'New R&D Call: Smart Cities Innovation - Apply by Feb 1',
      message_ar: 'دعوة بحثية جديدة: ابتكار المدن الذكية - التقديم حتى 1 فبراير',
      type: 'success',
      active: true,
      target_portals: ['academia', 'startup'],
      created_date: '2025-01-08'
    }
  ]);

  const announcementTypes = [
    { value: 'info', label: { en: 'Info', ar: 'معلومة' }, color: 'bg-blue-100 text-blue-700' },
    { value: 'success', label: { en: 'Success', ar: 'نجاح' }, color: 'bg-green-100 text-green-700' },
    { value: 'warning', label: { en: 'Warning', ar: 'تحذير' }, color: 'bg-amber-100 text-amber-700' },
    { value: 'error', label: { en: 'Critical', ar: 'حرج' }, color: 'bg-red-100 text-red-700' }
  ];

  const portals = [
    { value: 'all', label: { en: 'All Portals', ar: 'جميع البوابات' } },
    { value: 'executive', label: { en: 'Executive', ar: 'التنفيذي' } },
    { value: 'municipality', label: { en: 'Municipality', ar: 'البلدية' } },
    { value: 'startup', label: { en: 'Startup', ar: 'الشركات' } },
    { value: 'academia', label: { en: 'Academia', ar: 'الجامعات' } }
  ];

  const handleCreate = () => {
    const newId = (announcements.length + 1).toString();
    setAnnouncements([...announcements, { ...newAnnouncement, id: newId, created_date: new Date().toISOString() }]);
    setNewAnnouncement({ message_en: '', message_ar: '', type: 'info', active: true, target_portals: [] });
    setIsCreating(false);
    toast.success(t({ en: 'Announcement created', ar: 'تم إنشاء الإعلان' }));
  };

  const handleToggle = (id) => {
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, active: !a.active } : a
    ));
    toast.success(t({ en: 'Announcement updated', ar: 'تم تحديث الإعلان' }));
  };

  const handleDelete = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast.success(t({ en: 'Announcement deleted', ar: 'تم حذف الإعلان' }));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
            {t({ en: 'Announcement System', ar: 'نظام الإعلانات' })}
          </h1>
          <p className="text-slate-600 mt-2">
            {t({ en: 'Platform-wide banners and messages', ar: 'لافتات ورسائل على مستوى المنصة' })}
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t({ en: 'New Announcement', ar: 'إعلان جديد' })}
        </Button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle>{t({ en: 'Create Announcement', ar: 'إنشاء إعلان' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">
                  {t({ en: 'Message (English)', ar: 'الرسالة (إنجليزي)' })}
                </label>
                <Textarea
                  value={newAnnouncement.message_en}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message_en: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-900 mb-2 block">
                  {t({ en: 'Message (Arabic)', ar: 'الرسالة (عربي)' })}
                </label>
                <Textarea
                  value={newAnnouncement.message_ar}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message_ar: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                {t({ en: 'Type', ar: 'النوع' })}
              </label>
              <div className="flex gap-2">
                {announcementTypes.map(type => (
                  <Button
                    key={type.value}
                    variant={newAnnouncement.type === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewAnnouncement({ ...newAnnouncement, type: type.value })}
                    className={newAnnouncement.type === type.value ? type.color : ''}
                  >
                    {type.label[language]}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900 mb-2 block">
                {t({ en: 'Target Portals', ar: 'البوابات المستهدفة' })}
              </label>
              <div className="flex flex-wrap gap-2">
                {portals.map(portal => {
                  const isSelected = newAnnouncement.target_portals.includes(portal.value);
                  return (
                    <Button
                      key={portal.value}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const targets = isSelected
                          ? newAnnouncement.target_portals.filter(p => p !== portal.value)
                          : [...newAnnouncement.target_portals, portal.value];
                        setNewAnnouncement({ ...newAnnouncement, target_portals: targets });
                      }}
                    >
                      {portal.label[language]}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newAnnouncement.message_en} className="flex-1">
                {t({ en: 'Create', ar: 'إنشاء' })}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                {t({ en: 'Cancel', ar: 'إلغاء' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map(announcement => {
          const typeInfo = announcementTypes.find(t => t.value === announcement.type);
          return (
            <Card key={announcement.id} className={announcement.active ? 'border-2 border-blue-200' : 'opacity-60'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={typeInfo?.color}>{typeInfo?.label[language]}</Badge>
                      {announcement.active ? (
                        <Badge className="bg-green-100 text-green-700">
                          <Eye className="h-3 w-3 mr-1" />
                          {t({ en: 'Active', ar: 'نشط' })}
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">
                          <EyeOff className="h-3 w-3 mr-1" />
                          {t({ en: 'Hidden', ar: 'مخفي' })}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {announcement.target_portals.map((portal, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {portals.find(p => p.value === portal)?.label[language]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-900 mb-1">
                      {language === 'ar' && announcement.message_ar ? announcement.message_ar : announcement.message_en}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t({ en: 'Created', ar: 'تاريخ الإنشاء' })}: {new Date(announcement.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={announcement.active}
                      onCheckedChange={() => handleToggle(announcement.id)}
                    />
                    <Button size="sm" variant="outline">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(announcement.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}