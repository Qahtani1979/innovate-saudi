import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from '../LanguageContext';
import { Zap, Play, RefreshCw, Loader2, Settings2 } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { useTaxonomy } from '@/hooks/useTaxonomy';
import { getSystemPrompt } from '@/lib/saudiContext';
import {
  buildWhatIfSimulatorPrompt,
  whatIfSimulatorSchema,
  WHAT_IF_SIMULATOR_SYSTEM_PROMPT
} from '@/lib/ai/prompts/ecosystem/simulationPrompts';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export default function WhatIfSimulator({ currentState }) {
  const { language, isRTL, t } = useLanguage();
  const { sectors, isLoading: taxonomyLoading } = useTaxonomy();

  const [selectedSectorIds, setSelectedSectorIds] = useState([]);
  const [budgetAllocation, setBudgetAllocation] = useState({});
  const [predictions, setPredictions] = useState(null);
  const [showSectorSelector, setShowSectorSelector] = useState(false);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  useEffect(() => {
    if (sectors.length > 0 && selectedSectorIds.length === 0) {
      const initialSectors = sectors.slice(0, 4).map(s => s.id);
      setSelectedSectorIds(initialSectors);

      const equalShare = Math.floor(100 / initialSectors.length);
      const allocation = {};
      initialSectors.forEach((id, idx) => {
        allocation[id] = idx === initialSectors.length - 1
          ? 100 - (equalShare * (initialSectors.length - 1))
          : equalShare;
      });
      setBudgetAllocation(allocation);
    }
  }, [sectors]);

  const toggleSector = (sectorId) => {
    setSelectedSectorIds(prev => {
      const isSelected = prev.includes(sectorId);
      let newSelection;

      if (isSelected) {
        if (prev.length <= 2) return prev;
        newSelection = prev.filter(id => id !== sectorId);
      } else {
        if (prev.length >= 6) return prev;
        newSelection = [...prev, sectorId];
      }

      const equalShare = Math.floor(100 / newSelection.length);
      const newAllocation = {};
      newSelection.forEach((id, idx) => {
        newAllocation[id] = idx === newSelection.length - 1
          ? 100 - (equalShare * (newSelection.length - 1))
          : equalShare;
      });
      setBudgetAllocation(newAllocation);

      return newSelection;
    });
  };

  const getSectorName = (sectorId) => {
    const sector = sectors.find(s => s.id === sectorId);
    if (!sector) return sectorId;
    return language === 'ar' ? (sector.name_ar || sector.name_en) : sector.name_en;
  };

  const runSimulation = async () => {
    const sectorNames = selectedSectorIds.map(id => getSectorName(id));
    const allocationText = selectedSectorIds.map(id =>
      `${getSectorName(id)}: ${budgetAllocation[id]}%`
    ).join(', ');

    const result = await invokeAI({
      system_prompt: getSystemPrompt(WHAT_IF_SIMULATOR_SYSTEM_PROMPT),
      prompt: buildWhatIfSimulatorPrompt(sectorNames, allocationText),
      response_json_schema: whatIfSimulatorSchema
    });

    if (result.success && result.data?.kpi_changes) {
      setPredictions(result.data.kpi_changes);
    }
  };

  const reset = () => {
    if (sectors.length > 0) {
      const initialSectors = sectors.slice(0, 4).map(s => s.id);
      setSelectedSectorIds(initialSectors);
      const equalShare = Math.floor(100 / initialSectors.length);
      const allocation = {};
      initialSectors.forEach((id, idx) => {
        allocation[id] = idx === initialSectors.length - 1
          ? 100 - (equalShare * (initialSectors.length - 1))
          : equalShare;
      });
      setBudgetAllocation(allocation);
    }
    setPredictions(null);
  };

  if (taxonomyLoading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-purple-900">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t({ en: 'What-If Simulator', ar: 'محاكي السيناريوهات' })}
          </div>
          <Badge variant="outline" className="text-xs">
            {selectedSectorIds.length} {t({ en: 'sectors', ar: 'قطاعات' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />

        {/* Sector Selector */}
        <Collapsible open={showSectorSelector} onOpenChange={setShowSectorSelector}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                {t({ en: 'Configure Sectors', ar: 'تكوين القطاعات' })}
              </span>
              <span className="text-xs text-muted-foreground">
                {t({ en: '2-6 sectors', ar: '2-6 قطاعات' })}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg">
              {sectors.map(sector => (
                <label
                  key={sector.id}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-background/50 p-1.5 rounded"
                >
                  <Checkbox
                    checked={selectedSectorIds.includes(sector.id)}
                    onCheckedChange={() => toggleSector(sector.id)}
                    disabled={
                      (selectedSectorIds.includes(sector.id) && selectedSectorIds.length <= 2) ||
                      (!selectedSectorIds.includes(sector.id) && selectedSectorIds.length >= 6)
                    }
                  />
                  <span className="truncate">
                    {language === 'ar' ? (sector.name_ar || sector.name_en) : sector.name_en}
                  </span>
                </label>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Budget Sliders */}
        <div className="space-y-4">
          {selectedSectorIds.map(sectorId => (
            <div key={sectorId}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium truncate max-w-[60%]">
                  {getSectorName(sectorId)}
                </span>
                <Badge>{budgetAllocation[sectorId] || 0}%</Badge>
              </div>
              <Slider
                value={[budgetAllocation[sectorId] || 0]}
                onValueChange={([val]) => setBudgetAllocation({ ...budgetAllocation, [sectorId]: val })}
                max={50}
                step={5}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={runSimulation} disabled={isLoading || !isAvailable} className="flex-1 bg-purple-600">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            {t({ en: 'Run Simulation', ar: 'تشغيل المحاكاة' })}
          </Button>
          <Button onClick={reset} variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {predictions && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-slate-900">{t({ en: 'Predicted Impact', ar: 'التأثير المتوقع' })}</h4>
            {predictions.map((pred, idx) => (
              <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {language === 'ar' ? pred.kpi_ar : pred.kpi_en}
                  </p>
                  <Badge className={pred.change_percent > 0 ? 'bg-green-600' : 'bg-red-600'}>
                    {pred.change_percent > 0 ? '+' : ''}{pred.change_percent}%
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-slate-600">{pred.current} → {pred.predicted}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
