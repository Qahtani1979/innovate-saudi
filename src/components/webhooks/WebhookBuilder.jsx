import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from '../LanguageContext';
import { Webhook, Plus, AlertCircle } from 'lucide-react';

export default function WebhookBuilder() {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5 text-purple-600" />
          {t({ en: 'Webhook Builder', ar: 'بناء Webhook' })}
          <Badge className="ml-auto bg-red-600">Not Implemented</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
            <div className="text-red-800">
              <p className="font-medium">Advanced Webhook System Needed</p>
              <p>Visual builder for webhook configuration, payload templates, and security</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Input placeholder="Webhook Name" />
          <Input placeholder="Target URL" />
          <div>
            <label className="text-sm font-medium mb-2 block">Event Triggers</label>
            <div className="space-y-2">
              {['Challenge Created', 'Pilot Updated', 'Approval Required', 'Milestone Completed'].map(event => (
                <label key={event} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" disabled />
                  <span className="text-slate-600">{event}</span>
                </label>
              ))}
            </div>
          </div>
          <Textarea placeholder="Payload Template (JSON)" rows={4} disabled />
        </div>

        <div className="text-xs text-slate-600 pt-4 border-t">
          <p className="font-medium mb-2">Missing features:</p>
          <ul className="space-y-1 ml-4">
            <li>• Visual payload builder</li>
            <li>• HMAC signature generation</li>
            <li>• Retry logic configuration</li>
            <li>• Delivery logs & analytics</li>
            <li>• Test webhook functionality</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}