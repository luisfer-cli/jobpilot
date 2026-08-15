import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AiService } from "../../core/ai.service";
import { SettingsService } from "../../core/settings.service";
import { AI_PROVIDERS } from "../../core/models";

@Component({
  selector: "app-settings",
  imports: [CommonModule, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  providers = AI_PROVIDERS;

  provider = "openrouter";
  baseUrl = "";
  apiKey = "";
  model = "";

  models: string[] = [];
  loadingModels = false;
  modelsLoaded = false;
  modelsError = "";

  saving = false;
  saved = false;
  testing = false;
  testResult = "";
  testError = "";

  constructor(
    public settings: SettingsService,
    private ai: AiService,
  ) {
    this.settings.load().then(() => {
      const s = this.settings.settings();
      this.provider = s.provider;
      this.baseUrl = s.baseUrl;
      this.apiKey = s.apiKey;
      this.model = s.model;
    });
  }

  onProviderChange(): void {
    const p = this.providers.find((x) => x.key === this.provider);
    if (p && p.baseUrl) {
      this.baseUrl = p.baseUrl;
    }
    this.models = [];
    this.modelsLoaded = false;
  }

  async loadModels(): Promise<void> {
    if (!this.baseUrl.trim()) {
      this.modelsError = "Introduce la URL base del proveedor.";
      return;
    }
    if (!this.apiKey.trim()) {
      this.modelsError = "Introduce la API key.";
      return;
    }
    this.loadingModels = true;
    this.modelsError = "";
    this.modelsLoaded = false;
    try {
      this.models = await this.ai.listModels(this.baseUrl.trim(), this.apiKey.trim());
      this.modelsLoaded = true;
    } catch (e) {
      this.modelsError = String(e);
    } finally {
      this.loadingModels = false;
    }
  }

  async save(): Promise<void> {
    this.saving = true;
    this.saved = false;
    await this.settings.setProvider(this.provider);
    await this.settings.setBaseUrl(this.baseUrl.trim());
    await this.settings.setApiKey(this.apiKey.trim());
    await this.settings.setModel(this.model.trim());
    this.saving = false;
    this.saved = true;
    setTimeout(() => (this.saved = false), 2500);
  }

  async testConnection(): Promise<void> {
    await this.save();
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
}
