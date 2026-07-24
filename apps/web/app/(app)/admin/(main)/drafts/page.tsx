'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, NotePencil as FileEdit, Trash, Clock, WarningCircle as AlertCircle } from '@phosphor-icons/react';

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
import { useActionToast } from '@/lib/use-action-toast';
import { getAllDrafts, deleteDraft, type DraftMeta } from '@/lib/draft-utils';

export default function AdminDraftsPage() {
  const router = useRouter();
  const { toast } = useActionToast();
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DraftMeta | null>(null);

  const refresh = useCallback(() => {
    try {
      setDrafts(getAllDrafts(true));
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Draft Tersimpan</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola draft formulir admin.</p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-slate-500">Memuat draft...</div>
      ) : drafts.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <AlertCircle className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Belum Ada Draft</p>
          <p className="mt-1 text-xs text-slate-500">
            Draft akan tersimpan saat Anda mengisi formulir dan keluar dengan menyimpan draft.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((draft) => (
            <Card key={draft.key} className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileEdit className="h-5 w-5 text-blue-500 shrink-0" />
                    <h3 className="text-base font-bold text-slate-800">{draft.label}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{draft.description}</p>
                  {draft.formPreview && (
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="font-medium">Data:</span> {draft.formPreview}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Disimpan: {formatDate(draft.savedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={draft.href}>
                    <Button size="sm" className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                      Lanjutkan
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 h-9 w-9 p-0"
                    onClick={() => setDeleteTarget(draft)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-3xl p-8 text-center">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Trash className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#18212F]">
              Hapus Draft?
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-[#667085]">
              Draft &quot;{deleteTarget?.label}&quot; akan dihapus permanen dari browser ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex w-full flex-col gap-3 sm:flex-col sm:justify-center sm:space-x-0">
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="w-full rounded-xl py-6 text-base font-bold"
            >
              Ya, Hapus Draft
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="w-full rounded-xl border-gray-200 py-6 text-base font-bold text-[#64748B] hover:bg-gray-100"
            >
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
