import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import SharedScheduleView from './shared-schedule-view';

// Dynamic metadata untuk SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  return {
    title: 'Jadwal Sharing - JADWALIN',
    description: 'Lihat jadwal kuliah yang dibagikan',
    robots: {
      index: false, // Jangan index halaman sharing di search engine
      follow: false,
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat jadwal...</p>
          </div>
        </div>
      }>
        <SharedScheduleView token={token} />
      </Suspense>
    </div>
  );
}
