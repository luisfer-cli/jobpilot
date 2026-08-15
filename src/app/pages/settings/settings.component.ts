import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AiService } from "../../core/ai.service";
import { SettingsService } from "../../core/settings.service";

@Component({
  selector: "app-settings",
  imports: [CommonModule, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  apiKey = "";
  model = "";
  testing = false;
  testResult = "";
  testError = "";

  constructor(
    public settings: SettingsService,
    private ai: AiService,
  ) {
    this.settings.load().then(() => {
      this.apiKey = this.settings.settings().openrouterApiKey;
      this.model = this.settings.settings().model;
    });
  }

  async save(): Promise<void> {
    await this.settings.setApiKey(this.apiKey.trim());
    await this.settings.setModel(this.model.trim());
  }

  async testConnection(): Promise<void> {
    await this.save();
    this.testing = true;
    this.testResult = "";
    this.testError = "";
    try {
      this.testResult = await this.ai.testConnection(this.apiKey.trim(), this.model.trim());
    } catch (e) {
      this.testError = String(e);
    } finally {
      this.testing = false;
    }
  }
}
