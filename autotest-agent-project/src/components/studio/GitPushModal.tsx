import React, { useState } from 'react';
import { GitBranch, Copy, Check, ExternalLink, X, Terminal, ShieldCheck, FolderGit2, Archive } from 'lucide-react';

interface GitPushModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitPushModal: React.FC<GitPushModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const targetUrl = repoUrl.trim() || 'https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git';

  const commands = [
    {
      title: '1. Link your remote GitHub repository',
      cmd: `git remote add origin ${targetUrl}`,
    },
    {
      title: '2. Ensure branch is main',
      cmd: `git branch -M main`,
    },
    {
      title: '3. Push code & CI workflows to GitHub',
      cmd: `git push -u origin main`,
    },
  ];

  const fullOneLiner = `git remote add origin ${targetUrl} && git branch -M main && git push -u origin main`;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Push Project to Your GitHub Repo</h3>
              <p className="text-[11px] text-slate-400">Git repository is initialized on branch 'main' with all files committed</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs">
          {/* Status pill */}
          <div className="bg-emerald-950/50 border border-emerald-800/80 rounded-lg p-3 flex items-start gap-2.5 text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-emerald-300">Git repository already initialized & committed:</span>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                Includes all source code, Express backend, Playwright/Cypress synthesizers, and <code>.github/workflows/test-automation.yml</code>.
              </p>
            </div>
          </div>

          {/* Quick Setup with GitHub URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Enter your GitHub Repository URL (optional):
            </label>
            <input
              type="text"
              placeholder="https://github.com/username/my-test-agent.git"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg outline-hidden text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Don't have a repo yet?</span>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>Create new repo on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* 1-Click All-in-one Command */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Single Copy-Paste Terminal Command</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(fullOneLiner, 99)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                {copiedIndex === 99 ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 99 ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
              {fullOneLiner}
            </div>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Or run step by step:
            </span>
            {commands.map((c, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{c.title}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(c.cmd, idx)}
                    className="text-indigo-400 hover:text-indigo-300 p-0.5 cursor-pointer flex items-center gap-0.5 text-[10px]"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="text-slate-200 font-mono text-[11px] block">{c.cmd}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <a
            href="/api/export/project-zip"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Download All Code (.zip)</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
