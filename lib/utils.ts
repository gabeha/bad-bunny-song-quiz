import { type ClassValue, clsx } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (time: number) => {
  return moment.utc(time * 1000).format("mm:ss");
};

export const formatSecondsBetween = (start: number, end: number) => {
  return moment.utc((end - start) * 1000).format("mm:ss");
};
