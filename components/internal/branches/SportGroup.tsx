"use client"

import { CgTennis } from "react-icons/cg";
import CourtCard from "./CourtCard";
import { cardClass, Court, SportGroupData } from "./types";

export default function SportGroup({
    sport,
    onAddCourt,
    onEditCourt,
    onSportNameChange,
}: {
    sport: SportGroupData;
    onAddCourt: (sportId: string) => void;
    onEditCourt: (sportId: string, court: Court) => void;
    onSportNameChange: (sportId: string, name: string) => void;
}) {
    return (
        <section className={`${cardClass} overflow-hidden`}>
            <div className="flex items-center justify-between gap-3 border-b border-[#e5eee8] bg-[#fbfdfb] px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f5ec] text-xl">
                        <CgTennis />
                    </div>

                    <div className="min-w-0 flex-1">
                        <input
                            type="text"
                            value={sport.name}
                            onChange={(e) => onSportNameChange(sport.id, e.target.value)}
                            aria-label="Sport name"
                            placeholder="Enter sport name"
                            className="w-full min-w-0 rounded-md border border-transparent bg-transparent px-1 py-1 text-base font-bold text-[#102d29] outline-none transition placeholder:text-slate-400 hover:border-[#d8e2dc] focus:border-[#13834e] focus:bg-white focus:ring-2 focus:ring-[#13834e]/10"
                        />

                        <p className="mt-0.5 px-1 text-xs text-slate-500">
                            {sport.courts.length}{" "}
                            {sport.courts.length === 1 ? "court" : "courts"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onAddCourt(sport.id)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#13834e] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#0f6d40] sm:px-4 sm:text-sm"
                >
                    <span className="text-base leading-none">+</span>
                    Add court
                </button>
            </div>

            <div className="space-y-3 p-4 sm:p-5">
                {sport.courts.length ? (
                    sport.courts.map((court) => (
                        <CourtCard
                            key={court.id}
                            court={court}
                            onEdit={() => onEditCourt(sport.id, court)}
                        />
                    ))
                ) : (
                    <div className="rounded-xl border border-dashed border-[#cbded1] p-8 text-center">
                        <p className="font-semibold text-[#29483e]">No courts yet</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Add a court to start configuring availability and pricing.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}