"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderTree, LayoutDashboard, MessagesSquare, Tags, type LucideIcon } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import BrandMark from "@/components/common/BrandMark";

type NavItem = { name: string; path: string; icon: LucideIcon; hint: string };

const sections: { title: string; items: NavItem[] }[] = [
  { title: "Overview", items: [{ name: "Dashboard", path: "/", icon: LayoutDashboard, hint: "Activity and review queue" }] },
  {
    title: "Content",
    items: [
      { name: "Articles", path: "/articles", icon: FileText, hint: "Shared experiences and use cases" },
      { name: "Topics", path: "/topics", icon: MessagesSquare, hint: "Questions and their replies" },
    ],
  },
  {
    title: "Organize",
    items: [
      { name: "Categories", path: "/categories", icon: FolderTree, hint: "Subjects shown on the site" },
      { name: "Tags", path: "/tags", icon: Tags, hint: "Shared labels" },
    ],
  },
];

export default function AppSidebar() {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const open = isExpanded || isHovered || isMobileOpen;
  const isActive = (path: string) => path === pathname || (path !== "/" && pathname.startsWith(`${path}/`));

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-gray-100 px-3 transition-[width,transform] duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-950 lg:mt-0
        ${open ? "w-[260px]" : "w-[76px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex h-16 items-center gap-2.5 px-2 ${open ? "" : "lg:justify-center"}`}>
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          {open && <span className="leading-tight">
            <span className="block text-base font-bold tracking-tight text-gray-900 dark:text-white">Nerdiez</span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">Admin</span>
          </span>}
        </Link>
      </div>
      <nav className="no-scrollbar mt-4 flex flex-col gap-6 overflow-y-auto pb-6" aria-label="Admin sections">
        {sections.map((section) => <div key={section.title}>
          <h2 className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 ${open ? "" : "lg:sr-only"}`}>{section.title}</h2>
          <ul className="space-y-1">
            {section.items.map(({ name, path, icon: Icon, hint }) => {
              const active = isActive(path);
              return <li key={path}>
                <Link href={path} title={open ? undefined : name} aria-current={active ? "page" : undefined}
                  onClick={() => { if (isMobileOpen) toggleMobileSidebar(); }}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${open ? "" : "lg:justify-center"} ${active ? "bg-white text-brand-600 shadow-theme-xs dark:bg-brand-500/15 dark:text-brand-400" : "text-gray-600 hover:bg-gray-200/70 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"}`}>
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  {open && <span className="min-w-0">
                    <span className="block">{name}</span>
                    <span className={`block truncate text-[11px] font-normal ${active ? "text-brand-600/70 dark:text-brand-400/70" : "text-gray-400"}`}>{hint}</span>
                  </span>}
                </Link>
              </li>;
            })}
          </ul>
        </div>)}
      </nav>
    </aside>
  );
}
