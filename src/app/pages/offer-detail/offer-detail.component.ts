import { CommonModule } from "@angular/common";
import { Component, HostListener, OnInit } from "@angular/core";
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

const LANGUAGES: { value: string; label: string }[] = [
  { value: "", label: "Auto (idioma del perfil)" },
  { value: "español", label: "Español" },
  { value: "inglés", label: "Inglés" },
  { value: "francés", label: "Francés" },
  { value: "alemán", label: "Alemán" },
  { value: "italiano", label: "Italiano" },
  { value: "portugués", label: "Portugués" },
];

const QUESTION_COUNTS: { value: string; label: string }[] = [
  { value: "", label: "Auto (5–8)" },
  { value: "5", label: "5 preguntas" },
  { value: "8", label: "8 preguntas" },
  { value: "10", label: "10 preguntas" },
];

const DIFFICULTIES: { value: string; label: string }[] = [
  { value: "", label: "Auto" },
  { value: "junior", label: "Junior" },
  { value: "medio", label: "Medio" },
  { value: "senior", label: "Senior" },
];

const ESTIMATED_TIMES: { value: string; label: string }[] = [
  { value: "", label: "Auto" },
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "60 minutos" },
];

const BUSY_CV = "Generando CV...";
const BUSY_LETTER = "Generando carta...";
const BUSY_TEST = "Generando prueba técnica...";
const BUSY_ATS = "Analizando encaje ATS...";
const BUSY_PDF = "Generando PDF...";

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
  languages = LANGUAGES;
  cvLanguage = "";
  letterLanguage = "";

  questionCounts = QUESTION_COUNTS;
  difficulties = DIFFICULTIES;
  estimatedTimes = ESTIMATED_TIMES;
  questionCount = "";
  difficulty = "";
  estimatedTime = "";

  busy = "";
  error = "";

  readonly busyCv = BUSY_CV;
  readonly busyLetter = BUSY_LETTER;
  readonly busyTest = BUSY_TEST;
  readonly busyAts = BUSY_ATS;
  readonly busyPdf = BUSY_PDF;

  showCvModal = false;
  showLetterModal = false;
  showTestModal = false;

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

  private requireKey(): boolean {
    if (!this.settings.isConfigured) {
      this.error = "Configura tu proveedor de IA y API key en Ajustes primero.";
      return false;
    }
    return true;
  }

  async changeStatus(): Promise<void> {
    if (this.offer) await this.db.updateOfferStatus(this.offer.id, this.offer.status);
  }

  // --- Modales de generación ---
  openCvModal(): void {
    if (this.busy) return;
    this.error = "";
    this.showCvModal = true;
  }

  openLetterModal(): void {
    if (this.busy) return;
    this.error = "";
    this.showLetterModal = true;
  }

  openTestModal(): void {
    if (this.busy) return;
    this.error = "";
    this.showTestModal = true;
  }

  closeModals(): void {
    if (this.busy) return;
    this.showCvModal = false;
    this.showLetterModal = false;
    this.showTestModal = false;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModals();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.closeModals();
  }

  async confirmGenerateCv(): Promise<void> {
    if (!this.requireKey() || !this.structured) return;
    this.busy = BUSY_CV;
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      const result = await this.ai.generateCv(cvData, this.structured, this.cvLanguage);
      this.cv = result;
      await this.db.addGeneratedCv(this.offer!.id, JSON.stringify(result));
      this.showCvModal = false;
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async confirmGenerateLetter(): Promise<void> {
    if (!this.requireKey() || !this.structured) return;
    this.busy = BUSY_LETTER;
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      const result = await this.ai.generateCoverLetter(cvData, this.structured, this.letterLanguage);
      this.letter = result;
      await this.db.addCoverLetter(this.offer!.id, JSON.stringify(result));
      this.showLetterModal = false;
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async confirmGenerateTest(): Promise<void> {
    if (!this.requireKey() || !this.structured) return;
    this.busy = BUSY_TEST;
    this.error = "";
    try {
      const result = await this.ai.generateTechnicalTest(this.structured, {
        questionCount: this.questionCount,
        difficulty: this.difficulty,
        estimatedTime: this.estimatedTime,
      });
      const id = await this.db.addTechnicalTest(this.offer!.id, result.title, JSON.stringify(result));
      this.test = { ...result, id, jobOfferId: this.offer!.id };
      this.showTestModal = false;
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async analyzeAts(): Promise<void> {
    if (!this.requireKey() || !this.structured) return;
    this.busy = BUSY_ATS;
    this.error = "";
    try {
      const cvData = await this.db.getCvData();
      this.ats = await this.ai.analyzeAts(cvData, this.structured);
    } catch (e) {
      this.error = String(e);
    } finally {
      this.busy = "";
    }
  }

  async exportCv(): Promise<void> {
    if (!this.cv) return;
    this.busy = BUSY_PDF;
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
    this.busy = BUSY_PDF;
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
