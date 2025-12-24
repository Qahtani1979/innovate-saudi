import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '../LanguageContext';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useLivingLabMutations } from '@/hooks/useLivingLabs';

export default function LabToSolutionConverter({ rdProject, livingLabId }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [solutionData, setSolutionData] = useState({
    name_en: rdProject.title_en || '',
    description_en: rdProject.abstract_en || '',
    pricing_model: 'subscription'
  });

  const { convertProjectToSolution } = useLivingLabMutations();
  const handleConvert = () => {
    convertProjectToSolution.mutate({
      rdProject,
      livingLabId,
      solutionData,
      userEmail: user?.email
    }, {
      onSuccess: (solution) => {
        if (solution?.id) {
          window.open(`/SolutionDetail?id=${solution.id}`, '_blank');
        }
      }
    });
  };

  return (
    <Card className="border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-green-600" />
          {t({ en: 'Commercialize as Solution', ar: 'تسويق كحل' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder={t({ en: 'Solution Name', ar: 'اسم الحل' })}
          value={solutionData.name_en}
          onChange={(e) => setSolutionData(prev => ({ ...prev, name_en: e.target.value }))}
        />

        <Textarea
          placeholder={t({ en: 'Market-ready description...', ar: 'وصف جاهز للسوق...' })}
          value={solutionData.description_en}
          onChange={(e) => setSolutionData(prev => ({ ...prev, description_en: e.target.value }))}
        />

        <Button
          onClick={handleConvert}
          disabled={!solutionData.name_en || convertProjectToSolution.isPending}
          className="w-full bg-green-600"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          {t({ en: 'Create Certified Solution', ar: 'إنشاء حل معتمد' })}
        </Button>
      </CardContent>
    </Card>
  );
}