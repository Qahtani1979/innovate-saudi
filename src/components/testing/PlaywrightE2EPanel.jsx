import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Code } from 'lucide-react';

export default function PlaywrightE2EPanel() {
  const criticalFlows = [
    { flow: 'User Login & Onboarding', tests: 0, scenarios: 5, priority: 'critical' },
    { flow: 'Challenge Submission → Review → Approval', tests: 0, scenarios: 8, priority: 'critical' },
    { flow: 'Pilot Creation → Launch → Monitoring', tests: 0, scenarios: 12, priority: 'critical' },
    { flow: 'Solution Registration → Matching', tests: 0, scenarios: 6, priority: 'high' },
    { flow: 'R&D Proposal → Evaluation → Award', tests: 0, scenarios: 10, priority: 'high' },
    { flow: 'Program Application → Selection', tests: 0, scenarios: 7, priority: 'medium' }
  ];

  const playwrightCode = `
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

// e2e/challenge-submission.spec.js
import { test, expect } from '@playwright/test';

test.describe('Challenge Submission Flow', () => {
  test('should submit a new challenge successfully', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to challenges
    await page.click('text=Challenges');
    await page.click('text=Add Challenge');
    
    // Fill form
    await page.fill('[name="title_en"]', 'Test Challenge');
    await page.fill('[name="description_en"]', 'Test description...');
    await page.selectOption('[name="sector"]', 'transport');
    
    // AI Enhancement
    await page.click('text=Enhance with AI');
    await expect(page.locator('.ai-suggestions')).toBeVisible();
    
    // Submit
    await page.click('button:has-text("Submit")');
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page).toHaveURL(/.*challenge.*/);
  });
  
  test('should validate required fields', async ({ page }) => {
    await page.goto('/challenges/create');
    await page.click('button:has-text("Submit")');
    await expect(page.locator('.error-message')).toContainText('required');
  });
});

// Run: npx playwright test
// Report: npx playwright show-report
`;

  return (
    <Card className="border-2 border-indigo-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-indigo-600" />
          Playwright E2E Testing
          <Badge variant="outline" className="ml-auto">Setup Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">E2E Testing Gap: 0 Tests</p>
              <p>Critical user flows untested - Playwright setup needed</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Critical User Flows:</p>
          {criticalFlows.map((flow, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{flow.flow}</p>
                  <p className="text-xs text-slate-600 mt-1">{flow.scenarios} test scenarios needed</p>
                </div>
                <Badge 
                  variant={flow.priority === 'critical' ? 'destructive' : flow.priority === 'high' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {flow.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={0} className="flex-1 h-2" />
                <span className="text-xs text-slate-600">{flow.tests}/{flow.scenarios}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Code className="h-3 w-3" />
            Playwright Setup & Example
          </p>
          <pre className="text-xs text-slate-600 overflow-x-auto max-h-96">{playwrightCode}</pre>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">0</p>
            <p className="text-xs text-red-700">E2E Tests</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">58</p>
            <p className="text-xs text-amber-700">Target Scenarios</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">6</p>
            <p className="text-xs text-blue-700">Critical Flows</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}