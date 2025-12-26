import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PriceComparisonTool({ solutions, selectedSolution }) {
  const { language, isRTL, t } = useLanguage();

  const comparisonData = useMemo(() => {
    const sameSectorSolutions = solutions.filter(s => 
      s.sectors?.some(sec => selectedSolution?.sectors?.includes(sec)) &&
      s.pricing_details?.monthly_cost
    );

    const avgPrice = sameSectorSolutions.length > 0 
      ? sameSectorSolutions.reduce((sum, s) => sum + (s.pricing_details?.monthly_cost || 0), 0) / sameSectorSolutions.length
      : 0;

    const chartData = sameSectorSolutions.slice(0, 10).map(s => ({
      name: s.name_en?.substring(0, 20) + '...',
      price: s.pricing_details?.monthly_cost || 0,
      isSelected: s.id === selectedSolution?.id
    }));

    return { avgPrice, chartData, totalSolutions: sameSectorSolutions.length };
  }, [solutions, selectedSolution]);

  const selectedPrice = selectedSolution?.pricing_details?.monthly_cost || 0;
  const priceVsAvg = selectedPrice - comparisonData.avgPrice;
  const pricePercentDiff = comparisonData.avgPrice > 0 
    ? ((priceVsAvg / comparisonData.avgPrice) * 100).toFixed(1)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {t({ en: 'Price Comparison', ar: 'مقارنة الأسعار' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'This Solution', ar: 'هذا الحل' })}</p>
            <p className="text-2xl font-bold text-blue-600">${selectedPrice.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{t({ en: '/month', ar: '/شهر' })}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Market Avg', ar: 'متوسط السوق' })}</p>
            <p className="text-2xl font-bold text-slate-700">${comparisonData.avgPrice.toFixed(0).toLocaleString()}</p>
            <p className="text-xs text-slate-500">{comparisonData.totalSolutions} {t({ en: 'solutions', ar: 'حل' })}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-xs text-slate-600 mb-1">{t({ en: 'Difference', ar: 'الفرق' })}</p>
            <div className="flex items-center justify-center gap-1">
              {priceVsAvg < 0 ? (
                <TrendingDown className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingUp className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${priceVsAvg < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(pricePercentDiff)}%
              </p>
            </div>
            <Badge className={priceVsAvg < 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
              {priceVsAvg < 0 ? t({ en: 'Below Avg', ar: 'أقل من المتوسط' }) : t({ en: 'Above Avg', ar: 'أعلى من المتوسط' })}
            </Badge>
          </div>
        </div>

        {/* Price Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-3">{t({ en: 'Similar Solutions Pricing', ar: 'أسعار الحلول المماثلة' })}</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="price" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Insights */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-900">
            💡 {priceVsAvg < 0 
              ? t({ 
                  en: `This solution is ${Math.abs(pricePercentDiff)}% cheaper than market average, offering competitive value.`,
                  ar: `هذا الحل أرخص بنسبة ${Math.abs(pricePercentDiff)}٪ من متوسط السوق، ويقدم قيمة تنافسية.`
                })
              : t({ 
                  en: `This solution is ${pricePercentDiff}% more expensive. Consider if premium features justify the price.`,
                  ar: `هذا الحل أغلى بنسبة ${pricePercentDiff}٪. فكر فيما إذا كانت الميزات الإضافية تبرر السعر.`
                })
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
