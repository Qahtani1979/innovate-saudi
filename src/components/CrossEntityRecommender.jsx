import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from './LanguageContext';
import { Sparkles, Loader2, ArrowRight, Target, TestTube, Microscope, Megaphone, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';

export default function CrossEntityRecommender({ sourceEntity, sourceType, recommendations = ['rdcalls', 'rdprojects', 'pilots', 'challenges'] }) {
  const { language, isRTL, t } = useLanguage();
  const [results, setResults] = useState(null);
  const { invokeAI, status, isLoading, isAvailable, rateLimitInfo } = useAIWithFallback();

  const handleRecommend = async () => {
    try {
      const context = `
        Source: ${sourceType}
        Title: ${sourceEntity.title_en || sourceEntity.name_en}
        Description: ${sourceEntity.description_en || sourceEntity.abstract_en || ''}
        Sector: ${sourceEntity.sector || sourceEntity.research_area || ''}
        ${sourceType === 'Challenge' ? `Root Cause: ${sourceEntity.root_cause_en || ''}` : ''}
        ${sourceType === 'Pilot' ? `Success Probability: ${sourceEntity.success_probability}%` : ''}
        ${sourceType === 'RDProject' ? `TRL: ${sourceEntity.trl_current}` : ''}
      `;

      const rdCalls = recommendations.includes('rdcalls') ? await base44.entities.RDCall.filter({ status: 'open' }) : [];
      const rdProjects = recommendations.includes('rdprojects') ? await base44.entities.RDProject.filter({ is_published: true }) : [];
      const pilots = recommendations.includes('pilots') ? await base44.entities.Pilot.filter({ stage: 'active' }) : [];
      const challenges = recommendations.includes('challenges') ? await base44.entities.Challenge.filter({ status: 'approved' }) : [];

      const result = await invokeAI({
        prompt: `Analyze and recommend related entities for this ${sourceType}:

${context}

Available entities to match:
${recommendations.includes('rdcalls') ? `R&D Calls: ${rdCalls.slice(0, 10).map(c => `${c.title_en} (${c.call_type})`).join(', ')}` : ''}
${recommendations.includes('rdprojects') ? `R&D Projects: ${rdProjects.slice(0, 10).map(p => `${p.title_en} (TRL ${p.trl_current})`).join(', ')}` : ''}
${recommendations.includes('pilots') ? `Pilots: ${pilots.slice(0, 10).map(p => `${p.title_en} (${p.sector})`).join(', ')}` : ''}
${recommendations.includes('challenges') ? `Challenges: ${challenges.slice(0, 10).map(c => `${c.title_en} (${c.sector})`).join(', ')}` : ''}

Return top 3-5 recommendations for EACH entity type with:
- Entity ID (match from the provided lists)
- Match score (0-100)
- Reason for match (bilingual EN/AR)
- Recommended action (bilingual EN/AR)`,
        response_json_schema: {
          type: 'object',
          properties: {
            rdcall_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entity_id: { type: 'string' },
                  match_score: { type: 'number' },
                  reason_en: { type: 'string' },
                  reason_ar: { type: 'string' },
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' }
                }
              }
            },
            rdproject_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entity_id: { type: 'string' },
                  match_score: { type: 'number' },
                  reason_en: { type: 'string' },
                  reason_ar: { type: 'string' },
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' }
                }
              }
            },
            pilot_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entity_id: { type: 'string' },
                  match_score: { type: 'number' },
                  reason_en: { type: 'string' },
                  reason_ar: { type: 'string' },
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' }
                }
              }
            },
            challenge_recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  entity_id: { type: 'string' },
                  match_score: { type: 'number' },
                  reason_en: { type: 'string' },
                  reason_ar: { type: 'string' },
                  action_en: { type: 'string' },
                  action_ar: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (result.success) {
        // Enrich with actual entities
        const enriched = {
          rdcalls: result.data.rdcall_recommendations?.map(r => ({
            ...r,
            entity: rdCalls.find(c => c.id === r.entity_id)
          })).filter(r => r.entity) || [],
          rdprojects: result.data.rdproject_recommendations?.map(r => ({
            ...r,
            entity: rdProjects.find(p => p.id === r.entity_id)
          })).filter(r => r.entity) || [],
          pilots: result.data.pilot_recommendations?.map(r => ({
            ...r,
            entity: pilots.find(p => p.id === r.entity_id)
          })).filter(r => r.entity) || [],
          challenges: result.data.challenge_recommendations?.map(r => ({
            ...r,
            entity: challenges.find(c => c.id === r.entity_id)
          })).filter(r => r.entity) || []
        };

        setResults(enriched);
      }
    } catch (error) {
      toast.error(t({ en: 'Failed to generate recommendations', ar: 'فشل توليد التوصيات' }));
    }
  };

  const getEntityIcon = (type) => {
    const icons = {
      rdcalls: Megaphone,
      rdprojects: Microscope,
      pilots: TestTube,
      challenges: Target
    };
    return icons[type] || LinkIcon;
  };

  const getEntityUrl = (type, id) => {
    const pages = {
      rdcalls: 'RDCallDetail',
      rdprojects: 'RDProjectDetail',
      pilots: 'PilotDetail',
      challenges: 'ChallengeDetail'
    };
    return createPageUrl(`${pages[type]}?id=${id}`);
  };

  const getEntityTitle = (type) => {
    const titles = {
      rdcalls: { en: 'R&D Calls', ar: 'دعوات البحث' },
      rdprojects: { en: 'R&D Projects', ar: 'مشاريع البحث' },
      pilots: { en: 'Pilots', ar: 'التجارب' },
      challenges: { en: 'Challenges', ar: 'التحديات' }
    };
    return titles[type]?.[language] || type;
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <LinkIcon className="h-5 w-5" />
            {t({ en: 'AI Smart Connections', ar: 'الربط الذكي' })}
          </CardTitle>
          <Button onClick={handleRecommend} disabled={isLoading || !isAvailable} size="sm" className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? (
              <>
                <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                {t({ en: 'Finding...', ar: 'جاري البحث...' })}
              </>
            ) : (
              <>
                <Sparkles className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t({ en: 'Find Connections', ar: 'إيجاد الروابط' })}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <AIStatusIndicator status={status} rateLimitInfo={rateLimitInfo} showDetails />
        
        {!results && !isLoading && (
          <div className="text-center py-6">
            <LinkIcon className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'Discover related R&D calls, projects, pilots, and challenges using AI', ar: 'اكتشف دعوات البحث والمشاريع والتجارب والتحديات ذات الصلة بالذكاء الاصطناعي' })}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className={`${isRTL ? 'mr-3' : 'ml-3'} text-slate-600`}>
              {t({ en: 'Analyzing connections...', ar: 'جاري تحليل الروابط...' })}
            </span>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            {Object.entries(results).map(([type, items]) => {
              if (!items || items.length === 0) return null;
              const Icon = getEntityIcon(type);
              
              return (
                <div key={type}>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-purple-600" />
                    {getEntityTitle(type)}
                  </h4>
                  <div className="space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-purple-100 text-purple-700">
                                {item.match_score}% {t({ en: 'match', ar: 'تطابق' })}
                              </Badge>
                              {item.entity?.code && (
                                <Badge variant="outline">{item.entity.code}</Badge>
                              )}
                            </div>
                            <Link to={getEntityUrl(type, item.entity_id)} className="font-medium text-slate-900 hover:text-purple-600">
                              {language === 'ar' && item.entity?.title_ar ? item.entity.title_ar : (item.entity?.title_en || item.entity?.name_en)}
                            </Link>
                            <p className="text-sm text-slate-600 mt-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              {language === 'ar' ? item.reason_ar : item.reason_en}
                            </p>
                            <p className="text-xs text-purple-700 mt-2 font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                              💡 {language === 'ar' ? item.action_ar : item.action_en}
                            </p>
                          </div>
                          <Link to={getEntityUrl(type, item.entity_id)}>
                            <Button size="sm" variant="outline">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
