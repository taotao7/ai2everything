"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "首页" },
  { href: "/dashboard/create", label: "创建" },
  { href: "/dashboard/gallery", label: "画廊" },
  { href: "/explore", label: "发现" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            pathname === link.href ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
