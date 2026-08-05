import React, { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  disabled = false,
  label,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [prevDefaultValue, setPrevDefaultValue] = useState<string>(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  if (prevDefaultValue !== defaultValue) {
    setPrevDefaultValue(defaultValue);
    setSelectedValue(defaultValue);
  }

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

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ?? "";

  const openDropdown = () => {
    if (disabled) return;
    const idx = Math.max(
      0,
      options.findIndex((option) => option.value === selectedValue),
    );
    setActiveIndex(idx);
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (isOpen) setIsOpen(false);
    else openDropdown();
  };

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
  };

  const move = (direction: 1 | -1) => {
    setActiveIndex((prev) => {
      const len = options.length;
      if (len === 0) return -1;
      const next = prev + direction;
      if (next < 0) return len - 1;
      if (next >= len) return 0;
      return next;
    });
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        if (isOpen) {
          if (activeIndex >= 0 && options[activeIndex]) {
            handleSelect(options[activeIndex].value);
          }
        } else {
          openDropdown();
        }
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) openDropdown();
        else move(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) openDropdown();
        else move(-1);
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="select-options"
          aria-activedescendant={
            isOpen && activeIndex >= 0
              ? `select-option-${activeIndex}`
              : undefined
          }
          onClick={toggleDropdown}
          onKeyDown={handleTriggerKeyDown}
          className={`flex min-h-11 w-full cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300 ${
            isOpen
              ? "border-brand-300 shadow-focus-ring dark:border-brand-300"
              : ""
          }`}
        >
          <span
            className={`flex-1 truncate text-sm ${
              selectedLabel
                ? "text-gray-800 dark:text-white/90"
                : "text-gray-400 dark:text-white/50"
            }`}
          >
            {selectedLabel || placeholder}
          </span>

          <svg
            className={`shrink-0 stroke-current transition-transform ${
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
        </div>

        {isOpen && (
          <ul
            role="listbox"
            id="select-options"
            className="absolute left-0 top-full z-40 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-white/50">
                No options
              </li>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === selectedValue;
                const isActive = index === activeIndex;
                return (
                  <li key={option.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      id={`select-option-${index}`}
                      onClick={() => handleSelect(option.value)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition ${
                        isSelected
                          ? "bg-brand-500/10 text-brand-600 dark:bg-gray-700 dark:text-white/90"
                          : isActive
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90"
                            : "text-gray-700 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span className="truncate">{option.label}</span>
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
        )}
      </div>
    </div>
  );
};

export default Select;
