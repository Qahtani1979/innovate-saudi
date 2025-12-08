import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function SmartRecommendation({ context }) {
  const [recommendations, setRecommendations] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateRecommendations();
  }, [context]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 2-3 smart recommendations for this context:

Page: ${context?.page || 'Home'}
Entity: ${context?.entityType || 'N/A'}
User Role: ${context?.userRole || 'user'}

Provide actionable suggestions like:
- "Create R&D Call" if on gap analysis
- "Launch Pilot" if viewing successful challenge
- "Budget allocation will miss target" if on budget tool

Each recommendation should have: title, description, action_url (page name), priority (high/medium/low)`,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  action: { type: "string" },
                  priority: { type: "string" }
                }
              }
            }
          }
        }
      });

      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismiss = (index) => {
    setDismissed([...dismissed, index]);
  };

  const visibleRecommendations = recommendations.filter((_, i) => !dismissed.includes(i));

  if (loading || visibleRecommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleRecommendations.map((rec, i) => (
        <Card key={i} className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-sm text-purple-900">{rec.title}</h4>
                  <Badge className={rec.priority === 'high' ? 'bg-red-600' : rec.priority === 'medium' ? 'bg-amber-600' : 'bg-blue-600'}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 mb-3">{rec.description}</p>
                <Button size="sm" className="bg-purple-600">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  {rec.action}
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismiss(i)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}