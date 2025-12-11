import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, MapPin, Calendar, Users, Bookmark, ArrowRight, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { 
  CitizenPageLayout, 
  CitizenPageHeader, 
  CitizenSearchFilter, 
  CitizenCardGrid, 
  CitizenEmptyState 
} from '@/components/citizen/CitizenPageLayout';

function CitizenLivingLabsBrowser() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

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

  const statuses = [
    { value: 'active', label: t({ en: 'Active', ar: 'نشط' }) },
    { value: 'planning', label: t({ en: 'Planning', ar: 'تخطيط' }) },
    { value: 'completed', label: t({ en: 'Completed', ar: 'مكتمل' }) },
  ];

  const filteredLabs = livingLabs.filter(lab => {
    const statusMatch = selectedStatus === 'all' || lab.status === selectedStatus;
    const searchMatch = !searchTerm || 
      lab.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.name_ar?.includes(searchTerm) ||
      lab.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleBookmark = async (labId) => {
    if (!user?.email) {
      toast({ title: t({ en: 'Please login to bookmark', ar: 'يرجى تسجيل الدخول للحفظ' }), variant: 'destructive' });
      return;
    }
    try {
      const isBookmarked = userBookmarks.includes(labId);
      if (isBookmarked) {
        await supabase.from('bookmarks').delete()
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
    if (!user?.email) {
      toast({ title: t({ en: 'Please login to enroll', ar: 'يرجى تسجيل الدخول للتسجيل' }), variant: 'destructive' });
      return;
    }
    try {
      if (userEnrollments.includes(labId)) {
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
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'planning': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'paused': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const activeFiltersCount = selectedStatus !== 'all' ? 1 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={FlaskConical}
        title={t({ en: 'Living Labs', ar: 'المختبرات الحية' })}
        description={t({ en: 'Explore innovation labs and participate in citizen-driven research', ar: 'استكشف مختبرات الابتكار وشارك في البحث المدفوع من المواطنين' })}
        accentColor="blue"
        stats={[
          { value: livingLabs.length, label: t({ en: 'Labs', ar: 'مختبر' }), icon: FlaskConical, color: 'blue' },
          { value: livingLabs.filter(l => l.status === 'active').length, label: t({ en: 'Active', ar: 'نشط' }), color: 'green' },
          { value: userEnrollments.length, label: t({ en: 'My Participations', ar: 'مشاركاتي' }), icon: Users, color: 'purple' },
        ]}
      />

      <CitizenSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t({ en: 'Search living labs...', ar: 'ابحث عن المختبرات الحية...' })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        activeFilters={activeFiltersCount}
        onClearFilters={() => setSelectedStatus('all')}
        filters={[
          {
            label: t({ en: 'Status', ar: 'الحالة' }),
            placeholder: t({ en: 'Status', ar: 'الحالة' }),
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: statuses
          }
        ]}
      />

      <CitizenCardGrid 
        viewMode={viewMode}
        emptyState={
          <CitizenEmptyState
            icon={FlaskConical}
            title={t({ en: 'No living labs found', ar: 'لم يتم العثور على مختبرات' })}
            description={t({ en: 'Try adjusting your filters or check back later', ar: 'حاول تعديل الفلاتر أو تحقق لاحقاً' })}
          />
        }
      >
        {filteredLabs.map(lab => (
          <Card 
            key={lab.id} 
            className={`group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <CardContent className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-6 w-full' : ''}`}>
              <div className={viewMode === 'list' ? 'flex-1' : ''}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getStatusBadge(lab.status)}>
                      {statuses.find(s => s.value === lab.status)?.label || lab.status}
                    </Badge>
                    {userEnrollments.includes(lab.id) && (
                      <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        <Users className="h-3 w-3 mr-1" />
                        {t({ en: 'Enrolled', ar: 'مسجل' })}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${userBookmarks.includes(lab.id) ? 'text-amber-500' : 'text-muted-foreground'}`}
                    onClick={(e) => { e.preventDefault(); handleBookmark(lab.id); }}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {language === 'ar' ? (lab.name_ar || lab.name_en) : (lab.name_en || lab.name_ar)}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {language === 'ar' ? (lab.description_ar || lab.description_en) : (lab.description_en || lab.description_ar)}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {lab.municipalities?.name_en && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {language === 'ar' ? lab.municipalities.name_ar : lab.municipalities.name_en}
                    </span>
                  )}
                  {lab.start_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(lab.start_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/living-lab-detail?id=${lab.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {t({ en: 'View Details', ar: 'عرض التفاصيل' })}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'mr-2 rotate-180' : 'ml-2'}`} />
                    </Button>
                  </Link>
                  {lab.status === 'active' && !userEnrollments.includes(lab.id) && (
                    <Button 
                      size="sm" 
                      onClick={() => handleEnroll(lab.id)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CitizenCardGrid>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenLivingLabsBrowser, { requiredPermissions: [] });
