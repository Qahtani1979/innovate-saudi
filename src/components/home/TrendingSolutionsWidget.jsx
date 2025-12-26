import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useTrendingSolutions } from '../../hooks/useSolutions';
import { TrendingUp, Star, Building2, ArrowRight, Zap } from 'lucide-react';

export default function TrendingSolutionsWidget() {
  const { language, isRTL, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const { data: trendingSolutions = [] } = useTrendingSolutions();

  React.useEffect(() => {
    if (trendingSolutions.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingSolutions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trendingSolutions.length]);

  if (trendingSolutions.length === 0) return null;

  const solution = trendingSolutions[currentIndex];

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            {t({ en: 'Trending Solutions', ar: 'الحلول الرائجة' })}
          </CardTitle>
          <div className="flex gap-1">
            {trendingSolutions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-all ${idx === currentIndex ? 'bg-amber-600 w-6' : 'bg-amber-300'
                  }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {solution.image_url && (
            <img
              src={solution.image_url}
              alt={solution.name_en}
              className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1">
            <Badge className="bg-amber-600 text-white mb-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
            <h4 className="font-bold text-slate-900 mb-1">
              {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
            </h4>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-3 w-3 text-slate-500" />
              <span className="text-sm text-slate-600">{solution.provider_name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {solution.average_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  {solution.average_rating.toFixed(1)}
                </div>
              )}
              <Badge variant="outline" className="text-xs">{solution.maturity_level}</Badge>
            </div>
          </div>
          <Link to={createPageUrl(`SolutionDetail?id=${solution.id}`)}>
            <Button size="sm">
              {t({ en: 'View', ar: 'عرض' })}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
