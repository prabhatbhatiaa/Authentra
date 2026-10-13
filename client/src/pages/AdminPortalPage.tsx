import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Layers, Lock, UserPlus, Users, X } from 'lucide-react';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusAlert } from '../components/StatusAlert';
import { adminClient } from '../services/admin.service';
import { AdminUserItem, AdminRoleItem, AdminPermissionsResponse } from '../types/admin.types';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

type AdminTab = 'users' | 'roles' | 'permissions';

function userInitials(u: AdminUserItem) {
  return `${u.firstName?.[0] ?? u.email[0]}${u.lastName?.[0] ?? ''}`.toUpperCase();
}

function RoleChip({ name, onRevoke }: { name: string; onRevoke: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 h-6 rounded-md border border-line/10 pl-2 pr-0.5 font-mono text-[11px] text-fg">
      {name}
      <button
        type="button"
        onClick={onRevoke}
        className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-bad/20 hover:text-bad"
        title={`Revoke ${name}`}
        aria-label={`Revoke ${name}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </span>
  );
}

export function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [permissionsData, setPermissionsData] = useState<AdminPermissionsResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Role assignment modal state
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

  const openAssign = (u: AdminUserItem) => {
    setSelectedUser(u);
    setSelectedRoleId('');
  };

  const stats = useMemo(
    () => [
      { label: 'Users', value: users.length },
      { label: 'Active', value: users.filter((u) => u.status === 'ACTIVE').length },
      { label: 'Suspended', value: users.filter((u) => u.status !== 'ACTIVE').length },
      { label: 'Verified DIDs', value: users.filter((u) => u.identity?.verificationStatus === 'VERIFIED').length },
    ],
    [users]
  );

  const tabs: Array<{ id: AdminTab; label: string; count: number; icon: typeof Users }> = [
    { id: 'users', label: 'Users', count: users.length, icon: Users },
    { id: 'roles', label: 'Roles', count: roles.length, icon: Key },
    { id: 'permissions', label: 'Permissions', count: permissionsData?.total || 0, icon: Lock },
  ];

  const assignableRoles = selectedUser
    ? roles.filter((r) => !selectedUser.roles.some((ur) => ur.id === r.id))
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Server-enforced RBAC"
        title="Access control"
        description="Manage enterprise identities, fine-grained role assignments and the permission map every API request is checked against."
        meta={<Badge>Admin console</Badge>}
        actions={
          <div className="relative flex rounded-lg border border-line/10 p-0.5" role="tablist">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    'relative flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] transition-colors duration-150',
                    active ? 'text-canvas' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-tab"
                      className="absolute inset-0 rounded-md bg-fg"
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{t.label}</span>
                  <span className={cn('relative tabular', active ? 'text-canvas/60' : 'text-fg-subtle')}>{t.count}</span>
                </button>
              );
            })}
          </div>
        }
      />

      {error && (
        <StatusAlert
          type="error"
          title="Governance error"
          message={error}
          onRetry={loadData}
          onDismiss={() => setError(null)}
        />
      )}

      {successMsg && (
        <StatusAlert type="success" title="Action completed" message={successMsg} onDismiss={() => setSuccessMsg(null)} />
      )}

      {loading ? (
        <div className="card rounded-xl p-6">
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <>
          {/* ── Users ─────────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <div className="card rounded-xl p-5">
                      <div className="text-xs text-fg-subtle">{s.label}</div>
                      <div className="mt-3 font-serif text-4xl leading-none text-fg tabular">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <section className="card overflow-hidden rounded-xl">
                <div className="flex flex-col gap-1 border-b border-line/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <h2 className="text-sm font-semibold text-fg">User directory</h2>
                  <span className="text-xs text-fg-subtle">Self-privilege modification is blocked by server policy</span>
                </div>

                {users.length === 0 ? (
                  <div className="p-4 sm:p-6">
                    <EmptyState
                      icon={Users}
                      title="No users registered"
                      description="No user accounts currently exist in this organization directory."
                    />
                  </div>
                ) : (
                  <>
                    {/* Desktop */}
                    <div className="hidden overflow-x-auto md:block">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Identity</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr key={u.id}>
                              <td>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fg/[0.08] text-xs font-semibold text-fg">
                                    {userInitials(u)}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-fg">
                                      {u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'No name set'}
                                    </div>
                                    <div className="truncate text-xs text-fg-subtle">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {u.identity ? (
                                  <div className="font-mono text-[11px]">
                                    <div className="text-fg">{truncateMiddle(u.identity.did, 18, 4)}</div>
                                    <div className="text-fg-subtle">{truncateMiddle(u.identity.walletAddress, 8, 4)}</div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-fg-subtle">No identity</span>
                                )}
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-1.5">
                                  {u.roles.length === 0 ? (
                                    <span className="text-xs text-fg-subtle">None</span>
                                  ) : (
                                    u.roles.map((r) => (
                                      <RoleChip key={r.id} name={r.name} onRevoke={() => handleRevokeRole(u.id, r.id)} />
                                    ))
                                  )}
                                </div>
                              </td>
                              <td>
                                <Badge tone={u.status === 'ACTIVE' ? 'ok' : 'bad'} dot>
                                  {u.status}
                                </Badge>
                              </td>
                              <td>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button type="button" onClick={() => openAssign(u)} className="btn-secondary btn-sm">
                                    <UserPlus className="h-3.5 w-3.5" /> Assign
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserStatus(u)}
                                    className={cn(
                                      'btn btn-sm',
                                      u.status === 'ACTIVE'
                                        ? 'text-fg-muted hover:bg-bad/10 hover:text-bad'
                                        : 'text-ok hover:bg-ok/10'
                                    )}
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

                    {/* Mobile */}
                    <ul className="divide-y divide-line/[0.06] md:hidden">
                      {users.map((u) => (
                        <li key={u.id} className="space-y-3.5 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fg/[0.08] text-xs font-semibold text-fg">
                                {userInitials(u)}
                              </span>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-fg">
                                  {u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'No name set'}
                                </div>
                                <div className="truncate text-xs text-fg-subtle">{u.email}</div>
                              </div>
                            </div>
                            <Badge tone={u.status === 'ACTIVE' ? 'ok' : 'bad'} dot>
                              {u.status}
                            </Badge>
                          </div>

                          {u.identity && (
                            <div className="well space-y-1 p-3 font-mono text-[10.5px]">
                              <div className="break-all text-fg">{u.identity.did}</div>
                              <div className="break-all text-fg-subtle">{u.identity.walletAddress}</div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-1.5">
                            {u.roles.length === 0 ? (
                              <span className="text-xs text-fg-subtle">No roles assigned</span>
                            ) : (
                              u.roles.map((r) => (
                                <RoleChip key={r.id} name={r.name} onRevoke={() => handleRevokeRole(u.id, r.id)} />
                              ))
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button type="button" onClick={() => openAssign(u)} className="btn-secondary btn-sm flex-1">
                              <UserPlus className="h-3.5 w-3.5" /> Assign role
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleUserStatus(u)}
                              className={cn(
                                'btn btn-sm flex-1 border border-line/10',
                                u.status === 'ACTIVE' ? 'text-bad' : 'text-ok'
                              )}
                            >
                              {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            </div>
          )}

          {/* ── Roles ─────────────────────────────────────────── */}
          {activeTab === 'roles' && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {roles.map((r) => (
                <div key={r.id}>
                  <div className="card card-hover rounded-xl">
                    <div className="flex h-full flex-col gap-5 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-3xl leading-none text-fg">
                              {r.name.charAt(0) + r.name.slice(1).toLowerCase()}
                            </h3>
                            {r.isSystem && <Badge>System</Badge>}
                          </div>
                          <p className="text-sm text-fg-muted">{r.description || 'No description provided.'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="font-serif text-3xl leading-none text-fg tabular">{r.userCount}</div>
                          <div className="text-[11px] text-fg-subtle">users</div>
                        </div>
                      </div>
                      <div className="space-y-2.5 border-t border-line/[0.06] pt-4">
                        <div className="meta">Granted permissions · {r.permissions.length}</div>
                        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                          {r.permissions.map((p) => (
                            <span
                              key={p.id}
                              className="rounded-md border border-line/10 px-2 py-0.5 font-mono text-[11px] text-fg-muted"
                            >
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Permissions ───────────────────────────────────── */}
          {activeTab === 'permissions' && permissionsData && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {Object.entries(permissionsData.byCategory).map(([category, perms]) => (
                <div key={category}>
                  <section className="card h-full overflow-hidden rounded-xl">
                    <div className="flex items-center justify-between border-b border-line/[0.06] px-5 py-4">
                      <span className="flex items-center gap-2 text-sm font-semibold text-fg">
                        <Layers className="h-4 w-4 text-fg-subtle" />
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </span>
                      <Badge>{perms.length}</Badge>
                    </div>
                    <ul className="divide-y divide-line/[0.05]">
                      {perms.map((p) => (
                        <li key={p.id} className="flex items-start gap-3 px-5 py-3.5">
                          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-fg-subtle" />
                          <div className="min-w-0">
                            <div className="font-mono text-xs font-medium text-fg">{p.name}</div>
                            <div className="text-xs text-fg-muted">{p.description || 'System permission'}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Assign role ─────────────────────────────────────────── */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        icon={UserPlus}
        title="Assign role"
        description={selectedUser ? `Grant an additional role to ${selectedUser.email}.` : undefined}
      >
        <form onSubmit={handleAssignRole} className="space-y-4">
          {assignableRoles.length === 0 ? (
            <p className="well p-4 text-sm text-fg-muted">This user already holds every available role.</p>
          ) : (
            <div className="space-y-2" role="radiogroup" aria-label="Role to grant">
              {assignableRoles.map((r) => {
                const active = selectedRoleId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelectedRoleId(r.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all duration-300',
                      active
                        ? 'border-fg/40 bg-fg/[0.04]'
                        : 'border-line/10 bg-fg/[0.02] hover:border-line/20'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border',
                        active ? 'border-fg' : 'border-line/25'
                      )}
                    >
                      {active && <span className="h-2 w-2 rounded-full bg-fg" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-fg">{r.name}</div>
                      <div className="text-xs text-fg-muted">
                        {r.description || 'System role'} · {r.permissions.length} permissions
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setSelectedUser(null)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={assignLoading || !selectedRoleId} className="btn-primary">
              {assignLoading ? 'Assigning…' : 'Grant role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
