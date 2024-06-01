import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/navbar";

const orbitron = Orbitron({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bad Bunny Song Quiz",
  description: "Test your knowledge of Bad Bunny's most iconic Yeh-Yeh-Yehs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤠</text></svg>"
        />
      </head>
      <body
        className={cn(
          orbitron.className,
          "bg-mobile xl:bg-desktop xl:bg-cover xl:bg-center"
        )}
      >
        <Navbar />
        <main className="flex-col h-screen items-center justify-center container flex">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
