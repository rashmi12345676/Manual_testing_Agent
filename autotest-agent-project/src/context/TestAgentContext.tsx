import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  RecordedStep,
  GeneratedTestSuite,
  SupportedFramework,
  SandboxAppId,
  AssertionType,
  AutonomousPlan,
  AutonomousPlanStep,
} from '../types/testAgent';

interface TestAgentContextValue {
  // App Selection
  selectedApp: SandboxAppId;
  setSelectedApp: (app: SandboxAppId) => void;

  // Recording State
  isRecording: boolean;
  startRecording: () => void;
  pauseRecording: () => void;
  clearRecording: () => void;
  steps: RecordedStep[];
  setSteps: React.Dispatch<React.SetStateAction<RecordedStep[]>>;
  deleteStep: (id: string) => void;

  // Assertion Dropper Mode
  isAssertionMode: boolean;
  toggleAssertionMode: () => void;
  addAssertion: (step: Omit<RecordedStep, 'id' | 'timestamp'>) => void;

  // Test Suite Generation
  activeFramework: SupportedFramework;
  setActiveFramework: (fw: SupportedFramework) => void;
  generatedSuite: GeneratedTestSuite | null;
  isGenerating: boolean;
  generateTests: (title?: string) => Promise<void>;
  generationError: string | null;

  // Test Replayer
  isReplaying: boolean;
  replaySpeedMs: number;
  setReplaySpeedMs: (speed: number) => void;
  replayLogs: string[];
  runReplay: () => Promise<void>;
  stopReplay: () => void;

  // Autonomous Robot Mode
  isAutonomousRunning: boolean;
  autonomousPlan: AutonomousPlan | null;
  currentAgentGoal: string;
  setCurrentAgentGoal: (goal: string) => void;
  runAutonomousAgent: (goal: string) => Promise<void>;
  stopAutonomousAgent: () => void;

  // Sandbox DOM Container Ref
  sandboxRef: React.RefObject<HTMLDivElement | null>;
  hoveredElementInfo: { selector: string; text?: string; tag: string } | null;
  pendingAssertionElement: {
    selector: string;
    tag: string;
    role?: string;
    text?: string;
    testId?: string;
    label?: string;
    currentValue?: string;
  } | null;
  setPendingAssertionElement: React.Dispatch<React.SetStateAction<any>>;
}

const TestAgentContext = createContext<TestAgentContextValue | undefined>(undefined);

// Helper to determine best locator
function getBestElementLocator(el: HTMLElement): {
  selector: string;
  testId?: string;
  role?: string;
  text?: string;
  label?: string;
} {
  const testId = el.getAttribute('data-testid') || el.closest('[data-testid]')?.getAttribute('data-testid');
  const role = el.getAttribute('role') || el.tagName.toLowerCase();
  const label = el.getAttribute('aria-label') || el.getAttribute('name') || undefined;
  const rawText = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);

  if (testId) {
    return { selector: `[data-testid="${testId}"]`, testId, role, text: rawText, label };
  }

  if (el.id) {
    return { selector: `#${el.id}`, role, text: rawText, label };
  }

  if (label) {
    return { selector: `[aria-label="${label}"]`, role, text: rawText, label };
  }

  // If button or link with clean text
  if (['button', 'a'].includes(el.tagName.toLowerCase()) && rawText) {
    return { selector: `${el.tagName.toLowerCase()}:contains("${rawText}")`, role, text: rawText, label };
  }

  // Fallback CSS path
  const tag = el.tagName.toLowerCase();
  const className = el.className && typeof el.className === 'string'
    ? '.' + el.className.trim().split(/\s+/)[0]
    : '';

  return { selector: `${tag}${className}`, role, text: rawText, label };
}

