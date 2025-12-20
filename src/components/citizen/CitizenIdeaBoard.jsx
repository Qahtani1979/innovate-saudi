import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ThumbsUp, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CitizenIdeaBoard() {
  const { t, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [idea, setIdea] = useState({ title: '', description: '', category: '' });

  // Fetch real ideas from citizen_ideas table
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['citizen-ideas-board'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('citizen_ideas')
        .select('id, title, description, category, votes_count, status, created_at')
        .eq('is_published', true)
        .order('votes_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch comments count for ideas
  const { data: commentCounts = {} } = useQuery({
    queryKey: ['idea-comment-counts'],
    queryFn: async () => {
      if (ideas.length === 0) return {};
      
      const { data, error } = await supabase
        .from('idea_comments')
        .select('idea_id')
        .in('idea_id', ideas.map(i => i.id));
      
      if (error) return {};
      
      const counts = {};
      data?.forEach(c => {
        counts[c.idea_id] = (counts[c.idea_id] || 0) + 1;
      });
      return counts;
    },
    enabled: ideas.length > 0
  });

  const submitMutation = useMutation({
    mutationFn: async (newIdea) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('citizen_ideas')
        .insert({
          title: newIdea.title,
          description: newIdea.description,
          category: newIdea.category || 'General',
          user_id: user?.id,
          status: 'pending',
          is_published: false,
          votes_count: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['citizen-ideas-board']);
      setIdea({ title: '', description: '', category: '' });
      toast.success(t({ en: 'Idea submitted for review', ar: 'تم إرسال الفكرة للمراجعة' }));
    },
    onError: (error) => {
      toast.error(t({ en: 'Failed to submit idea', ar: 'فشل في إرسال الفكرة' }));
      console.error('Submit error:', error);
    }
  });

  const handleSubmit = () => {
    if (!idea.title.trim()) {
      toast.error(t({ en: 'Please enter an idea title', ar: 'يرجى إدخال عنوان الفكرة' }));
      return;
    }
    submitMutation.mutate(idea);
  };

  const categories = ['Transport', 'Environment', 'Digital Services', 'Health', 'Education', 'Infrastructure'];

  return (
    <Card dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          {t({ en: 'Citizen Ideas Board', ar: 'لوحة أفكار المواطنين' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            placeholder={t({ en: 'Your idea title...', ar: 'عنوان فكرتك...' })}
            value={idea.title}
            onChange={(e) => setIdea({...idea, title: e.target.value})}
          />
          <Textarea
            placeholder={t({ en: 'Describe your idea...', ar: 'صف فكرتك...' })}
            value={idea.description}
            onChange={(e) => setIdea({...idea, description: e.target.value})}
            rows={3}
          />
          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={idea.category}
            onChange={(e) => setIdea({...idea, category: e.target.value})}
          >
            <option value="">{t({ en: 'Select category', ar: 'اختر الفئة' })}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600"
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Submit Idea', ar: 'إرسال الفكرة' })}
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium">{t({ en: 'Popular Ideas', ar: 'الأفكار الشائعة' })}</p>
          
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : ideas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              {t({ en: 'No ideas yet. Be the first to submit!', ar: 'لا توجد أفكار بعد. كن أول من يقدم!' })}
            </p>
          ) : (
            ideas.map(item => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.title}</p>
                    <Badge variant="outline" className="text-xs mt-1">{item.category || 'General'}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {item.votes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {commentCounts[item.id] || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
