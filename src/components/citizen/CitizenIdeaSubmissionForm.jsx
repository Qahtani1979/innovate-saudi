import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useEmailTrigger } from '@/hooks/useEmailTrigger';
import { useCitizenIdeas } from '@/hooks/useCitizenIdeas';

export default function CitizenIdeaSubmissionForm({ municipalityId }) {
  const { t } = useLanguage();
  const { triggerEmail } = useEmailTrigger();
  const { submitIdea } = useCitizenIdeas();

  const [ideaData, setIdeaData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'infrastructure',
    is_anonymous: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitIdea.mutate({
      title: ideaData.title,
      description: ideaData.description,
      municipality_id: municipalityId,
      category: ideaData.category,
      is_published: true, // Auto-publish for now or based on rules
      // user_id handled by RLS if needed, or explicitly set
    }, {
      onSuccess: async (feedback) => {
        // Trigger email notification for citizen idea submission
        await triggerEmail('citizen.idea_submitted', {
          entityType: 'citizen_feedback', // Keeping type for email compatibility if needed
          entityId: feedback.id,
          variables: {
            idea_title: ideaData.title,
            municipality_id: municipalityId,
            is_anonymous: String(ideaData.is_anonymous)
          }
        }).catch(err => console.error('Email trigger failed:', err));

        setIdeaData({ title: '', description: '', location: '', category: 'infrastructure', is_anonymous: false });
      }
    });
  };

  return (
    <Card className="border-2 border-blue-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-blue-600" />
          {t({ en: 'Submit Your Idea', ar: 'قدم فكرتك' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              {t({ en: 'Idea Title', ar: 'عنوان الفكرة' })}
            </label>
            <Input
              value={ideaData.title}
              onChange={(e) => setIdeaData({ ...ideaData, title: e.target.value })}
              placeholder={t({ en: 'Brief title for your idea...', ar: 'عنوان مختصر لفكرتك...' })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              {t({ en: 'Description', ar: 'الوصف' })}
            </label>
            <Textarea
              value={ideaData.description}
              onChange={(e) => setIdeaData({ ...ideaData, description: e.target.value })}
              placeholder={t({ en: 'Describe your idea in detail...', ar: 'اشرح فكرتك بالتفصيل...' })}
              rows={5}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              {t({ en: 'Location', ar: 'الموقع' })}
            </label>
            <Input
              value={ideaData.location}
              onChange={(e) => setIdeaData({ ...ideaData, location: e.target.value })}
              placeholder={t({ en: 'Where is this relevant?', ar: 'أين هذا ذو صلة؟' })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ideaData.is_anonymous}
              onChange={(e) => setIdeaData({ ...ideaData, is_anonymous: e.target.checked })}
              className="h-4 w-4"
            />
            <label className="text-sm text-slate-700">
              {t({ en: 'Submit anonymously', ar: 'تقديم مجهولاً' })}
            </label>
          </div>

          <Button
            type="submit"
            disabled={submitIdea.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Idea', ar: 'تقديم الفكرة' })}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}