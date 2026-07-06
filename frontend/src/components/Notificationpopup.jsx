// NotificationPopup.jsx - NEOBRUTALISM (Portal: selalu di tengah layar device)
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function NotificationPopup({
  show,
  message,
  type = "success",
  onClose,
}) {
  const typeConfig = {
    success: {
      bg: "#B8FF57",
      text: "black",
      shadow: "#000",
      icon: "✓",
      border: "#000",
      accentBg: "#000",
      accentText: "#B8FF57",
    },
    error: {
      bg: "#FF2D78",
      text: "white",
      shadow: "#000",
      icon: "✕",
      border: "#000",
      accentBg: "#000",
      accentText: "white",
    },
    info: {
      bg: "#00E5FF",
      text: "black",
      shadow: "#000",
      icon: "ℹ",
      border: "#000",
      accentBg: "#000",
      accentText: "#00E5FF",
    },
    warning: {
      bg: "#FFE600",
      text: "black",
      shadow: "#000",
      icon: "!",
      border: "#000",
      accentBg: "#000",
      accentText: "#FFE600",
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return createPortal(
    <>
      {/* Backdrop — klik untuk tutup */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9998,
          background: "rgba(0,0,0,0.45)",
          animation: "npFadeIn 0.2s ease-out",
        }}
      />

      {/* Card — selalu di tengah viewport */}
      <div
        style={{
          position: "fixed",
          top: "50vh",
          left: "50vw",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          fontFamily: "monospace",
          width: "min(380px, calc(100vw - 2rem))",
          animation: "npSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          style={{
            background: config.bg,
            border: `4px solid ${config.border}`,
            color: config.text,
            boxShadow: `6px 6px 0px ${config.shadow}`,
            overflow: "hidden",
          }}
        >
          {/* Top accent */}
          <div style={{ height: "8px", background: config.accentBg }} />

          {/* Body */}
          <div style={{ padding: "20px 20px 0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              {/* Icon */}
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `4px solid ${config.text}`,
                  color: config.text,
                  fontWeight: 900,
                  fontSize: "20px",
                }}
              >
                {config.icon}
              </div>

              {/* Message */}
              <p
                style={{
                  flex: 1,
                  margin: 0,
                  fontWeight: 900,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {message}
              </p>
            </div>

            {/* Close button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                borderTop: `4px solid ${config.border}`,
                paddingTop: "12px",
                paddingBottom: "16px",
              }}
            >
              <button
                onClick={onClose}
                style={{
                  padding: "8px 20px",
                  fontWeight: 900,
                  fontSize: "11px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  border: `4px solid ${config.border}`,
                  background: config.accentBg,
                  color: config.accentText,
                  boxShadow: `3px 3px 0px ${config.border}`,
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translate(0,0)"; }}
                onMouseDown={e => { e.currentTarget.style.transform = "translate(0,0)"; }}
              >
                ✕ TUTUP
              </button>
            </div>
          </div>

          {/* Bottom accent */}
          <div style={{ height: "8px", background: config.accentBg }} />
        </div>
      </div>

      <style>{`
        @keyframes npFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes npSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 20px)) scale(0.88);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>,
    document.body
  );
}
