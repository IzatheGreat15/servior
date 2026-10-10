"use client"

import { useState } from "react";
import { cardClass } from "./types";
import SectionHeading from "./SectionHeading";
import Field from "./Field";
import { IoMdInformationCircle } from "react-icons/io";


export default function BranchDetailsForm() {
  const [name, setName] = useState("Greenfield Sports Center");
  const [address, setAddress] = useState("123 Greenfield Avenue, Cebu City");
  const [phone, setPhone] = useState("+63 917 123 4567");
  const [email, setEmail] = useState("greenfield@example.com");
  const [opening, setOpening] = useState("06:00");
  const [closing, setClosing] = useState("22:00");

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
            value={opening}
            onChange={setOpening}
            type="time"
          />
          <Field
            label="Closing time"
            value={closing}
            onChange={setClosing}
            type="time"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#edf8f1] p-3 text-xs leading-5 text-[#35654d]">
          <span aria-hidden="true">
            <IoMdInformationCircle />
          </span>
          <p>
            These are the branch's default hours. You can configure individual
            court availability and pricing rules separately.
          </p>
        </div>
      </section>
    </div>
  );
}
