"use client"

import { useState } from "react";
import { Court, DAYS, SportGroupData } from "./types";
import SportGroup from "./SportGroup";
import CourtModal from "./CourtModal";

const initialSports: SportGroupData[] = [
  {
    id: "basketball",
    name: "Basketball",
    courts: [
      {
        id: "court-1",
        name: "Basketball Court 1",
        active: true,
        rules: [
          {
            id: "rule-1",
            days: DAYS.slice(0, 5),
            startTime: "06:00",
            endTime: "09:00",
            hourlyRate: 350,
          },
          {
            id: "rule-2",
            days: DAYS.slice(0, 5),
            startTime: "09:00",
            endTime: "22:00",
            hourlyRate: 500,
          },
          {
            id: "rule-3",
            days: DAYS.slice(5),
            startTime: "06:00",
            endTime: "22:00",
            hourlyRate: 600,
          },
        ],
      },
      {
        id: "court-2",
        name: "Basketball Court 2",
        active: true,
        rules: [],
      },
    ],
  },
  {
    id: "badminton",
    name: "Badminton",
    courts: [
      {
        id: "court-3",
        name: "Badminton Court 1",
        active: true,
        rules: [],
      },
      {
        id: "court-4",
        name: "Badminton Court 2",
        active: false,
        rules: [],
      },
    ],
  },
];

export default function SportsCourtsPanel() {
  const [sports, setSports] = useState(initialSports);
  const [modal, setModal] = useState<{
    sportId: string;
    court: Court | null;
  } | null>(null);

  const activeSport = sports.find((sport) => sport.id === modal?.sportId);

  function saveCourt(updatedCourt: Court) {
    if (!modal) return;

    setSports((current) =>
      current.map((sport) => {
        if (sport.id !== modal.sportId) return sport;

        const exists = sport.courts.some(
          (court) => court.id === updatedCourt.id
        );

        return {
          ...sport,
          courts: exists
            ? sport.courts.map((court) =>
              court.id === updatedCourt.id ? updatedCourt : court
            )
            : [...sport.courts, updatedCourt],
        };
      })
    );

    setModal(null);
  }

  function handleSportNameChange(sportId: string, name: string) {
    setSports((current) =>
      current.map((sport) =>
        sport.id === sportId
          ? { ...sport, name }
          : sport
      )
    );
  }

  const handleRemoveSport = (sportId: string) => {
    setSports((previous) =>
      previous.filter((sport) => sport.id !== sportId)
    );
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#102d29]">
              Sports & Courts
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Organize this branch's sports and manage each court's pricing.
            </p>
          </div>
          <span className="rounded-full bg-[#e8f5ec] px-3 py-1.5 text-xs font-bold text-[#13834e]">
            {sports.reduce((sum, sport) => sum + sport.courts.length, 0)} courts
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {sports.map((sport) => (
            <SportGroup
              key={sport.id}
              sport={sport}
              onAddCourt={(sportId) =>
                setModal({ sportId, court: null })
              }
              onEditCourt={(sportId, court) =>
                setModal({ sportId, court })
              }
              onSportNameChange={handleSportNameChange}
              onRemoveSport={handleRemoveSport}
            />
          ))}
        </div>


        <button
          type="button"
          onClick={() =>
            setSports((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                name: "",
                courts: [],
              },
            ])
          }
          className="w-full rounded-xl border border-dashed border-[#b8d7c4] px-4 py-3.5 text-sm font-bold text-[#13834e] transition hover:bg-[#edf8f1]"
        >
          + Add another sport group
        </button>
      </div>

      {modal && activeSport && (
        <CourtModal
          key={modal.court?.id ?? `new-${modal.sportId}`}
          sportName={activeSport.name}
          court={modal.court}
          onClose={() => setModal(null)}
          onSave={saveCourt}
        />
      )}
    </>
  );
}