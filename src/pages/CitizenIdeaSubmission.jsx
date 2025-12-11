import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/components/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, Send, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, 
  Loader2, Clock, Eye, FileText, History
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '@/components/permissions/ProtectedPage';
import InnovationProposalWorkflowTab from '@/components/citizen/InnovationProposalWorkflowTab';
import { CitizenPageLayout, CitizenPageHeader } from '@/components/citizen/CitizenPageLayout';

function CitizenIdeaSubmission() {
  const { language, isRTL, t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  
  // Form state
  const [initialIdea, setInitialIdea] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    category: '',
    tags: [],
    impact_score: 0,
    feasibility_score: 0,
    ai_summary: ''
  });

  // Fetch municipalities
  const { data: municipalities = [] } = useQuery({
    queryKey: ['municipalities-active'],
    queryFn: async () => {
      const { data } = await supabase
        .from('municipalities')
        .select('id, name_en, name_ar')
        .eq('is_active', true)
        .order('name_en');
      return data || [];
    }
  });

  // Fetch user's submitted ideas
  const { data: myIdeas = [], isLoading: ideasLoading } = useQuery({
    queryKey: ['my-citizen-ideas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (ideaData) => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .insert({
          ...ideaData,
          user_id: user?.id,
          status: 'submitted',
          is_published: false
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-citizen-ideas']);
      toast.success(t({ en: 'Idea submitted successfully!', ar: 'تم إرسال الفكرة بنجاح!' }));
      resetForm();
    },
    onError: (error) => {
      console.error('Submit error:', error);
      toast.error(t({ en: 'Failed to submit idea', ar: 'فشل إرسال الفكرة' }));
    }
  });

  // AI Generate
  const handleAIGenerate = async () => {
    if (!initialIdea.trim()) {
      toast.error(t({ en: 'Please describe your idea first', ar: 'يرجى وصف فكرتك أولاً' }));
      return;
    }

    setIsAIProcessing(true);
    try {
      const municipality = municipalities.find(m => m.id === selectedMunicipality);
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-idea-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({
          idea: initialIdea,
          municipality: municipality ? `${municipality.name_en} (${municipality.name_ar})` : null,
          user_id: user?.id,
          user_type: 'citizen'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'AI generation failed');
      }
      
      setFormData({
        title: result.title_en || '',
        title_ar: result.title_ar || '',
        description: result.description_en || '',
        description_ar: result.description_ar || '',
        category: result.category || 'other',
        tags: result.tags_en || result.tags || [],
        impact_score: result.impact_score || 50,
        feasibility_score: result.feasibility_score || 50,
        ai_summary: result.ai_summary_en || result.ai_summary || ''
      });
      
      setCurrentStep(2);
      toast.success(t({ en: 'AI has analyzed your idea!', ar: 'قام الذكاء الاصطناعي بتحليل فكرتك!' }));
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(t({ en: 'AI analysis failed. Please try again.', ar: 'فشل تحليل الذكاء الاصطناعي.' }));
    } finally {
      setIsAIProcessing(false);
    }
  };

  // Submit idea
  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error(t({ en: 'Please provide an idea title', ar: 'يرجى تقديم عنوان للفكرة' }));
      return;
    }

    submitMutation.mutate({
      title: language === 'ar' ? formData.title_ar : formData.title,
      description: language === 'ar' ? formData.description_ar : formData.description,
      category: formData.category,
      municipality_id: selectedMunicipality || null,
      tags: formData.tags
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setInitialIdea('');
    setSelectedMunicipality('');
    setFormData({
      title: '', title_ar: '', description: '', description_ar: '',
      category: '', tags: [], impact_score: 0, feasibility_score: 0, ai_summary: ''
    });
  };

  const statusColors = {
    submitted: 'bg-blue-100 text-blue-700',
    under_review: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    converted_to_challenge: 'bg-purple-100 text-purple-700'
  };

  return (
    <CitizenPageLayout>
      <CitizenPageHeader
        icon={Lightbulb}
        title={t({ en: 'Innovation Ideas', ar: 'أفكار الابتكار' })}
        description={t({ en: 'Submit and track your innovation ideas', ar: 'قدم وتابع أفكارك الابتكارية' })}
        accentColor="purple"
        stats={[
          { icon: FileText, value: myIdeas.length, label: t({ en: 'My Ideas', ar: 'أفكاري' }), color: 'purple' },
        ]}
      />

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">
            <Lightbulb className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Idea', ar: 'إرسال فكرة' })}
          </TabsTrigger>
          <TabsTrigger value="my-ideas">
            <FileText className="h-4 w-4 mr-2" />
            {t({ en: 'My Ideas', ar: 'أفكاري' })} ({myIdeas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t({ en: 'AI-Powered Idea Submission', ar: 'تقديم فكرة بمساعدة الذكاء الاصطناعي' })}
              </CardTitle>
              <CardDescription>
                {t({ en: 'Describe your idea and let AI help you refine it', ar: 'صف فكرتك ودع الذكاء الاصطناعي يساعدك في تحسينها' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step indicator */}
              <div className="flex items-center justify-center gap-4 mb-6">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {step}
                    </div>
                    {step < 2 && <div className={`w-12 h-1 mx-2 ${currentStep > step ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                ))}
              </div>

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Describe Your Idea', ar: 'صف فكرتك' })}
                    </label>
                    <Textarea
                      value={initialIdea}
                      onChange={(e) => setInitialIdea(e.target.value)}
                      placeholder={t({ en: 'What problem do you want to solve? What is your idea?', ar: 'ما المشكلة التي تريد حلها؟ ما هي فكرتك؟' })}
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Related Municipality (Optional)', ar: 'البلدية المعنية (اختياري)' })}
                    </label>
                    <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                      <SelectTrigger>
                        <SelectValue placeholder={t({ en: 'Select municipality', ar: 'اختر البلدية' })} />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {language === 'ar' ? m.name_ar : m.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleAIGenerate} 
                    disabled={isAIProcessing || !initialIdea.trim()}
                    className="w-full"
                  >
                    {isAIProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t({ en: 'Analyzing...', ar: 'جاري التحليل...' })}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t({ en: 'Analyze with AI', ar: 'تحليل بالذكاء الاصطناعي' })}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t({ en: 'Title (English)', ar: 'العنوان (إنجليزي)' })}
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t({ en: 'Title (Arabic)', ar: 'العنوان (عربي)' })}
                      </label>
                      <Input
                        value={formData.title_ar}
                        onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                        dir="rtl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Description', ar: 'الوصف' })}
                    </label>
                    <Textarea
                      value={language === 'ar' ? formData.description_ar : formData.description}
                      onChange={(e) => setFormData({
                        ...formData, 
                        [language === 'ar' ? 'description_ar' : 'description']: e.target.value
                      })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {t({ en: 'Category', ar: 'الفئة' })}
                    </label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">{t({ en: 'Infrastructure', ar: 'البنية التحتية' })}</SelectItem>
                        <SelectItem value="environment">{t({ en: 'Environment', ar: 'البيئة' })}</SelectItem>
                        <SelectItem value="digital_services">{t({ en: 'Digital Services', ar: 'الخدمات الرقمية' })}</SelectItem>
                        <SelectItem value="public_safety">{t({ en: 'Public Safety', ar: 'السلامة العامة' })}</SelectItem>
                        <SelectItem value="transportation">{t({ en: 'Transportation', ar: 'النقل' })}</SelectItem>
                        <SelectItem value="other">{t({ en: 'Other', ar: 'أخرى' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.ai_summary && (
                    <div className="p-4 bg-muted/50 rounded-lg" dir={isRTL ? 'rtl' : 'ltr'}>
                      <p className="text-sm font-medium mb-2">{t({ en: 'AI Summary', ar: 'ملخص الذكاء الاصطناعي' })}</p>
                      <p className={`text-sm text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>{formData.ai_summary}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t({ en: 'Back', ar: 'رجوع' })}
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="flex-1">
                      {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {t({ en: 'Submit Idea', ar: 'إرسال الفكرة' })}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-ideas" className="space-y-4">
          {ideasLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : myIdeas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t({ en: 'No ideas submitted yet', ar: 'لم تقدم أي أفكار بعد' })}</p>
              </CardContent>
            </Card>
          ) : (
            myIdeas.map((idea) => (
              <Card 
                key={idea.id} 
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedIdea?.id === idea.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedIdea(selectedIdea?.id === idea.id ? null : idea)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColors[idea.status] || statusColors.submitted}>
                          {idea.status?.replace(/_/g, ' ')}
                        </Badge>
                        {idea.votes_count > 0 && (
                          <Badge variant="outline">{idea.votes_count} votes</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{idea.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span><Clock className="h-3 w-3 inline mr-1" />{new Date(idea.created_at).toLocaleDateString()}</span>
                        {idea.category && <span>• {idea.category}</span>}
                      </div>
                    </div>
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  </div>

                  {/* Show workflow when expanded */}
                  {selectedIdea?.id === idea.id && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-4">{t({ en: 'Idea Progress', ar: 'تقدم الفكرة' })}</h4>
                      <InnovationProposalWorkflowTab proposal={idea} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </CitizenPageLayout>
  );
}

export default ProtectedPage(CitizenIdeaSubmission, { requiredPermissions: [] });
