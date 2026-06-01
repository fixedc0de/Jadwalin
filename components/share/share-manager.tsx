'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Copy, Link, Trash2, RefreshCw, Check, ExternalLink } from 'lucide-react';

interface ShareToken {
  id: string;
  expiresAt: string;
  revoked: boolean;
  createdAt: string;
}

export function ShareManager() {
  const [tokens, setTokens] = useState<ShareToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [expiresDays, setExpiresDays] = useState(30);

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/share/tokens');
      if (!res.ok) {
        if (res.status === 401) {
          return; // User belum login, handled by parent
        }
        throw new Error('Gagal mengambil data');
      }
      const data = await res.json();
      setTokens(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateToken = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/share/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresDays }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat token');

      setCurrentToken(data.token);
      setCopied(false);
      toast.success('Token sharing berhasil dibuat!');
      fetchTokens(); // Refresh list
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentToken) return;

    const shareUrl = `${window.location.origin}/share/${currentToken}`;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link berhasil disalin!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async (tokenId: string) => {
    if (!confirm('Yakin ingin mencabut link sharing ini? Link tidak akan bisa diakses lagi.')) {
      return;
    }

    try {
      const res = await fetch(`/api/share/tokens?id=${tokenId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal revoke token');

      toast.success('Link sharing telah dicabut');
      fetchTokens();
      setCurrentToken(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate Token Section */}
      <div className="bg-card rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Link className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Bagikan Jadwal</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Buat link sharing read-only untuk jadwal Anda. Link akan kadaluarsa setelah periode yang ditentukan.
        </p>

        {!currentToken ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Masa berlaku:</label>
              <select
                value={expiresDays}
                onChange={(e) => setExpiresDays(Number(e.target.value))}
                className="px-3 py-2 border rounded bg-background text-sm"
                disabled={generating}
              >
                <option value={7}>7 hari</option>
                <option value={14}>14 hari</option>
                <option value={30}>30 hari</option>
              </select>
            </div>

            <button
              onClick={handleGenerateToken}
              disabled={generating}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {generating && <RefreshCw className="h-4 w-4 animate-spin" />}
              {generating ? 'Membuat...' : 'Buat Link Sharing'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="h-5 w-5" />
              <span className="font-medium">Link berhasil dibuat!</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/share/${currentToken}`}
                className="flex-1 px-3 py-2 border rounded bg-background text-sm font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Disalin!' : 'Salin'}
              </button>
              <a
                href={`/share/${currentToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
            </div>

            <p className="text-xs text-muted-foreground">
              ⚠️ Simpan link ini dengan baik. Anda tidak bisa melihat token lagi setelah menutup halaman ini.
            </p>

            <button
              onClick={() => setCurrentToken(null)}
              className="text-sm text-primary hover:underline"
            >
              Buat token baru
            </button>
          </div>
        )}
      </div>

      {/* Active Tokens List */}
      {tokens.length > 0 && (
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Link Sharing Aktif</h3>

          <div className="space-y-3">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg bg-muted/30"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                      Aktif
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Dibuat: {formatDate(token.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Kadaluarsa: {formatDate(token.expiresAt)}
                  </p>
                </div>

                <button
                  onClick={() => handleRevoke(token.id)}
                  className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2 text-sm self-start sm:self-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  Cabut Link
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
