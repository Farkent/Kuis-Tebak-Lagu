// TebakLagu.jsx - NEOBRUTALISM (UPDATED: Shuffled questions + Shuffled answers per soal)
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationPopup from "../components/NotificationPopup";
import { apiUrl } from "../api";

const MAX_CORRECTION_TIME = 30; // Max 30 detik untuk audio correction

export default function TebakLagu() {
  const { tebakLaguId } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const [lagu, setLagu] = useState([]);
  const [title, setTitle] = useState("");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [correctGenres, setCorrectGenres] = useState({});
  const [playingCorrection, setPlayingCorrection] = useState(false);
  const [correctionTimeLeft, setCorrectionTimeLeft] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [shuffledAnswers, setShuffledAnswers] = useState([]); // jawaban teracak per soal
  const audioVolumeRef = useRef(1);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // ═══════════════════════════════════════════════════════════════
  // Fisher-Yates shuffle untuk acak array
  // ═══════════════════════════════════════════════════════════════
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ═══════════════════════════════════════════════════════════════
  // Load data
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resLagu = await fetch(apiUrl(`/dapatkan_lagu.php?tebak_lagu_id=${tebakLaguId}`));
        const dataLagu = await resLagu.json();

        // Acak urutan soal
        const shuffledSongs = shuffleArray(dataLagu);
        setLagu(shuffledSongs);

        // Acak jawaban tiap soal (disimpan terpisah agar stabil saat re-render)
        const answersPerSong = shuffledSongs.map((song) =>
          shuffleArray(song.jawaban || [])
        );
        setShuffledAnswers(answersPerSong);

        const resCat = await fetch(apiUrl(`/dapatkan_tebak_lagu.php`));
        const dataCat = await resCat.json();
        const cat = dataCat.find((item) => String(item.id) === String(tebakLaguId));
        if (cat) setTitle(cat.title);
      } catch (err) {
        console.error("Fetch error:", err);
        showNotification("ERROR: Gagal memuat soal! Silakan refresh halaman.", "error");
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [tebakLaguId]);

  // ═══════════════════════════════════════════════════════════════
  // EFFECT: Countdown timer saat audio sedang playing
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loading || lagu.length === 0 || selectedAnswer === null) return;

    const correctionTimer = setInterval(() => {
      setCorrectionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(correctionTimer);
          handleNext(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(correctionTimer);
  }, [current, selectedAnswer, loading, lagu.length]);

  // ═══════════════════════════════════════════════════════════════
  // EFFECT: Load audio src saat soal berubah
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!loading && lagu.length > 0 && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioVolumeRef.current = 1;
      audioRef.current.src = lagu[current]?.preview_url || "";
      setAudioEnded(false);
    }
  }, [current, loading, lagu.length]);

  // ═══════════════════════════════════════════════════════════════
  // EFFECT: Countdown timer untuk soal (20 detik sebelum jawab)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (loading || lagu.length === 0 || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleNext(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [current, selectedAnswer, loading, lagu.length]);

  // ═══════════════════════════════════════════════════════════════
  // Lanjut ke soal berikutnya
  // ═══════════════════════════════════════════════════════════════
  const handleNext = (answered = true) => {
    if (current >= lagu.length - 1) {
      // Last question - navigate to result
      navigate("/result", {
        state: {
          tebakLaguId,
          score,
          total: lagu.length,
          tebakLaguTitle: title || "Tebak Lagu",
          correctGenres,
          combo,
          streak
        }
      });
    } else {
      // Next question
      setCurrent(current + 1);
      setSelectedAnswer(null);
      setTimeLeft(20);
      setCorrectionTimeLeft(0);
      setFeedback(null);
      setPlayingCorrection(false);
      setAudioEnded(false);
      audioVolumeRef.current = 1;

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1;
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // User pilih jawaban
  // ═══════════════════════════════════════════════════════════════
  const handleSelect = (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);

    // Check apakah jawaban benar atau salah
    if (answer.is_correct) {
      setScore(score + 1);
      setCombo(combo + 1);
      setStreak(streak + 1);
      setFeedback({ type: "correct" });

      // Track genre untuk stats
      const genreName = lagu[current]?.nama_genre || "Lainnya";
      setCorrectGenres(prev => ({ ...prev, [genreName]: (prev[genreName] || 0) + 1 }));
    }

    // Start audio playback untuk correction
    setPlayingCorrection(true);
    setCorrectionTimeLeft(MAX_CORRECTION_TIME);
    setAudioEnded(false);

    if (audioRef.current) {
      audioRef.current.src = lagu[current]?.preview_url || "";
      audioVolumeRef.current = 1;
      audioRef.current.volume = 1;
      audioRef.current.currentTime = 0;
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.error("Audio play error:", err);
        setAudioEnded(true);
      });
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // Audio event: Ketika audio selesai diputar
  // ═══════════════════════════════════════════════════════════════
  const handleAudioEnded = () => {
    setAudioEnded(true);
  };

  // ═══════════════════════════════════════════════════════════════
  // User klik button skip untuk lanjut soal berikutnya
  // ═══════════════════════════════════════════════════════════════
  const handleSkipToNext = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.volume = 1;
    }
    setCorrectionTimeLeft(0);
    handleNext(true);
  };

  const ANSWER_LABELS = ["A", "B", "C", "D"];

  // ═══════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════
  if (loading) return (
    <div className="min-h-screen bg-[#FFE600] font-mono flex items-center justify-center">
      <div
        className="bg-black text-[#FFE600] px-10 py-6 border-4 border-black font-black text-lg uppercase tracking-widest text-center"
        style={{ boxShadow: "6px 6px 0px #FF2D78" }}
      >
        <div className="w-8 h-8 border-4 border-[#FFE600] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        MEMUAT SOAL...
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // ERROR STATE
  // ═══════════════════════════════════════════════════════════════
  if (lagu.length === 0) return (
    <div className="min-h-screen bg-white font-mono flex items-center justify-center">
      <div className="border-4 border-black p-10 text-center" style={{ boxShadow: "6px 6px 0px #FF2D78" }}>
        <p className="font-black text-xl uppercase">SOAL TIDAK DITEMUKAN</p>
      </div>
    </div>
  );

  const currentLagu = lagu[current];
  const progressPct = ((current) / lagu.length) * 100;
  const timerDanger = timeLeft <= 5;

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-mono">
      <Navbar />

      {/* Notification Popup - Centered */}
      <NotificationPopup
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />

      {/* Audio element - hidden but active */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="auto"
        onEnded={handleAudioEnded}
        onError={(e) => {
          console.log("AUDIO ERROR");
          console.log(audioRef.current.error);
          console.log(audioRef.current.src);
        }}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ─── TOP STATS ─── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "SKOR", value: score, bg: "#FFE600", shadow: "#FF2D78" },
            { label: "COMBO", value: `${combo}x`, bg: combo > 0 ? "#FF2D78" : "#1a1a1a", textColor: combo > 0 ? "black" : "#555", shadow: "#000" },
            { label: "STREAK", value: streak, bg: "#00E5FF", shadow: "#000" },
          ].map((s) => (
            <div
              key={s.label}
              className="border-4 border-black p-4 sm:p-5 text-center"
              style={{ background: s.bg, boxShadow: `5px 5px 0px ${s.shadow}` }}
            >
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: s.textColor || "black" }}>{s.label}</p>
              <p className="text-3xl sm:text-4xl font-black" style={{ color: s.textColor || "black" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ─── PROGRESS ─── */}
        <div className="bg-white border-4 border-black p-4 mb-6 flex items-center gap-4" style={{ boxShadow: "4px 4px 0px #000" }}>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#888]">{title}</p>
            <p className="font-black text-sm uppercase">SOAL {current + 1} / {lagu.length}</p>
          </div>
          <div className="flex-1 ml-4">
            <div className="w-full h-4 bg-[#F0F0F0] border-2 border-black">
              <div
                className="h-full bg-black transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* ─── LYRIC PANEL ─── */}
        <div
          className={`border-4 border-black mb-6 overflow-hidden ${timerDanger && !playingCorrection ? "border-[#FF2D78]" : ""}`}
          style={{ boxShadow: timerDanger && !playingCorrection ? "8px 8px 0px #FF2D78" : "8px 8px 0px #000" }}
        >
          {/* Header Bar */}
          <div className={`flex items-center justify-between px-6 py-3 border-b-4 border-black ${playingCorrection ? "bg-[#B8FF57]" : timerDanger ? "bg-[#FF2D78]" : "bg-black"}`}>
            <span className={`text-xs font-black uppercase tracking-widest ${playingCorrection ? "text-black" : "text-[#FFE600]"}`}>
              {playingCorrection ? "🎵 AUDIO PLAYING" : ""}
            </span>
            {/* Timer Circle */}
            <div
              className={`w-14 h-14 border-4 border-current flex items-center justify-center font-black text-2xl ${playingCorrection ? "text-black border-black" : timerDanger ? "text-white border-white animate-pulse" : "text-[#FFE600] border-[#FFE600]"
                }`}
            >
              {playingCorrection ? correctionTimeLeft : timeLeft}
            </div>
          </div>

          {/* Lyric Body */}
          <div className="bg-white px-8 py-10 text-center">
            {/* Genre tag */}
            <div className="inline-block bg-[#FFE600] border-2 border-black px-4 py-1 mb-6">
              <span className="text-xs font-black uppercase tracking-widest">GENRE: {currentLagu?.nama_genre}</span>
            </div>

            <p className="text-3xl sm:text-4xl md:text-5xl font-black italic leading-tight text-black mb-6">
              "{currentLagu?.lirik}"
            </p>

            {/* Feedback */}
            {feedback && (
              <div
                className={`inline-block border-4 border-black px-8 py-3 font-black text-2xl uppercase tracking-wider ${feedback.type === "correct" ? "bg-[#B8FF57] text-black" : "bg-[#FF2D78] text-white"
                  }`}
                style={{ boxShadow: "4px 4px 0px #000" }}
              >
                {feedback.type === "correct" ? "✓ BENAR!" : "✕ SALAH!"}
              </div>
            )}

            {/* Combo bonus badge */}
            {combo > 1 && selectedAnswer !== null && (
              <div className="mt-4 inline-block ml-4">
                <div
                  className="bg-[#FF2D78] border-4 border-black px-5 py-2"
                  style={{ boxShadow: "3px 3px 0px #000" }}
                >
                  <span className="font-black text-white text-sm uppercase tracking-widest">⚡ {combo}x COMBO!</span>
                </div>
              </div>
            )}
          </div>

          {/* Audio playing status bar */}
          {playingCorrection && (
            <div className="bg-[#1a1a1a] border-t-4 border-black px-6 py-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-[#B8FF57] rounded-full animate-pulse" />
                <p className="text-[#B8FF57] text-xs font-black uppercase tracking-widest">
                  {audioEnded ? "✓ AUDIO SELESAI" : "🎵 MEMUTAR AUDIO..."}
                </p>
              </div>

              {/* Audio progress bar */}
              <div className="w-full h-2 bg-[#333] border-2 border-[#B8FF57]" style={{ boxShadow: "2px 2px 0px #B8FF57" }}>
                <div
                  className="h-full bg-[#B8FF57] transition-all duration-100"
                  style={{ width: `${((MAX_CORRECTION_TIME - correctionTimeLeft) / MAX_CORRECTION_TIME) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ─── ANSWER OPTIONS ─── */}
        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          {(shuffledAnswers[current] || currentLagu?.jawaban || []).map((answer, idx) => {
            let bg = "white";
            let border = "#000";
            let shadow = "#000";
            let textColor = "#000";

            if (selectedAnswer !== null) {
              if (answer.is_correct) {
                bg = "#B8FF57";
                shadow = "#000";
              }
              else if (selectedAnswer.id === answer.id && !answer.is_correct) {
                bg = "#FF2D78";
                textColor = "white";
                shadow = "#000";
              }
              else {
                bg = "#E0E0E0";
                textColor = "#888";
              }
            }

            return (
              <button
                key={answer.id}
                onClick={() => handleSelect(answer)}
                disabled={selectedAnswer !== null || playingCorrection}
                className="flex items-center gap-4 px-6 py-5 border-4 font-bold text-left transition-all duration-100 disabled:cursor-not-allowed"
                style={{
                  background: bg,
                  borderColor: border,
                  color: textColor,
                  boxShadow: selectedAnswer === null ? `5px 5px 0px ${shadow}` : "none",
                }}
                onMouseEnter={(e) => {
                  if (!selectedAnswer) {
                    e.currentTarget.style.transform = "translate(-2px, -2px)";
                    e.currentTarget.style.boxShadow = "7px 7px 0px #000";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = selectedAnswer === null ? `5px 5px 0px ${shadow}` : "none";
                }}
              >
                <span
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center font-black text-base border-3 border-current"
                  style={{
                    background: selectedAnswer === null ? "#000" : textColor === "white" ? "white" : "#000",
                    color: selectedAnswer === null ? "#FFE600" : textColor === "white" ? bg : "#FFE600"
                  }}
                >
                  {ANSWER_LABELS[idx]}
                </span>
                <span className="font-black text-sm sm:text-base uppercase tracking-wide flex-1">
                  {answer.jawaban_text}
                </span>
                {selectedAnswer !== null && answer.is_correct && <span className="font-black text-lg">✓</span>}
                {selectedAnswer !== null && selectedAnswer.id === answer.id && !answer.is_correct && <span className="font-black text-lg">✕</span>}
              </button>
            );
          })}
        </div>

        {/* ─── CORRECTION & SKIP BUTTON ─── */}
        {selectedAnswer !== null && (
          <div className="text-center space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Status message */}
              <div
                className="col-span-1 sm:col-span-2 inline-flex items-center justify-center gap-3 bg-black text-[#FFE600] px-6 py-3 border-4 border-black font-black text-xs uppercase tracking-widest mx-auto w-full sm:w-auto"
                style={{ boxShadow: "4px 4px 0px #FF2D78" }}
              >
                <div className="w-3 h-3 border-2 border-[#FFE600] border-t-transparent rounded-full animate-spin" />
                {audioEnded ? "AUDIO SELESAI - KLIK TOMBOL DI BAWAH" : "KOREKSI JAWABAN: DENGARKAN AUDIO"}
              </div>

              {/* Skip button - Only enabled after audio ends or after 10 seconds */}
              <button
                onClick={handleSkipToNext}
                disabled={!audioEnded && correctionTimeLeft > 20}
                className={`px-6 py-4 border-4 border-black font-black text-sm uppercase tracking-widest transition-all duration-100 sm:col-span-1 ${audioEnded || correctionTimeLeft <= 20
                  ? "cursor-pointer hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-y-0 active:translate-x-0"
                  : "cursor-not-allowed opacity-50"
                  }`}
                style={{
                  background: audioEnded || correctionTimeLeft <= 20 ? "#FFE600" : "#CCCCCC",
                  color: "#000",
                  boxShadow: audioEnded || correctionTimeLeft <= 20 ? "5px 5px 0px #000" : "none",
                }}
              >
                <span className="block">→ {audioEnded ? "LANJUT KE SOAL BERIKUTNYA" : `SKIP (${correctionTimeLeft}s)`}</span>
                <span className="block text-xs mt-1">atau tunggu audio selesai</span>
              </button>

              {/* Auto advance info */}
              <div className="col-span-1 sm:col-span-1 bg-[#B8FF57] border-4 border-black px-4 py-3 text-black font-black text-xs uppercase tracking-widest" style={{ boxShadow: "3px 3px 0px #000" }}>
                <p>Otomatis lanjut dalam {correctionTimeLeft}s</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}