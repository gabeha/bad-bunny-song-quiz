import AudioPlayer from "@/components/audio/audio-player";

import WindowWrapper, { LinkbarProps } from "@/components/window-wrapper";
import { readJson } from "../actions/getSongData";

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
  const newSongData = songData.map((song) => {
    return {
      ...song,
      start: 0,
      end: song.duration,
    };
  });
  return (
    <WindowWrapper title={"🎓 Legal Notice"} links={links} className="h-full">
      <div className="h-full p-2 lg:p-8 w-full">
        <AudioPlayer songData={newSongData} />
      </div>
    </WindowWrapper>
  );
}
