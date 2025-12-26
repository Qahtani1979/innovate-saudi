import { Badge } from "@/components/ui/badge";
import { Award, Target, Users, Zap, TrendingUp, Star } from 'lucide-react';

/**
 * Extended achievement library
 */
export const moreAchievements = [
  // Challenge Achievements
  { id: 'challenge_first', name: 'First Challenge', name_ar: 'أول تحدي', icon: Target, rarity: 'common', points: 10 },
  { id: 'challenge_5', name: '5 Challenges', name_ar: '5 تحديات', icon: Target, rarity: 'uncommon', points: 50 },
  { id: 'challenge_innovator', name: 'Challenge Innovator', name_ar: 'مبتكر التحديات', icon: Award, rarity: 'rare', points: 100 },
  
  // Pilot Achievements
  { id: 'pilot_launched', name: 'Pilot Pioneer', name_ar: 'رائد التجارب', icon: Zap, rarity: 'uncommon', points: 75 },
  { id: 'pilot_successful', name: 'Success Story', name_ar: 'قصة نجاح', icon: Star, rarity: 'rare', points: 150 },
  { id: 'pilot_scaled', name: 'Scaler', name_ar: 'موسع', icon: TrendingUp, rarity: 'epic', points: 300 },
  
  // Collaboration Achievements
  { id: 'first_collaboration', name: 'Team Player', name_ar: 'لاعب فريق', icon: Users, rarity: 'common', points: 25 },
  { id: 'mentor_assigned', name: 'Mentor', name_ar: 'موجه', icon: Award, rarity: 'uncommon', points: 100 },
  { id: 'network_builder', name: 'Network Builder', name_ar: 'بناء الشبكة', icon: Users, rarity: 'rare', points: 200 },
  
  // Learning Achievements
  { id: 'training_complete', name: 'Graduate', name_ar: 'خريج', icon: Award, rarity: 'uncommon', points: 50 },
  { id: 'certification', name: 'Certified', name_ar: 'معتمد', icon: Star, rarity: 'rare', points: 150 },
  
  // Contribution Achievements  
  { id: 'idea_submitted', name: 'Idea Generator', name_ar: 'مولد الأفكار', icon: Target, rarity: 'common', points: 15 },
  { id: 'idea_implemented', name: 'Game Changer', name_ar: 'غير اللعبة', icon: Award, rarity: 'epic', points: 500 },
  
  // Milestone Achievements
  { id: 'first_week', name: 'Week One', name_ar: 'الأسبوع الأول', icon: Target, rarity: 'common', points: 10 },
  { id: 'month_active', name: 'Month Warrior', name_ar: 'محارب الشهر', icon: Award, rarity: 'uncommon', points: 50 },
  { id: 'year_veteran', name: 'Veteran', name_ar: 'قديم', icon: Star, rarity: 'legendary', points: 1000 }
];

export function AchievementBadge({ achievement, unlocked = false }) {
  const Icon = achievement.icon;
  const rarityColors = {
    common: 'bg-slate-100 text-slate-700',
    uncommon: 'bg-blue-100 text-blue-700',
    rare: 'bg-purple-100 text-purple-700',
    epic: 'bg-amber-100 text-amber-700',
    legendary: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };

  return (
    <div className={`p-3 rounded-lg ${unlocked ? rarityColors[achievement.rarity] : 'bg-slate-50 opacity-50'}`}>
      <Icon className="h-6 w-6 mx-auto mb-2" />
      <p className="font-semibold text-sm text-center">{achievement.name}</p>
      <Badge className="mt-2 text-xs">{achievement.points} pts</Badge>
    </div>
  );
}
