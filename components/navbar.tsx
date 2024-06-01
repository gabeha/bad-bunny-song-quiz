"use client";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/quiz", label: "Quiz" },
  { href: "/player", label: "Music Player" },
];

const Navbar = () => {
  const pathname = usePathname();
  console.log(pathname);
  return (
    <div className="flex-grow w-full h-full items-center flex justify-center gap-4 lg:gap-8">
      {navigationLinks.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={cn(
            "text-blue-500 underline text-xl lg:text-2xl",
            pathname === link.href ? "text-purple-500" : ""
          )}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
