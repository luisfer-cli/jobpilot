import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AiService } from "../../core/ai.service";
import { DbService } from "../../core/db.service";
import { SettingsService } from "../../core/settings.service";
import { parseTechnicalTest } from "../../core/test-utils";
import type { StoredTest } from "../../core/models";

@Component({
  selector: "app-tests",
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./tests.component.html",
  styleUrl: "./tests.component.css",
})
export class TestsComponent implements OnInit {
  tests: StoredTest[] = [];
  showNew = false;
  topic = "";
  generating = false;
  error = "";

  constructor(
    private db: DbService,
    private ai: AiService,
    private settings: SettingsService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const rows = await this.db.listAllTechnicalTests();
    this.tests = rows.map((r) => ({
      id: r.id,
      jobOfferId: r.jobOfferId,
      title: r.title || parseTechnicalTest(r.content).title || "Prueba técnica",
      content: r.content,
      createdAt: r.createdAt,
    }));
  }

  openNew(): void {
    this.showNew = true;
    this.topic = "";
    this.error = "";
  }

  cancel(): void {
    this.showNew = false;
  }

  async generate(): Promise<void> {
    const { openrouterApiKey, model } = this.settings.settings();
    if (!openrouterApiKey) {
      this.error = "Configura tu API key de OpenRouter en Ajustes primero.";
      return;
    }
    if (!this.topic.trim()) {
      this.error = "Escribe el tema o puesto de la prueba.";
      return;
    }
    this.generating = true;
    this.error = "";
    try {
      const result = await this.ai.generateTestFromTopic(openrouterApiKey, model, this.topic.trim());
      const id = await this.db.addTechnicalTest(null, result.title, JSON.stringify(result));
      this.showNew = false;
      await this.router.navigate(["/tests", id]);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.generating = false;
    }
  }

  async remove(id: number): Promise<void> {
    if (confirm("¿Eliminar esta prueba técnica?")) {
      await this.db.deleteTechnicalTest(id);
      await this.load();
    }
  }
}
