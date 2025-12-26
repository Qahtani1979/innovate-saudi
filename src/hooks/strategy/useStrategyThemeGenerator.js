import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import { toast } from 'sonner';

export function useStrategyThemeGenerator() {
    const { invokeAI, isLoading: aiLoading } = useAIWithFallback();

    const generateThemes = useMutation({
        mutationFn: async ({ selectedPlan }) => {
            if (!selectedPlan) throw new Error('No plan selected');

            // Try edge function first
            try {
                const { data, error } = await supabase.functions.invoke('strategy-program-theme-generator', {
                    body: {
                        strategic_goals: selectedPlan.objectives || selectedPlan.strategic_objectives,
                        sector_focus: selectedPlan.sector_id || 'general'
                    }
                });

                if (!error && data?.themes?.length > 0) {
                    return data.themes;
                }
            } catch (e) {
                console.log('Edge function fallback to AI hook:', e);
            }

            // Fallback to AI hook
            const result = await invokeAI({
                prompt: `Generate 3-5 strategic program themes for an innovation program.
        
Strategic Plan: ${selectedPlan.name_en || selectedPlan.title_en}
Vision: ${selectedPlan.vision_en || selectedPlan.description_en || ''}
Strategic Objectives: ${JSON.stringify(selectedPlan.objectives || selectedPlan.strategic_objectives || [])}

For each theme provide:
- Theme Name (bilingual: English and Arabic)
- Description (2-3 sentences, bilingual)
- Key Objectives (3 bullet points)
- Target Outcomes (3 measurable outcomes)
- Recommended Program Type (capacity_building, innovation_challenge, mentorship, etc.)`,
                response_json_schema: {
                    type: 'object',
                    properties: {
                        themes: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name_en: { type: 'string' },
                                    name_ar: { type: 'string' },
                                    description_en: { type: 'string' },
                                    description_ar: { type: 'string' },
                                    objectives: { type: 'array', items: { type: 'string' } },
                                    target_outcomes: { type: 'array', items: { type: 'string' } },
                                    recommended_type: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            });

            if (result.success && result.data?.themes) {
                return result.data.themes;
            }

            // Fallback themes if everything fails
            return [
                {
                    name_en: 'Digital Municipal Services',
                    name_ar: 'الخدمات البلدية الرقمية',
                    description_en: 'Accelerating digital transformation across municipal services through innovation programs.',
                    description_ar: 'تسريع التحول الرقمي عبر الخدمات البلدية من خلال برامج الابتكار.',
                    objectives: ['Modernize legacy systems', 'Improve citizen access', 'Enhance service efficiency'],
                    target_outcomes: ['50% digital adoption', '30% faster processing', '25% cost reduction'],
                    recommended_type: 'capacity_building'
                },
                {
                    name_en: 'Sustainable Innovation',
                    name_ar: 'الابتكار المستدام',
                    description_en: 'Promoting environmentally conscious innovation solutions aligned with Saudi Vision 2030.',
                    description_ar: 'تعزيز حلول الابتكار الصديقة للبيئة المتوافقة مع رؤية المملكة 2030.',
                    objectives: ['Reduce carbon footprint', 'Promote green technology', 'Support circular economy'],
                    target_outcomes: ['20% carbon reduction', 'Green procurement increase', 'Waste reduction targets'],
                    recommended_type: 'innovation_challenge'
                },
                {
                    name_en: 'Citizen Engagement Excellence',
                    name_ar: 'التميز في مشاركة المواطن',
                    description_en: 'Building stronger connections between municipalities and citizens through innovation.',
                    description_ar: 'بناء روابط أقوى بين البلديات والمواطنين من خلال الابتكار.',
                    objectives: ['Increase participation', 'Improve feedback loops', 'Build public trust'],
                    target_outcomes: ['40% engagement rate', 'Faster response times', 'Higher satisfaction scores'],
                    recommended_type: 'mentorship'
                }
            ];
        },
        onError: (error) => {
            console.error('Theme generation error:', error);
            toast.error('Failed to generate themes');
        }
    });

    return {
        generateThemes,
        isGenerating: generateThemes.isPending || aiLoading,
        themes: generateThemes.data || []
    };
}
