import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useBilling } from "@/store/billing";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, rotateX: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.2,
      delayChildren: 0.5,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

function Dashboard() {
  const { authed, setCompany } = useBilling();
  const navigate = useNavigate();

  if (!authed) return <Navigate to="/" />;

  const pick = (c: "Jayakavi" | "Thangakaviya") => {
    setCompany(c);
    navigate({ to: "/billing" });
  };

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden bg-[#fdf6e3] flex flex-col">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <img
          src="/dashboard_background.png"
          className="w-full h-full object-cover opacity-80"
          alt=""
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 flex flex-col h-full perspective-1000"
      >
        <TopNav />
        <main className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 w-full py-4">
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-5xl font-extrabold tracking-tight text-[#4a3728] mb-2">
              Kavya <span className="text-[#c0421b]">Dashboard</span>
            </h1>
            <p className="text-base text-[#8b6d4d] font-bold uppercase tracking-[0.2em]">
              Select Operation Module
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
            <motion.button
              variants={itemVariants}
              onClick={() => pick("Jayakavi")}
              className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#d4bc8d]/30 bg-white/60 backdrop-blur-md p-10 text-left transition-all duration-500 hover:border-[#c0421b]/50 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#c0421b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-[#c0421b]/10 flex items-center justify-center mb-6 group-hover:bg-[#c0421b]/20 transition-all">
                <Sparkles className="w-8 h-8 text-[#c0421b]" />
              </div>
              <h2 className="text-2xl font-bold text-[#4a3728] mb-2">
                JAYAKAVI
              </h2>
              <p className="text-[#8b6d4d] font-medium leading-relaxed text-sm">
                Primary catalogue with standard rates and packing details.
              </p>
              <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-[#c0421b]">
                Select Company <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </motion.button>

            <motion.button
              variants={itemVariants}
              onClick={() => pick("Thangakaviya")}
              className="group relative overflow-hidden rounded-[2.5rem] border-2 border-[#d4bc8d]/30 bg-white/60 backdrop-blur-md p-10 text-left transition-all duration-500 hover:border-[#c0421b]/50 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#c0421b]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-14 h-14 rounded-2xl bg-[#c0421b]/10 flex items-center justify-center mb-6 group-hover:bg-[#c0421b]/20 transition-all">
                <Flame className="w-8 h-8 text-[#c0421b]" />
              </div>
              <h2 className="text-2xl font-bold text-[#4a3728] mb-2">
                THANGAKAVIYA
              </h2>
              <p className="text-[#8b6d4d] font-medium leading-relaxed text-sm">
                Specialized catalogue for premium crackers and wholesale orders.
              </p>
              <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-[#c0421b]">
                Select Company <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </motion.button>
          </div>
        </main>
      </motion.div>
    </div>
  );
}
