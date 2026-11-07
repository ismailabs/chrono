# Chrono

A minimal live clock for [Obsidian](https://obsidian.md) with animated, glitchy **hour, minute and seconds bars**. Chrono shows the time, day and date in a sidebar view that follows your theme, with an optional clock in the status bar.

- Plugin ID: `chrono-clock`
- Version: `1.1.0`
- Minimum Obsidian version: `1.5.0`
- Works on desktop and mobile (the status bar clock is desktop only)

## Features

- **Live clock** that updates every second, using your device's local time and time zone.
- **Day and date** with a long (`Tuesday`, `November 3, 2026`) or short style.
- **12-hour or 24-hour** format. The default follows your device's preference.
- **Hour, minute and seconds bars.** Three segmented bars under the time show how far you are through the hour cycle (12 or 24 ticks to match your format), the current hour (a tick every 5 minutes) and the current minute (a tick every 5 seconds). Each bar has a flickering leading edge and crawling stripes.
- **Glitch effects.** Digits slice and split into cyan and magenta channels whenever they change, bars jitter and flash when they roll over, the colons blink, a scanline sweep passes over the card, and random bursts (including a rare full-readout tear) keep it alive between ticks.
- **Seconds, date, bars and glitch toggles**, available both in the view and in settings.
- **Time zone label** showing your zone and UTC offset.
- **Sidebar view** opened from the ribbon icon or a command.
- **Optional status bar clock**. Select it to open the full view.
- **Settings tab** with saved preferences and a restore-defaults button.
- **Theme aware**: built from Obsidian's own CSS variables, with refined light and dark appearances.
- **Responsive**: the time scales to the sidebar width using container queries.
- **Accessible**: keyboard operable, visible focus rings, `prefers-reduced-motion` respected, and screen readers hear the time once a minute rather than every second. With `prefers-reduced-motion` on, every glitch and animation is disabled.

## Installation

### From the release ZIP

1. Close Obsidian settings if open.
2. Extract `chrono-obsidian-plugin.zip`. You get a folder named `chrono-clock`.
3. Move that folder to:

   ```
   YourVault/.obsidian/plugins/chrono-clock/
   ```

   The folder must contain `main.js`, `manifest.json` and `styles.css` at its top level.
4. Restart Obsidian, or reload plugins.
5. Go to **Settings > Community plugins**, turn off Restricted mode if needed, and enable **Chrono**.

> `.obsidian` is a hidden folder. On macOS press `Cmd+Shift+.` in Finder to show it. On Windows enable *Hidden items* in File Explorer.

### Build from source

```bash
cd chrono-clock
npm install
npm run build
```

This type-checks the project and writes `main.js` next to `manifest.json`.

## Usage

| Action | How |
| --- | --- |
| Open the clock | Click the clock icon in the ribbon, or run **Chrono: Open clock** from the command palette |
| Switch 12/24-hour | Segmented control in the view, setting, or **Chrono: Toggle 24-hour format** |
| Show or hide seconds / date / hour and minute bars | Chips under the clock, or settings |
| Glitch effects on or off | **Glitch** chip, settings, or **Chrono: Toggle glitch effects** |
| Status bar clock | Settings, or **Chrono: Toggle status bar clock** |

The first time you open the clock it appears in the right sidebar. You can drag the tab anywhere, and Obsidian remembers its position.

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| Hour format | Device preference | 12-hour or 24-hour |
| Show seconds | On | Seconds digits and the seconds bar in the view, and seconds in the status bar |
| Show hour and minute bars | On | The hours and minutes progress bars |
| Glitch effects | On | Animated glitching on digits and bars |
| Show date | On | Day and date below the time |
| Date style | Long | Long includes the year, short is compact |
| Show time zone | On | Zone name and UTC offset |
| Show clock in status bar | Off | Small clock in the status bar (desktop) |

Preferences are stored with Obsidian's data API in `data.json` inside the plugin folder.

## Privacy

Chrono makes no network requests, has no telemetry, and collects no personal data. It reads the local clock through the browser's built-in `Intl` APIs and stores only the preferences above.

## Development

```bash
npm install        # install dependencies
npm run dev        # rebuild main.js on every change (inline source maps)
npm run typecheck  # strict TypeScript check only
npm run build      # typecheck + minified production bundle
```

For live development, clone or symlink this folder into `YourVault/.obsidian/plugins/chrono-clock/` and use the community *Hot Reload* plugin, or reload Obsidian after each build.

### Project structure

```
chrono-clock/
├── manifest.json        Plugin manifest
├── versions.json        Plugin version to minimum Obsidian version
├── main.js              Compiled production bundle (generated)
├── styles.css           Styles, themed with Obsidian CSS variables
├── package.json
├── package-lock.json
├── tsconfig.json
├── esbuild.config.mjs
├── LICENSE
├── README.md
└── src/
    ├── main.ts          Plugin entry: registration, interval, settings persistence
    ├── clock.ts         Formatter (incl. bar progress) + shared engine that fans ticks out to subscribers
    ├── view.ts          Sidebar view (ItemView): bars, digit glitching, ambient bursts
    ├── statusBar.ts     Optional status bar clock
    ├── settings.ts      Settings model, defaults, validation
    ├── settingsTab.ts   Settings tab UI
    └── constants.ts     IDs, tick interval and glitch timing
```

### Design notes

- **One timer.** The plugin registers a single 250 ms interval with `registerInterval`; Obsidian clears it on unload. The view and status bar subscribe to the shared engine and unsubscribe when closed or hidden.
- **No DOM churn.** The view is built once. Each tick writes text only where a value changed, and skips rendering when the tab is in the background.
- **Resilient settings.** Stored data is validated field by field, so missing, outdated or hand-edited values fall back to defaults instead of breaking the plugin.
- **Motion.** The glitch is almost entirely CSS: digits carry `data-text` ghost layers that are sliced and offset with `clip-path` keyframes, and JavaScript only restarts a one-shot animation class when a value changes. A single randomly timed `setTimeout` chain (owned by the view and cleared when it closes) adds ambient bursts. All animation and transitions are disabled under `prefers-reduced-motion: reduce`, and the glitch can be switched off entirely.
- **Bars.** Each bar is the elapsed fraction of its unit with smaller units folded in, so all three glide smoothly. When a bar rolls over it skips its transition and plays a glitch burst instead of rewinding.

## Known limitations

- Dates and times are formatted with your system locale. In locales that place the AM/PM marker before the time (for example Japanese), the marker still appears after the digits.
- Time zone names come from the operating system's IANA identifiers, so some zones show their legacy city name (for example `Calcutta`).
- The status bar clock is not available on Obsidian mobile.
- The clock refreshes four times per second, so a second may appear up to about 250 ms after it begins.

## License

MIT. See `LICENSE`.
