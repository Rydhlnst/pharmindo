import sys

filename = 'apps/web/components/admin/AdminTopbar.tsx'
with open(filename, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Using 0-indexed line numbers
lines[163] = "      // Already granted - show a test notification\n"
lines[316] = "                  ? 'Notifikasi diblokir - aktifkan di pengaturan browser'\n"
lines[386] = '                  <span><strong className="text-[color:var(--admin-body)]">Dashboard</strong> — Ringkasan statistik warga, keluarga, dan mutasi penduduk secara real-time.</span>\n'
lines[390] = '                  <span><strong className="text-[color:var(--admin-body)]">Data Penduduk</strong> — Tambah, edit, dan kelola seluruh data warga RW.</span>\n'
lines[394] = '                  <span><strong className="text-[color:var(--admin-body)]">Kartu Keluarga</strong> — Kelola data KK beserta anggota keluarga.</span>\n'
lines[398] = '                  <span><strong className="text-[color:var(--admin-body)]">Mutasi Penduduk</strong> — Catat perpindahan masuk dan keluar warga.</span>\n'
lines[402] = '                  <span><strong className="text-[color:var(--admin-body)]">Permohonan</strong> — Terima dan proses permohonan dari warga.</span>\n'
lines[406] = '                  <span><strong className="text-[color:var(--admin-body)]">Kegiatan RW</strong> — Jadwalkan dan kelola kegiatan warga.</span>\n'
lines[410] = '                  <span><strong className="text-[color:var(--admin-body)]">Laporan</strong> — Ekspor data dan statistik dalam berbagai format.</span>\n'
lines[439] = '                  <p><strong>Dikembangkan oleh:</strong> Tim ABDIMAS — Telkom University</p>\n'

with open(filename, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Line replacements done!")
