import { useState } from 'react';
import { useSolutions } from '@/hooks/useSolutions';
import { useSandboxCertifications, useSandboxCertificationMutations } from '@/hooks/useSandboxCertifications';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Award, Search, CheckCircle2 } from 'lucide-react';

export default function SandboxCertificationWorkflow({ sandboxId }) {
  const { language, isRTL, t } = useLanguage();
  // const queryClient = useQueryClient(); // Removed unused and undefined
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [certificationNotes, setCertificationNotes] = useState('');

  const { solutions = [] } = useSolutions({
    searchQuery: searchQuery.length >= 2 ? searchQuery : undefined,
    limit: 10
  });

  const { data: existingCerts = [] } = useSandboxCertifications(sandboxId);
  const { createCertification } = useSandboxCertificationMutations();

  const handleCertify = () => {
    if (!selectedSolution) return;

    createCertification.mutate({
      sandbox_id: sandboxId,
      solution_id: selectedSolution.id,
      certification_type: 'regulatory_sandbox_tested',
      certification_date: new Date().toISOString(),
      certification_notes: certificationNotes,
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
      <Card className="border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t({ en: 'Certify Solution Tested in Sandbox', ar: 'اعتماد حل تم اختباره' })}
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
                  className="w-full p-3 text-left border rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all"
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
            <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-purple-900">
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
                placeholder={t({ en: 'Certification notes (testing results, compliance validation...)', ar: 'ملاحظات الاعتماد...' })}
                rows={3}
              />

              <Button
                onClick={handleCertify}
                disabled={createCertification.isPending}
                className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <Award className="h-4 w-4 mr-2" />
                {t({ en: 'Issue Sandbox Certification', ar: 'إصدار اعتماد الصندوق' })}
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
              {t({ en: 'Certified Solutions', ar: 'الحلول المعتمدة' })} ({existingCerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {existingCerts.map(cert => (
              <div key={cert.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-green-600" />
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
