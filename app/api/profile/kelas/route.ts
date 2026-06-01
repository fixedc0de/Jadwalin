import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db-schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const kelasCodeSchema = z.object({
  kelasCode: z.string().max(50).optional().or(z.literal('')).or(z.literal(null)),
});

/**
 * PATCH /api/profile/kelas - Update kode kelas user
 */
export async function PATCH(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const valid = kelasCodeSchema.parse(body);

    // Normalize: empty string -> null
    const kelasCode = valid.kelasCode?.trim() || null;

    await db
      .update(users)
      .set({ 
        kelasCode,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true, kelasCode });
  } catch (error: any) {
    console.error('Error updating kelas code:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map((e: any) => e.message).join(', ') },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Gagal update kode kelas' },
      { status: 500 }
    );
  }
}
