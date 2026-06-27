import { cn } from "@/lib/utils.ts";
import { Minus, Square, X } from "lucide-react";
import type { ReactNode } from "react";

interface WindowWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function WindowWrapper({
  title,
  children,
  className,
  contentClassName,
}: WindowWrapperProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden border-r-4 border-b-4 border-l-4 border-t-4 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-200 p-1.5 shadow-2xl",
        className,
      )}
    >
      <div className="flex h-8 items-center justify-between bg-gradient-to-r from-blue-800 to-blue-500 px-2">
        <span className="truncate text-sm font-bold text-white">{title}</span>
        <div className="flex items-center gap-1">
          {[Minus, Square, X].map((Icon, i) => (
            <span
              key={i}
              className="flex h-5 w-5 items-center justify-center border-r-2 border-b-2 border-l-2 border-t-2 border-r-gray-500 border-b-gray-500 border-l-white border-t-white bg-gray-200 text-gray-800"
            >
              <Icon className="h-3 w-3" strokeWidth={3} />
            </span>
          ))}
        </div>
      </div>
      <div className={cn("flex flex-1 flex-col", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
