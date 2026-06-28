import { Link } from "react-router-dom";
import WindowWrapper from "@/components/window-wrapper.tsx";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <WindowWrapper title="🐰 The Ultimate Yeh-Yeh-Yeh Quiz" className="w-full">
        <div className="flex flex-col items-center gap-6 bg-gray-100 p-6 text-center sm:p-10">
          <h1 className="text-3xl font-black leading-tight text-gray-900 sm:text-5xl">
            How well do you know
            <br />
            <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 bg-clip-text text-transparent">
              Bad Bunny&apos;s Yeh-Yeh-Yehs?
            </span>
          </h1>
          <p className="max-w-md text-base text-gray-600 sm:text-lg">
            Listen to an iconic ad-lib, pick the right song from four options,
            and answer fast. 10 snippets. One shot each. How high can you score?
          </p>
          <Link
            to="/quiz"
            className="border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-300 px-8 py-3 text-xl font-bold text-gray-900 transition-transform hover:scale-95 active:scale-90"
          >
            Start Quiz
          </Link>
        </div>
      </WindowWrapper>
    </div>
  );
}
