'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, Clock, User, BookOpen, MapPin, Users, Filter, Download } from 'lucide-react';

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
  ownerName: string;
  ownerId: string;
}

interface Member {
  id: string;
  namaLengkap: string;
}

interface ClassScheduleData {
  success: boolean;
  className: string;
  memberCount: number;
  members: Member[];
  schedules: Schedule[];
}

interface ClassScheduleViewProps {
  kode: string;
}

export default function ClassScheduleView({ kode }: ClassScheduleViewProps) {
  const router = useRouter();
  const [data, setData] = useState<ClassScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterHari, setFilterHari] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchClassSchedule();
  }, [kode]);

  const fetchClassSchedule = async () => {
    try {
      const res = await fetch(`/api/classes/${encodeURIComponent(kode)}/schedules`);
      
      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(errorData.error || 'Gagal memuat jadwal kelas');
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDayOrder = (hari: string): number => {
    const days: Record<string, number> = {
      'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };
    return days[hari] || 0;
  };

  // Filter schedules
  const filteredSchedules = data?.schedules.filter(s => {
    const matchHari = filterHari ? s.hari === filterHari : true;
    const matchMember = filterMember ? s.ownerId === filterMember : true;
    const matchSearch = search 
      ? s.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
        s.namaDosen.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchHari && matchMember && matchSearch;
  });

  // Group by day
  const groupedSchedules = filteredSchedules?.reduce((acc, schedule) => {
    if (!acc[schedule.hari]) {
      acc[schedule.hari] = [];
    }
    acc[schedule.hari].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const sortedDays = Object.keys(groupedSchedules || {}).sort(
    (a, b) => getDayOrder(a) - getDayOrder(b)
  );

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Hari', 'Waktu', 'Mata Kuliah', 'Dosen', 'Ruangan', 'SKS', 'Pemilik'];
    const rows = filteredSchedules?.map(s => [
      s.hari,
      `${s.waktuMulai}-${s.waktuSelesai}`,
      s.mataPelajaran,
      s.namaDosen,
      s.ruangan || '-',
      s.sks || '-',
      s.ownerName
    ]);

    const csv = [headers, ...(rows || [])].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jadwal-kelas-${kode}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Jadwal berhasil diexport!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat jadwal kelas...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold text-destructive mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Atur Kelas di Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Jadwal Kelas {data.className}
          </h1>
          <p className="text-muted-foreground mt-1">
            {data.memberCount} anggota • Jadwal gabungan semua member
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={!filteredSchedules?.length}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterHari}
            onChange={(e) => setFilterHari(e.target.value)}
            className="px-3 py-2 border rounded bg-background text-sm"
          >
            <option value="">Semua Hari</option>
            {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          className="px-3 py-2 border rounded bg-background text-sm"
        >
          <option value="">Semua Anggota</option>
          {data.members.map(m => (
            <option key={m.id} value={m.id}>{m.namaLengkap}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari mata kuliah atau dosen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded bg-background text-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Members List */}
      <div className="bg-card rounded-xl border p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Anggota Kelas ({data.memberCount})
        </h3>
        <div className="flex flex-wrap gap-2">
          {data.members.map(m => (
            <span
              key={m.id}
              className="px-3 py-1.5 bg-muted rounded-full text-sm flex items-center gap-2"
            >
              <User className="h-3 w-3" />
              {m.namaLengkap}
            </span>
          ))}
        </div>
      </div>

      {/* Schedules */}
      {sortedDays.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {filteredSchedules?.length === 0 && (data.schedules.length > 0)
              ? 'Tidak ada jadwal yang cocok dengan filter'
              : 'Belum ada jadwal di kelas ini'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => (
            <div key={day} className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {day}
              </h2>

              <div className="space-y-3">
                {(groupedSchedules?.[day] || []).map((schedule) => (
                  <div
                    key={schedule.id}
                    className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: schedule.warnaKategori || '#3B82F6' }}
                          />
                          <h3 className="font-semibold text-lg">
                            {schedule.mataPelajaran}
                          </h3>
                          {schedule.sks && (
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">
                              {schedule.sks} SKS
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span className="text-sm">{schedule.namaDosen}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{schedule.waktuMulai} - {schedule.waktuSelesai}</span>
                          </div>

                          {schedule.ruangan && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{schedule.ruangan}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 ml-auto">
                            <User className="h-3 w-3" />
                            <span className="text-xs">{schedule.ownerName}</span>
                          </div>
                        </div>

                        {schedule.catatan && (
                          <div className="flex items-start gap-2 mt-2 pt-2 border-t">
                            <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <p className="text-sm text-muted-foreground">
                              {schedule.catatan}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
