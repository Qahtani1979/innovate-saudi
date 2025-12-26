import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Mobile-optimized card view for table data
 * Automatically switches between table and card view on mobile
 */
export default function MobileTableCard({ items, renderCard, renderTable }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile && renderCard) {
    return (
      <div className="space-y-3">
        {items.map((item, idx) => renderCard(item, idx))}
      </div>
    );
  }

  return renderTable();
}

/**
 * Default mobile card template
 */
export function DefaultMobileCard({ title, subtitle, badges = [], actions, children }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
          </div>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <Badge key={idx} {...badge.props}>{badge.label}</Badge>
              ))}
            </div>
          )}

          {children}

          {actions && (
            <div className="flex gap-2 pt-2 border-t">
              {actions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
