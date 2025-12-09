import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const PROFILE_FIELDS = {
  linkedin_url: {
    en: 'Add your LinkedIn profile',
    ar: 'أضف ملفك على لينكد إن',
    type: 'url',
    placeholder: 'https://linkedin.com/in/yourprofile',
    priority: 1,
    impact: { en: 'Helps connect you with professionals', ar: 'يساعد في ربطك بالمحترفين' }
  },
  work_phone: {
    en: 'Add your work phone',
    ar: 'أضف هاتف العمل',
    type: 'tel',
    placeholder: '+966...',
    priority: 2,
    impact: { en: 'Enables direct collaboration', ar: 'يتيح التعاون المباشر' }
  },
  bio: {
    en: 'Tell us about yourself',
    ar: 'أخبرنا عن نفسك',
    type: 'textarea',
    placeholder: 'A brief description of your background and interests...',
    priority: 3,
    impact: { en: 'Helps others understand your expertise', ar: 'يساعد الآخرين على فهم خبراتك' }
  },
  expertise_areas: {
    en: 'Add your areas of expertise',
    ar: 'أضف مجالات خبرتك',
    type: 'tags',
    placeholder: 'e.g., Urban Planning, AI, Sustainability',
    priority: 4,
    impact: { en: 'Gets you matched to relevant opportunities', ar: 'يربطك بالفرص ذات الصلة' }
  },
  organization: {
    en: 'What organization do you work for?',
    ar: 'ما هي المنظمة التي تعمل بها؟',
    type: 'text',
    placeholder: 'Organization name',
    priority: 5,
    impact: { en: 'Connects you with colleagues', ar: 'يربطك بالزملاء' }
  }
};

export default function ProgressiveProfilingPrompt({ onComplete, onDismiss }) {
  const { user, userProfile } = useAuth();
  const { language, t } = useLanguage();
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userProfile || dismissed) return;

    // Find the highest priority missing field
    const missingFields = Object.entries(PROFILE_FIELDS)
      .filter(([field]) => {
        const value = userProfile[field];
        if (Array.isArray(value)) return value.length === 0;
        return !value || value === '';
      })
      .sort((a, b) => a[1].priority - b[1].priority);

    if (missingFields.length > 0) {
      const [field, config] = missingFields[0];
      setCurrentPrompt({ field, ...config });
    } else {
      setCurrentPrompt(null);
    }
  }, [userProfile, dismissed]);

  const handleSubmit = async () => {
    if (!inputValue.trim() || !currentPrompt || !user?.id) return;

    setIsSubmitting(true);
    try {
      let valueToSave = inputValue.trim();
      
      // Handle tags/arrays
      if (currentPrompt.type === 'tags') {
        valueToSave = inputValue.split(',').map(s => s.trim()).filter(Boolean);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ [currentPrompt.field]: valueToSave })
        .eq('user_id', user.id);

      if (error) throw error;

      // Log the completion
      await supabase.from('progressive_profiling_prompts').insert({
        user_id: user.id,
        prompt_type: 'field_completion',
        field_name: currentPrompt.field,
        is_completed: true,
        completed_at: new Date().toISOString()
      });

      toast.success(t({ en: 'Profile updated!', ar: 'تم تحديث الملف!' }));
      setInputValue('');
      onComplete?.(currentPrompt.field, valueToSave);
      
      // Move to next field
      setCurrentPrompt(null);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t({ en: 'Failed to update', ar: 'فشل التحديث' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!currentPrompt || !user?.id) return;

    try {
      // Log the dismissal
      await supabase.from('progressive_profiling_prompts').upsert({
        user_id: user.id,
        prompt_type: 'field_completion',
        field_name: currentPrompt.field,
        is_completed: false,
        dismissed_count: 1,
        last_shown_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,field_name'
      });
    } catch (err) {
      console.warn('Failed to log dismissal:', err);
    }

    setDismissed(true);
    onDismiss?.(currentPrompt.field);
  };

  if (!currentPrompt || dismissed) return null;

  const isArabic = language === 'ar';

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg animate-in slide-in-from-top-2">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-purple-100 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">
                  {isArabic ? currentPrompt.ar : currentPrompt.en}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {currentPrompt.impact[language] || currentPrompt.impact.en}
                </p>
              </div>
              
              <div className="flex gap-2">
                {currentPrompt.type === 'textarea' ? (
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentPrompt.placeholder}
                    className="text-sm"
                    rows={2}
                  />
                ) : (
                  <Input
                    type={currentPrompt.type === 'tags' ? 'text' : currentPrompt.type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={currentPrompt.placeholder}
                    className="text-sm"
                  />
                )}
                <Button 
                  size="sm" 
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isSubmitting}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-slate-400 hover:text-slate-600"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}