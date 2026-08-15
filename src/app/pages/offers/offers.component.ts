import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AiService } from "../../core/ai.service";
import { DbService } from "../../core/db.service";
import { SettingsService } from "../../core/settings.service";
import type { JobOffer, JobOfferStructured, OfferStatus } from "../../core/models";

const STATUS_LABELS: Record<OfferStatus, string> = {
  guardada: "Guardada",
  aplicada: "Aplicada",
  entrevista: "Entrevista",
  oferta: "Oferta",
  rechazada: "Rechazada",
};

@Component({
  selector: "app-offers",
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./offers.component.html",
  styleUrl: "./offers.component.css",
})
export class OffersComponent implements OnInit {
  @ViewChild("pasteInput") pasteInput?: ElementRef<HTMLTextAreaElement>;

  offers: JobOffer[] = [];
  statusLabels = STATUS_LABELS;

  showNew = false;
  loading = false;
  saving = false;
  parsed = false;
  error = "";

  rawText = "";
  form: JobOfferStructured = this.emptyForm();

  get requirementsText(): string {
    return this.form.requirements.join("\n");
  }
  set requirementsText(v: string) {
    this.form.requirements = this.splitLines(v);
  }

  get responsibilitiesText(): string {
    return this.form.responsibilities.join("\n");
  }
  set responsibilitiesText(v: string) {
    this.form.responsibilities = this.splitLines(v);
  }

  private splitLines(v: string): string[] {
    return v
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  constructor(
    private db: DbService,
    private ai: AiService,
    private settings: SettingsService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private emptyForm(): JobOfferStructured {
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

  async load(): Promise<void> {
    this.offers = await this.db.listOffers();
  }

  openNew(): void {
    this.showNew = true;
    this.rawText = "";
    this.form = this.emptyForm();
    this.parsed = false;
    this.error = "";
    setTimeout(() => this.pasteInput?.nativeElement.focus(), 0);
  }

  cancel(): void {
    this.showNew = false;
  }

  async process(): Promise<void> {
    if (!this.settings.isConfigured) {
      this.error = "Configura tu proveedor de IA y API key en Ajustes primero.";
      return;
    }
    if (!this.rawText.trim()) {
      this.error = "Pega el texto de la oferta primero.";
      return;
    }
    this.loading = true;
    this.error = "";
    try {
      this.form = await this.ai.parseJobOffer(this.rawText);
      this.parsed = true;
    } catch (e) {
      this.error = String(e);
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    if (!this.form.title.trim() && !this.form.company.trim()) {
      this.error = "Introduce al menos el título o la empresa.";
      return;
    }
    this.saving = true;
    try {
      await this.db.createOffer({
        title: this.form.title,
        company: this.form.company,
        location: this.form.location,
        rawText: this.rawText,
        structured: JSON.stringify(this.form),
        status: "guardada",
        salary: this.form.salary,
        url: this.form.applicationUrl,
      });
      this.showNew = false;
      await this.load();
    } finally {
      this.saving = false;
    }
  }

  async remove(id: number): Promise<void> {
    if (confirm("¿Eliminar esta oferta y todo lo generado para ella?")) {
      await this.db.deleteOffer(id);
      await this.load();
    }
  }
}
