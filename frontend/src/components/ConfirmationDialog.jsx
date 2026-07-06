// ConfirmationDialog.jsx - NEOBRUTALISM (Portal: selalu di tengah layar device)
import { createPortal } from "react-dom";

export default function ConfirmationDialog({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "YA, LANJUTKAN",
  cancelText = "BATAL",
  isDangerous = true,
}) {
  if (!show) return null;

  const dangerConfig = {
    bg: "#FF2D78",
    textColor: "white",
    buttonConfirm: "#FF2D78",
    buttonCancel: "#1a1a1a",
    confirmTextColor: "white",
    cancelTextColor: "white",
  };

  const normalConfig = {
    bg: "#FFE600",
    textColor: "black",
    buttonConfirm: "#000",
    buttonCancel: "#1a1a1a",
    confirmTextColor: "#FFE600",
    cancelTextColor: "white",
  };

  const config = isDangerous ? dangerConfig : normalConfig;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9998,
          background: "rgba(0,0,0,0.55)",
          animation: "cdFadeIn 0.2s ease-out",
        }}
      />

      {/* Dialog card — selalu di tengah viewport */}
      <div
        style={{
          position: "fixed",
          top: "50vh",
          left: "50vw",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          fontFamily: "monospace",
          width: "min(400px, calc(100vw - 2rem))",
          animation: "cdSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          style={{
            background: config.bg,
            border: "4px solid #000",
            color: config.textColor,
            boxShadow: "7px 7px 0px #000",
            overflow: "hidden",
          }}
        >
          {/* Top accent bar */}
          <div style={{ height: "10px", background: "#000" }} />

          {/* Content */}
          <div style={{ padding: "20px 24px 24px 24px" }}>
            {/* Icon warning */}
            {isDangerous && (
              <div style={{ textAlign: "center", fontSize: "34px", marginBottom: "10px" }}>⚠️</div>
            )}

            {/* Title */}
            <h2
              style={{
                fontSize: "clamp(15px, 4vw, 21px)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                textAlign: "center",
                marginBottom: "10px",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>

            {/* Message */}
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                textAlign: "center",
                marginBottom: "20px",
                lineHeight: 1.6,
                opacity: 0.85,
                margin: "0 0 20px 0",
              }}
            >
              {message}
            </p>

            {/* Buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {/* Cancel */}
              <button
                onClick={onCancel}
                style={{
                  padding: "10px 8px",
                  border: "4px solid #000",
                  fontWeight: 900,
                  fontSize: "11px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: config.buttonCancel,
                  color: config.cancelTextColor,
                  boxShadow: "4px 4px 0px #000",
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translate(0,0)"}
                onMouseDown={e => e.currentTarget.style.transform = "translate(0,0)"}
              >
                ✕ {cancelText}
              </button>

              {/* Confirm */}
              <button
                onClick={onConfirm}
                style={{
                  padding: "10px 8px",
                  border: "4px solid #000",
                  fontWeight: 900,
                  fontSize: "11px",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: config.buttonConfirm,
                  color: config.confirmTextColor,
                  boxShadow: "4px 4px 0px #000",
                  cursor: "pointer",
                  transition: "transform 0.1s",
                }}
                onMouseOver={e => e.currentTarget.style.transform = "translate(-2px,-2px)"}
                onMouseOut={e => e.currentTarget.style.transform = "translate(0,0)"}
                onMouseDown={e => e.currentTarget.style.transform = "translate(0,0)"}
              >
                ✓ {confirmText}
              </button>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ height: "10px", background: "#000" }} />
        </div>
      </div>

      <style>{`
        @keyframes cdFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cdSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, calc(-50% - 20px)) scale(0.85);
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
