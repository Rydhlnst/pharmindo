'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileEdit, Trash2, Clock, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { getAllDrafts, deleteDraft, type DraftMeta } from '@/lib/draft-utils';

export default function DraftsPage() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DraftMeta | null>(null);

  const refresh = useCallback(() => {
    try {
      setDrafts(getAllDrafts(false));
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDelete = (draft: DraftMeta) => {
    deleteDraft(draft.key);
    setDeleteTarget(null);
    refresh();
    toast({
      title: 'Draft dihapus',
      description: `Draft "${draft.label}" berhasil dihapus.`,
    });
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24 pt-6 px-4">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/warga" className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Draft Tersimpan</h1>
            <p className="text-sm text-slate-500 mt-0.5">Kelola draft formulir Anda</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-sm text-slate-500 py-8">Memuat draft...</div>
        ) : drafts.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <AlertCircle className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Belum Ada Draft</p>
            <p className="mt-1 text-xs text-slate-500">
              Draft akan tersimpan otomatis saat Anda mengisi formulir dan menekan &quot;Simpan Draft&quot;.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {drafts.map((draft) => (
              <Card key={draft.key} className="border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileEdit className="h-4 w-4 text-blue-500 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-800 truncate">{draft.label}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{draft.description}</p>
                    {draft.formPreview && (
                      <p className="text-xs text-slate-600 mt-1 truncate">
                        <span className="font-medium">Data:</span> {draft.formPreview}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Disimpan: {formatDate(draft.savedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={draft.href}>
                      <Button size="sm" className="rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs">
                        Lanjutkan
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0"
                      onClick={() => setDeleteTarget(draft)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="w-[90%] max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Hapus Draft?</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Draft &quot;{deleteTarget?.label}&quot; akan dihapus permanen dari browser ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row mt-4">
            <Button variant="outline" className="rounded-full w-full" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              className="rounded-full w-full"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Hapus Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
