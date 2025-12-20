import { cn } from "@/lib/utils";

export function ProfileHeader({ 
  title, 
  description, 
  icon: Icon,
  actions,
  className,
  compact = false
}) {
  if (compact) {
    return (
      <div className={cn('flex items-center justify-between mb-6', className)}>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    );
  }

  return (
    <div className={cn(
      'relative rounded-xl overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground',
      className
    )}>
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-primary-foreground/80 mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export default ProfileHeader;
