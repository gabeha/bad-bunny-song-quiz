import { ScrollableImages } from "@/components/scrollable-images";
import { buttonVariants } from "@/components/ui/button";
import WindowWrapper, { LinkbarProps } from "@/components/window-wrapper";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

const Home = () => {
  return (
    <div className="flex-col flex flex-grow lg:flex-row h-full w-full items-center justify-between gap-4">
      <WindowWrapper title="❓ The why" links={links} className="order-1">
        <ScrollableImages />
      </WindowWrapper>
      <WindowWrapper
        title={"🌎 Bad Bunny Quiz"}
        links={links}
        className="order-2"
      >
        <div className="w-full h-full flex flex-col flex-grow justify-evenly items-center p-6">
          <p className="text-xl lg:text-4xl text-gray-800 italic font-bold">
            Test your knowledge of Bad Bunny&aposs most iconic <br />{" "}
            Yeh-Yeh-Yehs
          </p>
          <Link
            href={"/quiz"}
            className={cn(
              buttonVariants({}),
              "rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95 text-xl"
            )}
          >
            Start Quiz
          </Link>
        </div>
      </WindowWrapper>
    </div>
  );
};

export default Home;
