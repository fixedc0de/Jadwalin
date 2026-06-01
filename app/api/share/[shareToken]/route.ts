import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleShares, schedules, users } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';

// GET /api/share/[shareToken] - Get shared schedule (public)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params;

  try {
    // Find the share record
    const [share] = await db.select()
      .from(scheduleShares)
      .where(eq(scheduleShares.shareToken, shareToken));

    if (!share) {
      return NextResponse.json({ error: 'Link share tidak ditemukan' }, { status: 404 });
    }

    // Check if share is active
    if (!share.isActive) {
      return NextResponse.json({ error: 'Link share telah dinonaktifkan' }, { status: 403 });
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      return NextResponse.json({ error: 'Link share telah kadaluarsa' }, { status: 403 });
    }

    // Increment view count
    await db.update(scheduleShares)
      .set({ 
        viewCount: share.viewCount + 1,
        updatedAt: new Date()
      })
      .where(eq(scheduleShares.id, share.id));

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
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...scheduleWithOwner,
      shareInfo: {
        expiresAt: share.expiresAt,
        viewCount: share.viewCount + 1,
      },
    });
  } catch (err: any) {
    console.error('Share fetch error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memuat jadwal share' }, { status: 500 });
  }
}
