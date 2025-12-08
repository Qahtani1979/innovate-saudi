import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Shield, Code } from 'lucide-react';

/**
 * Input Validation Engine
 * Comprehensive validation for all API inputs
 * Prevents SQL injection, XSS, command injection, etc.
 */

export default function InputValidationEngine() {
  const validationRules = {
    challenges: {
      title: { type: 'string', minLength: 5, maxLength: 200, sanitize: true },
      description: { type: 'string', minLength: 20, maxLength: 5000, sanitize: true },
      sector: { type: 'enum', values: ['urban_design', 'transport', 'environment', 'digital_services'] },
      budget: { type: 'number', min: 0, max: 10000000 },
      email: { type: 'email', regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    },
    pilots: {
      title: { type: 'string', minLength: 5, maxLength: 200 },
      kpis: { type: 'array', minItems: 1, maxItems: 10 },
      budget: { type: 'number', min: 0, max: 50000000 }
    },
    users: {
      email: { type: 'email', required: true },
      full_name: { type: 'string', minLength: 2, maxLength: 100, sanitize: true },
      phone: { type: 'string', regex: /^\+?[1-9]\d{1,14}$/ }
    }
  };

  const implementationCode = `
// Backend Validation Middleware (Express)
const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Validation middleware
const validateChallenge = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .escape()
    .customSanitizer(value => sanitizeHtml(value)),
  
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .customSanitizer(value => sanitizeHtml(value, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {}
    })),
  
  body('sector')
    .isIn(['urban_design', 'transport', 'environment', 'digital_services']),
  
  body('budget')
    .optional()
    .isFloat({ min: 0, max: 10000000 }),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail(),
];

// Apply to routes
app.post('/api/challenges', validateChallenge, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process validated input
});

// SQL Injection Prevention
const query = 'SELECT * FROM challenges WHERE id = ?';
db.query(query, [req.params.id]); // Parameterized queries

// NoSQL Injection Prevention  
const sanitizedQuery = { 
  $and: [
    { sector: String(req.query.sector) },
    { status: { $ne: null } }
  ]
};
`;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Input Validation Engine
            <Badge variant="outline" className="ml-auto">Backend Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Critical Security Gap</p>
                <p>Backend middleware deployment required for comprehensive input validation</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="rules">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules">Validation Rules</TabsTrigger>
              <TabsTrigger value="implementation">Implementation</TabsTrigger>
              <TabsTrigger value="threats">Threat Coverage</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-3">
              {Object.entries(validationRules).map(([entity, rules]) => (
                <div key={entity} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-900 mb-2 capitalize">{entity}</p>
                  <div className="space-y-1 text-xs">
                    {Object.entries(rules).map(([field, rule]) => (
                      <div key={field} className="flex items-start gap-2 text-slate-600">
                        <span className="font-mono text-blue-600">{field}:</span>
                        <span>{JSON.stringify(rule, null, 2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="implementation">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  Backend Implementation Example
                </p>
                <pre className="text-xs text-slate-600 overflow-x-auto">{implementationCode}</pre>
              </div>
            </TabsContent>

            <TabsContent value="threats" className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Prevents</p>
                  <ul className="text-xs text-green-700 mt-2 space-y-1">
                    <li>• SQL Injection</li>
                    <li>• NoSQL Injection</li>
                    <li>• XSS Attacks</li>
                    <li>• Command Injection</li>
                    <li>• Path Traversal</li>
                    <li>• XML Injection</li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Protects</p>
                  <ul className="text-xs text-blue-700 mt-2 space-y-1">
                    <li>• Database integrity</li>
                    <li>• User data safety</li>
                    <li>• System security</li>
                    <li>• API reliability</li>
                    <li>• Compliance (PDPL)</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <p className="text-sm font-medium">Implementation Checklist:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Install validation libraries (express-validator, joi, etc.)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Define validation schemas for all entities</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Apply middleware to all POST/PUT/PATCH endpoints</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Sanitize HTML content</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Use parameterized queries (SQL injection prevention)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Test with OWASP ZAP security scanner</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}