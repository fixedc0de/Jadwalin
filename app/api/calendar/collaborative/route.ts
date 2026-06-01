import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schedules, collaborations, users } from '@/lib/db-schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth';

// GET /api/calendar/collaborative - Get combined calendar from all collaborators
export async function GET(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Get all accepted collaborations where user is owner (collaborators' schedules)
    const ownerCollabs = await db.select({
      collaboratorId: collaborations.collaboratorUserId,
      collaboratorName: users.namaLengkap,
      permissionLevel: collaborations.permissionLevel,
    })
      .from(collaborations)
      .leftJoin(users, eq(collaborations.collaboratorUserId, users.id))
      .where(
        and(
          eq(collaborations.ownerUserId, user.id),
          eq(collaborations.status, 'accepted')
        )
      );

    // Get all accepted collaborations where user is collaborator (owner's schedules)
    const collabSchedules = await db.select({
      ownerId: collaborations.ownerUserId,
      ownerName: users.namaLengkap,
      permissionLevel: collaborations.permissionLevel,
    })
      .from(collaborations)
      .leftJoin(users, eq(collaborations.ownerUserId, users.id))
      .where(
        and(
          eq(collaborations.collaboratorUserId, user.id),
          eq(collaborations.status, 'accepted')
        )
      );

    // Collect all user IDs whose schedules should be shown
    const collaboratorIds = ownerCollabs.map(c => c.collaboratorId);
    const ownerIds = collabSchedules.map(c => c.ownerId);
    
    // Combine with user's own ID
    const allUserIds = [user.id, ...collaboratorIds, ...ownerIds];

    // Get all schedules from these users
    const allSchedules = await db.select({
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
      userId: schedules.userId,
      ownerName: users.namaLengkap,
      isOwner: eq(schedules.userId, user.id),
    })
      .from(schedules)
      .leftJoin(users, eq(schedules.userId, users.id))
      .where(inArray(schedules.userId, allUserIds));

    // Map permission levels for each schedule
    const schedulePermissions = new Map<string, string>();
    
    // User's own schedules
    allSchedules
      .filter(s => s.userId === user.id)
      .forEach(s => schedulePermissions.set(s.id, 'owner'));

    // Schedules from collaborators (user is owner)
    ownerCollabs.forEach(c => {
      allSchedules
        .filter(s => s.userId === c.collaboratorId)
        .forEach(s => schedulePermissions.set(s.id, c.permissionLevel));
    });

    // Schedules from owners (user is collaborator)
    collabSchedules.forEach(c => {
      allSchedules
        .filter(s => s.userId === c.ownerId)
        .forEach(s => schedulePermissions.set(s.id, c.permissionLevel));
    });

    // Add permission info to each schedule
    const schedulesWithPermission = allSchedules.map(s => ({
      ...s,
      isOwner: s.userId === user.id,
      canEdit: schedulePermissions.get(s.id) === 'owner' || schedulePermissions.get(s.id) === 'edit',
      permissionLevel: schedulePermissions.get(s.id) || 'view',
    }));

    return NextResponse.json({
      schedules: schedulesWithPermission,
      collaborators: [
        ...ownerCollabs.map(c => ({
          id: c.collaboratorId,
          namaLengkap: c.collaboratorName,
          permissionLevel: c.permissionLevel,
          type: 'outgoing' as const,
        })),
        ...collabSchedules.map(c => ({
          id: c.ownerId,
          namaLengkap: c.ownerName,
          permissionLevel: c.permissionLevel,
          type: 'incoming' as const,
        })),
      ],
    });
  } catch (err: any) {
    console.error('Fetch collaborative calendar error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memuat kalender kolaboratif' }, { status: 500 });
  }
}
