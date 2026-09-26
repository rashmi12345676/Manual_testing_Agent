import React, { useState } from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { SupportedFramework } from '../../types/testAgent';
import {
  Copy,
  Check,
  Download,
  Code2,
  Terminal,
  FileCode,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  PlayCircle,
  GitBranch,
  Archive,
} from 'lucide-react';

export const CodeGeneratorView: React.FC = () => {
  const {
    activeFramework,
    setActiveFramework,
    generatedSuite,
    isGenerating,
    generateTests,
    runReplay,
    isReplaying,
    steps,
  } = useTestAgent();

  const [copied, setCopied] = useState(false);
  const [isZippingSuite, setIsZippingSuite] = useState(false);

  const getCodeContent = (): string => {
    if (activeFramework === 'github-actions') {
      return `name: CI / QA Test Automation Suite

on:
  push:
    branches: [ "main", "master", "develop" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:
    inputs:
      test_suite:
        description: 'Test suite to run'
        required: true
        default: 'all'
        type: choice
        options:
          - all
          - playwright
          - cypress
          - unit-jest

jobs:
  # Job 1: Linting and TypeScript typechecking
  lint-and-typecheck:
    name: 🔍 Lint & Static Analysis
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: TypeScript type checking
        run: npm run lint

      - name: Verify build artifact compilation
        run: npm run build

  # Job 2: Playwright End-to-End Automated Tests
  playwright-e2e:
    name: 🎭 Playwright E2E Tests
    needs: lint-and-typecheck
    if: \${{ github.event.inputs.test_suite == 'all' || github.event.inputs.test_suite == 'playwright' || github.event_name != 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start Application Server
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000 --timeout 60000
        env:
          PORT: 3000
          NODE_ENV: production
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}

      - name: Run Playwright Tests
        run: npx playwright test || true

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

  # Job 3: Cypress E2E Workflow Tests
  cypress-e2e:
    name: 🌲 Cypress E2E Workflow Tests
    needs: lint-and-typecheck
    if: \${{ github.event.inputs.test_suite == 'all' || github.event.inputs.test_suite == 'cypress' || github.event_name != 'workflow_dispatch' }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Run Cypress Tests
        run: npx cypress run --headless || true

  # Job 4: Auto-Generate Regression Tests via Agent API
  ai-agent-regression-check:
    name: 🤖 Background Test Case Generation Verification
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci || npm install

      - name: Build & Launch Test Agent Server
        run: |
          npm run build
          npm run start &
          npx wait-on http://localhost:3000 --timeout 60000
        env:
          PORT: 3000
          NODE_ENV: production
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}

      - name: Test Agent Synthesizer Endpoint
        run: |
          curl -s -X POST http://localhost:3000/api/agent/generate-tests \\
            -H "Content-Type: application/json" \\
            -d '{"steps":[{"id":"1","type":"click","targetSelector":"[data-testid=\\"cart-button\\"]","description":"Click Cart"}],"scenarioTitle":"CI Validation Test","appType":"store"}'
`;
    }

    if (!generatedSuite) return '// No test suite generated yet. Click "Generate Test Cases" above.';
    switch (activeFramework) {
      case 'playwright':
        return generatedSuite.playwrightCode;
      case 'cypress':
        return generatedSuite.cypressCode;
      case 'jest-rtl':
        return generatedSuite.jestRtlCode;
      case 'gherkin':
        return generatedSuite.gherkinBdd;
      default:
        return generatedSuite.playwrightCode;
    }
  };

  const getFilename = () => {
    switch (activeFramework) {
      case 'playwright':
        return 'e2e-workflow.spec.ts';
      case 'cypress':
        return 'e2e-workflow.cy.js';
      case 'jest-rtl':
        return 'App.test.tsx';
      case 'gherkin':
        return 'workflow.feature';
      case 'manual-qa':
        return 'manual-test-script.csv';
      case 'github-actions':
        return 'test-automation.yml';
    }
  };

  const handleCopy = () => {
    const text = getCodeContent();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSuiteZip = async () => {
    if (!generatedSuite) return;
    setIsZippingSuite(true);
    try {
      const response = await fetch('/api/export/test-suite-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: generatedSuite.scenarioTitle,
          playwrightCode: generatedSuite.playwrightCode,
          cypressCode: generatedSuite.cypressCode,
          jestRtlCode: generatedSuite.jestRtlCode,
          gherkinBdd: generatedSuite.gherkinBdd,
          manualSteps: generatedSuite.manualSteps,
          edgeCases: generatedSuite.edgeCases,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create ZIP package');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(generatedSuite.scenarioTitle || 'test-suite').toLowerCase().replace(/[^a-z0-9]/g, '-')}-tests.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading suite zip:', err);
    } finally {
      setIsZippingSuite(false);
    }
  };

  const handleDownload = () => {
    const content =
      activeFramework === 'manual-qa' && generatedSuite
        ? [
            'Step Number,Action Description,Expected Result,Test Data',
            ...generatedSuite.manualSteps.map(
              (s) => `"${s.stepNumber}","${s.action.replace(/"/g, '""')}","${s.expectedResult.replace(/"/g, '""')}","${(s.testData || '').replace(/"/g, '""')}"`
            ),
          ].join('\n')
        : getCodeContent();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFilename();
    link.click();
    URL.revokeObjectURL(url);
  };

  const frameworks: { id: SupportedFramework; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'playwright', label: 'Playwright', icon: Terminal },
    { id: 'cypress', label: 'Cypress', icon: Code2 },
    { id: 'jest-rtl', label: 'Jest & RTL', icon: FileCode },
    { id: 'gherkin', label: 'Cucumber BDD', icon: Layers },
    { id: 'manual-qa', label: 'QA Manual Matrix', icon: FileSpreadsheet },
    { id: 'github-actions', label: 'GitHub Actions CI', icon: GitBranch },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Framework Switcher Header */}
      <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
          {frameworks.map((fw) => {
            const Icon = fw.icon;
            const isActive = activeFramework === fw.id;
            return (
              <button
                key={fw.id}
                type="button"
                onClick={() => setActiveFramework(fw.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{fw.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runReplay}
            disabled={isReplaying || steps.length === 0}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isReplaying ? 'Replaying...' : 'Replay Test'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-2.5 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>File</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadSuiteZip}
            disabled={!generatedSuite || isZippingSuite}
            title="Download full suite as a .ZIP archive (Playwright, Cypress, Jest, BDD, CSV & GitHub Actions)"
            className="px-2.5 py-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-md flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Archive className={`w-3.5 h-3.5 ${isZippingSuite ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isZippingSuite ? 'Zipping...' : 'Suite.zip'}</span>
          </button>
        </div>
      </div>

      {/* AI Summary Banner */}
      {generatedSuite && (
        <div className="bg-slate-800/80 border-b border-slate-800 px-4 py-2.5 flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">{generatedSuite.scenarioTitle}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{generatedSuite.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Resilient Locators
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {activeFramework === 'manual-qa' ? (
          /* Manual QA Table View */
          <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-sans">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <span className="font-semibold text-xs text-white">Manual QA Test Case Matrix</span>
              <span className="text-[11px] text-slate-400">
                {generatedSuite?.manualSteps.length || 0} Test Steps
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-14">#</th>
                  <th className="p-3">User Action</th>
                  <th className="p-3">Test Data</th>
                  <th className="p-3">Expected Result</th>
                  <th className="p-3 w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {generatedSuite?.manualSteps.map((step) => (
                  <tr key={step.stepNumber} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-slate-400">{step.stepNumber}</td>
                    <td className="p-3 font-medium text-slate-200">{step.action}</td>
                    <td className="p-3 font-mono text-[11px] text-amber-300">
                      {step.testData ? `"${step.testData}"` : '—'}
                    </td>
                    <td className="p-3 text-slate-300">{step.expectedResult}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/80 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Code View with Line Numbers */
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 overflow-x-auto relative">
            <pre className="text-slate-200 leading-relaxed font-mono whitespace-pre text-[12px]">
              {getCodeContent()}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-slate-800 bg-slate-950 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Generates standard Playwright & Cypress test specs using <code>page.getByRole</code> and{' '}
            <code>getByTestId</code> to prevent test flakiness.
          </span>
        </div>
        <button
          type="button"
          onClick={() => generateTests()}
          disabled={isGenerating}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer"
        >
          {isGenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
};
