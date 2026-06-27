import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth.tsx";
import SignInModal from "@/components/sign-in-modal.tsx";

export default function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  const name =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email ??
    "Player";

  return (
    <header className="mb-4 flex items-center justify-between gap-2">
      <Link
        to="/"
        className="text-sm font-black tracking-tight text-white sm:text-base"
      >
        🐰 Yeh-Yeh-Yeh Quiz
      </Link>
      <nav className="flex items-center gap-3 text-sm font-semibold text-white/90">
        <Link to="/leaderboard" className="underline-offset-2 hover:underline">
          Leaderboard
        </Link>
        {user && (
          <Link to="/collection" className="underline-offset-2 hover:underline">
            Collection
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className="underline-offset-2 hover:underline">
            Admin
          </Link>
        )}
        {user ? (
          <div className="flex items-center gap-2">
            <span className="max-w-[8rem] truncate text-white/70">{name}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="border-2 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-2 py-1 text-xs font-bold text-gray-900"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            className="border-2 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-2 py-1 text-xs font-bold text-gray-900"
          >
            Sign in
          </button>
        )}
      </nav>
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
