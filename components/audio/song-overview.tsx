import { readJson } from "@/app/actions/getSongData";
import { cn, formatSecondsBetween } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type SongData = Awaited<ReturnType<typeof readJson>>[number];
type SongOverviewProps = {
  songData: SongData[];
  selectedSong: SongData;
  handleSetSelectedSong: (song: SongData) => void;
};

const SongOverview = ({
  songData,
  selectedSong,
  handleSetSelectedSong,
}: SongOverviewProps) => {
  return (
    <div className="flex flex-col flex-grow items-center bg-gray-500 shadow-inner overflow-hidden">
      <div className="w-full hidden lg:flex flex-col items-center my-4">
        <Image
          src={"/albumcovers.png"}
          alt={"albumcovers"}
          width={100}
          height={100}
          className="w-1/3 mb-1"
        />
        <span className="text-white font-semibold">Your Guessed Songs</span>
      </div>
      <div className="flex flex-col items-start w-full overflow-auto flex-grow">
        {songData.map((song, index) => (
          <button
            key={index}
            onClick={() => handleSetSelectedSong(song)}
            className={cn(
              "flex justify-between w-full px-2 text-base",
              song.title === selectedSong?.title
                ? "bg-black text-green-400"
                : "text-white"
            )}
          >
            <span className="font-semibold">{song.title}</span>
            <span className="font-semibold">
              {formatSecondsBetween(song.start, song.end)}
            </span>
          </button>
        ))}
        {songData.length === 0 && (
          <span className="text-white text-center">
            No songs guessed yet. Head over to the{" "}
            <Link href={"/quiz"} className="text-blue-300 underline">
              Quiz
            </Link>{" "}
            to start guessing!
          </span>
        )}
      </div>
    </div>
  );
};

export default SongOverview;
