
"use client";

import {
  IoAddOutline,
  IoBasketballOutline,
  IoEllipsisHorizontal,
  IoGridOutline,
  IoLeafOutline,
  IoPricetagOutline,
  IoShirtOutline,
  IoTennisballOutline,
  IoTicketOutline,
} from "react-icons/io5";
import type { ProductCategory } from "./types";

type Props = {
  onAddProduct: () => void;
  activeType: "All" | "For rent" | "For sale";
  onTypeChange: (type: "All" | "For rent" | "For sale") => void;
  activeCategory: "All" | ProductCategory;
  onCategoryChange: (category: "All" | ProductCategory) => void;
  typeCounts: Record<"All" | "For rent" | "For sale", number>;
  categoryCounts: Record<string, number>;
};

const itemClass = (active: boolean) =>
  `flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition ${
    active
      ? "bg-[#eaf6ee] font-semibold text-[#176b43]"
      : "text-[#496158] hover:bg-[#f4f8f5]"
  }`;

export default function ProductsSidebar({
  onAddProduct,
  activeType,
  onTypeChange,
  activeCategory,
  onCategoryChange,
  typeCounts,
  categoryCounts,
}: Props) {
  return (
    <aside className="h-fit rounded-xl border border-[#e2ebe5] bg-white p-3.5 shadow-sm w-full md:w-1/3">
      <h2 className="text-lg font-bold text-[#183b30]">Products</h2>
      <p className="mt-1 text-sm leading-4 text-slate-500">
        Manage items for rent or sale at this branch.
      </p>

      <button
        type="button"
        onClick={onAddProduct}
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#13834e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#0f6d40]"
      >
        <IoAddOutline className="text-base" />
        Add product
      </button>

      <div className="mt-4 space-y-1">
        <button
          type="button"
          onClick={() => onTypeChange("All")}
          className={itemClass(activeType === "All")}
        >
          <span className="flex items-center gap-2">
            <IoGridOutline className="text-sm" />
            All products
          </span>
          <span>{typeCounts.All}</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("For rent")}
          className={itemClass(activeType === "For rent")}
        >
          <span className="flex items-center gap-2">
            <IoTicketOutline className="text-sm" />
            For rent
          </span>
          <span>{typeCounts["For rent"]}</span>
        </button>

        <button
          type="button"
          onClick={() => onTypeChange("For sale")}
          className={itemClass(activeType === "For sale")}
        >
          <span className="flex items-center gap-2">
            <IoBasketballOutline className="text-sm" />
            For sale
          </span>
          <span>{typeCounts["For sale"]}</span>
        </button>
      </div>

      <div className="my-4 border-t border-[#edf1ed]" />

      <h3 className="mb-2 text-sm font-bold text-[#183b30]">
        Categories
      </h3>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onCategoryChange("All")}
          className={itemClass(activeCategory === "All")}
        >
          <span className="flex items-center gap-2">
            <IoGridOutline className="text-sm" />
            All categories
          </span>
          <span>
            {Object.values(categoryCounts).reduce(
              (sum, count) => sum + count,
              0
            )}
          </span>
        </button>

        {(
          [
            ["Rackets & Paddles", IoTennisballOutline],
            ["Balls & Shuttlecocks", IoBasketballOutline],
            ["Accessories", IoShirtOutline],
            ["Others", IoEllipsisHorizontal],
          ] as const
        ).map(([category, Icon]) => (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={itemClass(activeCategory === category)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="shrink-0 text-sm" />
              <span className="truncate">{category}</span>
            </span>
            <span>{categoryCounts[category] ?? 0}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
