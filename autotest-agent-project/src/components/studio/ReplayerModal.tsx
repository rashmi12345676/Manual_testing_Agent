import React from 'react';
import { useTestAgent } from '../../context/TestAgentContext';
import { PlayCircle, Square, Gauge, Terminal, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const ReplayerModal: React.FC = () => {
  const { isReplaying, stopReplay, replaySpeedMs, setReplaySpeedMs, replayLogs, steps } = useTestAgent();

  if (!isReplaying && replayLogs.length === 0) return null;

  const passedCount = steps.filter((s) => s.status === 'passed').length;
  const failedCount = steps.filter((s) => s.status === 'failed').length;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4 text-emerald-400" />
          <h4 className="font-semibold text-xs text-white">Live In-Sandbox Replay Runner</h4>
        </div>

        <div className="flex items-center gap-1.5">
          {isReplaying ? (
            <button
              type="button"
              onClick={stopReplay}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopReplay}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Speed & Stats Controls */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{passedCount} Passed</span>
          </div>
          {failedCount > 0 && (
            <div className="flex items-center gap-1 text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{failedCount} Failed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Gauge className="w-3 h-3 text-slate-400" />
          <span>Delay:</span>
          <select
            value={replaySpeedMs}
            onChange={(e) => setReplaySpeedMs(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white text-[11px] outline-hidden"
          >
            <option value="300">Fast (300ms)</option>
            <option value="650">Normal (650ms)</option>
            <option value="1200">Slow (1.2s)</option>
          </select>
        </div>
      </div>

      {/* Terminal Logs */}
      <div className="p-3 max-h-48 overflow-y-auto font-mono text-[11px] space-y-1 bg-slate-950">
        <div className="flex items-center gap-1 text-slate-500 mb-1 text-[10px]">
          <Terminal className="w-3 h-3" />
          <span>Execution Log:</span>
        </div>
        {replayLogs.map((log, idx) => (
          <p
            key={idx}
            className={`${
              log.includes('✓')
                ? 'text-emerald-400'
                : log.includes('✕')
                ? 'text-rose-400'
                : log.includes('[Step')
                ? 'text-indigo-300'
                : 'text-slate-400'
            }`}
          >
            {log}
          </p>
        ))}
      </div>
    </div>
  );
};
