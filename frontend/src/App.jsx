import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageTransition from "./components/Pagetransition";
import Home from "./pages/Home";
import TebakLagu from "./pages/TebakLagu";
import Result from "./pages/Result";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/tebak-lagu/:tebakLaguId" element={<PageTransition><TebakLagu /></PageTransition>} />
        <Route path="/result" element={<PageTransition><Result /></PageTransition>} />
      </Routes>
    </BrowserRouter>
  );
}