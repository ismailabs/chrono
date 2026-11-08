/**
 * Time zone catalog and search. Pure data and functions with no Obsidian
 * imports, so the list can be tested directly.
 */

export interface CityOption {
  /** Name shown to the user, for example "Paris". */
  name: string;
  /** IANA time zone identifier, for example "Europe/Paris". */
  zone: string;
  /** Country or region, empty for raw IANA identifiers. */
  country?: string;
}

const CURATED: [name: string, country: string, zone: string][] = [
  ["New York", "United States", "America/New_York"],
  ["Chicago", "United States", "America/Chicago"],
  ["Denver", "United States", "America/Denver"],
  ["Los Angeles", "United States", "America/Los_Angeles"],
  ["Phoenix", "United States", "America/Phoenix"],
  ["Anchorage", "United States", "America/Anchorage"],
  ["Honolulu", "United States", "Pacific/Honolulu"],
  ["Toronto", "Canada", "America/Toronto"],
  ["Vancouver", "Canada", "America/Vancouver"],
  ["Mexico City", "Mexico", "America/Mexico_City"],
  ["Sao Paulo", "Brazil", "America/Sao_Paulo"],
  ["Buenos Aires", "Argentina", "America/Argentina/Buenos_Aires"],
  ["Santiago", "Chile", "America/Santiago"],
  ["Bogota", "Colombia", "America/Bogota"],
  ["Lima", "Peru", "America/Lima"],
  ["London", "United Kingdom", "Europe/London"],
  ["Dublin", "Ireland", "Europe/Dublin"],
  ["Lisbon", "Portugal", "Europe/Lisbon"],
  ["Paris", "France", "Europe/Paris"],
  ["Berlin", "Germany", "Europe/Berlin"],
  ["Madrid", "Spain", "Europe/Madrid"],
  ["Rome", "Italy", "Europe/Rome"],
  ["Amsterdam", "Netherlands", "Europe/Amsterdam"],
  ["Brussels", "Belgium", "Europe/Brussels"],
  ["Zurich", "Switzerland", "Europe/Zurich"],
  ["Vienna", "Austria", "Europe/Vienna"],
  ["Stockholm", "Sweden", "Europe/Stockholm"],
  ["Oslo", "Norway", "Europe/Oslo"],
  ["Copenhagen", "Denmark", "Europe/Copenhagen"],
  ["Helsinki", "Finland", "Europe/Helsinki"],
  ["Warsaw", "Poland", "Europe/Warsaw"],
  ["Prague", "Czechia", "Europe/Prague"],
  ["Athens", "Greece", "Europe/Athens"],
  ["Istanbul", "Turkey", "Europe/Istanbul"],
  ["Moscow", "Russia", "Europe/Moscow"],
  ["Reykjavik", "Iceland", "Atlantic/Reykjavik"],
  ["Cairo", "Egypt", "Africa/Cairo"],
  ["Johannesburg", "South Africa", "Africa/Johannesburg"],
  ["Lagos", "Nigeria", "Africa/Lagos"],
  ["Nairobi", "Kenya", "Africa/Nairobi"],
  ["Casablanca", "Morocco", "Africa/Casablanca"],
  ["Dubai", "United Arab Emirates", "Asia/Dubai"],
  ["Riyadh", "Saudi Arabia", "Asia/Riyadh"],
  ["Tel Aviv", "Israel", "Asia/Jerusalem"],
  ["Tehran", "Iran", "Asia/Tehran"],
  ["Karachi", "Pakistan", "Asia/Karachi"],
  ["Mumbai", "India", "Asia/Kolkata"],
  ["Kathmandu", "Nepal", "Asia/Kathmandu"],
  ["Dhaka", "Bangladesh", "Asia/Dhaka"],
  ["Bangkok", "Thailand", "Asia/Bangkok"],
  ["Jakarta", "Indonesia", "Asia/Jakarta"],
  ["Singapore", "Singapore", "Asia/Singapore"],
  ["Kuala Lumpur", "Malaysia", "Asia/Kuala_Lumpur"],
  ["Hong Kong", "Hong Kong", "Asia/Hong_Kong"],
  ["Shanghai", "China", "Asia/Shanghai"],
  ["Taipei", "Taiwan", "Asia/Taipei"],
  ["Manila", "Philippines", "Asia/Manila"],
  ["Seoul", "South Korea", "Asia/Seoul"],
  ["Tokyo", "Japan", "Asia/Tokyo"],
  ["Sydney", "Australia", "Australia/Sydney"],
  ["Melbourne", "Australia", "Australia/Melbourne"],
  ["Brisbane", "Australia", "Australia/Brisbane"],
  ["Perth", "Australia", "Australia/Perth"],
  ["Auckland", "New Zealand", "Pacific/Auckland"],
  ["UTC", "Universal", "UTC"],
];

export const CITY_CATALOG: readonly CityOption[] = CURATED.map(
  ([name, country, zone]) => ({ name, country, zone })
);

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** Every IANA identifier the runtime knows about, or none if unsupported. */
function runtimeTimeZones(): string[] {
  const intl = Intl as unknown as {
    supportedValuesOf?: (key: "timeZone") => string[];
  };
  try {
    return intl.supportedValuesOf?.("timeZone") ?? [];
  } catch {
    return [];
  }
}

/** Human-readable name for a zone: the curated city, or the last IANA segment. */
export function cityNameForZone(zone: string): string {
  const curated = CITY_CATALOG.find((city) => city.zone === zone);
  if (curated) return curated.name;
  const last = zone.split("/").pop() ?? zone;
  return last.replace(/_/g, " ");
}

/**
 * Searches curated cities first, then every IANA identifier. An empty query
 * returns the curated cities only.
 */
export function searchCities(query: string, limit = 40): CityOption[] {
  const needle = query.trim().toLowerCase();
  const matches = (haystack: string): boolean =>
    haystack.toLowerCase().includes(needle);

  const curated = CITY_CATALOG.filter(
    (city) =>
      needle === "" ||
      matches(city.name) ||
      matches(city.country ?? "") ||
      matches(city.zone)
  );
  if (needle === "") return curated.slice(0, limit);

  const curatedZones = new Set(CITY_CATALOG.map((city) => city.zone));
  const iana = runtimeTimeZones()
    .filter((zone) => !curatedZones.has(zone) && matches(zone))
    .map((zone) => ({ name: cityNameForZone(zone), zone }));

  return [...curated, ...iana].slice(0, limit);
}
