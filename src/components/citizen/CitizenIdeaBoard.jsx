import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ThumbsUp, MessageSquare, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CitizenIdeaBoard() {
  const { t } = useLanguage();
  const [idea, setIdea] = useState({ title: '', description: '', category: '' });

  const mockIdeas = [
    { id: 1, title: 'Smart Parking Solution', votes: 45, comments: 12, category: 'Transport' },
    { id: 2, title: 'Community Garden Program', votes: 38, comments: 8, category: 'Environment' },
    { id: 3, title: 'Digital Permit System', votes: 52, comments: 15, category: 'Digital Services' }
  ];

  const handleSubmit = () => {
    toast.success(t({ en: 'Idea submitted for review', ar: 'تم إرسال الفكرة' }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          {t({ en: 'Citizen Ideas Board', ar: 'لوحة أفكار المواطنين' })}
          <Badge className="ml-auto bg-amber-600">
            {t({ en: 'Partial', ar: 'جزئي' })}
          </Badge>
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
          <Button onClick={handleSubmit} className="w-full bg-blue-600">
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'Submit Idea', ar: 'إرسال الفكرة' })}
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <p className="text-sm font-medium">{t({ en: 'Popular Ideas', ar: 'الأفكار الشائعة' })}</p>
          {mockIdeas.map(item => (
            <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.title}</p>
                  <Badge variant="outline" className="text-xs mt-1">{item.category}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {item.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {item.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Missing features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Voting mechanism & gamification</li>
            <li>• Citizen authentication system</li>
            <li>• AI idea classification & duplication detection</li>
            <li>• Admin review & idea-to-challenge conversion</li>
            <li>• Engagement analytics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}