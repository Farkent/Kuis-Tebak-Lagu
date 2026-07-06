// Home.jsx - NEOBRUTALISM
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { apiUrl } from "../api";

// Neobrutalism card accent colors (bg, border accent, text accent)
const CARD_COLORS = [
  { bg: "#FFE600", accent: "#FF2D78", label: "#000" },
  { bg: "#FF2D78", accent: "#FFE600", label: "#fff" },
  { bg: "#00E5FF", accent: "#000", label: "#000" },
  { bg: "#B8FF57", accent: "#000", label: "#000" },
  { bg: "#FF7A00", accent: "#000", label: "#000" },
  { bg: "#C084FC", accent: "#000", label: "#000" },
];

export default function Home() {
  const [tebakLagu, setTebakLagu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/dapatkan_tebak_lagu.php"))
      .then((res) => res.json())
      .then((data) => setTebakLagu(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white font-mono">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="border-b-4 border-black bg-[#FFE600] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div
              className="inline-block bg-black text-[#FFE600] text-xs font-black uppercase tracking-widest px-4 py-2 mb-6"
              style={{ boxShadow: "4px 4px 0px #FF2D78" }}
            >
              🎵 MUSIC QUIZ BATTLE — 2026
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black uppercase leading-none tracking-tighter text-black mb-6">
              GUESS<br />
              <span
                className="text-white bg-black px-2"
                style={{ WebkitTextStroke: "2px #FF2D78" }}
              >
                THE
              </span>
              <br />
              <span className="text-[#FF2D78]">BEAT.</span>
            </h1>

            <p className="text-black text-lg font-bold uppercase tracking-wide mb-8 max-w-md border-l-4 border-black pl-4">
              Dengarkan lirik, tebak lagu, dan naik di papan peringkat. Uji pengetahuan musik kamu sekarang!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/tebak-lagu/1"
                className="inline-block bg-black text-[#FFE600] font-black text-sm uppercase tracking-widest px-8 py-4 border-4 border-black hover:bg-[#FF2D78] hover:text-white transition-colors duration-100"
                style={{ boxShadow: "6px 6px 0px #FF2D78" }}
              >
                ⚡ MULAI BATTLE
              </Link>
              <Link
                to="/leaderboard"
                className="inline-block bg-white text-black font-black text-sm uppercase tracking-widest px-8 py-4 border-4 border-black hover:bg-black hover:text-white transition-colors duration-100"
                style={{ boxShadow: "6px 6px 0px #000" }}
              >
                🏆 LEADERBOARD
              </Link>
            </div>
          </div>

          {/* Right — Stats Panel */}
          <div className="flex flex-col gap-4 lg:ml-auto lg:max-w-sm w-full">
            {/* Stat Block */}
            {[
              { label: "TOP SCORE", value: "2500 PTS", color: "#FF2D78" },
              { label: "TOTAL SOAL", value: "100+ LAGU", color: "#00E5FF" },
              { label: "TRENDING", value: "POP GENRE", color: "#B8FF57" },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white border-4 border-black flex items-center gap-4 px-6 py-4"
                style={{ boxShadow: `5px 5px 0px ${s.color}` }}
              >
                <div className="w-3 h-3 rounded-full border-2 border-black" style={{ background: s.color }} />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#888]">{s.label}</p>
                  <p className="text-2xl font-black uppercase text-black">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── KATEGORI ─── */}
      <section className="border-b-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10 border-b-4 border-black pb-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#888] mb-2"></p>
              <h2 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter text-black">
                PILIH<br /><span className="text-[#FF2D78]">GENRE</span>
              </h2>
            </div>
            <div
              className="hidden sm:flex bg-black text-[#FFE600] font-black text-xs uppercase tracking-widest px-4 py-2 items-center gap-2"
              style={{ boxShadow: "4px 4px 0px #FFE600" }}
            >
              🎮 {loading ? "..." : tebakLagu.length} KATEGORI
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-[#f0f0f0] border-4 border-[#ccc] animate-pulse"
                  style={{ boxShadow: "5px 5px 0px #ccc" }}
                />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tebakLagu.map((tl, idx) => {
                const col = CARD_COLORS[idx % CARD_COLORS.length];
                return (
                  <Link
                    key={tl.id}
                    to={`/tebak-lagu/${tl.id}`}
                    className="group relative flex flex-col justify-between p-8 border-4 border-black h-52 overflow-hidden transition-transform duration-100 hover:-translate-y-1 hover:-translate-x-1 active:translate-y-0 active:translate-x-0"
                    style={{
                      background: col.bg,
                      boxShadow: `6px 6px 0px #000`,
                    }}
                  >
                    {/* Badge */}
                    <div className="flex justify-between items-start">
                      <span
                        className="text-xs font-black uppercase tracking-widest border-2 border-black px-2 py-1"
                        style={{ background: col.accent === "#000" ? "#000" : col.accent, color: col.accent === "#000" ? col.bg : "#000" }}
                      >
                        #{String(tl.id).padStart(2, "0")}
                      </span>
                      <span className="text-2xl">♪</span>
                    </div>

                    {/* Content */}
                    <div>
                      <h3
                        className="text-3xl font-black uppercase tracking-tighter leading-tight mb-1"
                        style={{ color: col.label }}
                      >
                        {tl.title}
                      </h3>
                      <p
                        className="text-xs font-bold uppercase tracking-wide opacity-70 line-clamp-1"
                        style={{ color: col.label }}
                      >
                        {tl.description}
                      </p>
                    </div>

                    {/* CTA Arrow */}
                    <div
                      className="absolute bottom-4 right-4 w-10 h-10 bg-black flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform"
                    >
                      →
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="border-b-4 border-black bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10 border-b-4 border-[#333] pb-6">
            <p className="text-[#555] text-xs font-black uppercase tracking-widest mb-2"></p>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-[#FFE600]">
              KENAPA<br /><span className="text-white">PILIH KAMI?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: "🎯", title: "SERU & ADIKTIF", desc: "Gamifikasi penuh dengan skor, combo, dan streak beruntun", color: "#FF2D78" },
              { icon: "🎵", title: "MUSIK REAL", desc: "Preview audio asli dari Deezer untuk setiap soal lagu", color: "#00E5FF" },
              { icon: "🏆", title: "KOMPETISI", desc: "Naik peringkat dan dominasi papan leaderboard global", color: "#B8FF57" },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-[#111] border-4 p-8 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-100 cursor-default"
                style={{ borderColor: f.color, boxShadow: `6px 6px 0px ${f.color}` }}
              >
                <p className="text-4xl mb-6">{f.icon}</p>
                <h3
                  className="text-2xl font-black uppercase tracking-tight mb-3"
                  style={{ color: f.color }}
                >
                  {f.title}
                </h3>
                <p className="text-[#aaa] font-bold text-sm leading-relaxed uppercase tracking-wide">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}