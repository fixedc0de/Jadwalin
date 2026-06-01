'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send, Edit2, Trash2, CheckCircle, Circle, X } from 'lucide-react';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  type: 'comment' | 'note' | 'todo';
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
  authorId: string;
}

interface ScheduleCommentsProps {
  scheduleId: string;
  currentUserId: string;
}

export function ScheduleComments({ scheduleId, currentUserId }: ScheduleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'note' | 'todo'>('comment');
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/comments`);
      if (!res.ok) throw new Error('Gagal memuat komentar');
      const data = await res.json();
      setComments(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && loading) {
      fetchComments();
    }
  }, [expanded]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          type: commentType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan komentar');

      setComments([data, ...comments]);
      setNewComment('');
      toast.success('Komentar ditambahkan!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengedit komentar');

      setComments(comments.map(c => c.id === commentId ? { ...c, content: data.content, updatedAt: data.updatedAt } : c));
      setEditingId(null);
      setEditContent('');
      toast.success('Komentar diperbarui!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Gagal menghapus komentar');

      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Komentar dihapus');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    try {
      const res = await fetch(`/api/schedules/${scheduleId}/comments/${commentId}/resolve`, {
        method: 'PATCH',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status');

      setComments(comments.map(c => c.id === commentId ? { ...c, isResolved: data.isResolved } : c));
      toast.success(data.isResolved ? 'Komentar ditandai selesai' : 'Status dikembalikan');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'todo': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note': return 'Catatan';
      case 'todo': return 'TODO';
      default: return 'Komentar';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <span className="font-medium">Komentar ({comments.length})</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {expanded ? 'Tutup' : 'Buka'}
        </span>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex gap-2">
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value as any)}
                className="px-3 py-2 border rounded bg-background text-sm"
              >
                <option value="comment">Komentar</option>
                <option value="note">Catatan</option>
                <option value="todo">TODO</option>
              </select>
            </div>
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Tulis komentar..."
                className="flex-1 px-3 py-2 border rounded bg-background text-sm min-h-[80px] resize-y"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-50 self-end"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Memuat komentar...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Belum ada komentar. Jadilah yang pertama!
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-3 border rounded-lg ${
                    comment.isResolved ? 'opacity-60 bg-muted/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{comment.authorName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(comment.type)}`}>
                        {getTypeLabel(comment.type)}
                      </span>
                      {comment.isResolved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Selesai
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {currentUserId === comment.authorId && (
                        <>
                          <button
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      {comment.type === 'todo' && currentUserId !== comment.authorId && (
                        <button
                          onClick={() => handleToggleResolve(comment.id)}
                          className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors text-green-600"
                        >
                          {comment.isResolved ? (
                            <Circle className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {editingId === comment.id ? (
                    <div className="flex gap-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1 px-3 py-2 border rounded bg-background text-sm"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                          className="px-3 py-1 border rounded text-sm hover:bg-muted"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
