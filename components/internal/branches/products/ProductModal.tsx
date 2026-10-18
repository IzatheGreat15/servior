
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import {
  IoCloseOutline,
  IoCloudUploadOutline,
  IoCubeOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  PRODUCT_CATEGORIES,
  type BranchProduct,
} from "./types";

type Props = {
  open: boolean;
  product: BranchProduct | null;
  onClose: () => void;
  onSave: (product: BranchProduct) => void;
  onImageUpload?: (file: File) => Promise<string>;
};

const emptyProduct = (): BranchProduct => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  type: "For rent",
  category: "Rackets & Paddles",
  price: 0,
  unit: "hour",
  quantity: 0,
  trackInventory: true,
  isAvailable: true,
  imageUrl: "",
});

const inputClass =
  "w-full rounded-xl border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none transition placeholder:text-slate-400 focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10";

const labelClass =
  "mb-1.5 block text-sm font-medium text-[#29483e]";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProductModal({
  open,
  product,
  onClose,
  onSave,
  onImageUpload,
}: Props) {
  const [form, setForm] = useState<BranchProduct>(emptyProduct());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the form whenever the modal opens or the product changes.
  useEffect(() => {
    if (!open) return;

    setForm(product ? { ...product } : emptyProduct());
    setErrors({});
    setImageFile(null);
    setImageError("");
    setImagePreview(product?.imageUrl ?? "");
    setIsSaving(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open, product]);

  // Generate and clean up a local preview URL for a selected image.
  useEffect(() => {
    if (!imageFile) return;

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [imageFile]);

  const update = <K extends keyof BranchProduct>(
    key: K,
    value: BranchProduct[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [key]: "",
    }));
  };

  const handleImageSelection = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image size must not exceed 5 MB.");
      return;
    }

    setImageFile(file);
    setImageError("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setImageError("");
    update("imageUrl", "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSaving) return;

    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Product name is required.";
    }

    if (
      !Number.isFinite(form.price) ||
      form.price < 0 ||
      form.price === ("" as unknown as number)
    ) {
      nextErrors.price = "Enter a valid price.";
    }

    if (
      form.trackInventory &&
      (
        form.quantity === null ||
        !Number.isInteger(form.quantity) ||
        form.quantity < 0
      )
    ) {
      nextErrors.quantity =
        "Stock must be a whole number of 0 or more.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setImageError("");

    try {
      let imageUrl = form.imageUrl;

      // Upload the selected file if an upload handler was provided.
      if (imageFile) {
        if (!onImageUpload) {
          setImageError(
            "Image storage is not configured. Please configure an upload handler before saving a new image."
          );
          return;
        }

        imageUrl = await onImageUpload(imageFile);
      }

      onSave({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        imageUrl,
        quantity: form.trackInventory ? form.quantity : null,
      });
    } catch (error) {
      console.error("Failed to save product:", error);

      setImageError(
        imageFile
          ? "The image could not be uploaded. Please try again."
          : "The product could not be saved. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // All hooks must be declared before this conditional return.
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d29]/45 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSaving
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e2ebe5] bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5eee8] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-xl text-[#13834e]">
              <IoCubeOutline />
            </div>

            <div>
              <h2
                id="product-modal-title"
                className="text-base font-bold text-[#102d29]"
              >
                {product ? "Edit product" : "Add product"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Configure a product offered at this branch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-[#f2f7f3] hover:text-[#102d29] disabled:opacity-50"
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Product name */}
          <div>
            <label htmlFor="product-name" className={labelClass}>
              Product name <span className="text-rose-500">*</span>
            </label>

            <input
              id="product-name"
              type="text"
              required
              maxLength={100}
              value={form.name}
              onChange={(event) =>
                update("name", event.target.value)
              }
              placeholder="e.g. Pickleball Paddle (Pro)"
              className={`${inputClass} ${
                errors.name ? "border-rose-400" : ""
              }`}
            />

            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="product-description"
              className={labelClass}
            >
              Description
            </label>

            <textarea
              id="product-description"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(event) =>
                update("description", event.target.value)
              }
              placeholder="Describe the product and its features..."
              className={`${inputClass} resize-y`}
            />

            <p className="mt-1 text-right text-[11px] text-slate-400">
              {form.description.length}/500
            </p>
          </div>

          {/* Product type and category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-type" className={labelClass}>
                Product type
              </label>

              <select
                id="product-type"
                value={form.type}
                onChange={(event) =>
                  update(
                    "type",
                    event.target.value as BranchProduct["type"]
                  )
                }
                className={inputClass}
              >
                <option value="For rent">For rent</option>
                <option value="For sale">For sale</option>
              </select>

              <p className="mt-1 text-[11px] text-slate-400">
                {form.type === "For rent"
                  ? "Customers pay to use this item."
                  : "Customers purchase this item."}
              </p>
            </div>

            <div>
              <label
                htmlFor="product-category"
                className={labelClass}
              >
                Category
              </label>

              <select
                id="product-category"
                value={form.category}
                onChange={(event) =>
                  update(
                    "category",
                    event.target.value as BranchProduct["category"]
                  )
                }
                className={inputClass}
              >
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price and unit */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="product-price" className={labelClass}>
                Price (₱) <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  ₱
                </span>

                <input
                  id="product-price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    update(
                      "price",
                      event.target.value === ""
                        ? ("" as unknown as number)
                        : Number(event.target.value)
                    )
                  }
                  className={`${inputClass} pl-8 ${
                    errors.price ? "border-rose-400" : ""
                  }`}
                  placeholder="0.00"
                />
              </div>

              {errors.price && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="product-unit" className={labelClass}>
                Price unit
              </label>

              <select
                id="product-unit"
                value={form.unit}
                onChange={(event) =>
                  update("unit", event.target.value)
                }
                className={inputClass}
              >
                {(
                  [
                    ["hour", "Per hour"],
                    ["session", "Per session"],
                    ["piece", "Per piece"],
                    ["set", "Per set"],
                    ["tube", "Per tube"],
                    ["day", "Per day"],
                  ] as const
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-xl border border-[#e2ebe5] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#29483e]">
                  Inventory management
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Track how many units are available at this branch.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={form.trackInventory}
                aria-label="Track inventory"
                onClick={() =>
                  update("trackInventory", !form.trackInventory)
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  form.trackInventory
                    ? "bg-[#13834e]"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.trackInventory
                      ? "left-[22px]"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {form.trackInventory && (
              <div className="mt-4">
                <label
                  htmlFor="product-quantity"
                  className={labelClass}
                >
                  Stock quantity
                </label>

                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity ?? 0}
                  onChange={(event) =>
                    update(
                      "quantity",
                      event.target.value === ""
                        ? ("" as unknown as number)
                        : Number(event.target.value)
                    )
                  }
                  className={`${inputClass} ${
                    errors.quantity ? "border-rose-400" : ""
                  }`}
                />

                {errors.quantity && (
                  <p className="mt-1 text-xs text-rose-600">
                    {errors.quantity}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product image upload */}
          <div>
            <label className={labelClass}>
              Product image
              <span className="ml-1 font-normal text-slate-400">
                (Optional)
              </span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelection}
              className="hidden"
            />

            {imagePreview ? (
              <div className="flex items-center gap-4 rounded-xl border border-[#d8e2dc] bg-[#fbfdfb] p-3">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[#e2ebe5] bg-[#f2f7f3]">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#29483e]">
                    {imageFile?.name ?? "Current product image"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {imageFile
                      ? `${(imageFile.size / 1024).toFixed(0)} KB`
                      : "Existing image"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="rounded-lg border border-[#d8e2dc] px-3 py-1.5 text-xs font-semibold text-[#29483e] transition hover:bg-[#edf8f1]"
                    >
                      Change image
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                      <IoTrashOutline />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#b8d7c4] bg-[#fbfdfb] px-4 py-8 text-center transition hover:border-[#13834e] hover:bg-[#edf8f1]"
              >
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5ec] text-2xl text-[#13834e]">
                  <IoCloudUploadOutline />
                </span>

                <span className="text-sm font-semibold text-[#29483e]">
                  Click to upload an image
                </span>

                <span className="mt-1 text-xs text-slate-500">
                  JPG, PNG, or WEBP · Maximum 5 MB
                </span>
              </button>
            )}

            {imageError && (
              <p
                role="alert"
                className="mt-2 text-xs font-medium text-rose-600"
              >
                {imageError}
              </p>
            )}
          </div>

          {/* Availability */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-[#f5f9f6] p-3.5">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) =>
                update("isAvailable", event.target.checked)
              }
              className="mt-0.5 h-4 w-4 accent-[#13834e]"
            />

            <span>
              <span className="block text-sm font-semibold text-[#29483e]">
                Active and available
              </span>

              <span className="mt-1 block text-xs leading-5 text-slate-500">
                Allow customers to see and select this product when
                booking or purchasing.
              </span>
            </span>
          </label>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#edf1ed] pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-[#d8e2dc] px-4 py-2.5 text-sm font-semibold text-[#29483e] transition hover:bg-[#f5f9f6] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-[#13834e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f6d40] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving
                ? "Saving..."
                : product
                  ? "Save changes"
                  : "Add product"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
