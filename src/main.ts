import { Notice, Platform, Plugin, WorkspaceLeaf } from "obsidian";
import { ClockEngine } from "./clock";
import { TICK_INTERVAL_MS, VIEW_TYPE_CHRONO } from "./constants";
import {
  ChronoSettings,
  getDefaultSettings,
  sanitizeSettings,
  toStoredSettings,
} from "./settings";
import { ChronoSettingTab } from "./settingsTab";
import { StatusBarClock } from "./statusBar";
import { ChronoView } from "./view";

export default class ChronoPlugin extends Plugin {
  settings: ChronoSettings = getDefaultSettings();
  engine!: ClockEngine;
  private statusBar: StatusBarClock | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.engine = new ClockEngine(this.settings);

    this.registerView(VIEW_TYPE_CHRONO, (leaf) => new ChronoView(leaf, this));

    this.addRibbonIcon("clock", "Open Chrono", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-clock",
      name: "Open clock",
      callback: () => {
        void this.activateView();
      },
    });
    this.addCommand({
      id: "toggle-hour-format",
      name: "Toggle 24-hour format",
      callback: () => {
        void this.updateSettings({
          hourFormat: this.settings.hourFormat === "24" ? "12" : "24",
        });
      },
    });
    this.addCommand({
      id: "toggle-status-bar",
      name: "Toggle status bar clock",
      callback: () => {
        void this.updateSettings({
          showStatusBar: !this.settings.showStatusBar,
        });
      },
    });

    this.addSettingTab(new ChronoSettingTab(this.app, this));

    // Status bar items do not exist on mobile.
    if (!Platform.isMobile) this.statusBar = new StatusBarClock(this);

    // One shared timer. Obsidian clears it automatically on unload.
    this.registerInterval(
      window.setInterval(() => this.engine.tick(), TICK_INTERVAL_MS)
    );
  }

  onunload(): void {
    this.statusBar?.destroy();
    this.statusBar = null;
    this.engine?.clear();
  }

  /** Reveals the clock in the right sidebar, creating it if needed. */
  async activateView(): Promise<void> {
    try {
      const { workspace } = this.app;
      let leaf: WorkspaceLeaf | null =
        workspace.getLeavesOfType(VIEW_TYPE_CHRONO)[0] ?? null;

      if (!leaf) {
        leaf = workspace.getRightLeaf(false);
        if (!leaf) {
          new Notice("Chrono could not find a sidebar to open in.");
          return;
        }
        await leaf.setViewState({ type: VIEW_TYPE_CHRONO, active: true });
      }
      await workspace.revealLeaf(leaf);
    } catch (error) {
      console.error("Chrono: failed to open the clock view.", error);
      new Notice("Chrono could not open the clock. See the console for details.");
    }
  }

  /** Applies a settings change immediately, then persists it. */
  async updateSettings(patch: Partial<ChronoSettings>): Promise<void> {
    this.settings = sanitizeSettings({ ...this.settings, ...patch });
    this.engine.configure(this.settings);
    this.refreshAll();

    try {
      await this.saveData(toStoredSettings(this.settings));
    } catch (error) {
      console.error("Chrono: failed to save settings.", error);
      new Notice("Chrono could not save your preferences.");
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      this.settings = sanitizeSettings(await this.loadData());
    } catch (error) {
      console.error("Chrono: failed to load settings, using defaults.", error);
      this.settings = getDefaultSettings();
    }
  }

  private refreshAll(): void {
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_CHRONO)) {
      // Leaves that have not been loaded yet pick up settings when they open.
      if (leaf.view instanceof ChronoView) leaf.view.applySettings();
    }
    this.statusBar?.applySettings();
  }
}
