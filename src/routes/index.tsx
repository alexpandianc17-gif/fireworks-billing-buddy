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
      // Sync in background
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
      {/* Background Layer */}
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

      {/* Main Content Wrapper */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 perspective-1000 p-4">
        <AnimatePresence>
          {!isUnlocking && (
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              exit={{
                y: 500,
                rotateX: -20,
                opacity: 0,
                transition: { duration: 0.8, ease: "backIn" },
              }}
              className="w-full max-w-md flex flex-col items-center"
            >
              {/* Login Card */}
              <motion.form
                onSubmit={submit}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.02, y: -12 }}
                className="w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-festive" />
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black flex items-center gap-2 text-[#8b6d4d] uppercase tracking-widest justify-center">
                    <Lock className="w-3 h-3" /> Secure Access Required
                  </label>
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
                    className="w-full text-center text-3xl tracking-[0.5em] font-mono py-5 rounded-2xl border-2 border-[#d4bc8d]/30 bg-white/50 focus:outline-none focus:border-[#c0421b] focus:ring-4 focus:ring-[#c0421b]/10 transition-all shadow-inner"
                    placeholder="••••••"
                  />
                  {err && (
                    <p className="text-[#c0421b] text-[10px] font-bold text-center uppercase animate-bounce">
                      {err}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={pin.length !== 6 || isUnlocking}
                  className="w-full bg-festive text-white font-bold py-4 rounded-2xl shadow-lg disabled:opacity-50 hover:bg-[#a03616] transition-all text-base uppercase tracking-widest"
                >
                  Unlock System
                </button>

                <div className="text-center pt-2">
                  <p className="text-[9px] text-[#8b6d4d]/60 font-medium tracking-tighter">
                    Authorized Personnel Only • PIN: 123456
                  </p>
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
