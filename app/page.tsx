import { ScrollableImages } from "@/components/scrollable-images";
import { Button } from "@/components/ui/button";
import { Maximize } from "lucide-react";
import Link from "next/link";

const Home = () => {
  return (
    <div className="flex h-full w-full items-center justify-between gap-4 ">
      <ScrollableImages />
      <div className="bg-gray-200 flex flex-col h-1/2 w-full border-r-4 border-r-gray-400 border-b-4 border-b-gray-400 border-l-4 border-l-white border-t-4 border-t-white p-2">
        <div className="w-full bg-blue-800 h-8 flex items-center justify-between p-1">
          <div>
            <span className="text-white font-semibold">
              🌎 Welcome to my Bad Bunny Quiz
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="bg-gray-200 h-6 w-6 text-center">_</div>
            <div className="bg-gray-200 h-6 w-6 flex flex-col items-center justify-center">
              <Maximize className="h-5 w-5" />
            </div>
            <div className="bg-gray-200 h-6 w-6 flex flex-col items-center justify-center">
              x
            </div>
          </div>
        </div>
        <div className="w-full h-8 flex items-center justify-start p-1 gap-6 ml-4">
          <a
            href="https://gabrielhauss.com"
            target="_blank"
            className="text-gray-700 underline"
          >
            My Website
          </a>
          <a
            href="https://open.spotify.com/playlist/1uh30dUr8o40UqwqW6zRhk?si=91a077f751854361"
            target="_blank"
            className="text-gray-700 underline"
          >
            Playlist
          </a>
          <Link href={"/disclaimer"} className="text-gray-700 underline">
            Disclaimer
          </Link>
        </div>
        <div className="w-full flex-grow flex items-end justify-center p-8 gap-6 border-2 border-gray-900 bg-xp bg-cover">
          <Button className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95 text-xl">
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
