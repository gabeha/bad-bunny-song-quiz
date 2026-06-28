import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home.tsx";
import Quiz from "@/pages/Quiz.tsx";
import Leaderboard from "@/pages/Leaderboard.tsx";
import Collection from "@/pages/Collection.tsx";
import Admin from "@/pages/Admin.tsx";
import SiteHeader from "@/components/site-header.tsx";
import BottomNav from "@/components/bottom-nav.tsx";

export default function App() {
  return (
    <div className="relative min-h-full w-full">
      {/* Fixed art + scrim layers so the darkening always covers the full
          viewport, regardless of page height or scroll position. */}
      <div className="fixed inset-0 -z-20 bg-mobile bg-cover bg-center sm:bg-desktop" />
      <div className="fixed inset-0 -z-10 bg-black/30" />
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 pb-28 pt-4 sm:px-6 sm:pt-8">
        <SiteHeader />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <footer className="mt-6 text-center text-[11px] leading-relaxed text-white/70">
            Fan-made for fun. All songs &amp; audio belong to their respective
            owners. Not affiliated with Bad Bunny.
            <br />
            Built by{" "}
            <a
              href="https://gabrielhauss.com"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              gabrielhauss.com
            </a>
          </footer>
      </div>
      <BottomNav />
    </div>
  );
}
