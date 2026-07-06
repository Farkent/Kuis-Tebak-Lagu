// Admin.jsx - NEOBRUTALISM (Updated: Leaderboard Manager tab added)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationPopup from "../components/NotificationPopup";
import ConfirmationDialog from "../components/Confirmationdialog";

const emptySong = {
  lagu_id: 0, lirik: "", deezer_track_id: 0, preview_url: "", genre_id: "",
  jawaban: [
    { id: 0, jawaban_text: "", is_correct: false },
    { id: 0, jawaban_text: "", is_correct: false },
    { id: 0, jawaban_text: "", is_correct: false },
    { id: 0, jawaban_text: "", is_correct: false },
  ],
};

const TABS = [
  { id: "category", label: "01 KATEGORI", color: "#FFE600" },
  { id: "questions", label: "02 SOAL", color: "#00E5FF" },
  { id: "genres", label: "03 GENRE", color: "#FF2D78" },
  { id: "leaderboard", label: "04 LEADERBOARD", color: "#B8FF57" },
];

function NbInput({ label, value, onChange, placeholder, type = "text", disabled, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 bg-white border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors duration-100 disabled:opacity-40 placeholder:text-[#bbb] placeholder:font-normal"
      />
    </div>
  );
}

function NbTextarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">{label}</label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors duration-100 placeholder:text-[#bbb] placeholder:font-normal resize-none"
      />
    </div>
  );
}

