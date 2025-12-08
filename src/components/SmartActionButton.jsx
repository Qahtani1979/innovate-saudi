import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function SmartActionButton({ context, entity, icon: Icon, label, variant = "default" }) {
  const navigate = useNavigate();

  const handleAction = () => {
    const actions = {
      // From Challenge Detail
      challenge_to_pilot: () => {
        navigate(createPageUrl('PilotCreate') + `?challenge_id=${entity.id}`, {
          state: { 
            prefilledData: {
              challenge_id: entity.id,
              title_en: entity.title_en,
              title_ar: entity.title_ar,
              sector: entity.sector,
              municipality_id: entity.municipality_id,
              description_en: `Pilot to address: ${entity.title_en}`,
              objective_en: entity.desired_outcome
            }
          }
        });
      },

      // From Gap Analysis
      gap_to_rd_call: () => {
        navigate(createPageUrl('RDCallCreate'), {
          state: {
            prefilledData: {
              theme_en: entity.sector || entity.gap_area,
              description_en: `R&D call to address gap in: ${entity.gap_area || entity.title}`,
              focus_areas: [entity.sector]
            }
          }
        });
      },

      // From Pilot Detail
      pilot_to_scaling: () => {
        navigate(createPageUrl('ScalingWorkflow') + `?pilot_id=${entity.id}`, {
          state: {
            prefilledData: {
              pilot_id: entity.id,
              pilot_name: entity.title_en,
              sector: entity.sector
            }
          }
        });
      },

      // From Solution Detail
      solution_to_challenge: () => {
        navigate(createPageUrl('ChallengeSolutionMatching') + `?solution_id=${entity.id}`);
      },

      // Generic next stage
      move_to_next_stage: () => {
        const nextPages = {
          challenge: 'PilotCreate',
          pilot: 'ScalingWorkflow',
          rd_project: 'RDProjectPilotMatcher'
        };
        const page = nextPages[entity.entity_type] || 'Home';
        navigate(createPageUrl(page) + `?id=${entity.id}`);
      }
    };

    const action = actions[context] || actions.move_to_next_stage;
    action();
  };

  return (
    <Button onClick={handleAction} variant={variant} className="gap-2">
      {Icon && <Icon className="h-4 w-4" />}
      <span>{label}</span>
      <ArrowRight className="h-4 w-4" />
    </Button>
  );
}