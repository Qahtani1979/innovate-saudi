import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calculator, Sparkles, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomatedMIICalculator({ municipalityId }) {
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [calculating, setCalculating] = useState(false);
  const [miiResult, setMiiResult] = useState(null);

  const calculateMII = async () => {
    setCalculating(true);
    try {
      const [challenges, pilots, solutions] = await Promise.all([
        base44.entities.Challenge.list(),
        base44.entities.Pilot.list(),
        base44.entities.Solution.list()
      ]);

      const muniChallenges = challenges.filter(c => c.municipality_id === municipalityId);
      const muniPilots = pilots.filter(p => p.municipality_id === municipalityId);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Calculate Municipal Innovation Index (MII) for municipality:

CHALLENGES: ${muniChallenges.length} (${muniChallenges.filter(c => c.status === 'resolved').length} resolved)
PILOTS: ${muniPilots.length} (${muniPilots.filter(p => p.stage === 'active').length} active, ${muniPilots.filter(p => p.stage === 'scaled').length} scaled)

Calculate MII score (0-100) based on:
1. Innovation Capacity (30%): active challenges + initiatives
2. Pilot Success (25%): pilot success rate
3. Scaling Achievement (25%): scaled pilots
4. Challenge Resolution (20%): resolved challenges

Provide dimension scores and overall MII.`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            dimensions: {
              type: "object",
              properties: {
                innovation_capacity: { type: "number" },
                pilot_success: { type: "number" },
                scaling_achievement: { type: "number" },
                challenge_resolution: { type: "number" }
              }
            },
            interpretation: { type: "string" },
            improvement_areas: { type: "array", items: { type: "string" } }
          }
        }
      });

      setMiiResult(response);
      
      await base44.entities.MIIResult.create({
        municipality_id: municipalityId,
        year: new Date().getFullYear(),
        quarter: Math.floor(new Date().getMonth() / 3) + 1,
        overall_score: response.overall_score,
        dimension_scores: response.dimensions,
        calculation_method: 'AI-automated'
      });

      queryClient.invalidateQueries(['mii-results']);
      toast.success(t({ en: 'MII calculated', ar: 'المؤشر محسوب' }));
    } catch (error) {
      toast.error(t({ en: 'Calculation failed', ar: 'فشل الحساب' }));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="border-2 border-amber-300">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            {t({ en: 'Automated MII Calculator', ar: 'حاسبة المؤشر التلقائية' })}
          </CardTitle>
          <Button onClick={calculateMII} disabled={calculating} size="sm" className="bg-amber-600">
            {calculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Calculate', ar: 'حساب' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!miiResult && !calculating && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-amber-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ en: 'AI calculates MII score across multiple dimensions', ar: 'الذكاء يحسب درجة المؤشر عبر أبعاد متعددة' })}
            </p>
          </div>
        )}

        {miiResult && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300 text-center">
              <Award className="h-10 w-10 text-amber-600 mx-auto mb-2" />
              <p className="text-5xl font-bold text-amber-600">{miiResult.overall_score}</p>
              <p className="text-sm text-slate-600 mt-1">{t({ en: 'MII Score', ar: 'درجة المؤشر' })}</p>
            </div>

            {miiResult.dimensions && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded border text-center">
                  <p className="text-2xl font-bold text-blue-600">{miiResult.dimensions.innovation_capacity}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Innovation Capacity', ar: 'القدرة' })}</p>
                </div>
                <div className="p-3 bg-green-50 rounded border text-center">
                  <p className="text-2xl font-bold text-green-600">{miiResult.dimensions.pilot_success}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Pilot Success', ar: 'نجاح التجارب' })}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded border text-center">
                  <p className="text-2xl font-bold text-purple-600">{miiResult.dimensions.scaling_achievement}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Scaling', ar: 'التوسع' })}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded border text-center">
                  <p className="text-2xl font-bold text-orange-600">{miiResult.dimensions.challenge_resolution}</p>
                  <p className="text-xs text-slate-600">{t({ en: 'Resolution', ar: 'الحل' })}</p>
                </div>
              </div>
            )}

            {miiResult.interpretation && (
              <div className="p-3 bg-slate-50 rounded border">
                <p className="text-sm text-slate-700">{miiResult.interpretation}</p>
              </div>
            )}

            {miiResult.improvement_areas?.length > 0 && (
              <div className="p-3 bg-orange-50 rounded border border-orange-300">
                <h4 className="font-semibold text-sm text-orange-900 mb-2">
                  {t({ en: '📈 Improvement Areas', ar: '📈 مجالات التحسين' })}
                </h4>
                <ul className="space-y-1">
                  {miiResult.improvement_areas.map((area, i) => (
                    <li key={i} className="text-sm text-slate-700">→ {area}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}