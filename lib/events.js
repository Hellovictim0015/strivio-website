// Parses and validates event fields submitted from the partner create/edit form.
// Returns { data } on success or { error } on failure.
export function parseEventFields(formData) {
  const name = formData.get("name")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const price = Number(formData.get("price") || 0);
  const capacityType = formData.get("capacityType")?.toString().trim();
  const totalSlotsRaw = formData.get("totalSlots");
  const location = formData.get("location")?.toString().trim() || null;
  const latitudeRaw = formData.get("latitude");
  const longitudeRaw = formData.get("longitude");
  const eventTime = formData.get("eventTime")?.toString().trim();

  if (!name) return { error: "Event name is required" };
  if (!Number.isFinite(price) || price < 0) return { error: "Please enter a valid price" };
  if (!["limited", "unlimited"].includes(capacityType)) return { error: "Please select a capacity type" };

  let totalSlots = null;
  if (capacityType === "limited") {
    totalSlots = Number(totalSlotsRaw);
    if (!Number.isInteger(totalSlots) || totalSlots < 1) {
      return { error: "Please enter a valid total slot count for a limited-capacity event" };
    }
  }

  let latitude = null;
  if (latitudeRaw !== null && latitudeRaw !== "") {
    latitude = Number(latitudeRaw);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return { error: "Latitude must be between -90 and 90" };
    }
  }

  let longitude = null;
  if (longitudeRaw !== null && longitudeRaw !== "") {
    longitude = Number(longitudeRaw);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return { error: "Longitude must be between -180 and 180" };
    }
  }

  if (!eventTime || Number.isNaN(new Date(eventTime).getTime())) {
    return { error: "Please provide a valid event date & time" };
  }

  return {
    data: {
      name,
      description,
      price,
      capacityType,
      totalSlots,
      location,
      latitude,
      longitude,
      // MySQL DATETIME literal (no timezone suffix) from a <input type="datetime-local"> value.
      eventTime: eventTime.replace("T", " ").slice(0, 19),
    },
  };
}
