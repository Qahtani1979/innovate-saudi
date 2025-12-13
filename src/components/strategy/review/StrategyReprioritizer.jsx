import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/components/LanguageContext';
import { 
  ArrowUpDown, GripVertical, TrendingUp, Clock, AlertTriangle,
  Users, DollarSign, Save, RotateCcw
} from 'lucide-react';

export default function StrategyReprioritizer({ objectives = [], onSave }) {
  const { t, language } = useLanguage();
  
  const [items, setItems] = useState([
    {
      id: '1',
      name: language === 'ar' ? 'التحول الرقمي' : 'Digital Transformation',
      priority: 1,
      strategicImportance: 9,
      resourceAvailability: 7,
      quickWinPotential: 6,
      riskLevel: 4,
      stakeholderDemand: 8,
      score: 85
    },
    {
      id: '2',
      name: language === 'ar' ? 'تجربة المواطن' : 'Citizen Experience',
      priority: 2,
      strategicImportance: 8,
      resourceAvailability: 8,
      quickWinPotential: 7,
      riskLevel: 3,
      stakeholderDemand: 9,
      score: 82
    },
    {
      id: '3',
      name: language === 'ar' ? 'الشراكات الاستراتيجية' : 'Strategic Partnerships',
      priority: 3,
      strategicImportance: 7,
      resourceAvailability: 6,
      quickWinPotential: 8,
      riskLevel: 5,
      stakeholderDemand: 7,
      score: 75
    },
    {
      id: '4',
      name: language === 'ar' ? 'بناء القدرات' : 'Capacity Building',
      priority: 4,
      strategicImportance: 8,
      resourceAvailability: 5,
      quickWinPotential: 4,
      riskLevel: 3,
      stakeholderDemand: 6,
      score: 70
    },
    {
      id: '5',
      name: language === 'ar' ? 'الابتكار المستدام' : 'Sustainable Innovation',
      priority: 5,
      strategicImportance: 9,
      resourceAvailability: 4,
      quickWinPotential: 3,
      riskLevel: 6,
      stakeholderDemand: 7,
      score: 68
    }
  ]);

  const [originalItems] = useState(items);
  const [hasChanges, setHasChanges] = useState(false);

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    newItems.forEach((item, i) => item.priority = i + 1);
    
    setItems(newItems);
    setHasChanges(true);
  };

  const handleReset = () => {
    setItems(originalItems);
    setHasChanges(false);
  };

  const handleSave = () => {
    onSave?.(items);
    setHasChanges(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCriteriaBar = (value, max = 10) => {
    const percentage = (value / max) * 100;
    return (
      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5 text-primary" />
            {t({ en: 'Strategy Reprioritizer', ar: 'إعادة ترتيب الأولويات الاستراتيجية' })}
          </CardTitle>
          <div className="flex gap-2">
            {hasChanges && (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t({ en: 'Reset', ar: 'إعادة تعيين' })}
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {t({ en: 'Save Changes', ar: 'حفظ التغييرات' })}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6 p-3 bg-muted/50 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>{t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-3 w-3" />
              <span>{t({ en: 'Resource Availability', ar: 'توفر الموارد' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{t({ en: 'Quick Win', ar: 'مكاسب سريعة' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3" />
              <span>{t({ en: 'Risk Level', ar: 'مستوى المخاطر' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{t({ en: 'Stakeholder Demand', ar: 'طلب أصحاب المصلحة' })}</span>
            </div>
          </div>

          {/* Priority List */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <div 
                key={item.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                  >
                    <span className="text-xs">▲</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === items.length - 1}
                  >
                    <span className="text-xs">▼</span>
                  </Button>
                </div>

                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {item.priority}
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-1" title={t({ en: 'Strategic Importance', ar: 'الأهمية الاستراتيجية' })}>
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      {getCriteriaBar(item.strategicImportance)}
                    </div>
                    <div className="flex items-center gap-1" title={t({ en: 'Resource Availability', ar: 'توفر الموارد' })}>
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {getCriteriaBar(item.resourceAvailability)}
                    </div>
                    <div className="flex items-center gap-1" title={t({ en: 'Quick Win', ar: 'مكاسب سريعة' })}>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {getCriteriaBar(item.quickWinPotential)}
                    </div>
                    <div className="flex items-center gap-1" title={t({ en: 'Stakeholder Demand', ar: 'طلب أصحاب المصلحة' })}>
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {getCriteriaBar(item.stakeholderDemand)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>
                    {item.score}
                  </span>
                  <p className="text-xs text-muted-foreground">{t({ en: 'Score', ar: 'النتيجة' })}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
