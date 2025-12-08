import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles } from 'lucide-react';

export default function ChallengeTemplateLibrary({ onSelectTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 'waste-management',
      name: 'Waste Management Optimization',
      sector: 'environment',
      description: 'Template for waste collection and recycling challenges',
      preset: {
        challenge_type: 'efficiency',
        sector: 'environmental',
        kpis: [
          { name: 'Waste Collection Efficiency', baseline: '60%', target: '85%' },
          { name: 'Recycling Rate', baseline: '15%', target: '40%' }
        ]
      }
    },
    {
      id: 'traffic-congestion',
      name: 'Traffic Congestion Reduction',
      sector: 'transport',
      description: 'Template for urban traffic and mobility challenges',
      preset: {
        challenge_type: 'infrastructure',
        sector: 'transport',
        kpis: [
          { name: 'Average Travel Time', baseline: '45 min', target: '30 min' },
          { name: 'Traffic Incidents', baseline: '120/month', target: '80/month' }
        ]
      }
    },
    {
      id: 'digital-service',
      name: 'Digital Service Enhancement',
      sector: 'digital_services',
      description: 'Template for improving citizen digital services',
      preset: {
        challenge_type: 'digital_transformation',
        sector: 'digital_services',
        kpis: [
          { name: 'Service Completion Rate', baseline: '65%', target: '90%' },
          { name: 'User Satisfaction', baseline: '3.2/5', target: '4.5/5' }
        ]
      }
    },
    {
      id: 'public-safety',
      name: 'Public Safety Improvement',
      sector: 'safety',
      description: 'Template for safety and security challenges',
      preset: {
        challenge_type: 'safety',
        sector: 'safety',
        kpis: [
          { name: 'Incident Response Time', baseline: '15 min', target: '8 min' },
          { name: 'Crime Rate', baseline: '5.2%', target: '3.5%' }
        ]
      }
    },
    {
      id: 'green-spaces',
      name: 'Green Spaces Development',
      sector: 'environment',
      description: 'Template for parks and recreation challenges',
      preset: {
        challenge_type: 'environmental',
        sector: 'environmental',
        kpis: [
          { name: 'Green Space per Capita', baseline: '5 sqm', target: '12 sqm' },
          { name: 'Park Accessibility', baseline: '40%', target: '75%' }
        ]
      }
    }
  ];

  const handleUseTemplate = () => {
    if (!selectedTemplate) return;
    const template = templates.find(t => t.id === selectedTemplate);
    onSelectTemplate?.(template.preset);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Challenge Templates Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{template.name}</h4>
                <Badge variant="outline" className="text-xs">{template.sector}</Badge>
              </div>
              <p className="text-xs text-slate-600">{template.description}</p>
            </div>
          ))}
        </div>

        <Button 
          onClick={handleUseTemplate}
          disabled={!selectedTemplate}
          className="w-full bg-blue-600"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Use Selected Template
        </Button>
      </CardContent>
    </Card>
  );
}