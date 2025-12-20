import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/components/LanguageContext';
import { useMIIData } from '@/hooks/useMIIData';

const DIMENSION_COLORS = {
  LEADERSHIP: '#3b82f6',
  STRATEGY: '#8b5cf6',
  CULTURE: '#10b981',
  PARTNERSHIPS: '#f59e0b',
  CAPABILITIES: '#ec4899',
  IMPACT: '#06b6d4'
};

const DIMENSION_LABELS = {
  LEADERSHIP: { en: 'Leadership', ar: 'القيادة' },
  STRATEGY: { en: 'Strategy', ar: 'الاستراتيجية' },
  CULTURE: { en: 'Culture', ar: 'الثقافة' },
  PARTNERSHIPS: { en: 'Partnerships', ar: 'الشراكات' },
  CAPABILITIES: { en: 'Capabilities', ar: 'القدرات' },
  IMPACT: { en: 'Impact', ar: 'الأثر' }
};

/**
 * Historical Dimension Trends Chart
 * Shows how each MII dimension score has changed over time
 */
export default function DimensionTrendChart({ municipalityId }) {
  const { language, t } = useLanguage();
  const { history, dimensions, isLoading } = useMIIData(municipalityId);
  const [selectedDimensions, setSelectedDimensions] = useState(['LEADERSHIP', 'IMPACT']);

  // Transform history data for chart
  const chartData = history.map(h => {
    const point = { year: h.assessment_year };
    Object.keys(DIMENSION_LABELS).forEach(dim => {
      point[dim] = h.dimension_scores?.[dim]?.score || 0;
    });
    return point;
  });

  const toggleDimension = (dim) => {
    setSelectedDimensions(prev => {
      if (prev.includes(dim)) {
        return prev.filter(d => d !== dim);
      }
      return [...prev, dim];
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t({ en: 'Dimension Trends Over Time', ar: 'اتجاهات الأبعاد عبر الوقت' })}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          {t({ en: 'Need at least 2 years of data to show trends', ar: 'تحتاج إلى سنتين على الأقل من البيانات' })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t({ en: 'Dimension Trends Over Time', ar: 'اتجاهات الأبعاد عبر الوقت' })}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Dimension toggles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(DIMENSION_LABELS).map(([dim, labels]) => (
            <button
              key={dim}
              onClick={() => toggleDimension(dim)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                selectedDimensions.includes(dim)
                  ? 'bg-opacity-100 text-white'
                  : 'bg-opacity-10 hover:bg-opacity-20'
              }`}
              style={{
                backgroundColor: selectedDimensions.includes(dim) ? DIMENSION_COLORS[dim] : `${DIMENSION_COLORS[dim]}20`,
                borderColor: DIMENSION_COLORS[dim],
                color: selectedDimensions.includes(dim) ? 'white' : DIMENSION_COLORS[dim]
              }}
            >
              {language === 'ar' ? labels.ar : labels.en}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="year" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              formatter={(value, name) => [
                `${value}`,
                language === 'ar' ? DIMENSION_LABELS[name]?.ar : DIMENSION_LABELS[name]?.en
              ]}
            />
            <Legend 
              formatter={(value) => language === 'ar' ? DIMENSION_LABELS[value]?.ar : DIMENSION_LABELS[value]?.en}
            />
            {selectedDimensions.map(dim => (
              <Line
                key={dim}
                type="monotone"
                dataKey={dim}
                stroke={DIMENSION_COLORS[dim]}
                strokeWidth={2}
                dot={{ fill: DIMENSION_COLORS[dim], strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
