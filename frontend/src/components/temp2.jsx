// PageTransition.jsx - NEOBRUTALISM slide-in effect
// Wrap every page with this component for route transition animation
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransition({ children }) {
  const location = useLocation();
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(location.pathname);

  useEffect(() => {
    setShow(false);
    setKey(location.pathname);
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <div
      key={key}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0px)" : "translateY(18px)",
        transition: "opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)",
      }}
    >
      {children}
    </div>
  );
}
