"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp } from "lucide-react";

const images = ["rewind3.jpg", "rewind5.jpg", "rewind1.jpg", "rewind2.jpg"];

export function ScrollableImages() {
  const scrollableDivRef = useRef<HTMLDivElement | null>(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const handleScroll = () => {
    if (scrollableDivRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        scrollableDivRef.current;
      setIsScrolledToTop(scrollTop === 0);
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 1);
    }
  };

  const handleScrollDown = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollBy({ top: 300, behavior: "smooth" });
    }
  };

  const handleScrollUp = () => {
    if (scrollableDivRef.current) {
      scrollableDivRef.current.scrollBy({ top: -300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScroll);
      return () => scrollableDiv.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div
      className="relative h-2/3 overflow-auto no-scrollbar rounded-lg border-2 border-gray-300 bg-gray-100 shadow-xl "
      ref={scrollableDivRef}
    >
      <div className="sticky top-4 flex justify-center ">
        {!isScrolledToTop && (
          <button onClick={handleScrollUp} className="play-pause-button">
            <ArrowUp className="shrink-0 grow-0 h-8 w-8" />
          </button>
        )}
      </div>
      {images.map((image) => (
        <Image
          priority={true}
          key={image}
          src={`/${image}`}
          alt={image}
          width={500}
          height={300}
          className="shadow-xl object-contain"
        />
      ))}
      <div className="sticky bottom-4 flex justify-center">
        {!isScrolledToBottom && (
          <button onClick={handleScrollDown} className="play-pause-button">
            <ArrowDown className="shrink-0 grow-0 h-8 w-8" />
          </button>
        )}
      </div>
    </div>
  );
}
