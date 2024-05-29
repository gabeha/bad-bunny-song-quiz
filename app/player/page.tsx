import AudioPlayer from "@/components/audio/audio-player";

import { readJson } from "../actions/getSongData";

export default async function Home() {
  const songData = await readJson();
  const newSongData = songData.map((song) => {
    return {
      ...song,
      start: 0,
      end: song.duration,
    };
  });
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <AudioPlayer songData={newSongData} />
    </div>
  );
}
