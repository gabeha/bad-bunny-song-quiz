import fs from "fs";
import path from "path";

export async function readJson(): Promise<
  {
    title: string;
    artist: string;
    album: string;
    url: string;
    start: number;
    end: number;
    duration: number;
  }[]
> {
  const jsonFilePath = path.join(process.cwd(), "public", "songs.json");
  const fileContents = await fs.promises.readFile(jsonFilePath, "utf8");
  return JSON.parse(fileContents);
}
