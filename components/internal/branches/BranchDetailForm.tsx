
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { cardClass } from "./types";
import SectionHeading from "./sports-and-courts/SectionHeading";
import Field from "./Field";
import { IoMdInformationCircle } from "react-icons/io";
import {
  IoCloudUploadOutline,
  IoImagesOutline,
  IoTrashOutline,
} from "react-icons/io5";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type BranchPhoto = {
  id: string;
  file: File;
  preview: string;
};

type DaySchedule = {
  day: string;
  isOpen: boolean;
  opening: string;
  closing: string;
};

export default function BranchDetailsForm() {
  const [name, setName] = useState("Greenfield Sports Center");
  const [address, setAddress] = useState(
    "123 Greenfield Avenue, Cebu City"
  );
  const [phone, setPhone] = useState("+63 917 123 4567");
  const [email, setEmail] = useState("greenfield@example.com");
  const [description, setDescription] = useState("");

  const [photos, setPhotos] = useState<BranchPhoto[]>([]);
  const [photoError, setPhotoError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [operatingHours, setOperatingHours] = useState<DaySchedule[]>([
    { day: "Monday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Tuesday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Wednesday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Thursday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Friday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Saturday", isOpen: true, opening: "08:00", closing: "22:00" },
    { day: "Sunday", isOpen: true, opening: "08:00", closing: "22:00" },
  ]);

  const updateDaySchedule = (
    day: string,
    changes: Partial<Omit<DaySchedule, "day">>
  ) => {
    setOperatingHours((previous) =>
      previous.map((schedule) =>
        schedule.day === day
          ? { ...schedule, ...changes }
          : schedule
      )
    );
  };

  // Clean up temporary image previews when the component unmounts.
  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [photos]);

  function handlePhotoSelection(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);

    setPhotoError("");

    const remainingSlots = MAX_PHOTOS - photos.length;

    if (files.length > remainingSlots) {
      setPhotoError(
        `You can upload up to ${MAX_PHOTOS} branch photos.`
      );
    }

    const validFiles: File[] = [];

    for (const file of files.slice(0, remainingSlots)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setPhotoError("Use JPG, PNG, or WEBP images only.");
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setPhotoError(
          "Each photo must be 5 MB or smaller."
        );
        continue;
      }

      validFiles.push(file);
    }

    const newPhotos: BranchPhoto[] = validFiles.map(
      (file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      })
    );

    setPhotos((current) =>
      [...current, ...newPhotos].slice(0, MAX_PHOTOS)
    );

    // Allow the same file to be selected again later.
    event.target.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const photoToRemove = current.find(
        (photo) => photo.id === id
      );

      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }

      return current.filter((photo) => photo.id !== id);
    });
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="space-y-5 w-full md:w-1/2">
          {/* Branch details */}
          <section className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-5">
              <SectionHeading
                title="Branch details"
                description="Manage the information customers see when booking."
              />
            </div>

            <div className="space-y-4">
              <Field
                label="Branch name"
                value={name}
                onChange={setName}
                placeholder="e.g. Greenfield Sports Center"
              />

              <Field
                label="Address"
                value={address}
                onChange={setAddress}
                placeholder="Street, city, province"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Contact number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+63..."
                />

                <Field
                  label="Contact email"
                  value={email}
                  onChange={setEmail}
                  type="email"
                  placeholder="branch@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-[#29483e]"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your venue, facilities, and amenities..."
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-y rounded-lg border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none transition placeholder:text-slate-400 focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
                />

                <p className="mt-1 text-xs text-slate-400">
                  Describe your venue, facilities, and what customers can expect. Maximum 1,000 characters.
                </p>
              </div>
            </div>
          </section>

          {/* Branch photos */}
          <section className={`${cardClass} p-5 sm:p-6`}>
            <SectionHeading
              title="Branch photos"
              description="Show customers what your venue looks like on the booking page."
            />

            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-3 2xl:grid-cols-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square min-w-0 overflow-hidden rounded-xl border border-[#dfe9e2] bg-[#f7fbf8]"
                >
                  <img
                    src={photo.preview}
                    alt={`Branch photo ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-white/95 px-2 py-1 text-[10px] font-bold text-[#29483e] shadow-sm">
                      Cover photo
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    aria-label={`Remove branch photo ${index + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50"
                  >
                    <IoTrashOutline />
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square min-w-0 flex-col items-center justify-center rounded-xl border border-dashed border-[#b8d7c4] bg-[#fbfdfb] p-2 text-center transition hover:bg-[#edf8f1]"
                >
                  <span className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5ec] text-lg text-[#13834e]">
                    <IoCloudUploadOutline />
                  </span>

                  <span className="text-xs font-bold text-[#29483e]">
                    Add photo
                  </span>

                  <span className="mt-1 text-[10px] text-slate-500">
                    {photos.length}/{MAX_PHOTOS}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoSelection}
            />

            {photoError && (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-600">
                {photoError}
              </p>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#edf8f1] p-3 text-xs leading-5 text-[#35654d]">
              <IoImagesOutline className="mt-0.5 shrink-0" />

              <p>
                Upload up to {MAX_PHOTOS} photos. JPG, PNG, or WEBP,
                maximum 5 MB each. The first photo is displayed as the cover.
              </p>
            </div>
          </section>
        </div>

        <div className="space-y-5 w-full md:w-1/2">

          {/* Operating hours */}
          <section className={`${cardClass} p-5 sm:p-6`}>
            <SectionHeading
              title="Operating hours"
              description="Set opening and closing times for each day of the week."
            />

            <div className="mt-5 divide-y divide-[#e7eee9]">
              {operatingHours.map((schedule) => (
                <div
                  key={schedule.day}
                  className="grid grid-cols-1 gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[110px_1fr] sm:items-center"
                >
                  {/* Day and open/closed status */}
                  <div className="flex items-center justify-between sm:block">
                    <p className="text-sm font-semibold text-[#29483e]">
                      {schedule.day}
                    </p>

                    <span
                      className={`mt-1 hidden text-xs sm:block ${schedule.isOpen
                        ? "text-emerald-700"
                        : "text-slate-400"
                        }`}
                    >
                      {schedule.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>

                  {/* Time fields and closed toggle */}
                  <div className="flex flex-wrap items-center gap-3">
                    {schedule.isOpen ? (
                      <>
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`${schedule.day}-opening`}
                            className="mb-1.5 block text-xs font-medium text-slate-500"
                          >
                            Opens
                          </label>
                          <input
                            id={`${schedule.day}-opening`}
                            type="time"
                            value={schedule.opening}
                            onChange={(event) =>
                              updateDaySchedule(schedule.day, {
                                opening: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none transition focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
                          />
                        </div>

                        <span className="mt-5 text-xs text-slate-400">
                          to
                        </span>

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`${schedule.day}-closing`}
                            className="mb-1.5 block text-xs font-medium text-slate-500"
                          >
                            Closes
                          </label>
                          <input
                            id={`${schedule.day}-closing`}
                            type="time"
                            value={schedule.closing}
                            onChange={(event) =>
                              updateDaySchedule(schedule.day, {
                                closing: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-[#d8e2dc] bg-white px-3 py-2.5 text-sm text-[#102d29] outline-none transition focus:border-[#13834e] focus:ring-2 focus:ring-[#13834e]/10"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex min-h-[65px] flex-1 items-center rounded-lg bg-[#f7f9f7] px-3">
                        <span className="text-sm text-slate-400">
                          Closed all day
                        </span>
                      </div>
                    )}

                    <label className="mt-5 flex shrink-0 cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!schedule.isOpen}
                        onChange={(event) =>
                          updateDaySchedule(schedule.day, {
                            isOpen: !event.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-[#cbd5ce] accent-[#13834e]"
                      />
                      <span className="text-xs font-medium text-slate-600">
                        Closed
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#edf8f1] p-3 text-xs leading-5 text-[#35654d]">
              <IoMdInformationCircle className="mt-0.5 shrink-0" />

              <p>
                These are the branch's regular weekly hours. Mark a day
                as closed if the venue does not operate that day.
                Individual court availability, pricing rules, and special
                holiday hours can be configured separately.
              </p>
            </div>
          </section>
        </div>
      </div>
      <footer className="mt-8 flex items-center justify-end gap-2">
        <button type="button" onClick={() => window.history.back()} className="rounded-xl border border-[#d8e2dc] px-5 py-3 text-sm font-bold text-[#29483e] hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={() => window.alert("UI prototype only. Connect this button to your save action.")} className="rounded-xl bg-[#13834e] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f6d40]">Save changes</button>
      </footer>
    </>
  );
}
