import React, { useState } from 'react';
import { Users, Shield, Bell, Trash2, Mail, Check, AlertTriangle, X } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member' | 'Viewer';
  status: 'Active' | 'Pending';
}

export const SaasSettingsApp: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('Acme Global Labs');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<'team' | 'security' | 'danger'>('team');

  // Security Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [ssoEnforced, setSsoEnforced] = useState(false);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('30');

  // Team Members
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'm1', name: 'Sarah Chen', email: 'sarah.chen@acme.io', role: 'Owner', status: 'Active' },
    { id: 'm2', name: 'David Miller', email: 'david.m@acme.io', role: 'Admin', status: 'Active' },
    { id: 'm3', name: 'Elena Rostov', email: 'elena.r@acme.io', role: 'Member', status: 'Active' },
  ]);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member' | 'Viewer'>('Member');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Danger state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [workspaceDeleted, setWorkspaceDeleted] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please provide a valid corporate email address.');
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError('Member with this email is already part of the workspace.');
      return;
    }

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'Pending',
    };

    setMembers([...members, newMember]);
    setInviteSuccess(`Invitation dispatched to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleDeleteWorkspace = () => {
    if (deleteConfirmationText.trim().toUpperCase() === 'DELETE') {
      setWorkspaceDeleted(true);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[560px] text-slate-900 font-sans p-4 relative" data-testid="saas-sandbox-root">
      {/* App Header */}
      <div className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3 mb-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-900" data-testid="workspace-title-display">
              {workspaceName}
            </span>
            <span className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
              Enterprise Plan
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Workspace Settings & Access Control</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            data-testid="tab-team"
            onClick={() => setActiveTab('team')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'team' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team ({members.length})
          </button>
          <button
            type="button"
            data-testid="tab-security"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Security & Auth
          </button>
          <button
            type="button"
            data-testid="tab-danger"
            onClick={() => setActiveTab('danger')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === 'danger' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Danger Zone
          </button>
        </div>
      </div>

      {workspaceDeleted ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center" data-testid="deleted-banner">
          <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900">Workspace has been scheduled for deletion</h3>
          <p className="text-xs text-slate-600 mt-1">
            All data will be purged in 30 days. You have been placed in maintenance state.
          </p>
          <button
            type="button"
            data-testid="restore-workspace-btn"
            onClick={() => setWorkspaceDeleted(false)}
            className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
          >
            Undo Deletion & Restore
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: Team Members */}
          {activeTab === 'team' && (
            <div className="space-y-4" data-testid="team-tab-content">
              {/* Invite Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-semibold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Invite New Workspace Member</span>
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  New users will receive a magic login link to join this organization.
                </p>

                <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-2" data-testid="invite-form">
                  <div className="flex-1 relative">
                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      data-testid="invite-email-input"
                      aria-label="Member email address"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden"
                    />
                  </div>

                  <select
                    data-testid="invite-role-select"
                    aria-label="Select role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden text-slate-800"
                  >
                    <option value="Member">Member (Read & Write)</option>
                    <option value="Admin">Admin (Full Control)</option>
                    <option value="Viewer">Viewer (Read Only)</option>
                  </select>

                  <button
                    type="submit"
                    data-testid="send-invite-btn"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    Send Invite
                  </button>
                </form>

                {inviteError && (
                  <p data-testid="invite-error-msg" className="text-[11px] text-rose-600 mt-2 font-medium">
                    {inviteError}
                  </p>
                )}
                {inviteSuccess && (
                  <p data-testid="invite-success-msg" className="text-[11px] text-emerald-600 mt-2 font-medium">
                    {inviteSuccess}
                  </p>
                )}
              </div>

              {/* Members List */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-800">Active Collaborators</span>
                  <span className="text-[11px] text-slate-500 font-mono">{members.length} / 25 seats used</span>
                </div>

                <div className="divide-y divide-slate-100" data-testid="members-list">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      data-testid={`member-row-${member.id}`}
                      className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900" data-testid={`member-name-${member.id}`}>
                            {member.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          data-testid={`member-role-badge-${member.id}`}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                            member.role === 'Owner'
                              ? 'bg-purple-100 text-purple-700'
                              : member.role === 'Admin'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {member.role}
                        </span>

                        {member.role !== 'Owner' && (
                          <button
                            type="button"
                            data-testid={`remove-member-btn-${member.id}`}
                            aria-label={`Remove ${member.name}`}
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Auth */}
          {activeTab === 'security' && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 shadow-xs" data-testid="security-tab-content">
              <div>
                <h3 className="font-semibold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Authentication Policy</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enforce authentication guidelines and session lifetimes across all workspace members.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label htmlFor="toggle-2fa" className="text-xs font-medium text-slate-900 cursor-pointer">
                      Mandatory Two-Factor Authentication (2FA)
                    </label>
                    <p className="text-[11px] text-slate-500">Require an authenticator app code on login.</p>
                  </div>
                  <input
                    id="toggle-2fa"
                    type="checkbox"
                    data-testid="toggle-2fa"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label htmlFor="toggle-sso" className="text-xs font-medium text-slate-900 cursor-pointer">
                      Enforce SAML / Okta SSO
                    </label>
                    <p className="text-[11px] text-slate-500">Prevent password login and mandate corporate identity provider.</p>
                  </div>
                  <input
                    id="toggle-sso"
                    type="checkbox"
                    data-testid="toggle-sso"
                    checked={ssoEnforced}
                    onChange={(e) => setSsoEnforced(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <label htmlFor="session-timeout-select" className="text-xs font-medium text-slate-900">
                      Inactivity Session Timeout
                    </label>
                    <p className="text-[11px] text-slate-500">Automatically logout idle browser sessions.</p>
                  </div>
                  <select
                    id="session-timeout-select"
                    data-testid="session-timeout-select"
                    value={sessionTimeoutMins}
                    onChange={(e) => setSessionTimeoutMins(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md outline-hidden text-slate-800"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">1 Hour</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  data-testid="save-security-btn"
                  onClick={handleSaveGeneral}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs cursor-pointer"
                >
                  Save Security Policy
                </button>
                {saveStatus === 'saved' && (
                  <span data-testid="security-saved-alert" className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved successfully
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Danger Zone */}
          {activeTab === 'danger' && (
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 space-y-3" data-testid="danger-tab-content">
              <h3 className="font-semibold text-xs text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Irreversible Actions</span>
              </h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Deleting this workspace will immediately revoke access for all <strong>{members.length}</strong> active
                members, terminate active API tokens, and initiate automated data retention erasure.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  data-testid="open-delete-modal-btn"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-md shadow-xs cursor-pointer"
                >
                  Delete Entire Workspace...
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteModalOpen && (
        <div
          data-testid="delete-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            data-testid="delete-modal-dialog"
            className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-5 border border-slate-100"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h4 className="font-bold text-xs text-rose-600 flex items-center gap-1.5" data-testid="delete-dialog-title">
                <AlertTriangle className="w-4 h-4" /> Confirm Deletion
              </h4>
              <button
                type="button"
                data-testid="close-delete-modal-btn"
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              To confirm, type <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">DELETE</span> in the box below:
            </p>

            <input
              type="text"
              data-testid="delete-confirmation-input"
              aria-label="Confirm deletion string"
              placeholder="DELETE"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-rose-600 rounded-md outline-hidden font-mono mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                data-testid="cancel-delete-btn"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                data-testid="confirm-delete-btn"
                disabled={deleteConfirmationText.trim().toUpperCase() !== 'DELETE'}
                onClick={handleDeleteWorkspace}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md text-white transition-all cursor-pointer ${
                  deleteConfirmationText.trim().toUpperCase() === 'DELETE'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-xs'
                    : 'bg-slate-300 cursor-not-allowed text-slate-500'
                }`}
              >
                I Understand, Delete Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
