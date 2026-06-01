import { Metadata } from 'next';
import { Suspense } from 'react';
import ClassScheduleView from './class-schedule-view';

export const metadata: Metadata = {
  title: 'Jadwal Kelas - JADWALIN',
  description: 'Lihat jadwal gabungan kelas',
};

export default async function ClassSchedulePage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat jadwal kelas...</p>
          </div>
        </div>
      }>
        <ClassScheduleView kode={kode} />
      </Suspense>
    </div>
  );
}
