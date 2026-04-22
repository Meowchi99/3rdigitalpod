'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ActionButton, InfoPanel, SelectField, showToast } from '@/components/ui';
import type { Profile, UserRole } from '@/types';

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: meData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setMe(meData as Profile | null);
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers((data as Profile[]) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function changeRole(userId: string, newRole: UserRole) {
    const res = await fetch('/api/admin/promote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role: newRole }),
    });
    const json = await res.json();
    if (!res.ok) { showToast('❌ ' + (json.error || 'Failed')); return; }
    showToast('✅ Role updated');
    load();
  }

  const isOwner = me?.role === 'owner';

  return (
    <div className="space-y-6">
      <h2 className="font-display text-3xl tracking-widest">👥 USERS & ROLES</h2>

      <div className="rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-4 text-sm">
        <strong className="text-brand-blue-3">Role policy:</strong>{' '}
        <span className="text-muted">
          Owner = full control · Admin = manage content · User = use tools
        </span>
        {!isOwner && (
          <div className="mt-2 text-xs text-brand-yellow">
            ⚠️ Only the Owner can promote/demote admins.
          </div>
        )}
      </div>

      <InfoPanel title={`All Users (${users.length})`}>
        {loading && <div className="py-8 text-center text-sm text-muted">Loading...</div>}
        <div className="divide-y divide-white/[0.07]">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-red to-brand-pink text-sm font-bold">
                {(u.email || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{u.display_name || u.email}</div>
                <div className="font-mono text-xs text-muted">{u.email}</div>
              </div>
              <span className="font-mono text-[10px] text-muted">{u.plan.toUpperCase()}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                u.role === 'owner' ? 'bg-brand-red/20 text-brand-red-3' :
                u.role === 'admin' ? 'bg-brand-blue/20 text-brand-blue-3' :
                'bg-ink-700 text-muted'
              }`}>
                {u.role.toUpperCase()}
              </span>
              {isOwner && u.role !== 'owner' && u.id !== me?.id && (
                <SelectField value={u.role} onChange={(e) => changeRole(u.id, e.target.value as UserRole)} className="w-32 py-1.5">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </SelectField>
              )}
            </div>
          ))}
        </div>
      </InfoPanel>
    </div>
  );
}
