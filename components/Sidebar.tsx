"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "대시보드", icon: "◈" },
  { href: "/jobs", label: "공고 관리", icon: "◉" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen flex flex-col px-4 pt-8 pb-6 bg-white border-r border-[#E8E4DE]">
      <div className="mb-8 px-2">
        <span className="text-3xl font-bold tracking-tight text-[#2E4A7A]">Clipply</span>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2E4A7A]/10 text-[#2E4A7A]"
                  : "text-[#2D2D2D]/50 hover:bg-[#E8E4DE] hover:text-[#2D2D2D]"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
