import { readJson } from "@/app/actions/getSongData";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SongData = Awaited<ReturnType<typeof readJson>>;

interface QuizStore {
  songsGuessed: SongData;
  songsGuessedWithCroppedEnd: SongData;
  resetSongsGuessed: () => void;
  addSongGuessed: (song: SongData[number]) => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      songsGuessed: [],
      songsGuessedWithCroppedEnd: [],
      resetSongsGuessed: () => {
        set({ songsGuessed: [] });
        set({ songsGuessedWithCroppedEnd: [] });
      },
      addSongGuessed: (song) => {
        const isSongGuessed = get().songsGuessed.some(
          (guessedSong) => guessedSong.title === song.title
        );
        if (isSongGuessed) {
          return;
        }
        set((state) => ({
          songsGuessedWithCroppedEnd: [
            ...state.songsGuessedWithCroppedEnd,
            song,
          ],
        }));
        song = { ...song, end: song.duration };
        set((state) => ({
          songsGuessed: [...state.songsGuessed, song],
        }));
      },
    }),
    {
      name: "quiz-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
