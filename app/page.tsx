import Link from 'next/link';
import { Calendar, Shield, Download, Users, Zap, CheckCircle, ArrowRight, Star } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: 'Kelola Jadwal',
      description: 'Tambah, edit, dan hapus jadwal kuliah dengan mudah. Validasi otomatis untuk jadwal bentrok.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Data Aman',
      description: 'Autentikasi JWT dan enkripsi password. Data Anda hanya bisa diakses oleh Anda.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: 'Export Fleksibel',
      description: 'Export jadwal ke PDF untuk print atau ke iCal untuk Google Calendar & Outlook.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Multi-Device',
      description: 'Akses dari laptop, tablet, atau HP. Responsif dan ringan di semua perangkat.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    { value: '500+', label: 'Pengguna Aktif' },
    { value: '10K+', label: 'Jadwal Terkelola' },
    { value: '99%', label: 'Kepuasan Pengguna' },
    { value: '24/7', label: 'Aksesibilitas' },
  ];

  const testimonials = [
    {
      name: 'Andi Pratama',
      role: 'Mahasiswa Teknik Informatika',
      content: 'JADWALIN sangat membantu saya mengatur jadwal kuliah yang padat. Export ke Google Calendar fitur favorit saya!',
      avatar: '👨‍💻',
    },
    {
      name: 'Siti Nurhaliza',
      role: 'Mahasiswa Manajemen',
      content: 'Interface-nya simpel dan mudah digunakan. Sekarang tidak ada lagi jadwal yang bentrok!',
      avatar: '👩‍🎓',
    },
    {
      name: 'Budi Santoso',
      role: 'Mahasiswa Ekonomi',
      content: 'Fitur export PDF sangat berguna saat perlu print jadwal untuk ditempel di kamar.',
      avatar: '🧑‍💼',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-3xl rounded-full" />
        
        <div className="relative text-center max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <Zap className="h-4 w-4 text-primary" />
            <span>Gratis Selamanya — Tanpa Kartu Kredit</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Kelola Jadwal Kuliah{' '}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Lebih Mudah & Efisien
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            JADWALIN membantu mahasiswa dan siswa mengatur jadwal akademik 
            dengan interface yang intuitif, fitur export, dan sinkronisasi kalender.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              Mulai Sekarang — Gratis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 rounded-xl font-semibold hover:bg-muted transition-colors"
            >
              Pelajari Fitur
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Tanpa Iklan</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Data Terenkripsi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="text-center p-6 bg-card rounded-2xl border hover:border-primary/50 transition-all hover:shadow-lg">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-muted-foreground text-sm">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Fitur Unggulan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola jadwal kuliah dalam satu platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="group p-8 bg-card rounded-2xl border hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Apa Kata Mereka?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Bergabung dengan ratusan mahasiswa yang sudah menggunakan JADWALIN
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="p-6 bg-card rounded-2xl border hover:shadow-lg transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 px-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/10 blur-3xl rounded-full" />
        <div className="relative text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Siap Mengatur Jadwal Anda?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Bergabung dengan ratusan mahasiswa yang sudah menggunakan JADWALIN 
            untuk mengelola waktu kuliah lebih efektif.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
          >
            Daftar Gratis Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/60">Tidak perlu kartu kredit • Setup dalam 2 menit</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t pt-12 pb-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="font-bold text-xl mb-4">JADWALIN</h3>
            <p className="text-muted-foreground max-w-sm">
              Platform manajemen jadwal kuliah terpercaya untuk mahasiswa Indonesia.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Fitur</Link></li>
              <li><Link href="/register" className="hover:text-primary transition-colors">Daftar</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} JADWALIN. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
