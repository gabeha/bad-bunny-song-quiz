"use client";
import { readJson } from "@/app/actions/getSongData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface GuessModalProps {
  isOpen: boolean;
  closeDialog: () => void;
  songData: Awaited<ReturnType<typeof readJson>>[number] | null;
}

export function GuessModal({ isOpen, closeDialog, songData }: GuessModalProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-3/4 lg:w-full">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl lg:text-4xl w-full">
            <span className="bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 text-transparent bg-clip-text">
              Congratulations!
            </span>{" "}
            🎉
          </AlertDialogTitle>
          <div className="text-base w-full">
            <p>You really know your Music! 🎶</p>
            <p>
              This is indeed{" "}
              <span className="italic font-bold bg-gradient-to-r from-red-500 via-yellow-400 to-purple-600 text-transparent bg-clip-text text-lg lg:text-xl">
                {songData?.title}{" "}
              </span>{" "}
              by {songData?.artist} 🐰
            </p>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
            onClick={closeDialog}
          >
            <Link href="/player">Play Full Song!</Link>
          </AlertDialogAction>
          <AlertDialogAction
            className="rounded-none bg-gray-300 border-r-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white text-gray-800 hover:bg-gray-300 hover:text-gray-800 hover:scale-95"
            onClick={closeDialog}
          >
            Next Song!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
