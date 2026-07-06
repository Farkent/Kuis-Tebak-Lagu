// Navbar.jsx - NEOBRUTALISM
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: "HOME", path: "/" },
    { name: "LEADERBOARD", path: "/leaderboard" },
    { name: "ADMIN", path: "/admin" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-[#FFE600]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group">
          <div
            className="w-10 h-10 bg-black border-3 border-black flex items-center justify-center font-black text-[#FFE600] text-lg group-hover:bg-[#FF2D78] transition-colors duration-150"
            style={{ boxShadow: "3px 3px 0px #FF2D78" }}
          >
            ♪
          </div>
          <span className="text-black font-black text-xl uppercase tracking-tighter font-mono">
            GUESS<span className="text-[#FF2D78]">BEAT</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 font-black text-xs uppercase tracking-widest font-mono border-2 border-black transition-all duration-100 ${
                isActive(link.path)
                  ? "bg-black text-[#FFE600]"
                  : "bg-transparent text-black hover:bg-black hover:text-[#FFE600]"
              }`}
              style={isActive(link.path) ? { boxShadow: "3px 3px 0px #FF2D78" } : {}}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 bg-black text-[#FFE600] font-black text-lg border-2 border-black flex items-center justify-center"
          style={{ boxShadow: "3px 3px 0px #FF2D78" }}
        >
          {isOpen ? "✕" : "≡"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black border-t-4 border-black">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-6 py-4 font-black text-sm uppercase tracking-widest font-mono border-2 border-[#FFE600] transition-all duration-100 ${
                  isActive(link.path)
                    ? "bg-[#FFE600] text-black"
                    : "text-[#FFE600] hover:bg-[#FFE600] hover:text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}