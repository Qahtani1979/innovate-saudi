import { useState } from 'react';
import { useLivingLabMutations } from '@/hooks/useLivingLabs';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '../LanguageContext';
import { ArrowRight, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import { useLivingLabsWithVisibility } from '@/hooks/useLivingLabsWithVisibility';

export default function LabRoutingHub({ entity, entityType }) {
  const { t, language } = useLanguage();
  const [selectedLab, setSelectedLab] = useState('');
  const [routing, setRouting] = useState(false);
  const { user } = useAuth();

  // Use visibility-aware hook
  const { data: livingLabs = [] } = useLivingLabsWithVisibility();
  const { routeToLab } = useLivingLabMutations();

  const handleRoute = () => {
    routeToLab.mutate({
      entity,
      entityType,
      selectedLab
    }, {
      onSuccess: () => setRouting(false)
    });
  };

  const relevantLabs = livingLabs.filter(lab =>
    !entity.sector ||
    lab.sector_id === entity.sector_id ||
    lab.service_focus_ids?.includes(entity.service_id)
  );

  return (
    <Card className="border-2 border-teal-300 bg-gradient-to-r from-teal-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-teal-900">
          <Beaker className="h-5 w-5" />
          {t({ en: 'Route to Living Lab', ar: 'توجيه للمختبر الحي' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">
          {t({ en: 'Convert to research project for citizen co-creation and testing', ar: 'تحويل إلى مشروع بحثي للمشاركة المواطنية والاختبار' })}
        </p>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            {t({ en: 'Select Living Lab', ar: 'اختر المختبر الحي' })}
          </label>
          <Select value={selectedLab} onValueChange={setSelectedLab}>
            <SelectTrigger>
              <SelectValue placeholder={t({ en: 'Choose lab...', ar: 'اختر مختبر...' })} />
            </SelectTrigger>
            <SelectContent>
              {relevantLabs.map(lab => (
                <SelectItem key={lab.id} value={lab.id}>
                  {language === 'ar' && lab.name_ar ? lab.name_ar : lab.name_en}
                  {lab.capacity_current < lab.capacity_max && (
                    <Badge className="ml-2 bg-green-600 text-xs">Available</Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleRoute}
          disabled={!selectedLab || routeToLab.isPending}
          className="w-full bg-teal-600"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {t({ en: 'Create Lab Research Project', ar: 'إنشاء مشروع بحثي' })}
        </Button>
      </CardContent>
    </Card>
  );
}