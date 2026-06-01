import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { insertScheduleSchema } from '@/lib/db-schema';

// GET single schedule
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const [schedule] = await db.select()
    .from(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)));
  
  if (!schedule) {
    return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
  }
  
  return NextResponse.json(schedule);
}

// PATCH update schedule
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  try {
    const body = await req.json();
    
    // ✅ Quick fix: validasi manual tanpa .partial()
    const errors: string[] = [];
    
    // Validasi field yang ada di body
    if (body.mataPelajaran !== undefined && body.mataPelajaran?.length < 2) {
      errors.push('Mata pelajaran minimal 2 karakter');
    }
    if (body.namaDosen !== undefined && body.namaDosen?.length < 2) {
      errors.push('Nama dosen minimal 2 karakter');
    }
    if (body.waktuMulai !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.waktuMulai)) {
      errors.push('Format waktu mulai: HH:MM');
    }
    if (body.waktuSelesai !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(body.waktuSelesai)) {
      errors.push('Format waktu selesai: HH:MM');
    }
    if (body.hari !== undefined && !['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'].includes(body.hari)) {
      errors.push('Hari tidak valid');
    }
    if (body.warnaKategori !== undefined && !/^#[0-9A-F]{6}$/i.test(body.warnaKategori)) {
      errors.push('Format warna: #RRGGBB');
    }
    
    // Validasi waktu selesai > mulai (jika kedua field ada)
    if (body.waktuMulai && body.waktuSelesai && body.waktuSelesai <= body.waktuMulai) {
      errors.push('Waktu selesai harus lebih besar dari waktu mulai');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
    }

    // Conflict detection untuk updates
    if (body.hari || body.waktuMulai || body.waktuSelesai) {
      const existing = await db.select().from(schedules)
        .where(and(
          eq(schedules.userId, user.id),
          eq(schedules.hari, body.hari || 'Senin'),
          eq(schedules.id, id) // exclude current
        ));
      
      const newStart = body.waktuMulai || '00:00';
      const newEnd = body.waktuSelesai || '23:59';
      
      const hasOverlap = existing.some((s: any) => 
        new Date(`2000-01-01T${newStart}`) < new Date(`2000-01-01T${s.waktuSelesai}`) &&
        new Date(`2000-01-01T${newEnd}`) > new Date(`2000-01-01T${s.waktuMulai}`)
      );
      
      if (hasOverlap) {
        return NextResponse.json({ error: 'Jadwal bentrok dengan jadwal lain!' }, { status: 409 });
      }
    }

    // Filter hanya field yang valid untuk diupdate
    const allowedFields = [
      'mataPelajaran', 'namaDosen', 'ruangan', 'waktuMulai', 
      'waktuSelesai', 'hari', 'sks', 'warnaKategori', 'catatan'
    ];
    const updateData: Record<string, any> = { updatedAt: new Date() };
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updated = await db.update(schedules)
      .set(updateData)
      .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)))
      .returning();
    
    if (!updated.length) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Update error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui jadwal' }, { status: 500 });
  }
}

// DELETE schedule
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  
  const deleted = await db.delete(schedules)
    .where(and(eq(schedules.id, id), eq(schedules.userId, user.id)))
    .returning();
  
  if (!deleted.length) {
    return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}