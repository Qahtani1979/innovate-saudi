import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Target, TestTube, Microscope, Calendar, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChallengeTrackAssignmentDecision({ challenge, onClose }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedTracks, setSelectedTracks] = useState(challenge.tracks || []);
  const [rationale, setRationale] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);

  const tracks = [
    { 
      id: 'pilot', 
      icon: TestTube, 
      name: { en: 'Pilot Testing', ar: 'التجريب' },
      description: { en: 'Test innovative solutions in real-world conditions', ar: 'اختبار حلول مبتكرة في ظروف حقيقية' }
    },
    { 
      id: 'r_and_d', 
      icon: Microscope, 
      name: { en: 'Research & Development', ar: 'البحث والتطوير' },
      description: { en: 'Fund research to develop new approaches', ar: 'تمويل بحث لتطوير نهج جديد' }
    },
    { 
      id: 'program', 
      icon: Calendar, 
      name: { en: 'Innovation Program', ar: 'برنامج ابتكار' },
      description: { en: 'Launch challenge-based program to source solutions', ar: 'إطلاق برنامج قائم على التحديات' }
    },
    { 
      id: 'procurement', 
      icon: Shield, 
      name: { en: 'Direct Procurement', ar: 'المشتريات المباشرة' },
      description: { en: 'Acquire off-the-shelf solution', ar: 'شراء حل جاهز' }
    },
    { 
      id: 'policy', 
      icon: Shield, 
      name: { en: 'Policy Recommendation', ar: 'توصية سياسات' },
      description: { en: 'Develop policy to address challenge', ar: 'تطوير سياسة لمعالجة التحدي' }
    }
  ];

  const handleAISuggestion = async () => {
    setAiProcessing(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this municipal challenge and recommend treatment tracks:

Challenge: ${challenge.title_en}
Description: ${challenge.description_en || 'N/A'}
Sector: ${challenge.sector}
Problem Statement: ${challenge.problem_statement_en || 'N/A'}
Root Cause: ${challenge.root_cause_en || 'N/A'}
Budget Estimate: ${challenge.budget_estimate || 'N/A'}
Timeline: ${challenge.timeline_estimate || 'N/A'}

Available tracks: pilot, r_and_d, program, procurement, policy

Recommend which track(s) are most appropriate and provide brief rationale for each.`,
        response_json_schema: {
          type: 'object',
          properties: {
            recommended_tracks: { type: 'array', items: { type: 'string' } },
            rationale: { type: 'string' },
            track_justifications: {
              type: 'object',
              properties: {
                pilot: { type: 'string' },
                r_and_d: { type: 'string' },
                program: { type: 'string' },
                procurement: { type: 'string' },
                policy: { type: 'string' }
              }
            }
          }
        }
      });

      setSelectedTracks(result.recommended_tracks || []);
      setRationale(result.rationale || '');
      toast.success(t({ en: 'AI recommendations loaded', ar: 'تم تحميل التوصيات الذكية' }));
    } catch (error) {
      toast.error(t({ en: 'AI suggestion failed', ar: 'فشلت التوصية الذكية' }));
    } finally {
      setAiProcessing(false);
    }
  };

  const assignMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      
      await base44.entities.Challenge.update(challenge.id, {
        tracks: selectedTracks,
        track_assignment_rationale: rationale,
        track_assigned_by: user.email,
        track_assigned_date: new Date().toISOString()
      });

      // Log activity
      await base44.entities.SystemActivity.create({
        entity_type: 'Challenge',
        entity_id: challenge.id,
        activity_type: 'track_assigned',
        description: `Treatment tracks assigned: ${selectedTracks.join(', ')}`,
        performed_by: user.email,
        timestamp: new Date().toISOString(),
        metadata: { tracks: selectedTracks, rationale }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge']);
      toast.success(t({ en: 'Tracks assigned successfully', ar: 'تم تعيين المسارات بنجاح' }));
      onClose?.();
    }
  });

  return (
    <Card className="border-2 border-blue-400 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="h-5 w-5" />
            {t({ en: 'Treatment Track Assignment', ar: 'تعيين مسار المعالجة' })}
          </CardTitle>
          <Button
            onClick={handleAISuggestion}
            disabled={aiProcessing}
            variant="outline"
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t({ en: 'AI Suggest', ar: 'اقتراح ذكي' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-slate-600">
          {t({ 
            en: 'Select one or more treatment tracks for this challenge. Multiple tracks can be pursued simultaneously.',
            ar: 'اختر مسار معالجة واحد أو أكثر لهذا التحدي. يمكن اتباع مسارات متعددة في آن واحد.'
          })}
        </p>

        {/* Track Selection */}
        <div className="space-y-3">
          {tracks.map((track) => {
            const Icon = track.icon;
            const isSelected = selectedTracks.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isSelected) {
                    setSelectedTracks(selectedTracks.filter(t => t !== track.id));
                  } else {
                    setSelectedTracks([...selectedTracks, track.id]);
                  }
                }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'bg-blue-50 border-blue-400' : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg ${isSelected ? 'bg-blue-600' : 'bg-slate-200'} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{t(track.name)}</h4>
                      {isSelected && (
                        <Badge className="bg-blue-600 text-white">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t({ en: 'Selected', ar: 'محدد' })}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{t(track.description)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rationale */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            {t({ en: 'Assignment Rationale', ar: 'مبرر التعيين' })}
          </label>
          <Textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder={t({ en: 'Explain why these tracks were selected...', ar: 'اشرح لماذا تم اختيار هذه المسارات...' })}
            rows={4}
          />
        </div>

        {/* Submit */}
        <Button
          onClick={() => assignMutation.mutate()}
          disabled={selectedTracks.length === 0 || assignMutation.isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600"
          size="lg"
        >
          <Target className="h-5 w-5 mr-2" />
          {t({ en: 'Assign Tracks', ar: 'تعيين المسارات' })}
        </Button>
      </CardContent>
    </Card>
  );
}