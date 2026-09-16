// Parses optional latitude/longitude form fields. Returns { latitude, longitude }
// (either may be null) on success, or { error } if a provided value is out of range.
export function parseLatLng(formData) {
  const latRaw = formData.get("latitude");
  const lngRaw = formData.get("longitude");

  let latitude = null;
  if (latRaw !== null && latRaw !== "") {
    latitude = Number(latRaw);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return { error: "Latitude must be between -90 and 90" };
    }
  }

  let longitude = null;
  if (lngRaw !== null && lngRaw !== "") {
    longitude = Number(lngRaw);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return { error: "Longitude must be between -180 and 180" };
    }
  }

  return { latitude, longitude };
}

// Haversine distance between two lat/lng points, in kilometers.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
