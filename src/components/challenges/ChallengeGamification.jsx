import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, Zap } from 'lucide-react';

export default function ChallengeGamification({ userEmail }) {
  const { data: solvedChallenges = [] } = useQuery({
    queryKey: ['solved-challenges', userEmail],
    queryFn: async () => {
      // Challenges where user was involved in resolution
      return base44.entities.Challenge.filter({
        status: 'resolved',
        $or: [
          { challenge_owner_email: userEmail },
          { created_by: userEmail },
          { reviewed_by: userEmail }
        ]
      });
    }
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['challenge-badges', userEmail],
    queryFn: async () => {
      const userBadges = await base44.entities.UserAchievement.filter({
        user_email: userEmail,
        achievement_category: 'challenge_solving'
      });
      return userBadges;
    }
  });

  const challengesSolved = solvedChallenges.length;
  const points = challengesSolved * 100; // 100 points per solved challenge

  const badgeDefinitions = [
    { name: 'Problem Solver', threshold: 1, icon: Award, color: 'text-bronze' },
    { name: 'Challenge Champion', threshold: 5, icon: Star, color: 'text-blue-600' },
    { name: 'Innovation Hero', threshold: 10, icon: Trophy, color: 'text-yellow-600' },
    { name: 'National Impact Maker', threshold: 25, icon: Zap, color: 'text-purple-600' }
  ];

  const earnedBadges = badgeDefinitions.filter(b => challengesSolved >= b.threshold);
  const nextBadge = badgeDefinitions.find(b => challengesSolved < b.threshold);
  const progressToNext = nextBadge 
    ? (challengesSolved / nextBadge.threshold) * 100 
    : 100;

  return (
    <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          Challenge Solver Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-slate-600">Challenges Solved</p>
            <p className="text-3xl font-bold text-green-600">{challengesSolved}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-sm text-slate-600">Total Points</p>
            <p className="text-3xl font-bold text-purple-600">{points}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Earned Badges</p>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <Badge key={idx} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  <Icon className="h-4 w-4 mr-1" />
                  {badge.name}
                </Badge>
              );
            })}
          </div>
          {earnedBadges.length === 0 && (
            <p className="text-sm text-slate-500">No badges earned yet - solve challenges to unlock!</p>
          )}
        </div>

        {nextBadge && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">
              Next Badge: {nextBadge.name}
            </p>
            <Progress value={progressToNext} className="h-2 mb-1" />
            <p className="text-xs text-slate-600">
              {challengesSolved}/{nextBadge.threshold} challenges solved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}