"use client"

import { BranchDetails, cardClass } from "./types";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import { IoMdInformationCircle } from "react-icons/io";


export default function BranchDetailsForm({
  value,
  onChange,
}: {
  value: BranchDetails;
  onChange: (value: BranchDetails) => void;
}) {
  return (
    <div className="space-y-5">
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
          </div>
        </div>
      </section>

      <section className={`${cardClass} p-5 sm:p-6`}>
        <SectionHeading
          title="Operating hours"
          description="Default hours for this branch. Court-specific pricing is configured separately."
        />

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
            These are the branch&apos;s default hours. You can configure individual
            court availability and pricing rules separately.
          </p>
        </div>
      </section>
    </div>
  );
}
