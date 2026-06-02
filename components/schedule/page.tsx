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
  warnaKategori: string | null;
  catatan: string | null;
}

export function ExportIcalButton({ schedules }: { schedules: Schedule[] }) {
  const generateIcal = () => {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Mapping hari Indonesia ke format iCal (RRULE)
    const dayMap: Record<string, number> = {
      'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6
    };

    const events = schedules.map(s => {
      // Format waktu untuk iCal: YYYYMMDDTHHMMSS
      const formatDate = (time: string) => {
        const [hours, minutes] = time.split(':');
        return `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}01T${hours}${minutes}00`;
      };

      const dayNum = dayMap[s.hari] || 1;
      // Hitung tanggal berikutnya untuk hari yang dimaksud
      const currentDay = now.getDay() || 7; // Sunday = 0 -> 7
      const daysUntil = ((dayNum - currentDay + 7) % 7) || 7;
      const eventDate = new Date(now);
      eventDate.setDate(now.getDate() + daysUntil);
      
      const dateStr = eventDate.toISOString().split('T')[0].replace(/-/g, '');
      const dtStart = `${dateStr}T${s.waktuMulai.replace(':','')}00`;
      const dtEnd = `${dateStr}T${s.waktuSelesai.replace(':','')}00`;

      return `BEGIN:VEVENT
UID:${s.id}@jadwalin.app
DTSTAMP:${timestamp}
DTSTART;VALUE=DATE-TIME:${dtStart}
DTEND;VALUE=DATE-TIME:${dtEnd}
SUMMARY:${s.mataPelajaran}
DESCRIPTION:${s.catatan || ''}\\nDosen: ${s.namaDosen}${s.ruangan ? `\\nRuangan: ${s.ruangan}` : ''}
LOCATION:${s.ruangan || 'TBA'}
CATEGORIES:KULIAH
RRULE:FREQ=WEEKLY;BYDAY=${['MO','TU','WE','TH','FR','SA'][dayNum-1]}
END:VEVENT`;
    }).join('\n');

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JADWALIN//ID
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Jadwal Kuliah
X-WR-TIMEZONE:Asia/Jakarta
${events}
END:VCALENDAR`;
  };

  const handleExport = () => {
    const now = new Date();
    if (schedules.length === 0) {
      toast.error('Tidak ada jadwal untuk diexport');
      return;
    }

    try {
      const ical = generateIcal();
      const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jadwal-kuliah-${now.getFullYear()}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('File .ics berhasil diunduh! Buka di Google Calendar atau Outlook.');
    } catch (err) {
      console.error(err);
      toast.error('Gagal membuat file .ics');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors text-sm"
      title="Export ke Google Calendar / Outlook"
    >
      <Download size={16} /> Export iCal
    </button>
  );
}
