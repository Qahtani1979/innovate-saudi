import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from '../components/LanguageContext';
import { User, Building2, Plus, Edit, Save } from 'lucide-react';

export default function UserProfileMultiIdentity() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({});

  const { data: profiles = [] } = useQuery({
    queryKey: ['user-profiles', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_email', user.email);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  const updateProfile = useMutation({
    mutationFn: async ({ id, data }) => {
      if (id) {
        const { error } = await supabase
          .from('user_profiles')
          .update(data)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert({ ...data, user_email: user?.email });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-profiles']);
      setEditing(false);
    }
  });

  const primaryProfile = profiles[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <User className="h-8 w-8 text-blue-600" />
            {t({ en: 'My Profile & Identities', ar: 'ملفي وهوياتي' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Manage your professional identities and organizational affiliations', ar: 'إدارة هوياتك المهنية وانتماءاتك التنظيمية' })}
          </p>
        </div>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
          {editing ? t({ en: 'Save', ar: 'حفظ' }) : t({ en: 'Edit', ar: 'تعديل' })}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {t({ en: 'Primary Identity', ar: 'الهوية الأساسية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">{t({ en: 'Full Name', ar: 'الاسم الكامل' })}</label>
              <p className="text-slate-900">{primaryProfile?.full_name || user?.user_metadata?.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">{t({ en: 'Email', ar: 'البريد الإلكتروني' })}</label>
              <p className="text-slate-900">{user?.email}</p>
            </div>
          </div>

          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</label>
                <Input
                  value={profileData.job_title || primaryProfile?.job_title || ''}
                  onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t({ en: 'Bio', ar: 'النبذة' })}</label>
                <Input
                  value={profileData.bio || primaryProfile?.bio_en || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio_en: e.target.value })}
                />
              </div>
              <Button onClick={() => updateProfile.mutate({ id: primaryProfile?.id, data: profileData })}>
                {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
              </Button>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-slate-700">{t({ en: 'Job Title', ar: 'المسمى الوظيفي' })}</label>
                <p className="text-slate-900">{primaryProfile?.job_title || t({ en: 'Not set', ar: 'غير محدد' })}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">{t({ en: 'Bio', ar: 'النبذة' })}</label>
                <p className="text-slate-900">{primaryProfile?.bio_en || t({ en: 'No bio added', ar: 'لم تضاف نبذة' })}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              {t({ en: 'Organizational Affiliations', ar: 'الانتماءات التنظيمية' })}
            </CardTitle>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profiles.map((profile, i) => (
              <div key={i} className="p-3 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{profile.organization_name || t({ en: 'Organization', ar: 'المنظمة' })}</p>
                  <p className="text-sm text-slate-600">{profile.job_title}</p>
                </div>
                <Badge>{profile.role || 'member'}</Badge>
              </div>
            ))}
            {profiles.length === 0 && (
              <p className="text-slate-500 text-center py-4">
                {t({ en: 'No affiliations added', ar: 'لم تضاف انتماءات' })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}