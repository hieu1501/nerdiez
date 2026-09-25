"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import UserDropdown from "@/components/header/UserDropdown";
import BrandMark from "@/components/common/BrandMark";
import { useSidebar } from "@/context/SidebarContext";

const titles: [RegExp, string][] = [
  [/^\/articles\/new/, "New article"],
  [/^\/articles\/\d+\/edit/, "Edit article"],
  [/^\/articles\/\d+/, "Article"],
  [/^\/articles/, "Articles"],
  [/^\/topics\/\d+/, "Topic"],
  [/^\/topics/, "Topics"],
  [/^\/categories/, "Categories"],
  [/^\/tags/, "Tags"],
  [/^\/$/, "Dashboard"],
];

export default function AppHeader() {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const title = titles.find(([pattern]) => pattern.test(pathname))?.[1] ?? "";

  const handleToggle = () => {
    if (window.innerWidth >= 1024) toggleSidebar();
    else toggleMobileSidebar();
  };

  const DesktopIcon = isExpanded ? PanelLeftClose : PanelLeftOpen;
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-dark">
      <div className="flex w-full items-center justify-between gap-3 px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={handleToggle}
            aria-label="Toggle sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <span className="lg:hidden">{isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</span>
            <DesktopIcon className="hidden h-5 w-5 lg:block" />
          </button>
          <Link href="/" className="lg:hidden" aria-label="Dashboard"><BrandMark className="h-7 w-7" /></Link>
          <p className="hidden truncate text-sm text-gray-500 sm:block dark:text-gray-400">Admin{title && <><span className="mx-2 text-gray-300 dark:text-gray-700">/</span><span className="font-medium text-gray-900 dark:text-white">{title}</span></>}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggleButton />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
