"use client";

const PERIOD_OPTIONS = [
  { value: "day", label: "Per Day" },
  { value: "session", label: "Per Session" },
  { value: "month", label: "Per Month" },
  { value: "quarter", label: "Per Quarter" },
  { value: "year", label: "Per Year" },
];

let nextKey = 1;

export function newPlan() {
  return { key: `new-${nextKey++}`, period: "month", price: "", persons: "", label: "" };
}

// A dynamic list editor for a listing's pricing plans: partners can add
// multiple plans (e.g. per-day, per-month, per-year) each with an optional
// "persons" group size (e.g. a 2-person couple plan).
export default function PlansEditor({ plans, onChange }) {
  function updatePlan(index, patch) {
    onChange(plans.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function addPlan() {
    onChange([...plans, newPlan()]);
  }

  function removePlan(index) {
    onChange(plans.filter((_, i) => i !== index));
  }

  return (
    <div className="col-span-2">
      <label className="text-[#0B1F33]/60 text-xs font-semibold mb-1.5 block">Pricing Plans</label>
      <p className="text-[#0B1F33]/40 text-[11px] mb-2">
        Add one or more plans — e.g. ₹99/day, ₹999/month, ₹1500/month for 2 persons. &ldquo;Persons&rdquo; and &ldquo;label&rdquo; are optional.
      </p>
      <div className="space-y-2">
        {plans.map((p, i) => (
          <div key={p.key ?? p.id} className="grid grid-cols-12 gap-2 items-center bg-[#F5F7F3] rounded-xl p-2.5">
            <select
              value={p.period}
              onChange={(e) => updatePlan(i, { period: e.target.value })}
              className="col-span-3 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            >
              {PERIOD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <input
              type="number" min="0" step="0.01" required placeholder="Price ₹"
              value={p.price}
              onChange={(e) => updatePlan(i, { price: e.target.value })}
              className="col-span-3 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <input
              type="number" min="1" max="50" placeholder="Persons (optional)"
              value={p.persons}
              onChange={(e) => updatePlan(i, { persons: e.target.value })}
              className="col-span-3 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <input
              type="text" placeholder="Label (optional, e.g. Couple Plan)"
              value={p.label}
              onChange={(e) => updatePlan(i, { label: e.target.value })}
              className="col-span-2 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <button
              type="button"
              onClick={() => removePlan(i)}
              disabled={plans.length <= 1}
              className="col-span-1 text-red-400 hover:text-red-500 disabled:opacity-30 text-xs font-bold"
              title="Remove plan"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addPlan} className="mt-2 text-[#83C52B] text-xs font-bold hover:underline">
        + Add another plan
      </button>
    </div>
  );
}
