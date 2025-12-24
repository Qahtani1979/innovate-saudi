import React, { useState } from 'react';
import { useMatchingEntities } from '@/hooks/useMatchingEntities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from '../components/LanguageContext';
import { CheckCircle2, XCircle, Target, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProtectedPage from '../components/permissions/ProtectedPage';

function SolutionComparison() {
  const { language, isRTL, t } = useLanguage();
  const [selectedSolutions, setSelectedSolutions] = useState([]);

  const { useSolutions } = useMatchingEntities();
  const { data: solutions = [] } = useSolutions();

  const urlParams = new URLSearchParams(window.location.search);
  const preselected = urlParams.get('ids')?.split(',') || [];

  React.useEffect(() => {
    if (preselected.length > 0 && selectedSolutions.length === 0) {
      setSelectedSolutions(solutions.filter(s => preselected.includes(s.id)));
    }
  }, [solutions, preselected]);

  const toggleSolution = (solution) => {
    if (selectedSolutions.find(s => s.id === solution.id)) {
      setSelectedSolutions(selectedSolutions.filter(s => s.id !== solution.id));
    } else if (selectedSolutions.length < 5) {
      setSelectedSolutions([...selectedSolutions, solution]);
    }
  };

  const comparisonFields = [
    { key: 'provider_name', label: { en: 'Provider', ar: 'Ø§Ù„Ù…Ø²ÙˆØ¯' } },
    { key: 'provider_type', label: { en: 'Provider Type', ar: 'Ù†ÙˆØ¹ Ø§Ù„Ù…Ø²ÙˆØ¯' } },
    { key: 'maturity_level', label: { en: 'Maturity', ar: 'Ø§Ù„Ù†Ø¶Ø¬' } },
    { key: 'trl', label: { en: 'TRL Level', ar: 'Ø§Ù„Ù…Ø³ØªÙˆÙ‰ Ø§Ù„ØªÙ‚Ù†ÙŠ' } },
    { key: 'deployment_count', label: { en: 'Deployments', ar: 'Ø§Ù„Ù†Ø´Ø±' } },
    { key: 'success_rate', label: { en: 'Success Rate', ar: 'Ù…Ø¹Ø¯Ù„ Ø§Ù„Ù†Ø¬Ø§Ø­' } },
    { key: 'pricing_model', label: { en: 'Pricing Model', ar: 'Ù†Ù…ÙˆØ°Ø¬ Ø§Ù„ØªØ³Ø¹ÙŠØ±' } },
    { key: 'is_verified', label: { en: 'Verified', ar: 'Ù…Ø¹ØªÙ…Ø¯' } },
    { key: 'sectors', label: { en: 'Sectors', ar: 'Ø§Ù„Ù‚Ø·Ø§Ø¹Ø§Øª' } },
    { key: 'features', label: { en: 'Features', ar: 'Ø§Ù„Ù…Ù…ÙŠØ²Ø§Øª' } }
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-4xl font-bold text-slate-900">
          {t({ en: 'âš–ï¸ Solution Comparison Tool', ar: 'âš–ï¸ Ø£Ø¯Ø§Ø© Ù…Ù‚Ø§Ø±Ù†Ø© Ø§Ù„Ø­Ù„ÙˆÙ„' })}
        </h1>
        <p className="text-slate-600 mt-2">
          {t({ en: 'Compare up to 5 solutions side-by-side to make informed decisions', ar: 'Ù‚Ø§Ø±Ù† Ø­ØªÙ‰ 5 Ø­Ù„ÙˆÙ„ Ø¬Ù†Ø¨Ø§Ù‹ Ø¥Ù„Ù‰ Ø¬Ù†Ø¨' })}
        </p>
      </div>

      {/* Selection */}
      {selectedSolutions.length < 5 && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ en: 'Select Solutions to Compare', ar: 'Ø§Ø®ØªØ± Ø§Ù„Ø­Ù„ÙˆÙ„ Ù„Ù„Ù…Ù‚Ø§Ø±Ù†Ø©' })} ({selectedSolutions.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {solutions.filter(s => !selectedSolutions.find(sel => sel.id === s.id)).slice(0, 20).map((solution) => (
                <Button
                  key={solution.id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSolution(solution)}
                  className="justify-start h-auto py-3 px-3"
                >
                  <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs text-left line-clamp-2">{solution.name_en || solution.name_ar}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Solutions */}
      {selectedSolutions.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {selectedSolutions.map((solution) => (
            <Badge key={solution.id} className="bg-purple-600 text-white px-3 py-2">
              {solution.name_en || solution.name_ar}
              <button
                onClick={() => toggleSolution(solution)}
                className="ml-2 hover:bg-white/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {selectedSolutions.length >= 2 && (
        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2">
                  <th className="text-left py-3 px-3 font-semibold text-slate-900 bg-slate-50">
                    {t({ en: 'Attribute', ar: 'Ø§Ù„Ø®Ø§ØµÙŠØ©' })}
                  </th>
                  {selectedSolutions.map((solution) => (
                    <th key={solution.id} className="text-left py-3 px-3 min-w-[200px]">
                      <div>
                        <Link to={createPageUrl('SolutionDetail') + `?id=${solution.id}`} className="text-purple-600 hover:underline font-semibold">
                          {solution.name_en || solution.name_ar}
                        </Link>
                        <p className="text-xs text-slate-500 font-normal mt-1">{solution.provider_name}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFields.map((field, idx) => (
                  <tr key={field.key} className={`border-b ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <td className="py-3 px-3 font-medium text-slate-700">
                      {field.label[language]}
                    </td>
                    {selectedSolutions.map((solution) => {
                      const value = solution[field.key];

                      if (field.key === 'is_verified') {
                        return (
                          <td key={solution.id} className="py-3 px-3">
                            {value ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-slate-300" />
                            )}
                          </td>
                        );
                      }

                      if (field.key === 'sectors' || field.key === 'features') {
                        return (
                          <td key={solution.id} className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {(value || []).slice(0, 3).map((item, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {typeof item === 'string' ? item : item.name || item}
                                </Badge>
                              ))}
                              {value?.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{value.length - 3}</Badge>
                              )}
                            </div>
                          </td>
                        );
                      }

                      if (field.key === 'success_rate') {
                        return (
                          <td key={solution.id} className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{value || 0}%</span>
                              {value >= 80 && <TrendingUp className="h-4 w-4 text-green-600" />}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={solution.id} className="py-3 px-3">
                          {value?.toString() || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {selectedSolutions.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">
              {t({ en: 'Select at least 2 solutions to compare', ar: 'Ø§Ø®ØªØ± Ø­Ù„ÙŠÙ† Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„ Ù„Ù„Ù…Ù‚Ø§Ø±Ù†Ø©' })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProtectedPage(SolutionComparison, { requiredPermissions: [] });
