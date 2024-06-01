import { cn } from "@/lib/utils";
import { Maximize } from "lucide-react";
import React from "react";

export type LinkbarProps = {
  external: boolean;
  href: string;
  label: string;
};

interface WindowWrapperProps {
  title: string;
  links: LinkbarProps[];
  children: React.ReactNode;
  className?: string;
}

const WindowWrapper = ({
  title,
  links,
  children,
  className,
}: WindowWrapperProps) => {
  return (
    <div
      className={cn(
        "bg-gray-200 flex flex-col h-1/2 xl:h-2/3 w-full border-r-4 border-r-gray-400 border-b-4 border-b-gray-400 border-l-4 border-l-white border-t-4 border-t-white p-2 overflow-hidden",
        className
      )}
    >
      <div className="w-full bg-blue-800 h-8 flex items-center justify-between p-1">
        <span className="text-white font-semibold text-xs xl:text-base">
          {title}
        </span>
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
      <div className="w-full h-8 flex items-center justify-start p-1 gap-6 ml-4">
        {links.map((link) => (
          <a
            href={link.href}
            target={link.external ? "_blank" : ""}
            className="text-gray-700 underline"
          >
            {link.label}
          </a>
        ))}
      </div>
      <div className="w-full flex-grow flex flex-col items-center justify-end gap-6 border-2 border-gray-900 bg-xp bg-cover overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default WindowWrapper;
