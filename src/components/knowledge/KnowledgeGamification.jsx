import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../LanguageContext';
import { Award, Star, TrendingUp, Target } from 'lucide-react';

export default function KnowledgeGamification() {
  const { language, t } = useLanguage();

  const userStats = {
    points: 2450,
    level: 7,
    rank: 'Innovation Expert',
    badges: ['Knowledge Seeker', 'Pilot Pioneer', 'Community Helper'],
    nextLevel: 3000,
    leaderboardRank: 12
  };

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-600" />
          {t({ en: 'Knowledge Gamification', ar: 'تلعيب المعرفة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-300 text-center">
          <Star className="h-12 w-12 text-amber-600 mx-auto mb-2" />
          <p className="text-3xl font-bold text-amber-900">Level {userStats.level}</p>
          <p className="text-sm text-amber-700">{userStats.rank}</p>
          <Badge className="bg-amber-600 mt-2">{userStats.points} points</Badge>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">{t({ en: 'Progress to Level 8', ar: 'التقدم للمستوى 8' })}</p>
            <p className="text-xs text-slate-600">{userStats.points}/{userStats.nextLevel}</p>
          </div>
          <Progress value={(userStats.points / userStats.nextLevel) * 100} className="h-3" />
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-2">{t({ en: 'Earned Badges', ar: 'شارات محصّلة' })}</h4>
          <div className="flex flex-wrap gap-2">
            {userStats.badges.map((badge, i) => (
              <Badge key={i} className="bg-purple-600">{badge}</Badge>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <p className="text-sm font-semibold">{t({ en: 'Leaderboard', ar: 'لوحة الصدارة' })}</p>
            </div>
            <Badge className="bg-blue-600">#{userStats.leaderboardRank}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}