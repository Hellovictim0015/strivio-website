"use client";

let nextKey = 1;

export function newSession() {
  return { key: `new-${nextKey++}`, label: "", startTime: "", endTime: "" };
}

// Lets a partner define their own bookable session slots (e.g. "Morning 6-9 AM")
// shared across all their listings. If left empty, the booking page falls back
// to generic Morning/Afternoon/Evening defaults.
export default function SessionsEditor({ sessions, onChange }) {
  function update(index, patch) {
    onChange(sessions.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function add() {
    onChange([...sessions, newSession()]);
  }

  function remove(index) {
    onChange(sessions.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="space-y-2">
        {sessions.map((s, i) => (
          <div key={s.key ?? s.id} className="grid grid-cols-12 gap-2 items-center bg-[#F5F7F3] rounded-xl p-2.5">
            <input
              placeholder="Label, e.g. Morning"
              value={s.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="col-span-5 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <input
              placeholder="Start (e.g. 6:00 AM)"
              value={s.startTime}
              onChange={(e) => update(i, { startTime: e.target.value })}
              className="col-span-3 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <input
              placeholder="End (e.g. 9:00 AM)"
              value={s.endTime}
              onChange={(e) => update(i, { endTime: e.target.value })}
              className="col-span-3 px-2 py-2 text-xs bg-white rounded-lg border border-transparent focus:outline-none focus:border-[#83C52B]/40 text-[#0B1F33]"
            />
            <button type="button" onClick={() => remove(i)} className="col-span-1 text-red-400 hover:text-red-500 text-xs font-bold" title="Remove slot">
              ✕
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-[#0B1F33]/40 text-xs py-2">No custom slots yet — users will see generic Morning/Afternoon/Evening options.</p>
        )}
      </div>
      <button type="button" onClick={add} className="mt-2 text-[#83C52B] text-xs font-bold hover:underline">
        + Add session slot
      </button>
    </div>
  );
}
