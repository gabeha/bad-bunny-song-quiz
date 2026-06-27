import { Route, Routes } from "react-router-dom";
import Home from "@/pages/Home.tsx";
import Quiz from "@/pages/Quiz.tsx";
import Leaderboard from "@/pages/Leaderboard.tsx";
import Collection from "@/pages/Collection.tsx";
import Admin from "@/pages/Admin.tsx";
import SiteHeader from "@/components/site-header.tsx";

export default function App() {
  return (
    <div className="min-h-full w-full bg-gradient-to-br from-fuchsia-700 via-purple-700 to-indigo-800">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 py-4 sm:px-6 sm:py-8">
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </div>
  );
}
