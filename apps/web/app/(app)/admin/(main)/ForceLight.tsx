'use client';

import { useLayoutEffect } from 'react';

/**
 * Komponen ini memastikan admin panel selalu menggunakan mode terang (light mode).
 * - Menggunakan useLayoutEffect agar berjalan sinkron sebelum browser me-render (paint) saat navigasi client-side.
 */
export default function ForceLight() {
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Tidak mengembalikan tag <script> agar tidak memunculkan error dari React di konsol
  return null;
}
