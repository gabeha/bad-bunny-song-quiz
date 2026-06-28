import { Link, useLocation } from "react-router-dom";
import { Disc3, House, Music2, Trophy, Wrench } from "lucide-react";
import { useAuth } from "@/lib/auth.tsx";
import { cn } from "@/lib/utils.ts";

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user, isAdmin } = useAuth();

  const items = [
    { to: "/", label: "Home", icon: House },
    { to: "/quiz", label: "Play", icon: Music2 },
    { to: "/leaderboard", label: "Ranks", icon: Trophy },
    ...(user ? [{ to: "/collection", label: "Songs", icon: Disc3 }] : []),
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Wrench }] : []),
  ];

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border-r-2 border-b-2 border-l-2 border-t-2 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-200/95 p-1.5 shadow-2xl backdrop-blur">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-[3.25rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-bold transition-colors sm:min-w-[4rem]",
                active
                  ? "bg-gray-300 text-gray-900 shadow-inner"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon
                className={cn("h-5 w-5", active && "text-purple-600")}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
