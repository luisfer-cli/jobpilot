import { Injectable, signal } from "@angular/core";
import { DbService } from "./db.service";
import type { AppSettings } from "./models";

@Injectable({ providedIn: "root" })
export class SettingsService {
  readonly settings = signal<AppSettings>({
    openrouterApiKey: "",
    model: "openai/gpt-4o-mini",
    theme: "light",
  });

  private loaded = false;

  constructor(private db: DbService) {}

  async load(): Promise<void> {
    if (this.loaded) return;
    const raw = await this.db.getSettings();
    const next: AppSettings = {
      openrouterApiKey: raw["openrouter_api_key"] ?? "",
      model: raw["model"] ?? "openai/gpt-4o-mini",
      theme: raw["theme"] === "dark" ? "dark" : "light",
    };
    this.settings.set(next);
    this.applyTheme(next.theme);
    this.loaded = true;
  }

  async setApiKey(value: string): Promise<void> {
    await this.db.setSetting("openrouter_api_key", value);
    this.settings.update((s) => ({ ...s, openrouterApiKey: value }));
  }

  async setModel(value: string): Promise<void> {
    await this.db.setSetting("model", value);
    this.settings.update((s) => ({ ...s, model: value }));
  }

  async setTheme(value: "light" | "dark"): Promise<void> {
    await this.db.setSetting("theme", value);
    this.settings.update((s) => ({ ...s, theme: value }));
    this.applyTheme(value);
  }

  toggleTheme(): void {
    const next = this.settings().theme === "dark" ? "light" : "dark";
    void this.setTheme(next);
  }

  private applyTheme(theme: "light" | "dark"): void {
    document.documentElement.setAttribute("data-theme", theme);
  }
}
