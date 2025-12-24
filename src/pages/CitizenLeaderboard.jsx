import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../components/LanguageContext';
import { Trophy, Medal, Award, Star, TrendingUp, Crown } from 'lucide-react';
import ProtectedPage from '../components/permissions/ProtectedPage';
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';

function CitizenLeaderboard() {
  const { language, isRTL, t } = useLanguage();

  const { data: topContributors = [] } = useQuery({
    queryKey: ['citizen-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_points')
        .select('*')
        .eq('is_active', true)
        .order('total_points', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <Star className="h-5 w-5 text-slate-400" />;
  };

  const getLevelColor = (level) => {
    const colors = {
      bronze: 'bg-amber-700 text-white',
      silver: 'bg-gray-400 text-white',
      gold: 'bg-yellow-500 text-white',
      platinum: 'bg-cyan-500 text-white',
      diamond: 'bg-purple-600 text-white'
    };
    return colors[level] || 'bg-slate-400 text-white';
  };

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Trophy}
        title={{ en: 'Top Contributors Leaderboard', ar: 'قائمة أفضل المساهمين' }}
        subtitle={{ en: 'Recognizing our most engaged citizens', ar: 'تقدير المواطنين الأكثر مشاركة' }}
      />

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {topContributors.slice(0, 3).map((contributor, idx) => {
          const rank = idx + 1;
          const heights = { 1: 'h-48', 2: 'h-40', 3: 'h-32' };

          return (
            <Card key={contributor.id} className={`${heights[rank]} border - 2 ${rank === 1 ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50' :
                rank === 2 ? 'border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50' :
                  'border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50'
              } ${rank === 2 ? 'order-first md:order-none' : ''} `}>
              <CardContent className="pt-6 text-center flex flex-col items-center justify-between h-full">
                <div className="flex flex-col items-center">
                  {getRankIcon(rank)}
                  <p className="text-4xl font-bold text-slate-900 mt-2">#{rank}</p>
                </div>
                <div className="w-full">
                  <p className="font-semibold text-slate-900 mb-1">
                    {contributor.citizen_identifier.split('@')[0]}
                  </p>
                  <Badge className={getLevelColor(contributor.level)}>
                    {contributor.level}
                  </Badge>
                  <p className="text-2xl font-bold text-purple-600 mt-2">
                    {contributor.total_points}
                  </p>
                  <p className="text-xs text-slate-500">{t({ en: 'points', ar: 'نقطة' })}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            {t({ en: 'All Contributors', ar: 'جميع المساهمين' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topContributors.slice(3).map((contributor, idx) => {
              const rank = idx + 4;

              return (
                <div key={contributor.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50">
                  <div className="w-12 text-center">
                    <p className="text-lg font-bold text-slate-700">#{rank}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {contributor.citizen_identifier.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getLevelColor(contributor.level)} variant="outline">
                        {contributor.level}
                      </Badge>
                      {contributor.badges_earned?.slice(0, 3).map((badge, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-purple-600">{contributor.total_points}</p>
                    <p className="text-xs text-slate-500">{t({ en: 'points', ar: 'نقطة' })}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenLeaderboard, { requiredPermissions: [] });