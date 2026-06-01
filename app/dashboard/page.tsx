import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import Link from 'next/link';
import { Calendar, Plus, BookOpen, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Get stats
  const hariIni = new Date().toLocaleDateString('id-ID', { weekday: 'long' });
  
  const [jadwalHariIni] = await db
    .select()
    .from(schedules)
    .where(and(eq(schedules.userId, session.id), eq(schedules.hari, hariIni as any)))
    .limit(1);

  const totalJadwal = await db
    .select({ count: schedules.id })
    .from(schedules)
    .where(eq(schedules.userId, session.id));

  const recentSchedules = await db
    .select()
    .from(schedules)
    .where(eq(schedules.userId, session.id))
    .orderBy(schedules.createdAt)
    .limit(3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Selamat datang, {session.nim}! 👋</h1>
          <p className="text-muted-foreground">Kelola jadwal kuliah Anda dengan JADWALIN</p>
        </div>
        <Link 
          href="/schedule/create"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Tambah Jadwal
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-lg border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Jadwal</p>
            <p className="text-2xl font-bold">{totalJadwal.length}</p>
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Jadwal Hari Ini</p>
            <p className="text-2xl font-bold">{jadwalHariIni ? 'Ada' : 'Tidak ada'}</p>
          </div>
        </div>
        <div className="p-4 bg-card rounded-lg border flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hari</p>
            <p className="text-2xl font-bold">{hariIni}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/schedule"
          className="p-6 bg-card rounded-lg border hover:border-primary transition-colors block group"
        >
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">📋 Lihat Semua Jadwal</h3>
          <p className="text-sm text-muted-foreground">Kelola, filter, dan export jadwal Anda dalam berbagai format</p>
        </Link>
        <Link 
          href="/profile"
          className="p-6 bg-card rounded-lg border hover:border-primary transition-colors block group"
        >
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">⚙️ Pengaturan Akun</h3>
          <p className="text-sm text-muted-foreground">Update password dan kelola data profil Anda</p>
        </Link>
      </div>

      {/* Recent Schedules */}
      {recentSchedules.length > 0 && (
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Jadwal Terbaru</h3>
          <div className="space-y-3">
            {recentSchedules.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.warnaKategori }} />
                  <div>
                    <p className="font-medium">{s.mataPelajaran}</p>
                    <p className="text-sm text-muted-foreground">{s.hari}, {s.waktuMulai}-{s.waktuSelesai}</p>
                  </div>
                </div>
                <Link href={`/schedule/${s.id}/edit`} className="text-sm text-primary hover:underline">
                  Edit →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}