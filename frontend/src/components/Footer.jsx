// Footer.jsx - NEOBRUTALISM
export default function Footer() {
  return (
    <footer className="w-full border-t-4 border-black bg-[#1a1a1a] mt-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 py-10 border-b-4 border-[#333]">
          {/* Brand */}
          <div className="max-w-xs">
            <div
              className="inline-block bg-[#FFE600] border-4 border-black px-4 py-2 mb-4"
              style={{ boxShadow: "4px 4px 0px #000" }}
            >
              <span className="font-black text-2xl text-black tracking-tighter uppercase font-mono">
                GUESS<span className="text-[#FF2D78]">BEAT.</span>
              </span>
            </div>
            <p className="text-[#aaa] text-sm font-bold font-mono uppercase tracking-wide leading-relaxed">
              <br />
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-row gap-12 md:gap-20">
            <div>
              <p className="text-[#FFE600] text-xs font-black font-mono uppercase tracking-widest mb-4 border-b-2 border-[#FFE600] pb-2">
                PROJECT
              </p>
              <p className="text-white font-bold font-mono text-sm">Penulisan Ilmiah</p>
              <p className="text-[#888] font-mono text-xs mt-1">2026</p>
            </div>
            <div>
              <p className="text-[#FF2D78] text-xs font-black font-mono uppercase tracking-widest mb-4 border-b-2 border-[#FF2D78] pb-2">
                TECH STACK
              </p>
              <p className="text-white font-bold font-mono text-sm">React + Vite</p>
              <p className="text-[#888] font-mono text-xs mt-1">PHP + Tailwind</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#555] font-mono text-xs uppercase tracking-widest font-bold">
            © 2026 GUESSBEAT — ALL RIGHTS RESERVED
          </p>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse" />
            <p className="text-[#555] font-mono text-xs uppercase tracking-widest">SYSTEM ONLINE</p>
          </div>
        </div>
      </div>
    </footer>
  );
}