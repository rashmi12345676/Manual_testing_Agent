import React, { useState } from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { AssertionType } from '../../types/testAgent';
import { CheckCircle2, Eye, ShieldAlert, Type, X } from 'lucide-react';

export const AssertionModal: React.FC = () => {
  const { pendingAssertionElement, setPendingAssertionElement, addAssertion } = useTestAgent();
  const [assertionType, setAssertionType] = useState<AssertionType>('isVisible');
  const [expectedText, setExpectedText] = useState(pendingAssertionElement?.currentValue || '');

  if (!pendingAssertionElement) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const desc =
      assertionType === 'isVisible'
        ? `Assert that ${pendingAssertionElement.testId || pendingAssertionElement.selector} is visible`
        : assertionType === 'hasText'
        ? `Assert that ${pendingAssertionElement.testId || pendingAssertionElement.selector} contains "${expectedText}"`
        : assertionType === 'isDisabled'
        ? `Assert that ${pendingAssertionElement.testId || pendingAssertionElement.selector} is disabled`
        : `Assert condition (${assertionType}) on ${pendingAssertionElement.selector}`;

    addAssertion({
      type: 'assertion',
      targetSelector: pendingAssertionElement.selector,
      targetTag: pendingAssertionElement.tag,
      targetRole: pendingAssertionElement.role,
      targetText: pendingAssertionElement.text,
      targetTestId: pendingAssertionElement.testId,
      targetLabel: pendingAssertionElement.label,
      assertionType,
      assertionExpected: assertionType === 'hasText' ? expectedText : undefined,
      description: desc,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-sm text-slate-900">Pin Test Assertion</h3>
          </div>
          <button
            type="button"
            onClick={() => setPendingAssertionElement(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Inspector Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              &lt;{pendingAssertionElement.tag.toLowerCase()}&gt;
            </span>
            {pendingAssertionElement.testId && (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                data-testid="{pendingAssertionElement.testId}"
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-slate-600 truncate mt-1">
            {pendingAssertionElement.selector}
          </p>
          {pendingAssertionElement.text && (
            <p className="text-[11px] text-slate-500 mt-1 italic line-clamp-1">
              "{pendingAssertionElement.text}"
            </p>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Select Assertion Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: 'isVisible', label: 'Is Visible', icon: Eye, desc: 'Element exists & is rendered' },
                { type: 'hasText', label: 'Contains Text', icon: Type, desc: 'Matches string content' },
                { type: 'isDisabled', label: 'Is Disabled', icon: ShieldAlert, desc: 'Non-interactive state' },
                { type: 'isEnabled', label: 'Is Enabled', icon: CheckCircle2, desc: 'Ready for interaction' },
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setAssertionType(opt.type as AssertionType)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    assertionType === opt.type
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                    <opt.icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {assertionType === 'hasText' && (
            <div>
              <label htmlFor="expected-text-input" className="block text-xs font-medium text-slate-700 mb-1">
                Expected Text String *
              </label>
              <input
                id="expected-text-input"
                type="text"
                value={expectedText}
                onChange={(e) => setExpectedText(e.target.value)}
                placeholder="e.g. Order Confirmed or Cart (1)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden font-medium"
                required
              />
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPendingAssertionElement(null)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md shadow-xs cursor-pointer"
            >
              Save Assertion to Step Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
