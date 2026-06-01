'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { pdf } from '@react-pdf/renderer';
import { SchedulePDF } from './pdf-template';

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
}

export function ExportPdfButton({ schedules, userName }: { schedules: Schedule[]; userName: string }) {
  const handleExport = async () => {
    if (schedules.length === 0) {
      toast.error('Tidak ada jadwal untuk diexport');
      return;
    }

    try {
      toast.loading('Membuat PDF...');
      const blob = await pdf(<SchedulePDF schedules={schedules} userName={userName} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jadwal-kuliah-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('Gagal membuat PDF');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
      title="Export ke PDF"
    >
      <Download size={16} /> Export PDF
    </button>
  );
}