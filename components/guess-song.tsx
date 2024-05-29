"use client";

import { readJson } from "@/app/actions/getSongData";
import { useQuizStore } from "@/stores/quizStore";

import { zodResolver } from "@hookform/resolvers/zod";
import { set, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { stringSimilarity } from "string-similarity-js";
import { GuessModal } from "./guess-modal";
import { QuizSuggestions } from "./quiz-suggestions";

const FormSchema = z.object({
  songtitle: z.string(),
});

type Song = Awaited<ReturnType<typeof readJson>>[number];

interface GuessSongProps {
  allSongs: Awaited<ReturnType<typeof readJson>>;
  selectedSong: Song | null;
  nextSong: () => void;
}

export function GuessSong({
  allSongs,
  selectedSong,
  nextSong,
}: GuessSongProps) {
  const { songsGuessed } = useQuizStore();
  const [songGuessedCorrectly, setSongGuessedCorrectly] = useState<Song | null>(
    null
  );
  const { addSongGuessed } = useQuizStore();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(
    allSongs
      .filter((song) => {
        return !songsGuessed.some(
          (guessedSong) => guessedSong.title === song.title
        );
      })
      .map((song) => song.title)
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>("");

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => {
    setIsOpen(false);
    nextSong();
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      songtitle: "",
    },
  });

  useEffect(() => {
    setSuggestions(
      allSongs
        .filter((song) => {
          return !songsGuessed.some(
            (guessedSong) => guessedSong.title === song.title
          );
        })
        .map((song) => song.title)
    );
    setSelectedSuggestion("");
  }, [form.control._fields, allSongs, songsGuessed]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!selectedSong) return;
    const similarity = stringSimilarity(
      data.songtitle || selectedSuggestion,
      selectedSong.title
    );
    console.log(similarity);
    if (similarity > 0.8) {
      setSongGuessedCorrectly(selectedSong);
      addSongGuessed(selectedSong);
      form.reset();
      setSelectedSuggestion("");
      setSuggestions(
        allSongs
          .filter((song) => {
            return !songsGuessed.some(
              (guessedSong) => guessedSong.title === song.title
            );
          })
          .map((song) => song.title)
      );
      openDialog();
    } else {
      form.setError("songtitle", {
        type: "manual",
        message: "Incorrect song title. Try again!",
      });
    }
  }

  const filterFunction = (inputValue: string) => {
    const newSuggestions = allSongs
      .filter((song) => {
        return !songsGuessed.some(
          (guessedSong) => guessedSong.title === song.title
        );
      })
      .map((song) => song.title)
      .filter((title) =>
        title.toLowerCase().includes(inputValue.toLowerCase())
      );
    setSuggestions(newSuggestions);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="songtitle"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col items-center justify-between">
                <FormLabel className="font-bold italic text-6xl bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 text-transparent bg-clip-text w-full text-center mb-4 py-4">
                  Which song is this?
                </FormLabel>
                <div className="flex gap-4 relative">
                  <FormControl>
                    <QuizSuggestions
                      suggestions={suggestions}
                      value={selectedSuggestion}
                      onChange={(value) => {
                        setSelectedSuggestion(value);
                        field.onChange(value); // Update the form field value
                        filterFunction(value);
                      }}
                      error={fieldState.error ? true : false}
                    />
                  </FormControl>
                  <Button className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95">
                    Submit
                  </Button>
                </div>
                <FormDescription className="text-base">
                  If you guess correctly, you'll unlock the entire song in the{" "}
                  <Link href="/player" className="text-blue-500 underline">
                    music player
                  </Link>
                  !
                </FormDescription>
              </FormItem>
            )}
          />
        </form>
      </Form>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <Confetti className="z-[100]" />
        </div>
      )}
      <GuessModal
        isOpen={isOpen}
        closeDialog={closeDialog}
        songData={songGuessedCorrectly}
      ></GuessModal>
    </div>
  );
}
