import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, FlaskConical, MapPin, Calendar, Users, Bookmark, ExternalLink, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';


export default function CitizenLivingLabsBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const { data: livingLabs = [], isLoading } = useQuery({
    queryKey: ['citizen-living-labs-browser'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('living_labs')
        .select('*, municipalities(name_en, name_ar), regions(name_en, name_ar)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Get user's bookmarks
  const { data: userBookmarks = [], refetch: refetchBookmarks } = useQuery({
    queryKey: ['citizen-lab-bookmarks', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('bookmarks')
        .select('entity_id')
        .eq('user_email', user.email)
        .eq('entity_type', 'living_lab');
      if (error) throw error;
      return data?.map(b => b.entity_id) || [];
    },
    enabled: !!user?.email
  });

  // Get user's enrollments
  const { data: userEnrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ['citizen-lab-enrollments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('living_lab_participants')
        .select('living_lab_id')
        .eq('participant_email', user.email);
      if (error) throw error;
      return data?.map(e => e.living_lab_id) || [];
    },
    enabled: !!user?.email
  });

  const filteredLabs = livingLabs.filter(lab => {
    const statusMatch = selectedStatus === 'all' || lab.status === selectedStatus;
    const searchMatch = !searchTerm || 
      lab.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.name_ar?.includes(searchTerm) ||
      lab.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleBookmark = async (labId) => {
    if (!user?.email) return;
    try {
      const isBookmarked = userBookmarks.includes(labId);
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_email', user.email)
          .eq('entity_id', labId)
          .eq('entity_type', 'living_lab');
        toast({ title: t({ en: 'Bookmark removed', ar: 'تم إزالة الإشارة' }) });
      } else {
        await supabase.from('bookmarks').insert({
          user_email: user.email,
          entity_id: labId,
          entity_type: 'living_lab'
        });
        toast({ title: t({ en: 'Bookmarked!', ar: 'تم حفظ الإشارة!' }) });
      }
      refetchBookmarks();
    } catch (err) {
      toast({ title: t({ en: 'Error', ar: 'خطأ' }), variant: 'destructive' });
    }
  };

  const handleEnroll = async (labId) => {
    if (!user?.email) return;
    try {
      const isEnrolled = userEnrollments.includes(labId);
      if (isEnrolled) {
        toast({ 
          title: t({ en: 'Already enrolled', ar: 'مسجل بالفعل' }),
          description: t({ en: 'You are already participating in this lab', ar: 'أنت مشارك بالفعل في هذا المختبر' })
        });
        return;
      }
      
      await supabase.from('living_lab_participants').insert({
        living_lab_id: labId,
        participant_email: user.email,
        participant_type: 'citizen',
        status: 'pending',
        joined_at: new Date().toISOString()
      });
      toast({ 
        title: t({ en: 'Enrollment submitted!', ar: 'تم تقديم التسجيل!' }),
        description: t({ en: 'Your participation request is pending approval', ar: 'طلب مشاركتك في انتظار الموافقة' })
      });
      refetchEnrollments();
    } catch (err) {
      toast({ title: t({ en: 'Error enrolling', ar: 'خطأ في التسجيل' }), variant: 'destructive' });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <FlaskConical className="h-5 w-5 text-primary" />
          </div>
          {t({ en: 'Living Labs', ar: 'المختبرات الحية' })}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t({ en: 'Explore innovation labs and participate in citizen-driven research', ar: 'استكشف مختبرات الابتكار وشارك في البحث المدفوع من المواطنين' })}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
              <Input
                placeholder={t({ en: 'Search living labs...', ar: 'ابحث عن المختبرات الحية...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border rounded-md bg-background"
            >
              <option value="all">{t({ en: 'All Statuses', ar: 'جميع الحالات' })}</option>
              <option value="active">{t({ en: 'Active', ar: 'نشط' })}</option>
              <option value="planning">{t({ en: 'Planning', ar: 'تخطيط' })}</option>
              <option value="completed">{t({ en: 'Completed', ar: 'مكتمل' })}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{livingLabs.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Total Labs', ar: 'إجمالي المختبرات' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{livingLabs.filter(l => l.status === 'active').length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Active', ar: 'نشطة' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{userEnrollments.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'My Enrollments', ar: 'تسجيلاتي' })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{userBookmarks.length}</p>
            <p className="text-sm text-muted-foreground">{t({ en: 'Bookmarked', ar: 'محفوظة' })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Labs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredLabs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t({ en: 'No living labs found', ar: 'لم يتم العثور على مختبرات حية' })}
            </h3>
            <p className="text-muted-foreground">
              {t({ en: 'Try adjusting your search or filters.', ar: 'حاول تعديل البحث أو الفلاتر.' })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLabs.map(lab => (
            <Card key={lab.id} className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {lab.status && (
                    <Badge className={getStatusBadge(lab.status)}>
                      {lab.status}
                    </Badge>
                  )}
                  {lab.focus_areas && lab.focus_areas[0] && (
                    <Badge variant="outline">{lab.focus_areas[0]}</Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                  {language === 'ar' && lab.description_ar ? lab.description_ar : lab.description_en}
                </p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  {lab.regions && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {language === 'ar' && lab.regions.name_ar 
                          ? lab.regions.name_ar 
                          : lab.regions.name_en}
                      </span>
                    </div>
                  )}
                  {lab.participant_count && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{lab.participant_count} {t({ en: 'participants', ar: 'مشارك' })}</span>
                    </div>
                  )}
                  {lab.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(lab.start_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <Link to={`/living-lab-detail?id=${lab.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink className="h-4 w-4" />
                      {t({ en: 'View', ar: 'عرض' })}
                    </Button>
                  </Link>
                  <Button
                    variant={userBookmarks.includes(lab.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleBookmark(lab.id)}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  {lab.status === 'active' && !userEnrollments.includes(lab.id) && (
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => handleEnroll(lab.id)}
                    >
                      <UserPlus className="h-4 w-4" />
                      {t({ en: 'Join', ar: 'انضم' })}
                    </Button>
                  )}
                  {userEnrollments.includes(lab.id) && (
                    <Badge className="bg-green-100 text-green-700">
                      {t({ en: 'Enrolled', ar: 'مسجل' })}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
