export type ActionType = 'click' | 'input' | 'assertion' | 'navigation' | 'select' | 'submit';

export type AssertionType = 'isVisible' | 'hasText' | 'hasValue' | 'isDisabled' | 'isEnabled' | 'doesNotExist';

export interface RecordedStep {
  id: string;
  type: ActionType;
  targetSelector: string;
  targetTag?: string;
  targetRole?: string;
  targetText?: string;
  targetLabel?: string;
  targetTestId?: string;
  value?: string;
  assertionType?: AssertionType;
  assertionExpected?: string;
  timestamp: number;
  durationMs?: number;
  description: string;
  status?: 'idle' | 'running' | 'passed' | 'failed';
  errorMessage?: string;
}

export type SupportedFramework = 'playwright' | 'cypress' | 'jest-rtl' | 'gherkin' | 'manual-qa' | 'github-actions';

export interface ManualTestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

export interface EdgeCaseSuggestion {
  title: string;
  description?: string;
  scenario?: string;
  type?: 'negative' | 'boundary' | 'security' | 'resilience' | string;
  riskLevel?: 'Critical' | 'High' | 'Medium' | 'Low';
  priority?: 'High' | 'Medium' | 'Low';
  recommendedPlaywrightSnippet?: string;
}

export interface GeneratedTestSuite {
  scenarioTitle: string;
  summary: string;
  playwrightCode: string;
  cypressCode: string;
  jestRtlCode: string;
  gherkinBdd: string;
  manualSteps: ManualTestStep[];
  edgeCases: EdgeCaseSuggestion[];
  healingNotes?: string;
  generatedAt: number;
}

export type SandboxAppId = 'store' | 'saas' | 'invoicing';

export interface AutonomousPlanStep {
  action: 'click' | 'input' | 'assertion' | 'select';
  selector: string;
  role?: string;
  text?: string;
  value?: string;
  assertionType?: AssertionType;
  expected?: string;
  description: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AutonomousPlan {
  planName: string;
  strategy: string;
  steps: AutonomousPlanStep[];
}
