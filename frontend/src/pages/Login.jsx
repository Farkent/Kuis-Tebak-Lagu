// Login.jsx - NEOBRUTALISM (Updated: NotificationPopup integration)
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NotificationPopup from "../components/NotificationPopup";
import { apiUrl } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const hideNotification = () => {
    setNotification({ ...notification, show: false });
  };

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      showNotification("ERROR: Username dan password tidak boleh kosong!", "error");
      return;
    }
    setLoading(true);
    fetch(apiUrl("/login.php"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          showNotification(`ERROR: ${data.error}`, "error");
        } else {
          showNotification("LOGIN BERHASIL! REDIRECTING...", "success");
          setTimeout(() => navigate("/admin/dashboard"), 1200);
        }
      })
      .catch(() => showNotification("ERROR: Gagal terhubung ke server.", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(apiUrl("/is_admin.php"), { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (data.authenticated) navigate("/admin/dashboard"); })
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-mono flex flex-col">
      <Navbar />

      {/* Notification Popup */}
      <NotificationPopup 
        show={notification.show} 
        message={notification.message} 
        type={notification.type}
        onClose={hideNotification}
      />

      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Header Strip */}
          <div
            className="bg-[#FFE600] border-4 border-black px-8 py-5 mb-0"
            style={{ boxShadow: "none" }}
          >
            <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-black">
              ADMIN<br /><span className="text-[#FF2D78]">LOGIN.</span>
            </h1>
          </div>

          {/* Form Card */}
          <div
            className="bg-white border-4 border-black border-t-0 p-8"
            style={{ boxShadow: "8px 8px 0px #000" }}
          >
            {/* Identity Badge */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-black border-2 border-[#FFE600]">
              <div className="w-10 h-10 bg-[#FF2D78] border-2 border-[#FFE600] flex items-center justify-center text-white font-black text-lg">
                ♪
              </div>
              <div>
                <p className="text-[#FFE600] font-black text-xs uppercase tracking-widest">GUESSBEAT SYSTEM</p>
                <p className="text-[#888] font-mono text-xs">Moderator Access Portal v2.0</p>
              </div>
              <div className="ml-auto w-2 h-2 bg-[#B8FF57] rounded-full animate-pulse" />
            </div>

            {/* Username */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                USER_ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="admin123"
                className="w-full px-4 py-4 bg-[#F5F5F0] border-4 border-black font-black text-black text-base outline-none focus:bg-[#FFE600] transition-colors duration-100 placeholder:text-[#bbb] placeholder:font-normal"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-xs font-black uppercase tracking-widest text-black mb-2">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  className="w-full px-4 py-4 bg-[#F5F5F0] border-4 border-black font-black text-black text-base outline-none focus:bg-[#FFE600] transition-colors duration-100 placeholder:text-[#bbb] placeholder:font-normal pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-full w-12 bg-black text-[#FFE600] font-black text-xs border-l-4 border-black hover:bg-[#FF2D78] transition-colors"
                >
                  {showPassword ? "👁" : "○"}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-black text-[#FFE600] font-black text-lg uppercase tracking-widest py-5 border-4 border-black hover:bg-[#FF2D78] hover:text-white transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed mb-4"
              style={{ boxShadow: loading ? "none" : "6px 6px 0px #FF2D78" }}
            >
              {loading ? "PROCESSING..." : "→ MASUK SISTEM"}
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate("/")}
              className="w-full bg-white text-black font-black text-sm uppercase tracking-widest py-4 border-4 border-black hover:bg-[#F5F5F0] transition-colors duration-100"
            >
              ← KEMBALI KE HOME
            </button>

            {/* Demo Hint */}
            <div className="mt-6 pt-4 border-t-2 border-[#eee]">
              <p className="text-center text-xs text-[#888] font-mono uppercase tracking-widest">
                // DEMO: user=<span className="text-black font-black">admin</span> pass=<span className="text-black font-black">123</span>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}