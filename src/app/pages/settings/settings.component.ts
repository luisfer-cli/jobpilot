import { CommonModule } from "@angular/common";
import { Component, HostListener } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AiService } from "../../core/ai.service";
import { SettingsService } from "../../core/settings.service";
import { I18nService, type Lang } from "../../core/i18n.service";
import { UpdaterService } from "../../core/updater.service";
import { TranslatePipe } from "../../core/translate.pipe";
import { AI_PROVIDERS, isLocalProvider } from "../../core/models";

@Component({
  selector: "app-settings",
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  providers = AI_PROVIDERS;
  steps = [
    "settings.wizard.provider",
    "settings.wizard.credentials",
    "settings.wizard.model",
    "settings.wizard.verify",
  ];

  step = 0;
  showWizard = false;
  provider = "openrouter";
  baseUrl = "";
  apiKey = "";
  model = "";

  models: string[] = [];
  loadingModels = false;
  modelsError = "";

  saving = false;
  saved = false;
  testing = false;
  testResult = "";
  testError = "";
  error = "";

  constructor(
    public settings: SettingsService,
    private ai: AiService,
    public i18n: I18nService,
    public updater: UpdaterService,
  ) {
    this.settings.load().then(() => {
      const s = this.settings.settings();
      this.provider = s.provider;
      this.baseUrl = s.baseUrl;
      this.apiKey = s.apiKey;
      this.model = s.model;
    });
  }

  get isConfigured(): boolean {
    return this.settings.isConfigured;
  }

  get updateStatusLabel(): string {
    switch (this.updater.status()) {
      case "checking":
        return this.i18n.t("updates.checking");
      case "up-to-date":
        return this.i18n.t("updates.upToDate");
      case "available":
        return this.i18n.t("updates.available", { version: this.updater.availableVersion() });
      case "downloading":
        return this.i18n.t("updates.downloading", { p: this.updater.progress() });
      case "installed":
        return this.i18n.t("updates.installed");
      case "error":
        return this.i18n.t("updates.error");
      default:
        return "";
    }
  }

  get currentLang(): Lang {
    return this.i18n.lang();
  }

  async setLanguage(lang: Lang): Promise<void> {
    await this.i18n.setLanguage(lang);
  }

  get currentProviderName(): string {
    return this.providers.find((p) => p.key === this.settings.settings().provider)?.name ?? "";
  }

  get isLocalProvider(): boolean {
    return isLocalProvider(this.provider);
  }

  get loadedModelsLabel(): string {
    return this.i18n.t("settings.wizard.modelsLoaded", { n: this.models.length });
  }

  openWizard(): void {
    this.step = 0;
    this.error = "";
    this.testResult = "";
    this.testError = "";
    this.saved = false;
    this.showWizard = true;
  }

  closeWizard(): void {
    this.showWizard = false;
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeWizard();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.showWizard) this.closeWizard();
  }

  selectProvider(key: string): void {
    this.provider = key;
    const p = this.providers.find((x) => x.key === key);
    if (p && p.baseUrl) {
      this.baseUrl = p.baseUrl;
    }
    if (isLocalProvider(key)) {
      this.apiKey = "";
    }
    this.models = [];
    this.testResult = "";
    this.testError = "";
    this.error = "";
  }

  next(): void {
    if (this.step === 1) {
      if (!this.baseUrl.trim()) {
        this.error = this.i18n.t("settings.wizard.errBaseUrl");
        return;
      }
      if (!this.isLocalProvider && !this.apiKey.trim()) {
        this.error = this.i18n.t("settings.wizard.errApiKey");
        return;
      }
    } else if (this.step === 2) {
      if (!this.model.trim()) {
        this.error = this.i18n.t("settings.wizard.errModel");
        return;
      }
    }
    this.error = "";
    this.testResult = "";
    this.testError = "";
    if (this.step < this.steps.length - 1) this.step++;
  }

  prev(): void {
    if (this.step > 0) this.step--;
    this.error = "";
  }

  async loadModels(): Promise<void> {
    if (!this.baseUrl.trim()) {
      this.modelsError = this.i18n.t("settings.wizard.errModelsUrl");
      return;
    }
    if (!this.isLocalProvider && !this.apiKey.trim()) {
      this.modelsError = this.i18n.t("settings.wizard.errModelsKey");
      return;
    }
    this.loadingModels = true;
    this.modelsError = "";
    try {
      this.models = await this.ai.listModels(this.baseUrl.trim(), this.apiKey.trim());
    } catch (e) {
      this.modelsError = String(e);
    } finally {
      this.loadingModels = false;
    }
  }

  async testConnection(): Promise<void> {
    if (!this.model.trim()) {
      this.testError = this.i18n.t("settings.wizard.errModelFirst");
      return;
    }
    this.testing = true;
    this.testResult = "";
    this.testError = "";
    try {
      this.testResult = await this.ai.testConnection(
        this.baseUrl.trim(),
        this.apiKey.trim(),
        this.model.trim(),
      );
    } catch (e) {
      this.testError = String(e);
    } finally {
      this.testing = false;
    }
  }

  async save(): Promise<void> {
    this.saving = true;
    this.saved = false;
    this.error = "";
    try {
      await this.settings.setProvider(this.provider);
      await this.settings.setBaseUrl(this.baseUrl.trim());
      await this.settings.setApiKey(this.apiKey.trim());
      await this.settings.setModel(this.model.trim());
      this.saved = true;
      this.showWizard = false;
      setTimeout(() => (this.saved = false), 3000);
    } finally {
      this.saving = false;
    }
  }
}
