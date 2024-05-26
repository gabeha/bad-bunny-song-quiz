import { readJson } from "@/app/actions/getSongData";
import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
      <div className="w-full flex flex-col items-center my-4">
        <Image
          src={"/albumcovers.png"}
          alt={"albumcovers"}
          width={100}
          height={100}
          className="w-2/3 mb-1"
        />
        <span className="text-white font-semibold">
          The Bad Bunny Song Quiz
        </span>
      </div>
      <div className="flex flex-col items-start w-full overflow-auto flex-grow">
        {songData.map((song, index) => (
          <button
            key={index}
            onClick={() => handleSetSelectedSong(song)}
            className={cn(
              "flex justify-between w-full px-2",
              song.title === selectedSong.title
                ? "bg-black text-green-400"
                : "text-white"
            )}
          >
            <span className="font-semibold">{song.title}</span>
            <span className="font-semibold">3:27</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SongOverview;
