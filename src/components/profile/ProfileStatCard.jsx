import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProfileStatCard({ 
  icon: Icon, 
  value, 
  label, 
  variant = 'default',
  className 
}) {
  const variants = {
    default: 'bg-card border',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-success/10 border-success/20',
    warning: 'bg-warning/10 border-warning/20',
    destructive: 'bg-destructive/10 border-destructive/20',
    purple: 'bg-primary/5 border-primary/10',
    amber: 'bg-warning/5 border-warning/10',
  };

  const iconVariants = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    purple: 'text-primary',
    amber: 'text-warning',
  };

  const valueVariants = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    destructive: 'text-destructive',
    purple: 'text-primary',
    amber: 'text-warning',
  };

  return (
    <Card className={cn(variants[variant], 'border transition-all hover:shadow-md', className)}>
      <CardContent className="pt-6 text-center">
        {Icon && <Icon className={cn('h-8 w-8 mx-auto mb-2', iconVariants[variant])} />}
        <p className={cn('text-3xl font-bold', valueVariants[variant])}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

export function ProfileStatGrid({ children, columns = 4, className }) {
  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-1 sm:grid-cols-3',
      columns === 4 && 'grid-cols-2 md:grid-cols-4',
      className
    )}>
      {children}
    </div>
  );
}

export default ProfileStatCard;
