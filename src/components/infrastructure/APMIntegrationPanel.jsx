import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, Code } from 'lucide-react';

export default function APMIntegrationPanel() {
  const metrics = [
    { metric: 'Response Time (p95)', current: 'Unknown', target: '< 200ms' },
    { metric: 'Error Rate', current: 'Unknown', target: '< 0.1%' },
    { metric: 'Throughput', current: 'Unknown', target: '1000 req/s' },
    { metric: 'Database Queries', current: 'Unknown', target: '< 50ms' }
  ];

  const newRelicConfig = `
// New Relic Setup
npm install newrelic

// newrelic.js
exports.config = {
  app_name: ['Saudi Innovates Platform'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: { level: 'info' },
  transaction_tracer: { enabled: true },
  error_collector: { enabled: true },
  browser_monitoring: { enable: true }
};

// index.js (FIRST LINE)
require('newrelic');
const express = require('express');
// ... rest of app

// Custom Instrumentation
const newrelic = require('newrelic');

app.post('/api/challenges', async (req, res) => {
  const transaction = newrelic.getTransaction();
  transaction.addCustomAttribute('municipality_id', req.body.municipality_id);
  
  // Business logic
});
`;

  const datadogConfig = `
// Datadog APM Setup  
npm install dd-trace --save

// index.js (FIRST LINE)
const tracer = require('dd-trace').init({
  service: 'saudi-innovates-api',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  profiling: true,
  runtimeMetrics: true
});

const express = require('express');
// ... rest of app

// Custom Spans
const tracer = require('dd-trace');

app.post('/api/challenges', async (req, res) => {
  const span = tracer.scope().active();
  span.setTag('municipality.id', req.body.municipality_id);
  
  // Business logic
});

// Frontend RUM (Real User Monitoring)
<script>
  (function(h,o,u,n,d) {
    h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
    d=o.createElement(u);d.async=1;d.src=n
    n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
  })(window,document,'script','https://www.datadoghq-browser-agent.com/datadog-rum.js','DD_RUM')
  
  DD_RUM.onReady(function() {
    DD_RUM.init({
      clientToken: 'YOUR_CLIENT_TOKEN',
      applicationId: 'YOUR_APP_ID',
      site: 'datadoghq.com',
      service: 'saudi-innovates-web',
      env: 'production',
      version: '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
    })
  })
</script>
`;

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-600" />
          APM Integration (New Relic / Datadog)
          <Badge variant="outline" className="ml-auto">Infrastructure Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Performance Monitoring Gap</p>
              <p>APM tool required for production performance visibility</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Key Metrics to Track:</p>
          {metrics.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="text-sm font-medium">{item.metric}</p>
                <p className="text-xs text-slate-600 mt-1">Target: {item.target}</p>
              </div>
              <Badge variant="outline" className="text-amber-600">{item.current}</Badge>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-2">New Relic APM</p>
            <pre className="text-xs text-slate-600 overflow-x-auto max-h-64">{newRelicConfig}</pre>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-2">Datadog APM + RUM</p>
            <pre className="text-xs text-slate-600 overflow-x-auto max-h-64">{datadogConfig}</pre>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg text-xs">
          <p className="font-medium text-blue-800 mb-2">APM Benefits:</p>
          <ul className="space-y-1 text-blue-700">
            <li>• Real-time performance monitoring</li>
            <li>• Distributed tracing across services</li>
            <li>• Database query analysis & slow query detection</li>
            <li>• Error tracking with stack traces</li>
            <li>• User experience monitoring (RUM)</li>
            <li>• Custom metrics & dashboards</li>
            <li>• Alert on performance degradation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}