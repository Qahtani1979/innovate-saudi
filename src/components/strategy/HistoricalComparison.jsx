import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HistoricalComparison({ currentData }) {
  const { language, isRTL, t } = useLanguage();
  const [comparisonPeriod, setComparisonPeriod] = useState('yoy');

  // Mock historical data
  const historicalData = [
    { metric: 'Challenges', '2024': 156, '2023': 124 },
    { metric: 'Pilots', '2024': 45, '2023': 32 },
    { metric: 'Solutions', '2024': 89, '2023': 67 },
    { metric: 'Budget (M)', '2024': 15.5, '2023': 12.3 }
  ];

  const calculateGrowth = (current, previous) => {
    return ((current - previous) / previous) * 100;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t({ en: 'Historical Trends', ar: 'الاتجاهات التاريخية' })}
          </CardTitle>
          <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yoy">{t({ en: 'Year-over-Year', ar: 'سنة بعد سنة' })}</SelectItem>
              <SelectItem value="qoq">{t({ en: 'Quarter-over-Quarter', ar: 'فصل بعد فصل' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="2023" fill="#94a3b8" name="2023" />
            <Bar dataKey="2024" fill="#3b82f6" name="2024" />
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {historicalData.map((item, idx) => {
            const growth = calculateGrowth(item['2024'], item['2023']);
            return (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-600 mb-1">{item.metric}</p>
                <div className="flex items-center justify-center gap-2">
                  {growth > 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-600" />
                  )}
                  <Badge className={growth > 0 ? 'bg-green-600' : 'bg-red-600'}>
                    {growth > 0 ? '+' : ''}{growth.toFixed(0)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
