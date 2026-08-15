import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { invoke } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";
import { save } from "@tauri-apps/plugin-dialog";
import { AiService } from "../../core/ai.service";
import { DbService } from "../../core/db.service";
import { PdfService } from "../../core/pdf.service";
import { SettingsService } from "../../core/settings.service";
import { parseTechnicalTest as parseTest } from "../../core/test-utils";
import { CvPreviewComponent } from "../../components/cv-preview/cv-preview.component";
import type {
  AtsAnalysis,
  CoverLetter,
  CvData,
  GeneratedCv,
  JobOffer,
  JobOfferStructured,
  OfferStatus,
  TechnicalTest,
} from "../../core/models";

const STATUSES: OfferStatus[] = ["guardada", "aplicada", "entrevista", "oferta", "rechazada"];
const STATUS_LABELS: Record<OfferStatus, string> = {
  guardada: "Guardada",
  aplicada: "Aplicada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

@Component({
  selector: "app-offer-detail",
  imports: [CommonModule, FormsModule, RouterLink, CvPreviewComponent],
  templateUrl: "./offer-detail.component.html",
  styleUrl: "./offer-detail.component.css",
})
export class OfferDetailComponent implements OnInit {
  offer: JobOffer | null = null;
  structured: JobOfferStructured | null = null;
  statuses = STATUSES;
  statusLabels = STATUS_LABELS;

  busy = "";
  error = "";

  cv: GeneratedCv | null = null;
  letter: CoverLetter | null = null;
  test: TechnicalTest | null = null;
  ats: AtsAnalysis | null = null;

  constructor(
    private route: ActivatedRoute,
    private db: DbService,
    private ai: AiService,
    private settings: SettingsService,
    private pdf: PdfService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    this.offer = (await this.db.getOffer(id)) ?? null;
    if (this.offer) {
      this.structured = this.parseStructured(this.offer.structured);
      const cvs = await this.db.listGeneratedCvs(id);
      if (cvs.length) this.cv = this.parseCv(cvs[0].structured);
      const letters = await this.db.listCoverLetters(id);
      if (letters.length) this.letter = JSON.parse(letters[0].content);
      const tests = await this.db.listTechnicalTests(id);
      if (tests.length) {
        this.test = { ...this.parseTechnicalTest(tests[0].content), id: tests[0].id, jobOfferId: id };
      }
    }
  }

  private parseStructured(raw: string): JobOfferStructured {
    try {
      const v = JSON.parse(raw || "{}");
      return {
        title: v.title ?? "",
        company: v.company ?? "",
        location: v.location ?? "",
        salary: v.salary ?? "",
        jobType: v.jobType ?? "",
        seniority: v.seniority ?? "",
        description: v.description ?? "",
        requirements: v.requirements ?? [],
        responsibilities: v.responsibilities ?? [],
        niceToHave: v.niceToHave ?? [],
        skills: v.skills ?? [],
        applicationUrl: v.applicationUrl ?? "",
      };
    } catch {
      return {
        title: "",
        company: "",
        location: "",
        salary: "",
        jobType: "",
        seniority: "",
        description: "",
        requirements: [],
        responsibilities: [],
        niceToHave: [],
        skills: [],
        applicationUrl: "",
      };
    }
  }

  private parseCv(raw: string): GeneratedCv {
    return JSON.parse(raw || "{}");
  }

  private parseTechnicalTest(content: string): TechnicalTest {
    return parseTest(content);
  }

  splitBody(body: string): string[] {
    return body.split("\n\n").filter((p) => p.trim().length > 0);
  }

  private requireKey(): string | null {
    const { openrouterApiKey } = this.settings.settings();
    if (!openrouterApiKey) {
      this.error = "Configura tu API key de OpenRouter en Ajustes primero.";
      return null;
    }
    return openrouterApiKey;
  }

  async changeStatus(): Promise<void> {
    if (this.offer) await this.db.updateOfferStatus(this.offer.id, this.offer.status);
  }

  async generateCv(): Promise<void> {
    const key = this.requireKey();
    if (!key || !this.structured) return;
    this.busy = "Generando CV...";
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      const result = await this.ai.generateCv(key, this.settings.settings().model, cvData, this.structured);
      this.cv = result;
      await this.db.addGeneratedCv(this.offer!.id, JSON.stringify(result));
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async generateLetter(): Promise<void> {
    const key = this.requireKey();
    if (!key || !this.structured) return;
    this.busy = "Generando carta...";
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      const result = await this.ai.generateCoverLetter(key, this.settings.settings().model, cvData, this.structured);
      this.letter = result;
      await this.db.addCoverLetter(this.offer!.id, JSON.stringify(result));
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async generateTest(): Promise<void> {
    const key = this.requireKey();
    if (!key || !this.structured) return;
    this.busy = "Generando prueba técnica...";
    this.error = "";
    try {
      const result = await this.ai.generateTechnicalTest(key, this.settings.settings().model, this.structured);
      const id = await this.db.addTechnicalTest(this.offer!.id, result.title, JSON.stringify(result));
      this.test = { ...result, id, jobOfferId: this.offer!.id };
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async analyzeAts(): Promise<void> {
    const key = this.requireKey();
    if (!key || !this.structured) return;
    this.busy = "Analizando encaje ATS...";
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      this.ats = await this.ai.analyzeAts(key, this.settings.settings().model, cvData, this.structured);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async exportCv(): Promise<void> {
    if (!this.cv) return;
    this.busy = "Generando PDF...";
    this.error = "";
    try {
      const path = await save({
        defaultPath: `${this.cv.fullName || "cv"}-${this.structured?.company || "oferta"}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!path) return;
      const bytes = await this.pdf.buildCv(this.cv);
      const out = await invoke<string>("save_file", { path, bytes });
      await openPath(out);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async exportLetter(): Promise<void> {
    if (!this.letter) return;
    this.busy = "Generando PDF...";
    this.error = "";
    try {
      const path = await save({
        defaultPath: `carta-${this.structured?.company || "oferta"}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      if (!path) return;
      const bytes = await this.pdf.buildCoverLetter(this.letter);
      const out = await invoke<string>("save_file", { path, bytes });
      await openPath(out);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }
}
