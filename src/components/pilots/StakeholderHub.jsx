import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Users, MessageSquare, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useEntityAccessCheck } from '@/hooks/useEntityAccessCheck';

export default function StakeholderHub({ pilot }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [satisfaction, setSatisfaction] = useState(5);

  // Check if user has access to this pilot
  const accessCheck = useEntityAccessCheck(pilot, {
    municipalityColumn: 'municipality_id',
    sectorColumn: 'sector_id',
    ownerColumn: 'created_by'
  });

  // Fetch stakeholder feedback for this specific pilot
  const { data: stakeholderFeedback = [] } = useQuery({
    queryKey: ['stakeholder-feedback', pilot.id],
    queryFn: async () => {
      const { data } = await supabase.from('stakeholder_feedback').select('*').eq('pilot_id', pilot.id);
      return data || [];
    },
    enabled: !!pilot?.id && accessCheck.canAccess,
    initialData: []
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('stakeholder_feedback').insert({
        pilot_id: pilot.id,
        stakeholder_email: user?.email,
        stakeholder_role: 'stakeholder',
        feedback_type: 'progress_update',
        satisfaction_score: data.satisfaction,
        comments: data.feedback,
        sentiment: data.satisfaction >= 4 ? 'positive' : data.satisfaction >= 3 ? 'neutral' : 'negative'
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stakeholder-feedback']);
      setFeedback('');
      setSatisfaction(5);
      toast.success(t({ en: 'Feedback submitted', ar: 'الملاحظات قُدمت' }));
    }
  });

  const avgSatisfaction = stakeholderFeedback.length > 0
    ? (stakeholderFeedback.reduce((sum, f) => sum + (f.satisfaction_score || 0), 0) / stakeholderFeedback.length).toFixed(1)
    : 0;

  const sentimentCounts = {
    positive: stakeholderFeedback.filter(f => f.sentiment === 'positive').length,
    neutral: stakeholderFeedback.filter(f => f.sentiment === 'neutral').length,
    negative: stakeholderFeedback.filter(f => f.sentiment === 'negative').length
  };

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          {t({ en: 'Stakeholder Hub', ar: 'مركز أصحاب المصلحة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 text-center">
            <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-600">{avgSatisfaction}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Avg Satisfaction', ar: 'متوسط الرضا' })}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-300 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600">{stakeholderFeedback.length}</p>
            <p className="text-xs text-slate-600">{t({ en: 'Feedback Items', ar: 'عناصر الملاحظات' })}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded border">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-600">✓ Positive: {sentimentCounts.positive}</span>
            <span className="text-yellow-600">○ Neutral: {sentimentCounts.neutral}</span>
            <span className="text-red-600">✗ Negative: {sentimentCounts.negative}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-700">
            {t({ en: 'Submit Feedback', ar: 'إرسال الملاحظات' })}
          </h4>
          
          <div>
            <label className="text-xs text-slate-600 mb-1 block">
              {t({ en: 'Satisfaction (1-5)', ar: 'الرضا (1-5)' })}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setSatisfaction(n)}
                  className={`px-4 py-2 rounded border ${satisfaction === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t({ en: 'Your feedback on pilot progress...', ar: 'ملاحظاتك على تقدم التجربة...' })}
            rows={3}
          />

          <Button 
            onClick={() => submitFeedbackMutation.mutate({ feedback, satisfaction })}
            disabled={!feedback || submitFeedbackMutation.isPending}
            className="w-full bg-indigo-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Submit', ar: 'إرسال' })}
          </Button>
        </div>

        {stakeholderFeedback.slice(0, 3).map((item, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded border text-sm">
            <div className="flex items-center justify-between mb-1">
              <Badge className={
                item.sentiment === 'positive' ? 'bg-green-600' :
                item.sentiment === 'neutral' ? 'bg-yellow-600' : 'bg-red-600'
              }>
                {item.satisfaction_score}/5
              </Badge>
              <span className="text-xs text-slate-500">
                {new Date(item.created_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </span>
            </div>
            <p className="text-slate-700">{item.comments}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}