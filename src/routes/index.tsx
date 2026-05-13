import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react"; // Added useEffect
import { Sparkles, Lock, Loader2 } from "lucide-react"; // Added Loader2
import { useBilling } from "@/store/billing";

export const Route = createFileRoute("/")({
  component: PinPage,
});

function PinPage() {
  // Pull in fetchData and isLoading from our store
  const { authed, config, setAuthed, fetchData, isLoading } = useBilling();
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  // This fires once when the page loads to fetch the Google Sheet data
  useEffect(() => {
    fetchData();
  }, []);

  if (authed) return <Navigate to="/dashboard" />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use config.PIN (matching the exact key from our Google Sheet)
    if (pin === config.PIN) {
      setAuthed(true);
      navigate({ to: "/dashboard" });
    } else {
      setErr("Incorrect PIN");
      setPin("");
    }
  };

  // Show a loading screen while we wait for Google Sheets to respond
  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-background via-accent/30 to-background">
        <div className="flex flex-col items-center gap-4 text-festive">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="font-semibold text-lg">Syncing Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-br from-background via-accent/30 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-festive shadow-festive items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Fireworks Billing</h1>
          <p className="text-muted-foreground mt-1">Enter your master PIN to continue</p>
        </div>
        <form onSubmit={submit} className="bg-card border rounded-2xl p-8 shadow-festive">
          <label className="text-sm font-medium flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" /> Master PIN
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
            className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="••••••"
          />
          {err && <p className="text-destructive text-sm mt-2">{err}</p>}
          <button
            type="submit"
            disabled={pin.length !== 6}
            className="w-full mt-6 bg-festive text-primary-foreground font-semibold py-3 rounded-lg shadow-festive disabled:opacity-50 hover:bg-red-600 transition-colors"
          >
            Unlock
          </button>
          <p className="text-xs text-muted-foreground text-center mt-4">Demo PIN: {config.PIN}</p>
        </form>
      </div>
    </div>
  );
}