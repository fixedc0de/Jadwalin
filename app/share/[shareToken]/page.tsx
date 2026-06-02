import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { scheduleShares, schedules, users } from '@/lib/db-schema';
import { eq } from 'drizzle-orm';
import { Calendar, Clock, MapPin, User, BookOpen, AlertTriangle } from 'lucide-react';

interface SharedSchedulePageProps {
  params: Promise<{ shareToken: string }>;
}

export default async function SharedSchedulePage({ params }: SharedSchedulePageProps) {
  const { shareToken } = await params;

  // Find the share record
  const [share] = await db.select()
    .from(scheduleShares)
    .where(eq(scheduleShares.shareToken, shareToken));

  if (!share) {
    notFound();
  }

  // Check if share is active
  if (!share.isActive) {
    return (
      <ExpiredOrInactivePage 
        title="Link Share Tidak Aktif" 
        message="Link share ini telah dinonaktifkan oleh pemilik jadwal." 
      />
    );
  }

  // Check if share has expired
  if (share.expiresAt && new Date() > share.expiresAt) {
    return (
      <ExpiredOrInactivePage 
        title="Link Share Kadaluarsa" 
        message={`Link share ini telah kadaluarsa pada ${share.expiresAt.toLocaleDateString('id-ID', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}.`} 
      />
    );
  }

  // Get the schedule with owner info
  const [scheduleWithOwner] = await db.select({
    id: schedules.id,
    mataPelajaran: schedules.mataPelajaran,
    namaDosen: schedules.namaDosen,
    ruangan: schedules.ruangan,
    waktuMulai: schedules.waktuMulai,
    waktuSelesai: schedules.waktuSelesai,
    hari: schedules.hari,
    sks: schedules.sks,
    warnaKategori: schedules.warnaKategori,
    catatan: schedules.catatan,
    createdAt: schedules.createdAt,
    updatedAt: schedules.updatedAt,
    ownerName: users.namaLengkap,
    ownerEmail: users.email,
  })
    .from(schedules)
    .leftJoin(users, eq(schedules.userId, users.id))
    .where(eq(schedules.id, share.scheduleId));

  if (!scheduleWithOwner) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Jadwal Kuliah</h1>
                <p className="text-sm text-muted-foreground">Dibagikan oleh {scheduleWithOwner.ownerName}</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              👁️ Read-only
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Share Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Jadwal Share (Read-Only)
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Ini adalah jadwal yang dibagikan. Anda tidak dapat mengedit jadwal ini. 
                {share.expiresAt && (
                  <span className="block mt-1 font-medium">
                    ⏰ Berakhir: {share.expiresAt.toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
          {/* Card Header with Color Indicator */}
          <div 
            className="h-2 w-full"
            style={{ backgroundColor: scheduleWithOwner.warnaKategori ?? '#3B82F6' }}
          />
          
          <div className="p-6">
            {/* Subject Name */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold">{scheduleWithOwner.mataPelajaran}</h2>
              </div>
              {scheduleWithOwner.sks && (
                <span className="inline-block px-2 py-1 bg-muted text-xs rounded-md text-muted-foreground">
                  {scheduleWithOwner.sks} SKS
                </span>
              )}
            </div>

            {/* Schedule Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Hari */}
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Hari</p>
                  <p className="font-medium">{scheduleWithOwner.hari}</p>
                </div>
              </div>

              {/* Waktu */}
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Waktu</p>
                  <p className="font-medium">
                    {formatTime(scheduleWithOwner.waktuMulai)} - {formatTime(scheduleWithOwner.waktuSelesai)}
                  </p>
                </div>
              </div>

              {/* Dosen */}
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Dosen Pengampu</p>
                  <p className="font-medium">{scheduleWithOwner.namaDosen}</p>
                </div>
              </div>

              {/* Ruangan */}
              <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Ruangan</p>
                  <p className="font-medium">{scheduleWithOwner.ruangan || 'Tidak ditentukan'}</p>
                </div>
              </div>
            </div>

            {/* Catatan (if exists) */}
            {scheduleWithOwner.catatan && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  📝 Catatan:
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                  {scheduleWithOwner.catatan}
                </p>
              </div>
            )}

            {/* Owner Info */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Dibagikan oleh: <strong>{scheduleWithOwner.ownerName}</strong></span>
                {scheduleWithOwner.ownerEmail && (
                  <span className="text-xs">({scheduleWithOwner.ownerEmail})</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <div className="inline-block p-6 bg-card border rounded-xl shadow-md">
            <h3 className="text-lg font-bold mb-2">Ingin membuat jadwal seperti ini?</h3>
            <p className="text-muted-foreground mb-4">
              Daftar sekarang dan kelola jadwal kuliah Anda dengan mudah!
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              🚀 Daftar Gratis
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              Sudah punya akun?{' '}
              <a href="/login" className="text-primary hover:underline">Login di sini</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Jadwalin - Kelola Jadwal Kuliah dengan Mudah</p>
          <p className="text-xs mt-1">
            Dibuat dengan ❤️ untuk mahasiswa Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}

// Component for expired/inactive shares
function ExpiredOrInactivePage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {message}
          </p>

          <div className="space-y-3">
            <a
              href="/register"
              className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              🚀 Buat Jadwal Sendiri
            </a>
            
            <a
              href="/"
              className="block w-full border py-3 px-4 rounded-lg hover:bg-muted transition-colors text-sm"
            >
              ← Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(timeString: string): string {
  if (!timeString) return '';
  
  // Handle PostgreSQL time format (HH:MM:SS or HH:MM)
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SharedSchedulePageProps) {
  const { shareToken } = await params;
  
  try {
    const [share] = await db.select({
      ownerName: users.namaLengkap,
    })
      .from(scheduleShares)
      .leftJoin(schedules, eq(scheduleShares.scheduleId, schedules.id))
      .leftJoin(users, eq(schedules.userId, users.id))
      .where(eq(scheduleShares.shareToken, shareToken));

    if (share?.ownerName) {
      return {
        title: `Jadwal Kuliah - ${share.ownerName} | Jadwalin`,
        description: `Lihat jadwal kuliah yang dibagikan oleh ${share.ownerName}`,
      };
    }
  } catch {}

  return {
    title: 'Jadwal Share | Jadwalin',
    description: 'Jadwal kuliah yang dibagikan',
  };
}
