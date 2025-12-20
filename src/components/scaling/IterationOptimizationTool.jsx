import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { RefreshCw, MessageSquare, TrendingUp, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function IterationOptimizationTool({ scalingPlan, onSave }) {
  const { language, isRTL, t } = useLanguage();
  const [feedback, setFeedback] = useState([]);
  const [newFeedback, setNewFeedback] = useState('');
  const [improvements, setImprovements] = useState([]);
  const [abTests, setAbTests] = useState([]);

  const handleAddFeedback = () => {
    if (newFeedback.trim()) {
      const item = {
        id: Date.now(),
        text: newFeedback,
        date: new Date().toISOString(),
        status: 'new'
      };
      setFeedback([...feedback, item]);
      setNewFeedback('');
    }
  };

  const sampleImprovements = [
    { id: 1, title: 'Optimize onboarding flow', impact: 'high', status: 'in_progress' },
    { id: 2, title: 'Add training materials', impact: 'medium', status: 'planned' },
    { id: 3, title: 'Improve reporting dashboard', impact: 'high', status: 'completed' }
  ];

  const sampleABTests = [
    { id: 1, variant: 'Training Format', option1: 'In-person', option2: 'Online', winner: 'Online', confidence: 95 },
    { id: 2, variant: 'Deployment Timeline', option1: '2 weeks', option2: '4 weeks', winner: 'TBD', confidence: 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Feedback Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {t({ en: 'Feedback Collection', ar: 'جمع التعليقات' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              value={newFeedback}
              onChange={(e) => setNewFeedback(e.target.value)}
              placeholder={t({ en: 'Enter feedback from municipalities...', ar: 'أدخل تعليقات من البلديات...' })}
              className="flex-1"
            />
            <Button onClick={handleAddFeedback} className="self-start">
              {t({ en: 'Add', ar: 'إضافة' })}
            </Button>
          </div>

          <div className="space-y-2">
            {feedback.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg bg-slate-50">
                <div className="flex items-start justify-between">
                  <p className="text-sm flex-1">{item.text}</p>
                  <Badge className="bg-blue-100 text-blue-700 text-xs ml-2">{item.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            ))}
            {feedback.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                {t({ en: 'No feedback collected yet', ar: 'لم يتم جمع أي تعليقات بعد' })}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Continuous Improvement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t({ en: 'Continuous Improvement', ar: 'التحسين المستمر' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleImprovements.map((improvement) => (
              <div key={improvement.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{improvement.title}</h4>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      improvement.impact === 'high' ? 'bg-red-100 text-red-700' :
                      improvement.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {improvement.impact}
                    </Badge>
                    <Badge className={
                      improvement.status === 'completed' ? 'bg-green-100 text-green-700' :
                      improvement.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }>
                      {improvement.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* A/B Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-purple-600" />
            {t({ en: 'A/B Testing Framework', ar: 'إطار اختبار A/B' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleABTests.map((test) => (
              <div key={test.id} className="p-4 border rounded-lg bg-purple-50">
                <h4 className="font-semibold text-sm mb-3">{test.variant}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded border-2 border-blue-200">
                    <p className="text-xs text-slate-600 mb-1">Option A</p>
                    <p className="font-medium">{test.option1}</p>
                  </div>
                  <div className="p-3 bg-white rounded border-2 border-green-200">
                    <p className="text-xs text-slate-600 mb-1">Option B</p>
                    <p className="font-medium">{test.option2}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {test.winner !== 'TBD' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    <span className="text-sm font-medium">
                      {t({ en: 'Winner:', ar: 'الفائز:' })} {test.winner}
                    </span>
                  </div>
                  {test.confidence > 0 && (
                    <Badge className="bg-green-100 text-green-700">
                      {test.confidence}% {t({ en: 'confidence', ar: 'ثقة' })}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            {t({ en: 'AI Optimization Suggestions', ar: 'اقتراحات التحسين الذكية' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm">
              💡 {t({ en: 'Consider extending training by 1 week for municipalities with adoption < 60%', ar: 'فكر في تمديد التدريب لمدة أسبوع للبلديات ذات التبني < 60٪' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm">
              📊 {t({ en: 'Municipality X shows 40% higher success with peer mentoring approach', ar: 'البلدية X تظهر نجاحاً أعلى بنسبة 40٪ مع نهج التوجيه من الأقران' })}
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm">
              🎯 {t({ en: 'Recommend focusing next iteration on cost optimization (feedback theme)', ar: 'يوصى بالتركيز في التكرار التالي على تحسين التكلفة (موضوع التعليقات)' })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}