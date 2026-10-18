"use client";

import { useEffect, useRef, useState } from "react";
import { Court, DAYS, PricingRule } from "../types";
import Field from "../Field";
import PricingRuleEditor from "./PricingRuleEditor";

export default function CourtModal({
  sportName,
  court,
  onClose,
  onSave,
}: {
  sportName: string;
  court: Court | null;
  onClose: () => void;
  onSave: (court: Court) => void;
}) {
  const [name, setName] = useState(court?.name ?? "");
  const [active, setActive] = useState(court?.active ?? true);
  const [rules, setRules] = useState<PricingRule[]>(court?.rules ?? []);
  const [error, setError] = useState("");

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    court?.photoUrl ?? null
  );
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!photoFile) return;

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  function handlePhotoChange(file?: File) {
    setError("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("The photo must be 5 MB or smaller.");
      return;
    }

    setPhotoFile(file);
    setRemovePhoto(false);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function addRule() {
    setRules((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        days: DAYS.slice(0, 5),
        startTime: "06:00",
        endTime: "09:00",
        hourlyRate: 350,
      },
    ]);
  }

  function saveCourt() {
    if (!name.trim()) {
      setError("Enter a name for this court.");
      return;
    }

    if (
      rules.some(
        (rule) =>
          rule.days.length === 0 ||
          rule.startTime >= rule.endTime ||
          rule.hourlyRate < 0
      )
    ) {
      setError("Check each rule's days, time range, and hourly rate.");
      return;
    }

    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const sameDay = rules[i].days.some((day) =>
          rules[j].days.includes(day)
        );

        const overlaps =
          rules[i].startTime < rules[j].endTime &&
          rules[j].startTime < rules[i].endTime;

        if (sameDay && overlaps) {
          setError("Pricing rules cannot overlap on the same day.");
          return;
        }
      }
    }

    onSave({
      id: court?.id ?? crypto.randomUUID(),
      name: name.trim(),
      active,
      rules,
      photoUrl: removePhoto ? null : court?.photoUrl ?? null,
      photoFile,
      removePhoto,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102d29]/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="court-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e3ebe6] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#13834e]">
              {sportName}
            </p>
            <h2
              id="court-modal-title"
              className="mt-1 text-xl font-bold text-[#102d29]"
            >
              {court ? "Edit court" : "Add court"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Set up court details, photos, and hourly pricing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
          <section>
            <h3 className="text-sm font-bold text-[#102d29]">
              Court details
            </h3>

            <div className="mt-3">
              <Field
                label="Court name"
                value={name}
                onChange={setName}
                placeholder={`e.g. ${sportName} Court 1`}
              />
            </div>

            {/* Court photo */}
            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#29483e]">
                Court photo
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              {photoPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-[#dfe9e2]">
                  <img
                    src={photoPreview}
                    alt="Court preview"
                    className="h-48 w-full object-cover"
                  />

                  <div className="absolute right-3 top-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#29483e] shadow hover:bg-[#edf8f1]"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-rose-600 shadow hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#b8d7c4] bg-[#fbfdfb] px-4 py-8 text-center transition hover:bg-[#edf8f1]"
                >
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8f5ec] text-2xl text-[#13834e]">
                    +
                  </span>
                  <span className="text-sm font-bold text-[#29483e]">
                    Upload a court photo
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PNG, JPG, or WEBP · Maximum 5 MB
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  handlePhotoChange(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#dfe9e2] p-3.5">
              <div>
                <p className="text-sm font-semibold text-[#29483e]">
                  Court is active
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Active courts can be offered for booking.
                </p>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
                className="h-4 w-4 accent-[#13834e]"
              />
            </label>
          </section>

          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#102d29]">
                  Pricing rules
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Set different hourly rates for different days and time
                  periods.
                </p>
              </div>

              <button
                type="button"
                onClick={addRule}
                className="rounded-xl border border-[#b8d7c4] px-3 py-2 text-sm font-bold text-[#13834e] hover:bg-[#edf8f1]"
              >
                + Add rule
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {rules.map((rule) => (
                <PricingRuleEditor
                  key={rule.id}
                  rule={rule}
                  onChange={(updated) =>
                    setRules((current) =>
                      current.map((item) =>
                        item.id === updated.id ? updated : item
                      )
                    )
                  }
                  onRemove={() =>
                    setRules((current) =>
                      current.filter((item) => item.id !== rule.id)
                    )
                  }
                />
              ))}

              {rules.length === 0 && (
                <div className="rounded-xl border border-dashed border-[#cbded1] p-6 text-center">
                  <p className="text-sm font-semibold text-[#29483e]">
                    No pricing rules yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Add rules to define how much this court costs at different
                    times.
                  </p>
                  <button
                    type="button"
                    onClick={addRule}
                    className="mt-3 text-sm font-bold text-[#13834e] hover:underline"
                  >
                    Add your first rule
                  </button>
                </div>
              )}
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[#e3ebe6] bg-[#fbfdfb] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#d8e2dc] px-5 py-3 text-sm font-bold text-[#29483e] hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveCourt}
            className="rounded-xl bg-[#13834e] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f6d40]"
          >
            Save court
          </button>
        </div>
      </div>
    </div>
  );
}