function NbBtn({ children, onClick, color = "black", textColor = "#FFE600", shadow = "#FF2D78", className = "", disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-black text-xs uppercase tracking-widest px-5 py-3 border-4 border-black transition-all duration-100 disabled:opacity-40 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 ${className}`}
      style={{ background: color, color: textColor, boxShadow: `4px 4px 0px ${shadow}` }}
    >
      {children}
    </button>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("category");
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [newGenre, setNewGenre] = useState("");
  const [editingGenreId, setEditingGenreId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [songs, setSongs] = useState([]);
  const [editingSong, setEditingSong] = useState(emptySong);
  const [authenticated, setAuthenticated] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [confirmDialog, setConfirmDialog] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
    confirmText: "YA, LANJUTKAN",
    cancelText: "BATAL",
    isDangerous: true,
  });

  // Leaderboard state
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [filterByCategory, setFilterByCategory] = useState("");

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const showConfirmDialog = (config) => {
    setConfirmDialog({
      show: true,
      title: config.title || "Konfirmasi",
      message: config.message || "Apakah Anda yakin?",
      action: config.action,
      confirmText: config.confirmText || "YA, LANJUTKAN",
      cancelText: config.cancelText || "BATAL",
      isDangerous: config.isDangerous !== false,
    });
  };

  const handleConfirmDialog = () => {
    if (confirmDialog.action) {
      confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  const handleCancelDialog = () => {
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  useEffect(() => {
    fetch("/api/is_admin.php", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) navigate("/admin");
        else {
          setAuthenticated(true);
          loadCategories();
          loadGenres();
          if (!sessionStorage.getItem("login_notified")) {
            showNotification("LOGIN BERHASIL — SELAMAT DATANG!", "success");
            sessionStorage.setItem("login_notified", "true");
          }
        }
      })
      .catch(() => navigate("/admin"));
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "leaderboard") {
      loadLeaderboard();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedCategoryId) {
      const sel = categories.find((c) => String(c.id) === String(selectedCategoryId));
      if (sel) { setCategoryTitle(sel.title); setCategoryDescription(sel.description); }
      loadSongs(selectedCategoryId);
    } else { setCategoryTitle(""); setCategoryDescription(""); setSongs([]); }
    setEditingSong(emptySong);
  }, [selectedCategoryId, categories]);

  const loadCategories = () => fetch("/api/dapatkan_tebak_lagu.php", { credentials: "include" }).then((r) => r.json()).then(setCategories);
  const loadGenres = () => fetch("/api/genre_manager.php").then((r) => r.json()).then((d) => setGenres(Array.isArray(d) ? d : []));
  const loadSongs = (cid) => fetch(`/api/dapatkan_lagu.php?tebak_lagu_id=${cid}`, { credentials: "include" }).then((r) => r.json()).then((d) => setSongs(Array.isArray(d) ? d : []));

  // ════════════════════════════════════════════════════════════
  // Load leaderboard data
  // ════════════════════════════════════════════════════════════
  const loadLeaderboard = () => {
    setLeaderboardLoading(true);
    fetch("/api/dapatkan_leaderboard.php", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setLeaderboardData(d);
        else setLeaderboardData([]);
      })
      .catch(() => setLeaderboardData([]))
      .finally(() => setLeaderboardLoading(false));
  };

  // ════════════════════════════════════════════════════════════
  // Delete single leaderboard entry
  // ════════════════════════════════════════════════════════════
  const deleteLeaderboardEntry = (resultId, playerName) => {
    showConfirmDialog({
      title: "HAPUS SKOR PEMAIN?",
      message: `Skor ${playerName} akan dihapus dari leaderboard. TIDAK BISA DI-UNDO!`,
      confirmText: "YA, HAPUS",
      action: () => {
        fetch("/api/dapatkan_leaderboard.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_result", result_id: resultId }),
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              showNotification("SKOR DIHAPUS!", "success");
              loadLeaderboard();
            } else {
              showNotification(`ERROR: ${d.error}`, "error");
            }
          });
      },
      isDangerous: true,
    });
  };

  // ════════════════════════════════════════════════════════════
  // Delete all scores by player (across all categories)
  // ════════════════════════════════════════════════════════════
  const deleteAllPlayerScores = (playerName) => {
    if (!confirm(`Hapus SEMUA skor ${playerName} di semua kategori?\n\n⚠️ TIDAK BISA DI-UNDO!`)) return;

    fetch("/api/dapatkan_leaderboard.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_player", nama_pemain: playerName, confirm: true }),
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          showNotification("SEMUA SKOR PEMAIN DIHAPUS!", "success");
          loadLeaderboard();
        } else {
          showNotification(`ERROR: ${d.error}`, "error");
        }
      });
  };

  // ════════════════════════════════════════════════════════════
  // Reset leaderboard for specific category
  // ════════════════════════════════════════════════════════════
  const resetCategoryLeaderboard = (categoryId, categoryTitle) => {
    showConfirmDialog({
      title: "RESET LEADERBOARD KATEGORI?",
      message: `Semua skor di kategori "${categoryTitle}" akan dihapus. TIDAK BISA DI-UNDO!`,
      confirmText: "YA, RESET",
      action: () => {
        fetch("/api/dapatkan_leaderboard.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reset_category",
            tebak_lagu_id: categoryId,
            confirm: true,
          }),
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              showNotification("LEADERBOARD KATEGORI DI-RESET!", "success");
              loadLeaderboard();
            } else {
              showNotification(`ERROR: ${d.error}`, "error");
            }
          });
      },
      isDangerous: true,
    });
  };

  // ════════════════════════════════════════════════════════════
  // Reset ALL leaderboard
  // ════════════════════════════════════════════════════════════
  const resetAllLeaderboard = () => {
    showConfirmDialog({
      title: "🗑️ RESET SEMUA LEADERBOARD!",
      message: "PERINGATAN: Aksi ini akan menghapus SEMUA data leaderboard di SEMUA kategori. TIDAK BISA DI-UNDO! Lanjutkan?",
      confirmText: "🗑️ RESET SEMUA!",
      cancelText: "BATAL",
      action: () => {
        fetch("/api/dapatkan_leaderboard.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset_all", confirm: true }),
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              showNotification("🗑️ SEMUA LEADERBOARD DI-RESET!", "success");
              loadLeaderboard();
            } else {
              showNotification(`ERROR: ${d.error}`, "error");
            }
          });
      },
      isDangerous: true,
    });
  };

  const saveGenre = () => {
    if (!newGenre.trim()) return showNotification("ERROR: Nama genre tidak boleh kosong!", "error");
    fetch("/api/genre_manager.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingGenreId, nama_genre: newGenre }) })
      .then(() => { showNotification(editingGenreId ? "GENRE DIPERBARUI!" : "GENRE DITAMBAHKAN!", "success"); setNewGenre(""); setEditingGenreId(null); loadGenres(); });
  };

  const deleteGenre = (id) => {

    showConfirmDialog({
      title: "HAPUS GENRE?",
      message: "Genre ini akan dihapus secara permanen. TIDAK BISA DI-UNDO!",
      action: () => {
        fetch(`/api/genre_manager.php?id=${id}`, { method: "DELETE" })
          .then(() => {
            showNotification("GENRE DIHAPUS!", "success");
            loadGenres();
          });
      },
      isDangerous: true,
    });
  };

  const saveCategory = () => {
    fetch("/api/simpan_tebak_lagu.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: selectedCategoryId || 0, title: categoryTitle, description: categoryDescription }), credentials: "include" })
      .then(() => { showNotification(selectedCategoryId ? "KATEGORI DIPERBARUI!" : "KATEGORI DITAMBAHKAN!", "success"); loadCategories(); });
  };

  const deleteCategory = () => {
    if (!selectedCategoryId) {
      showNotification("ERROR: Pilih kategori dulu!", "error");
      return;
    }
    showConfirmDialog({
      title: "HAPUS KATEGORI?",
      message: "Menghapus kategori akan menghapus SEMUA soal yang terhubung. TIDAK BISA DI-UNDO!",
      confirmText: "YA, HAPUS SEMUA",
      action: () => {
        fetch("/api/hapus_tebak_lagu.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: selectedCategoryId }),
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            if (d.success) {
              showNotification("KATEGORI DIHAPUS!", "success");
              setSelectedCategoryId(null);
              loadCategories();
            } else {
              showNotification("ERROR: Gagal menghapus!", "error");
            }
          });
      },
      isDangerous: true,
    });
  };

  const saveSong = () => {
    if (!selectedCategoryId) return showNotification("ERROR: Pilih kategori terlebih dahulu!", "error");
    if (!editingSong.genre_id) return showNotification("ERROR: Pilih genre terlebih dahulu!", "error");
    const isEdit = editingSong.lagu_id !== 0;
    const payload = { lagu_id: editingSong.lagu_id, tebak_lagu_id: selectedCategoryId, lirik: editingSong.lirik, deezer_track_id: editingSong.deezer_track_id, preview_url: editingSong.preview_url, genre_id: editingSong.genre_id, jawaban: editingSong.jawaban };
    fetch("/api/simpan_lagu.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" })
      .then((r) => r.json()).then((d) => {
        if (d.error) throw new Error(d.error);
        showNotification(isEdit ? "SOAL DIPERBARUI!" : "SOAL DITAMBAHKAN!", "success");
        loadSongs(selectedCategoryId); setEditingSong(emptySong);
      }).catch((err) => showNotification(`ERROR: ${err.message}`, "error"));
  };

  const deleteSong = (id) => {
    showConfirmDialog({
      title: "HAPUS SOAL?",
      message: "Soal ini akan dihapus. TIDAK BISA DI-UNDO!",
      action: () => {
        fetch("/api/hapus_lagu.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lagu_id: id }),
          credentials: "include",
        })
          .then(() => {
            showNotification("SOAL DIHAPUS!", "success");
            loadSongs(selectedCategoryId);
          });
      },
      isDangerous: true,
    });
  };

  const searchDeezer = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search_deezer.php?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(await res.json());
    } catch { showNotification("ERROR: Gagal terhubung ke Deezer API", "error"); }
    finally { setSearchLoading(false); }
  };

  const selectDeezerTrack = (track) => {
    setEditingSong({ ...editingSong, deezer_track_id: track.id, preview_url: track.preview_url });
    setSearchResults([]); setSearchQuery(""); showNotification("LAGU DIPILIH!", "success");
  };

  const handleLogout = () => {
    fetch("/api/logout.php", { credentials: "include" }).then((r) => r.json()).then((d) => {
      if (d.success) { sessionStorage.removeItem("login_notified"); showNotification("LOGOUT BERHASIL!", "success"); setTimeout(() => navigate("/admin"), 1200); }
    }).catch(() => navigate("/admin"));
  };

  if (authenticated === null) return (
    <div className="min-h-screen bg-[#FFE600] font-mono flex items-center justify-center">
      <div
        className="bg-black text-[#FFE600] px-10 py-6 border-4 border-black font-black text-lg uppercase tracking-widest"
        style={{ boxShadow: "6px 6px 0px #FF2D78" }}
      >
        MEMERIKSA AKSES...
      </div>
    </div>
  );

  // ════════════════════════════════════════════════════════════
  // Filter leaderboard data
  // ════════════════════════════════════════════════════════════
  const filteredLeaderboard = filterByCategory
    ? leaderboardData.filter(row => String(row.tebak_lagu_id) === String(filterByCategory))
    : leaderboardData;

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-mono">
      <Navbar />

      {/* Notification Popup */}
      <NotificationPopup
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />

      {/* NEW: Confirmation Dialog */}
      <ConfirmationDialog
        show={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={handleConfirmDialog}
        onCancel={handleCancelDialog}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDangerous={confirmDialog.isDangerous}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div
          className="bg-[#FFE600] border-4 border-black p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          style={{ boxShadow: "8px 8px 0px #000" }}
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
              CONTROL<br /><span className="text-[#FF2D78]">CENTER</span>
            </h1>
          </div>
          <NbBtn onClick={handleLogout} color="#FF2D78" textColor="white" shadow="#FFE600">
            → LOGOUT
          </NbBtn>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-6 py-3 font-black text-xs uppercase tracking-widest border-4 border-black transition-all duration-100"
              style={{
                background: activeTab === tab.id ? tab.color : "white",
                color: "black",
                boxShadow: activeTab === tab.id ? `4px 4px 0px #000` : "none",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside>
            <div className="bg-white border-4 border-black p-4" style={{ boxShadow: "5px 5px 0px #000" }}>
              <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-3">
                <span className="text-xs font-black uppercase tracking-widest">PLAYLIST</span>
                <button
                  onClick={() => { setSelectedCategoryId(null); setActiveTab("category"); }}
                  className="text-xs font-black bg-[#FFE600] border-2 border-black px-2 py-1 hover:bg-black hover:text-[#FFE600] transition-colors"
                >
                  + NEW
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategoryId(c.id)}
                    className={`w-full text-left px-4 py-3 font-black text-xs uppercase tracking-wide border-3 border-black transition-all duration-100 ${selectedCategoryId === c.id ? "bg-black text-[#FFE600]" : "bg-white text-black hover:bg-[#FFE600]"
                      }`}
                  >
                    {c.title}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-xs text-[#aaa] font-mono py-2">Belum ada kategori.</p>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <section className="min-w-0">
            {/* KATEGORI TAB */}
            {activeTab === "category" && (
              <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #FFE600" }}>
                <div className="border-b-4 border-black pb-4 mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">KATEGORI SETTINGS</h2>
                </div>
                <div className="space-y-5">
                  <NbInput label="JUDUL KATEGORI" value={categoryTitle} onChange={(e) => setCategoryTitle(e.target.value)} placeholder="Nama kategori..." />
                  <NbTextarea label="DESKRIPSI" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} placeholder="Deskripsi kategori..." rows={3} />
                  <div className="flex gap-3 pt-2 flex-wrap">
                    <NbBtn onClick={saveCategory} color="#B8FF57" textColor="black" shadow="#000">
                      ✓ SIMPAN
                    </NbBtn>
                    {selectedCategoryId && (
                      <NbBtn onClick={deleteCategory} color="#FF2D78" textColor="white" shadow="#000">
                        ✕ HAPUS
                      </NbBtn>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* GENRE TAB */}
            {activeTab === "genres" && (
              <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #FF2D78" }}>
                <div className="border-b-4 border-black pb-4 mb-8">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">GENRE MASTER</h2>
                </div>
                <div className="flex gap-3 mb-6 flex-col sm:flex-row">
                  <input
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && saveGenre()}
                    placeholder="Nama genre baru..."
                    className="flex-1 px-4 py-3 bg-[#F5F5F0] border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors"
                  />
                  <NbBtn onClick={saveGenre} color={editingGenreId ? "#00E5FF" : "#FFE600"} textColor="black" shadow="#000">
                    {editingGenreId ? "UPDATE" : "+ TAMBAH"}
                  </NbBtn>
                </div>
                <div className="flex flex-col gap-2">
                  {genres.map((g) => (
                    <div key={g.id} className="flex justify-between items-center px-5 py-4 bg-[#F5F5F0] border-3 border-black hover:bg-[#FFE600] transition-colors group">
                      <span className="font-black text-sm uppercase">{g.nama_genre}</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setNewGenre(g.nama_genre); setEditingGenreId(g.id); }} className="text-xs font-black px-3 py-2 bg-white border-2 border-black hover:bg-[#00E5FF] transition-colors">EDIT</button>
                        <button onClick={() => deleteGenre(g.id)} className="text-xs font-black px-3 py-2 bg-white border-2 border-black hover:bg-[#FF2D78] hover:text-white transition-colors">HAPUS</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOAL TAB */}
            {activeTab === "questions" && (
              <div className="space-y-6">
                {/* Song Editor */}
                <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #00E5FF" }}>
                  <div className="flex justify-between items-start mb-8 border-b-4 border-black pb-4">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter">
                        {editingSong.lagu_id !== 0 ? "EDIT SOAL" : "TAMBAH SOAL"}
                      </h2>
                    </div>
                    <button onClick={() => setEditingSong(emptySong)} className="text-xs font-black px-3 py-2 bg-[#F5F5F0] border-2 border-black hover:bg-[#FFE600] transition-colors">
                      RESET
                    </button>
                  </div>

                  <div className="space-y-5">
                    <NbTextarea label="LIRIK LAGU" value={editingSong.lirik} onChange={(e) => setEditingSong({ ...editingSong, lirik: e.target.value })} placeholder="Ketik lirik lagu..." rows={3} />

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">PILIH GENRE</label>
                      <select
                        value={editingSong.genre_id}
                        onChange={(e) => setEditingSong({ ...editingSong, genre_id: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F5F5F0] border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors"
                      >
                        <option value="">-- PILIH GENRE --</option>
                        {genres.map((g) => <option key={g.id} value={g.id}>{g.nama_genre}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">CARI LAGU (DEEZER)</label>
                      <div className="flex gap-3 flex-col sm:flex-row">
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && searchDeezer()}
                          placeholder="Nama lagu atau artis..."
                          className="flex-1 px-4 py-3 bg-[#F5F5F0] border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors"
                        />
                        <NbBtn onClick={searchDeezer} color="#00E5FF" textColor="black" shadow="#000">
                          {searchLoading ? "SEARCHING..." : "CARI →"}
                        </NbBtn>
                      </div>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="border-4 border-black max-h-48 overflow-y-auto bg-[#F5F5F0]">
                        {searchResults.map((track) => (
                          <button
                            key={track.id}
                            onClick={() => selectDeezerTrack(track)}
                            className="w-full text-left px-5 py-3 border-b-2 border-[#ddd] hover:bg-[#FFE600] transition-colors"
                          >
                            <p className="font-black text-sm uppercase">{track.title}</p>
                            <p className="text-xs text-[#888] font-mono">{track.artist}</p>
                          </button>
                        ))}
                      </div>
                    )}

                    {editingSong.preview_url && (
                      <div className="p-4 bg-black border-4 border-black">
                        <p className="text-[#FFE600] text-xs font-black uppercase tracking-widest mb-2">// AUDIO PREVIEW</p>
                        <audio controls className="w-full h-10">
                          <source src={editingSong.preview_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-black mb-3">OPSI JAWABAN</label>
                      <div className="grid gap-3">
                        {editingSong.jawaban.map((j, i) => (
                          <div key={i} className={`flex items-center gap-3 border-4 border-black px-4 py-3 ${j.is_correct ? "bg-[#B8FF57]" : "bg-[#F5F5F0]"}`}>
                            <span className="text-xs font-black uppercase w-6 flex-shrink-0">{["A", "B", "C", "D"][i]}</span>
                            <input
                              value={j.jawaban_text}
                              onChange={(e) => {
                                const newJ = [...editingSong.jawaban];
                                newJ[i].jawaban_text = e.target.value;
                                setEditingSong({ ...editingSong, jawaban: newJ });
                              }}
                              className="flex-1 outline-none font-bold text-black text-sm bg-transparent"
                              placeholder={`Opsi ${i + 1}...`}
                            />
                            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                              <input
                                type="radio"
                                name="is_correct"
                                checked={j.is_correct}
                                onChange={() => {
                                  const newJ = editingSong.jawaban.map((ans, idx) => ({ ...ans, is_correct: idx === i }));
                                  setEditingSong({ ...editingSong, jawaban: newJ });
                                }}
                                className="w-4 h-4 cursor-pointer accent-black"
                              />
                              <span className="text-xs font-black uppercase">BENAR</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2 flex-col sm:flex-row">
                      {editingSong.lagu_id !== 0 ? (
                        <>
                          <NbBtn
                            onClick={() => {
                              const id = editingSong.lagu_id; setEditingSong(emptySong);
                              fetch("/api/hapus_lagu.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lagu_id: id }), credentials: "include" })
                                .then(() => { showNotification("SOAL DIHAPUS!", "success"); loadSongs(selectedCategoryId); });
                            }}
                            color="#FF2D78" textColor="white" shadow="#000" className="flex-1 justify-center"
                          >
                            ✕ HAPUS SOAL
                          </NbBtn>
                          <NbBtn onClick={saveSong} color="#00E5FF" textColor="black" shadow="#000" className="flex-1 justify-center">
                            ✓ UPDATE SOAL
                          </NbBtn>
                        </>
                      ) : (
                        <NbBtn onClick={saveSong} color="#B8FF57" textColor="black" shadow="#000" className="w-full justify-center">
                          + TAMBAH SOAL BARU
                        </NbBtn>
                      )}
                    </div>
                  </div>
                </div>

                {/* Song List */}
                <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #FFE600" }}>
                  <div className="border-b-4 border-black pb-4 mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      SOAL SAAT INI <span className="text-[#FF2D78]">({songs.length})</span>
                    </h2>
                  </div>
                  {songs.length === 0 ? (
                    <div className="text-center py-12 border-4 border-dashed border-[#ccc]">
                      <p className="text-[#aaa] font-black uppercase tracking-widest">BELUM ADA SOAL</p>
                      <p className="text-xs text-[#bbb] font-mono mt-2">Tambah soal baru di atas</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {songs.map((s, idx) => (
                        <div key={s.id} className="flex justify-between items-center px-5 py-4 bg-[#F5F5F0] border-3 border-black hover:bg-[#FFE600] transition-colors group">
                          <div className="flex items-center gap-4 min-w-0">
                            <span className="text-xs font-black text-[#aaa] flex-shrink-0 font-mono">#{String(idx + 1).padStart(2, "0")}</span>
                            <p className="font-bold text-sm italic truncate">"{s.lirik}"</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0 ml-4">
                            <button
                              onClick={() => {
                                setEditingSong({ lagu_id: s.id, lirik: s.lirik, deezer_track_id: s.deezer_track_id, preview_url: s.preview_url, genre_id: s.genre_id || "", jawaban: s.jawaban });
                                setActiveTab("questions");
                              }}
                              className="text-xs font-black px-3 py-2 bg-white border-2 border-black hover:bg-[#00E5FF] transition-colors"
                            >
                              EDIT
                            </button>
                            <button onClick={() => deleteSong(s.id)} className="text-xs font-black px-3 py-2 bg-white border-2 border-black hover:bg-[#FF2D78] hover:text-white transition-colors">
                              HAPUS
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEADERBOARD TAB */}
            {activeTab === "leaderboard" && (
              <div className="space-y-6">
                {/* Leaderboard Manager */}
                <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #B8FF57" }}>
                  <div className="border-b-4 border-black pb-4 mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      LEADERBOARD MANAGER
                    </h2>
                  </div>

                  {/* Filter & Actions */}
                  <div className="flex flex-col gap-4 mb-6">
                    {/* Filter by category */}
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">FILTER KATEGORI</label>
                      <select
                        value={filterByCategory}
                        onChange={(e) => setFilterByCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-[#F5F5F0] border-4 border-black font-bold text-black text-sm outline-none focus:bg-[#FFE600] transition-colors"
                      >
                        <option value="">-- SEMUA KATEGORI --</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>

                    {/* Reset buttons */}
                    <div className="flex gap-3 flex-col sm:flex-row flex-wrap">
                      <NbBtn
                        onClick={() => resetAllLeaderboard()}
                        color="#FF2D78"
                        textColor="white"
                        shadow="#000"
                        className="flex-1"
                      >
                        🗑️ RESET SEMUA LEADERBOARD
                      </NbBtn>
                      {filterByCategory && (
                        <NbBtn
                          onClick={() => {
                            const cat = categories.find(c => String(c.id) === String(filterByCategory));
                            resetCategoryLeaderboard(filterByCategory, cat?.title);
                          }}
                          color="#FF7A00"
                          textColor="white"
                          shadow="#000"
                          className="flex-1"
                        >
                          🗑️ RESET KATEGORI INI
                        </NbBtn>
                      )}
                    </div>
                  </div>

                  {/* Leaderboard data table */}
                  {leaderboardLoading ? (
                    <div className="text-center py-12">
                      <p className="font-black text-[#aaa] uppercase">MEMUAT DATA...</p>
                    </div>
                  ) : filteredLeaderboard.length === 0 ? (
                    <div className="text-center py-12 border-4 border-dashed border-[#ccc]">
                      <p className="text-[#aaa] font-black uppercase tracking-widest">BELUM ADA DATA</p>
                      <p className="text-xs text-[#bbb] font-mono mt-2">Belum ada pemain yang menyimpan skor</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-4 border-black">
                            <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest bg-[#F5F5F0]">PEMAIN</th>
                            <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest bg-[#F5F5F0]">KATEGORI</th>
                            <th className="text-center px-4 py-3 font-black text-xs uppercase tracking-widest bg-[#F5F5F0]">SKOR</th>
                            <th className="text-left px-4 py-3 font-black text-xs uppercase tracking-widest bg-[#F5F5F0]">TANGGAL</th>
                            <th className="text-center px-4 py-3 font-black text-xs uppercase tracking-widest bg-[#F5F5F0]">AKSI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeaderboard.map((row, idx) => {
                            const uniquePlayers = new Set(filteredLeaderboard.map(r => r.nama_pemain));
                            const isLastOfPlayer = idx === filteredLeaderboard.length - 1 ||
                              filteredLeaderboard[idx + 1]?.nama_pemain !== row.nama_pemain;

                            return (
                              <tr key={`${row.id}-${idx}`} className="border-b-2 border-[#ddd] hover:bg-[#FFE600] transition-colors">
                                <td className="px-4 py-3 font-black text-sm">{row.nama_pemain}</td>
                                <td className="px-4 py-3 text-xs text-[#666]">{row.tebak_lagu_title || "-"}</td>
                                <td className="px-4 py-3 text-center font-black text-lg">{row.skor}/{row.total}</td>
                                <td className="px-4 py-3 text-xs text-[#888]">{row.dimainkan_pada}</td>
                                <td className="px-4 py-3 text-center space-y-1">
                                  <button
                                    onClick={() => deleteLeaderboardEntry(row.id, row.nama_pemain)}
                                    className="text-xs font-black px-2 py-1 bg-[#FF2D78] text-white border-2 border-black hover:bg-black transition-colors block w-full"
                                  >
                                    HAPUS
                                  </button>
                                  {isLastOfPlayer && (
                                    <button
                                      onClick={() => deleteAllPlayerScores(row.nama_pemain)}
                                      className="text-xs font-black px-2 py-1 bg-[#FF7A00] text-white border-2 border-black hover:bg-black transition-colors block w-full"
                                    >
                                      HAPUS SEMUA
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t-4 border-black flex flex-wrap gap-3">
                    <div className="flex-1 min-w-fit bg-[#FFE600] border-4 border-black p-4" style={{ boxShadow: "3px 3px 0px #000" }}>
                      <p className="text-xs font-black uppercase tracking-widest text-[#888]">TOTAL RECORDS</p>
                      <p className="text-3xl font-black">{filteredLeaderboard.length}</p>
                    </div>
                    <div className="flex-1 min-w-fit bg-[#B8FF57] border-4 border-black p-4" style={{ boxShadow: "3px 3px 0px #000" }}>
                      <p className="text-xs font-black uppercase tracking-widest text-[#888]">UNIQUE PLAYERS</p>
                      <p className="text-3xl font-black">{new Set(filteredLeaderboard.map(r => r.nama_pemain)).size}</p>
                    </div>
                    <div className="flex-1 min-w-fit bg-[#00E5FF] border-4 border-black p-4" style={{ boxShadow: "3px 3px 0px #000" }}>
                      <p className="text-xs font-black uppercase tracking-widest text-[#888]">AVG SCORE</p>
                      <p className="text-3xl font-black">
                        {filteredLeaderboard.length > 0
                          ? Math.round(filteredLeaderboard.reduce((sum, r) => sum + r.skor, 0) / filteredLeaderboard.length)
                          : 0
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}