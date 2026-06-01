'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LogOut, Shield, User, Mail, Link as LinkIcon, Save } from 'lucide-react';
import { ShareManager } from '@/components/share/share-manager';

interface UserProfile {
  id: string;
  nim: string;
  namaLengkap: string;
  email: string | null;
  kelasCode: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [kelasCode, setKelasCode] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Gagal memuat profil');
      }
      const data = await res.json();
      setUser(data);
      if (data.kelasCode) setKelasCode(data.kelasCode);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKelasCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      const res = await fetch('/api/profile/kelas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kelasCode: kelasCode.trim() || null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal update kode kelas');

      toast.success('Kode kelas berhasil diperbarui!');
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah password');

      toast.success('Password berhasil diubah!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Berhasil logout');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Gagal logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Memuat profil...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{user.namaLengkap}</h2>
            <p className="text-muted-foreground">NIM: {user.nim}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email || 'Belum diatur'}</p>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Bergabung Sejak</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Kelas Code Section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Kode Kelas</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Bergabung dengan kelas untuk melihat jadwal gabungan bersama teman sekelas.
        </p>

        <form onSubmit={handleUpdateKelasCode} className="flex gap-3">
          <input
            type="text"
            value={kelasCode}
            onChange={(e) => setKelasCode(e.target.value)}
            placeholder="Contoh: TI-2A, RPL-B, dll"
            className="flex-1 px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            disabled={updating}
            maxLength={50}
          />
          <button
            type="submit"
            disabled={updating || !kelasCode.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {updating && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Simpan
          </button>
        </form>

        {kelasCode && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✅ Anda tergabung dalam kelas <strong>{kelasCode}</strong>
            </p>
            <a
              href={`/classes/${encodeURIComponent(kelasCode)}`}
              className="text-sm text-green-600 dark:text-green-400 hover:underline mt-1 inline-block"
            >
              Lihat Jadwal Kelas →
            </a>
          </div>
        )}
      </div>

      {/* Share Jadwal Section */}
      <ShareManager />

      {/* Change Password Form */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Ubah Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              required
              minLength={8}
              disabled={updating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password Baru</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              required
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
              title="Minimal 8 karakter, mengandung huruf kapital dan angka"
              disabled={updating}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimal 8 karakter, mengandung huruf kapital dan angka
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              required
              disabled={updating}
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updating && <Loader2 className="h-4 w-4 animate-spin" />}
            {updating ? 'Memproses...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}