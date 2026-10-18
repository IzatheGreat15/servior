import { DAYS, inputClass, PricingRule } from "../types";

export default function PricingRuleEditor({
  rule,
  onChange,
  onRemove,
}: {
  rule: PricingRule;
  onChange: (rule: PricingRule) => void;
  onRemove: () => void;
}) {
  function toggleDay(day: string) {
    onChange({
      ...rule,
      days: rule.days.includes(day)
        ? rule.days.filter((item) => item !== day)
        : DAYS.filter((item) =>
            item === day ? true : rule.days.includes(item)
          ),
    });
  }

  function setPreset(preset: "weekdays" | "weekends" | "all") {
    onChange({
      ...rule,
      days:
        preset === "weekdays"
          ? DAYS.slice(0, 5)
          : preset === "weekends"
            ? DAYS.slice(5)
            : [...DAYS],
    });
  }

  return (
    <div className="rounded-xl border border-[#dfe9e2] p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[#29483e]">Pricing rule</h4>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
        >
          Remove
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold text-[#29483e]">
          Days of the week
        </p>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DAYS.map((day) => {
            const selected = rule.days.includes(day);

            return (
              <label
                key={day}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-xs font-semibold transition ${
                  selected
                    ? "border-[#13834e] bg-[#e8f5ec] text-[#13834e]"
                    : "border-[#d8e2dc] text-slate-500 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleDay(day)}
                  className="accent-[#13834e]"
                />
                {day.slice(0, 3)}
              </label>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPreset("weekdays")}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Weekdays
          </button>
          <button
            type="button"
            onClick={() => setPreset("weekends")}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Weekends
          </button>
          <button
            type="button"
            onClick={() => setPreset("all")}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"
          >
            Every day
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs font-bold text-[#29483e]">
          Start time
          <input
            type="time"
            value={rule.startTime}
            onChange={(event) =>
              onChange({ ...rule, startTime: event.target.value })
            }
            className={inputClass}
          />
        </label>

        <label className="text-xs font-bold text-[#29483e]">
          End time
          <input
            type="time"
            value={rule.endTime}
            onChange={(event) =>
              onChange({ ...rule, endTime: event.target.value })
            }
            className={inputClass}
          />
        </label>

        <label className="text-xs font-bold text-[#29483e]">
          Hourly rate (₱)
          <input
            type="number"
            min="0"
            value={rule.hourlyRate}
            onChange={(event) =>
              onChange({
                ...rule,
                hourlyRate: Number(event.target.value),
              })
            }
            className={inputClass}
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {rule.days.length
          ? `${rule.days.map((day) => day.slice(0, 3)).join(", ")} · ${rule.startTime}–${rule.endTime} · ₱${rule.hourlyRate.toLocaleString("en-PH")}/hour`
          : "Select at least one day for this pricing rule."}
      </p>
    </div>
  );
}