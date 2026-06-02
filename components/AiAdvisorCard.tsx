"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ScheduleEvent {
  id: string;
  userId: string;
  mataPelajaran: string;
  namaDosen: string;
  ruangan: string | null;
  waktuMulai: string;
  waktuSelesai: string;
  hari: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
  sks: number | null;
  warnaKategori: string | null;
  catatan: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AiAdvisorCardProps {
  scheduleEvents?: ScheduleEvent[];
}

export default function AiAdvisorCard({ scheduleEvents }: AiAdvisorCardProps) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAdvice = async () => {
    setLoading(true);
    setError(null);
    setAdvice(null); // Reset saran sebelumnya

    try {
      const response = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika ada saran fallback di response error, tetap tampilkan
        if (data.advice) {
          setAdvice(data.advice);
        } else {
          throw new Error(data.error || "Terjadi kesalahan saat menghubungi AI.");
        }
      } else {
        setAdvice(data.advice);
      }
    } catch (err) {
      console.error("Error fetching AI advice:", err);
      setError(err instanceof Error ? err.message : "Gagal mendapatkan saran dari AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Time Management Advisor
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          Dapatkan saran manajemen waktu personal berdasarkan jadwal kuliahmu. 
          AI akan menganalisis kepadatan jadwal dan memberikan tips produktivitas.
        </p>
      </div>

      {/* Info Badge */}
      {scheduleEvents && scheduleEvents.length > 0 && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
          <span>📚</span>
          {scheduleEvents.length} jadwal ditemukan
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerateAdvice}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-md hover:shadow-lg"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI sedang menganalisis jadwalmu...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>✨</span>
            Generate AI Suggestion
          </span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium">Terjadi Kesalahan</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton or Advice Content */}
      {(loading || advice) && (
        <div className="mt-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          {loading && !advice && (
            <div className="animate-pulse space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-4/6"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          )}
          
          {advice && (
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg font-semibold text-gray-800 dark:text-white mt-4 mb-2" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mt-3 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-600 dark:text-gray-300 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 ml-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1 ml-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-gray-600 dark:text-gray-300" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-gray-800 dark:text-white" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic my-2" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline ? 
                    <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props} /> :
                    <code className="block bg-gray-800 text-gray-100 p-3 rounded-lg my-2 overflow-x-auto text-sm" {...props} />,
                  pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg my-2 overflow-x-auto" {...props} />,
                  a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                }}
                remarkPlugins={[remarkGfm]}
              >
                {advice}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {/* Tips Footer */}
      {!advice && !loading && (
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <span>💡</span>
            <span>
              <strong>Tips:</strong> Pastikan kamu sudah menambahkan jadwal kuliah sebelum menggunakan fitur ini untuk hasil analisis yang lebih akurat.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
