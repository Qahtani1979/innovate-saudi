import { Card, CardContent } from "@/components/ui/card";

/**
 * Mobile-optimized dashboard layout
 * Stacks cards vertically on mobile, grid on desktop
 */
export default function MobileDashboardLayout({ children, columns = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}

/**
 * Mobile-optimized stat card
 */
export function MobileStatCard({ icon: Icon, label, value, color = 'blue', subtitle }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {Icon && <Icon className={`h-8 w-8 text-${color}-600 mb-2`} />}
            <p className={`text-3xl md:text-4xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-sm text-slate-600 mt-1">{label}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mobile-optimized chart container
 */
export function MobileChartCard({ title, children }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-semibold text-sm mb-4 text-slate-900">{title}</h3>
        <div className="overflow-x-auto">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}