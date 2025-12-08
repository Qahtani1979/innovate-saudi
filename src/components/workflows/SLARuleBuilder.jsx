import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Clock, Plus, Trash2, Save } from 'lucide-react';

export default function SLARuleBuilder() {
  const { language, isRTL, t } = useLanguage();
  const [rules, setRules] = useState([
    { entity: 'Challenge', action: 'Approval', sla_hours: 120, escalate_to: 'Program Director' },
    { entity: 'Pilot', action: 'Review', sla_hours: 72, escalate_to: 'Municipality Lead' }
  ]);

  const addRule = () => {
    setRules([...rules, { entity: '', action: '', sla_hours: 48, escalate_to: '' }]);
  };

  return (
    <Card className="border-2 border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          {t({ en: 'SLA Rule Builder', ar: 'بناء قواعد اتفاقية الخدمة' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-lg border-2">
              <div className="grid grid-cols-4 gap-3 mb-2">
                <Select value={rule.entity} onValueChange={(v) => {
                  const newRules = [...rules];
                  newRules[i].entity = v;
                  setRules(newRules);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Entity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Challenge">Challenge</SelectItem>
                    <SelectItem value="Pilot">Pilot</SelectItem>
                    <SelectItem value="RDProject">R&D Project</SelectItem>
                    <SelectItem value="Program">Program</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rule.action} onValueChange={(v) => {
                  const newRules = [...rules];
                  newRules[i].action = v;
                  setRules(newRules);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approval">Approval</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Response">Response</SelectItem>
                    <SelectItem value="Data Submit">Data Submit</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="SLA Hours"
                  value={rule.sla_hours}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[i].sla_hours = parseInt(e.target.value);
                    setRules(newRules);
                  }}
                />

                <div className="flex gap-1">
                  <Input
                    placeholder="Escalate to"
                    value={rule.escalate_to}
                    onChange={(e) => {
                      const newRules = [...rules];
                      newRules[i].escalate_to = e.target.value;
                      setRules(newRules);
                    }}
                    className="flex-1"
                  />
                  <Button size="icon" variant="ghost" onClick={() => setRules(rules.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <Badge className="mt-2 bg-amber-600 text-white text-xs">
                {(rule.sla_hours / 24).toFixed(1)} days
              </Badge>
            </div>
          ))}
        </div>

        <Button onClick={addRule} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {t({ en: 'Add SLA Rule', ar: 'إضافة قاعدة' })}
        </Button>

        <Button className="w-full bg-amber-600">
          <Save className="h-4 w-4 mr-2" />
          {t({ en: 'Save SLA Rules', ar: 'حفظ القواعد' })}
        </Button>
      </CardContent>
    </Card>
  );
}