import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBilling } from "@/store/billing";

export const Route = createFileRoute("/")({
  component: PinPage,
});

function PinPage() {
  const { authed, config, setAuthed } = useBilling();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  if (authed && !isUnlocking) return <Navigate to="/dashboard" />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === config.pin) {
      setIsUnlocking(true);
      useBilling.getState().syncData();
      setTimeout(() => {
        setAuthed(true);
        navigate({ to: "/dashboard" });
      }, 800);
    } else {
      setErr("Incorrect PIN");
      setPin("");
    }
  };

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-[#fdf6e3]">

      {/* Background — always fills 100% of the viewport */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/lock_background.png"
          className="w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-white/10" />
      </motion.div>

      {/*
        KEY FIX: Card is absolutely positioned using viewport-% coordinates,
        the same coordinate space the background image lives in.
        → Browser zoom scales both the bg and the card identically.
        → No flex container, no padding-based positioning that drifts on zoom.

        bottom: 6%    — lower third, background branding visible above
        left: 50% + translateX(-50%)  — always horizontally centered
        width: 28vw   — proportional to viewport, matches bg image scaling
        clamp() on font/padding — gracefully handles very small or large viewports
      */}
      <AnimatePresence>
        {!isUnlocking && (
          <motion.div
            initial={{ x: "-50%", opacity: 1 }}
            animate={{ x: "-50%" }}
            exit={{
              x: "-50%",
              y: 500,
              rotateX: -20,
              opacity: 0,
              transition: { duration: 0.8, ease: "backIn" },
            }}
            style={{
              position: "absolute",
              bottom: "6%",
              left: "50%",
              width: "28vw",
              minWidth: "300px",
              maxWidth: "460px",
              zIndex: 10,
            }}
          >
            <motion.form
              onSubmit={submit}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.02, y: -12 }}
              className="w-full bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl relative overflow-hidden"
              style={{ borderRadius: "2rem", padding: "2rem" }}
            >
              {/* Festive top accent bar */}
              <div className="absolute top-0 left-0 w-full bg-festive" style={{ height: "4px" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                {/* Label */}
                <label
                  className="flex items-center justify-center gap-2 text-[#8b6d4d] uppercase tracking-widest font-black"
                  style={{ fontSize: "clamp(9px, 0.7vw, 12px)" }}
                >
                  <Lock style={{ width: "clamp(10px, 0.8vw, 14px)", height: "clamp(10px, 0.8vw, 14px)" }} />
                  Secure Access Required
                </label>

                {/* PIN input */}
                <div>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value.replace(/\D/g, ""));
                      setErr("");
                    }}
                    className="w-full text-center font-mono tracking-[0.5em] border-2 border-[#d4bc8d]/30 bg-white/50 focus:outline-none focus:border-[#c0421b] focus:ring-4 focus:ring-[#c0421b]/10 transition-all shadow-inner"
                    style={{
                      fontSize: "clamp(20px, 2vw, 32px)",
                      padding: "clamp(12px, 1.2vw, 20px) 0",
                      borderRadius: "1rem",
                    }}
                    placeholder="••••••"
                  />
                  {err && (
                    <p
                      className="text-[#c0421b] font-bold text-center uppercase animate-bounce"
                      style={{ fontSize: "clamp(9px, 0.6vw, 12px)", marginTop: "6px" }}
                    >
                      {err}
                    </p>
                  )}
                </div>

                {/* Unlock button */}
                <button
                  type="submit"
                  disabled={pin.length !== 6 || isUnlocking}
                  className="w-full bg-festive text-white font-bold shadow-lg disabled:opacity-50 hover:bg-[#a03616] transition-all uppercase tracking-widest"
                  style={{
                    padding: "clamp(10px, 1vw, 16px) 0",
                    borderRadius: "1rem",
                    fontSize: "clamp(11px, 0.8vw, 14px)",
                  }}
                >
                  Unlock System
                </button>

                {/* Footer note */}
                <p
                  className="text-center text-[#8b6d4d]/60 font-medium tracking-tighter"
                  style={{ fontSize: "clamp(8px, 0.55vw, 11px)" }}
                >
                  Authorized Personnel Only • PIN: 123456
                </p>

              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}