export const PLAN_PERIODS = ["day", "session", "month", "quarter", "year"];

export const PERIOD_LABELS = {
  day: "Daily",
  session: "Per Session",
  month: "Monthly",
  quarter: "Quarterly",
  year: "Annual",
};

export function planDisplayName(plan) {
  return plan.label?.trim() || PERIOD_LABELS[plan.period] || plan.period;
}

// Parses and validates the `plans` JSON string submitted from a listing form.
// Returns { plans } on success or { error } on failure. `plans` is normalized:
// [{ period, price, persons: number|null, label: string|null }, ...]
export function parsePlans(rawPlansJson) {
  let raw;
  try {
    raw = JSON.parse(rawPlansJson || "[]");
  } catch {
    return { error: "Invalid pricing plans data" };
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "At least one pricing plan is required" };
  }
  if (raw.length > 6) {
    return { error: "A listing can have at most 6 pricing plans" };
  }

  const plans = [];
  for (const p of raw) {
    const period = p?.period;
    const price = Number(p?.price);
    const persons = p?.persons === "" || p?.persons === null || p?.persons === undefined ? null : Number(p.persons);
    const label = p?.label?.toString().trim() || null;

    if (!PLAN_PERIODS.includes(period)) {
      return { error: `Invalid plan period: ${period}` };
    }
    if (!Number.isFinite(price) || price < 0) {
      return { error: "Each plan needs a valid price" };
    }
    if (persons !== null && (!Number.isInteger(persons) || persons < 1 || persons > 50)) {
      return { error: "Persons must be a whole number between 1 and 50" };
    }

    plans.push({ period, price, persons, label });
  }

  return { plans };
}

// The listing's card/list "starting from" price is the cheapest plan.
export function cheapestPlan(plans) {
  return plans.reduce((min, p) => (p.price < min.price ? p : min), plans[0]);
}
