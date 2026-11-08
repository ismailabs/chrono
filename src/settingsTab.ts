import { App, Platform, PluginSettingTab, Setting } from "obsidian";
import type ChronoPlugin from "./main";
import { getDefaultSettings } from "./settings";

export class ChronoSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly chrono: ChronoPlugin
  ) {
    super(app, chrono);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.chrono.settings;

    new Setting(containerEl).setName("Clock").setHeading();

    new Setting(containerEl)
      .setName("Hour format")
      .setDesc("Show the time in 12-hour or 24-hour notation.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("12", "12-hour")
          .addOption("24", "24-hour")
          .setValue(settings.hourFormat)
          .onChange(async (value) => {
            await this.chrono.updateSettings({
              hourFormat: value === "24" ? "24" : "12",
            });
          })
      );

    new Setting(containerEl)
      .setName("Show seconds")
      .setDesc("Display seconds on your clock and on world clocks.")
      .addToggle((toggle) =>
        toggle.setValue(settings.showSeconds).onChange(async (value) => {
          await this.chrono.updateSettings({ showSeconds: value });
        })
      );

    new Setting(containerEl)
      .setName("Show date")
      .setDesc("Display the weekday and date below your clock.")
      .addToggle((toggle) =>
        toggle.setValue(settings.showDate).onChange(async (value) => {
          await this.chrono.updateSettings({ showDate: value });
        })
      );

    new Setting(containerEl)
      .setName("Date style")
      .setDesc("Long includes the year. Short is more compact.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("long", "Long")
          .addOption("short", "Short")
          .setValue(settings.dateStyle)
          .onChange(async (value) => {
            await this.chrono.updateSettings({
              dateStyle: value === "short" ? "short" : "long",
            });
          })
      );

    new Setting(containerEl)
      .setName("Show time zone")
      .setDesc("Display your time zone name and UTC offset under your clock.")
      .addToggle((toggle) =>
        toggle.setValue(settings.showTimezone).onChange(async (value) => {
          await this.chrono.updateSettings({ showTimezone: value });
        })
      );

    new Setting(containerEl)
      .setName("Show day progress")
      .setDesc("A thin line showing how much of the day has passed.")
      .addToggle((toggle) =>
        toggle.setValue(settings.showProgress).onChange(async (value) => {
          await this.chrono.updateSettings({ showProgress: value });
        })
      );

    new Setting(containerEl)
      .setName("Density")
      .setDesc("Compact reduces spacing and suits narrow sidebars.")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("comfortable", "Comfortable")
          .addOption("compact", "Compact")
          .setValue(settings.density)
          .onChange(async (value) => {
            await this.chrono.updateSettings({
              density: value === "compact" ? "compact" : "comfortable",
            });
          })
      );

    new Setting(containerEl).setName("World clocks").setHeading();

    new Setting(containerEl)
      .setName("Show world clocks")
      .setDesc(
        "Show the list of saved cities in the clock view. Add and arrange cities from the clock view itself."
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.showWorldClocks).onChange(async (value) => {
          await this.chrono.updateSettings({ showWorldClocks: value });
        })
      );

    new Setting(containerEl).setName("Status bar").setHeading();

    new Setting(containerEl)
      .setName("Show clock in status bar")
      .setDesc(
        Platform.isMobile
          ? "The status bar is not available on mobile."
          : "Keep a small clock in the status bar. Select it to open the clock view."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(settings.showStatusBar)
          .setDisabled(Platform.isMobile)
          .onChange(async (value) => {
            await this.chrono.updateSettings({ showStatusBar: value });
          })
      );

    new Setting(containerEl).setName("Defaults").setHeading();

    new Setting(containerEl)
      .setName("Restore defaults")
      .setDesc("Resets every option on this page. Your saved world clocks are kept.")
      .addButton((button) =>
        button.setButtonText("Restore defaults").onClick(async () => {
          await this.chrono.updateSettings({
            ...getDefaultSettings(),
            worldClocks: this.chrono.settings.worldClocks,
          });
          this.display();
        })
      );
  }
}
