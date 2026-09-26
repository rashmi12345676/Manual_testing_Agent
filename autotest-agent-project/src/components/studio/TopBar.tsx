import React, { useState } from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { SandboxAppId } from '../../types/testAgent';
import { GitPushModal } from './GitPushModal';
import {
  Circle,
  Play,
  Pause,
  RotateCcw,
  Crosshair,
  Sparkles,
  Bot,
  PlayCircle,
  ShoppingBag,
  Building2,
  FileSpreadsheet,
  FolderGit2,
  Archive,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [isDownloadingProjectZip, setIsDownloadingProjectZip] = useState(false);
  const {
    selectedApp,
    setSelectedApp,
    isRecording,
    startRecording,
    pauseRecording,
    clearRecording,
    steps,
    isAssertionMode,
    toggleAssertionMode,
    isGenerating,
    generateTests,
    runReplay,
    isReplaying,
  } = useTestAgent();

  const apps: { id: SandboxAppId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'store', label: 'Store & Checkout', icon: ShoppingBag },
    { id: 'saas', label: 'SaaS Settings & Auth', icon: Building2 },
    { id: 'invoicing', label: 'Financial Desk', icon: FileSpreadsheet },
  ];

  const handleDownloadProjectZip = () => {
    setIsDownloadingProjectZip(true);
    window.location.href = '/api/export/project-zip';
    setTimeout(() => setIsDownloadingProjectZip(false), 2000);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-md">
      {/* Brand & Recording Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-sm shadow-inner shadow-white/20">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white">AutoTest Agent</h1>
              <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold">
                QA Engine v3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Manual QA Observer & Background Test Synthesizer</p>
          </div>
        </div>

        {/* Live Recording Badge */}
        <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
          <Circle
            className={`w-2.5 h-2.5 ${
              isRecording ? 'fill-rose-500 text-rose-500 animate-pulse' : 'fill-slate-500 text-slate-500'
            }`}
          />
          <span className="text-xs font-mono font-medium">
            {isRecording ? 'Observing Events' : 'Observer Paused'}
          </span>
          <span className="text-xs font-mono font-bold bg-slate-900 px-1.5 py-0.2 rounded text-indigo-300">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}
          </span>
        </div>
      </div>

      {/* Center: Sandbox App Selector */}
      <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700/70">
        <span className="text-[11px] font-semibold text-slate-400 px-2 uppercase tracking-wider hidden md:inline">
          App Under Test:
        </span>
        {apps.map((app) => {
          const Icon = app.icon;
          const isSelected = selectedApp === app.id;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => setSelectedApp(app.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{app.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Record / Pause Toggle */}
        <button
          type="button"
          onClick={isRecording ? pauseRecording : startRecording}
          title={isRecording ? 'Pause Recording' : 'Resume Recording'}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isRecording
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
          }`}
        >
          {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRecording ? 'Pause' : 'Record'}</span>
        </button>

        {/* Assertion Mode Pin Toggle */}
        <button
          type="button"
          onClick={toggleAssertionMode}
          title="Toggle Assertion Crosshair"
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isAssertionMode
              ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          <Crosshair className={`w-3.5 h-3.5 ${isAssertionMode ? 'animate-spin' : ''}`} />
          <span>{isAssertionMode ? 'Click Element to Assert' : 'Drop Assertion'}</span>
        </button>

        {/* Replay Runner */}
        <button
          type="button"
          onClick={runReplay}
          disabled={steps.length === 0 || isReplaying}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isReplaying
              ? 'bg-amber-600 text-white animate-pulse'
              : steps.length > 0
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              : 'opacity-40 bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isReplaying ? 'Replaying...' : 'Replay'}</span>
        </button>

        {/* Reset / Clear */}
        <button
          type="button"
          onClick={clearRecording}
          title="Clear recorded steps"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Push to GitHub Button */}
        <button
          type="button"
          onClick={() => setIsGitModalOpen(true)}
          title="Push code to your GitHub Repository"
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Git Repo</span>
        </button>

        {/* Download Project ZIP Button */}
        <button
          type="button"
          onClick={handleDownloadProjectZip}
          disabled={isDownloadingProjectZip}
          title="Download entire project codebase as a .ZIP archive"
          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Archive className={`w-3.5 h-3.5 ${isDownloadingProjectZip ? 'animate-bounce text-emerald-400' : 'text-emerald-400'}`} />
          <span className="hidden md:inline">{isDownloadingProjectZip ? 'Packing...' : 'Code.zip'}</span>
        </button>

        {/* Primary AI Generator Trigger */}
        <button
          type="button"
          onClick={() => generateTests()}
          disabled={isGenerating || steps.length === 0}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isGenerating
              ? 'bg-indigo-700 text-indigo-200 cursor-wait'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 active:scale-95'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : 'text-amber-300'}`} />
          <span>{isGenerating ? 'Synthesizing...' : 'Generate Test Cases'}</span>
        </button>
      </div>

      <GitPushModal isOpen={isGitModalOpen} onClose={() => setIsGitModalOpen(false)} />
    </header>
  );
};
