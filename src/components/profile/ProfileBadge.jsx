import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ProfileBadge({ 
  icon: Icon, 
  name, 
  description,
  earned = false,
  variant = 'default',
  size = 'sm',
  showTooltip = true
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const variantClasses = {
    default: earned ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border',
    gold: earned ? 'bg-warning/10 text-warning border-warning/20' : 'bg-muted text-muted-foreground border-border',
    silver: earned ? 'bg-secondary/10 text-secondary-foreground border-secondary/20' : 'bg-muted text-muted-foreground border-border',
    bronze: earned ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-muted text-muted-foreground border-border',
  };

  const badge = (
    <div 
      className={cn(
        'rounded-xl border flex items-center justify-center transition-all',
        sizeClasses[size],
        variantClasses[variant],
        !earned && 'opacity-50 grayscale'
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ProfileBadgeList({ badges, maxVisible = 5, size = 'sm' }) {
  const visibleBadges = badges.slice(0, maxVisible);
  const remainingCount = badges.length - maxVisible;

  return (
    <div className="flex items-center gap-1">
      {visibleBadges.map((badge, i) => (
        <ProfileBadge key={i} {...badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

export default ProfileBadge;
