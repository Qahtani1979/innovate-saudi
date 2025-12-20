import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../components/LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { AlertCircle, Plus, Search, Edit, Eye, LayoutGrid, List, Sparkles, Loader2, TrendingUp, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { usePrompt } from '@/hooks/usePrompt';
import { CHALLENGE_QUICK_SUGGESTION_PROMPT_TEMPLATE } from '@/lib/ai/prompts/challenges/myChallenges';
import { PageLayout, PageHeader } from '@/components/layout/PersonaPageLayout';

function MyChallenges() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [aiSuggestions, setAiSuggestions] = useState({});
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const { invoke: invokeAI, status: aiStatus, isLoading: aiAnalyzing, isAvailable, rateLimitInfo } = usePrompt(null);
  const [analyzingId, setAnalyzingId] = useState(null);

  const { data: createdChallenges = [], isLoading: loadingCreated } = useQuery({
    queryKey: ['my-created-challenges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenge_owner_email', user.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: followedChallenges = [], isLoading: loadingFollowed } = useQuery({
    queryKey: ['my-followed-challenges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data: follows } = await supabase
        .from('user_follows')
        .select('entity_id')
        .eq('follower_email', user.email)
        .eq('entity_type', 'challenge');
      if (!follows?.length) return [];
      const challengeIds = follows.map(f => f.entity_id);
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .in('id', challengeIds);
      return data || [];
    },
    enabled: !!user?.email
  });

  const { data: assignedChallenges = [], isLoading: loadingAssigned } = useQuery({
    queryKey: ['my-assigned-challenges', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data: assignments } = await supabase
        .from('expert_assignments')
        .select('entity_id')
        .eq('expert_email', user.email)
        .eq('entity_type', 'challenge');
      if (!assignments?.length) return [];
      const challengeIds = assignments.map(a => a.entity_id);
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .in('id', challengeIds);
      return data || [];
    },
    enabled: !!user?.email
  });

  const challenges = [...createdChallenges, ...followedChallenges, ...assignedChallenges].filter(
    (challenge, index, self) => index === self.findIndex(c => c.id === challenge.id)
  );

  const isLoading = loadingCreated || loadingFollowed || loadingAssigned;

  const generateQuickSuggestion = async (challengeId) => {
    if (!challenges || challenges.length === 0) {
      toast.error(t({ en: 'Challenge not found', ar: 'لم يتم العثور على التحدي' }));
      return;
    }
    
    setAnalyzingId(challengeId);
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      
      if (!challenge) {
        toast.error(t({ en: 'Challenge not found', ar: 'لم يتم العثور على التحدي' }));
        setAnalyzingId(null);
        return;
      }
      const promptConfig = CHALLENGE_QUICK_SUGGESTION_PROMPT_TEMPLATE({
        title: challenge.title_en,
        description: challenge.description_en,
        status: challenge.status,
        sector: challenge.sector,
        language
      });

      const response = await invokeAI({
        prompt: promptConfig.prompt,
        system_prompt: promptConfig.system,
        response_json_schema: promptConfig.schema
      });

      if (response.success) {
        setAiSuggestions(prev => ({ ...prev, [challengeId]: response.data }));
        toast.success(t({ en: 'AI suggestions ready', ar: 'الاقتراحات الذكية جاهزة' }));
      }
    } finally {
      setAnalyzingId(null);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.title_ar?.includes(searchTerm) ||
                         challenge.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
    const matchesSector = sectorFilter === 'all' || challenge.sector === sectorFilter;
    return matchesSearch && matchesStatus && matchesSector;
  });

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700',
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    in_treatment: 'bg-purple-100 text-purple-700',
    resolved: 'bg-teal-100 text-teal-700'
  };

  return (
    <PageLayout>
      <PageHeader
        title={{ en: 'My Challenges', ar: 'تحدياتي' }}
        subtitle={{ en: 'Manage your submitted challenges', ar: 'إدارة التحديات المقدمة' }}
        icon={<AlertCircle className="h-6 w-6 text-white" />}
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-lg p-1 bg-white/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Link to={createPageUrl('ChallengeCreate')}>
              <Button variant="secondary">
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'New Challenge', ar: 'تحدي جديد' })}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Total', ar: 'الإجمالي' })}</p>
                <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Approved', ar: 'معتمد' })}</p>
                <p className="text-3xl font-bold text-green-600">
                  {challenges.filter(c => c.status === 'approved').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {challenges.filter(c => c.status === 'in_treatment').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t({ en: 'Under Review', ar: 'تحت المراجعة' })}</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {challenges.filter(c => c.status === 'under_review').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400`} />
              <Input
                placeholder={t({ en: 'Search challenges...', ar: 'بحث عن التحديات...' })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t({ en: 'Status', ar: 'الحالة' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Status', ar: 'جميع الحالات' })}</SelectItem>
                <SelectItem value="draft">{t({ en: 'Draft', ar: 'مسودة' })}</SelectItem>
                <SelectItem value="submitted">{t({ en: 'Submitted', ar: 'مقدم' })}</SelectItem>
                <SelectItem value="under_review">{t({ en: 'Under Review', ar: 'تحت المراجعة' })}</SelectItem>
                <SelectItem value="approved">{t({ en: 'Approved', ar: 'معتمد' })}</SelectItem>
                <SelectItem value="in_treatment">{t({ en: 'In Treatment', ar: 'قيد المعالجة' })}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t({ en: 'Sector', ar: 'القطاع' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ en: 'All Sectors', ar: 'جميع القطاعات' })}</SelectItem>
                <SelectItem value="urban_design">{t({ en: 'Urban Design', ar: 'التصميم العمراني' })}</SelectItem>
                <SelectItem value="transport">{t({ en: 'Transport', ar: 'النقل' })}</SelectItem>
                <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
                <SelectItem value="digital_services">{t({ en: 'Digital Services', ar: 'الخدمات الرقمية' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{t({ en: 'No challenges found', ar: 'لم يتم العثور على تحديات' })}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-all overflow-hidden">
                  {challenge.image_url && (
                    <div className="h-40 overflow-hidden">
                      <img src={challenge.image_url} alt={challenge.title_en} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">
                          {challenge.code}
                        </Badge>
                        <Badge className={statusColors[challenge.status]}>
                          {challenge.status?.replace(/_/g, ' ')}
                        </Badge>
                        <Badge variant="outline">
                          {challenge.sector?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900">
                        {language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {language === 'ar' && challenge.description_ar ? challenge.description_ar : challenge.description_en}
                      </p>
                      
                      {aiSuggestions[challenge.id] && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
                          <p className="text-xs font-semibold text-purple-900 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {t({ en: 'AI Suggestions', ar: 'اقتراحات ذكية' })}
                          </p>
                          <div className="space-y-1 text-xs text-slate-700">
                            <div className="flex items-start gap-2">
                              <Target className="h-3 w-3 text-blue-600 mt-0.5" />
                              <span><strong>{t({ en: 'Next:', ar: 'التالي:' })}</strong> {aiSuggestions[challenge.id].next_action}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 text-green-600 mt-0.5" />
                              <span><strong>{t({ en: 'Track:', ar: 'المسار:' })}</strong> {aiSuggestions[challenge.id].track_recommendation}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Zap className="h-3 w-3 text-amber-600 mt-0.5" />
                              <span><strong>{t({ en: 'Tip:', ar: 'نصيحة:' })}</strong> {aiSuggestions[challenge.id].improvement_tip}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t({ en: 'View', ar: 'عرض' })}
                          </Button>
                        </Link>
                        {!aiSuggestions[challenge.id] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateQuickSuggestion(challenge.id)}
                            disabled={analyzingId === challenge.id}
                          >
                            {analyzingId === challenge.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Sparkles className="h-4 w-4 text-purple-600" />
                            )}
                          </Button>
                        )}
                        {challenge.status === 'draft' && (
                          <Link to={createPageUrl(`ChallengeEdit?id=${challenge.id}`)}>
                            <Button variant="outline" size="sm">
                              <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t({ en: 'Edit', ar: 'تعديل' })}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Code', ar: 'الرمز' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Title', ar: 'العنوان' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Sector', ar: 'القطاع' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Status', ar: 'الحالة' })}</th>
                    <th className="text-left p-4 text-sm font-semibold">{t({ en: 'Score', ar: 'النقاط' })}</th>
                    <th className="text-right p-4 text-sm font-semibold">{t({ en: 'Actions', ar: 'إجراءات' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChallenges.map((challenge) => (
                    <tr key={challenge.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <Badge variant="outline" className="font-mono text-xs">{challenge.code}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {challenge.image_url && (
                            <img src={challenge.image_url} alt={challenge.title_en} className="w-10 h-10 object-cover rounded" />
                          )}
                          <p className="font-medium">{language === 'ar' && challenge.title_ar ? challenge.title_ar : challenge.title_en}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{challenge.sector?.replace(/_/g, ' ')}</td>
                      <td className="p-4">
                        <Badge className={statusColors[challenge.status]}>{challenge.status?.replace(/_/g, ' ')}</Badge>
                      </td>
                      <td className="p-4 text-sm font-semibold">{challenge.overall_score || 0}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={createPageUrl(`ChallengeDetail?id=${challenge.id}`)}>
                            <Button variant="outline" size="sm">
                              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t({ en: 'View', ar: 'عرض' })}
                            </Button>
                          </Link>
                          {challenge.status === 'draft' && (
                            <Link to={createPageUrl(`ChallengeEdit?id=${challenge.id}`)}>
                              <Button variant="outline" size="sm">
                                <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {t({ en: 'Edit', ar: 'تعديل' })}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}

export default ProtectedPage(MyChallenges, { requiredPermissions: [] });