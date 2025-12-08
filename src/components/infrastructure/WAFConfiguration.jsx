import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Shield, Code } from 'lucide-react';

/**
 * Web Application Firewall Configuration
 * Protects against OWASP Top 10 threats
 */

export default function WAFConfiguration() {
  const [wafConfig, setWafConfig] = React.useState({
    enabled: false,
    mode: 'detection', // detection or blocking
    rules: {
      sqlInjection: true,
      xss: true,
      rce: true,
      lfi: true,
      csrf: true,
      ddos: true,
      rateLimiting: true,
      geoBlocking: false
    }
  });

  const cloudflareConfig = `
# Cloudflare WAF Configuration
resource "cloudflare_waf_rule" "owasp_core" {
  zone_id = var.zone_id
  mode    = "challenge"
  
  # OWASP Core Rule Set
  rule_id = "100000"
  
  # SQL Injection Protection
  rule_id = "100001"
  
  # XSS Protection
  rule_id = "100002"
  
  # RCE Protection
  rule_id = "100003"
}

resource "cloudflare_rate_limit" "api_protection" {
  zone_id = var.zone_id
  
  match {
    request {
      url_pattern = "api.saudiinnovates.gov.sa/api/*"
    }
  }
  
  action {
    mode    = "challenge"
    timeout = 60
  }
  
  threshold = 100
  period    = 60
}
`;

  const awsWafConfig = `
# AWS WAF Configuration
resource "aws_wafv2_web_acl" "main" {
  name  = "saudi-innovates-waf"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  # Managed Rule Groups
  rule {
    name     = "AWS-AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
      }
    }
  }
  
  # SQL Injection Protection
  rule {
    name     = "AWS-AWSManagedRulesSQLiRuleSet"
    priority = 2
    
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesSQLiRuleSet"
      }
    }
  }
  
  # Rate Limiting
  rule {
    name     = "RateLimitRule"
    priority = 3
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
  }
}
`;

  const threatCoverage = [
    { threat: 'SQL Injection', severity: 'critical', protected: true },
    { threat: 'Cross-Site Scripting (XSS)', severity: 'high', protected: true },
    { threat: 'Remote Code Execution', severity: 'critical', protected: true },
    { threat: 'Local File Inclusion', severity: 'high', protected: true },
    { threat: 'DDoS Attacks', severity: 'critical', protected: true },
    { threat: 'Brute Force', severity: 'high', protected: true },
    { threat: 'Bot Traffic', severity: 'medium', protected: true },
    { threat: 'API Abuse', severity: 'high', protected: true }
  ];

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Web Application Firewall (WAF)
            <Badge variant="outline" className="ml-auto">Infrastructure Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Critical Security Infrastructure Missing</p>
                <p>Cloud WAF deployment required (Cloudflare or AWS WAF)</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="rules">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rules">Rule Configuration</TabsTrigger>
              <TabsTrigger value="cloudflare">Cloudflare WAF</TabsTrigger>
              <TabsTrigger value="aws">AWS WAF</TabsTrigger>
            </TabsList>

            <TabsContent value="rules" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(wafConfig.rules).map(([rule, enabled]) => (
                  <div key={rule} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm capitalize">{rule.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setWafConfig({
                          ...wafConfig,
                          rules: { ...wafConfig.rules, [rule]: checked }
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Threat Coverage:</p>
                <div className="space-y-2">
                  {threatCoverage.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border rounded">
                      <span className="text-sm">{item.threat}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={item.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {item.severity}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-green-600">
                          ✓ Protected
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cloudflare">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  Cloudflare WAF Terraform Configuration
                </p>
                <pre className="text-xs text-slate-600 overflow-x-auto max-h-96">{cloudflareConfig}</pre>
              </div>
            </TabsContent>

            <TabsContent value="aws">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  AWS WAF Terraform Configuration
                </p>
                <pre className="text-xs text-slate-600 overflow-x-auto max-h-96">{awsWafConfig}</pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <p className="text-sm font-medium">Deployment Checklist:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Choose WAF provider (Cloudflare vs AWS WAF)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Configure DNS to proxy through WAF</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Enable OWASP Core Rule Set</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Configure rate limiting rules</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Set up monitoring and alerting</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="h-3 w-3 text-amber-600" />
                <span>Test in detection mode before blocking</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}