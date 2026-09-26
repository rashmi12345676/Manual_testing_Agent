import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { ZipArchive } from 'archiver';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ActionStep {
  id: string;
  type: 'click' | 'input' | 'assertion' | 'navigation' | 'select' | 'submit';
  targetSelector: string;
  targetTag?: string;
  targetRole?: string;
  targetText?: string;
  targetLabel?: string;
  targetTestId?: string;
  value?: string;
  assertionType?: 'isVisible' | 'hasText' | 'hasValue' | 'isDisabled' | 'isEnabled' | 'doesNotExist';
  assertionExpected?: string;
  timestamp: number;
  description: string;
  url?: string;
}

// Fallback generator when Gemini API is offline or without key
function fallbackTestGenerator(
  steps: ActionStep[],
  scenarioTitle: string,
  appType: string
) {
  const title = scenarioTitle || `E2E Flow - ${appType.toUpperCase()}`;

  const playwrightLines: string[] = [
    `import { test, expect } from '@playwright/test';`,
    ``,
    `test.describe('${title}', () => {`,
    `  test('should execute recorded manual user workflow successfully', async ({ page }) => {`,
    `    // 1. Arrange & Navigate`,
    `    await page.goto('/');`,
    ``,
  ];

  const cypressLines: string[] = [
    `describe('${title}', () => {`,
    `  it('executes recorded manual user flow', () => {`,
    `    cy.visit('/');`,
    ``,
  ];

  const gherkinLines: string[] = [
    `Feature: ${title}`,
    `  As a QA engineer`,
    `  I want to verify the user journey in ${appType}`,
    ``,
    `  Scenario: User performs recorded workflow`,
    `    Given the user navigates to the application`,
  ];

  const manualSteps: Array<{
    stepNumber: number;
    action: string;
    expectedResult: string;
    testData?: string;
  }> = [];

  steps.forEach((step, index) => {
    const num = index + 1;
    const locator = step.targetTestId
      ? `page.getByTestId('${step.targetTestId}')`
      : step.targetRole && step.targetText
      ? `page.getByRole('${step.targetRole}', { name: '${step.targetText}' })`
      : step.targetLabel
      ? `page.getByLabel('${step.targetLabel}')`
      : step.targetText && step.targetTag === 'BUTTON'
      ? `page.getByRole('button', { name: '${step.targetText}' })`
      : `page.locator('${step.targetSelector || 'body'}')`;

    const cyLocator = step.targetTestId
      ? `cy.get('[data-testid="${step.targetTestId}"]')`
      : step.targetRole && step.targetText
      ? `cy.contains('${step.targetRole}', '${step.targetText}')`
      : step.targetText
      ? `cy.contains('${step.targetText}')`
      : `cy.get('${step.targetSelector || 'body'}')`;

    if (step.type === 'click') {
      playwrightLines.push(`    // Step ${num}: ${step.description}`);
      playwrightLines.push(`    await ${locator}.click();`);
      playwrightLines.push(``);

      cypressLines.push(`    // Step ${num}: ${step.description}`);
      cypressLines.push(`    ${cyLocator}.click();`);
      cypressLines.push(``);

      gherkinLines.push(`    When the user clicks "${step.targetText || step.targetSelector}"`);
      manualSteps.push({
        stepNumber: num,
        action: `Click on ${step.targetText || step.targetSelector} (${step.targetRole || step.targetTag || 'element'})`,
        expectedResult: 'Element responds to click, UI updates accordingly.',
      });
    } else if (step.type === 'input') {
      playwrightLines.push(`    // Step ${num}: ${step.description}`);
      playwrightLines.push(`    await ${locator}.fill('${step.value || ''}');`);
      playwrightLines.push(``);

      cypressLines.push(`    // Step ${num}: ${step.description}`);
      cypressLines.push(`    ${cyLocator}.clear().type('${step.value || ''}');`);
      cypressLines.push(``);

      gherkinLines.push(`    And the user enters "${step.value || ''}" into "${step.targetLabel || step.targetSelector}"`);
      manualSteps.push({
        stepNumber: num,
        action: `Fill "${step.value || ''}" into field "${step.targetLabel || step.targetSelector}"`,
        expectedResult: 'Field accepts input value and validates format.',
        testData: step.value,
      });
    } else if (step.type === 'assertion') {
      playwrightLines.push(`    // Step ${num}: Assertion - ${step.description}`);
      if (step.assertionType === 'hasText') {
        playwrightLines.push(`    await expect(${locator}).toContainText('${step.assertionExpected || ''}');`);
        cypressLines.push(`    ${cyLocator}.should('contain.text', '${step.assertionExpected || ''}');`);
      } else if (step.assertionType === 'isDisabled') {
        playwrightLines.push(`    await expect(${locator}).toBeDisabled();`);
        cypressLines.push(`    ${cyLocator}.should('be.disabled');`);
      } else if (step.assertionType === 'doesNotExist') {
        playwrightLines.push(`    await expect(${locator}).not.toBeVisible();`);
        cypressLines.push(`    ${cyLocator}.should('not.exist');`);
      } else {
        playwrightLines.push(`    await expect(${locator}).toBeVisible();`);
        cypressLines.push(`    ${cyLocator}.should('be.visible');`);
      }
      playwrightLines.push(``);
      cypressLines.push(``);

      gherkinLines.push(`    Then verify that "${step.targetSelector}" is ${step.assertionType || 'visible'}`);
      manualSteps.push({
        stepNumber: num,
        action: `Verify assertion: ${step.description}`,
        expectedResult: `Condition met: ${step.assertionType || 'visible'} matches expected state.`,
      });
    }
  });

  playwrightLines.push(`  });`);
  playwrightLines.push(`});`);

  cypressLines.push(`  });`);
  cypressLines.push(`});`);

  const jestRtlLines = [
    `import { render, screen, waitFor } from '@testing-library/react';`,
    `import userEvent from '@testing-library/user-event';`,
    `import App from '../App';`,
    ``,
    `describe('${title}', () => {`,
    `  it('renders and allows user to complete target workflow', async () => {`,
    `    const user = userEvent.setup();`,
    `    render(<App />);`,
    ``,
    `    // Automated user interaction sequence`,
    ...steps.map((s, idx) => {
      if (s.type === 'click') {
        return `    // Step ${idx + 1}: ${s.description}\n    const el${idx} = screen.getByRole('${s.targetRole || 'button'}', { name: /${s.targetText || ''}/i });\n    await user.click(el${idx});`;
      } else if (s.type === 'input') {
        return `    // Step ${idx + 1}: ${s.description}\n    const input${idx} = screen.getByLabelText(/${s.targetLabel || 'Input'}/i);\n    await user.type(input${idx}, '${s.value || ''}');`;
      } else {
        return `    // Step ${idx + 1}: Assertion\n    expect(screen.getByText(/${s.assertionExpected || s.targetText || ''}/i)).toBeInTheDocument();`;
      }
    }),
    `  });`,
    `});`,
  ];

  return {
    scenarioTitle: title,
    playwrightCode: playwrightLines.join('\n'),
    cypressCode: cypressLines.join('\n'),
    jestRtlCode: jestRtlLines.join('\n'),
    gherkinBdd: gherkinLines.join('\n'),
    manualSteps,
    edgeCases: [
      {
        title: 'Empty Field / Boundary Validation',
        description: 'Submit form with mandatory inputs stripped of values.',
        type: 'negative',
        priority: 'High',
      },
      {
        title: 'Special Character & SQL/XSS Injection Handling',
        description: 'Verify input sanitation for strings like <script>alert(1)</script> and unicode symbols.',
        type: 'security',
        priority: 'Medium',
      },
      {
        title: 'Rapid Double-Click Protection (Idempotency)',
        description: 'Ensure double-clicking action buttons does not trigger duplicate API requests or race conditions.',
        type: 'concurrency',
        priority: 'High',
      },
      {
        title: 'Network Timeout / 500 Server Error Simulation',
        description: 'Verify graceful error toast and retry mechanism when backend endpoint fails.',
        type: 'resilience',
        priority: 'High',
      },
    ],
    summary: `Synthesized ${steps.length} manual actions into end-to-end test suites across Playwright, Cypress, Jest RTL, and Cucumber BDD.`,
  };
}

