const ICONS = {
  gym: "🏋️",
  yoga: "🧘",
  track: "🏃",
  swimming: "🏊",
  sports: "⚽",
  dance: "💃",
  zumba: "🎵",
  football: "⚽",
  cricket: "🏏",
  badminton: "🏸",
  fitness: "💪",
  crossfit: "🏋️",
};

// Fallback emoji for a category when it has no uploaded image — admin-created
// categories still render something meaningful on the user side.
export function categoryEmoji(name) {
  return ICONS[name?.toLowerCase()?.trim()] || "🏷️";
}
