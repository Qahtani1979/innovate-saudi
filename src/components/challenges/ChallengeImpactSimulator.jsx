import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { useAIWithFallback } from '@/hooks/useAIWithFallback';
import AIStatusIndicator from '@/components/ai/AIStatusIndicator';
import { 
  IMPACT_SIMULATOR_SYSTEM_PROMPT, 
  buildImpactSimulationPrompt, 
  IMPACT_SIMULATION_SCHEMA 
} from '@/lib/ai/prompts/challenges/impactSimulator';

export default function ChallengeImpactSimulator({ challenge }) {
  const [scenario, setScenario] = useState({
    budget_allocated: challenge.budget_estimate || 500000,
    timeline_months: 12,
    resource_level: 50,
    stakeholder_buy_in: 70
  });
  const [results, setResults] = useState(null);

  const { invokeAI, status, error, rateLimitInfo, isLoading, isAvailable } = useAIWithFallback({
    showToasts: true,
    fallbackData: null
  });

  const runSimulation = async () => {
    const response = await invokeAI({
      prompt: buildImpactSimulationPrompt({ challenge, scenario }),
      system_prompt: IMPACT_SIMULATOR_SYSTEM_PROMPT,
      response_json_schema: IMPACT_SIMULATION_SCHEMA
    });

    if (response.success) {
      setResults(response.data);
    }
  };

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Impact Simulator (What-If Analysis)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AIStatusIndicator status={status} error={error} rateLimitInfo={rateLimitInfo} showDetails />
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Budget Allocated: {scenario.budget_allocated.toLocaleString()} SAR
            </label>
            <Slider
              value={[scenario.budget_allocated]}
              onValueChange={([val]) => setScenario({ ...scenario, budget_allocated: val })}
              min={100000}
              max={5000000}
              step={50000}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Timeline: {scenario.timeline_months} months
            </label>
            <Slider
              value={[scenario.timeline_months]}
              onValueChange={([val]) => setScenario({ ...scenario, timeline_months: val })}
              min={3}
              max={36}
              step={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Resource Level: {scenario.resource_level}%
            </label>
            <Slider
              value={[scenario.resource_level]}
              onValueChange={([val]) => setScenario({ ...scenario, resource_level: val })}
              min={0}
              max={100}
              step={10}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Stakeholder Buy-in: {scenario.stakeholder_buy_in}%
            </label>
            <Slider
              value={[scenario.stakeholder_buy_in]}
              onValueChange={([val]) => setScenario({ ...scenario, stakeholder_buy_in: val })}
              min={0}
              max={100}
              step={10}
            />
          </div>
        </div>

        <Button 
          onClick={runSimulation} 
          disabled={isLoading || !isAvailable} 
          className="w-full bg-purple-600"
        >
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Sparkles className="h-4 w-4 mr-2" />
          Run AI Impact Simulation
        </Button>

        {results && (
          <div className="mt-4 space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-300">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded">
                <p className="text-xs text-slate-600">Success Probability</p>
                <p className="text-2xl font-bold text-green-600">{results.success_probability}%</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="text-xs text-slate-600">Expected Impact</p>
                <p className="text-2xl font-bold text-blue-600">{results.expected_impact_score}/100</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="text-xs text-slate-600">Population Benefited</p>
                <p className="text-lg font-bold text-purple-600">{results.population_benefited?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white rounded">
                <p className="text-xs text-slate-600">ROI Multiplier</p>
                <p className="text-2xl font-bold text-orange-600">{results.roi_multiplier}x</p>
              </div>
            </div>

            <div>
              <Badge className={
                results.risk_level === 'low' ? 'bg-green-600' :
                results.risk_level === 'medium' ? 'bg-yellow-600' :
                'bg-red-600'
              }>
                Risk: {results.risk_level}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 mb-1">Recommendations:</p>
              <ul className="space-y-1">
                {results.recommendations?.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-600">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
