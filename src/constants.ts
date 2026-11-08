export const PLUGIN_ID = "chrono-clock";
export const VIEW_TYPE_CHRONO = "chrono-clock-view";

/**
 * Polling cadence of the shared clock. The DOM is only touched when a value
 * actually changes, so this stays cheap while keeping the display within
 * a quarter of a second of the true second boundary.
 */
export const TICK_INTERVAL_MS = 250;

export const MAX_WORLD_CLOCKS = 12;
