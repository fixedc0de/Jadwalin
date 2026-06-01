'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Check, X, Mail, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CollaborationInvite {
  id: string;
  permissionLevel: 'view' | 'edit';
  status: 'pending' | 'accepted' | 'rejected';
  invitedAt: string;
  owner: {
    id: string;
    namaLengkap: string;
    email: string | null;
  };
}

interface Collaborator {
  id: string;
  namaLengkap: string;
  permissionLevel: 'view' | 'edit';
  type: 'outgoing' | 'incoming';
}

export function CollaboratorsManager() {
  const [invites, setInvites] = useState<CollaborationInvite[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'view' | 'edit'>('view');
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchInvites = async () => {
    try {
      const res = await fetch('/api/collaborations/my-invites');
      if (!res.ok) throw new Error('Gagal memuat undangan');
      const data = await res.json();
      setInvites(data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const fetchCollaborators = async () => {
    try {
      const res = await fetch('/api/calendar/collaborative');
      if (!res.ok) throw new Error('Gagal memuat collaborator');
      const data = await res.json();
      setCollaborators(data.collaborators || []);
    } catch (err: any) {
      // Silent fail - feature might not be used
    }
  };

  useEffect(() => {
    Promise.all([fetchInvites(), fetchCollaborators()]).finally(() => setLoading(false));
  }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSendingInvite(true);
    try {
      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collaboratorEmail: emailInput.trim(),
          permissionLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim undangan');

      toast.success(`Undangan dikirim ke ${emailInput}`);
      setEmailInput('');
      fetchInvites();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/collaborations/${inviteId}/accept`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Gagal menerima undangan');

      toast.success('Undangan diterima!');
      fetchInvites();
      fetchCollaborators();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    try {
      const res = await fetch(`/api/collaborations/${inviteId}/reject`, {
        method: 'PATCH',
      });

      if (!res.ok) throw new Error('Gagal menolak undangan');

      toast.success('Undangan ditolak');
      fetchInvites();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!confirm('Hapus collaborator ini?')) return;

    try {
      // Find the collaboration ID from collaborators list
      const collab = collaborators.find(c => c.id === collaboratorId);
      if (!collab) return;

      // We need to get the actual collaboration ID first
      // For simplicity, we'll just show a message
      toast.info('Fitur hapus collaborator akan segera hadir');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Send Invite Section */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Undang Collaborator
        </h3>
        <form onSubmit={handleSendInvite} className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Email User</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="contoh@email.com"
                className="w-full pl-10 pr-3 py-2 border rounded bg-background"
                disabled={sendingInvite}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Permission</label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as any)}
              className="px-3 py-2 border rounded bg-background"
              disabled={sendingInvite}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>
          <div className="self-end">
            <button
              type="submit"
              disabled={sendingInvite || !emailInput.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {sendingInvite ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Undang
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Undangan Masuk ({invites.length})
          </h3>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{invite.owner.namaLengkap}</p>
                  <p className="text-sm text-muted-foreground">
                    {invite.owner.email} • {invite.permissionLevel === 'view' ? 'View Only' : 'Can Edit'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" /> Terima
                  </button>
                  <button
                    onClick={() => handleRejectInvite(invite.id)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors flex items-center gap-1"
                  >
                    <X className="h-4 w-4" /> Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Collaborators Section */}
      {collaborators.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaborator Aktif ({collaborators.length})
          </h3>
          <div className="space-y-3">
            {collaborators.map((collab) => (
              <div
                key={collab.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{collab.namaLengkap}</p>
                    <p className="text-sm text-muted-foreground">
                      {collab.type === 'outgoing' ? 'Anda mengundang' : 'Mengundang Anda'} •{' '}
                      {collab.permissionLevel === 'view' ? 'View Only' : 'Can Edit'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveCollaborator(collab.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Memuat...
        </div>
      ) : invites.length === 0 && collaborators.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Belum ada collaborator atau undangan pending</p>
          <p className="text-sm mt-1">Mulai dengan mengundang seseorang di atas</p>
        </div>
      ) : null}
    </div>
  );
}