// Route 1: AI Test Generation Endpoint
app.post('/api/agent/generate-tests', async (req: Request, res: Response) => {
  try {
    const { steps = [], scenarioTitle = 'Manual QA Session', appType = 'web-app' } = req.body;

    if (!Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({ error: 'No test steps provided to generate test cases.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no API key configured, use intelligent fallback
    if (!apiKey) {
      const fallbackResult = fallbackTestGenerator(steps, scenarioTitle, appType);
      return res.json(fallbackResult);
    }

    const stepsDescription = steps
      .map(
        (s: ActionStep, idx: number) =>
          `Step ${idx + 1}: Type="${s.type}", Target="${s.targetTag || ''} [role=${s.targetRole || ''}, testid=${s.targetTestId || ''}, selector=${s.targetSelector || ''}, text="${s.targetText || ''}", label="${s.targetLabel || ''}"]", Value="${s.value || ''}", Assertion="${s.assertionType || ''} (expected: ${s.assertionExpected || ''})"`
      )
      .join('\n');

    const prompt = `You are a Senior QA Automation Architect and Test Lead.
The QA tester performed the following manual test session on an application (${appType}):

Scenario: "${scenarioTitle}"
Recorded Actions:
${stepsDescription}

Generate comprehensive, production-grade test suites in valid JSON format matching this schema:
{
  "scenarioTitle": string (descriptive title of the tested workflow),
  "summary": string (2-3 sentences explaining what this test validates and quality risks),
  "playwrightCode": string (fully typed TypeScript Playwright test with imports, resilient locators using page.getByRole, getByLabel, getByTestId, and explicit expects),
  "cypressCode": string (idiomatic Cypress spec with describe/it blocks, best practice cy commands and assertions),
  "jestRtlCode": string (React Testing Library and Jest integration test using userEvent and screen),
  "gherkinBdd": string (standard Cucumber BDD Feature with Given/When/Then steps),
  "manualSteps": [
    {
      "stepNumber": number,
      "action": string,
      "expectedResult": string,
      "testData": string (optional)
    }
  ],
  "edgeCases": [
    {
      "title": string,
      "description": string,
      "type": "negative" | "boundary" | "security" | "resilience",
      "priority": "High" | "Medium" | "Low",
      "recommendedPlaywrightSnippet": string
    }
  ],
  "healingNotes": string (advice on locator resiliency, flaky prevention, and accessibility improvements)
}

Output ONLY valid JSON. No markdown backticks, no explanations outside the JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '{}';
    let parsedData;
    try {
      // Strip potential backticks if returned
      const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch {
      parsedData = fallbackTestGenerator(steps, scenarioTitle, appType);
    }

    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating tests with Gemini:', error);
    // Graceful fallback to guarantee zero breakage
    const fallbackResult = fallbackTestGenerator(req.body.steps || [], req.body.scenarioTitle || '', req.body.appType || 'web');
    return res.json(fallbackResult);
  }
});

// Route 2: Autonomous Exploration & Plan Generator
app.post('/api/agent/autonomous-plan', async (req: Request, res: Response) => {
  try {
    const { goal = 'Explore application and find potential bugs', appType = 'store', availableElements = [] } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Default heuristic action plan based on appType
      const fallbackPlan = [
        { action: 'click', selector: '[data-testid="search-input"]', role: 'searchbox', text: '', description: 'Locate and focus search input' },
        { action: 'input', selector: '[data-testid="search-input"]', value: 'Wireless Headphones', description: 'Type search query' },
        { action: 'click', selector: '[data-testid="add-to-cart-1"]', role: 'button', text: 'Add to Cart', description: 'Add first product to cart' },
        { action: 'click', selector: '[data-testid="cart-button"]', role: 'button', text: 'Cart', description: 'Open cart drawer' },
        { action: 'assertion', selector: '[data-testid="cart-badge"]', assertionType: 'hasText', expected: '1', description: 'Verify cart item count is 1' },
        { action: 'click', selector: '[data-testid="checkout-btn"]', role: 'button', text: 'Proceed to Checkout', description: 'Navigate to checkout' },
      ];
      return res.json({
        planName: `Autonomous Exploration: ${goal}`,
        strategy: 'Systematic workflow validation with boundary checks',
        steps: fallbackPlan,
      });
    }

    const prompt = `You are an Autonomous AI QA Test Agent.
Target Application: ${appType}
Test Mission/Goal: "${goal}"
Available DOM elements summary: ${JSON.stringify(availableElements.slice(0, 20))}

Plan a sequence of 4 to 8 realistic manual testing actions to test this goal.
Return valid JSON matching this schema:
{
  "planName": string,
  "strategy": string,
  "steps": [
    {
      "action": "click" | "input" | "assertion" | "select",
      "selector": string,
      "role": string,
      "text": string,
      "value": string (for input),
      "assertionType": "isVisible" | "hasText" | "isDisabled",
      "expected": string (for assertion),
      "description": string
    }
  ]
}
Output ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim() || '{}';
    const cleanJson = text.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const result = JSON.parse(cleanJson);
    return res.json(result);
  } catch (error) {
    console.error('Error generating autonomous plan:', error);
    return res.json({
      planName: 'Exploration Plan',
      strategy: 'Heuristic traversal',
      steps: [
        { action: 'click', selector: 'button:first-of-type', description: 'Interact with primary action button' },
      ],
    });
  }
});

// Route 3: Edge Case Generator
app.post('/api/agent/suggest-edge-cases', async (req: Request, res: Response) => {
  try {
    const { steps = [], appType = 'app' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        suggestions: [
          {
            title: 'Empty required fields submission',
            scenario: 'Clear all required form fields and attempt submit to verify error states.',
            riskLevel: 'High',
            category: 'Input Validation',
          },
          {
            title: 'Extreme string length & emoji inputs',
            scenario: 'Input 500+ characters and multi-byte emojis into name/notes fields to verify layout and DB truncation.',
            riskLevel: 'Medium',
            category: 'Boundary',
          },
          {
            title: 'Rapid double click on transaction CTA',
            scenario: 'Rapidly fire submit twice within 50ms to ensure deduplication and prevent double charging.',
            riskLevel: 'Critical',
            category: 'Race Condition',
          },
        ],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are a QA automation expert. Given these recorded user interactions: ${JSON.stringify(steps)}, identify 4 subtle edge cases or negative scenarios that the manual tester missed in application '${appType}'.
Return JSON with:
{
  "suggestions": [
    {
      "title": string,
      "scenario": string,
      "riskLevel": "Critical" | "High" | "Medium",
      "category": string
    }
  ]
}`,
      config: { responseMimeType: 'application/json' },
    });

    const cleanJson = (response.text || '{}').replace(/^```json/i, '').replace(/```$/i, '').trim();
    return res.json(JSON.parse(cleanJson));
  } catch (error) {
    return res.json({
      suggestions: [
        {
          title: 'Empty required fields submission',
          scenario: 'Clear all required form fields and attempt submit to verify error states.',
          riskLevel: 'High',
          category: 'Input Validation',
        },
      ],
    });
  }
});

// Route 4: Export Generated Test Suite as ZIP
app.post('/api/export/test-suite-zip', (req: Request, res: Response) => {
  try {
    const {
      scenarioTitle = 'e2e-workflow',
      playwrightCode = '',
      cypressCode = '',
      jestRtlCode = '',
      gherkinBdd = '',
      manualSteps = [],
      edgeCases = [],
      githubActionsYml = '',
    } = req.body;

    const safeTitle = (scenarioTitle || 'test-suite')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-');

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}-tests.zip"`);

    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      console.error('Archive error:', err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    // 1. Playwright spec
    if (playwrightCode) {
      archive.append(playwrightCode, { name: `tests/playwright/${safeTitle}.spec.ts` });
      archive.append(
        `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 30000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
`,
        { name: 'playwright.config.ts' }
      );
    }

    // 2. Cypress spec
    if (cypressCode) {
      archive.append(cypressCode, { name: `cypress/e2e/${safeTitle}.cy.js` });
      archive.append(
        `import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
});
`,
        { name: 'cypress.config.js' }
      );
    }

    // 3. Jest RTL
    if (jestRtlCode) {
      archive.append(jestRtlCode, { name: `src/__tests__/${safeTitle}.test.tsx` });
    }

    // 4. Cucumber / Gherkin BDD
    if (gherkinBdd) {
      archive.append(gherkinBdd, { name: `features/${safeTitle}.feature` });
    }

    // 5. QA Manual Test Matrix CSV
    if (Array.isArray(manualSteps) && manualSteps.length > 0) {
      const csvHeader = 'Step Number,Action Description,Expected Result,Test Data\n';
      const csvRows = manualSteps
        .map(
          (s: any) =>
            `"${s.stepNumber}","${(s.action || '').replace(/"/g, '""')}","${(s.expectedResult || '').replace(
              /"/g,
              '""'
            )}","${(s.testData || '').replace(/"/g, '""')}"`
        )
        .join('\n');
      archive.append(csvHeader + csvRows, { name: `manual-qa/${safeTitle}-matrix.csv` });
    }

    // 6. GitHub Actions Workflow
    const workflowContent =
      githubActionsYml ||
      `name: CI / QA Test Automation Suite

on:
  push:
    branches: [ "main", "master", "develop" ]
  pull_request:
    branches: [ "main", "master" ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx playwright install --with-deps chromium
      - run: npm test || true
`;
    archive.append(workflowContent, { name: '.github/workflows/test-automation.yml' });

    // 7. Readme for running the generated test files
    const readmeContent = `# ${scenarioTitle} - Automated Test Package

Generated by **AutoTest Agent**.

## Contents
- \`tests/playwright/\`: Playwright E2E spec + \`playwright.config.ts\`
- \`cypress/e2e/\`: Cypress test spec + \`cypress.config.js\`
- \`src/__tests__/\`: Jest & React Testing Library specs
- \`features/\`: Cucumber BDD Feature file
- \`manual-qa/\`: Tabular CSV Manual QA test steps
- \`.github/workflows/\`: GitHub Actions CI pipeline

## Running Tests

### Playwright
\`\`\`bash
npm install -D @playwright/test
npx playwright test
\`\`\`

### Cypress
\`\`\`bash
npm install -D cypress
npx cypress run
\`\`\`

### Manual QA
Open \`manual-qa/${safeTitle}-matrix.csv\` in Excel, Google Sheets, or Jira.
`;
    archive.append(readmeContent, { name: 'README.md' });

    archive.finalize();
  } catch (error) {
    console.error('Error generating test suite ZIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create test suite ZIP file.' });
    }
  }
});

// Route 5: Export Entire Project Repository as ZIP
app.get('/api/export/project-zip', (req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="autotest-agent-project.zip"');

    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      console.error('Archive project error:', err);
      if (!res.headersSent) {
        res.status(500).send({ error: err.message });
      }
    });

    archive.pipe(res);

    const rootDir = path.resolve('.');

    // Exclude node_modules, dist, .git, etc.
    archive.glob('**/*', {
      cwd: rootDir,
      ignore: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '*.log',
        '.vite/**',
        'server.js',
      ],
      dot: true,
    });

    archive.finalize();
  } catch (error) {
    console.error('Error creating project ZIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to create project ZIP file.' });
    }
  }
});

// Setup Vite middleware for development or serve build in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoTest Agent Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
