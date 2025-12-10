import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, AlertCircle, Award, TestTube, Target, TrendingUp, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';
import UnifiedEvaluationForm from '../components/evaluation/UnifiedEvaluationForm';
import EvaluationConsensusPanel from '../components/evaluation/EvaluationConsensusPanel';

function PilotEvaluations() {
  const { language, isRTL, t } = useLanguage();
  const [selectedPilot, setSelectedPilot] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: pilots = [] } = useQuery({
    queryKey: ['pilots-for-evaluation'],
    queryFn: async () => {
      const { data } = await supabase.from('pilots').select('*').in('stage', ['monitoring', 'active', 'completed']);
      return data || [];
    }
  });

  const handleEvaluate = (pilot) => {
    setSelectedPilot(pilot);
    setShowEvaluationForm(true);
  };

  const handleEvaluationComplete = async () => {
    setShowEvaluationForm(false);
    
    if (selectedPilot) {
      await supabase.functions.invoke('checkConsensus', {
        body: { entity_type: 'pilot', entity_id: selectedPilot.id }
      });
    }
    
    setSelectedPilot(null);
    queryClient.invalidateQueries(['pilots-for-evaluation']);
  };

  const criteria = [
    { key: 'kpi_achievement', label_en: 'KPI Achievement', label_ar: 'تحقيق المؤشرات' },
    { key: 'budget_efficiency', label_en: 'Budget Efficiency', label_ar: 'كفاءة الميزانية' },
    { key: 'timeline_adherence', label_en: 'Timeline Adherence', label_ar: 'الالتزام بالجدول' },
    { key: 'stakeholder_satisfaction', label_en: 'Stakeholder Satisfaction', label_ar: 'رضا الأطراف' },
    { key: 'scalability', label_en: 'Scalability Potential', label_ar: 'إمكانية التوسع' },
    { key: 'innovation_level', label_en: 'Innovation Level', label_ar: 'مستوى الابتكار' },
    { key: 'risk_management', label_en: 'Risk Management', label_ar: 'إدارة المخاطر' },
    { key: 'data_quality', label_en: 'Data Quality', label_ar: 'جودة البيانات' }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Evaluation Form Modal */}
      {showEvaluationForm && selectedPilot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <UnifiedEvaluationForm
              entityType="pilot"
              entityId={selectedPilot.id}
              onComplete={handleEvaluationComplete}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t({ en: 'Pilot Evaluations', ar: 'تقييمات التجارب' })}
          </h1>
          <p className="text-slate-600 mt-1">
            {t({ en: 'Assess pilot performance and recommend next steps', ar: 'تقييم أداء التجارب واقتراح الخطوات التالية' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-blue-600">{pilots.length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Pilots to Evaluate', ar: 'تجارب للتقييم' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-600">{pilots.filter(p => p.recommendation === 'scale').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Ready to Scale', ar: 'جاهز للتوسع' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-yellow-600">{pilots.filter(p => p.recommendation === 'iterate').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Need Iteration', ar: 'تحتاج تحسين' })}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-purple-600">{pilots.filter(p => p.stage === 'completed').length}</p>
              <p className="text-xs text-slate-600">{t({ en: 'Completed', ar: 'مكتملة' })}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {pilots.map((pilot) => (
          <Card key={pilot.id} className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900">{pilot.title_en}</h3>
                    <Badge className={
                      pilot.stage === 'completed' ? 'bg-green-100 text-green-700' :
                      pilot.stage === 'monitoring' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }>
                      {pilot.stage}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{pilot.sector?.replace(/_/g, ' ')}</span>
                    {pilot.success_probability && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {pilot.success_probability}% success
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <EvaluationConsensusPanel 
                entityType="pilot" 
                entityId={pilot.id} 
              />

              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleEvaluate(pilot)} size="sm" className="bg-blue-600">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t({ en: 'Evaluate', ar: 'تقييم' })}
                </Button>
                <Link to={createPageUrl(`PilotDetail?id=${pilot.id}`)}>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    {t({ en: 'Details', ar: 'التفاصيل' })}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {pilots.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'No pilots to evaluate', ar: 'لا توجد تجارب للتقييم' })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProtectedPage(PilotEvaluations, { requiredPermissions: [] });