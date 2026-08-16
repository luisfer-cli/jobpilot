import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AiService } from "../../core/ai.service";
import { DbService } from "../../core/db.service";
import { SettingsService } from "../../core/settings.service";
import { ConfirmService } from "../../core/confirm.service";
import { I18nService } from "../../core/i18n.service";
import { TranslatePipe } from "../../core/translate.pipe";
import { parseTechnicalTest } from "../../core/test-utils";
import type { StoredTest } from "../../core/models";

@Component({
  selector: "app-tests",
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
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
    private confirm: ConfirmService,
    private i18n: I18nService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    const rows = await this.db.listAllTechnicalTests();
    this.tests = rows.map((r) => ({
      id: r.id,
      jobOfferId: r.jobOfferId,
      title: r.title || parseTechnicalTest(r.content).title || this.i18n.t("taketest.title"),
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
    if (!this.settings.isConfigured) {
      this.error = this.i18n.t("error.configureAi");
      return;
    }
    if (!this.topic.trim()) {
      this.error = this.i18n.t("tests.errTopic");
      return;
    }
    this.generating = true;
    this.error = "";
    try {
      const result = await this.ai.generateTestFromTopic(this.topic.trim());
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
    const ok = await this.confirm.confirm({
      title: this.i18n.t("confirm.deleteTestTitle"),
      message: this.i18n.t("confirm.deleteTest"),
      confirmText: this.i18n.t("common.delete"),
    });
    if (!ok) return;
    await this.db.deleteTechnicalTest(id);
    await this.load();
  }
}
