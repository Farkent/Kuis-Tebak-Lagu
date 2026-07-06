// api.js — Helper untuk base URL API
// Di development: VITE_API_URL kosong → pakai proxy Vite (/api/...)
// Di production:  VITE_API_URL = URL Railway backend

const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Buat URL API lengkap.
 * @param {string} path - path endpoint, contoh: "/dapatkan_lagu.php"
 * @returns {string}
 */
export function apiUrl(path) {
  if (API_BASE) {
    // Production: langsung ke Railway
    return `${API_BASE}${path}`;
  }
  // Development: pakai proxy Vite /api/...
  return `/api${path}`;
}
