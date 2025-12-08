import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Shield, Award, TrendingUp, CheckCircle2, Star, Zap } from 'lucide-react';

export default function StartupCredentialBadges({ startup, solutions, pilots }) {
  const { language, t } = useLanguage();

  const badges = [];

  // Verified badge
  if (startup.is_verified) {
    badges.push({
      icon: Shield,
      label: t({ en: 'Verified Provider', ar: 'مزود معتمد' }),
      color: 'bg-green-100 text-green-700 border-green-300'
    });
  }

  // Pilot proven
  const completedPilots = pilots.filter(p => p.stage === 'completed' || p.stage === 'scaled').length;
  if (completedPilots >= 1) {
    badges.push({
      icon: CheckCircle2,
      label: t({ en: 'Pilot Proven', ar: 'مُثبَت بالتجربة' }),
      color: 'bg-blue-100 text-blue-700 border-blue-300'
    });
  }

  // Multi-city
  const totalDeployments = solutions.reduce((sum, s) => sum + (s.deployment_count || 0), 0);
  if (totalDeployments >= 3) {
    badges.push({
      icon: TrendingUp,
      label: t({ en: 'Multi-City Deployed', ar: 'منشور في مدن متعددة' }),
      color: 'bg-purple-100 text-purple-700 border-purple-300'
    });
  }

  // High rated
  const avgRating = solutions.reduce((sum, s) => sum + (s.average_rating || 0), 0) / Math.max(solutions.length, 1);
  if (avgRating >= 4.5) {
    badges.push({
      icon: Star,
      label: t({ en: 'Top Rated', ar: 'الأعلى تقييماً' }),
      color: 'bg-amber-100 text-amber-700 border-amber-300'
    });
  }

  // Fast deployer
  if (pilots.length >= 5) {
    badges.push({
      icon: Zap,
      label: t({ en: 'Experienced Deployer', ar: 'مُنشِر متمرس' }),
      color: 'bg-teal-100 text-teal-700 border-teal-300'
    });
  }

  // Innovation leader
  const highTRL = solutions.filter(s => s.trl >= 7).length;
  if (highTRL >= 2) {
    badges.push({
      icon: Award,
      label: t({ en: 'Innovation Leader', ar: 'قائد الابتكار' }),
      color: 'bg-pink-100 text-pink-700 border-pink-300'
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, idx) => {
        const Icon = badge.icon;
        return (
          <Badge key={idx} className={`${badge.color} border-2 flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {badge.label}
          </Badge>
        );
      })}
    </div>
  );
}