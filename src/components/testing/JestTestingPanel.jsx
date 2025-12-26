import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, TestTube, Code } from 'lucide-react';

export default function JestTestingPanel() {
  const testSuites = [
    { component: 'TaskForm', tests: 0, target: 8, coverage: 0 },
    { component: 'PermissionGate', tests: 0, target: 6, coverage: 0 },
    { component: 'ChallengeSolutionMatching', tests: 0, target: 10, coverage: 0 },
    { component: 'PilotKPITracker', tests: 0, target: 12, coverage: 0 },
    { component: 'AIAssistant', tests: 0, target: 15, coverage: 0 }
  ];

  const setupCode = `
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}

// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx}',
    'pages/**/*.{js,jsx}',
  ],
  coverageThresholds: {
    global: {
      statements: 30,
      branches: 30,
      functions: 30,
      lines: 30
    }
  }
};

// Example test: __tests__/TaskForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders form fields', () => {
    render(<TaskForm onSubmit={jest.fn()} />);
    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    const onSubmit = jest.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    fireEvent.click(screen.getByText(/submit/i));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
`;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          Jest Unit Testing Framework
          <Badge variant="outline" className="ml-auto">Setup Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Testing Gap: 0% Coverage</p>
              <p>Jest framework setup and test suite creation required</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <p className="text-3xl font-bold text-red-600">0%</p>
            <p className="text-xs text-red-700">Current Coverage</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-3xl font-bold text-amber-600">30%</p>
            <p className="text-xs text-amber-700">Target Coverage</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-3xl font-bold text-blue-600">150+</p>
            <p className="text-xs text-blue-700">Components</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Priority Test Suites:</p>
          {testSuites.map((suite, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{suite.component}</span>
                <Badge variant="outline">{suite.tests}/{suite.target} tests</Badge>
              </div>
              <Progress value={(suite.tests / suite.target) * 100} className="h-2" />
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg">
          <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Code className="h-3 w-3" />
            Jest Setup & Example Tests
          </p>
          <pre className="text-xs text-slate-600 overflow-x-auto max-h-64">{setupCode}</pre>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-medium">Implementation Steps:</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>1. Install testing dependencies</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>2. Configure jest.config.js and setup files</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>3. Create __tests__ directories</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>4. Write tests for critical components (30+ components)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-amber-600" />
              <span>5. Integrate with CI/CD pipeline</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
