"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface QuizSuggestionsProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  error: boolean;
}

export function QuizSuggestions({
  suggestions,
  value,
  onChange,
  error,
}: QuizSuggestionsProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "rounded-none border-x-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white bg-gray-100 w-[300px] justify-between",
            error ? "input-error border-red-500" : ""
          )}
        >
          {value
            ? suggestions.find((suggestion) => suggestion === value)
            : "Yeh Yeh Yey Yeah..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-none border-x-2 border-r-gray-400 border-b-2 border-b-gray-400 border-l-2 border-l-white border-t-2 border-t-white bg-gray-100 ">
        <Command>
          <CommandInput
            placeholder="Search song..."
            value={value}
            onValueChange={(inputValue) => onChange(inputValue)}
          />
          <CommandList>
            <CommandEmpty>No suggestions found.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === suggestion ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
