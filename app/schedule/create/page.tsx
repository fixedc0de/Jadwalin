'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreateSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mataPelajaran: '',
    namaDosen: '',
    hari: 'Senin',
    waktuMulai: '',
    waktuSelesai: '',
    ruangan: '',
    sks: '',
    warnaKategori: '#3B82F6',
    catatan: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sks: formData.sks ? parseInt(formData.sks) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan jadwal');

      toast.success('Jadwal berhasil ditambahkan!');
      router.push('/schedule');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tambah Jadwal Baru</h1>
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
            value={formData.mataPelajaran}
            onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Contoh: Pemrograman Web"
            disabled={loading}
          />
        </div>

        {/* Nama Dosen */}
        <div>
          <label className="block text-sm font-medium mb-1">Nama Dosen *</label>
          <input
            required
            value={formData.namaDosen}
            onChange={(e) => setFormData({ ...formData, namaDosen: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Contoh: Dr. Example, M.Kom"
            disabled={loading}
          />
        </div>

        {/* Hari & Ruangan */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Hari *</label>
            <select
              required
              value={formData.hari}
              onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={loading}
            >
              {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map(h => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ruangan</label>
            <input
              value={formData.ruangan}
              onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Contoh: A101"
              disabled={loading}
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
              value={formData.waktuMulai}
              onChange={(e) => setFormData({ ...formData, waktuMulai: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Waktu Selesai *</label>
            <input
              type="time"
              required
              value={formData.waktuSelesai}
              onChange={(e) => setFormData({ ...formData, waktuSelesai: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              disabled={loading}
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
              value={formData.sks}
              onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
              className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              placeholder="Contoh: 3"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Warna Kategori</label>
            <input
              type="color"
              value={formData.warnaKategori}
              onChange={(e) => setFormData({ ...formData, warnaKategori: e.target.value })}
              className="w-full h-10 px-1 border rounded bg-background cursor-pointer"
              disabled={loading}
            />
          </div>
        </div>

        {/* Catatan */}
        <div>
          <label className="block text-sm font-medium mb-1">Catatan</label>
          <textarea
            value={formData.catatan}
            onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
            className="w-full px-3 py-2 border rounded bg-background focus:ring-2 focus:ring-primary/50 outline-none min-h-[80px]"
            placeholder="Catatan tambahan (opsional)"
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 flex-wrap">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 min-w-[120px] bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}