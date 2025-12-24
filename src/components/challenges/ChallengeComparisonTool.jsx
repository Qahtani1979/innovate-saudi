import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare } from 'lucide-react';

import { useChallengesWithVisibility } from '@/hooks/useChallengesWithVisibility';

export default function ChallengeComparisonTool() {
  const [challenge1Id, setChallenge1Id] = useState('');
  const [challenge2Id, setChallenge2Id] = useState('');

  const { data: result = { data: [] } } = useChallengesWithVisibility({
    pageSize: 100, // Get a good list for selection
    filters: { is_deleted: false }
  });

  const challenges = result.data || [];

  const challenge1 = challenges.find(c => c.id === challenge1Id);
  const challenge2 = challenges.find(c => c.id === challenge2Id);

  const comparisonRows = [
    { field: 'Sector', getValue: (c) => c.sector },
    { field: 'Municipality', getValue: (c) => c.municipality_id },
    { field: 'Status', getValue: (c) => c.status },
    { field: 'Priority', getValue: (c) => c.priority },
    { field: 'Impact Score', getValue: (c) => c.impact_score },
    { field: 'Severity Score', getValue: (c) => c.severity_score },
    { field: 'Track', getValue: (c) => c.track || 'Not assigned' },
    { field: 'Affected Population', getValue: (c) => c.affected_population_size?.toLocaleString() || 'N/A' },
    { field: 'Linked Pilots', getValue: (c) => c.linked_pilot_ids?.length || 0 },
    { field: 'Linked R&D', getValue: (c) => c.linked_rd_ids?.length || 0 }
  ];

  return (
    <Card className="border-2 border-indigo-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-indigo-600" />
          Challenge Comparison Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Challenge 1
            </label>
            <Select value={challenge1Id} onValueChange={setChallenge1Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge" />
              </SelectTrigger>
              <SelectContent>
                {challenges.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title_en || c.title_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Challenge 2
            </label>
            <Select value={challenge2Id} onValueChange={setChallenge2Id}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge" />
              </SelectTrigger>
              <SelectContent>
                {challenges.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title_en || c.title_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {challenge1 && challenge2 && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="text-left p-3 font-semibold">Attribute</th>
                  <th className="text-left p-3 font-semibold text-blue-600">{challenge1.code}</th>
                  <th className="text-left p-3 font-semibold text-green-600">{challenge2.code}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => {
                  const val1 = row.getValue(challenge1);
                  const val2 = row.getValue(challenge2);
                  const isDifferent = val1 !== val2;

                  return (
                    <tr key={idx} className={`border-b ${isDifferent ? 'bg-yellow-50' : ''}`}>
                      <td className="p-3 font-medium text-slate-700">{row.field}</td>
                      <td className="p-3 text-slate-600">{val1}</td>
                      <td className="p-3 text-slate-600">{val2}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!challenge1 || !challenge2 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Select two challenges to compare
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}