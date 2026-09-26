import React from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { RecordedStep } from '../../types/testAgent';
import {
  MousePointer,
  Keyboard,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const StepsTimeline: React.FC = () => {
  const { steps, deleteStep, toggleAssertionMode, isAssertionMode, generateTests, isGenerating } = useTestAgent();

  const getStepIcon = (type: RecordedStep['type']) => {
    switch (type) {
      case 'click':
        return <MousePointer className="w-3.5 h-3.5 text-blue-500" />;
      case 'input':
        return <Keyboard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'assertion':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status?: RecordedStep['status']) => {
    switch (status) {
      case 'running':
        return <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium animate-pulse">Running</span>;
      case 'passed':
        return <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Passed</span>;
      case 'failed':
        return <span className="text-[10px] text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-medium">Failed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Feed Subheader */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
        <div>
          <h3 className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
            <span>Recorded Interaction Stream</span>
            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-bold">
              {steps.length}
            </span>
          </h3>
          <p className="text-[11px] text-slate-500">Events captured live from manual test interactions</p>
        </div>

        <button
          type="button"
          onClick={toggleAssertionMode}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
            isAssertionMode
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-3 h-3 text-purple-600" />
          <span>+ Add Assertion</span>
        </button>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className={`border rounded-lg p-2.5 transition-all text-xs flex items-start gap-2.5 relative group ${
              step.status === 'failed'
                ? 'border-rose-200 bg-rose-50/30'
                : step.status === 'running'
                ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-200'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
            }`}
          >
            {/* Step Index Number */}
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </div>

            {/* Icon */}
            <div className="p-1 rounded bg-slate-50 border border-slate-200 shrink-0 mt-0.5">
              {getStepIcon(step.type)}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-semibold text-slate-900 truncate">{step.description}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {getStatusBadge(step.status)}
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    {step.type}
                  </span>
                </div>
              </div>

              {/* Locator & Value Preview */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px]">
                {step.targetTestId ? (
                  <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded truncate max-w-[200px]">
                    getByTestId('{step.targetTestId}')
                  </span>
                ) : step.targetRole && step.targetText ? (
                  <span className="font-mono text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded truncate max-w-[200px]">
                    getByRole('{step.targetRole}', '{step.targetText}')
                  </span>
                ) : (
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[200px]">
                    {step.targetSelector}
                  </span>
                )}

                {step.value !== undefined && (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded font-mono truncate max-w-[150px]">
                    val: "{step.value}"
                  </span>
                )}

                {step.assertionType && (
                  <span className="text-purple-700 bg-purple-50 border border-purple-100 px-1.5 py-0.2 rounded font-medium">
                    assert: {step.assertionType} {step.assertionExpected ? `("${step.assertionExpected}")` : ''}
                  </span>
                )}
              </div>

              {step.errorMessage && (
                <div className="mt-1.5 p-1.5 bg-rose-100/70 border border-rose-200 rounded text-rose-800 text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span>{step.errorMessage}</span>
                </div>
              )}
            </div>

            {/* Delete Action */}
            <button
              type="button"
              onClick={() => deleteStep(step.id)}
              title="Delete step"
              className="text-slate-300 hover:text-rose-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-12 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <MousePointer className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No user events recorded yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Interact with the app on the left (click buttons, fill forms, search catalog). The agent will capture your actions in the background.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Synthesis Trigger */}
      {steps.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Ready to convert {steps.length} actions into code
          </span>
          <button
            type="button"
            onClick={() => generateTests()}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Test Cases'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
