import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Send, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ProtectedPage from '../components/permissions/ProtectedPage';

function PublicIdeaSubmission() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    location: '',
    citizen_name: '',
    citizen_email: '',
    is_anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // AI Pre-Screening with structured criteria
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `AI Pre-Screen this citizen idea for quality and appropriateness:

Title: ${data.title}
Description: ${data.description}

Assess the following criteria:
1. Clarity Score (0-100): How clear and understandable is the idea?
2. Feasibility Score (0-100): Initial feasibility assessment
3. Sentiment Score (-1 to 1): Is this positive (suggestion) or negative (complaint)?
4. Toxicity Score (0-100): Check for profanity, hate speech, spam
5. Is Duplicate: Does this seem like a common/repetitive idea?
6. Auto Recommendation: approve | review_required | reject_spam | reject_toxic | merge_duplicate
7. Suggested Category: transport | environment | digital_services | safety | health | education | other
8. Priority Score (0-100): Based on urgency and impact`,
        response_json_schema: {
          type: "object",
          properties: {
            clarity_score: { type: "number" },
            feasibility_score: { type: "number" },
            sentiment_score: { type: "number" },
            toxicity_score: { type: "number" },
            is_duplicate: { type: "boolean" },
            auto_recommendation: { type: "string" },
            suggested_category: { type: "string" },
            priority_score: { type: "number" }
          }
        }
      });

      // Block toxic content
      if (aiResponse.toxicity_score > 70 || aiResponse.auto_recommendation === 'reject_toxic') {
        throw new Error('Content flagged for review. Please revise your submission.');
      }

      // Block spam
      if (aiResponse.auto_recommendation === 'reject_spam') {
        throw new Error('Submission appears to be spam. Please provide a genuine idea.');
      }

      const newIdea = await base44.entities.CitizenIdea.create({
        ...data,
        ai_pre_screening: aiResponse,
        ai_classification: aiResponse, // Legacy support
        status: 'submitted'
      });

      // Award points
      if (data.citizen_email) {
        await base44.functions.invoke('pointsAutomation', {
          eventType: 'idea_submitted',
          ideaId: newIdea.id,
          citizenEmail: data.citizen_email
        });

        // Send notification
        await base44.functions.invoke('autoNotificationTriggers', {
          entity_name: 'CitizenIdea',
          entity_id: newIdea.id,
          old_status: null,
          new_status: 'submitted',
          citizen_email: data.citizen_email
        });
      }

      return newIdea;
    },
    onSuccess: () => {
      // Auto-generate embedding for duplicate detection
      base44.functions.invoke('generateEmbeddings', {
        entity_name: 'CitizenIdea',
        mode: 'missing'
      }).catch(err => console.error('Embedding generation failed:', err));
      setSubmitted(true);
      toast.success('Idea submitted successfully!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full border-2 border-green-300">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Thank You! | شكراً لك!
            </h2>
            <p className="text-slate-600 mb-6">
              Your idea has been submitted and will be reviewed by the municipality.
              <br />
              تم إرسال فكرتك وستتم مراجعتها من قبل البلدية.
            </p>
            <Button onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', category: 'other', location: '', citizen_name: '', citizen_email: '', is_anonymous: false }); }}>
              Submit Another Idea | إرسال فكرة أخرى
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 border-indigo-300">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-10 w-10" />
              <div>
                <CardTitle className="text-2xl">
                  Share Your Idea | شارك فكرتك
                </CardTitle>
                <p className="text-sm text-white/90 mt-1">
                  Help improve your city | ساعد في تحسين مدينتك
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title | العنوان *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Brief summary of your idea | ملخص موجز لفكرتك"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description | الوصف *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your idea in detail | صف فكرتك بالتفصيل"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category | الفئة *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="transport">Transport | النقل</option>
                  <option value="infrastructure">Infrastructure | البنية التحتية</option>
                  <option value="environment">Environment | البيئة</option>
                  <option value="digital_services">Digital Services | الخدمات الرقمية</option>
                  <option value="parks">Parks & Recreation | الحدائق والترفيه</option>
                  <option value="waste">Waste Management | إدارة النفايات</option>
                  <option value="safety">Safety | السلامة</option>
                  <option value="other">Other | أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Location | الموقع
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Specific area or neighborhood | منطقة أو حي محدد"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_anonymous}
                    onChange={(e) => setFormData({...formData, is_anonymous: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-slate-700">
                    Submit anonymously | إرسال بشكل مجهول
                  </span>
                </label>
              </div>

              {!formData.is_anonymous && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Name | اسمك (optional | اختياري)
                    </label>
                    <Input
                      value={formData.citizen_name}
                      onChange={(e) => setFormData({...formData, citizen_name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email | البريد الإلكتروني (optional | اختياري)
                    </label>
                    <Input
                      type="email"
                      value={formData.citizen_email}
                      onChange={(e) => setFormData({...formData, citizen_email: e.target.value})}
                      placeholder="To receive updates | لتلقي التحديثات"
                    />
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                disabled={submitMutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-12 text-lg"
              >
                <Send className="h-5 w-5 mr-2" />
                {submitMutation.isPending ? 'Submitting... | جاري الإرسال...' : 'Submit Idea | إرسال الفكرة'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProtectedPage(PublicIdeaSubmission, { requiredPermissions: [] });