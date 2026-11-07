export const PLUGIN_ID = "chrono-clock";
export const VIEW_TYPE_CHRONO = "chrono-clock-view";

/**
 * Polling cadence of the shared clock. The DOM is only touched when a value
 * actually changes, so this stays cheap while keeping the display within
 * a quarter of a second of the true second boundary.
 */
export const TICK_INTERVAL_MS = 250;

/** Ambient glitch bursts fire at a random delay inside this window (ms). */
export const GLITCH_MIN_DELAY_MS = 900;
export const GLITCH_MAX_DELAY_MS = 3500;
