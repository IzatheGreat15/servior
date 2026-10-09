"use client";

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
    <div className="filter-field">
      <span className="filter-label">{label}</span>

      <div className="custom-select" ref={wrapperRef}>
        <button
          type="button"
          className={`filter-control custom-select-trigger ${
            open ? "is-open" : ""
          }`}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="field-icon" aria-hidden="true">
            {Icon && <Icon />}
          </span>

          <span className="custom-select-value">{value}</span>

          <span
            className={`custom-select-chevron ${
              open ? "rotated" : ""
            }`}
            aria-hidden="true"
          >
            <FaChevronDown className="w-3" />
          </span>
        </button>

        {open && (
          <div className="custom-select-menu">
            {searchable && (
              <div className="custom-select-search">
                <span aria-hidden="true">
                    <FaSearch />
                </span>
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  aria-label={`Search ${label.toLowerCase()}`}
                />
              </div>
            )}

            <div className="custom-select-options" role="listbox" aria-label={label}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const selected = option === value;

                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      key={option}
                      className={`custom-select-option ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => selectOption(option)}
                    >
                      <span className="option-indicator">
                        {selected ? "✓" : ""}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })
              ) : (
                <p className="custom-select-empty">
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