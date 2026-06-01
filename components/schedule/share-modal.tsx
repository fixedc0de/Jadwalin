'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Link as LinkIcon, X, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface ShareScheduleModalProps {
  scheduleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareScheduleModal({ scheduleId, isOpen, onClose }: ShareScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<{
    shareToken: string;
    shareUrl: string;
    expiresAt: string | null;
    isActive: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresAt: expiryDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat link share');

      setShareData({
        shareToken: data.shareToken,
        shareUrl: data.shareUrl,
        expiresAt: data.expiresAt,
        isActive: true,
      });
      toast.success('Link share berhasil dibuat!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareData?.shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Link disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Yakin ingin menonaktifkan link share ini?')) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/share`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal mencabut link');

      setShareData(null);
      toast.success('Link share dinonaktifkan');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresAt: expiryDate || null,
          isActive: shareData?.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengaturan');

      setShareData({
        shareToken: data.shareToken,
        shareUrl: data.shareUrl,
        expiresAt: data.expiresAt,
        isActive: data.isActive,
      });
      toast.success('Pengaturan diperbarui!');
      setShowSettings(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!shareData) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !shareData.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status');

      setShareData({
        ...shareData,
        isActive: data.isActive,
      });
      toast.success(shareData.isActive ? 'Link dinonaktifkan' : 'Link diaktifkan');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl border max-w-md w-full p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Bagikan Jadwal
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!shareData ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Buat link share untuk membagikan jadwal ini kepada siapa saja. 
              Link dapat diakses tanpa login.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tanggal Kadaluarsa (opsional)
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded bg-background text-sm"
                />
              </div>

              <button
                onClick={handleGenerateLink}
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Membuat...' : 'Buat Link Share'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Share Link Display */}
            <div className="space-y-4">
              <div className={`p-3 rounded-lg border ${!shareData.isActive ? 'bg-muted/50' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Link Share:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareData.shareUrl}
                    className="flex-1 px-3 py-2 border rounded bg-background text-sm truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity flex items-center gap-1"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-4 text-sm">
                <div className={`flex items-center gap-1 ${!shareData.isActive ? 'text-red-500' : 'text-green-500'}`}>
                  <Calendar className="h-4 w-4" />
                  <span>{shareData.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                {shareData.expiresAt && (
                  <div className="text-muted-foreground">
                    Exp: {new Date(shareData.expiresAt).toLocaleDateString('id-ID')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex-1 px-3 py-2 border rounded hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Settings className="h-4 w-4" />
                  Pengaturan
                </button>
                <button
                  onClick={handleToggleActive}
                  className={`flex-1 px-3 py-2 rounded transition-colors text-sm ${
                    shareData.isActive
                      ? 'border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                      : 'border border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950'
                  }`}
                >
                  {shareData.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button
                  onClick={handleRevoke}
                  className="px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm"
                >
                  Hapus
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="p-3 border rounded bg-muted/30 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tanggal Kadaluarsa
                    </label>
                    <input
                      type="datetime-local"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded bg-background text-sm"
                      placeholder="Kosongkan untuk tanpa batas"
                    />
                  </div>
                  <button
                    onClick={handleUpdateSettings}
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
