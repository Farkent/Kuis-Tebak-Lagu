// Result.jsx - NEOBRUTALISM (FIXED: Better response handling)
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationPopup from "../components/NotificationPopup";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const GENRE_COLORS = ["#FFE600", "#FF2D78", "#00E5FF", "#B8FF57", "#FF7A00", "#C084FC"];

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [nama, setNama] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const scoreAkhir = state.score || 0;
  const totalSoal = state.total || 0;
  const akurasiPct = totalSoal > 0 ? Math.round((scoreAkhir / totalSoal) * 100) : 0;

  const performance =
    akurasiPct >= 80 ? { label: "SEMPURNA!", color: "#B8FF57", textColor: "black" } :
    akurasiPct >= 60 ? { label: "HEBAT!", color: "#FFE600", textColor: "black" } :
    akurasiPct >= 40 ? { label: "BAGUS!", color: "#00E5FF", textColor: "black" } :
    { label: "TERUS BELAJAR!", color: "#FF2D78", textColor: "white" };

  const genreData = state.correctGenres
    ? Object.entries(state.correctGenres).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
    : [];

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  useEffect(() => {
    if (!state || !state.tebakLaguId) navigate("/");
  }, [navigate, state]);

  const saveResult = () => {
    const trimmedName = nama.trim();
    
    // Validasi nama kosong
    if (!trimmedName) { 
      showNotification("ERROR: Masukkan nama dulu!", "error"); 
      return; 
    }
    
    // Validasi nama unik (harus ada angka atau simbol)
    if (!/[_*0-9]/.test(trimmedName)) {
      showNotification("ERROR: Nama harus mengandung angka atau simbol unik (_ atau *)!", "error");
      return;
    }
    
    setLoading(true);
    
    fetch("/api/simpan_hasil.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        nama: trimmedName, 
        tebak_lagu_id: state.tebakLaguId, 
        skor: scoreAkhir, 
        total: totalSoal 
      }),
    })
      .then((r) => {
        // Check jika response OK
        if (!r.ok) {
          throw new Error(`HTTP Error: ${r.status}`);
        }
        return r.json();
      })
      .then((data) => {
        console.log("Response dari server:", data);
        
        // ❌ Error response (ada field 'error')
        if (data.error) {
          showNotification(`ERROR: ${data.error}`, "error");
          setSubmitted(false);
          return;
        }
        
        // ⚠️ Success tapi skor tidak diganti (skor lama lebih tinggi)
        if (data.success === true && data.updated === false) {
          showNotification(
            `SKOR TIDAK DIGANTI: Skor sebelumnya (${data.previous}) lebih tinggi!`,
            "warning"
          );
          setSubmitted(true);
          return;
        }
        
        // ✅ Success - skor tersimpan atau diperbarui
        if (data.success === true && data.updated === true) {
          showNotification(
            "✓ SKOR TERSIMPAN! MASUK LEADERBOARD!",
            "success"
          );
          setSubmitted(true);
          return;
        }
        
        // Default success (jika response.success = true tapi tidak ada updated field)
        if (data.success === true) {
          showNotification(
            "✓ SKOR TERSIMPAN! MASUK LEADERBOARD!",
            "success"
          );
          setSubmitted(true);
          return;
        }
        
        // Jika tidak match kondisi apapun
        showNotification(
          "ERROR: Respons server tidak valid",
          "error"
        );
      })
      .catch((err) => {
        console.error("Error detail:", err);
        showNotification(
          `ERROR: Gagal terhubung ke server. ${err.message}`,
          "error"
        );
        setSubmitted(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* ─── PERFORMANCE HEADER ─── */}
        <div
          className="border-4 border-black mb-8 overflow-hidden"
          style={{ boxShadow: "8px 8px 0px #000" }}
        >
          {/* Performance strip */}
          <div
            className="px-8 py-6 border-b-4 border-black"
            style={{ background: performance.color }}
          >
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter" style={{ color: performance.textColor }}>
              {performance.label}
            </h1>
          </div>

          {/* Scores Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-white">
            {[
              { label: "SKOR AKHIR", value: scoreAkhir, sub: `/ ${totalSoal}`, bg: "#FFE600" },
              { label: "AKURASI", value: `${akurasiPct}%`, sub: "JAWABAN BENAR", bg: "#00E5FF" },
              { label: "MAX COMBO", value: `${state.combo || 0}x`, sub: "COMBO", bg: "#FF2D78", text: "white" },
              { label: "STREAK", value: state.streak || 0, sub: "BERUNTUN", bg: "#B8FF57" },
            ].map((s, i) => (
              <div
                key={i}
                className="border-r-4 border-b-4 border-black last:border-r-0 p-6 text-center"
                style={{ background: "white" }}
              >
                <p className="text-xs font-black uppercase tracking-widest text-[#888] mb-2">{s.label}</p>
                <div
                  className="inline-block px-4 py-2 border-4 border-black mb-2"
                  style={{ background: s.bg }}
                >
                  <p className="text-3xl sm:text-4xl font-black" style={{ color: s.text || "black" }}>{s.value}</p>
                </div>
                <p className="text-xs font-bold uppercase text-[#aaa]">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── MAIN CONTENT GRID ─── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Save Score */}
          <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #FFE600" }}>
            <div className="border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">MASUK LEADERBOARD</h2>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">NAMA PEMAIN</label>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={submitted}
                placeholder="Contoh: CHANDRA_01 atau CHANDRA*9"
                onKeyPress={(e) => e.key === "Enter" && !loading && saveResult()}
                className="w-full px-4 py-4 bg-[#F5F5F0] border-4 border-black font-black text-black text-sm outline-none focus:bg-[#FFE600] transition-colors disabled:opacity-40 placeholder:font-normal placeholder:text-[#bbb]"
              />
            </div>

            <button
              onClick={saveResult}
              disabled={submitted || loading}
              className="w-full font-black text-sm uppercase tracking-widest py-4 border-4 border-black transition-all duration-100 disabled:opacity-40"
              style={{
                background: submitted ? "#B8FF57" : "#000",
                color: submitted ? "black" : "#FFE600",
                boxShadow: submitted ? "none" : "5px 5px 0px #FFE600",
              }}
            >
              {loading ? "MENYIMPAN..." : submitted ? "✓ TERSIMPAN!" : "→ SIMPAN SKOR"}
            </button>

            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-[#555] mt-3">
              Gunakan angka atau simbol unik (_ atau *) untuk menghindari nama yang sama.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {[
              { label: "MAIN LAGI", icon: "↺", bg: "#B8FF57", shadow: "#000", action: () => navigate(`/tebak-lagu/${state.tebakLaguId}`) },
              { label: "LIHAT LEADERBOARD", icon: "⬆", bg: "#FFE600", shadow: "#000", action: () => navigate(`/leaderboard?tebak_lagu_id=${state.tebakLaguId}`) },
              { label: "KEMBALI KE HOME", icon: "←", bg: "white", shadow: "#000", action: () => navigate("/") },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                className="w-full flex items-center gap-4 px-6 py-4 border-4 border-black font-black text-sm uppercase tracking-widest transition-all duration-100 hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0 text-black"
                style={{ background: btn.bg, boxShadow: `5px 5px 0px ${btn.shadow}` }}
              >
                <span className="w-8 h-8 bg-black text-[#FFE600] flex items-center justify-center font-black text-base border-2 border-black flex-shrink-0">
                  {btn.icon}
                </span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ─── STATS + GENRE DNA ─── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Statistik Detail */}
          <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #FF2D78" }}>
            <div className="border-b-4 border-black pb-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tighter">STATISTIK DETAIL</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "TOTAL SOAL", value: totalSoal, bar: 100, color: "#FFE600" },
                { label: "JAWABAN BENAR", value: scoreAkhir, bar: akurasiPct, color: "#B8FF57" },
                { label: "JAWABAN SALAH", value: totalSoal - scoreAkhir, bar: ((totalSoal - scoreAkhir) / totalSoal) * 100, color: "#FF2D78" },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                    <span
                      className="font-black text-lg px-3 py-1 border-3 border-black"
                      style={{ background: stat.color }}
                    >
                      {stat.value}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-[#F0F0F0] border-2 border-black">
                    <div
                      className="h-full border-r-2 border-black transition-all duration-700"
                      style={{ width: `${Math.min(stat.bar, 100)}%`, background: stat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre DNA */}
          {genreData.length > 0 ? (
            <div className="bg-white border-4 border-black p-8" style={{ boxShadow: "6px 6px 0px #00E5FF" }}>
              <div className="border-b-4 border-black pb-4 mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">MUSIC DNA</h2>
              </div>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genreData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" animationBegin={0} animationDuration={700}>
                      {genreData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={GENRE_COLORS[index % GENRE_COLORS.length]} stroke="#000" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontFamily: "monospace", fontWeight: "bold", border: "3px solid black", borderRadius: 0 }} />
                    <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div
                className="mt-4 px-4 py-3 border-4 border-black bg-[#FFE600]"
              >
                <p className="text-xs font-black uppercase tracking-widest">
                  GENRE FAVORIT: <span className="text-[#FF2D78]">{genreData[0]?.name}</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#F0F0F0] border-4 border-[#ccc] border-dashed p-8 flex items-center justify-center">
              <p className="text-[#aaa] font-black uppercase tracking-widest text-center text-sm">TIDAK ADA DATA GENRE</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}