import Link from "next/link";

export default async function Home() {
  return (
    <div>
      <Link href={"/quiz"} className="text-blue-500 underline">
        Start Quiz
      </Link>
      <Link href={"/player"} className="text-blue-500 underline">
        Music Player
      </Link>
    </div>
  );
}
