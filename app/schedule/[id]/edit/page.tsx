'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Trash2, Loader2, ArrowLeft } from 'lucide-react';

interface Schedule {
  id: string;
  mataPelajaran: string;
  namaDosen: string;
  ruangan: string | null;
  waktuMulai: string;
  waktuSelesai: string;
  hari: string;
  sks: number | null;
  warnaKategori: string;
  catatan: string | null;
}

export default function EditSchedulePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Schedule>>({});
  const [scheduleId, setScheduleId] = useState<string>('');

  useEffect(() => {
    const loadPage = async () => {
      try {
        const resolvedParams = await params;
        setScheduleId(resolvedParams.id);
        await fetchSchedule(resolvedParams.id);
      } catch (err) {
        console.error('Failed to load params:', err);
        toast.error('Gagal memuat halaman');
        router.push('/schedule');
      }
    };
    loadPage();
  }, [params, router]);

  const fetchSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/schedules/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Jadwal tidak ditemukan');
      }
      const data = await res.json();
      setFormData(data);
    } catch (err: any) {
      toast.error(err.message);
      router.push('/schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sks: formData.sks ? parseInt(formData.sks as any) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui jadwal');

      toast.success('Jadwal berhasil diperbarui!');
      router.push('/schedule');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('⚠️ Yakin ingin menghapus jadwal ini?\n\nTindakan ini tidak dapat dibatalkan.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus jadwal');
      
      toast.success('Jadwal dihapus');
      router.push('/schedule');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="text-muted-foreground">Memuat jadwal...</span>
        <button 
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
      </div>
    );
  }

  if (!formData.id) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Jadwal tidak ditemukan</p>
        <Link href="/schedule" className="text-primary hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Kembali ke daftar jadwal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Jadwal</h1>
        <button 
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-xl border">
        {/* Mata Pelajaran */}
        <div>
          <label className="block text-sm font-medium mb-1">Mata Pelajaran *</label>
          <input
            required
            value={formData.mataPelajaran || ''}
            onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Contoh: Pemrograman Web"
            disabled={submitting || deleting}
          />
        </div>

        {/* Nama Dosen */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama Dosen *</label>
          <input
            required
            value={formData.namaDosen || ''}
            onChange={(e) => setFormData({ ...formData, namaDosen: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Contoh: Dr. Example, M.Kom"
            disabled={submitting || deleting}
          />
        </div>

        {/* Hari & Ruangan */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hari *</label>
            <select
              required
              value={formData.hari || 'Senin'}
              onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={submitting || deleting}
            >
              {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ruangan</label>
            <input
              value={formData.ruangan || ''}
              onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Contoh: A101"
              disabled={submitting || deleting}
            />
          </div>
        </div>

        {/* Waktu */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Waktu Mulai *</label>
            <input
              type="time"
              required
              value={formData.waktuMulai || ''}
              onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={submitting || deleting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Waktu Selesai *</label>
            <input
              type="time"
              required
              value={formData.waktuSelesai || ''}
              onChange={(e) => setFormData({ ...formData, waktuSelesai: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={submitting || deleting}
            />
          </div>
        </div>

        {/* SKS & Warna */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKS</label>
            <input
              type="number"
              min="1"
              max="6"
              value={formData.sks || ''}
              onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Contoh: 3"
              disabled={submitting || deleting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warna Kategori</label>
            <input
              type="color"
              value={formData.warnaKategori || '#3B82F6'}
              onChange={(e) => setFormData({ ...formData, warnaKategori: e.target.value })}
              className="w-full h-10 px-1 border rounded bg-background cursor-pointer"
              disabled={submitting || deleting}
            />
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium mb-1">Catatan</label>
          <textarea
            value={formData.catatan || ''}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none min-h-[80px]"
            placeholder="Catatan tambahan (opsional)"
            disabled={submitting || deleting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 flex-wrap">
          <button
            type="submit"
            disabled={submitting || deleting}
            className="flex-1 min-w-[120px] bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Menyimpan...' : 'Update Jadwal'}
          </button>
          
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting || deleting}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting || deleting}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </form>
    </div>
  );
}