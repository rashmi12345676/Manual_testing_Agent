import React, { useState } from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { EdgeCaseSuggestion } from '../../types/testAgent';
import {
  AlertTriangle,
  Plus,
  Check,
  ShieldAlert,
  Sparkles,
  Terminal,
} from 'lucide-react';

export const EdgeCasesView: React.FC = () => {
  const { generatedSuite, steps, setSteps, generateTests, isGenerating } = useTestAgent();
  const [addedCases, setAddedCases] = useState<{ [key: string]: boolean }>({});

  const edgeCases: EdgeCaseSuggestion[] = generatedSuite?.edgeCases || [
    {
      title: 'Empty Field / Mandatory Boundary Validation',
      scenario: 'Attempt form submissions with required inputs stripped of all text.',
      type: 'negative',
      priority: 'High',
      riskLevel: 'High',
    },
    {
      title: 'SQL / XSS Script Injection Characters',
      scenario: 'Verify sanitation for strings like <script>alert("XSS")</script> or \' OR 1=1 --',
      type: 'security',
      priority: 'Medium',
      riskLevel: 'Medium',
    },
    {
      title: 'Rapid Button Double-Click (Idempotency Race Condition)',
      scenario: 'Double click submit buttons in quick succession to prevent duplicate cart additions or orders.',
      type: 'resilience',
      priority: 'High',
      riskLevel: 'Critical',
    },
    {
      title: 'Expired / Malformed Promo Code Application',
      scenario: 'Input invalid and expired discount codes and assert accurate error messaging.',
      type: 'negative',
      priority: 'Medium',
      riskLevel: 'Medium',
    },
  ];

  const handleAddEdgeCaseToSteps = (item: EdgeCaseSuggestion, idx: number) => {
    // Inject companion negative step
    const newStep = {
      id: `step-edge-${Date.now()}-${idx}`,
      type: 'assertion' as const,
      targetSelector: 'body',
      description: `[Edge Case] Assert negative handling for: ${item.title}`,
      assertionType: 'isVisible' as const,
      timestamp: Date.now(),
      status: 'idle' as const,
    };
    setSteps((prev) => [...prev, newStep]);
    setAddedCases((prev) => ({ ...prev, [item.title]: true }));
    generateTests(`Enhanced Suite with Negative Scenario: ${item.title}`);
  };

  const getRiskBadge = (level?: string) => {
    switch (level) {
      case 'Critical':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">Critical Risk</span>;
      case 'High':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">High Risk</span>;
      default:
        return <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Medium Risk</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="font-semibold text-xs text-slate-900">AI Edge-Case & Negative Test Detection</h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Gemini analyzed your manual session and detected untrodden boundary paths.
          </p>
        </div>

        <button
          type="button"
          onClick={() => generateTests()}
          disabled={isGenerating || steps.length === 0}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{isGenerating ? 'Analyzing...' : 'Rescan Edge Cases'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {edgeCases.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <h4 className="font-semibold text-xs text-slate-900">{item.title}</h4>
                </div>
                {getRiskBadge(item.riskLevel || item.priority)}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.scenario || item.description}
              </p>

              {item.recommendedPlaywrightSnippet && (
                <div className="mt-3 p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-200 overflow-x-auto">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    <span>Playwright Negative Assertion</span>
                  </div>
                  <code>{item.recommendedPlaywrightSnippet}</code>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Category: {item.type || 'Boundary'}
              </span>

              <button
                type="button"
                onClick={() => handleAddEdgeCaseToSteps(item, idx)}
                disabled={addedCases[item.title]}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                  addedCases[item.title]
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
              >
                {addedCases[item.title] ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addedCases[item.title] ? 'Added to Test Plan' : 'Generate Companion Test'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
