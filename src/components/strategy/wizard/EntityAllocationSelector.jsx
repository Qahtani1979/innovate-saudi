import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Link2, X, Zap } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { useDemandQueue } from '@/hooks/strategy/useDemandQueue';

export default function EntityAllocationSelector({
  strategicPlanId,
  value = [], // Array of {entity_id, entity_type, ...}
  onChange,
  multiple = true,
  showDetails = false,
  placeholder,
  className = ''
}) {
  const { language, t } = useLanguage();

  // Use hook for data fetching
  const { queueItems = [], isLoading } = useDemandQueue(strategicPlanId);

  // Derive available entities directly from queue items
  // Filter for items that have a generated entity ID (meaning they are ready)
  const availableEntities = queueItems
    .filter(item => item.generated_entity_id)
    .map(item => ({
      id: item.generated_entity_id,
      type: item.entity_type,
      title: item.prefilled_spec?.title_en || item.prefilled_spec?.name_en || 'Untitled',
      title_ar: item.prefilled_spec?.title_ar || item.prefilled_spec?.name_ar || '',
      quality_score: item.quality_score
    }));

  const selectedIds = value.map(v => v.entity_id);

  const handleSelect = (entityId) => {
    const entity = availableEntities.find(e => e.id === entityId);
    if (!entity) return;

    if (multiple) {
      const isSelected = selectedIds.includes(entityId);
      if (isSelected) {
        onChange(value.filter(v => v.entity_id !== entityId));
      } else {
        onChange([...value, { entity_id: entityId, entity_type: entity.type }]);
      }
    } else {
      onChange([{ entity_id: entityId, entity_type: entity.type }]);
    }
  };

  const handleRemove = (entityId) => {
    onChange(value.filter(v => v.entity_id !== entityId));
  };

  const getTypeConfig = (type) => ENTITY_TYPE_CONFIG[type] || { label_en: type, color: 'bg-gray-100' };

  if (!strategicPlanId) {
    return (
      <div className="text-sm text-muted-foreground p-2 border border-dashed rounded">
        {t({ en: 'Save plan to link entities', ar: 'احفظ الخطة لربط الكيانات' })}
      </div>
    );
  }

  if (availableEntities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 border border-dashed rounded flex items-center gap-2">
        <Zap className="h-4 w-4" />
        {t({
          en: 'No generated entities yet. Generate entities in Step 12.',
          ar: 'لا توجد كيانات مُنشأة بعد. أنشئ الكيانات في الخطوة 12.'
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected entities */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(item => {
            const entity = availableEntities.find(e => e.id === item.entity_id);
            const config = getTypeConfig(item.entity_type);
            return (
              <Badge key={item.entity_id} variant="outline" className={`gap-1 ${config.color}`}>
                <Link2 className="h-3 w-3" />
                {entity?.title || item.entity_id.slice(0, 8)}
                <button onClick={() => handleRemove(item.entity_id)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Entity selector */}
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder || t({ en: 'Link to entity...', ar: 'ربط بكيان...' })} />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(
            availableEntities.reduce((acc, entity) => {
              if (!acc[entity.type]) acc[entity.type] = [];
              acc[entity.type].push(entity);
              return acc;
            }, {})
          ).map(([type, entities]) => {
            const config = getTypeConfig(type);
            return (
              <div key={type}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">
                  {language === 'ar' ? config.label_ar : config.label_en}
                </div>
                {entities.map(entity => (
                  <SelectItem
                    key={entity.id}
                    value={entity.id}
                    disabled={selectedIds.includes(entity.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.color.split(' ')[0]}`} />
                      {language === 'ar' && entity.title_ar ? entity.title_ar : entity.title}
                      {entity.quality_score && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          {entity.quality_score}%
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            );
          })}
        </SelectContent>
      </Select>

      {showDetails && value.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {t({ en: `${value.length} entities linked`, ar: `${value.length} كيانات مرتبطة` })}
        </div>
      )}
    </div>
  );
}

/**
 * Hook for managing entity allocations within wizard data
 */
export function useEntityAllocations(data, onChange, fieldPath) {
  const getEntityAllocations = () => {
    const parts = fieldPath.split('.');
    let current = data;
    for (const part of parts) {
      current = current?.[part];
    }
    return current || [];
  };

  const setEntityAllocations = (allocations) => {
    const parts = fieldPath.split('.');
    if (parts.length === 1) {
      onChange({ [parts[0]]: allocations });
    } else if (parts.length === 2) {
      onChange({
        [parts[0]]: {
          ...data[parts[0]],
          [parts[1]]: allocations
        }
      });
    }
  };

  return {
    allocations: getEntityAllocations(),
    setAllocations: setEntityAllocations
  };
}
