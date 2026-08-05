import React, { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  text: string;
  selected?: boolean;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
}

const CHIP_LIMIT = 3;

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false,
}) => {
  const [selectedOptions, setSelectedOptions] =
    useState<string[]>(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      searchRef.current?.focus();
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      option.text.toLowerCase().includes(q),
    );
  }, [options, query]);

  const openDropdown = () => {
    if (disabled) return;
    setQuery("");
    setIsOpen(true);
  };

  const closeDropdown = () => setIsOpen(false);

  const toggleDropdown = () => {
    if (disabled) return;
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleSelect = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.includes(optionValue)
      ? selectedOptions.filter((value) => value !== optionValue)
      : [...selectedOptions, optionValue];
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const removeOption = (optionValue: string) => {
    const newSelectedOptions = selectedOptions.filter(
      (value) => value !== optionValue,
    );
    setSelectedOptions(newSelectedOptions);
    if (onChange) onChange(newSelectedOptions);
  };

  const selectedItems = selectedOptions
    .map((value) => ({
      value,
      text: options.find((option) => option.value === value)?.text || "",
    }))
    .filter((item) => item.text !== "");

  const visibleChips = selectedItems.slice(0, CHIP_LIMIT);
  const overflowCount = selectedItems.length - visibleChips.length;

  return (
    <div ref={containerRef} className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        {label}
      </label>

      <div className="relative">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={toggleDropdown}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleDropdown();
            }
          }}
          className={`flex min-h-11 w-full cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300 ${
            isOpen
              ? "border-brand-300 shadow-focus-ring dark:border-brand-300"
              : ""
          }`}
        >
          <span className="flex flex-1 flex-wrap items-center gap-1.5">
            {visibleChips.length > 0 ? (
              <>
                {visibleChips.map((item) => (
                  <span
                    key={item.value}
                    className="group flex items-center gap-1 rounded-full bg-gray-100 py-1 pl-2.5 pr-1.5 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90"
                  >
                    <span className="max-w-28 truncate">{item.text}</span>
                    <span
                      role="button"
                      aria-label={`Remove ${item.text}`}
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOption(item.value);
                      }}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                    >
                      <svg
                        className="fill-current"
                        width="12"
                        height="12"
                        viewBox="0 0 14 14"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                        />
                      </svg>
                    </span>
                  </span>
                ))}
                {overflowCount > 0 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    +{overflowCount} more
                  </span>
                )}
              </>
            ) : (
              <span className="text-sm text-gray-400 dark:text-white/50">
                Select topics...
              </span>
            )}
          </span>

          <span className="flex items-center">
            <svg
              className={`stroke-current transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {isOpen && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-40 mt-1.5 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 p-2 dark:border-gray-800">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 outline-hidden transition focus:border-brand-300 dark:border-gray-700 dark:text-white/90 dark:placeholder:text-white/50 dark:focus:border-brand-300"
              />
            </div>

            <ul className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-gray-400 dark:text-white/50">
                  No results
                </li>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selectedOptions.includes(option.value);
                  return (
                    <li key={option.value} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition ${
                          isSelected
                            ? "bg-brand-500/10 text-brand-600 dark:bg-gray-700 dark:text-white/90"
                            : "text-gray-700 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-800"
                        }`}
                      >
                        <span className="truncate">{option.text}</span>
                        {isSelected && (
                          <svg
                            className="shrink-0 fill-current"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M13.8536 3.64645C14.0488 3.84171 14.0488 4.15829 13.8536 4.35355L6.35355 11.8536C6.15829 12.0488 5.84171 12.0488 5.64645 11.8536L2.14645 8.35355C1.95118 8.15829 1.95118 7.84171 2.14645 7.64645C2.34171 7.45118 2.65829 7.45118 2.85355 7.64645L6 10.7929L13.1464 3.64645C13.3417 3.45118 13.6583 3.45118 13.8536 3.64645Z"
                            />
                          </svg>
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelect;
