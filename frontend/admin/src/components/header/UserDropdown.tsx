"use client";

import React, { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useAuth } from "@/context/AuthContext";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const { user, signOut } = useAuth();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const displayName = user?.displayName || user?.username || "User";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        aria-label="Account menu"
        aria-expanded={isOpen}
        className="dropdown-toggle flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          {user?.avatarUrl && !avatarFailed ? (
            // Google's image host rejects some hotlinked requests that send a Referer.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" onError={() => setAvatarFailed(true)} className="h-full w-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </span>
        <span className="hidden max-w-40 truncate text-sm font-medium sm:block">{displayName}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 flex w-60 flex-col rounded-xl border border-gray-200 bg-white p-1.5 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="border-b border-gray-200 px-3 pb-2.5 pt-1.5 dark:border-gray-800">
          <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</span>
          {user?.username && <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">@{user.username}</span>}
        </div>
        <button
          onClick={() => {
            closeDropdown();
            signOut();
          }}
          className="mt-1.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          <LogOut className="h-4 w-4 text-gray-400" />
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
