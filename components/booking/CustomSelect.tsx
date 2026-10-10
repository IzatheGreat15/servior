"use client"

import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaSearch } from "react-icons/fa";
import type { IconType } from "react-icons";

type CustomSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: IconType;
  searchable?: boolean;
};

export default function CustomSelect({
  label,
  value,
  options,
  onChange,
  icon,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const Icon = icon;

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function selectOption(option: string) {
    onChange(option);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {/* Label */}
      <label className="text-sm font-medium text-[#102d29]">
        {label}
      </label>

      <div className="relative min-w-0" ref={wrapperRef}>
        {/* Select trigger */}
        <button
          type="button"
          className={`flex h-11 w-full items-center gap-2.5 rounded-lg border bg-white px-3 text-left transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#13834e]/15 ${
            open
              ? "border-[#13834e] ring-2 ring-[#13834e]/10"
              : "border-[#d8e2dc] hover:border-[#a9c4b4]"
          }`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {Icon && (
            <Icon
              className="shrink-0 text-[#6b8276]"
              size={17}
              aria-hidden="true"
            />
          )}

          <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#263f35]">
            {value}
          </span>

          <FaChevronDown
            className={`h-3 w-3 shrink-0 text-[#718579] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute left-0 right-0 top-full z-[60] mt-1 overflow-hidden rounded-lg border border-[#d8e2dc] bg-white shadow-lg shadow-[#102d29]/10">
            {/* Search */}
            {searchable && (
              <div className="border-b border-[#edf2ee] p-2">
                <div className="flex items-center gap-2 rounded-md border border-[#d8e2dc] bg-white px-2.5 transition-colors focus-within:border-[#13834e] focus-within:ring-2 focus-within:ring-[#13834e]/10">
                  <FaSearch
                    className="shrink-0 text-[#809187]"
                    size={12}
                    aria-hidden="true"
                  />

                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={`Search ${label.toLowerCase()}...`}
                    aria-label={`Search ${label.toLowerCase()}`}
                    className="h-9 min-w-0 flex-1 bg-transparent text-sm text-[#263f35] outline-none placeholder:text-[#97a69c]"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div
              className="max-h-60 overflow-y-auto p-1.5"
              role="listbox"
              aria-label={label}
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const selected = option === value;

                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      key={option}
                      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-100 ${
                        selected
                          ? "bg-[#e8f4ec] font-medium text-[#116b40]"
                          : "text-[#34483d] hover:bg-[#f0f8f3]"
                      }`}
                      onClick={() => selectOption(option)}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                          selected
                            ? "border-[#13834e] bg-[#13834e] text-white"
                            : "border-[#cbd8cf] text-transparent"
                        }`}
                        aria-hidden="true"
                      >
                        ✓
                      </span>

                      <span className="min-w-0 flex-1 break-words">
                        {option}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-5 text-center text-sm text-[#718579]">
                  No matching {label.toLowerCase()} found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
