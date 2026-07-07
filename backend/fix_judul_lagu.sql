-- ============================================================
-- FIX: Tambah default value untuk kolom judul_lagu
-- Jalankan di Railway MySQL Console jika kolom sudah ada
-- ============================================================

-- Opsi 1: Jika kolom judul_lagu SUDAH ADA tapi tidak ada DEFAULT
ALTER TABLE lagu
  MODIFY COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT '';

-- Opsi 2: Jika kolom judul_lagu BELUM ADA sama sekali, gunakan ini:
-- ALTER TABLE lagu
--   ADD COLUMN judul_lagu VARCHAR(255) NOT NULL DEFAULT '' AFTER tebak_lagu_id;

-- Update baris lama yang kosong agar tidak ada NULL
UPDATE lagu SET judul_lagu = '' WHERE judul_lagu IS NULL;
