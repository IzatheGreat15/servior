
"use client";

import { IoCreateOutline, IoEllipsisVertical } from "react-icons/io5";
import type { BranchProduct } from "./types";

type Props = {
  products: BranchProduct[];
  search: string;
  onSearchChange: (value: string) => void;
  status: "All statuses" | "Active" | "Inactive";
  onStatusChange: (value: "All statuses" | "Active" | "Inactive") => void;
  onEdit: (product: BranchProduct) => void;
  onToggleAvailability: (id: string) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

export default function ProductTable({
  products,
  search,
  onSearchChange,
  status,
  onStatusChange,
  onEdit,
  onToggleAvailability,
  page,
  pageSize,
  onPageChange,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const start = products.length ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, products.length);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[#e2ebe5] bg-white shadow-sm w-full md:w-2/3">
      <div className="flex flex-col gap-3 border-b border-[#edf1ed] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-lg text-[#183b30]">
            Product list
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Products available for booking or purchase at this branch.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="w-full rounded-lg border border-[#dce7df] px-2.5 py-2 text-xs outline-none focus:border-[#13834e]"
            />
          </div>

          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value as "All statuses" | "Active" | "Inactive"
              )
            }
            aria-label="Filter by status"
            className="max-w-32 rounded-lg border border-[#dce7df] bg-white px-2 py-2 text-xs outline-none focus:border-[#13834e]"
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="bg-[#f6f9f7] text-sm font-semibold text-[#52685d]">
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Price / Unit</th>
              <th className="px-3 py-3">Quantity / Availability</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#edf1ed]">
            {pageProducts.map((product) => (
              <tr
                key={product.id}
                className="text-sm text-[#29483e] transition hover:bg-[#fbfdfb]"
              >
                <td className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#edf1ed] bg-[#f4f8f5]">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">🏸</span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="max-w-40 truncate font-semibold text-[#183b30]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 max-w-40 truncate text-xs text-slate-400">
                        {product.category}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold ${
                      product.type === "For rent"
                        ? "bg-[#eaf6ee] text-[#23784b]"
                        : "bg-[#eaf3ff] text-[#386b9b]"
                    }`}
                  >
                    {product.type}
                  </span>
                </td>

                <td className="whitespace-nowrap px-3 py-2 font-medium">
                  ₱{product.price.toLocaleString("en-PH")} / {product.unit}
                </td>

                <td className="whitespace-nowrap px-3 py-2 text-slate-500">
                  {product.trackInventory
                    ? `${product.quantity ?? 0} in stock`
                    : "Availability tracked separately"}
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      product.isAvailable
                        ? "bg-[#eaf6ee] text-[#23784b]"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {product.isAvailable ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#dce7df] px-2 py-1.5 font-semibold hover:bg-[#f4f8f5]"
                    >
                      <IoCreateOutline className="text-sm" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleAvailability(product.id)}
                      title={product.isAvailable ? "Deactivate product" : "Activate product"}
                      aria-label={product.isAvailable ? "Deactivate product" : "Activate product"}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#dce7df] text-slate-500 hover:bg-[#f4f8f5]"
                    >
                      <IoEllipsisVertical />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!pageProducts.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <p className="font-semibold text-[#29483e]">
                    No products found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try changing your search or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#edf1ed] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {start}–{end} of {products.length} products
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 w-8 rounded-lg border border-[#dce7df] text-sm text-[#29483e] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (pageNumber) =>
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - currentPage) <= 1
            )
            .map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${
                  pageNumber === currentPage
                    ? "bg-[#13834e] text-white"
                    : "border border-[#dce7df] text-[#29483e] hover:bg-[#f4f8f5]"
                }`}
              >
                {pageNumber}
              </button>
            ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 w-8 rounded-lg border border-[#dce7df] text-sm text-[#29483e] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