export const TestAgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedApp, setSelectedApp] = useState<SandboxAppId>('store');
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [steps, setSteps] = useState<RecordedStep[]>([
    // Initial sample recorded step to immediately delight user on first load
    {
      id: 'init-step-1',
      type: 'click',
      targetSelector: '[data-testid="search-input"]',
      targetTag: 'INPUT',
      targetRole: 'searchbox',
      targetLabel: 'Search tech accessories',
      targetTestId: 'search-input',
      timestamp: Date.now() - 12000,
      description: 'Focus and click on catalog search input',
      status: 'passed',
    },
    {
      id: 'init-step-2',
      type: 'input',
      targetSelector: '[data-testid="search-input"]',
      targetTag: 'INPUT',
      targetLabel: 'Search tech accessories',
      targetTestId: 'search-input',
      value: 'Headphones',
      timestamp: Date.now() - 8000,
      description: 'Type "Headphones" into catalog search',
      status: 'passed',
    },
    {
      id: 'init-step-3',
      type: 'click',
      targetSelector: '[data-testid="add-to-cart-prod-1"]',
      targetTag: 'BUTTON',
      targetRole: 'button',
      targetText: 'Add to Cart',
      targetTestId: 'add-to-cart-prod-1',
      timestamp: Date.now() - 4000,
      description: 'Click "Add to Cart" button for Acoustic Pro Wireless Headphones',
      status: 'passed',
    },
    {
      id: 'init-step-4',
      type: 'assertion',
      targetSelector: '[data-testid="cart-badge"]',
      targetTag: 'SPAN',
      targetTestId: 'cart-badge',
      assertionType: 'hasText',
      assertionExpected: '1',
      timestamp: Date.now() - 1000,
      description: 'Assert cart badge count equals 1',
      status: 'passed',
    },
  ]);

  const [activeFramework, setActiveFramework] = useState<SupportedFramework>('playwright');
  const [generatedSuite, setGeneratedSuite] = useState<GeneratedTestSuite | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Assertion Dropper Mode
  const [isAssertionMode, setIsAssertionMode] = useState<boolean>(false);
  const [hoveredElementInfo, setHoveredElementInfo] = useState<{ selector: string; text?: string; tag: string } | null>(null);
  const [pendingAssertionElement, setPendingAssertionElement] = useState<any>(null);

  // Replayer
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeedMs, setReplaySpeedMs] = useState(650);
  const [replayLogs, setReplayLogs] = useState<string[]>([]);
  const replayerStopRef = useRef(false);

  // Autonomous Agent
  const [isAutonomousRunning, setIsAutonomousRunning] = useState(false);
  const [autonomousPlan, setAutonomousPlan] = useState<AutonomousPlan | null>(null);
  const [currentAgentGoal, setCurrentAgentGoal] = useState('Find checkout flow edge cases and verify cart calculations');

  // Input debouncing ref for recording
  const lastInputTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const sandboxRef = useRef<HTMLDivElement | null>(null);

  const startRecording = () => setIsRecording(true);
  const pauseRecording = () => setIsRecording(false);
  const clearRecording = () => {
    setSteps([]);
    setGeneratedSuite(null);
  };
  const deleteStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleAssertionMode = () => {
    setIsAssertionMode((prev) => !prev);
    setPendingAssertionElement(null);
  };

  const addAssertion = (assertionData: Omit<RecordedStep, 'id' | 'timestamp'>) => {
    const newStep: RecordedStep = {
      ...assertionData,
      id: `step-assert-${Date.now()}`,
      timestamp: Date.now(),
      status: 'idle',
    };
    setSteps((prev) => [...prev, newStep]);
    setIsAssertionMode(false);
    setPendingAssertionElement(null);
  };

  // Automated background test generation
  const generateTests = useCallback(
    async (title?: string) => {
      if (steps.length === 0) return;
      setIsGenerating(true);
      setGenerationError(null);

      try {
        const scenarioTitle = title || `Manual QA Journey - ${selectedApp.toUpperCase()} Workflow`;
        const res = await fetch('/api/agent/generate-tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            steps,
            scenarioTitle,
            appType: selectedApp,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to generate tests: ${res.statusText}`);
        }

        const data: GeneratedTestSuite = await res.json();
        setGeneratedSuite({
          ...data,
          generatedAt: Date.now(),
        });
      } catch (err: any) {
        console.error('Error in generateTests:', err);
        setGenerationError(err.message || 'Error communicating with AI Test Agent server.');
      } finally {
        setIsGenerating(false);
      }
    },
    [steps, selectedApp]
  );

  // Trigger test generation initially or when step count reaches milestone
  useEffect(() => {
    if (steps.length > 0 && !generatedSuite && !isGenerating) {
      generateTests();
    }
  }, [steps.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Global Sandbox Event Listener for Manual Testing
  useEffect(() => {
    const container = sandboxRef.current;
    if (!container) return;

    // Click interceptor
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !container.contains(target)) return;

      // If in assertion mode, intercept click to pin assertion
      if (isAssertionMode) {
        e.preventDefault();
        e.stopPropagation();
        const locator = getBestElementLocator(target);
        const tag = target.tagName.toUpperCase();
        const currentValue = (target as HTMLInputElement).value || target.innerText || '';

        setPendingAssertionElement({
          selector: locator.selector,
          tag,
          role: locator.role,
          text: locator.text,
          testId: locator.testId,
          label: locator.label,
          currentValue,
        });
        return;
      }

      if (!isRecording) return;

      // Don't record internal click on modal close if ignored
      const locator = getBestElementLocator(target);
      const tag = target.tagName.toUpperCase();
      const text = locator.text || '';

      // Skip recording clicks on standard text inside inputs
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        // Inputs handled via input/change events
        return;
      }

      // Add visual ripple / ring to show captured step
      target.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-1');
      setTimeout(() => {
        target.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-1');
      }, 400);

      const description = text
        ? `Click ${locator.role || tag.toLowerCase()} "${text}"`
        : `Click on ${locator.selector}`;

      const newStep: RecordedStep = {
        id: `step-click-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'click',
        targetSelector: locator.selector,
        targetTag: tag,
        targetRole: locator.role,
        targetText: text,
        targetLabel: locator.label,
        targetTestId: locator.testId,
        timestamp: Date.now(),
        description,
        status: 'idle',
      };

      setSteps((prev) => [...prev, newStep]);
    };

    // Input / Change Interceptor (Debounced per element)
    const handleInput = (e: Event) => {
      if (!isRecording || isAssertionMode) return;
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target || !container.contains(target)) return;

      const locator = getBestElementLocator(target);
      const val = target.type === 'checkbox' ? (target as HTMLInputElement).checked.toString() : target.value;
      const tag = target.tagName.toUpperCase();
      const key = locator.selector;

      if (lastInputTimerRef.current[key]) {
        clearTimeout(lastInputTimerRef.current[key]);
      }

      lastInputTimerRef.current[key] = setTimeout(() => {
        const description = locator.label
          ? `Type "${val}" into ${locator.label}`
          : `Fill "${val}" into ${locator.selector}`;

        const newStep: RecordedStep = {
          id: `step-input-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'input',
          targetSelector: locator.selector,
          targetTag: tag,
          targetLabel: locator.label,
          targetTestId: locator.testId,
          value: val,
          timestamp: Date.now(),
          description,
          status: 'idle',
        };

        setSteps((prev) => {
          // If the previous step was input on the same selector, update it in place
          const last = prev[prev.length - 1];
          if (last && last.type === 'input' && last.targetSelector === locator.selector) {
            return [...prev.slice(0, -1), newStep];
          }
          return [...prev, newStep];
        });
      }, 450);
    };

    // Hover inspector when in assertion mode
    const handleMouseOver = (e: MouseEvent) => {
      if (!isAssertionMode) {
        if (hoveredElementInfo) setHoveredElementInfo(null);
        return;
      }
      const target = e.target as HTMLElement;
      if (!target || !container.contains(target)) return;
      const locator = getBestElementLocator(target);
      setHoveredElementInfo({
        selector: locator.selector,
        text: locator.text,
        tag: target.tagName.toLowerCase(),
      });
    };

    container.addEventListener('click', handleClick, true);
    container.addEventListener('input', handleInput, true);
    container.addEventListener('change', handleInput, true);
    container.addEventListener('mouseover', handleMouseOver);

    return () => {
      container.removeEventListener('click', handleClick, true);
      container.removeEventListener('input', handleInput, true);
      container.removeEventListener('change', handleInput, true);
      container.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isRecording, isAssertionMode, hoveredElementInfo]);

  // Replay Execution Engine
  const runReplay = async () => {
    if (steps.length === 0 || isReplaying) return;
    setIsReplaying(true);
    replayerStopRef.current = false;
    setReplayLogs([`[Runner] Starting live playback of ${steps.length} test steps...`]);

    const container = sandboxRef.current;

    for (let i = 0; i < steps.length; i++) {
      if (replayerStopRef.current) {
        setReplayLogs((prev) => [...prev, `[Runner] Playback stopped by user.`]);
        break;
      }

      const step = steps[i];
      setSteps((prev) =>
        prev.map((s, idx) => (idx === i ? { ...s, status: 'running' } : s))
      );

      setReplayLogs((prev) => [
        ...prev,
        `[Step ${i + 1}/${steps.length}] Executing: ${step.description}`,
      ]);

      await new Promise((r) => setTimeout(r, replaySpeedMs));

      try {
        let el: HTMLElement | null = null;
        if (container) {
          if (step.targetTestId) {
            el = container.querySelector(`[data-testid="${step.targetTestId}"]`);
          } else if (step.targetSelector) {
            try {
              el = container.querySelector(step.targetSelector);
            } catch {
              // fallback
            }
          }
        }

        if (step.type === 'click' && el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.classList.add('ring-4', 'ring-amber-400', 'bg-amber-50');
          el.click();
          await new Promise((r) => setTimeout(r, 200));
          el.classList.remove('ring-4', 'ring-amber-400', 'bg-amber-50');
        } else if (step.type === 'input' && el) {
          const inputEl = el as HTMLInputElement;
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          inputEl.focus();
          if (inputEl.type === 'checkbox') {
            inputEl.checked = step.value === 'true';
          } else {
            inputEl.value = step.value || '';
          }
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (step.type === 'assertion') {
          if (step.assertionType === 'isVisible') {
            if (!el) throw new Error(`Assertion failed: Element ${step.targetSelector} was not visible.`);
          } else if (step.assertionType === 'hasText' && step.assertionExpected) {
            const currentText = el?.textContent || '';
            if (!currentText.includes(step.assertionExpected)) {
              throw new Error(
                `Assertion failed: Expected text "${step.assertionExpected}" but found "${currentText.slice(0, 30)}"`
              );
            }
          }
        }

        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'passed' } : s))
        );
        setReplayLogs((prev) => [...prev, `✓ Passed Step ${i + 1}`]);
      } catch (err: any) {
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: 'failed', errorMessage: err.message } : s))
        );
        setReplayLogs((prev) => [...prev, `✕ Failed Step ${i + 1}: ${err.message}`]);
      }
    }

    setReplayLogs((prev) => [...prev, `[Runner] Replay sequence finished.`]);
    setIsReplaying(false);
  };

  const stopReplay = () => {
    replayerStopRef.current = true;
    setIsReplaying(false);
  };

  // Autonomous Robot Agent
  const runAutonomousAgent = async (goal: string) => {
    setIsAutonomousRunning(true);
    setCurrentAgentGoal(goal);

    try {
      // Collect visible interactive elements to provide to Gemini
      const interactiveElements: any[] = [];
      if (sandboxRef.current) {
        const elements = sandboxRef.current.querySelectorAll('button, input, select, a');
        elements.forEach((el) => {
          const testId = el.getAttribute('data-testid');
          const text = (el.textContent || '').trim().slice(0, 30);
          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          if (testId || text) {
            interactiveElements.push({ testId, text, role, tag: el.tagName });
          }
        });
      }

      const res = await fetch('/api/agent/autonomous-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          appType: selectedApp,
          availableElements: interactiveElements,
        }),
      });

      const plan: AutonomousPlan = await res.json();
      setAutonomousPlan(plan);

      // Execute each step autonomously in sandbox
      for (let i = 0; i < plan.steps.length; i++) {
        const pStep: AutonomousPlanStep = plan.steps[i];
        pStep.status = 'running';
        setAutonomousPlan({ ...plan });

        await new Promise((r) => setTimeout(r, 700));

        let el: HTMLElement | null = null;
        if (sandboxRef.current) {
          try {
            el = sandboxRef.current.querySelector(pStep.selector);
          } catch {
            // fallback
          }
        }

        if (pStep.action === 'click' && el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          el.click();
        } else if (pStep.action === 'input' && el) {
          const inputEl = el as HTMLInputElement;
          inputEl.value = pStep.value || '';
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        }

        pStep.status = 'completed';
        setAutonomousPlan({ ...plan });
      }

      // Automatically synthesize tests from the autonomous run
      await generateTests(`Autonomous Run: ${goal}`);
    } catch (err) {
      console.error('Error running autonomous agent:', err);
    } finally {
      setIsAutonomousRunning(false);
    }
  };

  const stopAutonomousAgent = () => {
    setIsAutonomousRunning(false);
  };

  return (
    <TestAgentContext.Provider
      value={{
        selectedApp,
        setSelectedApp,
        isRecording,
        startRecording,
        pauseRecording,
        clearRecording,
        steps,
        setSteps,
        deleteStep,
        isAssertionMode,
        toggleAssertionMode,
        addAssertion,
        activeFramework,
        setActiveFramework,
        generatedSuite,
        isGenerating,
        generateTests,
        generationError,
        isReplaying,
        replaySpeedMs,
        setReplaySpeedMs,
        replayLogs,
        runReplay,
        stopReplay,
        isAutonomousRunning,
        autonomousPlan,
        currentAgentGoal,
        setCurrentAgentGoal,
        runAutonomousAgent,
        stopAutonomousAgent,
        sandboxRef,
        hoveredElementInfo,
        pendingAssertionElement,
        setPendingAssertionElement,
      }}
    >
      {children}
    </TestAgentContext.Provider>
  );
};

export const useTestAgent = () => {
  const context = useContext(TestAgentContext);
  if (!context) {
    throw new Error('useTestAgent must be used within a TestAgentProvider');
  }
  return context;
};
