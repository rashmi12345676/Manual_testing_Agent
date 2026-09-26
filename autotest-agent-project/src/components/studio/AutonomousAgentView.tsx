import React, { useState } from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import {
  Bot,
  Play,
  Square,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
} from 'lucide-react';

export const AutonomousAgentView: React.FC = () => {
  const {
    isAutonomousRunning,
    autonomousPlan,
    currentAgentGoal,
    setCurrentAgentGoal,
    runAutonomousAgent,
    stopAutonomousAgent,
    selectedApp,
  } = useTestAgent();

  const [customGoal, setCustomGoal] = useState(currentAgentGoal);

  const suggestedGoalsByApp: { [key: string]: string[] } = {
    store: [
      'Search for "Keyboard", add to cart, apply coupon "SAVE20", and verify discount calculation',
      'Test shopping cart item quantity increment and remove item button',
      'Fill checkout form with invalid email and assert field validation error',
      'Complete end-to-end purchase and assert order confirmation number appears',
    ],
    saas: [
      'Send invitation to new member with Admin role and assert member badge appears',
      'Toggle Two-Factor Authentication switch and save security policy',
      'Attempt to delete workspace without typing confirmation and verify button remains disabled',
    ],
    invoicing: [
      'Add three dynamic invoice milestones, set 18% EU tax rate, and verify grand total',
      'Delete the second line item and verify subtotal recalculates instantly',
      'Dispatch invoice and verify status changes from Draft to Sent',
    ],
  };

  const handleLaunch = (goal: string) => {
    setCurrentAgentGoal(goal);
    runAutonomousAgent(goal);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-slate-900">Autonomous AI QA Agent</h3>
              <p className="text-[11px] text-slate-500">
                Agent drives the application directly, executes interactions, and verifies assertions.
              </p>
            </div>
          </div>

          {isAutonomousRunning && (
            <button
              type="button"
              onClick={stopAutonomousAgent}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Halt Agent</span>
            </button>
          )}
        </div>

        {/* Goal Input */}
        <div className="flex gap-2 mt-3">
          <div className="relative flex-1">
            <Target className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="Describe what the agent should test autonomously..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden font-medium"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLaunch(customGoal)}
            disabled={isAutonomousRunning || !customGoal.trim()}
            className={`px-4 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutonomousRunning
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isAutonomousRunning ? 'Agent Running...' : 'Launch Mission'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Missions */}
      <div className="p-4 border-b border-slate-200 bg-white/60">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Recommended Test Missions ({selectedApp.toUpperCase()}):
        </span>
        <div className="space-y-1.5">
          {(suggestedGoalsByApp[selectedApp] || suggestedGoalsByApp.store).map((goal, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isAutonomousRunning}
              onClick={() => {
                setCustomGoal(goal);
                handleLaunch(goal);
              }}
              className="w-full text-left p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-xs text-slate-700 transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="line-clamp-1 group-hover:text-indigo-900">{goal}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Live Agent Plan Execution Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {autonomousPlan ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                  Active Mission Plan
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-0.5">{autonomousPlan.planName}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{autonomousPlan.strategy}</p>
              </div>

              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Autonomous Runner
              </span>
            </div>

            <div className="space-y-2">
              {autonomousPlan.steps.map((pStep, sIdx) => (
                <div
                  key={sIdx}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    pStep.status === 'running'
                      ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : pStep.status === 'completed'
                      ? 'border-slate-200 bg-slate-50 text-slate-700'
                      : 'border-slate-100 bg-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center">
                      {sIdx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{pStep.description}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {pStep.action.toUpperCase()}: {pStep.selector} {pStep.value ? `("${pStep.value}")` : ''}
                      </p>
                    </div>
                  </div>

                  <div>
                    {pStep.status === 'running' && (
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded animate-pulse">
                        Executing...
                      </span>
                    )}
                    {pStep.status === 'completed' && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {(!pStep.status || pStep.status === 'pending') && (
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-xl bg-white">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800">No autonomous mission running</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Select one of the suggested goals above or type a custom goal. The AI agent will inspect the sandbox elements, devise an action plan, execute steps automatically, and synthesize test cases!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
