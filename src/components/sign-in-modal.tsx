import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth.tsx";

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export default function SignInModal({ open, onClose, title }: SignInModalProps) {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      await signInWithEmail(email);
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-200 p-1.5 shadow-2xl">
        <div className="flex h-8 items-center justify-between bg-gradient-to-r from-blue-800 to-blue-500 px-2">
          <span className="text-sm font-bold text-white">
            {title ?? "Sign in"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-5 w-5 items-center justify-center border-2 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-200 text-gray-800"
          >
            <X className="h-3 w-3" strokeWidth={3} />
          </button>
        </div>

        <div className="flex flex-col gap-4 bg-gray-100 p-5">
          {status === "sent" ? (
            <p className="text-center text-sm font-semibold text-gray-700">
              Check your email for a magic link to finish signing in. You can
              close this window.
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-white px-4 py-2.5 text-sm font-bold text-gray-900 transition-transform hover:scale-[0.98] active:scale-95"
              >
                Continue with Google
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                <span className="h-px flex-1 bg-gray-300" /> OR{" "}
                <span className="h-px flex-1 bg-gray-300" />
              </div>

              <form onSubmit={sendMagicLink} className="flex flex-col gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="border-2 border-r-gray-300 border-b-gray-300 border-l-gray-500 border-t-gray-500 bg-white px-3 py-2 text-sm text-gray-900 outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-4 py-2.5 text-sm font-bold text-gray-900 transition-transform hover:scale-[0.98] active:scale-95 disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Email me a magic link"}
                </button>
              </form>

              {status === "error" && (
                <p className="text-center text-xs font-semibold text-red-600">
                  {errorMsg}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
