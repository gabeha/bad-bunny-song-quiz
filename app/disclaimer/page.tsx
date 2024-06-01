import { Maximize } from "lucide-react";
import React from "react";
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

const Disclaimer = async () => {
  const songData = await readJson();
  return (
    <WindowWrapper
      title={"Your correct guesses so far"}
      links={links}
      className="h-full"
    >
      <div className="p-2 h-full overflow-auto">
        <h1 className="text-6xl">Disclaimer</h1>
        <br />
        <p>
          This website is a personal side project created solely for the purpose
          of showcasing my web development skills. The site is intended for use
          by friends, family, and potential recruiters only. It is not designed
          or intended to generate any revenue.
        </p>
        <br />
        <h2 className="text-3xl">Copyright Notice</h2>
        <p>
          All music tracks and excerpts used on this website are the property of
          their respective copyright owners. The use of these tracks is for
          educational and demonstration purposes only. No ownership or
          affiliation with the artists or their record labels is implied.
        </p>
        <br />
        <h2 className="text-3xl">Use of Content</h2>
        <ol>
          <li>
            <strong>Educational and Demonstrative Use:</strong> The music
            excerpts and full tracks available on this website are used
            exclusively for educational and demonstrative purposes. The intent
            is to illustrate web development techniques and user interaction
            design.
          </li>
          <li>
            <strong>Non-Commercial Use:</strong> This website does not generate
            any form of income, whether through advertisements, subscriptions,
            or any other means. The content is provided free of charge and is
            accessible only to a limited audience.
          </li>
        </ol>
        <br />
        <h2 className="text-3xl">Copyright Infringement</h2>
        <p>
          If you are a copyright owner or an agent thereof, and you believe that
          any content on this website infringes upon your copyrights, please
          contact me at{" "}
          <a href="mailto:gabriel.hauss@gmail.com" className="underline">
            gabriel.hauss@gmail.com
          </a>
          . Upon receiving your notice, I will promptly remove the infringing
          content from the website.
        </p>
        <br />
        <h2 className="text-3xl">Acknowledgment</h2>
        <p>
          By using this website, you acknowledge that the purpose of the content
          is for personal and educational use only. You agree not to use the
          website or any content therein for any commercial purpose.
        </p>
        <p>Thank you for your understanding and cooperation.</p>
        <br />
        <h2 className="text-3xl">Sources</h2>
        <p>The images used on this website were sourced from:</p>
        <ul>
          <li>
            <a
              href="https://imgur.com/hvorfor-tage-til-nord-s-nder-eller-st-jylland-n-r-du-kan-opleve-dette-foran-sk-rmen-uGRFZEs"
              className="underline"
            >
              Windows XP background
            </a>
          </li>
        </ul>
        <br />
        <p>
          The audio excerpts on this website were sourced from the following
          YouTube videos:
        </p>
        <ul>
          {songData.map((song) => (
            <li key={song.title}>
              <a href={song.url} target="_blank" className="underline">
                {song.title}
              </a>{" "}
              by {song.artist}
            </li>
          ))}
        </ul>
      </div>
    </WindowWrapper>
  );
};

export default Disclaimer;
