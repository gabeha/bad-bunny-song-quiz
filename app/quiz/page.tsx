import AudioQuiz from "@/components/audio/audio-quiz";
import { readJson } from "../actions/getSongData";
export default async function Home() {
  const songData = await readJson();

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div>
        <AudioQuiz songData={songData} />
      </div>
    </div>
  );
}
