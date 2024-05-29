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
    <NavigationMenu className="w-full mx-auto absolute top-10 inset-x-0 hidden 2xl:block">
      <NavigationMenuList className="gap-10 text-3xl">
        {navigationLinks.map((link) => (
          <NavigationMenuItem key={link.label}>
            <Link href={link.href} legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  "text-blue-500 underline",
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
