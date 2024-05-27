import AudioPlayer from "@/components/audio/audio-player";

import { readJson } from "../actions/getSongData";

export default async function Home() {
  const songData = await readJson();
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <AudioPlayer songData={songData} />
    </div>
  );
}
