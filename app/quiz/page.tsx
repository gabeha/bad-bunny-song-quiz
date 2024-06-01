import AudioQuiz from "@/components/audio/audio-quiz";
import { readJson } from "../actions/getSongData";
import WindowWrapper, { LinkbarProps } from "@/components/window-wrapper";

const links: LinkbarProps[] = [
  {
    external: true,
    href: "https://gabrielhauss.com",
    label: "My Website",
  },
  {
    external: true,
    href: "https://open.spotify.com/playlist/1uh30dUr8o40UqwqW6zRhk?si=91a077f751854361",
    label: "Playlist",
  },
  {
    external: false,
    href: "/disclaimer",
    label: "Disclaimer",
  },
];
export default async function Home() {
  const songData = await readJson();

  return (
    <WindowWrapper
      title={"The Ultimate Yeh-Yeh-Yeah Quiz"}
      links={links}
      className="h-full w-full"
    >
      <div className="h-full p-2 lg:p-8 w-full flex-grow">
        <AudioQuiz songData={songData} />
      </div>
    </WindowWrapper>
  );
}
