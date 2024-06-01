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
    <NavigationMenu className="w-full mx-auto inset-x-0 block">
      <NavigationMenuList className="gap-10 text-3xl">
        {navigationLinks.map((link) => (
          <NavigationMenuItem key={link.label}>
            <Link href={link.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  "text-blue-500 underline text-xl lg:text-4xl",
                  pathname === link.href ? "text-purple-500" : ""
                )}
              >
                {link.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
