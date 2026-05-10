import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Sparkles, Settings, FilePlus, LogOut } from "lucide-react";
import { useBilling } from "@/store/billing";

export function TopNav() {
  const navigate = useNavigate();
  const setAuthed = useBilling((s) => s.setAuthed);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <div className="w-9 h-9 rounded-lg bg-festive grid place-items-center shadow-festive">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>Fireworks Billing</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-accent ${path === "/dashboard" ? "bg-accent" : ""}`}
          >
            <FilePlus className="w-4 h-4" /> New Bill
          </Link>
          <Link
            to="/settings"
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-accent ${path === "/settings" ? "bg-accent" : ""}`}
          >
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <button
            onClick={() => {
              setAuthed(false);
              navigate({ to: "/" });
            }}
            className="px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 text-muted-foreground hover:bg-accent"
          >
            <LogOut className="w-4 h-4" /> Lock
          </button>
        </nav>
      </div>
    </header>
  );
}
