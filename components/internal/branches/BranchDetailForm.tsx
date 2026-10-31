
import { BranchDetails, cardClass } from "./types";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import { IoMdInformationCircle } from "react-icons/io";
import {
  IoCloudUploadOutline,
  IoImagesOutline,
  IoTrashOutline,
} from "react-icons/io5";

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function BranchDetailsForm({
  value,
  onChange,
}: {
  value: BranchDetails;
  onChange: (value: BranchDetails) => void;
}) {
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
            value={value.name}
            onChange={(name) => onChange({ ...value, name })}
            placeholder="e.g. Greenfield Sports Center"
          />

          <Field
            label="Address"
            value={value.address}
            onChange={(address) => onChange({ ...value, address })}
            placeholder="Street, city, province"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Contact number"
              value={value.phone}
              onChange={(phone) => onChange({ ...value, phone })}
              placeholder="+63..."
            />
            <Field
              label="Contact email"
              value={value.email}
              onChange={(email) => onChange({ ...value, email })}
              type="email"
              placeholder="branch@example.com"
            />

            {photoError && (
              <p role="alert" className="mt-3 text-xs font-medium text-rose-600">
                {photoError}
              </p>
            )}

        <div className="mt-5 grid grid-cols-2 gap-4">
          <Field
            label="Opening time"
            value={value.openingTime}
            onChange={(openingTime) => onChange({ ...value, openingTime })}
            type="time"
          />
          <Field
            label="Closing time"
            value={value.closingTime}
            onChange={(closingTime) => onChange({ ...value, closingTime })}
            type="time"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#edf8f1] p-3 text-xs leading-5 text-[#35654d]">
          <span aria-hidden="true">
            <IoMdInformationCircle />
          </span>
          <p>
            These hours apply to all courts at this branch. Court-specific
            pricing rules are configured separately.
          </p>
        </div>
      </div>
      <footer className="mt-8 flex items-center justify-end gap-2">
        <button type="button" onClick={() => window.history.back()} className="rounded-xl border border-[#d8e2dc] px-5 py-3 text-sm font-bold text-[#29483e] hover:bg-slate-50">Cancel</button>
        <button type="button" onClick={() => window.alert("UI prototype only. Connect this button to your save action.")} className="rounded-xl bg-[#13834e] px-5 py-3 text-sm font-bold text-white hover:bg-[#0f6d40]">Save changes</button>
      </footer>
    </>
  );
}
