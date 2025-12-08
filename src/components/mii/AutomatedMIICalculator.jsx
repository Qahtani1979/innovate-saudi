import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Calculator, Sparkles, Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function AutomatedMIICalculator({ municipalityId }) {
  const { language, t } = useLanguage();
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);

  const { data: dimensions = [] } = useQuery({
    queryKey: ['mii-dimensions'],
    queryFn: async () => {
      const all = await base44.entities.MIIDimension.list();
      return all.filter(d => d.is_active);
    },
    initialData: []
  });

  const calculateMII = async () => {
    setCalculating(true);
    try {
      // Fetch all relevant data for the municipality
      const [challenges, pilots, municipality] = await Promise.all([
        base44.entities.Challenge.filter({ municipality_id: municipalityId }),
        base44.entities.Pilot.filter({ municipality_id: municipalityId }),
        base44.entities.Municipality.list().then(m => m.find(x => x.id === municipalityId))
      ]);

      const activeChallenges = challenges.filter(c => ['submitted', 'under_review', 'approved', 'in_treatment'].includes(c.status)).length;
      const resolvedChallenges = challenges.filter(c => c.status === 'resolved').length;
      const activePilots = pilots.filter(p => ['active', 'preparation'].includes(p.stage)).length;
      const completedPilots = pilots.filter(p => ['completed', 'scaled'].includes(p.stage)).length;
      const scaledPilots = pilots.filter(p => p.stage === 'scaled').length;

      // Calculate dimension scores
      const dimensionScores = dimensions.map(dim => {
        let rawScore = 0;
        
        // Sample scoring logic based on dimension
        if (dim.dimension_name_en?.includes('Innovation Capacity')) {
          rawScore = Math.min(100, (activeChallenges * 3) + (activePilots * 5));
        } else if (dim.dimension_name_en?.includes('Pilot Success')) {
          rawScore = pilots.length > 0 ? (completedPilots / pilots.length) * 100 : 0;
        } else if (dim.dimension_name_en?.includes('Scaling')) {
          rawScore = pilots.length > 0 ? (scaledPilots / pilots.length) * 100 : 0;
        } else if (dim.dimension_name_en?.includes('Challenge Resolution')) {
          rawScore = challenges.length > 0 ? (resolvedChallenges / challenges.length) * 100 : 0;
        } else {
          rawScore = 50; // Default baseline
        }

        return {
          dimension: dim.dimension_name_en,
          weight: dim.weight,
          rawScore: Math.min(100, rawScore),
          weightedScore: (Math.min(100, rawScore) * dim.weight) / 100
        };
      });

      const totalWeightedScore = dimensionScores.reduce((sum, d) => sum + d.weightedScore, 0);
      const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
      const finalScore = totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;

      setResult({
        finalScore,
        dimensionScores,
        metadata: {
          activeChallenges,
          resolvedChallenges,
          activePilots,
          completedPilots,
          scaledPilots
        }
      });

      toast.success(t({ en: 'MII calculated', ar: 'تم حساب المؤشر' }));
    } catch (error) {
      toast.error(t({ en: 'Calculation failed', ar: 'فشل الحساب' }));
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-purple-600" />
            {t({ en: 'Automated MII Calculator', ar: 'حاسبة المؤشر التلقائية' })}
          </CardTitle>
          <Button onClick={calculateMII} disabled={calculating || dimensions.length === 0} size="sm" className="bg-purple-600">
            {calculating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t({ en: 'Calculate', ar: 'احسب' })}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!result && !calculating && (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600">
              {t({ 
                en: `Automated MII calculation using ${dimensions.length} dimensions`, 
                ar: `حساب المؤشر التلقائي باستخدام ${dimensions.length} أبعاد` 
              })}
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-300 text-center">
              <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <p className="text-5xl font-bold text-purple-600 mb-2">{result.finalScore}</p>
              <p className="text-sm text-slate-600">{t({ en: 'MII Score', ar: 'درجة المؤشر' })}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-blue-50 rounded border text-center">
                <p className="font-bold text-blue-600">{result.metadata.activeChallenges}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Active Challenges', ar: 'تحديات نشطة' })}</p>
              </div>
              <div className="p-3 bg-green-50 rounded border text-center">
                <p className="font-bold text-green-600">{result.metadata.completedPilots}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Completed Pilots', ar: 'تجارب مكتملة' })}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded border text-center">
                <p className="font-bold text-purple-600">{result.metadata.scaledPilots}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Scaled Pilots', ar: 'تجارب موسعة' })}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded border text-center">
                <p className="font-bold text-amber-600">{result.metadata.resolvedChallenges}</p>
                <p className="text-xs text-slate-600">{t({ en: 'Resolved', ar: 'محلولة' })}</p>
              </div>
            </div>

            {result.dimensionScores?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-slate-700">
                  {t({ en: 'Dimension Breakdown', ar: 'تفصيل الأبعاد' })}
                </h4>
                {result.dimensionScores.map((dim, i) => (
                  <div key={i} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-900">{dim.dimension}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{dim.weight}% weight</Badge>
                        <span className="font-bold text-purple-600">{Math.round(dim.rawScore)}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${dim.rawScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}