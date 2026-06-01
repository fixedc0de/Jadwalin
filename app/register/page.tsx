'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    nim: '', 
    password: '', 
    confirmPassword: '',
    namaLengkap: '',
    email: ''
  });

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Minimal 8 karakter';
    if (!/[A-Z]/.test(pwd)) return 'Harus ada huruf kapital';
    if (!/[0-9]/.test(pwd)) return 'Harus ada angka';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }
    
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      toast.error(pwdError);
      return;
    }
    
    if (!/^\d+$/.test(formData.nim) || formData.nim.length < 8) {
      toast.error('NIM harus angka dan minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nim: formData.nim,
          password: formData.password,
          namaLengkap: formData.namaLengkap,
          email: formData.email || undefined,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Registrasi gagal');
      
      toast.success('Akun berhasil dibuat! Silakan login.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-xl border shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Daftar JADWALIN</h1>
          <p className="text-muted-foreground text-sm">Buat akun untuk mulai mengelola jadwal</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
            <input
              type="text"
              value={formData.namaLengkap}
              onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Nama lengkap Anda"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NIM *</label>
            <input
              type="text"
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Minimal 8 angka (contoh: 20240001)"
              required
              pattern="\d{8,}"
              title="NIM hanya angka, minimal 8 karakter"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (opsional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="email@contoh.com"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Min. 8 karakter, huruf kapital + angka"
              required
              minLength={8}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimal 8 karakter, mengandung huruf kapital dan angka
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Konfirmasi Password *</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Ulangi password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}