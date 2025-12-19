# Strategy API Documentation

## Hooks

### useStrategicPlans
```javascript
import { useStrategicPlans } from '@/hooks/strategy/useStrategicPlans';
const { plans, createPlan, updatePlan, deletePlan } = useStrategicPlans(filters);
```

### useStrategicObjectives
```javascript
import { useStrategicObjectives } from '@/hooks/strategy/useStrategicObjectives';
const { objectives, createObjective } = useStrategicObjectives(planId);
```

### useKPIs
```javascript
import { useKPIs } from '@/hooks/strategy/useKPIs';
const { kpis, updateKPIValue } = useKPIs(objectiveId);
```

### useActionPlans
```javascript
import { useActionPlans } from '@/hooks/strategy/useActionPlans';
const { actionPlans, createActionItem } = useActionPlans(objectiveId);
```

### useWorkflowAI
```javascript
import { useWorkflowAI } from '@/hooks/strategy/useWorkflowAI';
const { optimizeWorkflow, predictBottlenecks } = useWorkflowAI();
```

## Database Operations

### Create Strategic Plan
```javascript
const { data, error } = await supabase
  .from('strategic_plans')
  .insert({ title_en, title_ar, vision_en, mission_en, start_date, end_date })
  .select()
  .single();
```

## Error Codes
| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Plan not found |
| PERMISSION_DENIED | User lacks permission |
