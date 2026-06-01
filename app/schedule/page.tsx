'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus, Edit, Trash2, Download, Filter } from 'lucide-react';
import { ExportIcalButton } from '@/components/schedule/export-ical';
import { ExportPdfButton } from '@/components/schedule/export-pdf';

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

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterHari, setFilterHari] = useState('');
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('Mahasiswa');

  useEffect(() => {
    fetchSchedules();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.namaLengkap) setUserName(data.namaLengkap);
    } catch {}
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/schedules');
      if (!res.ok) throw new Error('Gagal memuat jadwal');
      const data = await res.json();
      setSchedules(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini?')) return;
    
    try {
      const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus jadwal');
      toast.success('Jadwal dihapus');
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = schedules.filter(s => {
    const matchHari = filterHari ? s.hari === filterHari : true;
    const matchSearch = search 
      ? s.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
        s.namaDosen.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchHari && matchSearch;
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Memuat jadwal...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
        <Link 
          href="/schedule/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
        >
          <Plus size={16} /> Tambah Jadwal
        </Link>
      </div>

      {/* Filters & Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select 
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="px-3 py-2 border rounded bg-background text-sm"
          >
            <option value="">Semua Hari</option>
            {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>
        
        <input
          type="text"
          placeholder="Cari mata kuliah atau dosen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded bg-background text-sm flex-1 min-w-[200px]"
        />
        
        <div className="flex items-center gap-2 ml-auto">
          <ExportIcalButton schedules={filtered} />
          <ExportPdfButton schedules={filtered} userName={userName} />
        </div>
      </div>

      {/* Schedule Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-2">
            {schedules.length === 0 ? 'Belum ada jadwal' : 'Tidak ada jadwal yang cocok'}
          </p>
          {schedules.length === 0 && (
            <Link href="/schedule/create" className="text-primary hover:underline">
              Tambah jadwal pertama Anda →
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto border rounded bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 text-left font-medium">Hari</th>
                <th className="p-3 text-left font-medium">Jam</th>
                <th className="p-3 text-left font-medium">Mata Kuliah</th>
                <th className="p-3 text-left font-medium">Dosen</th>
                <th className="p-3 text-left font-medium">Ruangan</th>
                <th className="p-3 text-left font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-t hover:bg-muted/50 transition-colors">
                  <td className="p-3">{s.hari}</td>
                  <td className="p-3">{s.waktuMulai} - {s.waktuSelesai}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.warnaKategori ?? '#3B82F6' }} />
                      <span className="font-medium">{s.mataPelajaran}</span>
                      {s.sks && <span className="text-xs text-muted-foreground">({s.sks} SKS)</span>}
                    </div>
                  </td>
                  <td className="p-3">{s.namaDosen}</td>
                  <td className="p-3">{s.ruangan || '-'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/schedule/${s.id}/edit`} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(s.id)} 
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}