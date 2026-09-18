import { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Key,
  UserPlus,
  AlertCircle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminClient } from '../services/admin.service';
import {
  AdminUserItem,
  AdminRoleItem,
  AdminPermissionsResponse,
} from '../types/admin.types';

export function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [permissionsData, setPermissionsData] = useState<AdminPermissionsResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Role Assignment Modal / Selection state
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes, permsRes] = await Promise.all([
        adminClient.getUsers(),
        adminClient.getRoles(),
        adminClient.getPermissions(),
      ]);

      setUsers(usersRes.data.users);
      setRoles(rolesRes.data.roles);
      setPermissionsData(permsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative governance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedRoleId) return;

    setAssignLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await adminClient.assignRole(selectedUser.id, selectedRoleId);
      setSuccessMsg(res.message);
      setSelectedUser(null);
      setSelectedRoleId('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Role assignment failed.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRevokeRole = async (userId: string, roleId: string) => {
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await adminClient.revokeRole(userId, roleId);
      setSuccessMsg(res.message);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Role revocation failed.');
    }
  };

  const handleToggleUserStatus = async (user: AdminUserItem) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await adminClient.updateUserStatus(user.id, nextStatus, 'Admin status toggle');
      setSuccessMsg(res.message);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-mono text-xs text-slate-400">
        <div className="w-8 h-8 mx-auto border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p>Loading enterprise governance directory & RBAC matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Governance & RBAC Management
              </h1>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Manage enterprise identities, fine-grained role assignments, and server-enforced permission maps.
            </p>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>USERS ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>ROLES ({roles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'permissions'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>PERMISSIONS ({permissionsData?.total || 0})</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs font-mono flex items-start gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: USERS DIRECTORY & ROLE ASSIGNMENTS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Enterprise User Directory (/admin/users)
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Self-privilege modification is strictly blocked by server policy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3">USER / EMAIL</th>
                    <th className="py-3 px-3">DID / WALLET</th>
                    <th className="py-3 px-3">ASSIGNED ROLES</th>
                    <th className="py-3 px-3">STATUS</th>
                    <th className="py-3 px-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-950/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-100">{u.email}</div>
                        <div className="text-[10px] text-slate-500">
                          {u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'No Name'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        {u.identity ? (
                          <div>
                            <div className="text-emerald-400 text-[11px] break-all">
                              {u.identity.did.substring(0, 22)}...
                            </div>
                            <div className="text-slate-500 text-[10px]">
                              {u.identity.walletAddress.substring(0, 14)}...
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600">No Identity</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {u.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold"
                            >
                              <span>{r.name}</span>
                              <button
                                onClick={() => handleRevokeRole(u.id, r.id)}
                                className="hover:text-rose-400 ml-0.5 text-xs"
                                title={`Revoke ${r.name}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] border ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          ● {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setSelectedRoleId('');
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] border border-slate-700 flex items-center gap-1"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Assign Role</span>
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] border border-slate-800"
                          >
                            {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Assignment Modal Dialog */}
          {selectedUser && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Assign Role to {selectedUser.email}
                </span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-slate-200 text-sm font-mono"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleAssignRole} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">SELECT ROLE TO GRANT</label>
                  <select
                    value={selectedRoleId}
                    onChange={(e) => setSelectedRoleId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Choose a Role --</option>
                    {roles
                      .filter((r) => !selectedUser.roles.some((ur) => ur.id === r.id))
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} — {r.description || 'System Role'} ({r.permissions.length} permissions)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-mono text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading || !selectedRoleId}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs font-mono disabled:opacity-50"
                  >
                    {assignLoading ? 'Assigning...' : 'Grant Role'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSION BUNDLES */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((r) => (
            <div key={r.id} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-white">{r.name}</span>
                  {r.isSystem && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      SYSTEM
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  {r.userCount} active users
                </span>
              </div>

              <p className="text-xs text-slate-400">{r.description || 'No description provided.'}</p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-mono text-slate-400">
                  GRANTED PERMISSIONS ({r.permissions.length}):
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {r.permissions.map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CATEGORIZED PERMISSIONS MATRIX */}
      {activeTab === 'permissions' && permissionsData && (
        <div className="space-y-6">
          {Object.entries(permissionsData.byCategory).map(([category, perms]) => (
            <div key={category} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> {category} PERMISSIONS ({perms.length})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {perms.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="font-mono text-xs font-semibold text-slate-200">{p.name}</div>
                    <div className="text-[11px] text-slate-400">{p.description || 'System permission'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
