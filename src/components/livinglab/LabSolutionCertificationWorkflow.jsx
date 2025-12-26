import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Beaker, Award, Search, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSolutions } from '@/hooks/useSolutions';
import { useLabCertifications, useIssueCertification } from '@/hooks/useLabCertifications';

export default function LabSolutionCertificationWorkflow({ livingLabId }) {
  const { language, isRTL, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [certificationNotes, setCertificationNotes] = useState('');

  const { solutions } = useSolutions({
    searchQuery: searchQuery.length >= 2 ? searchQuery : '',
    limit: 10
  });

  const { data: existingCerts = [] } = useLabCertifications(livingLabId);
  const issueCertification = useIssueCertification();

  const handleCertify = () => {
    if (!selectedSolution) return;

    issueCertification.mutate({
      living_lab_id: livingLabId,
      solution_id: selectedSolution.id,
      certification_type: 'citizen_tested',
      certification_date: new Date().toISOString(),
      certification_notes: certificationNotes,
      research_validation: true,
      status: 'active'
    }, {
      onSuccess: () => {
        setSelectedSolution(null);
        setCertificationNotes('');
        setSearchQuery('');
      }
    });
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="border-2 border-teal-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            {t({ en: 'Certify Citizen-Tested Solution', ar: 'اعتماد حل تم اختباره مع المواطنين' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t({ en: 'Search Solution', ar: 'البحث عن حل' })}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t({ en: 'Search by solution name...', ar: 'البحث باسم الحل...' })}
                className="pl-10"
              />
            </div>
          </div>

          {solutions.length > 0 && !selectedSolution && (
            <div className="space-y-2">
              {solutions.map(solution => (
                <button
                  key={solution.id}
                  onClick={() => setSelectedSolution(solution)}
                  className="w-full p-3 text-left border rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-all"
                >
                  <p className="font-medium text-sm">
                    {language === 'ar' && solution.name_ar ? solution.name_ar : solution.name_en}
                  </p>
                  <p className="text-xs text-slate-600">{solution.provider_name}</p>
                </button>
              ))}
            </div>
          )}

          {selectedSolution && (
            <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-teal-900">
                    {language === 'ar' && selectedSolution.name_ar ? selectedSolution.name_ar : selectedSolution.name_en}
                  </p>
                  <p className="text-xs text-slate-600">{selectedSolution.provider_name}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSolution(null)}>
                  {t({ en: 'Change', ar: 'تغيير' })}
                </Button>
              </div>

              <Textarea
                value={certificationNotes}
                onChange={(e) => setCertificationNotes(e.target.value)}
                placeholder={t({ en: 'Certification notes (citizen feedback, research validation...)', ar: 'ملاحظات الاعتماد...' })}
                rows={3}
              />

              <Button
                onClick={handleCertify}
                disabled={issueCertification.isPending}
                className="w-full mt-3 bg-gradient-to-r from-teal-600 to-green-600"
              >
                <Award className="h-4 w-4 mr-2" />
                {t({ en: 'Issue Living Lab Certification', ar: 'إصدار اعتماد المختبر' })}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Certifications */}
      {existingCerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {t({ en: 'Lab-Certified Solutions', ar: 'الحلول المعتمدة' })} ({existingCerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {existingCerts.map(cert => (
              <div key={cert.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Beaker className="h-4 w-4 text-green-600" />
                  <p className="text-sm font-medium">Solution ID: {cert.solution_id}</p>
                  <Badge className="bg-green-600 text-white text-xs">{cert.certification_type}</Badge>
                </div>
                {cert.certification_notes && (
                  <p className="text-xs text-slate-600 mt-1">{cert.certification_notes}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(cert.certification_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
