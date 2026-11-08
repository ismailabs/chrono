import { App, Modal } from "obsidian";
import { searchCities, type CityOption } from "./timeZones";

/** Searchable list of cities and IANA time zones. Keyboard arrows move between results. */
export class CityPickerModal extends Modal {
  constructor(
    app: App,
    private readonly taken: ReadonlySet<string>,
    private readonly onPick: (city: CityOption) => void
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    this.setTitle("Add a city");
    contentEl.addClass("chrono-picker");

    const input = contentEl.createEl("input", {
      cls: "chrono-picker-input",
      attr: {
        type: "search",
        placeholder: "City, country or time zone",
        "aria-label": "Search cities and time zones",
      },
    });
    const results = contentEl.createEl("ul", {
      cls: "chrono-picker-results",
      attr: { "aria-label": "Matching cities" },
    });
    const hint = contentEl.createDiv({ cls: "chrono-picker-hint" });

    const render = (): void => {
      results.empty();
      const matches = searchCities(input.value);
      hint.setText(
        matches.length === 0
          ? "No matches. Try a city name or a time zone such as Europe/Paris."
          : ""
      );

      for (const city of matches) {
        const item = results.createEl("li");
        const isTaken = this.taken.has(city.zone);
        const button = item.createEl("button", {
          cls: "chrono-picker-option",
          attr: { type: "button" },
        });
        const text = button.createDiv({ cls: "chrono-picker-text" });
        text.createSpan({ cls: "chrono-picker-name", text: city.name });
        text.createSpan({
          cls: "chrono-picker-detail",
          text: city.country ? `${city.country} · ${city.zone}` : city.zone,
        });
        if (isTaken) {
          button.disabled = true;
          button.createSpan({ cls: "chrono-picker-added", text: "Added" });
        } else {
          button.addEventListener("click", () => {
            this.close();
            this.onPick(city);
          });
        }
      }
    };

    this.registerDomEvent(input, "input", render);
    this.registerDomEvent(input, "keydown", (evt: KeyboardEvent) => {
      if (evt.key === "ArrowDown") {
        evt.preventDefault();
        this.enabledOptions(results)[0]?.focus();
      }
    });
    this.registerDomEvent(results, "keydown", (evt: KeyboardEvent) => {
      if (evt.key !== "ArrowDown" && evt.key !== "ArrowUp") return;
      const options = this.enabledOptions(results);
      const index = options.indexOf(document.activeElement as HTMLButtonElement);
      if (index < 0) return;
      evt.preventDefault();
      const step = evt.key === "ArrowDown" ? 1 : -1;
      const next = options[index + step];
      if (next) next.focus();
      else if (step < 0) input.focus();
    });

    render();
    input.focus();
  }

  private enabledOptions(list: HTMLElement): HTMLButtonElement[] {
    return Array.from(
      list.querySelectorAll<HTMLButtonElement>("button.chrono-picker-option:not(:disabled)")
    );
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
