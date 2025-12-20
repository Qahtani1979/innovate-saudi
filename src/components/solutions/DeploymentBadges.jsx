import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import {
  Award, TrendingUp, Rocket, CheckCircle2
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DeploymentBadges({ solution, pilots = [] }) {
  const { language, t } = useLanguage();

  const deploymentCount = solution.deployment_count || 0;
  const activePilots = pilots.filter(p => ['active', 'monitoring', 'completed', 'scaled'].includes(p.stage));
  const successfulPilots = pilots.filter(p => p.stage === 'completed' && p.recommendation === 'scale');

  const badges = [];

  // Single Pilot Badge
  if (activePilots.length >= 1 && deploymentCount < 3) {
    badges.push({
      id: 'single_pilot',
      label: { en: 'Pilot Tested', ar: 'مختبر' },
      icon: CheckCircle2,
      color: 'bg-blue-100 text-blue-700',
      tooltip: { en: `Tested in ${activePilots.length} pilot${activePilots.length > 1 ? 's' : ''}`, ar: `مختبر في ${activePilots.length} تجربة` }
    });
  }

  // Multi-City Badge
  if (deploymentCount >= 3 && deploymentCount < 10) {
    badges.push({
      id: 'multi_city',
      label: { en: 'Multi-City', ar: 'متعدد المدن' },
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
      tooltip: { en: `Deployed in ${deploymentCount} cities`, ar: `منشور في ${deploymentCount} مدن` }
    });
  }

  // Nationally Deployed Badge
  if (deploymentCount >= 10) {
    badges.push({
      id: 'nationally_deployed',
      label: { en: 'Nationally Deployed', ar: 'منشور وطنياً' },
      icon: Rocket,
      color: 'bg-purple-100 text-purple-700',
      tooltip: { en: `Deployed in ${deploymentCount} cities nationwide`, ar: `منشور في ${deploymentCount} مدينة على مستوى الوطن` }
    });
  }

  // Proven Success Badge
  if (successfulPilots.length >= 2 && solution.average_rating >= 4) {
    badges.push({
      id: 'proven_success',
      label: { en: 'Proven Success', ar: 'نجاح مثبت' },
      icon: Award,
      color: 'bg-amber-100 text-amber-700',
      tooltip: { en: `${successfulPilots.length} successful pilots, ${solution.average_rating.toFixed(1)}★ rating`, ar: `${successfulPilots.length} تجارب ناجحة، ${solution.average_rating.toFixed(1)}★ تقييم` }
    });
  }

  if (badges.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex gap-2 flex-wrap">
        {badges.map((badge) => {
          const Icon = badge.icon;
          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <Badge className={`${badge.color} cursor-help`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {badge.label[language]}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{badge.tooltip[language]}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}