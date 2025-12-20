import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Award, Save } from 'lucide-react';

export default function EvaluationRubrics({ application, sessionType = 'post_meeting', onSave }) {
  const { language, isRTL, t } = useLanguage();

  const [scores, setScores] = useState({
    market_fit: { score: 0, notes: '' },
    solution_quality: { score: 0, notes: '' },
    value_impact: { score: 0, notes: '' },
    team_capability: { score: 0, notes: '' },
    partnership_model: { score: 0, notes: '' }
  });

  const criteria = [
    {
      key: 'market_fit',
      name_en: 'Market Fit (Saudi)',
      name_ar: 'الملاءمة للسوق السعودي',
      weight: 20,
      rubric: {
        1: { label_en: 'No local presence', label_ar: 'لا وجود محلي' },
        2: { label_en: 'Initial interest only', label_ar: 'اهتمام مبدئي فقط' },
        3: { label_en: 'Some activity/plan', label_ar: 'نشاط أو خطة جزئية' },
        4: { label_en: 'Registered + partnerships', label_ar: 'مسجل مع شراكات' },
        5: { label_en: 'Full local presence', label_ar: 'وجود محلي كامل' }
      }
    },
    {
      key: 'solution_quality',
      name_en: 'Solution Quality',
      name_ar: 'جودة الحل والجاهزية',
      weight: 25,
      rubric: {
        1: { label_en: 'Idea only', label_ar: 'فكرة فقط' },
        2: { label_en: 'MVP/PoC', label_ar: 'نموذج أولي' },
        3: { label_en: 'Working product', label_ar: 'منتج عامل' },
        4: { label_en: 'Tested with clients', label_ar: 'مجرب مع عملاء' },
        5: { label_en: 'Mature & scalable', label_ar: 'ناضج وقابل للتوسع' }
      }
    },
    {
      key: 'value_impact',
      name_en: 'Value & Impact',
      name_ar: 'القيمة والتأثير المحتمل',
      weight: 25,
      rubric: {
        1: { label_en: 'No evidence', label_ar: 'لا أدلة' },
        2: { label_en: 'Theoretical only', label_ar: 'نظري فقط' },
        3: { label_en: 'Partial evidence', label_ar: 'أدلة جزئية' },
        4: { label_en: 'Measurable impact', label_ar: 'تأثير قابل للقياس' },
        5: { label_en: 'Transformative with ROI', label_ar: 'تحويلي مع عائد' }
      }
    },
    {
      key: 'team_capability',
      name_en: 'Team Capability',
      name_ar: 'قدرة الفريق والتنفيذ',
      weight: 15,
      rubric: {
        1: { label_en: 'Incomplete team', label_ar: 'فريق غير مكتمل' },
        2: { label_en: 'Basic team, gaps', label_ar: 'فريق أساسي بفجوات' },
        3: { label_en: 'Solid operational team', label_ar: 'فريق تشغيلي جيد' },
        4: { label_en: 'Strong with track record', label_ar: 'قوي مع سجل إنجازات' },
        5: { label_en: 'Exceptional leadership', label_ar: 'قيادة استثنائية' }
      }
    },
    {
      key: 'partnership_model',
      name_en: 'Partnership Model',
      name_ar: 'نموذج الشراكة والجاهزية',
      weight: 15,
      rubric: {
        1: { label_en: 'No model', label_ar: 'لا نموذج' },
        2: { label_en: 'Preliminary only', label_ar: 'مبدئي فقط' },
        3: { label_en: 'Reasonable model', label_ar: 'نموذج معقول' },
        4: { label_en: 'Clear & realistic', label_ar: 'واضح وواقعي' },
        5: { label_en: 'Outstanding & committed', label_ar: 'متميز وملتزم' }
      }
    }
  ];

  const calculateBaseScore = () => {
    return criteria.reduce((sum, criterion) => {
      const score = scores[criterion.key]?.score || 0;
      return sum + (score * criterion.weight);
    }, 0);
  };

  const baseScore = calculateBaseScore();

  const handleSave = async () => {
    await onSave({
      session_type: sessionType,
      scores,
      calculated_base_score: baseScore
    });
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-600" />
          {t({ en: 'Evaluation Rubrics', ar: 'معايير التقييم' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {criteria.map((criterion) => (
          <div key={criterion.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">
                {language === 'ar' ? criterion.name_ar : criterion.name_en}
              </h4>
              <Badge variant="outline">{criterion.weight}%</Badge>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setScores({...scores, [criterion.key]: {...scores[criterion.key], score: level}})}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    scores[criterion.key]?.score === level
                      ? 'border-purple-500 bg-purple-100 shadow-md'
                      : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-2xl font-bold text-purple-600">{level}</div>
                  <p className="text-xs text-slate-600 mt-1">
                    {language === 'ar' ? criterion.rubric[level].label_ar : criterion.rubric[level].label_en}
                  </p>
                </button>
              ))}
            </div>

            <Textarea
              rows={2}
              value={scores[criterion.key]?.notes || ''}
              onChange={(e) => setScores({...scores, [criterion.key]: {...scores[criterion.key], notes: e.target.value}})}
              placeholder={t({ en: 'Notes...', ar: 'ملاحظات...' })}
              className="text-sm"
            />
          </div>
        ))}

        <div className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{t({ en: 'Base Score (Weighted)', ar: 'الدرجة الأساسية (مرجحة)' })}</p>
              <p className="text-4xl font-bold text-purple-600">{baseScore.toFixed(0)}<span className="text-xl text-slate-500">/100</span></p>
            </div>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Save className="h-4 w-4 mr-2" />
              {t({ en: 'Save Evaluation', ar: 'حفظ التقييم' })}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}