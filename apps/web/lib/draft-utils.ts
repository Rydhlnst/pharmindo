'use client';

import { useCallback, useEffect, useState } from 'react';

export type DraftMeta = {
  key: string;
  label: string;
  description: string;
  href: string;
  savedAt: string;
  formPreview: string;
};

const DRAFT_REGISTRY: Array<Omit<DraftMeta, 'savedAt' | 'formPreview'>> = [
  {
    key: 'warga_mutasi_draft',
    label: 'Mutasi Penduduk',
    description: 'Formulir permohonan mutasi masuk/keluar',
    href: '/warga/mutasi/tambah',
  },
  {
    key: 'draft_tambah_kk',
    label: 'Tambah Kartu Keluarga',
    description: 'Formulir pembuatan Kartu Keluarga baru',
    href: '/warga/kk/tambah',
  },
  {
    key: 'draft_tambah_penduduk_warga',
    label: 'Tambah Data Penduduk',
    description: 'Formulir pendaftaran data penduduk',
    href: '/warga/penduduk/tambah',
  },
];

const ADMIN_DRAFT_REGISTRY: Array<Omit<DraftMeta, 'savedAt' | 'formPreview'>> = [
  {
    key: 'draft-data-penduduk',
    label: 'Tambah Data Penduduk',
    description: 'Formulir pendaftaran data penduduk (admin)',
    href: '/admin/data-penduduk/tambah',
  },
];

function extractFormPreview(data: Record<string, unknown>): string {
  const name = data.name || data.nama || data.headCitizenName || '';
  if (typeof name === 'string' && name.length > 0) return name;
  const itemName = data.itemName || data.ticketNumber || '';
  if (typeof itemName === 'string' && itemName.length > 0) return itemName;
  return '';
}

export function getAllDrafts(isAdmin = false): DraftMeta[] {
  const registry = isAdmin ? ADMIN_DRAFT_REGISTRY : DRAFT_REGISTRY;
  const drafts: DraftMeta[] = [];
  const processedKeys = new Set<string>();

  for (const entry of registry) {
    try {
      const raw = localStorage.getItem(entry.key);
      if (!raw) continue;
      processedKeys.add(entry.key);
      const parsed = JSON.parse(raw);
      const savedAt = parsed.savedAt || parsed.createdAt || new Date().toISOString();
      const formData = parsed.form || parsed;
      const formPreview = extractFormPreview(formData as Record<string, unknown>);
      drafts.push({
        ...entry,
        savedAt,
        formPreview,
      });
    } catch {
      // skip corrupted drafts
    }
  }

  // Scan for dynamic keys like draft_tambah_anggota_${householdId}
  if (!isAdmin) {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey || processedKeys.has(storageKey)) continue;

      if (storageKey.startsWith('draft_tambah_anggota_')) {
        try {
          const raw = localStorage.getItem(storageKey);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          const savedAt = parsed.savedAt || parsed.createdAt || new Date().toISOString();
          const formData = parsed.form || parsed;
          const formPreview = extractFormPreview(formData as Record<string, unknown>);
          drafts.push({
            key: storageKey,
            label: 'Tambah Anggota KK',
            description: 'Formulir penambahan anggota keluarga',
            href: '/warga/kk/tambah-anggota',
            savedAt,
            formPreview,
          });
        } catch {
          // skip corrupted drafts
        }
      }
    }
  }

  return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export function getDraftCount(isAdmin = false): number {
  return getAllDrafts(isAdmin).length;
}

export function deleteDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export function hasDraft(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function useDraftList(isAdmin = false) {
  const [drafts, setDrafts] = useState<DraftMeta[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    try {
      setDrafts(getAllDrafts(isAdmin));
    } catch {
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback((key: string) => {
    deleteDraft(key);
    setDrafts((prev) => prev.filter((d) => d.key !== key));
  }, []);

  return { drafts, loading, refresh, remove };
}
