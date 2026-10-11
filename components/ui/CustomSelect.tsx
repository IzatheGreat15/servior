"use client";

import { useState, useRef, useEffect } from "react";
import { LuCheck, LuChevronDown } from "react-icons/lu";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
};

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      id={id}
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((previous) => !previous)}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2.5 text-left text-sm outline-none transition ${
          open
            ? "border-[#13834e] ring-2 ring-[#13834e]/10"
            : "border-[#d8e2dc] hover:border-[#a8c5b3]"
        }`}
      >
        <span
          className={
            selectedOption ? "text-[#102d29]" : "text-slate-400"
          }
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <LuChevronDown
          size={16}
          className={`shrink-0 text-[#64756b] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={placeholder}
          className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#deece3] bg-white p-1.5 shadow-lg shadow-[#102d29]/10"
        >
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    selected
                      ? "bg-[#e8f4ec] font-medium text-[#13834e]"
                      : "text-[#102d29] hover:bg-[#f3f8f4]"
                  }`}
                >
                  <span>{option.label}</span>
                  {selected && <LuCheck size={16} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}