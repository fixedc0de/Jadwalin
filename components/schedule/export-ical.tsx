// components/schedule/export-ical.tsx
'use client';

import { Download } from 'lucide-react';
import { toast } from 'sonner';

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
  catatan: string | null;
}

export function ExportIcalButton({ schedules }: { schedules: Schedule[] }) {
  const handleExport = () => {
    const now = new Date();
    if (schedules.length === 0) {
      toast.error('Tidak ada jadwal untuk diexport');
      return;
    }

    try {
      const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dayMap: Record<string, number> = {
        'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
      };

      const events = schedules.map(s => {
        const dayNum = dayMap[s.hari] || 1;
        const currentDay = now.getDay() || 7;
        const daysUntil = ((dayNum - currentDay + 7) % 7) || 7;
        const eventDate = new Date(now);
        eventDate.setDate(now.getDate() + daysUntil);
        
        const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
        const dtStart = `${dateStr}T${s.waktuMulai.replace(':','')}00`;
        const dtEnd = `${dateStr}T${s.waktuSelesai.replace(':','')}00`;
        const rruleDay = ['MO','TU','WE','TH','FR','SA'][dayNum-1];

        return `BEGIN:VEVENT
UID:${s.id}@jadwalin.app
DTSTAMP:${timestamp}
DTSTART;VALUE=DATE-TIME:${dtStart}
DTEND;VALUE=DATE-TIME:${dtEnd}
SUMMARY:${s.mataPelajaran}
DESCRIPTION:${s.catatan || ''}\\nDosen: ${s.namaDosen}${s.ruangan ? `\\nRuangan: ${s.ruangan}` : ''}
LOCATION:${s.ruangan || 'TBA'}
CATEGORIES:KULIAH
RRULE:FREQ=WEEKLY;BYDAY=${rruleDay}
END:VEVENT`;
      }).join('\n');

      const ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JADWALIN//ID
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Jadwal Kuliah
X-WR-TIMEZONE:Asia/Jakarta
${events}
END:VCALENDAR`;

      const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // ✅ now sudah terdefinisi di scope ini
      a.download = `jadwal-kuliah-${now.getFullYear()}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('File .ics berhasil diunduh!');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat file .ics');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
    >
      <Download size={16} /> Export iCal
    </button>
  );
}