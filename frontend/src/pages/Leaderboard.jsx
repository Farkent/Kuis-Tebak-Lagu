// Leaderboard.jsx - NEOBRUTALISM
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RANK_STYLES = {
  1: { bg: "#FFE600", shadow: "#FF2D78", label: "#1", icon: "♛" },
  2: { bg: "#E0E0E0", shadow: "#000", label: "#2", icon: "♜" },
  3: { bg: "#FF7A00", shadow: "#000", label: "#3", icon: "♞" },
};

export default function Leaderboard() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tebakLaguTitle, setTebakLaguTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const tebakLaguId = searchParams.get("tebak_lagu_id") || 0;

  useEffect(() => {
    fetch("/api/dapatkan_tebak_lagu.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error("Gagal mengambil kategori:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = `/api/dapatkan_leaderboard.php?tebak_lagu_id=${tebakLaguId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setResults(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tebakLaguId]);

  useEffect(() => {
    if (tebakLaguId && categories.length > 0) {
      const activeCat = categories.find((c) => String(c.id) === String(tebakLaguId));
      setTebakLaguTitle(activeCat ? activeCat.title : "");
    } else {
      setTebakLaguTitle("");
    }
  }, [tebakLaguId, categories]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] font-mono">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* ─── HEADER ─── */}
        <div
          className="bg-[#FFE600] border-4 border-black mb-8 overflow-hidden"
          style={{ boxShadow: "8px 8px 0px #FF2D78" }}
        >
          {/* Title */}
          <div className="px-8 py-8 border-b-4 border-black">
            <p className="text-xs font-black uppercase tracking-widest text-[#888] mb-2"></p>
            <h1 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-black leading-none">
              PAPAN<br /><span className="text-[#FF2D78]">PERINGKAT</span>
            </h1>
          </div>
          {/* Sub info */}
          <div className="px-8 py-4 bg-black flex items-center justify-between flex-wrap gap-3">
            <span className="text-[#FFE600] font-black text-xs uppercase tracking-widest">
              {tebakLaguTitle ? `// ${tebakLaguTitle.toUpperCase()}` : ""}
            </span>
            <span className="text-[#555] font-mono text-xs uppercase tracking-widest">
              {loading ? "LOADING..." : `${results.length} PEMAIN TERDAFTAR`}
            </span>
          </div>
        </div>

        {/* ─── FILTER / NAV ─── */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
          <Link
            to="/leaderboard"
            className="flex-shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest border-4 border-[#FFE600] transition-all"
            style={{
              background: !tebakLaguId ? "#FFE600" : "transparent",
              color: !tebakLaguId ? "black" : "#FFE600",
              boxShadow: !tebakLaguId ? "3px 3px 0px #FF2D78" : "none",
            }}
          >
            SEMUA
          </Link>
          {categories.map((cat) => {
            const isActive = String(tebakLaguId) === String(cat.id);
            return (
              <Link
                key={cat.id}
                to={`/leaderboard?tebak_lagu_id=${cat.id}`}
                className="flex-shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest border-4 border-[#FFE600] transition-all"
                style={{
                  background: isActive ? "#FFE600" : "transparent",
                  color: isActive ? "black" : "#FFE600",
                  boxShadow: isActive ? "3px 3px 0px #FF2D78" : "none",
                }}
              >
                {cat.title}
              </Link>
            );
          })}
          <Link
            to="/"
            className="flex-shrink-0 px-5 py-3 font-black text-xs uppercase tracking-widest border-4 border-[#555] text-[#555] hover:border-[#FFE600] hover:text-[#FFE600] transition-all"
          >
            ← MAIN LAGI
          </Link>
        </div>

        {/* ─── STATES ─── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div
              className="bg-[#FFE600] border-4 border-black px-10 py-6 flex items-center gap-4"
              style={{ boxShadow: "6px 6px 0px #000" }}
            >
              <div className="w-8 h-8 border-4 border-black border-t-[#FF2D78] rounded-full animate-spin" />
              <span className="font-black text-sm uppercase tracking-widest">MENYUSUN PERINGKAT...</span>
            </div>
          </div>
        ) : error ? (
          <div
            className="bg-[#FF2D78] border-4 border-white p-10 text-center"
            style={{ boxShadow: "6px 6px 0px #fff" }}
          >
            <p className="text-white font-black text-xl uppercase mb-2">ERROR</p>
            <p className="text-white/70 font-mono text-sm">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="border-4 border-dashed border-[#444] p-20 text-center">
            <p className="text-[#555] font-black text-xl uppercase tracking-widest mb-2">BELUM ADA HASIL</p>
            <p className="text-[#333] text-sm font-mono">Jadilah yang pertama mengukir nama di sini!</p>
            <Link
              to="/"
              className="inline-block mt-6 bg-[#FFE600] border-4 border-[#FFE600] text-black font-black text-xs uppercase tracking-widest px-6 py-3 hover:bg-black hover:text-[#FFE600] transition-colors"
              style={{ boxShadow: "4px 4px 0px #FF2D78" }}
            >
              MULAI BERMAIN →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Top 3 Podium (visual emphasis) */}
            {results.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 0, 2].map((podiumIdx) => {
                  const r = results[podiumIdx];
                  if (!r) return <div key={podiumIdx} />;
                  const rank = podiumIdx + 1;
                  const style = RANK_STYLES[rank];
                  const heights = { 0: "h-28", 1: "h-36", 2: "h-24" }; // 2nd, 1st, 3rd
                  const heightClass = podiumIdx === 0 ? "h-28" : podiumIdx === 1 ? "h-36" : "h-24";
                  return (
                    <div key={podiumIdx} className="flex flex-col items-center gap-2">
                      {/* Card */}
                      <div
                        className="w-full border-4 border-black p-4 text-center"
                        style={{ background: style.bg, boxShadow: `4px 4px 0px ${style.shadow}` }}
                      >
                        <p className="text-2xl font-black">{style.icon}</p>
                        <p className="font-black text-xs uppercase tracking-wide leading-tight mt-1 truncate">{r.nama_pemain}</p>
                        <p className="font-black text-lg mt-1">{r.skor}</p>
                        <p className="text-xs font-mono text-[#555]">pts</p>
                      </div>
                      {/* Podium block */}
                      <div
                        className={`w-full border-4 border-black flex items-center justify-center font-black text-[#FFE600] text-sm ${heightClass}`}
                        style={{ background: "black" }}
                      >
                        #{rank}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            {results.map((result, index) => {
              const rank = index + 1;
              const rankStyle = RANK_STYLES[rank];
              const isTop3 = rank <= 3;
              const scoreBarPct = result.total > 0 ? Math.min((result.skor / result.total) * 100, 100) : 0;

              return (
                <div
                  key={`${result.nama_pemain}-${index}`}
                  className="flex items-center gap-4 border-4 border-black px-5 py-4 transition-all duration-100 hover:-translate-x-1 hover:-translate-y-1"
                  style={{
                    background: isTop3 ? rankStyle.bg : rank % 2 === 0 ? "#111" : "#1a1a1a",
                    boxShadow: isTop3 ? `5px 5px 0px ${rankStyle.shadow}` : "4px 4px 0px #333",
                    color: isTop3 ? "black" : "white",
                  }}
                >
                  {/* Rank Badge */}
                  <div
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-4 border-black font-black text-lg"
                    style={{
                      background: isTop3 ? "black" : "#333",
                      color: isTop3 ? rankStyle.bg : "#FFE600",
                    }}
                  >
                    {rank}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-base sm:text-lg uppercase tracking-tight truncate ${isTop3 ? "text-black" : "text-white"}`}>
                      {result.nama_pemain}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className="text-xs font-black uppercase tracking-widest px-2 py-0.5 border-2 border-black"
                        style={{ background: isTop3 ? "black" : "#FFE600", color: isTop3 ? rankStyle.bg : "black" }}
                      >
                        {result.tebak_lagu_title || "MUSIC QUIZ"}
                      </span>
                      <span className={`text-xs font-mono ${isTop3 ? "text-[#555]" : "text-[#555]"}`}>
                        {result.dimainkan_pada}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="mt-2 w-full max-w-xs h-2 bg-black/20 border border-black/20">
                      <div
                        className="h-full border-r border-black transition-all duration-700"
                        style={{
                          width: `${scoreBarPct}%`,
                          background: isTop3 ? "black" : "#FFE600",
                        }}
                      />
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-black text-2xl sm:text-3xl font-mono"
                      style={{ color: isTop3 ? "black" : "#FFE600" }}
                    >
                      {result.skor}
                    </p>
                    <p className={`text-xs font-mono ${isTop3 ? "text-[#555]" : "text-[#555]"}`}>
                      / {result.total} pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}