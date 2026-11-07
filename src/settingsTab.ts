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
      .setDesc(
        "Display seconds and the seconds bar in the clock view, and seconds in the status bar."
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.showSeconds).onChange(async (value) => {
          await this.chrono.updateSettings({ showSeconds: value });
        })
      );

    new Setting(containerEl)
      .setName("Show hour and minute bars")
      .setDesc(
        "Two progress bars under the time: how far through the hour cycle and the current hour you are."
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.showBars).onChange(async (value) => {
          await this.chrono.updateSettings({ showBars: value });
        })
      );

    new Setting(containerEl)
      .setName("Glitch effects")
      .setDesc(
        "Animated glitching on the digits and bars. Always off when your system asks for reduced motion."
      )
      .addToggle((toggle) =>
        toggle.setValue(settings.glitchEffects).onChange(async (value) => {
          await this.chrono.updateSettings({ glitchEffects: value });
        })
      );

    new Setting(containerEl)
      .setName("Show date")
      .setDesc("Display the current day and date below the time.")
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
      .setDesc("Display your device's time zone under the date.")
      .addToggle((toggle) =>
        toggle.setValue(settings.showTimezone).onChange(async (value) => {
          await this.chrono.updateSettings({ showTimezone: value });
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
      .setDesc("Reset every Chrono preference to its original value.")
      .addButton((button) =>
        button.setButtonText("Restore defaults").onClick(async () => {
          await this.chrono.updateSettings(getDefaultSettings());
          this.display();
        })
      );
  }
}
