import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { scheduleShares, schedules } from '@/lib/db-schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { randomBytes } from 'crypto';

// Generate cryptographically secure random token
function generateShareToken(): string {
  return randomBytes(32).toString('hex');
}

// POST /api/schedules/[id]/share - Generate share link
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId } = await params;

  try {
    // Verify schedule ownership
    const [schedule] = await db.select()
      .from(schedules)
      .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, user.id)));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { expiresAt } = body as { expiresAt?: string };

    // Check for existing active share
    const [existingShare] = await db.select()
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.scheduleId, scheduleId),
          eq(scheduleShares.isActive, true)
        )
      );

    if (existingShare) {
      // Update existing share with new expiry if provided
      const updateData: any = { updatedAt: new Date() };
      if (expiresAt) updateData.expiresAt = new Date(expiresAt);

      const [updated] = await db.update(scheduleShares)
        .set(updateData)
        .where(eq(scheduleShares.id, existingShare.id))
        .returning();

      return NextResponse.json({
        shareToken: updated.shareToken,
        shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${updated.shareToken}`,
        expiresAt: updated.expiresAt,
      });
    }

    // Create new share
    const shareToken = generateShareToken();
    const [newShare] = await db.insert(scheduleShares)
      .values({
        scheduleId,
        shareToken,
        createdBy: user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      shareToken: newShare.shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${newShare.shareToken}`,
      expiresAt: newShare.expiresAt,
    }, { status: 201 });
  } catch (err: any) {
    console.error('Share generation error:', err);
    return NextResponse.json({ error: err.message || 'Gagal membuat link share' }, { status: 500 });
  }
}

// DELETE /api/schedules/[id]/share - Revoke share
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId } = await params;

  try {
    // Verify schedule ownership
    const [schedule] = await db.select()
      .from(schedules)
      .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, user.id)));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    // Deactivate all shares for this schedule
    await db.update(scheduleShares)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(
        eq(scheduleShares.scheduleId, scheduleId),
        eq(scheduleShares.createdBy, user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Share revocation error:', err);
    return NextResponse.json({ error: err.message || 'Gagal mencabut link share' }, { status: 500 });
  }
}

// PATCH /api/schedules/[id]/share - Update share settings
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: scheduleId } = await params;

  try {
    // Verify schedule ownership
    const [schedule] = await db.select()
      .from(schedules)
      .where(and(eq(schedules.id, scheduleId), eq(schedules.userId, user.id)));

    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { isActive, expiresAt } = body as { isActive?: boolean; expiresAt?: string };

    const [existingShare] = await db.select()
      .from(scheduleShares)
      .where(
        and(
          eq(scheduleShares.scheduleId, scheduleId),
          eq(scheduleShares.createdBy, user.id)
        )
      );

    if (!existingShare) {
      return NextResponse.json({ error: 'Link share tidak ditemukan' }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (isActive !== undefined) updateData.isActive = isActive;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

    const [updated] = await db.update(scheduleShares)
      .set(updateData)
      .where(eq(scheduleShares.id, existingShare.id))
      .returning();

    return NextResponse.json({
      shareToken: updated.shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${updated.shareToken}`,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive,
    });
  } catch (err: any) {
    console.error('Share update error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memperbarui pengaturan share' }, { status: 500 });
  }
}
