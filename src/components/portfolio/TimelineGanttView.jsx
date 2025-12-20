import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calendar } from 'lucide-react';

export default function TimelineGanttView({ items }) {
  const { language, isRTL, t } = useLanguage();
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const getItemPosition = (item) => {
    const startDate = new Date(item.timeline?.pilot_start || item.start_date || Date.now());
    const endDate = new Date(item.timeline?.pilot_end || item.end_date || Date.now());
    const startMonth = startDate.getMonth();
    const duration = Math.max(1, Math.ceil((endDate - startDate) / (30 * 24 * 60 * 60 * 1000)));
    return { start: startMonth, duration };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t({ en: 'Timeline View (2025)', ar: 'العرض الزمني (2025)' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="flex border-b pb-2 mb-4">
              <div className="w-48 font-medium text-sm">{t({ en: 'Initiative', ar: 'المبادرة' })}</div>
              <div className="flex-1 flex">
                {months.map(month => (
                  <div key={month} className="flex-1 text-center text-xs text-slate-500">{month}</div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {items.slice(0, 20).map((item, idx) => {
              const pos = getItemPosition(item);
              return (
                <div key={idx} className="flex items-center mb-3">
                  <div className="w-48 pr-4">
                    <p className="text-xs font-medium truncate">{item.title_en}</p>
                    <Badge className="text-xs mt-1">{item.sector}</Badge>
                  </div>
                  <div className="flex-1 relative h-8">
                    <div className="absolute top-0 left-0 right-0 flex">
                      {months.map((m, i) => (
                        <div key={i} className="flex-1 border-r border-slate-100" />
                      ))}
                    </div>
                    <div
                      className="absolute top-1 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-md shadow-sm"
                      style={{
                        left: `${(pos.start / 12) * 100}%`,
                        width: `${(pos.duration / 12) * 100}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}