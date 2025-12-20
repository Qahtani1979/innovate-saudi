import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Shield, Code } from 'lucide-react';

/**
 * CSRF Protection Middleware Configuration
 * Backend Implementation Required:
 * - Token generation on server side
 * - Token validation middleware
 * - Cookie-based token storage
 * - SameSite cookie attributes
 */

export default function CSRFMiddleware() {
  const [config, setConfig] = React.useState({
    enabled: false,
    tokenExpiry: 3600,
    cookieName: 'csrf_token',
    headerName: 'X-CSRF-Token',
    sameSite: 'strict',
    excludedPaths: ['/api/public/*', '/api/webhook/*']
  });

  const implementationCode = `
// Backend Middleware (Node.js/Express example)
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ 
  cookie: { 
    httpOnly: true, 
    sameSite: 'strict',
    secure: true 
  } 
}));

// Token endpoint
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Validation middleware
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});
`;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            CSRF Protection Middleware
            <Badge variant="outline" className="ml-auto">Backend Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Implementation Status: UI Only</p>
                <p>Backend middleware deployment required for actual protection</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enable CSRF Protection</label>
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Token Expiry (seconds)</label>
              <Input
                type="number"
                value={config.tokenExpiry}
                onChange={(e) => setConfig({ ...config, tokenExpiry: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cookie Name</label>
              <Input
                value={config.cookieName}
                onChange={(e) => setConfig({ ...config, cookieName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Header Name</label>
              <Input
                value={config.headerName}
                onChange={(e) => setConfig({ ...config, headerName: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Code className="h-3 w-3" />
              Backend Implementation Example
            </p>
            <pre className="text-xs text-slate-600 overflow-x-auto">{implementationCode}</pre>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Implementation Checklist:</p>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Install csrf middleware package</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Configure token generation endpoint</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Add validation to all state-changing endpoints</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Frontend: Include token in all POST/PUT/DELETE requests</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Test with security scanning tools</span>
              </div>
            </div>
          </div>

          <Button className="w-full" disabled>
            <Shield className="h-4 w-4 mr-2" />
            Deploy CSRF Protection (Requires Backend)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}