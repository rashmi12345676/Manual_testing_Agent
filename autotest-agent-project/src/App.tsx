import React, { useState } from 'react';
import { TestAgentProvider, useTestAgent } from './context/TestAgentContext';
import { TopBar } from './components/studio/TopBar';
import { StepsTimeline } from './components/studio/StepsTimeline';
import { CodeGeneratorView } from './components/studio/CodeGeneratorView';
import { EdgeCasesView } from './components/studio/EdgeCasesView';
import { AutonomousAgentView } from './components/studio/AutonomousAgentView';
import { AssertionModal } from './components/studio/AssertionModal';
import { ReplayerModal } from './components/studio/ReplayerModal';
import { StoreApp } from './components/sandbox/StoreApp';
import { SaasSettingsApp } from './components/sandbox/SaasSettingsApp';
import { InvoicePortalApp } from './components/sandbox/InvoicePortalApp';
import {
  ListFilter,
  Code2,
  ShieldAlert,
  Bot,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Crosshair,
  ExternalLink,
} from 'lucide-react';

type StudioTab = 'steps' | 'code' | 'edge-cases' | 'agent';

const MainLayout: React.FC = () => {
  const {
    selectedApp,
    sandboxRef,
    isAssertionMode,
    hoveredElementInfo,
    steps,
  } = useTestAgent();

  const [activeTab, setActiveTab] = useState<StudioTab>('code');
  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sandboxResetKey, setSandboxResetKey] = useState(0);

  const getViewportMaxWidth = () => {
    switch (deviceViewport) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Split Screen Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-57px)]">
        {/* LEFT PANE: Application Under Test (Sandbox) */}
        <section
          aria-label="Application Under Test"
          className="lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/60"
        >
          {/* Sandbox Header Control */}
          <div className="p-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white tracking-tight flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Active Sandbox:</span>
                <span className="text-indigo-400 uppercase font-mono text-[11px] font-bold">
                  {selectedApp === 'store'
                    ? 'E-Commerce Storefront'
                    : selectedApp === 'saas'
                    ? 'SaaS Settings & Access'
                    : 'Invoicing & Tax Engine'}
                </span>
              </span>
            </div>

            {/* Viewport switchers & reload */}
            <div className="flex items-center gap-1">
              <div className="flex items-center bg-slate-800 p-0.5 rounded border border-slate-700">
                <button
                  type="button"
                  onClick={() => setDeviceViewport('desktop')}
                  title="Desktop Viewport"
                  className={`p-1 rounded cursor-pointer ${
                    deviceViewport === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport('tablet')}
                  title="Tablet Viewport (768px)"
                  className={`p-1 rounded cursor-pointer ${
                    deviceViewport === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport('mobile')}
                  title="Mobile Viewport (420px)"
                  className={`p-1 rounded cursor-pointer ${
                    deviceViewport === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSandboxResetKey((k) => k + 1)}
                title="Reset Sandbox State"
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Crosshair Assertion Banner */}
          {isAssertionMode && (
            <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 animate-spin text-slate-950" />
                <span>Assertion Mode Active: Click any target element below to attach an assertion</span>
              </div>
              {hoveredElementInfo && (
                <span className="font-mono text-[11px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded truncate max-w-xs">
                  &lt;{hoveredElementInfo.tag}&gt; {hoveredElementInfo.selector}
                </span>
              )}
            </div>
          )}

          {/* Sandbox Frame */}
          <div className="flex-1 overflow-auto p-4 flex justify-center bg-slate-900/30">
            <div
              key={sandboxResetKey}
              ref={sandboxRef}
              className={`transition-all duration-200 shadow-xl rounded-xl overflow-hidden border border-slate-700 bg-white ${getViewportMaxWidth()} ${
                isAssertionMode ? 'cursor-crosshair' : ''
              }`}
            >
              {selectedApp === 'store' && <StoreApp />}
              {selectedApp === 'saas' && <SaasSettingsApp />}
              {selectedApp === 'invoicing' && <InvoicePortalApp />}
            </div>
          </div>

          {/* Bottom Sandbox Status Bar */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>DOM Observer Engine active. All clicks, typing, and state transitions are streamed to test generator.</span>
            </div>
            <span className="font-mono text-slate-500 hidden sm:inline">
              Target ID locators prioritized
            </span>
          </div>
        </section>

        {/* RIGHT PANE: AI Test Studio & Live Test Synthesizer */}
        <section
          aria-label="AI Test Studio"
          className="lg:w-1/2 flex flex-col bg-slate-900"
        >
          {/* Studio Navigation Tabs */}
          <div className="bg-slate-950 border-b border-slate-800 px-3 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'border-indigo-500 text-white bg-slate-900/70 rounded-t-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Generated Test Cases</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded-full font-mono">
                  Multi-fw
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('steps')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'steps'
                    ? 'border-indigo-500 text-white bg-slate-900/70 rounded-t-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5 text-blue-400" />
                <span>Recorded Steps</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 rounded-full font-mono">
                  {steps.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('edge-cases')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'edge-cases'
                    ? 'border-indigo-500 text-white bg-slate-900/70 rounded-t-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Edge Cases</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('agent')}
                className={`px-3 py-2 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'agent'
                    ? 'border-indigo-500 text-white bg-slate-900/70 rounded-t-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>Autonomous Agent</span>
              </button>
            </div>
          </div>

          {/* Studio Tab View Rendering */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'code' && <CodeGeneratorView />}
            {activeTab === 'steps' && <StepsTimeline />}
            {activeTab === 'edge-cases' && <EdgeCasesView />}
            {activeTab === 'agent' && <AutonomousAgentView />}
          </div>
        </section>
      </div>

      {/* Assertion Dropper Dialog */}
      <AssertionModal />

      {/* Live Replayer Runner Floating Console */}
      <ReplayerModal />
    </div>
  );
};

export default function App() {
  return (
    <TestAgentProvider>
      <MainLayout />
    </TestAgentProvider>
  );
}
