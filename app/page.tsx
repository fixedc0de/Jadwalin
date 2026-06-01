import Link from 'next/link';
import { Calendar, Shield, Download, Users } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Kelola Jadwal',
      description: 'Tambah, edit, dan hapus jadwal kuliah dengan mudah. Validasi otomatis untuk jadwal bentrok.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Data Aman',
      description: 'Autentikasi JWT dan enkripsi password. Data Anda hanya bisa diakses oleh Anda.',
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Export Fleksibel',
      description: 'Export jadwal ke PDF untuk print atau ke iCal untuk Google Calendar & Outlook.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Multi-Device',
      description: 'Akses dari laptop, tablet, atau HP. Responsif dan ringan di semua perangkat.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Kelola Jadwal Kuliah <br />
          <span className="text-primary">Lebih Mudah & Efisien</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          JADWALIN membantu mahasiswa dan siswa mengatur jadwal akademik 
          dengan interface yang intuitif, fitur export, dan sinkronisasi kalender.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Mulai Sekarang — Gratis
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 border rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Pelajari Fitur
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="grid md:grid-cols-2 gap-6">
        {features.map((feature, i) => (
          <div key={i} className="p-6 bg-card rounded-xl border hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 bg-muted/50 rounded-2xl p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Siap Mengatur Jadwal Anda?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Bergabung dengan ratusan mahasiswa yang sudah menggunakan JADWALIN 
          untuk mengelola waktu kuliah lebih efektif.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Daftar Gratis Sekarang →
        </Link>
      </section>
    </div>
  );
}