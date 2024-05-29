import { Maximize } from "lucide-react";
import React from "react";
import { readJson } from "../actions/getSongData";

const Disclaimer = async () => {
  const songData = await readJson();
  return (
    <div className="w-1/2 overflow-hidden h-2/3 text-lg bg-gray-200 border-r-4 border-r-gray-400 border-b-4 border-b-gray-400 border-l-4 border-l-white border-t-4 border-t-white">
      <div className="w-full bg-blue-800 h-8 flex items-center justify-between p-1">
        <div>
          <span className="text-white font-semibold">🎓 Legal Notice</span>
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
        <h2 className="text-3xl">Source Videos</h2>
        <p>
          The audio excerpts on this website were sourced from the following
          YouTube videos:
        </p>
        <ul>
          {songData.map((song) => (
            <li>
              <a href={song.url} target="_blank" className="underline">
                {song.title}
              </a>{" "}
              by {song.artist}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Disclaimer;
