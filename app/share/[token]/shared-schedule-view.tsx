'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, User, BookOpen, MapPin, AlertCircle } from 'lucide-react';

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

interface SharedScheduleData {
  success: boolean;
  ownerName: string;
  expiresAt: string;
  schedules: Schedule[];
}

interface SharedScheduleViewProps {
  token: string;
}

export default function SharedScheduleView({ token }: SharedScheduleViewProps) {
  const [data, setData] = useState<SharedScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedSchedule();
  }, [token]);

  const fetchSharedSchedule = async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal memuat jadwal');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayOrder = (hari: string): number => {
    const days: Record<string, number> = {
      'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };
    return days[hari] || 0;
  };

  // Group schedules by day
  const groupedSchedules = data?.schedules.reduce((acc, schedule) => {
    if (!acc[schedule.hari]) {
      acc[schedule.hari] = [];
    }
    acc[schedule.hari].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Sort days
  const sortedDays = Object.keys(groupedSchedules || {}).sort(
    (a, b) => getDayOrder(a) - getDayOrder(b)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive rounded-xl p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">
            Tidak Dapat Mengakses Jadwal
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Jadwal Kuliah</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Milik: {data.ownerName}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Link sharing kadaluarsa pada: {formatDate(data.expiresAt)}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-200">
          <p className="font-medium mb-1">Mode Baca Saja</p>
          <p>
            Ini adalah link sharing read-only. Anda tidak dapat mengedit atau menghapus jadwal. 
            Hubungi pemilik untuk perubahan.
          </p>
        </div>
      </div>

      {/* Schedules */}
      {sortedDays.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Belum ada jadwal yang dibagikan</p>
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
                        <div className="flex items-center gap-2">
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

      {/* Footer */}
      <div className="text-center pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Dibagikan dengan ❤️ melalui JADWALIN
        </p>
        <a
          href="https://jadwalin-hazel.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Buat jadwalmu sendiri →
        </a>
      </div>
    </div>
  );
}
