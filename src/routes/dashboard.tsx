import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Flame, Sparkles } from "lucide-react";
import { useBilling } from "@/store/billing";
import { TopNav } from "@/components/TopNav";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { authed, setCompany } = useBilling();
  const navigate = useNavigate();
  if (!authed) return <Navigate to="/" />;

  const pick = (c: "Jayakavi" | "Thangakaviya") => {
    setCompany(c);
    navigate({ to: "/billing" });
  };

  return (
    <div className="min-h-screen">
      <TopNav />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">Create a New Invoice</h1>
          <p className="text-muted-foreground mt-2">Select a company to begin billing</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => pick("Jayakavi")}
            className="group relative overflow-hidden rounded-2xl border bg-card p-10 text-left hover:shadow-festive transition-all hover:-translate-y-1"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-festive opacity-20 group-hover:opacity-40 transition" />
            <Sparkles className="w-10 h-10 text-ember mb-6" />
            <h2 className="text-2xl font-bold">Jayakavi Fire Works</h2>
            <p className="text-muted-foreground mt-2">Generate invoice for Jayakavi catalogue</p>
          </button>
          <button
            onClick={() => pick("Thangakaviya")}
            className="group relative overflow-hidden rounded-2xl border bg-card p-10 text-left hover:shadow-festive transition-all hover:-translate-y-1"
          >
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-festive opacity-20 group-hover:opacity-40 transition" />
            <Flame className="w-10 h-10 text-ember mb-6" />
            <h2 className="text-2xl font-bold">Sri Thangakaviya Fireworks</h2>
            <p className="text-muted-foreground mt-2">Generate invoice for Thangakaviya catalogue</p>
          </button>
        </div>
      </main>
    </div>
  );
}
